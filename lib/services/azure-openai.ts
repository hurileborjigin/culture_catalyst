/**
 * Azure OpenAI Service
 * 
 * Provides LLM capabilities using Azure OpenAI GPT-5.2
 * Uses agentic workflow with chunking to handle large contexts
 */

import { AzureOpenAI } from "openai";

// Configuration from environment variables
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-06-01";
const deploymentName = process.env.SYNAPSE_LLM_MODEL || "gpt-5.2";

// Initialize Azure OpenAI client
let client: AzureOpenAI | null = null;

function getClient(): AzureOpenAI {
  if (!client) {
    if (!endpoint || !apiKey) {
      throw new Error(
        "Azure OpenAI configuration missing. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables."
      );
    }
    client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion,
    });
  }
  return client;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Generate a chat completion using Azure OpenAI
 */
export async function generateCompletion(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  if (!endpoint || !apiKey) {
    throw new Error("Azure OpenAI not configured. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables.");
  }

  const openai = getClient();
  
  const response = await openai.chat.completions.create({
    model: deploymentName,
    messages,
    temperature: options.temperature ?? 0.7,
    max_completion_tokens: options.maxTokens ?? 4096,
    top_p: options.topP ?? 1,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Attempt to repair truncated JSON
 */
function repairTruncatedJson(jsonStr: string): string {
  let str = jsonStr.trim();
  
  // Count brackets to determine what's missing
  let openBraces = 0, openBrackets = 0, inString = false, escapeNext = false;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\') { escapeNext = true; continue; }
    if (char === '"' && !escapeNext) { inString = !inString; continue; }
    if (inString) continue;
    if (char === '{') openBraces++;
    if (char === '}') openBraces--;
    if (char === '[') openBrackets++;
    if (char === ']') openBrackets--;
  }
  
  // If we're in a string, close it
  if (inString) {
    str += '"';
  }
  
  // Close any open brackets/braces
  while (openBrackets > 0) { str += ']'; openBrackets--; }
  while (openBraces > 0) { str += '}'; openBraces--; }
  
  return str;
}

/**
 * Generate structured JSON output from LLM with retry and repair logic
 */
export async function generateStructuredOutput<T>(
  messages: ChatMessage[],
  options: CompletionOptions = {},
  retryCount: number = 0
): Promise<T> {
  const systemMessage = messages.find(m => m.role === "system");
  const updatedMessages: ChatMessage[] = [
    {
      role: "system",
      content: `${systemMessage?.content || ""}\n\nIMPORTANT: Respond with valid JSON only. No markdown. Keep response concise.`,
    },
    ...messages.filter(m => m.role !== "system"),
  ];

  const response = await generateCompletion(updatedMessages, {
    ...options,
    temperature: options.temperature ?? 0.5,
  });

  if (!response || response.trim() === "") {
    throw new Error("LLM returned empty response");
  }

  // Extract JSON from response
  let jsonStr = response.trim();
  if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
  else if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
  if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
  
  const jsonMatch = jsonStr.match(/[\[{][\s\S]*$/);
  if (jsonMatch) jsonStr = jsonMatch[0];
  
  // First try parsing as-is
  try {
    return JSON.parse(jsonStr.trim()) as T;
  } catch (e) {
    // Try to repair truncated JSON
    console.log("[LLM] Attempting to repair truncated JSON...");
    try {
      const repaired = repairTruncatedJson(jsonStr);
      return JSON.parse(repaired) as T;
    } catch (e2) {
      // Retry with smaller request if we haven't already
      if (retryCount < 1) {
        console.log("[LLM] Retrying with more concise prompt...");
        const shorterMessages = messages.map(m => ({
          ...m,
          content: m.role === "user" ? m.content.slice(0, Math.floor(m.content.length * 0.6)) : m.content
        }));
        return generateStructuredOutput<T>(shorterMessages, { ...options, maxTokens: (options.maxTokens || 2000) + 500 }, retryCount + 1);
      }
      console.error("[LLM] Failed to parse JSON after repair:", jsonStr.slice(0, 500));
      throw new Error("Failed to parse LLM response as JSON");
    }
  }
}

/**
 * Compress/summarize text to reduce token usage
 */
async function compressContent(content: string, maxLength: number = 500): Promise<string> {
  if (content.length <= maxLength) return content;
  
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "Extract the most important information from the text. Be concise. Output plain text only.",
    },
    {
      role: "user",
      content: `Summarize in under ${maxLength} characters, keeping key facts, numbers, and actionable information:\n\n${content.slice(0, 3000)}`,
    },
  ];

  return generateCompletion(messages, { maxTokens: 500, temperature: 0.3 });
}

/**
 * Generate search queries based on user profile for inspiration discovery
 * Note: Queries are intentionally GLOBAL - we want to show what people with similar
 * interests are doing worldwide, not just in the user's local area.
 */
export async function generateSearchQueries(userProfile: {
  name: string;
  interests: string[];
  professionalBackground?: string;
  organization?: string;
  location?: string;
}): Promise<string[]> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Generate 8 web search queries to find inspiring cultural events and community projects GLOBALLY for someone with these interests. 
Do NOT limit to any specific location - search for worldwide examples, innovative projects from different countries, and global best practices.
Include diverse geographic examples (Europe, Asia, Americas, Africa, etc.).
Output a JSON array of strings.`,
    },
    {
      role: "user",
      content: `Interests: ${userProfile.interests.join(", ")}
Background: ${userProfile.professionalBackground || "Not specified"}

Generate search queries for GLOBAL inspiration - projects from around the world that would inspire someone with these interests.`,
    },
  ];

  return generateStructuredOutput<string[]>(messages, { maxTokens: 1000 });
}

/**
 * Generate inspiration cards from search results
 */
export async function generateInspirationCards(
  searchResults: Array<{ title: string; content: string; url: string }>,
  userProfile: { name: string; interests: string[]; professionalBackground?: string },
  count: number = 20
): Promise<Array<{
  title: string;
  summary: string;
  category: string;
  location: string;
  relevanceExplanation: string;
  successHighlights: string[];
  tags: string[];
  sourceUrl: string;
}>> {
  // Chunk results and process in batches to avoid token limits
  const batchSize = 5;
  const allCards: Array<{
    title: string;
    summary: string;
    category: string;
    location: string;
    relevanceExplanation: string;
    successHighlights: string[];
    tags: string[];
    sourceUrl: string;
  }> = [];

  for (let i = 0; i < searchResults.length && allCards.length < count; i += batchSize) {
    const batch = searchResults.slice(i, i + batchSize);
    const cardsNeeded = Math.min(count - allCards.length, 5);
    
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `Create ${cardsNeeded} inspiration cards from search results. Output JSON array:
[{"title":"..","summary":"2 sentences","category":"Visual Arts|Performing Arts|Music|Heritage & Traditions|Environment & Sustainability|Commerce & Culture|Film & Media|Community Events|Education & Workshops|Food & Culinary","location":"City, Country","relevanceExplanation":"1 sentence","successHighlights":["metric1","metric2"],"tags":["tag1","tag2"],"sourceUrl":"url"}]`,
      },
      {
        role: "user",
        content: `User interests: ${userProfile.interests.join(", ")}

Results:
${batch.map((r, idx) => `[${idx + 1}] ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 800)}`).join("\n\n")}`,
      },
    ];

    const batchCards = await generateStructuredOutput<typeof allCards>(messages, { maxTokens: 2000 });
    allCards.push(...batchCards);
  }

  return allCards.slice(0, count);
}

/**
 * Generate research topics for idea development
 */
export async function generateResearchTopics(
  idea: { title: string; description: string; category: string },
  userProfile: { name: string; interests: string[]; professionalBackground?: string; location?: string }
): Promise<{ topics: Array<{ aspect: string; description: string; searchQueries: string[] }> }> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Generate 6 research topics for planning a cultural project. Cover: case studies, venues, permits, budget, marketing, timeline.
Output JSON: {"topics":[{"aspect":"name","description":"brief desc","searchQueries":["q1","q2"]}]}`,
    },
    {
      role: "user",
      content: `Project: ${idea.title}
${idea.description}
Category: ${idea.category}
Location: ${userProfile.location || "Not specified"}`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 2000 });
}

