import React from "react";
import type {
  Amenity,
  Facility,
  Hotel,
  MealType,
  Service,
  Theme,
  Translation,
  Region,
} from "./hotel";
import { MultiSelectInput } from "./shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiAlertTriangle } from "react-icons/fi";

interface FeaturesProps {
  editData: Partial<Hotel>;
  handleArrayFieldChange: (field: keyof Hotel, value: string[]) => void;
  themes: Theme[];
  mealTypes: MealType[];
  amenities: Amenity[];
  services: Service[];
  facilities: Facility[];
  translations: Translation[];
  regions: Region[];
}

const FeaturesSection: React.FC<FeaturesProps> = ({
  editData,
  handleArrayFieldChange,
  themes,
  mealTypes,
  amenities,
  services,
  facilities,
  translations,
  regions,
}) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-1">
      Features & Services
    </h2>
    <p className="text-gray-600 mb-6">
      Select all the features that apply to your hotel to improve guest search
      results.
    </p>
    <Alert
      className="mb-6 bg-yellow-100 text-yellow-800 border-yellow-200"
      variant={"default"}
    >
      <AlertTitle className="text-[1rem] flex items-center gap-x-1.5">
        <FiAlertTriangle /> Note
      </AlertTitle>
      <AlertDescription className="text-yellow-800 text-[0.9375rem]">
        Please ensure that you add at least one theme, meal type, amenity,
        service, facility, region, and translation to your hotel. This is
        essential for the proper functioning of the hotel listing.
      </AlertDescription>
    </Alert>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
      <MultiSelectInput
        label="Themes"
        value={editData.themes || []}
        onChange={(v) => handleArrayFieldChange("themes", v)}
        options={themes.map((item) => ({ value: item.id, label: item.name }))}
        placeholder="Add themes..."
      />
      <MultiSelectInput
        label="Meal Types"
        value={editData.meal_types || []}
        onChange={(v) => handleArrayFieldChange("meal_types", v)}
        options={mealTypes.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        placeholder="Add meal types..."
      />
      <MultiSelectInput
        label="Amenities"
        value={editData.amenities || []}
        onChange={(v) => handleArrayFieldChange("amenities", v)}
        options={amenities.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        placeholder="Add amenities..."
      />
      <MultiSelectInput
        label="Services"
        value={editData.services || []}
        onChange={(v) => handleArrayFieldChange("services", v)}
        options={services.map((item) => ({ value: item.id, label: item.name }))}
        placeholder="Add services..."
      />
      <MultiSelectInput
        label="Facilities"
        value={editData.facilities || []}
        onChange={(v) => handleArrayFieldChange("facilities", v)}
        options={facilities.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        placeholder="Add facilities..."
      />
      <MultiSelectInput
        label="Regions"
        value={editData.regions || []}
        onChange={(v) => handleArrayFieldChange("regions", v)}
        options={regions.map((item) => ({ value: item.id, label: item.name }))}
        placeholder="Add regions..."
      />
      <MultiSelectInput
        label="Translations"
        value={editData.translations || []}
        onChange={(v) => handleArrayFieldChange("translations", v)}
        options={translations.map((item) => ({
          value: item.id,
          label: item.language,
        }))}
        placeholder="Add translations..."
      />
    </div>
  </div>
);

export default FeaturesSection;
