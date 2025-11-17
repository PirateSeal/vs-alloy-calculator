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
  label: string;
  shortLabel: string;
  color: string;
}

export interface AlloyComponent {
  metalId: MetalId;
  minPercent: number;
  maxPercent: number;
}

export interface AlloyRecipe {
  id: string;
  name: string;
  description?: string;
  components: AlloyComponent[];
  notes?: string;
  meltTempC?: number;
}
