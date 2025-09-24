// // --- src/pages/hotel/hotel-facilities.tsx ---
// "use client";
// import { useState } from "react";
// import { useHotel } from "../../providers/hotel-provider";
// import {
//   useQuery,
//   useMutation,
//   useQueryClient,
//   useQueries,
// } from "@tanstack/react-query";
// import hotelClient from "../../api/hotel-client";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import { EmptyState } from "./empty-state";
// import {
//   Plus,
//   MoreHorizontal,
//   Trash2,
//   Loader2,
//   DollarSign,
//   CalendarCheck,
// } from "lucide-react";
// import { FeatureSelectionSheet } from "./selection-sheet";
// import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import ErrorPage from "@/components/custom/error-page";
// import type { Facility } from "./features";
// import { cn } from "@/lib/utils";
// import { BsGridFill } from "react-icons/bs";

// export default function HotelFacilities() {
//   const queryClient = useQueryClient();
//   const {
//     hotel,
//     isLoading: isHotelLoading,
//     isError: isHotelError,
//     error: hotelError,
//     refetch: refetchHotel,
//   } = useHotel();
//   const [isSheetOpen, setIsSheetOpen] = useState(false);
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//   const hotelId = "a3d5501e-c910-4e2e-a0b2-ad616c5910db";

//   // REVERTED: Using useQueries for data fetching (N+1 pattern)
//   const facilityQueries = useQueries({
//     queries: (hotel?.facilities || []).map((id) => ({
//       queryKey: ["facilityDetail", id],
//       queryFn: async () =>
//         (await hotelClient.get(`facilities/${id}`)).data as Facility,
//       enabled: !!hotel,
//     })),
//   });

//   const facilities = facilityQueries
//     .filter((q) => q.isSuccess)
//     .map((q) => q.data as Facility);
//   const areFacilitiesLoading = facilityQueries.some((q) => q.isLoading);
//   const facilityQueriesError = facilityQueries.find((q) => q.isError);

//   const { data: allFacilities } = useQuery<Facility[]>({
//     queryKey: ["allFacilities"],
//     queryFn: async () => (await hotelClient.get("facilities/")).data.results,
//     enabled: isSheetOpen,
//   });

//   // REVERTED: Using .env hotelId for mutations
//   const updateHotelMutation = useMutation({
//     mutationFn: (newFacilityIds: string[]) =>
//       hotelClient.patch(`hotels/${hotelId}/`, { facilities: newFacilityIds }),
//     onSuccess: () => {
//       toast.success("Hotel facilities updated successfully!");
//       queryClient.invalidateQueries({ queryKey: ["hotel", hotelId] });
//       queryClient.invalidateQueries({ queryKey: ["facilityDetail"] });
//       setIsSheetOpen(false);
//     },
//     onError: (err) =>
//       toast.error(`Failed to update facilities: ${err.message}`),
//   });

//   const handleOpenSheet = () => {
//     setSelectedIds(new Set(hotel?.facilities || []));
//     setIsSheetOpen(true);
//   };

//   const handleSelectionChange = (id: string, isSelected: boolean) => {
//     const newIds = new Set(selectedIds);
//     isSelected ? newIds.add(id) : newIds.delete(id);
//     setSelectedIds(newIds);
//   };

//   const handleSave = () => {
//     if (Array.from(selectedIds).length === 0) {
//       toast.warning("Your hotel must have at least one facility.");
//       return;
//     }
//     updateHotelMutation.mutate(Array.from(selectedIds));
//   };

//   const handleRemove = (facilityId: string) => {
//     const currentIds = new Set(hotel?.facilities || []);
//     if (currentIds.size <= 1) {
//       toast.warning("Your hotel must have at least one facility.");
//       return;
//     }
//     currentIds.delete(facilityId);
//     updateHotelMutation.mutate(Array.from(currentIds));
//   };

//   if (isHotelLoading || areFacilitiesLoading) {
//     return (
//       <div className="w-full flex items-center justify-center py-20">
//         <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
//       </div>
//     );
//   }

//   if (isHotelError)
//     return <ErrorPage error={hotelError as Error} onRetry={refetchHotel} />;
//   if (facilityQueriesError)
//     return (
//       <ErrorPage
//         error={facilityQueriesError.error as Error}
//         onRetry={() =>
//           queryClient.invalidateQueries({ queryKey: ["facilityDetail"] })
//         }
//       />
//     );

