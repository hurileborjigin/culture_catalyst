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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Search,
  Clock,
  Eye,
  Edit,
  Send,
  MoreVertical,
  Trash2,
  Copy,
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
const mockProposals = [
  {
    id: "1",
    title: "Neighborhood Art Walk",
    visionStatement:
      "Creating a vibrant monthly celebration of local art that transforms our neighborhood into an open-air gallery.",
    status: "draft" as const,
    category: "Visual Arts",
    updatedAt: "2 hours ago",
    budget: 5500,
    collaboratorsNeeded: 4,
  },
  {
    id: "2",
    title: "Youth Music Mentorship Program",
    visionStatement:
      "Empowering young musicians through one-on-one mentorship with local professionals.",
    status: "published" as const,
    category: "Performing Arts",
    updatedAt: "1 day ago",
    budget: 8200,
    collaboratorsNeeded: 6,
  },
  {
    id: "3",
    title: "Cultural Heritage Day",
    visionStatement:
      "A day-long celebration honoring the diverse cultural traditions of our community.",
    status: "draft" as const,
    category: "Heritage & Traditions",
    updatedAt: "3 days ago",
    budget: 12000,
    collaboratorsNeeded: 10,
  },
];

const statusConfig = {
  draft: {
    label: "Draft",
    variant: "outline" as const,
  },
  published: {
    label: "Published",
    variant: "default" as const,
  },
  archived: {
    label: "Archived",
    variant: "secondary" as const,
  },
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState(mockProposals);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.visionStatement.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const draftProposals = filteredProposals.filter((p) => p.status === "draft");
  const publishedProposals = filteredProposals.filter(
    (p) => p.status === "published"
  );

  const handleDelete = (id: string) => {
    setProposals(proposals.filter((p) => p.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
            <FileText className="h-8 w-8 text-primary" />
            Proposals
          </h1>
          <p className="mt-1 text-muted-foreground">
            Generate and manage polished project proposals
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/proposals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="drafts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="drafts">
            Drafts ({draftProposals.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedProposals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="space-y-6">
          {draftProposals.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No draft proposals</h3>
              <p className="mt-2 text-muted-foreground">
                Create a new proposal or generate one from a developed idea
              </p>
              <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/dashboard/proposals/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Proposal
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/develop">View Ideas</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {draftProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          {publishedProposals.length === 0 ? (
            <Card className="p-12 text-center">
              <Send className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No published proposals
              </h3>
              <p className="mt-2 text-muted-foreground">
                Publish a draft proposal to share it with the community
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publishedProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ProposalCardProps {
  proposal: (typeof mockProposals)[0];
  onDelete: (id: string) => void;
}

function ProposalCard({ proposal, onDelete }: ProposalCardProps) {
  const status = statusConfig[proposal.status];

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
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/proposals/${proposal.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              {proposal.status === "draft" && (
                <DropdownMenuItem>
                  <Send className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(proposal.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="line-clamp-1 font-serif text-lg">
          {proposal.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {proposal.visionStatement}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <Badge variant="secondary" className="text-xs">
          {proposal.category}
        </Badge>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-medium">
            ${proposal.budget.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Collaborators needed</span>
          <span className="font-medium">{proposal.collaboratorsNeeded}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Updated {proposal.updatedAt}
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/proposals/${proposal.id}`}>
            <Eye className="mr-2 h-3 w-3" />
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
