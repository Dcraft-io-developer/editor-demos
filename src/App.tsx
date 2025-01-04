// src/App.tsx
import { NodeEditor, NodeMap } from "flume";
import React, { useState } from "react";
import { flumeConfig as config } from "./config";
import { buildNodeToCode } from "./engine";

const App: React.FC = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const [nodes, setNodes] = React.useState<NodeMap>({});

  const onNodeChange = React.useCallback((nodes: NodeMap) => {
    // Do whatever you want with the nodes
    setNodes(nodes);
    try {
      setCode(buildNodeToCode(nodes));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  return (
    <div className="grid h-screen grid-cols-2 gap-4">
      <div>
        <NodeEditor
          portTypes={config.portTypes}
          nodeTypes={config.nodeTypes}
          nodes={nodes}
          onChange={onNodeChange}
        />
      </div>
      <div>
        <h1>Output</h1>
        <p>{error}</p>
        <code>{code}</code>
      </div>
    </div>
  );
};

export default App;
