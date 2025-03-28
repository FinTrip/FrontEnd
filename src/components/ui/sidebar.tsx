"use client";

import { createContext, useContext, useState } from "react";

type SidebarState = "expanded" | "collapsed";

interface SidebarContextProps {
  state: SidebarState;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<SidebarState>("expanded");

  const toggleSidebar = () => {
    setState((prevState) =>
      prevState === "expanded" ? "collapsed" : "expanded"
    );
  };

  return (
    <SidebarContext.Provider value={{ state, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextProps => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
