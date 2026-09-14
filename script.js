```javascript
"use strict";

/* =========================================================
   ST ORAN'S PEER HUB
   MAIN JAVASCRIPT
   ========================================================= */

const STORAGE_KEY = "stOransPeerHubPrototype";
const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";


/* =========================================================
   DEFAULT DATA
   ========================================================= */

const defaultData = {
    users: [
        {
            id: "demo-maya",
            name: "Maya Smith",
            email: "maya.smith@storans.school.nz",
            password: "maya123",
            year: "Year 8",
            className: "8WI",

            points: 240,

            assignments: [],

            events: [],

            notifications: [],

            bookings: [],

            progress: [80, 110, 145, 175, 210, 240],

            studySessions: 0,

            settings: {
                notifications: true,
                motivation: true
            },

            focusBackground: "forest"
        }
    ]
};


/* =========================================================
   STATIC TUTORS
   ========================================================= */

const tutors = [
    {
        id: "lucy",
        name: "Lucy Worthington",
        year: "Year 13",
        subjects: ["English", "Essay Writing", "Literacy"],
        availability: "Mon–Thu after 3:30pm"
    },
    {
        id: "aisha",
        name: "Aisha Patel",
        year: "Year 12",
        subjects: ["Maths", "Algebra", "Statistics"],
        availability: "Tue & Fri lunchtimes"
    },
    {
        id: "sophie",
        name: "Sophie Chen",
        year: "Year 11",
        subjects: ["Science", "Biology", "Chemistry"],
        availability: "Mon & Wed after school"
    },
    {
        id: "mia",
        name: "Mia Thompson",
        year: "Year 10",
        subjects: ["French", "Te Reo Māori"],
        availability: "Most lunchtimes"
    },
    {
        id: "noah",
        name: "Noah Wilson",
        year: "Year 13",
        subjects: ["Physics", "Maths", "Graphs"],
        availability: "Evenings & weekends"
    },
    {
        id: "ella",
        name: "Ella Brown",
        year: "Year 12",
        subjects: ["History", "Social Studies"],
        availability: "Thu after 4pm"
    }
];


/* =========================================================
   APP STATE
   ========================================================= */

let appData = null;
let currentUser = null;

let currentPage = "home";

let currentCalendarDate = new Date();

let selectedCalendarDate = new Date();

let timer = {
    mode: "focus",
    focusMinutes: 25,
    breakMinutes: 5,
    remainingSeconds: 25 * 60,
    running: false,
    interval: null
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = selector => document.querySelector(selector);

const $$ = selector => [...document.querySelectorAll(selector)];


/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function getInitials(name) {
    return String(name || "Student")
        .split(" ")
        .map(part => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}


function todayISO() {
    return formatISODate(new Date());
}


function formatISODate(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function parseISODate(value) {
    if (!value) return new Date();

    const parts = value.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}


function formatPrettyDate(dateString) {
    if (!dateString) return "";

    const date = parseISODate(dateString);

    return date.toLocaleDateString("en-NZ", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}


function formatLongDate(dateString) {
    if (!dateString) return "";

    const date = parseISODate(dateString);

    return date.toLocaleDateString("en-NZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


function getMonthName(date) {
    return date.toLocaleDateString("en-NZ", {
        month: "long",
        year: "numeric"
    });
}


/* =========================================================
   TIME GREETING
   ========================================================= */

function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
        return "Good afternoon";
    }

    if (hour >= 17 && hour < 21) {
        return "Good evening";
    }

    return "Good night";
}


/* =========================================================
   QUOTES
   ========================================================= */

const quotes = [
    "Small progress is still progress.",
    "You do not need to finish everything today.",
    "Future you will be very grateful.",
    "One focused session can change the whole afternoon.",
    "Start before you feel ready.",
    "Your brain is allowed to take breaks.",
    "A little consistency beats a heroic last-minute panic."
];


function getDailyQuote() {
    const day = Math.floor(
        Date.now() / 86400000
    );

    return quotes[day % quotes.length];
}


/* =========================================================
   RORAN
   ========================================================= */

const roranMessages = [
    "One task at a time. Humans apparently work better that way.",
    "You don't have to be perfect. You just have to start.",
    "A focused 25 minutes is better than an hour of pretending to study.",
    "Drink some water. Roran has spoken.",
    "Your assignment is not going to complete itself. Tragic, really.",
    "Tiny progress still counts.",
    "Future you is quietly cheering."
];


function getRoranMessage() {
    const index =
        Math.floor(Date.now() / 86400000) %
        roranMessages.length;

    return roranMessages[index];
}


/* =========================================================
   DATA NORMALISATION
   ========================================================= */

function normaliseUser(user) {

    return {
        id: user.id || `user-${Date.now()}`,

        name: user.name || "Student",

        email: user.email || "",

        password: user.password || "",

        year: user.year || "Year 8",

        className: user.className || "",

        points: Number(user.points) || 0,

        assignments: Array.isArray(user.assignments)
            ? user.assignments
            : [],

        events: Array.isArray(user.events)
            ? user.events
            : [],

        notifications: Array.isArray(user.notifications)
            ? user.notifications
            : [],

        bookings: Array.isArray(user.bookings)
            ? user.bookings
            : [],

        progress: Array.isArray(user.progress)
            ? user.progress
            : [0],

        studySessions: Number(user.studySessions) || 0,

        settings: {
            notifications:
                user.settings?.notifications !== false,

            motivation:
                user.settings?.motivation !== false
        },

        focusBackground:
            user.focusBackground || "forest"
    };
}


/* =========================================================
   STORAGE
   ========================================================= */

function saveData() {

    if (!appData) return;

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );

    if (currentUser) {
        localStorage.setItem(
            CURRENT_USER_KEY,
            currentUser.id
        );
    }
}


function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {

            return structuredClone(defaultData);
        }

        const parsed = JSON.parse(saved);

        if (!parsed || !Array.isArray(parsed.users)) {

            return structuredClone(defaultData);
        }

        parsed.users =
            parsed.users.map(normaliseUser);

        return parsed;

    } catch (error) {

        console.error(
            "Could not load saved data:",
            error
        );

        return structuredClone(defaultData);
    }
}


/* =========================================================
   USER UPDATE
   ========================================================= */

function updateCurrentUser(updates) {

    if (!currentUser || !appData) return;

    const index =
        appData.users.findIndex(
            user => user.id === currentUser.id
        );

    if (index === -1) return;

    appData.users[index] = {
        ...normaliseUser(appData.users[index]),
        ...updates
    };

    currentUser =
        normaliseUser(appData.users[index]);

    appData.users[index] =
        currentUser;

    saveData();
}


/* =========================================================
   AUTH
   ========================================================= */

function setupAuth() {

    $$(".auth-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            const type =
                tab.dataset.auth;

            $$(".auth-tab").forEach(button =>
                button.classList.remove("active")
            );

            tab.classList.add("active");

            $("#signinForm")
                .classList.toggle(
                    "hidden",
                    type !== "signin"
                );

            $("#signupForm")
                .classList.toggle(
                    "hidden",
                    type !== "signup"
                );
        });
    });


    $("#signinForm").addEventListener(
        "submit",
        handleSignIn
    );


    $("#signupForm").addEventListener(
        "submit",
        handleSignUp
    );


    $("#googleDemo").addEventListener(
        "click",
        () => {

            const demo =
                appData.users.find(
                    user => user.id === "demo-maya"
                );

            if (demo) {
                loginUser(demo);
                showToast(
                    "Demo Google sign-in successful."
                );
            }
        }
    );
}


function isValidSchoolEmail(email) {

    return /^[a-zA-Z0-9._%+-]+@storans\.school\.nz$/i
        .test(email);
}


function handleSignIn(event) {

    event.preventDefault();

    const email =
        $("#loginEmail").value
            .trim()
            .toLowerCase();

    const password =
        $("#loginPassword").value;

    const user =
        appData.users.find(
            item =>
                item.email.toLowerCase() === email &&
                item.password === password
        );

    if (!user) {

        showToast(
            "Incorrect school email or password."
        );

        return;
    }

    loginUser(user);
}


function handleSignUp(event) {

    event.preventDefault();

    const name =
        $("#signupName").value.trim();

    const email =
        $("#signupEmail").value
            .trim()
            .toLowerCase();

    const year =
        $("#signupYear").value;

    const password =
        $("#signupPassword").value;

    if (!isValidSchoolEmail(email)) {

        showToast(
            "Please use your @storans.school.nz school email."
        );

        return;
    }

    if (password.length < 6) {

        showToast(
            "Password must be at least 6 characters."
        );

        return;
    }

    const exists =
        appData.users.some(
            user =>
                user.email.toLowerCase() === email
        );

    if (exists) {

        showToast(
            "An account with that email already exists."
        );

        return;
    }

    const newUser = normaliseUser({

        id: `user-${Date.now()}`,

        name,

        email,

        password,

        year,

        className: "",

        points: 0,

        assignments: [],

        events: [],

        notifications: [],

        bookings: [],

        progress: [0],

        studySessions: 0,

        settings: {
            notifications: true,
            motivation: true
        },

        focusBackground: "forest"

    });

    appData.users.push(newUser);

    saveData();

    loginUser(newUser);

    showToast(
        "Account created. Welcome to St Oran's Peer Hub! 🌿"
    );
}


function loginUser(user) {

    currentUser =
        normaliseUser(user);

    const index =
        appData.users.findIndex(
            item => item.id === currentUser.id
        );

    if (index !== -1) {
        appData.users[index] =
            currentUser;
    }

    localStorage.setItem(
        CURRENT_USER_KEY,
        currentUser.id
    );

    $("#authScreen")
        .classList.add("hidden");

    $("#app")
        .classList.remove("hidden");

    currentPage = "home";

    renderPage();

    updateTopBar();
}


function logout() {

    if (timer.interval) {
        clearInterval(timer.interval);
    }

    timer.running = false;
    timer.interval = null;

    currentUser = null;

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    $("#app")
        .classList.add("hidden");

    $("#authScreen")
        .classList.remove("hidden");

    $("#loginPassword").value = "";

    showToast("Signed out.");
}


function restoreSession() {

    appData = loadData();

    const savedUserId =
        localStorage.getItem(
            CURRENT_USER_KEY
        );

    if (!savedUserId) return;

    const user =
        appData.users.find(
            item => item.id === savedUserId
        );

    if (user) {

        currentUser =
            normaliseUser(user);

        $("#authScreen")
            .classList.add("hidden");

        $("#app")
            .classList.remove("hidden");

        renderPage();

        updateTopBar();
    }
}


/* =========================================================
   TOP BAR
   ========================================================= */

function updateTopBar() {

    if (!currentUser) return;

    $("#avatar").textContent =
        getInitials(currentUser.name);

    $("#topName").textContent =
        currentUser.name.split(" ")[0];

    const unread =
        currentUser.notifications.some(
            notification => !notification.read
        );

    $("#notifDot")
        .classList.toggle(
            "hidden",
            !unread
        );
}


function setupTopBar() {

    $("#notificationBtn")
        .addEventListener(
            "click",
            showNotifications
        );

    $("#profileTop")
        .addEventListener(
            "click",
            () => navigate("profile")
        );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    $$(".nav-item").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                navigate(
                    button.dataset.page
                );
            }
        );
    });
}


function navigate(page) {

    currentPage = page;

    $$(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    renderPage();
}


function renderPage() {

    if (!currentUser) return;

    const content =
        $("#pageContent");

    content.innerHTML = "";

    switch (currentPage) {

        case "home":
            renderHome(content);
            break;

        case "calendar":
            renderCalendarPage(content);
            break;

        case "assignments":
            renderAssignmentsPage(content);
            break;

        case "tutors":
            renderTutorsPage(content);
            break;

        case "study":
            renderStudyPage(content);
            break;

        case "profile":
            renderProfilePage(content);
            break;

        case "settings":
            renderSettingsPage(content);
            break;

        default:
            renderHome(content);
    }

    updateTopBar();
}


/* =========================================================
   HOME
   ========================================================= */

function renderHome(content) {

    const assignments =
        currentUser.assignments
            .filter(item => !item.completed)
            .sort(
                (a, b) =>
                    a.dueDate.localeCompare(b.dueDate)
            );

    const nextAssignments =
        assignments.slice(0, 4);

    content.innerHTML = `

        <div class="home-hero">

            <h1>
                ${getGreeting()},
                ${escapeHTML(
                    currentUser.name.split(" ")[0]
                )}
            </h1>

            <p>
                ${getDailyQuote()}
            </p>

            <div class="home-hero-dragon">
                🐉
            </div>

        </div>


        <div class="stats-grid">

            <div class="card stat-card">
                <div class="stat-icon">⭐</div>

                <span class="stat-number">
                    ${currentUser.points}
                </span>

                <span class="stat-label">
                    Peer Points
                </span>
            </div>


            <div class="card stat-card">
                <div class="stat-icon">📚</div>

                <span class="stat-number">
                    ${assignments.length}
                </span>

                <span class="stat-label">
                    Open Assignments
                </span>
            </div>


            <div class="card stat-card">
                <div class="stat-icon">⏱</div>

                <span class="stat-number">
                    ${currentUser.studySessions}
                </span>

                <span class="stat-label">
                    Study Sessions
                </span>
            </div>


            <div class="card stat-card">
                <div class="stat-icon">🐉</div>

                <span class="stat-number">
                    ${currentUser.bookings.length}
                </span>

                <span class="stat-label">
                    Peer Sessions
                </span>
            </div>

        </div>


        <div class="home-grid">

            <div class="home-left">

                <div class="card card-padding">

                    <div class="card-header">
                        <h2>Upcoming Work</h2>

                        <button
                            class="secondary-button"
                            id="homeAssignments"
                        >
                            View all
                        </button>
                    </div>

                    <div class="assignment-list">

                        ${
                            nextAssignments.length
                                ? nextAssignments
                                    .map(
                                        renderAssignmentItem
                                    )
                                    .join("")
                                : `
                                    <div class="empty-state">
                                        🎉 No outstanding assignments.
                                        Enjoy the rare moment.
                                    </div>
                                `
                        }

                    </div>

                </div>


                <div class="card card-padding">

                    <div class="card-header">
                        <h2>Mini Calendar</h2>

                        <button
                            class="secondary-button"
                            id="homeCalendar"
                        >
                            Open Calendar
                        </button>
                    </div>

                    ${renderMiniCalendar()}

                </div>

            </div>


            <div class="home-right">

                <div class="card roran-card">

                    <div class="roran-main">

                        <div class="roran-art">
                            🐉
                        </div>

                        <div class="roran-content">

                            <h3>
                                Meet St Roran
                            </h3>

                            <p>
                                Your personal study dragon.
                                He takes studying very seriously.
                            </p>

                        </div>

                    </div>

                    <div class="roran-quote">
                        “${getRoranMessage()}”
                    </div>

                </div>


                <div class="card card-padding">

                    <div class="card-header">
                        <h2>Recommended Peers</h2>
                    </div>

                    ${renderPeerCard(tutors[0])}
                    ${renderPeerCard(tutors[1])}

                </div>

            </div>

        </div>
    `;

    bindHomeEvents();
}


function renderAssignmentItem(assignment) {

    return `
        <div class="assignment-row">

            <input
                class="assignment-check"
                type="checkbox"
                data-assignment-check="${assignment.id}"
                ${
                    assignment.completed
                        ? "checked"
                        : ""
                }
            >

            <div>

                <div class="assignment-title">
                    ${escapeHTML(
                        assignment.title
                    )}
                </div>

                <div class="assignment-meta">

                    <span>
                        Due ${formatPrettyDate(
                            assignment.dueDate
                        )}
                    </span>

                    <span class="importance ${
                        assignment.importance || "medium"
                    }">
                        ${
                            assignment.importance ||
                            "Medium"
                        }
                    </span>

                </div>

            </div>

        </div>
    `;
}


function renderPeerCard(tutor) {

    return `
        <div
            class="assignment-row"
            style="margin-bottom:9px;"
        >

            <div class="tutor-avatar"
                style="width:40px;height:40px;margin:0;"
            >
                ${getInitials(tutor.name)}
            </div>

            <div>

                <div class="assignment-title">
                    ${escapeHTML(tutor.name)}
                </div>

                <div class="assignment-meta">
                    ${tutor.subjects
                        .slice(0, 2)
                        .map(
                            subject =>
                                `<span>${escapeHTML(subject)}</span>`
                        )
                        .join(" · ")}
                </div>

            </div>

        </div>
    `;
}


function renderMiniCalendar() {

    const start =
        new Date(currentCalendarDate);

    const day =
        start.getDay();

    const diff =
        day === 0 ? -6 : 1 - day;

    start.setDate(
        start.getDate() + diff
    );

    let html =
        `<div class="calendar-grid">`;

    [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ].forEach(dayName => {

        html += `
            <div class="calendar-weekday">
                ${dayName}
            </div>
        `;
    });


    for (let i = 0; i < 14; i++) {

        const date =
            new Date(start);

        date.setDate(
            start.getDate() + i
        );

        const iso =
            formatISODate(date);

        const isToday =
            iso === todayISO();

        const hasEvent =
            getItemsForDate(iso).length > 0;

        html += `

            <button
                class="calendar-day ${
                    isToday
                        ? "today"
                        : ""
                }"
                data-mini-date="${iso}"
                style="min-height:58px;"
            >

                <span class="day-number">
                    ${date.getDate()}
                </span>

                ${
                    hasEvent
                        ? `
                            <div class="day-events">
                                <span class="calendar-event-dot">
                                    •
                                </span>
                            </div>
                        `
                        : ""
                }

            </button>
        `;
    }

    html += `</div>`;

    return html;
}


function bindHomeEvents() {

    $("#homeAssignments")
        ?.addEventListener(
            "click",
            () => navigate("assignments")
        );

    $("#homeCalendar")
        ?.addEventListener(
            "click",
            () => navigate("calendar")
        );


    $$("[data-assignment-check]")
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    completeAssignment(
                        input.dataset.assignmentCheck,
                        input.checked
                    );
                }
            );
        });


    $$("[data-mini-date]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedCalendarDate =
                        parseISODate(
                            button.dataset.miniDate
                        );

                    navigate("calendar");
                }
            );
        });
}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendarPage(content) {

    content.innerHTML = `

        <div class="page-header">

            <h1>Calendar</h1>

            <p>
                Keep assignments, events and study sessions in one place.
            </p>

        </div>


        <div class="calendar-toolbar">

            <div class="calendar-nav">

                <button id="prevMonth">
                    ‹
                </button>

                <button id="nextMonth">
                    ›
                </button>

                <button
                    id="calendarToday"
                    class="calendar-today"
                >
                    Today
                </button>

            </div>

            <h2>
                ${getMonthName(currentCalendarDate)}
            </h2>

            <button
                id="addEventButton"
                class="primary-button"
            >
                + Add Event
            </button>

        </div>


        <div class="calendar-layout">

            <div class="card calendar-card">

                ${renderFullCalendar()}

            </div>


            <div
                id="selectedDayPanel"
                class="card selected-day-card"
            >

                ${renderSelectedDay()}

            </div>

        </div>
    `;

    bindCalendarEvents();
}


function getItemsForDate(dateISO) {

    const assignments =
        currentUser.assignments
            .filter(
                assignment =>
                    assignment.dueDate === dateISO
            )
            .map(assignment => ({
                type: "assignment",
                title: assignment.title,
                time: "Due",
                id: assignment.id
            }));


    const events =
        currentUser.events
            .filter(
                event =>
                    event.date === dateISO
            )
            .map(event => ({
                type: "event",
                title: event.title,
                time: event.time || "",
                id: event.id
            }));


    return [
        ...assignments,
        ...events
    ];
}


function renderFullCalendar() {

    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();

    const firstDay =
        new Date(year, month, 1);

    const lastDay =
        new Date(year, month + 1, 0);

    let startingDay =
        firstDay.getDay();

    startingDay =
        startingDay === 0
            ? 6
            : startingDay - 1;


    const totalDays =
        lastDay.getDate();

    const previousMonthDays =
        new Date(
            year,
            month,
            0
        ).getDate();


    let html =
        `<div class="calendar-grid">`;


    [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ].forEach(dayName => {

        html += `
            <div class="calendar-weekday">
                ${dayName}
            </div>
        `;
    });


    for (let i = startingDay - 1; i >= 0; i--) {

        const date =
            new Date(
                year,
                month - 1,
                previousMonthDays - i
            );

        html += renderCalendarDay(
            date,
            true
        );
    }


    for (let day = 1; day <= totalDays; day++) {

        const date =
            new Date(
                year,
                month,
                day
            );

        html += renderCalendarDay(
            date,
            false
        );
    }


    const totalCells =
        startingDay + totalDays;

    const remaining =
        totalCells % 7 === 0
            ? 0
            : 7 - (totalCells % 7);


    for (let day = 1; day <= remaining; day++) {

        const date =
            new Date(
                year,
                month + 1,
                day
            );

        html += renderCalendarDay(
            date,
            true
        );
    }


    html += `</div>`;

    return html;
}


function renderCalendarDay(
    date,
    otherMonth
) {

    const iso =
        formatISODate(date);

    const items =
        getItemsForDate(iso);

    const isToday =
        iso === todayISO();

    const isSelected =
        iso ===
        formatISODate(
            selectedCalendarDate
        );


    return `
        <button
            class="calendar-day
                ${otherMonth ? "other-month" : ""}
                ${isToday ? "today" : ""}
                ${isSelected ? "selected" : ""}
            "
            data-calendar-date="${iso}"
        >

            <span class="day-number">
                ${date.getDate()}
            </span>

            <div class="day-events">

                ${items
                    .slice(0, 3)
                    .map(
                        item => `
                            <span
                                class="calendar-event-dot"
                            >
                                ${escapeHTML(
                                    item.title
                                )}
                            </span>
                        `
                    )
                    .join("")}

            </div>

        </button>
    `;
}


function renderSelectedDay() {

    const iso =
        formatISODate(
            selectedCalendarDate
        );

    const items =
        getItemsForDate(iso);


    return `

        <div class="selected-day-date">
            ${formatLongDate(iso)}
        </div>


        ${
            items.length
                ? items
                    .map(
                        item => `
                            <div class="day-item">

                                <strong>
                                    ${
                                        item.type ===
                                        "assignment"
                                            ? "📚 "
                                            : "🗓 "
                                    }

                                    ${escapeHTML(
                                        item.title
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        item.time
                                    )}
                                </span>

                            </div>
                        `
                    )
                    .join("")
                : `
                    <div class="empty-state">
                        🌿 Nothing scheduled.
                        A suspiciously peaceful day.
                    </div>
                `
        }

    `;
}


function bindCalendarEvents() {

    $("#prevMonth")
        .addEventListener(
            "click",
            () => {

                currentCalendarDate =
                    new Date(
                        currentCalendarDate.getFullYear(),
                        currentCalendarDate.getMonth() - 1,
                        1
                    );

                renderPage();
            }
        );


    $("#nextMonth")
        .addEventListener(
            "click",
            () => {

                currentCalendarDate =
                    new Date(
                        currentCalendarDate.getFullYear(),
                        currentCalendarDate.getMonth() + 1,
                        1
                    );

                renderPage();
            }
        );


    $("#calendarToday")
        .addEventListener(
            "click",
            () => {

                currentCalendarDate =
                    new Date();

                selectedCalendarDate =
                    new Date();

                renderPage();
            }
        );


    $("#addEventButton")
        .addEventListener(
            "click",
            () => openEventModal(
                formatISODate(
                    selectedCalendarDate
                )
            )
        );


    $$("[data-calendar-date]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedCalendarDate =
                        parseISODate(
                            button.dataset.calendarDate
                        );

                    currentCalendarDate =
                        new Date(
                            selectedCalendarDate.getFullYear(),
                            selectedCalendarDate.getMonth(),
                            1
                        );

                    renderPage();
                }
            );
        });
}


/* =========================================================
   EVENT MODAL
   ========================================================= */

function openEventModal(defaultDate = todayISO()) {

    $("#modalRoot").innerHTML = `

        <div class="modal-backdrop">

            <div class="modal">

                <h2>Add Calendar Event</h2>

                <form
                    id="eventForm"
                    class="modal-form"
                >

                    <label>
                        Event name

                        <input
                            id="eventTitle"
                            type="text"
                            required
                        >
                    </label>

                    <label>
                        Date

                        <input
                            id="eventDate"
                            type="date"
                            value="${defaultDate}"
                            required
                        >
                    </label>

                    <label>
                        Time

                        <input
                            id="eventTime"
                            type="time"
                        >
                    </label>

                    <div class="modal-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            id="cancelModal"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="primary-button"
                        >
                            Add Event
                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;


    $("#cancelModal")
        .addEventListener(
            "click",
            closeModal
        );


    $("#eventForm")
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const eventItem = {

                    id: `event-${Date.now()}`,

                    title:
                        $("#eventTitle")
                            .value
                            .trim(),

                    date:
                        $("#eventDate")
                            .value,

                    time:
                        $("#eventTime")
                            .value
                };


                if (!eventItem.title) return;


                currentUser.events.push(
                    eventItem
                );

                saveData();

                closeModal();

                selectedCalendarDate =
                    parseISODate(
                        eventItem.date
                    );

                currentCalendarDate =
                    new Date(
                        selectedCalendarDate.getFullYear(),
                        selectedCalendarDate.getMonth(),
                        1
                    );

                renderPage();

                showToast(
                    "Event added to your calendar."
                );
            }
        );
}


