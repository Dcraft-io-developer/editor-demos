// src/App.tsx
import { NodeEditor, NodeMap } from "flume";
import React, { useState } from "react";
import { flumeConfig as config } from "./config";
import { buildNodeToCode } from "./engine";

const App: React.FC = () => {
  const [code, setCode] = useState("");

  const [nodes, setNodes] = React.useState<NodeMap>({});

  const onNodeChange = React.useCallback((nodes: NodeMap) => {
    // Do whatever you want with the nodes
    setNodes(nodes);
    setCode(buildNodeToCode(nodes));
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
      <code>{code}</code>
    </div>
  );
};

export default App;
