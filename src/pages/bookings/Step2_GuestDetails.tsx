// // src/pages/bookings/components/Step2_GuestDetails.tsx
// "use client";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useMutation } from "@tanstack/react-query";
// import { useBookingStore } from "@/store/booking.store";
// import { useHotel } from "@/providers/hotel-provider";
// import bookingClient from "@/api/booking-client";
// import { toast } from "sonner";
// import { format, differenceInDays } from "date-fns";
// import {
//   type CreateBookingPayload,
//   type CreateBookingResponse,
// } from "./booking-types";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Added RadioGroup
// import {
//   Loader2,
//   User,
//   Mail,
//   Phone,
//   Home,
//   Users,
//   Baby,
//   Info,
//   Banknote, // Icon for Cash
//   Smartphone, // Icon for Mobile
// } from "lucide-react";

// // --- UPDATED: Added payment_method to schema ---
// const guestDetailsSchema = yup.object({
//   full_name: yup.string().required("Full name is required."),
//   email: yup
//     .string()
//     .email("Invalid email address.")
//     .required("Email is required."),
//   phone_number: yup.string().required("Phone number is required."),
//   address: yup.string().required("Address is required."),
//   number_of_guests: yup
//     .number()
//     .min(1, "At least one guest is required.")
//     .required()
//     .typeError("Must be a number"),
//   number_of_children: yup
//     .number()
//     .min(0)
//     .required()
//     .typeError("Must be a number"),
//   number_of_infants: yup
//     .number()
//     .min(0)
//     .required()
//     .typeError("Must be a number"),
//   payment_method: yup // Added payment_method validation
//     .string()
//     .oneOf(["Cash", "Mobile"], "Please select a payment method.")
//     .required("Payment method is required."),
//   service_notes: yup.string().optional(),
//   special_requests: yup.string().optional(),
// });

// type GuestDetailsFormData = yup.InferType<typeof guestDetailsSchema>;

// export default function Step2_GuestDetails() {
//   const { hotel } = useHotel();
//   const {
//     startDate,
//     endDate,
//     selectedRoom,
//     setCreatedBooking,
//     setStep,
//     setBookingPayload,
//   } = useBookingStore();
//   const [isConfirmed, setIsConfirmed] = useState(false);

//   const form = useForm<GuestDetailsFormData>({
//     resolver: yupResolver(guestDetailsSchema),
//     mode: "onBlur", // Changed to onBlur for better UX with radio/select
//     defaultValues: {
//       number_of_guests: 1,
//       number_of_children: 0,
//       number_of_infants: 0,
//       service_notes: "",
//       special_requests: "",
//       payment_method: undefined, // Default to undefined
//     },
//   });

//   const mutation = useMutation<
//     CreateBookingResponse,
//     Error,
//     CreateBookingPayload
//   >({
//     mutationKey: ["createBooking"],
//     mutationFn: (payload) =>
//       bookingClient.post("/bookings/web-create", payload),
//     onSuccess: (response) => {
//       toast.success("Booking draft created successfully!");
//       setCreatedBooking(response.data);
//       setStep(3);
//     },
//     onError: (error) => {
//       toast.error(`Failed to create booking: ${error.message}`);
//     },
//   });

//   const onSubmit = (data: GuestDetailsFormData) => {
//     if (!selectedRoom || !startDate || !endDate || !hotel) {
//       toast.error("Missing booking information. Please start over.", {
//         description: "Key details like room selection or dates are missing.",
//       });
//       return;
//     }

//     const duration = differenceInDays(endDate, startDate) || 1;
//     const amount_required = (duration * selectedRoom.price_per_night).toFixed(
//       2
//     );

