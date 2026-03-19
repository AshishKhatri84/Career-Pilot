import { useState, useReducer, useRef, useCallback } from "react";
import Navigation from "@/components/Navigation";
import { useUser } from "@/context/UserContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Upload,
  FileText,
  Clock,
  Award,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Loader2,
  Trophy,
  Target,
  ArrowLeft,
  Code2,
  Server,
  Brain,
  Cloud,
  Shield,
  Palette,
  Smartphone,
  Database,
  Mic,
  MicOff,
  RotateCcw,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

interface CourseRec {
  title: string;
  platform: string;
  url: string;
  difficulty: string;
  duration: string;
  reason: string;
}

interface SkillTrack {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  quizQuestions: QuizQuestion[];
  practicalTask: {
    description: string;
    steps: string[];
    formats: string[];
  };
  practicalKeywords: string[];
  interviewQuestions: string[];
  interviewKeywords: string[][];
  courseRecs: {
    beginner: CourseRec[];
    intermediate: CourseRec[];
    advanced: CourseRec[];
  };
}

const PLATFORM_URLS: Record<string, string> = {
  Coursera: "https://www.coursera.org/search?query=",
  Udemy: "https://www.udemy.com/courses/search/?q=",
  edX: "https://www.edx.org/search?q=",
  Pluralsight: "https://www.pluralsight.com/search?q=",
  "Great Learning": "https://www.mygreatlearning.com/search?query=",
  Simplilearn: "https://www.simplilearn.com/search?query=",
  upGrad: "https://www.upgrad.com/programs/?search=",
  "LinkedIn Learning": "https://www.linkedin.com/learning/search?keywords=",
};

interface PracticeLink {
  name: string;
  url: string;
  description: string;
  badge: string;
}

const CODING_PRACTICE_LINKS: PracticeLink[] = [
  {
    name: "LeetCode",
    url: "https://leetcode.com/problemset/",
    description:
      "The go-to platform for coding interview prep — thousands of problems with solutions.",
    badge: "Most Popular",
  },
  {
    name: "NeetCode",
    url: "https://neetcode.io",
    description:
      "Curated problem roadmaps with video walkthroughs — great for systematic preparation.",
    badge: "Structured",
  },
  {
    name: "GeeksforGeeks",
    url: "https://www.geeksforgeeks.org/problem-of-the-day",
    description:
      "Problem of the Day + in-depth CS articles, interview experiences, and tutorials.",
    badge: "Daily Practice",
  },
  {
    name: "CodeChef",
    url: "https://www.codechef.com/practice",
    description:
      "Competitive programming contests and a large library of practice problems.",
    badge: "Competitive",
  },
  {
    name: "Codeforces",
    url: "https://codeforces.com/problemset",
    description:
      "Rated competitive programming contests and a vast problem archive.",
    badge: "Competitive",
  },
  {
    name: "HackerRank",
    url: "https://www.hackerrank.com/domains/algorithms",
    description:
      "Domain-specific challenges with structured learning paths for algorithms and DS.",
    badge: "Beginner Friendly",
  },
];

const MOCK_INTERVIEW_LINKS: PracticeLink[] = [
  {
    name: "Pramp",
    url: "https://www.pramp.com",
    description:
      "Free peer-to-peer mock interviews for software engineers — practice with real people.",
    badge: "Free",
  },
  {
    name: "Interviewing.io",
    url: "https://interviewing.io",
    description:
      "Anonymous mock interviews with engineers from top tech companies.",
    badge: "Top Companies",
  },
  {
    name: "Exponent",
    url: "https://www.tryexponent.com/practice",
    description:
      "Mock interviews for engineering, product, and PM roles with video practice.",
    badge: "Multi-Role",
  },
  {
    name: "ExpertHire",
    url: "https://experthire.io",
    description:
      "1-on-1 mock interviews with industry experts and personalized feedback.",
    badge: "Expert Feedback",
  },
  {
    name: "IGotAnOffer",
    url: "https://igotanoffer.com/en/mock-interviews/type/coding",
    description:
      "Practice Coding mock interviews to get a job at Google, Meta, Amazon, etc.",
    badge: "FAANG Focus",
  },
  {
    name: "HackerRank Interview Prep",
    url: "https://www.hackerrank.com/interview/interview-preparation-kit",
    description:
      "Structured interview preparation kit with progressively harder challenges.",
    badge: "Structured",
  },
];

function makeCourseUrl(platform: string, topic: string) {
  const base = PLATFORM_URLS[platform] ?? "https://www.google.com/search?q=";
  return `${base}${encodeURIComponent(topic)}`;
}

