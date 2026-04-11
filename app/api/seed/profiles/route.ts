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

const SEED_PROFILES = [
  {
    email: "lena.kowalski@greenworks.org",
    password: "password123",
    name: "Lena Kowalski",
    interests: ["Sustainability", "Urban Farming", "Community Organizing", "Environmental Justice"],
    professionalBackground: "Environmental Program Director at GreenWorks Coalition",
    organization: "GreenWorks Coalition",
    location: "Portland, Oregon",
    bio: "Leading grassroots environmental initiatives that center equity and community voice. Organized city-wide composting programs and urban garden networks serving 2,000 families.",
    skills: ["Environmental Policy", "Community Organizing", "Grant Writing", "Urban Agriculture", "Public Speaking"],
  },
  {
    email: "hiroshi.tanaka@craftguild.jp",
    password: "password123",
    name: "Hiroshi Tanaka",
    interests: ["Traditional Crafts", "Ceramics", "Japanese Heritage", "Artisan Education"],
    professionalBackground: "Master Potter and Traditional Crafts Instructor",
    organization: "Pacific Northwest Craft Guild",
    location: "Seattle, Washington",
    bio: "Third-generation ceramic artist preserving Japanese pottery traditions while exploring contemporary forms. Teaches workshops connecting craft heritage with modern design.",
    skills: ["Ceramics", "Workshop Instruction", "Kiln Building", "Exhibition Curation", "Cultural Education"],
  },
  {
    email: "aaliyah.brooks@beatlab.io",
    password: "password123",
    name: "Aaliyah Brooks",
    interests: ["Music Production", "Hip-Hop Culture", "Youth Mentorship", "Audio Engineering"],
    professionalBackground: "Music Producer and Founder of BeatLab Youth Studio",
    organization: "BeatLab Studios",
    location: "Atlanta, Georgia",
    bio: "Grammy-nominated producer running free music production workshops for teens in underserved neighborhoods. Believes music is the most powerful tool for youth empowerment.",
    skills: ["Music Production", "Audio Engineering", "Youth Mentorship", "Studio Management", "Curriculum Design"],
  },
  {
    email: "carlos.mendez@healthbridge.org",
    password: "password123",
    name: "Carlos Mendez",
    interests: ["Community Health", "Traditional Medicine", "Latino Heritage", "Wellness Education"],
    professionalBackground: "Community Health Director at HealthBridge Foundation",
    organization: "HealthBridge Foundation",
    location: "Austin, Texas",
    bio: "Bridging traditional Latin American healing practices with modern public health. Runs bilingual wellness programs reaching 5,000 community members annually.",
    skills: ["Public Health", "Bilingual Communication", "Program Management", "Cultural Competency", "Health Education"],
  },
  {
    email: "nina.osei@filmcollective.com",
    password: "password123",
    name: "Nina Osei",
    interests: ["Documentary Film", "African Diaspora", "Visual Storytelling", "Social Justice"],
    professionalBackground: "Documentary Filmmaker and Creative Director",
    organization: "Diaspora Film Collective",
    location: "Brooklyn, New York",
    bio: "Award-winning filmmaker documenting stories of the African diaspora. Films have screened at Sundance, TIFF, and community venues across 30 cities.",
    skills: ["Documentary Direction", "Cinematography", "Story Development", "Film Editing", "Community Screenings"],
  },
  {
    email: "raj.patel@designforward.co",
    password: "password123",
    name: "Raj Patel",
    interests: ["Public Art", "Architecture", "South Asian Design", "Urban Renewal"],
    professionalBackground: "Architect and Public Art Consultant",
    organization: "DesignForward Studio",
    location: "Chicago, Illinois",
    bio: "Designing culturally responsive public spaces that celebrate community identity. Led the design of 12 public art installations integrating South Asian architectural motifs.",
    skills: ["Architecture", "Public Art Design", "Community Consultation", "3D Modeling", "Urban Planning"],
  },
  {
    email: "sarah.whitehorse@nativevoices.org",
    password: "password123",
    name: "Sarah Whitehorse",
    interests: ["Indigenous Rights", "Land Conservation", "Oral Traditions", "Education"],
    professionalBackground: "Director of Cultural Programs at Native Voices Alliance",
    organization: "Native Voices Alliance",
    location: "Santa Fe, New Mexico",
    bio: "Dedicated to preserving Indigenous languages and oral traditions through community-led education programs. Developed curriculum used in 40 tribal schools.",
    skills: ["Cultural Preservation", "Curriculum Development", "Community Leadership", "Oral History", "Grant Administration"],
  },
  {
    email: "tommy.nguyen@streetfood.co",
    password: "password123",
    name: "Tommy Nguyen",
    interests: ["Street Food", "Vietnamese Heritage", "Food Entrepreneurship", "Community Markets"],
    professionalBackground: "Chef and Founder of Saigon Street Food Collective",
    organization: "Saigon Street Food Collective",
    location: "San Francisco, California",
    bio: "Celebrating Vietnamese street food culture through pop-up markets and cooking classes. Built a network of 30 immigrant food vendors across the Bay Area.",
    skills: ["Culinary Arts", "Food Business Development", "Event Management", "Vendor Relations", "Cultural Programming"],
  },
];

// POST - Seed additional user profiles
export async function POST() {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const created: string[] = [];
    const skipped: string[] = [];

    for (const profile of SEED_PROFILES) {
      // Check if user already exists
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", profile.email)
        .single();

      if (existing) {
        skipped.push(profile.name);
        continue;
      }

      // Create user via the same RPC used by registration
      const { data: newUser, error: createError } = await supabase.rpc(
        "create_user_with_password",
        {
          user_email: profile.email,
          user_password: profile.password,
          user_name: profile.name,
          user_interests: profile.interests,
          user_professional_background: profile.professionalBackground,
          user_organization: profile.organization,
          user_location: profile.location,
          user_bio: profile.bio,
          user_skills: profile.skills,
        }
      );

      if (createError) {
        console.error(`Error creating user ${profile.name}:`, createError);
        continue;
      }

      if (newUser) {
        created.push(profile.name);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} profiles, skipped ${skipped.length} existing`,
      created,
      skipped,
    });
  } catch (error) {
    console.error("Seed profiles error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
