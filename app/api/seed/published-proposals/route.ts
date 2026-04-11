import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getUserIdFromRequest(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId || null;
}

const SAMPLE_PROPOSALS = [
  {
    title: "AI-Powered Interactive Art Installation: Neural Gardens",
    vision_statement: "Create an immersive art installation where visitors interact with AI-generated visuals that respond to movement and sound, bridging technology and artistic expression in public spaces.",
    goals: ["Install in 3 public venues within 12 months", "Engage 10,000+ visitors", "Open-source the underlying AI models", "Host workshops teaching artists to use AI tools"],
    cultural_impact: "Democratizes access to cutting-edge AI art tools while creating shared community experiences that spark conversations about technology's role in creative expression.",
    timeline: { duration: "8 months", phases: [{ name: "Development", duration: "3 months", tasks: ["Build AI models", "Design hardware setup", "Test prototypes"] }, { name: "Installation", duration: "2 months", tasks: ["Venue setup", "Calibration", "Soft launch"] }, { name: "Public Exhibition", duration: "3 months", tasks: ["Daily operations", "Workshop series", "Documentation"] }] },
    budget: { total: "$45,000", breakdown: [{ category: "Hardware", amount: "$15,000", description: "Sensors, projectors, computing" }, { category: "Software Development", amount: "$12,000", description: "AI model training and interface" }, { category: "Venue & Installation", amount: "$10,000", description: "Space rental and setup" }, { category: "Marketing", amount: "$8,000", description: "Promotion and outreach" }] },
    collaborators_needed: [{ role: "Creative Technologist", skills: ["Machine Learning", "Creative Coding"], priority: "required", count: 2 }, { role: "Installation Artist", skills: ["Spatial Design", "Projection Mapping"], priority: "required", count: 1 }],
    resources: ["GPU computing cluster", "Projection equipment", "Gallery space"],
    challenges_and_mitigation: [{ challenge: "High computational costs for real-time AI", mitigation: "Use optimized edge models and partner with cloud providers for sponsorship" }],
    next_steps: ["Secure venue partnerships", "Recruit technical team", "Apply for arts technology grants"],
    tags: ["AI", "Interactive Art", "Technology", "Public Installation", "Machine Learning", "Community"],
    category: "Visual Arts",
  },
  {
    title: "Rhythms of Heritage: Youth Music Mentorship Program",
    vision_statement: "Connect young musicians from underserved communities with master musicians from diverse cultural traditions, preserving musical heritage while fostering cross-cultural understanding.",
    goals: ["Pair 50 youth with 20 master musicians", "Host 4 public concerts showcasing student work", "Record an album of collaborative pieces", "Establish ongoing mentorship network"],
    cultural_impact: "Preserves endangered musical traditions while empowering youth with artistic skills, cultural pride, and cross-generational connections that strengthen community bonds.",
    timeline: { duration: "12 months", phases: [{ name: "Recruitment", duration: "2 months", tasks: ["Identify master musicians", "Youth outreach", "Match mentors and mentees"] }, { name: "Mentorship Sessions", duration: "8 months", tasks: ["Weekly lessons", "Monthly group workshops", "Recording sessions"] }, { name: "Showcase", duration: "2 months", tasks: ["Concert preparation", "Album production", "Community celebration"] }] },
    budget: { total: "$35,000", breakdown: [{ category: "Mentor Stipends", amount: "$15,000", description: "Compensation for master musicians" }, { category: "Venue Rental", amount: "$8,000", description: "Rehearsal and concert spaces" }, { category: "Recording", amount: "$7,000", description: "Studio time and production" }, { category: "Instruments & Materials", amount: "$5,000", description: "Instruments for youth participants" }] },
    collaborators_needed: [{ role: "Program Coordinator", skills: ["Youth Development", "Music Education"], priority: "required", count: 1 }, { role: "Sound Engineer", skills: ["Audio Recording", "Music Production"], priority: "preferred", count: 1 }],
    resources: ["Rehearsal space", "Recording studio access", "Musical instruments"],
    challenges_and_mitigation: [{ challenge: "Retaining youth engagement over 12 months", mitigation: "Gamified milestones, peer cohorts, and visible progress through recordings and performances" }],
    next_steps: ["Partner with local schools and community centers", "Identify master musicians", "Secure rehearsal venues"],
    tags: ["Music", "Youth", "Mentorship", "Cultural Heritage", "Community", "Education"],
    category: "Music",
  },
  {
    title: "Voices of the Land: Environmental Documentary Series",
    vision_statement: "Produce a documentary series amplifying Indigenous voices on environmental stewardship, connecting traditional ecological knowledge with modern conservation efforts.",
    goals: ["Film in 5 Indigenous communities", "Produce 6 documentary episodes", "Screen at 10 film festivals", "Create educational curriculum for universities"],
    cultural_impact: "Centers Indigenous perspectives in environmental discourse, challenges colonial narratives about land management, and creates lasting educational resources for future generations.",
    timeline: { duration: "18 months", phases: [{ name: "Pre-Production", duration: "4 months", tasks: ["Community consultations", "Research", "Secure filming permissions"] }, { name: "Production", duration: "8 months", tasks: ["On-location filming", "Interviews", "B-roll capture"] }, { name: "Post-Production", duration: "6 months", tasks: ["Editing", "Sound design", "Festival submissions"] }] },
    budget: { total: "$85,000", breakdown: [{ category: "Production Crew", amount: "$30,000", description: "Cinematographer, sound, and director" }, { category: "Travel", amount: "$20,000", description: "Transportation and accommodation" }, { category: "Post-Production", amount: "$20,000", description: "Editing, color grading, sound mix" }, { category: "Community Compensation", amount: "$15,000", description: "Honoraria for participants and communities" }] },
    collaborators_needed: [{ role: "Cinematographer", skills: ["Documentary Filmmaking", "Nature Photography"], priority: "required", count: 1 }, { role: "Indigenous Liaison", skills: ["Community Relations", "Cultural Protocols"], priority: "required", count: 1 }, { role: "Editor", skills: ["Video Editing", "Storytelling"], priority: "preferred", count: 1 }],
    resources: ["Camera equipment", "Editing suite", "Distribution platform"],
    challenges_and_mitigation: [{ challenge: "Ensuring authentic representation without exploitation", mitigation: "Community-led editorial process with veto power for participating communities" }],
    next_steps: ["Begin community consultations", "Assemble production team", "Apply for documentary film grants"],
    tags: ["Documentary", "Indigenous", "Environment", "Conservation", "Film", "Education"],
    category: "Film & Media",
  },
  {
    title: "Immersive Futures: Emerging Artists Digital Exhibition",
    vision_statement: "Launch a hybrid physical-digital exhibition platform showcasing emerging artists working at the intersection of technology and contemporary art, with VR and AR components.",
    goals: ["Feature 30 emerging artists", "Attract 5,000 in-person and 20,000 virtual visitors", "Sell 50+ artworks", "Establish annual exhibition series"],
    cultural_impact: "Provides visibility and market access for underrepresented emerging artists while pioneering new exhibition formats that make contemporary art accessible beyond traditional gallery spaces.",
    timeline: { duration: "6 months", phases: [{ name: "Curation", duration: "2 months", tasks: ["Open call for artists", "Jury selection", "Digital asset preparation"] }, { name: "Build", duration: "2 months", tasks: ["Physical installation", "VR environment development", "AR overlay creation"] }, { name: "Exhibition", duration: "2 months", tasks: ["Opening reception", "Artist talks", "Virtual tours"] }] },
    budget: { total: "$60,000", breakdown: [{ category: "Artist Fees", amount: "$20,000", description: "Stipends for 30 participating artists" }, { category: "Technology", amount: "$18,000", description: "VR/AR development and equipment" }, { category: "Venue", amount: "$12,000", description: "Gallery rental and installation" }, { category: "Marketing", amount: "$10,000", description: "PR, social media, and opening event" }] },
    collaborators_needed: [{ role: "VR Developer", skills: ["Unity", "3D Modeling", "UX Design"], priority: "required", count: 1 }, { role: "Exhibition Designer", skills: ["Spatial Design", "Lighting"], priority: "required", count: 1 }],
    resources: ["Gallery space", "VR headsets", "High-speed internet"],
    challenges_and_mitigation: [{ challenge: "Technical barriers for virtual visitors", mitigation: "Offer browser-based 3D experience alongside full VR for accessibility" }],
    next_steps: ["Secure gallery partnership", "Launch open call for artists", "Begin VR platform development"],
    tags: ["Contemporary Art", "VR", "AR", "Emerging Artists", "Digital", "Exhibition"],
    category: "Visual Arts",
  },
  {
    title: "Spice Routes: Immigrant Food Heritage Festival",
    vision_statement: "Celebrate immigrant food traditions through a multi-day festival featuring cooking demonstrations, storytelling, and pop-up dining experiences from 20+ cultural communities.",
    goals: ["Feature 25 immigrant food traditions", "Serve 3,000+ attendees", "Document recipes in a community cookbook", "Create ongoing monthly supper club series"],
    cultural_impact: "Honors immigrant contributions to local food culture, combats xenophobia through shared meals, and preserves culinary traditions at risk of being lost across generations.",
    timeline: { duration: "5 months", phases: [{ name: "Planning", duration: "2 months", tasks: ["Recruit community chefs", "Secure venue", "Plan logistics"] }, { name: "Preparation", duration: "2 months", tasks: ["Menu development", "Cookbook photography", "Marketing campaign"] }, { name: "Festival", duration: "1 month", tasks: ["3-day festival execution", "Cookbook launch", "Supper club kickoff"] }] },
    budget: { total: "$28,000", breakdown: [{ category: "Food & Ingredients", amount: "$10,000", description: "Ingredients and kitchen supplies" }, { category: "Venue & Equipment", amount: "$8,000", description: "Outdoor venue, tents, cooking stations" }, { category: "Cookbook Production", amount: "$5,000", description: "Photography, design, and printing" }, { category: "Marketing", amount: "$5,000", description: "Promotion and signage" }] },
    collaborators_needed: [{ role: "Event Producer", skills: ["Festival Management", "Food Safety"], priority: "required", count: 1 }, { role: "Food Photographer", skills: ["Food Photography", "Cookbook Design"], priority: "preferred", count: 1 }],
    resources: ["Outdoor venue", "Commercial kitchen access", "Cooking equipment"],
    challenges_and_mitigation: [{ challenge: "Food safety compliance for multi-vendor event", mitigation: "Partner with local health department for pre-event inspections and volunteer food safety training" }],
    next_steps: ["Identify community chef ambassadors", "Secure outdoor venue", "Begin cookbook planning"],
    tags: ["Food", "Immigration", "Cultural Heritage", "Festival", "Community", "Culinary"],
    category: "Food & Culinary",
  },
];

