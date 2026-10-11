"use client";

import { FreeShippingAmount } from "@/components/ui/free-shipping-amount";
import { FIRST_ORDER_CODES } from "@/lib/settings-defaults";

/** Launch offer strip at the very top of the header. Collapses on scroll. */
export function LaunchBar({ hidden }: { hidden: boolean }) {
  return (
    <div
      className={
        "overflow-hidden transition-[max-height,opacity] duration-500 " +
        (hidden ? "max-h-0 opacity-0" : "max-h-10 opacity-100")
      }
      aria-hidden={hidden}
    >
      <p className="bg-gold/95 text-black text-center text-[10px] sm:text-[11px] tracking-[0.06em] sm:tracking-[0.18em] py-1.5 px-3 leading-snug whitespace-nowrap">
        <bdi dir="ltr" className="hidden sm:inline font-medium">WELCOME TO AURÉA</bdi>
        <span className="hidden sm:inline mx-2 opacity-50">◇</span>
        <bdi dir="ltr">10%</bdi>{" "}
        <span className="sm:hidden">להזמנה ראשונה:</span>
        <span className="hidden sm:inline">הנחה להזמנה הראשונה · קוד</span>{" "}
        <b className="sm:tracking-[0.25em]">{FIRST_ORDER_CODES[0]}</b>
        <span className="mx-1.5 sm:mx-2 opacity-50">◇</span>
        משלוח חינם מעל <FreeShippingAmount />
      </p>
    </div>
  );
}
