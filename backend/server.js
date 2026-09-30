import http from "http";

const PORT = 3000;

const server = http.createServer((req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET" && req.url === "/") {
        res.end(JSON.stringify({
            message: "Todo backend is working"
        }));
        return;
    }

    res.statusCode = 404;

    res.end(JSON.stringify({
        message: "Not found"
    }));
});

server.listen(PORT, () => {
    console.log("Server started on port 3000");
});