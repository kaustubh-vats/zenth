const batteryPill = document.querySelector("#batteryPill");

function updateBatteryPillText(level, charging) {
    if (!batteryPill) return;
    const percent = `${Math.round(level * 100)}%`;
    batteryPill.textContent = charging ? `${percent} +` : percent;
}

export function initBatteryStatus() {
    if (!batteryPill) return;
    if (!("getBattery" in navigator)) {
        batteryPill.textContent = "N/A";
        return;
    }

    navigator.getBattery().then((battery) => {
        const apply = () => updateBatteryPillText(battery.level, battery.charging);
        apply();
        battery.addEventListener("levelchange", apply);
        battery.addEventListener("chargingchange", apply);
    }).catch(() => {
        batteryPill.textContent = "N/A";
    });
}
