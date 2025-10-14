// --- src/pages/hotel/hotel-services.tsx ---
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
import { Plus, MoreHorizontal, Trash2, Search } from "lucide-react";
import { FeatureSelectionSheet } from "./selection-sheet";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ErrorPage from "@/components/custom/error-page";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FaConciergeBell } from "react-icons/fa";
import type { Service } from "./features";
import { Skeleton } from "@/components/ui/skeleton";

export default function HotelServices() {
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

  const serviceQueries = useQueries({
    queries: (hotel?.services || []).map((id) => ({
      queryKey: ["serviceDetail", id],
      queryFn: async () =>
        (await hotelClient.get(`services/${id}/`)).data as Service,
      enabled: !!hotel,
    })),
  });

  const services = serviceQueries
    .filter((q) => q.isSuccess)
    .map((q) => q.data as Service);
  const areServicesLoading = serviceQueries.some((q) => q.isLoading);
  const serviceQueriesError = serviceQueries.find((q) => q.isError);

  const { data: allServices } = useQuery<Service[]>({
    queryKey: ["allServices"],
    queryFn: async () => (await hotelClient.get("services/")).data.results,
    enabled: isSheetOpen,
  });

  const updateHotelMutation = useMutation({
    mutationFn: (newServiceIds: string[]) =>
      hotelClient.patch(`hotels/${hotelId}/`, { services: newServiceIds }),
    onSuccess: () => {
      toast.success("Hotel services updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["hotel", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["serviceDetail"] });
      setIsSheetOpen(false);
    },
    onError: (err) => toast.error(`Failed to update services: ${err.message}`),
  });

  const handleOpenSheet = () => {
    setSelectedIds(new Set(hotel?.services || []));
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

  const handleRemove = (serviceId: string) => {
    const currentIds = new Set(hotel?.services || []);
    currentIds.delete(serviceId);
    updateHotelMutation.mutate(Array.from(currentIds));
  };

  if (isHotelLoading || areServicesLoading) {
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
  if (serviceQueriesError)
    return (
      <ErrorPage
        error={serviceQueriesError.error as Error}
        onRetry={() =>
          queryClient.invalidateQueries({ queryKey: ["serviceDetail"] })
        }
      />
    );

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#D0D5DD]">
              Hotel Services ({services.length})
            </h2>
            <p className="text-gray-600 dark:text-[#98A2B3]">
              Manage additional services offered at your hotel.
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#5D636E]" />
              <Input
                placeholder="Search services by name or description..."
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
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="flex flex-col justify-between bg-transparent dark:bg-transparent border-[1.25px] border-[#E4E7EC] dark:border-[#1D2939] shadow-xs rounded-xl"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-[#D0D5DD]">
                        {service.name}
                      </CardTitle>
                      <Badge
                        className={cn(
                          "text-xs font-medium border",
                          service.is_active
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700/60"
                            : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-700/60"
                        )}
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="pt-2 line-clamp-3 dark:text-[#98A2B3]">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow text-sm space-y-2 dark:text-gray-400 mt-4">
                    <p className="text-[13px] text-[#667085]">
                      <span className="font-semibold dark:text-gray-300">
                        Type:
                      </span>{" "}
                      {service.service_type_name || "N/A"}
                    </p>
                    <p className="text-[13px] text-[#667085]">
                      <span className="font-semibold dark:text-gray-300">
                        Scope:
                      </span>{" "}
                      {service.service_scope_name || "N/A"}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end items-center bg-gray-50 dark:bg-[#171F2F]/50 p-4 mt-auto">
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
                          onClick={() => handleRemove(service.id)}
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
              title="No Services Found"
              description={
                search
                  ? "No services match your search. Try adjusting your keywords."
                  : "This hotel has not listed any special services yet."
              }
              icon={<FaConciergeBell className="h-10 w-10 text-gray-400" />}
            />
          )}
        </div>
      </div>
      <SheetContent className="w-full sm:max-w-lg p-0 bg-white dark:bg-[#101828] border-l dark:border-l-[#1D2939]">
        <FeatureSelectionSheet
          title="Manage Hotel Services"
          description="Select the additional services your hotel provides."
          items={allServices || []}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onSave={handleSave}
          isSaving={updateHotelMutation.isPending}
        />
      </SheetContent>
    </Sheet>
  );
}
