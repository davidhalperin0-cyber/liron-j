"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Truck, Shield } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { notifyAction, notifyError } from "@/lib/ui-actions";
import {
  checkoutInfoSchema,
  type CheckoutInfo,
  type FieldErrors,
  validateForm,
} from "@/lib/validations";

type Step = "info" | "shipping" | "payment";

const STEPS: { key: Step; label: string }[] = [
  { key: "info", label: "פרטים אישיים" },
  { key: "shipping", label: "משלוח" },
  { key: "payment", label: "תשלום" },
];

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

const INPUT_CLASS =
  "w-full px-4 py-2.5 bg-smoke border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-gold/30 transition-colors";
const INPUT_ERROR_CLASS =
  "w-full px-4 py-2.5 bg-smoke border border-red-400/30 rounded-lg text-sm text-white focus:outline-none focus:border-red-400/50 transition-colors";

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [submitting, setSubmitting] = useState(false);
  const store = useCartStore();
  const items = store.items;
  const subtotal = store.subtotal();
  const shipping = shippingMethod === "express" ? 49 : shippingMethod === "pickup" ? 0 : subtotal >= 500 ? 0 : 29;
  const total = subtotal + shipping;

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Form state
  const [info, setInfo] = useState<Partial<CheckoutInfo>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "ישראל",
  });
  const [errors, setErrors] = useState<FieldErrors<CheckoutInfo>>({});

  const updateInfo = (field: keyof CheckoutInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInfoSubmit = () => {
    const result = validateForm(checkoutInfoSchema, info);
    if (!result.success) {
      setErrors(result.errors);
      notifyError("נא למלא את כל השדות הנדרשים");
      return;
    }
    setErrors({});
    setCurrentStep("shipping");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      notifyError("הסל ריק");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${info.firstName} ${info.lastName}`,
          customerEmail: info.email,
          customerPhone: info.phone,
          shippingAddress: {
            address: info.address,
            city: info.city,
            postalCode: info.postalCode,
            country: info.country,
          },
          shippingMethod,
          items: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name.he,
            variantName: item.variantName,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          shippingCost: shipping,
          total,
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      const data = await res.json();

      // If Stripe is configured, redirect to Stripe Checkout
      if (data.checkoutUrl) {
        store.clear();
        window.location.href = data.checkoutUrl;
        return;
      }

      // Fallback: Stripe not configured, order created without payment
      store.clear();
      notifyAction(`ההזמנה נוצרה! מספר הזמנה: ${data.orderNumber ?? "ממתין"}`);
      router.push(`/checkout/success?order=${data.orderNumber ?? ""}`);
    } catch {
      notifyError("שגיאה ביצירת ההזמנה. נסי שנית.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Steps */}
          <div className="flex items-center justify-center gap-2 sm:gap-8 mb-8 sm:mb-12">
            {STEPS.map((step, i) => (
              <button
                key={step.key}
                onClick={() => {
                  if (i < stepIndex) setCurrentStep(step.key);
                }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-colors shrink-0 ${
                    i <= stepIndex
                      ? "bg-gold border-gold text-black"
                      : "border-white/10 text-white/30"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`text-xs sm:text-sm ${i <= stepIndex ? "text-white" : "text-white/30"}`}>
                  {step.label}
                </span>
                {i < STEPS.length - 1 && <div className="w-4 sm:w-12 h-px bg-white/10 mx-1 sm:mx-2" />}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-charcoal border border-white/5 rounded-lg p-4 sm:p-8"
              >
                {currentStep === "info" && (
                  <>
                    <h2 className="text-lg font-medium text-white mb-6">פרטים אישיים</h2>
                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <FormField label="שם פרטי" error={errors.firstName}>
                          <input
                            type="text"
                            value={info.firstName ?? ""}
                            onChange={(e) => updateInfo("firstName", e.target.value)}
                            className={errors.firstName ? INPUT_ERROR_CLASS : INPUT_CLASS}
                          />
                        </FormField>
                        <FormField label="שם משפחה" error={errors.lastName}>
                          <input
                            type="text"
                            value={info.lastName ?? ""}
                            onChange={(e) => updateInfo("lastName", e.target.value)}
                            className={errors.lastName ? INPUT_ERROR_CLASS : INPUT_CLASS}
                          />
                        </FormField>
                      </div>
                      <FormField label="אימייל" error={errors.email}>
                        <input
                          type="email"
                          value={info.email ?? ""}
                          onChange={(e) => updateInfo("email", e.target.value)}
                          className={errors.email ? INPUT_ERROR_CLASS : INPUT_CLASS}
                        />
                      </FormField>
                      <FormField label="טלפון" error={errors.phone}>
                        <input
                          type="tel"
                          value={info.phone ?? ""}
                          onChange={(e) => updateInfo("phone", e.target.value)}
                          className={errors.phone ? INPUT_ERROR_CLASS : INPUT_CLASS}
                        />
                      </FormField>
                      <FormField label="כתובת" error={errors.address}>
                        <input
                          type="text"
                          value={info.address ?? ""}
                          onChange={(e) => updateInfo("address", e.target.value)}
                          className={errors.address ? INPUT_ERROR_CLASS : INPUT_CLASS}
                        />
                      </FormField>
                      <div className="grid sm:grid-cols-3 gap-5">
                        <FormField label="עיר" error={errors.city}>
                          <input
                            type="text"
                            value={info.city ?? ""}
                            onChange={(e) => updateInfo("city", e.target.value)}
                            className={errors.city ? INPUT_ERROR_CLASS : INPUT_CLASS}
                          />
                        </FormField>
                        <FormField label="מיקוד">
                          <input
                            type="text"
                            value={info.postalCode ?? ""}
                            onChange={(e) => updateInfo("postalCode", e.target.value)}
                            className={INPUT_CLASS}
                          />
                        </FormField>
                        <FormField label="מדינה">
                          <input
                            type="text"
                            value={info.country ?? "ישראל"}
                            onChange={(e) => updateInfo("country", e.target.value)}
                            className={INPUT_CLASS}
                          />
                        </FormField>
                      </div>
                      <Button variant="gold" size="md" className="w-full mt-2" onClick={handleInfoSubmit}>
                        המשך למשלוח
                        <ArrowRight size={14} className="mr-2" />
                      </Button>
                    </div>
                  </>
                )}

                {currentStep === "shipping" && (
                  <>
                    <h2 className="text-lg font-medium text-white mb-6">אפשרויות משלוח</h2>
                    <div className="space-y-3">
                      {[
                        { id: "standard", name: "משלוח רגיל", price: 29, time: "3-5 ימי עסקים", free: subtotal >= 500 },
                        { id: "express", name: "משלוח אקספרס", price: 49, time: "1-2 ימי עסקים", free: false },
                        { id: "pickup", name: "איסוף עצמי", price: 0, time: "מוכן תוך 24 שעות", free: true },
                      ].map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-4 p-4 bg-smoke border border-white/5 rounded-lg cursor-pointer hover:border-gold/20 transition-colors"
                        >
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === option.id}
                            onChange={() => setShippingMethod(option.id)}
                            className="accent-[#B89B5E]"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-white/80">{option.name}</p>
                            <p className="text-[10px] text-white/30">{option.time}</p>
                          </div>
                          <span className="text-sm text-gold">
                            {option.free ? "חינם" : formatPrice(option.price)}
                          </span>
                        </label>
                      ))}
                      <Button variant="gold" size="md" className="w-full mt-4" onClick={() => setCurrentStep("payment")}>
                        המשך לתשלום
                        <ArrowRight size={14} className="mr-2" />
                      </Button>
                    </div>
                  </>
                )}

                {currentStep === "payment" && (
                  <>
                    <h2 className="text-lg font-medium text-white mb-6">תשלום</h2>
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-xs text-green-400/60 mb-4">
                        <Lock size={12} />
                        תשלום מאובטח באמצעות Stripe
                      </div>

                      <div className="bg-smoke/50 border border-gold/10 rounded-lg p-5">
                        <p className="text-sm text-white/70 mb-2">פרטי תשלום</p>
                        <p className="text-xs text-white/40 leading-relaxed">
                          לאחר לחיצה על &quot;המשך לתשלום&quot; תועברי לדף תשלום מאובטח של Stripe.
                          פרטי האשראי שלך לא נשמרים אצלנו.
                        </p>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-white/40">
                          <span>סכום ביניים</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-white/40">
                          <span>משלוח</span>
                          <span>{shipping === 0 ? "חינם" : formatPrice(shipping)}</span>
                        </div>
                        <div className="flex justify-between text-white font-medium pt-2 border-t border-white/5">
                          <span>סה&quot;כ לתשלום</span>
                          <span className="text-gold text-lg">{formatPrice(total)}</span>
                        </div>
                      </div>

                      <Button
                        variant="gold"
                        size="md"
                        className="w-full mt-2"
                        loading={submitting}
                        onClick={handlePlaceOrder}
                      >
                        <Lock size={14} className="ml-2" />
                        המשך לתשלום — {formatPrice(total)}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-charcoal border border-white/5 rounded-lg p-6 sticky top-28">
                <h2 className="text-sm font-medium text-white mb-5">סיכום הזמנה</h2>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-smoke rounded-sm shrink-0 relative">
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-gold rounded-full text-[10px] text-black flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/70 truncate">{item.product.name.he}</p>
                      </div>
                      <span className="text-xs text-white/50">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-white/30 text-center py-4">הסל ריק</p>
                  )}
                </div>
                <div className="border-t border-white/5 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white/40">
                    <span>סכום ביניים</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>משלוח</span>
                    <span>{shipping === 0 ? "חינם" : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-white font-medium pt-2 border-t border-white/5">
                    <span>סה&quot;כ</span>
                    <span className="text-gold text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-1.5">
                  {[
                    { icon: Shield, text: "תשלום מאובטח SSL" },
                    { icon: Truck, text: "משלוח מבוטח" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-[10px] text-white/20">
                      <item.icon size={10} />
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
