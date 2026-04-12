-- Demo polish: seed comments, collaboration requests, collaborators, and messages
-- Run AFTER 006, 007, 008 seeds. Uses existing published proposals and profiles.

DO $$
DECLARE
  pub_ids UUID[];
  pub_titles TEXT[];
  user_ids UUID[];
  user_names TEXT[];
  pid UUID;
  uid UUID;
  req_id UUID;
  i INT;
BEGIN
  -- Get published proposal IDs
  SELECT array_agg(id), array_agg(title)
  INTO pub_ids, pub_titles
  FROM (SELECT id, title FROM public.published_proposals ORDER BY published_at LIMIT 10) sub;

  -- Get user IDs
  SELECT array_agg(id), array_agg(name)
  INTO user_ids, user_names
  FROM (SELECT id, name FROM public.profiles LIMIT 8) sub;

  IF pub_ids IS NULL OR user_ids IS NULL THEN
    RAISE NOTICE 'No published proposals or users found. Run seed scripts first.';
    RETURN;
  END IF;

  -- ============================================
  -- SEED COMMENTS (3-5 per proposal, from different users)
  -- ============================================

  -- Comments on proposal 1 (AI Art Installation)
  IF array_length(pub_ids, 1) >= 1 THEN
    pid := pub_ids[1];
    INSERT INTO public.proposal_comments (published_proposal_id, user_id, content, created_at) VALUES
      (pid, user_ids[((2 - 1) % array_length(user_ids, 1)) + 1], 'This is exactly the kind of project our community needs. The intersection of AI and public art could really democratize creative expression. Have you considered partnering with local makerspaces?', NOW() - INTERVAL '5 days'),
      (pid, user_ids[((3 - 1) % array_length(user_ids, 1)) + 1], 'I have experience with projection mapping installations. Would love to discuss the technical architecture — especially how you plan to handle real-time inference on edge devices.', NOW() - INTERVAL '4 days'),
      (pid, user_ids[((4 - 1) % array_length(user_ids, 1)) + 1], 'The workshop component is what excites me most. Teaching artists to use AI tools could have ripple effects far beyond this single installation.', NOW() - INTERVAL '3 days'),
      (pid, user_ids[((5 - 1) % array_length(user_ids, 1)) + 1], 'Have you looked at similar installations in Europe? The Ars Electronica festival has some great precedents for this kind of work.', NOW() - INTERVAL '2 days');
  END IF;

  -- Comments on proposal 2 (Youth Music Mentorship)
  IF array_length(pub_ids, 1) >= 2 THEN
    pid := pub_ids[2];
    INSERT INTO public.proposal_comments (published_proposal_id, user_id, content, created_at) VALUES
      (pid, user_ids[((1 - 1) % array_length(user_ids, 1)) + 1], 'I run a similar program in Chicago — happy to share our curriculum framework and lessons learned from the first two cohorts.', NOW() - INTERVAL '6 days'),
      (pid, user_ids[((4 - 1) % array_length(user_ids, 1)) + 1], 'The recording component is brilliant. Having a tangible output (album) gives the students something to show for their work and builds confidence.', NOW() - INTERVAL '4 days'),
      (pid, user_ids[((6 - 1) % array_length(user_ids, 1)) + 1], 'How are you planning to handle the mentor-mentee matching? Cultural alignment and musical style compatibility matter a lot in these programs.', NOW() - INTERVAL '2 days');
  END IF;

  -- Comments on proposal 3 (Environmental Documentary)
  IF array_length(pub_ids, 1) >= 3 THEN
    pid := pub_ids[3];
    INSERT INTO public.proposal_comments (published_proposal_id, user_id, content, created_at) VALUES
      (pid, user_ids[((2 - 1) % array_length(user_ids, 1)) + 1], 'This is crucial work. The community-led editorial process with veto power is exactly the right approach to avoid extractive filmmaking.', NOW() - INTERVAL '7 days'),
      (pid, user_ids[((5 - 1) % array_length(user_ids, 1)) + 1], 'I have connections with tribal schools that might be interested in the educational curriculum component. Let me know if you want an introduction.', NOW() - INTERVAL '5 days'),
      (pid, user_ids[((7 - 1) % array_length(user_ids, 1)) + 1], 'Would you consider including traditional ecological calendars as a framing device? It could help audiences understand the cyclical nature of Indigenous land stewardship.', NOW() - INTERVAL '3 days'),
      (pid, user_ids[((8 - 1) % array_length(user_ids, 1)) + 1], 'The budget seems tight for filming in 5 communities. Have you considered a phased approach — 2 communities first, then expanding with festival revenue?', NOW() - INTERVAL '1 day');
  END IF;

  -- Comments on proposal 4 (Food Heritage Festival)
  IF array_length(pub_ids, 1) >= 4 THEN
    pid := pub_ids[4];
    INSERT INTO public.proposal_comments (published_proposal_id, user_id, content, created_at) VALUES
      (pid, user_ids[((1 - 1) % array_length(user_ids, 1)) + 1], 'Love the cookbook idea! We did something similar with our pop-up dining series and the cookbook became our best marketing tool for the next event.', NOW() - INTERVAL '3 days'),
      (pid, user_ids[((3 - 1) % array_length(user_ids, 1)) + 1], 'Food safety compliance is the biggest challenge here. I can connect you with a health department liaison who has helped with multi-vendor cultural events before.', NOW() - INTERVAL '2 days'),
      (pid, user_ids[((6 - 1) % array_length(user_ids, 1)) + 1], 'Would be great to include a storytelling component — each chef shares the migration story behind their dish. Food is memory.', NOW() - INTERVAL '1 day');
  END IF;

  -- Comments on proposal 5 (Community Theater)
  IF array_length(pub_ids, 1) >= 5 THEN
    pid := pub_ids[5];
    INSERT INTO public.proposal_comments (published_proposal_id, user_id, content, created_at) VALUES
      (pid, user_ids[((2 - 1) % array_length(user_ids, 1)) + 1], 'The post-show discussion format is key. In our experience, thats where the real community building happens — when audiences become participants.', NOW() - INTERVAL '4 days'),
      (pid, user_ids[((7 - 1) % array_length(user_ids, 1)) + 1], 'I would love to contribute as a workshop facilitator. I have 10 years of experience with community-based theater in underserved neighborhoods.', NOW() - INTERVAL '2 days');
  END IF;

  -- ============================================
  -- SEED COLLABORATION REQUESTS (some pending, some accepted)
  -- ============================================

  -- Request on proposal 1: user 3 applies as Creative Technologist (ACCEPTED)
  IF array_length(pub_ids, 1) >= 1 AND array_length(user_ids, 1) >= 3 THEN
    pid := pub_ids[1];
    -- Get the author of this proposal
    SELECT user_id INTO uid FROM public.published_proposals WHERE id = pid;

    INSERT INTO public.collaboration_requests (published_proposal_id, requester_id, author_id, role_applied_for, message, status, created_at)
    VALUES (pid, user_ids[3], uid, 'Creative Technologist', 'I have 5 years of experience in creative coding with Processing and TouchDesigner. I have also trained custom ML models for generative art. Would love to bring my technical skills to this installation.', 'accepted', NOW() - INTERVAL '6 days')
    RETURNING id INTO req_id;

    -- Add messages in this thread
    INSERT INTO public.collaboration_messages (request_id, sender_id, content, created_at) VALUES
      (req_id, user_ids[3], 'I have 5 years of experience in creative coding with Processing and TouchDesigner. I have also trained custom ML models for generative art. Would love to bring my technical skills to this installation.', NOW() - INTERVAL '6 days'),
      (req_id, uid, 'Your portfolio is impressive! Can you share more about the edge computing work you did for that gallery in Portland?', NOW() - INTERVAL '5 days'),
      (req_id, user_ids[3], 'Of course! We used NVIDIA Jetson modules for real-time style transfer. I can run similar models for this project. Happy to do a technical demo.', NOW() - INTERVAL '5 days'),
      (req_id, uid, 'Perfect — welcome to the team! Let us set up a kickoff call this week.', NOW() - INTERVAL '4 days');

    -- Add as collaborator
    INSERT INTO public.proposal_collaborators (published_proposal_id, user_id, role, skills, joined_at)
    VALUES (pid, user_ids[3], 'Creative Technologist', ARRAY['Machine Learning', 'Creative Coding', 'Python', 'TouchDesigner'], NOW() - INTERVAL '4 days');
  END IF;

  -- Request on proposal 2: user 6 applies as Teaching Artist (PENDING)
  IF array_length(pub_ids, 1) >= 2 AND array_length(user_ids, 1) >= 6 THEN
    pid := pub_ids[2];
    SELECT user_id INTO uid FROM public.published_proposals WHERE id = pid;

    INSERT INTO public.collaboration_requests (published_proposal_id, requester_id, author_id, role_applied_for, message, status, created_at)
    VALUES (pid, user_ids[6], uid, 'Teaching Artist', 'As an artistic director with experience in community workshops, I would bring both performance expertise and mentorship skills. I have worked with youth programs for 8 years.', 'pending', NOW() - INTERVAL '2 days')
    RETURNING id INTO req_id;

    INSERT INTO public.collaboration_messages (request_id, sender_id, content, created_at) VALUES
      (req_id, user_ids[6], 'As an artistic director with experience in community workshops, I would bring both performance expertise and mentorship skills. I have worked with youth programs for 8 years.', NOW() - INTERVAL '2 days'),
      (req_id, uid, 'Thanks for applying! Your theater background could bring a unique cross-disciplinary perspective. Can you tell me more about the age groups you have worked with?', NOW() - INTERVAL '1 day');
  END IF;

  -- Request on proposal 3: user 5 applies as Research Assistant (ACCEPTED)
  IF array_length(pub_ids, 1) >= 3 AND array_length(user_ids, 1) >= 5 THEN
    pid := pub_ids[3];
    SELECT user_id INTO uid FROM public.published_proposals WHERE id = pid;

    INSERT INTO public.collaboration_requests (published_proposal_id, requester_id, author_id, role_applied_for, message, status, created_at)
    VALUES (pid, user_ids[5], uid, 'Research Assistant', 'My background in culinary cultural exchange has given me deep experience with community-based participatory research. I speak Spanish fluently and have worked in Latin American communities.', 'accepted', NOW() - INTERVAL '8 days')
    RETURNING id INTO req_id;

    INSERT INTO public.collaboration_messages (request_id, sender_id, content, created_at) VALUES
      (req_id, user_ids[5], 'My background in culinary cultural exchange has given me deep experience with community-based participatory research. I speak Spanish fluently and have worked in Latin American communities.', NOW() - INTERVAL '8 days'),
      (req_id, uid, 'Your language skills and community research experience are exactly what we need. Welcome aboard!', NOW() - INTERVAL '7 days');

    INSERT INTO public.proposal_collaborators (published_proposal_id, user_id, role, skills, joined_at)
    VALUES (pid, user_ids[5], 'Research Assistant', ARRAY['Community Research', 'Spanish', 'Interviewing', 'Cultural Competency'], NOW() - INTERVAL '7 days');
  END IF;

  -- Request on proposal 4: user 8 applies as Food Photographer (PENDING)
  IF array_length(pub_ids, 1) >= 4 AND array_length(user_ids, 1) >= 8 THEN
    pid := pub_ids[4];
    SELECT user_id INTO uid FROM public.published_proposals WHERE id = pid;

    INSERT INTO public.collaboration_requests (published_proposal_id, requester_id, author_id, role_applied_for, message, status, created_at)
    VALUES (pid, user_ids[8], uid, 'Food Photographer', 'I am a designer with strong photography skills and experience shooting food for editorial publications. The cookbook component really excites me.', 'pending', NOW() - INTERVAL '1 day')
    RETURNING id INTO req_id;

    INSERT INTO public.collaboration_messages (request_id, sender_id, content, created_at) VALUES
      (req_id, user_ids[8], 'I am a designer with strong photography skills and experience shooting food for editorial publications. The cookbook component really excites me.', NOW() - INTERVAL '1 day');
  END IF;

  -- Request on proposal 7: user 1 applies as Urban Planner (ACCEPTED)
  IF array_length(pub_ids, 1) >= 7 AND array_length(user_ids, 1) >= 1 THEN
    pid := pub_ids[7];
    SELECT user_id INTO uid FROM public.published_proposals WHERE id = pid;

    INSERT INTO public.collaboration_requests (published_proposal_id, requester_id, author_id, role_applied_for, message, status, created_at)
    VALUES (pid, user_ids[1], uid, 'Urban Planner', 'I have experience with public space permits and community engagement in the Bay Area. The climate mural concept aligns perfectly with sustainability initiatives I have been involved in.', 'accepted', NOW() - INTERVAL '10 days')
    RETURNING id INTO req_id;

    INSERT INTO public.collaboration_messages (request_id, sender_id, content, created_at) VALUES
      (req_id, user_ids[1], 'I have experience with public space permits and community engagement in the Bay Area. The climate mural concept aligns perfectly with sustainability initiatives I have been involved in.', NOW() - INTERVAL '10 days'),
      (req_id, uid, 'That is fantastic — permit navigation is one of our biggest challenges. Your experience would be invaluable.', NOW() - INTERVAL '9 days'),
      (req_id, user_ids[1], 'I can also connect you with building owners who have previously donated wall space for public art. Happy to start mapping potential locations.', NOW() - INTERVAL '9 days'),
      (req_id, uid, 'Amazing, you are already thinking ahead! Welcome to Green Canvas.', NOW() - INTERVAL '8 days');

    INSERT INTO public.proposal_collaborators (published_proposal_id, user_id, role, skills, joined_at)
    VALUES (pid, user_ids[1], 'Urban Planner', ARRAY['Public Space Permits', 'Community Engagement', 'GIS', 'Project Management'], NOW() - INTERVAL '8 days');
  END IF;

  -- Update collaborators_needed counts for accepted collaborators
  -- Proposal 1: decrement Creative Technologist count
  IF array_length(pub_ids, 1) >= 1 THEN
    UPDATE public.published_proposals
    SET collaborators_needed = (
      SELECT jsonb_agg(
        CASE
          WHEN elem->>'role' = 'Creative Technologist'
          THEN jsonb_set(elem, '{count}', to_jsonb(GREATEST((elem->>'count')::int - 1, 0)))
          ELSE elem
        END
      )
      FROM jsonb_array_elements(collaborators_needed) elem
    )
    WHERE id = pub_ids[1];
  END IF;

  -- Proposal 3: decrement Research Assistant count
  IF array_length(pub_ids, 1) >= 3 THEN
    UPDATE public.published_proposals
    SET collaborators_needed = (
      SELECT jsonb_agg(
        CASE
          WHEN elem->>'role' = 'Research Assistant'
          THEN jsonb_set(elem, '{count}', to_jsonb(GREATEST((elem->>'count')::int - 1, 0)))
          ELSE elem
        END
      )
      FROM jsonb_array_elements(collaborators_needed) elem
    )
    WHERE id = pub_ids[3];
  END IF;

  RAISE NOTICE 'Successfully seeded demo interactions: comments, collaboration requests, collaborators, and messages!';
END $$;
