// - - - src/pages/bookings/cash-payment/guest-details.tsx
import React, { useState, useEffect } from "react";
import {
  User,
  Check,
  Eye,
  Receipt,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Bed,
  Calendar,
  Loader2,
  Plus,
  Minus,
  Dog,
  MapPin,
} from "lucide-react";
import type { BookingConfirmation, GuestDetails, Room } from "./types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// --- LOCATION API TYPES ---
interface Region {
  regionCode: number;
  regionName: string;
}
interface LocationResponse<T> {
  data: T[];
}

// --- REUSABLE NUMBER INPUT CONTROL ---
interface NumberInputControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  id: string;
}

const NumberInputControl: React.FC<NumberInputControlProps> = ({
  value,
  onChange,
  min = 0,
  max = 10,
  id,
}) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 focus:border-[#0081FB] focus:ring-[#0081FB]"
        onClick={handleDecrement}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        id={id}
        type="text"
        readOnly
        value={value}
        className="w-12 text-center font-bold border-gray-300 focus:border-[#0081FB] focus:ring-[#0081FB]"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 focus:border-[#0081FB] focus:ring-[#0081FB]"
        onClick={handleIncrement}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

// --- GUEST DETAILS FORM PROPS ---
interface GuestDetailsFormProps {
  step: "details" | "billing";
  selectedRoom: Room;
  startDate: string;
  endDate: string;
  guestDetails: Omit<GuestDetails, "payment_method">;
  setGuestDetails: React.Dispatch<
    React.SetStateAction<Omit<GuestDetails, "payment_method">>
  >;
  onBack: () => void;
  onSubmitBooking: () => void;
  onProceedToPayment: () => void;
  bookingLoading: boolean;
  bookingConfirmation: BookingConfirmation | null;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export const GuestDetailsForm: React.FC<GuestDetailsFormProps> = ({
  step,
  selectedRoom,
  startDate,
  endDate,
  guestDetails,
  setGuestDetails,
  onBack,
  onSubmitBooking,
  onProceedToPayment,
  bookingLoading,
  bookingConfirmation,
  error,
  setError,
}) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [isTravelingWithPets, setIsTravelingWithPets] = useState(false);
  const [userTypedServiceNotes, setUserTypedServiceNotes] = useState(
    guestDetails.service_notes || ""
  );

  // --- State for location fields ---
  const [countrySelection, setCountrySelection] = useState("Tanzania");
  const [manualCountry, setManualCountry] = useState("");
  const [city, setCity] = useState("");

  const { data: regionsData, isLoading: regionsLoading } = useQuery({
    queryKey: ["tanzaniaRegions"],
    queryFn: async (): Promise<LocationResponse<Region>> => {
      const response = await axios.get(
        "https://api.locations.co.tz/v1/regions?limit=100"
      );
      return response.data;
    },
    enabled: countrySelection === "Tanzania",
  });

  const handleGuestDetailsChange = (
    field: keyof Omit<GuestDetails, "payment_method">,
    value: string | number
  ) => {
    setGuestDetails((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const petsMessage = "NOTE: Guest is Traveling with a pet";
    let baseNotes = userTypedServiceNotes;
    baseNotes = baseNotes.replace(new RegExp(`,? ${petsMessage}`), "").trim();
    let finalServiceNotes = baseNotes;
    if (isTravelingWithPets) {
      finalServiceNotes = baseNotes
        ? `${baseNotes}, ${petsMessage}`
        : petsMessage;
    }
    if (finalServiceNotes !== guestDetails.service_notes) {
      handleGuestDetailsChange("service_notes", finalServiceNotes);
    }
  }, [isTravelingWithPets, userTypedServiceNotes]);

  useEffect(() => {
    const finalCountry =
      countrySelection === "Other" ? manualCountry : countrySelection;
    if (city && finalCountry) {
      const fullAddress = `${city}, ${finalCountry}`;
      if (fullAddress !== guestDetails.address) {
        handleGuestDetailsChange("address", fullAddress);
      }
    }
  }, [city, countrySelection, manualCountry]);

  const handleReviewClick = () => {
    if (
      !guestDetails.full_name ||
      !guestDetails.phone_number ||
      !guestDetails.email
    ) {
      setError(
        "Please fill in all required fields (Full Name, Phone Number, and Email)."
      );
      return;
    }
    setError("");
    setIsReviewing(true);
  };

  // --- BILLING VIEW ---
  if (step === "billing" && bookingConfirmation) {
    const currencyInfo = bookingConfirmation.status_history.find(
      (h) => h.action === "currency_conversion"
    )?.details;
    return (
      <Card className="border-gray-200 w-[640px] shadow rounded-md">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-green-800 flex items-center">
            <Receipt className="mr-3 h-6 w-6" />
            Booking Created - Please Confirm
          </CardTitle>
          <CardDescription className="text-green-700 text-[0.9375rem]">
            Your booking with code{" "}
            <strong className="font-mono">{bookingConfirmation.code}</strong>{" "}
            has been created. Please confirm the amount below.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-white border border-gray-200 p-4 rounded-lg mb-6 space-y-3">
            <div className="flex items-center text-gray-600">
              <User className="mr-2 h-4 w-4" />
              <strong>Guest:</strong>{" "}
              <span className="ml-1">{bookingConfirmation.full_name}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Bed className="mr-2 h-4 w-4" />
              <strong>Room:</strong>{" "}
              <span className="ml-1">
                {bookingConfirmation.property_item_type}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="mr-2 h-4 w-4" />
              <strong>Dates:</strong>{" "}
              <span className="ml-1">
                {bookingConfirmation.start_date} to{" "}
                {bookingConfirmation.end_date}
              </span>
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-gray-800 text-sm">
              Total Amount to Pay (Cash on Arrival)
            </p>
            <p className="text-blue-600 font-bold text-3xl mt-1">
              {currencyInfo?.converted_required.toLocaleString("en-US", {
                style: "currency",
                currency: "TZS",
                minimumFractionDigits: 2,
              })}
            </p>
            {currencyInfo && (
              <p className="text-xs text-gray-600 mt-1">
                Based on a total of ${currencyInfo.original_required.toFixed(2)}{" "}
                USD
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onProceedToPayment}
              className="bg-blue-600 hover:bg-blue-700 rounded cursor-pointer text-white"
            >
              Confirm Booking
              <Check className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- REVIEW VIEW ---
  if (isReviewing) {
    return (
      <Card className="border-gray-200 w-[640px] shadow rounded-md">
        <CardHeader className="bg-none border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <Eye className="mr-3 h-6 w-6 text-blue-600" />
            Review Your Booking
          </CardTitle>
          <CardDescription className="text-gray-600 text-[1rem]">
            Please check all guest's details to make sure they're correct before
            confirming.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">
                Booking Details
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Room Type:</span>{" "}
                {selectedRoom.room_type_name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Check-in:</span> {startDate}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Check-out:</span> {endDate}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">
                Guest Information
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Full Name:</span>{" "}
                {guestDetails.full_name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {guestDetails.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span>{" "}
                {guestDetails.phone_number}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Address:</span>{" "}
                {guestDetails.address}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Guests:</span>{" "}
                {guestDetails.number_of_guests} Adults,{" "}
                {guestDetails.number_of_children} Children,{" "}
                {guestDetails.number_of_infants} Infants
              </p>
            </div>
          </div>
          {(guestDetails.service_notes || guestDetails.special_requests) && (
            <div className="mt-6 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
              {guestDetails.service_notes && (
                <div>
                  <h4 className="font-medium text-gray-800 flex items-center mb-2">
                    <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
                    Service Notes
                  </h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                    {guestDetails.service_notes}
                  </p>
                </div>
              )}
              {guestDetails.special_requests && (
                <div>
                  <h4 className="font-medium text-gray-800 flex items-center mb-2">
                    <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
                    Special Requests
                  </h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                    {guestDetails.special_requests}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <Button onClick={() => setIsReviewing(false)} variant="outline">
              Edit Details
            </Button>
            <Button
              onClick={onSubmitBooking}
              disabled={bookingLoading}
              className="bg-green-600 rounded cursor-pointer  hover:bg-green-700 text-white"
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Creating Booking...
                </>
              ) : (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Confirm Details & Book
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- GUEST DETAILS INPUT FORM ---
  return (
    <div className="w-[640px] space-y-4">
      <Card className="border-none bg-none shadow-none px-0 mx-0">
        <CardHeader className="px-0 mx-0">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <User className="mr-3 h-6 w-6 text-blue-600" />
            Guest Details
          </CardTitle>
          <CardDescription className="text-[1rem]">
            Selected Room Type:{" "}
            <strong className="text-gray-800">
              {selectedRoom.room_type_name}
            </strong>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-gray-200 shadow rounded-md">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={guestDetails.full_name}
                  onChange={(e) =>
                    handleGuestDetailsChange("full_name", e.target.value)
                  }
                  required
                  className="mt-2 focus:border-[#0081FB] focus:ring-[#0081FB]"
                  placeholder="e.g. Florence Mushi"
                />
              </div>
              <div>
                <Label
                  htmlFor="phoneNumber"
                  className="font-medium text-gray-700"
                >
                  Phone Number *
                </Label>
                <PhoneInput
                  id="phoneNumber"
                  international
                  defaultCountry="TZ"
                  value={guestDetails.phone_number}
                  onChange={(value) =>
                    handleGuestDetailsChange("phone_number", value || "")
                  }
                  className="mt-2 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email" className="font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={guestDetails.email}
                  onChange={(e) =>
                    handleGuestDetailsChange("email", e.target.value)
                  }
                  required
                  className="mt-2 focus:border-[#0081FB] focus:ring-[#0081FB]"
                  placeholder="e.g. florence@mail.com"
                />
              </div>
              <div className="md:col-span-2 pt-6 border-t">
                <h3 className="font-medium text-gray-800 flex items-center mb-4">
                  <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                  Guest Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="country"
                      className="font-medium text-gray-700"
                    >
                      Country Selection
                    </Label>
                    <Select
                      value={countrySelection}
                      onValueChange={(value) => {
                        setCountrySelection(value);
                        setManualCountry("");
                        setCity("");
                      }}
                    >
                      <SelectTrigger className="mt-2 focus:border-[#0081FB] focus:ring-[#0081FB]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tanzania">Tanzania</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {countrySelection === "Other" && (
                    <div>
                      <Label
                        htmlFor="manualCountry"
                        className="font-medium text-gray-700"
                      >
                        Country Name
                      </Label>
                      <Input
                        id="manualCountry"
                        value={manualCountry}
                        onChange={(e) => setManualCountry(e.target.value)}
                        placeholder="e.g. United States"
                        className="mt-2 focus:border-[#0081FB] focus:ring-[#0081FB]"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="city" className="font-medium text-gray-700">
                      {countrySelection === "Tanzania"
                        ? "City / Region"
                        : "City"}
                    </Label>
                    {countrySelection === "Tanzania" ? (
                      <Select
                        value={city}
                        onValueChange={setCity}
                        disabled={regionsLoading}
                      >
                        <SelectTrigger className="mt-2 focus:border-[#0081FB] focus:ring-[#0081FB]">
                          <SelectValue
                            placeholder={
                              regionsLoading
                                ? "Loading regions..."
                                : "Select a region"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {regionsData?.data.map((region) => (
                            <SelectItem
                              key={region.regionCode}
                              value={region.regionName}
                            >
                              {region.regionName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. New York"
                        className="mt-2 focus:border-[#0081FB] focus:ring-[#0081FB]"
                        disabled={
                          countrySelection === "Other" && !manualCountry
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="numGuests"
                  className="font-medium text-gray-700"
                >
                  Adults
                </Label>
                <NumberInputControl
                  id="numGuests"
                  value={guestDetails.number_of_guests}
                  onChange={(v) =>
                    handleGuestDetailsChange("number_of_guests", v)
                  }
                  min={1}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="numChildren"
                  className="font-medium text-gray-700"
                >
                  Children
                </Label>
                <NumberInputControl
                  id="numChildren"
                  value={guestDetails.number_of_children}
                  onChange={(v) =>
                    handleGuestDetailsChange("number_of_children", v)
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="numInfants"
                  className="font-medium text-gray-700"
                >
                  Infants
                </Label>
                <NumberInputControl
                  id="numInfants"
                  value={guestDetails.number_of_infants}
                  onChange={(v) =>
                    handleGuestDetailsChange("number_of_infants", v)
                  }
                />
              </div>
            </div>
            <div className="space-y-4 pt-6 border-t">
              <div>
                <Label
                  htmlFor="serviceNotes"
                  className="font-medium text-gray-700"
                >
                  Service Notes (Leave blank if none)
                </Label>
                <Textarea
                  id="serviceNotes"
                  rows={3}
                  value={userTypedServiceNotes}
                  onChange={(e) => setUserTypedServiceNotes(e.target.value)}
                  className="mt-2 focus:border-[#0081FB] focus:ring-[#0081FB]"
                  placeholder="e.g. Please prepare the room with extra pillows."
                />
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <Dog className="h-6 w-6 text-gray-600" />
                <div className="flex-1">
                  <Label
                    htmlFor="pets-switch"
                    className="font-medium text-gray-800"
                  >
                    Traveling with Pets?
                  </Label>
                  <p className="text-xs text-gray-500">
                    This will add a note to your service details.
                  </p>
                </div>
                <Switch
                  id="pets-switch"
                  checked={isTravelingWithPets}
                  onCheckedChange={setIsTravelingWithPets}
                />
              </div>
              <div>
                <Label
                  htmlFor="specialRequests"
                  className="font-medium text-gray-700"
                >
                  Special Requests (Leave blank if none)
                </Label>
                <Textarea
                  id="specialRequests"
                  rows={3}
                  value={guestDetails.special_requests}
                  onChange={(e) =>
                    handleGuestDetailsChange("special_requests", e.target.value)
                  }
                  className="mt-2 focus:border-[#0081FB] focus:ring-[#0081FB]"
                  placeholder="e.g. Airport pickup, late check-in, etc."
                />
              </div>
            </div>
          </div>
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          )}
          <div className="mt-8 flex justify-between items-center">
            <Button
              onClick={onBack}
              variant="outline"
              className="focus:border-[#0081FB] focus:ring-[#0081FB]"
            >
              Back to Rooms
            </Button>
            <Button
              onClick={handleReviewClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Eye className="mr-2 h-4 w-4" />
              Review Booking
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
