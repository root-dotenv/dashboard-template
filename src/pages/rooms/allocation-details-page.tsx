// // src/pages/rooms/allocation-details-page.tsx
// import { useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import Swal from "sweetalert2";
// import {
//   type Allocation,
//   type AllocationDetail,
//   type AllocationUsage,
// } from "@/types/allocation-types";
// import hotelClient from "@/api/hotel-client";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { EditAllocationForm } from "./components/edit-allocation-dialog";
// import {
//   ArrowLeft,
//   Trash2,
//   Loader2,
//   CalendarDays,
//   BedDouble,
//   Hash,
//   CheckCircle2,
//   ListTodo,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { FiEdit2 } from "react-icons/fi";

// export default function AllocationDetailsPage() {
//   const { allocation_id } = useParams<{ allocation_id: string }>();
//   const queryClient = useQueryClient();
//   const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

//   // --- START: BUG FIX ---
//   // Add state to track if the form is dirty and if the confirmation dialog should be shown
//   const [isFormDirty, setIsFormDirty] = useState(false);
//   const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] =
//     useState(false);

//   // Handler to manage opening/closing the sheet and checking for unsaved changes
//   const handleSheetOpenChange = (open: boolean) => {
//     if (!open && isFormDirty) {
//       setShowUnsavedChangesDialog(true);
//       return; // Prevent sheet from closing
//     }
//     setIsEditSheetOpen(open);
//     if (!open) {
//       setIsFormDirty(false); // Reset dirty state when sheet is closed properly
//     }
//   };

//   // Handler for the "Discard" action in the confirmation dialog
//   const handleDiscardChanges = () => {
//     setIsFormDirty(false);
//     setShowUnsavedChangesDialog(false);
//     setIsEditSheetOpen(false);
//   };
//   // --- END: BUG FIX ---

//   const { data: allocation, isLoading: isLoadingAllocation } =
//     useQuery<Allocation>({
//       queryKey: ["allocation", allocation_id],
//       queryFn: async () =>
//         (await hotelClient.get(`/allocations/${allocation_id}/`)).data,
//       enabled: !!allocation_id,
//     });

//   const { data: usageData, isLoading: isLoadingUsage } = useQuery<
//     AllocationUsage[]
//   >({
//     queryKey: ["allocationUsage", allocation_id],
//     queryFn: async () =>
//       (await hotelClient.get(`/allocation-usage/?allocation=${allocation_id}`))
//         .data.results,
//     enabled: !!allocation_id,
//   });

//   const { data: dailyDetails, isLoading: isLoadingDetails } = useQuery<
//     AllocationDetail[]
//   >({
//     queryKey: ["allocationDetails", allocation_id],
//     queryFn: async () =>
//       (
//         await hotelClient.get(
//           `/allocation-details/?allocation=${allocation_id}`
//         )
//       ).data.results,
//     enabled: !!allocation_id,
//   });

//   const deleteAllocationMutation = useMutation({
//     mutationFn: (id: string) => hotelClient.delete(`/allocations/${id}/`),
//     onSuccess: () => {
//       toast.success("Allocation deleted successfully.");
//       queryClient.invalidateQueries({ queryKey: ["allocations"] });
//       window.history.back();
//     },
//     onError: (error: any) => {
//       toast.error(
//         `Deletion failed: ${error.response?.data?.detail || error.message}`
//       );
//     },
//   });

//   const handleDelete = () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "This will permanently delete this allocation. This action cannot be undone.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     }).then((result) => {
//       if (result.isConfirmed && allocation_id) {
//         deleteAllocationMutation.mutate(allocation_id);
//       }
//     });
//   };

