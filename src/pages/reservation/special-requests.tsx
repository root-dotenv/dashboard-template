"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Search,
  Loader2,
  Inbox,
  NotebookPen,
  List,
  Calendar,
  User,
} from "lucide-react";
import { IoAlert, IoArrowForward, IoRefreshOutline } from "react-icons/io5";
import bookingClient from "@/api/booking-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServerPagination from "@/components/comp-459";
import ErrorPage from "@/components/custom/error-page";
import { cn } from "@/lib/utils";

// --- Type Definitions ---
interface Booking {
  id: string;
  full_name: string;
  code: string;
  start_date: string;
  end_date: string;
  special_requests: string | null;
  service_notes: string | null;
}

interface GuestNote {
  id: string;
  guestName: string;
  bookingCode: string;
  startDate: string;
  endDate: string;
  bookingId: string;
  specialRequest?: string;
  serviceNote?: string;
}

interface PaginatedBookingsResponse {
  count: number;
  results: Booking[];
}

// --- Helper Functions ---
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const isMeaningfulNote = (note: string | null): boolean => {
  return !!note && note.trim() !== "";
};

// --- Sub-component for displaying a single guest card ---
const GuestNotesCard = ({ item }: { item: GuestNote }) => {
  const navigate = useNavigate();
  const hasRequest = !!item.specialRequest;
  const hasServiceNote = !!item.serviceNote;

  return (
    <div className="group relative bg-white dark:bg-[#171F2F] border border-gray-200 dark:border-[#1D2939] rounded-xl overflow-hidden hover:shadow hover:border-blue-300 dark:hover:border-blue-500/30 transition-all duration-300 h-full">
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-blue-50/30 dark:bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative p-6 flex flex-col justify-between gap-5 h-full">
        <div className="flex-grow space-y-4">
          {/* Guest header info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <p className="font-semibold text-gray-900 dark:text-[#D0D5DD] text-base">
                {item.guestName}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-[#101828] px-2 py-1 rounded-md">
                #{item.bookingCode}
              </p>
              <div className="flex gap-1"></div>
            </div>
          </div>

          {/* Notes content */}
          <div className="space-y-4">
            {/* Special Request */}
            {hasRequest && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <IoAlert className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Special Request
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute -left-2 top-0 w-1 h-full bg-amber-400 rounded-full opacity-30" />
                  <blockquote className="pl-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    "{item.specialRequest}"
                  </blockquote>
                </div>
              </div>
            )}

            {/* Service Note */}
            {hasServiceNote && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <NotebookPen className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Service Note
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute -left-2 top-0 w-1 h-full bg-emerald-400 rounded-full opacity-30" />
                  <blockquote className="pl-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    "{item.serviceNote}"
                  </blockquote>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with guest details */}
        <div className="border-t border-gray-100 dark:border-[#1D2939] pt-4 space-y-4">
          {/* Stay dates */}
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#101828] px-3 py-2 rounded-lg">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-medium">Stay:</span>
            <span>
              {format(new Date(item.startDate), "MMM dd")} -{" "}
              {format(new Date(item.endDate), "MMM dd, yyyy")}
            </span>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/bookings/${item.bookingId}`)}
              className="w-full group/btn dark:bg-[#101828] dark:border-[#1D2939] dark:hover:bg-[#1C2433] dark:text-[#D0D5DD] 
                         bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 
                         rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
            >
              <span>View Guest Details</span>
              <IoArrowForward className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function SpecialRequests() {
  const hotelId = "a3d5501e-c910-4e2e-a0b2-ad616c5910db";
  const ITEMS_PER_PAGE = 12;

  const [currentPage, setCurrentPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);

  const {
    data: paginatedResponse,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<PaginatedBookingsResponse>({
    queryKey: [
      "allBookingsForNotes",
      hotelId,
      currentPage,
      debouncedGlobalFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        microservice_item_id: hotelId,
        page: String(currentPage),
        page_size: String(ITEMS_PER_PAGE),
        current_bookings: "true",
      });
      if (debouncedGlobalFilter) {
        params.append("full_name", debouncedGlobalFilter);
      }
      const response = await bookingClient.get(`/bookings`, { params });
      return response.data;
    },
    keepPreviousData: true,
    enabled: !!hotelId,
  });

  const allNotes = useMemo(() => {
    const bookings = paginatedResponse?.results ?? [];
    const guestNotesMap = new Map<string, GuestNote>();

    bookings.forEach((booking) => {
      const hasRequest = isMeaningfulNote(booking.special_requests);
      const hasServiceNote = isMeaningfulNote(booking.service_notes);

      if (hasRequest || hasServiceNote) {
        guestNotesMap.set(booking.id, {
          id: booking.id,
          guestName: booking.full_name,
          bookingCode: booking.code,
          startDate: booking.start_date,
          endDate: booking.end_date,
          bookingId: booking.id,
          specialRequest: hasRequest ? booking.special_requests! : undefined,
          serviceNote: hasServiceNote ? booking.service_notes! : undefined,
        });
      }
    });

    return Array.from(guestNotesMap.values());
  }, [paginatedResponse]);

  const totalPages = Math.ceil(
    (paginatedResponse?.count ?? 0) / ITEMS_PER_PAGE
  );

  const stats = useMemo(() => {
    const requestCount = allNotes.filter((n) => !!n.specialRequest).length;
    const serviceNoteCount = allNotes.filter((n) => !!n.serviceNote).length;
    return [
      {
        label: "Total Notes",
        sublabel: "Current Page",
        value: allNotes.length,
        icon: List,
        gradient: "from-blue-500 to-cyan-500",
        bgGradient: "from-blue-50 to-cyan-50",
        darkBgGradient: "from-blue-900/20 to-cyan-900/20",
        textColor: "text-blue-600",
      },
      {
        label: "Special Requests",
        sublabel: "Urgent Items",
        value: requestCount,
        icon: IoAlert,
        gradient: "from-amber-500 to-orange-500",
        bgGradient: "from-amber-50 to-orange-50",
        darkBgGradient: "from-amber-900/20 to-orange-900/20",
        textColor: "text-amber-600",
      },
      {
        label: "Service Notes",
        sublabel: "Additional Info",
        value: serviceNoteCount,
        icon: NotebookPen,
        gradient: "from-emerald-500 to-teal-500",
        bgGradient: "from-emerald-50 to-teal-50",
        darkBgGradient: "from-emerald-900/20 to-teal-900/20",
        textColor: "text-emerald-600",
      },
    ];
  }, [allNotes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:bg-[#101828]">
      {/* Header */}
      <div className="bg-white/90 dark:bg-[#101828]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30 shadow-xs">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]">
                  Guest Requests & Notes
                </h1>
              </div>
              <p className="text-gray-600 dark:text-[#98A2B3] text-sm max-w-2xl leading-relaxed">
                Monitor and manage all special requests and service notes from
                your active guests in real-time
              </p>
            </div>

            {/* Enhanced search and refresh controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#5D636E]" />
                <Input
                  placeholder="Search guests..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-11 pr-4 py-3 w-full sm:w-72 bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939] 
                           text-gray-800 dark:text-[#D0D5DD] rounded-lg shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           dark:placeholder:text-[#5D636E] transition-all duration-200"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isRefetching || isLoading}
                className="gap-2 bg-white dark:bg-[#101828] dark:text-[#D0D5DD] border-gray-200 dark:border-[#1D2939] rounded-lg shadow-xs hover:shadow px-4 py-3 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500/50"
              >
                <IoRefreshOutline
                  className={cn("h-4 w-4", isRefetching && "animate-spin")}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
        {/* Enhanced stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden bg-white dark:bg-[#171F2F] border border-gray-200 dark:border-[#1D2939] rounded-2xl p-6 shadow-xs hover:shadow transition-all duration-300 group"
              )}
            >
              {/* Gradient background overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300",
                  `${stat.bgGradient} dark:${stat.darkBgGradient}`
                )}
              />

              <div className="relative flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-3 rounded-xl bg-gradient-to-r shadow",
                        stat.gradient
                      )}
                    >
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-[#98A2B3]">
                        {stat.label}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-[#667085]">
                        {stat.sublabel}
                      </p>
                    </div>
                  </div>
                  <div className="pl-1">
                    <p
                      className={cn(
                        "text-3xl font-bold text-gray-900 dark:text-[#D0D5DD]",
                        stat.textColor
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-24 bg-white dark:bg-[#171F2F] rounded-2xl border border-gray-200 dark:border-[#1D2939]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Loading guest requests...
            </p>
          </div>
        )}

        {/* Error state */}
        {isError && <ErrorPage error={error as Error} onRetry={refetch} />}

        {/* Empty state */}
        {!isLoading && allNotes.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-transparent">
            <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">
              No requests or notes found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
              There are currently no special requests or service notes from your
              active guests.
              {globalFilter && " Try adjusting your search criteria."}
            </p>
            {globalFilter && (
              <Button
                variant="outline"
                onClick={() => setGlobalFilter("")}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Cards grid */}
        {!isLoading && allNotes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allNotes.map((item) => (
              <GuestNotesCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-end items-center pt-8">
          {totalPages > 1 && (
            <ServerPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
