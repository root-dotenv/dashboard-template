// // src/pages/rooms/edit-room-dialog.tsx
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useForm, useFieldArray } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { toast } from "sonner";
// import { useEffect } from "react";
// import { Loader2, Users, Building, ImageIcon, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   SheetHeader,
//   SheetTitle,
//   SheetDescription,
//   SheetFooter,
//   SheetClose,
// } from "@/components/ui/sheet";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import hotelClient from "../../api/hotel-client";
// import { cn } from "@/lib/utils";
// import { BsCurrencyDollar } from "react-icons/bs";
// import { LuImagePlus } from "react-icons/lu";

// // --- TYPE DEFINITIONS ---
// interface GalleryImage {
//   url: string;
// }

// interface EditRoomFormData {
//   code: string;
//   description: string;
//   images: GalleryImage[];
//   max_occupancy: number;
//   price_per_night: number;
//   availability_status: string;
//   room_type_id: string;
//   floor_number: number;
//   room_amenities: string[];
// }

// interface RoomDetails extends Omit<EditRoomFormData, "images"> {
//   id: string;
//   image: string;
//   images: { url: string }[];
// }

// interface RoomType {
//   id: string;
//   name: string;
// }

// interface Amenity {
//   id: string;
//   name: string;
// }

// interface EditRoomFormProps {
//   room: RoomDetails;
//   onUpdateComplete: () => void;
//   onDirtyChange: (isDirty: boolean) => void;
// }

// // --- VALIDATION SCHEMA ---
// const editRoomSchema = yup.object().shape({
//   code: yup.string().required("Room code is required."),
//   description: yup.string().required("Description is required."),
//   price_per_night: yup
//     .number()
//     .typeError("Price must be a number.")
//     .positive("Price must be positive.")
//     .required("Price is required."),
//   max_occupancy: yup
//     .number()
//     .typeError("Max occupancy must be a number.")
//     .integer("Must be a whole number.")
//     .min(1, "Occupancy must be at least 1.")
//     .required("Max occupancy is required."),
//   floor_number: yup
//     .number()
//     .typeError("Floor must be a number.")
//     .integer("Floor must be a whole number.")
//     .required("Floor number is required."),
//   availability_status: yup
//     .string()
//     .oneOf(["Available", "Booked", "Maintenance"])
//     .required("Status is required."),
//   room_type_id: yup.string().required("Room type is required."),
//   images: yup
//     .array()
//     .of(
//       yup.object().shape({
//         url: yup
//           .string()
//           .url("Each image must be a valid URL.")
//           .required("Image URL cannot be empty."),
//       })
//     )
//     .min(1, "At least one image is required.")
//     .required(),
//   room_amenities: yup
//     .array()
//     .of(yup.string().required())
//     .min(1, "At least one amenity must be selected."),
// });

// export default function EditRoomForm({
//   room,
//   onUpdateComplete,
//   onDirtyChange,
// }: EditRoomFormProps) {
//   const queryClient = useQueryClient();

//   const { data: roomTypes, isLoading: isLoadingTypes } = useQuery<RoomType[]>({
//     queryKey: ["roomTypes"],
//     queryFn: async () => (await hotelClient.get("/room-types/")).data.results,
//   });

//   const { data: allAmenities, isLoading: isLoadingAmenities } = useQuery<
//     Amenity[]
//   >({
//     queryKey: ["amenities"],
//     queryFn: async () => (await hotelClient.get("/amenities/")).data.results,
//   });

//   const form = useForm<EditRoomFormData>({
//     resolver: yupResolver(editRoomSchema),
//     defaultValues: {
//       code: room.code,
//       description: room.description,
//       images: room.images?.length > 0 ? room.images : [{ url: room.image }],
//       max_occupancy: room.max_occupancy,
//       price_per_night: Number(room.price_per_night),
//       availability_status: room.availability_status,
//       room_type_id: room.room_type_id,
//       floor_number: room.floor_number || 0,
//       room_amenities: room.room_amenities || [],
//     },
//     mode: "onChange",
//   });

//   const {
//     control,
//     handleSubmit,
//     watch,
//     formState: { isDirty },
//   } = form;

//   useEffect(() => {
//     onDirtyChange(isDirty);
//   }, [isDirty, onDirtyChange]);

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "images",
//   });

//   const updateRoomMutation = useMutation({
//     mutationFn: (updatedData: Partial<EditRoomFormData & { image: string }>) =>
//       hotelClient.patch(`/rooms/${room.id}/`, updatedData),
//     onSuccess: () => {
//       toast.success("✅ Room details updated successfully!", {
//         description: "All changes have been saved and are now live.",
//         duration: 3000,
//       });

