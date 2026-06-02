export interface PitchRequest {
  query: string;
  publication: string;
  expertName: string;
  credentials: string;
  angle: string;
}

export interface PitchResponse {
  subject: string;
  pitch: string;
  quote: string;
  suggestedLinks: string[];
}

export async function generateHaroPitch(
  req: PitchRequest,
  key: string
): Promise<PitchResponse> {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemma-4-26b-a4b-it",
      messages: [
        {
          role: "user",
          content: `Write a HARO pitch for ${req.publication}.
Query: "${req.query}"
Expert: ${req.expertName} (${req.credentials})
Angle: ${req.angle}

Requirements:
- Subject line under 10 words
- Pitch body under 150 words
- Include a quotable quote
- Suggest 2-3 relevant backlink URLs

Return JSON with: subject, pitch, quote, suggestedLinks (array of strings).`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });
  const data = await r.json();
  return JSON.parse(data.choices[0].message.content) as PitchResponse;
}
