// // src/pages/rooms/available-rooms.tsx
// "use client";
// import { useState, useMemo, useEffect, useCallback, useRef } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// import {
//   type ColumnDef,
//   type ColumnFiltersState,
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   getFilteredRowModel,
//   getFacetedUniqueValues,
//   getPaginationRowModel,
//   useReactTable,
//   type SortingState,
//   type Row,
//   type PaginationState,
// } from "@tanstack/react-table";
// import {
//   ChevronDownIcon,
//   ChevronUpIcon,
//   CircleXIcon,
//   Columns3Icon,
//   EllipsisIcon,
//   Eye,
//   Trash2,
//   ChevronFirstIcon,
//   ChevronLastIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   Search,
//   Loader2,
//   Loader,
//   BookCheck,
//   Wrench,
//   MoreVertical,
//   PlusCircle,
// } from "lucide-react";
// import Papa from "papaparse";
// import { toast } from "sonner";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
//   DropdownMenuGroup,
// } from "@/components/ui/dropdown-menu";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { cn } from "@/lib/utils";
// import { Checkbox } from "@/components/ui/checkbox";
// import { IoRefreshOutline } from "react-icons/io5";
// import { TbFileTypeCsv } from "react-icons/tb";
// import ErrorPage from "@/components/custom/error-page";
// import hotelClient from "@/api/hotel-client";
// import { formatNumberWithOrdinal } from "@/utils/utils";

// // --- Type Definitions ---
// interface Room {
//   id: string;
//   code: string;
//   description: string;
//   price_per_night: number;
//   availability_status: "Available" | "Booked" | "Maintenance";
//   floor_number: number;
//   room_type: string;
//   max_occupancy: number;
// }

// interface RoomType {
//   id: string;
//   name: string;
//   bed_type: string;
// }

// interface PaginatedRoomsResponse {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: Room[];
// }

// interface HotelStatsData {
//   summary_counts: {
//     rooms: number;
//   };
//   availability_stats: {
//     status_counts: {
//       Available: number;
//       Booked: number;
//       Maintenance: number;
//     };
//   };
// }

// // --- Debounce Hook ---
// const useDebounce = <T,>(value: T, delay: number): T => {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);
//   return debouncedValue;
// };

// const getAvailabilityColor = (status: string) => {
//   switch (status?.toLowerCase()) {
//     case "available":
//       return "bg-green-100 text-green-800 border-green-200";
//     case "booked":
//       return "bg-yellow-100 text-yellow-800 border-yellow-200";
//     case "maintenance":
//       return "bg-red-100 text-red-800 border-red-200";
//     default:
//       return "bg-gray-100 text-gray-800 border-gray-200";
//   }
// };

// // --- Main Component ---
// export default function AvailableRooms() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const hotelId = "a3d5501e-c910-4e2e-a0b2-ad616c5910db";