//       queryClient.invalidateQueries({ queryKey: ["roomDetails", room.id] });
//       queryClient.invalidateQueries({ queryKey: ["rooms"] });

//       setTimeout(() => {
//         onUpdateComplete();
//       }, 500);
//     },
//     onError: (error: any) => {
//       toast.error(
//         `❌ Update failed: ${error.response?.data?.detail || error.message}`,
//         {
//           description: "Please check your changes and try again.",
//           duration: 5000,
//         }
//       );
//     },
//   });

//   const onFormSubmit = (data: EditRoomFormData) => {
//     const { dirtyFields } = form.formState;
//     const payload: Partial<EditRoomFormData & { image: string }> = {};

//     (Object.keys(dirtyFields) as Array<keyof EditRoomFormData>).forEach(
//       (key) => {
//         // @ts-ignore
//         payload[key] = data[key];
//       }
//     );

//     if (dirtyFields.images && data.images.length > 0) {
//       payload.image = data.images[0].url;
//     }

//     if (Object.keys(payload).length === 0) {
//       toast.info("No changes were made.");
//       return;
//     }

//     updateRoomMutation.mutate(payload);
//   };

//   const currentImages = watch("images");

//   const getStatusBadgeVariant = (status: string) => {
//     switch (status) {
//       case "Available":
//         return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
//       case "Booked":
//         return "bg-amber-100 text-amber-800 hover:bg-amber-100";
//       case "Maintenance":
//         return "bg-red-100 text-red-800 hover:bg-red-100";
//       default:
//         return "bg-gray-100 text-gray-800 hover:bg-gray-100";
//     }
//   };

//   const getStatusVariant = (
//     status: string
//   ): "success" | "pending" | "failed" | "default" => {
//     switch (status) {
//       case "Available":
//         return "success";
//       case "Booked":
//         return "pending";
//       case "Maintenance":
//         return "failed";
//       default:
//         return "default";
//     }
//   };

//   const focusRingClass =
//     "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500";

//   return (
//     <div className="flex flex-col h-full bg-[#FFF] border-none">
//       <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-6 bg-[#F9FAFB] border border-b-[#E4E7EC]">
//         <div className="flex items-center justify-between">
//           <div className="space-y-2">
//             <SheetTitle className="text-3xl font-bold text-[#1D2939]">
//               Edit Room Details
//             </SheetTitle>
//             <div className="flex items-center gap-3">
//               <Badge
//                 variant="outline"
//                 className="text-lg px-3 py-1 font-semibold"
//               >
//                 {room.code}
//               </Badge>
//               <Badge
//                 variant={getStatusVariant(room.availability_status)}
//                 className="text-sm px-3 py-1"
//               >
//                 {room.availability_status}
//               </Badge>
//             </div>
//           </div>
//         </div>
//         <SheetDescription className="text-base text-[#667085] mt-2">
//           Modify room configuration, pricing, and amenities. All changes will be
//           applied immediately upon saving.
//         </SheetDescription>
//       </SheetHeader>

//       <Form {...form}>
//         <form
//           onSubmit={handleSubmit(onFormSubmit)}
//           className="flex flex-col h-full min-h-0"
//         >
//           <div className="flex-1 overflow-y-auto px-8 py-6">
//             <div className="space-y-8 pb-6">
//               <Card className="border-none p-0 border-gray-200 bg-gray-50/30 noScroll">
//                 <CardContent className="p-0">
//                   <div className="space-y-6">
//                     <div className="flex items-center gap-2">
//                       <ImageIcon className="h-5 w-5 text-gray-600" />
//                       <FormLabel className="text-lg font-semibold text-[#1D2939]">
//                         Room Gallery
//                       </FormLabel>
//                     </div>

//                     {currentImages && currentImages.length > 0 ? (
//                       <div className="flex gap-4 overflow-x-auto noScroll pb-2">
//                         {currentImages.map((image, index) => (
//                           <div
//                             key={index}
//                             className="group relative flex-shrink-0 w-64 h-40 rounded-md border shadow-xs overflow-hidden"
//                           >
//                             {image.url ? (
//                               <img
//                                 src={image.url}
//                                 alt={`Room image ${index + 1}`}
//                                 className="h-full w-full object-cover"
//                                 onError={(e) =>
//                                   (e.currentTarget.src =
//                                     "https://placehold.co/256x160/e2e8f0/94a3b8?text=Invalid+Image")
//                                 }
//                               />
//                             ) : (
//                               <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
//                                 <ImageIcon className="h-6 w-6" />
//                               </div>
//                             )}
//                             <Button
//                               type="button"
//                               size="icon"
//                               className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-xs z-10 hover:bg-[#FFF] hover:text-rose-600 cursor-pointer"
//                               onClick={() => remove(index)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="h-40 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
//                         <div className="text-center">
//                           <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
//                           <p className="text-lg">No images available</p>
//                           <p className="text-sm">Add image URLs below</p>
//                         </div>
//                       </div>
//                     )}

