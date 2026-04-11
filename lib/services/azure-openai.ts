/**
 * LLM Service
 * 
 * Provides LLM capabilities using Azure OpenAI or Vercel AI Gateway
 * Falls back to Vercel AI Gateway when Azure OpenAI is not configured
 */

import OpenAI from "openai";

// Configuration from environment variables
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const azureApiKey = process.env.AZURE_OPENAI_API_KEY || "";
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-06-01";
const deploymentName = process.env.SYNAPSE_LLM_MODEL || "gpt-4o";

// Check if Azure OpenAI is configured
const useAzure = !!(azureEndpoint && azureApiKey);

// Initialize client
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (useAzure) {
      // Use Azure OpenAI
      client = new OpenAI({
        apiKey: azureApiKey,
        baseURL: `${azureEndpoint}/openai/deployments/${deploymentName}`,
        defaultQuery: { "api-version": apiVersion },
        defaultHeaders: { "api-key": azureApiKey },
      });
    } else {
      // Use OpenAI directly (or Vercel AI Gateway)
      client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "sk-dummy",
      });
    }
  }
  return client;
}

// Get the model name
function getModelName(): string {
  if (useAzure) {
    return deploymentName;
  }
  return "gpt-4o";
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
 * Generate a chat completion
 */
export async function generateCompletion(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  const openai = getClient();
  
  console.log("[LLM] Using:", useAzure ? "Azure OpenAI" : "OpenAI");
  console.log("[LLM] Model:", getModelName());
  
  try {
    const response = await openai.chat.completions.create({
      model: getModelName(),
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      top_p: options.topP ?? 1,
    });

    const content = response.choices[0]?.message?.content || "";
    
    if (!content) {
      console.error("[LLM] Empty response. Finish reason:", response.choices[0]?.finish_reason);
    }
    
    return content;
  } catch (error) {
    console.error("[LLM] API error:", error);
    throw error;
  }
}

/**
 * Generate structured JSON output from LLM
 */
export async function generateStructuredOutput<T>(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<T> {
  const systemMessage = messages.find(m => m.role === "system");
  const updatedMessages: ChatMessage[] = [
    {
      role: "system",
      content: `${systemMessage?.content || ""}\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown, no code blocks, no explanations. Just pure JSON.`,
    },
    ...messages.filter(m => m.role !== "system"),
  ];

  const response = await generateCompletion(updatedMessages, {
    ...options,
    temperature: options.temperature ?? 0.5,
  });

  // Check for empty response
  if (!response || response.trim() === "") {
    console.error("[LLM] Empty response received");
    throw new Error("LLM returned empty response. Please check API configuration.");
  }

  try {
    // Try to extract JSON from the response
    let jsonStr = response.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }
    
    // Try to find JSON object or array in the response
    const jsonMatch = jsonStr.match(/[\[{][\s\S]*[\]}]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    return JSON.parse(jsonStr.trim()) as T;
  } catch (error) {
    console.error("[LLM] Failed to parse JSON:", response.slice(0, 500));
    throw new Error(`Failed to parse LLM response as JSON`);
  }
}

/**
 * Generate search queries based on user profile for inspiration discovery
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
      content: `You are an expert at generating targeted web search queries to find cultural events and community projects. Generate 6-8 diverse search queries based on the user's profile. Output a JSON array of strings.`,
    },
    {
      role: "user",
      content: `User: ${userProfile.name}
Interests: ${userProfile.interests.join(", ")}
Background: ${userProfile.professionalBackground || "Not specified"}
Location: ${userProfile.location || "Not specified"}

Generate search queries to find inspiring events and projects.`,
    },
  ];

  return generateStructuredOutput<string[]>(messages, { maxTokens: 1000 });
}

/**
 * Generate inspiration cards from search results
 */
export async function generateInspirationCards(
  searchResults: Array<{
    title: string;
    content: string;
    url: string;
  }>,
  userProfile: {
    name: string;
    interests: string[];
    professionalBackground?: string;
  },
  count: number = 10
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
  // Limit search results to avoid token overflow
  const limitedResults = searchResults.slice(0, 8);
  
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Analyze search results and generate ${count} inspiration cards. Output JSON array with objects containing: title, summary, category (Visual Arts/Performing Arts/Music/Heritage/Environment/Commerce/Film/Community/Education/Food), location, relevanceExplanation, successHighlights (array), tags (array), sourceUrl.`,
    },
    {
      role: "user",
      content: `User interests: ${userProfile.interests.join(", ")}

Results:
${limitedResults.map((r, i) => `${i + 1}. ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 600)}`).join("\n\n")}

Generate ${count} cards.`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 4000 });
}

/**
 * Generate research topics for idea development
 */
export async function generateResearchTopics(
  idea: {
    title: string;
    description: string;
    category: string;
  },
  userProfile: {
    name: string;
    interests: string[];
    professionalBackground?: string;
    location?: string;
  }
): Promise<{
  topics: Array<{
    aspect: string;
    description: string;
    searchQueries: string[];
  }>;
}> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Generate research topics for a cultural project. Cover: case studies, venue/logistics, legal/permits, budget/funding, marketing, staffing, timeline, challenges. For each topic provide aspect name, description, and 2 search queries. Output JSON: { "topics": [{ "aspect": "", "description": "", "searchQueries": [] }] }`,
    },
    {
      role: "user",
      content: `Project: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}
Location: ${userProfile.location || "Not specified"}`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 2000 });
}

