"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { schemaLogin } from "@/app/schema/LoginSchema";
import { userLogin } from "@/app/actions/loginAction";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { signIn } from "next-auth/react";

type userData = zod.infer<typeof schemaLogin>;

export default function Login() {
  const router = useRouter();

  // إظهار/إخفاء الباسورد
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schemaLogin),
  });

  async function submitForm(data: userData) {
    console.log(data);

    // تم تطبيق اللوجيك الموجود في الصورة الخاصة بـ NextAuth
    const isLogin = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (isLogin?.ok) {
      // success , navigate
      toast.success("success Login");
      router.push("/");
    } else {
      toast.error(
        "Incorrect email or password. Please check your credentials and try again",
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      {/* تم تكبير العرض هنا إلى max-w-[1200px] */}
      <div className="max-w-[1200px] w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Image and Branding */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-center p-12 bg-white">
          <img
            src="https://eltaranisishopping.codescandy.com/assets/images/svg-graphics/signin-g.svg"
            alt="Shopping Cart"
            className="w-full max-w-md object-contain mb-10"
          />
          <h2 className="text-[26px] font-bold text-[#1e293b] text-center mb-4">
            Eltaranisi Shopping - Your One-Stop Shop for Fresh Products
          </h2>
          <p className="text-gray-500 text-center text-[15px] mb-8 max-w-md">
            Join thousands of happy customers who trust Eltaranisi Shopping for
            their daily grocery needs
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-[13px] font-medium text-gray-600">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[#0aad0a]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                  fillRule="evenodd"
                ></path>
              </svg>
              Free Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[#0aad0a]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                  fillRule="evenodd"
                ></path>
              </svg>
              Secure Payment
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[#0aad0a]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                  fillRule="evenodd"
                ></path>
              </svg>
              24/7 Support
            </span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 sm:p-14 bg-white flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-[28px] font-bold mb-6 tracking-tight">
                <span className="text-[#0aad0a]">Fresh</span>
                <span className="text-[#1e293b]">Cart</span>
              </div>
              <h1 className="text-3xl font-bold text-[#1e293b] mb-3">
                Welcome Back!
              </h1>
              <p className="text-gray-500 text-[15px]">
                Sign in to continue your fresh shopping experience
              </p>
            </div>

            {/* Social Buttons */}
            <div className="space-y-4 mb-8">
              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 bg-white rounded-lg text-[15px] font-medium text-[#1e293b] hover:bg-gray-50 transition-colors shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 bg-white rounded-lg text-[15px] font-medium text-[#1e293b] hover:bg-gray-50 transition-colors shadow-sm">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-8">
              <span className="absolute inset-x-0 h-px bg-gray-200"></span>
              <span className="relative bg-white px-4 text-[12px] font-semibold text-gray-400 tracking-wider uppercase">
                Or continue with email
              </span>
            </div>

            {/* Input Login */}
            <form onSubmit={handleSubmit(submitForm)} className="space-y-5">
              {/* Input Email */}
              <div>
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor={field.name}
                        className={`text-[15px] font-semibold mb-2 block ${fieldState.invalid ? "text-red-500" : "text-[#1e293b]"}`}
                      >
                        Email Address
                      </FieldLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          {...field}
                          id={field.name}
                          className={`w-full pl-11 py-3 text-[15px] border rounded-lg focus:ring-1 focus:ring-[#0aad0a] focus:border-[#0aad0a] ${fieldState.invalid ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter your email"
                          autoComplete="on"
                        />
                      </div>
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className={
                            fieldState.invalid
                              ? "text-red-500 mt-1.5 text-sm"
                              : "mt-1.5 text-sm"
                          }
                        />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* Input Password */}
              <div>
                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between mb-2">
                        <FieldLabel
                          htmlFor={field.name}
                          className={`text-[15px] font-semibold ${fieldState.invalid ? "text-red-500" : "text-[#1e293b]"}`}
                        >
                          Password
                        </FieldLabel>
                        <a
                          href="#"
                          className="text-[14px] font-medium text-[#0aad0a] hover:underline"
                        >
                          Forgot Password?
                        </a>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          id={field.name}
                          className={`w-full pl-11 pr-11 py-3 text-[15px] border rounded-lg focus:ring-1 focus:ring-[#0aad0a] focus:border-[#0aad0a] ${
                            fieldState.invalid
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300"
                          }`}
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter your password"
                          autoComplete="on"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className={
                            fieldState.invalid
                              ? "text-red-500 mt-1.5 text-sm"
                              : "mt-1.5 text-sm"
                          }
                        />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="flex items-center mt-2 mb-6">
                <input
                  id="keep-signed-in"
                  type="checkbox"
                  className="h-4 w-4 text-[#0aad0a] focus:ring-[#0aad0a] border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="keep-signed-in"
                  className="ml-2 block text-[15px] text-[#1e293b] cursor-pointer"
                >
                  Keep me signed in
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full h-[36px] bg-[#0aad0a] hover:bg-[#088a08] text-white py-3 text-[15px] rounded-lg font-medium transition-colors"
                >
                  Sign In
                </Button>
              </div>
            </form>

            <p className="text-center text-[15px] text-gray-600 mt-8">
              New to Eltaranisi Shopping?
              <a
                href="/Register"
                className="font-medium m-1.5 text-[#0aad0a] hover:underline"
              >
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
