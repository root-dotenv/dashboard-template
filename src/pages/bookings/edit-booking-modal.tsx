"use client";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { Loader2, Mail, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FormField as HookFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/custom/InputCustom";

// --- Type Definitions ---
interface Booking {
  id: string;
  code: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  booking_status: string;
  checkin: string | null;
  checkout: string | null;
  special_requests: string | null;
  service_notes: string | null;
  [key: string]: any;
}

interface EditBookingFormProps {
  booking: Booking;
  onUpdateComplete: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

const schema = yup.object().shape({
  full_name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Must be a valid email")
    .required("Email is required"),
  phone_number: yup.string().required("Phone number is required"),
  address: yup.string().required("Address is required"),
  booking_status: yup.string().required("Booking status is required"),
  special_requests: yup.string().nullable(),
  service_notes: yup.string().nullable(),
});

export default function EditBookingForm({
  booking,
  onUpdateComplete,
  onDirtyChange,
}: EditBookingFormProps) {
  const queryClient = useQueryClient();
  const [isCheckoutRequested, setIsCheckoutRequested] = useState(false);

  const form = useForm<Partial<Booking>>({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: booking.full_name,
      email: booking.email,
      phone_number: booking.phone_number.toString(),
      booking_status: booking.booking_status,
      address: booking.address,
      special_requests: booking.special_requests || "",
      service_notes: booking.service_notes || "",
    },
    mode: "onChange",
  });

  const {
    formState: { isDirty, dirtyFields },
  } = form;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const BOOKING_BASE_URL = "http://booking.safaripro.net/api/v1/";

  const updateBookingMutation = useMutation({
    mutationFn: (updatedData: Partial<Booking>) =>
      axios.patch(`${BOOKING_BASE_URL}bookings/${booking.id}`, updatedData),
    onSuccess: () => {
      toast.success("Booking details have been updated successfully.");
      queryClient.invalidateQueries({
        queryKey: ["bookingDetails", booking.id],
      });
      onUpdateComplete();
    },
    onError: (error: any) =>
      toast.error(
        `Update Failed: ${error.response?.data?.detail || error.message}`
      ),
  });

  const checkOutMutation = useMutation({
    mutationFn: () =>
      axios.post(`${BOOKING_BASE_URL}bookings/${booking.id}/check_out`),
    onSuccess: () => {
      toast.success("Guest has been checked out successfully.");
      queryClient.invalidateQueries({
        queryKey: ["bookingDetails", booking.id],
      });
      onUpdateComplete();
    },
    onError: (error: any) =>
      toast.error(
        `Check-out Failed: ${error.response?.data?.detail || error.message}`
      ),
  });

  const onUpdateSubmit = (data: Partial<Booking>) => {
    const changedData: Partial<Booking> = {};

    // Iterate over the keys of dirtyFields, which contains only the changed fields
    Object.keys(dirtyFields).forEach((key) => {
      const fieldName = key as keyof Partial<Booking>;
      changedData[fieldName] = data[fieldName];
    });

    if (Object.keys(changedData).length === 0) {
      toast.info("No changes were made.");
      onUpdateComplete();
      return;
    }

    updateBookingMutation.mutate(changedData);
  };

  const handleCheckout = () => {
    if (isCheckoutRequested) {
      checkOutMutation.mutate();
    }
  };

  const isProcessing =
    updateBookingMutation.isPending || checkOutMutation.isPending;

  return (
    <div className="flex flex-col h-full bg-[#FFF] dark:bg-[#101828]">
      <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-b-[#1D2939]">
        <SheetTitle className="text-2xl font-bold text-[#1D2939] dark:text-[#D0D5DD]">
          Edit Booking: {booking.code}
        </SheetTitle>
        <SheetDescription className="text-base text-[#667085] dark:text-[#98A2B3]">
          Make changes to the booking details or perform a check-out.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form
          id="edit-booking-form"
          onSubmit={form.handleSubmit(onUpdateSubmit)}
          className="flex flex-col h-full min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <HookFormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          prefixIcon={
                            <User className="h-4 w-4 text-gray-400" />
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <HookFormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          prefixIcon={
                            <Mail className="h-4 w-4 text-gray-400" />
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <HookFormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          {...field}
                          prefixIcon={
                            <Phone className="h-4 w-4 text-gray-400" />
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <HookFormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          prefixIcon={
                            <MapPin className="h-4 w-4 text-gray-400" />
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Booking Status</h3>
              <HookFormField
                control={form.control}
                name="booking_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Checked In">Checked In</SelectItem>
                        <SelectItem value="Checked Out">Checked Out</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Notes & Requests</h3>
              <HookFormField
                control={form.control}
                name="special_requests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest's Special Requests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., extra pillows, late check-in..."
                        rows={3}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <HookFormField
                control={form.control}
                name="service_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Service Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., VIP guest, anniversary celebration..."
                        rows={3}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {booking.checkin && !booking.checkout && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    Guest Check-out
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action will record the current time as the guest's
                    departure and cannot be undone.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confirm-checkout"
                      checked={isCheckoutRequested}
                      onCheckedChange={(checked) =>
                        setIsCheckoutRequested(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="confirm-checkout"
                      className="text-sm font-medium leading-none"
                    >
                      I confirm I want to check this guest out now.
                    </label>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={!isCheckoutRequested || isProcessing}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {checkOutMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Check Out Guest
                  </Button>
                </div>
              </>
            )}
          </div>

          <SheetFooter className="px-6 py-4 border-t dark:border-t-[#1D2939]">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button
              type="submit"
              form="edit-booking-form"
              disabled={isProcessing || !isDirty}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateBookingMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </div>
  );
}