function closeModal() {

    $("#modalRoot").innerHTML = "";
}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignmentsPage(content) {

    const assignments =
        [...currentUser.assignments]
            .sort(
                (a, b) =>
                    a.dueDate.localeCompare(
                        b.dueDate
                    )
            );


    content.innerHTML = `

        <div class="page-header">

            <h1>Assignments</h1>

            <p>
                Keep track of what is due before the
                classic “I forgot” incident.
            </p>

        </div>


        <div class="card card-padding">

            <div class="card-header">

                <h2>
                    Your Assignments
                </h2>

                <button
                    id="addAssignmentButton"
                    class="primary-button"
                >
                    + Add Assignment
                </button>

            </div>


            <div class="assignment-list">

                ${
                    assignments.length
                        ? assignments
                            .map(
                                renderAssignmentItem
                            )
                            .join("")
                        : `
                            <div class="empty-state">
                                📚 No assignments yet.
                                Your future self approves.
                            </div>
                        `
                }

            </div>

        </div>
    `;


    bindAssignmentEvents();
}


function bindAssignmentEvents() {

    $("#addAssignmentButton")
        ?.addEventListener(
            "click",
            () => openAssignmentModal()
        );


    $$("[data-assignment-check]")
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    completeAssignment(
                        input.dataset.assignmentCheck,
                        input.checked
                    );
                }
            );
        });
}


