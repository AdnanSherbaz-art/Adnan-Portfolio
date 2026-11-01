// Expense Tracker: add, delete, filter and save entries in the browser.

const form = document.getElementById("form");
const textInput = document.getElementById("text");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const list = document.getElementById("list");
const emptyMsg = document.getElementById("empty");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const filterButtons = document.querySelectorAll(".filter");
const clearBtn = document.getElementById("clear");

let entries = loadEntries();
let currentFilter = "all";

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem("entries")) || [];
  } catch (e) {
    return [];
  }
}

function saveEntries() {
  try {
    localStorage.setItem("entries", JSON.stringify(entries));
  } catch (e) {
    // Saving can fail in private mode; the app still works for this session.
  }
}

function money(n) {
  return "Rs " + n.toLocaleString("en-PK");
}

function render() {
  const visible = entries.filter(e => currentFilter === "all" || e.type === currentFilter);

  list.innerHTML = "";
  visible.forEach(entry => {
    const li = document.createElement("li");
    li.className = entry.type;

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = entry.text; // textContent keeps user input safe

    const amt = document.createElement("span");
    amt.className = "amt";
    amt.textContent = (entry.type === "income" ? "+" : "-") + money(entry.amount);

    const del = document.createElement("button");
    del.className = "del";
    del.setAttribute("aria-label", "Delete entry");
    del.textContent = "×";
    del.addEventListener("click", () => removeEntry(entry.id));

    li.append(name, amt, del);
    list.appendChild(li);
  });

  emptyMsg.hidden = visible.length > 0;

  const income = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  incomeEl.textContent = money(income);
  expenseEl.textContent = money(expense);
  balanceEl.textContent = (income - expense < 0 ? "-" : "") + money(Math.abs(income - expense));
}

function addEntry(e) {
  e.preventDefault();
  const text = textInput.value.trim();
  const amount = Math.abs(parseInt(amountInput.value, 10));
  if (!text || !amount) return;

  entries.unshift({ id: Date.now(), text, amount, type: typeInput.value });
  saveEntries();
  form.reset();
  textInput.focus();
  render();
}

function removeEntry(id) {
  entries = entries.filter(e => e.id !== id);
  saveEntries();
  render();
}

form.addEventListener("submit", addEntry);

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
});

clearBtn.addEventListener("click", () => {
  if (entries.length && confirm("Delete all entries?")) {
    entries = [];
    saveEntries();
    render();
  }
});

render();
