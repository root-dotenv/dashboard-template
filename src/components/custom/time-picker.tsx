// src/components/ui/time-picker.tsx
import React from "react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const selectStyles =
  "bg-background text-foreground border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [hour, minute] = value ? value.split(":") : ["14", "00"];

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value}:${minute}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${hour}:${e.target.value}`);
  };

  // Generate options for hours (00-23) and minutes (00, 15, 30, 45)
  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minuteOptions = ["00", "15", "30", "45"];

  return (
    <div className="flex items-center gap-2">
      <select value={hour} onChange={handleHourChange} className={selectStyles}>
        {hourOptions.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span>:</span>
      <select
        value={minute}
        onChange={handleMinuteChange}
        className={selectStyles}
      >
        {minuteOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
};