function openAssignmentModal() {

    $("#modalRoot").innerHTML = `

        <div class="modal-backdrop">

            <div class="modal">

                <h2>
                    Add Assignment
                </h2>

                <form
                    id="assignmentForm"
                    class="modal-form"
                >

                    <label>
                        Assignment

                        <input
                            id="assignmentTitle"
                            type="text"
                            required
                        >
                    </label>

                    <label>
                        Due Date

                        <input
                            id="assignmentDate"
                            type="date"
                            required
                        >
                    </label>

                    <label>
                        Importance

                        <select id="assignmentImportance">

                            <option value="low">
                                Low
                            </option>

                            <option value="medium" selected>
                                Medium
                            </option>

                            <option value="high">
                                High
                            </option>

                        </select>
                    </label>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            id="cancelAssignment"
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

            </div>

        </div>
    `;


    $("#cancelAssignment")
        .addEventListener(
            "click",
            closeModal
        );


    $("#assignmentForm")
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const assignment = {

                    id:
                        `assignment-${Date.now()}`,

                    title:
                        $("#assignmentTitle")
                            .value
                            .trim(),

                    dueDate:
                        $("#assignmentDate")
                            .value,

                    importance:
                        $("#assignmentImportance")
                            .value,

                    completed: false
                };


                if (!assignment.title) return;


                currentUser.assignments.push(
                    assignment
                );

                saveData();

                closeModal();

                renderPage();

                showToast(
                    "Assignment added."
                );
            }
        );
}


