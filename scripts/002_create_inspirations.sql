-- Create inspiration_sessions table to store batch generations
CREATE TABLE IF NOT EXISTS public.inspiration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inspiration_cards table
CREATE TABLE IF NOT EXISTS public.inspiration_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.inspiration_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  relevance_explanation TEXT,
  success_highlights TEXT[] DEFAULT '{}',
  source_url TEXT,
  location TEXT,
  tags TEXT[] DEFAULT '{}',
  saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inspiration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_cards ENABLE ROW LEVEL SECURITY;

-- RLS policies for inspiration_sessions
CREATE POLICY "inspiration_sessions_select_own" ON public.inspiration_sessions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "inspiration_sessions_insert_own" ON public.inspiration_sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "inspiration_sessions_update_own" ON public.inspiration_sessions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "inspiration_sessions_delete_own" ON public.inspiration_sessions 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for inspiration_cards
CREATE POLICY "inspiration_cards_select_own" ON public.inspiration_cards 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "inspiration_cards_insert_own" ON public.inspiration_cards 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "inspiration_cards_update_own" ON public.inspiration_cards 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "inspiration_cards_delete_own" ON public.inspiration_cards 
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inspiration_cards_session_id ON public.inspiration_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_inspiration_cards_user_id ON public.inspiration_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_inspiration_sessions_user_id ON public.inspiration_sessions(user_id);
