-- Update published proposals with richer collaborator roles (3-5 per proposal)
-- Run after 006_seed_published_proposals.sql

-- AI Art Installation: 4 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"Creative Technologist","skills":["Machine Learning","Creative Coding","Python"],"priority":"required","count":2},
  {"role":"Installation Artist","skills":["Spatial Design","Projection Mapping","3D Modeling"],"priority":"required","count":1},
  {"role":"UX Designer","skills":["Interaction Design","Prototyping","User Research"],"priority":"preferred","count":1},
  {"role":"Community Outreach Coordinator","skills":["Event Planning","Social Media","Public Speaking"],"priority":"preferred","count":1}
]'::jsonb WHERE title LIKE 'AI-Powered%';

-- Youth Music Mentorship: 4 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"Program Coordinator","skills":["Youth Development","Music Education","Scheduling"],"priority":"required","count":1},
  {"role":"Sound Engineer","skills":["Audio Recording","Music Production","Live Sound"],"priority":"required","count":1},
  {"role":"Teaching Artist","skills":["Music Performance","Mentorship","Curriculum Design"],"priority":"required","count":3},
  {"role":"Marketing Coordinator","skills":["Social Media","Graphic Design","Community Outreach"],"priority":"preferred","count":1}
]'::jsonb WHERE title LIKE 'Rhythms of Heritage%';

-- Environmental Documentary: 5 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"Cinematographer","skills":["Documentary Filmmaking","Nature Photography","Drone Operation"],"priority":"required","count":1},
  {"role":"Indigenous Liaison","skills":["Community Relations","Cultural Protocols","Translation"],"priority":"required","count":2},
  {"role":"Editor","skills":["Video Editing","Color Grading","Storytelling"],"priority":"required","count":1},
  {"role":"Sound Designer","skills":["Field Recording","Audio Post-Production","Music Licensing"],"priority":"preferred","count":1},
  {"role":"Research Assistant","skills":["Academic Research","Interviewing","Fact-Checking"],"priority":"preferred","count":2}
]'::jsonb WHERE title LIKE 'Voices of the Land%';

-- Food Heritage Festival: 4 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"Event Producer","skills":["Festival Management","Food Safety","Vendor Relations"],"priority":"required","count":1},
  {"role":"Food Photographer","skills":["Food Photography","Cookbook Design","Adobe Suite"],"priority":"required","count":1},
  {"role":"Community Chef Ambassador","skills":["Culinary Arts","Cultural Knowledge","Teaching"],"priority":"required","count":5},
  {"role":"Volunteer Coordinator","skills":["People Management","Logistics","Communication"],"priority":"preferred","count":1}
]'::jsonb WHERE title LIKE 'Spice Routes%';

-- Community Theater: 4 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"Stage Manager","skills":["Theater Production","Organization","Communication"],"priority":"required","count":1},
  {"role":"Set Designer","skills":["Scenic Design","Carpentry","CAD"],"priority":"required","count":1},
  {"role":"Workshop Facilitator","skills":["Creative Writing","Group Facilitation","Drama Therapy"],"priority":"required","count":2},
  {"role":"Lighting Designer","skills":["Stage Lighting","DMX Programming","Electrical"],"priority":"preferred","count":1}
]'::jsonb WHERE title LIKE 'Stories Untold%';

-- Heritage Trail: 5 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"Oral Historian","skills":["Interview Techniques","Audio Recording","Transcription"],"priority":"required","count":2},
  {"role":"AR Developer","skills":["Mobile Development","Unity","AR Frameworks"],"priority":"required","count":1},
  {"role":"Graphic Designer","skills":["Signage Design","Wayfinding","Print Production"],"priority":"required","count":1},
  {"role":"Community Researcher","skills":["Archival Research","Local History","Writing"],"priority":"preferred","count":2},
  {"role":"Walking Tour Guide","skills":["Public Speaking","Storytelling","Local Knowledge"],"priority":"preferred","count":3}
]'::jsonb WHERE title LIKE 'Hidden Histories%';

-- Urban Mural Project: 4 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"Lead Muralist","skills":["Large-Scale Painting","Community Art","Design"],"priority":"required","count":4},
  {"role":"Urban Planner","skills":["Public Space Permits","Community Engagement","GIS"],"priority":"required","count":1},
  {"role":"Workshop Facilitator","skills":["Art Education","Community Organizing","Youth Work"],"priority":"preferred","count":2},
  {"role":"Photographer/Videographer","skills":["Documentary Photography","Drone","Video Editing"],"priority":"preferred","count":1}
]'::jsonb WHERE title LIKE 'Green Canvas%';

-- Korean Cultural Exchange: 5 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"Korean Language Translator","skills":["Korean/English","Cultural Mediation","Written Translation"],"priority":"required","count":2},
  {"role":"Festival Producer","skills":["Event Management","Multi-venue Coordination","Budgeting"],"priority":"required","count":1},
  {"role":"K-pop Dance Instructor","skills":["Dance Choreography","K-pop Performance","Teaching"],"priority":"required","count":2},
  {"role":"Food Vendor Coordinator","skills":["Korean Cuisine","Food Safety","Vendor Management"],"priority":"preferred","count":1},
  {"role":"Graphic Designer","skills":["Bilingual Design","Print","Social Media Graphics"],"priority":"preferred","count":1}
]'::jsonb WHERE title LIKE 'Seoul to Portland%';

-- South Asian Wellness: 4 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"Ayurveda Practitioner","skills":["Traditional Medicine","Health Education","Herbalism"],"priority":"required","count":1},
  {"role":"Yoga Instructor","skills":["Yoga Teaching","Accessibility Modifications","Meditation"],"priority":"required","count":2},
  {"role":"Bilingual Health Educator","skills":["Hindi/English","Community Health","Curriculum Design"],"priority":"required","count":1},
  {"role":"Program Administrator","skills":["Grant Reporting","Scheduling","Data Collection"],"priority":"preferred","count":1}
]'::jsonb WHERE title LIKE 'Wellness Through Heritage%';

-- Emerging Artists Digital Exhibition: 4 roles
UPDATE public.published_proposals SET collaborators_needed = '[
  {"role":"VR Developer","skills":["Unity","3D Modeling","UX Design","WebXR"],"priority":"required","count":1},
  {"role":"Exhibition Designer","skills":["Spatial Design","Lighting","Art Installation"],"priority":"required","count":1},
  {"role":"Digital Marketing Manager","skills":["Social Media","PR","Art World Networks"],"priority":"preferred","count":1},
  {"role":"Technical Support","skills":["VR Hardware","Troubleshooting","Visitor Support"],"priority":"preferred","count":2}
]'::jsonb WHERE title LIKE 'Immersive Futures%';