function completeAssignment(
    assignmentId,
    completed
) {

    const assignment =
        currentUser.assignments.find(
            item => item.id === assignmentId
        );

    if (!assignment) return;

    /*
     * Don't award/remove points if the state
     * hasn't actually changed.
     */
    if (assignment.completed === completed) {
        return;
    }

    assignment.completed = completed;

    if (completed) {

        currentUser.points += 5;

        currentUser.progress.push(
            currentUser.points
        );

        addNotification(
            `Assignment completed: ${assignment.title}`,
            "assignment"
        );

        showToast(
            "Assignment completed! +5 Peer Points ⭐"
        );

    } else {

        currentUser.points =
            Math.max(
                0,
                currentUser.points - 5
            );

        currentUser.progress.push(
            currentUser.points
        );

        showToast(
            "Assignment marked incomplete."
        );
    }

    saveData();

    renderPage();
}

/* =========================================================
   TUTORS
   ========================================================= */

function renderTutorsPage(content) {

    content.innerHTML = `

        <div class="page-header">

            <h1>Find a Peer</h1>

            <p>
                Find someone who can help with the
                subject you're working on.
            </p>

        </div>


        <div class="filter-bar">

            <input
                id="tutorSearch"
                type="search"
                placeholder="Search subject or tutor..."
            >

            <select id="tutorYear">

                <option value="">All year levels</option>

                <option>Year 10</option>
                <option>Year 11</option>
                <option>Year 12</option>
                <option>Year 13</option>

            </select>


            <select id="tutorAvailability">

                <option value="">
                    Any availability
                </option>

                <option value="lunchtime">
                    Lunchtime
                </option>

                <option value="after school">
                    After school
                </option>

                <option value="evenings">
                    Evenings
                </option>

                <option value="weekends">
                    Weekends
                </option>

            </select>

        </div>


        <div
            id="tutorGrid"
            class="tutor-grid"
        ></div>
    `;


    renderTutorCards(
        tutors
    );

    bindTutorEvents();
}


