const storageKey = "todo-list-tasks";
const accountKey = "todo-list-account";
const sessionKey = "todo-list-session";

function getAccount() {
  try {
    return JSON.parse(localStorage.getItem(accountKey));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return localStorage.getItem(sessionKey) === "true";
}

function getTasks() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function taskWord(count) {
  if (count % 10 === 1 && count % 100 !== 11) return "задача";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "задачи";
  return "задач";
}

function createTaskItem(task) {
  const item = document.createElement("article");
  item.className = `task-item${task.completed ? " is-completed" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", "Отметить задачу выполненной");
  checkbox.addEventListener("change", () => {
    const tasks = getTasks().map((currentTask) =>
      currentTask.id === task.id ? { ...currentTask, completed: checkbox.checked } : currentTask,
    );
    saveTasks(tasks);
    render();
  });

  const title = document.createElement("p");
  title.textContent = task.title;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.textContent = "Удалить";
  deleteButton.addEventListener("click", () => {
    saveTasks(getTasks().filter((currentTask) => currentTask.id !== task.id));
    render();
  });

  item.append(checkbox, title, deleteButton);
  return item;
}

function render() {
  const tasks = getTasks();
  const view = document.querySelector("[data-view]")?.dataset.view || "all";
  const visibleTasks = tasks.filter((task) => {
    if (view === "active") return !task.completed;
    if (view === "completed") return task.completed;
    return true;
  });

  document.querySelectorAll("[data-counter]").forEach((counter) => {
    counter.textContent = `${visibleTasks.length} ${taskWord(visibleTasks.length)}`;
  });

  document.querySelectorAll('[data-stat="active"]').forEach((stat) => {
    stat.textContent = tasks.filter((task) => !task.completed).length;
  });
  document.querySelectorAll('[data-stat="completed"]').forEach((stat) => {
    stat.textContent = tasks.filter((task) => task.completed).length;
  });

  document.querySelectorAll("[data-task-list]").forEach((list) => {
    list.replaceChildren();
    if (!visibleTasks.length) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "list-placeholder";
      emptyMessage.textContent = view === "completed" ? "Выполненных задач пока нет." : "Список пока пуст.";
      list.append(emptyMessage);
      return;
    }
    visibleTasks.forEach((task) => list.append(createTaskItem(task)));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const registerPage = document.querySelector("[data-register-page]");
  const loginPage = document.querySelector("[data-login-page]");
  const account = getAccount();

  if (registerPage && isLoggedIn() && account) {
    alert("Вы уже вошли в аккаунт.");
    window.location.href = "index.html";
    return;
  }

  if (registerPage && !isLoggedIn() && account) {
    window.location.href = "login.html";
    return;
  }

  if (loginPage && !account) {
    window.location.href = "profile.html";
    return;
  }

  const registerForm = document.querySelector("[data-register-form]");
  registerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const newAccount = {
      name: formData.get("name").trim(),
      email: formData.get("email").trim().toLowerCase(),
      password: formData.get("password"),
    };
    localStorage.setItem(accountKey, JSON.stringify(newAccount));
    localStorage.setItem(sessionKey, "true");
    alert("Регистрация прошла успешно.");
    window.location.href = "index.html";
  });

  const loginForm = document.querySelector("[data-login-form]");
  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");
    const message = loginPage.querySelector("[data-form-message]");
    if (account.email !== email || account.password !== password) {
      message.textContent = "Неверный email или пароль.";
      return;
    }
    localStorage.setItem(sessionKey, "true");
    alert("Вы успешно вошли в аккаунт.");
    window.location.href = "index.html";
  });

  document.querySelector("[data-logout]")?.addEventListener("click", () => {
    localStorage.removeItem(sessionKey);
    alert("Вы вышли из аккаунта.");
    window.location.href = "login.html";
  });

  const form = document.querySelector("[data-task-form]");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.elements.task;
    const title = input.value.trim();
    if (!title) return;
    const tasks = getTasks();
    tasks.unshift({ id: crypto.randomUUID(), title, completed: false });
    saveTasks(tasks);
    form.reset();
    input.focus();
    render();
  });

  document.querySelectorAll("[data-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.clear;
      const message = type === "all" ? "Удалить все задачи?" : "Удалить все выполненные задачи?";
      if (!confirm(message)) return;
      const remainingTasks = type === "all" ? [] : getTasks().filter((task) => !task.completed);
      saveTasks(remainingTasks);
      render();
    });
  });

  render();
});
