"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { BookmarkCollection } from "@/types/bookmark/collection";

interface CollectionContextType {
  currentCollection: BookmarkCollection | null;
  setCurrentCollection: (collection: BookmarkCollection | null) => void;
  selectedCategoryUuid: string | undefined;
  setSelectedCategoryUuid: (uuid: string | undefined) => void;
  selectedSubcategoryUuid: string | undefined;
  setSelectedSubcategoryUuid: (uuid: string | undefined) => void;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [currentCollection, setCurrentCollection] = useState<BookmarkCollection | null>(null);
  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState<string | undefined>(undefined);
  const [selectedSubcategoryUuid, setSelectedSubcategoryUuid] = useState<string | undefined>(undefined);

  return (
    <CollectionContext.Provider value={{
      currentCollection,
      setCurrentCollection,
      selectedCategoryUuid,
      setSelectedCategoryUuid,
      selectedSubcategoryUuid,
      setSelectedSubcategoryUuid
    }}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error("useCollection must be used within a CollectionProvider");
  }
  return context;
}
