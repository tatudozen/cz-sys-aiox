/**
 * PDF Generator Tests — Story 5.3
 * AC-4: generate lead magnet PDF → validate output structure
 */

import { describe, it, expect, vi } from 'vitest';
import { PdfGenerator } from '../pdf-generator.js';
import type { StorageClient } from '../../image-generation/types.js';

function createMockStorageClient(): StorageClient {
  return {
    from: (_bucket: string) => ({
      upload: vi.fn().mockResolvedValue({
        data: { path: 'pdfs/lead-magnet.pdf' },
        error: null,
      }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://storage.test/assets/pdfs/lead-magnet.pdf' },
      }),
    }),
  };
}

const sampleContent = {
  title: 'Guia de Marketing Digital',
  subtitle: '5 Estratégias para Multiplicar seus Clientes',
  sections: [
    { heading: 'Estratégia 1: Posicionamento', body: 'Defina claramente quem você serve e qual problema resolve.' },
    { heading: 'Estratégia 2: Copywriting', body: 'Escreva mensagens que conectam com a dor real do seu público.' },
  ],
  footer: '© 2026 CopyZen. Todos os direitos reservados.',
};

describe('PdfGenerator — generate', () => {
  it('returns storage_url, file_size_bytes, filename on success', async () => {
    const storageClient = createMockStorageClient();
    const generator = new PdfGenerator({ storageClient });

    const result = await generator.generate(sampleContent);

    expect(result.storage_url).toContain('https://');
    expect(result.file_size_bytes).toBeGreaterThan(0);
    expect(result.filename).toContain('.pdf');
  });

  it('uses provided filename when specified', async () => {
    const storageClient = createMockStorageClient();
    const generator = new PdfGenerator({ storageClient });

    const result = await generator.generate(sampleContent, {}, 'my-guide.pdf');

    expect(result.filename).toBe('my-guide.pdf');
  });

  it('throws when Supabase Storage upload fails', async () => {
    const storageClient: StorageClient = {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: { message: 'Upload failed' } }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
      }),
    };

    const generator = new PdfGenerator({ storageClient });
    await expect(generator.generate(sampleContent)).rejects.toThrow('Supabase Storage');
  });

  it('generates PDF with custom brand config', async () => {
    const storageClient = createMockStorageClient();
    const generator = new PdfGenerator({ storageClient });

    const brand = {
      primary_color: '#7c3aed',
      secondary_color: '#f59e0b',
      company_name: 'Acme Corp',
    };

    const result = await generator.generate(sampleContent, brand);
    expect(result.file_size_bytes).toBeGreaterThan(1000);
  });

  it('generates PDF with no subtitle', async () => {
    const storageClient = createMockStorageClient();
    const generator = new PdfGenerator({ storageClient });

    const contentNoSub = { ...sampleContent, subtitle: undefined };
    const result = await generator.generate(contentNoSub);
    expect(result.file_size_bytes).toBeGreaterThan(0);
  });

  it('uses custom storagePath from config', async () => {
    const uploadMock = vi.fn().mockResolvedValue({ data: { path: 'docs/test.pdf' }, error: null });
    const storageClient: StorageClient = {
      from: () => ({
        upload: uploadMock,
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test/docs/test.pdf' } }),
      }),
    };

    const generator = new PdfGenerator({ storageClient, storagePath: 'docs' });
    await generator.generate(sampleContent, {}, 'test.pdf');

    expect(uploadMock).toHaveBeenCalledWith(
      'docs/test.pdf',
      expect.any(Buffer),
      expect.objectContaining({ contentType: 'application/pdf' }),
    );
  });
});
