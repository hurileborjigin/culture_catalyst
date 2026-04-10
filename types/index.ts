// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  interests: string[];
  professionalBackground?: string;
  createdAt: Date;
  updatedAt: Date;
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
