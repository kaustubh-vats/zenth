const actionGrid = document.querySelector("#actionGrid");
const actionBell = document.querySelector("#actionBell");

export function initQuickLinks() {
    if (actionGrid) {
        actionGrid.addEventListener("click", () => {
            window.open("https://www.google.com/imghp", "_blank", "noopener,noreferrer");
        });
    }

    if (actionBell) {
        actionBell.addEventListener("click", () => {
            window.open("https://news.google.com", "_blank", "noopener,noreferrer");
        });
    }
}