//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <h4 className="font-medium text-[#1D2939]">
//                           Manage Image URLs
//                         </h4>
//                         <Button
//                           type="button"
//                           variant="outline"
//                           onClick={() => append({ url: "" })}
//                           className="text-blue-600 cursor-pointer hover:text-blue-700 hover:bg-transparent shadow-none border-none rounded-lg transition-all"
//                         >
//                           <LuImagePlus className="mr-2 h-4 w-4" />
//                           Add Image
//                         </Button>
//                       </div>

//                       <div className="space-y-3">
//                         {fields.map((field, index) => (
//                           <FormField
//                             key={field.id}
//                             control={control}
//                             name={`images.${index}.url`}
//                             render={({ field: inputField }) => (
//                               <FormItem>
//                                 <div className="flex gap-3">
//                                   <div className="flex-1">
//                                     <FormControl>
//                                       <Input
//                                         placeholder={`Enter image URL ${
//                                           index + 1
//                                         }`}
//                                         className={cn(
//                                           "h-11 rounded-lg",
//                                           focusRingClass
//                                         )}
//                                         {...inputField}
//                                       />
//                                     </FormControl>
//                                   </div>
//                                 </div>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Separator />

//               <div className="space-y-6">
//                 <h3 className="text-xl font-semibold text-[#1D2939]">
//                   Room Type & Status
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
//                   <FormField
//                     control={control}
//                     name="room_type_id"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-[0.9375rem] text-[#667085] font-medium">
//                           Room Type
//                         </FormLabel>
//                         <Select
//                           onValueChange={field.onChange}
//                           defaultValue={field.value}
//                           disabled={isLoadingTypes}
//                         >
//                           <FormControl>
//                             <SelectTrigger
//                               className={cn(
//                                 "h-11 text-base rounded-lg",
//                                 focusRingClass
//                               )}
//                             >
//                               <SelectValue placeholder="Select room type" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {roomTypes?.map((type) => (
//                               <SelectItem key={type.id} value={type.id}>
//                                 {type.name}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={control}
//                     name="availability_status"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-[0.9375rem] text-[#667085] font-medium">
//                           Availability Status
//                         </FormLabel>
//                         <Select
//                           onValueChange={field.onChange}
//                           defaultValue={field.value}
//                         >
//                           <FormControl>
//                             <SelectTrigger
//                               className={cn(
//                                 "h-11 text-base rounded-lg",
//                                 focusRingClass
//                               )}
//                             >
//                               <SelectValue placeholder="Select status" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="Available">
//                               <span className="flex items-center gap-2">
//                                 <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
//                                 Available
//                               </span>
//                             </SelectItem>
//                             <SelectItem value="Booked">
//                               <span className="flex items-center gap-2">
//                                 <span className="h-2 w-2 rounded-full bg-amber-500"></span>
//                                 Booked
//                               </span>
//                             </SelectItem>
//                             <SelectItem value="Maintenance">
//                               <span className="flex items-center gap-2">
//                                 <span className="h-2 w-2 rounded-full bg-red-500"></span>
//                                 Maintenance
//                               </span>
//                             </SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-6">
//                 <h3 className="text-xl font-semibold text-[#1D2939]">
//                   Basic Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
//                   <FormField
//                     control={control}
//                     name="code"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-[0.9375rem] text-[#667085] font-medium">
//                           Room Code
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="e.g., DLX-101"
//                             className={cn(
//                               "h-11 text-base rounded-lg",
//                               focusRingClass
//                             )}
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={control}
//                     name="price_per_night"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-[0.9375rem] text-[#667085] font-medium">
//                           Price per Night
//                         </FormLabel>
//                         <div className="relative">
//                           <BsCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                           <FormControl>
//                             <Input
//                               type="number"
//                               step="0.01"
//                               className={cn(
//                                 "pl-10 h-11 text-[0.9375rem] rounded-lg",
//                                 focusRingClass
//                               )}
//                               placeholder="0.00"
//                               {...field}
//                             />
//                           </FormControl>
//                         </div>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={control}
//                     name="max_occupancy"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-[0.9375rem] text-[#667085] font-medium">
//                           Maximum Occupancy
//                         </FormLabel>
//                         <div className="relative">
//                           <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                           <FormControl>
//                             <Input
//                               type="number"
//                               className={cn(
//                                 "pl-10 h-11 text-base rounded-lg",
//                                 focusRingClass
//                               )}
//                               placeholder="0"
//                               {...field}
//                             />
//                           </FormControl>
//                         </div>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={control}
//                     name="floor_number"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-[0.9375rem] text-[#667085] font-medium">
//                           Floor Number
//                         </FormLabel>
//                         <div className="relative">
//                           <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                           <FormControl>
//                             <Input
//                               type="number"
//                               className={cn(
//                                 "pl-10 h-11 text-base rounded-lg",
//                                 focusRingClass
//                               )}
//                               placeholder="0"
//                               {...field}
//                             />
//                           </FormControl>
//                         </div>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <FormField
//                   control={control}
//                   name="description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-[0.9375rem] text-[#667085] font-medium">
//                         Description
//                       </FormLabel>
//                       <FormControl>
//                         <Textarea
//                           placeholder="Provide a detailed description of the room and its features..."
//                           className={cn(
//                             "min-h-[120px] text-base resize-none rounded-lg",
//                             focusRingClass
//                           )}
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <Separator />

