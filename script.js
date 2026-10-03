/* =========================================================
   ST ORAN'S PEER HUB
   MAIN JAVASCRIPT
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "stOransPeerHubPrototype";
const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";


/* =========================================================
   DEMO DATA
   ========================================================= */

const DEFAULT_DATA = {
    users: [
        {
            id: "demo-maya",
            name: "Maya Smith",
            email: "maya@storans.school.nz",
            password: "maya123",
            year: "8",
            className: "8WI",
            points: 240,
            previousPoints: 80,
            sessions: 0,
            role: "student",
            subjects: ["English", "Science"],
            availability: ["Monday", "Wednesday"]
        }
    ],

    assignments: [
        {
            id: 1,
            title: "English persuasive writing",
            subject: "English",
            due: "Tomorrow",
            importance: "high",
            completed: false
        },
        {
            id: 2,
            title: "Science research report",
            subject: "Science",
            due: "Friday",
            importance: "medium",
            completed: false
        },
        {
            id: 3,
            title: "Mathematics practice questions",
            subject: "Mathematics",
            due: "Next Monday",
            importance: "medium",
            completed: false
        },
        {
            id: 4,
            title: "French vocabulary revision",
            subject: "French",
            due: "Next Tuesday",
            importance: "low",
            completed: true
        }
    ],

    tutors: [
        {
            id: 1,
            name: "Lucy Worthington",
            year: "13LW",
            subjects: ["English", "History"],
            availability: "Mon • Wed • Fri",
            initials: "LW",
            bio: "English enthusiast who loves helping with essays and writing."
        },
        {
            id: 2,
            name: "Aisha",
            year: "12",
            subjects: ["Mathematics", "Science"],
            availability: "Tue • Thu",
            initials: "A",
            bio: "Happy to help break complicated concepts into smaller steps."
        },
        {
            id: 3,
            name: "Sophie",
            year: "12",
            subjects: ["French", "English"],
            availability: "Mon • Thu",
            initials: "S",
            bio: "Languages, writing and revision support."
        },
        {
            id: 4,
            name: "Mia",
            year: "11",
            subjects: ["Science", "Mathematics"],
            availability: "Wed • Fri",
            initials: "M",
            bio: "Science and maths peer tutor."
        },
        {
            id: 5,
            name: "Noah",
            year: "11",
            subjects: ["Mathematics", "PE"],
            availability: "Tue • Wed",
            initials: "N",
            bio: "Maths help without making maths feel like punishment."
        },
        {
            id: 6,
            name: "Ella",
            year: "10",
            subjects: ["English", "French"],
            availability: "Mon • Fri",
            initials: "E",
            bio: "Happy to help with writing, reading and languages."
        }
    ],

    calendarEvents: [],

    settings: {
        notifications: true,
        reminders: true,
        darkMode: false
    }
};


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let appData = loadData();
let currentUser = loadCurrentUser();

let currentPage = "home";

let selectedCalendarDate = new Date();

let timerInterval = null;
let timerSeconds = 25 * 60;
let timerRunning = false;
let timerMode = "focus";
let customFocusMinutes = 25;


/*
 * Which Study card currently owns the timer.
 */
let activeStudyEnvironment = null;

let focusTimerInterval = null;
let focusSeconds = 25 * 60;
let focusRunning = false;

let currentFocusBackground = "forest";
let currentFocusSound = "forest";


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector, parent = document) => {
    return parent.querySelector(selector);
};

const $$ = (selector, parent = document) => {
    return [...parent.querySelectorAll(selector)];
};


/* =========================================================
   STORAGE FUNCTIONS
   ========================================================= */

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(DEFAULT_DATA);
        }

        const parsed = JSON.parse(saved);

        return {
            ...structuredClone(DEFAULT_DATA),
            ...parsed,
            users: parsed.users || structuredClone(DEFAULT_DATA.users),
            assignments:
                parsed.assignments ||
                structuredClone(DEFAULT_DATA.assignments),
            tutors:
                parsed.tutors ||
                structuredClone(DEFAULT_DATA.tutors),
            calendarEvents:
                parsed.calendarEvents ||
                [],
            settings: {
                ...DEFAULT_DATA.settings,
                ...(parsed.settings || {})
            }
        };
    } catch (error) {
        console.error("Could not load Peer Hub data:", error);
        return structuredClone(DEFAULT_DATA);
    }
}


function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );
    } catch (error) {
        console.error("Could not save Peer Hub data:", error);
    }
}


function loadCurrentUser() {
    try {
        const saved = localStorage.getItem(CURRENT_USER_KEY);

        if (!saved) {
            return null;
        }

        return JSON.parse(saved);
    } catch (error) {
        console.error("Could not load current user:", error);
        return null;
    }
}


function saveCurrentUser() {
    if (!currentUser) {
        localStorage.removeItem(CURRENT_USER_KEY);
        return;
    }

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(currentUser)
    );
}


/* =========================================================
   USER HELPERS
   ========================================================= */

function getUserById(id) {
    return appData.users.find(user => user.id === id);
}


function getCurrentUserFromData() {
    if (!currentUser) {
        return null;
    }

    return (
        getUserById(currentUser.id) ||
        currentUser
    );
}


function updateCurrentUser(updates) {
    if (!currentUser) {
        return;
    }

    const userIndex = appData.users.findIndex(
        user => user.id === currentUser.id
    );

    if (userIndex === -1) {
        currentUser = {
            ...currentUser,
            ...updates
        };
    } else {
        appData.users[userIndex] = {
            ...appData.users[userIndex],
            ...updates
        };

        currentUser = appData.users[userIndex];
    }

    saveData();
    saveCurrentUser();
}


function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .map(part => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
}


function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initialiseApp();
});


function initialiseApp() {
    setupAuthTabs();
   console.log("AUTH SETUP RUNNING");
setupAuthentication();
    setupNavigation();
    setupTopbar();
    setupGlobalClicks();
    setupFocusMode();

    if (currentUser) {
        showApplication();
    } else {
        showAuth();
    }
}


/* =========================================================
   AUTHENTICATION
   ========================================================= */

function setupAuthTabs() {
    const tabs = $$(".auth-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.authTab;

            tabs.forEach(item => {
                item.classList.toggle(
                    "active",
                    item === tab
                );

                item.setAttribute(
                    "aria-selected",
                    item === tab ? "true" : "false"
                );
            });

            const signinForm = $("#signinForm");
            const signupForm = $("#signupForm");

            if (target === "signup") {
                signinForm?.classList.add("hidden");
                signupForm?.classList.remove("hidden");
            } else {
                signupForm?.classList.add("hidden");
                signinForm?.classList.remove("hidden");
            }
        });
    });
}


function setupAuthentication() {
    const signinForm = $("#signinForm");
    const signupForm = $("#signupForm");
    const googleButton = $("#googleDemo");

    signinForm?.addEventListener("submit", handleSignIn);
    signupForm?.addEventListener("submit", handleSignUp);

    googleButton?.addEventListener(
        "click",
        handleGoogleDemo
    );
}


function handleSignIn(event) {
    event.preventDefault();

    const email = $("#signinEmail")?.value
        .trim()
        .toLowerCase();

    const password = $("#signinPassword")?.value;

    const error = $("#signinError");

    if (error) {
        error.textContent = "";
    }

    if (!email || !password) {
        if (error) {
            error.textContent =
                "Please enter your school email and password.";
        }

        return;
    }

    const user = appData.users.find(
        account =>
            account.email.toLowerCase() === email &&
            account.password === password
    );

    if (!user) {
        if (error) {
            error.textContent =
                "We couldn't find an account with those details.";
        }

        return;
    }

    currentUser = user;

    saveCurrentUser();

    showToast(
        "Welcome back, " +
        user.name.split(" ")[0] +
        " 🌿"
    );

    showApplication();
}


function handleSignUp(event) {
    event.preventDefault();

    const name = $("#signupName")?.value.trim();
    const email = $("#signupEmail")?.value
        .trim()
        .toLowerCase();

    const year = $("#signupYear")?.value;
    const password = $("#signupPassword")?.value;

    const error = $("#signupError");

    if (error) {
        error.textContent = "";
    }

    if (!name || !email || !year || !password) {
        if (error) {
            error.textContent =
                "Please complete all the fields.";
        }

        return;
    }

    if (!/storans\.school\.nz$/i.test(email)) {
        if (error) {
            error.textContent =
                "Please use your St Oran's school email.";
        }

        return;
    }

    if (password.length < 6) {
        if (error) {
            error.textContent =
                "Your password needs at least 6 characters.";
        }

        return;
    }

    const existing = appData.users.find(
        user => user.email.toLowerCase() === email
    );

    if (existing) {
        if (error) {
            error.textContent =
                "An account with that email already exists.";
        }

        return;
    }

    const newUser = {
        id:
            "user-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2, 8),

        name,
        email,
        password,
        year,
        className: `${year}XX`,
        points: 0,
        previousPoints: 0,
        sessions: 0,
        role: "student",
        subjects: [],
        availability: []
    };

    appData.users.push(newUser);

    saveData();

    currentUser = newUser;

    saveCurrentUser();

    showToast("Account created successfully 🌿");

    showApplication();
}


