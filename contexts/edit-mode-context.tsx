"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface EditModeContextType {
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  categoriesReorderEnabled: boolean;
  setCategoriesReorderEnabled: (enabled: boolean) => void;
  subcategoriesReorderEnabled: boolean;
  setSubcategoriesReorderEnabled: (enabled: boolean) => void;
  bookmarksReorderEnabled: boolean;
  setBookmarksReorderEnabled: (enabled: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [categoriesReorderEnabled, setCategoriesReorderEnabled] = useState<boolean>(false);
  const [subcategoriesReorderEnabled, setSubcategoriesReorderEnabled] = useState<boolean>(false);
  const [bookmarksReorderEnabled, setBookmarksReorderEnabled] = useState<boolean>(false);

  return (
    <EditModeContext.Provider value={{
      editMode,
      setEditMode,
      categoriesReorderEnabled,
      setCategoriesReorderEnabled,
      subcategoriesReorderEnabled,
      setSubcategoriesReorderEnabled,
      bookmarksReorderEnabled,
      setBookmarksReorderEnabled
    }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return context;
}