const SKILL_TRACKS: SkillTrack[] = [
  {
    id: "frontend",
    label: "Frontend Development",
    icon: <Code2 className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
    description: "HTML, CSS, JavaScript, React & modern UI frameworks",
    quizQuestions: [
      {
        id: 1,
        question:
          "Which hook in React is used to manage local component state?",
        options: ["useEffect", "useState", "useContext", "useRef"],
        correctAnswer: 1,
        category: "React",
      },
      {
        id: 2,
        question: "What does CSS specificity determine?",
        options: [
          "The order in which CSS files are loaded",
          "Which CSS rule takes precedence when multiple rules match an element",
          "How quickly styles are applied by the browser",
          "The number of stylesheets allowed per page",
        ],
        correctAnswer: 1,
        category: "CSS",
      },
      {
        id: 3,
        question: "What is the purpose of the 'key' prop in React lists?",
        options: [
          "To style list items individually",
          "To help React identify which items have changed, added, or removed",
          "To enable keyboard navigation",
          "To set the order of rendering",
        ],
        correctAnswer: 1,
        category: "React",
      },
      {
        id: 4,
        question:
          "Which JavaScript method creates a new array with the results of calling a function for every element?",
        options: ["forEach()", "filter()", "map()", "reduce()"],
        correctAnswer: 2,
        category: "JavaScript",
      },
      {
        id: 5,
        question: "What does 'semantic HTML' mean?",
        options: [
          "HTML that uses only CSS classes for styling",
          "HTML tags that carry meaning about their content (e.g., <article>, <nav>)",
          "HTML written without any JavaScript",
          "Minimized HTML with no whitespace",
        ],
        correctAnswer: 1,
        category: "HTML",
      },
      {
        id: 6,
        question: "What is the CSS box model made of (from inside to outside)?",
        options: [
          "Content → Padding → Border → Margin",
          "Content → Margin → Border → Padding",
          "Padding → Content → Border → Margin",
          "Margin → Border → Content → Padding",
        ],
        correctAnswer: 0,
        category: "CSS",
      },
      {
        id: 7,
        question: "What does the 'useEffect' hook in React do?",
        options: [
          "Creates a memoized version of a value",
          "Manages global application state",
          "Performs side effects after renders",
          "Handles form validation",
        ],
        correctAnswer: 2,
        category: "React",
      },
      {
        id: 8,
        question:
          "Which technique improves web app performance by loading code only when needed?",
        options: [
          "Server-side rendering",
          "Code splitting / lazy loading",
          "CSS minification",
          "Browser caching",
        ],
        correctAnswer: 1,
        category: "Performance",
      },
    ],
    practicalTask: {
      description:
        "Build a responsive React component — a searchable product card grid with filtering.",
      steps: [
        "Create a list of at least 6 product cards with name, price, and category",
        "Add a search input that filters cards in real time",
        "Add a category filter (dropdown or button group)",
        "Ensure the layout is fully responsive (mobile + desktop)",
        "Use clean, accessible markup",
      ],
      formats: [".zip", ".jsx", ".tsx", ".html"],
    },
    practicalKeywords: [
      "react",
      "usestate",
      "filter",
      "map",
      "component",
      "search",
      "input",
      "responsive",
      "grid",
      "card",
      "category",
    ],
    interviewQuestions: [
      "Explain the difference between controlled and uncontrolled components in React.",
      "How do you optimize the performance of a React application that re-renders too often?",
      "Describe the CSS cascade and how you would debug a specificity conflict.",
      "What are Web Vitals and why do they matter for frontend developers?",
      "Walk me through how you would make a website accessible to screen reader users.",
    ],
    interviewKeywords: [
      [
        "controlled",
        "uncontrolled",
        "state",
        "ref",
        "onchange",
        "dom",
        "value",
      ],
      [
        "memo",
        "usememo",
        "usecallback",
        "rerender",
        "render",
        "lazy",
        "performance",
        "profiler",
      ],
      [
        "specificity",
        "cascade",
        "selector",
        "important",
        "inline",
        "class",
        "id",
      ],
      [
        "lcf",
        "fid",
        "cls",
        "inp",
        "core web vitals",
        "performance",
        "loading",
        "interactivity",
        "lcp",
      ],
      [
        "aria",
        "screen reader",
        "alt",
        "semantic",
        "keyboard",
        "focus",
        "role",
        "label",
        "accessibility",
      ],
    ],
    courseRecs: {
      beginner: [
        {
          title: "HTML & CSS for Beginners",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "HTML CSS beginner"),
          difficulty: "Beginner",
          duration: "4 weeks",
          reason: "Build a solid HTML & CSS foundation",
        },
        {
          title: "JavaScript Basics",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "JavaScript basics"),
          difficulty: "Beginner",
          duration: "5 weeks",
          reason: "Learn core JavaScript concepts",
        },
      ],
      intermediate: [
        {
          title: "React — The Complete Guide",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "React complete guide"),
          difficulty: "Intermediate",
          duration: "8 weeks",
          reason: "Master React and modern hooks",
        },
        {
          title: "CSS Advanced & Animations",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "CSS advanced animations"),
          difficulty: "Intermediate",
          duration: "3 weeks",
          reason: "Level up CSS skills",
        },
      ],
      advanced: [
        {
          title: "Advanced React Patterns",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "Advanced React patterns"),
          difficulty: "Advanced",
          duration: "6 weeks",
          reason: "Master advanced component design",
        },
        {
          title: "Web Performance Optimization",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "web performance optimization"),
          difficulty: "Advanced",
          duration: "4 weeks",
          reason: "Ship faster, more efficient apps",
        },
      ],
    },
  },
  {
    id: "backend",
    label: "Backend Development",
    icon: <Server className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    description: "APIs, databases, server-side logic & system design",
    quizQuestions: [
      {
        id: 1,
        question:
          "What HTTP status code indicates a resource was successfully created?",
        options: [
          "200 OK",
          "201 Created",
          "204 No Content",
          "301 Moved Permanently",
        ],
        correctAnswer: 1,
        category: "HTTP",
      },
      {
        id: 2,
        question: "What does REST stand for?",
        options: [
          "Remote Execution State Transfer",
          "Representational State Transfer",
          "Resource Execution System Technology",
          "Responsive System Template",
        ],
        correctAnswer: 1,
        category: "APIs",
      },
      {
        id: 3,
        question: "What is an index in a database used for?",
        options: [
          "To store backups of table rows",
          "To speed up read queries on large tables",
          "To enforce data type constraints",
          "To compress table data",
        ],
        correctAnswer: 1,
        category: "Databases",
      },
      {
        id: 4,
        question: "Which SQL clause is used to filter rows after grouping?",
        options: ["WHERE", "FILTER", "HAVING", "ORDER BY"],
        correctAnswer: 2,
        category: "SQL",
      },
      {
        id: 5,
        question: "What is middleware in the context of Express.js?",
        options: [
          "A database management tool",
          "A function that has access to request, response, and the next middleware",
          "A frontend rendering engine",
          "A caching layer between client and server",
        ],
        correctAnswer: 1,
        category: "Node.js",
      },
      {
        id: 6,
        question: "What is the purpose of JWT (JSON Web Token)?",
        options: [
          "To compress JSON payloads",
          "To securely transmit information between parties as a signed token",
          "To format API responses",
          "To manage database connections",
        ],
        correctAnswer: 1,
        category: "Auth",
      },
      {
        id: 7,
        question: "Which of these best describes a NoSQL database?",
        options: [
          "A database that uses only SQL syntax",
          "A relational database with strict schemas",
          "A non-relational database with flexible data models",
          "A database that stores only numeric data",
        ],
        correctAnswer: 2,
        category: "Databases",
      },
      {
        id: 8,
        question: "What does 'N+1 query problem' mean?",
        options: [
          "Running one query that returns N+1 results",
          "Executing N extra queries for each item in an initial query result",
          "A query that takes N+1 seconds to complete",
          "Using N+1 joins in a single SQL query",
        ],
        correctAnswer: 1,
        category: "Performance",
      },
    ],
    practicalTask: {
      description: "Build a RESTful API for a simple task management system.",
      steps: [
        "Create CRUD endpoints: GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id",
        "Use proper HTTP status codes for each response",
        "Add basic input validation",
        "Implement at least one query parameter filter (e.g., status, priority)",
        "Document your endpoints in a README or inline comments",
      ],
      formats: [".zip", ".js", ".ts", ".py"],
    },
    practicalKeywords: [
      "get",
      "post",
      "patch",
      "delete",
      "route",
      "status",
      "middleware",
      "validation",
      "endpoint",
      "rest",
      "request",
      "response",
      "express",
      "fastapi",
      "flask",
    ],
    interviewQuestions: [
      "Explain the difference between authentication and authorization with a real-world example.",
      "How would you design a rate-limiting system for a public API?",
      "Describe how database transactions work and when you would use them.",
      "What is the CAP theorem and how does it affect your database choices?",
      "Walk me through how you would debug a slow API endpoint in production.",
    ],
    interviewKeywords: [
      [
        "authentication",
        "authorization",
        "identity",
        "permission",
        "token",
        "session",
        "jwt",
        "role",
      ],
      [
        "rate limit",
        "token bucket",
        "sliding window",
        "redis",
        "throttle",
        "429",
        "limit",
        "requests",
      ],
      [
        "acid",
        "atomic",
        "commit",
        "rollback",
        "transaction",
        "isolation",
        "consistent",
        "database",
      ],
      [
        "cap",
        "consistency",
        "availability",
        "partition",
        "tolerance",
        "distributed",
        "network",
      ],
      [
        "profiling",
        "slow query",
        "logs",
        "index",
        "n+1",
        "caching",
        "explain",
        "monitoring",
        "trace",
      ],
    ],
    courseRecs: {
      beginner: [
        {
          title: "Node.js for Beginners",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "Node.js beginners"),
          difficulty: "Beginner",
          duration: "5 weeks",
          reason: "Start building server-side applications",
        },
        {
          title: "SQL Essentials",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "SQL databases"),
          difficulty: "Beginner",
          duration: "4 weeks",
          reason: "Master relational database fundamentals",
        },
      ],
      intermediate: [
        {
          title: "REST API Design & Development",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "REST API design"),
          difficulty: "Intermediate",
          duration: "6 weeks",
          reason: "Build robust, scalable APIs",
        },
        {
          title: "Node.js & Express Complete Guide",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "Node.js Express complete"),
          difficulty: "Intermediate",
          duration: "8 weeks",
          reason: "Deep-dive into backend development",
        },
      ],
      advanced: [
        {
          title: "System Design for Backend Engineers",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "system design backend"),
          difficulty: "Advanced",
          duration: "10 weeks",
          reason: "Design scalable distributed systems",
        },
        {
          title: "Microservices Architecture",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "microservices architecture"),
          difficulty: "Advanced",
          duration: "8 weeks",
          reason: "Learn modern backend architecture patterns",
        },
      ],
    },
  },
  {
    id: "datascience",
    label: "Data Science & ML",
    icon: <Brain className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600",
    description: "Machine learning, statistics, Python & data analysis",
    quizQuestions: [
      {
        id: 1,
        question:
          "What is the purpose of supervised learning in machine learning?",
        options: [
          "To find hidden patterns in unlabeled data",
          "To learn from labeled data and make predictions",
          "To optimize system performance without data",
          "To generate new data samples",
        ],
        correctAnswer: 1,
        category: "Machine Learning",
      },
      {
        id: 2,
        question: "What does 'overfitting' mean in a machine learning model?",
        options: [
          "The model performs poorly on both training and test data",
          "The model fits training data too well and fails to generalize",
          "The model is trained on too little data",
          "The model has too few parameters",
        ],
        correctAnswer: 1,
        category: "Machine Learning",
      },
      {
        id: 3,
        question:
          "Which Python library is most commonly used for data manipulation and analysis?",
        options: ["NumPy", "Matplotlib", "Pandas", "Scikit-learn"],
        correctAnswer: 2,
        category: "Python",
      },
      {
        id: 4,
        question:
          "What is the purpose of cross-validation in model evaluation?",
        options: [
          "To speed up model training",
          "To reduce the size of the dataset",
          "To get a more reliable estimate of model performance",
          "To visualize model predictions",
        ],
        correctAnswer: 2,
        category: "Model Evaluation",
      },
      {
        id: 5,
        question: "What does 'feature engineering' refer to?",
        options: [
          "Choosing the right machine learning algorithm",
          "Creating, transforming, or selecting input variables to improve model performance",
          "Designing neural network architectures",
          "Deploying models to production",
        ],
        correctAnswer: 1,
        category: "Data Science",
      },
      {
        id: 6,
        question:
          "Which metric is most appropriate for evaluating a model on an imbalanced classification dataset?",
        options: ["Accuracy", "F1 Score", "Mean Squared Error", "R-squared"],
        correctAnswer: 1,
        category: "Model Evaluation",
      },
      {
        id: 7,
        question: "What is a confusion matrix used for?",
        options: [
          "Visualizing high-dimensional data",
          "Summarizing the performance of a classification algorithm",
          "Optimizing hyperparameters",
          "Measuring correlation between features",
        ],
        correctAnswer: 1,
        category: "Machine Learning",
      },
      {
        id: 8,
        question: "What does PCA (Principal Component Analysis) do?",
        options: [
          "Classifies data into labeled categories",
          "Reduces dimensionality by transforming data into principal components",
          "Generates synthetic training data",
          "Measures feature importance in decision trees",
        ],
        correctAnswer: 1,
        category: "Statistics",
      },
    ],
    practicalTask: {
      description:
        "Build a machine learning model to predict customer churn using a provided dataset.",
      steps: [
        "Load and preprocess the customer dataset",
        "Perform exploratory data analysis with visualizations",
        "Build and train a classification model (any algorithm)",
        "Evaluate model performance with appropriate metrics",
        "Document your approach and findings",
      ],
      formats: [".py", ".ipynb", ".zip", ".pdf"],
    },
    practicalKeywords: [
      "import",
      "pandas",
      "sklearn",
      "model",
      "train",
      "predict",
      "accuracy",
      "feature",
      "classification",
      "data",
      "fit",
      "numpy",
      "matplotlib",
    ],
    interviewQuestions: [
      "Explain the bias-variance tradeoff and how it affects model selection.",
      "How would you handle missing values in a real-world dataset?",
      "Describe a situation where accuracy is a misleading metric for a classification model.",
      "What is gradient descent and how does it help train machine learning models?",
      "How do you decide which features to include in a model?",
    ],
    interviewKeywords: [
      [
        "bias",
        "variance",
        "underfitting",
        "overfitting",
        "tradeoff",
        "complexity",
        "regularization",
        "generalize",
      ],
      [
        "imputation",
        "mean",
        "median",
        "drop",
        "fillna",
        "missing",
        "nan",
        "forward fill",
        "interpolation",
      ],
      [
        "imbalanced",
        "class",
        "precision",
        "recall",
        "f1",
        "accuracy",
        "skewed",
        "minority",
      ],
      [
        "gradient",
        "descent",
        "learning rate",
        "minimize",
        "loss",
        "update",
        "optimize",
        "backpropagation",
        "cost",
      ],
      [
        "correlation",
        "importance",
        "feature",
        "selection",
        "variance",
        "mutual information",
        "lasso",
        "random forest",
        "pca",
      ],
    ],
    courseRecs: {
      beginner: [
        {
          title: "Python for Data Science",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "Python for data science"),
          difficulty: "Beginner",
          duration: "6 weeks",
          reason: "Start your data science journey with Python",
        },
        {
          title: "Statistics for Data Science",
          platform: "edX",
          url: makeCourseUrl("edX", "statistics data science"),
          difficulty: "Beginner",
          duration: "5 weeks",
          reason: "Build statistical foundations",
        },
      ],
      intermediate: [
        {
          title: "Machine Learning Specialization",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "machine learning specialization"),
          difficulty: "Intermediate",
          duration: "10 weeks",
          reason: "Master core ML algorithms",
        },
        {
          title: "Data Science Bootcamp",
          platform: "upGrad",
          url: makeCourseUrl("upGrad", "data science bootcamp"),
          difficulty: "Intermediate",
          duration: "8 weeks",
          reason: "Hands-on data science projects",
        },
      ],
      advanced: [
        {
          title: "Deep Learning Specialization",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "deep learning specialization"),
          difficulty: "Advanced",
          duration: "12 weeks",
          reason: "Advance into neural networks and deep learning",
        },
        {
          title: "Machine Learning Engineering",
          platform: "Great Learning",
          url: makeCourseUrl("Great Learning", "machine learning engineering"),
          difficulty: "Advanced",
          duration: "10 weeks",
          reason: "Deploy ML models at scale",
        },
      ],
    },
  },
  {
    id: "devops",
    label: "DevOps & Cloud",
    icon: <Cloud className="w-6 h-6" />,
    color: "from-cyan-500 to-cyan-600",
    description: "CI/CD, containers, Kubernetes, AWS/GCP & infrastructure",
    quizQuestions: [
      {
        id: 1,
        question: "What does CI/CD stand for?",
        options: [
          "Continuous Integration / Continuous Delivery",
          "Code Integration / Code Deployment",
          "Central Infrastructure / Central Deployment",
          "Container Infrastructure / Cloud Delivery",
        ],
        correctAnswer: 0,
        category: "DevOps",
      },
      {
        id: 2,
        question: "What is Docker primarily used for?",
        options: [
          "Writing infrastructure-as-code",
          "Containerizing applications for consistent environments",
          "Monitoring server performance",
          "Automating database backups",
        ],
        correctAnswer: 1,
        category: "Containers",
      },
      {
        id: 3,
        question: "What does Kubernetes do?",
        options: [
          "Writes and runs automated tests",
          "Orchestrates and manages containerized applications at scale",
          "Encrypts data in cloud storage",
          "Manages DNS records",
        ],
        correctAnswer: 1,
        category: "Kubernetes",
      },
      {
        id: 4,
        question: "What is 'Infrastructure as Code' (IaC)?",
        options: [
          "Writing backend code for infrastructure monitoring tools",
          "Managing and provisioning infrastructure through machine-readable config files",
          "A programming language for cloud providers",
          "Manual server configuration documented as code comments",
        ],
        correctAnswer: 1,
        category: "IaC",
      },
      {
        id: 5,
        question:
          "Which AWS service is used for serverless function execution?",
        options: ["EC2", "S3", "Lambda", "RDS"],
        correctAnswer: 2,
        category: "Cloud",
      },
      {
        id: 6,
        question: "What is the purpose of a load balancer?",
        options: [
          "To encrypt traffic between client and server",
          "To distribute incoming traffic across multiple servers",
          "To cache static assets close to users",
          "To back up server data automatically",
        ],
        correctAnswer: 1,
        category: "Infrastructure",
      },
      {
        id: 7,
        question: "What does 'blue-green deployment' mean?",
        options: [
          "Deploying different features to different user segments",
          "Using two identical environments and switching traffic between them for zero-downtime releases",
          "Color-coding deployment stages in a CI/CD pipeline",
          "Deploying backend and frontend separately",
        ],
        correctAnswer: 1,
        category: "DevOps",
      },
      {
        id: 8,
        question: "What is the purpose of a Dockerfile?",
        options: [
          "To configure Kubernetes clusters",
          "To define the steps to build a Docker image",
          "To set up CI/CD pipelines",
          "To manage cloud billing",
        ],
        correctAnswer: 1,
        category: "Containers",
      },
    ],
    practicalTask: {
      description:
        "Write a CI/CD pipeline configuration and containerize a simple web application.",
      steps: [
        "Create a Dockerfile for a simple Node.js or Python web app",
        "Write a GitHub Actions or GitLab CI YAML pipeline that builds and tests the app",
        "Add a deployment stage (can be simulated)",
        "Include environment variable configuration",
        "Document the pipeline stages in a README",
      ],
      formats: [".zip", ".yml", ".yaml", ".pdf"],
    },
    practicalKeywords: [
      "from",
      "run",
      "cmd",
      "workflow",
      "steps",
      "push",
      "build",
      "test",
      "deploy",
      "pipeline",
      "docker",
      "image",
      "container",
      "yaml",
      "github actions",
    ],
    interviewQuestions: [
      "Explain the difference between horizontal and vertical scaling, and when you would use each.",
      "How would you design a disaster recovery plan for a critical cloud application?",
      "Describe how you have used monitoring and alerting to detect and resolve production incidents.",
      "What are the trade-offs between using managed cloud services versus self-hosted infrastructure?",
      "Walk me through how you would reduce cloud infrastructure costs without impacting reliability.",
    ],
    interviewKeywords: [
      [
        "horizontal",
        "vertical",
        "scale out",
        "scale up",
        "load balancer",
        "capacity",
        "resources",
        "nodes",
      ],
      [
        "backup",
        "rpo",
        "rto",
        "failover",
        "replication",
        "recovery",
        "redundancy",
        "restore",
      ],
      [
        "monitoring",
        "alerting",
        "prometheus",
        "grafana",
        "logs",
        "metrics",
        "incident",
        "sla",
        "uptime",
      ],
      [
        "managed",
        "self-hosted",
        "maintenance",
        "cost",
        "vendor",
        "control",
        "lock-in",
        "cloud",
      ],
      [
        "cost",
        "reserved",
        "spot",
        "right-sizing",
        "auto-scaling",
        "budget",
        "optimize",
        "savings",
        "instance",
      ],
    ],
    courseRecs: {
      beginner: [
        {
          title: "Docker & Kubernetes Basics",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "Docker Kubernetes"),
          difficulty: "Beginner",
          duration: "5 weeks",
          reason: "Get started with containers",
        },
        {
          title: "Cloud Computing Fundamentals",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "cloud computing fundamentals"),
          difficulty: "Beginner",
          duration: "4 weeks",
          reason: "Understand cloud concepts",
        },
      ],
      intermediate: [
        {
          title: "AWS Certification Prep",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "AWS certification"),
          difficulty: "Intermediate",
          duration: "8 weeks",
          reason: "Get AWS certified",
        },
        {
          title: "DevOps Engineering",
          platform: "Simplilearn",
          url: makeCourseUrl("Simplilearn", "DevOps engineering"),
          difficulty: "Intermediate",
          duration: "10 weeks",
          reason: "Master CI/CD and automation",
        },
      ],
      advanced: [
        {
          title: "Kubernetes Advanced Administration",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "Kubernetes advanced"),
          difficulty: "Advanced",
          duration: "8 weeks",
          reason: "Master Kubernetes at scale",
        },
        {
          title: "Azure DevOps & Cloud Architecture",
          platform: "Simplilearn",
          url: makeCourseUrl("Simplilearn", "Azure DevOps cloud architecture"),
          difficulty: "Advanced",
          duration: "12 weeks",
          reason: "Architect enterprise cloud solutions",
        },
      ],
    },
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity",
    icon: <Shield className="w-6 h-6" />,
    color: "from-red-500 to-red-600",
    description: "Network security, ethical hacking, cryptography & compliance",
    quizQuestions: [
      {
        id: 1,
        question: "What is the purpose of encryption?",
        options: [
          "To speed up data transmission",
          "To compress data files",
          "To protect data confidentiality",
          "To organize data better",
        ],
        correctAnswer: 2,
        category: "Cryptography",
      },
      {
        id: 2,
        question: "What is a SQL injection attack?",
        options: [
          "Injecting malicious SQL into a database to corrupt its files",
          "Inserting malicious SQL code into input fields to manipulate a database",
          "Using SQL to bypass network firewalls",
          "Flooding a database server with SQL queries",
        ],
        correctAnswer: 1,
        category: "Web Security",
      },
      {
        id: 3,
        question: "What does HTTPS provide over HTTP?",
        options: [
          "Faster page load times",
          "Encrypted communication between client and server",
          "Server-side caching",
          "Automatic form validation",
        ],
        correctAnswer: 1,
        category: "Network Security",
      },
      {
        id: 4,
        question: "What is a Man-in-the-Middle (MitM) attack?",
        options: [
          "An attacker intercepting and possibly altering communication between two parties",
          "An attack that floods a server with requests",
          "Gaining unauthorized access using default credentials",
          "Sending phishing emails to employees",
        ],
        correctAnswer: 0,
        category: "Attack Types",
      },
      {
        id: 5,
        question: "What is the principle of least privilege?",
        options: [
          "Giving admin rights to the fewest people possible",
          "Granting users only the permissions they need to perform their job",
          "Restricting internet access to privileged users only",
          "Storing data with minimal encryption",
        ],
        correctAnswer: 1,
        category: "Security Principles",
      },
      {
        id: 6,
        question: "What does a firewall do?",
        options: [
          "Encrypts data stored on a server",
          "Monitors and controls incoming/outgoing network traffic based on rules",
          "Scans files for malware",
          "Manages user authentication",
        ],
        correctAnswer: 1,
        category: "Network Security",
      },
      {
        id: 7,
        question: "What is social engineering in the context of cybersecurity?",
        options: [
          "Using AI to design security systems",
          "Building a team of security engineers",
          "Manipulating people psychologically to divulge confidential information",
          "Engineering software to be socially responsible",
        ],
        correctAnswer: 2,
        category: "Attack Types",
      },
      {
        id: 8,
        question: "What is two-factor authentication (2FA)?",
        options: [
          "Using two different passwords for the same account",
          "A security process requiring two forms of verification to access an account",
          "Authenticating with two separate devices simultaneously",
          "Encrypting data twice for added security",
        ],
        correctAnswer: 1,
        category: "Authentication",
      },
    ],
    practicalTask: {
      description:
        "Conduct a basic security audit of a sample web application and document vulnerabilities.",
      steps: [
        "Identify at least 3 common web vulnerabilities (OWASP Top 10)",
        "Document each vulnerability with a description and risk level",
        "Propose a remediation for each vulnerability",
        "Check for insecure headers using browser dev tools or a tool like securityheaders.com",
        "Write a short security report summarizing your findings",
      ],
      formats: [".pdf", ".docx", ".md", ".zip"],
    },
    practicalKeywords: [
      "vulnerability",
      "owasp",
      "xss",
      "sql injection",
      "csrf",
      "header",
      "risk",
      "remediation",
      "security",
      "audit",
      "report",
      "attack",
      "mitigation",
    ],
    interviewQuestions: [
      "Explain the difference between symmetric and asymmetric encryption with examples.",
      "How would you respond to a ransomware attack on a company's systems?",
      "Describe how you would perform a penetration test on a web application.",
      "What is zero-trust architecture and why is it becoming more common?",
      "How do you stay up to date with emerging cybersecurity threats and vulnerabilities?",
    ],
    interviewKeywords: [
      [
        "symmetric",
        "asymmetric",
        "aes",
        "rsa",
        "key",
        "encryption",
        "private",
        "public",
        "cipher",
      ],
      [
        "ransomware",
        "isolate",
        "backup",
        "restore",
        "incident",
        "response",
        "report",
        "recover",
        "contain",
      ],
      [
        "penetration",
        "recon",
        "reconnaissance",
        "scan",
        "exploit",
        "payload",
        "burp",
        "nmap",
        "report",
      ],
      [
        "zero trust",
        "verify",
        "least privilege",
        "network",
        "identity",
        "perimeter",
        "micro-segmentation",
      ],
      [
        "threat",
        "cve",
        "owasp",
        "newsletter",
        "blog",
        "conference",
        "patch",
        "vulnerability",
        "update",
      ],
    ],
    courseRecs: {
      beginner: [
        {
          title: "Cybersecurity Fundamentals",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "cybersecurity fundamentals"),
          difficulty: "Beginner",
          duration: "5 weeks",
          reason: "Learn core security concepts",
        },
        {
          title: "Network Security Basics",
          platform: "Simplilearn",
          url: makeCourseUrl("Simplilearn", "network security"),
          difficulty: "Beginner",
          duration: "4 weeks",
          reason: "Understand network defense",
        },
      ],
      intermediate: [
        {
          title: "Ethical Hacking Course",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "ethical hacking"),
          difficulty: "Intermediate",
          duration: "10 weeks",
          reason: "Learn penetration testing techniques",
        },
        {
          title: "Information Security",
          platform: "edX",
          url: makeCourseUrl("edX", "information security"),
          difficulty: "Intermediate",
          duration: "8 weeks",
          reason: "Master information security practices",
        },
      ],
      advanced: [
        {
          title: "Advanced Penetration Testing",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "advanced penetration testing"),
          difficulty: "Advanced",
          duration: "10 weeks",
          reason: "Become a professional penetration tester",
        },
        {
          title: "Security Engineering",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "security engineering"),
          difficulty: "Advanced",
          duration: "12 weeks",
          reason: "Design and build secure systems",
        },
      ],
    },
  },
  {
    id: "uiux",
    label: "UI/UX Design",
    icon: <Palette className="w-6 h-6" />,
    color: "from-pink-500 to-pink-600",
    description: "User research, prototyping, Figma & design systems",
    quizQuestions: [
      {
        id: 1,
        question: "What is the primary goal of user experience (UX) design?",
        options: [
          "Making products visually attractive",
          "Creating products that are easy, efficient, and enjoyable for users",
          "Writing clean front-end code",
          "Reducing development costs",
        ],
        correctAnswer: 1,
        category: "UX Principles",
      },
      {
        id: 2,
        question: "What is a wireframe in the design process?",
        options: [
          "A high-fidelity mockup with colors and typography",
          "A low-fidelity layout showing structure and content placement",
          "A clickable prototype for user testing",
          "A final deliverable handed off to developers",
        ],
        correctAnswer: 1,
        category: "Design Process",
      },
      {
        id: 3,
        question: "What does 'affordance' mean in UX design?",
        options: [
          "The cost of building a user interface",
          "A visual cue that communicates how an element should be used",
          "The time it takes a user to learn a new interface",
          "The number of users who can access a product",
        ],
        correctAnswer: 1,
        category: "UX Principles",
      },
      {
        id: 4,
        question: "What is the purpose of a design system?",
        options: [
          "To manage project timelines and sprints",
          "To provide a shared library of reusable UI components and guidelines",
          "To replace the need for user research",
          "To generate code automatically from designs",
        ],
        correctAnswer: 1,
        category: "Design Systems",
      },
      {
        id: 5,
        question: "What does WCAG stand for in web accessibility?",
        options: [
          "Web Content Accessibility Guidelines",
          "World CSS Authoring Group",
          "Web Component Accessibility Guide",
          "Web Color Accessibility Guidelines",
        ],
        correctAnswer: 0,
        category: "Accessibility",
      },
      {
        id: 6,
        question: "What is A/B testing in UX?",
        options: [
          "Testing two user personas with the same design",
          "Comparing two versions of a design to see which performs better",
          "An accessibility and behavior test",
          "Testing on two different browsers",
        ],
        correctAnswer: 1,
        category: "Research",
      },
      {
        id: 7,
        question: "What is Fitts's Law?",
        options: [
          "A rule that governs color contrast ratios",
          "A principle stating the time to hit a target depends on distance and size",
          "A formula for calculating user retention",
          "A guideline for font size and line height",
        ],
        correctAnswer: 1,
        category: "UX Principles",
      },
      {
        id: 8,
        question: "What is the purpose of usability testing?",
        options: [
          "To test code for performance issues",
          "To observe real users interacting with a product and identify pain points",
          "To validate color and typography choices",
          "To test browser compatibility",
        ],
        correctAnswer: 1,
        category: "Research",
      },
    ],
    practicalTask: {
      description:
        "Design a mobile app screen flow for a task management app and present your design rationale.",
      steps: [
        "Create 3–5 wireframe screens (Figma, Sketch, or paper)",
        "Design a clear navigation flow between screens",
        "Apply basic accessibility considerations (contrast, touch target sizes)",
        "Write a short rationale explaining your design decisions",
        "Export as PDF, PNG, or Figma share link",
      ],
      formats: [".pdf", ".png", ".zip", ".fig"],
    },
    practicalKeywords: [
      "wireframe",
      "screen",
      "navigation",
      "figma",
      "sketch",
      "accessibility",
      "contrast",
      "touch",
      "flow",
      "user",
      "layout",
      "component",
      "prototype",
    ],
    interviewQuestions: [
      "Walk me through your design process from brief to final handoff.",
      "How do you handle design feedback that you disagree with?",
      "Describe a time when user research changed the direction of your design.",
      "How do you ensure your designs are accessible to users with disabilities?",
      "What metrics do you use to evaluate whether a design is successful?",
    ],
    interviewKeywords: [
      [
        "research",
        "wireframe",
        "prototype",
        "iterate",
        "handoff",
        "figma",
        "testing",
        "brief",
        "mockup",
      ],
      [
        "feedback",
        "collaborate",
        "explain",
        "rationale",
        "user",
        "data",
        "compromise",
        "listen",
        "iteration",
      ],
      [
        "research",
        "interview",
        "user",
        "insight",
        "pivot",
        "finding",
        "changed",
        "direction",
        "usability",
      ],
      [
        "wcag",
        "contrast",
        "keyboard",
        "screen reader",
        "aria",
        "alt text",
        "focus",
        "color",
        "accessible",
      ],
      [
        "retention",
        "conversion",
        "task completion",
        "nps",
        "engagement",
        "bounce",
        "session",
        "metric",
        "success",
      ],
    ],
    courseRecs: {
      beginner: [
        {
          title: "UX Design Fundamentals",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "UX design fundamentals"),
          difficulty: "Beginner",
          duration: "5 weeks",
          reason: "Learn the foundations of UX design",
        },
        {
          title: "UI Design for Beginners",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "UI design beginners"),
          difficulty: "Beginner",
          duration: "4 weeks",
          reason: "Start designing beautiful interfaces",
        },
      ],
      intermediate: [
        {
          title: "Product Design with Figma",
          platform: "upGrad",
          url: makeCourseUrl("upGrad", "product design Figma"),
          difficulty: "Intermediate",
          duration: "8 weeks",
          reason: "Master Figma and design systems",
        },
        {
          title: "User Research Methods",
          platform: "edX",
          url: makeCourseUrl("edX", "user research methods"),
          difficulty: "Intermediate",
          duration: "6 weeks",
          reason: "Build strong research skills",
        },
      ],
      advanced: [
        {
          title: "Advanced UX Strategy",
          platform: "LinkedIn Learning",
          url: makeCourseUrl("LinkedIn Learning", "advanced UX strategy"),
          difficulty: "Advanced",
          duration: "6 weeks",
          reason: "Lead design at a strategic level",
        },
        {
          title: "Design Systems at Scale",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "design systems scale"),
          difficulty: "Advanced",
          duration: "8 weeks",
          reason: "Build and maintain enterprise design systems",
        },
      ],
    },
  },
  {
    id: "mobile",
    label: "Mobile Development",
    icon: <Smartphone className="w-6 h-6" />,
    color: "from-orange-500 to-orange-600",
    description: "React Native, Flutter, iOS/Android & app store publishing",
    quizQuestions: [
      {
        id: 1,
        question: "What is React Native?",
        options: [
          "A native iOS framework from Apple",
          "A JavaScript framework for building cross-platform mobile apps",
          "A testing library for mobile applications",
          "A mobile-first CSS framework",
        ],
        correctAnswer: 1,
        category: "React Native",
      },
      {
        id: 2,
        question:
          "What is the difference between a native app and a hybrid app?",
        options: [
          "Native apps run in a browser; hybrid apps are compiled",
          "Native apps are built for a specific platform; hybrid apps share code across platforms",
          "Native apps are free; hybrid apps require a license",
          "There is no difference in modern mobile development",
        ],
        correctAnswer: 1,
        category: "Mobile Concepts",
      },
      {
        id: 3,
        question: "What does 'responsive design' mean for mobile apps?",
        options: [
          "Apps that respond to voice commands",
          "Layouts that adapt to different screen sizes and orientations",
          "Apps with fast response times",
          "Designs that respond to user gestures only",
        ],
        correctAnswer: 1,
        category: "Design",
      },
      {
        id: 4,
        question: "What is the purpose of AsyncStorage in React Native?",
        options: [
          "To make asynchronous API calls",
          "To persist key-value data locally on the device",
          "To store app assets offline",
          "To cache network responses",
        ],
        correctAnswer: 1,
        category: "React Native",
      },
      {
        id: 5,
        question:
          "Which file format is used to publish apps on the Google Play Store?",
        options: [".ipa", ".apk or .aab", ".exe", ".dmg"],
        correctAnswer: 1,
        category: "Publishing",
      },
      {
        id: 6,
        question: "What is a 'FlatList' in React Native used for?",
        options: [
          "Rendering flat UI elements without borders",
          "Efficiently rendering large scrollable lists of data",
          "Creating flat navigation structures",
          "Displaying tabular data",
        ],
        correctAnswer: 1,
        category: "React Native",
      },
      {
        id: 7,
        question: "What is 'deep linking' in mobile apps?",
        options: [
          "Linking to deeply nested components in code",
          "Allowing URLs to navigate users to a specific screen inside an app",
          "A technique for reducing app bundle size",
          "Loading data from multiple nested API calls",
        ],
        correctAnswer: 1,
        category: "Mobile Concepts",
      },
      {
        id: 8,
        question: "What is the purpose of push notifications in mobile apps?",
        options: [
          "To push app updates to users automatically",
          "To send messages to users even when the app is not open",
          "To upload data from the app to a server",
          "To display alerts within the app screen",
        ],
        correctAnswer: 1,
        category: "Mobile Concepts",
      },
    ],
    practicalTask: {
      description:
        "Build a simple to-do list app using React Native or Flutter.",
      steps: [
        "Implement adding and removing items from a list",
        "Persist data locally using AsyncStorage or shared_preferences",
        "Handle different screen sizes gracefully",
        "Add basic animations for item add/remove",
        "Provide a short video or screenshots demonstrating the app",
      ],
      formats: [".zip", ".apk", ".pdf", ".mp4"],
    },
    practicalKeywords: [
      "react native",
      "flutter",
      "asyncstorage",
      "flatlist",
      "component",
      "state",
      "navigation",
      "screen",
      "stylesheet",
      "platform",
      "android",
      "ios",
    ],
    interviewQuestions: [
      "Explain the difference between React Native and Flutter. When would you choose one over the other?",
      "How do you handle platform-specific code in a cross-platform mobile app?",
      "Describe how you would optimize a mobile app that is consuming too much battery.",
      "What is your approach to testing mobile apps across different devices and OS versions?",
      "How do you manage app state in a large React Native application?",
    ],
    interviewKeywords: [
      [
        "react native",
        "flutter",
        "javascript",
        "dart",
        "cross-platform",
        "performance",
        "community",
        "native",
      ],
      [
        "platform",
        "platform.os",
        "platform-specific",
        "android",
        "ios",
        "conditional",
        "native module",
      ],
      [
        "battery",
        "background",
        "location",
        "sensor",
        "optimize",
        "network",
        "polling",
        "wake lock",
        "cpu",
      ],
      [
        "testing",
        "device",
        "emulator",
        "simulator",
        "jest",
        "detox",
        "os",
        "version",
        "compatibility",
      ],
      [
        "redux",
        "context",
        "zustand",
        "mobx",
        "state",
        "store",
        "global",
        "provider",
        "manage",
      ],
    ],
    courseRecs: {
      beginner: [
        {
          title: "React Native for Beginners",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "React Native beginners"),
          difficulty: "Beginner",
          duration: "5 weeks",
          reason: "Start building mobile apps with JavaScript",
        },
        {
          title: "Mobile App Development",
          platform: "Great Learning",
          url: makeCourseUrl("Great Learning", "mobile app development"),
          difficulty: "Beginner",
          duration: "4 weeks",
          reason: "Learn mobile development fundamentals",
        },
      ],
      intermediate: [
        {
          title: "React Native — The Practical Guide",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "React Native practical guide"),
          difficulty: "Intermediate",
          duration: "8 weeks",
          reason: "Build real-world mobile apps",
        },
        {
          title: "Mobile Development with Flutter",
          platform: "upGrad",
          url: makeCourseUrl("upGrad", "Flutter mobile development"),
          difficulty: "Intermediate",
          duration: "8 weeks",
          reason: "Learn Google's Flutter framework",
        },
      ],
      advanced: [
        {
          title: "Advanced React Native Architecture",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "advanced React Native"),
          difficulty: "Advanced",
          duration: "8 weeks",
          reason: "Scale and architect complex mobile apps",
        },
        {
          title: "Mobile App Performance Optimization",
          platform: "LinkedIn Learning",
          url: makeCourseUrl("LinkedIn Learning", "mobile app performance"),
          difficulty: "Advanced",
          duration: "4 weeks",
          reason: "Build blazing-fast mobile experiences",
        },
      ],
    },
  },
  {
    id: "databases",
    label: "Database Engineering",
    icon: <Database className="w-6 h-6" />,
    color: "from-yellow-500 to-yellow-600",
    description: "SQL, NoSQL, query optimization & data modeling",
    quizQuestions: [
      {
        id: 1,
        question: "What does SQL stand for?",
        options: [
          "System Query Language",
          "Structured Query Language",
          "Simple Question Logic",
          "Standard Quality Language",
        ],
        correctAnswer: 1,
        category: "SQL",
      },
      {
        id: 2,
        question: "What is normalization in database design?",
        options: [
          "Converting all data to lowercase",
          "Organizing data to reduce redundancy and improve integrity",
          "Indexing all columns in a table",
          "Partitioning tables across multiple servers",
        ],
        correctAnswer: 1,
        category: "Data Modeling",
      },
      {
        id: 3,
        question: "What is the difference between INNER JOIN and LEFT JOIN?",
        options: [
          "INNER JOIN is faster; LEFT JOIN is more accurate",
          "INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table",
          "INNER JOIN works on text; LEFT JOIN works on numbers",
          "There is no practical difference",
        ],
        correctAnswer: 1,
        category: "SQL",
      },
      {
        id: 4,
        question: "What is ACID in the context of databases?",
        options: [
          "A set of properties ensuring reliable database transactions",
          "A type of query optimization algorithm",
          "A NoSQL database protocol",
          "An indexing strategy for large tables",
        ],
        correctAnswer: 0,
        category: "Transactions",
      },
      {
        id: 5,
        question: "What is a foreign key?",
        options: [
          "An encrypted primary key for external access",
          "A key used to link two tables by referencing the primary key of another table",
          "A key that uniquely identifies rows in a table",
          "An automatically generated surrogate key",
        ],
        correctAnswer: 1,
        category: "Data Modeling",
      },
      {
        id: 6,
        question: "What is a NoSQL database most suited for?",
        options: [
          "Complex multi-table relational queries",
          "Storing and retrieving flexible, unstructured, or semi-structured data at scale",
          "Financial transaction processing",
          "Enforcing strict schema constraints",
        ],
        correctAnswer: 1,
        category: "NoSQL",
      },
      {
        id: 7,
        question: "What does the EXPLAIN statement do in SQL?",
        options: [
          "Adds documentation to a query",
          "Shows the execution plan the database will use for a query",
          "Translates SQL into plain English",
          "Runs a query and displays performance metrics",
        ],
        correctAnswer: 1,
        category: "Query Optimization",
      },
      {
        id: 8,
        question: "What is database sharding?",
        options: [
          "Splitting a database table into smaller parts by columns",
          "Distributing data across multiple database instances to improve scalability",
          "Creating read replicas for reporting queries",
          "Encrypting sensitive columns in a table",
        ],
        correctAnswer: 1,
        category: "Scalability",
      },
    ],
    practicalTask: {
      description:
        "Design and query a relational database schema for an e-commerce platform.",
      steps: [
        "Design a normalized schema with at least 4 tables (products, orders, users, order_items)",
        "Write SQL to create the tables with appropriate constraints",
        "Write 5 queries: SELECT with JOIN, aggregate, subquery, UPDATE, and DELETE",
        "Add at least 2 indexes and explain why you chose them",
        "Document your schema with a short ERD (can be hand-drawn)",
      ],
      formats: [".sql", ".pdf", ".zip", ".png"],
    },
    practicalKeywords: [
      "create table",
      "select",
      "join",
      "insert",
      "update",
      "delete",
      "index",
      "primary key",
      "foreign key",
      "constraint",
      "having",
      "group by",
      "order by",
      "schema",
    ],
    interviewQuestions: [
      "Explain the difference between a clustered and non-clustered index.",
      "How would you optimize a slow SQL query on a table with millions of rows?",
      "When would you choose a NoSQL database over a relational database?",
      "Describe a database schema you designed. What trade-offs did you make?",
      "How do you handle database migrations in a production system with zero downtime?",
    ],
    interviewKeywords: [
      [
        "clustered",
        "non-clustered",
        "index",
        "primary",
        "physical",
        "row",
        "lookup",
        "sorted",
        "leaf",
      ],
      [
        "index",
        "query plan",
        "explain",
        "slow",
        "n+1",
        "caching",
        "partition",
        "optimize",
        "execution",
      ],
      [
        "nosql",
        "flexible",
        "schema",
        "scale",
        "document",
        "unstructured",
        "mongodb",
        "relational",
        "sql",
      ],
      [
        "schema",
        "normalized",
        "trade-off",
        "table",
        "relationship",
        "foreign key",
        "design",
        "entity",
      ],
      [
        "migration",
        "zero downtime",
        "blue-green",
        "backward compatible",
        "rollback",
        "flyway",
        "liquibase",
        "deploy",
      ],
    ],
    courseRecs: {
      beginner: [
        {
          title: "SQL for Beginners",
          platform: "Udemy",
          url: makeCourseUrl("Udemy", "SQL databases"),
          difficulty: "Beginner",
          duration: "4 weeks",
          reason: "Learn SQL from the ground up",
        },
        {
          title: "Database Foundations",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "database foundations"),
          difficulty: "Beginner",
          duration: "5 weeks",
          reason: "Understand relational database concepts",
        },
      ],
      intermediate: [
        {
          title: "Advanced SQL & Database Design",
          platform: "edX",
          url: makeCourseUrl("edX", "advanced SQL database design"),
          difficulty: "Intermediate",
          duration: "6 weeks",
          reason: "Master complex queries and schema design",
        },
        {
          title: "Big Data Engineering",
          platform: "Simplilearn",
          url: makeCourseUrl("Simplilearn", "big data engineering"),
          difficulty: "Intermediate",
          duration: "8 weeks",
          reason: "Work with large-scale data systems",
        },
      ],
      advanced: [
        {
          title: "Database Performance Tuning",
          platform: "Pluralsight",
          url: makeCourseUrl("Pluralsight", "database performance tuning"),
          difficulty: "Advanced",
          duration: "6 weeks",
          reason: "Optimize databases for production scale",
        },
        {
          title: "Distributed Databases",
          platform: "Coursera",
          url: makeCourseUrl("Coursera", "distributed databases"),
          difficulty: "Advanced",
          duration: "8 weeks",
          reason: "Design globally distributed data systems",
        },
      ],
    },
  },
];

