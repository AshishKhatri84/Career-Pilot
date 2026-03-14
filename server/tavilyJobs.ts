import { tavily } from "@tavily/core";

export interface LiveJob {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  requirements: string[];
  certificates: string[];
  postedDate: string;
  applyUrl: string;
  aiMatchScore: number;
}

// ─── Salary ─────────────────────────────────────────────────────────────────
function extractSalary(text: string): { min: number | null; max: number | null } {
  // LPA (Lakhs Per Annum) — single value pattern, convert to full rupees
  const lpaMatch = text.match(/₹?\s*(\d{1,3}(?:,\d{2})*(?:\.\d+)?)\s*(?:-\s*\d[\d,.]*\s*)?(?:LPA|lpa|L\.P\.A)/);
  if (lpaMatch) {
    const lpaMin = parseFloat(lpaMatch[1].replace(/,/g, "")) * 100000;
    // Try to extract a range like "8-12 LPA"
    const lpaRangeMatch = text.match(/(\d{1,3}(?:,\d{2})*(?:\.\d+)?)\s*[-–]\s*(\d{1,3}(?:,\d{2})*(?:\.\d+)?)\s*(?:LPA|lpa|L\.P\.A)/);
    if (lpaRangeMatch) {
      const rangeMin = parseFloat(lpaRangeMatch[1].replace(/,/g, "")) * 100000;
      const rangeMax = parseFloat(lpaRangeMatch[2].replace(/,/g, "")) * 100000;
      return { min: Math.round(rangeMin), max: Math.round(rangeMax) };
    }
    return { min: Math.round(lpaMin), max: Math.round(lpaMin) };
  }

  const patterns = [
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)[kK]?\s*[-–]\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)[kK]?/,
    /(\d{1,3}(?:,\d{3})*)\s*[-–]\s*(\d{1,3}(?:,\d{3})*)\s*(?:per year|\/yr|\/year|per annum|annually|USD)/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      let min = parseFloat(m[1].replace(/,/g, ""));
      let max = m[2] ? parseFloat(m[2].replace(/,/g, "")) : 0;
      if (/[kK]/.test(m[0])) { min *= 1000; max *= 1000; }
      return { min: Math.round(min), max: max > 0 ? Math.round(max) : null };
    }
  }
  return { min: null, max: null };
}

// ─── Company extraction ───────────────────────────────────────────────────────
const KNOWN_PLATFORMS: Record<string, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  naukri: "Naukri",
  glassdoor: "Glassdoor",
  wellfound: "Wellfound",
  monster: "Monster",
  internshala: "Internshala",
  dice: "Dice",
  ziprecruiter: "ZipRecruiter",
  angellist: "AngelList",
  shine: "Shine",
  timesjobs: "TimesJobs",
  freshersworld: "Freshersworld",
  hirect: "Hirect",
  instahyre: "Instahyre",
  cutshort: "Cutshort",
  iimjobs: "IIMJobs",
};

