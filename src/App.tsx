import React from "react";
import { NodeEditor, NodeMap } from "flume";
import { flumeConfig } from "./config";
import { buildNodeToCode } from "./engine";

export default function App() {
  const [nodes, setNodes] = React.useState<NodeMap>({});

  console.log(buildNodeToCode(nodes));
  React.useCallback((nodes: NodeMap) => {
    // Do whatever you want with the nodes
    setNodes(nodes);
  }, []);
  return (
    <div style={{ width: 1080, height: 680 }}>
      <NodeEditor
        nodeTypes={flumeConfig.nodeTypes}
        portTypes={flumeConfig.portTypes}
        nodes={nodes}
        onChange={setNodes}
      />
    </div>
  );
}
