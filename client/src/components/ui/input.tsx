import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    const [value, setValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);
    const handleClear = () => {
      setValue("");
      setIsFocused(false);
      if (ref && typeof ref === "function") {
        ref(null); // reset the ref
      } else if (ref && "current" in ref) {
        ref.current?.blur();
      }
    };

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", // focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            className
          )}
          ref={ref}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        {isFocused && value && (
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
