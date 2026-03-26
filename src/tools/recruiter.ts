// ─────────────────────────────────────────────────────────────
// UK Jobs MCP — Recruiter Tools
//
// Requires recruiter:read or recruiter:write scope.
//
// Generic recruiter actions any hiring platform would expose.
//
// Deliberately excluded:
//   - Ranked or scored candidate results
//   - FIT scores or match explanations
//   - AI-generated candidate summaries
//   - Shortlist management or pipeline state
//   - Any candidate PII beyond what they've made available
// ─────────────────────────────────────────────────────────────

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Job } from "../types.js";

export function registerRecruiterTools(server: McpServer) {

  // ── 1. Post a job ───────────────────────────────────────────
  server.registerTool(
    "post_job",
    {
      title: "Post a Job",
      description:
        "Create a new job listing. Accepts standard UK job fields. " +
        "Returns the created job ID. Requires recruiter:write scope.",
      inputSchema: {
        title: z
          .string()
          .describe("Job title. E.g. 'Senior Software Engineer'"),

        location: z
          .string()
          .describe("Location. E.g. 'Edinburgh, UK' or 'Remote'"),

        employmentType: z
          .enum(["contract", "permanent", "freelance"])
          .describe("Type of employment"),

        workMode: z
          .enum(["remote", "hybrid", "onsite"])
          .describe("Where the work takes place"),

        seniority: z
          .enum(["junior", "mid", "senior", "principal", "director"])
          .optional(),

        ir35Status: z
          .enum(["outside", "inside", "unknown"])
          .optional()
          .describe("IR35 status — required for contract roles"),

        contractDurationMonths: z
          .number()
          .optional()
          .describe("Expected contract length in months"),

        skillsRequired: z
          .array(z.string())
          .describe("Required skills. Use lowercase normalised names. E.g. ['typescript', 'react', 'node']"),

        skillsDesirable: z
          .array(z.string())
          .optional()
          .describe("Nice-to-have skills"),

        salaryMin: z.number().optional().describe("Minimum annual salary in GBP"),
        salaryMax: z.number().optional().describe("Maximum annual salary in GBP"),
        rateMin:   z.number().optional().describe("Minimum day rate in GBP"),
        rateMax:   z.number().optional().describe("Maximum day rate in GBP"),

        description: z
          .string()
          .optional()
          .describe("Full job description text"),

        expiresAt: z
          .string()
          .optional()
          .describe("ISO 8601 date when the listing should expire"),
      },
    },
    async (args) => {
      const result = await postJob(args);
      return {
        structuredContent: { type: "job_created", ...result },
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ── 2. Search available candidates ─────────────────────────
  server.registerTool(
    "search_available_candidates",
    {
      title: "Search Available Candidates",
      description:
        "Search for candidates who have made their availability public. " +
        "Returns candidates matching the given skill and preference criteria. " +
        "Results are anonymised — no names or contact details. " +
        "Requires recruiter:read scope.",
      inputSchema: {
        skills: z
          .array(z.string())
          .optional()
          .describe("Skills to match against. E.g. ['python', 'machine learning']"),

        location: z
          .string()
          .optional()
          .describe("Preferred location. E.g. 'London' or 'Remote'"),

        employmentType: z
          .enum(["contract", "permanent", "freelance", "any"])
          .optional()
          .default("any"),

        workMode: z
          .enum(["remote", "hybrid", "onsite", "any"])
          .optional()
          .default("any"),

        seniority: z
          .enum(["junior", "mid", "senior", "principal", "director", "any"])
          .optional()
          .default("any"),

        availability: z
          .enum(["immediate", "within_month", "any"])
          .optional()
          .default("any"),

        maxDayRate: z
          .number()
          .optional()
          .describe("Maximum day rate budget in GBP"),

        maxSalary: z
          .number()
          .optional()
          .describe("Maximum salary budget in GBP per year"),

        limit: z
          .number()
          .min(1)
          .max(50)
          .optional()
          .default(10),

        offset: z
          .number()
          .min(0)
          .optional()
          .default(0),
      },
    },
    async (args) => {
      const results = await searchAvailableCandidates(args);
      return {
        structuredContent: {
          type:       "candidate_availability_results",
          total:      results.total,
          offset:     args.offset ?? 0,
          limit:      args.limit  ?? 10,
          candidates: results.candidates,
        },
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

}

// ─────────────────────────────────────────────────────────────
// Data stubs — wire to your job and candidate data sources.
// Auth context (recruiterId) comes from the verified token.
// ─────────────────────────────────────────────────────────────

async function postJob(
  args: any
): Promise<{ jobId: string; status: string }> {
  void args;
  // TODO: insert into your jobs data store
  return { jobId: "", status: "created" };
}

async function searchAvailableCandidates(
  args: any
): Promise<{ total: number; candidates: Partial<import("../types.js").CandidateAvailability>[] }> {
  void args;
  // TODO: query candidateProfiles where availability is not null
  // Return only anonymised availability data — no names, no contact details
  return { total: 0, candidates: [] };
}
