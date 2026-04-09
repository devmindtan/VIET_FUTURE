import dotenv from "dotenv";
import { init } from "@verzik/sdk";
import { TenantSlasherCLI } from "./cli/tenant-slasher";

dotenv.config();

async function main() {
  try {
    const client = await init();
    const cli = new TenantSlasherCLI(client);
    await cli.run();
  } catch (error) {
    console.error("❌ Lỗi khởi tạo:", error);
    process.exit(1);
  }
}

main();
