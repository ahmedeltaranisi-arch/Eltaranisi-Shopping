"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import { User, LockKeyhole, Save, Eye, EyeOff } from "lucide-react";
import {
  verifyToken,
  updateMyData,
  changeMyPassword,
  getStoredUser,
  setStoredUser,
  setStoredToken,
} from "@/app/_apis/profile.api";

const phoneRegex = /^01[0125][0-9]{8}$/;

// ===== Schemas =====
const profileSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(phoneRegex, "Enter a valid Egyptian phone number (e.g. 01028968775)")
    .or(z.literal("")),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rePassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

interface StoredUser {
  name?: string;
  email?: string;
  phone?: string;
  _id?: string;
  id?: string;
}

const inputClass = (hasError?: boolean) =>
  `w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[#14171A] outline-none transition-colors placeholder:text-[#B0B7C3] focus:border-[#00B250] focus:ring-4 focus:ring-[#00B250]/10 ${
    hasError ? "border-red-500" : "border-[#E7E5E1]"
  }`;

function SectionHead({
  icon,
  title,
  subtitle,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "green" | "orange";
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
          tone === "green"
            ? "bg-[#E8F8EE] text-[#00B250]"
            : "bg-[#FDEEC8] text-[#E8891C]"
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] font-extrabold text-[#14171A]">{title}</h3>
        <p className="text-xs text-[#8A857B] mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  registration,
  error,
  reveal,
  onToggle,
  helper,
}: {
  id: string;
  label: string;
  placeholder: string;
  autoComplete?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  reveal: boolean;
  onToggle: () => void;
  helper?: string;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold text-[#4B5563] mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={reveal ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...registration}
          className={`${inputClass(!!error)} pe-11`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={reveal ? "Hide password" : "Show password"}
          tabIndex={-1}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-[#8A857B] hover:text-[#14171A] cursor-pointer"
        >
          {reveal ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {error ? (
        <p className="text-xs font-semibold text-red-500 mt-1.5">{error}</p>
      ) : helper ? (
        <p className="text-[11px] text-[#8A857B] mt-1.5">{helper}</p>
      ) : null}
    </div>
  );
}

export default function SettingsPage() {
  const [account, setAccount] = useState<{ id: string; role: string }>({
    id: "",
    role: "User",
  });
  const [reveal, setReveal] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    getValues: getProfileValues,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", password: "", rePassword: "" },
  });

  // التعبئة الأولية: بيانات الـ user المخزنة + verifyToken للـ ID والـ Role
  useEffect(() => {
    let alive = true;
    (async () => {
      const stored = getStoredUser<StoredUser>();
      if (stored && alive) {
        resetProfile({
          name: stored.name ?? "",
          email: stored.email ?? "",
          phone: stored.phone ?? "",
        });
        const storedId = stored._id ?? stored.id;
        if (storedId) {
          setAccount((prev) => ({ ...prev, id: storedId }));
        }
      }
      try {
        const res = await verifyToken();
        if (!alive) return;
        const d = res?.decoded ?? {};
        const rawRole = String(d.role ?? "user");
        setAccount({
          id: d.id ?? d._id ?? "",
          role: rawRole.charAt(0).toUpperCase() + rawRole.slice(1),
        });
        const current = getProfileValues();
        resetProfile({
          name: current.name || d.name || "",
          email: current.email || d.email || "",
          phone: current.phone || d.phone || "",
        });
      } catch {
        /* نتجاهل — الفورم يفضل بالقيم المخزنة */
      }
    })();
    return () => {
      alive = false;
    };
  }, [resetProfile, getProfileValues]);

  // PUT /users/updateMe
  async function onSaveProfile(values: ProfileValues) {
    try {
      const body: { name: string; email: string; phone?: string } = {
        name: values.name,
        email: values.email,
      };
      if (values.phone) body.phone = values.phone;
      await updateMyData(body);
      setStoredUser(body);
      toast.success("Profile updated successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  // PUT /users/changeMyPassword — بيرجع توكن جديد بنحدّثه في userData
  async function onChangePassword(values: PasswordValues) {
    try {
      const res = await changeMyPassword({
        currentPassword: values.currentPassword,
        password: values.password,
        rePassword: values.rePassword,
      });
      if (res?.token) setStoredToken(res.token);
      resetPassword();
      setReveal({ current: false, next: false, confirm: false });
      toast.success("Password changed successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <section>
      <div suppressHydrationWarning className="mb-4" data-aos="fade-up">
        <h2 className="text-lg font-extrabold text-[#14171A]">
          Account Settings
        </h2>
        <p className="text-xs text-[#8A857B] mt-0.5">
          Update your profile information and change your password
        </p>
      </div>

      {/* ===== Profile Information + Account Information ===== */}
      <div
        suppressHydrationWarning
        className="bg-white border border-[#E7E5E1] rounded-xl p-6 overflow-hidden"
        data-aos="fade-up"
      >
        <SectionHead
          icon={<User className="w-5 h-5" />}
          title="Profile Information"
          subtitle="Update your personal details"
          tone="green"
        />

        <form
          onSubmit={handleProfileSubmit(onSaveProfile)}
          noValidate
          className="max-w-2xl"
        >
          <div className="mb-4">
            <label
              htmlFor="pf-name"
              className="block text-[13px] font-semibold text-[#4B5563] mb-1.5"
            >
              Full Name
            </label>
            <input
              id="pf-name"
              placeholder="Enter your name"
              {...registerProfile("name")}
              className={inputClass(!!profileErrors.name)}
            />
            {profileErrors.name && (
              <p className="text-xs font-semibold text-red-500 mt-1.5">
                {profileErrors.name.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="pf-email"
              className="block text-[13px] font-semibold text-[#4B5563] mb-1.5"
            >
              Email Address
            </label>
            <input
              id="pf-email"
              type="email"
              placeholder="Enter your email"
              {...registerProfile("email")}
              className={inputClass(!!profileErrors.email)}
            />
            {profileErrors.email && (
              <p className="text-xs font-semibold text-red-500 mt-1.5">
                {profileErrors.email.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="pf-phone"
              className="block text-[13px] font-semibold text-[#4B5563] mb-1.5"
            >
              Phone Number
            </label>
            <input
              id="pf-phone"
              placeholder="01xxxxxxxxx"
              inputMode="numeric"
              {...registerProfile("phone")}
              className={inputClass(!!profileErrors.phone)}
            />
            {profileErrors.phone && (
              <p className="text-xs font-semibold text-red-500 mt-1.5">
                {profileErrors.phone.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 bg-[#00B250] hover:bg-[#009B4D] text-white text-[13px] font-bold rounded-lg px-5 py-2.5 transition-colors cursor-pointer disabled:opacity-70"
          >
            {savingProfile ? (
              <BeatLoader size={8} color="#ffffff" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </form>

        {/* Account Information — عرض فقط */}
        <div className="mt-8 -mx-6 -mb-6 border-t border-[#E7E5E1] bg-[#FAFBFC] px-6 py-5">
          <h3 className="text-[15px] font-extrabold text-[#14171A] mb-2">
            Account Information
          </h3>
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-[13px] text-[#8A857B]">User ID</span>
            <code className="text-xs text-[#4B5563] bg-[#F1F2F4] px-2.5 py-1 rounded-md break-all">
              {account.id || "—"}
            </code>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-[13px] text-[#8A857B]">Role</span>
            <span className="text-xs font-bold text-[#00B250] bg-[#E8F8EE] px-3.5 py-1.5 rounded-lg">
              {account.role}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Change Password ===== */}
      <div
        suppressHydrationWarning
        className="bg-white border border-[#E7E5E1] rounded-xl p-6 mt-6"
        data-aos="fade-up"
      >
        <SectionHead
          icon={<LockKeyhole className="w-5 h-5" />}
          title="Change Password"
          subtitle="Update your account password"
          tone="orange"
        />

        <form
          onSubmit={handlePasswordSubmit(onChangePassword)}
          noValidate
          className="max-w-2xl"
        >
          <PasswordField
            id="pw-current"
            label="Current Password"
            placeholder="Enter your current password"
            autoComplete="current-password"
            registration={registerPassword("currentPassword")}
            error={passwordErrors.currentPassword?.message}
            reveal={reveal.current}
            onToggle={() => setReveal((r) => ({ ...r, current: !r.current }))}
          />

          <PasswordField
            id="pw-next"
            label="New Password"
            placeholder="Enter your new password"
            autoComplete="new-password"
            registration={registerPassword("password")}
            error={passwordErrors.password?.message}
            reveal={reveal.next}
            onToggle={() => setReveal((r) => ({ ...r, next: !r.next }))}
            helper="Must be at least 6 characters"
          />

          <PasswordField
            id="pw-confirm"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            autoComplete="new-password"
            registration={registerPassword("rePassword")}
            error={passwordErrors.rePassword?.message}
            reveal={reveal.confirm}
            onToggle={() => setReveal((r) => ({ ...r, confirm: !r.confirm }))}
          />

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 bg-[#E8891C] hover:bg-[#D3760E] text-white text-[13px] font-bold rounded-lg px-5 py-2.5 transition-colors cursor-pointer disabled:opacity-70 mt-2"
          >
            {savingPassword ? (
              <BeatLoader size={8} color="#ffffff" />
            ) : (
              <>
                <LockKeyhole className="w-4 h-4" /> Change Password
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
