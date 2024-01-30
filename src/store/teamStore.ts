import { create } from "zustand";

interface TeamStore {
  teamId?: number;
  name?: string;
  imageUUID?: string;
  chatId?: number;
  setTeamInfo: (
    teamId: number,
    name: string,
    imageUUID: string,
    chatId: number
  ) => void;
  setTeamId: (teamId: number) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teamId: undefined,
  name: "",
  imageUUID: "",
  chatId: undefined,
  setTeamInfo: (
    teamId: number,
    name: string,
    imageUUID: string,
    chatId: number
  ) =>
    set({
      teamId,
      name,
      imageUUID,
      chatId,
    }),

  setTeamId: (teamId: number) =>
    set({
      teamId,
    }),
}));
