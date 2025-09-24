// --- src/pages/hotels/edit-booking-modal.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField as HookFormField, // Renamed to avoid conflict with custom FormField
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarCheck,
} from "react-icons/fa";
import { NotesSummary } from "../onboarding/notes-summary";
import { FormField } from "../onboarding/form-field";

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

interface EditBookingModalProps {
  booking: Booking;
  onClose: () => void;
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

export default function EditBookingModal({
  booking,
  onClose,
}: EditBookingModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
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
  });

  const BOOKING_BASE_URL = import.meta.env.VITE_BOOKING_BASE_URL;

  const updateBookingMutation = useMutation({
    mutationFn: (updatedData: Partial<Booking>) =>
      axios.patch(`${BOOKING_BASE_URL}bookings/${booking.id}`, updatedData),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Booking details have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookingDetails", booking.id],
      });
      onClose();
    },
    onError: (error) =>
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      }),
  });

  const checkOutMutation = useMutation({
    mutationFn: () =>
      axios.post(`${BOOKING_BASE_URL}bookings/${booking.id}/check_out`),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Guest has been checked out successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookingDetails", booking.id],
      });
      onClose();
    },
    onError: (error) =>
      toast({
        variant: "destructive",
        title: "Check-out Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      }),
  });

  const onUpdateSubmit = (data: Partial<Booking>) => {
    const changedData: { [key: string]: any } = {};
    Object.keys(data).forEach((keyStr) => {
      const key = keyStr as keyof Partial<Booking>;
      const originalValue = booking[key] === null ? "" : booking[key];
      const formValue = data[key] === null ? "" : data[key];

      if (String(originalValue) !== String(formValue)) {
        changedData[key] = data[key];
      }
    });

    if (Object.keys(changedData).length === 0) {
      toast({
        title: "No Changes",
        description: "No details were modified.",
      });
      onClose();
      return;
    }

    console.log("Data being sent to the backend:", changedData);
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[680px] sm:max-h-[90vh] bg-white rounded-md shadow-md">
        {/* Added bg-white, rounded-lg, shadow-lg */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          {/* Added border-gray-200 */}
          <DialogTitle className="text-xl font-bold text-gray-800">
            Edit Booking with ID: {booking.code}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Make changes to the booking details or perform a check-out.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-4 space-y-6">
          {" "}
          {/* Added space-y-6 for vertical rhythm */}
          <NotesSummary title="Important!">
            <p>
              Ensure all guest details are accurate. Updating these details
              impacts how the booking is managed and communicated.
            </p>
          </NotesSummary>
          <Form {...form}>
            <form
              id="edit-booking-form"
              onSubmit={form.handleSubmit(onUpdateSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {" "}
                {/* Adopted grid layout */}
                <HookFormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormField
                      name={field.name}
                      label="Full Name"
                      icon={<FaUser size={16} />}
                      required
                    >
                      <FormControl>
                        <Input {...field} placeholder="e.g. John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormField>
                  )}
                />
                <HookFormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormField
                      name={field.name}
                      label="Email"
                      icon={<FaEnvelope size={16} />}
                      required
                    >
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="e.g. johndoe@example.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormField>
                  )}
                />
                <HookFormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormField
                      name={field.name}
                      label="Phone Number"
                      icon={<FaPhone size={16} />}
                      required
                    >
                      <FormControl>
                        <Input
                          type="tel"
                          {...field}
                          placeholder="e.g. +255712345678"
                          maxLength={13}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormField>
                  )}
                />
                <HookFormField
                  control={form.control}
                  name="booking_status"
                  render={({ field }) => (
                    <FormField
                      name={field.name}
                      label="Booking Status"
                      icon={<FaCalendarCheck size={16} />} // Using as generic status icon
                      required
                    >
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
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Checked In">Checked In</SelectItem>
                          <SelectItem value="Checked Out">
                            Checked Out
                          </SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormField>
                  )}
                />
                <div className="md:col-span-2">
                  {" "}
                  {/* Address field spans two columns */}
                  <HookFormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormField
                        name={field.name}
                        label="Guest's Address"
                        icon={<FaMapMarkerAlt size={16} />}
                        required
                      >
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. 123 Main St, City, Country"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormField>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                {" "}
                {/* Added padding top for spacing */}
                <HookFormField
                  control={form.control}
                  name="special_requests"
                  render={({ field }) => (
                    <FormField
                      name={field.name}
                      label="Guest's Special Requests"
                      icon={null}
                    >
                      <FormControl>
                        <Textarea
                          placeholder="Notes about the guest's specific requests..."
                          rows={3}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormField>
                  )}
                />
                <HookFormField
                  control={form.control}
                  name="service_notes"
                  render={({ field }) => (
                    <FormField
                      name={field.name}
                      label="Special Service Notes"
                      icon={null}
                    >
                      <FormControl>
                        <Textarea
                          placeholder="Internal notes for staff..."
                          rows={3} // Adjusted rows for better look
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormField>
                  )}
                />
              </div>
            </form>
          </Form>
          {booking.checkin && !booking.checkout && (
            <>
              {/* Added border color */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 p-0 mb-1">
                  Guest Check-out
                </h3>
                <Separator className="my-2 border-gray-200" />{" "}
                <Alert className="border-none bg-none shadow-none p-0">
                  {/* Styled Alert */}
                  <AlertDescription className="text-gray-800 text-[1rem] font-medium">
                    Checking out this guest will record the current time as
                    their official departure time. This action cannot be undone.
                  </AlertDescription>
                </Alert>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confirm-checkout"
                    checked={isCheckoutRequested}
                    onCheckedChange={(checked) =>
                      setIsCheckoutRequested(checked as boolean)
                    }
                    className="border-[#DADCE0] border-[1.5px] data-[state=checked]:bg-[#0081FB] data-[state=checked]:text-[#FFF]"
                  />
                  <label
                    htmlFor="confirm-checkout"
                    className="text-[0.9375rem] font-medium leading-none text-gray-700"
                  >
                    I confirm I want to check this guest out now.
                  </label>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={!isCheckoutRequested || isProcessing}
                  className="w-full bg-[#0081FB] text-white hover:bg-blue-600 transition-all inter font-medium"
                >
                  {checkOutMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Check Out Now
                </Button>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
          {" "}
          {/* Added border color */}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="transition-all inter font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-booking-form"
            disabled={isProcessing}
            className="bg-[#0081FB] text-white hover:bg-blue-600 transition-all inter font-medium"
          >
            {updateBookingMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
