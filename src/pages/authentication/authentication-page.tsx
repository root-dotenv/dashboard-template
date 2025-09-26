// // src/pages/authentication/authentication-page.tsx

// "use client";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { Eye, EyeOff, Loader2 } from "lucide-react";
// import { useAuthStore } from "@/store/auth.store";
// import { IoMailOutline } from "react-icons/io5";
// import { HiOutlineLockClosed } from "react-icons/hi";
// import company_logo from "/images/SafariPro_Logo.png";
// import { useMutation } from "@tanstack/react-query";
// import authClient from "@/api/auth-client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { cn } from "@/lib/utils";
// import {
//   IoAnalyticsOutline,
//   IoGridOutline,
//   IoShieldCheckmarkOutline,
//   IoSyncCircleOutline,
// } from "react-icons/io5";

// // --- Validation Schema ---
// const loginSchema = yup.object({
//   username: yup.string().required("Username (email or phone) is required."),
//   password: yup.string().required("Password is required."),
// });
// type LoginFormData = yup.InferType<typeof loginSchema>;

// // --- Reusable Auth Side Panel Component ---
// const AuthSidePanel = () => (
//   <div className="hidden md:flex flex-col bg-gradient-to-br from-[#3071EC] to-[#2258DE] p-12 text-white">
//     <div className="space-y-8">
//       <h2 className="text-3xl font-bold">
//         Your All-in-One Hospitality Command Center
//       </h2>
//       <ul className="mt-8 space-y-6">
//         <li className="flex items-start gap-4">
//           <div className="bg-blue-500 p-2 rounded-full">
//             <IoSyncCircleOutline className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <h3 className="font-semibold">Eliminate Double-Bookings</h3>
//             <p className="text-blue-200 text-sm">
//               Our real-time, event-driven architecture ensures your inventory is
//               always perfectly in sync.
//             </p>
//           </div>
//         </li>
//         <li className="flex items-start gap-4">
//           <div className="bg-blue-500 p-2 rounded-full">
//             <IoGridOutline className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <h3 className="font-semibold">Unified Control Center</h3>
//             <p className="text-blue-200 text-sm">
//               Manage all bookings, room inventory, and guest data from a single,
//               powerful dashboard.
//             </p>
//           </div>
//         </li>
//         <li className="flex items-start gap-4">
//           <div className="bg-blue-500 p-2 rounded-full">
//             <IoAnalyticsOutline className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <h3 className="font-semibold">Integrated Business Insights</h3>
//             <p className="text-blue-200 text-sm">
//               Get a holistic view of your performance across all services with
//               unified reports.
//             </p>
//           </div>
//         </li>
//         <li className="flex items-start gap-4">
//           <div className="bg-blue-500 p-2 rounded-full">
//             <IoShieldCheckmarkOutline className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <h3 className="font-semibold">Secure & Reliable Platform</h3>
//             <p className="text-blue-200 text-sm">
//               Rely on ACID-compliant transactions that guarantee booking
//               integrity and prevent data corruption.
//             </p>
//           </div>
//         </li>
//       </ul>
//       <div className="border-t border-blue-500 pt-6">
//         <blockquote className="text-blue-100">
//           <p>
//             "SafariPro transformed how our team manages projects. The planning
//             features are incredible!"
//           </p>
//           <footer className="mt-4 text-sm font-semibold">
//             - Sarah Mitchell, Product Manager
//           </footer>
//         </blockquote>
//       </div>
//     </div>
//   </div>
// );

// // --- Login Form Component ---
// function LoginForm() {
//   const navigate = useNavigate();
//   const { login } = useAuthStore();
//   const [showPassword, setShowPassword] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginFormData>({
//     resolver: yupResolver(loginSchema),
//     mode: "onBlur",
//   });

//   const loginMutation = useMutation({
//     mutationFn: async (credentials: LoginFormData) => {
//       const loginResponse = await authClient.post("/auth/login", credentials);
//       const { access_token, refresh_token } = loginResponse.data;
//       const profileResponse = await authClient.get("/auth/profile", {
//         headers: { Authorization: `Bearer ${access_token}` },
//       });
//       return {
//         tokens: { access: access_token, refresh: refresh_token },
//         user: profileResponse.data,
//       };
//     },
//     onSuccess: ({ tokens, user }) => {
//       login(tokens, user);
//       toast.success(`Welcome back, ${user.first_name}!`);
//       navigate("/");
//     },
//     onError: (error: any) => {
//       const errorMessage =
//         error.response?.data?.detail || "Invalid credentials or server error.";
//       toast.error("Login Failed", { description: errorMessage });
//     },
//   });

