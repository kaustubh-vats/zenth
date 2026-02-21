const searchInput = document.querySelector("#googleSearchInput");
const searchForm = document.querySelector("#googleSearchForm");

function buildSearchUrl(rawText) {
    const text = (rawText || "").trim();
    if (!text) return "https://www.google.com";

    const match = text.match(/^\/([a-z]+)\s*(.*)$/i);
    const command = match ? match[1].toLowerCase() : "";
    const query = match ? match[2].trim() : text;
    const encoded = encodeURIComponent(query);

    if (command === "g") return `https://www.google.com/search?q=${encoded}`;
    if (command === "yt") return `https://www.youtube.com/results?search_query=${encoded}`;
    if (command === "gh") return `https://github.com/search?q=${encoded}`;
    if (command === "r") return `https://www.reddit.com/search/?q=${encoded}`;
    if (command === "so") return `https://stackoverflow.com/search?q=${encoded}`;

    return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
}

export function initSearchCommands() {
    if (!searchForm) return;
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const url = buildSearchUrl(searchInput ? searchInput.value : "");
        window.open(url, "_blank", "noopener,noreferrer");
    });
}
