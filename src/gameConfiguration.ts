import { Theme, ToastPosition } from "react-toastify";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace GameConfiguration {
  export namespace Toasts {
    export const TOAST_POSITION: ToastPosition = "bottom-right";
    export const TOAST_AUTO_CLOSE: false | number = 5000;
    export const TOAST_HIDE_PROGRESS_BAR = false;
    export const TOAST_NEWEST_ON_TOP = TOAST_POSITION.includes("bottom");
    export const TOAST_CLOSE_ON_CLICK = false;
    export const TOAST_PAUSE_ON_FOCUS_LOSS = true;
    export const TOAST_PAUSE_ON_HOVER = true;
    export const TOAST_THEME: Theme = "dark";

    export const ENABLE_LOADING_GAME_TOAST = true;
    export const ENABLE_RESTARTING_GAME_TOAST = true;

    export const ENABLE_POSSIBLE_GAME_CRASH_TOAST = true;
    export const POSSIBLE_GAME_CRASH_TOAST_AUTOCLOSE: false | number = 30000;
    export const POSSIBLE_GAME_CRASH_TOAST_CLOSE_ON_CLICK = false;
  }

  export namespace DebugStats {
    export const SHOW_STATS = true;
    export const STATS_LOCATION: ToastPosition = "bottom-left";
    export const STATS_FONT_SIZE = "12px";
    export const STATS_BACKGROUND_COLOR = "rgba(0, 0, 0, 0.5)";
    export const STATS_FOREGROUND_COLOR = "white";
    export const STATS_PADDING = "10px";
  }
}
