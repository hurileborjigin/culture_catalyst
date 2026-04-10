"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  FileText,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

function NewProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ideaId = searchParams.get("idea");

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    visionStatement: "",
    goals: "",
    culturalImpact: "",
    timeline: "",
    budget: "",
    resources: "",
    collaborators: "",
    challenges: "",
    nextSteps: "",
  });

  const handleGenerateFromIdea = async () => {
    if (!ideaId) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    const steps = [
      { progress: 15, step: "Analyzing idea and development data..." },
      { progress: 30, step: "Researching best practices..." },
      { progress: 45, step: "Generating vision statement..." },
      { progress: 60, step: "Creating goals and impact analysis..." },
      { progress: 75, step: "Building timeline and budget..." },
      { progress: 90, step: "Finalizing proposal..." },
      { progress: 100, step: "Complete!" },
    ];

    for (const { progress, step } of steps) {
      setGenerationProgress(progress);
      setGenerationStep(step);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // TODO: Replace with actual API call to your AI agent
    // const response = await fetch('/api/agents/generate-proposal', {
    //   method: 'POST',
    //   body: JSON.stringify({ ideaId }),
    // });

    // Mock generated content
    setFormData({
      title: "Neighborhood Art Walk",
      visionStatement:
        "Creating a vibrant monthly celebration of local art that transforms our neighborhood into an open-air gallery, connecting artists with the community and fostering appreciation for creative expression in everyday spaces.",
      goals:
        "1. Showcase work from 15+ local artists\n2. Attract 500+ visitors per event\n3. Generate $5,000+ in direct artist sales\n4. Build lasting partnerships with 10 local businesses\n5. Create a sustainable monthly event model",
      culturalImpact:
        "This initiative will democratize access to art by bringing galleries to the streets, support local artists economically, strengthen community bonds through shared cultural experiences, and revitalize underutilized public spaces with creative energy.",
      timeline:
        "Week 1-2: Secure venues and artist commitments\nWeek 3-4: Finalize route and logistics\nWeek 5-6: Marketing campaign launch\nWeek 7: Final preparations and rehearsal\nWeek 8: Event day",
      budget:
        "$5,500 total:\n- Venue: $1,200\n- Marketing: $800\n- Equipment: $1,500\n- Staffing: $1,200\n- Refreshments: $500\n- Contingency: $300",
      resources:
        "- 5-8 storefronts for art displays\n- 20 display easels\n- Portable lighting kits\n- Sound system for announcements\n- Promotional materials (flyers, banners)\n- Refreshment supplies",
      collaborators:
        "- Event Coordinator (1, required)\n- Route Guides (4, required)\n- Setup Crew (6, required)\n- Security Personnel (2, required)\n- Photographer (1, preferred)\n- Local business partners",
      challenges:
        "- Weather dependency for outdoor portions\n- Coordinating multiple venue schedules\n- Ensuring adequate foot traffic\n- Managing artist expectations for sales\n- Maintaining quality as event scales",
      nextSteps:
        "1. Confirm interest from 3-5 initial artists\n2. Scout and secure primary venue locations\n3. Draft partnership agreements for businesses\n4. Create event branding and marketing materials\n5. Set up volunteer recruitment campaign",
    });

    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/proposals', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to the proposal view page
      router.push("/dashboard/proposals/1");
    } catch (error) {
      console.error("Error creating proposal:", error);
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
          <FileText className="h-8 w-8 text-primary" />
          New Proposal
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create a polished proposal ready for publishing
        </p>
      </div>

      {/* Generate from Idea */}
      {ideaId && !isGenerating && !formData.title && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Generate from Idea #{ideaId}</p>
                <p className="text-sm text-muted-foreground">
                  Auto-fill this proposal using your developed idea
                </p>
              </div>
            </div>
            <Button onClick={handleGenerateFromIdea}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Proposal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">Generating your proposal...</p>
                <p className="text-sm text-muted-foreground">{generationStep}</p>
              </div>
            </div>
            <Progress value={generationProgress} className="mt-4 h-2" />
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
          <CardDescription>
            Fill in the details below or generate them from a developed idea
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="Give your project a compelling name"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={isLoading || isGenerating}
                required
              />
            </div>

            {/* Vision Statement */}
            <div className="space-y-2">
              <Label htmlFor="visionStatement">Vision Statement *</Label>
              <Textarea
                id="visionStatement"
                placeholder="Describe the overall vision and purpose of your project"
                value={formData.visionStatement}
                onChange={(e) =>
                  setFormData({ ...formData, visionStatement: e.target.value })
                }
                disabled={isLoading || isGenerating}
                className="min-h-[100px]"
                required
              />
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <Label htmlFor="goals">Goals & Objectives *</Label>
              <Textarea
                id="goals"
                placeholder="List the specific, measurable goals for this project"
                value={formData.goals}
                onChange={(e) =>
                  setFormData({ ...formData, goals: e.target.value })
                }
                disabled={isLoading || isGenerating}
                className="min-h-[100px]"
                required
              />
            </div>

            {/* Cultural Impact */}
            <div className="space-y-2">
              <Label htmlFor="culturalImpact">Cultural Impact *</Label>
              <Textarea
                id="culturalImpact"
                placeholder="Describe the cultural and community impact this project will have"
                value={formData.culturalImpact}
                onChange={(e) =>
                  setFormData({ ...formData, culturalImpact: e.target.value })
                }
                disabled={isLoading || isGenerating}
                className="min-h-[100px]"
                required
              />
            </div>

            <Separator />

            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline">Proposed Timeline</Label>
              <Textarea
                id="timeline"
                placeholder="Outline the key milestones and dates"
                value={formData.timeline}
                onChange={(e) =>
                  setFormData({ ...formData, timeline: e.target.value })
                }
                disabled={isLoading || isGenerating}
                className="min-h-[100px]"
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Estimated Budget</Label>
              <Textarea
                id="budget"
                placeholder="Provide a budget breakdown"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                disabled={isLoading || isGenerating}
                className="min-h-[100px]"
              />
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <Label htmlFor="resources">Required Resources</Label>
              <Textarea
                id="resources"
                placeholder="List the resources needed"
                value={formData.resources}
                onChange={(e) =>
                  setFormData({ ...formData, resources: e.target.value })
                }
                disabled={isLoading || isGenerating}
                className="min-h-[80px]"
              />
            </div>

            <Separator />

            {/* Collaborators */}
            <div className="space-y-2">
              <Label htmlFor="collaborators">Collaborators Needed</Label>
              <Textarea
                id="collaborators"
                placeholder="Describe the skills and roles you're looking for"
                value={formData.collaborators}
                onChange={(e) =>
                  setFormData({ ...formData, collaborators: e.target.value })
                }
                disabled={isLoading || isGenerating}
                className="min-h-[80px]"
              />
            </div>

            {/* Challenges */}
            <div className="space-y-2">
              <Label htmlFor="challenges">Challenges & Risks</Label>
              <Textarea
                id="challenges"
                placeholder="Identify potential challenges and how you plan to address them"
                value={formData.challenges}
                onChange={(e) =>
                  setFormData({ ...formData, challenges: e.target.value })
                }
                disabled={isLoading || isGenerating}
                className="min-h-[80px]"
              />
            </div>

            {/* Next Steps */}
            <div className="space-y-2">
              <Label htmlFor="nextSteps">Next Steps / Call to Action</Label>
              <Textarea
                id="nextSteps"
                placeholder="What should interested collaborators do next?"
                value={formData.nextSteps}
                onChange={(e) =>
                  setFormData({ ...formData, nextSteps: e.target.value })
                }
                disabled={isLoading || isGenerating}
                className="min-h-[80px]"
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isLoading || isGenerating}
              >
                <Link href="/dashboard/proposals">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  isGenerating ||
                  !formData.title ||
                  !formData.visionStatement
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Create Proposal
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <NewProposalForm />
    </Suspense>
  );
}
