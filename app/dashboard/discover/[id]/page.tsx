"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  Building,
  User,
  Target,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Send,
  UserPlus,
} from "lucide-react";

interface PublishedProposal {
  id: string;
  user_id: string;
  title: string;
  vision_statement: string | null;
  goals: string[];
  cultural_impact: string | null;
  timeline: {
    duration?: string;
    phases?: Array<{ name: string; duration: string; tasks: string[] }>;
  } | null;
  budget: {
    total: string;
    breakdown?: Array<{ category: string; amount: string; description?: string }>;
  } | null;
  collaborators_needed: Array<{
    role: string;
    skills?: string[];
    priority?: string;
    count?: number;
  }> | null;
  resources: string[];
  challenges_and_mitigation: Array<{
    challenge: string;
    mitigation: string;
  }> | null;
  next_steps: string[];
  author_name: string;
  author_organization: string | null;
  author_location: string | null;
  tags: string[];
  category: string | null;
  published_at: string;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  commenterName: string;
  commenterOrganization: string | null;
}

interface Collaborator {
  id: string;
  userId: string;
  role: string;
  skills: string[];
  joinedAt: string;
  collaboratorName: string;
  collaboratorOrganization: string | null;
}

interface MyRequest {
  id: string;
  role_applied_for: string;
  status: string;
}

