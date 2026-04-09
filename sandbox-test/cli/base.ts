/**
 * BaseTestCLI — Class trừu tượng chứa toàn bộ hàm READ-ONLY (không tốn phí gas).
 * Mọi role (ProtocolAdmin, TenantAdmin, Slasher, OperatorManager, Operator) đều kế thừa.
 */
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { BlockchainClient } from "@verzik/sdk";

export abstract class BaseTestCLI {
  protected client: BlockchainClient;
  protected rl: readline.Interface;

  constructor(client: BlockchainClient) {
    this.client = client;
    this.rl = readline.createInterface({ input, output });
  }

  // ─────────────────────────────────────────────
  // MENU CHUNG (read-only)
  // ─────────────────────────────────────────────
  protected printCommonMenu(): void {
    console.log("\n=== READ-ONLY (tất cả quyền) ===");
    console.log(" 1. Xem số lượng Tenant");
    console.log(" 2. Xem danh sách Tenant");
    console.log(" 3. Xem thông tin Tenant");
    console.log(" 4. Xem số lượng Operator");
    console.log(" 5. Xem danh sách Operator");
    console.log(" 6. Xem trạng thái Operator");
    console.log(" 7. Xem trạng thái tài liệu");
    console.log(" 8. Xác thực tài liệu (verify)");
    console.log(" 9. Kiểm tra co-sign qualified");
    console.log("10. Xem tiến trình co-sign");
    console.log("11. Xem Nonce operator");
    console.log("12. Xem Co-Sign Policy");
    console.log("13. Xem cấu hình Co-Sign Operator");
    console.log("14. Xem config Runtime Tenant");
    console.log("15. Xem mức phạt vi phạm");
  }

  // ─────────────────────────────────────────────
  // HANDLERS READ-ONLY
  // ─────────────────────────────────────────────
  protected async handleGetTenantCount() {
    const count = await this.client.getTenantCount();
    console.log(`📊 Số lượng tenant: ${count}`);
  }

  protected async handleListTenants() {
    const page = await this.rl.question("🔹 Offset (mặc định 0): ");
    const limit = await this.rl.question("🔹 Limit (mặc định 10): ");
    const tenants = await this.client.listTenants(
      Number(page) || 0,
      Number(limit) || 10,
    );
    console.log(tenants);
  }

