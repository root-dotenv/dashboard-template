// - - - src/pages/onboarding/form-field.tsx
import React from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  name: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  icon,
  children,
  required,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={name}
          className="flex text-[1rem] items-center gap-2 font-semibold text-slate-700 dark:text-slate-300"
        >
          {icon}
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </Label>
      </div>
      <div className="relative inter text-[0.9375rem]">{children}</div>
    </div>
  );
};
