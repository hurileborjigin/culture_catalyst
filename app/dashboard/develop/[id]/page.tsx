"use client";

import { useState, use, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  FileText,
  Search,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { ResearchSection, UserProfile } from "@/types";

// Mock idea data - in production, this would come from your API
const mockIdea = {
  id: "1",
  title: "Neighborhood Art Walk",
  description:
    "A monthly walking tour showcasing local artists with pop-up galleries in storefronts and public spaces. The event will feature live art demonstrations, artist meet-and-greets, and opportunities for community members to purchase original artwork directly from creators.",
  category: "Visual Arts",
  status: "in-development" as const,
};

export default function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [idea] = useState(mockIdea);
  const [isResearching, setIsResearching] = useState(false);
  const [research, setResearch] = useState<{
    sections: ResearchSection[];
    summary: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [researchProgress, setResearchProgress] = useState(0);
  const [researchStep, setResearchStep] = useState("");

  // Get user profile for API calls
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
      location: "New York, USA",
    };
  };

  // Check for existing research on mount
  useEffect(() => {
    const fetchExistingResearch = async () => {
      try {
        const response = await fetch(`/api/ideas/${id}/analyze`);
        const data = await response.json();
        if (data.success && data.research) {
          setResearch(data.research);
        }
      } catch (err) {
        console.error("Failed to fetch existing research:", err);
      }
    };
    fetchExistingResearch();
  }, [id]);

  // Perform research
  const handleResearch = async (forceRefresh = false) => {
    setIsResearching(true);
    setError(null);
    setResearchProgress(0);

    const steps = [
      { progress: 10, step: "Analyzing your idea..." },
      { progress: 25, step: "Generating research topics..." },
      { progress: 40, step: "Searching for case studies..." },
      { progress: 55, step: "Researching venues & logistics..." },
      { progress: 70, step: "Finding legal requirements..." },
      { progress: 85, step: "Compiling budget insights..." },
      { progress: 95, step: "Synthesizing recommendations..." },
    ];

    // Simulate progress while API processes
    const progressInterval = setInterval(() => {
      setResearchProgress((prev) => {
        const currentStep = steps.find((s) => s.progress > prev);
        if (currentStep) {
          setResearchStep(currentStep.step);
          return currentStep.progress;
        }
        return prev;
      });
    }, 3000);

    try {
      const response = await fetch(`/api/ideas/${id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: {
            title: idea.title,
            description: idea.description,
            category: idea.category,
          },
          userProfile: getUserProfile(),
          forceRefresh,
        }),
      });

      clearInterval(progressInterval);
      setResearchProgress(100);
      setResearchStep("Complete!");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to generate research");
      }

      setResearch(data.research);
    } catch (err) {
      console.error("Research error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate research");
    } finally {
      clearInterval(progressInterval);
      setIsResearching(false);
      setResearchProgress(0);
    }
  };

  const completedSections = research?.sections?.length || 0;

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
          <Button asChild disabled={!research}>
            <Link href={`/dashboard/proposals/new?idea=${id}`}>
              Generate Proposal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Research Error</p>
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

      {/* Research Progress */}
      {isResearching && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">Researching your idea...</p>
                <p className="text-sm text-muted-foreground">{researchStep}</p>
              </div>
            </div>
            <Progress value={researchProgress} className="mt-4 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              This may take 1-2 minutes as we search and analyze multiple sources...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State - No Research Yet */}
      {!research && !isResearching && (
        <Card className="mb-6 border-dashed">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Research Your Idea</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Get comprehensive research on how to make your idea a reality. 
                We will search for case studies, venue requirements, legal considerations, 
                budget guidelines, and more - all with cited sources.
              </p>
            </div>
            <Button onClick={() => handleResearch()} size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Research
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Research Results */}
      {research && (
        <>
          {/* Progress Overview */}
          <Card className="mb-8">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Research Complete</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResearch(true)}
                    disabled={isResearching}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Research
                  </Button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {research.summary}
                </p>
              </div>
              <Separator orientation="vertical" className="hidden h-16 sm:block" />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{completedSections}</p>
                  <p className="text-xs text-muted-foreground">Research Sections</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {research.sections.reduce((acc, s) => acc + s.sources.length, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Sources Cited</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Research Sections */}
          <div className="space-y-6">
            {research.sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {section.aspect}
                      </Badge>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {section.title}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {section.sources.length} sources
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Content */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>

                  <Separator />

                  {/* Key Insights */}
                  {section.keyInsights && section.keyInsights.length > 0 && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Key Insights
                      </h4>
                      <ul className="space-y-2">
                        {section.keyInsights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Items */}
                  {section.actionItems && section.actionItems.length > 0 && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        Action Items
                      </h4>
                      <ul className="space-y-2">
                        {section.actionItems.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {i + 1}
                            </span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  {/* Sources */}
                  {section.sources && section.sources.length > 0 && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <FileText className="h-4 w-4 text-primary" />
                        Sources
                      </h4>
                      <div className="space-y-3">
                        {section.sources.map((source, i) => (
                          <div
                            key={i}
                            className="rounded-lg border bg-muted/30 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-primary hover:underline"
                              >
                                {source.title}
                              </a>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0"
                              >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              </a>
                            </div>
                            {source.relevantQuote && (
                              <p className="mt-2 text-sm italic text-muted-foreground">
                                &quot;{source.relevantQuote}&quot;
                              </p>
                            )}
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {source.url}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Next Steps CTA */}
          <Card className="mt-8 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Ready to Create Your Proposal?</h3>
                <p className="mt-1 text-muted-foreground">
                  Use this research to generate a comprehensive project proposal 
                  that you can share with stakeholders and collaborators.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href={`/dashboard/proposals/new?idea=${id}`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Proposal
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