  protected async handleGetTenantInfo() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const info = await this.client.getTenantInfo(tenantId);
    console.log(info);
  }

  protected async handleGetOperatorCount() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const count = await this.client.getOperatorCount(tenantId);
    console.log(`📊 Số lượng operator: ${count}`);
  }

  protected async handleListOperators() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const page = await this.rl.question("🔹 Offset (mặc định 0): ");
    const limit = await this.rl.question("🔹 Limit (mặc định 10): ");
    const operators = await this.client.listOperators(
      tenantId,
      Number(page) || 0,
      Number(limit) || 10,
    );
    console.log(operators);
  }

  protected async handleGetOperatorStatus() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const operator = await this.rl.question("🔹 Nhập địa chỉ Operator: ");
    const status = await this.client.getOperatorStatus(tenantId, operator);
    console.log(status);
  }

  protected async handleGetDocumentStatus() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const fileHash = await this.rl.question("🔹 Nhập File Hash (bytes32): ");
    const doc = await this.client.getDocumentStatus(tenantId, fileHash);
    console.log(doc);
  }

  protected async handleVerify() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const fileHash = await this.rl.question("🔹 Nhập File Hash (bytes32): ");
    const result = await this.client.verify(tenantId, fileHash);
    console.log(result);
  }

  protected async handleIsDocumentCoSignQualified() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const fileHash = await this.rl.question("🔹 Nhập File Hash (bytes32): ");
    const qualified = await this.client.isDocumentCoSignQualified(
      tenantId,
      fileHash,
    );
    console.log(`Co-sign qualified: ${qualified}`);
  }

  protected async handleGetCoSignStatus() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const fileHash = await this.rl.question("🔹 Nhập File Hash (bytes32): ");
    const status = await this.client.getCoSignStatus(tenantId, fileHash);
    console.log(status);
  }

  protected async handleGetNonce() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const operator = await this.rl.question("🔹 Nhập địa chỉ Operator: ");
    const nonce = await this.client.getNonce(tenantId, operator);
    console.log(`Nonce: ${nonce}`);
  }

  protected async handleGetCoSignPolicy() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const docType = await this.rl.question("🔹 Nhập Doc Type (số): ");
    const policy = await this.client.getCoSignPolicy(tenantId, Number(docType));
    console.log(policy);
  }

  protected async handleGetCoSignOperatorConfig() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const docType = await this.rl.question("🔹 Nhập Doc Type (số): ");
    const operator = await this.rl.question("🔹 Nhập địa chỉ Operator: ");
    const config = await this.client.getCoSignOperatorConfig(
      tenantId,
      Number(docType),
      operator,
    );
    console.log(config);
  }

  protected async handleGetTenantRuntimeConfig() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const config = await this.client.getTenantRuntimeConfig(tenantId);
    console.log(config);
  }

  protected async handleGetViolationPenalty() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const violationCode = await this.rl.question(
      "🔹 Nhập Violation Code (bytes32): ",
    );
    const penalty = await this.client.getViolationPenalty(
      tenantId,
      violationCode,
    );
    console.log(`Penalty BPS: ${penalty}`);
  }

  // ─────────────────────────────────────────────
  // COMMON CHOICE HANDLER (1–15)
  // Trả về true nếu đã xử lý, false nếu không khớp
  // ─────────────────────────────────────────────
  protected async handleCommonChoice(choice: number): Promise<boolean> {
    try {
      switch (choice) {
        case 1:
          await this.handleGetTenantCount();
          return true;
        case 2:
          await this.handleListTenants();
          return true;
        case 3:
          await this.handleGetTenantInfo();
          return true;
        case 4:
          await this.handleGetOperatorCount();
          return true;
        case 5:
          await this.handleListOperators();
          return true;
        case 6:
          await this.handleGetOperatorStatus();
          return true;
        case 7:
          await this.handleGetDocumentStatus();
          return true;
        case 8:
          await this.handleVerify();
          return true;
        case 9:
          await this.handleIsDocumentCoSignQualified();
          return true;
        case 10:
          await this.handleGetCoSignStatus();
          return true;
        case 11:
          await this.handleGetNonce();
          return true;
        case 12:
          await this.handleGetCoSignPolicy();
          return true;
        case 13:
          await this.handleGetCoSignOperatorConfig();
          return true;
        case 14:
          await this.handleGetTenantRuntimeConfig();
          return true;
        case 15:
          await this.handleGetViolationPenalty();
          return true;
        default:
          return false;
      }
    } catch (error: any) {
      console.error("❌ Lỗi:", error.message ?? error);
      return true;
    }
  }

  // ─────────────────────────────────────────────
  // ABSTRACT — mỗi role tự implement
  // ─────────────────────────────────────────────
  protected abstract printRoleMenu(): void;
  protected abstract handleRoleChoice(choice: number): Promise<boolean>; // false = thoát

  // ─────────────────────────────────────────────
  // MAIN LOOP
  // ─────────────────────────────────────────────
  async run(): Promise<void> {
    console.log("\n✅ Hệ thống sẵn sàng!");
    const count = await this.client.getTenantCount();
    console.log(`📊 Số lượng tenant hiện tại: ${count}`);

    let running = true;
    while (running) {
      console.log("\n" + "─".repeat(40));
      this.printCommonMenu();
      this.printRoleMenu();
      console.log("0. Thoát");
      console.log("─".repeat(40));

      const choose = await this.rl.question("Chọn: ");
      const n = Number(choose);

      if (n === 0) {
        console.log("Chào tạm biệt!");
        running = false;
      } else {
        const handled = await this.handleCommonChoice(n);
        if (!handled) {
          running = await this.handleRoleChoice(n);
        }
      }
    }

    this.rl.close();
  }
}