interface AssessmentState {
  selectedSkill: string | null;
  currentLevel: number;
  level1Status: "locked" | "in-progress" | "passed" | "failed";
  level2Status: "locked" | "in-progress" | "passed" | "failed";
  level3Status: "locked" | "in-progress" | "passed" | "failed";
  level1Score: number;
  level2Score: number;
  level3Score: number;
  level1Answers: number[];
  level2File: File | null;
  level3Answers: string[];
  showResults: boolean;
  weakTopics: string[];
}

type Action =
  | { type: "SELECT_SKILL"; skill: string }
  | { type: "START_LEVEL"; level: number }
  | {
      type: "SUBMIT_LEVEL1";
      answers: number[];
      score: number;
      weakTopics: string[];
    }
  | { type: "SUBMIT_LEVEL2"; file: File; score: number }
  | { type: "SUBMIT_LEVEL3"; answers: string[]; score: number }
  | { type: "RETRY_LEVEL"; level: number }
  | { type: "SHOW_RESULTS" }
  | { type: "HIDE_RESULTS" }
  | { type: "CHANGE_SKILL" }
  | { type: "BACK_TO_DASHBOARD" };

const initialState: AssessmentState = {
  selectedSkill: null,
  currentLevel: 0,
  level1Status: "locked",
  level2Status: "locked",
  level3Status: "locked",
  level1Score: 0,
  level2Score: 0,
  level3Score: 0,
  level1Answers: [],
  level2File: null,
  level3Answers: [],
  showResults: false,
  weakTopics: [],
};

