/**
 * Nano Banana Image Provider
 * Story 4.3 — AC-1, Task 2
 *
 * Nano Banana API: https://app.nanobanana.io (image generation)
 * Docs: https://api.nanobanana.io/docs
 * Auth: Bearer token via NANO_BANANA_API_KEY
 */

import type { ImageGenerator, ImageOptions, ImageResult, StorageClient } from '../types.js';

const NANO_BANANA_BASE_URL = 'https://api.nanobanana.io';

const ASPECT_RATIO_SIZES: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '4:5': { width: 1024, height: 1280 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
};

export class NanaBananaProvider implements ImageGenerator {
  readonly providerName = 'nano-banana';

  constructor(
    private readonly apiKey: string,
    private readonly storageClient: StorageClient,
    private readonly storageBasePath: string = 'images',
  ) {}

  async generate(prompt: string, options: ImageOptions = {}): Promise<ImageResult> {
    const sizes = ASPECT_RATIO_SIZES[options.aspect_ratio ?? '1:1'];
    const startTime = Date.now();

    // Step 1: Submit generation request
    const generateResponse = await fetch(`${NANO_BANANA_BASE_URL}/v1/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: options.negative_prompt ?? 'watermark, text, low quality, blurry',
        width: sizes.width,
        height: sizes.height,
        style: options.style_preset ?? 'photorealistic',
        num_inference_steps: options.steps ?? 30,
        seed: options.seed,
        ...(options.reference_image_url ? { reference_image: options.reference_image_url } : {}),
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Nano Banana API error ${generateResponse.status}: ${errorText}`);
    }

    const generateData = (await generateResponse.json()) as {
      id: string;
      status: string;
      image_url?: string;
    };

    // Step 2: Poll for completion (Nano Banana may be async)
    let imageUrl = generateData.image_url;
    const generationId = generateData.id;

    if (!imageUrl) {
      imageUrl = await this.pollForCompletion(generationId);
    }

    // Step 3: Download and upload to Supabase Storage
    const storageUrl = await this.downloadToStorage(imageUrl, generationId, options);

    const latencyMs = Date.now() - startTime;
    void latencyMs; // Used for logging in production

    return {
      provider_url: imageUrl,
      storage_url: storageUrl,
      width: sizes.width,
      height: sizes.height,
      generation_id: generationId,
    };
  }

  private async pollForCompletion(generationId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay

      const statusResponse = await fetch(`${NANO_BANANA_BASE_URL}/v1/generate/${generationId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });

      if (!statusResponse.ok) continue;

      const statusData = (await statusResponse.json()) as {
        status: 'pending' | 'processing' | 'completed' | 'failed';
        image_url?: string;
      };

      if (statusData.status === 'completed' && statusData.image_url) {
        return statusData.image_url;
      }

      if (statusData.status === 'failed') {
        throw new Error(`Nano Banana generation failed for id: ${generationId}`);
      }
    }

    throw new Error(`Nano Banana generation timed out for id: ${generationId}`);
  }

  private async downloadToStorage(
    imageUrl: string,
    generationId: string,
    _options: ImageOptions,
  ): Promise<string> {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from Nano Banana: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const filename = `${generationId}.png`;
    const storagePath = `${this.storageBasePath}/${filename}`;

    const { data, error } = await this.storageClient
      .from('assets')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error || !data) {
      throw new Error(`Failed to upload image to Supabase Storage: ${JSON.stringify(error)}`);
    }

    const { data: urlData } = this.storageClient.from('assets').getPublicUrl(storagePath);
    return urlData.publicUrl;
  }
}
