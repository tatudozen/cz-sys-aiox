/**
 * PDF Generator — Lead Magnet PDF
 * Story 5.3 — AC-4
 *
 * Generates brand-styled PDF from lead magnet content.
 * Uses pdfkit for lightweight PDF generation without headless browser.
 * Uploads to Supabase Storage after generation.
 */

import PDFDocument from 'pdfkit';
import type { StorageClient } from '../image-generation/types.js';

export interface LeadMagnetContent {
  title: string;
  subtitle?: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  footer?: string;
}

export interface PdfBrandConfig {
  primary_color?: string;      // hex e.g. '#08164a'
  secondary_color?: string;    // hex e.g. '#38bafc'
  company_name?: string;
  heading_font?: string;       // pdfkit uses Helvetica family by default
  body_font?: string;
}

export interface PdfGeneratorConfig {
  storageClient: StorageClient;
  storageBucket?: string;
  storagePath?: string;
}

export interface PdfResult {
  storage_url: string;
  file_size_bytes: number;
  filename: string;
}

/**
 * Convert hex color to RGB for pdfkit.
 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b];
}

export class PdfGenerator {
  private readonly storageClient: StorageClient;
  private readonly storageBucket: string;
  private readonly storagePath: string;

  constructor(config: PdfGeneratorConfig) {
    this.storageClient = config.storageClient;
    this.storageBucket = config.storageBucket ?? 'assets';
    this.storagePath = config.storagePath ?? 'pdfs';
  }

  /**
   * Generate a branded lead magnet PDF and upload to Supabase Storage.
   */
  async generate(
    content: LeadMagnetContent,
    brand: PdfBrandConfig = {},
    filename?: string,
  ): Promise<PdfResult> {
    const pdf = await this.buildPdf(content, brand);
    const finalFilename = filename ?? `lead-magnet-${Date.now()}.pdf`;
    const storagePath = `${this.storagePath}/${finalFilename}`;

    const { data, error } = await this.storageClient.from(this.storageBucket).upload(
      storagePath,
      pdf,
      { contentType: 'application/pdf', upsert: true },
    );

    if (error || !data) {
      throw new Error(`Failed to upload PDF to Supabase Storage: ${JSON.stringify(error)}`);
    }

    const { data: urlData } = this.storageClient
      .from(this.storageBucket)
      .getPublicUrl(storagePath);

    return {
      storage_url: urlData.publicUrl,
      file_size_bytes: pdf.byteLength,
      filename: finalFilename,
    };
  }

  /**
   * Build PDF buffer from content + brand config.
   */
  private buildPdf(content: LeadMagnetContent, brand: PdfBrandConfig): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryRgb = hexToRgb(brand.primary_color ?? '#08164a');
      const secondaryRgb = hexToRgb(brand.secondary_color ?? '#38bafc');
      const companyName = brand.company_name ?? 'CopyZen';

      // Header bar
      doc
        .rect(0, 0, doc.page.width, 80)
        .fill(`rgb(${primaryRgb[0]},${primaryRgb[1]},${primaryRgb[2]})`);

      doc
        .fillColor('white')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(companyName.toUpperCase(), 50, 30, { align: 'left' });

      // Title
      doc.moveDown(3);
      doc
        .fillColor(`rgb(${primaryRgb[0]},${primaryRgb[1]},${primaryRgb[2]})`)
        .fontSize(26)
        .font('Helvetica-Bold')
        .text(content.title, { align: 'center' });

      if (content.subtitle) {
        doc
          .moveDown(0.5)
          .fillColor('#555555')
          .fontSize(14)
          .font('Helvetica')
          .text(content.subtitle, { align: 'center' });
      }

      // Divider
      doc.moveDown(1);
      doc
        .strokeColor(`rgb(${secondaryRgb[0]},${secondaryRgb[1]},${secondaryRgb[2]})`)
        .lineWidth(3)
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke();

      // Sections
      for (const section of content.sections) {
        doc.moveDown(1.5);
        doc
          .fillColor(`rgb(${primaryRgb[0]},${primaryRgb[1]},${primaryRgb[2]})`)
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(section.heading);

        doc
          .moveDown(0.5)
          .fillColor('#333333')
          .fontSize(12)
          .font('Helvetica')
          .text(section.body, { lineGap: 4, paragraphGap: 4 });
      }

      // Footer
      const footerY = doc.page.height - 60;
      doc
        .rect(0, footerY, doc.page.width, 60)
        .fill(`rgb(${primaryRgb[0]},${primaryRgb[1]},${primaryRgb[2]})`);

      doc
        .fillColor('white')
        .fontSize(9)
        .font('Helvetica')
        .text(content.footer ?? `© ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.`, 50, footerY + 20, {
          align: 'center',
          width: doc.page.width - 100,
        });

      doc.end();
    });
  }
}
