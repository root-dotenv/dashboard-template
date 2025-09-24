// --- src/components/ui/feature-selection-sheet.tsx ---
"use client";
import {
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
}

interface FeatureSelectionSheetProps {
  title: string;
  description: string;
  items: Item[];
  selectedIds: Set<string>;
  onSelectionChange: (id: string, isSelected: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function FeatureSelectionSheet({
  title,
  description,
  items = [],
  selectedIds,
  onSelectionChange,
  onSave,
  isSaving,
}: FeatureSelectionSheetProps) {
  const handleSelectAll = (isChecked: boolean) => {
    items.forEach((item) => onSelectionChange(item.id, isChecked));
  };

  const areAllSelected = items.length > 0 && selectedIds.size === items.length;

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-b-[#1D2939]">
        <SheetTitle className="text-xl font-bold text-gray-900 dark:text-[#D0D5DD]">
          {title}
        </SheetTitle>
        <SheetDescription>{description}</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
          <Checkbox
            id="select-all"
            checked={areAllSelected}
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
            className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
          />
          <Label
            htmlFor="select-all"
            className="font-semibold text-sm dark:text-gray-300 cursor-pointer"
          >
            Select All
          </Label>
        </div>
        <Separator className="my-4 dark:bg-[#1D2939]" />
        <ScrollArea
          className="h-full pr-4"
          style={{ height: "calc(100vh - 250px)" }}
        >
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <Checkbox
                  id={item.id}
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={(isChecked) =>
                    onSelectionChange(item.id, !!isChecked)
                  }
                  className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <Label
                  htmlFor={item.id}
                  className="w-full font-normal dark:text-gray-300 cursor-pointer"
                >
                  {item.name}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <SheetFooter className="px-6 py-4 border-t bg-white dark:bg-[#101828] dark:border-t-[#1D2939]">
        <SheetClose asChild>
          <Button
            type="button"
            variant="outline"
            className="dark:bg-transparent dark:border-[#1D2939] dark:hover:bg-[#1C2433]"
          >
            Cancel
          </Button>
        </SheetClose>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 transition-all"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Hotel
        </Button>
      </SheetFooter>
    </div>
  );
}
