// ─────────────────────────────────────────────────────────────
// UK Jobs MCP — Candidate Tools
//
// Requires candidate:read scope.
//
// These expose only generic availability and preference data —
// the kind of information a candidate would put on any job board.
//
// Deliberately excluded:
//   - CV content or parsed CV data
//   - Skills scoring or weighting
//   - Match scores or FIT data
//   - AI-generated summaries or tailored profiles
//   - Application history or outcomes
// ─────────────────────────────────────────────────────────────

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CandidateAvailability } from "../types.js";

export function registerCandidateTools(server: McpServer) {

  // ── 1. Get availability and preferences ────────────────────
  server.registerTool(
    "get_candidate_availability",
    {
      title: "Get Candidate Availability",
      description:
        "Returns the authenticated candidate's current availability status and work preferences: " +
        "when they can start, what type of work they want, location, and compensation expectations. " +
        "Requires candidate:read scope. " +
        "This is the standard profile a candidate would share with any job platform.",
      inputSchema: {
        fields: z
          .array(z.enum([
            "all",
            "availability",
            "workMode",
            "employmentType",
            "location",
            "compensation",
            "skills",
          ]))
          .optional()
          .default(["all"])
          .describe("Which sections to return. Defaults to all."),
      },
    },
    async ({ fields }) => {
      const data = await getCandidateAvailability(fields);
      return {
        structuredContent: { type: "candidate_availability", ...data },
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // ── 2. Update availability status ──────────────────────────
  server.registerTool(
    "update_availability",
    {
      title: "Update Candidate Availability",
      description:
        "Update the authenticated candidate's availability status and optionally their " +
        "available-from date. Use this when a candidate starts or ends a contract, " +
        "or changes their job search status. Requires candidate:read scope.",
      inputSchema: {
        availability: z
          .enum(["immediate", "two_weeks", "one_month", "negotiable"])
          .describe("New availability status"),

        availableFrom: z
          .string()
          .optional()
          .describe("ISO 8601 date — when the candidate is available from, e.g. '2026-04-01'"),
      },
    },
    async (args) => {
      const result = await updateAvailability(args);
      return {
        structuredContent: { type: "availability_update", ...result },
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

}

// ─────────────────────────────────────────────────────────────
// Data stubs — wire to your candidate data source.
// For CareersAI these query Convex candidateProfiles.
// Auth context (candidateId) comes from the verified token.
// ─────────────────────────────────────────────────────────────

async function getCandidateAvailability(
  fields: string[]
): Promise<Partial<CandidateAvailability>> {
  void fields;
  // TODO: fetch from candidateProfiles using userId from auth token
  return {};
}

async function updateAvailability(args: {
  availability:   string;
  availableFrom?: string;
}): Promise<{ success: boolean; availability: string }> {
  void args;
  // TODO: update candidateProfiles in your data store
  return { success: false, availability: args.availability };
}
