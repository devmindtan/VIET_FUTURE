# Sandbox Backend - Cải Thiện v2

## 📋 Tóm tắt Cải Thiện

Backend đã được cải thiện toàn diện theo các best practices từ:

- **backend-patterns** skill - Architecture patterns, middleware, error handling
- **api-design** skill - REST API conventions, status codes, versioning

### ✨ Các Cải Thiện Chính

#### 1. **Centralized Error Handling** ✅

- **Trước**: Try-catch lặp lại trong mỗi controller
- **Sau**: Middleware xử lý lỗi tập trung + async handler wrapper
- **File**: `src/middlewares/errorHandler.ts`
- **Lợi ích**:
  - Giảm code duplication
  - Consistent error response format
  - Dễ debug và logging

#### 2. **Standardized API Response Format** ✅

- **Trước**: Không thống nhất response format (success, data, message)
- **Sau**: Unified response envelope (data + meta + links)
- **File**: `src/utils/response.ts`
- **Lợi ích**:
  - Frontend có schema nhất quán
  - Hỗ trợ pagination metadata
  - Dễ extend với links (HATEOAS)

#### 3. **API Versioning** ✅

- **Trước**: `/api/documents`, `/api/operators`
- **Sau**: `/api/v1/blockchain/documents`, `/api/v1/blockchain/operators`
- **Lợi ích**:
  - Version management khi breaking changes
  - Hỗ trợ multiple API versions cùng lúc
  - Professional API structure

#### 4. **Input Validation & DTOs** ✅

- **Trước**: Query parameters không validate
- **Sau**: Centralized validation với query DTOs
- **File**: `src/dtos/query.dto.ts`, `src/utils/validation.ts`
- **Lợi ích**:
  - Type-safe query parsing
  - Automatic coercion (string → number)
  - Field error details

#### 5. **Custom Error Classes** ✅

- **Trước**: Generic error messages
- **Sau**: Semantic error codes + HTTP status codes
- **File**: `src/utils/errors.ts`
- **Lợi ích**:
  - Machine-readable error codes
  - Proper HTTP status codes (400, 404, 422, 500)
  - Field-level error details

#### 6. **Repository Pattern Foundation** ✅

- **File**: `src/repositories/base.repository.ts`
- **Lợi ích**:
  - Abstraction layer cho data access
  - Dễ mock cho testing
  - Đồng nhất transaction handling

#### 7. **Refactored Controllers** ✅

- **Trước**: Lặp lại logic, không validate, generic error handling
- **Sau**:
  - Sử dụng `asyncHandler` wrapper
  - Input validation trước processing
  - Semantic error throwing
- **File**: `src/controllers/blockchain.query.controller.ts`

---

## 🗂️ Cấu Trúc Thư Mục Mới

```
src/
├── controllers/           # Refactored controllers with error handling
├── routes/                # Routes with API versioning (/api/v1/)
├── services/              # Business logic (giữ nguyên)
├── configs/               # Blockchain client config (giữ nguyên)
├── types/                 # API types
├── dtos/                  # Data Transfer Objects (validation)
├── middlewares/           # Error handler, custom middleware
├── repositories/          # Abstract repository pattern
├── utils/                 # Utilities (errors, response, validation)
└── index.ts               # Main app with middleware
```

---

## 🔌 New Files Created

### Middleware

- `src/middlewares/errorHandler.ts` - Error handler + async wrapper

### Utilities

- `src/utils/errors.ts` - Custom error classes + error factory
- `src/utils/response.ts` - Response formatting (success, paginated)
- `src/utils/validation.ts` - Input validation helpers

### Data Access

- `src/repositories/base.repository.ts` - Abstract base repository
- `src/dtos/query.dto.ts` - Query parameter DTOs

### Types

- `src/types/api.types.ts` - Common API types

---

## 📝 API Response Examples

### Success Response (Single Resource)

```json
{
  "data": {
    "id": "abc-123",
    "name": "Tenant A",
    "status": "active"
  }
}
```

### Success Response (List with Pagination)

```json
{
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "meta": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "has_next": true,
    "total_pages": 3,
    "current_page": 1
  }
}
```

