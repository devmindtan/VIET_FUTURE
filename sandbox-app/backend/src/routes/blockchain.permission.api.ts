/**
 * Blockchain Permission Routes
 * API versioning: /api/v1/blockchain/*
 */

import { Router } from "express";
import { checkPermissionHandler } from "../controllers/blockchain.permission.controller";

const router = Router();

/**
 * Check wallet address permission
 * POST /api/v1/blockchain/permissions/check
 */
router.post("/permissions/check", checkPermissionHandler);

export default router;
