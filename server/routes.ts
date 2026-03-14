import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchLiveJobs } from "./tavilyJobs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Live job search via Tavily
  app.get("/api/jobs/live", async (req, res) => {
    try {
      const jobs = await fetchLiveJobs({
        search: req.query.search as string | undefined,
        location: req.query.location as string | undefined,
        jobType: req.query.jobType as string | undefined,
        experienceLevel: req.query.experienceLevel as string | undefined,
      });
      res.json(jobs);
    } catch (error: any) {
      console.error("Tavily job fetch error:", error?.message);
      res.status(500).json({ error: "Failed to fetch live jobs" });
    }
  });

  // Job routes (static/mock fallback)
  app.get("/api/jobs", async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string | undefined,
        location: req.query.location as string | undefined,
        jobType: req.query.jobType as string | undefined,
        experienceLevel: req.query.experienceLevel as string | undefined,
        minSalary: req.query.minSalary
          ? parseInt(req.query.minSalary as string)
          : undefined,
      };
      const jobs = await storage.getJobs(filters);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJobById(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
