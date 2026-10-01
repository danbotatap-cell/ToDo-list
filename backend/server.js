import http from "http";
import pg from "pg";
import coBody from "co-body";

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

const server = http.createServer(async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");



    if (req.method === "OPTIONS") {
        res.statusCode = 200;
        res.end();
        return;
    }



    if (req.method === "GET" && req.url === "/") {
        res.end(JSON.stringify({
            message: "Todo backend is working"
        }));
        return;
    }



    if (req.method === "GET" && req.url === "/tasks") {
        const result = await pool.query(
            "SELECT * FROM tasks"
        );

        res.end(JSON.stringify(result.rows));
        return;
    }



    if (req.method === "POST" && req.url === "/tasks") {
        const newTask = await coBody.json(req);

        await pool.query(
            "INSERT INTO tasks (title) VALUES ($1)",
            [newTask.title]
        );

        res.end(JSON.stringify({
            message: "Task added"
        }));
        return;
    }



    if (req.method === "PUT" && req.url === "/tasks") {
        const task = await coBody.json(req);

        await pool.query(
            "UPDATE tasks SET completed = $1 WHERE id = $2",
            [task.completed, task.id]
        );

        res.end(JSON.stringify({
            message: "Task updated"
        }));
        return;
    }



    if (req.method === "DELETE" && req.url === "/tasks") {
        const task = await coBody.json(req);

        await pool.query(
            "DELETE FROM tasks WHERE id = $1",
            [task.id]
        );

        res.end(JSON.stringify({
            message: "Task deleted"
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