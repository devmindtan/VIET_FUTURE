/**
 * Updated Blockchain Query Service
 * Compatible with refactored backend API
 * API Base: /api/v1/blockchain/*
 */

const RAW_BASE = import.meta.env.VITE_BACKEND_URL as string | undefined;
const API_BASE = (RAW_BASE ?? "").replace(/\/$/, "") + "/api/v1/blockchain";

// New response format from refactored backend
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
  links?: Record<string, string>;
}

// Legacy interface for backward compatibility
export interface FullDataResponse {
  success: boolean;
  data: DataResponseWithTotal;
}
export interface DataResponseWithTotal {
  data: Array<Record<string, unknown>>;
  total: number;
}

export interface DataResponse {
  success: boolean;
  data: Array<Record<string, unknown>>;
}

export interface ScalarDataResponse<T> {
  success: boolean;
  data: T;
}

function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`API Error [${res.status}]:`, path);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// Helper: Convert new format to legacy format for backward compatibility
function convertToLegacy<T extends Record<string, any>>(
  apiResponse: ApiResponse<T>,
): any {
  if (Array.isArray(apiResponse.data)) {
    return {
      success: true,
      data: {
        data: apiResponse.data,
        total: apiResponse.meta?.total || 0,
      },
    };
  }
  return {
    success: true,
    data: apiResponse.data,
  };
}

export async function fetchDocumentAnchoreds(
  first?: number,
): Promise<FullDataResponse | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(`/documents${query}`);
  return response ? convertToLegacy(response) : null;
}
export async function fetchTenantCount(): Promise<ScalarDataResponse<number> | null> {
  const response = await getJson<ApiResponse<any>>("/tenant-count");
  return response
    ? {
        success: true,
        data: response.data?.count || 0,
      }
    : null;
}
export async function fetchOperatorJoineds(
  first?: number,
): Promise<FullDataResponse | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(`/operators${query}`);
  return response ? convertToLegacy(response) : null;
}
export async function fetchTenantCreateds(
  first?: number,
): Promise<DataResponse | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(`/tenants${query}`);
  return response ? convertToLegacy(response) : null;
}
export async function fetchDocumentCoSignQualifieds(
  first?: number,
): Promise<FullDataResponse | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(
    `/documents/qualifieds${query}`,
  );
  return response ? convertToLegacy(response) : null;
}

export async function fetchTransactionByHash(
  txHash: string,
): Promise<ScalarDataResponse<Record<string, unknown>> | null> {
  const query = buildQuery({ txHash });
  const response = await getJson<ApiResponse<any>>(`/transaction${query}`);
  return response ? { success: true, data: response.data } : null;
}

export async function fetchNonceCountByTenantAndOperator(
  tenantId: string,
  operator: string,
): Promise<ScalarDataResponse<number> | null> {
  const query = buildQuery({ tenantId, operator });
  const response = await getJson<ApiResponse<any>>(`/nonce${query}`);
  return response ? { success: true, data: response.data || 0 } : null;
}

export async function fetchNonceInfoByTenantAndSigner(
  tenantId: string,
  signer: string,
): Promise<ScalarDataResponse<Record<string, unknown>> | null> {
  const query = buildQuery({ tenantId, signer });
  const response = await getJson<ApiResponse<any>>(`/nonce${query}`);
  return response ? { success: true, data: response.data || {} } : null;
}

export async function fetchNonceConsumeds(
  first?: number,
): Promise<DataResponse | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(`/nonces${query}`);
  return response ? convertToLegacy(response) : null;
}

export async function fetchTenantInfoById(
  tenantId: string,
): Promise<ScalarDataResponse<Record<string, unknown>> | null> {
  const query = buildQuery({ id: tenantId });
  const response = await getJson<ApiResponse<any>>(`/tenant${query}`);
  return response ? { success: true, data: response.data || {} } : null;
}

export async function fetchOperatorInfoById(
  tenantId: string,
  operator: string,
): Promise<ScalarDataResponse<Record<string, unknown>> | null> {
  const query = buildQuery({ tenantId, operator });
  const response = await getJson<ApiResponse<any>>(`/operator${query}`);
  return response ? { success: true, data: response.data || {} } : null;
}

