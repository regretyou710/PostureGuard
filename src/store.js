import { create } from 'zustand';

export const usePetStore = create((set) => ({
  postureState: 'HAPPY', // 狀態包含: 'HAPPY' (開心), 'WARNING' (警告), 'SICK' (生病)
  currentAngle: 90,
  setPostureState: (state) => set({ postureState: state }),
  setCurrentAngle: (angle) => set({ currentAngle: angle }),
}));