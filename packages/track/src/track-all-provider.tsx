import { BaiduProvider } from "./baidu-provider";
import { ITrackProviderProps } from "./type.js";
import { UmamiProvider } from "./umami-provider";
import React from "react";

export const TrackAllProvider = (props: ITrackProviderProps) => {
  return (
    <>
      <BaiduProvider {...props.baidu} />
      <UmamiProvider {...props.umami} />
    </>
  );
};