function handleGoogleDemo() {
    const demo = appData.users.find(
        user => user.id === "demo-maya"
    );

    if (!demo) {
        showToast("Demo account unavailable.");
        return;
    }

    currentUser = demo;

    saveCurrentUser();

    showToast("Signed in with demo account 🐉");

    showApplication();
}


function showAuth() {
    $("#authScreen")?.classList.remove("hidden");
    $("#app")?.classList.add("hidden");
}


function showApplication() {
    $("#authScreen")?.classList.add("hidden");
    $("#app")?.classList.remove("hidden");

    updateTopbar();

    navigateTo(currentPage);
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
    $$(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            const page = item.dataset.page;

            if (!page) {
                return;
            }

            navigateTo(page);
        });
    });
}


function navigateTo(page) {
    currentPage = page;

    $$(".nav-item").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.page === page
        );
    });

    renderPage(page);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function renderPage(page) {
    const container = $("#pageContent");

    if (!container) {
        return;
    }

    switch (page) {
        case "home":
            renderHome(container);
            break;

        case "calendar":
            renderCalendar(container);
            break;

        case "assignments":
            renderAssignments(container);
            break;

        case "tutors":
            renderTutors(container);
            break;

        case "study":
            renderStudy(container);
            break;

        case "profile":
            renderProfile(container);
            break;

        case "settings":
          
         renderSettings(container);
            break;

        default:
            renderHome(container);
    }

    attachPageEvents();
}


/* =========================================================
   TOPBAR
   ========================================================= */

function setupTopbar() {
    $("#profileTop")?.addEventListener(
        "click",
        () => navigateTo("profile")
    );

    $("#notificationBtn")?.addEventListener(
        "click",
        showNotifications
    );
}


function updateTopbar() {
    const user = getCurrentUserFromData();

    if (!user) {
        return;
    }

    const name = $("#topName");
    const avatar = $("#topAvatar");

    if (name) {
        name.textContent = user.name.split(" ")[0];
    }

    if (avatar) {
        avatar.textContent = getInitials(user.name);
    }

    const dot = $("#notifDot");

    if (dot) {
        dot.style.display =
            appData.settings.notifications
                ? "block"
                : "none";
    }
}


function showNotifications() {
    const incomplete = appData.assignments.filter(
        assignment => !assignment.completed
    );

    if (!appData.settings.notifications) {
        showToast("Notifications are turned off.");
        return;
    }

    if (incomplete.length === 0) {
        showToast("You're all caught up ✦");
        return;
    }

    showToast(
        `${incomplete.length} assignment${
            incomplete.length === 1 ? "" : "s"
        } still need attention.`
    );
}


/* =========================================================
   HOME PAGE
   ========================================================= */

function renderHome(container) {
    const user = getCurrentUserFromData();

    const assignments = appData.assignments.filter(
        assignment => !assignment.completed
    );

    const progress =
        user && user.points
            ? Math.min((user.points / 300) * 100, 100)
            : 0;

    container.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">WELCOME BACK</p>
                <h1>Good to see you, ${escapeHTML(
                    user?.name?.split(" ")[0] || "Student"
                )}.</h1>
                <p>Let's make today a little more productive.</p>
            </div>
        </div>

        <section class="home-hero card">
            <div class="home-hero-content">
                <p class="eyebrow">YOUR PEER HUB</p>

                <h2>
                    Learn together.<br>
                    Grow together.
                </h2>

                <p>
                    Find a peer, organise your work,
                    or settle into a focused study session.
                </p>

                <button
                    type="button"
                    class="primary-button"
                    data-action="find-peer"
                >
                    Find a Peer
                </button>
            </div>

            <div
                class="home-hero-dragon"
                aria-hidden="true"
            >
                🐉
            </div>
        </section>

        <section class="stats-grid">

            <div class="stat-card card">
                <div class="stat-icon">✦</div>
                <div>
                    <div class="stat-number">
                        ${user?.points || 0}
                    </div>
                    <div class="stat-label">
                        Peer Points
                    </div>
                </div>
            </div>

            <div class="stat-card card">
                <div class="stat-icon">✓</div>
                <div>
                    <div class="stat-number">
                        ${assignments.length}
                    </div>
                    <div class="stat-label">
                        Tasks Remaining
                    </div>
                </div>
            </div>

            <div class="stat-card card">
                <div class="stat-icon">◷</div>
                <div>
                    <div class="stat-number">
                        ${user?.sessions || 0}
                    </div>
                    <div class="stat-label">
                        Study Sessions
                    </div>
                </div>
            </div>

            <div class="stat-card card">
                <div class="stat-icon">↗</div>
                <div>
                    <div class="stat-number">
                        ${Math.round(progress)}%
                    </div>
                    <div class="stat-label">
                        Progress
                    </div>
                </div>
            </div>

        </section>

        <section class="home-grid">

            <div class="home-left">

                ${renderRoranCard()}

                <div class="card card-padding">

                    <div class="card-header">
                        <div>
                            <p class="eyebrow">UP NEXT</p>
                            <h3>Your assignments</h3>
                        </div>

                        <button
                            type="button"
                            class="text-button"
                            data-action="assignments"
                        >
                            View all
                        </button>
                    </div>

                    ${renderAssignmentPreview(assignments)}

                </div>

            </div>

            <div class="home-right">

                <div class="card card-padding">

                    <div class="card-header">
                        <div>
                            <p class="eyebrow">NEED HELP?</p>
                            <h3>Find a peer</h3>
                        </div>
                    </div>

                    <p class="card-description">
                        Search for someone who can help
                        with the subject you're working on.
                    </p>

                    <button
                        type="button"
                        class="primary-button"
                        data-action="find-peer"
                    >
                        Browse Tutors
                    </button>

                </div>

                <div class="card card-padding">

                    <div class="card-header">
                        <div>
                            <p class="eyebrow">FOCUS</p>
                            <h3>Study smarter</h3>
                        </div>
                    </div>

                    <p class="card-description">
                        Start a focused study session
                        with Roran keeping watch.
                    </p>

                    <button
                        type="button"
                        class="secondary-button focus-launch"
                        data-action="study"
                    >
                        Start Studying
                    </button>

                </div>

            </div>

        </section>
    `;
}


function renderAssignmentPreview(assignments) {
    if (assignments.length === 0) {
        return `
            <div class="empty-state">
                <div>✦</div>
                <p>You're all caught up.</p>
            </div>
        `;
    }

    return `
        <div class="assignment-list">
            ${assignments
                .slice(0, 3)
                .map(renderAssignmentRow)
                .join("")}
        </div>
    `;
}


function renderRoranCard() {
    return `
        <div class="card roran-card">

            <div class="roran-main">

                <div class="roran-art" aria-hidden="true">
                    🐉
                </div>

                <div class="roran-content">

                    <p class="eyebrow">
                        RORAN SAYS
                    </p>

                    <blockquote class="roran-quote">
                        “Small progress is still progress.
                        Now stop staring at the screen
                        and do the thing.”
                    </blockquote>

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar(container) {
    const month = selectedCalendarDate.getMonth();
    const year = selectedCalendarDate.getFullYear();

    const monthName = selectedCalendarDate.toLocaleDateString(
        "en-NZ",
        {
            month: "long",
            year: "numeric"
        }
    );

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startingDay = firstDay.getDay();

    if (startingDay === 0) {
        startingDay = 7;
    }

    const previousMonthDays = new Date(
        year,
        month,
        0
    ).getDate();

    let daysHTML = "";

    for (let i = startingDay - 1; i > 0; i--) {
        const date = previousMonthDays - i + 1;

        daysHTML += `
            <button
                type="button"
                class="calendar-day other-month"
                disabled
            >
                <span class="day-number">${date}</span>
            </button>
        `;
    }

    for (let date = 1; date <= lastDay.getDate(); date++) {
        const dateObject = new Date(
            year,
            month,
            date
        );

        const today = isSameDate(
            dateObject,
            new Date()
        );

        const selected = isSameDate(
            dateObject,
            selectedCalendarDate
        );

        const events = getEventsForDate(dateObject);

        daysHTML += `
            <button
                type="button"
                class="calendar-day
                    ${today ? "today" : ""}
                    ${selected ? "selected" : ""}"
                data-calendar-date="${formatDateKey(
                    dateObject
                )}"
            >

                <span class="day-number">
                    ${date}
                </span>

                <span class="day-events">
                    ${events
                        .slice(0, 3)
                        .map(
                            () =>
                                `<span class="calendar-event-dot"></span>`
                        )
                        .join("")}
                </span>

            </button>
        `;
    }

    const totalCells =
        startingDay - 1 + lastDay.getDate();

    const remainingCells =
        Math.ceil(totalCells / 7) * 7 - totalCells;

    for (let i = 1; i <= remainingCells; i++) {
        daysHTML += `
            <button
                type="button"
                class="calendar-day other-month"
                disabled
            >
                <span class="day-number">${i}</span>
            </button>
        `;
    }

    container.innerHTML = `
        <div class="page-header">

            <div>
                <p class="eyebrow">PLAN AHEAD</p>
                <h1>Calendar</h1>
                <p>Keep track of your study life.</p>
            </div>

        </div>

        <div class="calendar-toolbar">

            <div class="calendar-nav">

                <button
                    type="button"
                    class="icon-button"
                    data-calendar-action="previous"
                    aria-label="Previous month"
                >
                    ‹
                </button>

                <h2>${monthName}</h2>

                <button
                    type="button"
                    class="icon-button"
                    data-calendar-action="next"
                    aria-label="Next month"
                >
                    ›
                </button>

            </div>

            <button
                type="button"
                class="calendar-today secondary-button"
                data-calendar-action="today"
            >
                Today
            </button>

        </div>

        <div class="calendar-layout">

            <div class="card calendar-card">

                <div class="calendar-grid weekdays">

                    ${[
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"
                    ]
                        .map(
                            day =>
                                `<div class="calendar-weekday">${day}</div>`
                        )
                        .join("")}

                </div>

                <div class="calendar-grid">
                    ${daysHTML}
                </div>

            </div>

            <div
                id="selectedDayCard"
                class="card selected-day-card"
            >
                ${renderSelectedDay()}
            </div>

        </div>
    `;
}


function renderSelectedDay() {
    const date = selectedCalendarDate;

    const events = getEventsForDate(date);

    const readableDate =
        date.toLocaleDateString("en-NZ", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });

    if (events.length === 0) {
        return `
            <p class="eyebrow">SELECTED DAY</p>

            <h3 class="selected-day-date">
                ${readableDate}
            </h3>

            <div class="empty-state">
                <div>✦</div>
                <p>No events planned.</p>
            </div>
        `;
    }

    return `
        <p class="eyebrow">SELECTED DAY</p>

        <h3 class="selected-day-date">
            ${readableDate}
        </h3>

        ${events
            .map(
                event => `
                    <div class="day-item">
                        <strong>${escapeHTML(event.title)}</strong>
                        <span>${escapeHTML(
                            event.type || "Event"
                        )}</span>
                    </div>
                `
            )
            .join("")}
    `;
}