//   const onSubmit = (data: LoginFormData) => {
//     loginMutation.mutate(data);
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//       <div className="space-y-2">
//         <Label htmlFor="username">Username</Label>
//         <div className="relative">
//           <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//           <Input
//             id="username"
//             type="text"
//             placeholder="Enter your email or phone"
//             {...register("username")}
//             className={cn("pl-10", errors.username && "border-red-500")}
//           />
//         </div>
//         {errors.username && (
//           <p className="text-xs text-red-600">{errors.username.message}</p>
//         )}
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="password">Password</Label>
//         <div className="relative">
//           <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//           <Input
//             id="password"
//             type={showPassword ? "text" : "password"}
//             placeholder="Enter your password"
//             {...register("password")}
//             className={cn("pl-10 pr-10", errors.password && "border-red-500")}
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
//           >
//             {showPassword ? (
//               <EyeOff className="h-5 w-5" />
//             ) : (
//               <Eye className="h-5 w-5" />
//             )}
//           </button>
//         </div>
//         {errors.password && (
//           <p className="text-xs text-red-600">{errors.password.message}</p>
//         )}
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <Checkbox id="remember-me" />
//           <Label htmlFor="remember-me" className="text-sm font-medium">
//             Remember me
//           </Label>
//         </div>
//         <a
//           href="#"
//           className="text-sm font-medium text-blue-600 hover:underline"
//         >
//           Forgot password?
//         </a>
//       </div>

//       <Button
//         type="submit"
//         className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white"
//         disabled={loginMutation.isPending}
//       >
//         {loginMutation.isPending && (
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//         )}
//         {loginMutation.isPending ? "Signing In..." : "Sign In"}
//       </Button>
//     </form>
//   );
// }

// // --- Main Authentication Page ---
// export default function AuthenticationPage() {
//   return (
//     <div className="min-h-screen w-full flex flex-col bg-[#F1F7FD] dark:bg-gray-900 p-4">
//       <div className="flex-1 flex flex-col items-center justify-center">
//         <div className="text-center mb-8 pt-4 flex flex-col items-center">
//           <img
//             className="w-[150px] h-auto"
//             src={company_logo}
//             alt="SafariPro Logo"
//           />
//           <p className="text-gray-600 dark:text-gray-400 mt-2">
//             The unified command center for modern hospitality.
//           </p>
//         </div>

//         <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
//           <div className="p-8 md:p-12">
//             <div className="mb-8">
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                 Welcome Back!
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-2">
//                 Sign in to your account to continue.
//               </p>
//             </div>
//             <LoginForm />
//           </div>

//           <AuthSidePanel />
//         </div>
//       </div>

//       <div className="flex flex-col gap-y-2 w-full items-center py-8">
//         <p className="text-[#485569] dark:text-gray-400 text-center text-sm">
//           By continuing, you agree to our{" "}
//           <a href="#" className="text-[#2463EB] hover:underline">
//             Terms of Service
//           </a>{" "}
//           and{" "}
//           <a href="#" className="text-[#2463EB] hover:underline">
//             Privacy Policy
//           </a>
//         </p>
//         <p className="text-center text-sm text-gray-500">
//           &copy; {new Date().getFullYear()} SafariPro. All rights Reserved
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { IoMailOutline } from "react-icons/io5";
import { HiOutlineLockClosed } from "react-icons/hi";
import company_logo from "../../../public/images/SafariPro_Logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const loginSchema = yup.object({
  username: yup.string().required("Email or phone number is required."),
  password: yup.string().required("Password is required."),
});
type LoginFormData = yup.InferType<typeof loginSchema>;

export default function AuthenticationPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
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
    try {
      await login(data);
      toast.success("Login successful! Welcome back.");
      navigate("/");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Invalid credentials. Please try again.";
      toast.error("Login Failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F1F7FD] dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <img
            className="w-[150px] h-auto mb-4"
            src={company_logo}
            alt="company_logo"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Please enter your details.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your email or phone"
                  {...register("username")}
                  className={cn("pl-10", errors.username && "border-red-500")}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className={cn(
                    "pl-10 pr-10",
                    errors.password && "border-red-500"
                  )}
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
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none"
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
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