//   return (
//     <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//       <div className="space-y-6">
//         <Card className="bg-white dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] rounded-xl p-6 shadow-xs">
//           <div className="flex items-start justify-between">
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600 dark:text-[#98A2B3]">
//                 Total Facilities
//               </p>
//               <p className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]">
//                 {facilities.length}
//               </p>
//             </div>
//             <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs">
//               <BsGridFill className="h-5 w-5 text-white" />
//             </div>
//           </div>
//         </Card>

//         <div className="flex justify-between items-center">
//           <div className="space-y-1">
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-[#D0D5DD]">
//               Facilities List
//             </h2>
//             <p className="text-gray-600 dark:text-[#98A2B3]">
//               Manage your hotel's general facilities.
//             </p>
//           </div>
//           <SheetTrigger asChild>
//             <Button
//               variant="outline"
//               onClick={handleOpenSheet}
//               className="gap-2 bg-white dark:bg-[#101828] dark:text-[#D0D5DD] border-gray-200 dark:border-[#1D2939] rounded-md shadow-xs"
//             >
//               Add or Remove
//             </Button>
//           </SheetTrigger>
//         </div>

//         <div>
//           {facilities.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {facilities.map((facility) => (
//                 <Card
//                   key={facility.id}
//                   className="flex flex-col justify-between bg-white dark:bg-[#171F2F] border-gray-200 dark:border-[#1D2939] shadow-xs hover:shadow-xs transition-shadow-xs"
//                 >
//                   <CardHeader>
//                     <div className="flex items-start justify-between">
//                       <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
//                         {facility.name}
//                       </CardTitle>
//                       <Badge
//                         className={cn(
//                           "text-xs font-medium border",
//                           facility.is_active
//                             ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700/60"
//                             : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-700/60"
//                         )}
//                       >
//                         {facility.is_active ? "Active" : "Inactive"}
//                       </Badge>
//                     </div>
//                     <CardDescription className="pt-2">
//                       {facility.description}
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="flex-grow">
//                     <div className="flex flex-wrap gap-2 pt-2">
//                       {facility.fee_applies && (
//                         <Badge
//                           variant="secondary"
//                           className="dark:bg-gray-700 dark:text-gray-300"
//                         >
//                           <DollarSign className="mr-1.5 h-3 w-3" />
//                           Fee Applies
//                         </Badge>
//                       )}
//                       {facility.reservation_required && (
//                         <Badge
//                           variant="secondary"
//                           className="dark:bg-gray-700 dark:text-gray-300"
//                         >
//                           <CalendarCheck className="mr-1.5 h-3 w-3" />
//                           Reservation Required
//                         </Badge>
//                       )}
//                     </div>
//                   </CardContent>
//                   <CardFooter className="flex justify-between items-center bg-gray-50 dark:bg-[#101828]/50 p-4">
//                     <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md text-xs text-gray-600 dark:text-gray-300">
//                       {facility.code}
//                     </span>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           className="h-9 w-9 p-0 rounded-full dark:hover:bg-[#1D2939]"
//                         >
//                           <MoreHorizontal className="h-5 w-5" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent
//                         align="end"
//                         className="dark:bg-[#101828] dark:border-[#1D2939]"
//                       >
//                         <DropdownMenuItem
//                           onClick={() => handleRemove(facility.id)}
//                           className="text-rose-600 dark:text-rose-400 dark:focus:bg-rose-900/50 dark:focus:text-rose-300 cursor-pointer"
//                         >
//                           <Trash2 className="mr-2 h-4 w-4" /> Remove
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </CardFooter>
//                 </Card>
//               ))}
//             </div>
//           ) : (
//             <EmptyState
//               title="No Facilities Found"
//               description="This hotel has not listed any facilities yet."
//             />
//           )}
//         </div>
//       </div>
//       <SheetContent className="w-full sm:max-w-lg p-0 bg-white dark:bg-[#101828] border-l dark:border-l-[#1D2939]">
//         <FeatureSelectionSheet
//           title="Manage Hotel Facilities"
//           description="Select the facilities available at your hotel."
//           items={allFacilities || []}
//           selectedIds={selectedIds}
//           onSelectionChange={handleSelectionChange}
//           onSave={handleSave}
//           isSaving={updateHotelMutation.isPending}
//         />
//       </SheetContent>
//     </Sheet>
//   );
// }

// --- src/pages/hotel/hotel-facilities.tsx ---
"use client";
import { useState } from "react";
import { useHotel } from "../../providers/hotel-provider";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import hotelClient from "../../api/hotel-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./empty-state";
import {
  MoreHorizontal,
  Trash2,
  Loader2,
  DollarSign,
  CalendarCheck,
  Search,
} from "lucide-react";
import { FeatureSelectionSheet } from "./selection-sheet";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ErrorPage from "@/components/custom/error-page";
import type { Facility } from "./features";
import { cn } from "@/lib/utils";
import { BsGridFill } from "react-icons/bs";

export default function HotelFacilities() {
  const queryClient = useQueryClient();
  const {
    hotel,
    isLoading: isHotelLoading,
    isError: isHotelError,
    error: hotelError,
    refetch: refetchHotel,
  } = useHotel();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const hotelId = "a3d5501e-c910-4e2e-a0b2-ad616c5910db";

  const facilityQueries = useQueries({
    queries: (hotel?.facilities || []).map((id) => ({
      queryKey: ["facilityDetail", id],
      queryFn: async () =>
        (await hotelClient.get(`facilities/${id}`)).data as Facility,
      enabled: !!hotel,
    })),
  });

  const facilities = facilityQueries
    .filter((q) => q.isSuccess)
    .map((q) => q.data as Facility);
  const areFacilitiesLoading = facilityQueries.some((q) => q.isLoading);
  const facilityQueriesError = facilityQueries.find((q) => q.isError);

  const { data: allFacilities } = useQuery<Facility[]>({
    queryKey: ["allFacilities"],
    queryFn: async () => (await hotelClient.get("facilities/")).data.results,
    enabled: isSheetOpen,
  });

  const updateHotelMutation = useMutation({
    mutationFn: (newFacilityIds: string[]) =>
      hotelClient.patch(`hotels/${hotelId}/`, { facilities: newFacilityIds }),
    onSuccess: () => {
      toast.success("Hotel facilities updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["hotel", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["facilityDetail"] });
      setIsSheetOpen(false);
    },
    onError: (err) =>
      toast.error(`Failed to update facilities: ${err.message}`),
  });

  const handleOpenSheet = () => {
    setSelectedIds(new Set(hotel?.facilities || []));
    setIsSheetOpen(true);
  };

  const handleSelectionChange = (id: string, isSelected: boolean) => {
    const newIds = new Set(selectedIds);
    isSelected ? newIds.add(id) : newIds.delete(id);
    setSelectedIds(newIds);
  };

  const handleSave = () => {
    if (Array.from(selectedIds).length === 0) {
      toast.warning("Your hotel must have at least one facility.");
      return;
    }
    updateHotelMutation.mutate(Array.from(selectedIds));
  };

  const handleRemove = (facilityId: string) => {
    const currentIds = new Set(hotel?.facilities || []);
    if (currentIds.size <= 1) {
      toast.warning("Your hotel must have at least one facility.");
      return;
    }
    currentIds.delete(facilityId);
    updateHotelMutation.mutate(Array.from(currentIds));
  };

  if (isHotelLoading || areFacilitiesLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (isHotelError)
    return <ErrorPage error={hotelError as Error} onRetry={refetchHotel} />;
  if (facilityQueriesError)
    return (
      <ErrorPage
        error={facilityQueriesError.error as Error}
        onRetry={() =>
          queryClient.invalidateQueries({ queryKey: ["facilityDetail"] })
        }
      />
    );

  const filteredFacilities = facilities.filter(
    (facility) =>
      facility.name.toLowerCase().includes(search.toLowerCase()) ||
      facility.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="space-y-6">
        <Card className="bg-white dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] rounded-xl p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-[#98A2B3]">
                Total Facilities
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]">
                {facilities.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs">
              <BsGridFill className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#D0D5DD]">
              Facilities List
            </h2>
            <p className="text-gray-600 dark:text-[#98A2B3]">
              Manage your hotel's general facilities.
            </p>
          </div>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              onClick={handleOpenSheet}
              className="gap-2 bg-white dark:bg-[#101828] dark:text-[#D0D5DD] border-gray-200 dark:border-[#1D2939] rounded-md shadow-xs"
            >
              Add or Remove
            </Button>
          </SheetTrigger>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search facilities by name or description..."
            className="pl-10 bg-white dark:bg-[#171F2F] border-gray-200 dark:border-[#1D2939] rounded-md shadow-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          {filteredFacilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => (
                <Card
                  key={facility.id}
                  className="flex flex-col justify-between bg-white dark:bg-[#171F2F] border-gray-200 dark:border-[#1D2939] shadow-xs hover:shadow-md transition-shadow duration-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {facility.name}
                      </CardTitle>
                      <Badge
                        className={cn(
                          "text-xs font-medium border",
                          facility.is_active
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700/60"
                            : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-700/60"
                        )}
                      >
                        {facility.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="pt-2 line-clamp-3">
                      {facility.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2 pt-2">
                      {facility.fee_applies && (
                        <Badge
                          variant="secondary"
                          className="dark:bg-gray-700 dark:text-gray-300"
                        >
                          <DollarSign className="mr-1.5 h-3 w-3" />
                          Fee Applies
                        </Badge>
                      )}
                      {facility.reservation_required && (
                        <Badge
                          variant="secondary"
                          className="dark:bg-gray-700 dark:text-gray-300"
                        >
                          <CalendarCheck className="mr-1.5 h-3 w-3" />
                          Reservation Required
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center bg-gray-50 dark:bg-[#101828]/50 p-4 mt-auto">
                    <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md text-xs text-gray-600 dark:text-gray-300">
                      {facility.code}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-full dark:hover:bg-[#1D2939]"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="dark:bg-[#101828] dark:border-[#1D2939]"
                      >
                        <DropdownMenuItem
                          onClick={() => handleRemove(facility.id)}
                          className="text-rose-600 dark:text-rose-400 dark:focus:bg-rose-900/50 dark:focus:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Facilities Found"
              description={
                search
                  ? "No facilities match your search. Try adjusting your keywords."
                  : "This hotel has not listed any facilities yet."
              }
            />
          )}
        </div>
      </div>
      <SheetContent className="w-full sm:max-w-lg p-0 bg-white dark:bg-[#101828] border-l dark:border-l-[#1D2939]">
        <FeatureSelectionSheet
          title="Manage Hotel Facilities"
          description="Select the facilities available at your hotel."
          items={allFacilities || []}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onSave={handleSave}
          isSaving={updateHotelMutation.isPending}
        />
      </SheetContent>
    </Sheet>
  );
}
