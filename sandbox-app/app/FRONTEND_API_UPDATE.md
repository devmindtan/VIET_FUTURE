# Frontend API Update Guide

## Overview

Updated frontend services to work with the refactored backend API structure (`/api/v1/blockchain/*`)

## Breaking Changes

### 1. Endpoint Base Path

**Old:** `/api/...`  
**New:** `/api/v1/blockchain/...`

**Example:**

```typescript
// Old
GET /api/documents?first=10

// New
GET /api/v1/blockchain/documents?limit=10&offset=0
```

### 2. Query Parameters

**Old:** Uses `first` parameter
**New:** Uses `limit` and `offset` parameters

| Parameter  | Old             | New             | Notes                     |
| ---------- | --------------- | --------------- | ------------------------- |
| Pagination | `first: number` | `limit: 1-1000` | limit defaults to 20      |
| Offset     | N/A             | `offset: 0+`    | defaults to 0             |
| Entity ID  | `tenantId`      | `id`            | For single entity queries |

### 3. Response Format

**Old Format:**

```json
{
  "success": true,
  "data": [...] or { ... }
}
```

**New Format (Actual Backend):**

```json
{
  "data": [...] or { ... },
  "meta": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "has_next": true,
    "total_pages": 5,
    "current_page": 1
  }
}
```

**Compatibility Layer:**
Frontend services use `convertToLegacy()` helper to maintain backward compatibility:

```typescript
function convertToLegacy(apiResponse) {
  return {
    success: true,
    data: apiResponse.data,
  };
}
```

### 4. Permission Endpoint

**Old:** `POST /api/check-permission`  
**New:** `POST /api/v1/blockchain/permissions/check`

**Request Body (unchanged):**

```json
{
  "address": "0x..."
}
```

**Response:**

```json
{
  "data": {
    "address": "0x...",
    "role": "PROTOCOL_OWNER" | "TENANT_ADMIN" | "TENANT_MANAGER" | "TENANT_TREASURY" | "OPERATOR" | "GUEST",
    "hasPermission": true
  }
}
```

### 5. Role Types

**Old:** `TENANT_OPERATOR`  
**New:** `TENANT_MANAGER` (matches backend naming)

```typescript
type PermissionRole =
  | "PROTOCOL_OWNER"
  | "TENANT_ADMIN"
  | "TENANT_MANAGER" // Changed from TENANT_OPERATOR
  | "TENANT_TREASURY"
  | "OPERATOR"
  | "GUEST";
```

## Updated Endpoint Mapping

### List Endpoints

| Function                           | Old Path                           | New Path                                         |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------ |
| `fetchDocumentAnchoreds()`         | `/api/documents`                   | `/api/v1/blockchain/documents`                   |
| `fetchTenantCount()`               | `/api/tenant-count`                | `/api/v1/blockchain/tenant-count`                |
| `fetchOperatorJoineds()`           | `/api/operators`                   | `/api/v1/blockchain/operators`                   |
| `fetchTenantCreateds()`            | `/api/tenants`                     | `/api/v1/blockchain/tenants`                     |
| `fetchDocumentCoSignQualifieds()`  | `/api/document-qualifieds`         | `/api/v1/blockchain/documents/qualifieds`        |
| `fetchNonceConsumeds()`            | `/api/nonces`                      | `/api/v1/blockchain/nonces`                      |
| `fetchViolationPenaltyUpdateds()`  | `/api/penalties`                   | `/api/v1/blockchain/penalties`                   |
| `fetchCoSignOperatorConfigureds()` | `/api/cosign-operators`            | `/api/v1/blockchain/cosign-operators`            |
| `fetchCoSignPolicyUpdateds()`      | `/api/cosign-policies`             | `/api/v1/blockchain/cosign-policies`             |
| `fetchOperatorHardSlasheds()`      | `/api/operator-hard-slasheds`      | `/api/v1/blockchain/operators/hard-slashed`      |
| `fetchOperatorSoftSlasheds()`      | `/api/operator-soft-slasheds`      | `/api/v1/blockchain/operators/soft-slashed`      |
| `fetchOperatorUnstakeRequesteds()` | `/api/operator-unstake-requesteds` | `/api/v1/blockchain/operators/unstake-requested` |
| `fetchOperatorUnstakeds()`         | `/api/operator-unstakeds`          | `/api/v1/blockchain/operators/unstaked`          |

