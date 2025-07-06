"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { IAppBreadcrumbItem } from "./type";

type State = {
  breadcrumbList: IAppBreadcrumbItem[];
  maxSize: number;
};

type Actions = {
  updateBreadcrumbList: (breadcrumbList: IAppBreadcrumbItem[]) => void;
  updateMaxSize: (maxSize: number) => void;
};

export const useAppBreadcrumbStore = create<State & Actions>()(
  immer((set) => ({
    breadcrumbList: [],
    maxSize: 3,
    updateBreadcrumbList: (breadcrumbList: IAppBreadcrumbItem[]) =>
      set((state) => {
        state.breadcrumbList = breadcrumbList;
      }),
    updateMaxSize: (maxSize: number) =>
      set((state) => {
        state.maxSize = maxSize;
      }),
  }))
);
