import * as cheerio from "cheerio";

export interface SeoIssue {
  type: string;
  severity: "high" | "medium" | "low";
  message: string;
}

export interface SeoAnalysis {
  url: string;
  title: string | null;
  description: string | null;
  score: number;
  issues: SeoIssue[];
  headings: string[];
  linksCount: number;
  imagesCount: number;
  loadTimeMs: number;
}

/**
 * Fetches a URL and performs an SEO analysis on the HTML content.
 */
export async function analyzeSeo(url: string): Promise<SeoAnalysis> {
  const startTime = performance.now();

  let html: string;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GrowthOS-SEO-Bot/1.0; +https://growthos.app)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    html = await response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      url,
      title: null,
      description: null,
      score: 0,
      issues: [
        {
          type: "fetch_error",
          severity: "high",
          message: `Failed to fetch URL: ${message}`,
        },
      ],
      headings: [],
      linksCount: 0,
      imagesCount: 0,
      loadTimeMs: 0,
    };
  }

  const loadTimeMs = Math.round(performance.now() - startTime);
  const $ = cheerio.load(html);

  // --- Extract data ---
  const title = $("title").first().text().trim() || null;
  const description =
    $('meta[name="description"]').first().attr("content")?.trim() || null;

  const headings: string[] = [];
  for (let level = 1; level <= 6; level++) {
    $(`h${level}`).each((_i, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });
  }

  const linksCount = $("a[href]").length;
  const imagesCount = $("img").length;

  const imagesWithoutAlt = $("img").filter((_i, el) => {
    const alt = $(el).attr("alt");
    return alt === undefined || alt.trim() === "";
  }).length;

  // --- Analyze issues ---
  const issues: SeoIssue[] = [];

  // Check h1 count from the raw DOM
  const h1Count = $("h1").length;

  if (!title) {
    issues.push({
      type: "missing_title",
      severity: "high",
      message: "Page is missing a <title> tag. Title tags are critical for SEO and appear in search results.",
    });
  }

  if (!description) {
    issues.push({
      type: "missing_description",
      severity: "high",
      message: "Page is missing a meta description. Descriptions influence click-through rates from search results.",
    });
  }

  if (h1Count === 0) {
    issues.push({
      type: "missing_h1",
      severity: "high",
      message: "Page has no <h1> heading. Every page should have exactly one H1 that describes the main topic.",
    });
  } else if (h1Count > 1) {
    issues.push({
      type: "multiple_h1",
      severity: "medium",
      message: `Page has ${h1Count} <h1> headings. Best practice is to use only one H1 per page.`,
    });
  }

  if (loadTimeMs > 3000) {
    issues.push({
      type: "slow_load",
      severity: "medium",
      message: `Page loaded in ${loadTimeMs}ms (threshold: 3000ms). Slow pages harm user experience and rankings.`,
    });
  }

  if (linksCount < 5) {
    issues.push({
      type: "few_links",
      severity: "low",
      message: `Page has only ${linksCount} link(s). Internal linking helps search engines discover your content.`,
    });
  }

  if (imagesWithoutAlt > 0) {
    issues.push({
      type: "missing_alt_text",
      severity: "medium",
      message: `${imagesWithoutAlt} of ${imagesCount} image(s) are missing alt text. Alt text improves accessibility and image SEO.`,
    });
  }

  // --- Calculate score ---
  const deductions: Record<string, number> = {
    missing_title: 20,
    missing_description: 15,
    missing_h1: 15,
    multiple_h1: 10,
    slow_load: 10,
    few_links: 10,
    missing_alt_text: Math.min(imagesWithoutAlt * 3, 15),
  };

  let deduction = 0;
  for (const issue of issues) {
    deduction += deductions[issue.type] ?? 0;
  }

  const score = Math.max(0, Math.min(100, 100 - deduction));

  return {
    url,
    title,
    description,
    score,
    issues,
    headings,
    linksCount,
    imagesCount,
    loadTimeMs,
  };
}