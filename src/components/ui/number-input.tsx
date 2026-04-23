import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function getModifierMultiplier(event: React.MouseEvent | React.KeyboardEvent) {
  const ctrl = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;
  if (ctrl && shift) return 1000;
  if (shift) return 100;
  if (ctrl) return 10;
  return 1;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const { t } = useTranslation();
    const modifierHint = t("number_input.modifier_hint");
    const incrementLabel = t("number_input.increment");
    const decrementLabel = t("number_input.decrement");
    const handleDecrement = (event: React.MouseEvent<HTMLButtonElement>) => {
      const delta = step * getModifierMultiplier(event);
      onChange(Math.max(min, value - delta));
    };

    const handleIncrement = (event: React.MouseEvent<HTMLButtonElement>) => {
      const delta = step * getModifierMultiplier(event);
      onChange(Math.min(max, value + delta));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value) || min;
      onChange(Math.max(min, Math.min(max, newValue)));
    };

    return (
      <div
        className={cn(
          "surface-subtle inline-flex min-h-11 items-stretch overflow-hidden rounded-[1.1rem] border border-input/70 bg-background/88",
          className,
        )}
      >
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-center text-sm font-semibold tabular-nums focus-visible:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...props}
        />
        <div className="flex flex-col border-l border-input/70 bg-background/75">
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            title={modifierHint}
            aria-label={incrementLabel}
            className="flex h-1/2 min-h-[22px] w-9 items-center justify-center border-b border-input/70 transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-muted active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            title={modifierHint}
            aria-label={decrementLabel}
            className="flex h-1/2 min-h-[22px] w-9 items-center justify-center transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-muted active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
          >
            <Minus className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
