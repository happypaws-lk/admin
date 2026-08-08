"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const RESEND_COOLDOWN = 60;

export default function VerifyResetCodeForm() {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resendSending, setResendSending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    if (!email) {
      router.replace("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (index: number, value: string) => {
    const lastChar = value.slice(-1);
    if (value && !/^\d$/.test(lastChar)) return;

    const newCode = [...code];
    newCode[index] = lastChar;
    setCode(newCode);

    if (lastChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newCode = Array.from({ length: 6 }, (_, i) => pasted[i] ?? "");
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendSending) return;
    setResendSending(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setResendSending(false);
      startCooldown();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeStr = code.join("");
    if (codeStr.length < 6) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-reset-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: codeStr }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setApiError(
          (data as { message?: string; title?: string }).message ??
            (data as { message?: string; title?: string }).title ??
            "Invalid or expired code.",
        );
        return;
      }

      const data = (await res.json()) as { resetToken: string };
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.resetToken)}`,
      );
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
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
          Check your email
        </h1>
        <p className="text-sm text-slate-400 font-normal mb-6 text-center">
          Enter the 6-digit code we sent to{" "}
          {email ? (
            <span className="text-slate-300 font-medium">{email}</span>
          ) : (
            "your email"
          )}
          .
        </p>

        {apiError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between gap-2 sm:gap-2.5">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-11 sm:w-12 h-12 text-center text-xl font-bold bg-[#181b2b]/90 border border-[#2c3049] rounded-lg text-white focus:outline-none focus:border-[#5b50e6] focus:ring-1 focus:ring-[#5b50e6] transition-all"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.join("").length < 6}
            className="w-full py-3.5 px-4 bg-[#5b50e6] hover:bg-[#4d42df] active:bg-[#4237d1] text-white font-semibold rounded-lg shadow-lg shadow-[#5b50e6]/25 transition-all duration-200 text-sm tracking-wide cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        <div className="mt-7 flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-slate-400 hover:text-slate-200 font-medium transition-colors inline-flex items-center space-x-1"
          >
            <span>&larr; Back</span>
          </Link>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resendSending}
            className="text-[#685cf0] hover:text-[#8075ff] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default tabular-nums"
          >
            {resendSending
              ? "Sending…"
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
