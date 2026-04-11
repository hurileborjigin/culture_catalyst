"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Briefcase, 
  MapPin, 
  Building2, 
  Sparkles,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { profile, updateProfile, isLoading: authLoading, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    professional_background: "",
    organization: "",
    workplace: "",
    location: "",
    bio: "",
    interests: [] as string[],
    skills: [] as string[],
  });

  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        professional_background: profile.professional_background || "",
        organization: profile.organization || "",
        workplace: profile.workplace || "",
        location: profile.location || "",
        bio: profile.bio || "",
        interests: profile.interests || [],
        skills: profile.skills || [],
      });
    }
  }, [profile]);

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateProfile(formData);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        professional_background: profile.professional_background || "",
        organization: profile.organization || "",
        workplace: profile.workplace || "",
        location: profile.location || "",
        bio: profile.bio || "",
        interests: profile.interests || [],
        skills: profile.skills || [],
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Your Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your profile information to get personalized inspirations
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                  />
                ) : (
                  <p className="text-sm">{formData.name || "Not set"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <p className="text-sm text-muted-foreground">{user?.email || "Not set"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              ) : (
                <p className="text-sm">{formData.bio || "No bio added yet"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Background
            </CardTitle>
            <CardDescription>
              Information about your work and expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="professional_background">Role / Title</Label>
                {isEditing ? (
                  <Input
                    id="professional_background"
                    value={formData.professional_background}
                    onChange={(e) => setFormData({ ...formData, professional_background: e.target.value })}
                    placeholder="e.g., Software Engineer, Artist, Educator"
                  />
                ) : (
                  <p className="text-sm">{formData.professional_background || "Not set"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                {isEditing ? (
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Company or organization name"
                  />
                ) : (
                  <p className="text-sm">{formData.organization || "Not set"}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workplace">Workplace</Label>
                {isEditing ? (
                  <Input
                    id="workplace"
                    value={formData.workplace}
                    onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                    placeholder="Where you work"
                  />
                ) : (
                  <p className="text-sm">{formData.workplace || "Not set"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="text-sm">{formData.location || "Not set"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Interests
            </CardTitle>
            <CardDescription>
              Topics and areas that inspire you - used to generate personalized inspiration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="gap-1">
                  {interest}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {formData.interests.length === 0 && !isEditing && (
                <p className="text-sm text-muted-foreground">No interests added yet</p>
              )}
            </div>
            {isEditing && (
              <div className="mt-4 flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInterest())}
                />
                <Button type="button" variant="outline" onClick={handleAddInterest}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Skills
            </CardTitle>
            <CardDescription>
              Your expertise and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="gap-1">
                  {skill}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {formData.skills.length === 0 && !isEditing && (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </div>
            {isEditing && (
              <div className="mt-4 flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                />
                <Button type="button" variant="outline" onClick={handleAddSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Profile Tips */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Profile Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>- Add your interests to get personalized inspiration cards</li>
              <li>- Include your professional background for relevant project suggestions</li>
              <li>- Your location helps find local events and opportunities</li>
              <li>- Skills help match you with potential collaborators</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
