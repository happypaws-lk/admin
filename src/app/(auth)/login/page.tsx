"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 12C22 12 19 5 12 5C5 5 2 12 2 12C2 12 5 19 12 19C19 19 22 12 22 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function LoginPage() {
  const [setupChecked, setSetupChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/v1/setup/status")
      .then((r) => r.json())
      .then(({ isSetupComplete }: { isSetupComplete: boolean }) => {
        if (!isSetupComplete) {
          router.replace("/setup");
        } else {
          setSetupChecked(true);
        }
      })
      .catch(() => setSetupChecked(true));
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  });

  if (!setupChecked) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center bg-[#0d0f17] overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[450px] sm:w-[550px] h-[450px] sm:h-[550px] bg-[#685cf0]/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-28 -right-28 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-[#4a29a0]/30 rounded-full blur-[140px] pointer-events-none" aria-hidden="true" />
        <span className="relative z-10 inline-block w-7 h-7 border-2 border-[#5b50e6]/30 border-t-[#5b50e6] rounded-full animate-spin" />
      </main>
    );
  }

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    try {
      await login(values.email, values.password, values.rememberMe);
      router.push("/");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#0d0f17] overflow-hidden p-4 sm:p-6">
      <div className="absolute -top-24 -left-24 w-[450px] sm:w-[550px] h-[450px] sm:h-[550px] bg-[#685cf0]/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-28 -right-28 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-[#4a29a0]/30 rounded-full blur-[140px] pointer-events-none" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-[430px] p-7 sm:p-9 rounded-2xl bg-[#131627]/65 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80"
      >
        <h1 className="text-2xl sm:text-[30px] font-bold text-white text-center mt-5 mb-2 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 font-normal mb-5 px-4 text-center">
          Sign in to continue to dashboard
        </p>

        {apiError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2 ml-0.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 bg-[#181b2b]/90 border border-[#2c3049] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all text-sm"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2 ml-0.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your Password"
                className="w-full pl-4 pr-11 py-3 bg-[#181b2b]/90 border border-[#2c3049] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all text-sm"
                autoComplete="current-password"
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
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2.5 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[#2c3049] bg-[#181b2b] text-[#5b50e6] focus:ring-0 accent-[#5b50e6] cursor-pointer"
                {...register("rememberMe")}
              />
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">
                Remember me
              </span>
            </label>
            <Link href="/forgot-password" className="text-sm text-[#685cf0] hover:text-[#8075ff] font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#5b50e6] hover:bg-[#4d42df] active:bg-[#4237d1] text-white font-semibold rounded-lg shadow-lg shadow-[#5b50e6]/25 transition-all duration-200 text-sm tracking-wide cursor-pointer mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