function toTitleCase(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractCompany(rawTitle: string, content: string, url: string): string {
  // 1. LinkedIn company URL: /company/<slug>/
  const linkedinSlug = url.match(/linkedin\.com\/company\/([^/?&#]+)/i);
  if (linkedinSlug) return toTitleCase(linkedinSlug[1]);

  // 2. Job posting title patterns:  "Role at Company"  /  "Company - Role"
  const atMatch = rawTitle.match(/\bat\s+([A-Z][A-Za-z0-9 &.,'-]{2,45}?)(?:\s*[-|•·,]|$)/);
  if (atMatch) {
    const candidate = atMatch[1].trim();
    if (!/linkedin|indeed|naukri|glassdoor|monster|dice|wellfound|internshala/i.test(candidate))
      return candidate;
  }

  // 3. "Company Name - Role | Platform"  (company is BEFORE the dash)
  const beforeDash = rawTitle.match(/^([A-Z][A-Za-z0-9 &.,'-]{2,45}?)\s*[-–]\s*[A-Z]/);
  if (beforeDash) {
    const candidate = beforeDash[1].trim();
    if (!/linkedin|indeed|naukri|glassdoor|monster|dice|wellfound|internshala/i.test(candidate))
      return candidate;
  }

  // 4. Content: "Employer: Name", "Company: Name", "Organization: Name", "Hiring company: Name"
  const contentLabelMatch = content.match(
    /(?:employer|company|organization|hiring\s+(?:company|for)|client)[:\s]+([A-Z][A-Za-z0-9 &.,'-]{2,50}?)(?:\s*[-|•·,\n]|$)/im,
  );
  if (contentLabelMatch) return contentLabelMatch[1].trim();

  // 5. "Join us at Company" / "working at Company" / "career at Company"
  const joinMatch = content.match(
    /(?:join(?:\s+us|\s+our\s+team)?|working|career|opportunity)\s+at\s+([A-Z][A-Za-z0-9 &.,'-]{2,50}?)(?:\s*[-|•·,\n]|[.!]|$)/im,
  );
  if (joinMatch) return joinMatch[1].trim();

  // 6. "About Company" heading in content
  const aboutMatch = content.match(/^about\s+([A-Z][A-Za-z0-9 &.,'-]{2,50}?)(?:\s*[-|•·:,\n]|$)/im);
  if (aboutMatch) return aboutMatch[1].trim();

  // 7. Indeed / Naukri URL patterns: company name sometimes appears in path
  const namedDomainMatch = url.match(
    /(?:indeed|naukri|glassdoor)\.com\/.+?-at-([a-z0-9-]+)-/i,
  );
  if (namedDomainMatch) return toTitleCase(namedDomainMatch[1]);

  // 8. Subdomain that looks like a company (e.g. careers.google.com)
  const subdomainMatch = url.match(/^https?:\/\/(?:careers?|jobs?)\.([a-z0-9-]+)\./i);
  if (subdomainMatch) return toTitleCase(subdomainMatch[1]);

  // 9. Fallback: show source platform name
  const domainMatch = url.match(/(?:www\.)?([a-z0-9-]+)\.(com|in|io|co\.in|net|org)/i);
  if (domainMatch) {
    const domain = domainMatch[1].toLowerCase();
    if (KNOWN_PLATFORMS[domain]) return `via ${KNOWN_PLATFORMS[domain]}`;
    // If it's not a known aggregator, the domain itself might be the company
    return toTitleCase(domain);
  }

  return "See Listing";
}

// ─── Title cleaning ──────────────────────────────────────────────────────────
/**
 * Extracts a clean job title from a raw page title string.
 * Handles patterns like:
 *   "29,000+ Machine Learning Engineer jobs in India (2,034 new)"
 *   "Senior React Developer - Acme Corp | LinkedIn"
 *   "Software Engineer | Indeed"
 */
function cleanTitle(raw: string): string {
  // Pattern: "N+ <Role> jobs in <Location> (N new)" → extract <Role>
  const aggregateMatch = raw.match(
    /^[\d,]+\+?\s+(.+?)\s+jobs?\s+in\b/i
  );
  if (aggregateMatch) return aggregateMatch[1].trim();

  // Strip platform suffix: "- LinkedIn", "| Indeed", "- Naukri", etc.
  let title = raw
    .replace(/\s*[-–|]\s*(LinkedIn|Indeed|Naukri|Glassdoor|Wellfound|Monster|Internshala|Dice|ZipRecruiter|AngelList|Hirect|Shine|TimesJobs|Freshersworld)\b.*/gi, "")
    .replace(/\s*\|\s*[^|]{1,40}$/, "")   // strip trailing "| Company Name"
    .replace(/\s*[-–]\s*[^-–]{1,60}$/, "") // strip trailing "- Company Name"
    .trim();

  // If still looks like a listing count page, skip entirely (return empty)
  if (/\d[\d,]*\+?\s+\w.*jobs?\s+in/i.test(title)) return "";

  return title;
}

// ─── Experience ──────────────────────────────────────────────────────────────
function guessExperience(text: string): string {
  const lower = text.toLowerCase();
  if (/senior|lead|principal|staff|7\+|8\+|10\+/.test(lower)) return "Senior";
  if (/junior|entry.?level|fresher|0.?[12]\s*year|graduate/.test(lower)) return "Junior";
  if (/mid.?level|3[\+\-\s]year|4[\+\-\s]year|5[\+\-\s]year/.test(lower)) return "Mid-level";
  return "Mid-level";
}

// ─── Job type ────────────────────────────────────────────────────────────────
function guessJobType(text: string): string {
  const lower = text.toLowerCase();
  if (/part.?time/.test(lower)) return "Part-time";
  if (/contract|freelance/.test(lower)) return "Contract";
  if (/intern/.test(lower)) return "Internship";
  return "Full-time";
}

// ─── Requirements ────────────────────────────────────────────────────────────
function extractRequirements(text: string): string[] {
  const bullets = text.match(/(?:•|-|\*|\d+\.)\s*([A-Z][^•\-\*\n]{10,120})/g) ?? [];
  const reqs = bullets
    .map((b) => b.replace(/^[•\-\*\d.]\s*/, "").trim())
    .filter((b) => /skill|experience|knowledge|proficien|familiar|year|degree|background/i.test(b));
  if (reqs.length >= 2) return reqs.slice(0, 5);

  const sentences = text.split(/[.\n]/).map((s) => s.trim()).filter(Boolean);
  return sentences
    .filter((s) => /skill|experience|knowledge|proficien|familiar|year|degree|background/i.test(s))
    .slice(0, 4);
}

// ─── Certificates ────────────────────────────────────────────────────────────
/**
 * Flat list of individual cert entries.
 * Each entry has a weight (how strongly it signals a skill),
 * a set of skill keywords that trigger it, and the cert name.
 * We score every entry against the full job text and return the top 3.
 */
interface CertEntry {
  cert: string;
  keywords: RegExp[];
  score: number; // populated at runtime
}

const CERT_ENTRIES: Omit<CertEntry, "score">[] = [
  // ── AI / ML ───────────────────────────────────────────────────────────────
  { cert: "TensorFlow Developer Certificate (Google)",          keywords: [/tensorflow/i, /deep learning/i, /neural network/i, /keras/i, /ml/i] },
  { cert: "AWS Certified Machine Learning – Specialty",         keywords: [/machine learning/i, /aws/i, /sagemaker/i, /ai/i, /ml/i] },
  { cert: "Deep Learning Specialization – Coursera",            keywords: [/deep learning/i, /neural network/i, /cnn/i, /rnn/i, /nlp/i, /transformer/i] },
  { cert: "IBM Machine Learning Professional Certificate",      keywords: [/machine learning/i, /python/i, /scikit/i, /sklearn/i, /model/i, /data science/i] },
  // ── Data Science ──────────────────────────────────────────────────────────
  { cert: "Google Data Analytics Professional Certificate",     keywords: [/data analyst/i, /analytics/i, /tableau/i, /spreadsheet/i, /sql/i, /visualization/i] },
  { cert: "Microsoft Power BI Data Analyst (PL-300)",           keywords: [/power bi/i, /dax/i, /business intelligence/i, /bi/i, /reporting/i, /dashboard/i] },
  { cert: "IBM Data Analyst Professional Certificate",          keywords: [/data analyst/i, /ibm/i, /excel/i, /python/i, /pandas/i, /data analysis/i] },
  { cert: "Tableau Desktop Specialist",                         keywords: [/tableau/i, /dashboard/i, /visualization/i, /data visualization/i] },
  // ── Data Engineering ──────────────────────────────────────────────────────
  { cert: "Google Professional Data Engineer",                  keywords: [/data engineer/i, /bigquery/i, /gcp/i, /google cloud/i, /dataflow/i] },
  { cert: "AWS Certified Data Engineer – Associate",            keywords: [/data engineer/i, /aws/i, /s3/i, /glue/i, /redshift/i, /etl/i] },
  { cert: "Databricks Certified Developer for Apache Spark",    keywords: [/spark/i, /databricks/i, /big data/i, /hadoop/i, /data pipeline/i, /etl/i] },
  // ── DevOps / Cloud Infrastructure ─────────────────────────────────────────
  { cert: "CKA – Certified Kubernetes Administrator",           keywords: [/kubernetes/i, /k8s/i, /container orchestration/i, /helm/i, /kubectl/i] },
  { cert: "Docker Certified Associate (DCA)",                   keywords: [/docker/i, /container/i, /dockerfile/i, /compose/i] },
  { cert: "AWS DevOps Engineer – Professional",                 keywords: [/devops/i, /ci.?cd/i, /aws/i, /pipeline/i, /codepipeline/i] },
  { cert: "AWS Solutions Architect – Associate",                keywords: [/aws/i, /cloud/i, /architecture/i, /ec2/i, /s3/i, /lambda/i] },
  { cert: "Google Associate Cloud Engineer",                    keywords: [/gcp/i, /google cloud/i, /gke/i, /compute engine/i] },
  { cert: "Microsoft Azure Fundamentals (AZ-900)",              keywords: [/azure/i, /microsoft cloud/i, /az-/i] },
  { cert: "Microsoft Azure Administrator (AZ-104)",             keywords: [/azure/i, /azure admin/i, /entra/i, /active directory/i] },
  { cert: "HashiCorp Terraform Associate",                      keywords: [/terraform/i, /infrastructure as code/i, /iac/i, /provisioning/i] },
  { cert: "GitHub Actions CI/CD Certification",                 keywords: [/github actions/i, /ci.?cd/i, /pipeline/i, /automation/i, /continuous integration/i] },
  // ── Cybersecurity ─────────────────────────────────────────────────────────
  { cert: "CompTIA Security+",                                  keywords: [/security/i, /cybersecurity/i, /compliance/i, /network security/i] },
  { cert: "Certified Ethical Hacker (CEH)",                     keywords: [/ethical hack/i, /penetration/i, /pen test/i, /offensive security/i, /vulnerability/i] },
  { cert: "CISSP – Certified Information Systems Security Professional", keywords: [/cissp/i, /information security/i, /security architecture/i, /risk management/i] },
  { cert: "CompTIA CySA+ (Cybersecurity Analyst)",              keywords: [/soc analyst/i, /threat detection/i, /incident response/i, /siem/i] },
  // ── Frontend / Web ────────────────────────────────────────────────────────
  { cert: "Meta Front-End Developer Professional Certificate",  keywords: [/react/i, /frontend/i, /front.?end/i, /javascript/i, /html/i, /css/i] },
  { cert: "freeCodeCamp Responsive Web Design",                 keywords: [/html/i, /css/i, /responsive/i, /web design/i, /accessibility/i] },
  { cert: "Next.js & React – The Complete Guide (Udemy)",       keywords: [/next\.?js/i, /react/i, /ssr/i, /server.?side rendering/i] },
  // ── Backend ───────────────────────────────────────────────────────────────
  { cert: "AWS Certified Developer – Associate",                keywords: [/aws/i, /developer/i, /lambda/i, /api gateway/i, /backend/i] },
  { cert: "Oracle Certified Professional: Java SE",             keywords: [/java/i, /spring/i, /jvm/i, /maven/i, /backend/i] },
  { cert: "Meta Back-End Developer Professional Certificate",   keywords: [/backend/i, /back.?end/i, /django/i, /node/i, /api/i, /rest/i] },
  { cert: "Python Institute PCEP / PCAP",                       keywords: [/python/i, /django/i, /flask/i, /fastapi/i, /scripting/i] },
  // ── Full Stack / General Dev ──────────────────────────────────────────────
  { cert: "Meta Full-Stack Engineer Certificate",               keywords: [/full.?stack/i, /software engineer/i, /software developer/i] },
  { cert: "Google IT Automation with Python",                   keywords: [/python/i, /automation/i, /scripting/i, /devops/i, /linux/i] },
  // ── Mobile ────────────────────────────────────────────────────────────────
  { cert: "Google Associate Android Developer",                 keywords: [/android/i, /kotlin/i, /java/i, /mobile/i, /google play/i] },
  { cert: "Meta iOS Developer Certificate",                     keywords: [/ios/i, /swift/i, /swiftui/i, /xcode/i, /apple/i] },
  { cert: "Flutter & Dart – Complete Guide (Udemy)",            keywords: [/flutter/i, /dart/i, /cross.?platform/i, /mobile app/i] },
  // ── Database ──────────────────────────────────────────────────────────────
  { cert: "Oracle Database SQL Certified Associate",            keywords: [/oracle/i, /sql/i, /database/i, /dba/i, /relational/i] },
  { cert: "MongoDB Certified Developer",                        keywords: [/mongodb/i, /nosql/i, /document database/i, /atlas/i] },
  { cert: "Microsoft SQL Server – DP-900",                      keywords: [/sql server/i, /mssql/i, /t-sql/i, /microsoft/i, /azure sql/i] },
  { cert: "PostgreSQL – Associate Certification",               keywords: [/postgresql/i, /postgres/i, /pg/i, /rds/i, /relational/i] },
  // ── Networking / IT ───────────────────────────────────────────────────────
  { cert: "Cisco CCNA",                                         keywords: [/cisco/i, /ccna/i, /networking/i, /router/i, /switch/i, /network engineer/i] },
  { cert: "CompTIA Network+",                                   keywords: [/network/i, /tcp.?ip/i, /dns/i, /lan/i, /wan/i, /firewall/i] },
  { cert: "CompTIA A+",                                         keywords: [/it support/i, /help desk/i, /hardware/i, /troubleshoot/i, /desktop support/i] },
  { cert: "Google IT Support Professional Certificate",         keywords: [/it support/i, /tech support/i, /system administration/i, /sysadmin/i] },
  // ── Project / Product Management ──────────────────────────────────────────
  { cert: "PMP – Project Management Professional",              keywords: [/project manager/i, /project management/i, /pmp/i, /program manager/i] },
  { cert: "Certified ScrumMaster (CSM)",                        keywords: [/scrum/i, /agile/i, /sprint/i, /backlog/i, /kanban/i] },
  { cert: "Certified Scrum Product Owner (CSPO)",               keywords: [/product owner/i, /product manager/i, /product management/i, /roadmap/i, /stakeholder/i] },
  { cert: "PMI Agile Certified Practitioner (PMI-ACP)",         keywords: [/agile/i, /scrum/i, /lean/i, /kanban/i, /iteration/i] },
  { cert: "PRINCE2 Foundation",                                 keywords: [/prince2/i, /project delivery/i, /governance/i, /risk management/i] },
  // ── UX / Design ───────────────────────────────────────────────────────────
  { cert: "Google UX Design Professional Certificate",          keywords: [/ux/i, /user experience/i, /usability/i, /wireframe/i, /prototype/i] },
  { cert: "Interaction Design Foundation (IDF)",                keywords: [/ui/i, /ux/i, /interaction design/i, /design thinking/i, /user research/i] },
  { cert: "Adobe Certified Professional (XD / Illustrator)",   keywords: [/figma/i, /adobe/i, /xd/i, /illustrator/i, /graphic design/i, /visual design/i] },
  // ── Marketing & Growth ────────────────────────────────────────────────────
  { cert: "Google Digital Marketing & E-commerce Certificate",  keywords: [/digital marketing/i, /marketing/i, /seo/i, /sem/i, /e-commerce/i, /growth/i] },
  { cert: "HubSpot Inbound Marketing Certification",            keywords: [/inbound marketing/i, /content marketing/i, /hubspot/i, /crm/i, /email marketing/i] },
  { cert: "Meta Social Media Marketing Certificate",            keywords: [/social media/i, /facebook ads/i, /instagram/i, /paid social/i, /content creator/i] },
  { cert: "Google Ads Certification",                           keywords: [/google ads/i, /ppc/i, /paid search/i, /sem/i, /adwords/i, /search ads/i] },
  { cert: "Hootsuite Social Media Marketing Certificate",       keywords: [/social media/i, /community manager/i, /social media manager/i, /brand/i] },
  // ── Sales / CRM ───────────────────────────────────────────────────────────
  { cert: "Salesforce Certified Administrator",                 keywords: [/salesforce/i, /crm/i, /sales cloud/i, /sfdc/i] },
  { cert: "HubSpot Sales Software Certification",               keywords: [/sales/i, /hubspot/i, /crm/i, /business development/i, /account executive/i] },
  { cert: "LinkedIn Sales Navigator Certification",             keywords: [/sales/i, /outbound/i, /lead generation/i, /b2b/i, /sdr/i, /account manager/i] },
  { cert: "Certified Inside Sales Professional (CISP)",         keywords: [/inside sales/i, /sales representative/i, /sales exec/i, /quota/i, /pipeline/i] },
  // ── Finance / Accounting ──────────────────────────────────────────────────
  { cert: "CFA Level 1 (Chartered Financial Analyst)",          keywords: [/finance/i, /financial analyst/i, /investment/i, /equity/i, /portfolio/i, /cfa/i] },
  { cert: "CPA – Certified Public Accountant",                  keywords: [/accountant/i, /accounting/i, /audit/i, /cpa/i, /financial reporting/i, /gaap/i] },
  { cert: "Financial Modeling & Valuation Analyst (FMVA)",      keywords: [/financial model/i, /valuation/i, /excel/i, /forecast/i, /dcf/i, /fp.?a/i] },
  { cert: "QuickBooks ProAdvisor Certification",                keywords: [/quickbooks/i, /bookkeeping/i, /accounts payable/i, /accounts receivable/i] },
  // ── HR / People ───────────────────────────────────────────────────────────
  { cert: "SHRM-CP (Society for Human Resource Management)",    keywords: [/hr/i, /human resources/i, /people ops/i, /talent acquisition/i, /recruitment/i, /shrm/i] },
  { cert: "PHR – Professional in Human Resources",              keywords: [/human resources/i, /hr generalist/i, /employee relations/i, /compensation/i] },
  { cert: "LinkedIn Recruiter Certification",                   keywords: [/recruiter/i, /talent acquisition/i, /sourcing/i, /headhunting/i, /hiring/i] },
  // ── Operations / Supply Chain ─────────────────────────────────────────────
  { cert: "Six Sigma Green Belt",                               keywords: [/six sigma/i, /process improvement/i, /lean/i, /quality management/i, /operations/i] },
  { cert: "APICS CPIM (Supply Chain Management)",               keywords: [/supply chain/i, /logistics/i, /inventory/i, /procurement/i, /warehouse/i] },
  { cert: "Lean Six Sigma Yellow Belt",                         keywords: [/lean/i, /operations/i, /process/i, /efficiency/i, /manufacturing/i] },
  // ── Content / Writing ─────────────────────────────────────────────────────
  { cert: "HubSpot Content Marketing Certification",            keywords: [/content writer/i, /content marketing/i, /blog/i, /copywriting/i, /editorial/i] },
  { cert: "SEO Certification – Semrush Academy",                keywords: [/seo/i, /search engine/i, /keyword research/i, /on.?page/i, /backlink/i] },
  { cert: "Google Analytics 4 (GA4) Certification",             keywords: [/analytics/i, /google analytics/i, /ga4/i, /tracking/i, /web analytics/i] },
  // ── Blockchain ────────────────────────────────────────────────────────────
  { cert: "Certified Blockchain Developer (CBDH)",              keywords: [/blockchain/i, /web3/i, /smart contract/i, /solidity/i, /defi/i] },
  { cert: "ConsenSys Academy Blockchain Developer",             keywords: [/ethereum/i, /solidity/i, /web3/i, /dapp/i, /metamask/i] },
  // ── QA / Testing ──────────────────────────────────────────────────────────
  { cert: "ISTQB Foundation Level",                             keywords: [/qa/i, /quality assurance/i, /testing/i, /test plan/i, /bug/i] },
  { cert: "Selenium WebDriver Certification (Udemy)",           keywords: [/selenium/i, /automation testing/i, /webdriver/i, /test automation/i] },
  // ── Healthcare / Life Sciences ────────────────────────────────────────────
  { cert: "Certified Clinical Research Associate (CCRA)",       keywords: [/clinical research/i, /clinical trial/i, /crc/i, /gcp/i, /fda/i, /pharma/i] },
  { cert: "Certified Health Data Analyst (CHDA)",               keywords: [/health data/i, /ehr/i, /emr/i, /healthcare analytics/i, /icd/i, /medical coding/i] },
  // ── Legal ─────────────────────────────────────────────────────────────────
  { cert: "Paralegal Certificate (ABA-approved)",               keywords: [/paralegal/i, /legal assistant/i, /law firm/i, /litigation/i, /contracts/i] },
  { cert: "Certified Compliance & Ethics Professional (CCEP)",  keywords: [/compliance/i, /regulatory/i, /gdpr/i, /ethics/i, /risk/i] },
];

/**
 * Score every cert entry against the full job text, then return the top 3
 * most relevant individual certificates.
 */
function getCertificates(title: string, role: string, content: string): string[] {
  const fullText = `${title} ${role} ${content}`.toLowerCase();

  // Score each cert: +1 per keyword that appears in the full text
  const scored = CERT_ENTRIES.map((entry) => ({
    cert: entry.cert,
    score: entry.keywords.filter((kw) => kw.test(fullText)).length,
  }));

  // Sort by score descending, filter out zero-match entries
  const relevant = scored.filter((e) => e.score > 0).sort((a, b) => b.score - a.score);

  if (relevant.length === 0) {
    // Truly no skill match — suggest universal career-building certs
    return [
      "Google Project Management Certificate",
      "Microsoft Office Specialist (MOS)",
      "Google Career Certificates – Professional Development",
    ];
  }

  // Return top 3 (deduplicated by name)
  const seen = new Set<string>();
  const top: string[] = [];
  for (const e of relevant) {
    if (!seen.has(e.cert) && top.length < 3) {
      seen.add(e.cert);
      top.push(e.cert);
    }
  }
  return top;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function randomScore(min = 70, max = 97) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function postedAgo(dateStr: string | undefined): string {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Recently";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// ─── Platform diversity helpers ───────────────────────────────────────────────
const JOB_PLATFORMS = [
  "linkedin.com",
  "indeed.com",
  "naukri.com",
  "glassdoor.com",
  "wellfound.com",
  "internshala.com",
  "foundit.in",
  "apna.co",
  "hirist.com",
  "instahyre.com",
  "cutshort.io",
  "iimjobs.com",
  "monster.com",
  "ziprecruiter.com",
  "dice.com",
];

const MAX_PER_PLATFORM = 2;

function extractRootDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname;
  } catch {
    return url;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function fetchLiveJobs(params: {
  search?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
}): Promise<LiveJob[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY not configured");

  const client = tavily({ apiKey });

  const role = params.search?.trim() || "software engineer";
  const loc = params.location?.trim();
  const exp = params.experienceLevel && params.experienceLevel !== "all" ? params.experienceLevel : "";
  const type = params.jobType && params.jobType !== "all" ? params.jobType : "";

  const query = [
    `${role} job opening`,
    loc ? `in ${loc}` : "",
    exp ? `${exp} level` : "",
    type || "",
    "apply now hiring",
  ]
    .filter(Boolean)
    .join(" ");

  const result = await client.search(query, {
    maxResults: 20,
    searchDepth: "basic",
    includeAnswer: false,
    includeDomains: JOB_PLATFORMS,
  });

  const jobs: LiveJob[] = [];
  const domainCounts: Record<string, number> = {};

  for (const item of result.results ?? []) {
    const url = item.url ?? "";
    const domain = extractRootDomain(url);

    // Cap each platform at MAX_PER_PLATFORM listings
    if ((domainCounts[domain] ?? 0) >= MAX_PER_PLATFORM) continue;

    const content = item.content ?? "";
    const rawTitle = item.title ?? "";

    const title = cleanTitle(rawTitle);
    if (!title || title.length < 3) continue;

    const company = extractCompany(rawTitle, content, url);

    // Extract location
    const locationMatch =
      content.match(/(?:location|based in|office)[:\s]*([A-Za-z ,]+?)(?:\n|•|·|-|\|)/im) ??
      content.match(/([A-Z][a-z]+(?:,\s*[A-Z]{2})?)\s*(?:\((?:On-?site|Hybrid|Remote)\))?/m);
    const location =
      params.location?.trim() ||
      (locationMatch ? locationMatch[1].trim() : loc || "Remote");

    const salary = extractSalary(content);
    const requirements = extractRequirements(content);
    const certificates = getCertificates(title, role, content);

    // Build 2-line description
    const descLines = content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 40 && !/^(http|apply|click|sign|login)/i.test(l));
    const description = descLines.slice(0, 2).join(" ").slice(0, 280) || content.slice(0, 280);

    domainCounts[domain] = (domainCounts[domain] ?? 0) + 1;
    jobs.push({
      id: `live-${jobs.length}-${Date.now()}`,
      title,
      company,
      location,
      jobType: type || guessJobType(content),
      experienceLevel: exp || guessExperience(content),
      salaryMin: salary.min,
      salaryMax: salary.max,
      description,
      requirements: requirements.length ? requirements : [`Experience in ${role}`, "Strong communication skills"],
      certificates,
      postedDate: postedAgo(item.publishedDate),
      applyUrl: url,
      aiMatchScore: randomScore(),
    });
  }

  return jobs;
}
