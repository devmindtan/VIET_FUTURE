/**
 * Refactored Blockchain Query Controller
 * Based on backend-patterns skill - improved error handling and response format
 */

import { Request, Response } from "express";
import { BlockchainQueryService } from "../services/blockchain.query.service";
import { asyncHandler } from "../middlewares/errorHandler";
import { ApiErrors, ApiError } from "../utils/errors";
import { successResponse } from "../utils/response";
import {
  parseListQuery,
  parseIdQuery,
  parseTxHashQuery,
} from "../dtos/query.dto";

const queryService = new BlockchainQueryService();

// List endpoints with pagination
export const getDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getDocumentAnchoreds(limit);
    return res.status(200).json(
      successResponse(result.data || [], {
        total: result.total || 0,
        limit,
        offset,
      }),
    );
  },
);

export const getOperators = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getOperatorJoineds(limit);
    return res.status(200).json(
      successResponse(result || [], {
        limit,
        offset,
      }),
    );
  },
);

export const getTenants = asyncHandler(async (req: Request, res: Response) => {
  const { limit, offset } = parseListQuery(req.query);
  const result = await queryService.getTenantCreateds(limit);
  return res.status(200).json(
    successResponse(result || [], {
      limit,
      offset,
    }),
  );
});

export const getPenalties = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getViolationPenaltyUpdateds(limit);
    return res.status(200).json(
      successResponse(result || [], {
        limit,
        offset,
      }),
    );
  },
);

export const getTenantCount = asyncHandler(
  async (req: Request, res: Response) => {
    const count = await queryService.getTenantCount();
    return res.status(200).json(
      successResponse({
        count,
      }),
    );
  },
);

export const getNonces = asyncHandler(async (req: Request, res: Response) => {
  const { limit, offset } = parseListQuery(req.query);
  const result = await queryService.getNonceConsumeds(limit);
  return res.status(200).json(
    successResponse(result || [], {
      limit,
      offset,
    }),
  );
});

export const getDocumentQualifieds = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getDocumentCoSignQualifieds(limit);
    return res.status(200).json(
      successResponse(result || [], {
        limit,
        offset,
      }),
    );
  },
);

export const getCoSignOperators = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getCoSignOperatorConfigureds(limit);
    return res.status(200).json(
      successResponse(result || [], {
        limit,
        offset,
      }),
    );
  },
);

export const getCoSignPolicies = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getCoSignPolicyUpdateds(limit);
    return res.status(200).json(
      successResponse(result || [], {
        limit,
        offset,
      }),
    );
  },
);

export const getOperatorHardSlasheds = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getOperatorHardSlasheds(limit);
    return res.status(200).json(
      successResponse(result || [], {
        limit,
        offset,
      }),
    );
  },
);

export const getOperatorSoftSlasheds = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getOperatorSoftSlashed(limit);
    return res.status(200).json(
      successResponse(result || [], {
        limit,
        offset,
      }),
    );
  },
);

export const getOperatorUnstakeRequesteds = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getOperatorUnstakeRequesteds(limit);
    return res.status(200).json(
      successResponse(result || [], {
        limit,
        offset,
      }),
    );
  },
);

export const getOperatorUnstakeds = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, offset } = parseListQuery(req.query);
    const result = await queryService.getOperatorUnstakeds(limit);
    return res.status(200).json(
      successResponse(result || [], {
        limit,
        offset,
      }),
    );
  },
);

// ID-based endpoints
export const getTransactionByHash = asyncHandler(
  async (req: Request, res: Response) => {
    const txHash = parseTxHashQuery(req.query);
    if (!txHash) {
      throw ApiErrors.badRequest("Invalid transaction hash");
    }

    const result = await queryService.getTransactionByHash(txHash);
    if (!result) {
      throw ApiErrors.notFound("Transaction");
    }

    return res.status(200).json(successResponse(result));
  },
);

export const getNonceById = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId, signer } = req.query;

    if (!tenantId || !signer) {
      throw ApiErrors.badRequest("tenantId and signer are required");
    }

    const result = await queryService.getAllNonceConsumedInfoById(
      tenantId as string,
      signer as string,
    );
    return res.status(200).json(successResponse(result || []));
  },
);

export const getPenaltyById = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = parseIdQuery(req.query);
    if (!tenantId) {
      throw ApiErrors.badRequest("tenantId is required");
    }

    const result = await queryService.getPenaltyById(tenantId);
    return res.status(200).json(successResponse(result || []));
  },
);

export const getTenantById = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = parseIdQuery(req.query);
    if (!tenantId) {
      throw ApiErrors.badRequest("tenantId is required");
    }

    const result = await queryService.getAllTenantInfoById(tenantId);
    return res.status(200).json(successResponse(result || []));
  },
);

export const getTenantInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = parseIdQuery(req.query);
    if (!tenantId) {
      throw ApiErrors.badRequest("tenantId is required");
    }

    const result = await queryService.getTenantInfo(tenantId);
    if (!result) {
      throw ApiErrors.notFound("Tenant");
    }

    return res.status(200).json(successResponse(result));
  },
);

export const getTenantRuntimeConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = parseIdQuery(req.query);
    if (!tenantId) {
      throw ApiErrors.badRequest("tenantId is required");
    }

    const result = await queryService.getTenantRuntimeConfig(tenantId);
    return res.status(200).json(successResponse(result));
  },
);

export const getDocumentById = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId, fileHash } = req.query;

    if (!tenantId || !fileHash) {
      throw ApiErrors.badRequest("tenantId and fileHash are required");
    }

    const result = await queryService.getAllDocumentInfoById(
      tenantId as string,
      fileHash as string,
    );
    return res.status(200).json(successResponse(result || []));
  },
);

export const getDocumentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId, fileHash } = req.query;

    if (!tenantId || !fileHash) {
      throw ApiErrors.badRequest("tenantId and fileHash are required");
    }

    const result = await queryService.getDocumentStatus(
      tenantId as string,
      fileHash as string,
    );
    if (!result) {
      throw ApiErrors.notFound("Document");
    }

    return res.status(200).json(successResponse(result));
  },
);

export const getOperatorById = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId, operator } = req.query;

    if (!tenantId || !operator) {
      throw ApiErrors.badRequest("tenantId and operator are required");
    }

    const result = await queryService.getAllOperatorInfoById(
      tenantId as string,
      operator as string,
    );
    return res.status(200).json(successResponse(result || []));
  },
);

export const getOperatorStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId, operator } = req.query;

    if (!tenantId || !operator) {
      throw ApiErrors.badRequest("tenantId and operator are required");
    }

    const result = await queryService.getOperatorStatus(
      tenantId as string,
      operator as string,
    );
    if (!result) {
      throw ApiErrors.notFound("Operator");
    }

    return res.status(200).json(successResponse(result));
  },
);
