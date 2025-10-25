// // src/pages/rooms/components/create-allocation-dialog.tsx
// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import { Calendar as CalendarIcon, Loader2, Info } from "lucide-react";

// // --- UI Components ---
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   SheetHeader,
//   SheetTitle,
//   SheetDescription,
//   SheetFooter,
//   SheetClose,
// } from "@/components/ui/sheet";
// import { Separator } from "@/components/ui/separator";

// // --- Utils & API ---
// import { cn } from "@/lib/utils";
// import hotelClient from "@/api/hotel-client";
// import { type NewAllocationPayload } from "@/types/allocation-types";
// import { useHotel } from "@/providers/hotel-provider";

// // --- Type Definitions ---
// interface RoomType {
//   id: string;
//   name: string;
// }

// interface CreateAllocationDialogProps {
//   onSuccess: () => void;
//   onDirtyChange: (isDirty: boolean) => void;
// }

// // --- Validation Schema ---
// const allocationSchema = yup.object().shape({
//   name: yup.string().required("Allocation name is required."),
//   room_type: yup.string().required("Please select a room type."),
//   confirm_room_type: yup
//     .string()
//     .required("Please confirm the room type.")
//     .oneOf([yup.ref("room_type")], "Room types must match."),
//   total_rooms: yup
//     .number()
//     .typeError("Please enter a valid number.")
//     .min(1, "You must allocate at least one room.")
//     .required("Number of rooms is required."),
//   start_date: yup.date().required("Start date is required."),
//   end_date: yup.date().required("End date is required."),
//   status: yup
//     .string()
//     .oneOf(["Draft", "Pending", "Confirmed", "Cancelled", "Expired"])
//     .required("Status is required."),
//   notes: yup.string().optional(),
// });

// type AllocationFormData = yup.InferType<typeof allocationSchema>;

// // --- Main Component ---
// export function CreateAllocationForm({
//   onSuccess,
//   onDirtyChange,
// }: CreateAllocationDialogProps) {
//   const queryClient = useQueryClient();
//   const { hotel } = useHotel();

//   const form = useForm<AllocationFormData>({
//     resolver: yupResolver(allocationSchema),
//     mode: "onChange",
//   });

//   const {
//     formState: { isDirty },
//   } = form;

//   useEffect(() => {
//     onDirtyChange(isDirty);
//   }, [isDirty, onDirtyChange]);

//   const { data: roomTypes, isLoading: isLoadingRoomTypes } = useQuery<
//     RoomType[]
//   >({
//     queryKey: ["allRoomTypes"],
//     queryFn: async () => (await hotelClient.get("/room-types/")).data.results,
//     staleTime: 5 * 60 * 1000,
//   });

//   const createAllocationMutation = useMutation({
//     mutationFn: (payload: NewAllocationPayload) =>
//       hotelClient.post("/allocations/", payload),
//     onSuccess: () => {
//       toast.success("Allocation created successfully!");
//       queryClient.invalidateQueries({ queryKey: ["allocations"] });
//       onSuccess();
//     },
//     onError: (error: any) => {
//       toast.error(
//         `Failed to create allocation: ${
//           error.response?.data?.detail || error.message
//         }`
//       );
//     },
//   });

//   const onSubmit = (data: AllocationFormData) => {
//     if (!hotel || !data.start_date || !data.end_date) return;

//     const payload: NewAllocationPayload = {
//       name: data.name,
//       start_date: format(data.start_date, "yyyy-MM-dd"),
//       end_date: format(data.end_date, "yyyy-MM-dd"),
//       total_rooms: data.total_rooms,
//       room_type: data.room_type,
//       notes: data.notes,
//       hotel: hotel.id,
//       status: data.status,
//       approval_date:
//         data.status === "Confirmed" ? new Date().toISOString() : undefined,
//     };

//     createAllocationMutation.mutate(payload);
//   };

//   const focusRingClass =
//     "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500";
//   const inputBaseClass =
//     "dark:bg-[#171F2F] dark:border-[#1D2B3A] dark:text-[#D0D5DD] dark:placeholder:text-[#5D636E]";

