import { BlockchainGraphQueryService } from "../services/blockchain.query.service";
import { Request, Response } from "express";

const graphQueryService = new BlockchainGraphQueryService();

export async function handleGetDocumentAnchoreds(req: Request, res: Response) {
  try {
    const first = Number(req.query.first) || 10;
    const result = await graphQueryService.getDocumentAnchoreds(first);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
