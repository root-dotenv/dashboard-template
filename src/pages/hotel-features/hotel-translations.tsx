// --- src/pages/hotel/hotel-translations.tsx ---
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
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./empty-state";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Loader2,
  Languages,
  Search,
} from "lucide-react";
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
import type { Country, EnrichedTranslation, Translation } from "./features";
import { cn } from "@/lib/utils";
import { MdGTranslate } from "react-icons/md";

export default function HotelTranslations() {
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

  const translationQueries = useQueries({
    queries: (hotel?.translations || []).map((id) => ({
      queryKey: ["enrichedTranslationDetail", id],
      queryFn: async (): Promise<EnrichedTranslation> => {
        const translationRes = await hotelClient.get(`translations/${id}/`);
        const translationData = translationRes.data as Translation;
        const countryRes = await hotelClient.get(
          `countries/${translationData.country}/`
        );
        const countryData = countryRes.data as Country;
        return { ...translationData, country_name: countryData.name };
      },
      enabled: !!hotel,
    })),
  });

  const translations = translationQueries
    .filter((q) => q.isSuccess)
    .map((q) => q.data as EnrichedTranslation);
  const areTranslationsLoading = translationQueries.some((q) => q.isLoading);
  const translationQueriesError = translationQueries.find((q) => q.isError);

  const { data: allTranslations } = useQuery<EnrichedTranslation[]>({
    queryKey: ["allEnrichedTranslations"],
    queryFn: async () => {
      const transRes = await hotelClient.get("translations/");
      const transData = transRes.data.results as Translation[];
      const countryPromises = transData.map((t) =>
        hotelClient.get(`countries/${t.country}/`)
      );
      const countryResponses = await Promise.all(countryPromises);
      const countries = countryResponses.map((res) => res.data as Country);
      const countryMap = new Map(countries.map((c) => [c.id, c.name]));
      return transData.map((t) => ({
        ...t,
        country_name: countryMap.get(t.country) || "Unknown",
      }));
    },
    enabled: isSheetOpen,
  });

  const sheetItems =
    allTranslations?.map((t) => ({
      id: t.id,
      name: `${t.language} (${t.country_name})`,
    })) || [];

  const updateHotelMutation = useMutation({
    mutationFn: (newTranslationIds: string[]) =>
      hotelClient.patch(`hotels/${hotelId}/`, {
        translations: newTranslationIds,
      }),
    onSuccess: () => {
      toast.success("Hotel translations updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["hotel", hotelId] });
      queryClient.invalidateQueries({
        queryKey: ["enrichedTranslationDetail"],
      });
      setIsSheetOpen(false);
    },
    onError: (err) =>
      toast.error(`Failed to update translations: ${err.message}`),
  });

  const handleOpenSheet = () => {
    setSelectedIds(new Set(hotel?.translations || []));
    setIsSheetOpen(true);
  };

  const handleSelectionChange = (id: string, isSelected: boolean) => {
    const newIds = new Set(selectedIds);
    isSelected ? newIds.add(id) : newIds.delete(id);
    setSelectedIds(newIds);
  };

  const handleSave = () => {
    if (Array.from(selectedIds).length === 0) {
      toast.warning("Your hotel must have at least one translation.");
      return;
    }
    updateHotelMutation.mutate(Array.from(selectedIds));
  };

  const handleRemove = (translationId: string) => {
    const currentIds = new Set(hotel?.translations || []);
    if (currentIds.size <= 1) {
      toast.warning("Your hotel must have at least one translation.");
      return;
    }
    currentIds.delete(translationId);
    updateHotelMutation.mutate(Array.from(currentIds));
  };

  if (isHotelLoading || areTranslationsLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (isHotelError)
    return <ErrorPage error={hotelError as Error} onRetry={refetchHotel} />;
  if (translationQueriesError)
    return (
      <ErrorPage
        error={translationQueriesError.error as Error}
        onRetry={() =>
          queryClient.invalidateQueries({
            queryKey: ["enrichedTranslationDetail"],
          })
        }
      />
    );

  const filteredTranslations = translations.filter(
    (t) =>
      t.language.toLowerCase().includes(search.toLowerCase()) ||
      t.country_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="space-y-6">
        <Card className="bg-white dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] rounded-xl p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-[#98A2B3]">
                Total Translations
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]">
                {translations.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 shadow-xs">
              <MdGTranslate className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#D0D5DD]">
              Translations List
            </h2>
            <p className="text-gray-600 dark:text-[#98A2B3]">
              Manage your hotel's language options.
            </p>
          </div>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              onClick={handleOpenSheet}
              className="gap-2 bg-white dark:bg-[#101828] dark:text-[#D0D5DD] border-gray-200 dark:border-[#1D2939] rounded-md shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add / Remove
            </Button>
          </SheetTrigger>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search by language or country..."
            className="pl-10 bg-white dark:bg-[#171F2F] border-gray-200 dark:border-[#1D2939] rounded-md shadow-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          {filteredTranslations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTranslations.map((translation) => (
                <Card
                  key={translation.id}
                  className="flex flex-col justify-between bg-white dark:bg-[#171F2F] border-gray-200 dark:border-[#1D2939] shadow-xs hover:shadow-md transition-shadow duration-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {translation.language} ({translation.country_name})
                      </CardTitle>
                      <Badge
                        className={cn(
                          "text-xs font-medium border",
                          translation.is_active
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700/60"
                            : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-700/60"
                        )}
                      >
                        {translation.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Languages className="mr-2 h-4 w-4" />
                      <span>Language Option</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end items-center bg-gray-50 dark:bg-[#101828]/50 p-4 mt-auto">
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
                          onClick={() => handleRemove(translation.id)}
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
              title="No Translations Found"
              description={
                search
                  ? "No translations match your search. Try adjusting your keywords."
                  : "This hotel has not listed any translations yet."
              }
            />
          )}
        </div>
      </div>
      <SheetContent className="w-full sm:max-w-lg p-0 bg-white dark:bg-[#101828] border-l dark:border-l-[#1D2939]">
        <FeatureSelectionSheet
          title="Manage Hotel Translations"
          description="Select the languages your hotel information is available in."
          items={sheetItems}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onSave={handleSave}
          isSaving={updateHotelMutation.isPending}
        />
      </SheetContent>
    </Sheet>
  );
}
