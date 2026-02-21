const hasChromeStorage = () =>
    typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.local;

export async function getStoredValue(key, defaultValue) {
    if (hasChromeStorage()) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                if (chrome.runtime && chrome.runtime.lastError) {
                    resolve(defaultValue);
                    return;
                }
                resolve(result[key] ?? defaultValue);
            });
        });
    }

    if (typeof defaultValue === "string") {
        return localStorage.getItem(key) ?? defaultValue;
    }

    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : defaultValue;
    } catch (_error) {
        return defaultValue;
    }
}

export async function setStoredValue(key, value) {
    if (hasChromeStorage()) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => resolve());
        });
    }

    if (typeof value === "string") {
        localStorage.setItem(key, value);
        return;
    }

    localStorage.setItem(key, JSON.stringify(value));
}
