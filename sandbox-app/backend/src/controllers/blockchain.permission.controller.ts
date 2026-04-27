/**
 * Refactored Blockchain Permission Controller
 * Based on backend-patterns and api-design skills
 */

import { Request, Response } from "express";
import { checkPermission } from "../services/blockchain.permission.service";
import { asyncHandler } from "../middlewares/errorHandler";
import { ApiErrors } from "../utils/errors";
import { successResponse } from "../utils/response";
import { ethers } from "ethers";

/**
 * Check wallet address permission
 * POST /api/v1/blockchain/check-permission
 * Body: { address: "0x..." }
 */
export const checkPermissionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { address } = req.body;

    // Validate required fields
    if (!address) {
      throw ApiErrors.badRequest("address is required");
    }

    // Validate Ethereum address format
    if (!ethers.isAddress(address)) {
      throw ApiErrors.badRequest("Invalid wallet address format");
    }

    // Check permission
    const role = await checkPermission(address);

    return res.status(200).json(
      successResponse({
        address,
        role,
        hasPermission: !!role,
      }),
    );
  },
);
