import { BlockchainGraphQueryClient as GraphQueryConfig } from "../configs/blockchain.graph.config";
import type { DocumentAnchored } from "@verzik/sdk";
export class BlockchainGraphQueryService {
  private queryGraphConfig: GraphQueryConfig;
  constructor() {
    this.queryGraphConfig = new GraphQueryConfig();
  }

  async getDocumentAnchoreds(first: number): Promise<DocumentAnchored[]> {
    try {
      const data = await this.queryGraphConfig.getSelectedQueries(
        ["getDocumentAnchoreds"],
        first,
      );
      const result = data as Record<string, any>;
      return result["getDocumentAnchoreds"];
    } catch (error) {
      console.error("Service Error [getDocumentAnchoreds]:", error);
      return [];
    }
  }
}
