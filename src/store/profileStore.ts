import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileStore {
  id: string | null;
  gender: string;
  preferredPosition: string;
  height: number;
  weight: number;
  imageUUID: string;
  setProfile: (profile: Omit<ProfileStore, "setProfile">) => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  id: null,
  gender: "",
  preferredPosition: "",
  height: 0,
  weight: 0,
  imageUUID: "",
  setProfile: (profile) => set(profile),
  resetProfile: () =>
    set({ id: null, gender: "", preferredPosition: "", height: 0, weight: 0 }),
}));
