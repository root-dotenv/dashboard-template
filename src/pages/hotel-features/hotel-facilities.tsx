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
import { MoreHorizontal, Trash2, Search, Plus } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  const hotelId = "552e27a3-7ac2-4f89-bc80-1349f3198105";

  const facilityQueries = useQueries({
    queries: (hotel?.facilities || []).map((id) => ({
      queryKey: ["facilityDetail", id],
      queryFn: async () =>
        (await hotelClient.get(`facilities/${id}/`)).data as Facility,
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
    updateHotelMutation.mutate(Array.from(selectedIds));
  };

  const handleRemove = (facilityId: string) => {
    const currentIds = new Set(hotel?.facilities || []);
    currentIds.delete(facilityId);
    updateHotelMutation.mutate(Array.from(currentIds));
  };

  if (isHotelLoading || areFacilitiesLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-xl" />
        ))}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#D0D5DD]">
              Hotel Facilities ({facilities.length})
            </h2>
            <p className="text-gray-600 dark:text-[#98A2B3]">
              Manage your hotel's general facilities.
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#5D636E]" />
              <Input
                placeholder="Search facilities by name or description..."
                className="h-10 pl-10 pr-4 w-full bg-white dark:bg-[#171F2F] border-[1.25px] border-[#E4E7EC] dark:border-[#1D2939] rounded-lg shadow-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <SheetTrigger asChild>
              <Button
                onClick={handleOpenSheet}
                className="h-10 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-[#FFF] hover:text-[#FFF] px-4 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add or Remove</span>
              </Button>
            </SheetTrigger>
          </div>
        </div>

        <div>
          {filteredFacilities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => (
                <Card
                  key={facility.id}
                  className="flex flex-col justify-between bg-transparent dark:bg-transparent border-[1.25px] border-[#E4E7EC] dark:border-[#1D2939] shadow-xs rounded-xl"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-[#D0D5DD]">
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
                    <CardDescription className="pt-2 line-clamp-3 dark:text-[#98A2B3]">
                      {facility.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow mt-2">
                    <div className="flex flex-wrap gap-2 pt-2">
                      {facility.fee_applies && (
                        <Badge className="dark:bg-[#171F2F] bg-[#EFF6FF] border border-blue-200 text-[#1547E5] rounded-full dark:text-[#98A2B3] dark:border-[#1D2939]">
                          Fee Applies
                        </Badge>
                      )}
                      {facility.reservation_required && (
                        <Badge className="dark:bg-[#171F2F] bg-[#EFF6FF] border border-blue-200 text-[#1547E5] rounded-full dark:text-[#98A2B3] dark:border-[#1D2939]">
                          Reservation Required
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center  p-4 mt-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-full dark:hover:bg-[#1D2939]"
                        >
                          <MoreHorizontal className="h-5 w-5 dark:text-[#98A2B3]" />
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
              icon={<BsGridFill className="h-10 w-10 text-gray-400" />}
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
