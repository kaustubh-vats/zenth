import { getStoredValue, setStoredValue } from "../lib/storage.js";

const CUSTOM_APPS_STORAGE_KEY = "custom_apps";
const CUSTOM_APPS_MAX = 3;

const customAppsContainer = document.querySelector("#customApps");
const addAppBtn = document.querySelector("#addAppBtn");
const promptOverlay = document.querySelector("#promptOverlay");
const promptUrlInput = document.querySelector("#promptUrlInput");
const promptNameInput = document.querySelector("#promptNameInput");
const promptError = document.querySelector("#promptError");
const promptCancelBtn = document.querySelector("#promptCancelBtn");
const promptSaveBtn = document.querySelector("#promptSaveBtn");

let customApps = [];

function normalizeWebsiteUrl(input) {
    const raw = (input || "").trim();
    if (!raw) return null;

    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
        const parsed = new URL(withScheme);
        if (!["http:", "https:"].includes(parsed.protocol)) return null;
        return parsed.href;
    } catch (_error) {
        return null;
    }
}

function openCustomAppPrompt(defaultUrl = "", defaultName = "") {
    return new Promise((resolve) => {
        if (!promptOverlay || !promptUrlInput || !promptNameInput || !promptCancelBtn || !promptSaveBtn) {
            resolve(null);
            return;
        }

        promptOverlay.hidden = false;
        promptUrlInput.value = defaultUrl;
        promptNameInput.value = defaultName;
        if (promptError) promptError.textContent = "";
        promptUrlInput.focus();

        const close = (result) => {
            promptOverlay.hidden = true;
            promptCancelBtn.removeEventListener("click", onCancel);
            promptSaveBtn.removeEventListener("click", onSave);
            promptOverlay.removeEventListener("click", onOverlayClick);
            resolve(result);
        };

        const onCancel = () => close(null);
        const onSave = () => {
            const url = normalizeWebsiteUrl(promptUrlInput.value);
            if (!url) {
                if (promptError) promptError.textContent = "Enter a valid URL.";
                return;
            }

            const parsed = new URL(url);
            const suggestedName = parsed.hostname.replace(/^www\./, "");
            const name = (promptNameInput.value.trim() || suggestedName).slice(0, 24);
            close({ url, host: parsed.hostname, name });
        };
        const onOverlayClick = (event) => {
            if (event.target === promptOverlay) close(null);
        };

        promptCancelBtn.addEventListener("click", onCancel);
        promptSaveBtn.addEventListener("click", onSave);
        promptOverlay.addEventListener("click", onOverlayClick);
    });
}

async function renderCustomApps() {
    if (!customAppsContainer) return;
    customAppsContainer.innerHTML = "";

    customApps.forEach((app) => {
        const link = document.createElement("a");
        link.className = "app-icon custom";
        link.href = app.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.title = app.name;
        link.setAttribute("aria-label", app.name);

        const favicon = document.createElement("img");
        favicon.alt = "";
        favicon.setAttribute("aria-hidden", "true");
        favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(app.host)}&sz=64`;
        link.appendChild(favicon);

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "custom-app-remove";
        removeBtn.textContent = "x";
        removeBtn.setAttribute("aria-label", `Remove ${app.name}`);
        removeBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            customApps = customApps.filter((item) => item.id !== app.id);
            await setStoredValue(CUSTOM_APPS_STORAGE_KEY, customApps);
            renderCustomApps();
        });
        link.appendChild(removeBtn);

        customAppsContainer.appendChild(link);
    });
}

async function handleAddCustomApp() {
    if (customApps.length >= CUSTOM_APPS_MAX) {
        window.alert(`You can only add up to ${CUSTOM_APPS_MAX} custom apps.`);
        return;
    }

    const result = await openCustomAppPrompt("", "");
    if (!result) return;

    customApps.push({
        id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: result.name,
        url: result.url,
        host: result.host
    });

    await setStoredValue(CUSTOM_APPS_STORAGE_KEY, customApps);
    renderCustomApps();
}

export async function initCustomApps() {
    const savedApps = await getStoredValue(CUSTOM_APPS_STORAGE_KEY, []);
    customApps = (Array.isArray(savedApps) ? savedApps : [])
        .filter((item) => item && typeof item.url === "string")
        .slice(0, CUSTOM_APPS_MAX)
        .map((item, idx) => {
            const normalizedUrl = normalizeWebsiteUrl(item.url);
            if (!normalizedUrl) return null;
            const parsed = new URL(normalizedUrl);
            return {
                id: item.id || `app_${Date.now()}_${idx}`,
                name: (item.name || parsed.hostname).toString().slice(0, 24),
                url: normalizedUrl,
                host: parsed.hostname
            };
        })
        .filter(Boolean);
    renderCustomApps();

    if (addAppBtn) {
        addAppBtn.addEventListener("click", async () => handleAddCustomApp());
    }
}