export async function fetchDocumentInfoById(
  tenantId: string,
  fileHash: string,
): Promise<ScalarDataResponse<Record<string, unknown>> | null> {
  const query = buildQuery({ tenantId, fileHash });
  const response = await getJson<ApiResponse<any>>(`/document${query}`);
  return response ? { success: true, data: response.data || {} } : null;
}

export async function fetchPenaltyByTenantId(
  tenantId: string,
): Promise<ScalarDataResponse<Record<string, unknown>> | null> {
  const query = buildQuery({ id: tenantId });
  const response = await getJson<ApiResponse<any>>(`/penalty${query}`);
  return response ? { success: true, data: response.data || {} } : null;
}

export async function fetchViolationPenaltyUpdateds(
  first?: number,
): Promise<ScalarDataResponse<Array<Record<string, unknown>>> | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(`/penalties${query}`);
  return response ? { success: true, data: response.data || [] } : null;
}
export async function fetchCoSignOperatorConfigureds(
  first?: number,
): Promise<ScalarDataResponse<Array<Record<string, unknown>>> | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(`/cosign-operators${query}`);
  return response ? { success: true, data: response.data || [] } : null;
}
export async function fetchCoSignPolicyUpdateds(
  first?: number,
): Promise<ScalarDataResponse<Array<Record<string, unknown>>> | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(`/cosign-policies${query}`);
  return response ? { success: true, data: response.data || [] } : null;
}
export async function fetchOperatorHardSlasheds(
  first?: number,
): Promise<ScalarDataResponse<Array<Record<string, unknown>>> | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(
    `/operators/hard-slashed${query}`,
  );
  return response ? { success: true, data: response.data || [] } : null;
}
export async function fetchOperatorSoftSlasheds(
  first?: number,
): Promise<ScalarDataResponse<Array<Record<string, unknown>>> | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(
    `/operators/soft-slashed${query}`,
  );
  return response ? { success: true, data: response.data || [] } : null;
}

export async function fetchOperatorUnstakeRequesteds(
  first?: number,
): Promise<ScalarDataResponse<Array<Record<string, unknown>>> | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(
    `/operators/unstake-requested${query}`,
  );
  return response ? { success: true, data: response.data || [] } : null;
}

export async function fetchOperatorUnstakeds(
  first?: number,
): Promise<ScalarDataResponse<Array<Record<string, unknown>>> | null> {
  const query = buildQuery({ limit: first || 20 });
  const response = await getJson<ApiResponse<any>>(
    `/operators/unstaked${query}`,
  );
  return response ? { success: true, data: response.data || [] } : null;
}

export async function fetchTenantRuntimeConfig(
  tenantId: string,
): Promise<ScalarDataResponse<{
  minOperatorStake: number;
  unstakeCooldown: number;
}> | null> {
  const query = buildQuery({ id: tenantId });
  const response = await getJson<ApiResponse<any>>(`/tenant-config${query}`);
  return response
    ? {
        success: true,
        data: response.data || {
          minOperatorStake: 0,
          unstakeCooldown: 0,
        },
      }
    : null;
}

export async function fetchTenantCurrentInfo(
  tenantId: string,
): Promise<ScalarDataResponse<Record<string, unknown> | null> | null> {
  const query = buildQuery({ id: tenantId });
  const response = await getJson<ApiResponse<any>>(`/tenant-info${query}`);
  return response ? { success: true, data: response.data || null } : null;
}

export async function fetchOperatorCurrentStatus(
  tenantId: string,
  operator: string,
): Promise<ScalarDataResponse<Record<string, unknown> | null> | null> {
  const query = buildQuery({ tenantId, operator });
  const response = await getJson<ApiResponse<any>>(`/operator-status${query}`);
  return response ? { success: true, data: response.data || null } : null;
}

export async function fetchDocumentCurrentStatus(
  tenantId: string,
  fileHash: string,
): Promise<ScalarDataResponse<Record<string, unknown> | null> | null> {
  const query = buildQuery({ tenantId, fileHash });
  const response = await getJson<ApiResponse<any>>(`/document-status${query}`);
  return response ? { success: true, data: response.data || null } : null;
}