//   const totalRoomsUsed =
//     usageData?.reduce((sum, usage) => sum + usage.rooms_used, 0) || 0;
//   const isLoading = isLoadingAllocation || isLoadingUsage || isLoadingDetails;

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-[#F9FAFB] dark:bg-[#101828]">
//         <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-[#7592FF]" />
//       </div>
//     );
//   }

//   if (!allocation) {
//     return (
//       <div className="text-center p-8 bg-[#F9FAFB] dark:bg-[#101828] text-gray-600 dark:text-[#98A2B3]">
//         Allocation not found.
//       </div>
//     );
//   }

//   const stats = [
//     {
//       label: "Total Allocated",
//       value: `${allocation.total_rooms} Rooms`,
//       icon: ListTodo,
//     },
//     {
//       label: "Rooms Used",
//       value: totalRoomsUsed,
//       icon: CheckCircle2,
//     },
//     {
//       label: "Availability",
//       value: `${allocation.total_rooms - totalRoomsUsed} Rooms`,
//       icon: BedDouble,
//     },
//   ];

//   return (
//     <>
//       <div className="min-h-screen bg-gray-50 dark:bg-[#101828]">
//         <div className="bg-white/80 dark:bg-[#101828]/80 backdrop-blur-sm border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30">
//           <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="py-3">
//               <Link
//                 to="/rooms/allocate-rooms"
//                 className="flex items-center gap-1 text-sm text-gray-500 dark:text-[#98A2B3] hover:text-blue-600 transition-colors w-fit"
//               >
//                 <ArrowLeft className="h-4 w-4" />
//                 Back to Allocations
//               </Link>
//             </div>
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
//               <div className="space-y-1">
//                 <h1 className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]">
//                   {allocation.name}
//                 </h1>
//                 <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-600 dark:text-[#98A2B3] text-sm">
//                   <span className="flex items-center gap-2">
//                     <CalendarDays className="h-4 w-4" />
//                     From{" "}
//                     {format(
//                       new Date(allocation.start_date),
//                       "MMM dd, yyyy"
//                     )} To{" "}
//                     {format(new Date(allocation.end_date), "MMM dd, yyyy")}
//                   </span>
//                   <span className="flex items-center gap-2">
//                     <BedDouble className="h-4 w-4" />
//                     {allocation.total_rooms} Rooms
//                   </span>
//                   <span className="flex items-center gap-2">
//                     <Hash className="h-4 w-4" />
//                     {allocation.room_type_name ||
//                       allocation.room_type.slice(0, 8)}
//                   </span>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Sheet
//                   open={isEditSheetOpen}
//                   onOpenChange={handleSheetOpenChange}
//                 >
//                   <SheetTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className="rounded-full flex items-center gap-2 border border-gray-300 font-medium transition-all text-[#697282] cursor-pointer dark:border-[#1D2939] dark:bg-[#171F2F] dark:hover:bg-[#1C2433] dark:text-[#D0D5DD]"
//                     >
//                       <FiEdit2 className="h-4 w-4" />
//                       Edit
//                     </Button>
//                   </SheetTrigger>
//                   <SheetContent className="w-full sm:max-w-lg p-0 bg-white dark:bg-[#101828] border-l dark:border-l-[#1D2939]">
//                     <EditAllocationForm
//                       allocation={allocation}
//                       onSuccess={() => handleSheetOpenChange(false)}
//                       onDirtyChange={setIsFormDirty}
//                     />
//                   </SheetContent>
//                 </Sheet>
//                 <Button
//                   variant="destructive"
//                   onClick={handleDelete}
//                   disabled={deleteAllocationMutation.isPending}
//                   className="rounded-full"
//                 >
//                   {deleteAllocationMutation.isPending && (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   )}
//                   <Trash2 className="h-4 w-4" /> Delete Allocation
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
//           <div className="w-full flex">
//             {stats.map((stat, index) => (
//               <div
//                 key={stat.label}
//                 className={cn(
//                   "bg-white dark:bg-[#171F2F] w-full flex items-center border border-[#E4E7EC] dark:border-[#1D2939] px-4 py-6 shadow-xs",
//                   index === 0 && "rounded-l-lg",
//                   index > 0 && "border-l-0",
//                   index === stats.length - 1 && "rounded-r-lg"
//                 )}
//               >
//                 <div className="flex items-center gap-4">
//                   <div className="p-2 bg-[#EFF6FF] dark:bg-[#162142] rounded-full">
//                     <stat.icon className="h-5 w-5 text-blue-600 dark:text-[#7592FF]" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-[#98A2B3]">
//                       {stat.label}
//                     </p>
//                     <p className="text-2xl font-semibold text-[#1D2939] dark:text-[#D0D5DD]">
//                       {stat.value}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <Card className="bg-white dark:bg-[#171F2F] border-[#E4E7EC] dark:border-[#1D2939] rounded-lg shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-xl font-semibold text-gray-900 dark:text-[#D0D5DD]">
//                 Daily Allocation Details
//               </CardTitle>
//               <CardDescription className="text-base mb-4 text-gray-600 dark:text-[#98A2B3]">
//                 A day-by-day breakdown of room status within this allocation.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="rounded-lg border dark:border-[#1D2939] overflow-hidden">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="hover:bg-transparent border-b-2 border-gray-200 dark:border-b-[#1D2939] bg-gray-50 dark:bg-[#101828]/90">
//                       <TableHead className="px-6 py-4 text-[#667085] dark:text-[#98A2B3] font-semibold text-[13px] uppercase">
//                         Date
//                       </TableHead>
//                       <TableHead className="px-6 py-4 text-[#667085] dark:text-[#98A2B3] font-semibold text-[13px] uppercase">
//                         Status
//                       </TableHead>
//                       <TableHead className="px-6 py-4 text-[#667085] dark:text-[#98A2B3] font-semibold text-[13px] uppercase">
//                         Room ID
//                       </TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {dailyDetails && dailyDetails.length > 0 ? (
//                       dailyDetails.map((detail) => (
//                         <TableRow
//                           key={detail.id}
//                           className="border-b border-gray-200 dark:border-[#1D2939]"
//                         >
//                           <TableCell className="px-6 py-4 font-medium text-gray-700 dark:text-[#D0D5DD]">
//                             {format(
//                               new Date(detail.date),
//                               "EEEE, MMM dd, yyyy"
//                             )}
//                           </TableCell>
//                           <TableCell className="px-6 py-4 text-gray-600 dark:text-[#98A2B3]">
//                             {detail.status}
//                           </TableCell>
//                           <TableCell className="px-6 py-4 text-gray-600 dark:text-[#98A2B3] font-mono text-xs">
//                             {detail.room}
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     ) : (
//                       <TableRow>
//                         <TableCell
//                           colSpan={3}
//                           className="text-center h-24 text-gray-500 dark:text-[#98A2B3]"
//                         >
//                           No granular daily details available for this
//                           allocation.
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* --- BUG FIX: Add the confirmation dialog --- */}
//       <AlertDialog
//         open={showUnsavedChangesDialog}
//         onOpenChange={setShowUnsavedChangesDialog}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>You have unsaved changes!</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to close? Your changes will be discarded.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>No, keep editing</AlertDialogCancel>
//             <AlertDialogAction
//               className="bg-blue-600 hover:bg-blue-700"
//               onClick={handleDiscardChanges}
//             >
//               Yes, discard changes
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }

