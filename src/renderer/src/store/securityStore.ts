import { create } from 'zustand';

export type SecurityMode = 'lock' | 'unlock' | 'restrict' | null;

export interface SecurityRestrictions {
  print: 'none' | 'low' | 'full';
  modify: 'none' | 'annotate' | 'form' | 'assembly' | 'all';
  extract: 'y' | 'n';
}

interface SecurityState {
  file: File | null;
  mode: SecurityMode;
  userPassword?: string;
  ownerPassword?: string;
  restrictions: SecurityRestrictions;
  
  setFile: (file: File | null) => void;
  setMode: (mode: SecurityMode) => void;
  setUserPassword: (pw: string) => void;
  setOwnerPassword: (pw: string) => void;
  setRestrictions: (restrictions: Partial<SecurityRestrictions>) => void;
  reset: () => void;
}

const defaultRestrictions: SecurityRestrictions = {
  print: 'none',
  modify: 'none',
  extract: 'n',
};

export const useSecurityStore = create<SecurityState>((set) => ({
  file: null,
  mode: null,
  userPassword: '',
  ownerPassword: '',
  restrictions: defaultRestrictions,
  
  setFile: (file) => set({ file }),
  setMode: (mode) => set({ mode }),
  setUserPassword: (userPassword) => set({ userPassword }),
  setOwnerPassword: (ownerPassword) => set({ ownerPassword }),
  setRestrictions: (updates) => set((state) => ({ 
    restrictions: { ...state.restrictions, ...updates } 
  })),
  reset: () => set({ 
    file: null, 
    mode: null, 
    userPassword: '', 
    ownerPassword: '', 
    restrictions: defaultRestrictions 
  }),
}));
