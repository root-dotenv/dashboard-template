import React from "react";
import type { Hotel } from "./hotel";
import { FormField } from "./shared";
import { TimePicker } from "@/components/custom/time-picker";

interface BasicInfoProps {
  editData: Partial<Hotel>;
  handleFieldChange: (field: keyof Hotel, value: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoProps> = ({
  editData,
  handleFieldChange,
}) => {
  const handleRatingChange = (value: string) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      numValue = 0;
    }
    if (numValue > 5) numValue = 5;
    if (numValue < 1) numValue = 1;
    handleFieldChange("star_rating", numValue);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Basic Information
      </h2>
      <p className="text-gray-600 mb-6">
        Update your hotel's name, star rating, and other core details.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <FormField
          label="Hotel Name"
          value={editData.name || ""}
          onChange={(v) => handleFieldChange("name", v)}
          placeholder="Enter hotel name"
        />
        <FormField
          label="Hotel Star Rating (1-5)"
          type="number"
          value={editData.star_rating || ""}
          onChange={handleRatingChange}
          placeholder="e.g., 5"
        />
      </div>
      <FormField
        label="Hotel Description (At least 100 characters)"
        type="textarea"
        value={editData.description || ""}
        onChange={(v) => handleFieldChange("description", v)}
        placeholder="Enter a description for the hotel"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in From (Hours:Minutes)
          </label>
          <TimePicker
            value={editData.check_in_from || "06:00"}
            onChange={(v) => handleFieldChange("check_in_from", v)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out Until (Hours:Minutes)
          </label>
          <TimePicker
            value={editData.check_out_to || "11:00"}
            onChange={(v) => handleFieldChange("check_out_to", v)}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
