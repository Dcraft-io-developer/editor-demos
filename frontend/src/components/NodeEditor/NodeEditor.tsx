// src/App.tsx
import { NodeEditor as FlumeNodeEditor, NodeMap } from "flume";
import React, { useRef, useState } from "react";
import { flumeConfig as config } from "./config";

interface INodeEditorProps {
  name: string;
  description?: string;
  nodes: NodeMap;
  setNodes: React.Dispatch<React.SetStateAction<NodeMap>>;
}

const EventNodeEditor: React.FC<INodeEditorProps> = ({
  nodes,
  setNodes,
  name,
  description,
}) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const connect = React.useCallback(() => {
    const tmpWs = new WebSocket("ws://localhost:3000/ws");
    tmpWs.onopen = function () {
      console.log("Connected");
      tmpWs.send(JSON.stringify({ type: "build", nodes }));
    };

    tmpWs.onmessage = function (e) {
      const data = JSON.parse(e.data);
      console.log(data);
      if (data.type === "code") {
        setCode(data.code);
        setError("");
      } else if (data.type === "error") {
        setError(data.message);
      }
    };

    tmpWs.onclose = function (e) {
      console.log(
        "Socket is closed. Reconnect will be attempted in 1 second.",
        e.reason
      );
      setTimeout(function () {
        connect();
      }, 1000);
    };

    ws.current = tmpWs;
  }, [nodes]);

  React.useEffect(() => {
    connect();
  }, [connect]);

  const onNodeChange = React.useCallback((nodes: NodeMap) => {
    // Do whatever you want with the nodes
    setNodes(nodes);
    try {
      if (!ws.current) {
        return;
      }
      if (ws.current.readyState !== ws.current.OPEN) {
        return;
      }
      ws.current?.send(JSON.stringify({ type: "build", nodes }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message);
    }
  }, [setNodes]);

  return (
    <div className="grid h-full grid-cols-3 gap-4">
      <div className="col-span-2">
        <FlumeNodeEditor
          portTypes={config.portTypes}
          nodeTypes={config.nodeTypes}
          nodes={nodes}
          onChange={onNodeChange}
        />
      </div>
      <div>
        {error && (
          <>
            <h1 className="text-2xl text-center text-red-500">Error</h1>
            <p>{error}</p>
          </>
        )}
        <h1 className="text-2xl text-center">Overview</h1>
        <p>Name: {name}</p>
        <p>Description: {description || "No description provided"}</p>
        <h1 className="text-2xl text-center">Output</h1>
        <code>{code}</code>
      </div>
    </div>
  );
};

export default EventNodeEditor;
