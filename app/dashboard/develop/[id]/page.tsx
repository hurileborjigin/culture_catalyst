"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  Circle,
  DollarSign,
  Scale,
  Calendar,
  Users,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

// Mock data - in production, this would come from your API
const mockIdea = {
  id: "1",
  title: "Neighborhood Art Walk",
  description:
    "A monthly walking tour showcasing local artists with pop-up galleries in storefronts and public spaces. The event will feature live art demonstrations, artist meet-and-greets, and opportunities for community members to purchase original artwork directly from creators.",
  category: "Visual Arts",
  status: "in-development" as const,
  progress: 65,
};

const mockWorkflow = {
  steps: [
    {
      id: "1",
      title: "Idea Validation",
      description: "Gather community feedback and assess interest",
      status: "completed" as const,
      estimatedDuration: "1-2 weeks",
    },
    {
      id: "2",
      title: "Planning & Research",
      description: "Identify venues, artists, and logistics requirements",
      status: "completed" as const,
      estimatedDuration: "2-3 weeks",
    },
    {
      id: "3",
      title: "Resource Gathering",
      description: "Secure funding, partnerships, and materials",
      status: "in-progress" as const,
      estimatedDuration: "3-4 weeks",
    },
    {
      id: "4",
      title: "Team Formation",
      description: "Recruit volunteers and assign responsibilities",
      status: "pending" as const,
      estimatedDuration: "1-2 weeks",
    },
    {
      id: "5",
      title: "Venue & Logistics",
      description: "Finalize locations and coordinate setup",
      status: "pending" as const,
      estimatedDuration: "2-3 weeks",
    },
    {
      id: "6",
      title: "Marketing & Outreach",
      description: "Promote the event and engage community",
      status: "pending" as const,
      estimatedDuration: "3-4 weeks",
    },
    {
      id: "7",
      title: "Execution",
      description: "Run the event and manage on-site operations",
      status: "pending" as const,
      estimatedDuration: "1 day",
    },
  ],
};

const mockBudget = {
  total: 5500,
  currency: "USD",
  confidenceLevel: "medium" as const,
  breakdown: [
    {
      category: "Venue",
      description: "Storefront rental fees and permits",
      estimatedCost: 1200,
    },
    {
      category: "Marketing",
      description: "Flyers, banners, social media ads",
      estimatedCost: 800,
    },
    {
      category: "Equipment",
      description: "Easels, display stands, lighting",
      estimatedCost: 1500,
    },
    {
      category: "Staffing",
      description: "Event coordinator, security",
      estimatedCost: 1200,
    },
    {
      category: "Refreshments",
      description: "Light snacks and beverages",
      estimatedCost: 500,
    },
    {
      category: "Contingency",
      description: "Unexpected expenses buffer",
      estimatedCost: 300,
    },
  ],
};

const mockLegal = {
  permits: [
    "Public gathering permit from city hall",
    "Temporary signage permit",
    "Food handling permit (if serving refreshments)",
  ],
  regulations: [
    "Comply with local noise ordinances",
    "Ensure ADA accessibility at all venues",
    "Follow fire safety capacity limits",
  ],
  insuranceRequirements: [
    "General liability insurance ($1M minimum)",
    "Event cancellation insurance (recommended)",
  ],
  accessibilityStandards: [
    "Wheelchair-accessible routes between venues",
    "Audio descriptions available for visual art",
    "Rest areas with seating every 200 meters",
  ],
};

const mockLogistics = {
  venueRequirements: [
    "5-8 storefronts willing to host art displays",
    "Central meeting point for tour start",
    "Restroom facilities accessible along route",
  ],
  equipmentNeeds: [
    "20 display easels",
    "Portable lighting kits (10)",
    "Sound system for announcements",
    "Folding tables for artist sales",
  ],
  staffingRoles: [
    { role: "Event Coordinator", count: 1, required: true },
    { role: "Route Guides", count: 4, required: true },
    { role: "Setup Crew", count: 6, required: true },
    { role: "Security", count: 2, required: true },
    { role: "Photographer", count: 1, required: false },
  ],
  timeline: [
    { date: "Week 1-2", milestone: "Secure venues and artist commitments" },
    { date: "Week 3-4", milestone: "Finalize route and logistics" },
    { date: "Week 5-6", milestone: "Marketing campaign launch" },
    { date: "Week 7", milestone: "Final preparations and rehearsal" },
    { date: "Week 8", milestone: "Event day" },
  ],
};

