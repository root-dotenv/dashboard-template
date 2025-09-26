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
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const handleSaveClick = () => {
    if (selectedIds.size === 0) {
      toast.warning("You must select at least one feature.", {
        description:
          "Your hotel needs to have at least one option available in this category.",
      });
      return;
    }
    onSave();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#101828]">
      <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-b-[#1D2939]">
        <SheetTitle className="text-2xl font-bold text-[#1D2939] dark:text-[#D0D5DD]">
          {title}
        </SheetTitle>
        <SheetDescription className="dark:text-[#98A2B3] text-[#667085] text-[0.9375rem]">
          {description}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1 p-6">
        <div className="flex flex-wrap gap-3">
          {items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div key={item.id}>
                <Checkbox
                  id={item.id}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onSelectionChange(item.id, !!checked)
                  }
                  className="sr-only"
                />
                <Label
                  htmlFor={item.id}
                  className={cn(
                    "flex items-center justify-center px-4 py-2 rounded-full border font-medium cursor-pointer transition-all text-sm",
                    isSelected
                      ? "bg-blue-600 dark:bg-[#162142] text-[#FFF] dark:text-[#7592FF] border-transparent dark:border-blue-800"
                      : "bg-white dark:bg-[#171F2F] border-gray-300 dark:border-[#1D2939] text-gray-700 dark:text-[#D0D5DD] hover:bg-gray-50 dark:hover:bg-[#1C2433]"
                  )}
                >
                  {item.name}
                </Label>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <SheetFooter className="px-6 py-4 border-t bg-white dark:bg-[#101828] dark:border-t-[#1D2939] space-y-4 sm:space-y-0">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 mb-4 mt-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            A hotel must have at least one feature in this category at all
            times.
          </p>
        </div>
        <div className="flex w-full justify-end gap-3">
          <SheetClose asChild>
            <Button
              type="button"
              variant="outline"
              className="dark:bg-transparent dark:border-[#1D2939] dark:hover:bg-[#1C2433] dark:text-[#D0D5DD]"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            onClick={handleSaveClick}
            disabled={isSaving || selectedIds.size === 0}
            className="bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Hotel
          </Button>
        </div>
      </SheetFooter>
    </div>
  );
}