function renderTutorCards(list) {

    const grid =
        $("#tutorGrid");

    if (!list.length) {

        grid.innerHTML = `
            <div
                class="card card-padding"
                style="grid-column:1/-1;"
            >
                <div class="empty-state">
                    🐉 Roran couldn't find anyone matching that.
                </div>
            </div>
        `;

        return;
    }


    grid.innerHTML =
        list
            .map(
                tutor => `

                    <div class="card tutor-card">

                        <div class="tutor-avatar">
                            ${getInitials(
                                tutor.name
                            )}
                        </div>

                        <h3>
                            ${escapeHTML(
                                tutor.name
                            )}
                        </h3>

                        <div class="tutor-year">
                            ${tutor.year}
                        </div>

                        <div class="tutor-subjects">

                            ${tutor.subjects
                                .map(
                                    subject =>
                                        `
                                        <span class="subject-tag">
                                            ${escapeHTML(
                                                subject
                                            )}
                                        </span>
                                        `
                                )
                                .join("")}

                        </div>

                        <div class="tutor-availability">
                            🕐 ${escapeHTML(
                                tutor.availability
                            )}
                        </div>

                        <div class="tutor-buttons">

                            <button
                                class="primary-button"
                                data-book-tutor="${tutor.id}"
                            >
                                Book Session
                            </button>

                        </div>

                    </div>

                `
            )
            .join("");


    bindTutorButtons();
}


function bindTutorEvents() {

    const filterTutors = () => {

        const search =
            $("#tutorSearch")
                .value
                .trim()
                .toLowerCase();

        const year =
            $("#tutorYear")
                .value;

        const availability =
            $("#tutorAvailability")
                .value;


        const filtered =
            tutors.filter(tutor => {

                const searchable =
                    [
                        tutor.name,
                        tutor.year,
                        ...tutor.subjects
                    ]
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(search);


                const matchesYear =
                    !year ||
                    tutor.year === year;


                const availabilityText =
                    tutor.availability
                        .toLowerCase();


                let matchesAvailability = true;


                if (availability === "lunchtime") {

                    matchesAvailability =
                        availabilityText.includes(
                            "lunch"
                        );
                }


                if (availability === "after school") {

                    matchesAvailability =
                        availabilityText.includes(
                            "after"
                        );
                }


                if (availability === "evenings") {

                    matchesAvailability =
                        availabilityText.includes(
                            "evening"
                        );
                }


                if (availability === "weekends") {

                    matchesAvailability =
                        availabilityText.includes(
                            "weekend"
                        );
                }


                return (
                    matchesSearch &&
                    matchesYear &&
                    matchesAvailability
                );
            });


        renderTutorCards(filtered);
    };


    $("#tutorSearch")
        .addEventListener(
            "input",
            filterTutors
        );


    $("#tutorYear")
        .addEventListener(
            "change",
            filterTutors
        );


    $("#tutorAvailability")
        .addEventListener(
            "change",
            filterTutors
        );
}


function bindTutorButtons() {

    $$("[data-book-tutor]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const tutor =
                        tutors.find(
                            item =>
                                item.id ===
                                button.dataset.bookTutor
                        );

                    if (tutor) {
                        openBookingModal(tutor);
                    }
                }
            );
        });
}


