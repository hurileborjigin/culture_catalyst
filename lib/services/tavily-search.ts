/**
 * Tavily Search Service
 * 
 * Provides web search capabilities using Tavily API
 * for finding real-world examples, case studies, and references
 */

const TAVILY_API_URL = "https://api.tavily.com/search";

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
}

interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
  response_time: number;
}

export interface SearchOptions {
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
  includeAnswer?: boolean;
  includeRawContent?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
}

/**
 * Perform a web search using Tavily API
 */
export async function search(
  query: string,
  options: SearchOptions = {}
): Promise<{
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
  }>;
  answer?: string;
}> {
  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "Tavily API key not configured. Please set TAVILY_API_KEY environment variable."
    );
  }

  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: options.maxResults ?? 10,
      search_depth: options.searchDepth ?? "advanced",
      include_answer: options.includeAnswer ?? false,
      include_raw_content: options.includeRawContent ?? false,
      include_domains: options.includeDomains ?? [],
      exclude_domains: options.excludeDomains ?? [],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Tavily search error:", error);
    throw new Error(`Tavily search failed: ${response.status}`);
  }

  const data: TavilySearchResponse = await response.json();

  return {
    results: data.results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    })),
    answer: data.answer,
  };
}

/**
 * Perform multiple searches in parallel
 */
export async function searchMultiple(
  queries: string[],
  options: SearchOptions = {}
): Promise<
  Array<{
    query: string;
    results: Array<{
      title: string;
      url: string;
      content: string;
      score: number;
    }>;
  }>
> {
  const searchPromises = queries.map(async (query) => {
    try {
      const result = await search(query, options);
      return {
        query,
        results: result.results,
      };
    } catch (error) {
      console.error(`Search failed for query "${query}":`, error);
      return {
        query,
        results: [],
      };
    }
  });

  return Promise.all(searchPromises);
}

/**
 * Search for inspiration - cultural events and community projects
 */
export async function searchForInspiration(
  queries: string[],
  maxResultsPerQuery: number = 5
): Promise<
  Array<{
    title: string;
    url: string;
    content: string;
  }>
> {
  const allResults: Array<{
    title: string;
    url: string;
    content: string;
  }> = [];

  const searchResults = await searchMultiple(queries, {
    maxResults: maxResultsPerQuery,
    searchDepth: "advanced",
    // Prioritize news, event sites, and community platforms
    includeDomains: [],
    excludeDomains: [
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "tiktok.com",
      "pinterest.com",
    ],
  });

  for (const result of searchResults) {
    for (const item of result.results) {
      // Avoid duplicates by URL
      if (!allResults.some((r) => r.url === item.url)) {
        allResults.push({
          title: item.title,
          url: item.url,
          content: item.content,
        });
      }
    }
  }

  return allResults;
}

/**
 * Search for research on a specific topic
 */
export async function searchForResearch(
  topic: string,
  queries: string[],
  maxResults: number = 8
): Promise<{
  topic: string;
  sources: Array<{
    title: string;
    url: string;
    content: string;
    relevanceScore: number;
  }>;
}> {
  const results = await searchMultiple(queries, {
    maxResults: Math.ceil(maxResults / queries.length) + 2,
    searchDepth: "advanced",
  });

  const allSources: Array<{
    title: string;
    url: string;
    content: string;
    relevanceScore: number;
  }> = [];

  for (const result of results) {
    for (const item of result.results) {
      // Avoid duplicates
      if (!allSources.some((s) => s.url === item.url)) {
        allSources.push({
          title: item.title,
          url: item.url,
          content: item.content,
          relevanceScore: item.score,
        });
      }
    }
  }

  // Sort by relevance and take top results
  allSources.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return {
    topic,
    sources: allSources.slice(0, maxResults),
  };
}

export const tavilySearch = {
  search,
  searchMultiple,
  searchForInspiration,
  searchForResearch,
};

export default tavilySearch;
