import "./App.css";
import * as React from "react";
import {
  loadingToast,
  LoadingToastCallbacks,
  createEmptyLoadingToastCallbacks,
} from "./utils/toasts";
import { toast } from "react-toastify";

function App(): React.ReactNode {
  // TODO: Toast notifications for start, stop, restart, and crash (if crash than have button to restart), all configurable

  const simulatorRef = React.useRef<HTMLIFrameElement>(null);
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
    loadingGameToastCallbacksRef.current = loadingToast(
      "Loading game...",
      "Game loaded!",
      "Failed to load game! Reload the page to try again.",
    );
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
            restartGameToastCallbacksRef.current = loadingToast(
              "Restarting game...",
              "Game restarted!",
              "Failed to restart game! Reload the page to try again.",
            );
            stopSim();
            startSim();
            restartGameToastCallbacksRef.current.success();
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
        // alert(
        //   "It looks like the game may have crashed! To restart the game, press the backspace key.",
        // );
        toast.error(
          "It looks like the game may have crashed! To restart the game, press the backspace key.",
          {
            autoClose: 10000,
          },
        );
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
      // TODO: Be able to have space at bottom of screen for this text, or have overlay in a corner (all configurable)
      const statsText =
        simulatorRef.current?.contentDocument?.getElementById(
          "debug-stats",
        )?.innerText;
      console.log(`Debug stats: ${statsText}`);
    }, 1000);

    return () => {
      clearInterval(checkStatsId);
    };
  }, []);

  return (
    <>
      <iframe
        ref={simulatorRef}
        allowFullScreen
        /* eslint-disable-next-line react-dom/no-unsafe-iframe-sandbox */
        sandbox="allow-popups allow-forms allow-scripts allow-same-origin"
      />
    </>
  );
}

export default App;
