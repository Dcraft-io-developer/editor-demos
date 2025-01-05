import { Elysia, t } from "elysia";
import { buildNodeToCode } from "./engine";
import { JSONFilePreset } from 'lowdb/node'
import { NodeMap, NodeMapType } from "./types";
import cors from "@elysiajs/cors";

type Data = {
  events: Record<string, { id: string; name: string; description: string, nodes: NodeMap, code?: string }>;
  functions: Record<string, {
    id: string; name: string; description: string, nodes: NodeMap, code: string; parameter: string[]; returnType: string[];
  }>;
}

const defaultData: Data = {
  events: {},
  functions: {}
}
const db = await JSONFilePreset<Data>('db.json', defaultData)

const app = new Elysia().get("/", () => "Hello Elysia")
  .use(cors())
  .ws("/ws", {
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
  })
  .get("/events", (ctx) => {
    return {
      events: db.data.events
    };
  }).get("/event/:id", (ctx) => {
    const name = ctx.params.id;
    if (!db.data.events[name]) {
      ctx.set.status = 404
      return { error: true, message: "Event not found", status: 404 };
    }
    return {
      event: db.data.events[name]
    };
  }).post("/event", async (ctx) => {
    const { name, description } = ctx.body;
    const id = Math.random().toString(36).slice(2);
    db.data.events[id] = { id, name, description, nodes: {} };
    await db.write()
    return { id, event: db.data.events[id] };
  }, {
    body: t.Object({
      name: t.String(),
      description: t.String(),
    })
  }).put("/event/:id", async (ctx) => {
    const { name, description, nodes } = ctx.body;
    const id = ctx.params.id;
    const currentEvent = db.data.events[id]
    if (!currentEvent) {
      ctx.set.status = 404
      return { error: true, message: "Event not found", status: 404 };
    } else {
      try {
        const code = nodes ? buildNodeToCode(nodes) : currentEvent.code;
        db.data.events[id] = { id, name: name || currentEvent.name, description: description || currentEvent.description, nodes: nodes || currentEvent.nodes, code };
        await db.write()
        return { id, db: db.data.events[id] };
      } catch (error) {
        ctx.set.status = 500
        return {
          error: true, message: (error as Error).message, status: 500
        };
      }
    }
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
      nodes: t.Optional(NodeMapType),
    })
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
