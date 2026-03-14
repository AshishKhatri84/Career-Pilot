import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogOut, FileText, Briefcase, Search, BookOpen, Award,
  Trophy, Clock, GraduationCap, Code2, Globe, Star, AlignLeft,
} from "lucide-react";

function SectionBlock({ title, icon, content }: { title: string; icon: React.ReactNode; content: string }) {
  if (!content.trim()) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  if (type === "career_search") return <Search className="w-3.5 h-3.5 text-blue-500" />;
  if (type === "course_click") return <BookOpen className="w-3.5 h-3.5 text-green-500" />;
  if (type === "assessment_result") return <Trophy className="w-3.5 h-3.5 text-yellow-500" />;
  return <Star className="w-3.5 h-3.5" />;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name: string, fileName: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return fileName.charAt(0).toUpperCase();
}

export default function Profile() {
  const { profile, activity, signOut } = useUser();
  const [, navigate] = useLocation();

  if (!profile) {
    navigate("/");
    return null;
  }

  const { sections, fileName, jobMatches, totalJobsAnalyzed } = profile;
  const initials = getInitials(sections.name, fileName);

  const topMatch = jobMatches.length > 0
    ? jobMatches.reduce((best, m) => (m.match_percentage > best.match_percentage ? m : best), jobMatches[0])
    : null;

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16 max-w-4xl mx-auto px-6">
        {/* Header card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-white">{initials}</span>
                </div>
                <div>
                  {sections.name && (
                    <h1 className="text-2xl font-bold text-foreground">{sections.name}</h1>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{fileName}</span>
                  </div>
                  {topMatch && (
                    <div className="flex items-center gap-2 mt-1">
                      <Award className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Top match: <span className="font-medium text-foreground">{topMatch.job_title}</span>
                        {" "}({topMatch.match_percentage}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} data-testid="button-sign-out">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        {sections.skills.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sections.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-sm" data-testid={`badge-skill-${i}`}>
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resume Sections */}
        {(() => {
          const hasNamedSections =
            sections.education ||
            sections.experience ||
            sections.projects ||
            sections.certifications ||
            sections.languages ||
            sections.extracurricular;

          if (hasNamedSections) {
            return (
              <div className="space-y-4 mb-6">
                <SectionBlock title="Education" icon={<GraduationCap className="w-4 h-4 text-primary" />} content={sections.education} />
                <SectionBlock title="Experience" icon={<Briefcase className="w-4 h-4 text-primary" />} content={sections.experience} />
                <SectionBlock title="Projects" icon={<FileText className="w-4 h-4 text-primary" />} content={sections.projects} />
                <SectionBlock title="Certifications & Courses" icon={<Award className="w-4 h-4 text-primary" />} content={sections.certifications} />
                <SectionBlock title="Languages" icon={<Globe className="w-4 h-4 text-primary" />} content={sections.languages} />
                <SectionBlock title="Extracurricular & Activities" icon={<Star className="w-4 h-4 text-primary" />} content={sections.extracurricular} />
              </div>
            );
          }

          // Fallback: show raw extracted resume text if no sections were detected
          const rawContent = sections.other;
          if (rawContent) {
            return (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-primary" />
                    Resume Content
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Section headers could not be detected in this resume format — showing full extracted text.
                  </p>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">
                    {rawContent}
                  </pre>
                </CardContent>
              </Card>
            );
          }

          return null;
        })()}

        {/* Job Match Summary */}
        {jobMatches.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                AI Job Match Results
                <Badge variant="outline" className="ml-auto text-xs font-normal">
                  {totalJobsAnalyzed} roles analyzed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobMatches.slice(0, 4).map((match, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-foreground font-medium truncate">{match.job_title}</span>
                    <Badge
                      variant="outline"
                      className={
                        match.match_percentage >= 75
                          ? "text-green-700 border-green-300 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                          : match.match_percentage >= 50
                          ? "text-orange-700 border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800"
                          : "text-red-700 border-red-300 bg-red-50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                      }
                    >
                      {match.match_percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Activity
              <Badge variant="outline" className="ml-auto text-xs font-normal">
                {activity.length} events
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activity yet. Search for jobs, explore courses, or take an assessment to track your progress.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {activity.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 text-sm">
                    <div className="mt-0.5 shrink-0">
                      <ActivityIcon type={entry.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">{entry.label}</span>
                      {entry.detail && (
                        <span className="text-muted-foreground"> — {entry.detail}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(entry.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
