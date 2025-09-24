// src/pages/rooms/components/edit-allocation-dialog.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

// --- Utils & API ---
import { cn } from "@/lib/utils";
import hotelClient from "@/api/hotel-client";
import {
  type Allocation,
  type EditAllocationPayload,
} from "@/types/allocation-types";

// --- Type Definitions ---
interface EditAllocationDialogProps {
  allocation: Allocation;
  onSuccess: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

// --- Validation Schema ---
const allocationSchema = yup.object().shape({
  name: yup.string().required("Allocation name is required."),
  total_rooms: yup
    .number()
    .typeError("Please enter a valid number.")
    .min(1, "You must allocate at least one room.")
    .required("Number of rooms is required."),
  start_date: yup.date().required("Start date is required."),
  end_date: yup.date().required("End date is required."),
  notes: yup.string().optional(),
});

type AllocationFormData = yup.InferType<typeof allocationSchema>;

// --- Main Component ---
export function EditAllocationForm({
  allocation,
  onSuccess,
  onDirtyChange,
}: EditAllocationDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<AllocationFormData>({
    resolver: yupResolver(allocationSchema),
    defaultValues: {
      name: allocation.name,
      total_rooms: allocation.total_rooms,
      start_date: new Date(allocation.start_date),
      end_date: new Date(allocation.end_date),
      notes: allocation.notes || "",
    },
    mode: "onChange",
  });

  const {
    formState: { isDirty },
  } = form;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateAllocationMutation = useMutation({
    mutationFn: (payload: EditAllocationPayload) =>
      hotelClient.patch(`/allocations/${allocation.id}/`, payload),
    onSuccess: () => {
      toast.success("Allocation updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({
        queryKey: ["allocation", allocation.id],
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(
        `Update failed: ${error.response?.data?.detail || error.message}`
      );
    },
  });

  const onSubmit = (data: AllocationFormData) => {
    const payload: EditAllocationPayload = {
      name: data.name,
      start_date: format(data.start_date, "yyyy-MM-dd"),
      end_date: format(data.end_date, "yyyy-MM-dd"),
      total_rooms: data.total_rooms,
      notes: data.notes,
    };
    updateAllocationMutation.mutate(payload);
  };

  const focusRingClass =
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500";
  const inputBaseClass =
    "dark:bg-[#171F2F] dark:border-[#1D2939] dark:text-[#D0D5DD] dark:placeholder:text-[#5D636E]";

  return (
    <div className="flex flex-col h-full bg-[#FFF] dark:bg-[#101828]">
      <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-6 bg-[#F9FAFB] dark:bg-[#101828] border-b border-[#E4E7EC] dark:border-b-[#1D2939]">
        <SheetTitle className="text-2xl font-bold text-[#1D2939] dark:text-[#D0D5DD]">
          Edit Room Allocation
        </SheetTitle>
        <SheetDescription className="text-base text-[#667085] dark:text-[#98A2B3] mt-2">
          Update the details for the "{allocation.name}" allocation. Room type
          cannot be changed.
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Allocation Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={cn(
                          "shadow-xs h-11 text-base rounded-lg",
                          focusRingClass,
                          inputBaseClass
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4">
                <FormItem>
                  <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                    Room Type
                  </FormLabel>
                  <Select defaultValue={allocation.room_type} disabled>
                    <SelectTrigger
                      className={cn(
                        "shadow-xs h-11 text-base rounded-lg",
                        focusRingClass,
                        inputBaseClass
                      )}
                    >
                      <SelectValue placeholder="Select a room type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={allocation.room_type}>
                        {allocation.room_type_name ||
                          allocation.room_type.slice(0, 8)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[13px] text-muted-foreground">
                    Room type cannot be changed after creating allocation.
                  </p>
                </FormItem>
                <FormField
                  control={form.control}
                  name="total_rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        Number of Rooms
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className={cn(
                            "shadow-xs h-11 text-base rounded-lg",
                            focusRingClass,
                            inputBaseClass
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        Start Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl
                            className={cn(
                              "shadow-xs h-11 text-base rounded-lg",
                              focusRingClass,
                              inputBaseClass
                            )}
                          >
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal shadow-xs focus:ring-blue-500",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "LLL dd, y")
                              ) : (
                                <span>Pick a date (MM/DD/YYYY)</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        End Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl
                            className={cn(
                              "shadow-xs h-11 text-base rounded-lg",
                              focusRingClass,
                              inputBaseClass
                            )}
                          >
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal shadow-xs focus:ring-blue-500",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "LLL dd, y")
                              ) : (
                                <span>Pick a date (MM/DD/YYYY)</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Notes (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any internal notes..."
                        {...field}
                        className={cn(
                          "min-h-[120px] text-base resize-none rounded-lg",
                          focusRingClass,
                          inputBaseClass
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <SheetFooter className="flex-shrink-0 px-6 py-4 border-t bg-white dark:bg-[#101828] dark:border-t-[#1D2939]">
            <div className="flex items-center justify-end gap-3 w-full">
              <SheetClose asChild>
                <button
                  type="button"
                  className="border border-[#E4E7EC] dark:border-[#1D2939] bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#1C2433] rounded-full py-2.5 px-4 text-[1rem] cursor-pointer transition-all focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-2 text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
              </SheetClose>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-[#FFF] flex items-center gap-x-2 py-2.5 px-4 rounded-full text-[1rem] cursor-pointer transition-all focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={updateAllocationMutation.isPending || !isDirty}
              >
                {updateAllocationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </button>
            </div>
          </SheetFooter>
        </form>
      </Form>
    </div>
  );
}
