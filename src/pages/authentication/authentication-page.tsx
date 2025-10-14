"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  IoAnalyticsOutline,
  IoGridOutline,
  IoShieldCheckmarkOutline,
  IoSyncCircleOutline,
} from "react-icons/io5";
import company_logo from "../../../public/images/safaripro-logo-blue.png";
import "@/index.css";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Zod Schema for the Login Form ---
const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormData = z.infer<typeof loginSchema>;

// --- Reusable Form Field Component ---
const AuthFormField: React.FC<{
  name: string;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ name, label, icon, children }) => (
  <div className="space-y-2">
    <Label
      htmlFor={name}
      className="flex items-center gap-2 text-[0.9375rem] font-medium inter"
      style={{ color: "#314158" }}
    >
      {icon}
      <span>
        {label} <span className="text-red-500">*</span>
      </span>
    </Label>
    {children}
  </div>
);

// --- Login Form Component ---
function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched", // Validate fields on blur
  });

  // Effect to redirect the user if they are already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (err) {
      // Error is already handled and toasted in the auth store
      console.error("Login failed from component:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AuthFormField
        name="identifier"
        label="Email or Phone Number"
        icon={<Mail size={16} />}
      >
        <Input
          id="identifier"
          type="text"
          placeholder="yourname@example.com"
          {...register("identifier")}
          aria-invalid={!!errors.identifier}
          className="inter"
        />
        {errors.identifier?.message && (
          <p className="text-[0.875rem] text-red-600 mt-1 inter">
            {errors.identifier.message}
          </p>
        )}
      </AuthFormField>

      <AuthFormField name="password" label="Password" icon={<Lock size={16} />}>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            aria-invalid={!!errors.password}
            className="inter"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#697282]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password?.message && (
          <p className="text-[0.875rem] text-red-600 mt-1 inter">
            {errors.password.message}
          </p>
        )}
      </AuthFormField>

      {/* Intentionally removed "Forgot Password?" link as per login-only requirement */}

      <Button
        type="submit"
        className="w-full bg-[#2463EB] hover:bg-[#1e56d4] shadow-xs inter font-medium"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>

      {/* Intentionally removed "Sign Up" link as per login-only requirement */}
    </form>
  );
}

// --- Main AuthenticationPage Component ---
export default function AuthenticationPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FFFFFF]">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-8">
          <img
            className="w-[160px] h-auto mx-auto mb-4"
            src={company_logo}
            alt="SafariPro Logo"
          />
          <p className="text-[#4A5565] leading-[1.5rem] font-normal inter">
            The All-in-One Platform for Modern Hospitality
          </p>
        </div>
        <div className="w-full max-w-4xl bg-white shadow-xs rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 px-6 py-8 sm:px-8 md:p-12">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 inter">
                Welcome Back
              </h1>
              <p className="text-gray-600 mt-2 inter">
                Log in to your account to continue
              </p>
            </div>
            <p className="text-[0.9375rem] font-medium text-gray-500 !mb-6 inter">
              <span className="text-red-500">*</span> Required field
            </p>
            <LoginForm />
          </div>
          <div className="hidden md:flex flex-1 flex-col bg-gradient-to-br from-[#3071EC] to-[#2258DE] p-10 text-white relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-300/15 rounded-full blur-3xl"></div>

            <div className="flex flex-col justify-center space-y-8 my-auto relative z-10">
              <h2 className="text-3xl font-bold inter">
                Hospitality Management Platform
              </h2>
              <ul className="space-y-6">
                {[
                  {
                    icon: <IoSyncCircleOutline className="h-5 w-5" />,
                    title: "Real-Time Synchronization",
                    desc: "Event-driven architecture for perfect inventory synchronization.",
                  },
                  {
                    icon: <IoGridOutline className="h-5 w-5" />,
                    title: "Unified Dashboard",
                    desc: "Manage bookings, inventory, and guests from one control center.",
                  },
                  {
                    icon: <IoAnalyticsOutline className="h-5 w-5" />,
                    title: "Business Intelligence",
                    desc: "Comprehensive analytics for data-driven decisions.",
                  },
                  {
                    icon: <IoShieldCheckmarkOutline className="h-5 w-5" />,
                    title: "Enterprise Security",
                    desc: "ACID-compliant transactions guarantee data integrity.",
                  },
                ].map((feature) => (
                  <li key={feature.title} className="flex items-start gap-4">
                    <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold inter">{feature.title}</h3>
                      <p className="text-blue-100 text-sm inter mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <footer className="w-full px-4 py-6 mt-8 flex flex-col items-center justify-center gap-y-2">
        <p className="text-center text-[0.875rem] text-[#4A5565] inter">
          By continuing, you agree to our{" "}
          <a
            className="text-blue-600 hover:underline inter font-medium"
            href="https://web.safaripro.net/terms"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            className="text-blue-600 hover:underline inter font-medium"
            href="https://web.safaripro.net/privacy-policy"
          >
            Privacy Policy
          </a>
        </p>
        <p className="text-center text-[0.875rem] text-[#4A5565] inter">
          &copy; 2025 SafariPro. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
