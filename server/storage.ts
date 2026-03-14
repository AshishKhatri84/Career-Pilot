import { type User, type InsertUser, type Job, type InsertJob } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job methods
  getJobs(filters?: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    minSalary?: number;
  }): Promise<Job[]>;
  getJobById(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private jobs: Map<string, Job>;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.initializeMockJobs(); // TODO: remove mock functionality
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getJobs(filters?: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    minSalary?: number;
  }): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());

    if (filters?.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.location && filters.location.trim()) {
      jobs = jobs.filter((job) =>
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters?.jobType && filters.jobType !== 'all') {
      jobs = jobs.filter((job) => job.jobType === filters.jobType);
    }

    if (filters?.experienceLevel && filters.experienceLevel !== 'all') {
      jobs = jobs.filter((job) => job.experienceLevel === filters.experienceLevel);
    }

    if (filters?.minSalary && filters.minSalary > 0) {
      jobs = jobs.filter(
        (job) => job.salaryMin && job.salaryMin >= filters.minSalary!
      );
    }

    return jobs.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
  }

  async getJobById(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      salaryMin: insertJob.salaryMin ?? null,
      salaryMax: insertJob.salaryMax ?? null,
    };
    this.jobs.set(id, job);
    return job;
  }

  // TODO: remove mock functionality
  private initializeMockJobs() {
    const mockJobs: InsertJob[] = [
      {
        title: "Senior Full Stack Developer",
        company: "TechCorp Solutions",
        location: "San Francisco, CA",
        jobType: "Full-time",
        experienceLevel: "Senior",
        salaryMin: 140000,
        salaryMax: 180000,
        description: "Join our innovative team to build cutting-edge web applications using modern technologies. We're looking for a passionate developer who thrives in a fast-paced environment.",
        requirements: ["5+ years of experience with React and Node.js", "Strong understanding of TypeScript", "Experience with PostgreSQL or similar databases", "Excellent problem-solving skills", "Bachelor's degree in Computer Science or equivalent"],
        responsibilities: ["Design and develop scalable web applications", "Collaborate with cross-functional teams", "Mentor junior developers", "Participate in code reviews and architectural decisions"],
        benefits: ["Competitive salary and equity", "Health, dental, and vision insurance", "401(k) matching", "Flexible work schedule", "Professional development budget"],
        aiMatchScore: 95,
        postedDate: "2 days ago",
      },
      {
        title: "AI/ML Engineer",
        company: "DataMinds AI",
        location: "Remote",
        jobType: "Full-time",
        experienceLevel: "Mid-level",
        salaryMin: 120000,
        salaryMax: 160000,
        description: "Work on groundbreaking AI projects that impact millions of users. We're building the next generation of intelligent systems.",
        requirements: ["3+ years of experience in machine learning", "Proficiency in Python and TensorFlow/PyTorch", "Strong mathematical background", "Experience with large-scale data processing"],
        responsibilities: ["Develop and deploy ML models", "Optimize model performance", "Research new AI techniques", "Collaborate with product teams"],
        benefits: ["Remote-first culture", "Stock options", "Learning and development budget", "Home office stipend"],
        aiMatchScore: 88,
        postedDate: "1 week ago",
      },
      {
        title: "Product Designer",
        company: "Design Studio Pro",
        location: "New York, NY",
        jobType: "Full-time",
        experienceLevel: "Mid-level",
        salaryMin: 100000,
        salaryMax: 130000,
        description: "Create beautiful, user-centered designs for our growing portfolio of products. You'll work closely with engineering and product teams.",
        requirements: ["3+ years of product design experience", "Expertise in Figma and design systems", "Strong portfolio showcasing UX/UI work", "Understanding of user research methods"],
        responsibilities: ["Lead design projects from concept to completion", "Create wireframes, prototypes, and high-fidelity mockups", "Conduct user research and testing", "Maintain and evolve design systems"],
        benefits: ["Creative work environment", "Health benefits", "Unlimited PTO", "Latest design tools and hardware"],
        aiMatchScore: 82,
        postedDate: "3 days ago",
      },
      {
        title: "DevOps Engineer",
        company: "CloudScale Systems",
        location: "Austin, TX",
        jobType: "Full-time",
        experienceLevel: "Senior",
        salaryMin: 130000,
        salaryMax: 170000,
        description: "Build and maintain cloud infrastructure for a high-traffic platform. We need someone who can ensure reliability and scalability.",
        requirements: ["5+ years of DevOps experience", "Expert knowledge of AWS or GCP", "Experience with Kubernetes and Docker", "Strong scripting skills (Python, Bash)", "CI/CD pipeline experience"],
        responsibilities: ["Design and implement infrastructure as code", "Monitor system performance and reliability", "Automate deployment processes", "Lead incident response"],
        benefits: ["Competitive compensation", "Relocation assistance", "Annual bonus", "Conference budget"],
        aiMatchScore: 91,
        postedDate: "5 days ago",
      },
      {
        title: "Frontend Developer",
        company: "StartupXYZ",
        location: "Seattle, WA",
        jobType: "Full-time",
        experienceLevel: "Junior",
        salaryMin: 80000,
        salaryMax: 100000,
        description: "Join a fast-growing startup and help build beautiful user interfaces. Perfect opportunity for someone early in their career.",
        requirements: ["1-2 years of frontend development", "Knowledge of React or Vue.js", "HTML, CSS, JavaScript proficiency", "Passion for clean code"],
        responsibilities: ["Build responsive web applications", "Implement designs from Figma", "Write clean, maintainable code", "Participate in team standups"],
        benefits: ["Equity package", "Health insurance", "Flexible hours", "Career growth opportunities"],
        aiMatchScore: 76,
        postedDate: "1 day ago",
      },
      {
        title: "Data Analyst",
        company: "Analytics Pro Inc",
        location: "Chicago, IL",
        jobType: "Full-time",
        experienceLevel: "Mid-level",
        salaryMin: 90000,
        salaryMax: 120000,
        description: "Turn data into actionable insights. Work with stakeholders across the company to drive data-informed decisions.",
        requirements: ["3+ years of data analysis experience", "SQL expertise", "Experience with Python or R", "Strong communication skills", "Business intelligence tools (Tableau, Power BI)"],
        responsibilities: ["Analyze complex datasets", "Create dashboards and reports", "Present findings to stakeholders", "Identify trends and opportunities"],
        benefits: ["Work-life balance", "Professional development", "Healthcare coverage", "Bonus potential"],
        aiMatchScore: 79,
        postedDate: "4 days ago",
      },
    ];

    mockJobs.forEach((job) => {
      const id = randomUUID();
      this.jobs.set(id, {
        ...job,
        id,
        salaryMin: job.salaryMin ?? null,
        salaryMax: job.salaryMax ?? null,
      });
    });
  }
}

export const storage = new MemStorage();