//               <div className="space-y-6">
//                 <FormField
//                   control={control}
//                   name="room_amenities"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-xl font-semibold text-[#1D2939]">
//                         Room Amenities
//                       </FormLabel>
//                       {isLoadingAmenities ? (
//                         <div className="flex items-center gap-2 py-8">
//                           <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
//                           <p className="text-base text-[#667085]">
//                             Loading amenities...
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="flex flex-wrap gap-2">
//                           {allAmenities?.map((amenity) => {
//                             const isChecked = field.value?.includes(amenity.id);
//                             return (
//                               <FormItem key={amenity.id}>
//                                 <FormControl>
//                                   <Checkbox
//                                     className="sr-only"
//                                     checked={isChecked}
//                                     onCheckedChange={(checked) => {
//                                       return checked
//                                         ? field.onChange([
//                                             ...field.value,
//                                             amenity.id,
//                                           ])
//                                         : field.onChange(
//                                             field.value?.filter(
//                                               (id) => id !== amenity.id
//                                             )
//                                           );
//                                     }}
//                                   />
//                                 </FormControl>
//                                 <FormLabel
//                                   className={cn(
//                                     "flex flex-wrap items-center justify-center text-center px-4 py-2.5 rounded-lg border-2 font-medium cursor-pointer transition-all text-[13px]",
//                                     isChecked
//                                       ? "bg-gradient-to-r from-[#EFF6FF] to-blue-50 text-blue-600 border border-blue-300 shadow-xs rounded-full"
//                                       : "bg-white border border-[#E4E7EC] text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-full shadow-xs"
//                                   )}
//                                 >
//                                   {amenity.name}
//                                 </FormLabel>
//                               </FormItem>
//                             );
//                           })}
//                         </div>
//                       )}
//                       <FormMessage className="pt-2" />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>
//           </div>

