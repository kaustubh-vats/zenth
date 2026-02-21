import { initSkyTheme } from "./features/skyTheme.js";
import { initClockGreeting } from "./features/clockGreeting.js";
import { initBatteryStatus } from "./features/battery.js";
import { initSearchCommands } from "./features/searchCommands.js";
import { initGithubWidget } from "./features/githubWidget.js";
import { initQuickNotes } from "./features/quickNotes.js";
import { initCustomApps } from "./features/customApps.js";
import { initQuickLinks } from "./features/quickLinks.js";

async function bootstrap() {
    const clockApi = await initClockGreeting();

    initSkyTheme();
    initBatteryStatus();
    initSearchCommands();
    initQuickLinks();

    await Promise.all([
        initQuickNotes(),
        initCustomApps(),
        initGithubWidget({
            onNameResolved: clockApi.setGreetingName
        })
    ]);
}

bootstrap();
