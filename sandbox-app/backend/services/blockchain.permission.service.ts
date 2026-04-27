import { ethers } from "ethers";
import { createBlockchainContext } from "@verzik/sdk";
import dotenv from "dotenv";
import { BlockchainQueryService } from "./blockchain.query.service";
dotenv.config();
const queryService = new BlockchainQueryService();

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function checkPermission(address: string): Promise<string> {
  const userAddress = ethers.getAddress(address);
  const userAddressLower = userAddress.toLowerCase();

  const rpcUrl = requireEnv("RPC_URL");
  const protocolAddress = requireEnv("PROTOCOL_ADDRESS");
  const readerAddress = process.env.READER_ADDRESS?.trim();

  if (!ethers.isAddress(protocolAddress)) {
    throw new Error(`Invalid PROTOCOL_ADDRESS: ${protocolAddress}`);
  }
  if (readerAddress && !ethers.isAddress(readerAddress)) {
    throw new Error(`Invalid READER_ADDRESS: ${readerAddress}`);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const [network, blockNumber, protocolCode] = await Promise.all([
    provider.getNetwork(),
    provider.getBlockNumber(),
    provider.getCode(protocolAddress),
  ]);

  const contract = createBlockchainContext({
    rpcUrl,
    protocolAddress,
    readerAddress,
  });

  // --- Check quyền Super Admin (On-chain) ---
  const PROTOCOL_ADMIN_ROLE = ethers.id("PROTOCOL_ADMIN_ROLE");
  let isSuperAdmin = false;

  if (protocolCode === "0x") {
    console.error(
      `[permission] Protocol contract has no bytecode. RPC=${rpcUrl}, chainId=${network.chainId.toString()}, block=${blockNumber}, protocolAddress=${protocolAddress}`,
    );
  } else {
    try {
      isSuperAdmin = await contract.protocolContract.hasRole(
        PROTOCOL_ADMIN_ROLE,
        userAddress,
      );
    } catch (error: any) {
      console.error(
        "[permission] Failed to check hasRole(PROTOCOL_ADMIN_ROLE):",
        {
          code: error?.code,
          message: error?.shortMessage || error?.message,
          rpcUrl,
          chainId: network.chainId.toString(),
          blockNumber,
          protocolAddress,
          userAddress,
        },
      );
    }
  }

  if (isSuperAdmin) {
    return "PROTOCOL_OWNER";
  }

  // --- Check quyền Tenant (từ Subgraph) ---
  const userTenants = await queryService.getTenantsByUsers(userAddressLower);

  if (userTenants && userTenants.length > 0) {
    for (const tenant of userTenants) {
      const admin = tenant.admin.toLowerCase();
      const manager = tenant.manager.toLowerCase();
      const treasury = tenant.treasury.toLowerCase();

      if (admin === userAddressLower) return "TENANT_ADMIN";
      if (manager === userAddressLower) return "TENANT_MANAGER";
      if (treasury === userAddressLower) return "TENANT_TREASURY";
    }
  }

  // --- Check quyền Operator (từ Subgraph) ---
  const userOperators = await queryService.getOperatorByUsers(userAddressLower);
  if (userOperators && userOperators.length > 0) {
    for (const op of userOperators) {
      const found = op.operator.toLowerCase();

      if (found === userAddressLower) return "OPERATOR";
    }
  }
  return "GUEST";
}
