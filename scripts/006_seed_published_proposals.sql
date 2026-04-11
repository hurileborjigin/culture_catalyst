-- Seed script: Insert sample published proposals using existing users
-- Run this in the Supabase SQL Editor after 005_create_published_proposals.sql

DO $$
DECLARE
  user_ids UUID[];
  user_names TEXT[];
  user_orgs TEXT[];
  user_locs TEXT[];
  uid UUID;
  pid UUID;
  i INT;
BEGIN
  -- Grab up to 8 existing users
  SELECT
    array_agg(id),
    array_agg(name),
    array_agg(COALESCE(organization, '')),
    array_agg(COALESCE(location, ''))
  INTO user_ids, user_names, user_orgs, user_locs
  FROM (SELECT id, name, organization, location FROM public.profiles LIMIT 8) sub;

  IF array_length(user_ids, 1) IS NULL THEN
    RAISE NOTICE 'No users found in profiles table. Seed some users first.';
    RETURN;
  END IF;

  -- Helper: pick a user index (1-based, cycling)
  -- Proposal 1: AI-Powered Interactive Art Installation
  i := 1;
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, timeline, budget, collaborators_needed, resources, challenges_and_mitigation, next_steps, status)
  VALUES (gen_random_uuid(), uid,
    'AI-Powered Interactive Art Installation: Neural Gardens',
    'Create an immersive art installation where visitors interact with AI-generated visuals that respond to movement and sound, bridging technology and artistic expression in public spaces.',
    ARRAY['Install in 3 public venues within 12 months', 'Engage 10,000+ visitors', 'Open-source the underlying AI models', 'Host workshops teaching artists to use AI tools'],
    'Democratizes access to cutting-edge AI art tools while creating shared community experiences that spark conversations about technology''s role in creative expression.',
    '{"duration":"8 months","phases":[{"name":"Development","duration":"3 months","tasks":["Build AI models","Design hardware setup","Test prototypes"]},{"name":"Installation","duration":"2 months","tasks":["Venue setup","Calibration","Soft launch"]},{"name":"Public Exhibition","duration":"3 months","tasks":["Daily operations","Workshop series","Documentation"]}]}'::jsonb,
    '{"total":"$45,000","breakdown":[{"category":"Hardware","amount":"$15,000","description":"Sensors, projectors, computing"},{"category":"Software","amount":"$12,000","description":"AI model training and interface"},{"category":"Venue","amount":"$10,000","description":"Space rental and setup"},{"category":"Marketing","amount":"$8,000","description":"Promotion and outreach"}]}'::jsonb,
    '[{"role":"Creative Technologist","skills":["Machine Learning","Creative Coding"],"priority":"required","count":2},{"role":"Installation Artist","skills":["Spatial Design","Projection Mapping"],"priority":"required","count":1}]'::jsonb,
    ARRAY['GPU computing cluster', 'Projection equipment', 'Gallery space'],
    '[{"challenge":"High computational costs for real-time AI","mitigation":"Use optimized edge models and partner with cloud providers for sponsorship"}]'::jsonb,
    ARRAY['Secure venue partnerships', 'Recruit technical team', 'Apply for arts technology grants'],
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, timeline, budget, collaborators_needed, resources, challenges_and_mitigation, next_steps, author_name, author_organization, author_location, tags, category)
  VALUES (pid, uid,
    'AI-Powered Interactive Art Installation: Neural Gardens',
    'Create an immersive art installation where visitors interact with AI-generated visuals that respond to movement and sound, bridging technology and artistic expression in public spaces.',
    ARRAY['Install in 3 public venues within 12 months', 'Engage 10,000+ visitors', 'Open-source the underlying AI models', 'Host workshops teaching artists to use AI tools'],
    'Democratizes access to cutting-edge AI art tools while creating shared community experiences that spark conversations about technology''s role in creative expression.',
    '{"duration":"8 months","phases":[{"name":"Development","duration":"3 months","tasks":["Build AI models","Design hardware setup","Test prototypes"]},{"name":"Installation","duration":"2 months","tasks":["Venue setup","Calibration","Soft launch"]},{"name":"Public Exhibition","duration":"3 months","tasks":["Daily operations","Workshop series","Documentation"]}]}'::jsonb,
    '{"total":"$45,000","breakdown":[{"category":"Hardware","amount":"$15,000","description":"Sensors, projectors, computing"},{"category":"Software","amount":"$12,000","description":"AI model training and interface"},{"category":"Venue","amount":"$10,000","description":"Space rental and setup"},{"category":"Marketing","amount":"$8,000","description":"Promotion and outreach"}]}'::jsonb,
    '[{"role":"Creative Technologist","skills":["Machine Learning","Creative Coding"],"priority":"required","count":2},{"role":"Installation Artist","skills":["Spatial Design","Projection Mapping"],"priority":"required","count":1}]'::jsonb,
    ARRAY['GPU computing cluster', 'Projection equipment', 'Gallery space'],
    '[{"challenge":"High computational costs for real-time AI","mitigation":"Use optimized edge models and partner with cloud providers for sponsorship"}]'::jsonb,
    ARRAY['Secure venue partnerships', 'Recruit technical team', 'Apply for arts technology grants'],
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1],
    ARRAY['AI', 'Interactive Art', 'Technology', 'Public Installation', 'Machine Learning', 'Community'],
    'Visual Arts');

  -- Proposal 2: Youth Music Mentorship Program
  i := 2;
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Rhythms of Heritage: Youth Music Mentorship Program',
    'Connect young musicians from underserved communities with master musicians from diverse cultural traditions.',
    ARRAY['Pair 50 youth with 20 master musicians', 'Host 4 public concerts', 'Record a collaborative album', 'Establish ongoing mentorship network'],
    'Preserves endangered musical traditions while empowering youth with artistic skills and cross-generational connections.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Rhythms of Heritage: Youth Music Mentorship Program',
    'Connect young musicians from underserved communities with master musicians from diverse cultural traditions, preserving musical heritage while fostering cross-cultural understanding.',
    ARRAY['Pair 50 youth with 20 master musicians', 'Host 4 public concerts', 'Record a collaborative album', 'Establish ongoing mentorship network'],
    'Preserves endangered musical traditions while empowering youth with artistic skills, cultural pride, and cross-generational connections that strengthen community bonds.',
    '{"total":"$35,000","breakdown":[{"category":"Mentor Stipends","amount":"$15,000","description":"Compensation for master musicians"},{"category":"Venue Rental","amount":"$8,000","description":"Rehearsal and concert spaces"},{"category":"Recording","amount":"$7,000","description":"Studio time and production"},{"category":"Instruments","amount":"$5,000","description":"Instruments for youth"}]}'::jsonb,
    '[{"role":"Program Coordinator","skills":["Youth Development","Music Education"],"priority":"required","count":1},{"role":"Sound Engineer","skills":["Audio Recording","Music Production"],"priority":"preferred","count":1}]'::jsonb,
    ARRAY['Music', 'Youth', 'Mentorship', 'Cultural Heritage', 'Community', 'Education'],
    'Music',
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 3: Environmental Documentary Series
  i := 3;
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Voices of the Land: Environmental Documentary Series',
    'Produce a documentary series amplifying Indigenous voices on environmental stewardship.',
    ARRAY['Film in 5 Indigenous communities', 'Produce 6 episodes', 'Screen at 10 film festivals', 'Create educational curriculum'],
    'Centers Indigenous perspectives in environmental discourse and creates lasting educational resources.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Voices of the Land: Environmental Documentary Series',
    'Produce a documentary series amplifying Indigenous voices on environmental stewardship, connecting traditional ecological knowledge with modern conservation efforts.',
    ARRAY['Film in 5 Indigenous communities', 'Produce 6 documentary episodes', 'Screen at 10 film festivals', 'Create educational curriculum for universities'],
    'Centers Indigenous perspectives in environmental discourse, challenges colonial narratives about land management, and creates lasting educational resources for future generations.',
    '{"total":"$85,000","breakdown":[{"category":"Production Crew","amount":"$30,000","description":"Cinematographer, sound, and director"},{"category":"Travel","amount":"$20,000","description":"Transportation and accommodation"},{"category":"Post-Production","amount":"$20,000","description":"Editing, color grading, sound mix"},{"category":"Community Compensation","amount":"$15,000","description":"Honoraria for participants"}]}'::jsonb,
    '[{"role":"Cinematographer","skills":["Documentary Filmmaking","Nature Photography"],"priority":"required","count":1},{"role":"Indigenous Liaison","skills":["Community Relations","Cultural Protocols"],"priority":"required","count":1}]'::jsonb,
    ARRAY['Documentary', 'Indigenous', 'Environment', 'Conservation', 'Film', 'Education'],
    'Film & Media',
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 4: Immigrant Food Heritage Festival
  i := 4;
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Spice Routes: Immigrant Food Heritage Festival',
    'Celebrate immigrant food traditions through a multi-day festival featuring cooking demonstrations and pop-up dining.',
    ARRAY['Feature 25 immigrant food traditions', 'Serve 3,000+ attendees', 'Document recipes in a community cookbook', 'Create ongoing monthly supper club'],
    'Honors immigrant contributions to local food culture and preserves culinary traditions at risk of being lost.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Spice Routes: Immigrant Food Heritage Festival',
    'Celebrate immigrant food traditions through a multi-day festival featuring cooking demonstrations, storytelling, and pop-up dining experiences from 20+ cultural communities.',
    ARRAY['Feature 25 immigrant food traditions', 'Serve 3,000+ attendees', 'Document recipes in a community cookbook', 'Create ongoing monthly supper club series'],
    'Honors immigrant contributions to local food culture, combats xenophobia through shared meals, and preserves culinary traditions at risk of being lost across generations.',
    '{"total":"$28,000","breakdown":[{"category":"Food & Ingredients","amount":"$10,000","description":"Ingredients and kitchen supplies"},{"category":"Venue & Equipment","amount":"$8,000","description":"Outdoor venue, tents, cooking stations"},{"category":"Cookbook","amount":"$5,000","description":"Photography, design, and printing"},{"category":"Marketing","amount":"$5,000","description":"Promotion and signage"}]}'::jsonb,
    '[{"role":"Event Producer","skills":["Festival Management","Food Safety"],"priority":"required","count":1},{"role":"Food Photographer","skills":["Food Photography","Cookbook Design"],"priority":"preferred","count":1}]'::jsonb,
    ARRAY['Food', 'Immigration', 'Cultural Heritage', 'Festival', 'Community', 'Culinary'],
    'Food & Culinary',
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 5: Community Theater for Social Change
  i := 5;
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Stories Untold: Community Theater for Social Change',
    'Develop original theater productions written and performed by community members addressing social justice issues.',
    ARRAY['Produce 3 original plays', 'Train 40 community performers', 'Reach 2,000 audience members', 'Tour to 5 community venues'],
    'Gives voice to marginalized communities through theater and builds empathy across social divides.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Stories Untold: Community Theater for Social Change',
    'Develop original theater productions written and performed by community members, addressing local social justice issues through the power of live storytelling and performance.',
    ARRAY['Produce 3 original plays', 'Train 40 community performers', 'Reach 2,000 audience members', 'Tour to 5 community venues'],
    'Gives voice to marginalized communities through theater, builds empathy across social divides, and creates a sustainable model for community-driven artistic expression.',
    '{"total":"$32,000","breakdown":[{"category":"Director & Staff","amount":"$12,000","description":"Artistic director and stage manager"},{"category":"Venue Rental","amount":"$8,000","description":"Rehearsal and performance spaces"},{"category":"Production","amount":"$7,000","description":"Sets, costumes, lighting"},{"category":"Outreach","amount":"$5,000","description":"Community outreach and promotion"}]}'::jsonb,
    '[{"role":"Stage Manager","skills":["Theater Production","Organization"],"priority":"required","count":1},{"role":"Set Designer","skills":["Scenic Design","Carpentry"],"priority":"preferred","count":1}]'::jsonb,
    ARRAY['Theater', 'Social Justice', 'Community', 'Playwriting', 'Performance', 'Education'],
    'Performing Arts',
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 6: Interactive Heritage Trail
  i := 6;
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Hidden Histories: Interactive Neighborhood Heritage Trail',
    'Create an AR-enhanced walking trail revealing hidden cultural histories through interactive storytelling and oral histories.',
    ARRAY['Document 20 cultural landmarks', 'Collect 50 oral histories', 'Develop AR mobile app', 'Attract 5,000 trail users in first year'],
    'Reclaims erased histories of immigrant and minority communities and transforms everyday spaces into sites of cultural memory.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Hidden Histories: Interactive Neighborhood Heritage Trail',
    'Create an AR-enhanced walking trail that reveals hidden cultural histories of a neighborhood through interactive storytelling, oral histories, and archival imagery at 20 landmark locations.',
    ARRAY['Research and document 20 cultural landmarks', 'Collect 50 oral histories', 'Develop AR mobile app', 'Attract 5,000 trail users in first year'],
    'Reclaims erased histories of immigrant and minority communities, transforms everyday spaces into sites of cultural memory, and engages residents as active historians of their own neighborhoods.',
    '{"total":"$42,000","breakdown":[{"category":"Research","amount":"$10,000","description":"Archival access and oral history recording"},{"category":"App Development","amount":"$18,000","description":"AR mobile application"},{"category":"Trail Infrastructure","amount":"$8,000","description":"Markers, signage, QR codes"},{"category":"Launch Events","amount":"$6,000","description":"Community events and guided tours"}]}'::jsonb,
    '[{"role":"Oral Historian","skills":["Interview Techniques","Audio Recording"],"priority":"required","count":1},{"role":"AR Developer","skills":["Mobile Development","AR Frameworks"],"priority":"required","count":1}]'::jsonb,
    ARRAY['Heritage', 'AR', 'Oral History', 'Walking Trail', 'Public History', 'Interactive'],
    'Heritage & Traditions',
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 7: Urban Mural Project
  i := 7;
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Green Canvas: Urban Mural Project for Climate Awareness',
    'Transform blank urban walls into large-scale murals addressing climate change, designed collaboratively with community members.',
    ARRAY['Paint 8 large-scale murals', 'Engage 200 community members in design workshops', 'Partner with 5 local businesses', 'Create mural walking tour map'],
    'Turns public spaces into canvases for environmental storytelling and beautifies underserved neighborhoods.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Green Canvas: Urban Mural Project for Climate Awareness',
    'Transform blank urban walls into large-scale murals addressing climate change, designed collaboratively by local artists and community members to inspire environmental action.',
    ARRAY['Paint 8 large-scale murals across the city', 'Engage 200 community members in design workshops', 'Partner with 5 local businesses for wall access', 'Create mural walking tour map'],
    'Turns public spaces into canvases for environmental storytelling, beautifies underserved neighborhoods, and creates lasting visual reminders of collective responsibility for the planet.',
    '{"total":"$38,000","breakdown":[{"category":"Artist Fees","amount":"$16,000","description":"Lead artists for 8 murals"},{"category":"Materials","amount":"$10,000","description":"Paint, primers, sealants, lifts"},{"category":"Community Engagement","amount":"$7,000","description":"Workshops and events"},{"category":"Documentation","amount":"$5,000","description":"Photography, video, and tour map"}]}'::jsonb,
    '[{"role":"Muralist","skills":["Large-Scale Painting","Community Art"],"priority":"required","count":4},{"role":"Urban Planner","skills":["Public Space Permits","Community Engagement"],"priority":"preferred","count":1}]'::jsonb,
    ARRAY['Public Art', 'Murals', 'Climate', 'Urban Design', 'Community Art', 'Environment'],
    'Visual Arts',
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 8: Korean Cultural Exchange Festival
  i := 8;
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Seoul to Portland: Korean Cultural Exchange Festival',
    'Organize a week-long festival celebrating Korean culture through traditional and contemporary art, K-pop workshops, cuisine, and design exhibitions.',
    ARRAY['Host 15 cultural events over 7 days', 'Attract 4,000 attendees', 'Feature 10 Korean and Korean-American artists', 'Establish sister-city cultural partnership'],
    'Strengthens Korean-American cultural identity and builds cross-cultural bridges through shared artistic experiences.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Seoul to Portland: Korean Cultural Exchange Festival',
    'Organize a week-long festival celebrating Korean culture through traditional and contemporary art, K-pop dance workshops, Korean cuisine, and design exhibitions connecting Korean and local communities.',
    ARRAY['Host 15 cultural events over 7 days', 'Attract 4,000 attendees', 'Feature 10 Korean and Korean-American artists', 'Establish sister-city cultural partnership'],
    'Strengthens Korean-American cultural identity, builds cross-cultural bridges through shared artistic experiences, and creates a model for diaspora community celebration.',
    '{"total":"$52,000","breakdown":[{"category":"Artist Fees & Travel","amount":"$20,000","description":"Performer and artist compensation"},{"category":"Venues","amount":"$12,000","description":"Multiple event spaces"},{"category":"Food & Catering","amount":"$10,000","description":"Korean cuisine demonstrations"},{"category":"Marketing","amount":"$10,000","description":"Bilingual promotion and media"}]}'::jsonb,
    '[{"role":"Korean Translator","skills":["Korean/English","Cultural Mediation"],"priority":"required","count":2},{"role":"Festival Producer","skills":["Event Management","Multi-venue Coordination"],"priority":"required","count":1}]'::jsonb,
    ARRAY['Korean Culture', 'Festival', 'Cultural Exchange', 'Design', 'K-pop', 'Food'],
    'Community Events',
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 9: South Asian Wellness Program
  i := 1; -- cycle back
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Wellness Through Heritage: South Asian Holistic Health Program',
    'Create a community wellness program integrating traditional South Asian healing practices with modern health education.',
    ARRAY['Offer 100 free wellness sessions', 'Train 15 community wellness ambassadors', 'Serve 500 participants', 'Publish bilingual wellness guide'],
    'Preserves South Asian wellness traditions while addressing health disparities in immigrant communities.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Wellness Through Heritage: South Asian Holistic Health Program',
    'Create a community wellness program integrating traditional South Asian healing practices like yoga, Ayurveda, and meditation with modern health education, making these traditions accessible to all.',
    ARRAY['Offer 100 free wellness sessions', 'Train 15 community wellness ambassadors', 'Serve 500 participants', 'Publish bilingual wellness guide'],
    'Preserves South Asian wellness traditions while addressing health disparities in immigrant communities, creating culturally sensitive health resources that honor ancestral knowledge.',
    '{"total":"$22,000","breakdown":[{"category":"Instructors","amount":"$10,000","description":"Yoga, Ayurveda, and meditation teachers"},{"category":"Materials","amount":"$4,000","description":"Yoga mats, herbs, printed guides"},{"category":"Venue","amount":"$5,000","description":"Community center space rental"},{"category":"Publication","amount":"$3,000","description":"Bilingual wellness guide"}]}'::jsonb,
    '[{"role":"Ayurveda Practitioner","skills":["Traditional Medicine","Health Education"],"priority":"required","count":1},{"role":"Yoga Instructor","skills":["Yoga Teaching","Accessibility"],"priority":"required","count":2}]'::jsonb,
    ARRAY['Wellness', 'South Asian', 'Yoga', 'Ayurveda', 'Health', 'Heritage'],
    'Education & Workshops',
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1]);

  -- Proposal 10: Emerging Artists Digital Exhibition
  i := 3;
  uid := user_ids[((i - 1) % array_length(user_ids, 1)) + 1];

  INSERT INTO public.proposals (id, user_id, title, vision_statement, goals, cultural_impact, status)
  VALUES (gen_random_uuid(), uid,
    'Immersive Futures: Emerging Artists Digital Exhibition',
    'Launch a hybrid physical-digital exhibition platform showcasing emerging artists working at the intersection of technology and contemporary art.',
    ARRAY['Feature 30 emerging artists', 'Attract 5,000 in-person and 20,000 virtual visitors', 'Sell 50+ artworks', 'Establish annual exhibition series'],
    'Provides visibility for underrepresented emerging artists while pioneering new exhibition formats.',
    'submitted')
  RETURNING id INTO pid;

  INSERT INTO public.published_proposals (proposal_id, user_id, title, vision_statement, goals, cultural_impact, budget, collaborators_needed, tags, category, author_name, author_organization, author_location)
  VALUES (pid, uid,
    'Immersive Futures: Emerging Artists Digital Exhibition',
    'Launch a hybrid physical-digital exhibition platform showcasing emerging artists working at the intersection of technology and contemporary art, with VR and AR components.',
    ARRAY['Feature 30 emerging artists', 'Attract 5,000 in-person and 20,000 virtual visitors', 'Sell 50+ artworks', 'Establish annual exhibition series'],
    'Provides visibility and market access for underrepresented emerging artists while pioneering new exhibition formats that make contemporary art accessible beyond traditional gallery spaces.',
    '{"total":"$60,000","breakdown":[{"category":"Artist Fees","amount":"$20,000","description":"Stipends for 30 artists"},{"category":"Technology","amount":"$18,000","description":"VR/AR development and equipment"},{"category":"Venue","amount":"$12,000","description":"Gallery rental and installation"},{"category":"Marketing","amount":"$10,000","description":"PR, social media, opening event"}]}'::jsonb,
    '[{"role":"VR Developer","skills":["Unity","3D Modeling","UX Design"],"priority":"required","count":1},{"role":"Exhibition Designer","skills":["Spatial Design","Lighting"],"priority":"required","count":1}]'::jsonb,
    ARRAY['Contemporary Art', 'VR', 'AR', 'Emerging Artists', 'Digital', 'Exhibition'],
    'Visual Arts',
    user_names[((i - 1) % array_length(user_ids, 1)) + 1],
    user_orgs[((i - 1) % array_length(user_ids, 1)) + 1],
    user_locs[((i - 1) % array_length(user_ids, 1)) + 1]);

  RAISE NOTICE 'Successfully seeded 10 published proposals!';
END $$;
