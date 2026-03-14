import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ResumeSections } from "@/lib/resumeParser";

export interface JobMatch {
  job_title: string;
  match_percentage: number;
  required_skills_present: string[];
  skill_gaps: string[];
  overall_assessment: string;
}

export interface UserProfile {
  fileName: string;
  sections: ResumeSections;
  jobMatches: JobMatch[];
  totalJobsAnalyzed: number;
}

export interface ActivityEntry {
  type: "career_search" | "course_click" | "assessment_result";
  timestamp: number;
  label: string;
  detail?: string;
}

interface UserContextValue {
  profile: UserProfile | null;
  activity: ActivityEntry[];
  setProfile: (p: UserProfile) => void;
  logActivity: (entry: Omit<ActivityEntry, "timestamp">) => void;
  signOut: () => void;
}

const PROFILE_KEY = "careerPilot_profile";
const ACTIVITY_KEY = "careerPilot_activity";

const UserContext = createContext<UserContextValue>({
  profile: null,
  activity: [],
  setProfile: () => {},
  logActivity: () => {},
  signOut: () => {},
});

function loadFromSession<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveToSession(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(
    () => loadFromSession<UserProfile>(PROFILE_KEY)
  );
  const [activity, setActivity] = useState<ActivityEntry[]>(
    () => loadFromSession<ActivityEntry[]>(ACTIVITY_KEY) ?? []
  );

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    saveToSession(PROFILE_KEY, p);
  }, []);

  const logActivity = useCallback((entry: Omit<ActivityEntry, "timestamp">) => {
    setActivity((prev) => {
      const updated = [{ ...entry, timestamp: Date.now() }, ...prev].slice(0, 100);
      saveToSession(ACTIVITY_KEY, updated);
      return updated;
    });
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(ACTIVITY_KEY);
    setProfileState(null);
    setActivity([]);
  }, []);

  return (
    <UserContext.Provider value={{ profile, activity, setProfile, logActivity, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
