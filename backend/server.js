import http from "http";
import coBody from "co-body";
import pg from "pg";

const PORT = 3002;

const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'myapp',
  password: 'asko228228',
  port: 5432
});

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify(data));
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);
}

const routes = {
  "GET /tasks": async () => {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    return [200, result.rows];
  },
  "POST /tasks": async (req) => {
    const task = await coBody.json(req);
    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [task.title]
    );
    return [201, result.rows[0]];
  },
  "PUT /tasks": async (req) => {
    const task = await coBody.json(req);
    await pool.query(
      "UPDATE tasks SET completed = $1 WHERE id = $2",
      [task.completed, task.id]
    );
    return [200, { message: "Task updated" }];
  },
  "DELETE /tasks": async (req) => {
    const task = await coBody.json(req);
    await pool.query("DELETE FROM tasks WHERE id = $1", [task.id]);
    return [200, { message: "Task deleted" }];
  }
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const handler = routes[`${req.method} ${req.url}`];
  if (!handler) return send(res, 404, { message: "Not found" });

  const [status, data] = await handler(req);
  send(res, status, data);
});


initializeDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log('Server is running on port:', PORT);
    });
  })
  .catch((error) => {
    console.error("Could not initialize PostgreSQL database:", error.message);
    pool.end();
    process.exitCode = 1;
  });