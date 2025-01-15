const http = require("http");
const protobuf = require("protobufjs");
const { request } = require("http");

(async () => {
  const root = await protobuf.load("example.proto");
  const NameRequest = root.lookupType("NameRequest");
  const UserResponse = root.lookupType("UserResponse");

  const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/send-name") {
      let body = [];

      req.on("data", (chunk) => {
        body.push(chunk);
      });

      req.on("end", async () => {
        try {
          const jsonData = JSON.parse(Buffer.concat(body).toString());
          const { name } = jsonData;

          // Сериализация имени
          const requestBuffer = NameRequest.encode({ name }).finish();

          // Отправка на Backend сервер
          const backendOptions = {
            hostname: "localhost",
            port: 4000,
            path: "/process-name",
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              "Content-Length": requestBuffer.length
            }
          };

          const backendReq = request(backendOptions, (backendRes) => {
            let backendData = [];

            backendRes.on("data", (chunk) => {
              backendData.push(chunk);
            });

            backendRes.on("end", () => {
              try {
                const buffer = Buffer.concat(backendData);

                // Десериализация ответа
                const userResponse = UserResponse.decode(buffer);
                console.log("Response from backend:", userResponse);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(userResponse));
              } catch (error) {
                console.error("Error decoding response:", error);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
              }
            });
          });

          backendReq.on("error", (error) => {
            console.error("Error connecting to backend:", error);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
          });

          backendReq.write(requestBuffer);
          backendReq.end();
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

  server.listen(3000, () => {
    console.log("Frontend server is running on port 3000");
  });
})();
