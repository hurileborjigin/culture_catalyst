"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Lightbulb,
  FileText,
  Globe,
  ArrowRight,
  Clock,
  TrendingUp,
  Loader2,
  Users,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  updated_at: string;
  idea_research?: Array<{ id: string; summary?: string | null }>;
  checklist?: Array<{ text: string; completed: boolean }>;
}

interface Proposal {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

interface Recommendation {
  publishedProposalId: string;
  relevanceScore: number;
  relevanceReason: { reason: string } | string | null;
  publishedProposal: {
    id: string;
    title: string;
    category: string | null;
    author_name: string;
    author_organization: string | null;
    vision_statement: string | null;
  } | null;
}

interface ActivityItem {
  id: string;
  type: "idea" | "proposal";
  title: string;
  time: string;
  link: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [collabCount, setCollabCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [ideasRes, proposalsRes, recsRes, collabRes, pubRes] =
          await Promise.all([
            fetch("/api/ideas").then((r) => r.json()).catch(() => ({ ideas: [] })),
            fetch("/api/proposals").then((r) => r.json()).catch(() => ({ proposals: [] })),
            fetch("/api/recommendations/proposals").then((r) => r.json()).catch(() => ({ recommendations: [] })),
            fetch("/api/collaboration-requests?type=incoming").then((r) => r.json()).catch(() => ({ requests: [] })),
            fetch("/api/published-proposals?pageSize=1").then((r) => r.json()).catch(() => ({ total: 0 })),
          ]);

        setIdeas(ideasRes.success ? ideasRes.ideas : []);
        setProposals(proposalsRes.success ? proposalsRes.proposals : []);
        setRecommendations(recsRes.success ? recsRes.recommendations?.slice(0, 3) || [] : []);
        setCollabCount(collabRes.success ? collabRes.requests?.filter((r: { status: string }) => r.status === "pending").length || 0 : 0);
        setPublishedCount(pubRes.total || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const calculateProgress = (idea: Idea) => {
    if (idea.checklist && idea.checklist.length > 0) {
      return Math.round(
        (idea.checklist.filter((c) => c.completed).length / idea.checklist.length) * 100
      );
    }
    if (idea.status === "draft") return 10;
    if (idea.status === "researching") return 40;
    if (idea.status === "researched") return 65;
    if (idea.status === "proposal_generated") return 90;
    return 10;
  };

  const currentProject = ideas.length > 0 ? ideas[0] : null;
  const draftProposals = proposals.filter((p) => p.status === "draft").length;
  const submittedProposals = proposals.filter((p) => p.status === "submitted").length;

  const recentActivity: ActivityItem[] = [
    ...ideas.slice(0, 3).map((i) => ({
      id: i.id,
      type: "idea" as const,
      title: i.title,
      time: formatRelativeTime(i.updated_at),
      link: `/dashboard/develop/${i.id}`,
    })),
    ...proposals.slice(0, 3).map((p) => ({
      id: p.id,
      type: "proposal" as const,
      title: p.title,
      time: formatRelativeTime(p.updated_at),
      link: `/dashboard/proposals/${p.id}`,
    })),
  ].slice(0, 5);

  const workflowSteps = [
    {
      icon: Sparkles,
      title: "Inspire",
      description: "Discover cultural events and trends tailored to your interests",
      count: null,
      href: "/dashboard/inspiration",
      color: "text-violet-600",
      bg: "bg-violet-100",
    },
    {
      icon: Lightbulb,
      title: "Develop",
      description: "Research your idea and build a checklist of what you need to know",
      count: ideas.length > 0 ? `${ideas.length} idea${ideas.length !== 1 ? "s" : ""}` : null,
      href: "/dashboard/develop",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      icon: FileText,
      title: "Propose",
      description: "Generate polished proposals with AI-powered research and structure",
      count: proposals.length > 0 ? `${proposals.length} proposal${proposals.length !== 1 ? "s" : ""}` : null,
      href: "/dashboard/proposals",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      icon: Globe,
      title: "Collaborate",
      description: "Publish proposals, find collaborators, and join projects that match your skills",
      count: publishedCount > 0 ? `${publishedCount} published` : null,
      href: "/dashboard/discover",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome + Platform Summary */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-bold">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Transform cultural ideas into funded, collaborative projects.
          Discover inspiration, develop your concept, create proposals, and find the right people to bring it to life.
        </p>
      </div>

      {/* Workflow Pipeline */}
      <div className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Your Creative Pipeline
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step, i) => (
            <Link key={step.title} href={step.href} className="group">
              <Card className="relative h-full transition-all hover:shadow-md hover:border-primary/30">
                {i < workflowSteps.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-muted-foreground/40 lg:block" />
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.bg}`}>
                      <step.icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    {step.count && !isLoading && (
                      <Badge variant="secondary" className="text-xs">
                        {step.count}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Ideas in Progress", value: ideas.length, icon: Lightbulb },
          { label: "Draft Proposals", value: draftProposals, icon: FileText },
          { label: "Published", value: submittedProposals, icon: Globe },
          { label: "Pending Requests", value: collabCount, icon: MessageCircle },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <p className="text-xl font-bold">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section: Current Project + Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Current Project */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Current Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : currentProject ? (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{currentProject.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {currentProject.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {currentProject.description}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="text-muted-foreground">
                      {calculateProgress(currentProject)}%
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(currentProject)}
                    className="h-2"
                  />
                </div>
                {currentProject.checklist && currentProject.checklist.length > 0 && (
                  <div className="space-y-1">
                    {currentProject.checklist.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {item.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className={`truncate ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                    {currentProject.checklist.length > 4 && (
                      <p className="text-xs text-muted-foreground pl-6">
                        +{currentProject.checklist.length - 4} more items
                      </p>
                    )}
                  </div>
                )}
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/develop/${currentProject.id}`}>
                    Continue Working
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="py-8 text-center">
                <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No projects yet</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/develop/new">Start a New Idea</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended for You */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Recommended for You
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/discover">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Published proposals that match your interests and skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec) =>
                  rec.publishedProposal ? (
                    <Link
                      key={rec.publishedProposalId || rec.publishedProposal.id}
                      href={`/dashboard/discover/${rec.publishedProposal.id}`}
                      className="block"
                    >
                      <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {rec.publishedProposal.title}
                            </p>
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {rec.relevanceScore}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {rec.publishedProposal.author_name}
                            {rec.publishedProposal.author_organization
                              ? ` · ${rec.publishedProposal.author_organization}`
                              : ""}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {typeof rec.relevanceReason === "object" && rec.relevanceReason
                              ? rec.relevanceReason.reason
                              : rec.relevanceReason || ""}
                          </p>
                        </div>
                        {rec.publishedProposal.category && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {rec.publishedProposal.category}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ) : null
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No recommendations yet
                </p>
                <Button variant="outline" asChild className="mt-4">
                  <Link href="/dashboard/discover">Browse Proposals</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {!isLoading && recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {recentActivity.map((activity) => (
                <Link
                  key={`${activity.type}-${activity.id}`}
                  href={activity.link}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  {activity.type === "idea" ? (
                    <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="truncate max-w-[200px]">{activity.title}</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
