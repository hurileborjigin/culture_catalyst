"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - in production, this would come from your API
const mockIdeas = [
  {
    id: "1",
    title: "Neighborhood Art Walk",
    description:
      "A monthly walking tour showcasing local artists with pop-up galleries in storefronts and public spaces.",
    category: "Visual Arts",
    status: "in-development" as const,
    progress: 65,
    updatedAt: "2 days ago",
    hasWorkflow: true,
    hasBudget: true,
    hasLegal: false,
  },
  {
    id: "2",
    title: "Community Cookbook Project",
    description:
      "Collecting and publishing recipes from diverse community members to celebrate cultural heritage through food.",
    category: "Heritage & Traditions",
    status: "draft" as const,
    progress: 20,
    updatedAt: "1 week ago",
    hasWorkflow: false,
    hasBudget: false,
    hasLegal: false,
  },
  {
    id: "3",
    title: "Youth Music Mentorship",
    description:
      "Pairing young aspiring musicians with local professionals for weekly lessons and ensemble performances.",
    category: "Performing Arts",
    status: "ready-for-proposal" as const,
    progress: 100,
    updatedAt: "3 days ago",
    hasWorkflow: true,
    hasBudget: true,
    hasLegal: true,
  },
];

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

export default function DevelopPage() {
  const [ideas, setIdeas] = useState(mockIdeas);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setIdeas(ideas.filter((idea) => idea.id !== id));
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

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
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
  idea: (typeof mockIdeas)[0];
  onDelete: (id: string) => void;
}

function IdeaCard({ idea, onDelete }: IdeaCardProps) {
  const status = statusConfig[idea.status];

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
            <span className="text-muted-foreground">{idea.progress}%</span>
          </div>
          <Progress value={idea.progress} className="h-2" />
        </div>

        {/* Development Status */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={idea.hasWorkflow ? "default" : "outline"}
            className="text-xs"
          >
            {idea.hasWorkflow ? "Workflow Ready" : "Needs Workflow"}
          </Badge>
          <Badge
            variant={idea.hasBudget ? "default" : "outline"}
            className="text-xs"
          >
            {idea.hasBudget ? "Budget Set" : "Needs Budget"}
          </Badge>
          <Badge
            variant={idea.hasLegal ? "default" : "outline"}
            className="text-xs"
          >
            {idea.hasLegal ? "Legal Reviewed" : "Needs Review"}
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
          Updated {idea.updatedAt}
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
