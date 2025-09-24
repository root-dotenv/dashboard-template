// import * as React from "react";

// import { cn } from "@/lib/utils";

// function Input({ className, type, ...props }: React.ComponentProps<"input">) {
//   return (
//     <input
//       type={type}
//       data-slot="input"
//       className={cn(
//         "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:ring-blue-500 focus:border-blue-600",
//         "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus:ring-blue-500 focus:border-blue-600",
//         "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus:ring-blue-500 focus:border-blue-600",
//         className
//       )}
//       {...props}
//     />
//   );
// }

// export { Input };

// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

// --- FIX 1: Used Omit to resolve the 'prefix' prop type conflict ---
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefix, ...props }, ref) => {
    return (
      <div
        className={cn(
          // --- STYLES FOR THE WRAPPER ---
          "flex h-11 w-full items-center rounded-md border-[1.125px] border-input shadow-xs transition-colors",
          "focus-within:border-blue-600 focus-within:ring-[1px] focus-within:ring-blue-600",
          "aria-[invalid=true]:border-destructive",
          "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
          className
        )}
      >
        {prefix && (
          <div className="flex h-full items-center border-r border-input bg-transparent px-3">
            <span className="text-sm text-slate-500">{prefix}</span>
          </div>
        )}
        <input
          type={type}
          className={cn(
            "h-full w-full min-w-0 flex-1 rounded-md bg-transparent px-3 py-1 text-base outline-none",
            "placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm",
            "border-none ring-0 focus:ring-0 focus:border-none"
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
