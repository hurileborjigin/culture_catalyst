-- Communication & Collaboration tables for published proposals

-- 1. Public comments on published proposals
CREATE TABLE IF NOT EXISTS public.proposal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_proposal_id UUID NOT NULL REFERENCES public.published_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposal_comments_proposal ON public.proposal_comments(published_proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_user ON public.proposal_comments(user_id);

-- 2. Collaboration requests (apply for a role on a proposal)
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_proposal_id UUID NOT NULL REFERENCES public.published_proposals(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_applied_for TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(published_proposal_id, requester_id, role_applied_for)
);

CREATE INDEX IF NOT EXISTS idx_collab_requests_proposal ON public.collaboration_requests(published_proposal_id);
CREATE INDEX IF NOT EXISTS idx_collab_requests_requester ON public.collaboration_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_collab_requests_author ON public.collaboration_requests(author_id);

DROP TRIGGER IF EXISTS update_collaboration_requests_updated_at ON public.collaboration_requests;
CREATE TRIGGER update_collaboration_requests_updated_at
  BEFORE UPDATE ON public.collaboration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Messages within a collaboration request thread
CREATE TABLE IF NOT EXISTS public.collaboration_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.collaboration_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_messages_request ON public.collaboration_messages(request_id);

-- 4. Accepted collaborators on a proposal
CREATE TABLE IF NOT EXISTS public.proposal_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_proposal_id UUID NOT NULL REFERENCES public.published_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(published_proposal_id, user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_proposal_collaborators_proposal ON public.proposal_collaborators(published_proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_collaborators_user ON public.proposal_collaborators(user_id);
