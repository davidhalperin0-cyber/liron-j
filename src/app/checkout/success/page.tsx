"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";
  const total = Number(searchParams.get("total") ?? 0);

  // Funnel step 5 — purchase completed
  useEffect(() => {
    if (orderNumber) analytics.purchase({ id: orderNumber, value: total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center"
    >
      <div className="w-16 h-16 rounded-full bg-green-500/10 mx-auto flex items-center justify-center mb-6">
        <CheckCircle size={32} className="text-green-400" />
      </div>

      <h1 className="font-display text-3xl text-white mb-3">ההזמנה בוצעה בהצלחה!</h1>
      <p className="text-sm text-white/50 mb-2">תודה שקנית ב-AURÉA</p>

      {orderNumber && (
        <div className="bg-charcoal border border-white/5 rounded-lg p-5 mt-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package size={16} className="text-gold/60" />
            <span className="text-xs text-white/40">מספר הזמנה</span>
          </div>
          <p className="text-xl font-mono text-gold">{orderNumber}</p>
          <p className="text-xs text-white/30 mt-2">
            אישור הזמנה נשלח לאימייל שלך
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account">
          <Button variant="gold" size="md">
            צפי בהזמנות שלי
            <ArrowRight size={14} className="mr-2" />
          </Button>
        </Link>
        <Link href="/collections">
          <Button variant="ghost" size="md">
            המשיכי לקנות
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold/40" /></div>}>
          <SuccessContent />
        </Suspense>
      </section>
      <Footer />
    </div>
  );
}
