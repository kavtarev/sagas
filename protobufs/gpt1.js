const http = require("http");
const protobuf = require("protobufjs");

(async () => {
  const root = await protobuf.load("example.proto");
  const NameRequest = root.lookupType("NameRequest");
  const UserResponse = root.lookupType("UserResponse");

  const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/process-name") {
      let body = [];

      req.on("data", (chunk) => {
        body.push(chunk);
      });

      req.on("end", () => {
        try {
          const buffer = Buffer.concat(body);

          // Десериализация данных
          const nameRequest = NameRequest.decode(buffer);
          console.log("Received name:", nameRequest.name);

          // Формируем ответ
          const userPayload = {
            name: nameRequest.name,
            age: 25,
            interests: ["coding", "reading", "gaming"]
          };

          // Сериализация ответа
          const responseBuffer = UserResponse.encode(userPayload).finish();

          res.writeHead(200, { "Content-Type": "application/octet-stream" });
          res.end(responseBuffer);
        } catch (error) {
          console.error("Error processing request:", error);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  server.listen(4000, () => {
    console.log("Backend server is running on port 4000");
  });
})();
