"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Sample profiles for quick signup
const sampleProfiles = [
  {
    email: "maya.chen@techcorp.io",
    name: "Maya Chen",
    location: "Berlin, Germany",
    organization: "TechCorp Innovation Lab",
    professionalBackground: "Senior Technology Director specializing in digital art and interactive installations",
    interests: ["Interactive Art", "Digital Installations", "AI in Art", "Tech Exhibitions", "Creative Coding"],
    skills: ["Python", "Creative Coding", "Project Management", "UX Design", "Machine Learning"],
  },
  {
    email: "james.okonkwo@nonprofit.org",
    name: "James Okonkwo",
    location: "Amsterdam, Netherlands",
    organization: "European Youth Foundation",
    professionalBackground: "Program Director focused on youth empowerment and community development",
    interests: ["Youth Empowerment", "Social Impact", "Community Building", "Cultural Exchange", "Education"],
    skills: ["Program Development", "Grant Writing", "Public Speaking", "Community Organizing", "Fundraising"],
  },
  {
    email: "sofia.rodriguez@university.edu",
    name: "Sofia Rodriguez",
    location: "Barcelona, Spain",
    organization: "University of Barcelona",
    professionalBackground: "Associate Professor of Environmental Studies and Sustainable Art",
    interests: ["Environmental Art", "Sustainability", "Academic Research", "Climate Communication", "Eco-Design"],
    skills: ["Research Methods", "Grant Writing", "Public Lectures", "Curriculum Development", "Art Curation"],
  },
  {
    email: "priya.sharma@startup.co",
    name: "Priya Sharma",
    location: "Lisbon, Portugal",
    organization: "CulinaryHeritage Tech",
    professionalBackground: "Founder and CEO of food tech startup focusing on cultural cuisine preservation",
    interests: ["Food Culture", "Entrepreneurship", "Cultural Preservation", "Tech Startups", "Gastronomy"],
    skills: ["Business Development", "Product Management", "Fundraising", "Marketing", "Food Science"],
  },
];

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [selectedProfile, setSelectedProfile] = useState<typeof sampleProfiles[0] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleProfileSelect = (profile: typeof sampleProfiles[0]) => {
    setSelectedProfile(profile);
    setFormData((prev) => ({
      ...prev,
      email: profile.email,
      name: profile.name,
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Use our custom auth API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name || selectedProfile?.name || "User",
          interests: selectedProfile?.interests || [],
          professionalBackground: selectedProfile?.professionalBackground || null,
          organization: selectedProfile?.organization || null,
          location: selectedProfile?.location || null,
          bio: selectedProfile 
            ? `${selectedProfile.name} is a ${selectedProfile.professionalBackground.toLowerCase()}.`
            : null,
          skills: selectedProfile?.skills || [],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // Store the token
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Sign up to start exploring cultural project inspirations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Quick Profile Selection */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">
                  Quick Start: Select a Sample Profile
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sampleProfiles.map((profile) => (
                    <button
                      key={profile.email}
                      type="button"
                      onClick={() => handleProfileSelect(profile)}
                      className={`p-3 text-left border rounded-lg transition-all ${
                        selectedProfile?.email === profile.email
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium text-sm">{profile.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {profile.location}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {profile.organization}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter your details
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 6 characters"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
