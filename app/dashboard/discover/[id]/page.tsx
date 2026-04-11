"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Building,
  User,
  Target,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface PublishedProposal {
  id: string;
  title: string;
  vision_statement: string | null;
  goals: string[];
  cultural_impact: string | null;
  timeline: {
    duration?: string;
    phases?: Array<{ name: string; duration: string; tasks: string[] }>;
  } | null;
  budget: {
    total: string;
    breakdown?: Array<{ category: string; amount: string; description?: string }>;
  } | null;
  collaborators_needed: Array<{
    role: string;
    skills?: string[];
    priority?: string;
    count?: number;
  }> | null;
  resources: string[];
  challenges_and_mitigation: Array<{
    challenge: string;
    mitigation: string;
  }> | null;
  next_steps: string[];
  author_name: string;
  author_organization: string | null;
  author_location: string | null;
  tags: string[];
  category: string | null;
  published_at: string;
}

export default function PublishedProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<PublishedProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await fetch(`/api/published-proposals/${id}`);
        const data = await res.json();
        if (data.success) {
          setProposal(data.proposal);
        }
      } catch (error) {
        console.error("Error fetching published proposal:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Proposal not found.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/discover">Back to Discover</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/dashboard/discover">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Discover
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {proposal.category && (
            <Badge variant="secondary">{proposal.category}</Badge>
          )}
          {proposal.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="font-serif text-3xl font-bold">{proposal.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Published {new Date(proposal.published_at).toLocaleDateString()}
        </p>
      </div>

      {/* Author Card */}
      <Card className="mb-8">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">{proposal.author_name}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {proposal.author_organization && (
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  {proposal.author_organization}
                </span>
              )}
              {proposal.author_location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {proposal.author_location}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* Vision Statement */}
        {proposal.vision_statement && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Target className="h-5 w-5 text-primary" />
              Vision Statement
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {proposal.vision_statement}
            </p>
          </section>
        )}

        {/* Goals */}
        {proposal.goals.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Goals & Objectives</h2>
            <ul className="space-y-2">
              {proposal.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cultural Impact */}
        {proposal.cultural_impact && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Cultural Impact</h2>
            <p className="text-muted-foreground leading-relaxed">
              {proposal.cultural_impact}
            </p>
          </section>
        )}

        {/* Timeline */}
        {proposal.timeline?.phases && proposal.timeline.phases.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Clock className="h-5 w-5 text-primary" />
              Timeline
              {proposal.timeline.duration && (
                <Badge variant="outline">{proposal.timeline.duration}</Badge>
              )}
            </h2>
            <div className="space-y-4">
              {proposal.timeline.phases.map((phase, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      {phase.name}
                      <Badge variant="secondary">{phase.duration}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {phase.tasks.map((task, j) => (
                        <li key={j}>{task}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Budget */}
        {proposal.budget && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <DollarSign className="h-5 w-5 text-primary" />
              Budget
              <Badge variant="outline">{proposal.budget.total}</Badge>
            </h2>
            {proposal.budget.breakdown && proposal.budget.breakdown.length > 0 && (
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium">Category</th>
                      <th className="px-4 py-2 text-left font-medium">Amount</th>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.budget.breakdown.map((item, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-2">{item.category}</td>
                        <td className="px-4 py-2 font-medium">{item.amount}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Collaborators Needed */}
        {proposal.collaborators_needed && proposal.collaborators_needed.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-primary" />
              Collaborators Needed
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {proposal.collaborators_needed.map((collab, i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{collab.role}</span>
                      {collab.priority && (
                        <Badge
                          variant={
                            collab.priority === "required"
                              ? "default"
                              : collab.priority === "preferred"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {collab.priority}
                        </Badge>
                      )}
                    </div>
                    {collab.skills && collab.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {collab.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Challenges & Mitigation */}
        {proposal.challenges_and_mitigation && proposal.challenges_and_mitigation.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Challenges & Mitigation
            </h2>
            <div className="space-y-3">
              {proposal.challenges_and_mitigation.map((item, i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <p className="font-medium text-sm">{item.challenge}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.mitigation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Next Steps */}
        {proposal.next_steps.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Next Steps</h2>
            <ol className="list-decimal pl-5 space-y-1">
              {proposal.next_steps.map((step, i) => (
                <li key={i} className="text-muted-foreground">{step}</li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