/**
 * Process a single research aspect (part of agentic workflow)
 */
async function processResearchAspect(
  idea: { title: string; description: string },
  aspect: string,
  sources: Array<{ title: string; url: string; content: string }>
): Promise<{
  aspect: string;
  title: string;
  content: string;
  keyInsights: string[];
  actionItems: string[];
  sources: Array<{ title: string; url: string; relevantQuote: string }>;
}> {
  // Use only top 2 sources with aggressive compression
  const topSources = sources.slice(0, 2);
  const compressedSources = topSources.map(s => ({
    title: s.title.slice(0, 80),
    url: s.url,
    content: s.content.slice(0, 300),
  }));

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You analyze research for "${aspect}". Output compact JSON only:
{"aspect":"${aspect}","title":"Title (5 words max)","content":"1 paragraph, 3-4 sentences max","keyInsights":["insight1","insight2"],"actionItems":["action1","action2"],"sources":[{"title":"name","url":"url","relevantQuote":"short quote"}]}`,
    },
    {
      role: "user",
      content: `Project: ${idea.title}

Sources:
${compressedSources.map((s, i) => `[${i + 1}] ${s.title}\n${s.url}\n${s.content}`).join("\n")}`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 1000 });
}

/**
 * Synthesize research results into actionable guidance using agentic chunked processing
 */
export async function synthesizeResearch(
  idea: { title: string; description: string; category: string },
  researchResults: Array<{
    aspect: string;
    sources: Array<{ title: string; url: string; content: string }>;
  }>
): Promise<{
  sections: Array<{
    aspect: string;
    title: string;
    content: string;
    keyInsights: string[];
    actionItems: string[];
    sources: Array<{ title: string; url: string; relevantQuote: string }>;
  }>;
  summary: string;
}> {
  // AGENTIC WORKFLOW: Process each research aspect independently
  console.log(`[Agentic] Processing ${researchResults.length} research aspects in parallel chunks`);
  
  // Step 1: Process each aspect separately (chunked processing)
  const sectionPromises = researchResults.map((r) =>
    processResearchAspect(idea, r.aspect, r.sources)
  );
  
  // Process in parallel batches of 3 to avoid rate limits
  const sections: Array<{
    aspect: string;
    title: string;
    content: string;
    keyInsights: string[];
    actionItems: string[];
    sources: Array<{ title: string; url: string; relevantQuote: string }>;
  }> = [];
  
  for (let i = 0; i < sectionPromises.length; i += 3) {
    const batch = sectionPromises.slice(i, i + 3);
    const batchResults = await Promise.all(batch);
    sections.push(...batchResults);
  }

  // Step 2: Generate summary from compressed section data (final merge)
  const summaryInput = sections.map(s => `${s.title}: ${s.keyInsights.slice(0, 2).join("; ")}`).join("\n");
  
  const summaryMessages: ChatMessage[] = [
    {
      role: "system",
      content: "Write a 2-3 sentence executive summary of research findings. Be concise and actionable.",
    },
    {
      role: "user",
      content: `Project: ${idea.title}\n\nKey findings:\n${summaryInput}`,
    },
  ];

  const summary = await generateCompletion(summaryMessages, { maxTokens: 300 });

  return { sections, summary };
}

/**
 * Generate a project proposal using chunked context
 */
export async function generateProposal(
  idea: { title: string; description: string; category: string },
  researchSynthesis: {
    sections: Array<{
      aspect: string;
      title: string;
      content: string;
      keyInsights: string[];
      actionItems: string[];
    }>;
    summary: string;
  },
  userProfile: {
    name: string;
    interests: string[];
    professionalBackground?: string;
    organization?: string;
  },
  userRequirements?: {
    hasVenue?: boolean;
    hasFunding?: boolean;
    hasTeam?: boolean;
    budget?: string;
    timeline?: string;
    additionalNotes?: string;
  }
): Promise<{
  title: string;
  visionStatement: string;
  goals: string[];
  culturalImpact: string;
  timeline: { duration: string; phases: Array<{ name: string; duration: string; tasks: string[] }> };
  budget: { total: string; breakdown: Array<{ category: string; amount: string; description: string }> };
  collaboratorsNeeded: Array<{ role: string; skills: string[]; priority: "required" | "preferred" | "nice-to-have"; count: number }>;
  resources: string[];
  challengesAndMitigation: Array<{ challenge: string; mitigation: string }>;
  nextSteps: string[];
}> {
  // Compress research insights for context
  const compressedInsights = researchSynthesis.sections
    .map(s => `${s.title}: ${s.keyInsights.slice(0, 2).join("; ")}`)
    .join("\n");

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Create project proposal as compact JSON:
{"title":"","visionStatement":"2 sentences","goals":["g1","g2","g3"],"culturalImpact":"2-3 sentences","timeline":{"duration":"weeks","phases":[{"name":"","duration":"","tasks":["t1"]}]},"budget":{"total":"$X","breakdown":[{"category":"","amount":"","description":""}]},"collaboratorsNeeded":[{"role":"","skills":["s1"],"priority":"required","count":1}],"resources":["r1"],"challengesAndMitigation":[{"challenge":"","mitigation":""}],"nextSteps":["s1","s2"]}`,
    },
    {
      role: "user",
      content: `${idea.title}: ${idea.description.slice(0, 300)}
Category: ${idea.category}
Organizer: ${userProfile.name}, ${userProfile.organization || "Independent"}
Budget: ${userRequirements?.budget || "TBD"}, Timeline: ${userRequirements?.timeline || "Flexible"}
Research: ${researchSynthesis.summary.slice(0, 200)}
Insights: ${compressedInsights.slice(0, 400)}`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 3000 });
}

