// src/pages/rooms/new-room.tsx
"use client";
import { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GrFormAdd } from "react-icons/gr";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import hotelClient from "../../api/hotel-client";
import ErrorPage from "@/components/custom/error-page";

// --- Icon Imports ---
import { Info, Loader2, Layers } from "lucide-react";

// --- TYPE DEFINITIONS & SCHEMAS ---
interface RoomTypeOption {
  id: string;
  name: string;
}
interface AmenityOption {
  id: string;
  name: string;
}
const HOTEL_ID = "a3d5501e-c910-4e2e-a0b2-ad616c5910db";

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

// --- API FUNCTIONS ---
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

const focusRingClass =
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500";
const inputBaseClass =
  "dark:bg-[#171F2F] dark:border-[#1D2939] dark:text-[#D0D5DD] dark:placeholder:text-[#5D636E]";

// --- MAIN PAGE COMPONENT ---
export default function NewRoomPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  const singleForm = useForm<SingleRoomFormData>({
    resolver: yupResolver(singleRoomSchema),
    mode: "onChange",
    defaultValues: {
      hotel: HOTEL_ID,
      availability_status: "Available",
      room_amenities: [],
    },
  });

  const bulkForm = useForm<BulkCreateFormShape>({
    resolver: yupResolver(bulkCreateSchema),
    mode: "onChange",
    defaultValues: {
      hotel_id: HOTEL_ID,
      count: 1,
      amenity_ids: [],
    },
  });

  const {
    data: roomTypes,
    isLoading: isLoadingRoomTypes,
    isError: isRoomTypesError,
    error: roomTypesError,
    refetch: refetchRoomTypes,
  } = useQuery<RoomTypeOption[]>({
    queryKey: ["allRoomTypes"],
    queryFn: async () => (await hotelClient.get("room-types/")).data.results,
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
  });

  if (isLoadingRoomTypes || isLoadingAmenities) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
    { value: "single", label: "Create Single Room", icon: GrFormAdd },
    { value: "bulk", label: "Create Multiple Rooms", icon: Layers },
  ];

  return (
    <div className="flex-1 space-y-6 bg-gray-50 dark:bg-[#101828]">
      {/* BUG FIX: Removed max-h-screen from this Card to allow proper scrolling */}
      <Card className="border-none p-0 dark:bg-[#171F2F] rounded-none shadow-none">
        <CardHeader className="bg-white/80 dark:bg-[#101828]/80 backdrop-blur-sm border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30 mb-4 pt-4">
          <h2 className="text-[1.5rem] font-bold tracking-wide">
            {" "}
            Create New Room(s)
          </h2>
          <CardDescription className="text-[0.9375rem] text-gray-600 dark:text-[#98A2B3] mt-1">
            Add a single, unique room or create multiple rooms of the same type
            in bulk.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <div className="flex items-center gap-2 bg-white dark:bg-[#101828] border border-gray-200 dark:border-[#1D2939] rounded-md shadow-2xs p-[6px] w-fit mb-6">
            {TABS_CONFIG.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as "single" | "bulk")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  activeTab === tab.value
                    ? "bg-blue-600 text-white shadow"
                    : "bg-transparent text-gray-600 dark:text-[#98A2B3] hover:text-gray-800 dark:hover:text-white"
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "single" && (
            <SingleRoomForm
              form={singleForm}
              roomTypes={roomTypes ?? []}
              allAmenities={allAmenities ?? []}
            />
          )}
          {activeTab === "bulk" && (
            <BulkRoomForm
              form={bulkForm}
              roomTypes={roomTypes ?? []}
              allAmenities={allAmenities ?? []}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Form Props with lifted form instance ---
interface FormComponentProps {
  form: any;
  roomTypes: RoomTypeOption[];
  allAmenities: AmenityOption[];
}

// --- Single Room Form Component ---
function SingleRoomForm({ form, roomTypes, allAmenities }: FormComponentProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createSingleRoom,
    onSuccess: (data) => {
      toast.success(`Room "${data.code}" created successfully!`, {
        classNames: {
          toast:
            "bg-white dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] shadow-lg rounded-xl",
          title: "text-gray-900 dark:text-white",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDetails"] });
      form.reset();
      setTimeout(() => navigate("/rooms/hotel-rooms"), 1000);
    },
    onError: (error: any) =>
      toast.error(
        `Creation failed: ${error.response?.data?.detail || error.message}`
      ),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data: any) => mutation.mutate(data))}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
      >
        <Card className="lg:col-span-2 bg-white dark:bg-[#171F2F] border-gray-200 dark:border-[#1D2939] shadow-sm">
          <CardContent className="p-6">
            <NotesSummary title="Creating a Single Room">
              This form creates one unique room. The <strong>Room Code</strong>{" "}
              must be unique. All fields are required.
            </NotesSummary>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        Room Code/Room Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          className={cn(
                            "h-11 text-base rounded-lg",
                            focusRingClass,
                            inputBaseClass
                          )}
                          placeholder="e.g., DLX-101"
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
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        Max Occupancy
                      </FormLabel>
                      <FormControl>
                        <Input
                          className={cn(
                            "h-11 text-base rounded-lg",
                            focusRingClass,
                            inputBaseClass
                          )}
                          type="number"
                          placeholder="e.g., 2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full flex gap-x-6 my-1">
                <FormField
                  control={form.control}
                  name="room_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        Room Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "h-11 text-base rounded-lg",
                              focusRingClass,
                              inputBaseClass
                            )}
                          >
                            <SelectValue placeholder="Select a room type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomTypes.map((rt) => (
                            <SelectItem key={rt.id} value={rt.id}>
                              {rt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availability_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        Current Room Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "h-11 text-base rounded-lg",
                              focusRingClass,
                              inputBaseClass
                            )}
                          >
                            <SelectValue placeholder="Select status..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Booked">Booked</SelectItem>
                          <SelectItem value="Maintenance">
                            Maintenance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price_per_night"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Price/Night (USD)
                    </FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "h-11 text-base rounded-lg",
                          focusRingClass,
                          inputBaseClass
                        )}
                        type="number"
                        placeholder="e.g., 150"
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
                  <FormItem>
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Room Room Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A detailed description of the room..."
                        className={cn(
                          "min-h-[120px] text-base resize-none rounded-lg",
                          focusRingClass,
                          inputBaseClass
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
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Primary Image URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.png"
                        {...field}
                        className={cn(
                          "h-11 text-base rounded-lg",
                          focusRingClass,
                          inputBaseClass
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Select Room Amenities
                    </FormLabel>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {allAmenities.map((amenity) => (
                        <FormItem
                          key={amenity.id}
                          className="flex flex-row items-start space-x-0 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              className="sr-only"
                              checked={field.value?.includes(amenity.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value ?? [];
                                return checked
                                  ? field.onChange([
                                      ...currentValue,
                                      amenity.id,
                                    ])
                                  : field.onChange(
                                      currentValue.filter(
                                        (id) => id !== amenity.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              "flex items-center justify-center px-4 py-2 rounded-full border font-medium cursor-pointer transition-all text-sm",
                              field.value?.includes(amenity.id)
                                ? "bg-blue-100 dark:bg-[#162142] text-blue-700 dark:text-[#7592FF] border-blue-200 dark:border-blue-900"
                                : "bg-white dark:bg-transparent border-gray-200 dark:border-[#1D2939] text-gray-700 dark:text-[#D0D5DD] hover:bg-gray-50 dark:hover:bg-[#1C2433]"
                            )}
                          >
                            {amenity.name}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end mt-8">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-blue-500 hover:bg-blue-600 rounded-full cursor-pointer"
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Room
              </Button>
            </div>
          </CardContent>
        </Card>
        <DetailsPreview
          control={form.control}
          roomTypes={roomTypes}
          allAmenities={allAmenities}
        />
      </form>
    </Form>
  );
}

// --- Bulk Room Form Component ---
function BulkRoomForm({ form, roomTypes, allAmenities }: FormComponentProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: bulkCreateRooms,
    onSuccess: (data) => {
      // ENHANCEMENT: Custom styled toast notification
      toast.success(`${data.count || "Rooms"} created successfully!`, {
        classNames: {
          toast:
            "bg-white dark:bg-[#171F2F] border border-[#E4E7EC] dark:border-[#1D2939] shadow-lg rounded-xl",
          title: "text-gray-900 dark:text-white",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDetails"] });
      form.reset();
      // ENHANCEMENT: Delay navigation to allow user to see the toast
      setTimeout(() => navigate("/rooms/hotel-rooms"), 1000);
    },
    onError: (error: any) =>
      toast.error(
        `Bulk creation failed: ${error.response?.data?.detail || error.message}`
      ),
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
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
      >
        <Card className="lg:col-span-2 bg-[#FFF] dark:bg-[#171F2F] border-gray-200 dark:border-[#1D2939] shadow-2xs">
          <CardContent className="p-6">
            <NotesSummary title="Creating Multiple Rooms">
              Create multiple rooms of the same type at once. Unique codes will
              be auto-generated. Provide one image URL per line.
            </NotesSummary>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-y-4 w-full">
                <FormField
                  control={form.control}
                  name="room_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        Room Type (for all rooms)
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "h-11 text-base rounded-lg",
                              focusRingClass,
                              inputBaseClass
                            )}
                          >
                            <SelectValue placeholder="Select a room type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomTypes.map((rt) => (
                            <SelectItem key={rt.id} value={rt.id}>
                              {rt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        Number of Rooms to Create
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10"
                          className={cn(
                            "h-11 text-base rounded-lg",
                            focusRingClass,
                            inputBaseClass
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="price_per_night"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Price/Night (USD) for each room
                    </FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          "h-11 text-base rounded-lg",
                          focusRingClass,
                          inputBaseClass
                        )}
                        type="number"
                        placeholder="e.g., 150"
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
                  <FormItem>
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Room Description (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A common description for all new rooms..."
                        className={cn(
                          "min-h-[120px] text-base resize-none rounded-lg",
                          focusRingClass,
                          inputBaseClass
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
                name="image_urls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Image URLs (one per line)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`https://example.com/image1.png\nhttps://example.com/image2.png`}
                        className={cn(
                          "min-h-[120px] text-base resize-none rounded-lg",
                          focusRingClass,
                          inputBaseClass
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
                    <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                      Select Room Amenities
                    </FormLabel>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {allAmenities.map((amenity) => (
                        <FormItem
                          key={amenity.id}
                          className="flex flex-row items-start space-x-0 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              className="sr-only"
                              checked={field.value?.includes(amenity.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value ?? [];
                                return checked
                                  ? field.onChange([
                                      ...currentValue,
                                      amenity.id,
                                    ])
                                  : field.onChange(
                                      currentValue.filter(
                                        (id) => id !== amenity.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              "flex items-center justify-center px-4 py-2 rounded-full border font-medium cursor-pointer transition-all text-sm",
                              field.value?.includes(amenity.id)
                                ? "bg-blue-100 dark:bg-[#162142] text-blue-700 dark:text-[#7592FF] border-blue-200 dark:border-blue-900"
                                : "bg-white dark:bg-transparent border-gray-200 dark:border-[#1D2939] text-gray-700 dark:text-[#D0D5DD] hover:bg-gray-50 dark:hover:bg-[#1C2433]"
                            )}
                          >
                            {amenity.name}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end mt-8">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Rooms
              </Button>
            </div>
          </CardContent>
        </Card>
        <BulkDetailsPreview
          control={form.control}
          roomTypes={roomTypes}
          allAmenities={allAmenities}
        />
      </form>
    </Form>
  );
}

// --- Details Preview Component ---
function DetailsPreview({ control, roomTypes, allAmenities }: any) {
  const watchedValues = useWatch({ control });
  const roomTypeName = useMemo(
    () => roomTypes?.find((rt) => rt.id === watchedValues.room_type)?.name,
    [watchedValues.room_type, roomTypes]
  );
  const selectedAmenities = useMemo(
    () =>
      allAmenities?.filter((a) => watchedValues.room_amenities?.includes(a.id)),
    [watchedValues.room_amenities, allAmenities]
  );

  return (
    <Card className="lg:col-span-1 sticky top-8 bg-[#FFF] dark:bg-[#171F2F] border-[#E4E7EC] dark:border-[#1D2939] shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#1D2939] dark:text-[#D0D5DD]">
          Room Preview
        </CardTitle>
        <CardDescription className="dark:text-[#667085] text-[0.875rem] mb-4">
          Review the room details as you type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {watchedValues.image &&
          yup.string().url().isValidSync(watchedValues.image) && (
            <img
              src={watchedValues.image}
              alt="Room Preview"
              className="rounded-lg object-cover w-full h-40 bg-gray-100 dark:bg-[#101828]"
            />
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
        <DetailRow
          label="Description"
          value={watchedValues.description}
          isParagraph
        />
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-[#98A2B3]">
            Amenities
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAmenities && selectedAmenities.length > 0 ? (
              selectedAmenities.map((amenity) => (
                <Badge
                  key={amenity.id}
                  variant="secondary"
                  className="bg-blue-100 dark:bg-[#162142] text-blue-700 dark:text-[#7592FF] border-blue-200 dark:border-blue-900"
                >
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
  );
}

// --- Bulk Details Preview Component ---
function BulkDetailsPreview({ control, roomTypes, allAmenities }: any) {
  const watchedValues = useWatch({ control });
  const roomTypeName = useMemo(
    () => roomTypes?.find((rt) => rt.id === watchedValues.room_type_id)?.name,
    [watchedValues.room_type_id, roomTypes]
  );
  const selectedAmenities = useMemo(
    () =>
      allAmenities?.filter((a) => watchedValues.amenity_ids?.includes(a.id)),
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
    <Card className="lg:col-span-1 sticky top-8 bg-white dark:bg-[#171F2F] border-gray-200 dark:border-[#1D2939] shadow-sm px-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#1D2939] dark:text-[#D0D5DD]">
          Multiple Rooms Summary
        </CardTitle>
        <CardDescription className="dark:text-[#98A2B3] mb-4">
          A summary of the rooms to be created.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrls.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-[#98A2B3]">
              Image Previews ({imageUrls.length} provided)
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {imageUrls.slice(0, 4).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="rounded-md object-cover w-full h-20 bg-gray-100 dark:bg-[#101828]"
                  onError={(e) => (e.currentTarget.style.display = "none")}
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
          <p className="text-sm font-medium text-gray-600 dark:text-[#98A2B3]">
            Amenities (for all rooms)
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAmenities && selectedAmenities.length > 0 ? (
              selectedAmenities.map((amenity) => (
                <Badge
                  key={amenity.id}
                  variant="secondary"
                  className="bg-blue-100 dark:bg-[#162142] text-blue-700 dark:text-[#7592FF] border-blue-200 dark:border-blue-900"
                >
                  {amenity.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">—</p>
            )}
          </div>
        </div>
        <DetailRow
          label="Description"
          value={watchedValues.description}
          isParagraph
        />
      </CardContent>
    </Card>
  );
}

// --- Reusable Helper Components ---
const NotesSummary = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:border-blue-700">
    <div className="flex">
      <div className="flex-shrink-0">
        <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      </div>
      <div className="ml-3">
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
          {title}
        </p>
        <div className="mt-1 text-sm text-blue-700 dark:text-blue-400/80">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const DetailRow = ({
  label,
  value,
  isParagraph = false,
}: {
  label: string;
  value: string | number | undefined;
  isParagraph?: boolean;
}) => (
  <div>
    <p className="text-sm font-medium text-gray-600 dark:text-[#98A2B3]">
      {label}
    </p>
    <p
      className={cn(
        "text-gray-900 dark:text-[#D0D5DD]",
        isParagraph ? "text-sm break-words mt-1" : "text-base font-semibold"
      )}
    >
      {value || "—"}
    </p>
  </div>
);
