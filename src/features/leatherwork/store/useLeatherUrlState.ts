import { useShallow } from "zustand/shallow";
import { useLeatherStore } from "@/features/leatherwork/store/useLeatherStore";

export function useLeatherUrlState() {
  return useLeatherStore(
    useShallow((state) => ({
      workflow: state.workflow,
      mode: state.mode,
      size: state.size,
      animalVariant: state.animalVariant,
      bearVariant: state.bearVariant,
      hideCount: state.hideCount,
      targetLeather: state.targetLeather,
      solvent: state.solvent,
      hydrateFromLocation: state.hydrateFromLocation,
    })),
  );
}
