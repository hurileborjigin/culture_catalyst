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
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Proposal {
  id: string;
  title: string;
  vision_statement: string | null;
  status: "draft" | "finalized" | "submitted";
  budget: { total: string } | null;
  collaborators_needed: Array<{ role: string }> | null;
  updated_at: string;
  idea?: {
    category: string;
  } | null;
}

const statusConfig = {
  draft: {
    label: "Draft",
    variant: "outline" as const,
  },
  finalized: {
    label: "Finalized",
    variant: "default" as const,
  },
  submitted: {
    label: "Submitted",
    variant: "secondary" as const,
  },
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/proposals");
        const data = await response.json();
        if (data.success) {
          setProposals(data.proposals);
        }
      } catch (error) {
        console.error("Error fetching proposals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proposal.vision_statement?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const draftProposals = filteredProposals.filter((p) => p.status === "draft");
  const finalizedProposals = filteredProposals.filter(
    (p) => p.status === "finalized" || p.status === "submitted"
  );

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProposals(proposals.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting proposal:", error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await fetch(`/api/proposals/${id}/publish`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setProposals(
          proposals.map((p) =>
            p.id === id ? { ...p, status: "submitted" as const } : p
          )
        );
      }
    } catch (error) {
      console.error("Error publishing proposal:", error);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
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
          <Link href="/dashboard/develop">
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

      {/* Loading State */}
      {isLoading ? (
        <Card className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading proposals...</span>
        </Card>
      ) : (
        /* Tabs */
        <Tabs defaultValue="drafts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="drafts">
              Drafts ({draftProposals.length})
            </TabsTrigger>
            <TabsTrigger value="finalized">
              Finalized ({finalizedProposals.length})
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
                    <Link href="/dashboard/develop">
                      <Plus className="mr-2 h-4 w-4" />
                      Create from Idea
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
                    onPublish={handlePublish}
                    formatTime={formatRelativeTime}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="finalized" className="space-y-6">
            {finalizedProposals.length === 0 ? (
              <Card className="p-12 text-center">
                <Send className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No finalized proposals
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Finalize a draft proposal to share it with the community
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {finalizedProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onDelete={handleDelete}
                    onPublish={handlePublish}
                    formatTime={formatRelativeTime}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface ProposalCardProps {
  proposal: Proposal;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  formatTime: (date: string) => string;
}

function ProposalCard({ proposal, onDelete, onPublish, formatTime }: ProposalCardProps) {
  const status = statusConfig[proposal.status];
  const budget = proposal.budget?.total ? parseFloat(proposal.budget.total.replace(/[^0-9.]/g, "")) : 0;
  const collaboratorsCount = proposal.collaborators_needed?.length || 0;

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
                <DropdownMenuItem onClick={() => onPublish(proposal.id)}>
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
          {proposal.vision_statement || "No vision statement"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {proposal.idea?.category && (
          <Badge variant="secondary" className="text-xs">
            {proposal.idea.category}
          </Badge>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-medium">
            {budget > 0 ? `$${budget.toLocaleString()}` : "TBD"}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Collaborators needed</span>
          <span className="font-medium">{collaboratorsCount}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Updated {formatTime(proposal.updated_at)}
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