/* =========================================================
   BOOKING
   ========================================================= */

function openBookingModal(tutor) {

    $("#modalRoot").innerHTML = `

        <div class="modal-backdrop">

            <div class="modal">

                <h2>
                    Book a Session
                </h2>

                <p style="color:var(--muted);margin-bottom:18px;">
                    With ${escapeHTML(
                        tutor.name
                    )}
                </p>

                <form
                    id="bookingForm"
                    class="modal-form"
                >

                    <label>
                        Subject

                        <select id="bookingSubject">

                            ${tutor.subjects
                                .map(
                                    subject =>
                                        `
                                        <option>
                                            ${escapeHTML(
                                                subject
                                            )}
                                        </option>
                                        `
                                )
                                .join("")}

                        </select>
                    </label>


                    <label>
                        Date

                        <input
                            id="bookingDate"
                            type="date"
                            min="${todayISO()}"
                            required
                        >
                    </label>


                    <label>
                        Time

                        <input
                            id="bookingTime"
                            type="time"
                            required
                        >
                    </label>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            id="cancelBooking"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="primary-button"
                        >
                            Book Session
                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;


    $("#cancelBooking")
        .addEventListener(
            "click",
            closeModal
        );


    $("#bookingForm")
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const subject =
                    $("#bookingSubject").value;

                const date =
                    $("#bookingDate").value;

                const time =
                    $("#bookingTime").value;


                const booking = {

                    id:
                        `booking-${Date.now()}`,

                    tutorId:
                        tutor.id,

                    tutorName:
                        tutor.name,

                    subject,

                    date,

                    time
                };


                currentUser.bookings.push(
                    booking
                );


                currentUser.events.push({

                    id:
                        `booking-event-${Date.now()}`,

                    title:
                        `Peer session: ${subject}`,

                    date,

                    time

                });


                addNotification(
                    `Peer session booked with ${tutor.name}.`,
                    "booking"
                );


                saveData();

                closeModal();

                renderPage();

                showToast(
                    "Peer session booked! 📚"
                );
            }
        );
}


/* =========================================================
   STUDY PAGE
   ========================================================= */

function renderStudyPage(content) {

    updateTimerDisplay();


    content.innerHTML = `

        <div class="page-header">

            <h1>Study Session</h1>

            <p>
                Focus, breathe, study. Roran is supervising.
            </p>

        </div>


        <div class="study-grid">

            <div class="card timer-card">

                <div class="timer-roran">
                    🐉
                </div>

                <div class="timer-label">
                    ${timer.mode === "focus"
                        ? "FOCUS SESSION"
                        : "BREAK"}
                </div>

                <div
                    id="timerDisplay"
                    class="timer-display"
                >
                    ${formatTimer(
                        timer.remainingSeconds
                    )}
                </div>


                <div class="timer-controls">

                    <button
                        id="startTimer"
                        class="primary-button"
                    >
                        ${
                            timer.running
                                ? "Pause"
                                : "Start"
                        }
                    </button>

                    <button
                        id="resetTimer"
                        class="secondary-button"
                    >
                        Reset
                    </button>

                </div>


                <div class="timer-settings">

                    <button
                        id="focusLength"
                    >
                        Focus: ${timer.focusMinutes}m
                    </button>

                    <button
                        id="breakLength"
                    >
                        Break: ${timer.breakMinutes}m
                    </button>

                </div>


                <button
                    id="enterFocusMode"
                    class="focus-launch"
                >
                    ⛶ Enter Full-Screen Focus Mode
                </button>

            </div>


            <div class="home-right">

                <div class="card roran-card">

                    <div class="roran-main">

                        <div class="roran-art">
                            🐉
                        </div>

                        <div class="roran-content">

                            <h3>
                                St Roran
                            </h3>

                            <p>
                                Your study buddy.
                            </p>

                        </div>

                    </div>

                    <div class="roran-quote">
                        “${getRoranMessage()}”
                    </div>

                </div>


                <div class="card music-card">

                    <div class="card-header">
                        <h2>Study Music</h2>
                    </div>

                    <div class="music-card-main">

                        <div class="spotify-preview">

                            <div class="spotify-circle">
                                ♫
                            </div>

                            <div>

                                <strong>
                                    Spotify
                                </strong>

                                <div class="spotify-note">
                                    Connect your music for study sessions.
                                </div>

                            </div>

                        </div>

                        <button
                            id="spotifyStudyButton"
                            class="primary-button"
                        >
                            Connect
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;


    bindStudyEvents();
}


