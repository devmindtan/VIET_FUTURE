import { ethers } from "ethers";

const RAW_BASE = import.meta.env.VITE_BACKEND_URL as string | undefined;
const API_BASE = (RAW_BASE ?? "").replace(/\/$/, "") + "/api/v1/blockchain";

export type PermissionRole =
  | "PROTOCOL_OWNER"
  | "TENANT_ADMIN"
  | "TENANT_MANAGER"
  | "TENANT_TREASURY"
  | "OPERATOR"
  | "GUEST";

// New response format from refactored backend
interface CheckPermissionApiResponse {
  data: {
    address: string;
    role: string;
    hasPermission: boolean;
  };
}

// Legacy response format
interface LegacyCheckPermissionApiResponse {
  success: boolean;
  role?: string;
  message?: string;
}

export function convertPrivateKeyToAddress(privateKey: string): string {
  const sanitized = privateKey.trim();
  const normalized = sanitized.startsWith("0x") ? sanitized : `0x${sanitized}`;
  return ethers.computeAddress(normalized);
}

function normalizeRole(role: string): PermissionRole {
  if (
    role === "PROTOCOL_OWNER" ||
    role === "TENANT_ADMIN" ||
    role === "TENANT_MANAGER" ||
    role === "TENANT_TREASURY" ||
    role === "OPERATOR" ||
    role === "GUEST"
  ) {
    return role as PermissionRole;
  }

  return "GUEST";
}

export async function checkPermission(
  privateKey: string,
): Promise<PermissionRole | null> {
  try {
    const address = convertPrivateKeyToAddress(privateKey);
    const res = await fetch(`${API_BASE}/permissions/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
      }),
    });

    if (!res.ok) {
      console.error(`Permission check failed [${res.status}]`);
      return null;
    }

    const response = (await res.json()) as CheckPermissionApiResponse;
    if (!response.data || !response.data.role) {
      return null;
    }

    return normalizeRole(response.data.role);
  } catch (error) {
    console.error("Permission check error:", error);
    return null;
  }
}
