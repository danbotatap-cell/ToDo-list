const API = "http://localhost:3002";

async function loadTasks() {
  const list = document.querySelector("[data-task-list]");

  if (!list) {
    return;
  }

  const response = await fetch(API + "/tasks");
  const tasks = await response.json();
  const view = document.querySelector("[data-view]")?.dataset.view || "all";
  const visibleTasks = tasks.filter((task) => {
    if (view === "completed") return task.completed;
    if (view === "active") return !task.completed;
    return true;
  });

  const activeStat = document.querySelector('[data-stat="active"]');
  const completedStat = document.querySelector('[data-stat="completed"]');
  const counter = document.querySelector("[data-counter]");

  if (activeStat) activeStat.textContent = tasks.filter((task) => !task.completed).length;
  if (completedStat) completedStat.textContent = tasks.filter((task) => task.completed).length;
  if (counter) counter.textContent = `${visibleTasks.length} tasks`;

  list.innerHTML = "";

  for (const task of visibleTasks) {

    const item = document.createElement("article");
    item.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", async function () {
      await fetch(API + "/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: task.id,
          completed: checkbox.checked
        })
      });

      loadTasks();
    });

    const title = document.createElement("p");
    title.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", async function () {
      await fetch(API + "/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: task.id
        })
      });

      loadTasks();
    });

    item.append(checkbox, title, deleteButton);
    list.append(item);
  }
}

const taskForm = document.querySelector("[data-task-form]");

if (taskForm) {
  taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const input = taskForm.elements.task;

    if (input.value === "") {
      return;
    }

    await fetch(API + "/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: input.value
      })
    });

    input.value = "";
    loadTasks();
  });
}

const clearButton = document.querySelector("[data-clear]");

if (clearButton) {
  clearButton.addEventListener("click", async function () {
    const response = await fetch(API + "/tasks");
    const tasks = await response.json();
    const tasksToDelete = tasks.filter((task) => {
      return clearButton.dataset.clear === "all" || task.completed;
    });

    for (const task of tasksToDelete) {
      await fetch(API + "/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: task.id })
      });
    }

    loadTasks();
  });
}

loadTasks();