export default function AboutSection() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
          A Smarter Starting Point for Your Career
        </h2>
        <div className="space-y-4 text-lg text-foreground/80 leading-relaxed">
          <p>
            Career-Pilot helps you cut through the noise at the start of a job search. Upload your resume and 
            immediately see which roles you're already well-suited for, where your skill gaps are, and what 
            jobs are actively hiring — all in one place.
          </p>
          <p>
            Whether you're entering the workforce, aiming for a promotion, or considering a change of direction, 
            Career-Pilot gives you real information: AI-matched job roles based on your actual resume, live job 
            listings from the web, honest skill assessments with level-by-level feedback, and a course library 
            that links directly to learning resources on the platforms you already know.
          </p>
          <p>
            No accounts needed. No data stored after you close the tab. Just a clear, private look at where 
            you stand and where you can go.
          </p>
        </div>
      </div>
    </section>
  );
}
