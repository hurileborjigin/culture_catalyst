"use client";

import { useState, useEffect, useCallback } from "react";
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
  Search,
  Sparkles,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Loader2,
  ArrowRight,
  Filter,
  AlertCircle,
  Link as LinkIcon,
  History,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import type { InspirationCard } from "@/types";

const categories = [
  "All",
  "Visual Arts",
  "Performing Arts",
  "Heritage & Traditions",
  "Environment & Sustainability",
  "Commerce & Culture",
  "Film & Media",
  "Music",
  "Community Events",
  "Education & Workshops",
  "Food & Culinary",
];

interface SavedInspiration {
  id: string;
  title: string;
  summary: string;
  category: string;
  relevance_explanation: string;
  success_highlights: string[];
  source_url: string;
  location: string;
  tags: string[];
  created_at: string;
}

export default function InspirationPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [inspirations, setInspirations] = useState<InspirationCard[]>([]);
  const [savedInspirations, setSavedInspirations] = useState<SavedInspiration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCards, setTotalCards] = useState(0);

  // Load saved inspirations from database
  const loadSavedInspirations = useCallback(async () => {
    setIsLoadingSaved(true);
    try {
      const response = await fetch("/api/inspiration?saved=true");
      const data = await response.json();
      if (data.success) {
        setSavedInspirations(data.savedInspirations || []);
      }
    } catch (err) {
      console.error("Error loading saved inspirations:", err);
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  // Load existing session on mount
  useEffect(() => {
    const loadExistingSession = async () => {
      try {
        const response = await fetch("/api/inspiration");
        const data = await response.json();
        if (data.success && data.inspirations?.length > 0) {
          setSessionId(data.sessionId);
          setInspirations(data.inspirations);
          setHasMore(data.hasMore);
          setTotalCards(data.total);
        }
      } catch (err) {
        console.error("Error loading existing session:", err);
      }
    };

    if (!authLoading) {
      loadExistingSession();
      loadSavedInspirations();
    }
  }, [authLoading, loadSavedInspirations]);

  // Generate new inspirations
  const handleGenerate = async () => {
    if (!profile?.interests?.length) {
      setError("Please add some interests to your profile first to generate personalized inspirations.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/inspiration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regenerate: sessionId ? true : false,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to generate inspirations");
      }

      setSessionId(data.sessionId);
      setInspirations(data.inspirations);
      setHasMore(data.hasMore);
      setTotalCards(data.total);
    } catch (err) {
      console.error("Generate error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate inspirations");
    } finally {
      setIsGenerating(false);
    }
  };

  // Shuffle to show next 4 cards
  const handleShuffle = async () => {
    if (!sessionId) {
      handleGenerate();
      return;
    }

    setIsShuffling(true);
    setError(null);

    try {
      const response = await fetch("/api/inspiration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          shuffle: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to shuffle inspirations");
      }

      setInspirations(data.inspirations);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Shuffle error:", err);
      setError(err instanceof Error ? err.message : "Failed to shuffle");
    } finally {
      setIsShuffling(false);
    }
  };

  // Save inspiration to database
  const handleSave = async (item: InspirationCard) => {
    try {
      const response = await fetch("/api/inspiration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saveInspiration: item,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSavedInspirations((prev) => [data.savedInspiration, ...prev]);
        // Mark as saved in current view
        setInspirations((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, saved: true } : i))
        );
      }
    } catch (err) {
      console.error("Error saving inspiration:", err);
    }
  };

  // Remove saved inspiration
  const handleRemoveSaved = async (id: string) => {
    try {
      const response = await fetch(`/api/inspiration?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSavedInspirations((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error("Error removing saved inspiration:", err);
    }
  };

  // Filter inspirations
  const filteredInspirations = inspirations.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if an inspiration is already saved
  const isInspSaved = (inspId: string) => {
    return savedInspirations.some(
      (s) => s.title === inspirations.find((i) => i.id === inspId)?.title
    );
  };

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
            <Sparkles className="h-8 w-8 text-primary" />
            Inspiration
          </h1>
          <p className="mt-1 text-muted-foreground">
            Discover cultural initiatives personalized to your interests
          </p>
        </div>
        <div className="flex gap-2">
          {sessionId && (
            <Button
              onClick={handleShuffle}
              disabled={isShuffling || isGenerating}
              variant="outline"
            >
              {isShuffling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Show Different 4
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {sessionId ? "Regenerate All" : "Get Personalized Ideas"}
          </Button>
        </div>
      </div>

      {/* Profile Warning */}
      {profile && (!profile.interests || profile.interests.length === 0) && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 dark:text-amber-200">Complete Your Profile</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Add interests to your profile to get personalized inspirations.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

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

      {/* Stats Banner */}
      {sessionId && totalCards > 0 && (
        <Card className="mb-6 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredInspirations.length} of {totalCards} personalized inspirations based on your profile
            </p>
            {hasMore && (
              <Badge variant="secondary">More available</Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!sessionId && inspirations.length === 0 && !isGenerating && (
        <Card className="mb-6 border-dashed">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Get Personalized Inspiration</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Click the button above to discover cultural events and community projects 
                tailored to your interests and professional background. We analyze your 
                profile and search for successful initiatives from around the world.
              </p>
            </div>
            <Button onClick={handleGenerate} size="lg" disabled={!profile?.interests?.length}>
              <Sparkles className="mr-2 h-4 w-4" />
              Discover Inspiration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isGenerating && inspirations.length === 0 && (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Generating Your Inspirations</h3>
              <p className="mt-2 text-muted-foreground">
                Analyzing your profile, searching for relevant events worldwide, 
                and curating personalized recommendations...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      {(inspirations.length > 0 || savedInspirations.length > 0) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inspirations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tabs */}
      {(inspirations.length > 0 || savedInspirations.length > 0) && (
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList>
            <TabsTrigger value="discover">
              Discover ({filteredInspirations.length})
            </TabsTrigger>
            <TabsTrigger value="saved">
              <History className="mr-1 h-4 w-4" />
              Saved ({savedInspirations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {filteredInspirations.length === 0 ? (
              <Card className="p-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No inspirations found
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or filters, or generate new inspirations
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredInspirations.map((item) => (
                  <InspirationCardComponent
                    key={item.id}
                    item={item}
                    isSaved={isInspSaved(item.id)}
                    onSave={() => handleSave(item)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {isLoadingSaved ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : savedInspirations.length === 0 ? (
              <Card className="p-12 text-center">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No saved items yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Save inspirations to reference them later
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {savedInspirations.map((item) => (
                  <SavedInspirationCard
                    key={item.id}
                    item={item}
                    onRemove={() => handleRemoveSaved(item.id)}
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

interface InspirationCardProps {
  item: InspirationCard;
  isSaved: boolean;
  onSave: () => void;
}

function InspirationCardComponent({ item, isSaved, onSave }: InspirationCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            {item.category}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onSave}
            disabled={isSaved}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardTitle className="line-clamp-2 font-serif text-lg">
          {item.title}
        </CardTitle>
        {item.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {item.location}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {item.summary}
        </p>

        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary">Why this for you:</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.relevanceExplanation}
          </p>
        </div>

        {item.successHighlights && item.successHighlights.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium">Key Highlights:</p>
            <ul className="space-y-1">
              {item.successHighlights.slice(0, 3).map((highlight, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {item.sourceUrl && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <LinkIcon className="h-3 w-3" />
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-primary hover:underline"
            >
              {new URL(item.sourceUrl).hostname}
            </a>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        {item.sourceUrl && (
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3 w-3" />
              Learn More
            </a>
          </Button>
        )}
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/develop/new?inspiration=${item.id}&title=${encodeURIComponent(item.title)}`}>
            Use This
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface SavedInspirationCardProps {
  item: SavedInspiration;
  onRemove: () => void;
}

function SavedInspirationCard({ item, onRemove }: SavedInspirationCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            {item.category}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="line-clamp-2 font-serif text-lg">
          {item.title}
        </CardTitle>
        {item.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {item.location}
          </div>
        )}
        <CardDescription className="text-xs">
          Saved {new Date(item.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {item.summary}
        </p>

        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary">Why this for you:</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.relevance_explanation}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {item.tags?.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        {item.source_url && (
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={item.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3 w-3" />
              Source
            </a>
          </Button>
        )}
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/develop/new?title=${encodeURIComponent(item.title)}`}>
            Develop Idea
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
