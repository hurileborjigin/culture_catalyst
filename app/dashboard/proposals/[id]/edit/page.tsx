"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  vision_statement: string | null;
  status: string;
  goals: string[] | null;
  cultural_impact: string | null;
  timeline: {
    duration?: string;
    phases?: Array<{ name: string; duration: string; tasks: string[] }>;
  } | null;
  budget: {
    total: string;
    breakdown?: Array<{ category: string; amount: string; description?: string }>;
  } | null;
  resources: string[] | null;
  collaborators_needed: Array<{
    role: string;
    skills?: string[];
    priority?: string;
    count?: number;
  }> | null;
  challenges_and_mitigation: Array<{
    challenge: string;
    mitigation: string;
  }> | null;
  next_steps: string[] | null;
}

export default function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [title, setTitle] = useState("");
  const [visionStatement, setVisionStatement] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [culturalImpact, setCulturalImpact] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [resources, setResources] = useState<string[]>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<
    Array<{ role: string; skills: string[]; priority: string; count: number }>
  >([]);
  const [challenges, setChallenges] = useState<
    Array<{ challenge: string; mitigation: string }>
  >([]);

  // Keep original data for fields we don't edit inline
  const [originalTimeline, setOriginalTimeline] = useState<Proposal["timeline"]>(null);
  const [originalBudgetBreakdown, setOriginalBudgetBreakdown] = useState<
    Array<{ category: string; amount: string; description?: string }>
  >([]);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await fetch(`/api/proposals/${id}`);
        const data = await res.json();
        if (data.success && data.proposal) {
          const p: Proposal = data.proposal;
          setTitle(p.title);
          setVisionStatement(p.vision_statement || "");
          setGoals(p.goals || []);
          setCulturalImpact(p.cultural_impact || "");
          setBudgetTotal(p.budget?.total || "");
          setOriginalBudgetBreakdown(p.budget?.breakdown || []);
          setOriginalTimeline(p.timeline);
          setResources(p.resources || []);
          setNextSteps(p.next_steps || []);
          setCollaborators(
            (p.collaborators_needed || []).map((c) => ({
              role: c.role,
              skills: c.skills || [],
              priority: c.priority || "preferred",
              count: c.count || 1,
            }))
          );
          setChallenges(p.challenges_and_mitigation || []);
        } else {
          setError("Proposal not found");
        }
      } catch (err) {
        console.error("Error fetching proposal:", err);
        setError("Failed to load proposal");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          vision_statement: visionStatement,
          goals,
          cultural_impact: culturalImpact,
          budget: {
            total: budgetTotal,
            breakdown: originalBudgetBreakdown,
          },
          timeline: originalTimeline,
          resources,
          next_steps: nextSteps,
          collaborators_needed: collaborators,
          challenges_and_mitigation: challenges,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/dashboard/proposals/${id}`);
      } else {
        setError(data.error || "Failed to save");
      }
    } catch (err) {
      console.error("Error saving proposal:", err);
      setError("Failed to save proposal");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p>{error}</p>
            <Button asChild>
              <Link href="/dashboard/proposals">Back to Proposals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/dashboard/proposals/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposal
          </Link>
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Title */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Title</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
            />
          </CardContent>
        </Card>

        {/* Vision Statement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vision Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={visionStatement}
              onChange={(e) => setVisionStatement(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Goals & Objectives</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGoals([...goals, ""])}
              >
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {goals.map((goal, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={goal}
                  onChange={(e) => {
                    const updated = [...goals];
                    updated[i] = e.target.value;
                    setGoals(updated);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setGoals(goals.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cultural Impact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cultural Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={culturalImpact}
              onChange={(e) => setCulturalImpact(e.target.value)}
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Budget Total</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={budgetTotal}
              onChange={(e) => setBudgetTotal(e.target.value)}
              placeholder="e.g. $45,000"
            />
          </CardContent>
        </Card>

        {/* Collaborators Needed */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Collaborators Needed</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCollaborators([
                    ...collaborators,
                    { role: "", skills: [], priority: "preferred", count: 1 },
                  ])
                }
              >
                <Plus className="mr-1 h-3 w-3" /> Add Role
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {collaborators.map((collab, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={collab.role}
                    onChange={(e) => {
                      const updated = [...collaborators];
                      updated[i] = { ...updated[i], role: e.target.value };
                      setCollaborators(updated);
                    }}
                    placeholder="Role name"
                    className="flex-1"
                  />
                  <select
                    value={collab.priority}
                    onChange={(e) => {
                      const updated = [...collaborators];
                      updated[i] = { ...updated[i], priority: e.target.value };
                      setCollaborators(updated);
                    }}
                    className="rounded-md border px-2 py-1.5 text-sm"
                  >
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                    <option value="nice-to-have">Nice to have</option>
                  </select>
                  <Input
                    type="number"
                    min={1}
                    value={collab.count}
                    onChange={(e) => {
                      const updated = [...collaborators];
                      updated[i] = {
                        ...updated[i],
                        count: parseInt(e.target.value) || 1,
                      };
                      setCollaborators(updated);
                    }}
                    className="w-16"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCollaborators(collaborators.filter((_, j) => j !== i))
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
                <Input
                  value={collab.skills.join(", ")}
                  onChange={(e) => {
                    const updated = [...collaborators];
                    updated[i] = {
                      ...updated[i],
                      skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    };
                    setCollaborators(updated);
                  }}
                  placeholder="Skills (comma-separated)"
                  className="text-sm"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Challenges & Mitigation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Challenges & Mitigation</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setChallenges([...challenges, { challenge: "", mitigation: "" }])
                }
              >
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {challenges.map((item, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    value={item.challenge}
                    onChange={(e) => {
                      const updated = [...challenges];
                      updated[i] = { ...updated[i], challenge: e.target.value };
                      setChallenges(updated);
                    }}
                    placeholder="Challenge"
                  />
                  <Input
                    value={item.mitigation}
                    onChange={(e) => {
                      const updated = [...challenges];
                      updated[i] = { ...updated[i], mitigation: e.target.value };
                      setChallenges(updated);
                    }}
                    placeholder="Mitigation strategy"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="self-start"
                  onClick={() => setChallenges(challenges.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Next Steps</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNextSteps([...nextSteps, ""])}
              >
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={step}
                  onChange={(e) => {
                    const updated = [...nextSteps];
                    updated[i] = e.target.value;
                    setNextSteps(updated);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNextSteps(nextSteps.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Resources</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResources([...resources, ""])}
              >
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {resources.map((resource, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={resource}
                  onChange={(e) => {
                    const updated = [...resources];
                    updated[i] = e.target.value;
                    setResources(updated);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setResources(resources.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/proposals/${id}`}>Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
