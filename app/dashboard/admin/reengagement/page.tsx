"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Mail,
  MessageCircle,
  Loader2,
  UserX,
  UserCheck,
  Clock,
  Send,
  CheckCircle,
} from "lucide-react";

interface DormantUser {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  interests: string[];
  skills: string[];
  lastLogin: string;
  ideasCount: number;
  daysSinceLogin: number;
}

interface DeadUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string | null;
  reason: string;
}

interface Summary {
  totalUsers: number;
  dormant: number;
  dead: number;
  active: number;
}

interface NotificationResult {
  userId: string;
  name: string;
  email: string;
  html: string;
  proposalCount: number;
  status: string;
}

export default function ReengagementPage() {
  const [dormantUsers, setDormantUsers] = useState<DormantUser[]>([]);
  const [deadUsers, setDeadUsers] = useState<DeadUser[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResult[]>([]);

  useEffect(() => {
    fetchInactiveUsers();
  }, []);

  const fetchInactiveUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/inactive-users?days=14");
      const data = await res.json();
      if (data.success) {
        setDormantUsers(data.dormantUsers || []);
        setDeadUsers(data.deadUsers || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error fetching inactive users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedUsers.size === dormantUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(dormantUsers.map((u) => u.id)));
    }
  };

  const handleSendNotifications = async () => {
    if (selectedUsers.size === 0) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/admin/notify-inactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedUsers) }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error generating emails:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
          <Users className="h-8 w-8 text-primary" />
          Re-engagement
        </h1>
        <p className="mt-1 text-muted-foreground">
          Identify inactive users and send personalized re-engagement messages
        </p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="mb-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Users", value: summary.totalUsers, icon: Users },
            { label: "Active", value: summary.active, icon: UserCheck },
            { label: "Dormant", value: summary.dormant, icon: Clock },
            { label: "Inactive", value: summary.dead, icon: UserX },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <Card className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Analyzing user activity...</span>
        </Card>
      ) : (
        <Tabs defaultValue="dormant" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dormant">
              <Clock className="mr-2 h-4 w-4" />
              Dormant ({dormantUsers.length})
            </TabsTrigger>
            <TabsTrigger value="dead">
              <UserX className="mr-2 h-4 w-4" />
              Inactive ({deadUsers.length})
            </TabsTrigger>
            {notifications.length > 0 && (
              <TabsTrigger value="sent">
                <CheckCircle className="mr-2 h-4 w-4" />
                Generated ({notifications.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dormant" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedUsers.size === dormantUsers.length ? "Deselect All" : "Select All"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.size} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSendNotifications}
                  disabled={selectedUsers.size === 0 || isSending}
                >
                  {isSending ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-3 w-3" />
                  )}
                  Generate Re-engagement Emails
                </Button>
              </div>
            </div>

            {dormantUsers.length === 0 ? (
              <Card className="p-12 text-center">
                <UserCheck className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-lg font-semibold">All users are active!</h3>
                <p className="mt-2 text-muted-foreground">No dormant users found</p>
              </Card>
            ) : (
              dormantUsers.map((user) => (
                <Card
                  key={user.id}
                  className={`cursor-pointer transition-all ${selectedUsers.has(user.id) ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => toggleUser(user.id)}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="h-4 w-4 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{user.name}</p>
                        {user.organization && (
                          <span className="text-xs text-muted-foreground">· {user.organization}</span>
                        )}
                        <Badge variant="outline" className="ml-auto text-xs">
                          {user.daysSinceLogin}d since login
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                      {user.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.interests.slice(0, 4).map((interest) => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{user.ideasCount} ideas</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="dead" className="space-y-4">
            <CardDescription>
              These users registered but never set up their profile or created any content. They are excluded from re-engagement.
            </CardDescription>
            {deadUsers.map((user) => (
              <Card key={user.id} className="opacity-60">
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {notifications.length > 0 && (
            <TabsContent value="sent" className="space-y-6">
              <CardDescription>
                Preview of generated re-engagement emails. In production, these would be sent automatically.
              </CardDescription>
              {notifications.map((notif) => (
                <Card key={notif.userId}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{notif.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Mail className="mr-1 h-3 w-3" /> {notif.proposalCount} proposals
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="mr-1 h-3 w-3" /> {notif.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{notif.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                      <iframe
                        srcDoc={notif.html}
                        className="w-full border-0"
                        style={{ height: "700px" }}
                        title={`Email preview for ${notif.name}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
