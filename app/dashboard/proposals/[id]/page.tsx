"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Send,
  Share2,
  Download,
  Loader2,
  Target,
  Sparkles,
  Calendar,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  vision_statement: string | null;
  status: "draft" | "finalized" | "submitted";
  goals: string[] | null;
  cultural_impact: string | null;
  timeline: {
    duration?: string;
    phases?: Array<{ name: string; duration: string; tasks: string[] }>;
  } | null;
  budget: {
    total: string;
    breakdown?: Array<{ category: string; amount: string; description?: string }>;
  } | null;
  resources: string[] | null;
  collaborators_needed: Array<{ role: string; skills?: string[]; priority?: string; count?: number }> | null;
  challenges_and_mitigation: Array<{ challenge: string; mitigation: string }> | null;
  next_steps: string[] | null;
  created_at: string;
  updated_at: string;
}

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/proposals/${id}`);
        const data = await response.json();
        if (data.success && data.proposal) {
          setProposal(data.proposal);
        } else {
          setError("Proposal not found");
        }
      } catch (err) {
        console.error("Error fetching proposal:", err);
        setError("Failed to load proposal");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  const handlePublish = async () => {
    if (!proposal) return;
    setIsPublishing(true);

    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "finalized" }),
      });

      if (response.ok) {
        setProposal({ ...proposal, status: "finalized" });
      }
    } catch (error) {
      console.error("Error publishing proposal:", error);
    } finally {
      setIsPublishing(false);
    }
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/proposals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Link>
        </Button>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading proposal...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !proposal) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/proposals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Link>
        </Button>
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold">Proposal Not Found</h3>
              <p className="mt-2 text-muted-foreground">
                The proposal you are looking for does not exist or has been deleted.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/proposals">Back to Proposals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const budgetTotal = proposal.budget?.total 
    ? parseFloat(proposal.budget.total.replace(/[^0-9.]/g, "")) 
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/proposals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-bold">{proposal.title}</h1>
              <Badge
                variant={
                  proposal.status === "finalized" ? "default" : "outline"
                }
              >
                {proposal.status}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Created {formatRelativeTime(proposal.created_at)}</span>
              <span>Updated {formatRelativeTime(proposal.updated_at)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/proposals/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            {proposal.status === "draft" && (
              <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Vision Statement */}
        {proposal.vision_statement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Vision Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{proposal.vision_statement}</p>
            </CardContent>
          </Card>
        )}

        {/* Goals */}
        {proposal.goals && proposal.goals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Goals & Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proposal.goals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Cultural Impact */}
        {proposal.cultural_impact && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Cultural Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{proposal.cultural_impact}</p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {proposal.timeline && proposal.timeline.phases && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Timeline
              </CardTitle>
              {proposal.timeline.duration && (
                <CardDescription>
                  Duration: {proposal.timeline.duration}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.timeline.phases.map((phase, index) => (
                  <div key={index} className="flex gap-4">
                    <Badge variant="outline" className="w-24 justify-center">
                      {phase.duration}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{phase.name}</p>
                      {phase.tasks && phase.tasks.length > 0 && (
                        <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                          {phase.tasks.map((task, i) => (
                            <li key={i}>{task}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget */}
        {proposal.budget && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Budget
              </CardTitle>
              <CardDescription>
                Total estimated: ${budgetTotal.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proposal.budget.breakdown && proposal.budget.breakdown.length > 0 && (
                <div className="space-y-3">
                  {proposal.budget.breakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div>
                        <span>{item.category}</span>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <span className="font-medium">{item.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resources */}
        {proposal.resources && proposal.resources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Required Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {proposal.resources.map((resource, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Collaborators Needed */}
        {proposal.collaborators_needed && proposal.collaborators_needed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Collaborators Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {proposal.collaborators_needed.map((collab, index) => (
                  <Badge
                    key={index}
                    variant={
                      collab.priority === "required" ? "default" : "secondary"
                    }
                  >
                    {collab.role}
                    {collab.priority === "required" && " *"}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                * Required roles
              </p>
            </CardContent>
          </Card>
        )}

        {/* Challenges */}
        {proposal.challenges_and_mitigation && proposal.challenges_and_mitigation.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Challenges & Mitigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.challenges_and_mitigation.map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <p className="font-medium text-amber-600">{item.challenge}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Mitigation: {item.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {proposal.next_steps && proposal.next_steps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-inside list-decimal space-y-2">
                {proposal.next_steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        {proposal.status === "draft" && (
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  Ready to share your proposal?
                </h3>
                <p className="mt-1 text-primary-foreground/80">
                  Publish your proposal to start attracting collaborators and
                  making your cultural project a reality.
                </p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-background text-foreground hover:bg-background/90"
              >
                {isPublishing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Publish Proposal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