/**
 * Generate tags and category for a proposal (used when publishing)
 */
export async function generateProposalTags(proposal: {
  title: string;
  visionStatement?: string | null;
  goals?: string[];
  culturalImpact?: string | null;
}): Promise<{ tags: string[]; category: string }> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Extract 5-8 descriptive tags and one category for this cultural project proposal.
Categories: Visual Arts, Performing Arts, Music, Heritage & Traditions, Environment & Sustainability, Commerce & Culture, Film & Media, Community Events, Education & Workshops, Food & Culinary.
Output JSON: {"tags":["tag1","tag2"],"category":"Category Name"}`,
    },
    {
      role: "user",
      content: `Title: ${proposal.title}
Vision: ${proposal.visionStatement || "N/A"}
Goals: ${(proposal.goals || []).slice(0, 3).join("; ")}
Impact: ${proposal.culturalImpact || "N/A"}`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 500 });
}

/**
 * Rank published proposals by relevance to a user profile
 */
export interface ProposalMatchDetails {
  id: string;
  score: number;
  reason: string;
  matchingInterests: string[];
  matchingSkills: string[];
  rolesYouCouldFill: string[];
}

export async function rankProposalsForUser(
  userProfile: {
    name: string;
    interests: string[];
    skills?: string[];
    professionalBackground?: string;
    location?: string;
  },
  proposals: Array<{
    id: string;
    title: string;
    visionStatement: string | null;
    category: string | null;
    tags: string[];
    authorLocation: string | null;
    collaboratorsNeeded: unknown;
  }>
): Promise<ProposalMatchDetails[]> {
  const allResults: ProposalMatchDetails[] = [];
  const batchSize = 10;

  for (let i = 0; i < proposals.length; i += batchSize) {
    const batch = proposals.slice(i, i + batchSize);

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a strict relevance scorer. Score each proposal 0-100 for how well it matches this user's profile. Be HIGHLY SELECTIVE:
- 80-100: Strong match — direct overlap with user's interests, skills, or professional domain
- 50-79: Moderate match — some thematic connection but not a core interest
- 20-49: Weak match — tangential connection at best
- 0-19: No meaningful match

Most proposals should score BELOW 60 for any given user. Only give high scores when there is clear, specific alignment. Do NOT inflate scores.

For each proposal, identify:
- matchingInterests: which of the user's interests align with this proposal (only list actual matches, can be empty)
- matchingSkills: which of the user's skills are relevant to this proposal's needs (only list actual matches, can be empty)
- rolesYouCouldFill: which collaborator roles the user could fill based on their skills/background (only list if genuinely applicable, can be empty)

Output JSON array:
[{"id":"proposal-id","score":85,"reason":"1 sentence summary","matchingInterests":["interest1"],"matchingSkills":["skill1"],"rolesYouCouldFill":["Role Name"]}]`,
      },
      {
        role: "user",
        content: `User Profile:
Name: ${userProfile.name}
Interests: ${userProfile.interests.join(", ")}
Skills: ${(userProfile.skills || []).join(", ") || "Not specified"}
Background: ${userProfile.professionalBackground || "Not specified"}
Location: ${userProfile.location || "Not specified"}

Proposals:
${batch.map((p) => {
  const collabs = Array.isArray(p.collaboratorsNeeded)
    ? (p.collaboratorsNeeded as Array<{ role: string; skills?: string[] }>)
        .map((c) => `${c.role} (${(c.skills || []).join(", ")})`)
        .join("; ")
    : "None listed";
  return `[${p.id}] ${p.title}
  Category: ${p.category || "Uncategorized"} | Tags: ${p.tags.join(", ")} | Location: ${p.authorLocation || "Unknown"}
  Collaborators needed: ${collabs}`;
}).join("\n\n")}`,
      },
    ];

    const batchResults = await generateStructuredOutput<ProposalMatchDetails[]>(
      messages,
      { maxTokens: 2000 }
    );
    allResults.push(...batchResults);
  }

  return allResults.sort((a, b) => b.score - a.score).slice(0, 20);
}

