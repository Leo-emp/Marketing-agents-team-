import type { ReelSceneData, MusicMood } from "../lib/visual/types";

export interface ReelCompositionProps {
  scenes: ReelSceneData[];
  /* # Audio tracks */
  voiceoverUrl?: string;
  musicUrl?: string;
  musicMood?: MusicMood;
}
