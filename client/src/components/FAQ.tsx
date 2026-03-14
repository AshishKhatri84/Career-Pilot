import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the resume upload and job matching work?",
    answer: "You upload your resume as a PDF or TXT file. Career-Pilot extracts the text, parses your skills and experience, and sends it to an AI service that compares your profile against a set of job roles. You receive a ranked list of the top matching roles, each with a compatibility percentage, the skills you already have, and the gaps you'd need to fill."
  },
  {
    question: "Is my resume data stored on your servers?",
    answer: "No. Your resume data is processed in-session only and stored in your browser's sessionStorage — it is never saved to a database or server. When you close the tab or sign out, all your data is automatically cleared. Career-Pilot does not require you to create an account."
  },
  {
    question: "What file formats are supported for resume upload?",
    answer: "We currently support PDF and TXT formats. PDF is recommended for best results, as the parser reads the full document text. You can also skip uploading entirely and type or paste your skills and background directly into the text input."
  },
  {
    question: "How does the live job search work?",
    answer: "The Career page searches for real, current job listings using a live web search integration (Tavily API). You can search by job title or keyword, and filter by location, job type (full-time, part-time, contract), and experience level. Your top AI-matched role is automatically used as the initial search when you navigate to the Career page after uploading your resume."
  },
  {
    question: "Can I use Career-Pilot if I'm switching careers?",
    answer: "Yes. The job matching will highlight roles where your existing skills transfer well, and will clearly show the gaps you'd need to address for new fields. The assessment and course explorer can help you identify and fill those gaps with relevant learning resources."
  },
  {
    question: "How do the skill assessments work?",
    answer: "You choose a skill track relevant to your target role. The assessment has three levels: Level 1 is a multiple-choice quiz on core concepts, Level 2 involves uploading a practical work sample (such as a code file or project), and Level 3 is a set of interview-style written or voice-recorded questions. Each level is scored, and you receive course recommendations based on your results."
  },
  {
    question: "What is the Course Explorer?",
    answer: "The Course Explorer is a curated library of learning topics organized by popular online platforms. You can filter by keyword, browse by category, and click any topic to be taken directly to that course on the relevant platform (such as Coursera, Udemy, or others). Career-Pilot does not host courses itself — it links you to external platforms."
  },
  {
    question: "Is there a cost to use Career-Pilot?",
    answer: "Career-Pilot is free to use. There are no subscription plans or paywalled features — all functionality including resume analysis, job matching, live job search, assessments, and the course explorer is fully accessible after uploading your resume."
  }
];

export default function FAQ() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about Career-Pilot</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border rounded-md px-6 hover-elevate transition-all duration-200"
              data-testid={`accordion-faq-${index}`}
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