function assessmentReducer(
  state: AssessmentState,
  action: Action,
): AssessmentState {
  switch (action.type) {
    case "SELECT_SKILL":
      return { ...initialState, selectedSkill: action.skill };

    case "CHANGE_SKILL":
      return { ...initialState };

    case "START_LEVEL":
      if (action.level === 1) {
        return { ...state, currentLevel: 1, level1Status: "in-progress" };
      } else if (action.level === 2 && state.level1Status === "passed") {
        return { ...state, currentLevel: 2, level2Status: "in-progress" };
      } else if (action.level === 3 && state.level2Status === "passed") {
        return { ...state, currentLevel: 3, level3Status: "in-progress" };
      }
      return state;

    case "SUBMIT_LEVEL1":
      return {
        ...state,
        level1Answers: action.answers,
        level1Score: action.score,
        level1Status: action.score >= 60 ? "passed" : "failed",
        weakTopics: action.weakTopics,
        currentLevel: 0,
      };

    case "SUBMIT_LEVEL2":
      return {
        ...state,
        level2File: action.file,
        level2Score: action.score,
        level2Status: action.score >= 60 ? "passed" : "failed",
        currentLevel: 0,
      };

    case "SUBMIT_LEVEL3":
      return {
        ...state,
        level3Answers: action.answers,
        level3Score: action.score,
        level3Status: action.score >= 60 ? "passed" : "failed",
        currentLevel: 0,
        showResults: true,
      };

    case "RETRY_LEVEL":
      if (action.level === 1) {
        return {
          ...state,
          level1Status: "in-progress",
          currentLevel: 1,
          level1Score: 0,
        };
      } else if (action.level === 2) {
        return {
          ...state,
          level2Status: "in-progress",
          currentLevel: 2,
          level2Score: 0,
        };
      }
      return state;

    case "SHOW_RESULTS":
      return { ...state, showResults: true };

    case "HIDE_RESULTS":
      return { ...state, showResults: false };

    case "BACK_TO_DASHBOARD":
      return { ...state, currentLevel: 0 };

    default:
      return state;
  }
}

