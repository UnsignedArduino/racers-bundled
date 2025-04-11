import { ToastPosition } from "react-toastify";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GameConfiguration {
  export const ENABLE_LOADING_GAME_TOAST = true;
  export const ENABLE_RESTARTING_GAME_TOAST = true;
  export const ENABLE_POSSIBLE_GAME_CRASH_TOAST = true;
  export const POSSIBLE_GAME_CRASH_TOAST_AUTOCLOSE: false | number = 30000;
  export const POSSIBLE_GAME_CRASH_TOAST_CLOSE_ON_CLICK = false;
  export const TOAST_POSITION: ToastPosition = "bottom-right";

  export const SHOW_STATS = true;
  export const SHOW_STATS_LOCATION: ToastPosition = "bottom-left";
}