//     // --- UPDATED: Payload construction includes payment_method ---
//     const payload: CreateBookingPayload = {
//       full_name: data.full_name,
//       email: data.email,
//       phone_number: data.phone_number,
//       address: data.address,
//       number_of_guests: String(data.number_of_guests),
//       number_of_children: String(data.number_of_children),
//       number_of_infants: String(data.number_of_infants),
//       service_notes: data.service_notes || "No",
//       special_requests: data.special_requests || "No",
//       amount_required,
//       property_item_type: selectedRoom.room_type_name,
//       start_date: format(startDate, "yyyy-MM-dd"),
//       end_date: format(endDate, "yyyy-MM-dd"),
//       microservice_item_id: hotel.id,
//       booking_type: "Physical",
//       booking_status: "Processing",
//       payment_method: data.payment_method as "Cash" | "Mobile", // Get selected method
//     };

//     const fullUrl = `${bookingClient.defaults.baseURL}/bookings/web-create`;
//     console.log("--- Debugging Booking Creation ---");
//     console.log("Full Request URL:", fullUrl);
//     console.log("Request Payload:", payload);

//     setBookingPayload(payload); // Consider if you still need this in store
//     mutation.mutate(payload);
//   };

//   if (!selectedRoom || !startDate || !endDate) {
//     return (
//       <div className="text-center py-16 text-gray-500">
//         <Info className="mx-auto h-12 w-12 text-red-400 mb-4" />
//         <p className="font-semibold">Missing Booking Information</p>
//         <p>Please go back to Step 1 to select a room and date range.</p>
//         <Button onClick={() => setStep(1)} className="mt-4">
//           Go Back
//         </Button>
//       </div>
//     );
//   }

//   const duration = differenceInDays(endDate, startDate) || 1;
//   const totalCost = duration * selectedRoom.price_per_night;

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
//       <Card className="lg:col-span-2 shadow-none bg-[#FFF]">
//         <CardHeader>
//           <CardTitle>Guest Information & Payment</CardTitle>
//           <CardDescription>
//             Enter the primary guest's details and select the payment method.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               {/* Guest Details Fields (name, email, phone, address) */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="full_name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Full Name</FormLabel>
//                       <FormControl>
//                         <Input placeholder="John Doe" {...field} icon={User} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Email Address</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="email"
//                           placeholder="john.doe@email.com"
//                           {...field}
//                           icon={Mail}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="phone_number"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Phone Number</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="+255 712 345 678"
//                           {...field}
//                           icon={Phone}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="address"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Address</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="123 Mjini, Dar es Salaam"
//                           {...field}
//                           icon={Home}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <Separator />

//               {/* Occupancy Fields (guests, children, infants) */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="number_of_guests"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Adults</FormLabel>
//                       <FormControl>
//                         <Input type="number" min="1" {...field} icon={Users} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="number_of_children"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Children</FormLabel>
//                       <FormControl>
//                         <Input type="number" min="0" {...field} icon={Users} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="number_of_infants"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Infants</FormLabel>
//                       <FormControl>
//                         <Input type="number" min="0" {...field} icon={Baby} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <Separator />

//               {/* --- ADDED: Payment Method Selection --- */}
//               <FormField
//                 control={form.control}
//                 name="payment_method"
//                 render={({ field }) => (
//                   <FormItem className="space-y-3">
//                     <FormLabel className="text-base font-semibold">
//                       Payment Method
//                     </FormLabel>
//                     <FormControl>
//                       <RadioGroup
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                         className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
//                       >
//                         <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 flex-1 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
//                           <FormControl>
//                             <RadioGroupItem value="Cash" />
//                           </FormControl>
//                           <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
//                             <Banknote className="h-5 w-5 text-green-600" /> Pay
//                             with Cash
//                           </FormLabel>
//                         </FormItem>
//                         <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 flex-1 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
//                           <FormControl>
//                             <RadioGroupItem value="Mobile" />
//                           </FormControl>
//                           <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
//                             <Smartphone className="h-5 w-5 text-blue-600" /> Pay
//                             with Mobile
//                           </FormLabel>
//                         </FormItem>
//                         {/* --- FIX: Corrected closing tag --- */}
//                       </RadioGroup>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {/* --- End Payment Method --- */}

//               <Separator />

