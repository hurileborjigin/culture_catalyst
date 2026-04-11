/**
 * Azure OpenAI Service
 * 
 * Provides LLM capabilities using Azure OpenAI GPT-5.2
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
    
    return JSON.parse(jsonStr.trim()) as T;
  } catch (error) {
    console.error("Failed to parse LLM response as JSON:", response);
    throw new Error("Failed to parse structured output from LLM");
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
      content: `You are an expert at understanding user profiles and generating targeted web search queries to find successful cultural events, community projects, and creative initiatives that would inspire this person.

Based on the user's profile, generate 8-10 diverse search queries that will help find:
1. Successful events similar to what they might organize
2. Community projects in their field of interest
3. Innovative initiatives by people with similar backgrounds
4. Case studies of impactful cultural projects

Output a JSON array of search query strings. Each query should be specific and actionable for web search.`,
    },
    {
      role: "user",
      content: `User Profile:
- Name: ${userProfile.name}
- Interests: ${userProfile.interests.join(", ")}
- Professional Background: ${userProfile.professionalBackground || "Not specified"}
- Organization: ${userProfile.organization || "Independent"}
- Location: ${userProfile.location || "Not specified"}

Generate search queries to find inspiring events and projects for this person.`,
    },
  ];

  return generateStructuredOutput<string[]>(messages);
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
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are an expert at analyzing search results about cultural events, community projects, and creative initiatives, and transforming them into inspiring, actionable cards for users.

Your task is to analyze the provided search results and generate ${count} unique inspiration cards. Each card should:
1. Highlight a specific event, project, or initiative found in the search results
2. Explain why it's relevant to the user's profile
3. Extract key success metrics or highlights
4. Categorize appropriately

Output a JSON array of objects with this exact structure:
{
  "title": "Event/Project Name",
  "summary": "2-3 sentence description of what this is and what made it special",
  "category": "One of: Visual Arts, Performing Arts, Music, Heritage & Traditions, Environment & Sustainability, Commerce & Culture, Film & Media, Community Events, Education & Workshops, Food & Culinary",
  "location": "City, State/Country or 'Virtual' if online",
  "relevanceExplanation": "1 sentence explaining why this is relevant to the user's interests",
  "successHighlights": ["Metric 1", "Metric 2", "Metric 3"],
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "sourceUrl": "URL from the search result"
}

Be creative in extracting insights even from partial information. Focus on making each card inspiring and actionable.`,
    },
    {
      role: "user",
      content: `User Profile:
- Name: ${userProfile.name}
- Interests: ${userProfile.interests.join(", ")}
- Background: ${userProfile.professionalBackground || "Not specified"}

Search Results:
${searchResults.map((r, i) => `
--- Result ${i + 1} ---
Title: ${r.title}
URL: ${r.url}
Content: ${r.content.slice(0, 1500)}
`).join("\n")}

Generate ${count} inspiration cards from these results.`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 8000 });
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
      content: `You are an expert event planner and project consultant. Given an idea for a cultural event or community project, generate comprehensive research topics that will help the user understand how to make this idea a reality.

Generate research topics covering these aspects:
1. Similar successful events/projects (case studies)
2. Venue and logistics requirements
3. Legal and permit requirements
4. Budget and funding options
5. Marketing and outreach strategies
6. Staffing and volunteer needs
7. Timeline and planning milestones
8. Potential challenges and solutions

For each topic, provide 2-3 specific search queries that will yield useful information.

Output JSON with this structure:
{
  "topics": [
    {
      "aspect": "Name of the research aspect",
      "description": "Brief description of what we're researching",
      "searchQueries": ["query1", "query2", "query3"]
    }
  ]
}`,
    },
    {
      role: "user",
      content: `Idea Details:
- Title: ${idea.title}
- Description: ${idea.description}
- Category: ${idea.category}

User Context:
- Location: ${userProfile.location || "Not specified"}
- Background: ${userProfile.professionalBackground || "Not specified"}
- Interests: ${userProfile.interests.join(", ")}

Generate research topics to help plan this idea.`,
    },
  ];

  return generateStructuredOutput(messages);
}

/**
 * Synthesize research results into actionable guidance with sources
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
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are an expert at synthesizing research into clear, actionable guidance. Your job is to analyze research results and create a comprehensive planning guide.

CRITICAL: You MUST include source citations for all information. Every insight, recommendation, and fact must be traceable to a source URL.

For each research aspect, create a section that includes:
1. Clear, practical content explaining how to approach this aspect
2. Key insights extracted from the sources
3. Specific action items the user can take
4. Sources with direct quotes or paraphrases showing where the information came from

Output JSON with this structure:
{
  "sections": [
    {
      "aspect": "research aspect name",
      "title": "Section Title",
      "content": "Detailed content with practical guidance (2-3 paragraphs)",
      "keyInsights": ["insight 1", "insight 2", "insight 3"],
      "actionItems": ["action 1", "action 2", "action 3"],
      "sources": [
        {
          "title": "Source Title",
          "url": "https://...",
          "relevantQuote": "Quote or paraphrase from the source"
        }
      ]
    }
  ],
  "summary": "Executive summary of all research findings (2-3 sentences)"
}`,
    },
    {
      role: "user",
      content: `Idea: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}

Research Results:
${researchResults.map(r => `
=== ${r.aspect} ===
${r.sources.map((s, i) => `
Source ${i + 1}: ${s.title}
URL: ${s.url}
Content: ${s.content.slice(0, 2000)}
`).join("\n")}
`).join("\n\n")}

Synthesize this research into actionable guidance. Remember to cite sources for ALL information.`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 8000 });
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
      content: `You are an expert proposal writer for cultural and community projects. Create a comprehensive, professional proposal that can be used to pitch the project to stakeholders, funders, or collaborators.

The proposal should be:
- Compelling and inspiring
- Realistic and well-researched
- Actionable with clear next steps
- Tailored to the user's situation (what resources they already have)

Output JSON with this exact structure:
{
  "title": "Project Title",
  "visionStatement": "2-3 sentences describing the vision",
  "goals": ["goal 1", "goal 2", "goal 3", "goal 4", "goal 5"],
  "culturalImpact": "Paragraph describing the cultural and community impact",
  "timeline": {
    "duration": "Total duration (e.g., '12 weeks')",
    "phases": [
      {
        "name": "Phase Name",
        "duration": "Duration",
        "tasks": ["task 1", "task 2"]
      }
    ]
  },
  "budget": {
    "total": "Total amount",
    "breakdown": [
      {
        "category": "Category Name",
        "amount": "Amount",
        "description": "What this covers"
      }
    ]
  },
  "collaboratorsNeeded": [
    {
      "role": "Role Title",
      "skills": ["skill 1", "skill 2"],
      "priority": "required",
      "count": 1
    }
  ],
  "resources": ["resource 1", "resource 2"],
  "challengesAndMitigation": [
    {
      "challenge": "Description of challenge",
      "mitigation": "How to address it"
    }
  ],
  "nextSteps": ["step 1", "step 2", "step 3"]
}`,
    },
    {
      role: "user",
      content: `Create a proposal for this project:

Project Idea:
- Title: ${idea.title}
- Description: ${idea.description}
- Category: ${idea.category}

Organizer Profile:
- Name: ${userProfile.name}
- Background: ${userProfile.professionalBackground || "Not specified"}
- Organization: ${userProfile.organization || "Independent"}
- Interests: ${userProfile.interests.join(", ")}

Current Resources/Requirements:
- Has Venue: ${userRequirements?.hasVenue ? "Yes" : "No/Unknown"}
- Has Funding: ${userRequirements?.hasFunding ? "Yes" : "No/Unknown"}
- Has Team: ${userRequirements?.hasTeam ? "Yes" : "No/Unknown"}
- Budget Constraints: ${userRequirements?.budget || "To be determined"}
- Timeline Constraints: ${userRequirements?.timeline || "Flexible"}
- Additional Notes: ${userRequirements?.additionalNotes || "None"}

Research Summary:
${researchSynthesis.summary}

Key Research Insights:
${researchSynthesis.sections.map(s => `
${s.title}:
${s.keyInsights.map(i => `- ${i}`).join("\n")}
`).join("\n")}

Generate a comprehensive proposal based on this information.`,
    },
  ];

  return generateStructuredOutput(messages, { maxTokens: 6000 });
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
