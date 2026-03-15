/**
 * GoogleDriveClient Tests — Story 4.4
 * AC-6: content package mock → upload → verify folder structure
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleDriveClient } from '../google-drive-client.js';

// Minimal fake service account JSON (base64 encoded)
function makeFakeConfig(): string {
  const sa = {
    client_email: 'test@project.iam.gserviceaccount.com',
    private_key: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----\n',
  };
  return Buffer.from(JSON.stringify(sa)).toString('base64');
}

describe('GoogleDriveClient — constructor', () => {
  it('reads GOOGLE_SERVICE_ACCOUNT_JSON from env when no config provided', () => {
    const encoded = makeFakeConfig();
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = encoded;
    const client = new GoogleDriveClient();
    // No throw means config was loaded
    expect(client).toBeInstanceOf(GoogleDriveClient);
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  });

  it('accepts serviceAccountJson directly in config', () => {
    const client = new GoogleDriveClient({ serviceAccountJson: makeFakeConfig() });
    expect(client).toBeInstanceOf(GoogleDriveClient);
  });
});

describe('GoogleDriveClient — listFiles', () => {
  it('throws when serviceAccountJson is not configured', async () => {
    const client = new GoogleDriveClient({ serviceAccountJson: '' });
    await expect(client.listFiles('folder-id')).rejects.toThrow('GOOGLE_SERVICE_ACCOUNT_JSON');
  });
});

describe('GoogleDriveClient — uploadFile', () => {
  it('throws when serviceAccountJson is not configured', async () => {
    const client = new GoogleDriveClient({ serviceAccountJson: '' });
    await expect(
      client.uploadFile('folder-id', 'test.txt', 'content', 'text/plain'),
    ).rejects.toThrow('GOOGLE_SERVICE_ACCOUNT_JSON');
  });
});

describe('GoogleDriveClient — createFolder', () => {
  it('throws when serviceAccountJson is not configured', async () => {
    const client = new GoogleDriveClient({ serviceAccountJson: '' });
    await expect(client.createFolder('parent-id', 'My Folder')).rejects.toThrow(
      'GOOGLE_SERVICE_ACCOUNT_JSON',
    );
  });
});

describe('GoogleDriveClient — shareWithEmail', () => {
  it('throws when serviceAccountJson is not configured', async () => {
    const client = new GoogleDriveClient({ serviceAccountJson: '' });
    await expect(
      client.shareWithEmail('file-id', 'client@example.com', 'reader'),
    ).rejects.toThrow('GOOGLE_SERVICE_ACCOUNT_JSON');
  });
});

describe('GoogleDriveClient — getDownloadUrl', () => {
  it('returns correct Google Drive download URL', () => {
    const client = new GoogleDriveClient({ serviceAccountJson: makeFakeConfig() });
    const url = client.getDownloadUrl('abc123');
    expect(url).toBe('https://drive.google.com/uc?export=view&id=abc123');
  });
});

describe('GoogleDriveClient — API integration (fetch + getAccessToken mocked)', () => {
  const serviceAccountJson = makeFakeConfig();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function stubAccessToken(client: GoogleDriveClient): void {
    // Stub the private getAccessToken to avoid RSA signing with a fake key
    vi.spyOn(client as unknown as { getAccessToken: () => Promise<string> }, 'getAccessToken')
      .mockResolvedValue('fake-access-token');
  }

  it('listFiles returns array from Drive API response', async () => {
    const mockFiles = [
      { id: 'file1', name: 'image1.png', mimeType: 'image/png' },
      { id: 'file2', name: 'image2.jpg', mimeType: 'image/jpeg' },
    ];

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files: mockFiles }),
    } as Response));

    const client = new GoogleDriveClient({ serviceAccountJson });
    stubAccessToken(client);
    const files = await client.listFiles('folder-id');

    expect(files).toHaveLength(2);
    expect(files[0].name).toBe('image1.png');
  });

  it('uploadFile returns DriveFile from API', async () => {
    const createdFile = { id: 'new-file-id', name: 'post.txt', mimeType: 'text/plain', webViewLink: 'https://drive.google.com/file/d/new-file-id' };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => createdFile,
    } as Response));

    const client = new GoogleDriveClient({ serviceAccountJson });
    stubAccessToken(client);
    const result = await client.uploadFile('folder-id', 'post.txt', 'Hello World', 'text/plain');

    expect(result.id).toBe('new-file-id');
    expect(result.name).toBe('post.txt');
  });

  it('createFolder returns DriveFile with folder mimeType', async () => {
    const createdFolder = {
      id: 'folder-id-new',
      name: 'carrosseis',
      mimeType: 'application/vnd.google-apps.folder',
      webViewLink: 'https://drive.google.com/drive/folders/folder-id-new',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => createdFolder,
    } as Response));

    const client = new GoogleDriveClient({ serviceAccountJson });
    stubAccessToken(client);
    const result = await client.createFolder('parent-id', 'carrosseis');

    expect(result.mimeType).toBe('application/vnd.google-apps.folder');
    expect(result.name).toBe('carrosseis');
  });

  it('shareWithEmail completes without error on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'permission-id' }),
    } as Response));

    const client = new GoogleDriveClient({ serviceAccountJson });
    stubAccessToken(client);
    await expect(
      client.shareWithEmail('file-id', 'client@example.com', 'reader'),
    ).resolves.toBeUndefined();
  });

  it('shareWithEmail throws on API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Insufficient permissions',
    } as Response));

    const client = new GoogleDriveClient({ serviceAccountJson });
    stubAccessToken(client);
    await expect(
      client.shareWithEmail('file-id', 'client@example.com', 'writer'),
    ).rejects.toThrow('403');
  });

  it('uploadFile throws on API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Bad Request',
    } as Response));

    const client = new GoogleDriveClient({ serviceAccountJson });
    stubAccessToken(client);
    await expect(
      client.uploadFile('folder-id', 'test.txt', 'content', 'text/plain'),
    ).rejects.toThrow('400');
  });
});
