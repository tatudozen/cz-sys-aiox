/**
 * GoHighLevel (GHL) CRM Client
 * Story 5.3 — AC-2
 *
 * Uses GHL REST API v1 for contact management.
 * Auth: Bearer token via GHL_API_KEY env var.
 * Docs: https://highlevel.stoplight.io/docs/integrations
 */

const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1';

export interface GHLContact {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customField?: Array<{ id: string; field_value: string }>;
  locationId?: string;
  source?: string;
}

export interface GHLContactResponse {
  contact: GHLContact & { id: string };
}

export interface GHLConfig {
  apiKey: string;
  locationId?: string;
}

export class GoHighLevelClient {
  private readonly apiKey: string;
  private readonly locationId?: string;

  constructor(config?: Partial<GHLConfig>) {
    this.apiKey = config?.apiKey ?? process.env.GHL_API_KEY ?? '';
    this.locationId = config?.locationId ?? process.env.GHL_LOCATION_ID;
  }

  /**
   * Create or update a contact in GHL CRM.
   * GHL automatically deduplicates by email.
   */
  async createContact(contact: GHLContact): Promise<GHLContactResponse> {
    if (!this.apiKey) {
      throw new Error('GHL_API_KEY is not configured');
    }

    const payload: GHLContact = {
      ...contact,
      ...(this.locationId ? { locationId: this.locationId } : {}),
      source: contact.source ?? 'funwheel',
    };

    const response = await fetch(`${GHL_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GoHighLevel API error ${response.status}: ${error}`);
    }

    return (await response.json()) as GHLContactResponse;
  }

  /**
   * Add a tag to an existing contact.
   */
  async addTag(contactId: string, tag: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('GHL_API_KEY is not configured');
    }

    const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
      body: JSON.stringify({ tags: [tag] }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GoHighLevel addTag error ${response.status}: ${error}`);
    }
  }

  /**
   * Trigger a GoHighLevel automation/workflow for a contact.
   * workflowId: The GHL workflow ID to trigger.
   */
  async triggerWorkflow(contactId: string, workflowId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('GHL_API_KEY is not configured');
    }

    const response = await fetch(
      `${GHL_BASE_URL}/contacts/${contactId}/workflow/${workflowId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GoHighLevel triggerWorkflow error ${response.status}: ${error}`);
    }
  }
}
