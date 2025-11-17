import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleDecrement = () => {
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    };

    const handleIncrement = () => {
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value) || min;
      onChange(Math.max(min, Math.min(max, newValue)));
    };

    return (
      <div className={cn("inline-flex items-stretch rounded-md border border-input bg-background shadow-sm", className)}>
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="flex-1 bg-transparent px-2 py-1 text-center text-sm font-medium focus-visible:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...props}
        />
        <div className="flex flex-col border-l border-input bg-background">
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className="flex h-1/2 w-6 items-center justify-center border-b border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="flex h-1/2 w-6 items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
