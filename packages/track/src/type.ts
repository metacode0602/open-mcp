import { ScriptProps } from "next/script";

/**
 * @see {@link https://umami.is/docs/tracker-functions|Umami Docs}
 */
declare global {
  interface Window {
    umami?: {
      track(
        callback: (props: {
          hostname: string;
          language: string;
          referrer: string;
          screen: string;
          title: string;
          url: string;
          website: string;
        }) => { website: string;[key: string]: unknown }
      ): Promise<void>;
      track(eventName: string, data?: Record<string, unknown>): Promise<void>;
      identify(data?: Record<string, unknown>): Promise<void>;
    };
  }
}

export type ITrackProviderProps = {
  baidu?: IBaiduProviderProps;
  umami?: IUmamiProviderProps;
};

export type IBaiduProviderProps = ScriptProps & {
  /**
   * 百度统计ID
   * @default process.env.NEXT_PUBLIC_BAIDU_ID
   */
  baiduId?: string;
};

export type IUmamiProviderProps = {
  /**
   * 脚本的来源。默认为Umami托管的版本。
   * @default process.env.NEXT_PUBLIC_UMAMI_SRC
   */
  src?: string;
  /**
   * Website ID
   * @default process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
   */
  websiteId?: string;
  /**
   * 默认情况下，Umami将把数据发送到脚本所在的位置。您可以覆盖此功能以将数据发送到另一个位置。
   * @default process.env.NEXT_PUBLIC_UMAMI_HOST_URL ?? src的domain
   */
  hostUrl?: string;
  /**
   * 默认情况下，Umami会自动跟踪所有页面浏览量和事件。您可以禁用此行为，并使用跟踪器功能自己跟踪事件。
   * @default true
   */
  autoTrack?: boolean;
  /**
   * 如果您希望跟踪器只在特定的域上运行，您可以将它们添加到跟踪器脚本中。
   */
  domains?: string[];
} & ScriptProps;
