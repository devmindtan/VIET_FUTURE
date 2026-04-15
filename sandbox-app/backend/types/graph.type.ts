export interface DocumentAnchored {
  id: string;
  tenantId: string;
  fileHash: string;
  cid: string;
  issuer: string;
  ciphertextHash: string;
  encryptionMetaHash: string;
  docType: string;
  version: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}
