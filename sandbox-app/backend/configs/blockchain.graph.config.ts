import { GraphQueryClient, createGraphQueryClient } from "@verzik/sdk";

type ClientMethod = (...args: unknown[]) => Promise<unknown>;

export class BlockchainGraphQueryClient {
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

  /**
   * Chạy các hàm query dựa trên danh sách tên truyền vào
   * @param methodsToRun Mảng tên hàm (ví dụ: ['getTenantCreateds', 'getDocumentAnchoreds'])
   */
  async getSelectedQueries(
    methodsToRun: string[],
    first: number,
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};
    const availableMethods = this.getClientMethodNames();
    const targetMethods =
      methodsToRun.length > 0
        ? methodsToRun.filter((name) => availableMethods.includes(name))
        : availableMethods;

    await Promise.all(
      targetMethods.map(async (methodName) => {
        const clientRecord = this.client as unknown as Record<
          string,
          ClientMethod
        >;
        const method = clientRecord[methodName];
        const isListQuery = methodName.endsWith("s");

        try {
          if (typeof method !== "function") {
            results[methodName] = isListQuery ? [] : null;
            return;
          }

          if (isListQuery) {
            results[methodName] = await method.apply(this.client, [first]);
          }
        } catch (error) {
          console.error(`Lỗi khi lấy dữ liệu từ ${methodName}:`, error);
          results[methodName] = [];
        }
      }),
    );

    return results;
  }
}
// async function main() {
//   const test = new BlockchainGraphQueryClient();
//   const result = await test.getSelectedQueries(["getDocumentAnchoreds"], 10);
//   console.log(result);
// }
// main();