export default function Assessment() {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [level2Breakdown, setLevel2Breakdown] = useState<{
    dataset: number;
    methodology: number;
    results: number;
    total: number;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Voice recording state
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [voiceFeedback, setVoiceFeedback] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  const { logActivity } = useUser();
  const activeTrack =
    SKILL_TRACKS.find((t) => t.id === state.selectedSkill) ?? null;

  const startLevel1 = () => {
    if (!activeTrack) return;
    setCurrentQuizQuestion(0);
    setSelectedAnswers(new Array(activeTrack.quizQuestions.length).fill(-1));
    dispatch({ type: "START_LEVEL", level: 1 });
  };

  const startLevel2 = () => {
    setUploadedFile(null);
    setLevel2Breakdown(null);
    setFileError(null);
    dispatch({ type: "START_LEVEL", level: 2 });
  };

  const startLevel3 = () => {
    if (!activeTrack) return;
    setInterviewAnswers(
      new Array(activeTrack.interviewQuestions.length).fill(""),
    );
    setVoiceFeedback(new Array(activeTrack.interviewQuestions.length).fill(""));
    dispatch({ type: "START_LEVEL", level: 3 });
  };

  const handleQuizSubmit = () => {
    if (!activeTrack) return;
    let correct = 0;
    const wrongCategories: string[] = [];
    activeTrack.quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      } else {
        wrongCategories.push(q.category);
      }
    });
    const score = Math.round(
      (correct / activeTrack.quizQuestions.length) * 100,
    );
    dispatch({
      type: "SUBMIT_LEVEL1",
      answers: selectedAnswers,
      score,
      weakTopics: Array.from(new Set(wrongCategories)),
    });
    logActivity({
      type: "assessment_result",
      label: `Level 1 Quiz — ${activeTrack.label}`,
      detail: `${score >= 60 ? "Passed" : "Failed"} with ${score}%`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // ─── Level 2: keyword-based file evaluation ───────────────────────────────
  const handleLevel2Submit = async () => {
    if (!uploadedFile || !activeTrack) return;
    setIsEvaluating(true);
    setFileError(null);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let fileText = "";
    const readable = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".py",
      ".sql",
      ".html",
      ".css",
      ".yml",
      ".yaml",
      ".md",
      ".txt",
      ".ipynb",
    ];
    const ext = "." + uploadedFile.name.split(".").pop()?.toLowerCase();
    if (readable.includes(ext)) {
      try {
        fileText = await uploadedFile.text();
      } catch {
        fileText = "";
      }
    }

    const textLower = fileText.toLowerCase();
    const keywords = activeTrack.practicalKeywords;
    const matched = keywords.filter((kw) =>
      textLower.includes(kw.toLowerCase()),
    );
    const matchRatio = matched.length / keywords.length;

    let datasetScore: number, methodologyScore: number, resultsScore: number;
    if (fileText.length < 100 && readable.includes(ext)) {
      // Too short to be a real submission
      datasetScore = 2;
      methodologyScore = 3;
      resultsScore = 2;
    } else if (matchRatio >= 0.35) {
      datasetScore = Math.floor(matchRatio * 15);
      methodologyScore = Math.floor(matchRatio * 20);
      resultsScore = Math.floor(matchRatio * 15);
    } else if (matchRatio > 0.1) {
      datasetScore = Math.floor(Math.random() * 4) + 4;
      methodologyScore = Math.floor(Math.random() * 5) + 6;
      resultsScore = Math.floor(Math.random() * 4) + 4;
    } else {
      // Binary or unreadable file or too few keywords — low score
      datasetScore = Math.floor(Math.random() * 3) + 2;
      methodologyScore = Math.floor(Math.random() * 4) + 3;
      resultsScore = Math.floor(Math.random() * 3) + 2;
    }

    const totalScore = datasetScore + methodologyScore + resultsScore;
    const percentage = Math.round((totalScore / 50) * 100);

    if (percentage < 60) {
      setFileError(
        matched.length === 0
          ? "Your submission does not appear to address the task requirements. Please review the steps and resubmit."
          : `Your submission matches ${matched.length} of ${keywords.length} expected concepts (${Math.round(matchRatio * 100)}%). Please address all required steps and resubmit.`,
      );
    }

    setLevel2Breakdown({
      dataset: datasetScore,
      methodology: methodologyScore,
      results: resultsScore,
      total: totalScore,
    });
    dispatch({ type: "SUBMIT_LEVEL2", file: uploadedFile, score: percentage });
    logActivity({
      type: "assessment_result",
      label: `Level 2 Practical — ${activeTrack.label}`,
      detail: `${percentage >= 60 ? "Passed" : "Failed"} with ${percentage}%`,
    });
    setIsEvaluating(false);
  };

  // ─── Voice recording ──────────────────────────────────────────────────────
  const startVoiceRecording = useCallback(
    (idx: number) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        const fb = [...voiceFeedback];
        fb[idx] =
          "Voice input is not supported in this browser. Please type your answer.";
        setVoiceFeedback(fb);
        return;
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
      setRecordingIdx(idx);
      const fb = [...voiceFeedback];
      fb[idx] = "";
      setVoiceFeedback(fb);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
        if (!transcript) {
          const newFb = [...voiceFeedback];
          newFb[idx] = "answer not recorded, try again";
          setVoiceFeedback(newFb);
        } else {
          setInterviewAnswers((prev) => {
            const next = [...prev];
            next[idx] = transcript;
            return next;
          });
          const newFb = [...voiceFeedback];
          newFb[idx] = "Voice recorded successfully.";
          setVoiceFeedback(newFb);
        }
        setRecordingIdx(null);
      };

      recognition.onerror = () => {
        const newFb = [...voiceFeedback];
        newFb[idx] = "answer not recorded, try again";
        setVoiceFeedback(newFb);
        setRecordingIdx(null);
      };

      recognition.onend = () => {
        setRecordingIdx((cur) => (cur === idx ? null : cur));
      };

      recognition.start();
    },
    [voiceFeedback],
  );

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecordingIdx(null);
  }, []);

  // ─── Level 3: keyword-based answer evaluation ─────────────────────────────
  const handleLevel3Submit = () => {
    if (!activeTrack) return;
    let correct = 0;
    activeTrack.interviewQuestions.forEach((_, idx) => {
      const answer = (interviewAnswers[idx] ?? "").toLowerCase();
      const keywords = activeTrack.interviewKeywords[idx] ?? [];
      const matches = keywords.filter((kw) =>
        answer.includes(kw.toLowerCase()),
      );
      if (matches.length >= 2) correct++;
    });
    const score = Math.round(
      (correct / activeTrack.interviewQuestions.length) * 100,
    );
    dispatch({ type: "SUBMIT_LEVEL3", answers: interviewAnswers, score });
    logActivity({
      type: "assessment_result",
      label: `Level 3 Interview — ${activeTrack.label}`,
      detail: `Completed with ${score}%`,
    });
  };

  const getRecommendations = (): CourseRec[] => {
    if (!activeTrack) return [];
    if (state.level1Score < 60) return activeTrack.courseRecs.beginner;
    if (state.weakTopics.length > 0) return activeTrack.courseRecs.intermediate;
    return activeTrack.courseRecs.advanced;
  };

  const getLevelColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-600 border-green-600 bg-green-50";
      case "failed":
        return "text-red-600 border-red-600 bg-red-50";
      case "in-progress":
        return "text-blue-600 border-blue-600 bg-blue-50";
      default:
        return "text-muted-foreground border-border bg-muted/40";
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 71) return "text-green-600";
    if (score >= 41) return "text-yellow-600";
    return "text-red-600";
  };

  const chartData = [
    { level: "Level 1", score: state.level1Score, fullMark: 100 },
    { level: "Level 2", score: state.level2Score, fullMark: 100 },
    { level: "Level 3", score: state.level3Score, fullMark: 100 },
  ];

  const radarData = [
    { subject: "Quiz", score: state.level1Score },
    { subject: "Practical", score: state.level2Score },
    { subject: "Interview Questions", score: state.level3Score },
  ];

  // ── Skill Picker ──────────────────────────────────────────────────────────
  if (!state.selectedSkill) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                Skills Assessment
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the skill track you want to be assessed on. You'll
                receive a quiz, a practical task, and an interview — all
                tailored to your chosen field.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SKILL_TRACKS.map((track) => (
                <Card
                  key={track.id}
                  className="p-6 hover-elevate cursor-pointer transition-all"
                  onClick={() =>
                    dispatch({ type: "SELECT_SKILL", skill: track.id })
                  }
                  data-testid={`card-skill-${track.id}`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${track.color} text-white flex items-center justify-center mb-4`}
                  >
                    {track.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {track.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {track.description}
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    data-testid={`button-select-${track.id}`}
                  >
                    Start Assessment
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Results View ──────────────────────────────────────────────────────────
  if (state.showResults) {
    const recommendations = getRecommendations();
    const resultsContext =
      (state.level3Status === "passed" || state.level3Status === "failed")
        ? "interview"
        : state.level2Status === "passed"
          ? "practical"
          : "quiz";
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => dispatch({ type: "HIDE_RESULTS" })}
                data-testid="button-back-to-assessment"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Assessment
              </Button>
            </div>

            <div className="text-center mb-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                Assessment Complete!
              </h1>
              {activeTrack && (
                <Badge variant="outline" className="mb-3">
                  {activeTrack.label}
                </Badge>
              )}
              <p className="text-lg text-muted-foreground">
                Here's your comprehensive performance analysis
              </p>
            </div>

            {(() => {
              const completedLevels: { label: string; score: number }[] = [];
              if (state.level1Status === "passed" || state.level1Status === "failed") completedLevels.push({ label: "Quiz", score: state.level1Score });
              if (state.level2Status === "passed" || state.level2Status === "failed") completedLevels.push({ label: "Practical", score: state.level2Score });
              if (state.level3Status === "passed" || state.level3Status === "failed") completedLevels.push({ label: "Interview", score: state.level3Score });
              const avgScore = completedLevels.length > 0 ? Math.round(completedLevels.reduce((sum, l) => sum + l.score, 0) / completedLevels.length) : 0;
              return (
                <Card className="p-6 mb-6 text-center" data-testid="card-overall-score">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Overall Average Score</p>
                  <p className={`text-5xl font-bold mb-2 ${getPerformanceColor(avgScore)}`} data-testid="text-overall-score">
                    {avgScore}%
                  </p>
                  <div className="flex justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                    {completedLevels.map((l) => (
                      <span key={l.label}>{l.label}: <span className="font-medium text-foreground">{l.score}%</span></span>
                    ))}
                  </div>
                  {completedLevels.length < 3 && (
                    <p className="text-xs text-muted-foreground mt-2">Average across {completedLevels.length} completed level{completedLevels.length > 1 ? "s" : ""}</p>
                  )}
                </Card>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2 gap-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">
                    Level 1: Quiz
                  </h3>
                  <Badge
                    className={
                      state.level1Score >= 60
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {state.level1Score >= 60 ? "Passed" : "Failed"}
                  </Badge>
                </div>
                <p
                  className={`text-3xl font-bold ${getPerformanceColor(state.level1Score)}`}
                >
                  {state.level1Score}%
                </p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2 gap-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">
                    Level 2: Practical
                  </h3>
                  <Badge
                    className={
                      state.level2Score >= 60
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {state.level2Score >= 60 ? "Passed" : "Failed"}
                  </Badge>
                </div>
                <p
                  className={`text-3xl font-bold ${getPerformanceColor(state.level2Score)}`}
                >
                  {state.level2Score}%
                </p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2 gap-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">
                    Level 3: Interview Questions
                  </h3>
                  <Badge className={state.level3Score >= 60 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {state.level3Score >= 60 ? "Passed" : "Failed"}
                  </Badge>
                </div>
                <p
                  className={`text-3xl font-bold ${getPerformanceColor(state.level3Score)}`}
                >
                  {state.level3Score}%
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Score Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#8b5cf6" name="Your Score" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Performance Radar
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {state.weakTopics.length > 0 && (
              <Card className="p-6 mb-8 bg-yellow-50 border-yellow-200">
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Areas for Improvement
                </h3>
                <div className="flex flex-wrap gap-2">
                  {state.weakTopics.map((topic, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-white border-yellow-300 text-yellow-700"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {resultsContext === "quiz" && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-1 text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recommended Courses
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Based on your quiz performance — click any course to explore
                  it on the platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((course, idx) => (
                    <Card
                      key={idx}
                      className="p-4 hover-elevate transition-all"
                      data-testid={`card-course-rec-${idx}`}
                    >
                      <h4 className="font-semibold text-foreground mb-2">
                        {course.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {course.platform}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            course.difficulty === "Beginner"
                              ? "bg-green-100 text-green-700"
                              : course.difficulty === "Intermediate"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {course.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.duration}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {course.reason}
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            course.url,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        data-testid={`button-enroll-${idx}`}
                      >
                        Explore on {course.platform}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {resultsContext === "practical" && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-1 text-foreground flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Coding Practice Platforms
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  You've completed the practical level — keep sharpening your
                  coding skills on these platforms.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CODING_PRACTICE_LINKS.map((platform, idx) => (
                    <Card
                      key={idx}
                      className="p-4 hover-elevate transition-all"
                      data-testid={`card-coding-${idx}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">
                          {platform.name}
                        </h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {platform.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {platform.description}
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            platform.url,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        data-testid={`button-coding-platform-${idx}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open {platform.name}
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {resultsContext === "interview" && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-1 text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Mock Interview Platforms
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  You've completed all 3 levels — practice with real mock
                  interviews to get ready for the real thing.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_INTERVIEW_LINKS.map((platform, idx) => (
                    <Card
                      key={idx}
                      className="p-4 hover-elevate transition-all"
                      data-testid={`card-mock-interview-${idx}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">
                          {platform.name}
                        </h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {platform.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {platform.description}
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            platform.url,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        data-testid={`button-mock-platform-${idx}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open {platform.name}
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Level 1: Quiz ─────────────────────────────────────────────────────────
  if (state.currentLevel === 1 && activeTrack) {
    const questions = activeTrack.quizQuestions;
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "BACK_TO_DASHBOARD" })}
              className="flex items-center gap-2 mb-6"
              data-testid="button-back-quiz"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {activeTrack.label}
                  </p>
                  <h2 className="text-2xl font-bold text-foreground">
                    Level 1: Easy Quiz
                  </h2>
                </div>
                <Badge variant="outline">
                  Question {currentQuizQuestion + 1} of {questions.length}
                </Badge>
              </div>
              <Progress
                value={((currentQuizQuestion + 1) / questions.length) * 100}
                className="h-2"
              />
            </div>

            <Card className="p-8 mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                {questions[currentQuizQuestion].category}
              </p>
              <h3 className="text-xl font-semibold mb-6 text-foreground">
                {questions[currentQuizQuestion].question}
              </h3>
              <div className="space-y-3">
                {questions[currentQuizQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const newAnswers = [...selectedAnswers];
                      newAnswers[currentQuizQuestion] = idx;
                      setSelectedAnswers(newAnswers);
                    }}
                    data-testid={`button-option-${idx}`}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswers[currentQuizQuestion] === idx
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedAnswers[currentQuizQuestion] === idx
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {selectedAnswers[currentQuizQuestion] === idx && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-foreground">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuizQuestion(Math.max(0, currentQuizQuestion - 1))
                }
                disabled={currentQuizQuestion === 0}
                data-testid="button-quiz-prev"
              >
                Previous
              </Button>
              {currentQuizQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleQuizSubmit}
                  disabled={selectedAnswers.some((a) => a === -1)}
                  data-testid="button-quiz-submit"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentQuizQuestion(currentQuizQuestion + 1)
                  }
                  disabled={selectedAnswers[currentQuizQuestion] === -1}
                  data-testid="button-quiz-next"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Level 2: Practical ────────────────────────────────────────────────────
  if (state.currentLevel === 2 && activeTrack) {
    const task = activeTrack.practicalTask;
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "BACK_TO_DASHBOARD" })}
              className="flex items-center gap-2 mb-6"
              data-testid="button-back-practical"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>

            <p className="text-sm text-muted-foreground mb-1">
              {activeTrack.label}
            </p>
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Level 2: Practical Implementation
            </h2>

            <Card className="p-8 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Task Description
              </h3>
              <div className="bg-accent/20 p-4 rounded-lg mb-6">
                <p className="text-foreground mb-3">{task.description}</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {task.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-foreground">
                  Accepted File Formats:
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {task.formats.map((fmt) => (
                    <Badge key={fmt} variant="outline">
                      {fmt}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept={task.formats.join(",")}
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
                {uploadedFile && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{uploadedFile.name}</span>
                    <span className="text-muted-foreground">
                      ({(uploadedFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>

              {isEvaluating ? (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-lg text-foreground font-semibold">
                    AI is evaluating your submission...
                  </p>
                  <p className="text-muted-foreground mt-2">
                    This may take a few moments
                  </p>
                </div>
              ) : level2Breakdown ? (
                <div
                  className={`p-6 rounded-lg ${fileError ? "bg-red-50 border border-red-200" : "bg-accent/20"}`}
                >
                  <h4 className="font-semibold text-foreground mb-4">
                    Evaluation Results
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground">
                        Setup / Dataset Handling:
                      </span>
                      <span className="font-semibold">
                        {level2Breakdown.dataset}/15 points
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground">
                        Methodology / Implementation:
                      </span>
                      <span className="font-semibold">
                        {level2Breakdown.methodology}/20 points
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground">
                        Results / Quality:
                      </span>
                      <span className="font-semibold">
                        {level2Breakdown.results}/15 points
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="text-lg font-semibold text-foreground">
                        Total Score:
                      </span>
                      <span
                        className={`text-2xl font-bold ${fileError ? "text-red-600" : "text-primary"}`}
                      >
                        {level2Breakdown.total}/50 points
                      </span>
                    </div>
                  </div>

                  {fileError ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start gap-2 p-3 bg-red-100 rounded-md">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-700">{fileError}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setLevel2Breakdown(null);
                          setUploadedFile(null);
                          setFileError(null);
                        }}
                        data-testid="button-retry-practical"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Again with Different Submission
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full mt-6"
                      onClick={() => dispatch({ type: "BACK_TO_DASHBOARD" })}
                      data-testid="button-continue-after-practical"
                    >
                      Continue to Next Level
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleLevel2Submit}
                  disabled={!uploadedFile}
                  className="w-full"
                  data-testid="button-submit-practical"
                >
                  Submit for Evaluation
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Level 3: Interview ────────────────────────────────────────────────────
  if (state.currentLevel === 3 && activeTrack) {
    const questions = activeTrack.interviewQuestions;
    const allAnswered = interviewAnswers.every((a) => a.trim().length > 0);

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopVoiceRecording();
                dispatch({ type: "BACK_TO_DASHBOARD" });
              }}
              className="flex items-center gap-2 mb-6"
              data-testid="button-back-interview"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>

            <p className="text-sm text-muted-foreground mb-1">
              {activeTrack.label}
            </p>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Level 3: Interview Questions
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Answer each question by typing or using the microphone. Your
              response is evaluated on whether it covers the right concepts —
              not on word count.
            </p>

            <div className="space-y-6 mb-6">
              {questions.map((question, idx) => {
                const isRecordingThis = recordingIdx === idx;
                const fb = voiceFeedback[idx] ?? "";
                const answer = interviewAnswers[idx] ?? "";
                return (
                  <Card key={idx} className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      Question {idx + 1}: {question}
                    </h3>

                    <Textarea
                      placeholder="Type your answer here, or use the microphone below..."
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...interviewAnswers];
                        newAnswers[idx] = e.target.value;
                        setInterviewAnswers(newAnswers);
                      }}
                      className="min-h-[120px] mb-3"
                      data-testid={`textarea-interview-${idx}`}
                    />

                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          isRecordingThis
                            ? stopVoiceRecording()
                            : startVoiceRecording(idx)
                        }
                        data-testid={`button-voice-${idx}`}
                        className={
                          isRecordingThis ? "border-red-400 text-red-600" : ""
                        }
                      >
                        {isRecordingThis ? (
                          <>
                            <MicOff className="w-4 h-4 mr-2 animate-pulse" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Record Answer
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {answer.split(" ").filter((w) => w).length} words
                      </p>
                    </div>

                    {fb && (
                      <p
                        className={`mt-2 text-sm ${
                          fb.toLowerCase().includes("not recorded") ||
                          fb.toLowerCase().includes("not supported")
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                        data-testid={`voice-feedback-${idx}`}
                      >
                        {fb}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="space-y-3">
              {!allAnswered && (
                <p className="text-sm text-center text-muted-foreground">
                  Please answer all {questions.length} questions to submit.
                </p>
              )}
              <Button
                onClick={handleLevel3Submit}
                disabled={!allAnswered}
                className="w-full"
                data-testid="button-complete-assessment"
              >
                Submit Answers
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Assessment Dashboard ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 flex items-center gap-4 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "CHANGE_SKILL" })}
              data-testid="button-change-skill"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Skill
            </Button>
            {activeTrack && (
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md bg-gradient-to-br ${activeTrack.color} text-white`}
                >
                  {activeTrack.icon}
                </div>
                <span className="font-semibold text-foreground">
                  {activeTrack.label}
                </span>
              </div>
            )}
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              Skills Assessment
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete all 3 levels to evaluate your skills and get personalized
              recommendations at each stage.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative mb-12">
              <div className="flex justify-between items-center mb-4">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-all ${getLevelColor(
                        level === 1
                          ? state.level1Status
                          : level === 2
                            ? state.level2Status
                            : state.level3Status,
                      )}`}
                    >
                      {level === 1 && state.level1Status === "passed" && (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                      {level === 1 && state.level1Status === "failed" && (
                        <XCircle className="w-6 h-6" />
                      )}
                      {level === 2 && state.level2Status === "passed" && (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                      {level === 2 && state.level2Status === "failed" && (
                        <XCircle className="w-6 h-6" />
                      )}
                      {level === 3 && state.level3Status === "passed" && (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                      {(level === 1 &&
                        !["passed", "failed"].includes(state.level1Status)) ||
                      (level === 2 &&
                        !["passed", "failed"].includes(state.level2Status)) ||
                      (level === 3 &&
                        !["passed", "failed"].includes(state.level3Status))
                        ? level
                        : null}
                    </div>
                    <span className="text-sm font-medium mt-2 text-foreground">
                      Level {level}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-border -z-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 hover-elevate transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-blue-500" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Level 1
                  </h3>
                </div>
                <h4 className="font-semibold mb-2 text-foreground">
                  Easy Quiz
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeTrack?.quizQuestions.length ?? 8} multiple-choice
                  questions on {activeTrack?.label ?? "your chosen skill"}. Pass
                  with 60% or higher.
                </p>
                {state.level1Status === "failed" && (
                  <p className="text-sm text-red-600 mb-4">
                    Score: {state.level1Score}% — You can retry!
                  </p>
                )}
                {state.level1Status === "passed" && (
                  <p className="text-sm text-green-600 mb-4">
                    Score: {state.level1Score}% — Passed!
                  </p>
                )}
                <Button
                  onClick={startLevel1}
                  className="w-full"
                  disabled={state.level1Status === "in-progress"}
                  variant={
                    state.level1Status === "passed" ? "outline" : "default"
                  }
                  data-testid="button-start-level1"
                >
                  {state.level1Status === "passed"
                    ? "Retake"
                    : state.level1Status === "failed"
                      ? "Retry"
                      : "Start Quiz"}
                </Button>
              </Card>

              <Card className="p-6 hover-elevate transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Level 2
                  </h3>
                </div>
                <h4 className="font-semibold mb-2 text-foreground">
                  Practical Task
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Submit a hands-on project file. AI evaluates your work with
                  detailed scoring.
                </p>
                {state.level2Status === "failed" && (
                  <p className="text-sm text-red-600 mb-4">
                    Score: {state.level2Score}% — You can retry!
                  </p>
                )}
                {state.level2Status === "passed" && (
                  <p className="text-sm text-green-600 mb-4">
                    Score: {state.level2Score}% — Passed!
                  </p>
                )}
                <Button
                  onClick={startLevel2}
                  className="w-full"
                  disabled={
                    state.level1Status !== "passed" ||
                    state.level2Status === "in-progress"
                  }
                  variant={
                    state.level2Status === "passed" ? "outline" : "default"
                  }
                  data-testid="button-start-level2"
                >
                  {state.level1Status !== "passed"
                    ? "Locked"
                    : state.level2Status === "passed"
                      ? "Retake"
                      : state.level2Status === "failed"
                        ? "Retry"
                        : "Start Task"}
                </Button>
              </Card>

              <Card className="p-6 hover-elevate transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Level 3
                  </h3>
                </div>
                <h4 className="font-semibold mb-2 text-foreground">
                  Interview Questions
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  5 interview questions tailored to{" "}
                  {activeTrack?.label ?? "your skill"}. Answer by typing or
                  voice — evaluated on concept coverage.
                </p>
                {(state.level3Status === "passed" || state.level3Status === "failed") && (
                  <p className={`text-sm mb-4 ${state.level3Score >= 60 ? "text-green-600" : "text-red-600"}`}>
                    Score: {state.level3Score}% — {state.level3Score >= 60 ? "Passed!" : "Failed"}
                  </p>
                )}
                <Button
                  onClick={startLevel3}
                  className="w-full"
                  disabled={
                    state.level2Status !== "passed" ||
                    state.level3Status === "in-progress"
                  }
                  data-testid="button-start-level3"
                >
                  {state.level2Status !== "passed"
                    ? "Locked"
                    : state.level3Status === "passed"
                      ? "Retake"
                      : state.level3Status === "failed"
                        ? "Retry"
                        : "Start"}
                </Button>
              </Card>
            </div>

            {(state.level1Status === "passed" ||
              state.level2Status === "passed" ||
              state.level3Status === "passed") &&
              !state.showResults && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={() => dispatch({ type: "SHOW_RESULTS" })}
                    variant="outline"
                    size="lg"
                    data-testid="button-view-results"
                  >
                    View Current Results
                  </Button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
