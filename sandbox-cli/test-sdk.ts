import { GraphQueryClient, createGraphQueryClient } from "@verzik/sdk";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_ENTITY_ID =
  "0x1f5b49040c941e91506cc110f3f2efbc7285e7cc43459a582095e3d03d5707b804000000";

type ClientMethod = (...args: unknown[]) => Promise<unknown>;

export class TestGraphQuery {
  protected client: GraphQueryClient;

  constructor() {
    this.client = createGraphQueryClient({
      endpoint: "http://100.114.63.52:30800/subgraphs/name/verzik-subgraph",
    });
  }

  private getClientMethodNames(): string[] {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this.client))
      .filter((name) => name !== "constructor" && name.startsWith("get"))
      .sort((left, right) => left.localeCompare(right));
  }

  private async runMethod(methodName: string): Promise<void> {
    const clientRecord = this.client as unknown as Record<string, ClientMethod>;
    const method = clientRecord[methodName];

    if (typeof method !== "function") {
      return;
    }

    const isListQuery = methodName.endsWith("s");
    const args: unknown[] = isListQuery ? [5] : [DEFAULT_ENTITY_ID];

    try {
      console.log(`\n--- Test hàm ${methodName} ---`);
      const data = await method.apply(this.client, args);
      console.log(`${methodName}:`, data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Lỗi khi test ${methodName}:`, message);
    }
  }

  async handleAllGraphQueries(): Promise<void> {
    const methodNames = this.getClientMethodNames();
    for (const methodName of methodNames) {
      await this.runMethod(methodName);
    }
  }

  /**
   * Chạy các hàm query dựa trên danh sách tên truyền vào
   * @param methodsToRun Mảng tên hàm (ví dụ: ['getTenantCreateds', 'getOperators'])
   */
  async getSelectedQueries(
    methodsToRun: string[],
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    // 1. Lấy tất cả các hàm hiện có trong SDK
    const availableMethods = this.getClientMethodNames();

    // 2. Lọc ra những hàm thực sự tồn tại và người dùng muốn chạy
    const targetMethods =
      methodsToRun.length > 0
        ? methodsToRun.filter((name) => availableMethods.includes(name))
        : availableMethods;

    // 3. Thực thi song song để tối ưu tốc độ (Promise.all)
    await Promise.all(
      targetMethods.map(async (methodName) => {
        const clientRecord = this.client as unknown as Record<
          string,
          ClientMethod
        >;
        const method = clientRecord[methodName];

        const isListQuery = methodName.endsWith("s");

        // Chỉ xử lý các hàm "số nhiều" (GetAll) trong yêu cầu này
        if (isListQuery) {
          try {
            // Mặc định lấy 10 bản ghi cho GetAll
            results[methodName] = await method.apply(this.client, [10]);
          } catch (error) {
            console.error(`Lỗi khi lấy dữ liệu từ ${methodName}:`, error);
            results[methodName] = []; // Trả về mảng rỗng nếu lỗi
          }
        }
      }),
    );

    return results;
  }
}

async function main() {
  const test = new TestGraphQuery();
  // await test.handleAllGraphQueries();

  const specificData = await test.getSelectedQueries([
    "getTenantCreateds",
    "getDocumentAnchoreds",
  ]);
  console.log("Dữ liệu chọn lọc:", specificData);
}

main();
