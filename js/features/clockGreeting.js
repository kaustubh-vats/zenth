import { getStoredValue, setStoredValue } from "../lib/storage.js";

const GREETING_NAME_STORAGE_KEY = "greeting_name";
const clockTime = document.querySelector("#clockTime");
const clockDate = document.querySelector("#clockDate");
const clockGreeting = document.querySelector("#clockGreeting");

let greetingName = "Friend";
let lastGreetingBucket = "";
let lastGreetingName = "";

function normalizeGreetingName(rawName) {
    if (!rawName) return "";
    const cleaned = rawName.toString().trim().replace(/^@/, "");
    if (!cleaned) return "";
    const firstWord = cleaned.split(/\s+/)[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
}

async function getDefaultGreetingNameFromChrome() {
    if (typeof chrome === "undefined" || !chrome.identity || !chrome.identity.getProfileUserInfo) {
        return "";
    }

    return new Promise((resolve) => {
        chrome.identity.getProfileUserInfo((info) => {
            if (chrome.runtime && chrome.runtime.lastError) {
                resolve("");
                return;
            }

            const email = (info && info.email ? info.email : "").trim();
            if (!email) {
                resolve("");
                return;
            }

            const localPart = email.split("@")[0] || "";
            const first = localPart.split(/[._-]+/)[0] || "";
            resolve(normalizeGreetingName(first));
        });
    });
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function updateClock() {
    if (!clockTime || !clockDate) return;
    const now = new Date();
    clockTime.textContent = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
    });
    clockDate.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });
}

function updateGreeting() {
    if (!clockGreeting) return;

    const hour = new Date().getHours();
    let bucket = "night";
    if (hour >= 5 && hour < 12) bucket = "morning";
    else if (hour >= 12 && hour < 17) bucket = "afternoon";
    else if (hour >= 17 && hour < 21) bucket = "evening";

    const messages = {
        morning: [
            `Good morning, ${greetingName}.`,
            `Morning, ${greetingName}. Build something beautiful today.`,
            `${greetingName}, new day. New ideas.`,
            `Rise and shine, ${greetingName}.`,
            `${greetingName}, start sharp and stay curious.`,
            `Fresh start, ${greetingName}. Make it count.`,
            `${greetingName}, one focused hour to begin.`,
            `Morning energy looks good on you, ${greetingName}.`
        ],
        afternoon: [
            `Good afternoon, ${greetingName}. Keep the momentum going.`,
            `${greetingName}, steady focus. You are in flow.`,
            `Afternoon check-in, ${greetingName}. You are doing great.`,
            `${greetingName}, keep shipping small wins.`,
            `Strong pace, ${greetingName}. Stay locked in.`,
            `${greetingName}, progress over perfection this afternoon.`,
            `You are on track, ${greetingName}.`,
            `${greetingName}, take a breath and keep building.`
        ],
        evening: [
            `Wind down, ${greetingName}. You did well today.`,
            `${greetingName}, evening mode: reflect and recharge.`,
            `Nice work today, ${greetingName}. Slow it down and breathe.`,
            `${greetingName}, wrap up with one clean finish.`,
            `Evening glow, ${greetingName}. Good progress today.`,
            `${greetingName}, close loops and rest easy.`,
            `Well played, ${greetingName}. Time to reset.`,
            `${greetingName}, protect your energy tonight.`
        ],
        night: [
            `Night mode, ${greetingName}: time to build quietly.`,
            `${greetingName}, the night is calm. Keep creating.`,
            `Quiet hours, ${greetingName}. Deep work starts now.`,
            `${greetingName}, less noise, more focus.`,
            `Late session, ${greetingName}. Craft with intent.`,
            `${greetingName}, build quietly, think clearly.`,
            `Moonlit momentum, ${greetingName}.`,
            `${greetingName}, one more meaningful push.`
        ]
    };

    if (bucket !== lastGreetingBucket || greetingName !== lastGreetingName) {
        clockGreeting.textContent = pickRandom(messages[bucket]);
        lastGreetingBucket = bucket;
        lastGreetingName = greetingName;
    }
}

export async function setGreetingName(rawName) {
    const normalized = normalizeGreetingName(rawName);
    if (!normalized) return;
    greetingName = normalized;
    await setStoredValue(GREETING_NAME_STORAGE_KEY, greetingName);
    updateGreeting();
}

export async function initClockGreeting() {
    updateClock();
    setInterval(updateClock, 60000);

    const savedName = normalizeGreetingName(await getStoredValue(GREETING_NAME_STORAGE_KEY, ""));
    if (savedName) {
        greetingName = savedName;
    } else {
        const fallbackName = await getDefaultGreetingNameFromChrome();
        if (fallbackName) {
            greetingName = fallbackName;
            await setStoredValue(GREETING_NAME_STORAGE_KEY, greetingName);
        }
    }

    updateGreeting();
    setInterval(updateGreeting, 60000);

    return {
        setGreetingName
    };
}
