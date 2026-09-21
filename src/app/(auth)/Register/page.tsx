"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./../../schema/RegisterSchema";
import * as zod from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userRegister } from "@/app/actions/authActions";
import { Eye, EyeOff } from "lucide-react";

type userData = zod.infer<typeof schema>;

export default function Register() {
  const router = useRouter();

  // حالة إظهار/إخفاء الباسورد لكل حقل بشكل منفصل
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      rePassword: "",
    },
    resolver: zodResolver(schema),
  });

  async function submitForm(data: userData) {
    const result = await userRegister(data);

    if (result.success) {
      toast.success(result.message);
      router.push("/Login");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center overflow-hidden">
      {/* w-full: الصفحة بتاخد العرض الكامل في الموبايل وبعدها max-w-screen-xl بس كحد أقصى */}
      <div className="w-full max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex flex-1">
        {/* القسم الأول: الفورم */}
        {/* w-full قبل lg:w-1/2 عشان في الموبايل ياخد العرض الكامل */}
        <div className="w-full lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="mt-12 flex flex-col w-full">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-center">
              Sign up
            </h1>

            <div className="w-full mt-8">
              {/* أزرار التسجيل عبر جوجل وجيت هب */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => toast("Social sign-up is coming soon")}
                  className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
                >
                  <div className="bg-white p-2 rounded-full">
                    <svg className="w-4" viewBox="0 0 533.5 544.3">
                      <path
                        d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
                        fill="#4285f4"
                      />
                      <path
                        d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
                        fill="#34a853"
                      />
                      <path
                        d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
                        fill="#fbbc04"
                      />
                      <path
                        d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
                        fill="#ea4335"
                      />
                    </svg>
                  </div>
                  <span className="ml-4">Sign Up with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => toast("Social sign-up is coming soon")}
                  className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5"
                >
                  <div className="bg-white p-1 rounded-full">
                    <svg className="w-6" viewBox="0 0 32 32">
                      <path
                        fillRule="evenodd"
                        d="M16 4C9.371 4 4 9.371 4 16c0 5.3 3.438 9.8 8.207 11.387.602.11.82-.258.82-.578 0-.286-.011-1.04-.015-2.04-3.34.723-4.043-1.609-4.043-1.609-.547-1.387-1.332-1.758-1.332-1.758-1.09-.742.082-.726.082-.726 1.203.086 1.836 1.234 1.836 1.234 1.07 1.836 2.808 1.305 3.492 1 .11-.777.422-1.305.762-1.605-2.664-.301-5.465-1.332-5.465-5.93 0-1.313.469-2.383 1.234-3.223-.121-.3-.535-1.523.117-3.175 0 0 1.008-.32 3.301 1.23A11.487 11.487 0 0116 9.805c1.02.004 2.047.136 3.004.402 2.293-1.55 3.297-1.23 3.297-1.23.656 1.652.246 2.875.12 3.175.77.84 1.231 1.91 1.231 3.223 0 4.61-2.804 5.621-5.476 5.922.43.367.812 1.101.812 2.219 0 1.605-.011 2.898-.011 3.293 0 .32.214.695.824.578C24.566 25.797 28 21.3 28 16c0-6.629-5.371-12-12-12z"
                      />
                    </svg>
                  </div>
                  <span className="ml-4">Sign Up with GitHub</span>
                </button>
              </div>

              <div className="my-12 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign up with e-mail
                </div>
              </div>

              {/* Input Register Form */}
              <form onSubmit={handleSubmit(submitForm)} className="w-full">
                <div className="flex flex-col gap-6 w-full">
                  {/* Input Name */}
                  <div>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={fieldState.invalid ? "text-red-500" : ""}
                          >
                            User Name
                          </FieldLabel>
                          <Input
                            suppressHydrationWarning
                            {...field}
                            id={field.name}
                            className={
                              "w-full " +
                              (fieldState.invalid ? "border-red-500" : "")
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="Enter User Name"
                            autoComplete="on"
                          />
                          {fieldState.invalid && (
                            <FieldError
                              errors={[fieldState.error]}
                              className={
                                fieldState.invalid ? "text-red-500" : ""
                              }
                            />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  {/* Input Email */}
                  <div>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={fieldState.invalid ? "text-red-500" : ""}
                          >
                            Email
                          </FieldLabel>
                          <Input
                            suppressHydrationWarning
                            type="email"
                            {...field}
                            id={field.name}
                            className={
                              "w-full " +
                              (fieldState.invalid ? "border-red-500" : "")
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="Enter Your Email"
                            autoComplete="on"
                          />
                          {fieldState.invalid && (
                            <FieldError
                              errors={[fieldState.error]}
                              className={
                                fieldState.invalid ? "text-red-500" : ""
                              }
                            />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  {/* Input phone */}
                  <div>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={fieldState.invalid ? "text-red-500" : ""}
                          >
                            Phone
                          </FieldLabel>
                          <Input
                            suppressHydrationWarning
                            type="tel"
                            {...field}
                            id={field.name}
                            className={
                              "w-full " +
                              (fieldState.invalid ? "border-red-500" : "")
                            }
                            aria-invalid={fieldState.invalid}
                            placeholder="Enter Your phone"
                            autoComplete="on"
                          />
                          {fieldState.invalid && (
                            <FieldError
                              errors={[fieldState.error]}
                              className={
                                fieldState.invalid ? "text-red-500" : ""
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
                          <FieldLabel
                            htmlFor={field.name}
                            className={fieldState.invalid ? "text-red-500" : ""}
                          >
                            Password
                          </FieldLabel>
                          <div className="relative w-full">
                            <Input
                              suppressHydrationWarning
                              type={showPassword ? "text" : "password"}
                              {...field}
                              id={field.name}
                              className={
                                "w-full pr-10 " +
                                (fieldState.invalid ? "border-red-500" : "")
                              }
                              aria-invalid={fieldState.invalid}
                              placeholder="Enter Your Password"
                              autoComplete="on"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {fieldState.invalid && (
                            <FieldError
                              errors={[fieldState.error]}
                              className={
                                fieldState.invalid ? "text-red-500" : ""
                              }
                            />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  {/* Input rePassword */}
                  <div>
                    <Controller
                      name="rePassword"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={fieldState.invalid ? "text-red-500" : ""}
                          >
                            Repassword
                          </FieldLabel>
                          <div className="relative w-full">
                            <Input
                              suppressHydrationWarning
                              type={showRePassword ? "text" : "password"}
                              {...field}
                              id={field.name}
                              className={
                                "w-full pr-10 " +
                                (fieldState.invalid ? "border-red-500" : "")
                              }
                              aria-invalid={fieldState.invalid}
                              placeholder="Enter Your Repassword"
                              autoComplete="on"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowRePassword((prev) => !prev)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              tabIndex={-1}
                            >
                              {showRePassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {fieldState.invalid && (
                            <FieldError
                              errors={[fieldState.error]}
                              className={
                                fieldState.invalid ? "text-red-500" : ""
                              }
                            />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <Button
                    suppressHydrationWarning
                    type="submit"
                    className="w-full h-[36px] bg-[#0aad0a] hover:bg-[#088a08] text-white py-3 text-[15px] rounded-lg font-medium transition-colors my-4"
                  >
                    Register Now
                  </Button>
                </div>
              </form>

              {/* زي تصميم صفحة Sign In بالظبط: نص رمادي + لينك "Login In" — والسطر في المنتصف */}
              <div className="flex items-center justify-center">
                <span className="text-[15px] text-gray-600">
                  Already have an account?
                </span>
                <Link
                  href="/Login"
                  className="font-medium m-1.5 text-[#0aad0a] hover:underline"
                >
                  Login In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* القسم الثاني: الصورة الجانبية (يظهر في الشاشات الكبيرة فقط) */}
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex rounded-r-lg">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                'url("https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/reading_0re1.svg")',
            }}
          />
        </div>
      </div>
    </div>
  );
}