import {
  IGenerationProvider,
} from "./index";
import {
  ImageGenParams,
  VideoGenParams,
  GenerationResult,
  JobStatusResult,
  GeneratedAssetOutput,
} from "../types";

const MOCK_PRESET_IMAGES: Record<string, string[]> = {
  realistic: [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=80",
  ],
  anime: [
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80",
  ],
  "3d": [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80",
  ],
  illustration: [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80",
  ],
};

const MOCK_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-light-39875-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-posing-for-the-camera-in-a-studio-39878-large.mp4",
];

export class MockGenerationProvider implements IGenerationProvider {
  name = "mock";

  async generateImage(params: ImageGenParams): Promise<GenerationResult> {
    const providerJobId = `mock_img_job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const pool = MOCK_PRESET_IMAGES[params.stylePreset] || MOCK_PRESET_IMAGES.realistic;
    const outputs: GeneratedAssetOutput[] = [];

    const num = Math.min(Math.max(params.numOutputs || 1, 1), 4);
    for (let i = 0; i < num; i++) {
      const imgUrl = pool[(params.seed + i) % pool.length];
      outputs.push({
        url: imgUrl,
        storageKey: `mock/generations/${providerJobId}_${i}.jpg`,
        mimeType: "image/jpeg",
        width: 1024,
        height: 1024,
        fileSizeBytes: 1350000 + i * 10000,
        sha256Hash: `mock_sha256_${providerJobId}_${i}`,
      });
    }

    return {
      jobId: providerJobId,
      providerJobId,
      status: "COMPLETED",
      outputs,
    };
  }

  async generateVideo(params: VideoGenParams): Promise<GenerationResult> {
    const providerJobId = `mock_vid_job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const videoUrl = MOCK_VIDEOS[params.seed % MOCK_VIDEOS.length];

    const outputs: GeneratedAssetOutput[] = [
      {
        url: videoUrl,
        storageKey: `mock/videos/${providerJobId}.mp4`,
        mimeType: "video/mp4",
        width: 1280,
        height: 720,
        duration: params.videoDuration || 4.0,
        fileSizeBytes: 5800000,
        sha256Hash: `mock_vid_hash_${providerJobId}`,
      },
    ];

    return {
      jobId: providerJobId,
      providerJobId,
      status: "COMPLETED",
      outputs,
    };
  }

  async checkJobStatus(providerJobId: string): Promise<JobStatusResult> {
    return {
      providerJobId,
      status: "COMPLETED",
      progress: 100,
      stepDescription: "Generation completed",
    };
  }
}
