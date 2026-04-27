/**
 * Quick test for new utilities and error handling
 * Run: npm run test
 */

import { ApiErrors, ErrorCode } from "./src/utils/errors";
import { successResponse, paginatedResponse } from "./src/utils/response";
import { validateObject, parseQueryNumber } from "./src/utils/validation";
import { parseListQuery, parseIdQuery } from "./src/dtos/query.dto";

console.log("🧪 Testing Backend Improvements...\n");

// Test 1: Error Handling
console.log("✅ Test 1: Error Handling");
try {
  throw ApiErrors.notFound("User");
} catch (err: any) {
  console.log("  Error Response:", JSON.stringify(err.toJSON(), null, 2));
}

// Test 2: Success Response
console.log("\n✅ Test 2: Success Response");
const successResp = successResponse({
  id: "123",
  name: "Test Item",
});
console.log("  Response:", JSON.stringify(successResp, null, 2));

// Test 3: Paginated Response
console.log("\n✅ Test 3: Paginated Response");
const paginatedResp = paginatedResponse([{ id: "1", name: "Item 1" }], {
  total: 50,
  limit: 20,
  offset: 0,
});
console.log("  Response:", JSON.stringify(paginatedResp, null, 2));

// Test 4: Query Validation
console.log("\n✅ Test 4: Query Validation");
const validationTest = parseListQuery({
  limit: "99999", // Should be clamped to 1000
  offset: "-5", // Should be 0
});
console.log("  Parsed Query:", validationTest);
console.log("  Expected: { limit: 1000, offset: 0 }");

// Test 5: ID Query Validation
console.log("\n✅ Test 5: ID Query Validation");
const idTest1 = parseIdQuery({ id: "valid-id" });
const idTest2 = parseIdQuery({ id: "" });
const idTest3 = parseIdQuery({});
console.log("  Valid ID:", idTest1);
console.log("  Empty ID:", idTest2);
console.log("  Missing ID:", idTest3);

// Test 6: Validation Schema
console.log("\n✅ Test 6: Validation Schema");
const errors = validateObject(
  {
    email: "invalid-email",
    age: 200,
    name: "",
  },
  {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    age: {
      type: "number",
      min: 0,
      max: 150,
    },
    name: {
      required: true,
      type: "string",
    },
  },
);
console.log("  Validation Errors:", JSON.stringify(errors, null, 2));

// Test 7: Semantic Error Codes
console.log("\n✅ Test 7: Semantic Error Codes");
const errorTests = [
  ApiErrors.badRequest("Invalid input"),
  ApiErrors.unauthorized(),
  ApiErrors.forbidden(),
  ApiErrors.notFound("Resource"),
  ApiErrors.validationError("Validation failed", [
    {
      field: "email",
      message: "Invalid format",
      code: "format_error",
    },
  ]),
];

errorTests.forEach((err) => {
  console.log(`  ${err.statusCode} ${err.code}:`, err.message);
});

console.log("\n🎉 All tests completed!");
console.log("\nNext steps:");
console.log("1. Run: npm run dev");
console.log(
  "2. Test endpoints: curl http://localhost:3000/api/v1/blockchain/documents",
);
console.log("3. Check response format and error handling");
