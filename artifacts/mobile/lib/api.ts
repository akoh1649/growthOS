const getBaseUrl = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "http://localhost:5000";
};

export async function fetchDashboard() {
  const res = await fetch(`${getBaseUrl()}/api/dashboard`);
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchAgent(type: string) {
  const res = await fetch(`${getBaseUrl()}/api/agents/${type}`);
  if (!res.ok) throw new Error(`Agent fetch failed: ${res.status}`);
  return res.json();
}

export async function generateContent(type: string) {
  const res = await fetch(`${getBaseUrl()}/api/agents/${type}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Generate failed: ${res.status}`);
  return json;
}