//   return (
//     <div className="flex flex-col h-full bg-[#FFF] dark:bg-[#101828]">
//       <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-6 bg-[#F9FAFB] dark:bg-[#101828] border-b border-[#E4E7EC] dark:border-b-[#1D2939]">
//         <SheetTitle className="text-2xl font-bold text-[#1D2939] dark:text-[#D0D5DD]">
//           Create Room Allocation
//         </SheetTitle>
//         <SheetDescription className="text-base text-[#667085] dark:text-[#98A2B3] mt-2">
//           Room allocations represent blocks of rooms reserved for specific
//           periods, allowing guaranteed inventory for booking.
//         </SheetDescription>
//       </SheetHeader>

//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="flex flex-col h-full min-h-0"
//         >
//           <div className="flex-1 overflow-y-auto px-8 py-6">
//             <div className="space-y-6">
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
//                       Enter New Allocation Name
//                     </FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="e.g., SafariPro Online Block"
//                         {...field}
//                         className={cn(
//                           "h-11 text-base rounded-lg",
//                           focusRingClass,
//                           inputBaseClass
//                         )}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="space-y-4 rounded-lg border-none bg-none">
//                 <div className="flex items-start gap-2 text-amber-600 dark:text-amber-300">
//                   <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm font-medium">
//                     Once an allocation's room type is set, it cannot be changed.
//                     Please double-check your selection.
//                   </p>
//                 </div>
//                 <Separator />
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <FormField
//                     control={form.control}
//                     name="room_type"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
//                           Room Type
//                         </FormLabel>
//                         <Select
//                           onValueChange={field.onChange}
//                           defaultValue={field.value}
//                           disabled={isLoadingRoomTypes}
//                         >
//                           <FormControl>
//                             <SelectTrigger
//                               className={cn(
//                                 "shadow-xs focus:ring-blue-500",
//                                 "h-11 text-base rounded-lg",
//                                 focusRingClass,
//                                 inputBaseClass
//                               )}
//                             >
//                               <SelectValue placeholder="Select a room type..." />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {roomTypes?.map((type) => (
//                               <SelectItem key={type.id} value={type.id}>
//                                 {type.name}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="confirm_room_type"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
//                           Confirm Room Type
//                         </FormLabel>
//                         <Select
//                           onValueChange={field.onChange}
//                           defaultValue={field.value}
//                           disabled={isLoadingRoomTypes}
//                         >
//                           <FormControl>
//                             <SelectTrigger
//                               className={cn(
//                                 "shadow-xs focus:ring-blue-500",
//                                 "h-11 text-base rounded-lg",
//                                 focusRingClass,
//                                 inputBaseClass
//                               )}
//                             >
//                               <SelectValue placeholder="Confirm the room type..." />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {roomTypes?.map((type) => (
//                               <SelectItem key={type.id} value={type.id}>
//                                 {type.name}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>

