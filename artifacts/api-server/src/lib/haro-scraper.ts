import { load } from "cheerio";

export interface HaroQuery {
  id: string;
  title: string;
  category: string;
  deadline: string;
  details: string;
  requirements: string[];
}

export class HaroScraper {
  private categories = [
    "business-finance",
    "healthcare-wellness",
    "technology-ai",
    "marketing-pr",
    "lifestyle-travel",
  ];

  async fetchQueries(keywords: string[]): Promise<HaroQuery[]> {
    const results: HaroQuery[] = [];
    for (const cat of this.categories) {
      try {
        const url = `https://www.helpareporter.com/category/${cat}/`;
        const res = await fetch(url, { headers: { "User-Agent": "GrowthOS/1.0" } });
        const $ = load(await res.text());
        $(".query-item").each((_, el) => {
          const title = $(el).find(".query-title").text().trim();
          if (keywords.some((k) => title.toLowerCase().includes(k.toLowerCase()))) {
            results.push({
              id: $(el).attr("data-id") || crypto.randomUUID(),
              title,
              category: cat,
              deadline: $(el).find(".deadline").text().trim(),
              details: $(el).find(".query-details").text().trim(),
              requirements: $(el)
                .find(".requirements li")
                .map((_, li) => $(li).text().trim())
                .get(),
            });
          }
        });
      } catch (e) {
        console.error(`HARO [${cat}]:`, e);
      }
    }
    return results;
  }
}
