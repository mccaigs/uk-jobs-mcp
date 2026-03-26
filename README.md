# uk-jobs-mcp

**The standard MCP interface for UK recruitment data — enabling AI agents to access jobs as structured tools instead of scraping.**

An open MCP server that gives any AI assistant structured access to UK job listings, market intelligence, and candidate availability — using a common, platform-neutral schema.

Built on the [Model Context Protocol](https://modelcontextprotocol.io) by [David Robertson](https://www.linkedin.com/in/daverobertson4/).

---

## Quick start

Clone, install, and run locally in under a minute:

```bash
git clone https://github.com/mccaigs/uk-jobs-mcp
cd uk-jobs-mcp
npm install && npm run dev
```

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "uk-jobs": {
      "command": "npx",
      "args": ["-y", "uk-jobs-mcp"]
    }
  }
}
```

Then ask Claude: **"Find AI contract roles in London outside IR35 over £600/day"**

A managed hosted instance is on the way. Watch this repo for updates.

---

## Example

```js
search_jobs({
  keywords: "AI engineer",
  location: "London",
  employmentType: "contract",
  ir35Status: "outside",
  rateMin: 600,
  workMode: "hybrid"
})
```

Returns structured job records — title, company, skills, rate range, IR35 status, source URL — ready for an AI agent to reason over directly.

---

## Tools

### Public — no authentication required

| Tool | Description |
|---|---|
| `search_jobs` | Search UK jobs by keyword, location, type, seniority, and pay |
| `get_job_detail` | Full structured record for a job — skills, rate, IR35, source URL |
| `get_market_rates` | Salary and day rate benchmarks by role, seniority, and region |
| `get_skills_demand` | In-demand skills with job counts, avg rates, and trend direction |

### Candidate — requires `candidate:read` scope

| Tool | Description |
|---|---|
| `get_candidate_availability` | Read availability status and work preferences |
| `update_availability` | Update availability status and start date |

### Recruiter — requires `recruiter:read` or `recruiter:write` scope

| Tool | Description |
|---|---|
| `post_job` | Create a new job listing |
| `search_available_candidates` | Search candidates who have made availability public |

---

## Why I built this

I've spent more hours than I care to admit filling in the same information on job platforms over and over again.

Name. Location. Skills. Rate. Availability. Notice period. Preferred work mode. Contract or permanent. PAYE or outside IR35.

And every single platform asks for all of it, every time.

It's 2026. AI assistants can book restaurants, manage calendars, and write code — but somehow job hunting still means manually re-keying your entire professional history into another identical form, on another identical platform, for the fifth time this week.

MCP changes that. A candidate should be able to store their profile once and have any AI assistant — Claude, ChatGPT, Cursor, whatever comes next — read it and fill in any application form automatically. No re-keying. No copy-pasting. No wasted afternoon.

But for that to work, job platforms need to speak a common language. This is my attempt to define that language for the UK market.

If you've ever sworn at a job board's profile page, this is for you.

— [David Robertson](https://www.linkedin.com/in/daverobertson4/)

---

## Running locally

```bash
npm install
npm run dev
```

The server starts on port 3000 by default.

```
POST http://localhost:3000/mcp
GET  http://localhost:3000/.well-known/mcp.json
GET  http://localhost:3000/.well-known/oauth-protected-resource
GET  http://localhost:3000/health
```

Test with the MCP Inspector:

```bash
npm run inspector
```

### Deploying your own hosted instance

Fork this repo, replace the stubs in `src/tools/` with queries to your own data source, and deploy. Set the `BASE_URL` environment variable to your domain:

```bash
BASE_URL=https://your-domain.com npm start
```

---

## Authentication

Public tools require no authentication.

Protected tools use OAuth 2.1 with PKCE. When an unauthenticated request reaches a protected tool, the server returns:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="uk-jobs-mcp",
  resource_metadata="https://your-domain.com/.well-known/oauth-protected-resource"
```

The client fetches the Protected Resource Metadata document to discover the authorisation server and available scopes, then completes a standard PKCE flow.

### Scopes

| Scope | Access |
|---|---|
| `public` | Job search and market data — no login required |
| `candidate:read` | Candidate availability and preferences |
| `recruiter:read` | Search available candidates |
| `recruiter:write` | Post and manage jobs |

---

## Implementing this standard

This MCP defines a schema, not an implementation. If you run a UK job board or recruitment platform and want to expose your data through the same interface:

1. Fork this repo
2. Replace the stub functions in `src/tools/` with queries to your own data store
3. Deploy your own instance
4. Point your MCP discovery endpoint at it

The schema in `src/types.ts` is the canonical field definition. Contributions to improve or extend the standard are welcome via pull request.

---

## Built with uk-jobs-mcp?

If you've implemented this standard on your platform, or built something using it, open a PR to add yourself here.

---

## Stack

- [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) v1.x
- TypeScript
- Zod v3
- Node.js HTTP (Streamable HTTP transport, stateless)

---

## Licence

MIT