//               <FormField
//                 control={form.control}
//                 name="total_rooms"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
//                       Number of Rooms
//                     </FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         placeholder="e.g., 20"
//                         {...field}
//                         className={cn(
//                           "h-11 text-base rounded-lg",
//                           focusRingClass,
//                           inputBaseClass
//                         )}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="flex flex-col gap-4">
//                 <FormField
//                   control={form.control}
//                   name="start_date"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-col">
//                       <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
//                         Start Date
//                       </FormLabel>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <FormControl>
//                             <Button
//                               variant={"outline"}
//                               className={cn(
//                                 "w-full justify-start text-left font-normal h-11 text-base rounded-lg",
//                                 focusRingClass,
//                                 inputBaseClass,
//                                 !field.value && "text-muted-foreground"
//                               )}
//                             >
//                               <CalendarIcon className="mr-2 h-4 w-4" />
//                               {field.value ? (
//                                 format(field.value, "LLL dd, y")
//                               ) : (
//                                 <span>Pick a date (MM/DD/YYYY)</span>
//                               )}
//                             </Button>
//                           </FormControl>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={field.value}
//                             onSelect={field.onChange}
//                             disabled={(date) =>
//                               date < new Date(new Date().setHours(0, 0, 0, 0))
//                             }
//                             initialFocus
//                           />
//                         </PopoverContent>
//                       </Popover>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="end_date"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-col">
//                       <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
//                         End Date
//                       </FormLabel>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <FormControl>
//                             <Button
//                               variant={"outline"}
//                               className={cn(
//                                 "w-full justify-start text-left font-normal h-11 text-base rounded-lg shadow-xs focus:ring-blue-500",
//                                 focusRingClass,
//                                 inputBaseClass,
//                                 !field.value && "text-muted-foreground"
//                               )}
//                             >
//                               <CalendarIcon className="mr-2 h-4 w-4" />
//                               {field.value ? (
//                                 format(field.value, "LLL dd, y")
//                               ) : (
//                                 <span>Pick a date (MM/DD/YYYY)</span>
//                               )}
//                             </Button>
//                           </FormControl>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={field.value}
//                             onSelect={field.onChange}
//                             disabled={(date) =>
//                               date < new Date(new Date().setHours(0, 0, 0, 0))
//                             }
//                             initialFocus
//                           />
//                         </PopoverContent>
//                       </Popover>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <FormField
//                 control={form.control}
//                 name="status"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
//                       Status
//                     </FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger
//                           className={cn(
//                             "shadow-xs focus:ring-blue-500 h-11 text-base rounded-lg",
//                             focusRingClass,
//                             inputBaseClass
//                           )}
//                         >
//                           <SelectValue placeholder="Select a status" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {[
//                           "Draft",
//                           "Pending",
//                           "Confirmed",
//                           "Cancelled",
//                           "Expired",
//                         ].map((status) => (
//                           <SelectItem key={status} value={status}>
//                             {status}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="notes"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
//                       Notes (Optional)
//                     </FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Add any internal notes about this allocation..."
//                         {...field}
//                         className={cn(
//                           "min-h-[120px] text-[0.9375rem] resize-none rounded-lg",
//                           focusRingClass,
//                           inputBaseClass
//                         )}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </div>

//           <SheetFooter className="flex-shrink-0 px-6 py-4 border-t bg-white dark:bg-[#101828] dark:border-t-[#1D2939]">
//             <div className="flex items-center justify-end gap-3 w-full">
//               <SheetClose asChild>
//                 <button
//                   type="button"
//                   className="border border-[#E4E7EC] dark:border-[#1D2939] bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#1C2433] rounded-full py-2.5 px-4 text-[1rem] cursor-pointer transition-all focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-2 text-gray-800 dark:text-gray-200"
//                 >
//                   Cancel
//                 </button>
//               </SheetClose>
//               <button
//                 className="bg-blue-600 hover:bg-blue-700 text-[#FFF] flex items-center gap-x-2 py-2.5 px-4 rounded-full text-[1rem] cursor-pointer transition-all focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 type="submit"
//                 disabled={createAllocationMutation.isPending}
//               >
//                 {createAllocationMutation.isPending && (
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 )}
//                 Create Allocation
//               </button>
//             </div>
//           </SheetFooter>
//         </form>
//       </Form>
//     </div>
//   );
// }

// src/pages/rooms/components/create-allocation-dialog.tsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO, isValid, addDays } from "date-fns"; // Added parseISO, isValid, addDays
import { Loader2, Info } from "lucide-react"; // Removed CalendarIcon

// --- UI Components ---
import { Button } from "@/components/ui/button";
// Removed Calendar, Popover
// import { Calendar } from "@/components/ui/calendar";
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
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

// --- Utils & API ---
import { cn } from "@/lib/utils";
import hotelClient from "@/api/hotel-client";
import { type NewAllocationPayload } from "@/types/allocation-types";
import { useHotel } from "@/providers/hotel-provider";

// --- Type Definitions ---
interface RoomType {
  id: string;
  name: string;
}

interface CreateAllocationDialogProps {
  onSuccess: () => void;
  // Removed onDirtyChange
  // onDirtyChange: (isDirty: boolean) => void;
}

