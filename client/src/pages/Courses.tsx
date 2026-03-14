import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, GraduationCap, BookOpen, Award, Laptop, Code, Brain } from "lucide-react";

interface Platform {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  topics: { name: string; category: string }[];
}

const categoryColors: Record<string, string> = {
  tech: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300",
  business: "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300",
  data: "bg-green-100 text-green-700 hover:bg-green-200 border-green-300",
  design: "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-300",
  cloud: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-300",
  soft: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300",
};

const platforms: Platform[] = [
  {
    name: "Coursera",
    url: "https://www.coursera.org/search?query=",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
    topics: [
      { name: "Data Science", category: "data" },
      { name: "Machine Learning", category: "data" },
      { name: "Web Development", category: "tech" },
      { name: "Artificial Intelligence", category: "data" },
      { name: "Cloud Computing", category: "cloud" },
      { name: "Cybersecurity", category: "tech" },
      { name: "Python Programming", category: "tech" },
      { name: "Digital Marketing", category: "business" },
      { name: "Project Management", category: "business" },
      { name: "Business Analytics", category: "business" },
      { name: "UX Design", category: "design" },
      { name: "Mobile Development", category: "tech" },
      { name: "Deep Learning", category: "data" },
      { name: "DevOps", category: "cloud" },
      { name: "Blockchain", category: "tech" },
    ],
  },
  {
    name: "Udemy",
    url: "https://www.udemy.com/courses/search/?q=",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600",
    topics: [
      { name: "React Development", category: "tech" },
      { name: "Node.js", category: "tech" },
      { name: "AWS Certification", category: "cloud" },
      { name: "Docker & Kubernetes", category: "cloud" },
      { name: "Full Stack Development", category: "tech" },
      { name: "Ethical Hacking", category: "tech" },
      { name: "Photography", category: "design" },
      { name: "Excel Mastery", category: "business" },
      { name: "SQL Databases", category: "data" },
      { name: "Graphic Design", category: "design" },
      { name: "JavaScript", category: "tech" },
      { name: "Angular", category: "tech" },
      { name: "Game Development", category: "tech" },
      { name: "Leadership Skills", category: "soft" },
      { name: "Public Speaking", category: "soft" },
    ],
  },
  {
    name: "Simplilearn",
    url: "https://www.simplilearn.com/search?keyword=",
    icon: <Award className="w-6 h-6" />,
    color: "from-orange-500 to-orange-600",
    topics: [
      { name: "PMP Certification", category: "business" },
      { name: "Data Analytics", category: "data" },
      { name: "Cloud Architecture", category: "cloud" },
      { name: "Agile & Scrum", category: "business" },
      { name: "Six Sigma", category: "business" },
      { name: "Salesforce", category: "business" },
      { name: "Big Data", category: "data" },
      { name: "Azure DevOps", category: "cloud" },
      { name: "ITIL Certification", category: "business" },
      { name: "Quality Assurance", category: "tech" },
      { name: "Tableau", category: "data" },
      { name: "Power BI", category: "data" },
      { name: "Java Programming", category: "tech" },
      { name: "ServiceNow", category: "business" },
      { name: "Network Security", category: "tech" },
    ],
  },
  {
    name: "Great Learning",
    url: "https://www.mygreatlearning.com/search?query=",
    icon: <Brain className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    topics: [
      { name: "AI Engineering", category: "data" },
      { name: "Data Engineering", category: "data" },
      { name: "Software Development", category: "tech" },
      { name: "Business Intelligence", category: "business" },
      { name: "Machine Learning Operations", category: "data" },
      { name: "Computer Vision", category: "data" },
      { name: "NLP", category: "data" },
      { name: "Cloud Solutions", category: "cloud" },
      { name: "Product Management", category: "business" },
      { name: "Finance Analytics", category: "business" },
      { name: "Marketing Analytics", category: "business" },
      { name: "HR Analytics", category: "business" },
      { name: "Automation Testing", category: "tech" },
      { name: "Backend Development", category: "tech" },
      { name: "Frontend Development", category: "tech" },
    ],
  },
  {
    name: "upGrad",
    url: "https://www.upgrad.com/search/?q=",
    icon: <Laptop className="w-6 h-6" />,
    color: "from-red-500 to-red-600",
    topics: [
      { name: "MBA Programs", category: "business" },
      { name: "Data Science Bootcamp", category: "data" },
      { name: "Digital Transformation", category: "business" },
      { name: "Full Stack Engineering", category: "tech" },
      { name: "Product Design", category: "design" },
      { name: "Fintech", category: "business" },
      { name: "Healthcare Management", category: "business" },
      { name: "Supply Chain Management", category: "business" },
      { name: "Entrepreneurship", category: "business" },
      { name: "Investment Banking", category: "business" },
      { name: "AI & ML", category: "data" },
      { name: "Cyber Security", category: "tech" },
      { name: "Blockchain Development", category: "tech" },
      { name: "UI/UX Design", category: "design" },
      { name: "Content Writing", category: "soft" },
    ],
  },
  {
    name: "edX",
    url: "https://www.edx.org/search?q=",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "from-indigo-500 to-indigo-600",
    topics: [
      { name: "Computer Science", category: "tech" },
      { name: "Microservices", category: "tech" },
      { name: "Quantum Computing", category: "tech" },
      { name: "Robotics", category: "tech" },
      { name: "IoT", category: "tech" },
      { name: "Economics", category: "business" },
      { name: "Statistics", category: "data" },
      { name: "Python for Data Science", category: "data" },
      { name: "R Programming", category: "data" },
      { name: "Mobile App Development", category: "tech" },
      { name: "Software Engineering", category: "tech" },
      { name: "Information Security", category: "tech" },
      { name: "Business Strategy", category: "business" },
      { name: "Communication Skills", category: "soft" },
      { name: "Critical Thinking", category: "soft" },
    ],
  },
  {
    name: "Pluralsight",
    url: "https://www.pluralsight.com/search?q=",
    icon: <Code className="w-6 h-6" />,
    color: "from-pink-500 to-pink-600",
    topics: [
      { name: ".NET Development", category: "tech" },
      { name: "C# Programming", category: "tech" },
      { name: "Infrastructure as Code", category: "cloud" },
      { name: "Terraform", category: "cloud" },
      { name: "Jenkins CI/CD", category: "cloud" },
      { name: "Microservices Architecture", category: "tech" },
      { name: "API Development", category: "tech" },
      { name: "Security Engineering", category: "tech" },
      { name: "Git & GitHub", category: "tech" },
      { name: "Vue.js", category: "tech" },
      { name: "TypeScript", category: "tech" },
      { name: "Azure Cloud", category: "cloud" },
      { name: "Google Cloud Platform", category: "cloud" },
      { name: "Monitoring & Logging", category: "cloud" },
      { name: "System Design", category: "tech" },
    ],
  },
  {
    name: "LinkedIn Learning",
    url: "https://www.linkedin.com/learning/search?keywords=",
    icon: <Award className="w-6 h-6" />,
    color: "from-blue-700 to-blue-800",
    topics: [
      { name: "Leadership Development", category: "soft" },
      { name: "Career Planning", category: "soft" },
      { name: "Time Management", category: "soft" },
      { name: "Excel for Business", category: "business" },
      { name: "Presentation Skills", category: "soft" },
      { name: "Negotiation Skills", category: "soft" },
      { name: "Remote Work", category: "soft" },
      { name: "Team Management", category: "soft" },
      { name: "Strategic Thinking", category: "business" },
      { name: "Customer Service", category: "business" },
      { name: "Sales Skills", category: "business" },
      { name: "Emotional Intelligence", category: "soft" },
      { name: "Productivity", category: "soft" },
      { name: "Personal Branding", category: "soft" },
      { name: "Networking", category: "soft" },
    ],
  },
];

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const { logActivity } = useUser();

  const filteredPlatforms = platforms.map((platform) => ({
    ...platform,
    topics: platform.topics.filter((topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((platform) => platform.topics.length > 0);

  const handleTopicClick = (platform: Platform, topicName: string) => {
    const searchTerm = encodeURIComponent(topicName.toLowerCase());
    window.open(`${platform.url}${searchTerm}`, "_blank", "noopener,noreferrer");
    logActivity({
      type: "course_click",
      label: `Explored "${topicName}"`,
      detail: `on ${platform.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              Explore Learning Platforms
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover courses from top learning platforms. Click on any topic to explore courses tailored to your career goals.
            </p>
          </div>

          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search topics across all platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                data-testid="input-search-topics"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {filteredPlatforms.reduce((acc, p) => acc + p.topics.length, 0)} topics
                across {filteredPlatforms.length} platforms
              </p>
            )}
          </div>

          {filteredPlatforms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No topics found matching "{searchQuery}". Try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlatforms.map((platform) => (
                <Card
                  key={platform.name}
                  className="p-6 hover-elevate transition-all duration-300 hover:shadow-lg hover:border-primary/30"
                  data-testid={`card-platform-${platform.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${platform.color} text-white`}
                    >
                      {platform.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {platform.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {platform.topics.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`cursor-pointer transition-all duration-200 ${
                          categoryColors[topic.category]
                        }`}
                        onClick={() => handleTopicClick(platform, topic.name)}
                        data-testid={`badge-topic-${topic.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {topic.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {platform.topics.length} topics available
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12 p-6 bg-accent/20 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3">Topic Categories</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className={categoryColors.tech}>
                Technology
              </Badge>
              <Badge variant="outline" className={categoryColors.business}>
                Business
              </Badge>
              <Badge variant="outline" className={categoryColors.data}>
                Data & AI
              </Badge>
              <Badge variant="outline" className={categoryColors.design}>
                Design
              </Badge>
              <Badge variant="outline" className={categoryColors.cloud}>
                Cloud
              </Badge>
              <Badge variant="outline" className={categoryColors.soft}>
                Soft Skills
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
