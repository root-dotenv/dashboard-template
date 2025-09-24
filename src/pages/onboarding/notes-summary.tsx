// - - - src/pages/onboarding/notes-summary.tsx
import React from "react";
import { FaRegLightbulb } from "react-icons/fa";

interface NotesSummaryProps {
  title: string;
  children: React.ReactNode;
}

export const NotesSummary: React.FC<NotesSummaryProps> = ({
  title,
  children,
}) => {
  return (
    <div className="p-4 flex gap-x-4 items-start bg-[#EAF3FF] mt-4 rounded-md border border-[#bfd8f9]">
      <div>
        <FaRegLightbulb className="my-1.5" color="#186AC9" size={20} />
      </div>
      <div>
        <h2 className="text-[0.9375rem] inter font-semibold text-gray-900">
          {title}
        </h2>
        <div className="text-[0.9375rem] font-semibold text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};
