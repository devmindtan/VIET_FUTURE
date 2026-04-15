const BASE = import.meta.env.VITE_BACKEND_URL;
export async function fetchDocumentAnchoreds(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/api/document-anchoreds?first=10`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.json();
  } catch {
    return null;
  }
}
