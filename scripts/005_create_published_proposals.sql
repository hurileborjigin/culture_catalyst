-- Ensure the updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create published_proposals table for globally visible proposals
CREATE TABLE IF NOT EXISTS public.published_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Denormalized proposal content (snapshot at publish time)
  title TEXT NOT NULL,
  vision_statement TEXT,
  goals TEXT[] DEFAULT '{}',
  cultural_impact TEXT,
  timeline JSONB,
  budget JSONB,
  collaborators_needed JSONB DEFAULT '[]',
  resources TEXT[] DEFAULT '{}',
  challenges_and_mitigation JSONB DEFAULT '[]',
  next_steps TEXT[] DEFAULT '{}',

  -- Author snapshot
  author_name TEXT NOT NULL,
  author_organization TEXT,
  author_location TEXT,

  -- Discovery metadata
  tags TEXT[] DEFAULT '{}',
  category TEXT,

  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.published_proposals ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read published proposals
CREATE POLICY "published_proposals_select_all" ON public.published_proposals
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only author can insert
CREATE POLICY "published_proposals_insert_own" ON public.published_proposals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only author can update
CREATE POLICY "published_proposals_update_own" ON public.published_proposals
  FOR UPDATE USING (auth.uid() = user_id);

-- Only author can delete
CREATE POLICY "published_proposals_delete_own" ON public.published_proposals
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_published_proposals_user_id ON public.published_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_published_proposals_category ON public.published_proposals(category);
CREATE INDEX IF NOT EXISTS idx_published_proposals_published_at ON public.published_proposals(published_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_published_proposals_updated_at ON public.published_proposals;
CREATE TRIGGER update_published_proposals_updated_at
  BEFORE UPDATE ON public.published_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create proposal_recommendations table for cached LLM-scored recommendations
CREATE TABLE IF NOT EXISTS public.proposal_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  published_proposal_id UUID NOT NULL REFERENCES public.published_proposals(id) ON DELETE CASCADE,
  relevance_score FLOAT NOT NULL DEFAULT 0,
  relevance_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, published_proposal_id)
);

-- Enable RLS
ALTER TABLE public.proposal_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own recommendations
CREATE POLICY "proposal_recommendations_select_own" ON public.proposal_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "proposal_recommendations_insert_own" ON public.proposal_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "proposal_recommendations_delete_own" ON public.proposal_recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposal_recommendations_user_id ON public.proposal_recommendations(user_id);
