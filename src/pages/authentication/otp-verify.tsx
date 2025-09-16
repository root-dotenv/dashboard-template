// - - - src/pages/authentications/otp-verify.tsx
"use client";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// --- Validation Schema ---
const otpSchema = yup.object({
  pin: yup
    .string()
    .min(6, "Please enter all 6 digits.")
    .required("OTP is required."),
});

type OtpFormData = yup.InferType<typeof otpSchema>;

// --- Component ---
export default function OtpVerify() {
  const navigate = useNavigate();
  // In a real app, you'd get the email from route state or a store
  const userEmail = "test****@mail.com";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: { pin: "" },
  });

  // --- Mock Submission Handler ---
  const onSubmit = async (data: OtpFormData) => {
    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("OTP Submitted:", data);
    toast.success("Verification successful!");
    navigate("/login"); // Redirect to login after verification
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#101828] p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to {userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <Controller
                control={control}
                name="pin"
                render={({ field }) => (
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              {errors.pin && (
                <p className="text-xs text-red-600">{errors.pin.message}</p>
              )}
            </div>

            <Button
              variant={"main"}
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Didn't receive the email?{" "}
            <Link
              to="#"
              className="font-semibold text-blue-600 hover:underline"
            >
              Resend code
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
