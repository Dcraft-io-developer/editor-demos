import { Elysia } from "elysia";
import { buildNodeToCode } from "./engine";

const app = new Elysia().get("/", () => "Hello Elysia").ws("/ws", {
  open: (ws) => {
    ws.send("Hello WebSocket");
  },
  message: (ws, message: any) => {
    if (message.type === "build") {
      try {
        const { nodes } = message;
        const code = buildNodeToCode(nodes);
        ws.send(JSON.stringify({ type: "code", code }));
      } catch (e: any) {
        ws.send(JSON.stringify({ type: "error", message: e.message }));
      }
    }
  }
}).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
