const getBaseUrl = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "http://localhost:5000";
};

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15_000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

export async function fetchDashboard() {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/dashboard`);
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchAgent(type: string) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/agents/${type}`);
  if (!res.ok) throw new Error(`Agent fetch failed: ${res.status}`);
  return res.json();
}

export async function generateContent(type: string) {
  const res = await fetchWithTimeout(
    `${getBaseUrl()}/api/agents/${type}/generate`,
    { method: "POST", headers: { "Content-Type": "application/json" } },
    60_000,
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Generate failed: ${res.status}`);
  return json;
}
