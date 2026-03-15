/**
 * GoHighLevel Client Tests — Story 5.3
 * AC-2: createContact → validate GHL integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoHighLevelClient } from '../ghl-client.js';

describe('GoHighLevelClient — constructor', () => {
  it('reads GHL_API_KEY from env when no config provided', () => {
    process.env.GHL_API_KEY = 'test-api-key';
    const client = new GoHighLevelClient();
    expect(client).toBeInstanceOf(GoHighLevelClient);
    delete process.env.GHL_API_KEY;
  });

  it('accepts apiKey directly in config', () => {
    const client = new GoHighLevelClient({ apiKey: 'direct-key' });
    expect(client).toBeInstanceOf(GoHighLevelClient);
  });
});

describe('GoHighLevelClient — createContact', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when apiKey is not configured', async () => {
    const client = new GoHighLevelClient({ apiKey: '' });
    await expect(
      client.createContact({ email: 'test@example.com', firstName: 'Test' }),
    ).rejects.toThrow('GHL_API_KEY');
  });

  it('returns contact on success', async () => {
    const mockContact = { id: 'contact-123', email: 'lead@example.com', firstName: 'Maria' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ contact: mockContact }),
    } as Response));

    const client = new GoHighLevelClient({ apiKey: 'test-key' });
    const result = await client.createContact({ email: 'lead@example.com', firstName: 'Maria' });

    expect(result.contact.id).toBe('contact-123');
    expect(result.contact.email).toBe('lead@example.com');
  });

  it('throws on API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as Response));

    const client = new GoHighLevelClient({ apiKey: 'bad-key' });
    await expect(
      client.createContact({ email: 'test@example.com' }),
    ).rejects.toThrow('401');
  });

  it('includes source=funwheel by default', async () => {
    let capturedBody: unknown;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return { ok: true, json: async () => ({ contact: { id: 'c1' } }) } as Response;
    }));

    const client = new GoHighLevelClient({ apiKey: 'test-key' });
    await client.createContact({ email: 'lead@example.com' });

    expect((capturedBody as { source: string }).source).toBe('funwheel');
  });
});

describe('GoHighLevelClient — addTag', () => {
  it('throws when apiKey is not configured', async () => {
    const client = new GoHighLevelClient({ apiKey: '' });
    await expect(client.addTag('contact-id', 'tag-name')).rejects.toThrow('GHL_API_KEY');
  });

  it('completes without error on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response));

    const client = new GoHighLevelClient({ apiKey: 'test-key' });
    await expect(client.addTag('contact-id', 'funwheel-lead')).resolves.toBeUndefined();
  });
});

describe('GoHighLevelClient — updateContact', () => {
  it('returns updated contact on success', async () => {
    const mockContact = { id: 'c1', email: 'updated@example.com' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ contact: mockContact }),
    } as Response));

    const client = new GoHighLevelClient({ apiKey: 'test-key' });
    const result = await client.updateContact('c1', { email: 'updated@example.com' });
    expect(result.contact.id).toBe('c1');
  });

  it('throws on API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    } as Response));

    const client = new GoHighLevelClient({ apiKey: 'test-key' });
    await expect(client.updateContact('bad-id', {})).rejects.toThrow('404');
  });
});

describe('GoHighLevelClient — removeTag', () => {
  it('completes without error on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response));

    const client = new GoHighLevelClient({ apiKey: 'test-key' });
    await expect(client.removeTag('c1', 'old-tag')).resolves.toBeUndefined();
  });
});

describe('GoHighLevelClient — addFunWheelTags', () => {
  it('adds funwheel-lead, client-slug, and stage tags', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const client = new GoHighLevelClient({ apiKey: 'test-key' });
    await client.addFunWheelTags('c1', { clientSlug: 'acme', stage: 'retencao' });

    // 3 addTag calls (one per tag)
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const bodies = fetchMock.mock.calls.map((call: unknown[]) =>
      JSON.parse((call[1] as RequestInit).body as string) as { tags: string[] },
    );
    const allTags = bodies.flatMap(b => b.tags);
    expect(allTags).toContain('funwheel-lead');
    expect(allTags).toContain('client-acme');
    expect(allTags).toContain('stage-retencao');
  });
});
