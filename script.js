// State Variable
let count = 0;

// DOM Element References
const counterDisplay = document.getElementById("counter-value");
const incrementBtn = document.getElementById("increment-btn");
const decrementBtn = document.getElementById("decrement-btn");
const resetBtn = document.getElementById("reset-btn");

const itemInput = document.getElementById("item-input");
const addBtn = document.getElementById("add-btn");
const itemList = document.getElementById("item-list");

// Update Display Function
function updateCounter() {
  counterDisplay.textContent = count;
}

// Event Listeners for Counter
incrementBtn.addEventListener("click", () => {
  count++;
  updateCounter();
});

decrementBtn.addEventListener("click", () => {
  if (count > 0) {
    count--;
    updateCounter();
  }
});

resetBtn.addEventListener("click", () => {
  count = 0;
  updateCounter();
});

// Add Item Function
function addItem() {
  const text = itemInput.value.trim();
  if (text === "") return;

  const li = document.createElement("li");
  li.innerHTML = `
    <span>${text}</span>
    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;">Remove</button>
  `;

  // Attach delete behavior to item
  li.querySelector("button").addEventListener("click", () => {
    li.remove();
  });

  itemList.appendChild(li);
  itemInput.value = "";
}

addBtn.addEventListener("click", addItem);

// Allow pressing Enter key to submit
itemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addItem();
  }
});