const SAMPLE_PROPOSALS_2 = [
  {
    title: "Stories Untold: Community Theater for Social Change",
    vision_statement: "Develop original theater productions written and performed by community members, addressing local social justice issues through the power of live storytelling and performance.",
    goals: ["Produce 3 original plays", "Train 40 community performers", "Reach 2,000 audience members", "Tour to 5 community venues"],
    cultural_impact: "Gives voice to marginalized communities through theater, builds empathy across social divides, and creates a sustainable model for community-driven artistic expression.",
    timeline: { duration: "10 months", phases: [{ name: "Workshop & Writing", duration: "4 months", tasks: ["Community writing workshops", "Script development", "Casting"] }, { name: "Rehearsal", duration: "3 months", tasks: ["Blocking and staging", "Technical rehearsals", "Dress rehearsals"] }, { name: "Performance Tour", duration: "3 months", tasks: ["Opening night", "Community venue tour", "Post-show discussions"] }] },
    budget: { total: "$32,000", breakdown: [{ category: "Director & Staff", amount: "$12,000", description: "Artistic director and stage manager" }, { category: "Venue Rental", amount: "$8,000", description: "Rehearsal and performance spaces" }, { category: "Production", amount: "$7,000", description: "Sets, costumes, lighting" }, { category: "Marketing & Outreach", amount: "$5,000", description: "Community outreach and promotion" }] },
    collaborators_needed: [{ role: "Stage Manager", skills: ["Theater Production", "Organization"], priority: "required", count: 1 }, { role: "Set Designer", skills: ["Scenic Design", "Carpentry"], priority: "preferred", count: 1 }],
    resources: ["Theater space", "Lighting and sound equipment", "Costume workshop"],
    challenges_and_mitigation: [{ challenge: "Engaging community members with no theater experience", mitigation: "Low-barrier workshops, buddy system pairing newcomers with experienced performers" }],
    next_steps: ["Partner with community organizations", "Hire artistic director", "Launch community writing workshops"],
    tags: ["Theater", "Social Justice", "Community", "Playwriting", "Performance", "Education"],
    category: "Performing Arts",
  },
  {
    title: "Hidden Histories: Interactive Neighborhood Heritage Trail",
    vision_statement: "Create an AR-enhanced walking trail that reveals hidden cultural histories of a neighborhood through interactive storytelling, oral histories, and archival imagery at 20 landmark locations.",
    goals: ["Research and document 20 cultural landmarks", "Collect 50 oral histories", "Develop AR mobile app", "Attract 5,000 trail users in first year"],
    cultural_impact: "Reclaims erased histories of immigrant and minority communities, transforms everyday spaces into sites of cultural memory, and engages residents as active historians of their own neighborhoods.",
    timeline: { duration: "9 months", phases: [{ name: "Research", duration: "3 months", tasks: ["Archival research", "Oral history collection", "Landmark identification"] }, { name: "Development", duration: "4 months", tasks: ["AR app development", "Content creation", "Trail marker installation"] }, { name: "Launch", duration: "2 months", tasks: ["Community launch event", "Guided tours", "School partnerships"] }] },
    budget: { total: "$42,000", breakdown: [{ category: "Research", amount: "$10,000", description: "Archival access and oral history recording" }, { category: "App Development", amount: "$18,000", description: "AR mobile application" }, { category: "Trail Infrastructure", amount: "$8,000", description: "Markers, signage, QR codes" }, { category: "Launch Events", amount: "$6,000", description: "Community events and guided tours" }] },
    collaborators_needed: [{ role: "Oral Historian", skills: ["Interview Techniques", "Audio Recording"], priority: "required", count: 1 }, { role: "AR Developer", skills: ["Mobile Development", "AR Frameworks"], priority: "required", count: 1 }],
    resources: ["Archival access", "Recording equipment", "Trail markers"],
    challenges_and_mitigation: [{ challenge: "Ensuring historical accuracy while keeping content engaging", mitigation: "Community review board with historians and neighborhood elders for fact-checking" }],
    next_steps: ["Form community advisory board", "Begin archival research", "Scope AR app requirements"],
    tags: ["Heritage", "AR", "Oral History", "Walking Trail", "Public History", "Interactive"],
    category: "Heritage & Traditions",
  },
  {
    title: "Green Canvas: Urban Mural Project for Climate Awareness",
    vision_statement: "Transform blank urban walls into large-scale murals addressing climate change, designed collaboratively by local artists and community members to inspire environmental action.",
    goals: ["Paint 8 large-scale murals across the city", "Engage 200 community members in design workshops", "Partner with 5 local businesses for wall access", "Create mural walking tour map"],
    cultural_impact: "Turns public spaces into canvases for environmental storytelling, beautifies underserved neighborhoods, and creates lasting visual reminders of collective responsibility for the planet.",
    timeline: { duration: "7 months", phases: [{ name: "Design", duration: "2 months", tasks: ["Community design workshops", "Artist selection", "Wall site agreements"] }, { name: "Painting", duration: "4 months", tasks: ["Surface preparation", "Mural painting", "Community paint days"] }, { name: "Celebration", duration: "1 month", tasks: ["Mural unveiling events", "Walking tour launch", "Documentation"] }] },
    budget: { total: "$38,000", breakdown: [{ category: "Artist Fees", amount: "$16,000", description: "Lead artists for 8 murals" }, { category: "Materials", amount: "$10,000", description: "Paint, primers, sealants, lifts" }, { category: "Community Engagement", amount: "$7,000", description: "Workshops and events" }, { category: "Documentation", amount: "$5,000", description: "Photography, video, and tour map" }] },
    collaborators_needed: [{ role: "Muralist", skills: ["Large-Scale Painting", "Community Art"], priority: "required", count: 4 }, { role: "Urban Planner", skills: ["Public Space Permits", "Community Engagement"], priority: "preferred", count: 1 }],
    resources: ["Scaffolding and lifts", "Weather-resistant paint", "Wall access agreements"],
    challenges_and_mitigation: [{ challenge: "Weather delays during outdoor painting", mitigation: "Flexible scheduling with buffer weeks and indoor design work during rain periods" }],
    next_steps: ["Identify wall locations", "Recruit lead muralists", "Launch community design workshops"],
    tags: ["Public Art", "Murals", "Climate", "Urban Design", "Community Art", "Environment"],
    category: "Visual Arts",
  },
  {
    title: "Seoul to Portland: Korean Cultural Exchange Festival",
    vision_statement: "Organize a week-long festival celebrating Korean culture through traditional and contemporary art, K-pop dance workshops, Korean cuisine, and design exhibitions connecting Korean and local communities.",
    goals: ["Host 15 cultural events over 7 days", "Attract 4,000 attendees", "Feature 10 Korean and Korean-American artists", "Establish sister-city cultural partnership"],
    cultural_impact: "Strengthens Korean-American cultural identity, builds cross-cultural bridges through shared artistic experiences, and creates a model for diaspora community celebration.",
    timeline: { duration: "6 months", phases: [{ name: "Planning", duration: "3 months", tasks: ["Artist recruitment", "Venue booking", "Sponsorship outreach"] }, { name: "Preparation", duration: "2 months", tasks: ["Marketing campaign", "Logistics coordination", "Volunteer training"] }, { name: "Festival Week", duration: "1 month", tasks: ["Daily events", "Pop-up exhibitions", "Closing ceremony"] }] },
    budget: { total: "$52,000", breakdown: [{ category: "Artist Fees & Travel", amount: "$20,000", description: "Performer and artist compensation" }, { category: "Venues", amount: "$12,000", description: "Multiple event spaces" }, { category: "Food & Catering", amount: "$10,000", description: "Korean cuisine demonstrations and tastings" }, { category: "Marketing", amount: "$10,000", description: "Bilingual promotion and media" }] },
    collaborators_needed: [{ role: "Korean Language Translator", skills: ["Korean/English", "Cultural Mediation"], priority: "required", count: 2 }, { role: "Festival Producer", skills: ["Event Management", "Multi-venue Coordination"], priority: "required", count: 1 }],
    resources: ["Multiple venue spaces", "Sound and lighting equipment", "Commercial kitchen"],
    challenges_and_mitigation: [{ challenge: "Coordinating across language barriers", mitigation: "Bilingual volunteer team and professional translators for key communications" }],
    next_steps: ["Connect with Korean cultural organizations", "Secure primary venue", "Begin artist outreach"],
    tags: ["Korean Culture", "Festival", "Cultural Exchange", "Design", "K-pop", "Food"],
    category: "Community Events",
  },
  {
    title: "Wellness Through Heritage: South Asian Holistic Health Program",
    vision_statement: "Create a community wellness program integrating traditional South Asian healing practices like yoga, Ayurveda, and meditation with modern health education, making these traditions accessible to all.",
    goals: ["Offer 100 free wellness sessions", "Train 15 community wellness ambassadors", "Serve 500 participants", "Publish bilingual wellness guide"],
    cultural_impact: "Preserves South Asian wellness traditions while addressing health disparities in immigrant communities, creating culturally sensitive health resources that honor ancestral knowledge.",
    timeline: { duration: "8 months", phases: [{ name: "Development", duration: "2 months", tasks: ["Curriculum design", "Ambassador recruitment", "Space setup"] }, { name: "Program Delivery", duration: "5 months", tasks: ["Weekly sessions", "Ambassador training", "Community outreach"] }, { name: "Wrap-Up", duration: "1 month", tasks: ["Wellness guide publication", "Celebration event", "Impact assessment"] }] },
    budget: { total: "$22,000", breakdown: [{ category: "Instructors", amount: "$10,000", description: "Yoga, Ayurveda, and meditation teachers" }, { category: "Materials", amount: "$4,000", description: "Yoga mats, herbs, printed guides" }, { category: "Venue", amount: "$5,000", description: "Community center space rental" }, { category: "Publication", amount: "$3,000", description: "Bilingual wellness guide design and printing" }] },
    collaborators_needed: [{ role: "Ayurveda Practitioner", skills: ["Traditional Medicine", "Health Education"], priority: "required", count: 1 }, { role: "Yoga Instructor", skills: ["Yoga Teaching", "Accessibility Modifications"], priority: "required", count: 2 }],
    resources: ["Community center space", "Yoga equipment", "Herbal supplies"],
    challenges_and_mitigation: [{ challenge: "Cultural sensitivity around traditional practices", mitigation: "Advisory board of South Asian elders and health professionals to guide curriculum" }],
    next_steps: ["Form cultural advisory board", "Recruit wellness instructors", "Secure community center partnership"],
    tags: ["Wellness", "South Asian", "Yoga", "Ayurveda", "Health", "Heritage"],
    category: "Education & Workshops",
  },
];

