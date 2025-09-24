"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  IoAnalyticsOutline,
  IoGridOutline,
  IoMailOutline,
  IoShieldCheckmarkOutline,
  IoSyncCircleOutline,
} from "react-icons/io5";
import { HiOutlineLockClosed } from "react-icons/hi";
import { FaUser } from "react-icons/fa";
import company_logo from "../../../public/images/SafariPro_Logo.png";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// --- Validation Schemas ---
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  password: yup.string().required("Password is required."),
});
type LoginFormData = yup.InferType<typeof loginSchema>;

const signupSchema = yup.object({
  fullName: yup.string().required("Full name is required."),
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters.")
    .required("Password is required."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match.")
    .required("Please confirm your password."),
});
type SignupFormData = yup.InferType<typeof signupSchema>;

// --- Type definition for props ---
type AuthFormProps = {
  setActiveTab: (tab: "login" | "signup") => void;
};

// --- Reusable Form Components ---

function LoginForm({ setActiveTab }: AuthFormProps) {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    login();
    toast.success("Login successful! Welcome back.");
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className={cn("pl-10", errors.email && "border-red-500")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <div className="relative">
          <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            className={cn("pl-10 pr-10", errors.password && "border-red-500")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember-me" />
          <Label
            htmlFor="remember-me"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me
          </Label>
        </div>
        <a
          href="#"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Signing In..." : "Sign In"}
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => setActiveTab("signup")}
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}

function SignupForm({ setActiveTab }: AuthFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: SignupFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Account created successfully! Please verify your email.");
    navigate("/otp-verify");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="fullName"
            placeholder="John Doe"
            {...register("fullName")}
            className={cn("pl-10", errors.fullName && "border-red-500")}
          />
        </div>
        {errors.fullName && (
          <p className="text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-signup">Email address</Label>
        <div className="relative">
          <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="email-signup"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className={cn("pl-10", errors.email && "border-red-500")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-signup">Password</Label>
        <div className="relative">
          <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="password-signup"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            {...register("password")}
            className={cn("pl-10 pr-10", errors.password && "border-red-500")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            {...register("confirmPassword")}
            className={cn(
              "pl-10 pr-10",
              errors.confirmPassword && "border-red-500"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

// --- Main Authentication Page ---
export default function AuthenticationPage({
  defaultTab = "login",
}: {
  defaultTab?: "login" | "signup";
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="min-h-screen noScroll w-full flex flex-col bg-[#F1F7FD] dark:bg-gray-900 p-4">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-8 pt-4 flex flex-col items-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            <img
              className="w-[150px] h-auto"
              src={company_logo}
              alt="company_logo"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            SafariPro provides a seamless, unified experience that legacy
            systems can't match.
          </p>
        </div>

        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 text-center border-b border-gray-200 dark:border-gray-700">
            {/* --- UPDATE: Active tab styling is now responsive --- */}
            <button
              onClick={() => setActiveTab("login")}
              className={cn(
                "p-4 font-semibold transition-colors duration-300",
                activeTab === "login"
                  ? "bg-blue-600 text-white md:bg-white md:dark:bg-gray-800 md:text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              Sign In
            </button>
            {/* --- UPDATE: Active tab styling is now responsive --- */}
            <button
              onClick={() => setActiveTab("signup")}
              className={cn(
                "p-4 font-semibold transition-colors duration-300",
                activeTab === "signup"
                  ? "bg-blue-600 text-white md:bg-white md:dark:bg-gray-800 md:text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              Create Account
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeTab === "login"
                    ? "Welcome back!"
                    : "Get started today"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {activeTab === "login"
                    ? "Log in to your account to continue."
                    : "Create an account to manage your hotel."}
                </p>
              </div>
              {activeTab === "login" ? (
                <LoginForm setActiveTab={setActiveTab} />
              ) : (
                <SignupForm setActiveTab={setActiveTab} />
              )}
            </div>

            <div className="flex flex-col bg-gradient-to-br from-[#3071EC] to-[#2258DE] p-12 text-white">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold">
                  Your All-in-One Hospitality Command Center
                </h2>
                <ul className="mt-8 space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="bg-blue-500 p-2 rounded-full">
                      <IoSyncCircleOutline className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Eliminate Double-Bookings
                      </h3>
                      <p className="text-blue-200 text-sm">
                        Our real-time, event-driven architecture ensures your
                        inventory is always perfectly in sync.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-blue-500 p-2 rounded-full">
                      <IoGridOutline className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Unified Control Center</h3>
                      <p className="text-blue-200 text-sm">
                        Manage all bookings, room inventory, and guest data from
                        a single, powerful dashboard.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-blue-500 p-2 rounded-full">
                      <IoAnalyticsOutline className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Integrated Business Insights
                      </h3>
                      <p className="text-blue-200 text-sm">
                        Get a holistic view of your performance across all
                        services with unified reports.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-blue-500 p-2 rounded-full">
                      <IoShieldCheckmarkOutline className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Secure & Reliable Platform
                      </h3>
                      <p className="text-blue-200 text-sm">
                        Rely on ACID-compliant transactions that guarantee
                        booking integrity and prevent data corruption.
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="border-t border-blue-500 pt-6">
                  <blockquote className="text-blue-100">
                    <p>
                      "SafariPro transformed how our team manages projects. The
                      planning features are incredible!"
                    </p>
                    <footer className="mt-4 text-sm font-semibold">
                      - Sarah Mitchell, Product Manager
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-2 w-full items-center py-8">
        <p className="text-[#485569] text-center text-[0.9375rem]">
          By continuing, you agree to our{" "}
          <a
            href="https://web.safaripro.net/privacy-policy/terms"
            className="text-[#2463EB]"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://web.safaripro.net/privacy-policy"
            className="text-[#2463EB]"
          >
            Privacy Policy
          </a>
        </p>
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SafariPro. All rights Reserved
        </p>
      </div>
    </div>
  );
}
