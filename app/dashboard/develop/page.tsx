"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Lightbulb,
  Plus,
  Search,
  Clock,
  ArrowRight,
  MoreVertical,
  Trash2,
  Edit,
  Archive,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "in-development" | "ready-for-proposal" | "archived";
  created_at: string;
  updated_at: string;
  idea_research?: Array<{ id: string }>;
}

const statusConfig = {
  draft: {
    label: "Draft",
    variant: "outline" as const,
  },
  "in-development": {
    label: "In Development",
    variant: "secondary" as const,
  },
  "ready-for-proposal": {
    label: "Ready for Proposal",
    variant: "default" as const,
  },
  archived: {
    label: "Archived",
    variant: "outline" as const,
  },
};

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

function calculateProgress(idea: Idea): number {
  let progress = 20; // Base progress for creating an idea
  if (idea.description && idea.description.length > 100) progress += 20;
  if (idea.idea_research && idea.idea_research.length > 0) progress += 40;
  if (idea.status === "ready-for-proposal") progress = 100;
  return Math.min(progress, 100);
}

export default function DevelopPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch("/api/ideas");
        const data = await response.json();
        if (data.success && data.ideas) {
          setIdeas(data.ideas);
        }
      } catch (error) {
        console.error("Failed to fetch ideas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setIdeas(ideas.filter((idea) => idea.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete idea:", error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
            <Lightbulb className="h-8 w-8 text-primary" />
            Develop Ideas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Transform your concepts into structured, feasible plans
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/develop/new">
            <Plus className="mr-2 h-4 w-4" />
            New Idea
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading ideas...</span>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <Card className="p-12 text-center">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No ideas yet</h3>
          <p className="mt-2 text-muted-foreground">
            Start by creating a new idea or getting inspiration
          </p>
          <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/dashboard/develop/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Idea
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/inspiration">Browse Inspiration</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

interface IdeaCardProps {
  idea: Idea;
  onDelete: (id: string) => void;
}

function IdeaCard({ idea, onDelete }: IdeaCardProps) {
  const status = statusConfig[idea.status] || statusConfig.draft;
  const progress = calculateProgress(idea);
  const hasResearch = idea.idea_research && idea.idea_research.length > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/develop/${idea.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(idea.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="line-clamp-1 font-serif text-lg">
          {idea.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {idea.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Development Progress</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Development Status */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={hasResearch ? "default" : "outline"}
            className="text-xs"
          >
            {hasResearch ? "Research Done" : "Needs Research"}
          </Badge>
          <Badge
            variant={idea.status === "ready-for-proposal" ? "default" : "outline"}
            className="text-xs"
          >
            {idea.status === "ready-for-proposal" ? "Ready" : "In Progress"}
          </Badge>
        </div>

        {/* Category */}
        <Badge variant="secondary" className="text-xs">
          {idea.category}
        </Badge>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {getRelativeTime(idea.updated_at)}
        </div>
        <Button size="sm" asChild>
          <Link href={`/dashboard/develop/${idea.id}`}>
            Continue
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
