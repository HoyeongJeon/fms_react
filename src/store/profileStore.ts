import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileStore {
  id: string | null;
  gender: string;
  preferredPosition: string;
  height: number;
  weight: number;
  imageUUID: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    dong: string;
    district: string;
    address: string;
  };
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
  location: {
    latitude: 0,
    longitude: 0,
    //state: "",
    city: "",
    dong: "",
    district: "",
    address: "",
  },
  setProfile: (profile) => set(profile),
  resetProfile: () =>
    set({ id: null, gender: "", preferredPosition: "", height: 0, weight: 0 }),
}));
