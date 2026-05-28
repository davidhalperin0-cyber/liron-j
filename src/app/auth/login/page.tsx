"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { notifyAction, notifyError } from "@/lib/ui-actions";
import { loginSchema, validateForm, type LoginForm, type FieldErrors } from "@/lib/validations";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginForm>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateField = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForm(loginSchema, form);
    if (!result.success) {
      setErrors(result.errors);
      notifyError("נא למלא את כל השדות");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error ?? "שגיאה בהתחברות");
        return;
      }
      notifyAction("התחברת בהצלחה!");
      router.push("/account");
    } catch {
      notifyError("שגיאה בהתחברות. נסה שנית.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-white">התחברות</h1>
            <p className="text-sm text-white/40 mt-2">ברוכה הבאה חזרה</p>
          </div>

          <div className="bg-charcoal border border-white/5 rounded-lg p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">אימייל</label>
                <div className="relative">
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="email@example.com"
                    className={`w-full pr-10 pl-4 py-2.5 bg-smoke border ${errors.email ? "border-red-400/30" : "border-white/5"} rounded-lg text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-gold/30 transition-colors`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">סיסמה</label>
                <div className="relative">
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pr-10 pl-10 py-2.5 bg-smoke border ${errors.password ? "border-red-400/30" : "border-white/5"} rounded-lg text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-gold/30 transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-[#B89B5E]" />
                  <span className="text-xs text-white/40">זכור אותי</span>
                </label>
                <button
                  type="button"
                  onClick={() => notifyAction("איפוס סיסמה יהיה זמין בקרוב")}
                  className="text-xs text-gold/60 hover:text-gold transition-colors"
                >
                  שכחת סיסמה?
                </button>
              </div>
              <Button variant="gold" size="md" className="w-full" loading={loading}>
                התחברות
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-white/30">
                אין לך חשבון?{" "}
                <Link href="/auth/register" className="text-gold/60 hover:text-gold transition-colors">
                  הרשמה
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
