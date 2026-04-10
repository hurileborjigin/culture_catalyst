import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Lightbulb,
  FileText,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";

// Mock data - in production, this would come from your API
const recentActivity = [
  {
    id: "1",
    type: "inspiration",
    title: "Viewed: Community Garden Festival",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "idea",
    title: "Updated: Neighborhood Art Walk",
    time: "Yesterday",
  },
  {
    id: "3",
    type: "proposal",
    title: "Created: Cultural Heritage Day",
    time: "3 days ago",
  },
];

const quickStats = [
  { label: "Ideas in Progress", value: 3, icon: Lightbulb },
  { label: "Draft Proposals", value: 2, icon: FileText },
  { label: "Saved Inspirations", value: 12, icon: Sparkles },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Welcome back, Alex</h1>
        <p className="mt-1 text-muted-foreground">
          Continue building your cultural projects or discover new inspiration.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Actions */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Phase 1: Inspiration */}
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10" />
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="font-serif">Get Inspired</CardTitle>
            <CardDescription>
              Discover cultural events and trends tailored to your interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/inspiration">
                Explore Inspiration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Phase 2: Develop */}
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10" />
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="font-serif">Develop Ideas</CardTitle>
            <CardDescription>
              Transform your concepts into structured, feasible plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/develop">
                Start Developing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Phase 3: Proposals */}
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10" />
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="font-serif">Create Proposals</CardTitle>
            <CardDescription>
              Generate polished proposals ready for publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/proposals">
                View Proposals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Current Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Neighborhood Art Walk</h3>
                <Badge variant="secondary">In Development</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                A community art exhibition featuring local artists
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="text-muted-foreground">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/develop/1">Continue Working</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {activity.type === "inspiration" && (
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    )}
                    {activity.type === "idea" && (
                      <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    )}
                    {activity.type === "proposal" && (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
