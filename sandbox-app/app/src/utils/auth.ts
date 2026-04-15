import type { AccountSnapshot } from "./types";
import { Wallet } from "ethers";
import { resolveSessionByAddress } from "../components/access";

export async function loadAccountSnapshot(
  privateKey: string,
): Promise<AccountSnapshot> {
  const sanitized = privateKey.trim();
  if (!sanitized) {
    throw new Error("Vui lòng nhập private key.");
  }

  const normalized = sanitized.startsWith("0x") ? sanitized : `0x${sanitized}`;

  if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    throw new Error("Private key không hợp lệ (cần đúng 64 ký tự hex).");
  }

  let wallet: Wallet;
  try {
    wallet = new Wallet(normalized);
  } catch {
    throw new Error("Không thể khởi tạo ví từ private key đã nhập.");
  }

  const session = resolveSessionByAddress(wallet.address);

  return {
    session,
    tenants: [],
    operators: [],
    balanceEth: "-",
    networkName: "-",
  };
}
