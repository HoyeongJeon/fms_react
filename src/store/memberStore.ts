import { create } from "zustand";

// 사용자 정보에 대한 인터페이스를 정의합니다.
interface MemberStore {
  isStaff: boolean;
  id: number | null;
  // 사용자 정보를 설정하는 함수들입니다.
  setMember: (user: Omit<MemberStore, "setMember">) => void;
  setMemberId: (id: number | null) => void;
  clearMember: () => void; // 사용자 정보를 초기화합니다.
}

// useUserStore 훅을 생성합니다. 이 훅을 사용하여 상태를 읽고 업데이트할 수 있습니다.
export const useMemberStore = create<MemberStore>((set) => ({
  isStaff: false,
  id: null,
  // 사용자 정보를 설정하는 함수입니다.
  setMember: (member) => set(member),
  setMemberId: (id) => set({ id }),
  // 모든 사용자 정보를 초기화하는 함수입니다.
  clearMember: () =>
    set({
      isStaff: false,
    }),
}));