export default function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [idea, setIdea] = useState(mockIdea);
  const [workflow, setWorkflow] = useState(mockWorkflow);
  const [budget, setBudget] = useState(mockBudget);
  const [legal, setLegal] = useState(mockLegal);
  const [logistics, setLogistics] = useState(mockLogistics);

  const handleGenerate = async (section: string) => {
    setIsGenerating(section);

    // TODO: Call your AI agent API
    // const response = await fetch(`/api/agents/${section}`, {
    //   method: 'POST',
    //   body: JSON.stringify({ ideaId: id }),
    // });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(null);
  };

  const completedSteps = workflow.steps.filter(
    (s) => s.status === "completed"
  ).length;
  const progress = Math.round((completedSteps / workflow.steps.length) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/develop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ideas
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-bold">{idea.title}</h1>
              <Badge variant="secondary">{idea.status.replace("-", " ")}</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {idea.description}
            </p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/proposals/new?idea=${id}`}>
              Generate Proposal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Development Progress</h3>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-2 h-3" />
          </div>
          <Separator orientation="vertical" className="hidden h-12 sm:block" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{completedSteps}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {workflow.steps.filter((s) => s.status === "in-progress").length}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">
                {workflow.steps.filter((s) => s.status === "pending").length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
        </TabsList>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Project Workflow
                </CardTitle>
                <CardDescription>
                  Step-by-step roadmap for your project
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate("workflow")}
                disabled={isGenerating === "workflow"}
              >
                {isGenerating === "workflow" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {step.status === "completed" ? (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      ) : step.status === "in-progress" ? (
                        <div className="h-6 w-6 rounded-full border-2 border-primary bg-primary/20" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                      {index < workflow.steps.length - 1 && (
                        <div className="mt-1 h-full w-0.5 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{step.title}</h4>
                        <Badge
                          variant={
                            step.status === "completed"
                              ? "default"
                              : step.status === "in-progress"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {step.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Est. duration: {step.estimatedDuration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Budget Estimate
                </CardTitle>
                <CardDescription>
                  Detailed cost breakdown for your project
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate("budget")}
                disabled={isGenerating === "budget"}
              >
                {isGenerating === "budget" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center justify-between rounded-lg bg-primary/10 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Estimated Total
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    ${budget.total.toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={
                    budget.confidenceLevel === "high"
                      ? "default"
                      : budget.confidenceLevel === "medium"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {budget.confidenceLevel} confidence
                </Badge>
              </div>

              <div className="space-y-3">
                {budget.breakdown.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${item.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Legal & Compliance
                </CardTitle>
                <CardDescription>
                  Regulatory requirements and guidelines
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate("legal")}
                disabled={isGenerating === "legal"}
              >
                {isGenerating === "legal" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Required Permits
                </h4>
                <ul className="mt-2 space-y-2">
                  {legal.permits.map((permit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      {permit}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold">Regulations to Follow</h4>
                <ul className="mt-2 space-y-2">
                  {legal.regulations.map((reg, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      {reg}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold">Insurance Requirements</h4>
                <ul className="mt-2 space-y-2">
                  {legal.insuranceRequirements.map((ins, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      {ins}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold">Accessibility Standards</h4>
                <ul className="mt-2 space-y-2">
                  {legal.accessibilityStandards.map((std, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      {std}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logistics Tab */}
        <TabsContent value="logistics" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Logistics Planning
                </CardTitle>
                <CardDescription>
                  Venue, equipment, and staffing requirements
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate("logistics")}
                disabled={isGenerating === "logistics"}
              >
                {isGenerating === "logistics" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold">Venue Requirements</h4>
                  <ul className="mt-2 space-y-2">
                    {logistics.venueRequirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Equipment Needs</h4>
                  <ul className="mt-2 space-y-2">
                    {logistics.equipmentNeeds.map((equip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        {equip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold">Staffing Roles</h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {logistics.staffingRoles.map((role, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{role.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {role.required ? "Required" : "Optional"}
                        </p>
                      </div>
                      <Badge variant="secondary">{role.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold">Timeline</h4>
                <div className="mt-3 space-y-3">
                  {logistics.timeline.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <Badge variant="outline" className="w-20 justify-center">
                        {item.date}
                      </Badge>
                      <p className="text-sm">{item.milestone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
