import Script from "next/script";
import { IBaiduProviderProps } from "./type.js";
import React from "react";
const isDev = process.env.NODE_ENV === "development";
const BAIDU_ID = process?.env?.NEXT_PUBLIC_BAIDU_ID;

/**
 * 百度统计脚本
 */
export const BaiduProvider = ({
  baiduId = BAIDU_ID,
  ...props
}: IBaiduProviderProps) => {
  if (!baiduId) {
    isDev && console.warn("track.baidu.id is not found");
    return null;
  }
  return <Script src={`https://hm.baidu.com/hm.js?${baiduId}`} {...props} />;
};