//               {/* Optional Notes Fields */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="service_notes"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Service Notes (Optional)</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           placeholder="e.g., Guest is traveling with a pet"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="special_requests"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Special Requests (Optional)</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           placeholder="e.g., Late check-in"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Confirmation Checkbox */}
//               <div className="items-top flex space-x-2 pt-4">
//                 <Checkbox
//                   id="confirm-details"
//                   checked={isConfirmed}
//                   onCheckedChange={(checked) => setIsConfirmed(!!checked)}
//                 />
//                 <div className="grid gap-1.5 leading-none">
//                   <label
//                     htmlFor="confirm-details"
//                     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                   >
//                     I confirm that the guest's details are correct and accurate.
//                   </label>
//                   <p className="text-xs text-muted-foreground">
//                     This will create a preliminary booking. Pricing will be
//                     finalized in the next step.
//                   </p>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-between items-center pt-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setStep(1)}
//                 >
//                   Back to Room Selection
//                 </Button>
//                 <Button
//                   variant={"main"}
//                   type="submit"
//                   disabled={
//                     !isConfirmed ||
//                     mutation.isPending ||
//                     !form.formState.isValid // Added form validity check
//                   }
//                 >
//                   {mutation.isPending && (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   )}
//                   Create Booking & Proceed
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>

//       {/* Booking Summary Sidebar */}
//       <div className="lg:col-span-1">
//         <Card className="sticky top-28 shadow-sm">
//           <CardHeader>
//             <CardTitle>Booking Summary</CardTitle>
//             <CardDescription>
//               Review the details before proceeding.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4 text-sm">
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Room Type:</span>
//               <span className="font-semibold">
//                 {selectedRoom.room_type_name}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Room Code:</span>
//               <span className="font-mono text-xs">
//                 {selectedRoom.room_code}
//               </span>
//             </div>
//             <Separator />
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Check-in:</span>
//               <span className="font-medium">
//                 {format(startDate, "MMM dd, yyyy")}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Check-out:</span>
//               <span className="font-medium">
//                 {format(endDate, "MMM dd, yyyy")}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Duration:</span>
//               <span className="font-medium">{duration} Night(s)</span>
//             </div>
//             <Separator />
//             <div className="flex justify-between items-baseline">
//               <span className="text-muted-foreground">Base Price:</span>
//               <span className="text-lg font-bold text-blue-600">
//                 ${totalCost.toFixed(2)}
//               </span>
//             </div>
//           </CardContent>
//           <CardFooter>
//             <p className="text-xs text-muted-foreground">
//               Taxes and fees will be calculated in the next step.
//             </p>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// }

// src/pages/bookings/components/Step2_GuestDetails.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useBookingStore } from "@/store/booking.store";
import { useHotel } from "@/providers/hotel-provider";
import bookingClient from "@/api/booking-client";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import {
  type CreateBookingPayload,
  type CreateBookingResponse,
} from "./booking-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Home,
  Users,
  Baby,
  Info,
  Banknote,
  Smartphone,
  Shield,
  CheckCircle,
  Calendar,
  MapPin,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Schema remains exactly the same
const guestDetailsSchema = yup.object({
  full_name: yup.string().required("Full name is required."),
  email: yup
    .string()
    .email("Invalid email address.")
    .required("Email is required."),
  phone_number: yup.string().required("Phone number is required."),
  address: yup.string().required("Address is required."),
  number_of_guests: yup
    .number()
    .min(1, "At least one guest is required.")
    .required()
    .typeError("Must be a number"),
  number_of_children: yup
    .number()
    .min(0)
    .required()
    .typeError("Must be a number"),
  number_of_infants: yup
    .number()
    .min(0)
    .required()
    .typeError("Must be a number"),
  payment_method: yup
    .string()
    .oneOf(["Cash", "Mobile"], "Please select a payment method.")
    .required("Payment method is required."),
  service_notes: yup.string().optional(),
  special_requests: yup.string().optional(),
});

type GuestDetailsFormData = yup.InferType<typeof guestDetailsSchema>;

// Enhanced Input with Icon Component
const FormInputWithIcon = ({ icon: Icon, ...props }: any) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <Input {...props} className="pl-10" />
  </div>
);

