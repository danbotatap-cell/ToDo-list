import http from "http";
import pg from "pg";

const PORT = 3000;
const { Pool } = pg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "todo_db",
    password: "",
    port: 5432
});
pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.log("Database error:", err);
    } else {
        console.log("Database connected!");
    }
});

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