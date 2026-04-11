-- Create proposals table for generated project proposals
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
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
  requirements JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- RLS policies for proposals
CREATE POLICY "proposals_select_own" ON public.proposals 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "proposals_insert_own" ON public.proposals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "proposals_update_own" ON public.proposals 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "proposals_delete_own" ON public.proposals 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_idea_id ON public.proposals(idea_id);

-- Trigger for updated_at on proposals
DROP TRIGGER IF EXISTS update_proposals_updated_at ON public.proposals;

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
