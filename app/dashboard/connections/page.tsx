"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Inbox,
  Send,
  Users,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
} from "lucide-react";

interface CollabRequest {
  id: string;
  publishedProposalId: string;
  requesterId: string;
  authorId: string;
  roleAppliedFor: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  requesterName: string;
  requesterSkills: string[];
  requesterOrganization: string | null;
  authorName: string;
  proposalTitle: string;
  proposalCategory: string | null;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName: string;
}

export default function ConnectionsPage() {
  const [incoming, setIncoming] = useState<CollabRequest[]>([]);
  const [outgoing, setOutgoing] = useState<CollabRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const [inRes, outRes] = await Promise.all([
        fetch("/api/collaboration-requests?type=incoming").then((r) => r.json()),
        fetch("/api/collaboration-requests?type=outgoing").then((r) => r.json()),
      ]);
      if (inRes.success) setIncoming(inRes.requests);
      if (outRes.success) setOutgoing(outRes.requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleThread = async (requestId: string) => {
    if (expandedId === requestId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(requestId);
    if (!messages[requestId]) {
      try {
        const res = await fetch(`/api/collaboration-requests/${requestId}/messages`);
        const data = await res.json();
        if (data.success) {
          setMessages((prev) => ({ ...prev, [requestId]: data.messages }));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  const handleSendMessage = async (requestId: string) => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/collaboration-requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => ({
          ...prev,
          [requestId]: [...(prev[requestId] || []), data.message],
        }));
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAction = async (requestId: string, action: "accepted" | "declined") => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/collaboration-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      const data = await res.json();
      if (data.success) {
        setIncoming((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: action } : r))
        );
      }
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingIncoming = incoming.filter((r) => r.status === "pending");
  const activeCollabs = [...incoming, ...outgoing].filter((r) => r.status === "accepted");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
          <MessageCircle className="h-8 w-8 text-primary" />
          Connections
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage collaboration requests and conversations
        </p>
      </div>

      {isLoading ? (
        <Card className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading connections...</span>
        </Card>
      ) : (
        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="incoming">
              <Inbox className="mr-2 h-4 w-4" />
              Incoming ({pendingIncoming.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              <Send className="mr-2 h-4 w-4" />
              Outgoing ({outgoing.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              <Users className="mr-2 h-4 w-4" />
              Active ({activeCollabs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            {incoming.length === 0 ? (
              <Card className="p-12 text-center">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No incoming requests</h3>
                <p className="mt-2 text-muted-foreground">
                  When someone applies to collaborate on your proposals, you&apos;ll see them here
                </p>
              </Card>
            ) : (
              incoming.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  type="incoming"
                  isExpanded={expandedId === req.id}
                  messages={messages[req.id] || []}
                  newMessage={newMessage}
                  sendingMessage={sendingMessage}
                  processingId={processingId}
                  onToggle={() => toggleThread(req.id)}
                  onSendMessage={() => handleSendMessage(req.id)}
                  onMessageChange={setNewMessage}
                  onAccept={() => handleAction(req.id, "accepted")}
                  onDecline={() => handleAction(req.id, "declined")}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4">
            {outgoing.length === 0 ? (
              <Card className="p-12 text-center">
                <Send className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No outgoing requests</h3>
                <p className="mt-2 text-muted-foreground">
                  Apply to collaborate on proposals from the{" "}
                  <Link href="/dashboard/discover" className="text-primary underline">Discover</Link> page
                </p>
              </Card>
            ) : (
              outgoing.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  type="outgoing"
                  isExpanded={expandedId === req.id}
                  messages={messages[req.id] || []}
                  newMessage={newMessage}
                  sendingMessage={sendingMessage}
                  processingId={null}
                  onToggle={() => toggleThread(req.id)}
                  onSendMessage={() => handleSendMessage(req.id)}
                  onMessageChange={setNewMessage}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeCollabs.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No active collaborations</h3>
                <p className="mt-2 text-muted-foreground">
                  Accepted collaboration requests will appear here
                </p>
              </Card>
            ) : (
              activeCollabs.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  type="active"
                  isExpanded={expandedId === req.id}
                  messages={messages[req.id] || []}
                  newMessage={newMessage}
                  sendingMessage={sendingMessage}
                  processingId={null}
                  onToggle={() => toggleThread(req.id)}
                  onSendMessage={() => handleSendMessage(req.id)}
                  onMessageChange={setNewMessage}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function RequestCard({
  request,
  type,
  isExpanded,
  messages,
  newMessage,
  sendingMessage,
  processingId,
  onToggle,
  onSendMessage,
  onMessageChange,
  onAccept,
  onDecline,
}: {
  request: CollabRequest;
  type: "incoming" | "outgoing" | "active";
  isExpanded: boolean;
  messages: Message[];
  newMessage: string;
  sendingMessage: boolean;
  processingId: string | null;
  onToggle: () => void;
  onSendMessage: () => void;
  onMessageChange: (v: string) => void;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">
              <Link href={`/dashboard/discover/${request.publishedProposalId}`} className="hover:underline">
                {request.proposalTitle}
              </Link>
            </CardTitle>
            <CardDescription>
              {type === "incoming" ? (
                <span><strong>{request.requesterName}</strong> applied as <strong>{request.roleAppliedFor}</strong></span>
              ) : (
                <span>Applied as <strong>{request.roleAppliedFor}</strong></span>
              )}
            </CardDescription>
          </div>
          <Badge className={statusColor[request.status]}>{request.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {type === "incoming" && request.requesterSkills && request.requesterSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {request.requesterSkills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
            ))}
          </div>
        )}

        {type === "incoming" && request.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onAccept}
              disabled={processingId === request.id}
            >
              {processingId === request.id ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-3 w-3" />
              )}
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDecline}
              disabled={processingId === request.id}
            >
              <XCircle className="mr-2 h-3 w-3" />
              Decline
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onToggle}
        >
          <MessageCircle className="mr-2 h-3.5 w-3.5" />
          Messages ({messages.length})
          {isExpanded ? (
            <ChevronUp className="ml-auto h-4 w-4" />
          ) : (
            <ChevronDown className="ml-auto h-4 w-4" />
          )}
        </Button>

        {isExpanded && (
          <div className="space-y-3 border-t pt-3">
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                No messages yet
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{msg.senderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <Button
                size="icon"
                className="shrink-0 self-end"
                onClick={onSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
