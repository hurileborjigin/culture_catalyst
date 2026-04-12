import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Button,
} from "@react-email/components";
import * as React from "react";

interface Proposal {
  id: string;
  title: string;
  category: string | null;
  visionStatement: string | null;
  authorName: string;
  matchScore?: number;
}

interface Inspiration {
  title: string;
  category: string;
  description: string;
}

interface ReengagementEmailProps {
  userName: string;
  proposals: Proposal[];
  inspirations: Inspiration[];
  baseUrl: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  "Visual Arts": { bg: "#EDE9FE", text: "#7C3AED" },
  "Performing Arts": { bg: "#FCE7F3", text: "#DB2777" },
  Music: { bg: "#FEF3C7", text: "#D97706" },
  "Heritage & Traditions": { bg: "#DBEAFE", text: "#2563EB" },
  "Environment & Sustainability": { bg: "#D1FAE5", text: "#059669" },
  "Film & Media": { bg: "#E0E7FF", text: "#4F46E5" },
  "Community Events": { bg: "#FEE2E2", text: "#DC2626" },
  "Education & Workshops": { bg: "#CFFAFE", text: "#0891B2" },
  "Food & Culinary": { bg: "#FED7AA", text: "#EA580C" },
};

function getCategoryStyle(category: string | null) {
  return categoryColors[category || ""] || { bg: "#F3F4F6", text: "#6B7280" };
}

export default function ReengagementEmail({
  userName,
  proposals,
  inspirations,
  baseUrl,
}: ReengagementEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>We have new cultural projects that match your interests, {userName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient */}
          <Section style={header}>
            <Text style={headerIcon}>✦</Text>
            <Heading style={headerTitle}>Culture Catalyst</Heading>
            <Text style={headerSubtitle}>Your Cultural Project Platform</Text>
          </Section>

          {/* Greeting */}
          <Section style={greetingSection}>
            <Heading as="h2" style={greeting}>
              Welcome back, {userName}! 👋
            </Heading>
            <Text style={greetingText}>
              The community has been busy while you were away. New proposals have been
              published, collaborators are joining projects, and there are opportunities
              that match your unique skills and interests.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Inspirations */}
          {inspirations.length > 0 && (
            <Section style={sectionContainer}>
              <Heading as="h3" style={sectionTitle}>
                🌟 Trending in Culture
              </Heading>
              <Text style={sectionSubtitle}>
                Cultural movements and ideas you might find inspiring
              </Text>
              {inspirations.map((item, i) => {
                const colors = getCategoryStyle(item.category);
                return (
                  <Section key={i} style={inspirationCard}>
                    <Row>
                      <Column style={{ width: "6px" }}>
                        <div style={{ ...accentBar, backgroundColor: colors.text }} />
                      </Column>
                      <Column style={{ paddingLeft: "16px" }}>
                        <Text style={{ ...cardBadge, backgroundColor: colors.bg, color: colors.text }}>
                          {item.category}
                        </Text>
                        <Text style={cardTitle}>{item.title}</Text>
                        <Text style={cardDescription}>{item.description}</Text>
                      </Column>
                    </Row>
                  </Section>
                );
              })}
            </Section>
          )}

          <Hr style={divider} />

          {/* Recommended Proposals */}
          {proposals.length > 0 && (
            <Section style={sectionContainer}>
              <Heading as="h3" style={sectionTitle}>
                🎯 Matched for You
              </Heading>
              <Text style={sectionSubtitle}>
                Projects looking for someone with your skills and interests
              </Text>
              {proposals.map((proposal) => {
                const colors = getCategoryStyle(proposal.category);
                return (
                  <Section key={proposal.id} style={proposalCard}>
                    <Row>
                      <Column>
                        <Row>
                          <Column>
                            <Text style={{ ...cardBadge, backgroundColor: colors.bg, color: colors.text }}>
                              {proposal.category || "Project"}
                            </Text>
                          </Column>
                          {proposal.matchScore && (
                            <Column align="right">
                              <Text style={matchBadge}>
                                {proposal.matchScore}% match
                              </Text>
                            </Column>
                          )}
                        </Row>
                        <Text style={proposalTitle}>{proposal.title}</Text>
                        {proposal.visionStatement && (
                          <Text style={proposalVision}>
                            {proposal.visionStatement.length > 120
                              ? proposal.visionStatement.slice(0, 120) + "..."
                              : proposal.visionStatement}
                          </Text>
                        )}
                        <Text style={proposalAuthor}>
                          by {proposal.authorName}
                        </Text>
                        <Link
                          href={`${baseUrl}/dashboard/discover/${proposal.id}`}
                          style={proposalLink}
                        >
                          View proposal →
                        </Link>
                      </Column>
                    </Row>
                  </Section>
                );
              })}
            </Section>
          )}

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Ready to dive back in? Your creative pipeline is waiting.
            </Text>
            <Button href={`${baseUrl}/dashboard`} style={ctaButton}>
              Explore Your Dashboard
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Culture Catalyst — Transform ideas into collaborative cultural projects
            </Text>
            <Text style={footerSmall}>
              You received this because you&apos;re a member of Culture Catalyst.
              <br />
              <Link href={`${baseUrl}/dashboard/profile`} style={footerLink}>
                Manage your preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// --- Styles ---

