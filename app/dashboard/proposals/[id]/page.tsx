"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

// Mock data - in production, this would come from your API
const mockProposal = {
  id: "1",
  title: "Neighborhood Art Walk",
  visionStatement:
    "Creating a vibrant monthly celebration of local art that transforms our neighborhood into an open-air gallery, connecting artists with the community and fostering appreciation for creative expression in everyday spaces.",
  status: "draft" as const,
  category: "Visual Arts",
  goals: [
    "Showcase work from 15+ local artists",
    "Attract 500+ visitors per event",
    "Generate $5,000+ in direct artist sales",
    "Build lasting partnerships with 10 local businesses",
    "Create a sustainable monthly event model",
  ],
  culturalImpact:
    "This initiative will democratize access to art by bringing galleries to the streets, support local artists economically, strengthen community bonds through shared cultural experiences, and revitalize underutilized public spaces with creative energy.",
  timeline: {
    startDate: "April 2026",
    endDate: "May 2026",
    milestones: [
      { date: "Week 1-2", milestone: "Secure venues and artist commitments" },
      { date: "Week 3-4", milestone: "Finalize route and logistics" },
      { date: "Week 5-6", milestone: "Marketing campaign launch" },
      { date: "Week 7", milestone: "Final preparations and rehearsal" },
      { date: "Week 8", milestone: "Event day" },
    ],
  },
  budget: {
    total: 5500,
    breakdown: [
      { category: "Venue", amount: 1200 },
      { category: "Marketing", amount: 800 },
      { category: "Equipment", amount: 1500 },
      { category: "Staffing", amount: 1200 },
      { category: "Refreshments", amount: 500 },
      { category: "Contingency", amount: 300 },
    ],
  },
  resources: [
    "5-8 storefronts for art displays",
    "20 display easels",
    "Portable lighting kits",
    "Sound system for announcements",
    "Promotional materials (flyers, banners)",
    "Refreshment supplies",
  ],
  collaboratorsNeeded: [
    { skill: "Event Coordinator", priority: "required" as const },
    { skill: "Route Guides", priority: "required" as const },
    { skill: "Setup Crew", priority: "required" as const },
    { skill: "Security Personnel", priority: "required" as const },
    { skill: "Photographer", priority: "preferred" as const },
    { skill: "Local business partners", priority: "preferred" as const },
  ],
  challengesAndRisks: [
    "Weather dependency for outdoor portions",
    "Coordinating multiple venue schedules",
    "Ensuring adequate foot traffic",
    "Managing artist expectations for sales",
    "Maintaining quality as event scales",
  ],
  nextSteps: [
    "Confirm interest from 3-5 initial artists",
    "Scout and secure primary venue locations",
    "Draft partnership agreements for businesses",
    "Create event branding and marketing materials",
    "Set up volunteer recruitment campaign",
  ],
  createdAt: "2 days ago",
  updatedAt: "2 hours ago",
};

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isPublishing, setIsPublishing] = useState(false);
  const [proposal] = useState(mockProposal);

  const handlePublish = async () => {
    setIsPublishing(true);

    // TODO: Replace with actual API call
    // const response = await fetch(`/api/proposals/${id}/publish`, {
    //   method: 'POST',
    // });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPublishing(false);
    // Show success message or redirect
  };

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
                  proposal.status === "published" ? "default" : "outline"
                }
              >
                {proposal.status}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Created {proposal.createdAt}</span>
              <span>Updated {proposal.updatedAt}</span>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Vision Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{proposal.visionStatement}</p>
          </CardContent>
        </Card>

        {/* Goals */}
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

        {/* Cultural Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Cultural Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{proposal.culturalImpact}</p>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Timeline
            </CardTitle>
            <CardDescription>
              {proposal.timeline.startDate} - {proposal.timeline.endDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposal.timeline.milestones.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <Badge variant="outline" className="w-24 justify-center">
                    {item.date}
                  </Badge>
                  <div className="flex-1">
                    <p>{item.milestone}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Budget
            </CardTitle>
            <CardDescription>
              Total estimated: ${proposal.budget.total.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proposal.budget.breakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <span>{item.category}</span>
                  <span className="font-medium">
                    ${item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
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

        {/* Collaborators Needed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Collaborators Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {proposal.collaboratorsNeeded.map((collab, index) => (
                <Badge
                  key={index}
                  variant={
                    collab.priority === "required" ? "default" : "secondary"
                  }
                >
                  {collab.skill}
                  {collab.priority === "required" && " *"}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              * Required roles
            </p>
          </CardContent>
        </Card>

        {/* Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Challenges & Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {proposal.challengesAndRisks.map((challenge, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-inside list-decimal space-y-2">
              {proposal.nextSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>

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
