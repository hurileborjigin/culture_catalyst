-- Additional published proposals for demo diversity
-- Run AFTER 006_seed_published_proposals.sql

DO $$
DECLARE
  user_ids UUID[];
  user_names TEXT[];
  user_orgs TEXT[];
  user_locs TEXT[];
  uid UUID;
  pid UUID;
BEGIN
  SELECT
    array_agg(id), array_agg(name),
    array_agg(COALESCE(organization, '')),
    array_agg(COALESCE(location, ''))
  INTO user_ids, user_names, user_orgs, user_locs
  FROM (SELECT id, name, organization, location FROM public.profiles LIMIT 8) sub;

  IF user_ids IS NULL THEN
    RAISE NOTICE 'No users found.';
    RETURN;
  END IF;

  -- Proposal 11: Digital Storytelling for Elders
  uid := user_ids[((3 - 1) % array_length(user_ids, 1)) + 1];
  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Digital Memory Keepers: Elder Storytelling Archive',
    'Train seniors to record and share their life stories through digital media, creating an intergenerational oral history archive.',
    ARRAY['Train 30 elders in digital storytelling', 'Produce 50 video stories', 'Build searchable online archive', 'Host 3 intergenerational screening events'],
    'Preserves community memory, combats elder isolation, and creates bridges between generations through shared storytelling.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Digital Memory Keepers: Elder Storytelling Archive',
    'Train seniors to record and share their life stories through digital media, creating an intergenerational oral history archive accessible to future generations.',
    ARRAY['Train 30 elders in digital storytelling', 'Produce 50 video stories', 'Build searchable online archive', 'Host 3 intergenerational screening events'],
    'Preserves community memory, combats elder isolation, and creates bridges between generations through shared storytelling.',
    '{"total":"$25,000","breakdown":[{"category":"Equipment","amount":"$8,000","description":"Cameras, microphones, tablets"},{"category":"Trainers","amount":"$7,000","description":"Digital literacy instructors"},{"category":"Platform","amount":"$6,000","description":"Archive website development"},{"category":"Events","amount":"$4,000","description":"Screening events and exhibitions"}]}'::jsonb,
    '[{"role":"Digital Literacy Trainer","skills":["Teaching Seniors","Video Production","Patience"],"priority":"required","count":2},{"role":"Web Developer","skills":["React","Video Hosting","Accessibility"],"priority":"required","count":1},{"role":"Community Liaison","skills":["Elder Care","Community Outreach","Scheduling"],"priority":"preferred","count":1},{"role":"Video Editor","skills":["Storytelling","Adobe Premiere","Subtitling"],"priority":"preferred","count":2}]'::jsonb,
    ARRAY['Elder Care', 'Digital Storytelling', 'Oral History', 'Intergenerational', 'Archive', 'Community'],
    'Education & Workshops',
    user_names[((3 - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((3 - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((3 - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 12: Accessible Arts Festival
  uid := user_ids[((5 - 1) % array_length(user_ids, 1)) + 1];
  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Art Without Barriers: Accessible Cultural Festival',
    'Design a fully accessible multi-arts festival that sets new standards for inclusive cultural events.',
    ARRAY['100% wheelchair accessible venues', 'Sign language interpretation at all events', 'Sensory-friendly performances', 'Employ 20 disabled artists as headliners'],
    'Challenges the cultural sector to rethink accessibility as creative opportunity rather than compliance burden.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Art Without Barriers: Accessible Cultural Festival',
    'Design a fully accessible multi-arts festival that sets new standards for inclusive cultural events, featuring disabled artists as headliners and reimagining what accessibility means in the arts.',
    ARRAY['100% wheelchair accessible venues', 'Sign language interpretation at all events', 'Sensory-friendly performances', 'Employ 20 disabled artists as headliners'],
    'Challenges the cultural sector to rethink accessibility as creative opportunity rather than compliance burden.',
    '{"total":"$65,000","breakdown":[{"category":"Artist Fees","amount":"$25,000","description":"Disabled artist headliners and performers"},{"category":"Accessibility","amount":"$15,000","description":"Sign language, audio description, ramps"},{"category":"Venues","amount":"$15,000","description":"Accessible venue rental"},{"category":"Marketing","amount":"$10,000","description":"Inclusive marketing campaign"}]}'::jsonb,
    '[{"role":"Accessibility Consultant","skills":["ADA Compliance","Universal Design","Disability Advocacy"],"priority":"required","count":1},{"role":"Sign Language Interpreter","skills":["ASL","Performance Interpretation","Cultural Events"],"priority":"required","count":3},{"role":"Sensory Design Specialist","skills":["Sensory Processing","Quiet Spaces","Visual Design"],"priority":"preferred","count":1},{"role":"Disabled Artist Liaison","skills":["Disability Community Networks","Artist Relations","Advocacy"],"priority":"required","count":1}]'::jsonb,
    ARRAY['Accessibility', 'Disability', 'Inclusive Arts', 'Festival', 'Universal Design'],
    'Community Events',
    user_names[((5 - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((5 - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((5 - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 13: Youth Climate Art Residency
  uid := user_ids[((7 - 1) % array_length(user_ids, 1)) + 1];
  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Climate Futures: Youth Artist Residency Program',
    'A 3-month residency for young artists (18-25) to create work responding to the climate crisis, mentored by established environmental artists.',
    ARRAY['Select 10 resident artists', 'Produce a group exhibition', 'Publish a zine of climate art', 'Create public installations in 3 parks'],
    'Empowers the next generation of artists to use creativity as a tool for climate communication and activism.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Climate Futures: Youth Artist Residency Program',
    'A 3-month residency for young artists (18-25) to create work responding to the climate crisis, mentored by established environmental artists and scientists.',
    ARRAY['Select 10 resident artists', 'Produce a group exhibition', 'Publish a zine of climate art', 'Create public installations in 3 parks'],
    'Empowers the next generation of artists to use creativity as a tool for climate communication and activism.',
    '{"total":"$48,000","breakdown":[{"category":"Artist Stipends","amount":"$20,000","description":"Monthly stipends for 10 residents"},{"category":"Materials","amount":"$10,000","description":"Art supplies and fabrication"},{"category":"Mentors","amount":"$8,000","description":"Mentor artist fees"},{"category":"Exhibition","amount":"$10,000","description":"Exhibition production and zine printing"}]}'::jsonb,
    '[{"role":"Environmental Scientist Mentor","skills":["Climate Science","Public Communication","Mentorship"],"priority":"required","count":2},{"role":"Studio Manager","skills":["Art Studio Operations","Safety","Scheduling"],"priority":"required","count":1},{"role":"Zine Designer","skills":["Graphic Design","Risograph","Editorial"],"priority":"preferred","count":1},{"role":"Park Liaison","skills":["Public Land Permits","Outdoor Installation","Community Relations"],"priority":"preferred","count":1}]'::jsonb,
    ARRAY['Climate', 'Youth', 'Residency', 'Environmental Art', 'Activism', 'Zine'],
    'Environment & Sustainability',
    user_names[((7 - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((7 - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((7 - 1) % array_length(user_ids, 1)) + 1]);

  RAISE NOTICE 'Added 3 additional published proposals for demo diversity!';
END $$;
