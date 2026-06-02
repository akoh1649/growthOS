import { load } from "cheerio";

export interface BrokenLink {
  url: string;
  statusCode: number;
  foundOn: string;
  anchorText: string;
}

export interface BrokenLinkReport {
  targetUrl: string;
  brokenLinks: BrokenLink[];
  totalChecked: number;
  linkableAssets: string[];
}

export class BrokenLinkChecker {
  private ua = "GrowthOS/1.0";

  async scan(url: string): Promise<BrokenLinkReport> {
    const res = await fetch(url, { headers: { "User-Agent": this.ua } });
    const $ = load(await res.text());

    const links: { href: string; text: string }[] = [];
    const linkable: string[] = [];

    $("a[href]").each((_, el) => {
      const h = $(el).attr("href") || "";
      const t = $(el).text().trim();
      if (h.startsWith("http") || h.startsWith("//")) {
        links.push({ href: h.replace(/^\/\//, "https://"), text: t });
      }
      if (h.includes("/resource") || h.includes("/blog/") || h.includes("/whitepaper")) {
        linkable.push(h);
      }
    });

    const broken: BrokenLink[] = [];
    for (let i = 0; i < links.length; i += 5) {
      const batch = links.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map((l) => this.check(l.href, url, l.text))
      );
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value) broken.push(r.value);
      });
    }

    return {
      targetUrl: url,
      brokenLinks: broken,
      totalChecked: links.length,
      linkableAssets: [...new Set(linkable)],
    };
  }

  private async check(
    href: string,
    src: string,
    txt: string
  ): Promise<BrokenLink | null> {
    try {
      const r = await fetch(href, {
        method: "HEAD",
        headers: { "User-Agent": this.ua },
        signal: AbortSignal.timeout(5000),
      });
      return r.status >= 400
        ? { url: href, statusCode: r.status, foundOn: src, anchorText: txt }
        : null;
    } catch {
      return { url: href, statusCode: 0, foundOn: src, anchorText: txt };
    }
  }
}
