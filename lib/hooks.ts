/**
 * Custom Hooks for Data Fetching
 *
 * These hooks use SWR for client-side data fetching with caching and revalidation.
 * Connect these to your backend API when implementing.
 */

import useSWR, { mutate } from "swr";
import type {
  User,
  InspirationCard,
  IdeaConcept,
  PlanningWorkflow,
  Proposal,
} from "@/types";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

// ============================================
// User Hooks
// ============================================

export function useCurrentUser() {
  const { data, error, isLoading } = useSWR<User>("/api/auth/me", fetcher);

  return {
    user: data,
    isLoading,
    isError: error,
  };
}

export function useUserProfile(userId?: string) {
  const { data, error, isLoading } = useSWR<User>(
    userId ? `/api/users/${userId}` : null,
    fetcher
  );

  return {
    profile: data,
    isLoading,
    isError: error,
  };
}

// ============================================
// Inspiration Hooks
// ============================================

export function useInspirations(category?: string) {
  const params = new URLSearchParams();
  if (category && category !== "All") {
    params.set("category", category);
  }

  const { data, error, isLoading } = useSWR<InspirationCard[]>(
    `/api/inspiration?${params}`,
    fetcher
  );

  return {
    inspirations: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate(`/api/inspiration?${params}`),
  };
}

export function useSavedInspirations() {
  const { data, error, isLoading } = useSWR<InspirationCard[]>(
    "/api/inspiration/saved",
    fetcher
  );

  return {
    savedInspirations: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate("/api/inspiration/saved"),
  };
}

// ============================================
// Ideas Hooks
// ============================================

export function useIdeas(status?: string) {
  const params = new URLSearchParams();
  if (status) {
    params.set("status", status);
  }

  const { data, error, isLoading } = useSWR<IdeaConcept[]>(
    `/api/ideas?${params}`,
    fetcher
  );

  return {
    ideas: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate(`/api/ideas?${params}`),
  };
}

export function useIdea(id?: string) {
  const { data, error, isLoading } = useSWR<IdeaConcept>(
    id ? `/api/ideas/${id}` : null,
    fetcher
  );

  return {
    idea: data,
    isLoading,
    isError: error,
    refresh: () => id && mutate(`/api/ideas/${id}`),
  };
}

export function useIdeaWorkflow(ideaId?: string) {
  const { data, error, isLoading } = useSWR<PlanningWorkflow>(
    ideaId ? `/api/ideas/${ideaId}/workflow` : null,
    fetcher
  );

  return {
    workflow: data,
    isLoading,
    isError: error,
    refresh: () => ideaId && mutate(`/api/ideas/${ideaId}/workflow`),
  };
}

// ============================================
// Proposals Hooks
// ============================================

export function useProposals(status?: string) {
  const params = new URLSearchParams();
  if (status) {
    params.set("status", status);
  }

  const { data, error, isLoading } = useSWR<Proposal[]>(
    `/api/proposals?${params}`,
    fetcher
  );

  return {
    proposals: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate(`/api/proposals?${params}`),
  };
}

export function useProposal(id?: string) {
  const { data, error, isLoading } = useSWR<Proposal>(
    id ? `/api/proposals/${id}` : null,
    fetcher
  );

  return {
    proposal: data,
    isLoading,
    isError: error,
    refresh: () => id && mutate(`/api/proposals/${id}`),
  };
}

// ============================================
// Dashboard Stats Hook
// ============================================

interface DashboardStats {
  ideasInProgress: number;
  draftProposals: number;
  savedInspirations: number;
  publishedProposals: number;
}

export function useDashboardStats() {
  const { data, error, isLoading } = useSWR<DashboardStats>(
    "/api/dashboard/stats",
    fetcher
  );

  return {
    stats: data || {
      ideasInProgress: 0,
      draftProposals: 0,
      savedInspirations: 0,
      publishedProposals: 0,
    },
    isLoading,
    isError: error,
  };
}

// ============================================
// Activity Hook
// ============================================

interface ActivityItem {
  id: string;
  type: "inspiration" | "idea" | "proposal";
  title: string;
  time: string;
}

export function useRecentActivity() {
  const { data, error, isLoading } = useSWR<ActivityItem[]>(
    "/api/activity/recent",
    fetcher
  );

  return {
    activities: data || [],
    isLoading,
    isError: error,
  };
}

// ============================================
// Mutation helpers
// ============================================

export function invalidateCache(key: string | string[]) {
  if (Array.isArray(key)) {
    key.forEach((k) => mutate(k));
  } else {
    mutate(key);
  }
}

export function invalidateAllCache() {
  mutate(() => true, undefined, { revalidate: false });
}
