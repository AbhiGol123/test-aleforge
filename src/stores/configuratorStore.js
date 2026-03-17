import { atom } from "nanostores";

const initialState = {
  gameData: null,
  selectedTier: "budget",
  hasBudget: true,
  selectedPeriod: "monthly",
  selectedLocation: null,
  players: 1,
  mods: 0,
  ram: 0,
  pricing: 0,
  addons: []
};

// ✅ Reuse same store across all islands
function createStore() {
  if (typeof window !== "undefined") {
    if (!window.__CONFIG_STORE__) {
      window.__CONFIG_STORE__ = atom(initialState);
    }
    return window.__CONFIG_STORE__;
  }

  // SSR fallback
  return atom(initialState);
}

export const configStore = createStore();

/* setters */
export const setGameData = (gameData) =>
  configStore.set({ ...configStore.get(), gameData });

export const setPlayers = (players) =>
  configStore.set({ ...configStore.get(), players });

export const setTier = (tier) =>
  configStore.set({ ...configStore.get(), selectedTier: tier });

export function setHasBudget(value) {
  configStore.set({
    ...configStore.get(),
    hasBudget: value,
  });
}

export const setLocation = (location) =>
  configStore.set({ ...configStore.get(), selectedLocation: location });

export const setMods = (mods) =>
  configStore.set({ ...configStore.get(), mods });

export const setPeriod = (period) =>
  configStore.set({ ...configStore.get(), selectedPeriod: period });

export const setPricing = ({ ram, pricing }) =>
  configStore.set({ ...configStore.get(), ram, pricing });