### Detail/Query Endpoints

| Function                               | Old Path                     | New Path                             | Param Changes     |
| -------------------------------------- | ---------------------------- | ------------------------------------ | ----------------- |
| `fetchTransactionByHash()`             | `/api/transaction`           | `/api/v1/blockchain/transaction`     | ✓ Same            |
| `fetchTenantInfoById()`                | `/api/tenant`                | `/api/v1/blockchain/tenant`          | `tenantId` → `id` |
| `fetchTenantCurrentInfo()`             | `/api/tenant-info`           | `/api/v1/blockchain/tenant-info`     | `tenantId` → `id` |
| `fetchTenantRuntimeConfig()`           | `/api/tenant-runtime-config` | `/api/v1/blockchain/tenant-config`   | `tenantId` → `id` |
| `fetchOperatorInfoById()`              | `/api/operator`              | `/api/v1/blockchain/operator`        | ✓ Same            |
| `fetchOperatorCurrentStatus()`         | `/api/operator-status`       | `/api/v1/blockchain/operator-status` | ✓ Same            |
| `fetchDocumentInfoById()`              | `/api/document`              | `/api/v1/blockchain/document`        | ✓ Same            |
| `fetchDocumentCurrentStatus()`         | `/api/document-status`       | `/api/v1/blockchain/document-status` | ✓ Same            |
| `fetchPenaltyByTenantId()`             | `/api/penalty`               | `/api/v1/blockchain/penalty`         | `tenantId` → `id` |
| `fetchNonceInfoByTenantAndSigner()`    | `/api/nonce`                 | `/api/v1/blockchain/nonce`           | ✓ Same            |
| `fetchNonceCountByTenantAndOperator()` | `/api/nonce-count`           | `/api/v1/blockchain/nonce`           | ✓ Same            |

## Files Updated

1. **blockchain.query.service.ts**
   - Updated API base URL to `/api/v1/blockchain`
   - Added `ApiResponse<T>` interface for new response format
   - Updated all 25+ query functions to use new endpoints
   - Implemented `convertToLegacy()` for backward compatibility
   - Improved error logging

2. **blockchain.permission.service.ts**
   - Updated API base URL to `/api/v1/blockchain`
   - Updated permission endpoint to `/permissions/check`
   - Updated response parsing to use new format
   - Added `TENANT_MANAGER` to role types
   - Improved error logging

## No Breaking Changes in Frontend Components

Since the service layer uses backward compatibility helpers (`convertToLegacy()`), all React components continue to work without modification. The frontend still receives the expected `{ success: true, data: ... }` format.

## Testing the Integration

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start frontend in another terminal
cd sandbox-app/app
npm run dev

# 3. Test API calls in browser console
import { fetchDocumentAnchoreds } from './src/services/blockchain.query.service'
const result = await fetchDocumentAnchoreds(10)
console.log(result) // Should show { success: true, data: { data: [...], total: N } }
```

## Error Handling

New backend error responses:

```json
{
  "error": {
    "code": "not_found",
    "message": "Tenant not found",
    "details": []
  }
}
```

Frontend services return `null` on error for backward compatibility:

```typescript
if (!res.ok) {
  console.error(`API Error [${res.status}]:`, path);
  return null;
}
```

## Environment Variables

Ensure `.env` file has correct backend URL:

```env
VITE_BACKEND_URL=http://localhost:3000
# or for production
VITE_BACKEND_URL=https://api.example.com
```

## Summary of Changes

✅ **Updated endpoints:** All 25+ API calls now use `/api/v1/blockchain/*`  
✅ **Backward compatible:** Frontend components unaffected  
✅ **Parameter mapping:** `first` → `limit`, `tenantId` → `id` where needed  
✅ **Response format:** New `{ data, meta }` format supported  
✅ **Role types:** Added `TENANT_MANAGER` support  
✅ **Error handling:** Improved logging for debugging

**Migration Status:** ✅ Complete
