export type MetalId =
  | "copper"
  | "tin"
  | "zinc"
  | "bismuth"
  | "gold"
  | "silver"
  | "lead"
  | "nickel";

export interface Metal {
  id: MetalId;
  color: string;
  nuggetImage: string;
}

export interface AlloyComponent {
  metalId: MetalId;
  minPercent: number;
  maxPercent: number;
}

export interface AlloyRecipe {
  id: string;
  description?: string;
  components: AlloyComponent[];
  meltTempC?: number;
}
