import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Sparkles,
  Lightbulb,
  FileText,
  ArrowRight,
  CheckCircle2,
  Users,
  Globe,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Get Inspired",
    description:
      "Discover successful cultural initiatives from around the world, personalized to your interests and background.",
  },
  {
    icon: Lightbulb,
    title: "Develop Ideas",
    description:
      "Transform raw concepts into structured plans with AI-guided feasibility analysis, budgeting, and compliance guidance.",
  },
  {
    icon: FileText,
    title: "Create Proposals",
    description:
      "Generate polished, platform-ready project proposals that attract collaborators and drive action.",
  },
];

const benefits = [
  "Personalized cultural event recommendations",
  "Budget and resource estimation",
  "Legal and regulatory guidance",
  "Step-by-step project roadmaps",
  "Professional proposal templates",
  "Community collaboration tools",
];

const stats = [
  { label: "Cultural Projects Created", value: "2,500+" },
  { label: "Active Community Members", value: "15,000+" },
  { label: "Countries Represented", value: "45+" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.08),transparent)]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Turn Cultural Ideas into{" "}
                <span className="text-primary">Community Impact</span>
              </h1>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Culture Catalyst empowers you to discover inspiration, develop
                feasible plans, and create professional proposals for cultural
                projects that bring communities together.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Start Creating
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-serif text-3xl font-bold text-primary sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                From Inspiration to Action
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our AI-powered workflow guides you through three seamless stages
                to turn your cultural vision into reality.
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="relative rounded-2xl border bg-card p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="absolute -top-3 right-8 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <h3 className="mt-6 font-serif text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-y bg-muted/30 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  Everything you need to build cultural projects
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Our AI assistants provide comprehensive guidance at every
                  step, from discovering opportunities to publishing your
                  proposal.
                </p>

                <ul className="mt-8 space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <Button asChild>
                    <Link href="/auth/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border bg-card p-6">
                  <Users className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-semibold">Community Driven</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Connect with like-minded individuals passionate about
                    cultural initiatives.
                  </p>
                </div>
                <div className="rounded-2xl border bg-card p-6">
                  <Globe className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-semibold">Global Inspiration</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Draw from successful cultural events and trends worldwide.
                  </p>
                </div>
                <div className="rounded-2xl border bg-card p-6">
                  <Lightbulb className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-semibold">AI-Powered Guidance</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Intelligent agents help refine and strengthen your project
                    concepts.
                  </p>
                </div>
                <div className="rounded-2xl border bg-card p-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-semibold">Track Progress</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Monitor your projects from ideation through successful
                    execution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to make cultural impact?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Join thousands of community builders who are transforming their
                cultural ideas into reality with Culture Catalyst.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90"
                  asChild
                >
                  <Link href="/auth/register">
                    Create Your First Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
