// ─────────────────────────────────────────────────────────────
// UK Jobs MCP — Public Tools
//
// No authentication required.
// These are genuinely generic — any UK job platform could
// implement the same interface over their data.
//
// No proprietary scoring, matching, or AI logic here.
// ─────────────────────────────────────────────────────────────

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Job, MarketDataPoint, SkillDemandPoint } from "../types.js";

export function registerPublicTools(server: McpServer) {

  // ── 1. Search jobs ──────────────────────────────────────────
  server.registerTool(
    "search_jobs",
    {
      title: "Search UK Jobs",
      description:
        "Search for jobs across the UK market. Filter by keywords, location, employment " +
        "type, work mode, seniority, and pay. Returns structured job records. " +
        "No authentication required.",
      inputSchema: {
        keywords: z
          .string()
          .describe("Job title, role, or skills. E.g. 'software engineer TypeScript' or 'data analyst'"),

        location: z
          .string()
          .optional()
          .describe("City, region, or postcode. E.g. 'Edinburgh', 'Manchester', 'EC1A'. Omit for UK-wide."),

        radiusMiles: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .describe("Search radius in miles from the given location"),

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

        ir35Status: z
          .enum(["outside", "inside", "any"])
          .optional()
          .default("any")
          .describe("IR35 status filter — relevant for contract roles only"),

        salaryMin: z
          .number()
          .optional()
          .describe("Minimum annual salary in GBP — applies to permanent roles"),

        rateMin: z
          .number()
          .optional()
          .describe("Minimum day rate in GBP — applies to contract and freelance roles"),

        postedWithinDays: z
          .number()
          .min(1)
          .max(90)
          .optional()
          .default(30)
          .describe("Only return jobs posted within this many days"),

        limit: z
          .number()
          .min(1)
          .max(50)
          .optional()
          .default(10)
          .describe("Number of results to return"),

        offset: z
          .number()
          .min(0)
          .optional()
          .default(0)
          .describe("Pagination offset"),
      },
    },
    async (args) => {
      const results = await searchJobs(args);
      return {
        structuredContent: {
          type:   "job_search_results",
          total:  results.total,
          offset: args.offset ?? 0,
          limit:  args.limit  ?? 10,
          jobs:   results.jobs,
        },
        content: [{
          type: "text",
          text: JSON.stringify(results, null, 2),
        }],
      };
    }
  );

  // ── 2. Get job detail ───────────────────────────────────────
  server.registerTool(
    "get_job_detail",
    {
      title: "Get Job Detail",
      description:
        "Retrieve the full structured record for a single UK job by its ID. " +
        "Includes required and desirable skills, compensation range, IR35 status, " +
        "contract duration, work mode, and the original source URL. " +
        "No authentication required.",
      inputSchema: {
        jobId: z
          .string()
          .describe("The job ID returned by search_jobs"),
      },
    },
    async ({ jobId }) => {
      const job = await getJobById(jobId);

      if (!job) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `No job found with ID: ${jobId}`,
          }],
        };
      }

      return {
        structuredContent: { type: "job", ...job },
        content: [{ type: "text", text: JSON.stringify(job, null, 2) }],
      };
    }
  );

  // ── 3. Get UK market rate data ──────────────────────────────
  server.registerTool(
    "get_market_rates",
    {
      title: "Get UK Market Rates",
      description:
        "Returns current UK salary and day rate data by role, seniority, and region. " +
        "Useful for benchmarking compensation or understanding what a role typically pays. " +
        "Data is aggregated from live job postings. No authentication required.",
      inputSchema: {
        role: z
          .string()
          .describe("Role or job title to look up. E.g. 'software engineer', 'product manager'"),

        region: z
          .string()
          .optional()
          .describe("UK region. E.g. 'London', 'Scotland', 'North West'. Omit for UK-wide average."),

        seniority: z
          .enum(["junior", "mid", "senior", "principal", "director", "any"])
          .optional()
          .default("any"),

        employmentType: z
          .enum(["contract", "permanent", "any"])
          .optional()
          .default("any"),
      },
    },
    async (args) => {
      const data = await getMarketRates(args);
      return {
        structuredContent: { type: "market_rate_data", results: data },
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // ── 4. Get in-demand skills ─────────────────────────────────
  server.registerTool(
    "get_skills_demand",
    {
      title: "Get UK Skills Demand",
      description:
        "Returns the most in-demand skills in the UK job market, with associated " +
        "job counts, average rates, and trend direction. Filter by role area or region. " +
        "No authentication required.",
      inputSchema: {
        roleArea: z
          .string()
          .optional()
          .describe("Broad role area to filter by. E.g. 'software engineering', 'data', 'devops'"),

        region: z
          .string()
          .optional()
          .describe("UK region. Omit for UK-wide."),

        limit: z
          .number()
          .min(1)
          .max(50)
          .optional()
          .default(20),
      },
    },
    async (args) => {
      const data = await getSkillsDemand(args);
      return {
        structuredContent: { type: "skills_demand", results: data },
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

}

// ─────────────────────────────────────────────────────────────
// Data stubs — replace with your actual data source queries.
// For CareersAI/RecruitersAI these wire to Convex HTTP actions.
// For a third-party implementing this standard, they wire to
// their own data store.
// ─────────────────────────────────────────────────────────────

async function searchJobs(args: any): Promise<{ total: number; jobs: Job[] }> {
  void args;
  // TODO: query your jobs data source
  return { total: 0, jobs: [] };
}

async function getJobById(jobId: string): Promise<Job | null> {
  void jobId;
  // TODO: fetch single job by ID
  return null;
}

async function getMarketRates(args: any): Promise<MarketDataPoint[]> {
  void args;
  // TODO: aggregate from jobs data — avg/median rates and salaries
  return [];
}

async function getSkillsDemand(args: any): Promise<SkillDemandPoint[]> {
  void args;
  // TODO: aggregate skill frequency from jobs data
  return [];
}
