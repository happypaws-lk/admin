"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setApiError(
          (data as { message?: string; title?: string }).message ??
            (data as { message?: string; title?: string }).title ??
            "Something went wrong. Please try again.",
        );
        return;
      }

      router.push(`/verify-reset-code?email=${encodeURIComponent(values.email)}`);
    } catch {
      setApiError("Unable to reach the server. Check your connection.");
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
        <h1 className="text-2xl sm:text-[30px] font-bold text-white text-center mt-2 mb-2 tracking-tight">
          Forgot password?
        </h1>
        <p className="text-sm text-slate-400 font-normal mb-6 text-center">
          Enter your email and we&apos;ll send you a reset code.
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
              placeholder="Your email address"
              className="w-full px-4 py-3 bg-[#181b2b]/90 border border-[#2c3049] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all text-sm"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#5b50e6] hover:bg-[#4d42df] active:bg-[#4237d1] text-white font-semibold rounded-lg shadow-lg shadow-[#5b50e6]/25 transition-all duration-200 text-sm tracking-wide cursor-pointer flex items-center justify-center space-x-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Continue</span>
            )}
          </button>
        </form>

        <div className="mt-7 text-center">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-slate-200 font-medium transition-colors inline-flex items-center space-x-1"
          >
            <span>&larr; Back to login</span>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
