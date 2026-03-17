import { atom } from "nanostores";
import { configStore } from "./configuratorStore.js";

const initialPrice = {
  ram: 0,
  pricePerGb: 0,
  monthly: 0,
  quarterly: 0,
  semiAnnual: 0,
  annually: 0,
};

function createPriceStore() {
  if (typeof window !== "undefined") {
    if (!window.__PRICE_STORE__) {
      window.__PRICE_STORE__ = atom(initialPrice);
    }
    return window.__PRICE_STORE__;
  }

  return atom(initialPrice);
}

export const priceStore = createPriceStore();
/* -----------------------------
   Constants
----------------------------- */

// fixed tier pricing
const TIER_PRICE = {
  budget: 1,
  standard: 2,
  premium: 3,
};

// billing discounts
const BILLING_MULTIPLIER = {
  monthly: 1,
  quarterly: 0.9, // 10% off
  semi_annual: 0.85, // 15% off
  annually: 0.8, // 20% off
};

/* -----------------------------
   RAM Calculation
----------------------------- */

function calculateRam(config) {
  const game = config.gameData;
  if (!game?.serverConfig) return 0;

  const { ramPerPlayer = 0.1, ramPerMod = 0.05, minRam = 0 } = game.serverConfig;

  const players = Number(config.players || 0);
  const mods = Number(config.mods || 0);

  const raw = players * ramPerPlayer + mods * ramPerMod;
  return Math.max(minRam, Math.ceil(raw));
}

/* -----------------------------
   Main Recalculate Function
----------------------------- */

export function recalculatePrice() {
  const config = configStore.get();

  const tier = config.selectedTier || "budget";
  const pricePerGb = TIER_PRICE[tier] || 1;
  let ram;
  if (config.ram > 0) {
    ram = config.ram;
  } else {
    ram = calculateRam(config);
  }

  const baseMonthly = ram * pricePerGb;

  const monthly = baseMonthly;
  const quarterly = baseMonthly * BILLING_MULTIPLIER.quarterly;
  const semiAnnual = baseMonthly * BILLING_MULTIPLIER["semi_annual"];
  const annually = baseMonthly * BILLING_MULTIPLIER.annually;

  const payload = {
    ram,
    pricePerGb,
    monthly,
    quarterly,
    semiAnnual,
    annually,
  };

  console.log("[PriceStore] Recalculated:", payload);
  priceStore.set(payload);
}

/* -----------------------------
   Auto-recalculate on config change
----------------------------- */

configStore.subscribe(() => {
  recalculatePrice();
});
