import { UmamiProvider } from "./src/umami-provider";
import { useUmami } from "./src/use-umami";
import { BaiduProvider } from "./src/baidu-provider";
import { TrackAllProvider } from "./src/track-all-provider";

export type {
  ITrackProviderProps,
  IBaiduProviderProps,
  IUmamiProviderProps,
} from "./src/type";
export default { useUmami, UmamiProvider, BaiduProvider, TrackAllProvider };
export { useUmami, UmamiProvider, BaiduProvider, TrackAllProvider };
