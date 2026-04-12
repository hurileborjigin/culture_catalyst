-- Add checklist column to ideas table
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]';
