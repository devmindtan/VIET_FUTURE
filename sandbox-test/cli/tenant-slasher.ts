/**
 * TenantSlasherCLI — Quyền TENANT_SLASHER_ROLE
 * Hàm đặc quyền: slashOperator, softSlashOperator
 */
import { BlockchainClient } from "@verzik/sdk";
import { BaseTestCLI } from "./base";

export class TenantSlasherCLI extends BaseTestCLI {
  constructor(client: BlockchainClient) {
    super(client);
  }

  protected printRoleMenu(): void {
    console.log("\n=== TENANT SLASHER ===");
    console.log("20. Hard Slash Operator (100% stake)");
    console.log("21. Soft Slash Operator (theo violation code)");
  }

  protected async handleRoleChoice(choice: number): Promise<boolean> {
    try {
      switch (choice) {
        case 20:
          await this.handleSlashOperator();
          break;
        case 21:
          await this.handleSoftSlashOperator();
          break;
        default:
          console.log("⚠️  Lựa chọn không hợp lệ.");
      }
    } catch (error: any) {
      console.error("❌ Lỗi:", error.message ?? error);
    }
    return true;
  }

  // ─────────────────────────────────────────────
  // HANDLERS SLASHER
  // ─────────────────────────────────────────────

  private async handleSlashOperator() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const operator = await this.rl.question("🔹 Địa chỉ Operator cần slash: ");
    const reason = await this.rl.question("🔹 Lý do: ");

    const txHash = await this.client.slashOperator(tenantId, operator, reason);
    console.log(`✅ Hard Slash thành công! TX: ${txHash}`);
  }

  private async handleSoftSlashOperator() {
    const tenantId = await this.rl.question("🔹 Nhập Tenant ID (bytes32): ");
    const operator = await this.rl.question("🔹 Địa chỉ Operator: ");
    const violationCode = await this.rl.question(
      "🔹 Violation Code (bytes32): ",
    );
    const reason = await this.rl.question("🔹 Lý do: ");

    const txHash = await this.client.softSlashOperator(
      tenantId,
      operator,
      violationCode,
      reason,
    );
    console.log(`✅ Soft Slash thành công! TX: ${txHash}`);
  }
}
