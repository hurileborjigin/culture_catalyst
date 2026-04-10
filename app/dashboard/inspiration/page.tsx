"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

// Mock inspiration data - in production, this would come from your AI agents
const mockInspirations = [
  {
    id: "1",
    title: "Community Garden Festival",
    summary:
      "A weekend celebration combining urban gardening workshops, local food vendors, and live acoustic music in a transformed city park.",
    category: "Environment & Sustainability",
    location: "Portland, Oregon",
    relevanceExplanation:
      "Matches your interest in sustainable community initiatives and outdoor events.",
    successHighlights: [
      "Attracted 5,000+ visitors",
      "20 local vendors participated",
      "Generated $50K for community projects",
    ],
    tags: ["Gardening", "Food", "Music", "Sustainability"],
    imageUrl: null,
    saved: false,
  },
  {
    id: "2",
    title: "Neighborhood Mural Project",
    summary:
      "A collaborative street art initiative that transformed blank walls into vibrant murals celebrating local history and diversity.",
    category: "Visual Arts",
    location: "Philadelphia, Pennsylvania",
    relevanceExplanation:
      "Aligns with your background in visual arts and community engagement.",
    successHighlights: [
      "Created 15 murals across 3 neighborhoods",
      "Engaged 200+ community volunteers",
      "Reduced graffiti vandalism by 60%",
    ],
    tags: ["Street Art", "Community", "Heritage", "Youth"],
    imageUrl: null,
    saved: true,
  },
  {
    id: "3",
    title: "Intergenerational Storytelling Circle",
    summary:
      "A monthly gathering where elders share cultural stories and traditions with youth, preserving oral history while building connections.",
    category: "Heritage & Traditions",
    location: "Santa Fe, New Mexico",
    relevanceExplanation:
      "Connects with your interest in cultural preservation and community building.",
    successHighlights: [
      "150 stories documented",
      "3 generations participating",
      "Spawned youth mentorship program",
    ],
    tags: ["Storytelling", "Intergenerational", "Heritage", "Education"],
    imageUrl: null,
    saved: false,
  },
  {
    id: "4",
    title: "Pop-Up Cultural Market",
    summary:
      "A rotating marketplace showcasing artisans, craftspeople, and food vendors from diverse cultural backgrounds.",
    category: "Commerce & Culture",
    location: "Toronto, Canada",
    relevanceExplanation:
      "Matches your interest in multicultural events and local entrepreneurship.",
    successHighlights: [
      "Supported 80 small businesses",
      "Celebrated 25 different cultures",
      "$200K+ in vendor sales",
    ],
    tags: ["Market", "Multicultural", "Artisans", "Food"],
    imageUrl: null,
    saved: false,
  },
  {
    id: "5",
    title: "Dance in the Park Series",
    summary:
      "Free public dance lessons and performances showcasing different cultural dance traditions every weekend during summer.",
    category: "Performing Arts",
    location: "Austin, Texas",
    relevanceExplanation:
      "Aligns with your interest in accessible public arts programming.",
    successHighlights: [
      "12 dance traditions featured",
      "Average 300 participants per session",
      "Created 5 ongoing dance groups",
    ],
    tags: ["Dance", "Public Art", "Fitness", "Cultural Exchange"],
    imageUrl: null,
    saved: false,
  },
  {
    id: "6",
    title: "Youth Film Festival",
    summary:
      "An annual festival showcasing short films created by young filmmakers, with mentorship from industry professionals.",
    category: "Film & Media",
    location: "Atlanta, Georgia",
    relevanceExplanation:
      "Connects with your interest in youth empowerment and creative expression.",
    successHighlights: [
      "100+ films submitted annually",
      "Scholarships awarded to 10 students",
      "Alumni working in film industry",
    ],
    tags: ["Film", "Youth", "Mentorship", "Creative"],
    imageUrl: null,
    saved: true,
  },
];

const categories = [
  "All",
  "Visual Arts",
  "Performing Arts",
  "Heritage & Traditions",
  "Environment & Sustainability",
  "Commerce & Culture",
  "Film & Media",
];

export default function InspirationPage() {
  const [inspirations, setInspirations] = useState(mockInspirations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredInspirations = inspirations.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const savedInspirations = inspirations.filter((item) => item.saved);

  const toggleSave = (id: string) => {
    setInspirations(
      inspirations.map((item) =>
        item.id === id ? { ...item, saved: !item.saved } : item
      )
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // TODO: Call your AI agent API to get fresh recommendations
    // const response = await fetch('/api/agents/inspiration', {
    //   method: 'POST',
    //   body: JSON.stringify({ userId: 'current-user' }),
    // });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

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
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          {isRefreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Get Fresh Ideas
        </Button>
      </div>

      {/* Search and Filters */}
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

      {/* Tabs */}
      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList>
          <TabsTrigger value="discover">
            Discover ({filteredInspirations.length})
          </TabsTrigger>
          <TabsTrigger value="saved">
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
                Try adjusting your search or filters
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredInspirations.map((item) => (
                <InspirationCard
                  key={item.id}
                  item={item}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {savedInspirations.length === 0 ? (
            <Card className="p-12 text-center">
              <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No saved items yet</h3>
              <p className="mt-2 text-muted-foreground">
                Save inspirations to reference them later
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedInspirations.map((item) => (
                <InspirationCard
                  key={item.id}
                  item={item}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InspirationCardProps {
  item: (typeof mockInspirations)[0];
  onToggleSave: (id: string) => void;
}

function InspirationCard({ item, onToggleSave }: InspirationCardProps) {
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
            onClick={() => onToggleSave(item.id)}
          >
            {item.saved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardTitle className="line-clamp-2 font-serif text-lg">
          {item.title}
        </CardTitle>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {item.location}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {item.summary}
        </p>

        {/* Personalized Relevance */}
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary">Why this for you:</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.relevanceExplanation}
          </p>
        </div>

        {/* Success Highlights */}
        <div className="space-y-1">
          <p className="text-xs font-medium">Key Highlights:</p>
          <ul className="space-y-1">
            {item.successHighlights.slice(0, 2).map((highlight, index) => (
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

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        <Button variant="outline" size="sm" className="flex-1">
          <ExternalLink className="mr-2 h-3 w-3" />
          Learn More
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/develop/new?inspiration=${item.id}`}>
            Use This
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
