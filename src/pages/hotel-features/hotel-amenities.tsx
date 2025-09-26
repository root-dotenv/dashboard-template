// --- src/pages/hotel/hotel-amenities.tsx ---
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
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./empty-state";
import { MoreHorizontal, Trash2, Star, Search, Plus } from "lucide-react";
import { FeatureSelectionSheet } from "./selection-sheet";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ErrorPage from "@/components/custom/error-page";
import { cn } from "@/lib/utils";
import type { Amenity } from "./features";
import { Skeleton } from "@/components/ui/skeleton";

export default function HotelAmenities() {
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

  const amenityQueries = useQueries({
    queries: (hotel?.amenities || []).map((amenityId) => ({
      queryKey: ["amenityDetail", amenityId],
      queryFn: async () =>
        (await hotelClient.get(`amenities/${amenityId}/`)).data as Amenity,
      enabled: !!hotel,
    })),
  });

  const amenities = amenityQueries
    .filter((q) => q.isSuccess)
    .map((q) => q.data as Amenity);
  const areAmenitiesLoading = amenityQueries.some((q) => q.isLoading);
  const amenityQueriesError = amenityQueries.find((q) => q.isError);

  const { data: allAmenities } = useQuery<Amenity[]>({
    queryKey: ["allAmenities"],
    queryFn: async () => (await hotelClient.get("amenities/")).data.results,
    enabled: isSheetOpen,
  });

  const updateHotelMutation = useMutation({
    mutationFn: (newAmenityIds: string[]) =>
      hotelClient.patch(`hotels/${hotelId}/`, { amenities: newAmenityIds }),
    onSuccess: () => {
      toast.success("Hotel amenities updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["hotel", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["amenityDetail"] });
      setIsSheetOpen(false);
    },
    onError: (err) => toast.error(`Failed to update amenities: ${err.message}`),
  });

  const handleOpenSheet = () => {
    setSelectedIds(new Set(hotel?.amenities || []));
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

  const handleRemove = (amenityId: string) => {
    const currentIds = new Set(hotel?.amenities || []);
    currentIds.delete(amenityId);
    updateHotelMutation.mutate(Array.from(currentIds));
  };

  if (isHotelLoading || areAmenitiesLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isHotelError)
    return <ErrorPage error={hotelError as Error} onRetry={refetchHotel} />;
  if (amenityQueriesError)
    return (
      <ErrorPage
        error={amenityQueriesError.error as Error}
        onRetry={() =>
          queryClient.invalidateQueries({ queryKey: ["amenityDetail"] })
        }
      />
    );

  const filteredAmenities = amenities.filter(
    (amenity) =>
      amenity.name.toLowerCase().includes(search.toLowerCase()) ||
      amenity.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="space-y-6">
        {/* --- Redesigned Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#D0D5DD]">
              Hotel Amenities ({amenities.length})
            </h2>
            <p className="text-gray-600 dark:text-[#98A2B3]">
              Manage the amenities available in your hotel rooms.
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#5D636E]" />
              <Input
                placeholder="Search amenities by name or description..."
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

        {/* --- Redesigned Content Grid --- */}
        <div>
          {filteredAmenities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAmenities.map((amenity) => (
                <Card
                  key={amenity.id}
                  className="flex flex-col justify-between bg-transparent dark:bg-transparent border-[1.25px] border-[#E4E7EC] dark:border-[#1D2939] shadow-xs rounded-xl"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-[#D0D5DD]">
                        {amenity.name}
                      </CardTitle>
                      <Badge
                        className={cn(
                          "text-xs font-medium border",
                          amenity.is_active
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700/60"
                            : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-700/60"
                        )}
                      >
                        {amenity.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="pt-2 line-clamp-3 dark:text-[#98A2B3]">
                      {amenity.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center p-4 mt-auto">
                    <span className="font-mono bg-[#EFF6FF] text-[#1547E5] dark:bg-[#101828] px-2 py-1 rounded-md text-xs dark:text-[#98A2B3]">
                      {amenity.code}
                    </span>
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
                          onClick={() => handleRemove(amenity.id)}
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
              title="No Amenities Found"
              description={
                search
                  ? "No amenities match your search. Try adjusting your keywords."
                  : "This hotel has not listed any in-room amenities yet."
              }
              icon={<Star className="h-10 w-10 text-gray-400" />}
            />
          )}
        </div>
      </div>
      <SheetContent className="w-full sm:max-w-lg p-0 bg-[#FFF] dark:bg-[#101828] border-l dark:border-l-[#1D2939]">
        <FeatureSelectionSheet
          title="Manage Hotel Amenities"
          description="Select the amenities available in your rooms to attract more guests."
          items={allAmenities || []}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onSave={handleSave}
          isSaving={updateHotelMutation.isPending}
        />
      </SheetContent>
    </Sheet>
  );
}
