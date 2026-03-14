import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).href;

export interface ResumeSections {
  name: string;
  skills: string[];
  education: string;
  experience: string;
  projects: string;
  certifications: string;
  languages: string;
  extracurricular: string;
  other: string;
}

// ─── Section header patterns ──────────────────────────────────────────────────
// NOTE: No $ anchor — allows content on the same line as the header.
// Each pattern must match at the START of the trimmed line (^ anchor kept).
const SECTION_PATTERNS: Array<{
  key: keyof Omit<ResumeSections, "name" | "skills" | "other">;
  regex: RegExp;
}> = [
  {
    key: "skills",
    regex:
      /^(skills?|technical[\s-]skills?|core[\s-]competencies|technologies|tech[\s-]stack|expertise|proficiencies|key[\s-]skills?|programming[\s-]languages?|languages?\s*&\s*tools?|tools?\s*&\s*technologies?)\s*[:|-]?\s*/i,
  },
  {
    key: "education",
    regex:
      /^(education|academic[\s-]background|qualifications?|degrees?|schooling|academic\s+qualifications?)\s*[:|-]?\s*/i,
  },
  {
    key: "experience",
    regex:
      /^(experience|work[\s-]experience|professional[\s-]experience|employment|work[\s-]history|career\s+history|internships?|positions?\s+held|job\s+history)\s*[:|-]?\s*/i,
  },
  {
    key: "projects",
    regex:
      /^(projects?|personal[\s-]projects?|key[\s-]projects?|academic[\s-]projects?|portfolio|side[\s-]projects?|notable[\s-]projects?)\s*[:|-]?\s*/i,
  },
  {
    key: "certifications",
    regex:
      /^(certifications?|certificates?|courses?\s*(?:completed|taken)?|credentials?|achievements?|licenses?|awards?|honors?|accomplishments?)\s*[:|-]?\s*/i,
  },
  {
    key: "languages",
    regex:
      /^(languages?|language[\s-]skills?|spoken[\s-]languages?|linguistic|multilingual)\s*[:|-]?\s*/i,
  },
  {
    key: "extracurricular",
    regex:
      /^(extracurricular|co[\s-]curricular|activities|volunteer(?:ing)?|leadership|clubs?|hobbies|interests|community|positions?\s*of\s*responsibility|social\s+activities?)\s*[:|-]?\s*/i,
  },
];

// ─── PDF text extraction ──────────────────────────────────────────────────────
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          // Group text items by their approximate Y position to reconstruct lines.
          // pdfjs gives each word/span separately — we reassemble by proximity.
          type Item = { str: string; transform: number[] };
          const items = textContent.items as Item[];

          if (items.length === 0) continue;

          // Sort by Y descending (PDF coordinates go bottom-to-top), then X ascending
          const sorted = [...items].sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5];
            if (Math.abs(yDiff) > 3) return yDiff;
            return a.transform[4] - b.transform[4];
          });

          let currentY: number | null = null;
          let currentLine = "";
          const pageLines: string[] = [];

          for (const item of sorted) {
            const y = Math.round(item.transform[5]);
            if (currentY === null || Math.abs(y - currentY) > 3) {
              if (currentLine.trim()) pageLines.push(currentLine.trim());
              currentLine = item.str;
              currentY = y;
            } else {
              currentLine += (item.str.startsWith(" ") ? "" : " ") + item.str;
            }
          }
          if (currentLine.trim()) pageLines.push(currentLine.trim());

          fullText += pageLines.join("\n") + "\n";
        }
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── Skills list extraction ───────────────────────────────────────────────────
function extractSkillsList(text: string): string[] {
  const parts = text
    .split(/[,|•·▪▸\n\t\/]+/)
    .map((s) => s.replace(/^[-–*]\s*/, "").trim())
    .filter(
      (s) =>
        s.length > 1 &&
        s.length < 60 &&
        !/^\d+$/.test(s) &&
        !/^(and|or|the|with|for|of|in|to|a|an)$/i.test(s),
    );
  return [...new Set(parts)];
}

// ─── Name guesser ─────────────────────────────────────────────────────────────
function guessName(lines: string[]): string {
  for (const line of lines.slice(0, 8)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Must look like a proper name: 2–4 capitalized words, no numbers, ≤ 50 chars
    if (
      trimmed.length <= 50 &&
      /^[A-Z][a-zA-Z'-]+(\s[A-Z][a-zA-Z'-]+){1,3}$/.test(trimmed)
    ) {
      return trimmed;
    }
  }
  return "";
}

// ─── Section detection ────────────────────────────────────────────────────────
/**
 * Returns the matched section key and the leftover content on the same line
 * (if the header and content share a line), or null if no section header found.
 */
function detectSectionHeader(
  line: string,
): { key: keyof Omit<ResumeSections, "name" | "skills" | "other"> | "skills"; rest: string } | null {
  for (const { key, regex } of SECTION_PATTERNS) {
    const match = line.match(regex);
    if (match) {
      // The rest of the line after the header keyword (may be content on same line)
      const rest = line.slice(match[0].length).trim();
      return { key, rest };
    }
  }
  return null;
}

// ─── Main parser ──────────────────────────────────────────────────────────────
export function parseResumeSections(rawText: string): ResumeSections {
  const lines = rawText.split(/\r?\n/);

  const result: ResumeSections = {
    name: "",
    skills: [],
    education: "",
    experience: "",
    projects: "",
    certifications: "",
    languages: "",
    extracurricular: "",
    other: "",
  };

  result.name = guessName(lines);

  type SectionKey =
    | "skills"
    | "education"
    | "experience"
    | "projects"
    | "certifications"
    | "languages"
    | "extracurricular"
    | "other";

  let currentSection: SectionKey = "other";
  const sectionBuckets: Record<SectionKey, string[]> = {
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: [],
    extracurricular: [],
    other: [],
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Skip the name line so it doesn't pollute sections
    if (line === result.name) continue;

    const detection = detectSectionHeader(line);
    if (detection) {
      currentSection = detection.key;
      // If there's content after the header on the same line, add it
      if (detection.rest) {
        sectionBuckets[currentSection].push(detection.rest);
      }
    } else {
      sectionBuckets[currentSection].push(rawLine);
    }
  }

  result.skills = extractSkillsList(sectionBuckets.skills.join("\n"));
  result.education = sectionBuckets.education.join("\n").trim();
  result.experience = sectionBuckets.experience.join("\n").trim();
  result.projects = sectionBuckets.projects.join("\n").trim();
  result.certifications = sectionBuckets.certifications.join("\n").trim();
  result.languages = sectionBuckets.languages.join("\n").trim();
  result.extracurricular = sectionBuckets.extracurricular.join("\n").trim();
  result.other = sectionBuckets.other.join("\n").trim();

  return result;
}
