/**
 * Kling AI Image Provider (Kuaishou)
 * Story 4.3 — AC-1, Task 3
 *
 * Kling AI API: https://api.klingai.com (image generation)
 * Auth: Bearer token via KLING_AI_API_KEY
 * Model: kling-v1 (standard) / kling-v1-5 (pro)
 */

import type { ImageGenerator, ImageOptions, ImageResult, StorageClient } from '../types.js';

const KLING_AI_BASE_URL = 'https://api.klingai.com';

const ASPECT_RATIO_STRINGS: Record<string, string> = {
  '1:1': '1:1',
  '4:5': '4:5',
  '16:9': '16:9',
  '9:16': '9:16',
};

const ASPECT_RATIO_SIZES: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '4:5': { width: 1024, height: 1280 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
};

export class KlingAIProvider implements ImageGenerator {
  readonly providerName = 'kling-ai';

  constructor(
    private readonly apiKey: string,
    private readonly storageClient: StorageClient,
    private readonly storageBasePath: string = 'images',
    private readonly model: 'kling-v1' | 'kling-v1-5' = 'kling-v1',
  ) {}

  async generate(prompt: string, options: ImageOptions = {}): Promise<ImageResult> {
    const aspectRatio = ASPECT_RATIO_STRINGS[options.aspect_ratio ?? '1:1'];
    const sizes = ASPECT_RATIO_SIZES[options.aspect_ratio ?? '1:1'];

    // Step 1: Submit image generation task
    const submitResponse = await fetch(`${KLING_AI_BASE_URL}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        negative_prompt: options.negative_prompt ?? 'watermark, text, blurry, low quality',
        aspect_ratio: aspectRatio,
        n: 1,
        ...(options.reference_image_url ? { image: options.reference_image_url } : {}),
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      throw new Error(`Kling AI API error ${submitResponse.status}: ${errorText}`);
    }

    const submitData = (await submitResponse.json()) as {
      code: number;
      message: string;
      data: { task_id: string; task_status: string };
    };

    if (submitData.code !== 0) {
      throw new Error(`Kling AI submission error: ${submitData.message}`);
    }

    const taskId = submitData.data.task_id;

    // Step 2: Poll for task completion
    const imageUrl = await this.pollForCompletion(taskId);

    // Step 3: Download and upload to Supabase Storage
    const storageUrl = await this.downloadToStorage(imageUrl, taskId, options);

    return {
      provider_url: imageUrl,
      storage_url: storageUrl,
      width: sizes.width,
      height: sizes.height,
      generation_id: taskId,
    };
  }

  private async pollForCompletion(taskId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay for Kling AI

      const statusResponse = await fetch(
        `${KLING_AI_BASE_URL}/v1/images/generations/${taskId}`,
        { headers: { 'Authorization': `Bearer ${this.apiKey}` } },
      );

      if (!statusResponse.ok) continue;

      const statusData = (await statusResponse.json()) as {
        code: number;
        data: {
          task_status: 'submitted' | 'processing' | 'succeed' | 'failed';
          task_result?: { images: Array<{ url: string }> };
        };
      };

      if (statusData.data.task_status === 'succeed') {
        const images = statusData.data.task_result?.images;
        if (images && images.length > 0 && images[0].url) {
          return images[0].url;
        }
      }

      if (statusData.data.task_status === 'failed') {
        throw new Error(`Kling AI generation failed for task: ${taskId}`);
      }
    }

    throw new Error(`Kling AI generation timed out for task: ${taskId}`);
  }

  private async downloadToStorage(
    imageUrl: string,
    taskId: string,
    _options: ImageOptions,
  ): Promise<string> {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from Kling AI: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const filename = `${taskId}.png`;
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
