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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Added RadioGroup
import {
  Loader2,
  User,
  Mail,
  Phone,
  Home,
  Users,
  Baby,
  Info,
  Banknote, // Icon for Cash
  Smartphone, // Icon for Mobile
} from "lucide-react";

// --- UPDATED: Added payment_method to schema ---
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
  payment_method: yup // Added payment_method validation
    .string()
    .oneOf(["Cash", "Mobile"], "Please select a payment method.")
    .required("Payment method is required."),
  service_notes: yup.string().optional(),
  special_requests: yup.string().optional(),
});

type GuestDetailsFormData = yup.InferType<typeof guestDetailsSchema>;

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
    mode: "onBlur", // Changed to onBlur for better UX with radio/select
    defaultValues: {
      number_of_guests: 1,
      number_of_children: 0,
      number_of_infants: 0,
      service_notes: "",
      special_requests: "",
      payment_method: undefined, // Default to undefined
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

    // --- UPDATED: Payload construction includes payment_method ---
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
      payment_method: data.payment_method as "Cash" | "Mobile", // Get selected method
    };

    const fullUrl = `${bookingClient.defaults.baseURL}/bookings/web-create`;
    console.log("--- Debugging Booking Creation ---");
    console.log("Full Request URL:", fullUrl);
    console.log("Request Payload:", payload);

    setBookingPayload(payload); // Consider if you still need this in store
    mutation.mutate(payload);
  };

  if (!selectedRoom || !startDate || !endDate) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Info className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <p className="font-semibold">Missing Booking Information</p>
        <p>Please go back to Step 1 to select a room and date range.</p>
        <Button onClick={() => setStep(1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const duration = differenceInDays(endDate, startDate) || 1;
  const totalCost = duration * selectedRoom.price_per_night;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="lg:col-span-2 shadow-none bg-[#FFF]">
        <CardHeader>
          <CardTitle>Guest Information & Payment</CardTitle>
          <CardDescription>
            Enter the primary guest's details and select the payment method.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Guest Details Fields (name, email, phone, address) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} icon={User} />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@email.com"
                          {...field}
                          icon={Mail}
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+255 712 345 678"
                          {...field}
                          icon={Phone}
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
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Mjini, Dar es Salaam"
                          {...field}
                          icon={Home}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Occupancy Fields (guests, children, infants) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="number_of_guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adults</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} icon={Users} />
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
                      <FormLabel>Children</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} icon={Users} />
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
                      <FormLabel>Infants</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} icon={Baby} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* --- ADDED: Payment Method Selection --- */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold">
                      Payment Method
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 flex-1 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                          <FormControl>
                            <RadioGroupItem value="Cash" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                            <Banknote className="h-5 w-5 text-green-600" /> Pay
                            with Cash
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 flex-1 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                          <FormControl>
                            <RadioGroupItem value="Mobile" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                            <Smartphone className="h-5 w-5 text-blue-600" /> Pay
                            with Mobile
                          </FormLabel>
                        </FormItem>
                        {/* --- FIX: Corrected closing tag --- */}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* --- End Payment Method --- */}

              <Separator />

              {/* Optional Notes Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="service_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Guest is traveling with a pet"
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
                      <FormLabel>Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Late check-in"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Confirmation Checkbox */}
              <div className="items-top flex space-x-2 pt-4">
                <Checkbox
                  id="confirm-details"
                  checked={isConfirmed}
                  onCheckedChange={(checked) => setIsConfirmed(!!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="confirm-details"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I confirm that the guest's details are correct and accurate.
                  </label>
                  <p className="text-xs text-muted-foreground">
                    This will create a preliminary booking. Pricing will be
                    finalized in the next step.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back to Room Selection
                </Button>
                <Button
                  variant={"main"}
                  type="submit"
                  disabled={
                    !isConfirmed ||
                    mutation.isPending ||
                    !form.formState.isValid // Added form validity check
                  }
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Booking & Proceed
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Booking Summary Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-28 shadow-sm">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
            <CardDescription>
              Review the details before proceeding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room Type:</span>
              <span className="font-semibold">
                {selectedRoom.room_type_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room Code:</span>
              <span className="font-mono text-xs">
                {selectedRoom.room_code}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in:</span>
              <span className="font-medium">
                {format(startDate, "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out:</span>
              <span className="font-medium">
                {format(endDate, "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{duration} Night(s)</span>
            </div>
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Base Price:</span>
              <span className="text-lg font-bold text-blue-600">
                ${totalCost.toFixed(2)}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Taxes and fees will be calculated in the next step.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
