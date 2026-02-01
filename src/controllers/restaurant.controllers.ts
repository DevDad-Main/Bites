import {
  catchAsync,
  logger,
  sendError,
  sendSuccess,
} from "devdad-express-utils";
import { NextFunction, Request, Response } from "express";
import { Restaurant } from "../schemas/restaurant.schema.js";
import { initializeRedisClient } from "../utils/redisClient.utils.js";
import { nanoid } from "nanoid";
import {
  cuisineKey,
  cuisinesKey,
  restaurantCuisinesKeyById,
  restaurantKeyById,
  restaurantsByRatingKey,
  reviewDetailsKeyByID,
  reviewKeyById,
  weatherKeyById,
} from "../utils/getKeys.utils.js";
import { Review } from "../schemas/cuisine.schema.js";

export const restaurantController = {
  //#region Create Restaurant Data
  /**
   * @swagger
   * /api/v1/restaurants/create:
   *   post:
   *     summary: Create a new restaurant
   *     tags: [Restaurants]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - location
   *               - cuisines
   *             properties:
   *               name:
   *                 type: string
   *                 example: "The Italian Place"
   *               location:
   *                 type: string
   *                 example: "123 Main St, New York, NY"
   *               cuisines:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["italian", "pizza"]
   *     responses:
   *       201:
   *         description: Restaurant created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  createRestaurantData: catchAsync(async (req: Request, res: Response) => {
    logger.info("Restaurant Create Handler Called.");

    const data = req.body as Restaurant;
    const client = await initializeRedisClient();
    const id = nanoid();
    const restaurantKey = restaurantKeyById(id);

    const hashedData = {
      id,
      name: data.name.trim(),
      location: data.location.trim(),
    };
    await Promise.all([
      ...data.cuisines.map((cuisine) =>
        Promise.all([
          //NOTE: Adds a new cuisines key 'bites:cuisines'
          client.sAdd(cuisinesKey, cuisine.trim()),
          //NOTE: Adds a new set value for individual cuisine type e.g 'bites:cuisines:french'
          client.sAdd(cuisineKey(cuisine.trim()), id),
          //NOTE: We assign New Restaurant set where the id is the restaurant and value is the cuisines e.g 'bites:restaurant_cuisines:hUiaapEUFlEtK-gPdxDvs(id)'
          client.sAdd(restaurantCuisinesKeyById(id), cuisine.trim()),
        ]),
      ),
      client.hSet(restaurantKey, hashedData),
      client.zAdd(restaurantsByRatingKey, {
        score: 0,
        value: id,
      }),
    ]);

    return sendSuccess(
      res,
      { ...hashedData, cuisines: data.cuisines },
      "Data Successfully Posted",
      201,
    );
  }),
  //#endregion

  //#region Fetch Restaurant Data
  /**
   * @swagger
   * /api/v1/restaurants/fetch/{restaurantId}:
   *   get:
   *     summary: Fetch restaurant data by ID
   *     tags: [Restaurants]
   *     parameters:
   *       - in: path
   *         name: restaurantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Restaurant ID
   *     responses:
   *       200:
   *         description: Restaurant data fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         description: Restaurant not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  fetchRestaurantData: async (
    req: Request<{ restaurantId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { restaurantId } = req.params;

      const client = await initializeRedisClient();
      const restaurantKey = restaurantKeyById(restaurantId);
      const [viewCount, restaurant, cuisines] = await Promise.all([
        client.hIncrBy(restaurantKey, "viewCount", 1),
        client.hGetAll(restaurantKey),
        client.sMembers(restaurantCuisinesKeyById(restaurantId)),
      ]);

      if (!restaurant || Object.keys(restaurant).length === 0) {
        return sendError(res, "Restaurant not found", 404);
      }

      if (!cuisines || cuisines.length === 0) {
        return sendError(
          res,
          "Failed to find any cuisines for this restaurant",
          404,
        );
      }

      return sendSuccess(
        res,
        { ...restaurant, cuisines },
        "Restaurant Data Successfully Fetched From Cache",
        200,
      );
    } catch (error: any) {
      logger.error(
        error.message || "Something went wrong trying to fetch restaurant data",
        { error },
      );
      next(error);
    }
  },
  //#endregion

  //#region Create Restaurant Review
  /**
   * @swagger
   * /api/v1/restaurants/create/{restaurantId}/reviews:
   *   post:
   *     summary: Create a review for a restaurant
   *     tags: [Restaurants]
   *     parameters:
   *       - in: path
   *         name: restaurantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Restaurant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - review
   *               - rating
   *             properties:
   *               review:
   *                 type: string
   *                 example: "Amazing food and great service!"
   *               rating:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 10
   *                 example: 8
   *     responses:
   *       201:
   *         description: Review created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         description: Restaurant not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  createRestaurantReview: async (
    req: Request<{ restaurantId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { restaurantId } = req.params;
      const data = req.body as Review;

      const client = await initializeRedisClient();
      const reviewID = nanoid();
      const reviewKey = reviewKeyById(restaurantId);

      const reviewDetailsKey = reviewDetailsKeyByID(reviewID);
      const restaurantKey = restaurantKeyById(restaurantId);
      const reviewData = {
        id: reviewID,
        review: data.review.trim(),
        rating: data.rating,
        timestamp: Date.now(),
        restaurantId,
      };

      const [reviewCount, setResult, totalStars] = await Promise.all([
        client.lPush(reviewKey, reviewID),
        client.hSet(reviewDetailsKey, reviewData),
        client.hIncrByFloat(restaurantKey, "totalStars", data.rating),
      ]);

      const averageRating = Number(
        (Number(totalStars) / Number(reviewCount)).toFixed(1),
      );

      await Promise.all([
        client.zAdd(restaurantsByRatingKey, {
          score: averageRating,
          value: restaurantId,
        }),
        client.hSet(restaurantKey, "avgStars", averageRating),
      ]);

      return sendSuccess(res, reviewData, "Review Successfully Added", 201);
    } catch (error: any) {
      logger.error(
        error.message ||
          "Something went wrong while trying to create review data",
        { error },
      );
      next(error);
    }
  },
  //#endregion

  //#region Fetch Restaurant Reviews
  /**
   * @swagger
   * /api/v1/restaurants/fetch/{restaurantId}/reviews:
   *   get:
   *     summary: Fetch reviews for a restaurant with pagination
   *     tags: [Restaurants]
   *     parameters:
   *       - in: path
   *         name: restaurantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Restaurant ID
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of reviews per page
   *     responses:
   *       200:
   *         description: Reviews fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         description: Restaurant not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  fetchRestaurantReviews: async (
    req: Request<{ restaurantId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { restaurantId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        return sendError(res, "Page must be a positive number", 400);
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return sendError(res, "Limit must be a number between 1 and 100", 400);
      }

      const startIndex = (pageNum - 1) * limitNum;
      const end = startIndex + limitNum - 1;

      const client = await initializeRedisClient();
      const reviewKey = reviewKeyById(restaurantId);
      const reviewIds = await client.lRange(reviewKey, startIndex, end);

      if (!reviewIds || reviewIds.length === 0) {
        return sendSuccess(res, [], "No Reviews Found", 200);
      }

      const reviews = await Promise.all(
        reviewIds.map((id) => client.hGetAll(reviewDetailsKeyByID(id))),
      );

      const validReviews = reviews.filter(
        (review) => review && Object.keys(review).length > 0,
      );

      if (validReviews.length === 0) {
        return sendSuccess(res, [], "No Reviews Found", 200);
      }

      logger.info("REVIEWS FOUND: ", { reviews: validReviews });

      return sendSuccess(
        res,
        validReviews,
        "Reviews Fetched Successfully",
        200,
      );
    } catch (error: any) {
      logger.error(
        error.message ||
          "Something went wrong while fetching restaurant reviews data.",
        { error },
      );
      next(error);
    }
  },
  //#endregion

  //#region Delete Restaurant Review
  /**
   * @swagger
   * /api/v1/restaurants/delete/{restaurantId}/reviews/{reviewId}:
   *   delete:
   *     summary: Delete a review for a restaurant
   *     tags: [Restaurants]
   *     parameters:
   *       - in: path
   *         name: restaurantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Restaurant ID
   *       - in: path
   *         name: reviewId
   *         required: true
   *         schema:
   *           type: string
   *         description: Review ID
   *     responses:
   *       200:
   *         description: Review deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         description: Review not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  deleteRestaurantReview: async (
    req: Request<{ restaurantId: string; reviewId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { restaurantId, reviewId } = req.params;

      const client = await initializeRedisClient();
      const reviewKey = reviewKeyById(restaurantId);
      const reviewDetailsKey = reviewDetailsKeyByID(reviewId);

      const [removeResult, deleteResult] = await Promise.all([
        client.lRem(reviewKey, 0, reviewId),
        client.unlink(reviewDetailsKey),
      ]);

      if (removeResult === 0 && deleteResult === 0) {
        return sendError(res, "Review Not Found", 404, [
          "Please ensure you have provided the correct reviewId and restaurantID",
          "Please ensure you have actually submitted a review for this restaurant",
        ]);
      }

      return sendSuccess(res, reviewId, "Review Successfully Deleted", 200);
    } catch (error: any) {
      logger.error(
        error.message ||
          "Something went wrong while trying to delete a restaurant review.",
        { error },
      );
      next(error);
    }
  },
  //#endregion

  //#region Fetch Restaruant Reviews
  /**
   * @swagger
   * /api/v1/restaurants/fetch/restaurant-ratings:
   *   get:
   *     summary: Fetch restaurants sorted by ratings with pagination
   *     tags: [Restaurants]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of restaurants per page
   *     responses:
   *       200:
   *         description: Restaurant ratings fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  fetchRestaurantRatings: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { page = 1, limit = 10 } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        return sendError(res, "Page must be a positive number", 400);
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return sendError(res, "Limit must be a number between 1 and 100", 400);
      }

      const start = (pageNum - 1) * limitNum;
      const end = start + limitNum - 1;
      const client = await initializeRedisClient();
      const restaurantIds = await client.zRange(
        restaurantsByRatingKey,
        start,
        end,
        { REV: true },
      );

      if (!restaurantIds || restaurantIds.length === 0) {
        return sendSuccess(res, [], "No restaurants found", 200);
      }

      const restaurants = await Promise.all(
        restaurantIds.map((id) => client.hGetAll(restaurantKeyById(id))),
      );

      const validRestaurants = restaurants.filter(
        (restaurant) => restaurant && Object.keys(restaurant).length > 0,
      );

      if (validRestaurants.length === 0) {
        return sendSuccess(res, [], "No restaurants found", 200);
      }

      return sendSuccess(
        res,
        validRestaurants,
        "Successfully fetched restaurant ratings",
        200,
      );
    },
  ),
  //#endregion

  //#region Fetch Weather For A Restaurant
  /**
   * @swagger
   * /api/v1/restaurants/fetch/{restaurantId}/weather:
   *   get:
   *     summary: Fetch weather information for a restaurant
   *     tags: [Restaurants]
   *     description: Retrieves current weather data for a restaurant's location. Data is cached for 10 minutes to optimize API calls.
   *     parameters:
   *       - in: path
   *         name: restaurantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Restaurant ID
   *     responses:
   *       200:
   *         description: Weather data fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Successfully fetched weather for restaurant123"
   *                 data:
   *                   type: object
   *                   properties:
   *                     coord:
   *                       type: object
   *                       properties:
   *                         lon:
   *                           type: number
   *                           example: -0.1257
   *                         lat:
   *                           type: number
   *                           example: 51.5085
   *                     weather:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: number
   *                             example: 803
   *                           main:
   *                             type: string
   *                             example: "Clouds"
   *                           description:
   *                             type: string
   *                             example: "broken clouds"
   *                           icon:
   *                             type: string
   *                             example: "04d"
   *                     base:
   *                       type: string
   *                       example: "stations"
   *                     main:
   *                       type: object
   *                       properties:
   *                         temp:
   *                           type: number
   *                           example: 15.6
   *                         feels_like:
   *                           type: number
   *                           example: 15.2
   *                         temp_min:
   *                           type: number
   *                           example: 14.5
   *                         temp_max:
   *                           type: number
   *                           example: 16.8
   *                         pressure:
   *                           type: number
   *                           example: 1012
   *                         humidity:
   *                           type: number
   *                           example: 78
   *                     visibility:
   *                       type: number
   *                       example: 10000
   *                     wind:
   *                       type: object
   *                       properties:
   *                         speed:
   *                           type: number
   *                           example: 3.6
   *                         deg:
   *                           type: number
   *                           example: 240
   *                     clouds:
   *                       type: object
   *                       properties:
   *                         all:
   *                           type: number
   *                           example: 75
   *                     dt:
   *                       type: number
   *                       example: 1643673600
   *                     sys:
   *                       type: object
   *                       properties:
   *                         type:
   *                           type: number
   *                           example: 2
   *                         id:
   *                           type: number
   *                           example: 2075535
   *                         country:
   *                           type: string
   *                           example: "GB"
   *                         sunrise:
   *                           type: number
   *                           example: 1643632000
   *                         sunset:
   *                           type: number
   *                           example: 1643664000
   *                     timezone:
   *                       type: number
   *                       example: 0
   *                     id:
   *                       type: number
   *                       example: 2643743
   *                     name:
   *                       type: string
   *                       example: "London"
   *                     cod:
   *                       type: number
   *                       example: 200
   *       404:
   *         description: Restaurant not found or missing coordinates
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       502:
   *         description: Weather API error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  fetchWeatherForARestaurant: async (
    req: Request<{ restaurantId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { restaurantId } = req.params;

      const client = await initializeRedisClient();
      const weatherKey = weatherKeyById(restaurantId);

      //NOTE: If we have a cache already we return it to users.. Caches last for 10mins
      const cachedWeather = await client.get(weatherKey);

      if (cachedWeather) {
        logger.info("Found Cached Restaurant Weather Data..", {
          cachedWeather,
        });

        return sendSuccess(
          res,
          JSON.parse(cachedWeather),
          "Successfully fetched weather for restaurant (cached)",
        );
      }

      const restaurantKey = restaurantKeyById(restaurantId);
      const coords = await client.hGet(restaurantKey, "location");

      if (!coords) {
        return sendError(res, "Missing Restaurant Co-ordinates..", 404, [
          "Please ensure you have set Co-ordinates when making a new restaurant.",
        ]);
      }

      const [lng, lat] = coords.split(",");

      const apiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.WEATHER_API_KEY}&units=metric`,
      );

      const weatherData: any = await apiResponse.json();

      if (weatherData.cod && Number(weatherData.cod) !== 200) {
        logger.error("Weather API business error", weatherData);

        return sendError(res, weatherData.message, 502, [
          "Open Weather Failed To Fetch Weather",
        ]);
      }

      await client.set(weatherKey, JSON.stringify(weatherData), {
        EX: 600, // Cache restult for 10 mins
      });

      return sendSuccess(
        res,
        weatherData,
        `Successfully fetched weather for ${restaurantId}`,
        200,
      );
    } catch (error: any) {
      logger.error(
        "Failed to fetch the weather for this particular restaurant",
        { error: error.message || error },
      );

      next(error);
    }
  },
  //#endregion

  //#region Fetch Restaurant Details
  fetchRestaurantDetails: async (
    req: Request<{ restaurantId: string }>,
    res: Response,
    next: NextFunction,
  ) => {},
  //#endregion
};
