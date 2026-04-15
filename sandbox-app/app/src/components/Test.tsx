import { useEffect } from "react";
import { fetchDocumentAnchoreds } from "../services/blockchain.query.service";

export function Test() {
  useEffect(() => {
    const testFetch = async () => {
      console.log("🚀 Đang gọi API test...");
      const data = await fetchDocumentAnchoreds();
      console.log("✅ Dữ liệu nhận được:", data);
    };

    testFetch();
  }, []);

  return <div>Kiểm tra Console trong Inspect Element (F12) để xem kết quả</div>;
}
