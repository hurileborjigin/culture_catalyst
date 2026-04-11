// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  interests: string[];
  professionalBackground?: string;
  organization?: string;
  workplace?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Extended User Profile for AI processing
export interface UserProfile {
  name: string;
  interests: string[];
  professionalBackground?: string;
  organization?: string;
  workplace?: string;
  location?: string;
  skills?: string[];
}

// Inspiration Types
export interface InspirationCard {
  id: string;
  title: string;
  summary: string;
  category: string;
  imageUrl?: string;
  relevanceExplanation: string;
  successHighlights: string[];
  sourceUrl?: string;
  location?: string;
  tags: string[];
  saved?: boolean;
}

// Inspiration Session for batch generation (20 cards, show 4 at a time)
export interface InspirationSession {
  id: string;
  userId: string;
  cards: InspirationCard[];
  currentIndex: number; // Which set of 4 we're showing (0, 4, 8, 12, 16)
  createdAt: Date;
}

// Research Types for Idea Development
export interface ResearchTopic {
  aspect: string;
  description: string;
  searchQueries: string[];
}

export interface ResearchSource {
  title: string;
  url: string;
  content: string;
  relevantQuote?: string;
}

export interface ResearchSection {
  aspect: string;
  title: string;
  content: string;
  keyInsights: string[];
  actionItems: string[];
  sources: ResearchSource[];
}

export interface IdeaResearch {
  id: string;
  ideaId: string;
  sections: ResearchSection[];
  summary: string;
  createdAt: Date;
}

// Proposal Generation Types
export interface GeneratedProposal {
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
}

export interface ProposalRequirements {
  hasVenue?: boolean;
  hasFunding?: boolean;
  hasTeam?: boolean;
  budget?: string;
  timeline?: string;
  additionalNotes?: string;
}

// Idea Development Types
export interface IdeaConcept {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "in-development" | "ready-for-proposal" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanningWorkflow {
  id: string;
  ideaId: string;
  steps: WorkflowStep[];
  estimatedBudget?: BudgetEstimate;
  legalGuidance?: LegalGuidance;
  logisticsPlan?: LogisticsPlan;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  dependencies: string[];
  estimatedDuration?: string;
}

export interface BudgetEstimate {
  total: number;
  currency: string;
  breakdown: BudgetItem[];
  confidenceLevel: "low" | "medium" | "high";
}

export interface BudgetItem {
  category: string;
  description: string;
  estimatedCost: number;
  notes?: string;
}

export interface LegalGuidance {
  permits: string[];
  regulations: string[];
  insuranceRequirements: string[];
  accessibilityStandards: string[];
}

export interface LogisticsPlan {
  venueRequirements: string[];
  equipmentNeeds: string[];
  staffingRoles: StaffingRole[];
  timeline: TimelineEvent[];
}

export interface StaffingRole {
  role: string;
  description: string;
  required: boolean;
  estimatedCount: number;
}

export interface TimelineEvent {
  date: string;
  milestone: string;
  description: string;
}

// Proposal Types
export interface Proposal {
  id: string;
  userId: string;
  ideaId?: string;
  title: string;
  visionStatement: string;
  goals: string[];
  culturalImpact: string;
  timeline: ProposalTimeline;
  budget: BudgetEstimate;
  resources: string[];
  collaboratorsNeeded: CollaboratorNeed[];
  challengesAndRisks: string[];
  nextSteps: string[];
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalTimeline {
  startDate: string;
  endDate: string;
  milestones: TimelineEvent[];
}

export interface CollaboratorNeed {
  skill: string;
  description: string;
  priority: "required" | "preferred" | "nice-to-have";
}

// Published Proposal (global, visible to all users)
export interface PublishedProposal {
  id: string;
  proposalId: string;
  userId: string;
  title: string;
  visionStatement: string | null;
  goals: string[];
  culturalImpact: string | null;
  timeline: GeneratedProposal["timeline"] | null;
  budget: GeneratedProposal["budget"] | null;
  collaboratorsNeeded: GeneratedProposal["collaboratorsNeeded"] | null;
  resources: string[];
  challengesAndMitigation: GeneratedProposal["challengesAndMitigation"] | null;
  nextSteps: string[];
  authorName: string;
  authorOrganization: string | null;
  authorLocation: string | null;
  tags: string[];
  category: string | null;
  publishedAt: Date;
  updatedAt: Date;
}

// Recommendation with relevance score
export interface ProposalRecommendation {
  id: string;
  userId: string;
  publishedProposalId: string;
  relevanceScore: number;
  relevanceReason: string | null;
  createdAt: Date;
  publishedProposal?: PublishedProposal;
}

// API Response Types for Backend Integration
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Agent Workflow Types (for backend integration)
export interface AgentTask {
  id: string;
  type: "inspiration" | "planning" | "budget" | "compliance" | "proposal";
  status: "pending" | "running" | "completed" | "failed";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface WorkflowSession {
  id: string;
  userId: string;
  phase: "inspiration" | "development" | "proposal";
  tasks: AgentTask[];
  context: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