export default function PublishedProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<PublishedProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [applyDialog, setApplyDialog] = useState<{ open: boolean; role: string; skills: string[] }>({
    open: false, role: "", skills: [],
  });
  const [applyMessage, setApplyMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await fetch(`/api/published-proposals/${id}`);
        const data = await res.json();
        if (data.success) setProposal(data.proposal);
      } catch (error) {
        console.error("Error fetching published proposal:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchExtras = async () => {
      const [commentsRes, collabsRes, reqsRes] = await Promise.all([
        fetch(`/api/published-proposals/${id}/comments`).then((r) => r.json()).catch(() => null),
        fetch(`/api/published-proposals/${id}/collaborators`).then((r) => r.json()).catch(() => null),
        fetch(`/api/published-proposals/${id}/collaborate`).then((r) => r.json()).catch(() => null),
      ]);
      if (commentsRes?.success) setComments(commentsRes.comments);
      if (collabsRes?.success) setCollaborators(collabsRes.collaborators);
      if (reqsRes?.success) setMyRequests(reqsRes.requests);
    };
    fetchExtras();
  }, [id]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsSendingComment(true);
    try {
      const res = await fetch(`/api/published-proposals/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleApply = async () => {
    if (!applyDialog.role) return;
    setIsApplying(true);
    try {
      const res = await fetch(`/api/published-proposals/${id}/collaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleAppliedFor: applyDialog.role, message: applyMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setMyRequests((prev) => [...prev, {
          id: data.request.id,
          role_applied_for: applyDialog.role,
          status: "pending",
        }]);
        setApplyDialog({ open: false, role: "", skills: [] });
        setApplyMessage("");
      }
    } catch (error) {
      console.error("Error applying:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const getRequestForRole = (role: string) =>
    myRequests.find((r) => r.role_applied_for === role);

  const getCollaboratorsForRole = (role: string) =>
    collaborators.filter((c) => c.role === role);

  const isAuthor = user?.id === proposal?.user_id;
  const isCollaborator = collaborators.some((c) => c.userId === user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Proposal not found.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/discover">Back to Discover</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/dashboard/discover">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Discover
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {proposal.category && (
            <Badge variant="secondary">{proposal.category}</Badge>
          )}
          {proposal.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="font-serif text-3xl font-bold">{proposal.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Published {new Date(proposal.published_at).toLocaleDateString()}
        </p>
      </div>

      {/* Author Card */}
      <Card className="mb-8">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">{proposal.author_name}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {proposal.author_organization && (
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  {proposal.author_organization}
                </span>
              )}
              {proposal.author_location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {proposal.author_location}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* Vision Statement */}
        {proposal.vision_statement && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Target className="h-5 w-5 text-primary" />
              Vision Statement
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {proposal.vision_statement}
            </p>
          </section>
        )}

        {/* Goals */}
        {proposal.goals.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Goals & Objectives</h2>
            <ul className="space-y-2">
              {proposal.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cultural Impact */}
        {proposal.cultural_impact && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Cultural Impact</h2>
            <p className="text-muted-foreground leading-relaxed">
              {proposal.cultural_impact}
            </p>
          </section>
        )}

        {/* Timeline */}
        {proposal.timeline?.phases && proposal.timeline.phases.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Clock className="h-5 w-5 text-primary" />
              Timeline
              {proposal.timeline.duration && (
                <Badge variant="outline">{proposal.timeline.duration}</Badge>
              )}
            </h2>
            <div className="space-y-4">
              {proposal.timeline.phases.map((phase, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      {phase.name}
                      <Badge variant="secondary">{phase.duration}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {phase.tasks.map((task, j) => (
                        <li key={j}>{task}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Budget */}
        {proposal.budget && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <DollarSign className="h-5 w-5 text-primary" />
              Budget
              <Badge variant="outline">{proposal.budget.total}</Badge>
            </h2>
            {proposal.budget.breakdown && proposal.budget.breakdown.length > 0 && (
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium">Category</th>
                      <th className="px-4 py-2 text-left font-medium">Amount</th>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.budget.breakdown.map((item, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-2">{item.category}</td>
                        <td className="px-4 py-2 font-medium">{item.amount}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Team & Open Roles */}
        {proposal.collaborators_needed && proposal.collaborators_needed.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-primary" />
              Team & Open Roles
            </h2>

            {collaborators.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Current Team</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {collaborators.map((c) => (
                    <Card key={c.id} className="border-green-200 bg-green-50/50">
                      <CardContent className="py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">{c.collaboratorName}</span>
                          <Badge variant="secondary" className="text-xs ml-auto">{c.role}</Badge>
                        </div>
                        {c.collaboratorOrganization && (
                          <p className="text-xs text-muted-foreground ml-6">{c.collaboratorOrganization}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm font-medium text-muted-foreground mb-2">
              {collaborators.length > 0 ? "Open Positions" : "Collaborators Needed"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {proposal.collaborators_needed.map((collab, i) => {
                const existing = getRequestForRole(collab.role);
                const filled = getCollaboratorsForRole(collab.role);
                const remaining = (collab.count || 1) - filled.length;
                if (remaining <= 0) return null;

                return (
                  <Card key={i}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{collab.role}</span>
                        <div className="flex items-center gap-2">
                          {remaining > 1 && (
                            <Badge variant="outline" className="text-xs">{remaining} needed</Badge>
                          )}
                          {collab.priority && (
                            <Badge variant={collab.priority === "required" ? "default" : collab.priority === "preferred" ? "secondary" : "outline"}>
                              {collab.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {collab.skills && collab.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {collab.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      )}
                      {existing ? (
                        <Badge variant={existing.status === "accepted" ? "default" : existing.status === "pending" ? "secondary" : "outline"}>
                          {existing.status === "pending" ? "Application Pending" : existing.status === "accepted" ? "Accepted" : "Declined"}
                        </Badge>
                      ) : isAuthor ? (
                        <Badge variant="outline" className="text-xs">Your proposal</Badge>
                      ) : isCollaborator ? (
                        <Badge variant="default" className="text-xs">You&apos;re on this team</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => setApplyDialog({ open: true, role: collab.role, skills: collab.skills || [] })}
                        >
                          <UserPlus className="mr-2 h-3.5 w-3.5" />
                          Apply for this Role
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Challenges & Mitigation */}
        {proposal.challenges_and_mitigation && proposal.challenges_and_mitigation.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Challenges & Mitigation
            </h2>
            <div className="space-y-3">
              {proposal.challenges_and_mitigation.map((item, i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <p className="font-medium text-sm">{item.challenge}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.mitigation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Next Steps */}
        {proposal.next_steps.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Next Steps</h2>
            <ol className="list-decimal pl-5 space-y-1">
              {proposal.next_steps.map((step, i) => (
                <li key={i} className="text-muted-foreground">{step}</li>
              ))}
            </ol>
          </section>
        )}

        {/* Comments */}
        <section>
          <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
            <MessageSquare className="h-5 w-5 text-primary" />
            Discussion ({comments.length})
          </h2>
          {comments.length > 0 && (
            <p className="mb-3 text-xs text-muted-foreground">
              {comments.length} comment{comments.length !== 1 ? "s" : ""} from{" "}
              {new Set(comments.map((c) => c.userId)).size} contributor{new Set(comments.map((c) => c.userId)).size !== 1 ? "s" : ""}
            </p>
          )}

          <div className="space-y-3 mb-4">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No comments yet. Start the conversation!
              </p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-medium">{comment.commenterName}</span>
                      {comment.commenterOrganization && (
                        <span className="text-xs text-muted-foreground">· {comment.commenterOrganization}</span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm ml-9">{comment.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Guided prompts for first-time commenters */}
          {!newComment && comments.filter((c) => c.userId === user?.id).length === 0 && !isAuthor && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Quick start — click to begin your comment:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  `I'm interested in the ${proposal.category || "cultural"} aspect of this project`,
                  "How can I contribute to this initiative?",
                  "I have relevant experience and would love to discuss this further",
                  "This aligns with work I've been doing — let's connect!",
                ].map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1.5 whitespace-normal text-left"
                    onClick={() => setNewComment(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              size="icon"
              className="shrink-0 self-end"
              onClick={handlePostComment}
              disabled={isSendingComment || !newComment.trim()}
            >
              {isSendingComment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </section>
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyDialog.open} onOpenChange={(open) => setApplyDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for: {applyDialog.role}</DialogTitle>
            <DialogDescription>
              Send a message to the proposal author explaining why you&apos;re a good fit for this role.
            </DialogDescription>
          </DialogHeader>
          {applyDialog.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">Required skills</p>
              <div className="flex flex-wrap gap-1">
                {applyDialog.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          <Textarea
            placeholder="Introduce yourself and explain your interest in this role..."
            value={applyMessage}
            onChange={(e) => setApplyMessage(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialog({ open: false, role: "", skills: [] })}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isApplying}>
              {isApplying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