//           <SheetFooter className="flex-shrink-0 px-6 shadow-lg py-4 border-t bg-white">
//             <div className="flex items-center justify-end gap-3 w-full">
//               <button
//                 className="bg-blue-600 hover:bg-blue-700 text-[#FFF] flex items-center gap-x-2 py-2.5 px-4 rounded-full text-[1rem] cursor-pointer transition-all focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-2"
//                 type="submit"
//                 disabled={updateRoomMutation.isPending || !isDirty}
//               >
//                 {updateRoomMutation.isPending && (
//                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                 )}
//                 {updateRoomMutation.isPending
//                   ? "Saving Changes..."
//                   : "Save Changes"}
//               </button>
//               <SheetClose asChild>
//                 <button
//                   type="button"
//                   className="border border-[#E4E7EC] hover:bg-gray-50 rounded-full py-2.5 px-4 text-[1rem] cursor-pointer transition-all focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-2"
//                   data-sheet-close="true"
//                 >
//                   Cancel
//                 </button>
//               </SheetClose>
//             </div>
//           </SheetFooter>
//         </form>
//       </Form>
//     </div>
//   );
// }

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useEffect } from "react";
import { Loader2, Users, Building, ImageIcon, Trash2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import hotelClient from "../../api/hotel-client";
import { cn } from "@/lib/utils";
import { BsCurrencyDollar } from "react-icons/bs";
import { LuImagePlus } from "react-icons/lu";

// --- TYPE DEFINITIONS ---
interface GalleryImage {
  url: string;
}

interface EditRoomFormData {
  code: string;
  description: string;
  images: GalleryImage[];
  max_occupancy: number;
  price_per_night: number;
  availability_status: string;
  room_type_id: string;
  floor_number: number;
  room_amenities: string[];
}

interface RoomDetails extends Omit<EditRoomFormData, "images"> {
  id: string;
  image: string;
  images: { url: string }[];
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
  images: yup
    .array()
    .of(
      yup.object().shape({
        url: yup
          .string()
          .url("Each image must be a valid URL.")
          .required("Image URL cannot be empty."),
      })
    )
    .min(1, "At least one image is required.")
    .required(),
  room_amenities: yup
    .array()
    .of(yup.string().required())
    .min(1, "At least one amenity must be selected."),
});

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
      images: room.images?.length > 0 ? room.images : [{ url: room.image }],
      max_occupancy: room.max_occupancy,
      price_per_night: Number(room.price_per_night),
      availability_status: room.availability_status,
      room_type_id: room.room_type_id,
      floor_number: room.floor_number || 0,
      room_amenities: room.room_amenities || [],
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = form;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const updateRoomMutation = useMutation({
    mutationFn: (updatedData: Partial<EditRoomFormData & { image: string }>) =>
      hotelClient.patch(`/rooms/${room.id}/`, updatedData),
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
    const { dirtyFields } = form.formState;
    const payload: Partial<EditRoomFormData & { image: string }> = {};

    (Object.keys(dirtyFields) as Array<keyof EditRoomFormData>).forEach(
      (key) => {
        // @ts-ignore
        payload[key] = data[key];
      }
    );

    if (dirtyFields.images && data.images.length > 0) {
      payload.image = data.images[0].url;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes were made.");
      return;
    }

    updateRoomMutation.mutate(payload);
  };

  const currentImages = watch("images");

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
            <SheetTitle className="text-3xl font-bold text-[#1D2939] dark:text-[#D0D5DD]">
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
              <Card className="border-none p-0 bg-transparent dark:bg-transparent noScroll">
                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-gray-600 dark:text-[#98A2B3]" />
                      <FormLabel className="text-lg font-semibold text-[#1D2939] dark:text-[#D0D5DD]">
                        Room Gallery
                      </FormLabel>
                    </div>

                    {currentImages && currentImages.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto noScroll pb-2">
                        {currentImages.map((image, index) => (
                          <div
                            key={index}
                            className="group relative flex-shrink-0 w-64 h-40 rounded-md border dark:border-[#1D2939] shadow-xs overflow-hidden"
                          >
                            {image.url ? (
                              <img
                                src={image.url}
                                alt={`Room image ${index + 1}`}
                                className="h-full w-full object-cover"
                                onError={(e) =>
                                  (e.currentTarget.src =
                                    "https://placehold.co/256x160/e2e8f0/94a3b8?text=Invalid+Image")
                                }
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-[#171F2F] text-gray-400 dark:text-[#5D636E]">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                            <Button
                              type="button"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-xs z-10 hover:bg-[#FFF] hover:text-rose-600 dark:bg-[#101828]/80 dark:text-[#D0D5DD] dark:hover:bg-[#101828] dark:hover:text-rose-400 cursor-pointer"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-[#171F2F] text-gray-500 dark:text-[#98A2B3] rounded-lg">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-[#5D636E]" />
                          <p className="text-lg">No images available</p>
                          <p className="text-sm">Add image URLs below</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-[#1D2939] dark:text-[#D0D5DD]">
                          Manage Image URLs
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => append({ url: "" })}
                          className="text-blue-600 cursor-pointer hover:text-blue-700 hover:bg-transparent shadow-none border-none rounded-lg transition-all"
                        >
                          <LuImagePlus className="mr-2 h-4 w-4" />
                          Add Image
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <FormField
                            key={field.id}
                            control={control}
                            name={`images.${index}.url`}
                            render={({ field: inputField }) => (
                              <FormItem>
                                <div className="flex gap-3">
                                  <div className="flex-1">
                                    <FormControl>
                                      <Input
                                        placeholder={`Enter image URL ${
                                          index + 1
                                        }`}
                                        className={cn(
                                          "h-11 rounded-lg",
                                          focusRingClass,
                                          inputBaseClass
                                        )}
                                        {...inputField}
                                      />
                                    </FormControl>
                                  </div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator className="dark:bg-[#1D2939]" />

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
                                      ? "bg-gradient-to-r from-[#EFF6FF] to-blue-50 text-blue-600 border border-blue-300 shadow-xs rounded-full dark:bg-[#162142] dark:border-none dark:text-blue-600"
                                      : "bg-white border border-[#E4E7EC] text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-full shadow-xs dark:bg-[#101828] dark:border-[#1D2939] dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
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
