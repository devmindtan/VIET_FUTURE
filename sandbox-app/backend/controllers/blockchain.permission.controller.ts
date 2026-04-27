import { checkPermission } from "../services/blockchain.permission.service";
import { Request, Response } from "express";
import { ethers } from "ethers";

export async function handleCheckPermission(req: Request, res: Response) {
  try {
    const address = req.body?.address;
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    const result = await checkPermission(address);
    return res.status(200).json({
      success: true,
      role: result,
    });
  } catch (error) {
    console.error("Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
