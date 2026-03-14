import { Card } from "@/components/ui/card";
import { FileText, Briefcase, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import resumeImg from "@assets/generated_images/Resume_analysis_AI_visualization_e75fbed9.png";
import jobMatchImg from "@assets/generated_images/Job_matching_AI_network_114c0d00.png";
import assessmentImg from "@assets/generated_images/AI_assessment_dashboard_visualization_5abb9674.png";
import learningImg from "@assets/generated_images/Personalized_learning_path_visualization_91dd9e18.png";

const features = [
  {
    icon: FileText,
    image: resumeImg,
    title: "Resume Upload & AI Job Matching",
    description: "Upload your resume to instantly find out which roles you're best suited for, along with a clear breakdown of your strengths and skill gaps.",
    process: [
      "Upload your resume in PDF or TXT format",
      "Our AI reads your resume and compares it against real job roles",
      "Receive a ranked list of job matches with percentage compatibility scores",
      "See exactly which skills you already have and which ones to develop"
    ],
    benefit: "Know where you stand before you apply — understand which roles match your profile and what it takes to be competitive in each."
  },
  {
    icon: Briefcase,
    image: jobMatchImg,
    title: "Live Job Search",
    description: "Search for real job openings using live web data. Filter by location, job type, and experience level to find listings that fit your needs.",
    process: [
      "Enter any job title or keyword to search live listings",
      "Filter results by location, job type, and experience level",
      "Browse job cards with titles, descriptions, and apply links",
      "Your top AI-matched role auto-populates as the default search"
    ],
    benefit: "Go straight from understanding your best-fit roles to finding actual open positions — no separate job board needed."
  },
  {
    icon: GraduationCap,
    image: assessmentImg,
    title: "Multi-Level Skill Assessments",
    description: "Test your knowledge and skills across popular tech and professional tracks through a structured three-level assessment.",
    process: [
      "Choose a skill track that matches your target role",
      "Level 1: Answer a multiple-choice quiz covering core concepts",
      "Level 2: Submit a practical work sample or project file for evaluation",
      "Level 3: Respond to interview-style questions and receive a score with course recommendations"
    ],
    benefit: "Get a clear, honest picture of your current skill level and receive targeted course recommendations based on your results."
  },
  {
    icon: BookOpen,
    image: learningImg,
    title: "Course Explorer",
    description: "Browse a curated library of learning topics across the most popular online platforms and jump straight into the course that matches your goal.",
    process: [
      "Browse topics organized by platform and category",
      "Filter by keyword to find exactly what you want to learn",
      "Click any topic to open it directly on the hosting platform",
      "Your course activity is logged in your profile for reference"
    ],
    benefit: "Skip the search and go straight to learning — topics are organized to help you fill the specific gaps identified in your assessment."
  },
];

export default function Features() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background to-accent/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            What Career-Pilot Can Do For You
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A focused set of tools to help you understand your current standing, explore real opportunities,
            assess your skills honestly, and find the right courses to grow.
          </p>
        </div>

        <div className="space-y-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;
            
            return (
              <Card
                key={index}
                className="overflow-hidden hover-elevate transition-all duration-300 border-border hover:border-primary/50"
                data-testid={`card-feature-${index}`}
              >
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-0`}>
                  <div className="lg:w-1/2">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                  </div>
                  
                  <div className="lg:w-1/2 p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-2/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                    
                    <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                        How It Works
                      </h4>
                      <ul className="space-y-2">
                        {feature.process.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-chart-1/10 to-chart-2/10 rounded-md border border-primary/20">
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-primary font-semibold">Key Benefit: </span>
                        {feature.benefit}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
