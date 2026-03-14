import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, Loader2, Trophy } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { extractTextFromFile, parseResumeSections } from "@/lib/resumeParser";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobMatch {
  job_title: string;
  match_percentage: number;
  required_skills_present: string[];
  skill_gaps: string[];
  overall_assessment: string;
}

interface WebhookResponse {
  total_jobs_analyzed: number;
  top_matches: JobMatch[];
}

// ─── Pipeline steps ───────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  "Uploading resume",
  "Processing document",
  "Analyzing skills",
  "Matching jobs",
  "Generating results",
];

const STEP_DURATION = 2200;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function sendResumeToWorkflow(file: File): Promise<WebhookResponse> {
  const base64 = await convertToBase64(file);
  const response = await fetch(
    "https://n8n-production-6a89.up.railway.app/webhook/resume-upload",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, fileBase64: base64 }),
    },
  );
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function matchColor(pct: number) {
  if (pct >= 75) return "text-green-600 dark:text-green-400";
  if (pct >= 50) return "text-orange-500 dark:text-orange-400";
  return "text-red-500 dark:text-red-400";
}

function matchBg(pct: number) {
  if (pct >= 75)
    return "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800";
  if (pct >= 50)
    return "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800";
  return "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800";
}

// ─── Pipeline Overlay ─────────────────────────────────────────────────────────
function PipelineOverlay({ step }: { step: number }) {
  const label = PIPELINE_STEPS[Math.min(step, PIPELINE_STEPS.length - 1)];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm mx-4 p-10 flex flex-col items-center gap-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">Analyzing resume. It may take a few seconds.</p>
        </div>
        <div className="flex gap-1.5">
          {PIPELINE_STEPS.map((_, i) => (
            <span
              key={i}
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-primary"
                  : i < step
                  ? "w-3 bg-primary/40"
                  : "w-3 bg-muted"
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Results Modal ────────────────────────────────────────────────────────────
function ResultsModal({ data, onClose }: { data: WebhookResponse; onClose: () => void }) {
  const [, navigate] = useLocation();
  const top4 = data.top_matches.slice(0, 4);
  const topMatch = top4.length > 0
    ? top4.reduce((best, m) => (m.match_percentage > best.match_percentage ? m : best), top4[0])
    : null;

  const handleViewJobs = () => {
    const searchTerm = topMatch?.job_title ? encodeURIComponent(topMatch.job_title) : "";
    navigate(`/career${searchTerm ? `?search=${searchTerm}` : ""}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-md shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">Analysis Results</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Analyzed against{" "}
              <span className="font-semibold text-foreground">{data.total_jobs_analyzed}</span> roles.
              Here are your top matches.
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-modal">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {top4.map((match, idx) => {
            const isTop = match === topMatch && idx === top4.indexOf(topMatch!);
            return (
              <Card
                key={idx}
                className={`border relative ${isTop ? matchBg(match.match_percentage) : ""}`}
                data-testid={`card-job-match-${idx}`}
              >
                {isTop && (
                  <div className="absolute -top-2.5 left-4">
                    <Badge className="flex items-center gap-1 text-xs bg-primary text-primary-foreground">
                      <Trophy className="w-3 h-3" />
                      TOP MATCH
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2 pt-5 flex flex-row items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{match.job_title}</CardTitle>
                  <span
                    className={`text-2xl font-bold shrink-0 ${matchColor(match.match_percentage)}`}
                    data-testid={`text-match-score-${idx}`}
                  >
                    {match.match_percentage}%
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  {match.required_skills_present.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
                        Skills Present
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {match.required_skills_present.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.skill_gaps.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
                        Skill Gaps
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {match.skill_gaps.map((gap) => (
                          <Badge key={gap} variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
                            {gap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.overall_assessment && (
                    <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
                      {match.overall_assessment}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center p-6 border-t border-border">
          <Button onClick={handleViewJobs} data-testid="button-view-job-openings">
            View Job Openings
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResumeUpload() {
  const [uploadMethod, setUploadMethod] = useState<"file" | "text">("file");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [pipelineStep, setPipelineStep] = useState<number | null>(null);
  const [results, setResults] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const { setProfile } = useUser();

  const runPipeline = useCallback(async (file: File) => {
    setError(null);
    setResults(null);
    setPipelineStep(0);

    const requestPromise = sendResumeToWorkflow(file);
    const textPromise = extractTextFromFile(file).catch(() => "");

    let currentStep = 0;
    const advance = async () => {
      while (currentStep < PIPELINE_STEPS.length - 1) {
        await new Promise((r) => setTimeout(r, STEP_DURATION));
        currentStep++;
        setPipelineStep(currentStep);
      }
    };

    try {
      const [data, rawText] = await Promise.all([requestPromise, textPromise, advance()]);
      const sections = parseResumeSections(rawText);

      // Augment skills with skills from job matches if we couldn't parse enough
      if (sections.skills.length < 3 && data.top_matches.length > 0) {
        const allSkills = data.top_matches.flatMap((m) => m.required_skills_present);
        const extraSkills = Array.from(new Set(allSkills)).filter(
          (s) => !sections.skills.includes(s),
        );
        sections.skills = [...sections.skills, ...extraSkills];
      }

      setProfile({
        fileName: file.name,
        sections,
        jobMatches: data.top_matches,
        totalJobsAnalyzed: data.total_jobs_analyzed,
      });

      await new Promise((r) => setTimeout(r, 500));
      setResults(data);
    } catch {
      setError("Resume analysis failed. Please try again.");
    } finally {
      setPipelineStep(null);
    }
  }, [setProfile]);

  const handleFileSelect = (file: File) => {
    setFileName(file.name);
    setSelectedFile(file);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleAnalyze = () => {
    if (selectedFile) runPipeline(selectedFile);
  };

  const handleTextSubmit = () => {
    if (skillsText.trim()) {
      const blob = new Blob([skillsText], { type: "text/plain" });
      const file = new File([blob], "skills.txt", { type: "text/plain" });
      runPipeline(file);
    }
  };

  return (
    <>
      {pipelineStep !== null && <PipelineOverlay step={pipelineStep} />}

      {results && (
        <ResultsModal data={results} onClose={() => setResults(null)} />
      )}

      <section id="upload-section" className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background to-accent/20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              Start Your Career Journey
            </h2>
            <p className="text-lg text-muted-foreground">
              Upload your resume or enter your skills to get personalized AI-powered insights
            </p>
          </div>

          <Card className="p-8">
            <div className="flex gap-4 mb-6">
              <Button
                variant={uploadMethod === "file" ? "default" : "outline"}
                onClick={() => setUploadMethod("file")}
                className="flex-1"
                data-testid="button-upload-method-file"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                variant={uploadMethod === "text" ? "default" : "outline"}
                onClick={() => setUploadMethod("text")}
                className="flex-1"
                data-testid="button-upload-method-text"
              >
                <FileText className="w-4 h-4 mr-2" />
                Enter Text
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive mb-4 text-center">{error}</p>
            )}

            {uploadMethod === "file" ? (
              <div className="space-y-4">
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md transition-colors duration-200 cursor-pointer hover-elevate ${
                    dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  data-testid="label-file-upload"
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="mb-2 text-sm text-foreground font-medium">
                      {fileName ? fileName : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF or TXT (MAX. 10MB)</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt"
                    onChange={handleFileInputChange}
                    data-testid="input-file-upload"
                  />
                </label>
                <Button
                  onClick={handleAnalyze}
                  className="w-full"
                  disabled={!selectedFile}
                  data-testid="button-analyze-resume"
                >
                  Analyze Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter your skills, experience, and career goals here..."
                  className="min-h-48 resize-none"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  data-testid="textarea-skills"
                />
                <Button
                  onClick={handleTextSubmit}
                  className="w-full"
                  disabled={!skillsText.trim()}
                  data-testid="button-submit-skills"
                >
                  Analyze My Skills
                </Button>
              </div>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