/**
 * Generate an actionable checklist for developing an idea
 */
export async function generateIdeaChecklist(idea: {
  title: string;
  description: string;
  category: string;
}): Promise<Array<{ text: string; completed: boolean }>> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Generate 8-12 checklist items that help a user prepare to write a strong project proposal for a cultural project idea. These should NOT be execution tasks (like "book venue" or "hire team") — those belong in the proposal itself.

Instead, focus on:
- Concepts that need to be clearly defined (target audience, project scope, success criteria)
- Things that need to be understood or researched before writing (regulations, similar projects, community needs)
- Key decisions that should be made (format, scale, partnerships approach)
- Knowledge gaps to fill (budget ranges, timeline feasibility, cultural sensitivities)
- Connections or insights to gather (talk to community leaders, understand local context)

Each item should start with an action verb like "Define", "Research", "Clarify", "Understand", "Decide", "Identify", "Explore", or "Assess".

Output JSON array: [{"text":"Checklist item description","completed":false}]`,
    },
    {
      role: "user",
      content: `Title: ${idea.title}\nDescription: ${idea.description}\nCategory: ${idea.category}`,
    },
  ];

  const result = await generateStructuredOutput<Array<{ text: string; completed: boolean }>>(
    messages,
    { maxTokens: 1500 }
  );

  return result.map((item) => ({ text: item.text, completed: false }));
}

export const azureOpenAI = {
  generateCompletion,
  generateStructuredOutput,
  generateSearchQueries,
  generateInspirationCards,
  generateResearchTopics,
  synthesizeResearch,
  generateProposal,
  generateProposalTags,
  rankProposalsForUser,
  generateIdeaChecklist,
};

export default azureOpenAI;
