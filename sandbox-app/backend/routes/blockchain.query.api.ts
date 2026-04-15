import { Router } from "express";
import { handleGetDocumentAnchoreds } from "../controllers/blockchain.query.controller";
const router = Router();

router.get("/document-anchoreds", handleGetDocumentAnchoreds);

export default router;
