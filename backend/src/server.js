import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pool } from "./db.js";
import { asyncHandler, errorHandler, HttpError } from "./http.js";
import { imagesRouter } from "./routes/images.js";
import { projectsRouter } from "./routes/projects.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(","),
  }),
);
app.use(express.json({ limit: "50mb" }));

app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  }),
);
app.use("/api/projects", projectsRouter);
app.use("/api/images", imagesRouter);
app.use((_req, _res, next) => next(new HttpError(404, "Route not found.")));
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () =>
  console.log(`API listening on http://localhost:${port}`),
);
