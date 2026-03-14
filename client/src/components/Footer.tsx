import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-12 bg-gradient-to-b from-background to-accent/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-chart-1 to-chart-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">Career-Pilot</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              A free career guidance tool that helps you understand your job fit, 
              search live listings, assess your skills, and find the right courses — 
              all without creating an account.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:support@career-pilot.com" className="hover:text-foreground transition-colors">support@career-pilot.com</a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left" data-testid="text-copyright">
              © {currentYear} Career-Pilot. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground text-center md:text-right max-w-md">
              Your resume data is processed in-session only and is never stored on our servers. 
              All data clears automatically when you close the tab or sign out.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
