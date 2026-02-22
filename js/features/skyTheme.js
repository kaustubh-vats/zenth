const leftEye = document.querySelector(".leftEyeContainer .eye");
const rightEye = document.querySelector(".rightEyeContainer .eye");
const container = document.querySelector(".container");
const SQUINT_EDGE_PADDING_PX = 18;

let mouseSkyShiftX = 0;
let smoothSkyShiftX = 0;

function moveEye(eye, mouseX, mouseY) {
    if (!eye) return;
    const eyeContainer = eye.parentElement;
    if (!eyeContainer) return;

    const containerRect = eyeContainer.getBoundingClientRect();
    const eyeRect = eye.getBoundingClientRect();

    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const maxX = Math.max(0, (containerRect.width - eyeRect.width) / 2);
    const maxY = Math.max(0, (containerRect.height - eyeRect.height) / 2);
    const normalized = Math.min(1, distance / 120);

    const moveX = Math.cos(angle) * maxX * normalized;
    const moveY = Math.sin(angle) * maxY * normalized;

    // Prevent both pupils from strongly converging when the cursor is between the two eyes.
    const leftEyeContainer = leftEye?.parentElement;
    const rightEyeContainer = rightEye?.parentElement;
    const leftRect = leftEyeContainer?.getBoundingClientRect();
    const rightRect = rightEyeContainer?.getBoundingClientRect();
    const leftCenterX = leftRect ? leftRect.left + leftRect.width / 2 : NaN;
    const rightCenterX = rightRect ? rightRect.left + rightRect.width / 2 : NaN;
    let adjustedMoveX = moveX;
    if (Number.isFinite(leftCenterX) && Number.isFinite(rightCenterX) && rightCenterX > leftCenterX) {
        const eyesMidX = (leftCenterX + rightCenterX) / 2;
        const zoneStart = leftCenterX - SQUINT_EDGE_PADDING_PX;
        const zoneEnd = rightCenterX + SQUINT_EDGE_PADDING_PX;
        const inSquintZone = mouseX >= zoneStart && mouseX <= zoneEnd;

        if (inSquintZone) {
            const halfZone = Math.max(1, (zoneEnd - zoneStart) / 2);
            const edgeBlend = Math.min(1, Math.abs(mouseX - eyesMidX) / halfZone);

            const inwardDirection = eye === leftEye ? 1 : -1;
            const isInwardMove = Math.sign(moveX) === inwardDirection;

            if (isInwardMove) {
                // Strongly damp inward motion near the midpoint; recover near zone edges.
                const inwardScale = 0.08 + 0.92 * edgeBlend;
                adjustedMoveX = moveX * inwardScale;
            }
        }
    }

    eye.style.transform = `translate(-50%, -50%) translate(${adjustedMoveX}px, ${moveY}px)`;
}

