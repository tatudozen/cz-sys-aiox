/**
 * Agent Server — Express.js
 * Story 3.3 — AC-6: Internal HTTP server for n8n → agents communication
 * Network: AZ_Net (Docker internal), URL: http://copyzen-agents:3001
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { CMOAgent } from './cmo/cmo-agent.js';
import { CopywriterAgent } from './copywriter/copywriter-agent.js';
import { createLLMProvider } from './llm/factory.js';
import type { AgentOutput } from './cmo/types.js';
import type { BrandConfig } from '@copyzen/core';

const app = express();
app.use(express.json());

// --- Auth middleware (AC-6) ---
function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-agent-api-key'];
  const expected = process.env.AGENT_API_KEY;

  if (!expected) {
    // No key configured — allow in dev mode
    next();
    return;
  }

  if (key !== expected) {
    res.status(401).json({ error: 'Unauthorized — invalid or missing X-Agent-API-Key' });
    return;
  }
  next();
}

app.use('/agents', requireApiKey);

// --- Health check (AC-6) ---
app.get('/agents/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    agents: ['cmo'],
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// --- CMO routes (AC-6) ---

// POST /agents/cmo/analyze-briefing
app.post('/agents/cmo/analyze-briefing', async (req: Request, res: Response) => {
  try {
    const { briefing } = req.body as { briefing: Parameters<CMOAgent['analyzeBriefing']>[0] };
    if (!briefing) {
      res.status(400).json({ error: 'Missing required field: briefing' });
      return;
    }

    const agent = new CMOAgent({ llm: createLLMProvider() });
    const result = await agent.analyzeBriefing(briefing);
    res.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// POST /agents/cmo/create-project-plan
app.post('/agents/cmo/create-project-plan', async (req: Request, res: Response) => {
  try {
    const { client_id, package: pkg, system_surveys, brand_config } = req.body as {
      client_id: string | null;
      package: Parameters<CMOAgent['createProjectPlan']>[1];
      system_surveys: Parameters<CMOAgent['createProjectPlan']>[2];
      brand_config?: BrandConfig;
    };

    if (!pkg || !system_surveys) {
      res.status(400).json({ error: 'Missing required fields: package, system_surveys' });
      return;
    }

    const agent = new CMOAgent({ llm: createLLMProvider() });
    const result = await agent.createProjectPlan(client_id ?? null, pkg, system_surveys, brand_config);
    res.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// POST /agents/cmo/review-output
app.post('/agents/cmo/review-output', async (req: Request, res: Response) => {
  try {
    const { output, brand_config } = req.body as {
      output: AgentOutput;
      brand_config: BrandConfig;
    };

    if (!output || !brand_config) {
      res.status(400).json({ error: 'Missing required fields: output, brand_config' });
      return;
    }

    const agent = new CMOAgent({ llm: createLLMProvider() });
    const result = await agent.reviewOutput(output, brand_config);
    res.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// POST /agents/cmo/analyze-brand-intel
app.post('/agents/cmo/analyze-brand-intel', async (req: Request, res: Response) => {
  try {
    const { client_id, briefing, brand_config } = req.body as {
      client_id: string | null;
      briefing: Parameters<CMOAgent['analyzeBriefing']>[0];
      brand_config?: BrandConfig;
    };

    if (!briefing) {
      res.status(400).json({ error: 'Missing required field: briefing' });
      return;
    }

    const agent = new CMOAgent({ llm: createLLMProvider() });
    const analysis = await agent.analyzeBriefing(briefing);

    res.json({
      success: true,
      data: {
        client_id,
        analysis,
        brand_applied: !!brand_config,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// --- Copywriter routes (Story 3.4 — AC-8) ---

// POST /agents/copywriter/generate-post
app.post('/agents/copywriter/generate-post', async (req: Request, res: Response) => {
  try {
    const { brief, brand_config, mode, type } = req.body as {
      brief: string;
      brand_config: BrandConfig;
      mode: Parameters<CopywriterAgent['generatePostCopy']>[2];
      type: Parameters<CopywriterAgent['generatePostCopy']>[3];
    };

    if (!brief || !brand_config || !mode || !type) {
      res.status(400).json({ error: 'Missing required fields: brief, brand_config, mode, type' });
      return;
    }

    const agent = new CopywriterAgent({ llm: createLLMProvider() });
    const result = await agent.generatePostCopy(brief, brand_config, mode, type);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// POST /agents/copywriter/generate-landing-page
app.post('/agents/copywriter/generate-landing-page', async (req: Request, res: Response) => {
  try {
    const { brief, brand_config, page_type } = req.body as {
      brief: string;
      brand_config: BrandConfig;
      page_type: Parameters<CopywriterAgent['generateLandingPageCopy']>[2];
    };

    if (!brief || !brand_config || !page_type) {
      res.status(400).json({ error: 'Missing required fields: brief, brand_config, page_type' });
      return;
    }

    const agent = new CopywriterAgent({ llm: createLLMProvider() });
    const result = await agent.generateLandingPageCopy(brief, brand_config, page_type);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// POST /agents/copywriter/generate-sales-page
app.post('/agents/copywriter/generate-sales-page', async (req: Request, res: Response) => {
  try {
    const { brief, brand_config } = req.body as { brief: string; brand_config: BrandConfig };

    if (!brief || !brand_config) {
      res.status(400).json({ error: 'Missing required fields: brief, brand_config' });
      return;
    }

    const agent = new CopywriterAgent({ llm: createLLMProvider() });
    const result = await agent.generateSalesPageCopy(brief, brand_config);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// POST /agents/copywriter/revise
app.post('/agents/copywriter/revise', async (req: Request, res: Response) => {
  try {
    const { original, feedback, brand_config } = req.body as {
      original: string;
      feedback: string;
      brand_config: BrandConfig;
    };

    if (!original || !feedback || !brand_config) {
      res.status(400).json({ error: 'Missing required fields: original, feedback, brand_config' });
      return;
    }

    const agent = new CopywriterAgent({ llm: createLLMProvider() });
    const result = await agent.revise(original, feedback, brand_config);
    res.json({ success: true, data: { revised: result } });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// --- Start server ---
const PORT = parseInt(process.env.AGENT_PORT ?? '3001', 10);

export function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`[agents] Server running on port ${port}`);
  });
}

export { app };

// Run directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
