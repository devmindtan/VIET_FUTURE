/**
 * Main application entry point
 * With centralized error handling and API versioning
 * Based on backend-patterns skill
 */

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import blockchainQueryApi from "./routes/blockchain.query.api";
import blockchainPermissionApi from "./routes/blockchain.permission.api";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { successResponse } from "./utils/response";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Configure CORS
const corsOriginRaw = process.env.CORS_ORIGIN?.trim();
const corsOrigin =
  !corsOriginRaw || corsOriginRaw === "*"
    ? "*"
    : corsOriginRaw.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  }),
);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json(
    successResponse({
      message: "Sandbox Backend API Server",
      version: "1.0.0",
      status: "running",
    }),
  );
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json(
    successResponse({
      status: "healthy",
      timestamp: new Date().toISOString(),
    }),
  );
});

/**
 * API Routes with versioning
 * GET /api/v1/blockchain/*
 */
app.use("/api/v1/blockchain", blockchainQueryApi);
app.use("/api/v1/blockchain", blockchainPermissionApi);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = () => {
  try {
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📍 Local: http://localhost:${port}`);
      console.log(`📚 API Docs: http://localhost:${port}/api/v1/blockchain/*`);
    });
  } catch (error: any) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