function applyThemeBySky(skyKey) {
    const root = document.documentElement;

    const themes = {
        morning: {
            "--ui-text": "#fff4ef",
            "--ui-muted-text": "#ffd9d2",
            "--ui-border": "rgba(236, 201, 197, 0.52)",
            "--ui-glass-1": "rgba(91, 53, 55, 0.62)",
            "--ui-glass-2": "rgba(130, 76, 78, 0.5)",
            "--ui-overlay": "rgba(36, 18, 24, 0.42)",
            "--ui-accent-1": "#f6b48f",
            "--ui-accent-2": "#ee9160",
            "--ui-bar-border": "rgba(239, 182, 171, 0.72)",
            "--ui-bar-1": "rgba(255, 229, 222, 0.95)",
            "--ui-bar-2": "rgba(246, 210, 198, 0.93)",
            "--ui-bar-text": "#563536",
            "--ui-bar-placeholder": "#8e6767",
            "--ui-note-1": "rgba(255, 234, 224, 0.95)",
            "--ui-note-2": "rgba(248, 206, 186, 0.92)",
            "--ui-note-text": "#4b2f2f",
            "--ui-note-done-1": "rgba(223, 242, 216, 0.94)",
            "--ui-note-done-2": "rgba(186, 221, 173, 0.9)",
            "--ui-note-done-text": "#355339",
            "--gh-card-border": "rgba(236, 201, 197, 0.55)",
            "--gh-card-bg-1": "rgba(91, 53, 55, 0.48)",
            "--gh-card-bg-2": "rgba(130, 76, 78, 0.42)",
            "--gh-card-inset": "rgba(255, 227, 221, 0.2)",
            "--gh-status-color": "#ffe8e3",
            "--gh-handle-color": "#ffd9d2",
            "--gh-stat-text": "#ffece7",
            "--gh-recent-title": "#fff1ea",
            "--gh-repo-text": "#fff6f3",
            "--gh-stars": "#ffd38a"
        },
        day: {
            "--ui-text": "#f2f7ff",
            "--ui-muted-text": "#d6e2ff",
            "--ui-border": "rgba(173, 204, 243, 0.45)",
            "--ui-glass-1": "rgba(20, 36, 62, 0.62)",
            "--ui-glass-2": "rgba(37, 58, 94, 0.5)",
            "--ui-overlay": "rgba(6, 10, 18, 0.45)",
            "--ui-accent-1": "#f2cd57",
            "--ui-accent-2": "#ebb929",
            "--ui-bar-border": "rgba(223, 203, 145, 0.75)",
            "--ui-bar-1": "rgba(244, 237, 210, 0.95)",
            "--ui-bar-2": "rgba(234, 223, 187, 0.93)",
            "--ui-bar-text": "#3a404d",
            "--ui-bar-placeholder": "#636a7a",
            "--ui-note-1": "rgba(255, 247, 199, 0.95)",
            "--ui-note-2": "rgba(246, 229, 149, 0.92)",
            "--ui-note-text": "#2d2a1f",
            "--ui-note-done-1": "rgba(214, 237, 201, 0.94)",
            "--ui-note-done-2": "rgba(176, 216, 155, 0.9)",
            "--ui-note-done-text": "#355339",
            "--gh-card-border": "rgba(173, 204, 243, 0.5)",
            "--gh-card-bg-1": "rgba(30, 55, 93, 0.5)",
            "--gh-card-bg-2": "rgba(53, 84, 126, 0.42)",
            "--gh-card-inset": "rgba(220, 234, 255, 0.2)",
            "--gh-status-color": "#e3eeff",
            "--gh-handle-color": "#d2e2ff",
            "--gh-stat-text": "#e7f0ff",
            "--gh-recent-title": "#edf4ff",
            "--gh-repo-text": "#f5f9ff",
            "--gh-stars": "#ffd86a"
        },
        eve: {
            "--ui-text": "#fff3e6",
            "--ui-muted-text": "#ffd8b5",
            "--ui-border": "rgba(239, 206, 160, 0.52)",
            "--ui-glass-1": "rgba(93, 48, 31, 0.62)",
            "--ui-glass-2": "rgba(139, 77, 42, 0.5)",
            "--ui-overlay": "rgba(38, 18, 8, 0.44)",
            "--ui-accent-1": "#f7bf6a",
            "--ui-accent-2": "#ed9b3f",
            "--ui-bar-border": "rgba(235, 191, 132, 0.74)",
            "--ui-bar-1": "rgba(255, 232, 203, 0.95)",
            "--ui-bar-2": "rgba(247, 213, 167, 0.93)",
            "--ui-bar-text": "#543821",
            "--ui-bar-placeholder": "#8a6850",
            "--ui-note-1": "rgba(255, 232, 200, 0.95)",
            "--ui-note-2": "rgba(247, 203, 145, 0.92)",
            "--ui-note-text": "#4a3320",
            "--ui-note-done-1": "rgba(226, 241, 206, 0.94)",
            "--ui-note-done-2": "rgba(191, 218, 159, 0.9)",
            "--ui-note-done-text": "#355339",
            "--gh-card-border": "rgba(239, 206, 160, 0.58)",
            "--gh-card-bg-1": "rgba(93, 48, 31, 0.5)",
            "--gh-card-bg-2": "rgba(139, 77, 42, 0.42)",
            "--gh-card-inset": "rgba(255, 228, 188, 0.2)",
            "--gh-status-color": "#ffe5cf",
            "--gh-handle-color": "#fdd7b1",
            "--gh-stat-text": "#ffe8d3",
            "--gh-recent-title": "#ffeedf",
            "--gh-repo-text": "#fff4ea",
            "--gh-stars": "#ffd66a"
        },
        night: {
            "--ui-text": "#ebf1ff",
            "--ui-muted-text": "#bfcefb",
            "--ui-border": "rgba(136, 164, 229, 0.5)",
            "--ui-glass-1": "rgba(16, 27, 57, 0.64)",
            "--ui-glass-2": "rgba(30, 47, 86, 0.52)",
            "--ui-overlay": "rgba(5, 8, 18, 0.5)",
            "--ui-accent-1": "#7ca8ff",
            "--ui-accent-2": "#5a88ef",
            "--ui-bar-border": "rgba(129, 160, 226, 0.66)",
            "--ui-bar-1": "rgba(203, 218, 247, 0.94)",
            "--ui-bar-2": "rgba(182, 201, 239, 0.92)",
            "--ui-bar-text": "#24324f",
            "--ui-bar-placeholder": "#506089",
            "--ui-note-1": "rgba(213, 226, 255, 0.95)",
            "--ui-note-2": "rgba(175, 198, 245, 0.92)",
            "--ui-note-text": "#22365b",
            "--ui-note-done-1": "rgba(202, 233, 219, 0.94)",
            "--ui-note-done-2": "rgba(163, 214, 191, 0.9)",
            "--ui-note-done-text": "#234f46",
            "--gh-card-border": "rgba(136, 164, 229, 0.5)",
            "--gh-card-bg-1": "rgba(16, 27, 57, 0.58)",
            "--gh-card-bg-2": "rgba(30, 47, 86, 0.48)",
            "--gh-card-inset": "rgba(185, 204, 255, 0.16)",
            "--gh-status-color": "#dce6ff",
            "--gh-handle-color": "#bfcefb",
            "--gh-stat-text": "#e2ebff",
            "--gh-recent-title": "#e7efff",
            "--gh-repo-text": "#f1f5ff",
            "--gh-stars": "#ffd86a"
        }
    };

    const theme = themes[skyKey] || themes.day;
    Object.entries(theme).forEach(([key, value]) => root.style.setProperty(key, value));
}

