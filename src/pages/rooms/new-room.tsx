// src/pages/rooms/new-room.tsx
"use client";
import { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import hotelClient from "../../api/hotel-client";
import ErrorPage from "@/components/custom/error-page";

// --- Icon Imports ---
import {
  Loader2,
  Layers,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Bed,
  Image as ImageIcon,
  Check,
  UploadCloud,
  HelpCircle,
} from "lucide-react";

// --- TYPE DEFINITIONS, SCHEMAS, AND API FUNCTIONS (UNCHANGED) ---
interface RoomTypeOption {
  id: string;
  name: string;
}
interface AmenityOption {
  id: string;
  name: string;
}
const HOTEL_ID = "552e27a3-7ac2-4f89-bc80-1349f3198105";

const singleRoomSchema = yup.object({
  hotel: yup.string().required(),
  code: yup.string().required("Room code is required."),
  description: yup.string().required("Description is required."),
  room_type: yup.string().required("A room type is required."),
  max_occupancy: yup
    .number()
    .typeError("Max occupancy must be a number")
    .required("Max occupancy is required")
    .min(1, "Occupancy must be at least 1."),
  price_per_night: yup
    .number()
    .typeError("Price must be a number")
    .required("Price per night is required")
    .positive("Price must be a positive number."),
  availability_status: yup
    .string()
    .oneOf(["Available", "Booked", "Maintenance"], "Invalid status")
    .required("Availability status is required."),
  room_amenities: yup.array().of(yup.string().required()).optional(),
  image: yup
    .string()
    .url("Must be a valid image URL.")
    .required("A primary image URL is required."),
});

const bulkCreateSchema = yup.object({
  hotel_id: yup.string().required(),
  room_type_id: yup.string().required("A room type is required."),
  description: yup.string().optional(),
  count: yup
    .number()
    .typeError("Count must be a number.")
    .required("Number of rooms is required.")
    .min(1, "Must create at least one room."),
  price_per_night: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required.")
    .positive("Price must be a positive number."),
  amenity_ids: yup.array().of(yup.string().required()).optional(),
  image_urls: yup
    .string()
    .required("At least one image URL is required.")
    .test("is-valid-urls", "Each line must contain a valid URL.", (value) => {
      if (!value) return false;
      const urls = value
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url);
      return urls.every((url) => yup.string().url().isValidSync(url));
    }),
});

type SingleRoomFormData = yup.InferType<typeof singleRoomSchema>;
type BulkCreateFormShape = yup.InferType<typeof bulkCreateSchema>;

const createSingleRoom = async (data: SingleRoomFormData) => {
  const response = await hotelClient.post("rooms/", data);
  return response.data;
};

const bulkCreateRooms = async (
  data: Omit<BulkCreateFormShape, "image_urls"> & { image_urls: string[] }
) => {
  const response = await hotelClient.post("/rooms/bulk-create/", data);
  return response.data;
};

// --- STYLING CONSTANTS ---
const focusRingClass =
  "focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 focus:border-blue-500 dark:focus:border-blue-400";
const inputBaseClass =
  "bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500";

