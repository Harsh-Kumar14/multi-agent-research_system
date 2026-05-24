import { tool } from "langchain";
import { z } from "zod";

import axios from "axios";
import * as cheerio from "cheerio";

import { tavily } from "@tavily/core";
import dotenv from "dotenv";

dotenv.config();

const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

export const web_search = tool(
  async ({ query }) => {
    try {
      const response = await client.search(query, { maxResults: 5 });
      const out = [];

      for (const r of response.results) {
        out.push(
          `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${(r.content || "").slice(0, 300)}\n`
        );
      }

      return out.join("\n----\n");
    } catch (error) {
      return `Search failed: ${error.message}`;
    }
  },
  {
    name: "web_search",
    description:
      "Search the web for recent and reliable information on a topic. Returns Titles, URLs and snippets.",
    schema: z.object({
      query: z.string().describe("Search query for web search"),
    }),
  }
);

export const scrape_url = tool(
  async ({ url }) => {
    try {
      const response = await axios.get(url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      const $ = cheerio.load(response.data);
      $("script, style, nav, footer").remove();

      const text = $("body").text().replace(/\s+/g, " ").trim();
      return text.slice(0, 3000);
    } catch (error) {
      return `Could not scrape URL: ${error.message}`;
    }
  },
  {
    name: "scrape_url",
    description:
      "Scrape and return clean text content from a given URL for deeper reading.",
    schema: z.object({ url: z.string().describe("URL to scrape") }),
  }
);