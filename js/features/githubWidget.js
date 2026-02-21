import { getStoredValue, setStoredValue } from "../lib/storage.js";

const GITHUB_STORAGE_KEY = "github_username";
const GITHUB_COLLAPSED_STORAGE_KEY = "github_widget_collapsed";
const GITHUB_CACHE_STORAGE_KEY = "github_stats_cache_v1";

const githubWidget = document.querySelector("#githubWidget");
const githubToggleBtn = document.querySelector("#githubToggleBtn");
const githubForm = document.querySelector("#githubForm");
const githubInput = document.querySelector("#githubUsername");
const githubStatus = document.querySelector("#githubStatus");
const githubProfile = document.querySelector("#githubProfile");
const githubAvatar = document.querySelector("#githubAvatar");
const githubName = document.querySelector("#githubName");
const githubHandle = document.querySelector("#githubHandle");
const githubProfileLink = document.querySelector("#githubProfileLink");
const githubRepos = document.querySelector("#githubRepos");
const githubFollowers = document.querySelector("#githubFollowers");
const githubFollowing = document.querySelector("#githubFollowing");
const githubGists = document.querySelector("#githubGists");
const githubRecentRepos = document.querySelector("#githubRecentRepos");

function applyGithubCollapsed(collapsed) {
    if (!githubWidget || !githubToggleBtn) return;
    githubWidget.classList.toggle("collapsed", collapsed);
    githubToggleBtn.textContent = collapsed ? "+" : "-";
    githubToggleBtn.setAttribute("aria-label", collapsed ? "Expand GitHub widget" : "Minimize GitHub widget");
}

function renderGithubError(message) {
    if (githubStatus) githubStatus.textContent = message;
    if (githubProfile) githubProfile.hidden = true;
}

function normalizeUsername(username) {
    return (username || "").trim().toLowerCase();
}

function toCachedPayload(user, repos) {
    return {
        cachedAt: Date.now(),
        user: {
            login: user.login,
            name: user.name || "",
            html_url: user.html_url,
            public_repos: user.public_repos ?? 0,
            followers: user.followers ?? 0,
            following: user.following ?? 0,
            public_gists: user.public_gists ?? 0
        },
        repos: (Array.isArray(repos) ? repos : []).slice(0, 4).map((repo) => ({
            name: repo.name,
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count ?? 0
        }))
    };
}

async function getCachedGithub(username) {
    const cache = await getStoredValue(GITHUB_CACHE_STORAGE_KEY, {});
    const key = normalizeUsername(username);
    if (!key || !cache || typeof cache !== "object") return null;
    return cache[key] || null;
}

async function setCachedGithub(username, payload) {
    const key = normalizeUsername(username);
    if (!key) return;
    const cache = await getStoredValue(GITHUB_CACHE_STORAGE_KEY, {});
    const nextCache = cache && typeof cache === "object" ? cache : {};
    nextCache[key] = payload;
    await setStoredValue(GITHUB_CACHE_STORAGE_KEY, nextCache);
}

function renderGithubData(user, repos, { showAvatar = true } = {}) {
    if (!githubProfile || !githubStatus || !githubAvatar || !githubName || !githubHandle || !githubProfileLink) return;

    if (showAvatar && user.avatar_url) {
        githubAvatar.hidden = false;
        githubAvatar.src = user.avatar_url;
    } else {
        githubAvatar.hidden = true;
        githubAvatar.removeAttribute("src");
    }
    githubName.textContent = user.name || user.login;
    githubHandle.textContent = `@${user.login}`;
    githubProfileLink.href = user.html_url;
    githubRepos.textContent = user.public_repos;
    githubFollowers.textContent = user.followers;
    githubFollowing.textContent = user.following;
    githubGists.textContent = user.public_gists;

    githubRecentRepos.innerHTML = "";
    repos.slice(0, 4).forEach((repo) => {
        const repoEl = document.createElement("a");
        repoEl.className = "github-repo";
        repoEl.href = repo.html_url;
        repoEl.target = "_blank";
        repoEl.rel = "noopener noreferrer";
        repoEl.innerHTML = `<span>${repo.name}</span><span class="github-repo-stars">* ${repo.stargazers_count}</span>`;
        githubRecentRepos.appendChild(repoEl);
    });

    if (repos.length === 0) {
        const emptyEl = document.createElement("div");
        emptyEl.className = "github-repo";
        emptyEl.textContent = "No public repositories found.";
        githubRecentRepos.appendChild(emptyEl);
    }

    githubStatus.textContent = "Profile synced.";
    githubProfile.hidden = false;
}

async function renderFromCache(username, onNameResolved, message = "Showing cached stats (offline).") {
    const cached = await getCachedGithub(username);
    if (!cached || !cached.user) {
        renderGithubError("Network error while fetching GitHub data.");
        return false;
    }
    renderGithubData(cached.user, cached.repos || [], { showAvatar: false });
    if (githubStatus) githubStatus.textContent = message;
    if (onNameResolved) onNameResolved(cached.user.name || cached.user.login);
    return true;
}

async function loadGithubProfile(username, onNameResolved) {
    if (!username) {
        renderGithubError("Please enter a GitHub username.");
        return;
    }

    if (githubStatus) githubStatus.textContent = "Loading GitHub profile...";

    try {
        const userResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                renderGithubError("User not found.");
                return;
            }
            const rendered = await renderFromCache(username, onNameResolved, "GitHub API unavailable. Showing cached stats.");
            if (!rendered) renderGithubError("Unable to load profile right now.");
            return;
        }

        const reposResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=4`);
        const user = await userResponse.json();
        const repos = reposResponse.ok ? await reposResponse.json() : [];

        const safeRepos = Array.isArray(repos) ? repos : [];
        renderGithubData(user, safeRepos, { showAvatar: true });
        await setStoredValue(GITHUB_STORAGE_KEY, username);
        await setCachedGithub(username, toCachedPayload(user, safeRepos));
        if (onNameResolved) onNameResolved(user.name || user.login);
    } catch (_error) {
        const rendered = await renderFromCache(username, onNameResolved);
        if (!rendered) renderGithubError("Network error while fetching GitHub data.");
    }
}

export async function initGithubWidget({ onNameResolved } = {}) {
    if (githubForm) {
        githubForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const username = githubInput ? githubInput.value.trim() : "";
            await loadGithubProfile(username, onNameResolved);
        });
    }

    if (githubToggleBtn) {
        githubToggleBtn.addEventListener("click", async () => {
            const nextState = !(githubWidget && githubWidget.classList.contains("collapsed"));
            applyGithubCollapsed(nextState);
            await setStoredValue(GITHUB_COLLAPSED_STORAGE_KEY, Boolean(nextState));
        });
    }

    applyGithubCollapsed(Boolean(await getStoredValue(GITHUB_COLLAPSED_STORAGE_KEY, false)));

    const savedUsername = (await getStoredValue(GITHUB_STORAGE_KEY, "") || "").trim();
    if (savedUsername && githubInput) {
        githubInput.value = savedUsername;
        await loadGithubProfile(savedUsername, onNameResolved);
    }
}