//   // --- State ---
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [pagination, setPagination] = useState<PaginationState>({
//     pageIndex: 0,
//     pageSize: 15,
//   });
//   const debouncedGlobalFilter = useDebounce(globalFilter, 500);
//   const [isExporting, setIsExporting] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // --- Data Queries ---
//   const {
//     data: paginatedResponse,
//     isLoading: isLoadingRooms,
//     isError,
//     error,
//     refetch,
//     isRefetching,
//   } = useQuery<PaginatedRoomsResponse>({
//     queryKey: [
//       "available-rooms",
//       hotelId,
//       pagination.pageIndex,
//       debouncedGlobalFilter,
//       sorting,
//       columnFilters,
//     ],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         hotel_id: hotelId!,
//         availability_status: "Available",
//         page: String(pagination.pageIndex + 1),
//         page_size: String(pagination.pageSize),
//       });

//       if (debouncedGlobalFilter) params.append("search", debouncedGlobalFilter);
//       if (sorting.length > 0) {
//         const sortKey = sorting[0].id;
//         const sortDir = sorting[0].desc ? "-" : "";
//         params.append("ordering", `${sortDir}${sortKey}`);
//       }

//       const response = await hotelClient.get(`/rooms/`, { params });
//       return response.data;
//     },
//     keepPreviousData: true,
//     enabled: !!hotelId,
//   });

//   const { data: roomTypesData, isLoading: isLoadingRoomTypes } = useQuery<
//     RoomType[]
//   >({
//     queryKey: ["allRoomTypes"],
//     queryFn: async () => (await hotelClient.get("/room-types/")).data.results,
//     staleTime: Infinity,
//   });

//   const { data: hotelData, isLoading: isLoadingHotel } =
//     useQuery<HotelStatsData>({
//       queryKey: ["hotelDetails", hotelId],
//       queryFn: async () => (await hotelClient.get(`/hotels/${hotelId}/`)).data,
//       enabled: !!hotelId,
//     });

//   const roomTypesMap = useMemo(() => {
//     if (!roomTypesData) return new Map<string, RoomType>();
//     return new Map(roomTypesData.map((rt) => [rt.id, rt]));
//   }, [roomTypesData]);

//   const deleteRoomMutation = useMutation({
//     mutationFn: (roomId: string) => hotelClient.delete(`rooms/${roomId}/`),
//     onSuccess: () => {
//       toast.success("Room deleted successfully!");
//       queryClient.invalidateQueries({ queryKey: ["available-rooms"] });
//     },
//     onError: (error: any) => {
//       toast.error(
//         `Failed to delete room: ${
//           error.response?.data?.detail || error.message
//         }`
//       );
//     },
//   });

//   const stats = {
//     total: hotelData?.summary_counts?.rooms ?? 0,
//     available: hotelData?.availability_stats?.status_counts?.Available ?? 0,
//     booked: hotelData?.availability_stats?.status_counts?.Booked ?? 0,
//     maintenance: hotelData?.availability_stats?.status_counts?.Maintenance ?? 0,
//   };

//   const roomsForCurrentPage = paginatedResponse?.results ?? [];
//   const totalRoomsCount = paginatedResponse?.count ?? 0;
//   const totalPages = paginatedResponse
//     ? Math.ceil(paginatedResponse.count / pagination.pageSize)
//     : 0;
//   const hasNextPage = paginatedResponse?.next !== null;
//   const hasPreviousPage = paginatedResponse?.previous !== null;

//   const handleExport = useCallback(async () => {
//     if (!totalRoomsCount) {
//       toast.info("No rooms to export.");
//       return;
//     }
//     setIsExporting(true);
//     toast.info("Exporting all available rooms, please wait...");
//     try {
//       const params = new URLSearchParams({
//         hotel_id: hotelId!,
//         availability_status: "Available",
//         page_size: String(totalRoomsCount),
//       });
//       if (debouncedGlobalFilter) params.append("search", debouncedGlobalFilter);
//       if (sorting.length > 0) {
//         params.append(
//           "ordering",
//           `${sorting[0].desc ? "-" : ""}${sorting[0].id}`
//         );
//       }
//       const response = await hotelClient.get<PaginatedRoomsResponse>(
//         "/rooms/",
//         { params }
//       );
//       const allRooms = response.data.results;
//       const csvData = allRooms.map((r) => ({
//         "Room Code": r.code,
//         "Room Type": roomTypesMap.get(r.room_type)?.name || "N/A",
//         "Bed Type": roomTypesMap.get(r.room_type)?.bed_type || "N/A",
//         "Floor Number": r.floor_number,
//         "Price/Night (USD)": r.price_per_night,
//       }));
//       const csv = Papa.unparse(csvData);
//       const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//       const link = document.createElement("a");
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute(
//         "download",
//         `available_rooms_${new Date().toISOString().split("T")[0]}.csv`
//       );
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       toast.success("Rooms exported successfully!");
//     } catch (err) {
//       toast.error("An error occurred during the export.");
//     } finally {
//       setIsExporting(false);
//     }
//   }, [hotelId, totalRoomsCount, debouncedGlobalFilter, sorting, roomTypesMap]);

//   const columns = useMemo<ColumnDef<Room>[]>(
//     () => [
//       {
//         id: "select",
//         header: ({ table }) => (
//           <div className="flex items-center justify-center">
//             <Checkbox
//               checked={
//                 table.getIsAllPageRowsSelected() ||
//                 (table.getIsSomePageRowsSelected() && "indeterminate")
//               }
//               onCheckedChange={(value) =>
//                 table.toggleAllPageRowsSelected(!!value)
//               }
//               aria-label="Select all"
//               className="border-[#DADCE0] block mr-5"
//             />
//           </div>
//         ),
//         cell: ({ row }) => (
//           <div className="w-full flex items-center justify-center">
//             <Checkbox
//               checked={row.getIsSelected()}
//               onCheckedChange={(value) => row.toggleSelected(!!value)}
//               aria-label="Select row"
//               className="border-[#DADCE0] block mr-5"
//             />
//           </div>
//         ),
//         size: 50,
//         enableSorting: false,
//         enableHiding: false,
//       },
//       {
//         accessorKey: "code",
//         header: ({ column }) => (
//           <div className="flex items-center">
//             <SortableHeader column={column}>Room Code</SortableHeader>
//           </div>
//         ),
//         cell: ({ row }) => (
//           <div className="font-mono text-sm flex items-center">
//             {row.original.code}
//           </div>
//         ),
//         size: 160,
//       },
//       {
//         accessorKey: "room_type",
//         header: () => <div className="flex items-center">Room Type</div>,
//         cell: ({ row }) => {
//           const roomType = roomTypesMap.get(row.original.room_type);
//           return (
//             <div className="flex items-center">
//               {roomType ? (
//                 <Badge className="rounded-full px-3 py-1 bg-[#F5F5F5] text-[#595d66] hover:bg-[#EDF1F4]">
//                   {roomType.name}
//                 </Badge>
//               ) : (
//                 <span>...</span>
//               )}
//             </div>
//           );
//         },
//         size: 220,
//       },
//       {
//         id: "bed_type",
//         header: () => <div className="flex items-center">Bed Type</div>,
//         cell: ({ row }) => {
//           const roomType = roomTypesMap.get(row.original.room_type);
//           return (
//             <div className="flex items-center">
//               {roomType ? (
//                 <span>{roomType.bed_type} Bed</span>
//               ) : (
//                 <span>...</span>
//               )}
//             </div>
//           );
//         },
//         size: 180,
//       },
//       {
//         accessorKey: "max_occupancy",
//         header: () => <div className="flex items-center">Capacity</div>,
//         cell: ({ row }) => (
//           <div className="flex items-center">
//             <span>{`${row.original.max_occupancy} Guests`}</span>
//           </div>
//         ),
//         size: 120,
//       },
//       {
//         accessorKey: "floor_number",
//         header: () => <div className="flex items-center">Floor</div>,
//         cell: ({ row }) => (
//           <div className="flex items-center">
//             <span>
//               {formatNumberWithOrdinal(row.original.floor_number)} Floor
//             </span>
//           </div>
//         ),
//         size: 120,
//       },
//       {
//         accessorKey: "price_per_night",
//         header: ({ column }) => (
//           <div className="flex items-center justify-end">
//             <SortableHeader column={column} className="justify-end">
//               Price/Night
//             </SortableHeader>
//           </div>
//         ),
//         cell: ({ row }) => {
//           const formatted = new Intl.NumberFormat("en-US", {
//             style: "currency",
//             currency: "USD",
//           }).format(row.original.price_per_night);
//           return (
//             <div className="text-right font-medium flex items-center justify-end">
//               {formatted}
//             </div>
//           );
//         },
//         size: 180,
//       },
//       {
//         accessorKey: "availability_status",
//         header: () => <div className="flex items-center">Status</div>,
//         cell: ({ row }) => (
//           <div className="flex items-center">
//             <Badge
//               className={cn(
//                 getAvailabilityColor(row.getValue("availability_status"))
//               )}
//             >
//               {row.getValue("availability_status")}
//             </Badge>
//           </div>
//         ),
//         size: 160,
//       },
//       {
//         id: "actions",
//         header: () => (
//           <div className="flex items-center justify-center">Actions</div>
//         ),
//         cell: ({ row }) => (
//           <div className="flex items-center justify-center">
//             <RowActions row={row} deleteRoomMutation={deleteRoomMutation} />
//           </div>
//         ),
//         size: 80,
//         enableHiding: false,
//       },
//     ],
//     [navigate, deleteRoomMutation, roomTypesMap]
//   );

//   const table = useReactTable({
//     data: roomsForCurrentPage,
//     columns,
//     state: { sorting, columnFilters, pagination },
//     pageCount: totalPages,
//     manualPagination: true,
//     manualSorting: true,
//     manualFiltering: true,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getPaginationRowModel: getPaginationRowModel(),
//   });

//   const handleDeleteRows = () => {
//     const selectedRows = table.getSelectedRowModel().rows;
//     selectedRows.forEach((row) => deleteRoomMutation.mutate(row.original.id));
//     table.resetRowSelection();
//   };

//   if (isError) return <ErrorPage error={error as Error} onRetry={refetch} />;

//   const isLoading = isLoadingRooms || isLoadingRoomTypes || isLoadingHotel;

//   return (
//     <div className="flex-1 space-y-4">
//       <Card className="py-10 px-4 bg-[#FFF] rounded-none">
//         <div className="flex items-center justify-between px-4 mb-4">
//           <h2 className="text-3xl font-bold tracking-tight">Available Rooms</h2>
//         </div>
//         {/* StatCards */}

//         {/* - - - -  */}
//         <CardHeader>
//           <CardDescription>
//             A list of all currently available rooms.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
//             <div className="flex items-center gap-3">
//               <div className="relative">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   ref={inputRef}
//                   placeholder="Search by code, description..."
//                   value={globalFilter}
//                   onChange={(e) => setGlobalFilter(e.target.value)}
//                   className="pl-8 sm:w-[300px]"
//                 />
//                 {globalFilter && (
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="absolute right-0 top-0 h-full px-3"
//                     onClick={() => setGlobalFilter("")}
//                   >
//                     <CircleXIcon size={16} />
//                   </Button>
//                 )}
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               {table.getSelectedRowModel().rows.length > 0 && (
//                 <AlertDialog>
//                   <AlertDialogTrigger asChild>
//                     <Button variant="outline" className="gap-1">
//                       <Trash2 size={14} /> Delete (
//                       {table.getSelectedRowModel().rows.length})
//                     </Button>
//                   </AlertDialogTrigger>
//                   <AlertDialogContent>
//                     <AlertDialogHeader>
//                       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                       <AlertDialogDescription>
//                         This will permanently delete{" "}
//                         {table.getSelectedRowModel().rows.length} selected
//                         room(s). This action cannot be undone.
//                       </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                       <AlertDialogCancel>Cancel</AlertDialogCancel>
//                       <AlertDialogAction onClick={handleDeleteRows}>
//                         Delete
//                       </AlertDialogAction>
//                     </AlertDialogFooter>
//                   </AlertDialogContent>
//                 </AlertDialog>
//               )}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" className="gap-1 cursor-pointer">
//                     <Columns3Icon size={14} /> View
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
//                   {table
//                     .getAllColumns()
//                     .filter((c) => c.getCanHide())
//                     .map((c) => (
//                       <DropdownMenuCheckboxItem
//                         key={c.id}
//                         checked={c.getIsVisible()}
//                         onCheckedChange={c.toggleVisibility}
//                         className="capitalize"
//                       >
//                         {c.id.replace(/_/g, " ")}
//                       </DropdownMenuCheckboxItem>
//                     ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//               <Button
//                 variant="outline"
//                 onClick={() => refetch()}
//                 disabled={isRefetching || isLoading}
//                 className="gap-1 cursor-pointer"
//               >
//                 <IoRefreshOutline
//                   className={cn("h-4 w-4", isRefetching && "animate-spin")}
//                 />{" "}
//                 Refresh
//               </Button>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     className="h-10 w-10 rounded-full border"
//                   >
//                     <MoreVertical className="h-4 w-4" />
//                     <span className="sr-only">More options</span>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuItem
//                     onClick={handleExport}
//                     disabled={isExporting}
//                     className="gap-2"
//                   >
//                     {isExporting ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <TbFileTypeCsv className="h-4 w-4 text-emerald-600" />
//                     )}
//                     <span>
//                       {isExporting ? "Exporting..." : "Export to CSV"}
//                     </span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem
//                     onClick={() => navigate("/rooms/new-room")}
//                     className="gap-2"
//                   >
//                     <PlusCircle className="h-4 w-4 text-blue-500" />
//                     <span>Create New Room</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//           <div className="rounded-md border shadow-sm">
//             <Table>
//               <TableHeader className="bg-gray-50">
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow
//                     key={headerGroup.id}
//                     className="hover:bg-transparent border-b border-gray-200"
//                   >
//                     {headerGroup.headers.map((header) => (
//                       <TableHead
//                         key={header.id}
//                         style={{ width: `${header.getSize()}px` }}
//                         className="h-14 px-6 text-left align-middle font-medium text-muted-foreground border-r border-gray-100 last:border-r-0"
//                       >
//                         {header.isPlaceholder
//                           ? null
//                           : flexRender(
//                               header.column.columnDef.header,
//                               header.getContext()
//                             )}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//               <TableBody>
//                 {isLoading ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length}
//                       className="h-24 text-center"
//                     >
//                       <div className="w-full flex items-center justify-center">
//                         <Loader className="animate-spin" />
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : table.getRowModel().rows?.length ? (
//                   table.getRowModel().rows.map((row) => (
//                     <TableRow
//                       key={row.id}
//                       data-state={row.getIsSelected() && "selected"}
//                       className="border-b border-gray-200 hover:bg-gray-50/50"
//                     >
//                       {row.getVisibleCells().map((cell) => (
//                         <TableCell
//                           key={cell.id}
//                           className="px-6 py-4 align-middle border-r border-gray-100 last:border-r-0"
//                           style={{ minHeight: "60px" }}
//                         >
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length}
//                       className="h-24 text-center"
//                     >
//                       No available rooms found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//           <div className="flex items-center justify-between gap-4 mt-4 w-full">
//             <div className="flex-1 text-sm text-muted-foreground">
//               {table.getFilteredSelectedRowModel().rows.length} of{" "}
//               {table.getFilteredRowModel().rows.length} row(s) selected.
//             </div>
//             <div className="flex items-center gap-6">
//               <div className="flex items-center justify-center text-sm font-medium">
//                 Page {table.getState().pagination.pageIndex + 1} of{" "}
//                 {table.getPageCount()}
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Button
//                   variant="outline"
//                   className="h-8 w-8 p-0"
//                   onClick={() => table.firstPage()}
//                   disabled={!hasPreviousPage}
//                 >
//                   <ChevronFirstIcon className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="h-8 w-8 p-0"
//                   onClick={() => table.previousPage()}
//                   disabled={!hasPreviousPage}
//                 >
//                   <ChevronLeftIcon className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="h-8 w-8 p-0"
//                   onClick={() => table.nextPage()}
//                   disabled={!hasNextPage}
//                 >
//                   <ChevronRightIcon className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="h-8 w-8 p-0"
//                   onClick={() => table.lastPage()}
//                   disabled={!hasNextPage}
//                 >
//                   <ChevronLastIcon className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // Reusable component for sortable headers
// const SortableHeader = ({
//   column,
//   children,
//   className,
// }: {
//   column: any;
//   children: React.ReactNode;
//   className?: string;
// }) => (
//   <div
//     className={cn(
//       "flex items-center gap-2 cursor-pointer select-none",
//       className
//     )}
//     onClick={column.getToggleSortingHandler()}
//   >
//     {children}
//     {{
//       asc: <ChevronUpIcon size={16} className="text-muted-foreground/70" />,
//       desc: <ChevronDownIcon size={16} className="text-muted-foreground/70" />,
//     }[column.getIsSorted() as string] ?? null}
//   </div>
// );

// function RowActions({
//   row,
//   deleteRoomMutation,
// }: {
//   row: Row<Room>;
//   deleteRoomMutation: any;
// }) {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const updateStatusMutation = useMutation({
//     mutationFn: ({
//       roomId,
//       status,
//     }: {
//       roomId: string;
//       status: "Booked" | "Maintenance";
//     }) =>
//       hotelClient.patch(`/rooms/${roomId}/`, { availability_status: status }),
//     onSuccess: () => {
//       toast.success("Room status updated successfully!");
//       queryClient.invalidateQueries({ queryKey: ["available-rooms"] });
//       queryClient.invalidateQueries({ queryKey: ["booked-rooms"] });
//       queryClient.invalidateQueries({ queryKey: ["maintenance-rooms"] });
//     },
//     onError: (error: any) => {
//       toast.error(
//         `Failed to update status: ${
//           error.response?.data?.detail || error.message
//         }`
//       );
//     },
//   });

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <div className="flex justify-center">
//           <Button
//             size="icon"
//             variant="ghost"
//             className="shadow-none"
//             aria-label="Room actions"
//           >
//             <EllipsisIcon size={16} aria-hidden="true" />
//           </Button>
//         </div>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuItem onClick={() => navigate(`/rooms/${row.original.id}`)}>
//           <Eye className="mr-2 h-4 w-4" /> View Details
//         </DropdownMenuItem>
//         <DropdownMenuSeparator />
//         <DropdownMenuGroup>
//           <DropdownMenuItem
//             onClick={() =>
//               updateStatusMutation.mutate({
//                 roomId: row.original.id,
//                 status: "Booked",
//               })
//             }
//           >
//             <BookCheck className="mr-2 h-4 w-4" />
//             <span>Mark as Booked</span>
//           </DropdownMenuItem>
//           <DropdownMenuItem
//             onClick={() =>
//               updateStatusMutation.mutate({
//                 roomId: row.original.id,
//                 status: "Maintenance",
//               })
//             }
//           >
//             <Wrench className="mr-2 h-4 w-4" />
//             <span>Mark as Maintenance</span>
//           </DropdownMenuItem>
//         </DropdownMenuGroup>
//         <DropdownMenuSeparator />
//         <AlertDialog>
//           <AlertDialogTrigger asChild>
//             <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive">
//               <Trash2 className="mr-2 h-4 w-4" />
//               <span>Delete</span>
//             </div>
//           </AlertDialogTrigger>
//           <AlertDialogContent className="bg-[#FFF] rounded-md">
//             <AlertDialogHeader>
//               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//               <AlertDialogDescription>
//                 This will permanently delete the room '{row.original.code}'.
//                 This action cannot be undone.
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>Cancel</AlertDialogCancel>
//               <AlertDialogAction
//                 className="bg-red-500 border-none"
//                 onClick={() => deleteRoomMutation.mutate(row.original.id)}
//               >
//                 Delete
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  type Row,
  type PaginationState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CircleXIcon,
  Columns3Icon,
  EllipsisIcon,
  Eye,
  Trash2,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Search,
  Loader2,
  Loader,
  BookCheck,
  Wrench,
  MoreVertical,
  PlusCircle,
  CheckCircle2,
  BedDouble,
  Building,
  ArrowDownUp,
} from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { IoRefreshOutline } from "react-icons/io5";
import { TbFileTypeCsv } from "react-icons/tb";
import ErrorPage from "@/components/custom/error-page";
import hotelClient from "@/api/hotel-client";
import { formatNumberWithOrdinal } from "@/utils/utils";

// --- Type Definitions ---
interface Room {
  id: string;
  code: string;
  description: string;
  price_per_night: number;
  availability_status: "Available" | "Booked" | "Maintenance";
  floor_number: number;
  room_type: string;
  max_occupancy: number;
}

interface RoomType {
  id: string;
  name: string;
  bed_type: string;
}

interface PaginatedRoomsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Room[];
}

interface HotelStatsData {
  summary_counts: {
    rooms: number;
  };
  availability_stats: {
    status_counts: {
      Available: number;
      Booked: number;
      Maintenance: number;
    };
  };
}

// --- Debounce Hook ---
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

const getAvailabilityColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "available":
      return "bg-green-100 text-green-800 border-green-200";
    case "booked":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "maintenance":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// --- Main Component ---
export default function HotelRooms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hotelId = "a3d5501e-c910-4e2e-a0b2-ad616c5910db";

  // --- State ---
  const [statusFilter, setStatusFilter] = useState<
    "Available" | "Booked" | "Maintenance"
  >("Available");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);
  const [isExporting, setIsExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Data Queries ---
  const {
    data: paginatedResponse,
    isLoading: isLoadingRooms,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<PaginatedRoomsResponse>({
    queryKey: [
      "rooms",
      hotelId,
      statusFilter,
      pagination.pageIndex,
      debouncedGlobalFilter,
      sorting,
      columnFilters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        hotel_id: hotelId!,
        availability_status: statusFilter,
        page: String(pagination.pageIndex + 1),
        page_size: String(pagination.pageSize),
      });

      if (debouncedGlobalFilter) params.append("search", debouncedGlobalFilter);

      if (sorting.length > 0) {
        const sortKey = sorting[0].id;
        const sortDir = sorting[0].desc ? "-" : "";
        params.append("ordering", `${sortDir}${sortKey}`);
      }

      columnFilters.forEach((filter) => {
        if (filter.value) {
          params.append(filter.id, String(filter.value));
        }
      });

      const response = await hotelClient.get(`/rooms/`, { params });
      return response.data;
    },
    keepPreviousData: true,
    enabled: !!hotelId,
  });

  const { data: roomTypesData, isLoading: isLoadingRoomTypes } = useQuery<
    RoomType[]
  >({
    queryKey: ["allRoomTypes"],
    queryFn: async () => (await hotelClient.get("/room-types/")).data.results,
    staleTime: Infinity,
  });

  const { data: hotelData, isLoading: isLoadingHotel } =
    useQuery<HotelStatsData>({
      queryKey: ["hotelDetails", hotelId],
      queryFn: async () => (await hotelClient.get(`/hotels/${hotelId}/`)).data,
      enabled: !!hotelId,
    });

  const roomTypesMap = useMemo(() => {
    if (!roomTypesData) return new Map<string, RoomType>();
    return new Map(roomTypesData.map((rt) => [rt.id, rt]));
  }, [roomTypesData]);

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: string) => hotelClient.delete(`rooms/${roomId}/`),
    onSuccess: () => {
      toast.success("Room deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDetails"] });
    },
    onError: (error: any) => {
      toast.error(
        `Failed to delete room: ${
          error.response?.data?.detail || error.message
        }`
      );
    },
  });

  const stats = {
    total: hotelData?.summary_counts?.rooms ?? 0,
    available: hotelData?.availability_stats?.status_counts?.Available ?? 0,
    booked: hotelData?.availability_stats?.status_counts?.Booked ?? 0,
    maintenance: hotelData?.availability_stats?.status_counts?.Maintenance ?? 0,
  };

  const roomsForCurrentPage = paginatedResponse?.results ?? [];
  const totalRoomsCount = paginatedResponse?.count ?? 0;
  const totalPages = paginatedResponse
    ? Math.ceil(paginatedResponse.count / pagination.pageSize)
    : 0;
  const hasNextPage = paginatedResponse?.next !== null;
  const hasPreviousPage = paginatedResponse?.previous !== null;

  const handleExport = useCallback(async () => {
    if (!totalRoomsCount) {
      toast.info(`No ${statusFilter.toLowerCase()} rooms to export.`);
      return;
    }
    setIsExporting(true);
    toast.info(`Exporting all ${statusFilter.toLowerCase()} rooms...`);
    try {
      const params = new URLSearchParams({
        hotel_id: hotelId!,
        availability_status: statusFilter,
        page_size: String(totalRoomsCount),
      });
      if (debouncedGlobalFilter) params.append("search", debouncedGlobalFilter);
      if (sorting.length > 0) {
        params.append(
          "ordering",
          `${sorting[0].desc ? "-" : ""}${sorting[0].id}`
        );
      }
      columnFilters.forEach((filter) => {
        if (filter.value) {
          params.append(filter.id, String(filter.value));
        }
      });
      const response = await hotelClient.get<PaginatedRoomsResponse>(
        "/rooms/",
        { params }
      );
      const allRooms = response.data.results;
      const csvData = allRooms.map((r) => ({
        "Room Code": r.code,
        "Room Type": roomTypesMap.get(r.room_type)?.name || "N/A",
        "Bed Type": roomTypesMap.get(r.room_type)?.bed_type || "N/A",
        "Floor Number": r.floor_number,
        "Price/Night (USD)": r.price_per_night,
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${statusFilter.toLowerCase()}_rooms_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Rooms exported successfully!");
    } catch (err) {
      toast.error("An error occurred during the export.");
    } finally {
      setIsExporting(false);
    }
  }, [
    hotelId,
    totalRoomsCount,
    debouncedGlobalFilter,
    sorting,
    roomTypesMap,
    statusFilter,
    columnFilters,
  ]);

  const columns = useMemo<ColumnDef<Room>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
              className="border-[#DADCE0] block mr-5"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="w-full flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="border-[#DADCE0] block mr-5"
            />
          </div>
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <div className="flex items-center">
            <SortableHeader column={column}>Room Code</SortableHeader>
          </div>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-sm flex items-center">
            {row.original.code}
          </div>
        ),
        size: 160,
      },
      {
        accessorKey: "room_type",
        header: () => <div className="flex items-center">Room Type</div>,
        cell: ({ row }) => {
          const roomType = roomTypesMap.get(row.original.room_type);
          return (
            <div className="flex items-center">
              {roomType ? (
                <Badge className="rounded-full px-3 py-1 bg-[#F5F5F5] text-[#595d66] hover:bg-[#EDF1F4]">
                  {roomType.name}
                </Badge>
              ) : (
                <span>...</span>
              )}
            </div>
          );
        },
        size: 220,
      },
      {
        id: "bed_type",
        header: () => <div className="flex items-center">Bed Type</div>,
        cell: ({ row }) => {
          const roomType = roomTypesMap.get(row.original.room_type);
          return (
            <div className="flex items-center">
              {roomType ? (
                <span>{roomType.bed_type} Bed</span>
              ) : (
                <span>...</span>
              )}
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "max_occupancy",
        header: () => <div className="flex items-center">Capacity</div>,
        cell: ({ row }) => (
          <div className="flex items-center">
            <span>{`${row.original.max_occupancy} Guests`}</span>
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "floor_number",
        header: () => <div className="flex items-center">Floor</div>,
        cell: ({ row }) => (
          <div className="flex items-center">
            <span>
              {formatNumberWithOrdinal(row.original.floor_number)} Floor
            </span>
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "price_per_night",
        header: ({ column }) => (
          <div className="flex items-center justify-end">
            <SortableHeader column={column} className="justify-end">
              Price/Night
            </SortableHeader>
          </div>
        ),
        cell: ({ row }) => {
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.original.price_per_night);
          return (
            <div className="text-right font-medium flex items-center justify-end">
              {formatted}
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "availability_status",
        header: () => <div className="flex items-center">Status</div>,
        cell: ({ row }) => (
          <div className="flex items-center">
            <Badge
              className={cn(
                getAvailabilityColor(row.getValue("availability_status"))
              )}
            >
              {row.getValue("availability_status")}
            </Badge>
          </div>
        ),
        size: 160,
      },
      {
        id: "actions",
        header: () => (
          <div className="flex items-center justify-center">Actions</div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <RowActions row={row} deleteRoomMutation={deleteRoomMutation} />
          </div>
        ),
        size: 80,
        enableHiding: false,
      },
    ],
    [navigate, deleteRoomMutation, roomTypesMap]
  );

  const table = useReactTable({
    data: roomsForCurrentPage,
    columns,
    state: { sorting, columnFilters, pagination },
    pageCount: totalPages,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    selectedRows.forEach((row) => deleteRoomMutation.mutate(row.original.id));
    table.resetRowSelection();
  };

  if (isError) return <ErrorPage error={error as Error} onRetry={refetch} />;

  const isLoading = isLoadingRooms || isLoadingRoomTypes || isLoadingHotel;
  const tabs = ["Available", "Booked", "Maintenance"];

  return (
    <div className="flex-1 space-y-4">
      <Card className="py-10 px-4 bg-[#FFF] rounded-none">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-3xl font-bold tracking-tight">Hotel Rooms</h2>
        </div>

        <CardHeader>
          <CardDescription className="text-[1rem]">
            A list of all {statusFilter.toLowerCase()} rooms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="p-1 flex items-center gap-2 bg-[#F9FAFB] border border-[#E4E7EC] shadow-xs rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab as typeof statusFilter)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                    statusFilter === tab
                      ? "bg-[#FFF] text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab} ({stats[tab.toLowerCase() as keyof typeof stats] ?? 0})
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Search by code..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-8 sm:w-[250px] lg:w-[300px]"
                />
                {globalFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setGlobalFilter("")}
                  >
                    <CircleXIcon size={16} />
                  </Button>
                )}
              </div>
              <Select
                value={
                  (table.getColumn("room_type")?.getFilterValue() as string) ??
                  ""
                }
                onValueChange={(value) => {
                  table
                    .getColumn("room_type")
                    ?.setFilterValue(value === "all" ? "" : value);
                }}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Room Types</SelectItem>
                  {roomTypesData?.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={
                  (table
                    .getColumn("floor_number")
                    ?.getFilterValue() as string) ?? ""
                }
                onValueChange={(value) => {
                  table
                    .getColumn("floor_number")
                    ?.setFilterValue(value === "all" ? "" : value);
                }}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder="Floors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((floor) => (
                    <SelectItem key={floor} value={String(floor)}>
                      {formatNumberWithOrdinal(floor)} Floor
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={
                  sorting.find((s) => s.id === "price_per_night")
                    ? sorting[0].desc
                      ? "desc"
                      : "asc"
                    : ""
                }
                onValueChange={(value) => {
                  if (value) {
                    setSorting([
                      { id: "price_per_night", desc: value === "desc" },
                    ]);
                  } else {
                    setSorting([]);
                  }
                }}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder="Sort by Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Price: Low to High</SelectItem>
                  <SelectItem value="desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              {table.getSelectedRowModel().rows.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <Trash2 size={14} /> Delete (
                      {table.getSelectedRowModel().rows.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete{" "}
                        {table.getSelectedRowModel().rows.length} selected
                        room(s). This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteRows}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1 cursor-pointer">
                    <Columns3Icon size={14} /> View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  {table
                    .getAllColumns()
                    .filter((c) => c.getCanHide())
                    .map((c) => (
                      <DropdownMenuCheckboxItem
                        key={c.id}
                        checked={c.getIsVisible()}
                        onCheckedChange={c.toggleVisibility}
                        className="capitalize"
                      >
                        {c.id.replace(/_/g, " ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isRefetching || isLoading}
                className="gap-1 cursor-pointer"
              >
                <IoRefreshOutline
                  className={cn("h-4 w-4", isRefetching && "animate-spin")}
                />{" "}
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleExport}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TbFileTypeCsv className="h-4 w-4 text-emerald-600" />
                    )}
                    <span>
                      {isExporting ? "Exporting..." : "Export to CSV"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/rooms/new-room")}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4 text-blue-500" />
                    <span>Create New Room</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent border-b border-gray-200"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className="h-14 px-6 text-left align-middle font-medium text-muted-foreground border-r border-gray-100 last:border-r-0"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="w-full flex items-center justify-center">
                        <Loader className="animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-b border-gray-200 hover:bg-gray-50/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-6 py-4 align-middle border-r border-gray-100 last:border-r-0"
                          style={{ minHeight: "60px" }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No {statusFilter.toLowerCase()} rooms found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-4 mt-4 w-full">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.firstPage()}
                  disabled={!hasPreviousPage}
                >
                  <ChevronFirstIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!hasPreviousPage}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!hasNextPage}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.lastPage()}
                  disabled={!hasNextPage}
                >
                  <ChevronLastIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Reusable Sub-components ---

const SortableHeader = ({
  column,
  children,
  className,
}: {
  column: any;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-2 cursor-pointer select-none",
      className
    )}
    onClick={column.getToggleSortingHandler()}
  >
    {children}
    {{
      asc: <ChevronUpIcon size={16} className="text-muted-foreground/70" />,
      desc: <ChevronDownIcon size={16} className="text-muted-foreground/70" />,
    }[column.getIsSorted() as string] ?? null}
  </div>
);

function RowActions({
  row,
  deleteRoomMutation,
}: {
  row: Row<Room>;
  deleteRoomMutation: any;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const roomStatus = row.original.availability_status;

  const updateStatusMutation = useMutation({
    mutationFn: ({
      roomId,
      status,
    }: {
      roomId: string;
      status: "Available" | "Booked" | "Maintenance";
    }) =>
      hotelClient.patch(`/rooms/${roomId}/`, { availability_status: status }),
    onSuccess: (_, variables) => {
      toast.success(`Room marked as ${variables.status}!`);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDetails"] });
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update status: ${
          error.response?.data?.detail || error.message
        }`
      );
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-center">
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none"
            aria-label="Room actions"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/rooms/${row.original.id}`)}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {roomStatus !== "Available" && (
            <DropdownMenuItem
              onClick={() =>
                updateStatusMutation.mutate({
                  roomId: row.original.id,
                  status: "Available",
                })
              }
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>Mark as Available</span>
            </DropdownMenuItem>
          )}
          {roomStatus !== "Booked" && (
            <DropdownMenuItem
              onClick={() =>
                updateStatusMutation.mutate({
                  roomId: row.original.id,
                  status: "Booked",
                })
              }
            >
              <BookCheck className="mr-2 h-4 w-4" />
              <span>Mark as Booked</span>
            </DropdownMenuItem>
          )}
          {roomStatus !== "Maintenance" && (
            <DropdownMenuItem
              onClick={() =>
                updateStatusMutation.mutate({
                  roomId: row.original.id,
                  status: "Maintenance",
                })
              }
            >
              <Wrench className="mr-2 h-4 w-4" />
              <span>Mark as Maintenance</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#FFF] rounded-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the room '{row.original.code}'.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 border-none"
                onClick={() => deleteRoomMutation.mutate(row.original.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
