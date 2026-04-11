"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  Globe,
  Sparkles,
  RefreshCw,
  Eye,
  MapPin,
  Users,
  DollarSign,
  Loader2,
  CheckCircle,
  Briefcase,
} from "lucide-react";

interface PublishedProposal {
  id: string;
  title: string;
  vision_statement: string | null;
  goals: string[];
  budget: { total: string } | null;
  collaborators_needed: Array<{ role: string }> | null;
  author_name: string;
  author_organization: string | null;
  author_location: string | null;
  tags: string[];
  category: string | null;
  published_at: string;
}

interface RelevanceReason {
  reason: string;
  matchingInterests: string[];
  matchingSkills: string[];
  rolesYouCouldFill: string[];
}

interface Recommendation {
  publishedProposalId: string;
  relevanceScore: number;
  relevanceReason: RelevanceReason | null;
  publishedProposal: PublishedProposal | null;
}

const CATEGORIES = [
  "All",
  "Visual Arts",
  "Performing Arts",
  "Music",
  "Heritage & Traditions",
  "Environment & Sustainability",
  "Commerce & Culture",
  "Film & Media",
  "Community Events",
  "Education & Workshops",
  "Food & Culinary",
];

export default function DiscoverPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [published, setPublished] = useState<PublishedProposal[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [isLoadingBrowse, setIsLoadingBrowse] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchRecommendations();
    fetchPublished();
  }, []);

  useEffect(() => {
    fetchPublished();
  }, [selectedCategory]);

  const fetchRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const res = await fetch("/api/recommendations/proposals");
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const fetchPublished = async () => {
    setIsLoadingBrowse(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      const res = await fetch(`/api/published-proposals?${params}`);
      const data = await res.json();
      if (data.success) {
        setPublished(data.proposals || []);
      }
    } catch (error) {
      console.error("Error fetching published proposals:", error);
    } finally {
      setIsLoadingBrowse(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/recommendations/proposals", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
          <Globe className="h-8 w-8 text-primary" />
          Discover
        </h1>
        <p className="mt-1 text-muted-foreground">
          Explore published proposals and find projects that match your interests
        </p>
      </div>

      <Tabs defaultValue="recommended" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="recommended">
              <Sparkles className="mr-2 h-4 w-4" />
              Recommended
            </TabsTrigger>
            <TabsTrigger value="browse">
              <Globe className="mr-2 h-4 w-4" />
              Browse All
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="recommended" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Proposals matched to your profile and interests
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {isLoadingRecs ? (
            <Card className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Finding recommendations...</span>
            </Card>
          ) : recommendations.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No recommendations yet
              </h3>
              <p className="mt-2 text-muted-foreground">
                There are no published proposals to recommend, or try refreshing
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations
                .filter((rec) => rec.publishedProposal)
                .map((rec) => (
                  <PublishedProposalCard
                    key={rec.publishedProposalId || rec.publishedProposal!.id}
                    proposal={rec.publishedProposal!}
                    relevanceScore={rec.relevanceScore}
                    relevanceReason={rec.relevanceReason}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {isLoadingBrowse ? (
            <Card className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Loading proposals...</span>
            </Card>
          ) : published.length === 0 ? (
            <Card className="p-12 text-center">
              <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No published proposals
              </h3>
              <p className="mt-2 text-muted-foreground">
                No proposals have been published yet. Be the first!
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {published.map((proposal) => (
                <PublishedProposalCard
                  key={proposal.id}
                  proposal={proposal}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PublishedProposalCard({
  proposal,
  relevanceScore,
  relevanceReason,
}: {
  proposal: PublishedProposal;
  relevanceScore?: number;
  relevanceReason?: RelevanceReason | null;
}) {
  const budget = proposal.budget?.total
    ? parseFloat(proposal.budget.total.replace(/[^0-9.]/g, ""))
    : 0;
  const collaboratorsCount = proposal.collaborators_needed?.length || 0;
  const hasMatchDetails =
    relevanceReason &&
    ((relevanceReason.matchingInterests?.length ?? 0) > 0 ||
      (relevanceReason.matchingSkills?.length ?? 0) > 0 ||
      (relevanceReason.rolesYouCouldFill?.length ?? 0) > 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          {proposal.category && (
            <Badge variant="secondary">{proposal.category}</Badge>
          )}
          {relevanceScore !== undefined && (
            <Badge variant="outline" className="ml-auto">
              {relevanceScore}% match
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-1 font-serif text-lg">
          {proposal.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {proposal.vision_statement || "No vision statement"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {relevanceReason?.reason && (
          <p className="text-xs text-muted-foreground italic">
            {relevanceReason.reason}
          </p>
        )}

        {hasMatchDetails && (
          <div className="space-y-2 rounded-md bg-muted/50 p-2.5">
            {relevanceReason!.matchingInterests.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Your matching interests
                </p>
                <div className="flex flex-wrap gap-1">
                  {relevanceReason!.matchingInterests.map((interest) => (
                    <Badge key={interest} className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {relevanceReason!.matchingSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Your relevant skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {relevanceReason!.matchingSkills.map((skill) => (
                    <Badge key={skill} className="text-xs bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {relevanceReason!.rolesYouCouldFill.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Roles you could fill
                </p>
                <div className="flex flex-wrap gap-1">
                  {relevanceReason!.rolesYouCouldFill.map((role) => (
                    <Badge key={role} className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{proposal.author_name}</span>
          {proposal.author_organization && (
            <span>· {proposal.author_organization}</span>
          )}
        </div>

        {proposal.author_location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{proposal.author_location}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" />
            Budget
          </span>
          <span className="font-medium">
            {budget > 0 ? `$${budget.toLocaleString()}` : "TBD"}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Collaborators needed</span>
          <span className="font-medium">{collaboratorsCount}</span>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button size="sm" variant="outline" className="w-full" asChild>
          <Link href={`/dashboard/discover/${proposal.id}`}>
            <Eye className="mr-2 h-3 w-3" />
            View Proposal
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
