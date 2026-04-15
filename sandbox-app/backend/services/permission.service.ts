import { ethers } from "ethers";
import { createBlockchainContext } from "@verzik/sdk";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const privateKey =
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a";
  const wallet = new ethers.Wallet(privateKey);
  const userAddress = wallet.address;
  console.log("Địa chỉ ví là:", userAddress);

  const contract = createBlockchainContext({
    rpcUrl: process.env.RPC_URL || "",
    protocolAddress: process.env.PROTOCOL_ADDRESS || "",
    readerAddress: process.env.READER_ADDRESS,
  });

  const isAdmin = await contract.protocolContract.hasRole(
    ethers.id("TENANT_ROLE_ADMIN"),
    userAddress,
  );

  if (isAdmin) {
    console.log("Quyền: admin");
  } else {
    console.log("Quyền: guest");
  }
}

main().catch((error) => {
  console.error("Lỗi thực thi:", error);
});
