/**
 * Google Drive Client — Basic Integration
 * Story 3.5 — AC-5: List reference images from client folders
 *
 * Auth: Service account JSON via GOOGLE_SERVICE_ACCOUNT_JSON (base64 encoded)
 * Scope: https://www.googleapis.com/auth/drive.readonly
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface GoogleDriveConfig {
  serviceAccountJson: string; // base64 encoded service account JSON
  folderId?: string;
}

/**
 * Minimal Google Drive client using the REST API directly.
 * Avoids the googleapis SDK to keep bundle size minimal.
 */
export class GoogleDriveClient {
  private readonly config: GoogleDriveConfig;

  constructor(config?: Partial<GoogleDriveConfig>) {
    const serviceAccountJson =
      config?.serviceAccountJson ??
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON ??
      '';

    this.config = {
      serviceAccountJson,
      folderId: config?.folderId,
    };
  }

  /**
   * List image files in a Google Drive folder.
   * Returns files matching image MIME types.
   */
  async listFiles(folderId: string): Promise<DriveFile[]> {
    if (!this.config.serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not configured');
    }

    const token = await this.getAccessToken();
    const query = encodeURIComponent(
      `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    );

    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,thumbnailLink)&pageSize=50`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Drive API error: ${response.status} ${error}`);
    }

    const data = (await response.json()) as { files: DriveFile[] };
    return data.files ?? [];
  }

  /**
   * Get public download URL for a file.
   */
  getDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  /**
   * Obtain OAuth2 access token using service account credentials.
   * Uses JWT flow for service account authentication.
   */
  private async getAccessToken(): Promise<string> {
    const credentialsJson = Buffer.from(this.config.serviceAccountJson, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson) as {
      client_email: string;
      private_key: string;
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const jwt = await this.signJwt(credentials.private_key, payload);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to obtain Google access token: ${tokenResponse.status}`);
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };
    return tokenData.access_token;
  }

  /**
   * Sign a JWT using the service account private key.
   * Uses Web Crypto API (Node.js 18+).
   */
  private async signJwt(privateKeyPem: string, payload: Record<string, unknown>): Promise<string> {
    const { createSign } = await import('node:crypto');

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signingInput = `${header}.${body}`;

    const sign = createSign('RSA-SHA256');
    sign.update(signingInput);
    const signature = sign.sign(privateKeyPem, 'base64url');

    return `${signingInput}.${signature}`;
  }
}
