"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ProblemDetails } from "@/lib/types";

const schema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be 100 characters or less"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M22 12C22 12 19 5 12 5C5 5 2 12 2 12C2 12 5 19 12 19C19 19 22 12 22 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const PolicyCheck = ({ checked, label }: { checked: boolean; label: string }) => (
  <div className={`flex items-center transition-colors duration-200 ${checked ? "text-emerald-400" : "text-slate-500"}`}>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 mr-2 flex-shrink-0"
    >
      {checked ? (
        <polyline points="20 6 9 17 4 12" />
      ) : (
        <>
          <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
          <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
        </>
      )}
    </svg>
    <span>{label}</span>
  </div>
);

const BackgroundBlobs = () => (
  <>
    <div
      className="absolute -top-24 -left-24 w-[450px] sm:w-[550px] h-[450px] sm:h-[550px] bg-[#685cf0]/20 rounded-full blur-[120px] pointer-events-none"
      aria-hidden="true"
    />
    <div
      className="absolute -bottom-28 -right-28 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-[#4a29a0]/30 rounded-full blur-[140px] pointer-events-none"
      aria-hidden="true"
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#3b1f8c]/10 rounded-full blur-[160px] pointer-events-none"
      aria-hidden="true"
    />
  </>
);

export default function SetupPage() {
  const [pageStatus, setPageStatus] = useState<"checking" | "ready" | "redirecting">("checking");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const passwordValue = useWatch({ control, name: "password", defaultValue: "" });
  const confirmPasswordValue = useWatch({ control, name: "confirmPassword", defaultValue: "" });

  const pwdChecks = {
    length: passwordValue.length >= 8,
    lower: /[a-z]/.test(passwordValue),
    upper: /[A-Z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
  };
  
  const passwordsMatch = passwordValue && confirmPasswordValue && passwordValue === confirmPasswordValue;

  useEffect(() => {
    fetch("/api/v1/setup/status")
      .then((r) => r.json())
      .then(({ isSetupComplete }: { isSetupComplete: boolean }) => {
        if (isSetupComplete) {
          setPageStatus("redirecting");
          router.replace("/login");
        } else {
          setPageStatus("ready");
        }
      })
      .catch(() => setPageStatus("ready"));
  }, [router]);

  const onSubmit = async (values: FormValues) => {
    setApiError(null);

    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    }).catch(() => null);

    if (!res) {
      setApiError("Unable to reach the server. Check your connection.");
      return;
    }

    if (res.status === 409) {
      setApiError("Setup is already complete. Redirecting to login...");
      setTimeout(() => router.replace("/login"), 2000);
      return;
    }

    if (res.status === 422) {
      const data: ProblemDetails = await res
        .json()
        .catch(() => ({ title: "Validation error", status: 422 }));
      if (data.errors && Object.keys(data.errors).length > 0) {
        for (const [field, messages] of Object.entries(data.errors)) {
          const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
          if (key === "name" || key === "email" || key === "password") {
            setError(key, { message: messages[0] });
          }
        }
      } else {
        setApiError(data.detail ?? data.title ?? "Validation error. Please check your inputs.");
      }
      return;
    }

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        title?: string;
      };
      setApiError(data.message ?? data.title ?? "Something went wrong. Please try again.");
      return;
    }

    router.replace("/");
  };

  if (pageStatus !== "ready") {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center bg-[#0d0f17] overflow-hidden">
        <BackgroundBlobs />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <span className="inline-block w-7 h-7 border-2 border-[#5b50e6]/30 border-t-[#5b50e6] rounded-full animate-spin" />
          <p className="text-sm text-slate-500">
            {pageStatus === "redirecting" ? "Redirecting..." : "Loading..."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#0d0f17] overflow-hidden p-4 sm:p-6">
      <BackgroundBlobs />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-[480px] rounded-2xl bg-[#131627]/65 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80 overflow-hidden"
      >
        {/* Header */}
        <div className="pt-18 px-7 sm:px-9 text-center">
          <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight">
            Welcome to HappyPaws
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Create your admin account to get started.
          </p>
        </div>

        {/* Form */}
        <div className="p-7 sm:p-9">
          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-2 ml-0.5"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-[#181b2b]/90 border border-[#2c3049] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all text-sm"
                autoComplete="name"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2 ml-0.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="w-full px-4 py-3 bg-[#181b2b]/90 border border-[#2c3049] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all text-sm"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2 ml-0.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="w-full pl-4 pr-11 py-3 bg-[#181b2b]/90 border border-[#2c3049] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all text-sm"
                  autoComplete="new-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none p-1 rounded-md"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {passwordValue.length > 0 ? (
                <div className="mt-3 flex flex-col gap-3">
                  {/* Progress bar */}
                  <div className="h-1 w-full bg-[#2c3049] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ease-out ${
                        Object.values(pwdChecks).filter(Boolean).length === 4 ? 'bg-emerald-400' :
                        Object.values(pwdChecks).filter(Boolean).length >= 2 ? 'bg-[#5b50e6]' : 'bg-rose-500'
                      }`} 
                      style={{ width: `${(Object.values(pwdChecks).filter(Boolean).length / 4) * 100}%` }} 
                    />
                  </div>
                  
                  {/* Checklist */}
                  <div className="flex flex-col gap-1.5 text-[13px]">
                    <PolicyCheck checked={pwdChecks.length} label="At least 8 characters" />
                    <PolicyCheck checked={pwdChecks.number} label="At least 1 number" />
                    <PolicyCheck checked={pwdChecks.lower} label="At least 1 lowercase letter" />
                    <PolicyCheck checked={pwdChecks.upper} label="At least 1 uppercase letter" />
                  </div>
                </div>
              ) : (
                <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">
                  Password should be at least 8 characters including a number, an uppercase letter, and a lowercase letter.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300 mb-2 ml-0.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  className="w-full pl-4 pr-11 py-3 bg-[#181b2b]/90 border border-[#2c3049] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all text-sm"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none p-1 rounded-md"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirmPasswordValue.length > 0 && (
                <p className={`mt-2 text-xs flex items-center ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5 mr-2 flex-shrink-0"
                  >
                    {passwordsMatch ? (
                      <polyline points="20 6 9 17 4 12" />
                    ) : (
                      <>
                        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                        <line x1="15" y1="9" x2="9" y2="15" strokeWidth="1.5" />
                        <line x1="9" y1="9" x2="15" y2="15" strokeWidth="1.5" />
                      </>
                    )}
                  </svg>
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full py-3.5 px-4 bg-[#5b50e6] hover:bg-[#4d42df] active:bg-[#4237d1] text-white font-semibold rounded-lg shadow-lg shadow-[#5b50e6]/25 transition-all duration-200 text-sm tracking-wide cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Admin Account</span>
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-600">
            This account will be granted full administrator access to the platform.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