// ##################################################################
// ### 1. MAIN PAGE COMPONENT (PARENT) ###
// ##################################################################
export default function NewRoomPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  const {
    data: roomTypes,
    isLoading: isLoadingRoomTypes,
    isError: isRoomTypesError,
    error: roomTypesError,
    refetch: refetchRoomTypes,
  } = useQuery<RoomTypeOption[]>({
    queryKey: ["allRoomTypes"],
    queryFn: async () => (await hotelClient.get("room-types/")).data.results,
    staleTime: 1000 * 60 * 30, // Cache for 30 mins
  });

  const {
    data: allAmenities,
    isLoading: isLoadingAmenities,
    isError: isAmenitiesError,
    error: amenitiesError,
    refetch: refetchAmenities,
  } = useQuery<AmenityOption[]>({
    queryKey: ["allAmenities"],
    queryFn: async () => (await hotelClient.get("amenities/")).data.results,
    staleTime: 1000 * 60 * 30, // Cache for 30 mins
  });

  if (isLoadingRoomTypes || isLoadingAmenities) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isRoomTypesError || isAmenitiesError) {
    return (
      <ErrorPage
        error={(roomTypesError || amenitiesError) as Error}
        onRetry={isRoomTypesError ? refetchRoomTypes : refetchAmenities}
      />
    );
  }

  const TABS_CONFIG = [
    { value: "single", label: "Create Single Room", icon: Bed },
    { value: "bulk", label: "Create Multiple Rooms", icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101828]">
      <header className="bg-white/80 dark:bg-[#101828d1] backdrop-blur-sm border-b rounded dark:border-gray-800 sticky top-0 z-30 px-4 md:px-6 py-4">
        {/* --- RESPONSIVE UPDATE: Header stacks on mobile --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Link
              to="/rooms/hotel-rooms"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mb-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Rooms
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Add New Hotel Room(s)
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#101828] border dark:border-none rounded-lg p-1">
            {TABS_CONFIG.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as "single" | "bulk")}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer",
                  activeTab === tab.value
                    ? "hover:bg-[#1547E5] bg-[#155DFC] dark:bg-[#1C263A] text-[#FFF] dark:text-gray-100 shadow-none border dark:border-none border-[#DADCE0]"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main>
        {activeTab === "single" && (
          <SingleRoomFormWrapper
            roomTypes={roomTypes ?? []}
            allAmenities={allAmenities ?? []}
          />
        )}
        {activeTab === "bulk" && (
          <BulkRoomFormWrapper
            roomTypes={roomTypes ?? []}
            allAmenities={allAmenities ?? []}
          />
        )}
      </main>
    </div>
  );
}

// ##################################################################
// ### 2. FORM WRAPPERS & PREVIEWS ###
// ##################################################################
interface WrapperProps {
  roomTypes: RoomTypeOption[];
  allAmenities: AmenityOption[];
}

function SingleRoomFormWrapper({ roomTypes, allAmenities }: WrapperProps) {
  const form = useForm<SingleRoomFormData>({
    resolver: yupResolver(singleRoomSchema),
    mode: "onChange",
    defaultValues: {
      hotel: HOTEL_ID,
      availability_status: "Available",
      room_amenities: [],
    },
  });

  return (
    // --- RESPONSIVE UPDATE: Main content padding adjusted ---
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 items-start">
      <SingleRoomForm
        form={form}
        roomTypes={roomTypes}
        allAmenities={allAmenities}
      />
      <DetailsPreview
        control={form.control}
        roomTypes={roomTypes}
        allAmenities={allAmenities}
      />
    </div>
  );
}

function BulkRoomFormWrapper({ roomTypes, allAmenities }: WrapperProps) {
  const form = useForm<BulkCreateFormShape>({
    resolver: yupResolver(bulkCreateSchema),
    mode: "onChange",
    defaultValues: {
      hotel_id: HOTEL_ID,
      count: 1,
      amenity_ids: [],
    },
  });

  return (
    // --- RESPONSIVE UPDATE: Main content padding adjusted ---
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 items-start">
      <BulkRoomForm
        form={form}
        roomTypes={roomTypes}
        allAmenities={allAmenities}
      />
      <BulkDetailsPreview
        control={form.control}
        roomTypes={roomTypes}
        allAmenities={allAmenities}
      />
    </div>
  );
}

// --- Preview Components ---
function DetailsPreview({ control, roomTypes, allAmenities }: any) {
  const watchedValues = useWatch({ control });
  const roomTypeName = useMemo(
    () => roomTypes?.find((rt: any) => rt.id === watchedValues.room_type)?.name,
    [watchedValues.room_type, roomTypes]
  );
  const selectedAmenities = useMemo(
    () =>
      allAmenities?.filter((a: any) =>
        watchedValues.room_amenities?.includes(a.id)
      ),
    [watchedValues.room_amenities, allAmenities]
  );

  return (
    <div className="lg:col-span-1 lg:sticky top-24">
      <Card className="bg-[#FFF] dark:bg-gray-900 px-0 py-6 rounded-md dark:border-gray-800 shadow-none border border-[#DADCE0]">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Room Preview
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Review details as you type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 md:px-6">
          {watchedValues.image &&
          yup.string().url().isValidSync(watchedValues.image) ? (
            <img
              src={watchedValues.image}
              alt="Room Preview"
              className="rounded-lg object-cover w-full h-40 bg-gray-100 dark:bg-gray-800"
            />
          ) : (
            <div className="rounded-lg w-full h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-gray-400 dark:text-gray-600" />
            </div>
          )}
          <DetailRow label="Code" value={watchedValues.code} />
          <DetailRow label="Type" value={roomTypeName} />
          <DetailRow
            label="Price"
            value={
              watchedValues.price_per_night
                ? `$${Number(watchedValues.price_per_night).toFixed(2)} / night`
                : ""
            }
          />
          <DetailRow label="Occupancy" value={watchedValues.max_occupancy} />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Amenities
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedAmenities && selectedAmenities.length > 0 ? (
                selectedAmenities.map((amenity: any) => (
                  <Badge key={amenity.id} variant="secondary">
                    {amenity.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">—</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BulkDetailsPreview({ control, roomTypes, allAmenities }: any) {
  const watchedValues = useWatch({ control });
  const roomTypeName = useMemo(
    () =>
      roomTypes?.find((rt: any) => rt.id === watchedValues.room_type_id)?.name,
    [watchedValues.room_type_id, roomTypes]
  );
  const selectedAmenities = useMemo(
    () =>
      allAmenities?.filter((a: any) =>
        watchedValues.amenity_ids?.includes(a.id)
      ),
    [watchedValues.amenity_ids, allAmenities]
  );
  const imageUrls = useMemo(() => {
    if (!watchedValues.image_urls) return [];
    return watchedValues.image_urls
      .split("\n")
      .map((url: string) => url.trim())
      .filter((url: string) => yup.string().url().isValidSync(url));
  }, [watchedValues.image_urls]);

  return (
    <div className="lg:col-span-1 lg:sticky top-24">
      <Card className="bg-white dark:bg-gray-900 rounded-md dark:border-gray-800 shadow-none border border-[#DADCE0]">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Bulk Creation Summary
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            A summary of the rooms to be created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 md:px-6">
          {imageUrls.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Image Previews ({imageUrls.length} provided)
              </p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imageUrls.slice(0, 6).map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="rounded-md object-cover w-full h-16 bg-gray-100 dark:bg-gray-800"
                  />
                ))}
              </div>
            </div>
          )}
          <DetailRow label="Number of Rooms" value={watchedValues.count} />
          <DetailRow label="Room Type" value={roomTypeName} />
          <DetailRow
            label="Price per Room"
            value={
              watchedValues.price_per_night
                ? `$${Number(watchedValues.price_per_night).toFixed(2)} / night`
                : ""
            }
          />
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Shared Amenities
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedAmenities && selectedAmenities.length > 0 ? (
                selectedAmenities.map((amenity: any) => (
                  <Badge key={amenity.id} variant="secondary">
                    {amenity.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">—</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ##################################################################
// ### 3. FORM COMPONENTS ###
// ##################################################################
interface FormComponentProps {
  form: any;
  roomTypes: RoomTypeOption[];
  allAmenities: AmenityOption[];
}

const AmenitiesSelector = ({
  allAmenities,
  field,
}: {
  allAmenities: AmenityOption[];
  field: any;
}) => {
  const handleToggle = (id: string) => {
    const currentValue = field.value ?? [];
    const isSelected = currentValue.includes(id);
    if (isSelected) {
      field.onChange(currentValue.filter((itemId: string) => itemId !== id));
    } else {
      field.onChange([...currentValue, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {allAmenities.map((item) => {
        const isChecked = field.value?.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            role="checkbox"
            aria-checked={isChecked}
            onClick={() => handleToggle(item.id)}
            className={cn(
              "flex items-center gap-2 pl-2 pr-4 py-1.75 rounded-full font-medium",
              "transition-colors text-slate-800 border bg-[#FFF] dark:bg-gray-900/50 shadow-xs",
              "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-950"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                isChecked
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-400 bg-transparent"
              )}
            >
              {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
            </span>
            <span className="text-[0.9375rem] font-medium text-gray-800 dark:text-gray-200">
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const ImageDropzone = ({ forMultiple = false }: { forMultiple?: boolean }) => (
  <div className="flex items-center justify-center w-full">
    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadCloud className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold">Click to upload</span> or drag and
          drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {forMultiple ? "PNG, JPG (up to 10MB each)" : "PNG, JPG (MAX. 10MB)"}
        </p>
      </div>
      <p className="pb-4 text-xs text-amber-600 dark:text-amber-500">
        Note: File upload is not yet active. Please use the URL input below.
      </p>
    </div>
  </div>
);

const FormLabelWithInfo = ({
  label,
  infoText,
}: {
  label: string;
  infoText: string;
}) => (
  <div className="flex items-center gap-2">
    <FormLabel className="text-gray-800 dark:text-gray-300">{label}</FormLabel>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white border-gray-900">
          <p className="max-w-xs">{infoText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

function SingleRoomForm({ form, roomTypes, allAmenities }: FormComponentProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createSingleRoom,
    onSuccess: (data) => {
      toast.success("Room Created Successfully!", {
        description: `The room "${data.code}" has been added.`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDetails"] });
      form.reset();
      setTimeout(() => navigate("/rooms/hotel-rooms"), 1500);
    },
    onError: (error: any) => {
      toast.error("Creation Failed", {
        description:
          error.response?.data?.detail || "An unexpected error occurred.",
        icon: <XCircle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data: any) => mutation.mutate(data))}
        className="lg:col-span-2 space-y-8"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Core Details
          </h2>
          <Card className="bg-[#FFF] dark:bg-gray-900 rounded-md dark:border-gray-800 shadow-none border border-[#DADCE0]">
            {/* --- RESPONSIVE UPDATE: Card padding adjusted --- */}
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Room Code/Number"
                      infoText="A unique identifier for this room (e.g., 'DLX-101', '204'). This cannot be changed later."
                    />
                    <FormControl>
                      <Input
                        className={cn(inputBaseClass, focusRingClass)}
                        placeholder="e.g. DLX-101"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_occupancy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Max Occupancy"
                      infoText="The maximum number of guests this room can accommodate."
                    />
                    <FormControl>
                      <Input
                        type="number"
                        className={cn(inputBaseClass, focusRingClass)}
                        placeholder="e.g. 2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="room_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Room Type"
                      infoText="Select the classification for this room (e.g., Standard, Deluxe, Suite)."
                    />
                    <FormControl>
                      <select
                        {...field}
                        className={cn(
                          "w-full h-10 rounded-md border px-3 py-2 text-sm",
                          inputBaseClass,
                          focusRingClass
                        )}
                      >
                        <option value="" disabled>
                          Select a room type...
                        </option>
                        {roomTypes.map((rt) => (
                          <option key={rt.id} value={rt.id}>
                            {rt.name}
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
                name="availability_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Current Status"
                      infoText="The initial availability status of the room upon creation."
                    />
                    <FormControl>
                      <select
                        {...field}
                        className={cn(
                          "w-full h-10 rounded-md border px-3 py-2 text-sm",
                          inputBaseClass,
                          focusRingClass
                        )}
                      >
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabelWithInfo
                      label="Room Description"
                      infoText="A detailed description of the room, its features, and view. This will be visible to guests."
                    />
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A spacious room with a king-sized bed and a stunning ocean view..."
                        className={cn(
                          "min-h-[120px] resize-none",
                          inputBaseClass,
                          focusRingClass
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pricing & Images
          </h2>
          <Card className="bg-[#FFF] dark:bg-gray-900 rounded-md dark:border-gray-800 shadow-none border border-[#DADCE0]">
            <CardContent className="space-y-6 p-4 md:p-6">
              <FormField
                control={form.control}
                name="price_per_night"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Price/Night (USD)"
                      infoText="The standard rate for this room for one night, in US Dollars."
                    />
                    <FormControl>
                      <Input
                        type="number"
                        className={cn(inputBaseClass, focusRingClass)}
                        placeholder="e.g. 150"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ImageDropzone />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Primary Image URL"
                      infoText="Provide a direct link (URL) to the main image for this room."
                    />
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.png"
                        {...field}
                        className={cn(inputBaseClass, focusRingClass)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Features & Amenities
          </h2>
          <Card className="bg-[#FFF] dark:bg-gray-900 rounded-md dark:border-gray-800 shadow-none border border-[#DADCE0]">
            <CardContent className="p-4 md:p-6">
              <FormField
                control={form.control}
                name="room_amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Room Amenities"
                      infoText="Select all the amenities available within this specific room."
                    />
                    <div className="pt-2">
                      <AmenitiesSelector
                        allAmenities={allAmenities}
                        field={field}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Room
          </Button>
        </div>
      </form>
    </Form>
  );
}

function BulkRoomForm({ form, roomTypes, allAmenities }: FormComponentProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: bulkCreateRooms,
    onSuccess: (data) => {
      toast.success("Rooms Created Successfully!", {
        description: `${data.count || "Multiple"} rooms have been added.`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDetails"] });
      form.reset();
      setTimeout(() => navigate("/rooms/hotel-rooms"), 1500);
    },
    onError: (error: any) => {
      toast.error("Bulk Creation Failed", {
        description:
          error.response?.data?.detail || "An unexpected error occurred.",
        icon: <XCircle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const onSubmit = (data: BulkCreateFormShape) => {
    const payload = {
      ...data,
      image_urls: data.image_urls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
    };
    mutation.mutate(payload);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="lg:col-span-2 space-y-8"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Core Details
          </h2>
          <Card className="bg-[#FFF] dark:bg-gray-900 rounded-md dark:border-gray-800 shadow-none border border-[#DADCE0]">
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
              <FormField
                control={form.control}
                name="room_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Room Type"
                      infoText="All rooms created in this batch will share this room type."
                    />
                    <FormControl>
                      <select
                        {...field}
                        className={cn(
                          "w-full h-10 rounded-md border px-3 py-2 text-sm",
                          inputBaseClass,
                          focusRingClass
                        )}
                      >
                        <option value="" disabled>
                          Select a room type...
                        </option>
                        {roomTypes.map((rt) => (
                          <option key={rt.id} value={rt.id}>
                            {rt.name}
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
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Number of Rooms"
                      infoText="The total number of rooms to create in this batch."
                    />
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 10"
                        className={cn(inputBaseClass, focusRingClass)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_per_night"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabelWithInfo
                      label="Price/Night (USD)"
                      infoText="This price will be applied to every room created in this batch."
                    />
                    <FormControl>
                      <Input
                        className={cn(inputBaseClass, focusRingClass)}
                        type="number"
                        placeholder="e.g. 150"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabelWithInfo
                      label="Common Description (Optional)"
                      infoText="A shared description that will be applied to all rooms created in this batch."
                    />
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Our standard rooms offer comfort and style..."
                        className={cn(
                          "min-h-[120px] resize-none",
                          inputBaseClass,
                          focusRingClass
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Images & Amenities
          </h2>
          <Card className="bg-[#FFF] dark:bg-gray-900 rounded-md dark:border-gray-800 shadow-none border border-[#DADCE0]">
            <CardContent className="space-y-6 p-4 md:p-6">
              <ImageDropzone forMultiple={true} />
              <FormField
                control={form.control}
                name="image_urls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Image URLs"
                      infoText="Enter one image URL per line. These images will be distributed among the newly created rooms."
                    />
                    <FormControl>
                      <Textarea
                        placeholder={
                          "https://example.com/image1.png\nhttps://example.com/image2.png"
                        }
                        className={cn(
                          "min-h-[120px] resize-none",
                          inputBaseClass,
                          focusRingClass
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amenity_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabelWithInfo
                      label="Shared Amenities"
                      infoText="Select all amenities that will be available in every room created in this batch."
                    />
                    <div className="pt-2">
                      <AmenitiesSelector
                        allAmenities={allAmenities}
                        field={field}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Rooms
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ##################################################################
// ### 4. HELPER COMPONENTS ###
// ##################################################################
const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) => (
  <div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="text-base font-semibold text-gray-800 dark:text-white mt-1">
      {value || "—"}
    </p>
  </div>
);
