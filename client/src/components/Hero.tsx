import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/AI_career_guidance_hero_3ec0865f.png";

export default function Hero() {
  const handleGetStarted = () => {
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background z-10" />
        <img 
          src={heroImage} 
          alt="AI Career Guidance" 
          className="w-full h-full object-cover opacity-40"
        />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-6 py-20 md:py-24 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-1 bg-clip-text text-transparent">
          Your Career, Intelligently Guided
        </h1>
        
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed">
          Unlock your professional potential with AI-powered insights. Get personalized career guidance, 
          intelligent job matching, and expert assessments tailored to your unique goals.
        </p>
        
        <Button 
          size="lg" 
          onClick={handleGetStarted}
          className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90 transition-all duration-200"
          data-testid="button-get-started"
        >
          Get Started
        </Button>
      </div>
    </section>
  );
}
