import express from "express";
import { createServer } from "node:http";
import { createBareServer } from "@tomphttp/bare-server-node";
import { WispServer } from "@mercuryworkshop/wisp-js/server";

const app = express();
const bare = createBareServer("/bare/");
const wisp = new WispServer();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: Date.now() }));
app.get("/", (req, res) => res.json({ name: "Wisp + Bare Server", bare: "/bare/", wisp: "/wisp/", status: "running" }));

const server = createServer();
server.on("request", (req, res) => bare.shouldRoute(req) ? bare.routeRequest(req, res) : app(req, res));
server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) bare.routeUpgrade(req, socket, head);
  else if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
  else socket.end();
});

server.listen(process.env.PORT || 3000, () => console.log("Server running"));