export default function Step2_GuestDetails() {
  const { hotel } = useHotel();
  const {
    startDate,
    endDate,
    selectedRoom,
    setCreatedBooking,
    setStep,
    setBookingPayload,
  } = useBookingStore();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const form = useForm<GuestDetailsFormData>({
    resolver: yupResolver(guestDetailsSchema),
    mode: "onBlur",
    defaultValues: {
      number_of_guests: 1,
      number_of_children: 0,
      number_of_infants: 0,
      service_notes: "",
      special_requests: "",
      payment_method: undefined,
    },
  });

  const mutation = useMutation<
    CreateBookingResponse,
    Error,
    CreateBookingPayload
  >({
    mutationKey: ["createBooking"],
    mutationFn: (payload) =>
      bookingClient.post("/bookings/web-create", payload),
    onSuccess: (response) => {
      toast.success("Booking draft created successfully!");
      setCreatedBooking(response.data);
      setStep(3);
    },
    onError: (error) => {
      toast.error(`Failed to create booking: ${error.message}`);
    },
  });

  const onSubmit = (data: GuestDetailsFormData) => {
    if (!selectedRoom || !startDate || !endDate || !hotel) {
      toast.error("Missing booking information. Please start over.", {
        description: "Key details like room selection or dates are missing.",
      });
      return;
    }

    const duration = differenceInDays(endDate, startDate) || 1;
    const amount_required = (duration * selectedRoom.price_per_night).toFixed(
      2
    );

    const payload: CreateBookingPayload = {
      full_name: data.full_name,
      email: data.email,
      phone_number: data.phone_number,
      address: data.address,
      number_of_guests: String(data.number_of_guests),
      number_of_children: String(data.number_of_children),
      number_of_infants: String(data.number_of_infants),
      service_notes: data.service_notes || "No",
      special_requests: data.special_requests || "No",
      amount_required,
      property_item_type: selectedRoom.room_type_name,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      microservice_item_id: hotel.id,
      booking_type: "Physical",
      booking_status: "Processing",
      payment_method: data.payment_method as "Cash" | "Mobile",
    };

    const fullUrl = `${bookingClient.defaults.baseURL}/bookings/web-create`;
    console.log("--- Debugging Booking Creation ---");
    console.log("Full Request URL:", fullUrl);
    console.log("Request Payload:", payload);

    setBookingPayload(payload);
    mutation.mutate(payload);
  };

  if (!selectedRoom || !startDate || !endDate) {
    return (
      <Card className="mx-auto max-w-md mt-8">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Missing Booking Information
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Please go back to Step 1 to select a room and date range.
            </p>
            <Button onClick={() => setStep(1)} className="w-full">
              Return to Room Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const duration = differenceInDays(endDate, startDate) || 1;
  const totalCost = duration * selectedRoom.price_per_night;
  const perNightCost = selectedRoom.price_per_night;

  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <User className="h-4 w-4" />
          Step 2: Guest Information
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Complete Guest Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Please provide the primary guest's information and select your
          preferred payment method to proceed with the booking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Form - Enhanced Design */}
        <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-b">
            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
              <User className="h-6 w-6 text-blue-600" />
              Guest Information & Payment
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              All fields are required unless marked optional
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <FormInputWithIcon
                              icon={User}
                              placeholder="John Doe"
                              {...field}
                              className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address *
                          </FormLabel>
                          <FormControl>
                            <FormInputWithIcon
                              icon={Mail}
                              type="email"
                              placeholder="john.doe@email.com"
                              {...field}
                              className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number *
                          </FormLabel>
                          <FormControl>
                            <FormInputWithIcon
                              icon={Phone}
                              placeholder="+255 712 345 678"
                              {...field}
                              className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Address *
                          </FormLabel>
                          <FormControl>
                            <FormInputWithIcon
                              icon={Home}
                              placeholder="123 Mjini, Dar es Salaam"
                              {...field}
                              className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Occupancy Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Occupancy Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="number_of_guests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Adults *
                          </FormLabel>
                          <FormControl>
                            <FormInputWithIcon
                              icon={Users}
                              type="number"
                              min="1"
                              placeholder="2"
                              {...field}
                              className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="number_of_children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Children
                          </FormLabel>
                          <FormControl>
                            <FormInputWithIcon
                              icon={Users}
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="number_of_infants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Infants
                          </FormLabel>
                          <FormControl>
                            <FormInputWithIcon
                              icon={Baby}
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Payment Method Section - Enhanced */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Payment Method
                    </h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-base font-semibold text-gray-900 dark:text-white">
                          Select your preferred payment method *
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <FormItem>
                              <FormLabel className="[&:has([data-state=checked])]:border-blue-600 [&:has([data-state=checked])]:bg-blue-50 dark:[&:has([data-state=checked])]:bg-blue-900/20 cursor-pointer">
                                <FormControl>
                                  <RadioGroupItem
                                    value="Cash"
                                    className="sr-only"
                                  />
                                </FormControl>
                                <div
                                  className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                                    field.value === "Cash"
                                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "flex items-center justify-center w-6 h-6 rounded-full border-2",
                                      field.value === "Cash"
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-gray-400 dark:border-gray-500"
                                    )}
                                  >
                                    {field.value === "Cash" && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 flex-1">
                                    <Banknote className="h-8 w-8 text-green-600" />
                                    <div>
                                      <p className="font-semibold text-gray-900 dark:text-white">
                                        Pay with Cash
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Pay at the property
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </FormLabel>
                            </FormItem>
                            <FormItem>
                              <FormLabel className="[&:has([data-state=checked])]:border-blue-600 [&:has([data-state=checked])]:bg-blue-50 dark:[&:has([data-state=checked])]:bg-blue-900/20 cursor-pointer">
                                <FormControl>
                                  <RadioGroupItem
                                    value="Mobile"
                                    className="sr-only"
                                  />
                                </FormControl>
                                <div
                                  className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                                    field.value === "Mobile"
                                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "flex items-center justify-center w-6 h-6 rounded-full border-2",
                                      field.value === "Mobile"
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-gray-400 dark:border-gray-500"
                                    )}
                                  >
                                    {field.value === "Mobile" && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 flex-1">
                                    <Smartphone className="h-8 w-8 text-blue-600" />
                                    <div>
                                      <p className="font-semibold text-gray-900 dark:text-white">
                                        Mobile Payment
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Secure digital payment
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Additional Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Additional Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="service_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Service Notes
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Guest is traveling with a pet, special dietary requirements..."
                              className="min-h-[100px] resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="special_requests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Special Requests
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Late check-in, room preferences, airport transfer..."
                              className="min-h-[100px] resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Confirmation Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="confirm-details"
                          checked={isConfirmed}
                          onCheckedChange={(checked) =>
                            setIsConfirmed(!!checked)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <label
                          htmlFor="confirm-details"
                          className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
                        >
                          Confirm Guest Information Accuracy
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 pl-9">
                        I verify that all provided guest details are accurate
                        and complete. This creates a preliminary booking
                        reservation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-11 px-6 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    Back to Room Selection
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !isConfirmed ||
                      mutation.isPending ||
                      !form.formState.isValid
                    }
                    className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Booking & Continue
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Enhanced Booking Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-28 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <CreditCard className="h-5 w-5 text-green-600" />
                Booking Summary
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Review your reservation details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Room Information */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {selectedRoom.room_type_name}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {selectedRoom.room_code}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${totalCost.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${perNightCost}/night × {duration} night
                      {duration > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Stay Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Stay Duration
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {format(startDate, "MMM dd, yyyy")} -{" "}
                      {format(endDate, "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Property
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {hotel?.name}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Base price:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Taxes & fees:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${(totalCost * 0.27).toFixed(2)}
                  </span>
                </div>
                <Separator className="bg-gray-200 dark:bg-gray-700" />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${(totalCost * 1.27).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="h-3 w-3" />
                Your information is secure and encrypted
              </div>
            </CardFooter>
          </Card>

          {/* Support Card */}
          <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Need Help?
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Contact our support team
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