function updateSkyByTime() {
    if (!container) return;

    const hour = new Date().getHours();
    let skyImage = "images/night-sky.png";
    let skyKey = "night";

    if (hour >= 5 && hour < 11) {
        skyImage = "images/morning-sky.png";
        skyKey = "morning";
    } else if (hour >= 11 && hour < 17) {
        skyImage = "images/day-sky.png";
        skyKey = "day";
    } else if (hour >= 17 && hour < 20) {
        skyImage = "images/eve-sky.png";
        skyKey = "eve";
    }
    
    container.style.backgroundImage = `url(${skyImage})`;
    applyThemeBySky(skyKey);
}

function animateSky() {
    if (!container) return;

    const time = Date.now() * 0.0005;
    const baseDriftX = Math.sin(time) * 14;
    const baseDriftY = Math.cos(time * 0.9) * 6;

    smoothSkyShiftX += (mouseSkyShiftX - smoothSkyShiftX) * 0.08;

    const totalX = baseDriftX - smoothSkyShiftX;
    const totalY = baseDriftY;

    container.style.backgroundPosition = `calc(50% + ${totalX.toFixed(2)}px) calc(50% + ${totalY.toFixed(2)}px)`;
    window.requestAnimationFrame(animateSky);
}

export function initSkyTheme() {
    window.addEventListener("mousemove", (event) => {
        moveEye(leftEye, event.clientX, event.clientY);
        moveEye(rightEye, event.clientX, event.clientY);

        const pageCenterX = window.innerWidth / 2;
        mouseSkyShiftX = Math.max(-36, Math.min(36, (event.clientX - pageCenterX) / 22));
    });

    updateSkyByTime();
    setInterval(updateSkyByTime, 300000);
    animateSky();
}
