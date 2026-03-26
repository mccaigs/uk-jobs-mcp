// ─────────────────────────────────────────────────────────────
// UK Jobs MCP — Shared Types
//
// These are the canonical field definitions for UK recruitment
// data exchange. Generic enough that any UK job platform could
// implement this interface. No proprietary scoring or matching.
// ─────────────────────────────────────────────────────────────

export type EmploymentType = "contract" | "permanent" | "freelance" | "unknown";
export type WorkMode       = "remote" | "hybrid" | "onsite" | "unknown";
export type Seniority      = "junior" | "mid" | "senior" | "principal" | "director" | "unknown";
export type Ir35Status     = "outside" | "inside" | "unknown";
export type Availability   = "immediate" | "two_weeks" | "one_month" | "negotiable";
export type Currency       = "GBP" | "EUR" | "USD";

// A structured UK job record.
// All fields except id and title are optional —
// not every source provides full data.
export interface Job {
  id:                      string;
  title:                   string;
  company?:                string;
  description?:            string;
  location:                string;
  locationRegion?:         string;   // e.g. "Scotland", "North West"
  locationCountry:         string;   // default "GB"
  workMode:                WorkMode;
  maxOnsiteDaysPerWeek?:   number;
  employmentType:          EmploymentType;
  seniority:               Seniority;
  ir35Status?:             Ir35Status;
  contractDurationMonths?: number;
  skillsRequired:          string[];
  skillsDesirable?:        string[];
  salaryMin?:              number;
  salaryMax?:              number;
  rateMin?:                number;   // GBP per day
  rateMax?:                number;
  currency:                Currency;
  source:                  string;   // e.g. "reed", "indeed", "linkedin"
  sourceUrl?:              string;
  postedAt?:               string;   // ISO 8601
  expiresAt?:              string;
}

// A candidate's publicly sharable availability record.
// Deliberately limited — no CV content, no personal details,
// no scoring data. Just enough to answer "are they available
// and what are they looking for?"
export interface CandidateAvailability {
  availability:         Availability;
  availableFrom?:       string;          // ISO 8601
  location:             string;
  willingToRelocate?:   boolean;
  workModes:            WorkMode[];
  maxOnsiteDaysPerWeek?: number;
  employmentTypes:      EmploymentType[];
  ir35Preference?:      Ir35Status;
  minimumDayRate?:       number;
  minimumSalary?:        number;
  currency:             Currency;
  skills:               string[];        // normalised lowercase
  experienceLevel:      Seniority;
  industries?:          string[];
  noticePeriod?:        string;          // e.g. "immediate", "2 weeks", "1 month"
}

// A single entry in UK market intelligence data.
export interface MarketDataPoint {
  role:           string;
  region?:        string;
  employmentType: EmploymentType;
  avgDayRate?:    number;
  medDayRate?:    number;
  avgSalary?:     number;
  medSalary?:     number;
  currency:       Currency;
  sampleSize:     number;
  periodStart:    string;   // ISO 8601 date
  periodEnd:      string;
}

export interface SkillDemandPoint {
  skill:          string;
  jobCount:       number;
  avgDayRate?:    number;
  avgSalary?:     number;
  trend:          "rising" | "stable" | "falling";
  periodStart:    string;
  periodEnd:      string;
}
