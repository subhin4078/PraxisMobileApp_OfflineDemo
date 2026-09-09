import React, { createContext, useContext, useState } from "react";

type PickerContextType = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

const PickerContext = createContext<PickerContextType | null>(null);

export const PickerProvider = ({ children }: { children: React.ReactNode }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <PickerContext.Provider value={{ openId, setOpenId }}>
      {children}
    </PickerContext.Provider>
  );
};

export const usePicker = () => {
  const ctx = useContext(PickerContext);
  if (ctx) return ctx;
  // fallback no-op so components can be used without a provider
  return { openId: null, setOpenId: () => {} } as PickerContextType;
};

export default PickerContext;