const main: React.CSSProperties = {
  backgroundColor: "#F8FAFC",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
};

const header: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
  padding: "40px 32px 32px",
  textAlign: "center" as const,
};

const headerIcon: React.CSSProperties = {
  fontSize: "32px",
  color: "#FFFFFF",
  margin: "0 0 8px",
};

const headerTitle: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 4px",
  letterSpacing: "-0.5px",
};

const headerSubtitle: React.CSSProperties = {
  color: "rgba(255,255,255,0.8)",
  fontSize: "14px",
  margin: "0",
};

const greetingSection: React.CSSProperties = {
  padding: "32px 32px 0",
};

const greeting: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#1E293B",
  margin: "0 0 12px",
};

const greetingText: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#64748B",
  margin: "0",
};

const divider: React.CSSProperties = {
  borderColor: "#E2E8F0",
  margin: "24px 32px",
};

const sectionContainer: React.CSSProperties = {
  padding: "0 32px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#1E293B",
  margin: "0 0 4px",
};

const sectionSubtitle: React.CSSProperties = {
  fontSize: "13px",
  color: "#94A3B8",
  margin: "0 0 16px",
};

const inspirationCard: React.CSSProperties = {
  backgroundColor: "#F8FAFC",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
};

const accentBar: React.CSSProperties = {
  width: "4px",
  height: "100%",
  minHeight: "50px",
  borderRadius: "2px",
};

const cardBadge: React.CSSProperties = {
  display: "inline-block",
  fontSize: "11px",
  fontWeight: "600",
  padding: "2px 8px",
  borderRadius: "4px",
  margin: "0 0 6px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const cardTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1E293B",
  margin: "0 0 4px",
};

const cardDescription: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748B",
  lineHeight: "20px",
  margin: "0",
};

const proposalCard: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: "10px",
  padding: "20px",
  marginBottom: "12px",
};

const proposalTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#1E293B",
  margin: "8px 0 6px",
};

const proposalVision: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748B",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const proposalAuthor: React.CSSProperties = {
  fontSize: "12px",
  color: "#94A3B8",
  margin: "0 0 10px",
};

const proposalLink: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#6366F1",
  textDecoration: "none",
};

const matchBadge: React.CSSProperties = {
  display: "inline-block",
  fontSize: "11px",
  fontWeight: "600",
  padding: "2px 8px",
  borderRadius: "4px",
  backgroundColor: "#DCFCE7",
  color: "#16A34A",
  margin: "0",
};

const ctaSection: React.CSSProperties = {
  padding: "8px 32px 32px",
  textAlign: "center" as const,
};

const ctaText: React.CSSProperties = {
  fontSize: "15px",
  color: "#475569",
  margin: "0 0 20px",
};

const ctaButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#6366F1",
  color: "#FFFFFF",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 32px",
  borderRadius: "8px",
  textDecoration: "none",
};

const footer: React.CSSProperties = {
  backgroundColor: "#F8FAFC",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#64748B",
  margin: "0 0 8px",
};

const footerSmall: React.CSSProperties = {
  fontSize: "11px",
  color: "#94A3B8",
  lineHeight: "18px",
  margin: "0",
};

const footerLink: React.CSSProperties = {
  color: "#6366F1",
  textDecoration: "underline",
};
