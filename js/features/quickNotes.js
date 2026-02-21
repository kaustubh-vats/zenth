import { getStoredValue, setStoredValue } from "../lib/storage.js";

const QUICK_NOTES_STORAGE_KEY = "quick_notes_v2";
const QUICK_NOTES_MAX = 10;
const QUICK_NOTES_TEXT_LIMIT = 140;

const quickNotesPanel = document.querySelector("#quickNotesPanel");
const quickNotesInput = document.querySelector("#quickNotesInput");
const quickNotesStatus = document.querySelector("#quickNotesStatus");
const quickNotesAddBtn = document.querySelector("#quickNotesAddBtn");
const quickNotesCloseBtn = document.querySelector("#quickNotesCloseBtn");
const notesCanvas = document.querySelector("#notesCanvas");
const actionAdd = document.querySelector("#actionAdd");

let quickNotes = [];

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function setQuickNotesStatus(message) {
    if (quickNotesStatus) quickNotesStatus.textContent = message;
}

function updateQuickNotesStatus() {
    setQuickNotesStatus(`${quickNotes.length}/${QUICK_NOTES_MAX} notes`);
}

async function persistQuickNotes() {
    await setStoredValue(QUICK_NOTES_STORAGE_KEY, quickNotes);
    updateQuickNotesStatus();
}

function toggleQuickNotesPanel() {
    if (!quickNotesPanel) return;
    quickNotesPanel.hidden = !quickNotesPanel.hidden;
    if (!quickNotesPanel.hidden && quickNotesInput) quickNotesInput.focus();
}

function renderQuickNotes() {
    if (!notesCanvas) return;
    notesCanvas.innerHTML = "";

    quickNotes.forEach((note) => {
        const tile = document.createElement("article");
        tile.className = `note-tile${note.completed ? " completed" : ""}`;
        tile.dataset.id = note.id;
        tile.style.left = `${note.x}%`;
        tile.style.top = `${note.y}%`;
        tile.innerHTML = `
            <div class="note-content"></div>
            <div class="note-actions">
                <button type="button" class="note-toggle-btn">${note.completed ? "Undo" : "Done"}</button>
                <button type="button" class="note-delete-btn">Delete</button>
            </div>
        `;

        const noteContent = tile.querySelector(".note-content");
        if (noteContent) noteContent.textContent = note.text;

        const toggleBtn = tile.querySelector(".note-toggle-btn");
        const deleteBtn = tile.querySelector(".note-delete-btn");

        toggleBtn.addEventListener("click", async (event) => {
            event.stopPropagation();
            note.completed = !note.completed;
            await persistQuickNotes();
            renderQuickNotes();
        });

        deleteBtn.addEventListener("click", async (event) => {
            event.stopPropagation();
            quickNotes = quickNotes.filter((item) => item.id !== note.id);
            await persistQuickNotes();
            renderQuickNotes();
        });

        tile.addEventListener("pointerdown", (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.closest("button")) return;

            tile.setPointerCapture(event.pointerId);
            const canvasRect = notesCanvas.getBoundingClientRect();
            const tileRect = tile.getBoundingClientRect();
            const offsetX = event.clientX - tileRect.left;
            const offsetY = event.clientY - tileRect.top;

            const onMove = (moveEvent) => {
                const maxLeft = canvasRect.width - tileRect.width;
                const maxTop = canvasRect.height - tileRect.height;
                const leftPx = clamp(moveEvent.clientX - canvasRect.left - offsetX, 0, Math.max(0, maxLeft));
                const topPx = clamp(moveEvent.clientY - canvasRect.top - offsetY, 0, Math.max(0, maxTop));

                note.x = (leftPx / canvasRect.width) * 100;
                note.y = (topPx / canvasRect.height) * 100;
                tile.style.left = `${note.x}%`;
                tile.style.top = `${note.y}%`;
            };

            const onUp = async () => {
                tile.removeEventListener("pointermove", onMove);
                tile.removeEventListener("pointerup", onUp);
                tile.removeEventListener("pointercancel", onUp);
                await persistQuickNotes();
            };

            tile.addEventListener("pointermove", onMove);
            tile.addEventListener("pointerup", onUp);
            tile.addEventListener("pointercancel", onUp);
        });

        notesCanvas.appendChild(tile);
    });

    updateQuickNotesStatus();
}

async function addQuickNote() {
    if (!quickNotesInput) return;
    const text = quickNotesInput.value.trim().slice(0, QUICK_NOTES_TEXT_LIMIT);

    if (!text) {
        setQuickNotesStatus("Enter note text first.");
        return;
    }
    if (quickNotes.length >= QUICK_NOTES_MAX) {
        setQuickNotesStatus(`Max ${QUICK_NOTES_MAX} notes reached.`);
        return;
    }

    const index = quickNotes.length;
    quickNotes.push({
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text,
        completed: false,
        x: 8 + (index % 3) * 24,
        y: 26 + Math.floor(index / 3) * 16
    });

    quickNotesInput.value = "";
    await persistQuickNotes();
    renderQuickNotes();
}

export async function initQuickNotes() {
    const savedNotes = await getStoredValue(QUICK_NOTES_STORAGE_KEY, []);
    quickNotes = (Array.isArray(savedNotes) ? savedNotes : [])
        .filter((item) => item && typeof item.text === "string")
        .slice(0, QUICK_NOTES_MAX)
        .map((item, idx) => ({
            id: item.id || `note_${Date.now()}_${idx}`,
            text: item.text.slice(0, QUICK_NOTES_TEXT_LIMIT),
            completed: Boolean(item.completed),
            x: typeof item.x === "number" ? item.x : 8 + (idx % 3) * 24,
            y: typeof item.y === "number" ? item.y : 26 + Math.floor(idx / 3) * 16
        }));
    renderQuickNotes();

    if (actionAdd) {
        actionAdd.addEventListener("click", () => toggleQuickNotesPanel());
    }

    if (quickNotesInput) {
        quickNotesInput.addEventListener("input", () => {
            if (quickNotesInput.value.length > QUICK_NOTES_TEXT_LIMIT) {
                quickNotesInput.value = quickNotesInput.value.slice(0, QUICK_NOTES_TEXT_LIMIT);
            }
            updateQuickNotesStatus();
        });
    }

    if (quickNotesAddBtn) {
        quickNotesAddBtn.addEventListener("click", async () => addQuickNote());
    }

    if (quickNotesCloseBtn) {
        quickNotesCloseBtn.addEventListener("click", () => {
            if (quickNotesPanel) quickNotesPanel.hidden = true;
        });
    }
}
