import "./App.css";
import * as React from "react";
import {
  createEmptyLoadingToastCallbacks,
  loadingToast,
  LoadingToastCallbacks,
} from "./utils/toasts";
import { toast } from "react-toastify";
import { GameConfiguration } from "./gameConfiguration.ts";
import { positionFixedElement } from "./utils/position.ts";

function App(): React.ReactNode {
  // TODO: Show message when no keyboard focus

  const simulatorRef = React.useRef<HTMLIFrameElement>(null);
  const statsRef = React.useRef<HTMLDivElement>(null);
  const [code, setCode] = React.useState("");
  const [simState, setSimState] = React.useState<unknown>({});

  const loadingGameToastCallbacksRef = React.useRef<LoadingToastCallbacks>(
    createEmptyLoadingToastCallbacks(),
  );
  const restartGameToastCallbacksRef = React.useRef<LoadingToastCallbacks>(
    createEmptyLoadingToastCallbacks(),
  );

  React.useEffect(() => {
    try {
      setSimState(JSON.parse(localStorage.getItem("simState") ?? "{}"));
    } catch (err) {
      console.warn(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Failed to load sim state, maybe first time run or simState is empty?\n${err}`,
      );
      setSimState({});
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("simState", JSON.stringify(simState));
  }, [simState]);

  React.useEffect(() => {
    loadingGameToastCallbacksRef.current = GameConfiguration.Toasts
      .ENABLE_LOADING_GAME_TOAST
      ? loadingToast(
          "Loading game...",
          "Game loaded!",
          "Failed to load game! Reload the page to try again.",
        )
      : createEmptyLoadingToastCallbacks();
    fetch("binary.js")
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          console.error(`Failed to load binary.js: ${res.statusText}`);
        }
      })
      .then((text) => {
        if (text) {
          console.log(
            `Loaded ${Math.round(text.length / 1024)} kb of binary.js`,
          );
          setCode(text);
          if (simulatorRef.current) {
            simulatorRef.current.src =
              "---simulator.html?hideSimButtons=1&noExtraPadding=1&fullscreen=1&autofocus=1&nofooter=1";
          } else {
            console.error("Simulator iframe ref is null");
          }
        } else {
          throw new Error("Failed to load binary.js: text is empty/undefined");
        }
      })
      .catch((err: unknown) => {
        console.error(err);
        loadingGameToastCallbacksRef.current.error();
      });
  }, []);

  React.useEffect(() => {
    function startSim() {
      console.log("Starting simulator");
      simulatorRef.current?.contentWindow?.postMessage({
        type: "run",
        parts: [],
        code,
        partDefinitions: [],
        // cdnUrl: "https://cdn.makecode.com",
        // version: "",
        storedState: simState,
        frameCounter: 1,
        options: {
          theme: "green",
          player: "",
        },
        id: `green-${Math.random()}`,
      });
    }

    function stopSim() {
      console.log("Stopping simulator");
      simulatorRef.current?.contentWindow?.postMessage({ type: "stop" });
    }

    /* eslint-disable */
    function onMessageHandler(event: MessageEvent) {
      const data: any = event.data;
      // if (data.type !== "messagepacket") {
      //   alert(JSON.stringify(data));
      // }
      // console.log(data);
      if (data.type == "ready") {
        console.log("Simulator is ready");
        startSim();
        loadingGameToastCallbacksRef.current.success();
      } else if (data.type == "simulator") {
        switch (data.command) {
          case "restart": {
            console.log("Simulator requested restart");
            restartGameToastCallbacksRef.current = GameConfiguration.Toasts
              .ENABLE_RESTARTING_GAME_TOAST
              ? loadingToast(
                  "Restarting game...",
                  "Game restarted!",
                  "Failed to restart game! Reload the page to try again.",
                )
              : createEmptyLoadingToastCallbacks();
            stopSim();
            setTimeout(() => {
              startSim();
              restartGameToastCallbacksRef.current.success();
            }, 500);
            break;
          }
          case "setstate": {
            if (data.stateValue === null) {
              setSimState({
                // @ts-ignore
                ...simState,
                [data.stateKey]: undefined,
              });
            } else {
              setSimState({
                // @ts-ignore
                ...simState,
                [data.stateKey]: data.stateValue,
              });
            }
            break;
          }
          default:
            break;
        }
      } else if (data.type == "debugger" && data.subtype == "breakpoint") {
        // Error most likely
        console.error("Simulator may have crashed!");
        console.error(data);
        if (GameConfiguration.Toasts.ENABLE_POSSIBLE_GAME_CRASH_TOAST) {
          toast.error(
            "It looks like the game may have crashed! To restart the game, press the backspace key.",
            {
              autoClose:
                GameConfiguration.Toasts.POSSIBLE_GAME_CRASH_TOAST_AUTOCLOSE,
              closeOnClick:
                GameConfiguration.Toasts
                  .POSSIBLE_GAME_CRASH_TOAST_CLOSE_ON_CLICK,
            },
          );
        }
      }
    }
    /* eslint-enable */

    window.addEventListener("message", onMessageHandler, false);
    return () => {
      window.removeEventListener("message", onMessageHandler, false);
    };
  }, [code, simState]);

  React.useEffect(() => {
    const checkStatsId = setInterval(() => {
      const statsText =
        simulatorRef.current?.contentDocument?.getElementById(
          "debug-stats",
        )?.innerText;
      if (statsRef.current) {
        positionFixedElement(
          statsRef.current,
          GameConfiguration.DebugStats.STATS_LOCATION,
        );
        statsRef.current.innerText = statsText ?? "";
      }
    }, 100);

    return () => {
      clearInterval(checkStatsId);
    };
  }, []);

  return (
    <div>
      <iframe
        ref={simulatorRef}
        allowFullScreen
        /* eslint-disable-next-line react-dom/no-unsafe-iframe-sandbox */
        sandbox="allow-popups allow-forms allow-scripts allow-same-origin"
      />
      <div
        ref={statsRef}
        style={{
          fontFamily: "monospace",
          fontSize: GameConfiguration.DebugStats.STATS_FONT_SIZE,
          position: "fixed",
          background: GameConfiguration.DebugStats.STATS_BACKGROUND_COLOR,
          color: GameConfiguration.DebugStats.STATS_FOREGROUND_COLOR,
          padding: GameConfiguration.DebugStats.STATS_PADDING,
          zIndex: 1000,
        }}
        hidden={!GameConfiguration.DebugStats.SHOW_STATS}
      />
    </div>
  );
}

export default App;
