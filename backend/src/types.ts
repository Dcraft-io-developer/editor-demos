import { t } from 'elysia'
export declare type ControlData = {
  [controlName: string]: any;
};
export const ControlDataType = t.Record(t.String(), t.Any())
export declare type InputData = {
  [portName: string]: ControlData;
};
export const InputDataType = t.Record(t.String(), ControlDataType)
export declare type Connection = {
  nodeId: string;
  portName: string;
};
export const ConnectionType = t.Object({ nodeId: t.String(), portName: t.String() })
export declare type ConnectionMap = {
  [portName: string]: Connection[];
};
export const ConnectionMapType = t.Record(t.String(), t.Array(ConnectionType))
export declare type Connections = {
  inputs: ConnectionMap;
  outputs: ConnectionMap;
};
export const ConnectionsType = t.Object({ inputs: ConnectionMapType, outputs: ConnectionMapType })

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
export const FlumeNodeType = t.Object({
  id: t.String(),
  type: t.String(),
  width: t.Number(),
  x: t.Number(),
  y: t.Number(),
  inputData: InputDataType,
  connections: ConnectionsType,
  defaultNode: t.Optional(t.Boolean()),
  root: t.Optional(t.Boolean()),
})
export declare type NodeMap = {
  [nodeId: string]: FlumeNode;
};
export const NodeMapType = t.Record(t.String(), FlumeNodeType)
