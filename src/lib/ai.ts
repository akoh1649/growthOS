export interface AiResponse {
  text: string;
}

/**
 * Sends a prompt to the OpenRouter API using google/gemma-4-26b-a4b-it
 * and returns the generated text response.
 */
export async function askAi(prompt: string): Promise<string> {
  const apiKey =
    process.env.OPENROUTER_API_KEY ?? "";

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Please set it in your environment variables."
    );
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemma-4-26b-a4b-it",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 512,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `OpenRouter API error (${response.status}): ${response.statusText}${
        errorBody ? ` — ${errorBody}` : ""
      }`
    );
  }

  const data = await response.json();

  const text = data?.choices?.[0]?.message?.content ?? "";

  if (!text) {
    throw new Error(
      "OpenRouter API returned a successful response but no content."
    );
  }

  return text;
}