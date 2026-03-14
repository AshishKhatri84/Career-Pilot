# Career-Pilot — AI-Powered Career Guidance Platform

## Overview

Career-Pilot is a full-stack AI-powered career guidance platform. Users upload their resume on the landing page to unlock the app, receive AI-powered job matches via an n8n webhook, search live job listings (powered by Tavily API), explore learning courses, and take multi-level skill assessments. All user data is stored in sessionStorage and cleared on tab close or sign-out.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (SPA architecture)
- TanStack Query (React Query) for server state management, caching, and data fetching

**UI Component System**
- shadcn/ui component library based on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Component structure follows the "New York" style variant from shadcn
- Custom CSS variables for theming (light mode primary with blue-purple gradients)
- Inter font family for all typography

**Design System**
- Light theme with high contrast ratios for accessibility
- Blue-purple gradient color scheme for professional, creative branding
- Consistent spacing primitives using Tailwind's spacing scale
- Responsive typography scale with mobile-first approach
- Fixed navigation header with scrolling vertical layout sections

**State Management Strategy**
- Server state managed through TanStack Query
- User profile & activity stored in `UserContext` (backed by sessionStorage keys `careerPilot_profile` and `careerPilot_activity`)
- Protected routes redirect to `/` when no profile is present
- Sign-out clears sessionStorage and resets context state
- Local UI state handled with React hooks
- Form state management using react-hook-form with Zod validation via @hookform/resolvers

**Auth / Session Flow**
- Landing page (`/`) is the authentication gate — resume upload triggers n8n webhook, parses PDF/TXT with pdfjs-dist, stores profile in UserContext
- Routes `/career`, `/courses`, `/assessment`, `/profile` are protected — redirect to `/` if no profile
- Navigation shows Career/Courses/Assessment links + profile avatar dropdown only when logged in
- Activity log tracks: career searches, course topic clicks, assessment level results

**Key Files**
- `client/src/context/UserContext.tsx` — UserProvider, useUser hook, sessionStorage persistence
- `client/src/lib/resumeParser.ts` — PDF/TXT extraction (pdfjs-dist) + section parsing
- `client/src/components/ResumeUpload.tsx` — upload gate, pipeline overlay, results modal
- `client/src/components/Navigation.tsx` — conditional nav + profile avatar dropdown
- `client/src/pages/Profile.tsx` — profile page with skills, resume sections, job matches, activity log
- `server/tavilyJobs.ts` — live job search via Tavily API

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Node.js runtime with ESM module support
- TypeScript for type safety across the stack

**API Design**
- RESTful endpoints under `/api` prefix
- Job listings API with filtering support (search, location, jobType, experienceLevel, minSalary)
- JSON request/response format
- Request logging middleware for API endpoints with duration tracking
- CORS and security headers through Express middleware

**Data Storage Strategy**
- PostgreSQL database with Neon serverless driver for production
- Drizzle ORM for type-safe database queries and schema management
- In-memory storage implementation (MemStorage) for development/testing
- Storage abstraction layer (IStorage interface) allowing swappable implementations

**Database Schema**
- Users table: id (UUID), username (unique), password (hashed)
- Jobs table: comprehensive job listing data including title, company, location, job type, experience level, salary range, requirements, responsibilities, benefits, AI match score, and posting date
- Schema defined using Drizzle's PostgreSQL table builders
- Zod schemas generated from Drizzle schemas for runtime validation

**Authentication Approach**
- Session-based authentication using express-session
- PostgreSQL session store via connect-pg-simple
- Credentials included in fetch requests for session persistence
- Password hashing (implementation pending based on schema)

### Development & Build Pipeline

**Development Workflow**
- Vite middleware mode integrated with Express for seamless dev experience
- Hot Module Replacement (HMR) for instant client-side updates
- TypeScript compilation checking without emit (type checking only)
- Separate dev and production builds with environment-specific configurations

**Production Build Process**
- Client: Vite builds optimized static assets to `dist/public`
- Server: esbuild bundles server code to `dist/index.js` with external packages
- Static file serving through Express in production mode
- Environment-based configuration switching (NODE_ENV)

**Code Quality & Tooling**
- TypeScript strict mode enabled for maximum type safety
- Path aliases for clean imports (@/, @shared/, @assets/)
- ESM module resolution with bundler strategy
- Source maps for debugging through @jridgewell/trace-mapping

### External Dependencies

**UI & Styling Libraries**
- Radix UI primitives for accessible, unstyled components (accordion, dialog, dropdown, select, tabs, toast, etc.)
- Tailwind CSS with PostCSS and Autoprefixer for processing
- class-variance-authority (CVA) for variant-based component styling
- clsx and tailwind-merge for conditional class name composition
- Lucide React for consistent icon system
- embla-carousel-react for image/content carousels

**Data & Forms**
- Zod for schema validation and type inference
- react-hook-form for performant form state management
- drizzle-zod for bridging ORM schemas with validation

**Development Tools**
- Replit-specific plugins: runtime error modal, cartographer, dev banner
- tsx for running TypeScript in development
- drizzle-kit for database migrations and schema management

**Database & Infrastructure**
- @neondatabase/serverless for PostgreSQL connections
- connect-pg-simple for session storage in PostgreSQL
- Database URL configured via environment variables

**Utility Libraries**
- date-fns for date manipulation and formatting
- nanoid for generating unique identifiers
- cmdk for command palette/search functionality

## External Dependencies

**Third-Party Services**
- Neon Database: Serverless PostgreSQL hosting (configured via DATABASE_URL environment variable)
- Google Fonts: Inter font family loaded from CDN

**Asset Management**
- Static images stored in `attached_assets/generated_images/` directory
- Favicon served from public directory
- Images referenced via Vite alias (@assets/)

**Future AI Integration Points**
- Resume analysis AI service (currently mock/placeholder)
- Job matching algorithm with AI scoring
- Skills assessment AI engine
- Personalized learning path recommendations