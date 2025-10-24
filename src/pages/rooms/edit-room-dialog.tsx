// src/pages/rooms/edit-room-dialog.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { Loader2, Users, Building, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Separator } from "@/components/ui/separator";
import hotelClient from "../../api/hotel-client";
import { cn } from "@/lib/utils";
import { BsCurrencyDollar } from "react-icons/bs";

// --- TYPE DEFINITIONS ---
interface EditRoomFormData {
  code: string;
  description: string;
  image?: FileList;
  max_occupancy: number;
  price_per_night: number;
  availability_status: string;
  room_type_id: string;
  floor_number: number;
  room_amenities: string[];
}

interface RoomDetails {
  id: string;
  code: string;
  description: string;
  image: string; // URL of the current primary image
  images: { url: string }[];
  max_occupancy: number;
  price_per_night: number;
  availability_status: "Available" | "Booked" | "Maintenance";
  room_type_id: string;
  floor_number?: number;
  room_amenities: string[];
}

interface RoomType {
  id: string;
  name: string;
}

interface Amenity {
  id: string;
  name: string;
}

interface EditRoomFormProps {
  room: RoomDetails;
  onUpdateComplete: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

// --- VALIDATION SCHEMA ---
const FILE_SIZE_LIMIT = 3 * 1024 * 1024; // 3 MB
const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/jpg"];

const fileValidator = yup
  .mixed()
  .optional()
  .test(
    "fileSize",
    "Image must be less than 3 MB",
    (value: any) => !value || !value[0] || value[0].size <= FILE_SIZE_LIMIT
  )
  .test(
    "fileFormat",
    "Unsupported format. Use JPG or PNG.",
    (value: any) =>
      !value || !value[0] || SUPPORTED_FORMATS.includes(value[0].type)
  );

const editRoomSchema = yup.object().shape({
  code: yup.string().required("Room code is required."),
  description: yup.string().required("Description is required."),
  price_per_night: yup
    .number()
    .typeError("Price must be a number.")
    .positive("Price must be positive.")
    .required("Price is required."),
  max_occupancy: yup
    .number()
    .typeError("Max occupancy must be a number.")
    .integer("Must be a whole number.")
    .min(1, "Occupancy must be at least 1.")
    .required("Max occupancy is required."),
  floor_number: yup
    .number()
    .typeError("Floor must be a number.")
    .integer("Floor must be a whole number.")
    .required("Floor number is required."),
  availability_status: yup
    .string()
    .oneOf(["Available", "Booked", "Maintenance"])
    .required("Status is required."),
  room_type_id: yup.string().required("Room type is required."),
  image: fileValidator,
  room_amenities: yup
    .array()
    .of(yup.string().required())
    .min(1, "At least one amenity must be selected."),
});

// --- NEW IMAGE DROPZONE COMPONENT ---
const ImageDropzone = ({
  field,
  currentImageUrl,
}: {
  field: any;
  currentImageUrl: string;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl);

  useEffect(() => {
    const file = field.value?.[0];
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(currentImageUrl);
    }
  }, [field.value, currentImageUrl]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      field.onChange(files);
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const selectedFile = field.value?.[0];

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <UploadCloud className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG up to 3MB
          </p>
        </div>
        <Input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </div>

      {(selectedFile || currentImageUrl) && (
        <div className="flex items-center justify-between w-full h-auto border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={preview || ""}
              alt="Preview"
              className="h-12 w-12 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-gray-300 truncate">
                {selectedFile?.name || "Current Image"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : "Previously uploaded"}
              </p>
            </div>
          </div>
          {selectedFile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50"
              onClick={() => {
                field.onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default function EditRoomForm({
  room,
  onUpdateComplete,
  onDirtyChange,
}: EditRoomFormProps) {
  const queryClient = useQueryClient();

  const { data: roomTypes, isLoading: isLoadingTypes } = useQuery<RoomType[]>({
    queryKey: ["roomTypes"],
    queryFn: async () => (await hotelClient.get("/room-types/")).data.results,
  });

  const { data: allAmenities, isLoading: isLoadingAmenities } = useQuery<
    Amenity[]
  >({
    queryKey: ["amenities"],
    queryFn: async () => (await hotelClient.get("/amenities/")).data.results,
  });

  const form = useForm<EditRoomFormData>({
    resolver: yupResolver(editRoomSchema),
    defaultValues: {
      code: room.code,
      description: room.description,
      max_occupancy: room.max_occupancy,
      price_per_night: Number(room.price_per_night),
      availability_status: room.availability_status,
      room_type_id: room.room_type_id,
      floor_number: room.floor_number || 0,
      room_amenities: room.room_amenities || [],
      image: undefined, // Start with no file selected
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = form;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateRoomMutation = useMutation({
    mutationFn: (payload: { id: string; formData: FormData }) =>
      hotelClient.patch(`/rooms/${payload.id}/`, payload.formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      toast.success("✅ Room details updated successfully!", {
        description: "All changes have been saved and are now live.",
        duration: 3000,
      });

      queryClient.invalidateQueries({ queryKey: ["roomDetails", room.id] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });

      setTimeout(() => {
        onUpdateComplete();
      }, 500);
    },
    onError: (error: any) => {
      toast.error(
        `❌ Update failed: ${error.response?.data?.detail || error.message}`,
        {
          description: "Please check your changes and try again.",
          duration: 5000,
        }
      );
    },
  });

  const onFormSubmit = (data: EditRoomFormData) => {
    const formData = new FormData();
    let hasChanges = false;

    (Object.keys(dirtyFields) as Array<keyof EditRoomFormData>).forEach(
      (key) => {
        hasChanges = true;
        const value = data[key];
        if (key === "image" && value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        } else if (Array.isArray(value)) {
          // Handle array fields like room_amenities
          value.forEach((item) => formData.append(key, item));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
    );

    if (!hasChanges) {
      toast.info("No changes were made.");
      return;
    }

    updateRoomMutation.mutate({ id: room.id, formData });
  };

  const getStatusVariant = (
    status: string
  ): "success" | "pending" | "failed" | "default" => {
    switch (status) {
      case "Available":
        return "success";
      case "Booked":
        return "pending";
      case "Maintenance":
        return "failed";
      default:
        return "default";
    }
  };

  const focusRingClass =
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500";
  const inputBaseClass =
    "dark:bg-[#171F2F] dark:border-[#1D2939] dark:text-[#D0D5DD] dark:placeholder:text-[#5D636E]";

  return (
    <div className="flex flex-col h-full bg-[#FFF] dark:bg-[#101828] border-none">
      <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-6 bg-[#F9FAFB] dark:bg-[#101828] border-b border-[#E4E7EC] dark:border-b-[#1D2939]">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SheetTitle className="text-2xl font-bold text-[#1D2939] dark:text-[#D0D5DD]">
              Edit Room Details
            </SheetTitle>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-lg px-3 py-1 font-semibold dark:border-[#1D2939] dark:text-[#D0D5DD]"
              >
                {room.code}
              </Badge>
              <Badge
                variant={getStatusVariant(room.availability_status)}
                className="text-sm px-3 py-1 dark:bg-transparent dark:border-none"
              >
                {room.availability_status}
              </Badge>
            </div>
          </div>
        </div>
        <SheetDescription className="text-base text-[#667085] dark:text-[#98A2B3] mt-2">
          Modify room configuration, pricing, and amenities. All changes will be
          applied immediately upon saving.
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col h-full min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="space-y-8 pb-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-[#1D2939] dark:text-[#D0D5DD]">
                  Room Type & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <FormField
                    control={control}
                    name="room_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                          Room Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingTypes}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={cn(
                                "h-11 text-base rounded-lg",
                                focusRingClass,
                                inputBaseClass
                              )}
                            >
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-[#101828] dark:border-[#1D2939] dark:text-[#D0D5DD]">
                            {roomTypes?.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="availability_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                          Availability Status
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
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-[#101828] dark:border-[#1D2939] dark:text-[#D0D5DD]">
                            <SelectItem value="Available">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                Available
                              </span>
                            </SelectItem>
                            <SelectItem value="Booked">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                Booked
                              </span>
                            </SelectItem>
                            <SelectItem value="Maintenance">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                Maintenance
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="dark:bg-[#1D2939]" />

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-[#1D2939] dark:text-[#D0D5DD]">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <FormField
                    control={control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                          Room Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., DLX-101"
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
                  <FormField
                    control={control}
                    name="price_per_night"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                          Price per Night
                        </FormLabel>
                        <div className="relative">
                          <BsCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#5D636E]" />
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              className={cn(
                                "pl-10 h-11 text-[0.9375rem] rounded-lg",
                                focusRingClass,
                                inputBaseClass
                              )}
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="max_occupancy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                          Maximum Occupancy
                        </FormLabel>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#5D636E]" />
                          <FormControl>
                            <Input
                              type="number"
                              className={cn(
                                "pl-10 h-11 text-base rounded-lg",
                                focusRingClass,
                                inputBaseClass
                              )}
                              placeholder="0"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="floor_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                          Floor Number
                        </FormLabel>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#5D636E]" />
                          <FormControl>
                            <Input
                              type="number"
                              className={cn(
                                "pl-10 h-11 text-base rounded-lg",
                                focusRingClass,
                                inputBaseClass
                              )}
                              placeholder="0"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[0.9375rem] text-[#667085] dark:text-[#98A2B3] font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of the room and its features..."
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
              </div>

              <Separator className="dark:bg-[#1D2939]" />

              <FormField
                control={control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold text-[#1D2939] dark:text-[#D0D5DD]">
                      Update Primary Image
                    </FormLabel>
                    <FormControl>
                      <ImageDropzone
                        field={field}
                        currentImageUrl={room.image}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="dark:bg-[#1D2939]" />

              <div className="space-y-6">
                <FormField
                  control={control}
                  name="room_amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold text-[#1D2939] dark:text-[#D0D5DD]">
                        Room Amenities
                      </FormLabel>
                      {isLoadingAmenities ? (
                        <div className="flex items-center gap-2 py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <p className="text-base text-[#667085] dark:text-[#98A2B3]">
                            Loading amenities...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {allAmenities?.map((amenity) => {
                            const isChecked = field.value?.includes(amenity.id);
                            return (
                              <FormItem key={amenity.id}>
                                <FormControl>
                                  <Checkbox
                                    className="sr-only"
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            amenity.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (id) => id !== amenity.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel
                                  className={cn(
                                    "flex flex-wrap items-center justify-center text-center px-4 py-2.5 rounded-lg border-2 font-medium cursor-pointer transition-all text-[13px]",
                                    isChecked
                                      ? "bg-[#EFF6FF] dark:bg-[#162142] text-blue-600 border border-blue-300 shadow-xs rounded-full dark:border-none dark:border-[#162142] dark:text-[#98A2B3]"
                                      : "bg-white dark:bg-[#162142] border border-[#E4E7EC] text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-full shadow-xs dark:hover:bg-[#1C2433] dark:border-[#162142] dark:text-[#98A2B3]"
                                  )}
                                >
                                  {amenity.name}
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage className="pt-2" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="flex-shrink-0 px-6 shadow-lg py-4 border-t bg-white dark:bg-[#101828] dark:border-t-[#1D2939]">
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-[#FFF] flex items-center gap-x-2 py-2.5 px-4 rounded-full text-[1rem] cursor-pointer transition-all focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={updateRoomMutation.isPending || !isDirty}
              >
                {updateRoomMutation.isPending && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                {updateRoomMutation.isPending
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>
              <SheetClose asChild>
                <button
                  type="button"
                  className="border border-[#E4E7EC] dark:border-[#1D2939] bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#1C2433] rounded-full py-2.5 px-4 text-[1rem] cursor-pointer transition-all focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-2 text-gray-800 dark:text-gray-200"
                  data-sheet-close="true"
                >
                  Cancel
                </button>
              </SheetClose>
            </div>
          </SheetFooter>
        </form>
      </Form>
    </div>
  );
}