### Error Response (Validation Error)

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "address",
        "message": "Invalid wallet address format",
        "code": "format_error"
      }
    ]
  }
}
```

### Error Response (Not Found)

```json
{
  "error": {
    "code": "not_found",
    "message": "Tenant not found"
  }
}
```

---

## 🚀 New Endpoints (Refactored)

### List Endpoints

```
GET /api/v1/blockchain/documents?limit=20&offset=0
GET /api/v1/blockchain/operators?limit=20&offset=0
GET /api/v1/blockchain/tenants?limit=20&offset=0
GET /api/v1/blockchain/penalties?limit=20&offset=0
GET /api/v1/blockchain/nonces?limit=20&offset=0
GET /api/v1/blockchain/documents/qualifieds?limit=20&offset=0
GET /api/v1/blockchain/cosign-operators?limit=20&offset=0
GET /api/v1/blockchain/cosign-policies?limit=20&offset=0
GET /api/v1/blockchain/operators/hard-slashed?limit=20&offset=0
GET /api/v1/blockchain/operators/soft-slashed?limit=20&offset=0
GET /api/v1/blockchain/operators/unstake-requested?limit=20&offset=0
GET /api/v1/blockchain/operators/unstaked?limit=20&offset=0
```

### Count Endpoints

```
GET /api/v1/blockchain/tenant-count
```

### Detail Endpoints (Query Parameters)

```
GET /api/v1/blockchain/transaction?txHash=0x...
GET /api/v1/blockchain/nonce?tenantId=...&signer=...
GET /api/v1/blockchain/penalty?id=...
GET /api/v1/blockchain/tenant?id=...
GET /api/v1/blockchain/tenant-info?id=...
GET /api/v1/blockchain/tenant-config?id=...
GET /api/v1/blockchain/document?tenantId=...&fileHash=...
GET /api/v1/blockchain/document-status?tenantId=...&fileHash=...
GET /api/v1/blockchain/operator?tenantId=...&operator=...
GET /api/v1/blockchain/operator-status?tenantId=...&operator=...
```

### Permission Endpoints

```
POST /api/v1/blockchain/permissions/check
Body: { "address": "0x..." }
```

---

## 🛠️ Usage & Setup

### Development

```bash
cd sandbox-app/backend
npm install
npm run dev
```

Server chạy trên `http://localhost:3000` (mặc định)

### Build

```bash
npm run build
```

Files được build vào `dist/src/`

### Production

```bash
npm run build
npm start
```

---

## 📝 Environment Variables

```env
# Port (default: 3000)
PORT=3000

# CORS origin (default: *)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Blockchain config (required)
GRAPH_NODE_URL=http://localhost:8000/subgraphs/name/...
RPC_URL=http://localhost:8545
PROTOCOL_ADDRESS=0x...
READER_ADDRESS=0x...

# Runtime
NODE_ENV=development
```

---

## 🔍 HTTP Status Codes

| Code | Meaning              | Usage                                  |
| ---- | -------------------- | -------------------------------------- |
| 200  | OK                   | Successful GET, PUT, PATCH             |
| 201  | Created              | Successful POST                        |
| 400  | Bad Request          | Invalid input, missing required fields |
| 401  | Unauthorized         | Missing/invalid authentication         |
| 403  | Forbidden            | Authenticated but no permission        |
| 404  | Not Found            | Resource doesn't exist                 |
| 422  | Unprocessable Entity | Validation error with details          |
| 429  | Too Many Requests    | Rate limited                           |
| 500  | Internal Error       | Unexpected server error                |
| 502  | Bad Gateway          | External service error                 |
| 503  | Service Unavailable  | Temporary overload                     |

---

## 🚀 Next Steps for Further Improvement

1. **Logging System**
   - Integrate Winston or Pino
   - Structured logging with request IDs
   - Error tracking (Sentry)

2. **Rate Limiting**
   - Add `express-rate-limit` middleware
   - Per-IP or per-API-key limiting

3. **Request/Response Compression**
   - Add `compression` middleware
   - Reduce payload size for large responses

4. **API Documentation**
   - Swagger/OpenAPI documentation
   - Request/response examples for all endpoints

5. **Testing**
   - Unit tests for utilities, validators
   - Integration tests for routes
   - E2E tests for critical flows

6. **Monitoring & Observability**
   - Health check endpoints (/health)
   - Metrics collection (Prometheus)
   - Distributed tracing

7. **Caching**
   - Redis caching layer
   - Cache invalidation strategy
   - ETags for HTTP caching

8. **Advanced Validations**
   - Blockchain address validation
   - Transaction hash validation
   - Custom business logic validators

---

## 📚 References

- [backend-patterns skill](../skills/backend-patterns/SKILL.md)
- [api-design skill](../skills/api-design/SKILL.md)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [REST API Design Best Practices](https://restfulapi.net/)

---

## ✅ Checklist Before Production

- [ ] Add comprehensive error logging
- [ ] Implement rate limiting
- [ ] Add API documentation (Swagger)
- [ ] Write unit and integration tests
- [ ] Setup monitoring and alerting
- [ ] Implement caching strategy
- [ ] Add request validation for all endpoints
- [ ] Setup CI/CD pipeline
- [ ] Performance testing and optimization
- [ ] Security audit (CORS, headers, SQL injection, etc.)

---

**Last Updated**: April 27, 2026