// --- Validation Schema (Updated for string dates) ---
const allocationSchema = yup.object().shape({
  name: yup.string().required("Allocation name is required."),
  room_type: yup.string().required("Please select a room type."),
  confirm_room_type: yup
    .string()
    .required("Please confirm the room type.")
    .oneOf([yup.ref("room_type")], "Room types must match."),
  total_rooms: yup
    .number()
    .typeError("Please enter a valid number.")
    .min(1, "You must allocate at least one room.")
    .required("Number of rooms is required."),
  // Changed date type to string
  start_date: yup
    .string()
    .required("Start date is required.")
    .test(
      "is-valid-date",
      "Invalid start date format",
      (value) => !!value && isValid(parseISO(value))
    )
    .test("is-after-today", "Start date must be today or later", (value) => {
      if (!value || !isValid(parseISO(value))) return true; // Let required/format handle empty/invalid
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parseISO(value) >= today;
    }),
  end_date: yup
    .string()
    .required("End date is required.")
    .test(
      "is-valid-date",
      "Invalid end date format",
      (value) => !!value && isValid(parseISO(value))
    )
    .test(
      "is-after-start",
      "End date must be after start date",
      function (value) {
        const { start_date } = this.parent;
        if (
          !value ||
          !start_date ||
          !isValid(parseISO(value)) ||
          !isValid(parseISO(start_date))
        )
          return true; // Let required/format handle empty/invalid
        return parseISO(value) > parseISO(start_date);
      }
    ),
  status: yup
    .string()
    .oneOf(["Draft", "Pending", "Confirmed", "Cancelled", "Expired"])
    .required("Status is required."),
  notes: yup.string().optional(),
});

type AllocationFormData = yup.InferType<typeof allocationSchema>;

