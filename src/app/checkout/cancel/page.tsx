"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowRight, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function CancelContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center"
    >
      <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-6">
        <XCircle size={32} className="text-red-400" />
      </div>

      <h1 className="font-display text-3xl text-white mb-3">התשלום בוטל</h1>
      <p className="text-sm text-white/50 mb-6">
        ההזמנה {orderNumber && <span className="font-mono text-white/70">{orderNumber}</span>} לא הושלמה.
        <br />
        הפריטים עדיין בסל שלך.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/checkout">
          <Button variant="gold" size="md">
            חזרה לתשלום
            <ArrowRight size={14} className="mr-2" />
          </Button>
        </Link>
        <Link href="/cart">
          <Button variant="ghost" size="md">
            חזרה לסל
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold/40" /></div>}>
          <CancelContent />
        </Suspense>
      </section>
      <Footer />
    </div>
  );
}
