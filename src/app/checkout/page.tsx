"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, Truck, Shield, Plus, Sparkles, Check } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { notifyAction, notifyError } from "@/lib/ui-actions";
import { analytics } from "@/lib/analytics";
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

  // Promo code
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<{ valid: boolean; discount?: number; message: string; code?: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const discount = promo?.valid ? promo.discount ?? 0 : 0;

  // AURÉA Club — 5% first-purchase gift, stacks on top of any promo code.
  const [joinClub, setJoinClub] = useState(false);
  const clubDiscount = joinClub ? Math.round(subtotal * 0.05) : 0;

  const total = Math.max(0, subtotal + shipping - discount - clubDiscount);

  // Checkout recommendations ("complete the look"), fetched when reaching payment.
  type Rec = { id: string; slug: string; name: string; price: number; image: string };
  const [recs, setRecs] = useState<Rec[]>([]);
  const addItem = store.addItem;

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();
      setPromo(data);
      if (!data.valid) notifyError(data.message);
      else notifyAction(data.message);
    } catch {
      notifyError("שגיאה באימות הקוד");
    } finally {
      setPromoLoading(false);
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Funnel step 3 — checkout started
  useEffect(() => {
    if (items.length > 0) analytics.beginCheckout(subtotal, items.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Funnel step 4 — reached the payment step (right before paying)
  useEffect(() => {
    if (currentStep === "payment" && items.length > 0) analytics.addPaymentInfo(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Load "complete the look" recommendations once we reach the payment step.
  useEffect(() => {
    if (currentStep !== "payment" || items.length === 0) return;
    let cancelled = false;
    fetch("/api/checkout/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: items.map((i) => i.product.id) }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setRecs(Array.isArray(d.products) ? d.products : []); })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const addRecToCart = (rec: Rec) => {
    addItem({
      id: `${rec.id}-default`,
      product: { id: rec.id, slug: rec.slug, name: { he: rec.name, en: rec.name }, price: rec.price, image: rec.image },
      quantity: 1,
      price: rec.price,
    });
    notifyAction(`${rec.name} נוסף לסל`);
    setRecs((prev) => prev.filter((r) => r.id !== rec.id));
  };

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
      // Register the club membership (frictionless — email/name from step 1).
      if (joinClub) {
        fetch("/api/club/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: info.email, name: `${info.firstName} ${info.lastName}`.trim(), phone: info.phone }),
        }).catch(() => {});
      }

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
          discount: discount + clubDiscount,
          promoCode: promo?.valid ? promo.code : undefined,
          joinedClub: joinClub,
          clubDiscount,
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
      router.push(`/checkout/success?order=${data.orderNumber ?? ""}&total=${total}`);
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

                      {/* AURÉA Club — 5% first-purchase gift, stacks with promos */}
                      <button
                        type="button"
                        onClick={() => setJoinClub((v) => !v)}
                        className={`w-full text-right rounded-lg border p-4 transition-all ${
                          joinClub
                            ? "border-gold/60 bg-gold/[0.07]"
                            : "border-gold/20 bg-gold/[0.03] hover:border-gold/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 w-5 h-5 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors ${
                              joinClub ? "bg-gold border-gold text-black" : "border-gold/40 text-transparent"
                            }`}
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-white flex items-center gap-1.5">
                              <Sparkles size={13} className="text-gold" />
                              הצטרפו למועדון AURÉA — <span className="text-gold">5% מתנה</span> לקנייה הראשונה
                            </p>
                            <p className="text-[11px] text-white/45 mt-1 leading-relaxed">
                              ההנחה מצטברת על כל מבצע קיים. גישה מוקדמת לקולקציות והטבות חברים — ללא עלות.
                            </p>
                            {joinClub && clubDiscount > 0 && (
                              <p className="text-[11px] text-gold/90 mt-1.5">
                                נחסכו לך {formatPrice(clubDiscount)} 🎁
                              </p>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Complete the look — two recommendations before payment */}
                      {recs.length > 0 && (
                        <div className="rounded-lg border border-white/5 bg-smoke/30 p-4">
                          <p className="text-xs tracking-wider text-white/50 mb-3">
                            משלימים את המראה
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {recs.slice(0, 2).map((rec) => (
                              <div key={rec.id} className="group">
                                <Link href={`/products/${rec.slug}`} className="block relative aspect-square overflow-hidden rounded-md bg-charcoal">
                                  {rec.image && (
                                    <Image
                                      src={rec.image}
                                      alt={rec.name}
                                      fill
                                      sizes="150px"
                                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  )}
                                </Link>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-xs text-white/80 truncate">{rec.name}</p>
                                    <p className="text-xs text-gold/80">{formatPrice(rec.price)}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addRecToCart(rec)}
                                    aria-label="הוספה לסל"
                                    className="w-7 h-7 shrink-0 rounded-full border border-gold/30 text-gold flex items-center justify-center hover:bg-gold/10 transition-colors"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-white/40">
                          <span>סכום ביניים</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-white/40">
                          <span>משלוח</span>
                          <span>{shipping === 0 ? "חינם" : formatPrice(shipping)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-gold/80">
                            <span>הנחה{promo?.code ? ` (${promo.code})` : ""}</span>
                            <span>−{formatPrice(discount)}</span>
                          </div>
                        )}
                        {clubDiscount > 0 && (
                          <div className="flex justify-between text-gold/80">
                            <span>מתנת מועדון (5%)</span>
                            <span>−{formatPrice(clubDiscount)}</span>
                          </div>
                        )}
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
                {/* Promo code */}
                <div className="border-t border-white/5 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      placeholder="קוד הנחה"
                      className="flex-1 min-w-0 bg-smoke border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="px-4 py-2 text-xs border border-gold/30 text-gold/80 rounded-lg hover:bg-gold/5 disabled:opacity-30 transition-colors"
                    >
                      {promoLoading ? "..." : "החל"}
                    </button>
                  </div>
                  {promo?.valid && (
                    <p className="text-[11px] text-green-400/70 mt-2">{promo.message}</p>
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
                  {discount > 0 && (
                    <div className="flex justify-between text-gold/80">
                      <span>הנחה{promo?.code ? ` (${promo.code})` : ""}</span>
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  {clubDiscount > 0 && (
                    <div className="flex justify-between text-gold/80">
                      <span>מתנת מועדון (5%)</span>
                      <span>−{formatPrice(clubDiscount)}</span>
                    </div>
                  )}
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
