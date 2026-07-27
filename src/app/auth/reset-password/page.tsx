"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { notifyAction, notifyError } from "@/lib/ui-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // The recovery link drops a session token in the URL hash; supabase-js picks
  // it up automatically. We just wait for that session to be established.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return notifyError("סיסמה חייבת להכיל לפחות 6 תווים");
    if (password !== confirm) return notifyError("הסיסמאות אינן תואמות");

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        notifyError("הקישור פג תוקף או אינו תקין. בקשי איפוס חדש.");
        return;
      }
      notifyAction("הסיסמה עודכנה! מעבירה אותך להתחברות…");
      await supabase.auth.signOut();
      setTimeout(() => router.push("/auth/login"), 1200);
    } catch {
      notifyError("שגיאה בעדכון הסיסמה. נסי שנית.");
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
          <div className="bg-charcoal border border-white/5 rounded-2xl p-8">
            <h1 className="text-2xl font-medium text-white mb-2">איפוס סיסמה</h1>
            <p className="text-sm text-white/40 mb-8">בחרי סיסמה חדשה לחשבון שלך</p>

            {!ready ? (
              <p className="text-sm text-white/40">מאמת את הקישור…</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">סיסמה חדשה</label>
                  <div className="relative">
                    <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10 pl-10 py-2.5 bg-smoke border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">אימות סיסמה</label>
                  <div className="relative">
                    <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 bg-smoke border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
                    />
                  </div>
                </div>
                <Button variant="gold" size="md" className="w-full" loading={loading}>
                  עדכן סיסמה
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <Link href="/auth/login" className="text-sm text-gold/60 hover:text-gold transition-colors">
                חזרה להתחברות
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
}
