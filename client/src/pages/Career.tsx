import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { useUser } from "@/context/UserContext";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Briefcase, Clock, DollarSign, Star, ExternalLink, RefreshCw, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveJob {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  requirements: string[];
  certificates: string[];
  postedDate: string;
  applyUrl: string;
  aiMatchScore: number;
}

function JobCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export default function Career() {
  const { logActivity } = useUser();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialSearch = params.get("search") || "software engineer";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [submittedSearch, setSubmittedSearch] = useState({ searchTerm: initialSearch, location: "", jobType: "all", experienceLevel: "all" });

  useEffect(() => {
    const p = new URLSearchParams(searchString);
    const s = p.get("search");
    if (s) {
      setSearchTerm(s);
      setSubmittedSearch({ searchTerm: s, location: "", jobType: "all", experienceLevel: "all" });
      logActivity({ type: "career_search", label: `Searched for "${s}"` });
    }
  }, [searchString]);

  const buildQueryString = (params: typeof submittedSearch) => {
    const p = new URLSearchParams();
    if (params.searchTerm) p.append("search", params.searchTerm);
    if (params.location) p.append("location", params.location);
    if (params.jobType && params.jobType !== "all") p.append("jobType", params.jobType);
    if (params.experienceLevel && params.experienceLevel !== "all") p.append("experienceLevel", params.experienceLevel);
    const qs = p.toString();
    return qs ? `?${qs}` : "";
  };

  const { data: jobs, isLoading, isError, refetch, isFetching } = useQuery<LiveJob[]>({
    queryKey: ["/api/jobs/live", submittedSearch],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/live${buildQueryString(submittedSearch)}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleSearch = useCallback(() => {
    setSubmittedSearch({ searchTerm, location, jobType, experienceLevel });
    if (searchTerm.trim()) {
      logActivity({
        type: "career_search",
        label: `Searched for "${searchTerm.trim()}"`,
        detail: location ? `in ${location}` : undefined,
      });
    }
  }, [searchTerm, location, jobType, experienceLevel, logActivity]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Competitive";
    const fmt = (n: number) => n >= 100000 ? `$${(n / 1000).toFixed(0)}k` : n >= 1000 ? `₹${(n / 100000).toFixed(1)}L` : `$${n}`;
    if (!min && max) return `Up to ${fmt(max)}`;
    if (!max) return `${fmt(min!)}+`;
    return `${fmt(min!)} – ${fmt(max)}`;
  };

  const loading = isLoading || isFetching;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 bg-gradient-to-b from-accent/20 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              Find Your Perfect Career Match
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time job listings sourced live from top job boards — search, filter, and apply directly.
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Role, skill, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                  data-testid="input-search-jobs"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Location or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                  data-testid="input-location"
                />
              </div>

              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger data-testid="select-job-type">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger data-testid="select-experience-level">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Junior">Junior / Entry-level</SelectItem>
                  <SelectItem value="Mid-level">Mid-level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={loading}
                data-testid="button-refresh-jobs"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={handleSearch}
                disabled={loading}
                data-testid="button-search-jobs"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Jobs
              </Button>
            </div>
          </Card>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">Something went wrong fetching jobs. Please try again.</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs && jobs.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{jobs.length}</span> live results for{" "}
                  <span className="font-medium text-foreground">"{submittedSearch.searchTerm}"</span>
                  {submittedSearch.location && ` in ${submittedSearch.location}`}
                </p>
              )}

              {jobs?.map((job) => (
                <Card
                  key={job.id}
                  className="p-6 transition-all duration-200 hover:border-primary/40"
                  data-testid={`card-job-${job.id}`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
                        <p className="text-base text-muted-foreground font-medium">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 shrink-0" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4 shrink-0" />
                        {job.jobType}
                      </div>
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 shrink-0" />
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 shrink-0" />
                        {job.postedDate}
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {job.certificates && job.certificates.length > 0 && (
                      <div className="flex flex-wrap items-start gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 mt-0.5">
                          <Award className="w-3.5 h-3.5 text-yellow-500" />
                          <span className="font-medium">Helpful certs:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.certificates.map((cert, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400"
                              data-testid={`badge-cert-${job.id}-${idx}`}
                            >
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{job.experienceLevel}</Badge>
                        {job.requirements.slice(0, 3).map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {req.length > 35 ? req.substring(0, 35) + "…" : req}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => window.open(job.applyUrl, "_blank", "noopener,noreferrer")}
                        data-testid={`button-apply-${job.id}`}
                        className="shrink-0"
                      >
                        Apply Now
                        <ExternalLink className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {jobs?.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    No jobs found for "{submittedSearch.searchTerm}". Try a different keyword or location.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
