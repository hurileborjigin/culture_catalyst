"use client";

import { useState, Suspense, useEffect } from "react";
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
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { GeneratedProposal, ProposalRequirements, UserProfile } from "@/types";

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
}

function NewProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const ideaId = searchParams.get("idea");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingIdea, setIsLoadingIdea] = useState(false);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposal | null>(null);
  
  // Requirements form
  const [requirements, setRequirements] = useState<ProposalRequirements>({
    hasVenue: false,
    hasFunding: false,
    hasTeam: false,
    budget: "",
    timeline: "",
    additionalNotes: "",
  });

  // Fetch idea data on mount
  useEffect(() => {
    if (!ideaId) return;
    
    const fetchIdea = async () => {
      setIsLoadingIdea(true);
      try {
        const response = await fetch(`/api/ideas/${ideaId}`);
        const data = await response.json();
        if (data.success && data.idea) {
          setIdea(data.idea);
        } else {
          setError("Failed to load idea");
        }
      } catch (err) {
        console.error("Failed to fetch idea:", err);
        setError("Failed to load idea");
      } finally {
        setIsLoadingIdea(false);
      }
    };
    fetchIdea();
  }, [ideaId]);

  // Get user profile
  const getUserProfile = (): UserProfile => {
    if (user) {
      return {
        name: user.name,
        interests: user.interests || [],
        professionalBackground: user.professionalBackground,
        organization: user.organization,
        location: user.location,
      };
    }
    return {
      name: "Demo User",
      interests: ["Visual Arts", "Community Events"],
      professionalBackground: "Event Organizer",
      organization: "Community Arts Council",
    };
  };

  // Generate proposal from AI
  const handleGenerateProposal = async () => {
    if (!ideaId || !idea) return;

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    const steps = [
      { progress: 15, step: "Analyzing idea and research data..." },
      { progress: 30, step: "Incorporating your requirements..." },
      { progress: 45, step: "Generating vision and goals..." },
      { progress: 60, step: "Creating timeline and budget..." },
      { progress: 75, step: "Identifying collaborators needed..." },
      { progress: 90, step: "Finalizing proposal..." },
    ];

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        const currentStep = steps.find((s) => s.progress > prev);
        if (currentStep) {
          setGenerationStep(currentStep.step);
          return currentStep.progress;
        }
        return prev;
      });
    }, 2000);

    try {
      const response = await fetch(`/api/proposals/${ideaId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea,
          userProfile: getUserProfile(),
          requirements,
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGenerationStep("Complete!");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to generate proposal");
      }

      setGeneratedProposal(data.proposal);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate proposal");
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleSaveProposal = async (status: "draft" | "published") => {
    if (!generatedProposal || !ideaId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedProposal.title,
          ideaId: ideaId,
          status: status,
          content: generatedProposal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save proposal');
      }

      router.push(`/dashboard/proposals/${data.proposal.id}`);
    } catch (err) {
      console.error("Error saving proposal:", err);
      setError(err instanceof Error ? err.message : 'Failed to save proposal');
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

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Idea */}
      {ideaId && isLoadingIdea && (
        <Card className="mb-6">
          <CardContent className="flex items-center justify-center gap-3 p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading idea details...</span>
          </CardContent>
        </Card>
      )}

      {/* Idea Details */}
      {ideaId && idea && !isLoadingIdea && (
        <Card className="mb-6 bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">{idea.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{idea.description}</p>
                <Badge variant="secondary" className="mt-2">{idea.category}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Form (Step 1) */}
      {ideaId && idea && !generatedProposal && !isGenerating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Your Current Resources
            </CardTitle>
            <CardDescription>
              Tell us what you already have - this helps us create a more tailored proposal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={requirements.hasVenue}
                  onChange={(e) =>
                    setRequirements({ ...requirements, hasVenue: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <p className="font-medium">Have Venue</p>
                  <p className="text-xs text-muted-foreground">Venue secured</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={requirements.hasFunding}
                  onChange={(e) =>
                    setRequirements({ ...requirements, hasFunding: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <p className="font-medium">Have Funding</p>
                  <p className="text-xs text-muted-foreground">Budget available</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={requirements.hasTeam}
                  onChange={(e) =>
                    setRequirements({ ...requirements, hasTeam: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <p className="font-medium">Have Team</p>
                  <p className="text-xs text-muted-foreground">Core team ready</p>
                </div>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Constraints</Label>
                <Input
                  id="budget"
                  placeholder="e.g., $5,000 maximum"
                  value={requirements.budget}
                  onChange={(e) =>
                    setRequirements({ ...requirements, budget: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline Constraints</Label>
                <Input
                  id="timeline"
                  placeholder="e.g., Must launch by June"
                  value={requirements.timeline}
                  onChange={(e) =>
                    setRequirements({ ...requirements, timeline: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any other context that would help create a better proposal..."
                value={requirements.additionalNotes}
                onChange={(e) =>
                  setRequirements({ ...requirements, additionalNotes: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>

            <Button onClick={handleGenerateProposal} className="w-full">
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

      {/* Generated Proposal Display */}
      {generatedProposal && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">AI Generated</Badge>
                <CardTitle>{generatedProposal.title}</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateProposal}
                disabled={isGenerating}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vision */}
            <div>
              <h3 className="mb-2 font-semibold">Vision Statement</h3>
              <p className="text-muted-foreground">{generatedProposal.visionStatement}</p>
            </div>

            <Separator />

            {/* Goals */}
            <div>
              <h3 className="mb-2 font-semibold">Goals</h3>
              <ul className="space-y-2">
                {generatedProposal.goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Cultural Impact */}
            <div>
              <h3 className="mb-2 font-semibold">Cultural Impact</h3>
              <p className="text-muted-foreground">{generatedProposal.culturalImpact}</p>
            </div>

            <Separator />

            {/* Timeline */}
            <div>
              <h3 className="mb-2 font-semibold">Timeline ({generatedProposal.timeline.duration})</h3>
              <div className="space-y-3">
                {generatedProposal.timeline.phases.map((phase, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{phase.name}</p>
                      <Badge variant="outline">{phase.duration}</Badge>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {phase.tasks.map((task, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Budget */}
            <div>
              <h3 className="mb-2 font-semibold">Budget: {generatedProposal.budget.total}</h3>
              <div className="space-y-2">
                {generatedProposal.budget.breakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.category}</span>
                      <span className="ml-2 text-muted-foreground">- {item.description}</span>
                    </div>
                    <span className="font-medium">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Collaborators Needed */}
            <div>
              <h3 className="mb-2 font-semibold">Collaborators Needed</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {generatedProposal.collaboratorsNeeded.map((collab, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{collab.role}</p>
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
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Skills: {collab.skills.join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Count: {collab.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Challenges & Mitigation */}
            <div>
              <h3 className="mb-2 font-semibold">Challenges & Mitigation</h3>
              <div className="space-y-3">
                {generatedProposal.challengesAndMitigation.map((item, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-3">
                    <p className="font-medium text-destructive/80">{item.challenge}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium text-primary">Mitigation:</span> {item.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Next Steps */}
            <div>
              <h3 className="mb-2 font-semibold">Next Steps</h3>
              <ol className="space-y-2">
                {generatedProposal.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => handleSaveProposal("draft")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Save as Draft
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => handleSaveProposal("published")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Publish Proposal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Idea Selected */}
      {!ideaId && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No Idea Selected</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                To generate a proposal, first develop an idea with research, 
                then click Generate Proposal from the idea page.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/develop">
                Go to Develop Ideas
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
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
