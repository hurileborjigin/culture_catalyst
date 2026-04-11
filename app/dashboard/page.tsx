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
  ArrowRight,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  updated_at: string;
  idea_research?: Array<{ id: string }>;
}

interface Proposal {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

interface Stats {
  ideasCount: number;
  proposalsCount: number;
  inspirationsCount: number;
}

interface ActivityItem {
  id: string;
  type: "inspiration" | "idea" | "proposal";
  title: string;
  time: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ ideasCount: 0, proposalsCount: 0, inspirationsCount: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [currentProject, setCurrentProject] = useState<Idea | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch ideas
        const ideasRes = await fetch("/api/ideas");
        const ideasData = await ideasRes.json();
        const ideas: Idea[] = ideasData.success ? ideasData.ideas : [];

        // Fetch proposals
        const proposalsRes = await fetch("/api/proposals");
        const proposalsData = await proposalsRes.json();
        const proposals: Proposal[] = proposalsData.success ? proposalsData.proposals : [];

        // Calculate stats
        setStats({
          ideasCount: ideas.filter((i) => i.status !== "completed").length,
          proposalsCount: proposals.filter((p) => p.status === "draft").length,
          inspirationsCount: 0, // TODO: Add saved inspirations API
        });

        // Build recent activity from ideas and proposals
        const activity: ActivityItem[] = [];
        
        ideas.slice(0, 3).forEach((idea) => {
          activity.push({
            id: idea.id,
            type: "idea",
            title: idea.title,
            time: formatRelativeTime(idea.updated_at),
          });
        });

        proposals.slice(0, 3).forEach((proposal) => {
          activity.push({
            id: proposal.id,
            type: "proposal",
            title: proposal.title,
            time: formatRelativeTime(proposal.updated_at),
          });
        });

        // Sort by time and take top 5
        setRecentActivity(activity.slice(0, 5));

        // Set current project as most recent in-development idea
        const inDevelopment = ideas.find((i) => i.status === "in-development");
        if (inDevelopment) {
          setCurrentProject(inDevelopment);
        } else if (ideas.length > 0) {
          setCurrentProject(ideas[0]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const calculateProgress = (idea: Idea) => {
    // Base progress on status and research
    let progress = 0;
    if (idea.status === "draft") progress = 25;
    else if (idea.status === "in-development") progress = 50;
    else if (idea.status === "ready") progress = 75;
    else if (idea.status === "completed") progress = 100;
    
    // Add points for having research
    if (idea.idea_research && idea.idea_research.length > 0) {
      progress = Math.min(progress + 25, 100);
    }
    
    return progress;
  };

  const quickStats = [
    { label: "Ideas in Progress", value: stats.ideasCount, icon: Lightbulb },
    { label: "Draft Proposals", value: stats.proposalsCount, icon: FileText },
    { label: "Saved Inspirations", value: stats.inspirationsCount, icon: Sparkles },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Continue building your cultural projects or discover new inspiration.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Actions */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Phase 1: Inspiration */}
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10" />
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="font-serif">Get Inspired</CardTitle>
            <CardDescription>
              Discover cultural events and trends tailored to your interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/inspiration">
                Explore Inspiration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Phase 2: Develop */}
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10" />
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="font-serif">Develop Ideas</CardTitle>
            <CardDescription>
              Transform your concepts into structured, feasible plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/develop">
                Start Developing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Phase 3: Proposals */}
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10" />
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="font-serif">Create Proposals</CardTitle>
            <CardDescription>
              Generate polished proposals ready for publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/proposals">
                View Proposals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Project Progress */}
        <Card>
          <CardHeader>
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
                    <Badge variant="secondary">
                      {currentProject.status.replace("-", " ")}
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
                  <Progress value={calculateProgress(currentProject)} className="h-2" />
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/develop/${currentProject.id}`}>
                    Continue Working
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {activity.type === "inspiration" && (
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                      )}
                      {activity.type === "idea" && (
                        <Lightbulb className="h-4 w-4 text-muted-foreground" />
                      )}
                      {activity.type === "proposal" && (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
