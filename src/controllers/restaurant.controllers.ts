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
	reviewDetailsKeyByID,
	reviewKeyById,
} from "../utils/getKeys.utils.js";
import { Review } from "../schemas/cuisine.schema.js";

export const restaurantController = {
	createRestaurantData: catchAsync(async (req: Request, res: Response) => {
		logger.info("Restaurant Fetch Handler Called.");

		const data = req.body as Restaurant;
		const client = await initializeRedisClient();
		const id = nanoid();
		const restaurantKey = restaurantKeyById(id);

		//NOTE: We can't store the array as Hash don't allow lists, only simple data. (Fix with Sets later)
		const hashedData = { id, name: data.name, location: data.location };
		const redisDataToStore = await Promise.all([
			...data.cuisines.map((cuisine) => Promise.all([
				client.sAdd(cuisinesKey, cuisine),
				client.sAdd(cuisineKey(cuisine), id),
				client.sAdd(restaurantCuisinesKeyById(id), cuisine)
			])),
			client.hSet(restaurantKey, hashedData),
		])
		logger.info(`Redis Data Cached: `, { redisDataToStore });

		return sendSuccess(res, redisDataToStore, "Data Successfully Posted", 200);
	}),

	fetchRestaurantData: async (
		req: Request<{ restaurantId: string }>,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { restaurantId } = req.params;

			const client = await initializeRedisClient();
			const restaurantKey = restaurantKeyById(restaurantId);
			const [viewCount, restaurant] = await Promise.all([
				client.hIncrBy(restaurantKey, "viewCount", 1),
				client.hGetAll(restaurantKey),
			]);

			if (!restaurant) {
				return sendError(res, "Failed To Find any Caches With that Key", 400);
			}

			return sendSuccess(
				res,
				restaurant,
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
			const reviewData = {
				id: reviewID,
				...data,
				timestamp: Date.now(),
				restaurantId,
			};

			await Promise.all([
				client.lPush(reviewKey, reviewID),
				client.hSet(reviewDetailsKey, reviewData),
			]);

			return sendSuccess(res, reviewData, "Review Successfully Added", 200);
		} catch (error: any) {
			logger.error(
				error.message ||
				"Something went wrong while trying to create review data",
				{ error },
			);
			next(error);
		}
	},

	fetchRestaurantReviews: async (
		req: Request<{ restaurantId: string }>,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { restaurantId } = req.params;
			const { page = 1, limit = 10 } = req.query;

			const startIndex = (Number(page) - 1) * Number(limit);
			const end = startIndex * Number(limit) - 1;

			const client = await initializeRedisClient();
			const reviewKey = reviewKeyById(restaurantId);
			const reviewIds = await client.lRange(reviewKey, startIndex, end);

			if (!reviewIds) {
				return sendError(
					res,
					"Unsuccessful redis lookup. No Review IDs Found.",
					400,
					[
						"Please try to submit a review before attempting to fetch any data.",
						"No Data Found.",
					],
				);
			}

			const reviews = await Promise.all(
				reviewIds.map((id) => client.hGetAll(reviewDetailsKeyByID(id))),
			);

			if (reviews.length === 0) {
				return sendSuccess(
					res,
					{},
					"No Reviews Found, Please ensure you have submitted a review befre trying to fetch them.",
					200,
				);
			}

			logger.info("REVIEWS FOUND: ", { reviews });

			return sendSuccess(res, reviews, "Reviews Fetched Successfully", 200);
		} catch (error: any) {
			logger.error(
				error.message ||
				"Something went wrong while fetching restaurant reviews data.",
				{ error },
			);
			next(error);
		}
	},

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
};