function formatTimer(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const remaining =
        seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remaining
    ).padStart(2, "0")}`;
}


function updateTimerDisplay() {

    const display =
        $("#timerDisplay");

    if (display) {

        display.textContent =
            formatTimer(
                timer.remainingSeconds
            );
    }


    const focusDisplay =
        $("#focusTimerDisplay");

    if (focusDisplay) {

        focusDisplay.textContent =
            formatTimer(
                timer.remainingSeconds
            );
    }


    updateFocusProgress();
}


function updateFocusProgress() {

    const bar =
        $("#focusProgressBar");

    if (!bar) return;


    const total =
        timer.mode === "focus"
            ? timer.focusMinutes * 60
            : timer.breakMinutes * 60;


    const completed =
        total - timer.remainingSeconds;


    const percentage =
        Math.min(
            100,
            Math.max(
                0,
                (completed / total) * 100
            )
        );


    bar.style.width =
        `${percentage}%`;
}


function bindStudyEvents() {

    $("#startTimer")
        ?.addEventListener(
            "click",
            () => {

                if (timer.running) {
                    pauseTimer();
                } else {
                    startTimer();
                }

                renderPage();
            }
        );


    $("#resetTimer")
        ?.addEventListener(
            "click",
            () => {

                resetTimer();

                renderPage();
            }
        );


    $("#focusLength")
        ?.addEventListener(
            "click",
            () => {

                const value =
                    Number(
                        prompt(
                            "Focus length in minutes:",
                            timer.focusMinutes
                        )
                    );

                if (
                    Number.isFinite(value) &&
                    value >= 1 &&
                    value <= 120
                ) {

                    timer.focusMinutes =
                        Math.round(value);

                    if (!timer.running &&
                        timer.mode === "focus") {

                        timer.remainingSeconds =
                            timer.focusMinutes * 60;
                    }

                    renderPage();
                }
            }
        );


    $("#breakLength")
        ?.addEventListener(
            "click",
            () => {

                const value =
                    Number(
                        prompt(
                            "Break length in minutes:",
                            timer.breakMinutes
                        )
                    );

                if (
                    Number.isFinite(value) &&
                    value >= 1 &&
                    value <= 60
                ) {

                    timer.breakMinutes =
                        Math.round(value);

                    if (!timer.running &&
                        timer.mode === "break") {

                        timer.remainingSeconds =
                            timer.breakMinutes * 60;
                    }

                    renderPage();
                }
            }
        );


    $("#enterFocusMode")
        ?.addEventListener(
            "click",
            openFocusMode
        );


    $("#spotifyStudyButton")
        ?.addEventListener(
            "click",
            connectSpotify
        );
}


/* =========================================================
   TIMER
   ========================================================= */

function startTimer() {

    if (timer.running) return;

    timer.running = true;


    timer.interval =
        setInterval(() => {

            timer.remainingSeconds--;

            updateTimerDisplay();


            if (
                timer.remainingSeconds <= 0
            ) {

                completeTimerMode();
            }

        }, 1000);
}


function pauseTimer() {

    timer.running = false;

    if (timer.interval) {

        clearInterval(
            timer.interval
        );

        timer.interval = null;
    }
}


function stopTimer() {

    pauseTimer();
}


function resetTimer() {

    pauseTimer();

    timer.mode = "focus";

    timer.remainingSeconds =
        timer.focusMinutes * 60;
}


function completeTimerMode() {

    pauseTimer();


    if (timer.mode === "focus") {

        currentUser.studySessions++;

        currentUser.points += 10;

        currentUser.progress.push(
            currentUser.points
        );


        addNotification(
            "Study session completed! +10 Peer Points.",
            "study"
        );


        showToast(
            "Focus session complete! +10 Peer Points 🐉⭐"
        );


        timer.mode = "break";

        timer.remainingSeconds =
            timer.breakMinutes * 60;


        updateFocusMessage(
            "You did it. Roran is impressed."
        );

    } else {

        timer.mode = "focus";

        timer.remainingSeconds =
            timer.focusMinutes * 60;


        updateFocusMessage(
            "Break finished. Back to it."
        );
    }


    saveData();

    renderPage();
}


/* =========================================================
   FULLSCREEN FOCUS MODE
   ========================================================= */

function createFocusMode() {

    if ($("#focusMode")) return;

    const focus = document.createElement("div");

    focus.id = "focusMode";
    focus.className = "focus-mode-overlay hidden";

    focus.innerHTML = `
        <button
            id="exitFocusMode"
            class="focus-mode-close"
            aria-label="Exit focus mode"
        >
            ×
        </button>

        <div class="focus-mode-content">

            <div class="st-roran focus-roran">
                🐉
            </div>

            <div
                id="focusModeLabel"
                class="focus-mode-label"
            >
                FOCUS SESSION
            </div>

            <div
                id="focusTimerDisplay"
                class="focus-mode-timer"
            >
                25:00
            </div>

            <div
                id="focusMessage"
                class="focus-mode-message"
            >
                St Roran is studying with you.
            </div>

            <div class="focus-progress">
                <div
                    id="focusProgressBar"
                    class="focus-progress-bar"
                ></div>
            </div>

            <div class="focus-mode-controls">

                <button
                    id="focusPause"
                    class="primary-button"
                >
                    ▶ Start
                </button>

                <button
                    id="focusReset"
                    class="secondary-button"
                >
                    Reset
                </button>

            </div>

            <div class="focus-backgrounds">

                <span>
                    Focus background
                </span>

                <button
                    class="background-option active"
                    data-background="forest"
                >
                    🌲 Forest
                </button>

                <button
                    class="background-option"
                    data-background="rain"
                >
                    🌧 Rain
                </button>

                <button
                    class="background-option"
                    data-background="academia"
                >
                    📚 Study
                </button>

                <button
                    class="background-option"
                    data-background="night"
                >
                    🌙 Night
                </button>

            </div>

            <button
                id="spotifyButton"
                class="focus-spotify-button"
            >
                🎵 Open Spotify
            </button>

        </div>
    `;

    document.body.appendChild(focus);
}


function openFocusMode() {

    createFocusMode();

    const focus = $("#focusMode");

    if (!focus) return;

    focus.classList.remove("hidden");
    focus.classList.add("active");

    setFocusBackground(
        currentUser.focusBackground || "forest"
    );

    updateFocusMode();

    document.body.style.overflow = "hidden";

    /*
     * Browser fullscreen.
     * If the browser refuses it, the overlay still works.
     */
    if (
        !document.fullscreenElement &&
        document.documentElement.requestFullscreen
    ) {
        document.documentElement
            .requestFullscreen()
            .catch(() => {});
    }
}


function closeFocusMode() {

    const focus = $("#focusMode");

    if (focus) {
        focus.classList.remove("active");
        focus.classList.add("hidden");
    }

    document.body.style.overflow = "";

    if (
        document.fullscreenElement &&
        document.exitFullscreen
    ) {
        document.exitFullscreen()
            .catch(() => {});
    }
}


function updateFocusMode() {

    updateTimerDisplay();

    const button = $("#focusPause");

    if (button) {
        button.textContent =
            timer.running
                ? "⏸ Pause"
                : "▶ Start";
    }

    const label = $("#focusModeLabel");

    if (label) {
        label.textContent =
            timer.mode === "focus"
                ? "FOCUS SESSION"
                : "BREAK";
    }

    updateFocusMessage();
}


function updateFocusMessage(customMessage = null) {

    const message = $("#focusMessage");

    if (!message) return;

    if (customMessage) {
        message.textContent = customMessage;
        return;
    }

    message.textContent =
        timer.mode === "focus"
            ? "St Roran is studying with you."
            : "Take a breath. You've earned the break.";
}


function setFocusBackground(background) {

    createFocusMode();

    const focus = $("#focusMode");

    if (!focus) return;

    focus.classList.remove(
        "forest",
        "rain",
        "academia",
        "night"
    );

    focus.classList.add(background);

    $$(".background-option")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.background === background
            );

        });

    if (currentUser) {

        currentUser.focusBackground =
            background;

        saveData();
    }
}


function setupFocusMode() {

    /*
     * The focus screen is created by JavaScript,
     * so it doesn't matter if the HTML doesn't
     * already contain it.
     */
    createFocusMode();

    $("#exitFocusMode")
        ?.addEventListener(
            "click",
            closeFocusMode
        );

    $("#focusPause")
        ?.addEventListener(
            "click",
            () => {

                if (timer.running) {
                    pauseTimer();
                } else {
                    startTimer();
                }

                updateFocusMode();
            }
        );

    $("#focusReset")
        ?.addEventListener(
            "click",
            () => {

                resetTimer();

                updateFocusMode();
            }
        );

    $$(".background-option")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setFocusBackground(
                        button.dataset.background
                    );

                }
            );
        });

    $("#spotifyButton")
        ?.addEventListener(
            "click",
            connectSpotify
        );


    /*
     * Escape closes the focus overlay.
     */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                $("#focusMode")?.classList.contains("active")
            ) {
                closeFocusMode();
            }

        }
    );
}


/* =========================================================
   SPOTIFY
   ========================================================= */

function connectSpotify() {

    showToast(
        "Opening Spotify for your study music. 🎵"
    );

    window.open(
        "https://open.spotify.com/",
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfilePage(content) {

    const completed =
        currentUser.assignments
            .filter(
                assignment =>
                    assignment.completed
            )
            .length;


    content.innerHTML = `

        <div class="page-header">

            <h1>My Profile</h1>

            <p>
                Your study progress and Peer Hub activity.
            </p>

        </div>


        <div class="card profile-header">

            <div class="profile-large-avatar">
                ${getInitials(
                    currentUser.name
                )}
            </div>

            <div>

                <h2>
                    ${escapeHTML(
                        currentUser.name
                    )}
                </h2>

                <p style="color:var(--muted);">
                    ${escapeHTML(
                        currentUser.year
                    )}
                    ${
                        currentUser.className
                            ? ` · ${escapeHTML(
                                currentUser.className
                            )}`
                            : ""
                    }
                </p>

            </div>

        </div>


        <div class="stats-grid">

            <div class="card stat-card">

                <span class="stat-number">
                    ${currentUser.points}
                </span>

                <span class="stat-label">
                    Peer Points
                </span>

            </div>


            <div class="card stat-card">

                <span class="stat-number">
                    ${currentUser.studySessions}
                </span>

                <span class="stat-label">
                    Study Sessions
                </span>

            </div>


            <div class="card stat-card">

                <span class="stat-number">
                    ${completed}
                </span>

                <span class="stat-label">
                    Completed Assignments
                </span>

            </div>


            <div class="card stat-card">

                <span class="stat-number">
                    ${currentUser.bookings.length}
                </span>

                <span class="stat-label">
                    Peer Sessions
                </span>

            </div>

        </div>


        <div class="card progress-card">

            <div class="card-header">
                <h2>Peer Points Progress</h2>
            </div>

            ${renderProgressChart()}

        </div>
    `;
}


function renderProgressChart() {

    const values =
        currentUser.progress.length
            ? currentUser.progress
            : [0];


    const max =
        Math.max(
            10,
            ...values
        );


    return `
        <div class="progress-chart">

            ${values
                .map(
                    value => {

                        const height =
                            Math.max(
                                4,
                                (value / max) * 100
                            );

                        return `
                            <div
                                class="progress-bar"
                                style="height:${height}%"
                            >
                                <span>
                                    ${value}
                                </span>
                            </div>
                        `;
                    }
                )
                .join("")}

        </div>
    `;
}


/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettingsPage(content) {

    const settings =
        currentUser.settings ||
        {
            notifications: true,
            motivation: true
        };


    content.innerHTML = `

        <div class="page-header">

            <h1>Settings</h1>

            <p>
                Control your Peer Hub experience.
            </p>

        </div>


        <div class="card card-padding">

            <div class="settings-list">

                <div class="setting-row">

                    <div>

                        <strong>
                            Notifications
                        </strong>

                        <small>
                            Receive Peer Hub notifications.
                        </small>

                    </div>

                    <button
                        class="toggle ${
                            settings.notifications
                                ? "active"
                                : ""
                        }"
                        data-setting="notifications"
                    ></button>

                </div>


                <div class="setting-row">

                    <div>

                        <strong>
                            Roran Motivation
                        </strong>

                        <small>
                            Show St Roran's study tips.
                        </small>

                    </div>

                    <button
                        class="toggle ${
                            settings.motivation
                                ? "active"
                                : ""
                        }"
                        data-setting="motivation"
                    ></button>

                </div>


                <div class="setting-row">

                    <div>

                        <strong>
                            Account
                        </strong>

                        <small>
                            ${escapeHTML(
                                currentUser.email
                            )}
                        </small>

                    </div>

                    <button
                        id="logoutButton"
                        class="secondary-button"
                    >
                        Sign Out
                    </button>

                </div>

            </div>

        </div>
    `;


    bindSettingsEvents();
}


function bindSettingsEvents() {

    $$("[data-setting]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const setting =
                        button.dataset.setting;


                    currentUser.settings[setting] =
                        !currentUser.settings[setting];


                    saveData();

                    renderPage();

                    showToast(
                        "Setting updated."
                    );
                }
            );
        });


    $("#logoutButton")
        .addEventListener(
            "click",
            logout
        );
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function addNotification(
    message,
    type = "general"
) {

    if (
        !currentUser.settings.notifications
    ) {
        return;
    }


    currentUser.notifications.unshift({

        id:
            `notification-${Date.now()}`,

        message,

        type,

        createdAt:
            new Date().toISOString(),

        read: false
    });


    currentUser.notifications =
        currentUser.notifications.slice(
            0,
            30
        );


    saveData();

    updateTopBar();
}


function showNotifications() {

    const notifications =
        currentUser.notifications;


    $("#modalRoot").innerHTML = `

        <div class="modal-backdrop">

            <div class="modal">

                <div class="card-header">

                    <h2>
                        Notifications
                    </h2>

                    <button
                        id="closeNotifications"
                        class="secondary-button"
                    >
                        Close
                    </button>

                </div>


                ${
                    notifications.length
                        ? notifications
                            .map(
                                notification => `
                                    <div class="day-item">

                                        <strong>
                                            ${
                                                notification.type === "study"
                                                    ? "⏱ "
                                                    : notification.type === "booking"
                                                        ? "📚 "
                                                        : "🔔 "
                                            }

                                            ${escapeHTML(
                                                notification.message
                                            )}
                                        </strong>

                                        <span>
                                            ${
                                                notification.read
                                                    ? "Read"
                                                    : "New"
                                            }
                                        </span>

                                    </div>
                                `
                            )
                            .join("")
                        : `
                            <div class="empty-state">
                                🔔 No notifications.
                            </div>
                        `
                }


                ${
                    notifications.length
                        ? `
                            <div class="modal-actions">

                                <button
                                    id="markNotificationsRead"
                                    class="primary-button"
                                >
                                    Mark all as read
                                </button>

                            </div>
                        `
                        : ""
                }

            </div>

        </div>
    `;


    $("#closeNotifications")
        .addEventListener(
            "click",
            closeModal
        );


    $("#markNotificationsRead")
        ?.addEventListener(
            "click",
            () => {

                currentUser.notifications
                    .forEach(
                        notification =>
                            notification.read = true
                    );

                saveData();

                updateTopBar();

                closeModal();
            }
        );
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout = null;


function showToast(message) {

    const toast =
        $("#toast");

    toast.textContent =
        message;

    toast.classList.add("show");


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );
}


/* =========================================================
   INITIALISATION
   ========================================================= */

function initialiseApp() {

    setupAuth();

    setupNavigation();

    setupTopBar();

    setupFocusMode();

    restoreSession();
}


document.addEventListener(
    "DOMContentLoaded",
    initialiseApp
);
```
