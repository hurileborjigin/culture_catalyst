-- Create ideas table for user ideas (from inspiration or custom)
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inspiration_id UUID REFERENCES public.inspiration_cards(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'researching', 'researched', 'proposal_generated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create idea_research table for research results
CREATE TABLE IF NOT EXISTS public.idea_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT,
  sections JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_research ENABLE ROW LEVEL SECURITY;

-- RLS policies for ideas
CREATE POLICY "ideas_select_own" ON public.ideas 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ideas_insert_own" ON public.ideas 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ideas_update_own" ON public.ideas 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ideas_delete_own" ON public.ideas 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for idea_research
CREATE POLICY "idea_research_select_own" ON public.idea_research 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "idea_research_insert_own" ON public.idea_research 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "idea_research_update_own" ON public.idea_research 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "idea_research_delete_own" ON public.idea_research 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_research_idea_id ON public.idea_research(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_research_user_id ON public.idea_research(user_id);

-- Trigger for updated_at on ideas
DROP TRIGGER IF EXISTS update_ideas_updated_at ON public.ideas;

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
