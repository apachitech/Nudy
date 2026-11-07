import {
  ImageGenParams,
  VideoGenParams,
  GenerationResult,
  JobStatusResult,
} from "../types";

export interface IGenerationProvider {
  name: string;
  generateImage(params: ImageGenParams): Promise<GenerationResult>;
  generateVideo(params: VideoGenParams): Promise<GenerationResult>;
  checkJobStatus(providerJobId: string): Promise<JobStatusResult>;
}

import { MockGenerationProvider } from "./mockProvider";
import { ComfyUiProvider } from "./comfyUiProvider";
import { GenericRestProvider } from "./genericRestProvider";

export function getGenerationProvider(): IGenerationProvider {
  const provider = (process.env.GENERATION_PROVIDER || "mock").toLowerCase();
  switch (provider) {
    case "comfyui":
      return new ComfyUiProvider();
    case "generic_rest":
      return new GenericRestProvider();
    case "mock":
    default:
      return new MockGenerationProvider();
  }
}
