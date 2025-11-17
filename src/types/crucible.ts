import type { MetalId } from "./alloys";

export interface CrucibleSlot {
  id: number;
  metalId: MetalId | null;
  nuggets: number;
}

export interface CrucibleState {
  slots: CrucibleSlot[];
}
