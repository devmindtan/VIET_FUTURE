# Migration Guide: Old vs New Structure

## Cấu trúc File Cũ → Mới

```
OLD:                              NEW:
backend/                          backend/
├── index.ts                       ├── src/
├── controllers/                   │   ├── controllers/
├── routes/                        │   ├── routes/
├── services/                      │   ├── services/
├── configs/                       │   ├── configs/
├── types/                         │   ├── types/
└── package.json                   │   ├── dtos/              ✨ NEW
                                  │   ├── middlewares/       ✨ NEW
                                  │   ├── repositories/      ✨ NEW
                                  │   ├── utils/             ✨ NEW
                                  │   └── index.ts
                                  ├── package.json
                                  ├── tsconfig.json
                                  └── IMPROVEMENTS.md        ✨ NEW
```

---

## Response Format: Cũ vs Mới

### ❌ Cũ (Inconsistent)

```typescript
// List response
{
  "success": true,
  "data": [...]
}

// Error response
{
  "success": false,
  "message": "Internal Server Error"
}

// Ngôn ngữ không thống nhất: message, error, success?
```

### ✅ Mới (Standardized)

```typescript
// Success response
{
  "data": [...],
  "meta": {
    "limit": 20,
    "offset": 0,
    "total": 42
  }
}

// Error response
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [...]
  }
}
```

---

## Controller Changes

### ❌ Cũ

```typescript
export async function handleGetDocuments(req: Request, res: Response) {
  try {
    const { first } = req.query;
    const limit = first ? Number(first) : undefined;

    const result = await queryService.getDocumentAnchoreds(limit);
    return res.status(200).json({
      success: true,
      data: result || [],
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
```

### ✅ Mới

```typescript
export const getDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    // Validation và coercion tự động
    const { limit, offset } = parseListQuery(req.query);

    // Business logic
    const result = await queryService.getDocumentAnchoreds(limit);

    // Standardized response
    return res.status(200).json(
      successResponse(result.data || [], {
        total: result.total || 0,
        limit,
        offset,
      }),
    );
    // Error handling? Middleware sẽ bắt!
  },
);
```

**Improvements:**

- ✅ Không cần try-catch
- ✅ Validation tự động
- ✅ Response format thống nhất
- ✅ Error handling tập trung

---

## Route Changes

### ❌ Cũ

```typescript
// blockchain.query.api.ts
router.get("/documents", handleGetDocumentAnchoreds);
router.get("/operators", handleGetOperatorJoined);

// Used as: GET /api/documents
```

### ✅ Mới

```typescript
// src/routes/blockchain.query.api.ts
router.get("/documents", getDocuments);
router.get("/operators", getOperators);

// index.ts
app.use("/api/v1/blockchain", blockchainQueryApi);

// Used as: GET /api/v1/blockchain/documents
```

**Benefits:**

- ✅ API versioning ready
- ✅ Namespace isolation
- ✅ Professional structure

---

## Error Handling: Cũ vs Mới

### ❌ Cũ (Lặp lại)

```typescript
// Mỗi controller lặp lại cùng pattern
try {
  // ... logic
} catch (error) {
  console.error("Controller Error:", error);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
```

### ✅ Mới (Centralized)

```typescript
// 1. Throw semantic errors
throw ApiErrors.badRequest("Invalid address");
throw ApiErrors.notFound("Tenant");
throw ApiErrors.validationError("Invalid input", fieldErrors);

// 2. Middleware catches ALL errors
app.use(errorHandler); // Handles ApiError and unknown errors

// 3. Consistent error response
{
  "error": {
    "code": "not_found",
    "message": "Tenant not found"
  }
}
```

---

## Query Parameter Validation: Cũ vs Mới

### ❌ Cũ

```typescript
const { first } = req.query;
const limit = first ? Number(first) : undefined;
// ⚠️ Không validate: "first=abc" trở thành NaN
// ⚠️ Không có default
// ⚠️ Không có min/max check
```

### ✅ Mới

```typescript
import { parseListQuery } from "../dtos/query.dto";

const { limit, offset } = parseListQuery(req.query);
// ✅ "limit=abc" → 20 (default)
// ✅ "limit=0" → 1 (min=1)
// ✅ "limit=99999" → 1000 (max=1000)
// ✅ Auto coercion: string → number
// ✅ Typed return value
```

---

## Status Codes: Cũ vs Mới

### ❌ Cũ

```typescript
// Luôn return 200 hoặc 500
return res.status(200).json({ success: true, ... });
return res.status(500).json({ success: false, ... });
```

### ✅ Mới

```typescript
// Semantic HTTP status codes
return res.status(200).json(successResponse(data));          // GET success
return res.status(404).json(ApiErrors.notFound("Resource")); // Not found
return res.status(400).json(ApiErrors.badRequest("..."));    // Bad input
return res.status(422).json(ApiErrors.validationError(...)); // Validation failed
return res.status(500).json(ApiErrors.internalError());      // Server error
```

---

## File Paths & Imports

### ❌ Cũ

```typescript
import { handleGetDocuments } from "../../controllers/blockchain.query.controller";
// Relative paths → Hard to maintain
```

### ✅ Mới (Suggestion)

```typescript
// With baseUrl in tsconfig.json
import { getDocuments } from "@/controllers/blockchain.query.controller";
import { ApiErrors } from "@/utils/errors";
import { successResponse } from "@/utils/response";
// Cleaner imports
```

To enable this, update tsconfig.json:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## New Utilities Usage

### Error Handling

```typescript
throw ApiErrors.badRequest("Email is required");
throw ApiErrors.notFound("User");
throw ApiErrors.validationError("Invalid input", fieldErrors);
throw ApiErrors.unauthorized();
throw ApiErrors.internalError("Database connection failed");
```

### Response Formatting

```typescript
// Single resource
successResponse({ id: 1, name: "Test" });

// List with pagination
paginatedResponse(items, {
  total: 100,
  limit: 20,
  offset: 0,
});
```

### Validation

```typescript
import { parseListQuery, parseIdQuery } from "@/dtos/query.dto";

const { limit, offset } = parseListQuery(req.query);
const id = parseIdQuery(req.query);
```

---

## Next: Install & Test

```bash
cd sandbox-app/backend
npm install
npm run dev

# Test endpoints
curl http://localhost:3000/api/v1/blockchain/documents?limit=10
curl http://localhost:3000/api/v1/blockchain/tenant-count
curl -X POST http://localhost:3000/api/v1/blockchain/permissions/check \
  -H "Content-Type: application/json" \
  -d '{"address":"0x..."}'
```

---

## Compatibility & Breaking Changes

### ⚠️ Breaking Changes

1. **Endpoint URLs**: `/api/*` → `/api/v1/blockchain/*`
2. **Response format**: `{ success, data }` → `{ data, meta }`
3. **Query params**: `?first=20` → `?limit=20&offset=0`
4. **Status codes**: Always 200/500 → Semantic codes

### Migration Path

1. **Phase 1**: Deploy new API alongside old (2 versions)
2. **Phase 2**: Update clients to new endpoints
3. **Phase 3**: Deprecate old endpoints
4. **Phase 4**: Remove old code

---

## 📚 See Also

- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Detailed improvements doc
- [backend-patterns skill](../my-agent-skills/skills/backend-patterns/SKILL.md)
- [api-design skill](../my-agent-skills/skills/api-design/SKILL.md)
