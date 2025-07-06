"use client";

import { useCallback } from "react";
export const useUmami = () => {
  const onEnevt = useCallback((event: string, data: any) => {
    if (!window.umami) {
      console.error("umami is not found");
      return;
    }
    window.umami.track(event, data);
  }, []);

  const onVisitorProfile = useCallback((data: any) => {
    if (!window.umami) {
      console.error("umami is not found");
      return;
    }
    window.umami.identify(data);
  }, []);

  return {
    onEnevt,
    onVisitorProfile,
  };
};
