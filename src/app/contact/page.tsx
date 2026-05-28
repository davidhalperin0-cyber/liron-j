"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { notifyAction, notifyError } from "@/lib/ui-actions";
import { contactSchema, validateForm, type ContactForm, type FieldErrors } from "@/lib/validations";

const CONTACT_INFO = [
  { icon: MapPin, label: "כתובת", value: "תל אביב, ישראל" },
  { icon: Phone, label: "טלפון", value: "03-1234567" },
  { icon: Mail, label: "אימייל", value: "info@lironj.com" },
  { icon: Clock, label: "שעות פעילות", value: "א׳-ה׳ 9:00-18:00" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors<ContactForm>>({});
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof ContactForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4"
            >
              צרו קשר
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl text-white"
            >
              נשמח לשמוע ממך
            </motion.h1>
          </div>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              {CONTACT_INFO.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/5 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-gold/60" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-0.5">{item.label}</p>
                    <p className="text-sm text-white/80">{item.value}</p>
                  </div>
                </motion.div>
              ))}

              <div className="pt-8 border-t border-white/5">
                <p className="text-xs text-white/40 mb-3">עקבו אחרינו</p>
                <div className="flex items-center gap-3">
                  {["Instagram", "Facebook", "WhatsApp"].map((social) => (
                    <button
                      key={social}
                      onClick={() => notifyAction(`${social} — בקרוב`)}
                      className="px-4 py-2 bg-charcoal border border-white/5 rounded-lg text-xs text-white/40 hover:text-gold hover:border-gold/20 transition-colors"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 bg-charcoal border border-white/5 rounded-lg p-4 sm:p-8"
            >
              <h2 className="text-lg font-medium text-white mb-6">שלחו הודעה</h2>
              <form
                className="space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const result = validateForm(contactSchema, formData);
                  if (!result.success) {
                    setErrors(result.errors);
                    notifyError("נא למלא את כל השדות הנדרשים");
                    return;
                  }
                  setErrors({});
                  setLoading(true);
                  try {
                    const res = await fetch("/api/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(result.data),
                    });
                    if (!res.ok) {
                      notifyError("שגיאה בשליחת ההודעה. נסי שנית.");
                      return;
                    }
                    notifyAction("ההודעה נשלחה בהצלחה! ניצור קשר בהקדם.");
                    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                  } catch {
                    notifyError("שגיאה בשליחת ההודעה. נסי שנית.");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">שם מלא</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className={`w-full px-4 py-2.5 bg-smoke border ${errors.name ? "border-red-400/30" : "border-white/5"} rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors`}
                      placeholder="השם שלך"
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">אימייל</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={`w-full px-4 py-2.5 bg-smoke border ${errors.email ? "border-red-400/30" : "border-white/5"} rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors`}
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">טלפון</label>
                    <input
                      type="tel"
                      value={formData.phone ?? ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full px-4 py-2.5 bg-smoke border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
                      placeholder="050-0000000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">נושא</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                      className={`w-full px-4 py-2.5 bg-smoke border ${errors.subject ? "border-red-400/30" : "border-white/5"} rounded-lg text-sm text-white focus:outline-none focus:border-gold/30 transition-colors`}
                    >
                      <option value="">בחר נושא</option>
                      <option value="order">שאלה על הזמנה</option>
                      <option value="product">שאלה על מוצר</option>
                      <option value="custom">הזמנה מותאמת אישית</option>
                      <option value="other">אחר</option>
                    </select>
                    {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">הודעה</label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className={`w-full px-4 py-2.5 bg-smoke border ${errors.message ? "border-red-400/30" : "border-white/5"} rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors resize-none`}
                    placeholder="ספרי לנו איך נוכל לעזור..."
                  />
                  {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
                </div>
                <Button variant="gold" size="md" className="w-full" loading={loading}>
                  <Send size={14} className="ml-2" />
                  שלח הודעה
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