// --- Main Component ---
export function CreateAllocationForm({
  onSuccess,
}: // Removed onDirtyChange prop
// onDirtyChange,
CreateAllocationDialogProps) {
  const queryClient = useQueryClient();
  const { hotel } = useHotel();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const form = useForm<AllocationFormData>({
    resolver: yupResolver(allocationSchema),
    mode: "onChange",
    defaultValues: {
      // Set default dates as strings
      start_date: todayStr,
      end_date: format(addDays(new Date(), 1), "yyyy-MM-dd"), // Default end date 1 day after start
      status: "Draft", // Default status
    },
  });

  // Removed isDirty effect
  // const {
  //   formState: { isDirty },
  // } = form;
  // useEffect(() => {
  //   onDirtyChange(isDirty);
  // }, [isDirty, onDirtyChange]);

  const { data: roomTypes, isLoading: isLoadingRoomTypes } = useQuery<
    RoomType[]
  >({
    queryKey: ["allRoomTypes"],
    queryFn: async () => (await hotelClient.get("/room-types/")).data.results,
    staleTime: 5 * 60 * 1000, // Keep stale time
  });

  const createAllocationMutation = useMutation({
    mutationFn: (payload: NewAllocationPayload) =>
      hotelClient.post("/allocations/", payload),
    onSuccess: () => {
      toast.success("Allocation created successfully!");
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      onSuccess(); // Close sheet on success
    },
    onError: (error: any) => {
      toast.error(
        `Failed to create allocation: ${
          error.response?.data?.detail || error.message
        }`
      );
    },
  });

  const onSubmit = (data: AllocationFormData) => {
    if (!hotel || !data.start_date || !data.end_date) return;

    // Dates are already strings, no need to format again
    const payload: NewAllocationPayload = {
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      total_rooms: data.total_rooms,
      room_type: data.room_type,
      notes: data.notes,
      hotel: hotel.id,
      status: data.status,
      approval_date:
        data.status === "Confirmed" ? new Date().toISOString() : undefined,
    };

    createAllocationMutation.mutate(payload);
  };

  // Consistent input styling
  const inputBaseClass =
    "h-10 bg-white dark:bg-[#101828] border border-gray-200 dark:border-[#1D2939] text-gray-800 dark:text-[#D0D5DD] rounded-md shadow-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all dark:placeholder:text-[#5D636E]";
  const selectBaseClass = inputBaseClass; // Use same base for selects

  return (
    // Applied shadow-none
    <div className="flex flex-col h-full bg-[#FFF] dark:bg-[#101828] shadow-none">
      {/* Applied shadow-none */}
      <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-6 bg-[#F9FAFB] dark:bg-[#101828] border-b border-[#E4E7EC] dark:border-b-[#1D2939] shadow-none">
        <SheetTitle className="text-2xl font-bold text-[#1D2939] dark:text-[#D0D5DD]">
          Create Room Allocation
        </SheetTitle>
        <SheetDescription className="text-base text-[#667085] dark:text-[#98A2B3] mt-2">
          Reserve blocks of rooms for specific periods and room types.
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
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                      Allocation Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Summer Group Block"
                        {...field}
                        className={cn(inputBaseClass)} // Use consistent class
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 rounded-lg border dark:border-amber-700/50 p-4 bg-amber-50 dark:bg-amber-900/20 shadow-none">
                <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
                  <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    Once an allocation's room type is set, it cannot be changed.
                    Please double-check your selection.
                  </p>
                </div>
                {/* <Separator className="dark:bg-amber-700/50" /> */}{" "}
                {/* Separator might be redundant with border */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* --- Native Select for Room Type --- */}
                  <FormField
                    control={form.control}
                    name="room_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                          Room Type
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            disabled={isLoadingRoomTypes}
                            className={cn(selectBaseClass)}
                          >
                            <option value="" disabled>
                              Select a room type...
                            </option>
                            {roomTypes?.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* --- Native Select for Confirm Room Type --- */}
                  <FormField
                    control={form.control}
                    name="confirm_room_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                          Confirm Room Type
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            disabled={isLoadingRoomTypes}
                            className={cn(selectBaseClass)}
                          >
                            <option value="" disabled>
                              Confirm the room type...
                            </option>
                            {roomTypes?.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="total_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                      Number of Rooms to Allocate
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 20"
                        {...field}
                        // Update field value conversion for number input
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : parseInt(e.target.value, 10)
                          )
                        }
                        min="1"
                        className={cn(inputBaseClass)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Native Date Inputs --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                        Start Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className={cn(inputBaseClass)}
                          min={todayStr} // Prevent selecting past dates
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                        End Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className={cn(inputBaseClass)}
                          min={form.watch("start_date") || todayStr} // Prevent end before start
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* --- End Native Date Inputs --- */}

              {/* --- Native Select for Status --- */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                      Initial Status
                    </FormLabel>
                    <FormControl>
                      <select {...field} className={cn(selectBaseClass)}>
                        {/* <option value="" disabled>Select a status...</option> */}
                        {[
                          "Draft",
                          "Pending",
                          "Confirmed",
                          // "Cancelled", // Less likely needed on creation?
                          // "Expired", // Status set automatically
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-[#98A2B3]">
                      Notes (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any internal notes about this allocation..."
                        {...field}
                        // Use consistent styling, shadow-none
                        className={cn(
                          "min-h-[100px] text-base resize-none rounded-md shadow-none",
                          inputBaseClass // Reuse base input class styling
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Applied shadow-none */}
          <SheetFooter className="flex-shrink-0 px-6 py-4 border-t bg-white dark:bg-[#101828] dark:border-t-[#1D2939] shadow-none">
            <div className="flex items-center justify-end gap-3 w-full">
              <SheetClose asChild>
                {/* Adjusted button style, added shadow-none */}
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg shadow-none border-gray-300 dark:border-[#1D2939] dark:bg-[#171F2F] dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
                >
                  Cancel
                </Button>
              </SheetClose>
              {/* Adjusted button style, added shadow-none */}
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-[#FFF] rounded-lg shadow-none"
                type="submit"
                disabled={createAllocationMutation.isPending}
              >
                {createAllocationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Allocation
              </Button>
            </div>
          </SheetFooter>
        </form>
      </Form>
    </div>
  );
}
