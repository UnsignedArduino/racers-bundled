import "./App.css";
import * as React from "react";

function App(): React.ReactNode {
  // TODO: Handle simulator crash (spam menu during first load to test this)

  const simulatorRef = React.useRef<HTMLIFrameElement>(null);
  const [code, setCode] = React.useState("");
  const [simState, setSimState] = React.useState<unknown>({});

  React.useEffect(() => {
    try {
      setSimState(JSON.parse(localStorage.getItem("simState") ?? "{}"));
    } catch (err: never) {
      console.warn(
        `Failed to load sim state, maybe first time run or simState is empty?\n${err}`,
      );
      setSimState({});
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("simState", JSON.stringify(simState));
  }, [simState]);

  React.useEffect(() => {
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

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    function onMessageHandler(event: MessageEvent) {
      const data: never = event.data;
      if (data.type == "ready") {
        console.log("Simulator is ready");
        startSim();
      } else if (data.type == "simulator") {
        switch (data.command) {
          case "restart": {
            console.log("Simulator requested restart");
            stopSim();
            startSim();
            break;
          }
          case "setstate": {
            if (data.stateValue === null) {
              setSimState({
                ...simState,
                [data.stateKey]: undefined,
              });
            } else {
              setSimState({
                ...simState,
                [data.stateKey]: data.stateValue,
              });
            }
            break;
          }
          default:
            break;
        }
      }
    }
    /* eslint-enable */

    window.addEventListener("message", onMessageHandler, false);
    return () => {
      window.removeEventListener("message", onMessageHandler, false);
    };
  }, [code, simState]);

  return (
    <>
      <head>
        <title>Racers! v1.3.2 by UnsignedArduino</title>
      </head>
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