// src/pages/rooms/allocation-details-page.tsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns"; // Added isValid, parseISO
import { toast } from "sonner";
// Removed Swal import
// import Swal from "sweetalert2";
import {
  type Allocation,
  type AllocationDetail,
  type AllocationUsage,
} from "@/types/allocation-types";
import hotelClient from "@/api/hotel-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // Keep AlertDialogTrigger for delete
} from "@/components/ui/alert-dialog";
import { EditAllocationForm } from "./components/edit-allocation-dialog";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  CalendarDays,
  BedDouble,
  Hash,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import { FiEdit2 } from "react-icons/fi";
import { StatCard } from "@/components/custom/StatCard"; // Import StatCard

export default function AllocationDetailsPage() {
  const { allocation_id } = useParams<{ allocation_id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Add useNavigate hook
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // --- Simplified sheet close logic ---
  const handleSheetClose = () => {
    setIsEditSheetOpen(false);
  };

  const { data: allocation, isLoading: isLoadingAllocation } =
    useQuery<Allocation>({
      queryKey: ["allocation", allocation_id],
      queryFn: async () =>
        (await hotelClient.get(`/allocations/${allocation_id}/`)).data,
      enabled: !!allocation_id,
    });

  const { data: usageData, isLoading: isLoadingUsage } = useQuery<
    AllocationUsage[]
  >({
    queryKey: ["allocationUsage", allocation_id],
    queryFn: async () =>
      (await hotelClient.get(`/allocation-usage/?allocation=${allocation_id}`))
        .data.results,
    enabled: !!allocation_id,
  });

  const { data: dailyDetails, isLoading: isLoadingDetails } = useQuery<
    AllocationDetail[]
  >({
    queryKey: ["allocationDetails", allocation_id],
    queryFn: async () =>
      (
        await hotelClient.get(
          `/allocation-details/?allocation=${allocation_id}`
        )
      ).data.results,
    enabled: !!allocation_id,
  });

  const deleteAllocationMutation = useMutation({
    mutationFn: (id: string) => hotelClient.delete(`/allocations/${id}/`),
    onSuccess: () => {
      toast.success("Allocation deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      navigate("/rooms/allocate-rooms"); // Use navigate instead of window.history
    },
    onError: (error: any) => {
      toast.error(
        `Deletion failed: ${error.response?.data?.detail || error.message}`
      );
    },
  });

  const totalRoomsUsed =
    usageData?.reduce((sum, usage) => sum + usage.rooms_used, 0) || 0;
  const isLoading = isLoadingAllocation || isLoadingUsage || isLoadingDetails;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#101828]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-[#7592FF]" />
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-[#101828] text-gray-600 dark:text-[#98A2B3]">
        Allocation not found or could not be loaded.
      </div>
    );
  }

  // --- Use StatCard data structure ---
  const stats = [
    {
      title: "Total Allocated",
      count: `${allocation.total_rooms} Rooms`,
      icon: ListTodo,
    },
    {
      title: "Rooms Used",
      count: totalRoomsUsed,
      icon: CheckCircle2,
    },
    {
      title: "Currently Available",
      count: `${allocation.total_rooms - totalRoomsUsed} Rooms`,
      icon: BedDouble,
    },
  ];

  return (
    <>
      {/* Adjusted main background */}
      <div className="min-h-screen bg-gray-50 dark:bg-[#101828]">
        {/* --- Adjusted Header Styling --- */}
        <div className="bg-white/80 dark:bg-[#101828]/80 backdrop-blur-sm border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30 shadow-none lg:h-[132px]">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 lg:pt-4">
              {" "}
              {/* Adjusted padding */}
              <Link
                to="/rooms/allocate-rooms"
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-[#98A2B3] hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Allocations
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
              <div className="space-y-1">
                {/* Applied consistent title style */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD] lg:text-[30px] lg:leading-[36px] lg:font-bold">
                  {allocation.name}
                </h1>
                {/* Adjusted secondary details style */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-600 dark:text-[#98A2B3] text-sm">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {/* Ensure dates are valid before formatting */}
                    {isValid(parseISO(allocation.start_date)) &&
                    isValid(parseISO(allocation.end_date))
                      ? `${format(
                          parseISO(allocation.start_date),
                          "MMM dd"
                        )} - ${format(
                          parseISO(allocation.end_date),
                          "MMM dd, yyyy"
                        )}`
                      : "Invalid Date Range"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="h-4 w-4" />
                    {allocation.total_rooms} Rooms
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-4 w-4" />
                    {allocation.room_type_name ||
                      allocation.room_type.slice(0, 8)}
                  </span>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Sheet
                  open={isEditSheetOpen}
                  onOpenChange={(open) => {
                    if (!open) handleSheetClose();
                    else setIsEditSheetOpen(true);
                  }}
                >
                  <SheetTrigger asChild>
                    {/* Applied consistent button style */}
                    <Button
                      variant="outline"
                      className="rounded-lg flex items-center gap-2 border border-gray-300 dark:border-[#1D2939] font-medium transition-all text-gray-700 dark:text-[#D0D5DD] cursor-pointer bg-white dark:bg-[#171F2F] hover:bg-gray-50 dark:hover:bg-[#1C2433] shadow-none h-9 px-3 text-sm" // Adjusted style
                    >
                      <FiEdit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  </SheetTrigger>
                  {/* Applied shadow-none */}
                  <SheetContent className="w-full sm:max-w-lg p-0 bg-white dark:bg-[#101828] border-l dark:border-l-[#1D2939] shadow-none">
                    {/* Pass simplified close handler */}
                    <EditAllocationForm
                      allocation={allocation}
                      onSuccess={handleSheetClose}
                      // Removed onDirtyChange
                    />
                  </SheetContent>
                </Sheet>
                {/* Delete Button with AlertDialog Trigger */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      // Applied consistent button style
                      className="rounded-lg shadow-none h-9 px-3 text-sm flex items-center gap-1.5"
                      disabled={deleteAllocationMutation.isPending}
                    >
                      {deleteAllocationMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  {/* Applied shadow-none */}
                  <AlertDialogContent className="shadow-none bg-white dark:bg-[#101828] border dark:border-[#1D2939]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-[#D0D5DD]">
                        Confirm Deletion
                      </AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-[#98A2B3]">
                        This will permanently delete the "{allocation.name}"
                        allocation. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg shadow-none border-gray-300 dark:border-[#1D2939] dark:bg-[#171F2F] dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 rounded-lg shadow-none"
                        onClick={() =>
                          allocation_id &&
                          deleteAllocationMutation.mutate(allocation_id)
                        }
                        disabled={deleteAllocationMutation.isPending}
                      >
                        {deleteAllocationMutation.isPending
                          ? "Deleting..."
                          : "Yes, delete it!"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
          {/* --- Replaced Summary Divs with StatCard --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shadow-none">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                title={stat.label}
                count={stat.value}
                isLoading={isLoadingUsage} // Link loading to usage data
                icon={stat.icon}
              />
            ))}
          </div>

          {/* --- Restyled Daily Details Card & Table --- */}
          <Card className="bg-white dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] rounded-lg shadow-none">
            <CardHeader className="border-b dark:border-gray-700 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-[#D0D5DD]">
                Daily Allocation Details
              </CardTitle>
              <CardDescription className="text-sm mb-0 text-gray-600 dark:text-[#98A2B3]">
                Day-by-day breakdown of room status within this allocation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {" "}
              {/* Remove CardContent padding */}
              {/* Apply shadow-none to container */}
              <div className="rounded-b-lg overflow-hidden shadow-none">
                {/* Match available-rooms-date table style */}
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-b-[#1D2939] bg-gray-50 dark:bg-[#101828]/90">
                      <TableHead className="h-12 px-6 py-3 text-left font-semibold text-[13px] uppercase tracking-wide text-[#667085] dark:text-[#98A2B3] border-r dark:border-r-[#1D2939] shadow-none">
                        Date
                      </TableHead>
                      <TableHead className="h-12 px-6 py-3 text-left font-semibold text-[13px] uppercase tracking-wide text-[#667085] dark:text-[#98A2B3] border-r dark:border-r-[#1D2939] shadow-none">
                        Status
                      </TableHead>
                      <TableHead className="h-12 px-6 py-3 text-left font-semibold text-[13px] uppercase tracking-wide text-[#667085] dark:text-[#98A2B3] shadow-none">
                        Room ID
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyDetails && dailyDetails.length > 0 ? (
                      dailyDetails.map((detail) => (
                        <TableRow
                          key={detail.id}
                          // Apply consistent row style
                          className="border-b border-gray-200 dark:border-b-[#1D2939] hover:bg-indigo-50/30 dark:hover:bg-[#1C2433]"
                        >
                          <TableCell className="px-6 py-4 font-medium text-gray-700 dark:text-[#D0D5DD] border-r dark:border-r-[#1D2939]">
                            {/* Ensure valid date before formatting */}
                            {isValid(parseISO(detail.date))
                              ? format(
                                  parseISO(detail.date),
                                  "EEEE, MMM dd, yyyy"
                                )
                              : "Invalid Date"}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-gray-600 dark:text-[#98A2B3] border-r dark:border-r-[#1D2939]">
                            {detail.status}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-gray-600 dark:text-[#98A2B3] font-mono text-xs">
                            {detail.room}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={3}
                          className="text-center h-24 text-gray-500 dark:text-[#98A2B3]"
                        >
                          No granular daily details available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          {/* --- End Restyled Card & Table --- */}
        </div>
      </div>

      {/* Removed Unsaved Changes Dialog */}
    </>
  );
}
