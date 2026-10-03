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
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
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

const server = http.createServer(async (req, res) => {

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // OPTIONS
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }


  // GET TASKS
  if (req.method === "GET" && req.url === "/tasks") {

    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );

    send(res, 200, result.rows);
    return;
  }


  // ADD TASK
  if (req.method === "POST" && req.url === "/tasks") {

    const task = await coBody.json(req);

    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [task.title]
    );

    send(res, 201, result.rows[0]);
    return;
  }


  // UPDATE TASK
  if (req.method === "PUT" && req.url === "/tasks") {

    const task = await coBody.json(req);

    await pool.query(
      "UPDATE tasks SET completed = $1 WHERE id = $2",
      [task.completed, task.id]
    );

    send(res, 200, {
      message: "Task updated"
    });

    return;
  }


  // DELETE TASK
  if (req.method === "DELETE" && req.url === "/tasks") {

    const task = await coBody.json(req);

    await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [task.id]
    );

    send(res, 200, {
      message: "Task deleted"
    });

    return;
  }

  // NOT FOUND
  send(res, 404, {
    message: "Not found"
  });
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