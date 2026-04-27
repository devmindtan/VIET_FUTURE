/**
 * Refactored Blockchain Query Routes with API Versioning
 * Based on api-design skill - resource-based URLs, versioning
 */

import { Router } from "express";
import * as queryController from "../controllers/blockchain.query.controller";

const router = Router();

/**
 * List endpoints
 * GET /api/v1/blockchain/documents
 * GET /api/v1/blockchain/operators
 * etc.
 */
router.get("/documents", queryController.getDocuments);
router.get("/operators", queryController.getOperators);
router.get("/tenants", queryController.getTenants);
router.get("/penalties", queryController.getPenalties);
router.get("/nonces", queryController.getNonces);
router.get("/documents/qualifieds", queryController.getDocumentQualifieds);
router.get("/cosign-operators", queryController.getCoSignOperators);
router.get("/cosign-policies", queryController.getCoSignPolicies);
router.get("/operators/hard-slashed", queryController.getOperatorHardSlasheds);
router.get("/operators/soft-slashed", queryController.getOperatorSoftSlasheds);
router.get(
  "/operators/unstake-requested",
  queryController.getOperatorUnstakeRequesteds,
);
router.get("/operators/unstaked", queryController.getOperatorUnstakeds);

/**
 * Count endpoints
 * GET /api/v1/blockchain/tenant-count
 */
router.get("/tenant-count", queryController.getTenantCount);

/**
 * Detail endpoints (with query parameters)
 * GET /api/v1/blockchain/transaction?txHash=...
 * GET /api/v1/blockchain/nonce?tenantId=...&signer=...
 * etc.
 */
router.get("/transaction", queryController.getTransactionByHash);
router.get("/nonce", queryController.getNonceById);
router.get("/penalty", queryController.getPenaltyById);
router.get("/tenant", queryController.getTenantById);
router.get("/tenant-info", queryController.getTenantInfo);
router.get("/tenant-config", queryController.getTenantRuntimeConfig);
router.get("/document", queryController.getDocumentById);
router.get("/document-status", queryController.getDocumentStatus);
router.get("/operator", queryController.getOperatorById);
router.get("/operator-status", queryController.getOperatorStatus);

export default router;
