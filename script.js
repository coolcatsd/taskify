// StudySpace: task list, browser storage, live clock, and focus timer.

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const formHint = document.getElementById("form-hint");

let tasks = loadTasks();
let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;

function loadTasks() {
  try {
    const saved = localStorage.getItem("studyspace-tasks");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("studyspace-tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as completed`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      renderTasks();
      formHint.textContent = "Task deleted.";
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const remaining = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("total-count").textContent = total;
  document.getElementById("completed-count").textContent = completed;
  document.getElementById("remaining-count").textContent = remaining;
  document.getElementById("task-pill").textContent = `${total} ${total === 1 ? "task" : "tasks"}`;
  document.getElementById("progress-percent").textContent = `${percentage}%`;
  document.getElementById("progress-fill").style.width = `${percentage}%`;
  emptyState.hidden = total > 0;

  if (total > 0 && remaining === 0) {
    formHint.textContent = "Everything is done — great work!";
  } else if (total > 0) {
    formHint.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left to tackle.`;
  } else {
    formHint.textContent = "Add a task to get started.";
  }
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();

  if (!text) {
    formHint.textContent = "Please type a task first.";
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
  document.getElementById("today-date").textContent = now.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).toUpperCase();

  const hour = now.getHours();
  let greeting = "Good evening!";
  if (hour < 12) greeting = "Good morning!";
  else if (hour < 18) greeting = "Good afternoon!";
  document.getElementById("greeting").innerHTML = `${greeting} <span>✦</span>`;
}

const timerDisplay = document.getElementById("timer-display");
const timerStart = document.getElementById("timer-start");
const timerReset = document.getElementById("timer-reset");
const timerStatus = document.getElementById("timer-status");

function displayTimer() {
  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, "0");
  const seconds = (timerSeconds % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  timerStart.textContent = "Start focus";
}

timerStart.addEventListener("click", () => {
  if (timerRunning) {
    stopTimer();
    timerStatus.textContent = "Paused. Take your time.";
    return;
  }

  if (timerSeconds <= 0) timerSeconds = 25 * 60;
  timerRunning = true;
  timerStart.textContent = "Pause";
  timerStatus.textContent = "You're doing great. Stay focused!";

  timerInterval = setInterval(() => {
    timerSeconds -= 1;
    displayTimer();

    if (timerSeconds <= 0) {
      stopTimer();
      timerStatus.textContent = "Session complete! Time for a little break.";
      timerStart.textContent = "Start again";
    }
  }, 1000);
});

timerReset.addEventListener("click", () => {
  stopTimer();
  timerSeconds = 25 * 60;
  displayTimer();
  timerStatus.textContent = "Timer reset. Ready when you are.";
});

renderTasks();
updateClock();
setInterval(updateClock, 1000);
