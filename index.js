import http from "node:http";
import { createBareServer } from "@tomphttp/bare-server-node";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const bare = createBareServer("/bare/");

const server = http.createServer((req, res) => {
  if (bare.shouldRoute(req)) return bare.routeRequest(req, res);

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok" }));
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bare + Wisp server running");
});

server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) return bare.routeUpgrade(req, socket, head);
  if (req.url?.startsWith("/wisp/")) return wisp.routeRequest(req, socket, head);
  socket.end();
});

server.listen(process.env.PORT || 3000);
