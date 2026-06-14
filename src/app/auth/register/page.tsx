"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { notifyAction, notifyError } from "@/lib/ui-actions";
import { registerSchema, validateForm, type RegisterForm, type FieldErrors } from "@/lib/validations";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors<RegisterForm>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof RegisterForm]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForm(registerSchema, form);
    if (!result.success) {
      setErrors(result.errors);
      notifyError("נא לתקן את השדות המסומנים");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.data.email,
          password: result.data.password,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        notifyError(data.error ?? "שגיאה ביצירת החשבון");
        return;
      }

      if (data.needsEmailConfirmation) {
        notifyAction("החשבון נוצר! בדקי את האימייל לאימות, ואז היכנסי דרך התחברות.");
        router.push("/auth/login");
        return;
      }

      notifyAction("החשבון נוצר בהצלחה!");
      router.push("/account");
    } catch {
      notifyError("שגיאה ביצירת חשבון. נסי שנית.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field: keyof RegisterForm) =>
    `w-full pr-10 pl-4 py-2.5 bg-smoke border ${errors[field] ? "border-red-400/30" : "border-white/5"} rounded-lg text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-gold/30 transition-colors`;

  const passwordFieldClass = (field: keyof RegisterForm) =>
    `w-full pr-10 pl-10 py-2.5 bg-smoke border ${errors[field] ? "border-red-400/30" : "border-white/5"} rounded-lg text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-gold/30 transition-colors`;

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
            <h1 className="font-display text-3xl text-white">הרשמה</h1>
            <p className="text-sm text-white/40 mt-2">הצטרפי למשפחת AURÉA</p>
          </div>

          <div className="bg-charcoal border border-white/5 rounded-lg p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">שם פרטי</label>
                  <div className="relative">
                    <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className={fieldClass("firstName")}
                    />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">שם משפחה</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={`w-full px-4 py-2.5 bg-smoke border ${errors.lastName ? "border-red-400/30" : "border-white/5"} rounded-lg text-sm text-white focus:outline-none focus:border-gold/30 transition-colors`}
                  />
                  {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5">אימייל</label>
                <div className="relative">
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="email@example.com"
                    className={fieldClass("email")}
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
                    placeholder="6 תווים לפחות"
                    className={passwordFieldClass("password")}
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

              <div>
                <label className="block text-xs text-white/40 mb-1.5">אימות סיסמה</label>
                <div className="relative">
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    placeholder="הזיני את הסיסמה שוב"
                    className={passwordFieldClass("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button variant="gold" size="md" className="w-full" loading={loading}>
                יצירת חשבון
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-white/30">
                כבר יש לך חשבון?{" "}
                <Link href="/auth/login" className="text-gold/60 hover:text-gold transition-colors">
                  התחברות
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
