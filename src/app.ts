import express from "express";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.config.js";
import restaurantsRoutes from "./routes/restaurants.routes.js";
import cuisinesRoutes from "./routes/cuisine.routes.js";
import { errorHandler } from "devdad-express-utils";

//#region Constants
const app = express();
const VERSION = process.env.VERSION || "v1";
//#endregion

//#region Middleware
app.use(express.json());
//#endregion

//#region Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { margin: 20px 0 }
  `,
  customSiteTitle: "Bites API Documentation"
}));
//#endregion

//#region Endpoints
app.use(`/api/${VERSION}/restaurants`, restaurantsRoutes);
app.use(`/api/${VERSION}/cuisines`, cuisinesRoutes);

// API docs redirect
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});
//#endregion

//#region Error Handler Middleware
app.use(errorHandler);
//#endregion

export default app;
