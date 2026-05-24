const http = require("http");

const port = Number(process.env.PORT || 3001);

const server = http.createServer((req, res) => {
  if (req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "ore-example-app" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ore example app\n");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`listening on ${port}`);
});