function getEventsForDate(date) {
    const key = formatDateKey(date);

    return appData.calendarEvents.filter(
        event => event.date === key
    );
}


function formatDateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}


function isSameDate(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignments(container) {
    const completed = appData.assignments.filter(
        assignment => assignment.completed
    );

    const incomplete = appData.assignments.filter(
        assignment => !assignment.completed
    );

    container.innerHTML = `
        <div class="page-header">

            <div>
                <p class="eyebrow">STAY ON TRACK</p>
                <h1>Assignments</h1>
                <p>
                    Keep your schoolwork organised
                    without turning your life into a spreadsheet.
                </p>
            </div>

            <button
                type="button"
                class="primary-button"
                data-action="add-assignment"
            >
                + Add Assignment
            </button>

        </div>

        <div class="card card-padding">

            <div class="card-header">
                <div>
                    <p class="eyebrow">TO DO</p>
                    <h3>${incomplete.length} remaining</h3>
                </div>
            </div>

            ${
                incomplete.length
                    ? `
                        <div class="assignment-list">
                            ${incomplete
                                .map(renderAssignmentRow)
                                .join("")}
                        </div>
                    `
                    : `
                        <div class="empty-state">
                            <div>✓</div>
                            <p>Nothing left to do. Suspiciously productive.</p>
                        </div>
                    `
            }

        </div>

        <div class="card card-padding">

            <div class="card-header">
                <div>
                    <p class="eyebrow">COMPLETED</p>
                    <h3>${completed.length} finished</h3>
                </div>
            </div>

            ${
                completed.length
                    ? `
                        <div class="assignment-list">
                            ${completed
                                .map(renderAssignmentRow)
                                .join("")}
                        </div>
                    `
                    : `
                        <div class="empty-state">
                            <p>No completed assignments yet.</p>
                        </div>
                    `
            }

        </div>
    `;
}


function renderAssignmentRow(assignment) {
    return `
        <div
            class="assignment-row
                ${assignment.completed ? "completed" : ""}"
            data-assignment-id="${assignment.id}"
        >

            <button
                type="button"
                class="assignment-check"
                data-action="toggle-assignment"
                data-id="${assignment.id}"
                aria-label="${
                    assignment.completed
                        ? "Mark incomplete"
                        : "Mark complete"
                }"
            >
                ${assignment.completed ? "✓" : ""}
            </button>

            <div class="assignment-info">

                <strong class="assignment-title">
                    ${escapeHTML(assignment.title)}
                </strong>

                <span class="assignment-meta">
                    ${escapeHTML(assignment.subject)}
                    ·
                    ${escapeHTML(assignment.due)}
                </span>

            </div>

            <span
                class="importance ${escapeHTML(
                    assignment.importance
                )}"
            >
                ${escapeHTML(assignment.importance)}
            </span>

        </div>
    `;
}


function toggleAssignment(id) {
    const assignment = appData.assignments.find(
        item => String(item.id) === String(id)
    );

    if (!assignment) {
        return;
    }

    assignment.completed = !assignment.completed;

    if (assignment.completed) {
        updateCurrentUser({
            points:
                (getCurrentUserFromData()?.points || 0) + 10
        });

        showToast("Assignment completed! +10 points ✦");
    } else {
        showToast("Assignment moved back to your list.");
    }

    saveData();
    updateTopbar();
    renderPage(currentPage);
}


/* =========================================================
   TUTORS / FIND A PEER
   ========================================================= */

function renderTutors(container) {
    container.innerHTML = `
        <div class="page-header">

            <div>
                <p class="eyebrow">LEARN TOGETHER</p>
                <h1>Find a Peer</h1>
                <p>
                    Find a student who can help
                    with the subject you're working on.
                </p>
            </div>

        </div>

        <div class="filter-bar">

            <input
                type="search"
                id="tutorSearch"
                placeholder="Search by name or subject..."
                aria-label="Search tutors"
            >

            <select id="subjectFilter">
                <option value="">All subjects</option>
                <option value="English">English</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="French">French</option>
                <option value="History">History</option>
                <option value="PE">PE</option>
            </select>

        </div>

        <div
            id="tutorGrid"
            class="tutor-grid"
        >
            ${appData.tutors
                .map(renderTutorCard)
                .join("")}
        </div>
    `;
}


function renderTutorCard(tutor) {
    return `
        <article
            class="tutor-card card"
            data-tutor-name="${escapeHTML(
                tutor.name.toLowerCase()
            )}"
            data-tutor-subjects="${escapeHTML(
                tutor.subjects.join(" ").toLowerCase()
            )}"
        >

            <div class="tutor-avatar">
                ${escapeHTML(tutor.initials)}
            </div>

            <div class="tutor-year">
                ${escapeHTML(tutor.year)}
            </div>

            <h3>
                ${escapeHTML(tutor.name)}
            </h3>

            <div class="tutor-subjects">

                ${tutor.subjects
                    .map(
                        subject =>
                            `<span class="subject-tag">${escapeHTML(
                                subject
                            )}</span>`
                    )
                    .join("")}

            </div>

            <p>
                ${escapeHTML(tutor.bio)}
            </p>

            <div class="tutor-availability">
                <span>◷</span>
                ${escapeHTML(tutor.availability)}
            </div>

            <div class="tutor-buttons">

                <button
                    type="button"
                    class="primary-button"
                    data-action="book-tutor"
                    data-id="${tutor.id}"
                >
                    Request Session
                </button>

                <button
                    type="button"
                    class="secondary-button"
                    data-action="view-tutor"
                    data-id="${tutor.id}"
                >
                    View
                </button>

            </div>

        </article>
    `;
}


function filterTutors() {
    const search =
        ($("#tutorSearch")?.value || "")
            .trim()
            .toLowerCase();

    const subject =
        ($("#subjectFilter")?.value || "")
            .trim()
            .toLowerCase();

    $$(".tutor-card").forEach(card => {
        const name =
            card.dataset.tutorName || "";

        const subjects =
            card.dataset.tutorSubjects || "";

        const matchesSearch =
            !search ||
            name.includes(search) ||
            subjects.includes(search);

        const matchesSubject =
            !subject ||
            subjects.includes(subject);

        card.style.display =
            matchesSearch && matchesSubject
                ? ""
                : "none";
    });
}


/* =========================================================
   STUDY PAGE
   ========================================================= */
function getSpotifyEmbedUrl(spotifyUrl) {
    try {
        const url = new URL(spotifyUrl);
        const parts = url.pathname.split("/").filter(Boolean);

        const playlistIndex = parts.indexOf("playlist");

        if (playlistIndex === -1 || !parts[playlistIndex + 1]) {
            return "";
        }

        const playlistId = parts[playlistIndex + 1];

        return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
    } catch (error) {
        return "";
    }
}
function getStudyPlaylists() {
    return [
        {
            id: "rain",
            icon: "🌧️",
            title: "Rainy Focus",
            description: "Rain • Lo-fi • Ambient",
            spotify:
                "https://open.spotify.com/playlist/37i9dQZF1DX8ymr6UES7vc?si=zHMR9PgqShChIsgGJ8enOA",
            theme: "rain",
            fullscreenBackground: "rain",
            sound: "rain"
        },
        {
            id: "cafe",
            icon: "☕",
            title: "Study Café",
            description: "Café • Lo-fi • Soft jazz",
            spotify:
                "https://open.spotify.com/playlist/37i9dQZF1DX9RwfGbeGQwP?si=2W5EvODHQ0iJW_w6YKC8xQ",
            theme: "cafe",
            fullscreenBackground: "cafe",
            sound: "cafe"
        },
        {
            id: "forest",
            icon: "🌲",
            title: "Forest Study",
            description: "Nature • Piano • Ambient",
            spotify:
                "https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8?si=ZZ_WvJL-RCOaSCwiIrQi6Q",
            theme: "forest",
            fullscreenBackground: "forest",
            sound: "forest"
        },
        {
            id: "academia",
            icon: "📚",
            title: "Dark Academia",
            description: "Classical • Piano • Orchestral",
            spotify:
                "https://open.spotify.com/playlist/3MelsVnZV5g03wyiJsybHk?si=EI-1KuwXSjyczW84kfPppQ",
            theme: "academia",
            fullscreenBackground: "academia",
            sound: "academia"
        },
        {
            id: "midnight",
            icon: "🌙",
            title: "Midnight Focus",
            description: "Dreamy • Ambient • Soft instrumental",
            spotify:
                "https://open.spotify.com/playlist/6asedDPn710ueu5byDKXul?si=5LGw1r7FRz63_VfBKA4X4Q",
            theme: "midnight",
            fullscreenBackground: "night",
            sound: "midnight"
        },
        {
            id: "lyrics",
            icon: "🧠",
            title: "No Lyrics",
            description: "Instrumental • Minimal • Deep focus",
            spotify:
                "https://open.spotify.com/playlist/37i9dQZF1DWVceT0UosQME?si=AEmZ_Pw7Ru-XFpuD4_YgvQ",
            theme: "lyrics",
            fullscreenBackground: "lyrics",
            sound: "minimal"
        }
    ];
}


function renderStudy(container) {
    const studyPlaylists = getStudyPlaylists();

    container.innerHTML = `
        <div class="page-header">

            <div>
                <p class="eyebrow">
                    FOCUS & PRODUCTIVITY
                </p>

                <h1>Study</h1>

                <p>
                    Choose your atmosphere and settle in.
                </p>
            </div>

        </div>
<div class="timer-settings">
    <div class="timer-settings-label">
        <span class="eyebrow">FOCUS TIMER</span>
        <strong>Focus length</strong>
        <p>Choose how long you want each focus session to be.</p>
    </div>

    <div class="timer-length-control">
        <button
            type="button"
            class="timer-length-button"
            id="decreaseFocusMinutes"
            aria-label="Decrease focus time"
        >
            −
        </button>

        <div class="timer-length-value">
            <input
                type="number"
                id="focusMinutes"
                min="1"
                max="120"
                value="${customFocusMinutes}"
                aria-label="Focus length in minutes"
            >
            <span>min</span>
        </div>

        <button
            type="button"
            class="timer-length-button"
            id="increaseFocusMinutes"
            aria-label="Increase focus time"
        >
            +
        </button>
    </div>
</div>
        <div class="study-environment-grid">



            ${studyPlaylists.map(playlist => `
                <article
                    class="study-environment-card theme-${playlist.theme}"
                    data-playlist-id="${playlist.id}"
                >

                    <div class="study-environment-overlay"></div>

                    <div class="study-environment-content">

                        <div class="study-environment-top">

                            <div
                                class="study-environment-icon"
                                aria-hidden="true"
                            >
                                ${playlist.icon}
                            </div>

                            <button
                                type="button"
                                class="study-fullscreen-button"
                                data-playlist-action="fullscreen"
                                data-playlist-id="${playlist.id}"
                                aria-label="Open ${playlist.title} in full screen"
                                title="Full screen"
                            >
                                ⛶
                            </button>

                        </div>

<div class="study-environment-title">
    <p class="study-environment-label">
        STUDY ATMOSPHERE
    </p>
    <h3>${playlist.title}</h3>
    <p>${playlist.description}</p>
</div>


<div class="study-card-timer">
    <span class="study-card-timer-label">
        FOCUS
    </span>

    <input
        type="text"
        class="study-card-timer-input"
        data-study-timer="${playlist.id}"
        value="${formatTime(customFocusMinutes * 60)}"
        aria-label="Focus timer length"
        inputmode="numeric"
    >
</div>

                        <div class="study-environment-actions">

                            <button
                                type="button"
                                class="primary-button study-start-button"
                                data-playlist-action="start"
                                data-playlist-id="${playlist.id}"
                            >
                                ▶ Start
                            </button>

                            <button
                                type="button"
                                class="secondary-button study-playlist-button"
                                data-playlist-action="open"
                                data-playlist-id="${playlist.id}"
                            >
                                ♪ Playlist
                            </button>

                        </div>

                    </div>

                </article>
            `).join("")}

        </div>
    `;

    /*
     * If a timer is already running and the Study page gets
     * re-rendered, immediately put its current time back
     * into the correct card.
     */
    updateTimerDisplay();


const timerInputs = document.querySelectorAll(
    ".study-card-timer-input"
);

timerInputs.forEach(input => {
    input.addEventListener("change", () => {
        let value = input.value
            .replace(/[^0-9]/g, "");

        let minutes = Number(value);

        if (!Number.isFinite(minutes) || minutes < 1) {
            minutes = 25;
        }

        minutes = Math.min(minutes, 120);

        customFocusMinutes = minutes;

        if (timerMode === "focus" && !timerRunning) {
            timerSeconds = minutes * 60;
            updateTimerDisplay();
        }

        input.value = formatTime(minutes * 60);
    });

    input.addEventListener("focus", () => {
        input.select();
    });
});

decreaseButton?.addEventListener("click", () => {
    updateFocusLength(customFocusMinutes - 1);
});

increaseButton?.addEventListener("click", () => {
    updateFocusLength(customFocusMinutes + 1);
});
}
function renderProfile(container) {
    const user = currentUser;

    if (!user) {
        return;
    }

    const initials = user.name
        .split(" ")
        .map(name => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    container.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">YOUR PROFILE</p>
                <h1>${user.name}</h1>
                <p>
                    Keep track of your Peer Hub progress
                    and school details.
                </p>
            </div>
        </div>

        <div class="profile-grid">

            <section class="profile-card">
                <div class="profile-avatar">
                    ${initials}
                </div>

                <div class="profile-main">
                    <h2>${user.name}</h2>
                    <p>${user.email}</p>

                    <span class="profile-year">
                        ${user.year || "Student"}
                        ${user.className ? ` · ${user.className}` : ""}
                    </span>
                </div>
            </section>

            <section class="profile-card">
                <p class="eyebrow">PEER POINTS</p>

                <strong class="profile-stat">
                    ${user.points || 0}
                </strong>

                <p>
                    Points earned through helping and learning.
                </p>
            </section>

            <section class="profile-card">
                <p class="eyebrow">STUDY SESSIONS</p>

                <strong class="profile-stat">
                    ${user.sessions || 0}
                </strong>

                <p>
                    Focus sessions completed.
                </p>
            </section>

        </div>
    `;
}
function renderSettings(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">PREFERENCES</p>
                <h1>Settings</h1>
                <p>
                    Manage your Peer Hub preferences.
                </p>
            </div>
        </div>

        <div class="settings-grid">

            <section class="settings-card">
                <div>
                    <p class="eyebrow">ACCOUNT</p>
                    <h2>Account details</h2>
                    <p>
                        Your Peer Hub account is currently signed in.
                    </p>
                </div>

                <div class="settings-detail">
                    <span>Name</span>
                    <strong>${currentUser?.name || "Student"}</strong>
                </div>

                <div class="settings-detail">
                    <span>Email</span>
                    <strong>${currentUser?.email || "Not available"}</strong>
                </div>
            </section>

            <section class="settings-card">
                <div>
                    <p class="eyebrow">STUDY</p>
                    <h2>Study preferences</h2>
                    <p>
                        Your study settings can be adjusted from the Study page.
                    </p>
                </div>

                <button
                    type="button"
                    class="secondary-button"
                    data-page="study"
                >
                    Open Study
                </button>
            </section>

            <section class="settings-card">
                <div>
                    <p class="eyebrow">PEER HUB</p>
                    <h2>About</h2>
                    <p>
                        St Oran's Peer Hub helps students find peers,
                        organise study sessions and keep track of progress.
                    </p>
                </div>

                <div class="settings-detail">
                    <span>Version</span>
                    <strong>Prototype</strong>
                </div>
            </section>

        </div>
    `;
}

/* =========================================================
   TIMER
   ========================================================= */

function formatTime(seconds) {
    const safeSeconds = Math.max(0, seconds);

    const minutes = Math.floor(
        safeSeconds / 60
    );

    const remaining =
        safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remaining
    ).padStart(2, "0")}`;
}


function setTimerMode(mode) {
    timerRunning = false;

    clearInterval(timerInterval);

    timerMode = mode;

if (mode === "focus") {
    timerSeconds = customFocusMinutes * 60;
} else if (mode === "shortBreak") {
        timerSeconds = 5 * 60;
    } else {
        timerSeconds = 15 * 60;
    }

    /*
     * Do NOT clear activeStudyEnvironment.
     * The selected Study card should keep owning
     * the timer after the Study page re-renders.
     */
    renderPage("study");

    updateTimerDisplay();
}


function toggleTimer() {
    if (timerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}


function startTimer() {
    if (timerRunning) {
        return;
    }

    /*
     * Web Audio needs a user interaction before browsers
     * will allow sound to play.
     */
    if (activeStudyEnvironment) {
        const playlist = getStudyPlaylists().find(
            item => item.id === activeStudyEnvironment
        );

        if (playlist) {
            startStudySound(playlist.sound);
        }
    }

    timerRunning = true;

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        timerSeconds--;

        updateTimerDisplay();

        if (timerSeconds <= 0) {
            finishTimer();
        }

    }, 1000);

    updateTimerDisplay();
}


function pauseTimer() {
    timerRunning = false;

    clearInterval(timerInterval);

    stopStudySound();

    updateTimerDisplay();
}


function resetTimer() {
    clearInterval(timerInterval);

    timerRunning = false;

    stopStudySound();

   if (timerMode === "focus") {
    timerSeconds = customFocusMinutes * 60;
} else if (timerMode === "shortBreak") {
        timerSeconds = 5 * 60;
    } else {
        timerSeconds = 15 * 60;
    }

    updateTimerDisplay();
}


function updateTimerDisplay() {
    const display = $("#timerDisplay");

    if (display) {
        display.textContent =
            formatTime(timerSeconds);
    }

    const start = $("#timerStart");

    if (start) {
        start.textContent =
            timerRunning
                ? "Pause"
                : "Start";
    }

    if (activeStudyEnvironment) {

        const studyTimer =
            document.querySelector(
                `[data-study-timer="${activeStudyEnvironment}"]`
            );

        if (studyTimer) {
            studyTimer.textContent =
                formatTime(timerSeconds);
        }
    }
}


function finishTimer() {
    clearInterval(timerInterval);

    timerRunning = false;

    timerSeconds = 0;

    stopStudySound();

    updateTimerDisplay();

    if (timerMode === "focus") {

        const user =
            getCurrentUserFromData();

        updateCurrentUser({
            points:
                (user?.points || 0) + 20,

            sessions:
                (user?.sessions || 0) + 1
        });

        showToast(
            "Focus session complete! +20 points ✦"
        );

    } else {

        showToast(
            "Break finished. Back to it."
        );
    }

    setTimeout(() => {

        if (currentPage === "study") {

            renderStudy(
                $("#pageContent")
            );

            attachPageEvents();

        }

    }, 100);
}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(content) {
    const root = $("#modalRoot");

    if (!root) {
        return;
    }

    root.innerHTML = `
        <div
            class="modal-backdrop"
            data-action="close-modal"
        >

            <div
                class="modal"
                role="dialog"
                aria-modal="true"
                data-modal-content
            >

                ${content}

            </div>

        </div>
    `;

    const modal =
        $("[data-modal-content]", root);

    modal?.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );
}


function closeModal() {
    const root = $("#modalRoot");

    if (root) {
        root.innerHTML = "";
    }
}


function openAddAssignmentModal() {
    openModal(`
        <div class="card-header">

            <div>
                <p class="eyebrow">
                    NEW TASK
                </p>

                <h2>
                    Add Assignment
                </h2>
            </div>

            <button
                type="button"
                class="icon-button"
                data-action="close-modal"
                aria-label="Close"
            >
                ×
            </button>

        </div>

        <form
            id="assignmentForm"
            class="modal-form"
        >

            <div class="form-group">

                <label for="newAssignmentTitle">
                    Assignment
                </label>

                <input
                    id="newAssignmentTitle"
                    type="text"
                    required
                    placeholder="e.g. Science report"
                >

            </div>

            <div class="form-group">

                <label for="newAssignmentSubject">
                    Subject
                </label>

                <input
                    id="newAssignmentSubject"
                    type="text"
                    required
                    placeholder="e.g. Science"
                >

            </div>

            <div class="form-group">

                <label for="newAssignmentDue">
                    Due
                </label>

                <input
                    id="newAssignmentDue"
                    type="text"
                    required
                    placeholder="e.g. Friday"
                >

            </div>

            <div class="form-group">

                <label for="newAssignmentImportance">
                    Importance
                </label>

                <select id="newAssignmentImportance">
                    <option value="low">Low</option>
                    <option value="medium" selected>
                        Medium
                    </option>
                    <option value="high">High</option>
                </select>

            </div>

            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    data-action="close-modal"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    Add Assignment
                </button>

            </div>

        </form>
    `);

    $("#assignmentForm")?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const title =
                $("#newAssignmentTitle").value.trim();

            const subject =
                $("#newAssignmentSubject").value.trim();

            const due =
                $("#newAssignmentDue").value.trim();

            const importance =
                $("#newAssignmentImportance").value;

            if (!title || !subject || !due) {
                return;
            }

            appData.assignments.push({
                id: Date.now(),
                title,
                subject,
                due,
                importance,
                completed: false
            });

            saveData();

            closeModal();

            showToast(
                "Assignment added successfully."
            );

            renderPage("assignments");
        }
    );
}


function openTutorModal(tutor) {

    if (!tutor) {
        return;
    }

    openModal(`
        <div class="card-header">

            <div>
                <p class="eyebrow">
                    PEER TUTOR
                </p>

                <h2>
                    ${escapeHTML(tutor.name)}
                </h2>
            </div>

            <button
                type="button"
                class="icon-button"
                id="closeTutorModal"
                aria-label="Close"
            >
                ×
            </button>

        </div>

        <div class="modal-form">

            <p>
                ${escapeHTML(tutor.bio)}
            </p>

            <div class="tutor-subjects">

                ${tutor.subjects
                    .map(
                        subject =>
                            `<span class="subject-tag">${escapeHTML(
                                subject
                            )}</span>`
                    )
                    .join("")}

            </div>

            <p>
                <strong>Availability:</strong>
                ${escapeHTML(tutor.availability)}
            </p>

            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="closeTutorModalBottom"
                >
                    Close
                </button>

                <button
                    type="button"
                    class="primary-button"
                    data-action="request-tutor"
                    data-id="${tutor.id}"
                >
                    Request Session
                </button>

            </div>

        </div>
    `);

    $("#closeTutorModal")?.addEventListener(
        "click",
        closeModal
    );

    $("#closeTutorModalBottom")?.addEventListener(
        "click",
        closeModal
    );
}


/* =========================================================
   FOCUS MODE
   ========================================================= */

let focusAudioContext = null;
let focusSoundNodes = [];


/* -------------------------
   SETUP
   ------------------------- */

function setupFocusMode() {

    $("#focusModeClose")?.addEventListener(
        "click",
        closeFocusMode
    );

    $("#focusStart")?.addEventListener(
        "click",
        startFocusTimer
    );

    $("#focusPause")?.addEventListener(
        "click",
        pauseFocusTimer
    );

    $("#focusReset")?.addEventListener(
        "click",
        resetFocusTimer
    );

    $$(".background-option").forEach(option => {

        option.addEventListener("click", () => {

            setFocusBackground(
                option.dataset.background
            );

        });

    });

    $("#focusSpotifyButton")?.addEventListener(
        "click",
        openSpotify
    );

    createFocusBackground();
   setupDraggableSpotify();
}
function setupDraggableSpotify() {
    const player = $("#focusSpotifyEmbed");

    if (!player) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    player.addEventListener("pointerdown", event => {
    if (!event.target.closest(".spotify-drag-handle")) return;

        isDragging = true;

        const rect = player.getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        player.setPointerCapture(event.pointerId);
    });

    player.addEventListener("pointermove", event => {
        if (!isDragging) return;

        const overlay = $("#focusModeOverlay");

        if (!overlay) return;

        const overlayRect = overlay.getBoundingClientRect();

        let left = event.clientX - overlayRect.left - offsetX;
        let top = event.clientY - overlayRect.top - offsetY;

        const maxLeft = overlayRect.width - player.offsetWidth;
        const maxTop = overlayRect.height - player.offsetHeight;

        left = Math.max(0, Math.min(left, maxLeft));
        top = Math.max(0, Math.min(top, maxTop));

        player.style.left = `${left}px`;
        player.style.top = `${top}px`;
        player.style.right = "auto";
    });

    player.addEventListener("pointerup", event => {
        isDragging = false;

        if (player.hasPointerCapture(event.pointerId)) {
            player.releasePointerCapture(event.pointerId);
        }
    });

    player.addEventListener("pointercancel", () => {
        isDragging = false;
    });
}

/* -------------------------
   OPEN FOCUS MODE
   ------------------------- */

function openFocusMode(
    backgroundOverride = null,
    soundOverride = null
) {

    const overlay =
        $("#focusModeOverlay");

    if (!overlay) {
        console.error(
            "Focus Mode overlay not found."
        );

        return;
    }

    overlay.classList.add("active");

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

    focusSeconds = 25 * 60;

    focusRunning = false;

    createFocusBackground();

    const background =
        backgroundOverride ||
        currentFocusBackground ||
        "forest";

    const sound =
        soundOverride ||
        background;

    currentFocusSound = sound;

    setFocusBackground(background);

    updateFocusDisplay();
}


/* -------------------------
   OPEN STUDY ENVIRONMENT
   ------------------------- */

function openStudyEnvironmentFullscreen(playlistId) {
    const playlist = getStudyPlaylists().find(
        item => item.id === playlistId
    );

    if (!playlist) return;

    currentFocusBackground = playlist.fullscreenBackground;
    currentFocusSound = playlist.sound;

    const spotifyContainer = $("#focusSpotifyEmbed");

    if (spotifyContainer) {
        const embedUrl = getSpotifyEmbedUrl(playlist.spotify);

        spotifyContainer.innerHTML = embedUrl
            ? `
<div class="spotify-drag-handle">
    <span>⠿</span>
    <span>Drag music player</span>
</div>

<iframe
    src="${embedUrl}"
    width="100%"
    height="152"
    frameborder="0"
    allowfullscreen=""
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    loading="lazy"
    title="${playlist.title} Spotify playlist"
></iframe>
            `
            : `
                <p class="focus-spotify-placeholder">
                    🎵 Study music unavailable
                </p>
            `;
    }

    openFocusMode();
}

/* -------------------------
   CLOSE FOCUS MODE
   ------------------------- */

function closeFocusMode() {

    const overlay =
        $("#focusModeOverlay");

    if (!overlay) {
        return;
    }

    /*
     * Remove focus before hiding the overlay.
     * This prevents the aria-hidden warning.
     */
    if (
        overlay.contains(
            document.activeElement
        )
    ) {
        document.activeElement.blur();
    }

    overlay.classList.remove("active");

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );

    clearInterval(
        focusTimerInterval
    );

    focusRunning = false;

    stopStudySound();
}


/* -------------------------
   FOCUS TIMER
   ------------------------- */

function startFocusTimer() {

    if (focusRunning) {
        return;
    }

    startStudySound(
        currentFocusSound
    );

    focusRunning = true;

    clearInterval(
        focusTimerInterval
    );

    focusTimerInterval =
        setInterval(() => {

            focusSeconds--;

            updateFocusDisplay();

            if (
                focusSeconds <= 0
            ) {
                finishFocusTimer();
            }

        }, 1000);

    updateFocusDisplay();
}


function pauseFocusTimer() {

    focusRunning = false;

    clearInterval(
        focusTimerInterval
    );

    stopStudySound();

    updateFocusDisplay();
}


function resetFocusTimer() {

    focusRunning = false;

    clearInterval(
        focusTimerInterval
    );

    stopStudySound();

    focusSeconds =
        25 * 60;

    updateFocusDisplay();
}


function updateFocusDisplay() {

    const display =
        $("#focusModeTimer");

    if (display) {

        display.textContent =
            formatTime(
                focusSeconds
            );

    }

    const start =
        $("#focusStart");

    if (start) {

        start.textContent =
            focusRunning
                ? "Running"
                : "Start";

    }

    const progress =
        $("#focusProgressBar");

    if (progress) {

        const percentage =
            ((25 * 60 - focusSeconds) /
                (25 * 60)) *
            100;

        progress.style.width =
            `${Math.max(
                0,
                Math.min(
                    100,
                    percentage
                )
            )}%`;
    }
}


/* -------------------------
   FINISH FOCUS TIMER
   ------------------------- */

function finishFocusTimer() {

    clearInterval(
        focusTimerInterval
    );

    focusRunning = false;

    focusSeconds = 0;

    stopStudySound();

    updateFocusDisplay();

    const user =
        getCurrentUserFromData();

    updateCurrentUser({

        points:
            (user?.points || 0) + 20,

        sessions:
            (user?.sessions || 0) + 1

    });

    showToast(
        "Focus session complete! +20 points ✦"
    );
}


/* =========================================================
   FOCUS BACKGROUNDS
   ========================================================= */

function createFocusBackground() {
    const overlay = $("#focusModeOverlay");
    if (!overlay) return;

    let backgroundLayer = $("#focusBackgroundLayer");

    if (!backgroundLayer) {
        backgroundLayer = document.createElement("div");
        backgroundLayer.id = "focusBackgroundLayer";
        backgroundLayer.className = "focus-background-layer";
        backgroundLayer.setAttribute("aria-hidden", "true");
        overlay.prepend(backgroundLayer);
    } else {
        backgroundLayer.classList.add("focus-background-layer");
    }

    let atmosphere = $("#focusAtmosphere");

    if (!atmosphere) {
        atmosphere = document.createElement("div");
        atmosphere.id = "focusAtmosphere";
        atmosphere.className = "focus-atmosphere";
        atmosphere.setAttribute("aria-hidden", "true");
        overlay.appendChild(atmosphere);
    } else {
        atmosphere.classList.add("focus-atmosphere");
    }
}

/* -------------------------
   CHANGE BACKGROUND
   ------------------------- */

function setFocusBackground(
    background
) {

    const overlay =
        $("#focusModeOverlay");

    if (!overlay) {
        return;
    }

    createFocusBackground();

    currentFocusBackground =
        background || "forest";

    /*
     * Remove every possible environment class.
     */
   overlay.classList.remove(
    "forest",
    "rain",
    "academia",
    "night",
    "cafe",
    "lyrics"
);

    overlay.classList.add(
        currentFocusBackground
    );

    /*
     * The old background buttons still work.
     */
    $$(".background-option").forEach(
        option => {

            option.classList.toggle(
                "active",
                option.dataset.background ===
                    currentFocusBackground
            );

        }
    );

    updateFocusAtmosphere(
        currentFocusBackground
    );

    /*
     * Stop any previous environment sound.
     * The selected sound will be started by
     * the appropriate user action.
     */
    stopStudySound();
}


/* =========================================================
   ATMOSPHERE
   ========================================================= */

function updateFocusAtmosphere(
    background
) {

    const atmosphere =
        $("#focusAtmosphere");

    if (!atmosphere) {
        return;
    }

    atmosphere.innerHTML = "";


    /* -------------------------
       RAIN
       ------------------------- */

    if (background === "rain") {

        for (let i = 0; i < 90; i++) {

            const drop =
                document.createElement(
                    "span"
                );

            /*
             * Your stylesheet uses .rain-drop.
             */
            drop.className =
                "rain-drop";

            drop.style.left =
                `${Math.random() * 100}%`;

            drop.style.animationDelay =
                `${Math.random() * 1.5}s`;

            drop.style.animationDuration =
                `${0.55 + Math.random() * 0.5}s`;

            atmosphere.appendChild(
                drop
            );
        }

        return;
    }


    /* -------------------------
       NIGHT
       ------------------------- */

    if (background === "night") {

        for (let i = 0; i < 90; i++) {

            const star =
                document.createElement(
                    "span"
                );

            star.className =
                "focus-star";

            star.style.left =
                `${Math.random() * 100}%`;

            star.style.top =
                `${Math.random() * 100}%`;

            star.style.animationDelay =
                `${Math.random() * 4}s`;

            star.style.animationDuration =
                `${2 + Math.random() * 3}s`;

            atmosphere.appendChild(
                star
            );
        }

        return;
    }


    /* -------------------------
       FOREST
       ------------------------- */

    if (background === "forest") {

        for (let i = 0; i < 35; i++) {

            const particle =
                document.createElement(
                    "span"
                );

            /*
             * Your stylesheet uses .forest-leaf.
             */
            particle.className =
                "forest-leaf";

            particle.style.left =
                `${Math.random() * 100}%`;

            particle.style.top =
                `${Math.random() * 100}%`;

            particle.style.animationDelay =
                `${Math.random() * 5}s`;

            particle.style.animationDuration =
                `${4 + Math.random() * 5}s`;

            atmosphere.appendChild(
                particle
            );
        }

        return;
    }


    /* -------------------------
       ACADEMIA
       ------------------------- */

    if (background === "academia") {

        for (let i = 0; i < 40; i++) {

            const particle =
                document.createElement(
                    "span"
                );

            /*
             * Your stylesheet uses .academia-particle.
             */
            particle.className =
                "academia-particle";

            particle.style.left =
                `${Math.random() * 100}%`;

            particle.style.top =
                `${Math.random() * 100}%`;

            particle.style.animationDelay =
                `${Math.random() * 6}s`;

            particle.style.animationDuration =
                `${5 + Math.random() * 6}s`;

            atmosphere.appendChild(
                particle
            );
        }

        return;
    }


    /* -------------------------
       CAFE / LYRICS
       ------------------------- */

    if (
        background === "cafe" ||
        background === "lyrics"
    ) {

        /*
         * Use subtle floating particles rather
         * than leaving the atmosphere completely empty.
         */
        for (let i = 0; i < 24; i++) {

            const particle =
                document.createElement(
                    "span"
                );

            particle.className =
                "academia-particle";

            particle.style.left =
                `${Math.random() * 100}%`;

            particle.style.top =
                `${Math.random() * 100}%`;

            particle.style.animationDelay =
                `${Math.random() * 6}s`;

            particle.style.animationDuration =
                `${6 + Math.random() * 6}s`;

            atmosphere.appendChild(
                particle
            );
        }
    }
}


/* =========================================================
   STUDY ENVIRONMENT SOUND
   ========================================================= */

function getAudioContext() {

    if (!focusAudioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        focusAudioContext =
            new AudioContext();
    }

    if (
        focusAudioContext.state ===
        "suspended"
    ) {

        focusAudioContext.resume();

    }

    return focusAudioContext;
}


function createNoiseSource(
    context,
    type = "white"
) {

    const bufferSize =
        context.sampleRate * 2;

    const buffer =
        context.createBuffer(
            1,
            bufferSize,
            context.sampleRate
        );

    const data =
        buffer.getChannelData(0);

    let lastValue = 0;

    for (
        let i = 0;
        i < bufferSize;
        i++
    ) {

        const random =
            Math.random() * 2 - 1;

        if (type === "brown") {

            lastValue =
                (lastValue + 0.02 * random) /
                1.02;

            data[i] =
                lastValue * 3.5;

        } else if (
            type === "pink"
        ) {

            lastValue =
                0.98 * lastValue +
                0.02 * random;

            data[i] =
                lastValue;

        } else {

            data[i] =
                random;
        }
    }

    const source =
        context.createBufferSource();

    source.buffer = buffer;
    source.loop = true;

    return source;
}


function addAmbientNoise(
    context,
    type,
    volume,
    filterType,
    frequency
) {

    const source =
        createNoiseSource(
            context,
            type
        );

    const filter =
        context.createBiquadFilter();

    filter.type =
        filterType;

    filter.frequency.value =
        frequency;

    const gain =
        context.createGain();

    gain.gain.value =
        volume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(
        context.destination
    );

    source.start();

    focusSoundNodes.push(
        source,
        filter,
        gain
    );
}


function addAmbientTone(
    context,
    frequency,
    volume,
    waveform = "sine"
) {

    const oscillator =
        context.createOscillator();

    const gain =
        context.createGain();

    oscillator.type =
        waveform;

    oscillator.frequency.value =
        frequency;

    gain.gain.value =
        volume;

    oscillator.connect(gain);

    gain.connect(
        context.destination
    );

    oscillator.start();

    focusSoundNodes.push(
        oscillator,
        gain
    );
}


function startStudySound(
    sound
) {

    stopStudySound();

    const context =
        getAudioContext();

    if (!context) {
        return;
    }

    try {

        switch (sound) {

            case "rain":

                addAmbientNoise(
                    context,
                    "white",
                    0.035,
                    "lowpass",
                    1800
                );

                addAmbientNoise(
                    context,
                    "pink",
                    0.018,
                    "highpass",
                    350
                );

                break;


            case "cafe":

                addAmbientNoise(
                    context,
                    "pink",
                    0.012,
                    "lowpass",
                    900
                );

                addAmbientTone(
                    context,
                    92,
                    0.012,
                    "sine"
                );

                addAmbientTone(
                    context,
                    184,
                    0.004,
                    "sine"
                );

                break;


            case "forest":

                addAmbientNoise(
                    context,
                    "pink",
                    0.025,
                    "lowpass",
                    750
                );

                addAmbientTone(
                    context,
                    110,
                    0.006,
                    "sine"
                );

                break;


            case "academia":

                addAmbientNoise(
                    context,
                    "brown",
                    0.018,
                    "lowpass",
                    1200
                );

                addAmbientTone(
                    context,
                    65,
                    0.008,
                    "triangle"
                );

                break;


            case "midnight":

                addAmbientNoise(
                    context,
                    "pink",
                    0.012,
                    "lowpass",
                    500
                );

                addAmbientTone(
                    context,
                    55,
                    0.008,
                    "sine"
                );

                addAmbientTone(
                    context,
                    110,
                    0.003,
                    "sine"
                );

                break;


            case "minimal":

                addAmbientNoise(
                    context,
                    "brown",
                    0.009,
                    "lowpass",
                    600
                );

                break;

            default:
                break;
        }

    } catch (error) {

        console.warn(
            "Study sound could not start:",
            error
        );

        stopStudySound();
    }
}


function stopStudySound() {

    if (
        !focusSoundNodes ||
        focusSoundNodes.length === 0
    ) {
        return;
    }

    focusSoundNodes.forEach(
        node => {

            try {

                if (
                    typeof node.stop ===
                    "function"
                ) {
                    node.stop();
                }

            } catch (error) {
                // Already stopped.
            }

            try {
                node.disconnect();
            } catch (error) {
                // Already disconnected.
            }
        }
    );

    focusSoundNodes = [];
}


/* =========================================================
   GLOBAL CLICK HANDLING
   ========================================================= */

function setupGlobalClicks() {

    document.addEventListener(
        "click",
        event => {

            const actionElement =
                event.target.closest(
                    "[data-action]"
                );

            if (!actionElement) {
                return;
            }

            const action =
                actionElement.dataset.action;

            switch (action) {

                case "find-peer":
                    navigateTo("tutors");
                    break;

                case "assignments":
                    navigateTo("assignments");
                    break;

                case "study":
                    navigateTo("study");
                    break;

                case "toggle-assignment":
                    toggleAssignment(
                        actionElement.dataset.id
                    );
                    break;

                case "add-assignment":
                    openAddAssignmentModal();
                    break;

                case "close-modal":
                    closeModal();
                    break;

                case "view-tutor": {

                    const tutor =
                        appData.tutors.find(
                            item =>
                                String(item.id) ===
                                String(
                                    actionElement.dataset.id
                                )
                        );

                    openTutorModal(tutor);

                    break;
                }

                case "book-tutor":
                case "request-tutor": {

                    const tutor =
                        appData.tutors.find(
                            item =>
                                String(item.id) ===
                                String(
                                    actionElement.dataset.id
                                )
                        );

                    requestTutor(tutor);

                    break;
                }

                case "spotify":
                    openSpotify();
                    break;

                case "sign-out":
                    signOut();
                    break;

                case "reset-data":
                    resetApplicationData();
                    break;
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal();

                if (
                    $("#focusModeOverlay")
                        ?.classList
                        .contains("active")
                ) {

                    closeFocusMode();

                }

            }

        }
    );
}


/* =========================================================
   PAGE EVENT ATTACHMENT
   ========================================================= */

function attachPageEvents() {

    /* -------------------------
       Calendar
       ------------------------- */

    $$("[data-calendar-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset
                            .calendarAction;

                    if (
                        action ===
                        "previous"
                    ) {

                        selectedCalendarDate =
                            new Date(
                                selectedCalendarDate
                                    .getFullYear(),
                                selectedCalendarDate
                                    .getMonth() - 1,
                                1
                            );

                        renderPage(
                            "calendar"
                        );
                    }

                    if (
                        action ===
                        "next"
                    ) {

                        selectedCalendarDate =
                            new Date(
                                selectedCalendarDate
                                    .getFullYear(),
                                selectedCalendarDate
                                    .getMonth() + 1,
                                1
                            );

                        renderPage(
                            "calendar"
                        );
                    }

                    if (
                        action ===
                        "today"
                    ) {

                        selectedCalendarDate =
                            new Date();

                        renderPage(
                            "calendar"
                        );
                    }

                }
            );

        });


    $$("[data-calendar-date]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const dateString =
                        button.dataset
                            .calendarDate;

                    const parts =
                        dateString
                            .split("-")
                            .map(Number);

                    selectedCalendarDate =
                        new Date(
                            parts[0],
                            parts[1] - 1,
                            parts[2]
                        );

                    renderPage(
                        "calendar"
                    );

                }
            );

        });


    /* -------------------------
       Tutor filtering
       ------------------------- */

    $("#tutorSearch")
        ?.addEventListener(
            "input",
            filterTutors
        );

    $("#subjectFilter")
        ?.addEventListener(
            "change",
            filterTutors
        );


    /* -------------------------
       Study timer
       ------------------------- */

    $("#timerStart")
        ?.addEventListener(
            "click",
            toggleTimer
        );

    $("#timerReset")
        ?.addEventListener(
            "click",
            resetTimer
        );

    $("#timerFocusMode")
        ?.addEventListener(
            "click",
            () => {

                const playlist =
                    activeStudyEnvironment
                        ? getStudyPlaylists()
                            .find(
                                item =>
                                    item.id ===
                                    activeStudyEnvironment
                            )
                        : null;

                if (playlist) {

                    openFocusMode(
                        playlist.fullscreenBackground,
                        playlist.sound
                    );

                } else {

                    openFocusMode();

                }

            }
        );


    $$("[data-timer-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setTimerMode(
                        button.dataset
                            .timerMode
                    );

                }
            );

        });

    $$("[data-playlist-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    const action =
                        button.dataset
                            .playlistAction;

                    const playlistId =
                        button.dataset
                            .playlistId;

                    if (
                        action ===
                        "fullscreen"
                    ) {

                        const playlist =
                            getStudyPlaylists()
                                .find(
                                    item =>
                                        item.id ===
                                        playlistId
                                );

                        if (!playlist) {
                            console.error(
                                "Study playlist not found:",
                                playlistId
                            );
                            return;
                        }

                        activeStudyEnvironment =
                            playlistId;

                        openFocusMode(
                            playlist.fullscreenBackground,
                            playlist.sound
                        );

                        return;
                    }

                }
            );

        });
    /* -------------------------
       Study environments
       ------------------------- */

    $$("[data-playlist-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const action =
                        button.dataset
                            .playlistAction;

                    const playlistId =
                        button.dataset
                            .playlistId;

                    const playlist =
                        getStudyPlaylists()
                            .find(
                                item =>
                                    item.id ===
                                    playlistId
                            );

                    if (!playlist) {
                        return;
                    }


                    /* -------------------------
                       OPEN SPOTIFY PLAYLIST
                       ------------------------- */

                    if (
                        action === "open"
                    ) {

                        window.open(
                            playlist.spotify,
                            "_blank",
                            "noopener,noreferrer"
                        );

                        return;
                    }


                    /* -------------------------
                       START STUDY CARD
                       ------------------------- */

                    if (
                        action === "start"
                    ) {

                        /*
                         * THIS is the important part.
                         * The timer now knows which
                         * Study card owns it.
                         */
                        activeStudyEnvironment =
                            playlistId;

                        currentFocusBackground =
                            playlist.fullscreenBackground;

                        currentFocusSound =
                            playlist.sound;

                        /*
                         * Always use a fresh 25-minute
                         * focus timer when changing into
                         * a Study environment.
                         */
                        if (
                            timerMode !==
                            "focus"
                        ) {

                            timerMode =
                                "focus";

                            timerSeconds =
                                25 * 60;

                        }

                        /*
                         * If the timer isn't running,
                         * start it.
                         */
                        if (!timerRunning) {

                            startTimer();

                        } else {

                            /*
                             * If another environment was
                             * already running, just move
                             * the displayed timer to this
                             * card and switch its sound.
                             */
                            startStudySound(
                                playlist.sound
                            );

                            updateTimerDisplay();

                        }

                        showToast(
                            `${playlist.title} started.`
                        );

                        return;
                    }


                    /* -------------------------
                       FULLSCREEN
                       ------------------------- */

                    if (
                        action ===
                        "fullscreen"
                    ) {

                        activeStudyEnvironment =
                            playlistId;

                        currentFocusBackground =
                            playlist.fullscreenBackground;

                        currentFocusSound =
                            playlist.sound;

                        openStudyEnvironmentFullscreen(
                            playlistId
                        );

                        return;
                    }

                }
            );

        });


    /* -------------------------
       Settings
       ------------------------- */

    $$("[data-setting]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const setting =
                        button.dataset.setting;

                    if (
                        !Object.prototype
                            .hasOwnProperty.call(
                                appData.settings,
                                setting
                            )
                    ) {
                        return;
                    }

                    appData.settings[setting] =
                        !appData.settings[setting];

                    saveData();

                    updateTopbar();

                    renderPage(
                        "settings"
                    );

                    showToast(
                        `${setting
                            .charAt(0)
                            .toUpperCase() +
                            setting.slice(1)
                        } ${
                            appData.settings[
                                setting
                            ]
                                ? "enabled"
                                : "disabled"
                        }.`
                    );

                }
            );

        });
}


/* =========================================================
   TUTOR REQUEST
   ========================================================= */

function requestTutor(tutor) {

    if (!tutor) {
        return;
    }

    closeModal();

    showToast(
        `Session request sent to ${tutor.name}. ✦`
    );
}


/* =========================================================
   SPOTIFY
   ========================================================= */

function openSpotify() {

    window.open(
        "https://open.spotify.com/",
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   SIGN OUT
   ========================================================= */

function signOut() {

    clearInterval(
        timerInterval
    );

    clearInterval(
        focusTimerInterval
    );

    stopStudySound();

    timerRunning = false;

    focusRunning = false;

    currentUser = null;

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    currentPage = "home";

    closeModal();

    closeFocusMode();

    showAuth();

    showToast(
        "You've been signed out."
    );
}


/* =========================================================
   RESET DATA
   ========================================================= */

function resetApplicationData() {

    const confirmed =
        window.confirm(
            "Reset the Peer Hub demo data?"
        );

    if (!confirmed) {
        return;
    }

    appData =
        structuredClone(
            DEFAULT_DATA
        );

    saveData();

    const demo =
        appData.users.find(
            user =>
                user.id ===
                "demo-maya"
        );

    currentUser = demo;

    saveCurrentUser();

    showToast(
        "Demo data has been reset."
    );

    updateTopbar();

    navigateTo("home");
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout = null;


function showToast(message) {

    const toast =
        $("#toast");

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimeout
    );

    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3200);
}


/* =========================================================
   ACCESSIBILITY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "/" &&
            ![
                "INPUT",
                "TEXTAREA",
                "SELECT"
            ].includes(
                document.activeElement
                    ?.tagName
            )
        ) {

            event.preventDefault();

            if (
                currentPage !==
                "tutors"
            ) {

                navigateTo(
                    "tutors"
                );

            }

            setTimeout(() => {

                $("#tutorSearch")
                    ?.focus();

            }, 100);

        }

    }
);


/* =========================================================
   PREVENT ACCIDENTAL FORM SUBMISSIONS
   ========================================================= */

document.addEventListener(
    "submit",
    event => {

        const form =
            event.target;

        if (
            form.id !==
                "signinForm" &&
            form.id !==
                "signupForm" &&
            form.id !==
                "assignmentForm"
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================================
   END OF SCRIPT
   ========================================================= */
