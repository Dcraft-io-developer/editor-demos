export declare type ControlData = {
  [controlName: string]: any;
};
export declare type InputData = {
  [portName: string]: ControlData;
};
export declare type Connections = {
  inputs: ConnectionMap;
  outputs: ConnectionMap;
};
export declare type ConnectionMap = {
  [portName: string]: Connection[];
};
export declare type Connection = {
  nodeId: string;
  portName: string;
};
export declare type FlumeNode = {
  id: string;
  type: string;
  width: number;
  x: number;
  y: number;
  inputData: InputData;
  connections: Connections;
  defaultNode?: boolean;
  root?: boolean;
};
export declare type NodeMap = {
  [nodeId: string]: FlumeNode;
};