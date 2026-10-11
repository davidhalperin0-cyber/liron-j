"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type StoreSettings } from "./settings-defaults";

// Single client-side source for shipping rates. The server (checkout API)
// reads the same store_settings row, so what's shown is what gets charged.
// One fetch per page load, shared by every component that asks.

type Rates = StoreSettings["shipping"];

let cached: Rates | null = null;
let inflight: Promise<Rates> | null = null;

function load(): Promise<Rates> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        cached = d?.shipping ?? DEFAULT_SETTINGS.shipping;
        return cached!;
      })
      .catch(() => DEFAULT_SETTINGS.shipping);
  }
  return inflight;
}

export function useShippingRates(): Rates {
  const [rates, setRates] = useState<Rates>(cached ?? DEFAULT_SETTINGS.shipping);
  useEffect(() => {
    let alive = true;
    load().then((r) => alive && setRates(r));
    return () => {
      alive = false;
    };
  }, []);
  return rates;
}
