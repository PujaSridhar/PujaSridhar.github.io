import { describe, expect, it } from 'vitest';
import { portfolioData } from '../../portfolio-data.js';
import { describeDownload, engineFallbackAnswer, loadOwnModel, OWN_MODEL_ID } from './cogsworthLocal.js';

describe('cogsworthLocal', () => {
  it('answers from the engine when the server is unreachable', async () => {
    const text = await engineFallbackAnswer('How can I contact Puja?');
    expect(text).toContain(portfolioData.contact.email);
  });

  it('reports model download progress only for the weights file', () => {
    expect(describeDownload({ status: 'progress', file: 'onnx/model_quantized.onnx', loaded: 250e6, total: 497e6, progress: 50.3 }))
      .toBe("Downloading Puja's model: 250 / 497 MB (50%)");
    expect(describeDownload({ status: 'progress', file: 'tokenizer.json', loaded: 1, total: 2, progress: 50 })).toBeNull();
    expect(describeDownload({ status: 'done', file: 'onnx/model_quantized.onnx' })).toBeNull();
  });

  it('refuses to load a model that is not published', async () => {
    if (OWN_MODEL_ID) return;
    await expect(loadOwnModel()).rejects.toThrow(/not published/);
  });
});
