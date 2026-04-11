/**
 * API Service Layer
 *
 * This file provides a centralized API client for making requests to your backend.
 * Replace the base URL and add your authentication logic when implementing the backend.
 */

import type {
  ApiResponse,
  PaginatedResponse,
  User,
  InspirationCard,
  IdeaConcept,
  PlanningWorkflow,
  Proposal,
  WorkflowSession,
} from "@/types";

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Helper function for making API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        // Add authorization header when you implement auth
        // "Authorization": `Bearer ${getAuthToken()}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "An error occurred",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ============================================
// Authentication API
// ============================================

export const authApi = {
  login: async (email: string, password: string) => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (data: { name: string; email: string; password: string; interests?: string[] }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  logout: async () => {
    const token = localStorage.getItem("auth_token");
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return { success: true };
  },

  me: async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      return { success: false, error: "No token" };
    }
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getCurrentUser: () => apiRequest<User>("/auth/me"),

  forgotPassword: (email: string) =>
    apiRequest<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

// ============================================
// User API
// ============================================

export const userApi = {
  getProfile: () => apiRequest<User>("/users/profile"),

  updateProfile: (data: Partial<User>) =>
    apiRequest<User>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateInterests: (interests: string[]) =>
    apiRequest<User>("/users/interests", {
      method: "PUT",
      body: JSON.stringify({ interests }),
    }),
};

// ============================================
// Inspiration API
// ============================================

export const inspirationApi = {
  getRecommendations: (params?: {
    category?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());

    return apiRequest<PaginatedResponse<InspirationCard>>(
      `/inspiration?${searchParams}`
    );
  },

  getSaved: () => apiRequest<InspirationCard[]>("/inspiration/saved"),

  save: (inspirationId: string) =>
    apiRequest<void>(`/inspiration/${inspirationId}/save`, {
      method: "POST",
    }),

  unsave: (inspirationId: string) =>
    apiRequest<void>(`/inspiration/${inspirationId}/save`, {
      method: "DELETE",
    }),

  refreshRecommendations: () =>
    apiRequest<InspirationCard[]>("/inspiration/refresh", {
      method: "POST",
    }),
};

// ============================================
// Ideas API
// ============================================

export const ideasApi = {
  getAll: (params?: { status?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());

    return apiRequest<PaginatedResponse<IdeaConcept>>(`/ideas?${searchParams}`);
  },

  getById: (id: string) => apiRequest<IdeaConcept>(`/ideas/${id}`),

  create: (data: {
    title: string;
    description: string;
    category: string;
    inspirationId?: string;
  }) =>
    apiRequest<IdeaConcept>("/ideas", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<IdeaConcept>) =>
    apiRequest<IdeaConcept>(`/ideas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/ideas/${id}`, {
      method: "DELETE",
    }),

  archive: (id: string) =>
    apiRequest<IdeaConcept>(`/ideas/${id}/archive`, {
      method: "POST",
    }),

  getWorkflow: (id: string) =>
    apiRequest<PlanningWorkflow>(`/ideas/${id}/workflow`),
};

// ============================================
// Proposals API
// ============================================

export const proposalsApi = {
  getAll: (params?: { status?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());

    return apiRequest<PaginatedResponse<Proposal>>(`/proposals?${searchParams}`);
  },

  getById: (id: string) => apiRequest<Proposal>(`/proposals/${id}`),

  create: (data: Partial<Proposal>) =>
    apiRequest<Proposal>("/proposals", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Proposal>) =>
    apiRequest<Proposal>(`/proposals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/proposals/${id}`, {
      method: "DELETE",
    }),

  publish: (id: string) =>
    apiRequest<Proposal>(`/proposals/${id}/publish`, {
      method: "POST",
    }),

  archive: (id: string) =>
    apiRequest<Proposal>(`/proposals/${id}/archive`, {
      method: "POST",
    }),

  generateFromIdea: (ideaId: string) =>
    apiRequest<Proposal>(`/proposals/generate`, {
      method: "POST",
      body: JSON.stringify({ ideaId }),
    }),
};

// ============================================
// AI Agents API
// ============================================

export const agentsApi = {
  // Start a new workflow session
  startSession: (phase: "inspiration" | "development" | "proposal") =>
    apiRequest<WorkflowSession>("/agents/sessions", {
      method: "POST",
      body: JSON.stringify({ phase }),
    }),

  // Get session status
  getSession: (sessionId: string) =>
    apiRequest<WorkflowSession>(`/agents/sessions/${sessionId}`),

  // Inspiration Agent
  getInspirations: (params: {
    userId: string;
    interests?: string[];
    category?: string;
  }) =>
    apiRequest<InspirationCard[]>("/agents/inspiration", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // Planning Agent - Generate workflow
  generateWorkflow: (ideaId: string) =>
    apiRequest<PlanningWorkflow>("/agents/planning/workflow", {
      method: "POST",
      body: JSON.stringify({ ideaId }),
    }),

  // Budget Agent - Estimate budget
  estimateBudget: (ideaId: string) =>
    apiRequest<PlanningWorkflow["estimatedBudget"]>("/agents/planning/budget", {
      method: "POST",
      body: JSON.stringify({ ideaId }),
    }),

  // Compliance Agent - Legal guidance
  getLegalGuidance: (ideaId: string) =>
    apiRequest<PlanningWorkflow["legalGuidance"]>("/agents/planning/legal", {
      method: "POST",
      body: JSON.stringify({ ideaId }),
    }),

  // Logistics Agent - Logistics planning
  planLogistics: (ideaId: string) =>
    apiRequest<PlanningWorkflow["logisticsPlan"]>("/agents/planning/logistics", {
      method: "POST",
      body: JSON.stringify({ ideaId }),
    }),

  // Proposal Generation Agent
  generateProposal: (ideaId: string) =>
    apiRequest<Proposal>("/agents/proposal/generate", {
      method: "POST",
      body: JSON.stringify({ ideaId }),
    }),

  // AI-assisted enhancement
  enhanceIdea: (description: string) =>
    apiRequest<{ title: string; description: string; suggestions: string[] }>(
      "/agents/enhance",
      {
        method: "POST",
        body: JSON.stringify({ description }),
      }
    ),

  // Chat with AI assistant
  chat: (
    sessionId: string,
    message: string,
    context?: Record<string, unknown>
  ) =>
    apiRequest<{
      response: string;
      suggestions?: string[];
      actions?: Array<{ type: string; data: unknown }>;
    }>("/agents/chat", {
      method: "POST",
      body: JSON.stringify({ sessionId, message, context }),
    }),
};

// ============================================
// Export all APIs
// ============================================

export const api = {
  auth: authApi,
  user: userApi,
  inspiration: inspirationApi,
  ideas: ideasApi,
  proposals: proposalsApi,
  agents: agentsApi,
};

export default api;