/**
 * Synthesize research results into actionable guidance
 */
export async function synthesizeResearch(
  idea: {
    title: string;
    description: string;
    category: string;
  },
  researchResults: Array<{
    aspect: string;
    sources: Array<{
      title: string;
      url: string;
      content: string;
    }>;
  }>
): Promise<{
  sections: Array<{
    aspect: string;
    title: string;
    content: string;
    keyInsights: string[];
    actionItems: string[];
    sources: Array<{
      title: string;
      url: string;
      relevantQuote: string;
    }>;
  }>;
  summary: string;
}> {
  // Limit sources per topic to reduce token count
  const limitedResults = researchResults.map(r => ({
    aspect: r.aspect,
    sources: r.sources.slice(0, 2).map(s => ({
      title: s.title,
      url: s.url,
      content: s.content.slice(0, 500)
    }))
  }));

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Synthesize research into actionable guidance. For each aspect create: title, content (1-2 paragraphs), keyInsights (3 items), actionItems (3 items), sources with relevantQuote. Output JSON: { "sections": [...], "summary": "2 sentences" }`,
    },
    {
      role: "user",
      content: `Project: ${idea.title} - ${idea.description}

Research:
${limitedResults.map(r => `
${r.aspect}:
${r.sources.map(s => `- ${s.title} (${s.url}): ${s.content}`).join("\n")}`).join("\n")}

Synthesize into actionable guidance.`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 6000 });
}

/**
 * Generate a project proposal
 */
export async function generateProposal(
  idea: {
    title: string;
    description: string;
    category: string;
  },
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
  timeline: {
    duration: string;
    phases: Array<{
      name: string;
      duration: string;
      tasks: string[];
    }>;
  };
  budget: {
    total: string;
    breakdown: Array<{
      category: string;
      amount: string;
      description: string;
    }>;
  };
  collaboratorsNeeded: Array<{
    role: string;
    skills: string[];
    priority: "required" | "preferred" | "nice-to-have";
    count: number;
  }>;
  resources: string[];
  challengesAndMitigation: Array<{
    challenge: string;
    mitigation: string;
  }>;
  nextSteps: string[];
}> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Create a project proposal with: title, visionStatement, goals (5), culturalImpact, timeline (duration + phases with tasks), budget (total + breakdown), collaboratorsNeeded (role, skills, priority, count), resources, challengesAndMitigation, nextSteps. Output valid JSON.`,
    },
    {
      role: "user",
      content: `Project: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}

Organizer: ${userProfile.name}
Background: ${userProfile.professionalBackground || "Not specified"}
Organization: ${userProfile.organization || "Independent"}

Resources: Venue: ${userRequirements?.hasVenue ? "Yes" : "No"}, Funding: ${userRequirements?.hasFunding ? "Yes" : "No"}, Team: ${userRequirements?.hasTeam ? "Yes" : "No"}
Budget: ${userRequirements?.budget || "TBD"}
Timeline: ${userRequirements?.timeline || "Flexible"}

Research Summary: ${researchSynthesis.summary}

Key Insights:
${researchSynthesis.sections.slice(0, 4).map(s => `${s.title}: ${s.keyInsights.slice(0, 2).join("; ")}`).join("\n")}

Generate proposal.`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 4000 });
}

export const azureOpenAI = {
  generateCompletion,
  generateStructuredOutput,
  generateSearchQueries,
  generateInspirationCards,
  generateResearchTopics,
  synthesizeResearch,
  generateProposal,
};

export default azureOpenAI;