// POST - Seed published proposals using actual users from the database
export async function POST() {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, organization, location")
      .limit(10);

    if (profilesError || !profiles || profiles.length === 0) {
      return NextResponse.json({ error: "No users found in database" }, { status: 400 });
    }

    const allProposals = [...SAMPLE_PROPOSALS, ...SAMPLE_PROPOSALS_2];
    const created: string[] = [];

    for (let i = 0; i < allProposals.length; i++) {
      // Distribute proposals across users (skip the current user so they see recommendations)
      const otherProfiles = profiles.filter((p) => p.id !== userId);
      if (otherProfiles.length === 0) {
        // If only one user, use them anyway
        otherProfiles.push(profiles[0]);
      }
      const profile = otherProfiles[i % otherProfiles.length];
      const sample = allProposals[i];

      // Create a proposal first (FK requirement)
      const { data: proposal, error: proposalError } = await supabase
        .from("proposals")
        .insert({
          user_id: profile.id,
          title: sample.title,
          vision_statement: sample.vision_statement,
          goals: sample.goals,
          cultural_impact: sample.cultural_impact,
          timeline: sample.timeline,
          budget: sample.budget,
          collaborators_needed: sample.collaborators_needed,
          resources: sample.resources,
          challenges_and_mitigation: sample.challenges_and_mitigation,
          next_steps: sample.next_steps,
          status: "submitted",
        })
        .select("id")
        .single();

      if (proposalError || !proposal) {
        console.error(`Error creating proposal ${i}:`, proposalError);
        continue;
      }

      // Publish it
      const { error: publishError } = await supabase
        .from("published_proposals")
        .insert({
          proposal_id: proposal.id,
          user_id: profile.id,
          title: sample.title,
          vision_statement: sample.vision_statement,
          goals: sample.goals,
          cultural_impact: sample.cultural_impact,
          timeline: sample.timeline,
          budget: sample.budget,
          collaborators_needed: sample.collaborators_needed,
          resources: sample.resources,
          challenges_and_mitigation: sample.challenges_and_mitigation,
          next_steps: sample.next_steps,
          author_name: profile.name,
          author_organization: profile.organization,
          author_location: profile.location,
          tags: sample.tags,
          category: sample.category,
        });

      if (publishError) {
        console.error(`Error publishing proposal ${i}:`, publishError);
        continue;
      }

      created.push(sample.title);
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${created.length} published proposals`,
      proposals: created,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
