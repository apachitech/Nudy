export type GenerationType = "IMAGE" | "VIDEO";
export type StylePreset = "realistic" | "anime" | "3d" | "illustration";
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface ImageGenParams {
  prompt: string;
  negativePrompt?: string;
  stylePreset: StylePreset;
  aspectRatio: AspectRatio;
  seed: number;
  numOutputs: number;
  resolution?: string;
  characterReferenceAssetUrl?: string;
  characterAttributes?: {
    apparentAge: number;
    gender: string;
    hair: string;
    eyes: string;
    bodyType: string;
  };
}

export interface VideoGenParams extends ImageGenParams {
  videoDuration: number; // e.g. 3.0, 5.0 seconds
  motionStrength: number; // 0.1 to 1.0
  sourceImageUrl?: string;
}

export interface GeneratedAssetOutput {
  url: string;
  storageKey: string;
  mimeType: string;
  width: number;
  height: number;
  duration?: number;
  fileSizeBytes: number;
  sha256Hash?: string;
}

export interface GenerationResult {
  jobId: string;
  providerJobId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  outputs: GeneratedAssetOutput[];
  error?: string;
}

export interface JobStatusResult {
  providerJobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number; // 0 - 100
  stepDescription?: string;
  outputs?: GeneratedAssetOutput[];
  error?: string;
}

