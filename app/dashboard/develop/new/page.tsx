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
import { ArrowLeft, Loader2, Sparkles, Lightbulb } from "lucide-react";

const categories = [
  "Visual Arts",
  "Performing Arts",
  "Heritage & Traditions",
  "Environment & Sustainability",
  "Commerce & Culture",
  "Film & Media",
  "Education & Workshops",
  "Community Events",
  "Other",
];

// Sample ideas for quick testing
const sampleIdeas = [
  {
    title: "Neighborhood Art Walk Festival",
    description: "A monthly walking tour showcasing local artists with pop-up galleries in storefronts and public spaces. The event would transform underutilized urban areas into vibrant art corridors, featuring live demonstrations, artist meet-and-greets, and interactive installations. We aim to support 20+ local artists while attracting visitors to local businesses.",
    category: "Visual Arts",
    inspiration: "Inspired by the success of First Friday events in other cities and our community's strong local art scene that lacks visibility.",
  },
  {
    title: "Intergenerational Storytelling Archive",
    description: "A digital and physical archive project collecting oral histories and personal narratives from community elders. Young volunteers will be trained in interview techniques and audio/video production to document stories of immigration, cultural traditions, and neighborhood history before they are lost.",
    category: "Heritage & Traditions",
    inspiration: "Many elderly community members have incredible stories that will be lost if not documented. COVID showed us how quickly we can lose our elders.",
  },
  {
    title: "Urban Garden Music Series",
    description: "Free outdoor concerts in community gardens combining live music performances with workshops on sustainable gardening. Each event features local musicians playing acoustic sets while attendees learn about urban farming, composting, and native plants. Food from the gardens will be incorporated into refreshments.",
    category: "Environment & Sustainability",
    inspiration: "Our community has several underutilized garden spaces and a thriving local music scene - why not combine them?",
  },
];

function NewIdeaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspirationId = searchParams.get("inspiration");

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    inspiration: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/ideas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to the idea development page
      router.push("/dashboard/develop/1");
    } catch (error) {
      console.error("Error creating idea:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleIdea = (index: number) => {
    const sample = sampleIdeas[index];
    setFormData({
      title: sample.title,
      description: sample.description,
      category: sample.category,
      inspiration: sample.inspiration,
    });
  };

  const handleAIAssist = async () => {
    if (!formData.description) return;

    setIsGenerating(true);

    try {
      // TODO: Call AI agent to enhance the idea
      // const response = await fetch('/api/agents/enhance-idea', {
      //   method: 'POST',
      //   body: JSON.stringify({ description: formData.description }),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock AI-enhanced content
      setFormData({
        ...formData,
        title:
          formData.title ||
          "Community Cultural Festival: Celebrating Local Heritage",
        description:
          formData.description +
          "\n\nAI Suggestion: Consider incorporating interactive workshops, local artisan showcases, and intergenerational storytelling sessions to maximize community engagement and cultural preservation impact.",
      });
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/develop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ideas
          </Link>
        </Button>
        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
          <Lightbulb className="h-8 w-8 text-primary" />
          New Idea
        </h1>
        <p className="mt-1 text-muted-foreground">
          Describe your cultural project concept and let our AI help develop it
        </p>
      </div>

      {/* Quick Load Sample Ideas */}
      <Card className="mb-6 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Start - Load Sample Idea</CardTitle>
          <CardDescription className="text-xs">
            Click to pre-fill the form with a sample project for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          {sampleIdeas.map((sample, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadSampleIdea(index)}
              className="text-xs"
            >
              {sample.title.split(" ").slice(0, 3).join(" ")}...
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Inspiration Reference */}
      {inspirationId && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">
                Building from inspiration #{inspirationId}
              </p>
              <p className="text-xs text-muted-foreground">
                Your idea will be linked to this inspiration for reference
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Describe Your Idea</CardTitle>
          <CardDescription>
            Share your vision and our AI agents will help you develop it into a
            structured plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="Give your project a memorable name"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAIAssist}
                  disabled={isGenerating || !formData.description}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  AI Assist
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Describe your cultural project idea. What is it? Who is it for? What impact do you hope to achieve?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={isLoading}
                className="min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground">
                Be as detailed as possible. Our AI will help expand and
                structure your concept.
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                disabled={isLoading}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* What inspired you */}
            <div className="space-y-2">
              <Label htmlFor="inspiration">
                What inspired this idea? (Optional)
              </Label>
              <Textarea
                id="inspiration"
                placeholder="Share any events, experiences, or needs that sparked this idea"
                value={formData.inspiration}
                onChange={(e) =>
                  setFormData({ ...formData, inspiration: e.target.value })
                }
                disabled={isLoading}
                className="min-h-[80px]"
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isLoading}
              >
                <Link href="/dashboard/develop">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading || !formData.title}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create & Develop
                    <Lightbulb className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* AI Assistance Info */}
      <Card className="mt-6 bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold">What happens next?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            After you create your idea, our AI agents will help you:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Build a step-by-step project workflow
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Estimate budget and resource requirements
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Identify legal and regulatory considerations
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Plan logistics and staffing needs
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewIdeaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <NewIdeaForm />
    </Suspense>
  );
}
