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
       const existingUser = appData.users.find(
        user => user.email.toLowerCase() === email
    );

    if (existingUser) {
        if (error) {
            error.textContent =
                "An account with that school email already exists.";
        }

        return;
    }

    if (password.length < 6) {
        if (error) {
            error.textContent =
                "Your password must be at least 6 characters.";
        }

        return;
    }

    const newUser = {
        id:
            "user-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8),

        name,
        email,
        password,
        year,
        className: "",
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

    const signupForm = $("#signupForm");

    if (signupForm) {
        signupForm.reset();
    }

    showToast(
        "Account created. Welcome to Peer Hub 🌿"
    );

    showApplication();
}


/* =========================================================
   GOOGLE DEMO LOGIN
   ========================================================= */

function handleGoogleDemo() {
    let demoUser = appData.users.find(
        user => user.email === "maya@storans.school.nz"
    );

    if (!demoUser) {
        demoUser = {
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
        };

        appData.users.push(demoUser);
        saveData();
    }

    currentUser = demoUser;

    saveCurrentUser();

    showToast(
        "Signed in as Maya Smith 🌿"
    );

    showApplication();
}


/* =========================================================
   AUTH / APPLICATION VISIBILITY
   ========================================================= */

function showAuth() {
    const authScreen = $("#authScreen");
    const appShell = $("#appShell") || $("#app");

    authScreen?.classList.remove("hidden");
    appShell?.classList.add("hidden");
}


function showApplication() {
    const authScreen = $("#authScreen");
    const appShell = $("#appShell") || $("#app");

    authScreen?.classList.add("hidden");
    appShell?.classList.remove("hidden");

    refreshApplication();
}


function refreshApplication() {
    const user = getCurrentUserFromData();

    if (!user) {
        currentUser = null;
        saveCurrentUser();
        showAuth();
        return;
    }

    currentUser = user;

    updateUserInterface();
    renderCurrentPage();
    updateTimerDisplay();
    updateFocusModeDisplay();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
    const navItems = $$(".nav-item");

    navItems.forEach(item => {
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
    const validPages = [
        "home",
        "calendar",
        "assignments",
        "tutors",
        "study",
        "profile",
        "settings"
    ];

    if (!validPages.includes(page)) {
        return;
    }

    currentPage = page;

    $$(".nav-item").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.page === page
        );
    });

    $$(".page").forEach(section => {
        const matches =
            section.dataset.page === page ||
            section.id === page;

        section.classList.toggle(
            "active",
            matches
        );

        section.classList.toggle(
            "hidden",
            !matches
        );
    });

    renderCurrentPage();
}


function renderCurrentPage() {
    switch (currentPage) {
        case "home":
            renderHome();
            break;

        case "calendar":
            renderCalendar();
            break;

        case "assignments":
            renderAssignments();
            break;

        case "tutors":
            renderTutors();
            break;

        case "study":
            renderStudyPage();
            break;

        case "profile":
            renderProfile();
            break;

        case "settings":
            renderSettings();
            break;

        default:
            renderHome();
            break;
    }
}


/* =========================================================
   TOPBAR
   ========================================================= */

function setupTopbar() {
    const profileButton =
        $("#topbarProfile") ||
        $(".topbar-profile");

    profileButton?.addEventListener(
        "click",
        () => {
            navigateTo("profile");
        }
    );

    const logoutButton =
        $("#logoutButton") ||
        $("#logout") ||
        $(".logout-button");

    logoutButton?.addEventListener(
        "click",
        logout
    );
}


function setupGlobalClicks() {
    document.addEventListener("click", event => {
        const logoutButton =
            event.target.closest(
                "[data-action='logout']"
            );

        if (logoutButton) {
            logout();
            return;
        }

        const pageButton =
            event.target.closest(
                "[data-navigate]"
            );

        if (pageButton) {
            const page =
                pageButton.dataset.navigate;

            if (page) {
                navigateTo(page);
            }
        }
    });
}


function logout() {
    currentUser = null;

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    stopFocusTimer();
    stopTimer();

    showToast(
        "You have been signed out."
    );

    showAuth();
}


/* =========================================================
   USER INTERFACE
   ========================================================= */

function updateUserInterface() {
    const user = getCurrentUserFromData();

    if (!user) {
        return;
    }

    const firstName =
        user.name.split(" ")[0];

    const nameElements = $$(
        "[data-user-name]"
    );

    nameElements.forEach(element => {
        element.textContent = user.name;
    });

    const firstNameElements = $$(
        "[data-user-first-name]"
    );

    firstNameElements.forEach(element => {
        element.textContent = firstName;
    });

    const emailElements = $$(
        "[data-user-email]"
    );

    emailElements.forEach(element => {
        element.textContent = user.email;
    });

    const yearElements = $$(
        "[data-user-year]"
    );

    yearElements.forEach(element => {
        element.textContent =
            user.year
                ? `Year ${user.year}`
                : "";
    });

    const classElements = $$(
        "[data-user-class]"
    );

    classElements.forEach(element => {
        element.textContent =
            user.className || "";
    });

    const pointsElements = $$(
        "[data-user-points]"
    );

    pointsElements.forEach(element => {
        element.textContent =
            Number(user.points || 0).toLocaleString();
    });

    const initialsElements = $$(
        "[data-user-initials]"
    );

    initialsElements.forEach(element => {
        element.textContent =
            getInitials(user.name);
    });
}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {
    const user = getCurrentUserFromData();

    if (!user) {
        return;
    }

    const greeting =
        $("[data-home-greeting]");

    if (greeting) {
        greeting.textContent =
            `Good ${getTimeGreeting()}, ${user.name.split(" ")[0]}`;
    }

    const points =
        $("[data-home-points]");

    if (points) {
        points.textContent =
            Number(user.points || 0).toLocaleString();
    }

    const sessions =
        $("[data-home-sessions]");

    if (sessions) {
        sessions.textContent =
            Number(user.sessions || 0);
    }

    renderUpcomingAssignments();
    renderQuote();
}


function getTimeGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "morning";
    }

    if (hour < 18) {
        return "afternoon";
    }

    return "evening";
}


function renderUpcomingAssignments() {
    const container =
        $("[data-upcoming-assignments]") ||
        $("#upcomingAssignments");

    if (!container) {
        return;
    }

    const assignments =
        appData.assignments
            .filter(assignment => !assignment.completed)
            .slice(0, 3);

    if (!assignments.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>✓</span>
                <p>You're all caught up.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        assignments.map(assignment => `
            <div
                class="assignment-mini-card"
                data-assignment-id="${assignment.id}"
            >
                <div>
                    <span class="assignment-subject">
                        ${escapeHTML(assignment.subject)}
                    </span>

                    <h4>
                        ${escapeHTML(assignment.title)}
                    </h4>

                    <small>
                        Due ${escapeHTML(assignment.due)}
                    </small>
                </div>

                <span class="importance-dot ${escapeHTML(
                    assignment.importance
                )}"></span>
            </div>
        `).join("");
}


function renderQuote() {
    const quoteElement =
        $("[data-daily-quote]");

    if (!quoteElement) {
        return;
    }

    const quotes = [
        "Small progress is still progress.",
        "You do not need to finish everything today.",
        "Future you will be grateful you started.",
        "One focused hour beats three distracted ones.",
        "You are allowed to learn slowly.",
        "Do the next small thing."
    ];

    const index =
        new Date().getDate() %
        quotes.length;

    quoteElement.textContent =
        quotes[index];
}


/* =========================================================
   TOAST NOTIFICATIONS
   ========================================================= */

function showToast(message) {
    let toast = $("#toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(
        toast._hideTimeout
    );

    toast._hideTimeout =
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
}


/* =========================================================
   END OF PART 2
   ========================================================= */
 /* =========================================================
    ASSIGNMENTS
    ========================================================= */

function renderAssignments() {
    const container =
        $("[data-assignments-list]") ||
        $("#assignmentsList") ||
        $(".assignments-list");

    if (!container) {
        return;
    }

    const assignments = appData.assignments || [];

    if (!assignments.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>📚</span>
                <p>No assignments yet.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = assignments.map(assignment => {
        const completed =
            Boolean(assignment.completed);

        return `
            <article
                class="assignment-card ${completed ? "completed" : ""}"
                data-assignment-id="${assignment.id}"
            >
                <div class="assignment-card-main">

                    <button
                        type="button"
                        class="assignment-check"
                        data-action="toggle-assignment"
                        data-id="${assignment.id}"
                        aria-label="${
                            completed
                                ? "Mark assignment incomplete"
                                : "Mark assignment complete"
                        }"
                    >
                        ${completed ? "✓" : ""}
                    </button>

                    <div class="assignment-card-content">

                        <span class="assignment-subject">
                            ${escapeHTML(
                                assignment.subject || "General"
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                assignment.title
                            )}
                        </h3>

                        <p class="assignment-due">
                            Due ${escapeHTML(
                                assignment.due || "No due date"
                            )}
                        </p>

                    </div>

                    <span
                        class="assignment-importance ${
                            escapeHTML(
                                assignment.importance || "medium"
                            )
                        }"
                    >
                        ${escapeHTML(
                            capitalize(
                                assignment.importance || "medium"
                            )
                        )}
                    </span>

                </div>
            </article>
        `;
    }).join("");
}


function toggleAssignment(id) {
    const assignment =
        appData.assignments.find(
            item => String(item.id) === String(id)
        );

    if (!assignment) {
        return;
    }

    assignment.completed =
        !assignment.completed;

    saveData();
    renderAssignments();
    renderUpcomingAssignments();

    if (assignment.completed) {
        const user = getCurrentUserFromData();

        if (user) {
            updateCurrentUser({
                points:
                    Number(user.points || 0) + 5
            });
        }

        showToast(
            "Assignment completed. +5 Peer Points 🌿"
        );
    } else {
        showToast(
            "Assignment marked incomplete."
        );
    }

    updateUserInterface();
}


function addAssignment({
    title,
    subject,
    due,
    importance = "medium"
}) {
    if (!title || !subject) {
        return;
    }

    const assignment = {
        id: Date.now(),
        title: title.trim(),
        subject: subject.trim(),
        due: due?.trim() || "No due date",
        importance,
        completed: false
    };

    appData.assignments.push(assignment);

    saveData();
    renderAssignments();
    renderUpcomingAssignments();

    showToast(
        "Assignment added 📚"
    );
}


function deleteAssignment(id) {
    const index =
        appData.assignments.findIndex(
            assignment =>
                String(assignment.id) === String(id)
        );

    if (index === -1) {
        return;
    }

    appData.assignments.splice(index, 1);

    saveData();
    renderAssignments();
    renderUpcomingAssignments();

    showToast(
        "Assignment removed."
    );
}


/* =========================================================
   ASSIGNMENT EVENT HANDLING
   ========================================================= */

function setupAssignmentEvents() {
    document.addEventListener(
        "click",
        event => {
            const toggleButton =
                event.target.closest(
                    "[data-action='toggle-assignment']"
                );

            if (toggleButton) {
                toggleAssignment(
                    toggleButton.dataset.id
                );

                return;
            }

            const deleteButton =
                event.target.closest(
                    "[data-action='delete-assignment']"
                );

            if (deleteButton) {
                deleteAssignment(
                    deleteButton.dataset.id
                );
            }
        }
    );

    const addForm =
        $("#assignmentForm");

    addForm?.addEventListener(
        "submit",
        event => {
            event.preventDefault();

            const title =
                $("#assignmentTitle")?.value || "";

            const subject =
                $("#assignmentSubject")?.value || "";

            const due =
                $("#assignmentDue")?.value || "";

            const importance =
                $("#assignmentImportance")?.value ||
                "medium";

            addAssignment({
                title,
                subject,
                due,
                importance
            });

            addForm.reset();
        }
    );
}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar() {
    renderCalendarHeader();
    renderCalendarGrid();
    renderCalendarEvents();
}


function renderCalendarHeader() {
    const monthElement =
        $("[data-calendar-month]") ||
        $("#calendarMonth");

    const yearElement =
        $("[data-calendar-year]") ||
        $("#calendarYear");

    if (!monthElement && !yearElement) {
        return;
    }

    const month =
        selectedCalendarDate.toLocaleString(
            "en-NZ",
            {
                month: "long"
            }
        );

    const year =
        selectedCalendarDate.getFullYear();

    if (monthElement) {
        monthElement.textContent =
            month;
    }

    if (yearElement) {
        yearElement.textContent =
            year;
    }
}


function renderCalendarGrid() {
    const grid =
        $("[data-calendar-grid]") ||
        $("#calendarGrid");

    if (!grid) {
        return;
    }

    const year =
        selectedCalendarDate.getFullYear();

    const month =
        selectedCalendarDate.getMonth();

    const firstDay =
        new Date(
            year,
            month,
            1
        );

    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );

    /*
     * Convert JavaScript's Sunday-first index
     * into a Monday-first calendar.
     */
    const startingDay =
        (firstDay.getDay() + 6) % 7;

    const daysInMonth =
        lastDay.getDate();

    const today =
        new Date();

    let html = "";

    for (
        let i = 0;
        i < startingDay;
        i++
    ) {
        html += `
            <div class="calendar-day empty"></div>
        `;
    }

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {
        const date =
            new Date(
                year,
                month,
                day
            );

        const dateKey =
            formatDateKey(date);

        const isToday =
            date.toDateString() ===
            today.toDateString();

        const isSelected =
            date.toDateString() ===
            selectedCalendarDate.toDateString();

        const hasEvent =
            getEventsForDate(dateKey).length > 0;

        html += `
            <button
                type="button"
                class="
                    calendar-day
                    ${isToday ? "today" : ""}
                    ${isSelected ? "selected" : ""}
                    ${hasEvent ? "has-event" : ""}
                "
                data-calendar-date="${dateKey}"
            >
                <span class="calendar-day-number">
                    ${day}
                </span>

                ${
                    hasEvent
                        ? `<span class="calendar-event-dot"></span>`
                        : ""
                }
            </button>
        `;
    }

    grid.innerHTML = html;

    $$(".calendar-day[data-calendar-date]")
        .forEach(dayButton => {
            dayButton.addEventListener(
                "click",
                () => {
                    const date =
                        parseDateKey(
                            dayButton.dataset.calendarDate
                        );

                    if (!date) {
                        return;
                    }

                    selectedCalendarDate = date;

                    renderCalendar();
                }
            );
        });
}


function renderCalendarEvents() {
    const container =
        $("[data-calendar-events]") ||
        $("#calendarEvents");

    if (!container) {
        return;
    }

    const dateKey =
        formatDateKey(
            selectedCalendarDate
        );

    const events =
        getEventsForDate(dateKey);

    if (!events.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>🗓️</span>
                <p>No events for this day.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        events.map(event => `
            <article
                class="calendar-event-card"
                data-event-id="${event.id}"
            >
                <div class="calendar-event-time">
                    ${escapeHTML(
                        event.time || ""
                    )}
                </div>

                <div class="calendar-event-details">
                    <h4>
                        ${escapeHTML(
                            event.title
                        )}
                    </h4>

                    ${
                        event.description
                            ? `
                                <p>
                                    ${escapeHTML(
                                        event.description
                                    )}
                                </p>
                            `
                            : ""
                    }
                </div>
            </article>
        `).join("");
}


function getEventsForDate(dateKey) {
    return (appData.calendarEvents || [])
        .filter(event =>
            event.date === dateKey
        );
}


function addCalendarEvent({
    title,
    date,
    time = "",
    description = ""
}) {
    if (!title || !date) {
        return;
    }

    if (!Array.isArray(appData.calendarEvents)) {
        appData.calendarEvents = [];
    }

    appData.calendarEvents.push({
        id:
            Date.now() +
            Math.random()
                .toString(36)
                .slice(2, 6),

        title: title.trim(),
        date,
        time: time.trim(),
        description: description.trim()
    });

    saveData();
    renderCalendar();

    showToast(
        "Calendar event added 🗓️"
    );
}


function deleteCalendarEvent(id) {
    const index =
        appData.calendarEvents.findIndex(
            event =>
                String(event.id) === String(id)
        );

    if (index === -1) {
        return;
    }

    appData.calendarEvents.splice(
        index,
        1
    );

    saveData();
    renderCalendar();

    showToast(
        "Calendar event removed."
    );
}


/* =========================================================
   CALENDAR CONTROLS
   ========================================================= */

function changeCalendarMonth(offset) {
    selectedCalendarDate =
        new Date(
            selectedCalendarDate.getFullYear(),
            selectedCalendarDate.getMonth() + offset,
            1
        );

    renderCalendar();
}


function goToToday() {
    selectedCalendarDate =
        new Date();

    renderCalendar();
}


function setupCalendarEvents() {
    const previousButton =
        $("[data-calendar-prev]") ||
        $("#calendarPrev");

    const nextButton =
        $("[data-calendar-next]") ||
        $("#calendarNext");

    const todayButton =
        $("[data-calendar-today]") ||
        $("#calendarToday");

    previousButton?.addEventListener(
        "click",
        () => changeCalendarMonth(-1)
    );

    nextButton?.addEventListener(
        "click",
        () => changeCalendarMonth(1)
    );

    todayButton?.addEventListener(
        "click",
        goToToday
    );

    const eventForm =
        $("#calendarEventForm");

    eventForm?.addEventListener(
        "submit",
        event => {
            event.preventDefault();

            const title =
                $("#calendarEventTitle")?.value ||
                "";

            const time =
                $("#calendarEventTime")?.value ||
                "";

            const description =
                $("#calendarEventDescription")?.value ||
                "";

            addCalendarEvent({
                title,
                date: formatDateKey(
                    selectedCalendarDate
                ),
                time,
                description
            });

            eventForm.reset();
        }
    );

    document.addEventListener(
        "click",
        event => {
            const deleteButton =
                event.target.closest(
                    "[data-action='delete-calendar-event']"
                );

            if (!deleteButton) {
                return;
            }

            deleteCalendarEvent(
                deleteButton.dataset.id
            );
        }
    );
}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatDateKey(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function parseDateKey(value) {
    if (!value) {
        return null;
    }

    const parts =
        value.split("-").map(Number);

    if (parts.length !== 3) {
        return null;
    }

    const [
        year,
        month,
        day
    ] = parts;

    const date =
        new Date(
            year,
            month - 1,
            day
        );

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}


/* =========================================================
   UTILITY HELPERS
   ========================================================= */

function capitalize(value = "") {
    return value.charAt(0).toUpperCase() +
        value.slice(1);
}


/* =========================================================
   INITIALISE ASSIGNMENT + CALENDAR EVENTS
   ========================================================= */

function setupAcademicFeatures() {
    setupAssignmentEvents();
    setupCalendarEvents();
}
/* =========================================================
   TUTORS / FIND A PEER
   ========================================================= */

function renderTutors() {
    const container =
        $("[data-tutors-list]") ||
        $("#tutorsList") ||
        $(".tutors-list");

    if (!container) {
        return;
    }

    const tutors =
        appData.tutors || [];

    if (!tutors.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>🤝</span>
                <p>No peer tutors are available right now.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        tutors.map(tutor => `
            <article
                class="tutor-card"
                data-tutor-id="${tutor.id}"
            >
                <div class="tutor-avatar">
                    ${escapeHTML(
                        tutor.initials ||
                        getInitials(tutor.name)
                    )}
                </div>

                <div class="tutor-card-content">

                    <div class="tutor-card-heading">
                        <div>
                            <h3>
                                ${escapeHTML(tutor.name)}
                            </h3>

                            <span class="tutor-year">
                                Year ${escapeHTML(
                                    String(tutor.year || "")
                                )}
                            </span>
                        </div>
                    </div>

                    <p class="tutor-bio">
                        ${escapeHTML(
                            tutor.bio ||
                            "Peer tutor at St Oran's College."
                        )}
                    </p>

                    <div class="tutor-subjects">
                        ${
                            (tutor.subjects || [])
                                .map(subject => `
                                    <span class="subject-tag">
                                        ${escapeHTML(subject)}
                                    </span>
                                `)
                                .join("")
                        }
                    </div>

                    <div class="tutor-availability">
                        <span>🕐</span>
                        ${escapeHTML(
                            tutor.availability ||
                            "Availability varies"
                        )}
                    </div>

                    <div class="tutor-actions">

                        <button
                            type="button"
                            class="button button-primary"
                            data-action="book-tutor"
                            data-id="${tutor.id}"
                        >
                            Request session
                        </button>

                        <button
                            type="button"
                            class="button button-secondary"
                            data-action="view-tutor"
                            data-id="${tutor.id}"
                        >
                            View profile
                        </button>

                    </div>

                </div>
            </article>
        `).join("");
}


/* =========================================================
   TUTOR SEARCH + FILTERING
   ========================================================= */

function setupTutorSearch() {
    const searchInput =
        $("[data-tutor-search]") ||
        $("#tutorSearch");

    const subjectFilter =
        $("[data-tutor-subject]") ||
        $("#tutorSubjectFilter");

    const yearFilter =
        $("[data-tutor-year]") ||
        $("#tutorYearFilter");

    searchInput?.addEventListener(
        "input",
        filterTutors
    );

    subjectFilter?.addEventListener(
        "change",
        filterTutors
    );

    yearFilter?.addEventListener(
        "change",
        filterTutors
    );
}


function filterTutors() {
    const container =
        $("[data-tutors-list]") ||
        $("#tutorsList") ||
        $(".tutors-list");

    if (!container) {
        return;
    }

    const searchInput =
        $("[data-tutor-search]") ||
        $("#tutorSearch");

    const subjectFilter =
        $("[data-tutor-subject]") ||
        $("#tutorSubjectFilter");

    const yearFilter =
        $("[data-tutor-year]") ||
        $("#tutorYearFilter");

    const search =
        (searchInput?.value || "")
            .trim()
            .toLowerCase();

    const selectedSubject =
        subjectFilter?.value || "";

    const selectedYear =
        yearFilter?.value || "";

    const tutors =
        (appData.tutors || [])
            .filter(tutor => {

                const matchesSearch =
                    !search ||
                    tutor.name
                        .toLowerCase()
                        .includes(search) ||
                    (tutor.bio || "")
                        .toLowerCase()
                        .includes(search) ||
                    (tutor.subjects || [])
                        .some(subject =>
                            subject
                                .toLowerCase()
                                .includes(search)
                        );

                const matchesSubject =
                    !selectedSubject ||
                    (tutor.subjects || [])
                        .includes(selectedSubject);

                const matchesYear =
                    !selectedYear ||
                    String(tutor.year) ===
                        String(selectedYear);

                return (
                    matchesSearch &&
                    matchesSubject &&
                    matchesYear
                );
            });

    if (!tutors.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>🔎</span>
                <p>No peers matched your search.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        tutors.map(tutor => `
            <article
                class="tutor-card"
                data-tutor-id="${tutor.id}"
            >
                <div class="tutor-avatar">
                    ${escapeHTML(
                        tutor.initials ||
                        getInitials(tutor.name)
                    )}
                </div>

                <div class="tutor-card-content">

                    <div class="tutor-card-heading">
                        <div>
                            <h3>
                                ${escapeHTML(tutor.name)}
                            </h3>

                            <span class="tutor-year">
                                Year ${escapeHTML(
                                    String(tutor.year || "")
                                )}
                            </span>
                        </div>
                    </div>

                    <p class="tutor-bio">
                        ${escapeHTML(
                            tutor.bio || ""
                        )}
                    </p>

                    <div class="tutor-subjects">
                        ${
                            (tutor.subjects || [])
                                .map(subject => `
                                    <span class="subject-tag">
                                        ${escapeHTML(subject)}
                                    </span>
                                `)
                                .join("")
                        }
                    </div>

                    <div class="tutor-availability">
                        <span>🕐</span>
                        ${escapeHTML(
                            tutor.availability || ""
                        )}
                    </div>

                    <div class="tutor-actions">
                        <button
                            type="button"
                            class="button button-primary"
                            data-action="book-tutor"
                            data-id="${tutor.id}"
                        >
                            Request session
                        </button>

                        <button
                            type="button"
                            class="button button-secondary"
                            data-action="view-tutor"
                            data-id="${tutor.id}"
                        >
                            View profile
                        </button>
                    </div>

                </div>
            </article>
        `).join("");
}


/* =========================================================
   TUTOR PROFILE MODAL
   ========================================================= */

function viewTutorProfile(id) {
    const tutor =
        (appData.tutors || []).find(
            item => String(item.id) === String(id)
        );

    if (!tutor) {
        return;
    }

    let modal =
        $("#tutorModal");

    if (!modal) {
        modal =
            document.createElement("div");

        modal.id = "tutorModal";
        modal.className = "modal-overlay";

        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div
            class="modal-card tutor-modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="Peer tutor profile"
        >
            <button
                type="button"
                class="modal-close"
                data-action="close-tutor-modal"
                aria-label="Close"
            >
                ×
            </button>

            <div class="tutor-modal-avatar">
                ${escapeHTML(
                    tutor.initials ||
                    getInitials(tutor.name)
                )}
            </div>

            <h2>
                ${escapeHTML(tutor.name)}
            </h2>

            <p class="tutor-year">
                Year ${escapeHTML(
                    String(tutor.year || "")
                )}
            </p>

            <p class="tutor-modal-bio">
                ${escapeHTML(
                    tutor.bio ||
                    "Peer tutor at St Oran's College."
                )}
            </p>

            <div class="tutor-modal-section">
                <h4>Subjects</h4>

                <div class="tutor-subjects">
                    ${
                        (tutor.subjects || [])
                            .map(subject => `
                                <span class="subject-tag">
                                    ${escapeHTML(subject)}
                                </span>
                            `)
                            .join("")
                    }
                </div>
            </div>

            <div class="tutor-modal-section">
                <h4>Availability</h4>

                <p>
                    ${escapeHTML(
                        tutor.availability ||
                        "Availability varies"
                    )}
                </p>
            </div>

            <button
                type="button"
                class="button button-primary button-full"
                data-action="book-tutor"
                data-id="${tutor.id}"
            >
                Request a session
            </button>
        </div>
    `;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
}


function closeTutorModal() {
    const modal =
        $("#tutorModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}


/* =========================================================
   BOOKING SYSTEM
   ========================================================= */

function bookTutor(id) {
    const tutor =
        (appData.tutors || []).find(
            item => String(item.id) === String(id)
        );

    if (!tutor) {
        return;
    }

    const user =
        getCurrentUserFromData();

    if (!user) {
        showToast(
            "Please sign in first."
        );

        return;
    }

    openBookingModal(tutor);
}


function openBookingModal(tutor) {
    let modal =
        $("#bookingModal");

    if (!modal) {
        modal =
            document.createElement("div");

        modal.id = "bookingModal";
        modal.className = "modal-overlay";

        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div
            class="modal-card booking-modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="Request a peer tutoring session"
        >
            <button
                type="button"
                class="modal-close"
                data-action="close-booking-modal"
                aria-label="Close"
            >
                ×
            </button>

            <div class="modal-eyebrow">
                PEER TUTORING
            </div>

            <h2>
                Request a session
            </h2>

            <p class="modal-description">
                Send ${escapeHTML(
                    tutor.name
                )} a tutoring request.
            </p>

            <form id="bookingForm">

                <input
                    type="hidden"
                    id="bookingTutorId"
                    value="${tutor.id}"
                >

                <label for="bookingSubject">
                    Subject
                </label>

                <select
                    id="bookingSubject"
                    required
                >
                    <option value="">
                        Choose a subject
                    </option>

                    ${
                        (tutor.subjects || [])
                            .map(subject => `
                                <option value="${escapeHTML(subject)}">
                                    ${escapeHTML(subject)}
                                </option>
                            `)
                            .join("")
                    }
                </select>

                <label for="bookingDate">
                    Date
                </label>

                <input
                    type="date"
                    id="bookingDate"
                    required
                >

                <label for="bookingTime">
                    Preferred time
                </label>

                <input
                    type="time"
                    id="bookingTime"
                    required
                >

                <label for="bookingMessage">
                    Message
                </label>

                <textarea
                    id="bookingMessage"
                    rows="4"
                    placeholder="What would you like help with?"
                ></textarea>

                <button
                    type="submit"
                    class="button button-primary button-full"
                >
                    Send request
                </button>

            </form>
        </div>
    `;

    modal.classList.add("show");
    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    const dateInput =
        $("#bookingDate");

    if (dateInput) {
        const tomorrow =
            new Date();

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );

        dateInput.min =
            formatDateKey(tomorrow);
    }

    $("#bookingForm")?.addEventListener(
        "submit",
        handleBookingSubmit
    );
}


function handleBookingSubmit(event) {
    event.preventDefault();

    const tutorId =
        $("#bookingTutorId")?.value;

    const subject =
        $("#bookingSubject")?.value;

    const date =
        $("#bookingDate")?.value;

    const time =
        $("#bookingTime")?.value;

    const message =
        $("#bookingMessage")?.value || "";

    if (
        !tutorId ||
        !subject ||
        !date ||
        !time
    ) {
        showToast(
            "Please complete the booking details."
        );

        return;
    }

    const tutor =
        (appData.tutors || []).find(
            item =>
                String(item.id) ===
                String(tutorId)
        );

    if (!tutor) {
        return;
    }

    const user =
        getCurrentUserFromData();

    if (!user) {
        return;
    }

    if (!Array.isArray(appData.bookings)) {
        appData.bookings = [];
    }

    appData.bookings.push({
        id:
            Date.now() +
            Math.random()
                .toString(36)
                .slice(2, 7),

        tutorId: tutor.id,
        tutorName: tutor.name,

        studentId: user.id,
        studentName: user.name,

        subject,
        date,
        time,
        message: message.trim(),

        status: "pending",
        createdAt:
            new Date().toISOString()
    });

    saveData();

    closeBookingModal();

    showToast(
        `Request sent to ${tutor.name} 🤝`
    );
}


function closeBookingModal() {
    const modal =
        $("#bookingModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   MY BOOKINGS
   ========================================================= */

function renderBookings() {
    const container =
        $("[data-bookings-list]") ||
        $("#bookingsList") ||
        $(".bookings-list");

    if (!container) {
        return;
    }

    const user =
        getCurrentUserFromData();

    if (!user) {
        return;
    }

    const bookings =
        (appData.bookings || [])
            .filter(
                booking =>
                    booking.studentId === user.id
            )
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );

    if (!bookings.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>🤝</span>
                <p>You haven't requested any peer sessions yet.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        bookings.map(booking => `
            <article class="booking-card">

                <div class="booking-card-main">

                    <div class="booking-avatar">
                        ${escapeHTML(
                            getInitials(
                                booking.tutorName
                            )
                        )}
                    </div>

                    <div>
                        <h4>
                            ${escapeHTML(
                                booking.tutorName
                            )}
                        </h4>

                        <p>
                            ${escapeHTML(
                                booking.subject
                            )}
                        </p>

                        <small>
                            ${formatReadableDate(
                                booking.date
                            )}
                            ·
                            ${escapeHTML(
                                booking.time
                            )}
                        </small>
                    </div>

                </div>

                <span class="booking-status ${
                    escapeHTML(
                        booking.status || "pending"
                    )
                }">
                    ${escapeHTML(
                        capitalize(
                            booking.status || "pending"
                        )
                    )}
                </span>

            </article>
        `).join("");
}


/* =========================================================
   TUTOR EVENT HANDLING
   ========================================================= */

function setupTutorEvents() {
    setupTutorSearch();

    document.addEventListener(
        "click",
        event => {

            const bookButton =
                event.target.closest(
                    "[data-action='book-tutor']"
                );

            if (bookButton) {
                bookTutor(
                    bookButton.dataset.id
                );

                return;
            }

            const viewButton =
                event.target.closest(
                    "[data-action='view-tutor']"
                );

            if (viewButton) {
                viewTutorProfile(
                    viewButton.dataset.id
                );

                return;
            }

            const closeTutorButton =
                event.target.closest(
                    "[data-action='close-tutor-modal']"
                );

            if (closeTutorButton) {
                closeTutorModal();
                return;
            }

            const closeBookingButton =
                event.target.closest(
                    "[data-action='close-booking-modal']"
                );

            if (closeBookingButton) {
                closeBookingModal();
                return;
            }

            if (
                event.target.classList.contains(
                    "modal-overlay"
                )
            ) {
                closeTutorModal();
                closeBookingModal();
            }
        }
    );
}


/* =========================================================
   TUTOR PAGE
   ========================================================= */

function renderTutorPageExtras() {
    renderBookings();
}


/* =========================================================
   END OF PART 4
   ========================================================= */
/* =========================================================
   STUDY PAGE
   ========================================================= */

function renderStudyPage() {
    renderStudyStats();
    renderStudyTimer();
    renderStudyEnvironment();
    renderStudyQuote();
}


/* =========================================================
   STUDY STATS
   ========================================================= */

function renderStudyStats() {
    const user =
        getCurrentUserFromData();

    if (!user) {
        return;
    }

    const sessionElements =
        $$("[data-study-sessions]");

    sessionElements.forEach(element => {
        element.textContent =
            Number(user.sessions || 0);
    });

    const pointsElements =
        $$("[data-study-points]");

    pointsElements.forEach(element => {
        element.textContent =
            Number(user.points || 0)
                .toLocaleString();
    });
}


/* =========================================================
   STUDY TIMER
   ========================================================= */

function renderStudyTimer() {
    updateTimerDisplay();

    const focusInput =
        $("#customFocusMinutes");

    if (
        focusInput &&
        !focusInput.value
    ) {
        focusInput.value =
            customFocusMinutes;
    }

    updateTimerButtons();
}


function updateTimerDisplay() {
    const minutes =
        Math.floor(timerSeconds / 60);

    const seconds =
        timerSeconds % 60;

    const formatted =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;

    const timerElements =
        $$("[data-timer-display]");

    timerElements.forEach(element => {
        element.textContent =
            formatted;
    });

    const legacyTimer =
        $("#timerDisplay");

    if (legacyTimer) {
        legacyTimer.textContent =
            formatted;
    }

    const modeElements =
        $$("[data-timer-mode]");

    modeElements.forEach(element => {
        element.textContent =
            timerMode === "focus"
                ? "Focus"
                : "Break";
    });
}


function updateTimerButtons() {
    const startButtons =
        $$("[data-action='start-timer']");

    const pauseButtons =
        $$("[data-action='pause-timer']");

    const resetButtons =
        $$("[data-action='reset-timer']");

    startButtons.forEach(button => {
        button.disabled =
            timerRunning;

        button.classList.toggle(
            "hidden",
            timerRunning
        );
    });

    pauseButtons.forEach(button => {
        button.disabled =
            !timerRunning;

        button.classList.toggle(
            "hidden",
            !timerRunning
        );
    });

    resetButtons.forEach(button => {
        button.disabled =
            false;
    });
}


function startTimer() {
    if (timerRunning) {
        return;
    }

    timerRunning = true;

    updateTimerButtons();

    timerInterval =
        setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;

                updateTimerDisplay();
                return;
            }

            finishTimer();
        }, 1000);
}


function pauseTimer() {
    if (!timerRunning) {
        return;
    }

    timerRunning = false;

    clearInterval(timerInterval);

    timerInterval = null;

    updateTimerButtons();
}


function stopTimer() {
    timerRunning = false;

    clearInterval(timerInterval);

    timerInterval = null;

    timerSeconds =
        timerMode === "focus"
            ? customFocusMinutes * 60
            : 5 * 60;

    updateTimerDisplay();
    updateTimerButtons();
}


function resetTimer() {
    timerRunning = false;

    clearInterval(timerInterval);

    timerInterval = null;

    timerSeconds =
        timerMode === "focus"
            ? customFocusMinutes * 60
            : 5 * 60;

    updateTimerDisplay();
    updateTimerButtons();

    showToast(
        "Timer reset."
    );
}


function finishTimer() {
    clearInterval(timerInterval);

    timerInterval = null;
    timerRunning = false;

    if (timerMode === "focus") {
        completeStudySession();

        timerMode = "break";
        timerSeconds = 5 * 60;

        showToast(
            "Focus session complete. Time for a break 🌿"
        );
    } else {
        timerMode = "focus";
        timerSeconds =
            customFocusMinutes * 60;

        showToast(
            "Break finished. Ready for another focus session?"
        );
    }

    updateTimerDisplay();
    updateTimerButtons();
    updateStudyModeUI();
}


function setTimerMode(mode) {
    if (
        mode !== "focus" &&
        mode !== "break"
    ) {
        return;
    }

    timerRunning = false;

    clearInterval(timerInterval);

    timerInterval = null;

    timerMode = mode;

    timerSeconds =
        mode === "focus"
            ? customFocusMinutes * 60
            : 5 * 60;

    updateTimerDisplay();
    updateTimerButtons();
    updateStudyModeUI();
}


function setCustomFocusMinutes(minutes) {
    minutes =
        Number(minutes);

    if (
        !Number.isFinite(minutes) ||
        minutes <= 0
    ) {
        return;
    }

    minutes =
        Math.min(
            Math.max(Math.round(minutes), 1),
            180
        );

    customFocusMinutes =
        minutes;

    if (
        timerMode === "focus" &&
        !timerRunning
    ) {
        timerSeconds =
            minutes * 60;

        updateTimerDisplay();
    }
}


/* =========================================================
   STUDY SESSION COMPLETION
   ========================================================= */

function completeStudySession() {
    const user =
        getCurrentUserFromData();

    if (!user) {
        return;
    }

    const currentSessions =
        Number(user.sessions || 0);

    const currentPoints =
        Number(user.points || 0);

    updateCurrentUser({
        sessions:
            currentSessions + 1,

        points:
            currentPoints + 10,

        previousPoints:
            currentPoints
    });

    renderStudyStats();
    updateUserInterface();
    renderHome();
}


/* =========================================================
   STUDY ENVIRONMENTS
   ========================================================= */

function renderStudyEnvironment() {
    const background =
        currentFocusBackground;

    const environmentElements =
        $$("[data-study-environment]");

    environmentElements.forEach(element => {
        element.dataset.environment =
            background;

        element.classList.remove(
            "forest",
            "library",
            "rain",
            "night",
            "cafe"
        );

        element.classList.add(
            background
        );
    });
}


function setStudyEnvironment(environment) {
    const validEnvironments = [
        "forest",
        "library",
        "rain",
        "night",
        "cafe"
    ];

    if (
        !validEnvironments.includes(
            environment
        )
    ) {
        return;
    }

    currentFocusBackground =
        environment;

    renderStudyEnvironment();
    updateFocusModeDisplay();

    showToast(
        `Study environment: ${capitalize(environment)}`
    );
}


/* =========================================================
   STUDY SOUND
   ========================================================= */

function setStudySound(sound) {
    const validSounds = [
        "forest",
        "rain",
        "cafe",
        "fireplace",
        "none"
    ];

    if (
        !validSounds.includes(sound)
    ) {
        return;
    }

    currentFocusSound =
        sound;

    updateStudySoundUI();

    showToast(
        sound === "none"
            ? "Study sounds turned off."
            : `Study sound: ${capitalize(sound)}`
    );
}


function updateStudySoundUI() {
    const soundButtons =
        $$("[data-study-sound]");

    soundButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.studySound ===
                currentFocusSound
        );
    });
}


/* =========================================================
   ST RORAN STUDY QUOTES
   ========================================================= */

function renderStudyQuote() {
    const quoteElement =
        $("[data-study-quote]") ||
        $("#studyQuote");

    if (!quoteElement) {
        return;
    }

    const quotes = [
        "A little progress still counts.",
        "You don't need to know everything at once.",
        "Focus on the page in front of you.",
        "Future you is going to appreciate this.",
        "One question at a time.",
        "You can do difficult things."
    ];

    const index =
        new Date().getDate() %
        quotes.length;

    quoteElement.textContent =
        quotes[index];
}


function renderRoranMessage() {
    const messageElement =
        $("[data-roran-message]") ||
        $("#roranMessage");

    if (!messageElement) {
        return;
    }

    const messages = [
        "St Roran says: you've got this. 🐉",
        "St Roran says: one task at a time.",
        "St Roran says: your notes are not going to organise themselves.",
        "St Roran says: focus first, panic never.",
        "St Roran says: ten focused minutes beats zero."
    ];

    const index =
        new Date().getDate() %
        messages.length;

    messageElement.textContent =
        messages[index];
}


/* =========================================================
   STUDY TIMER CONTROLS
   ========================================================= */

function setupStudyTimerEvents() {
    document.addEventListener(
        "click",
        event => {

            const startButton =
                event.target.closest(
                    "[data-action='start-timer']"
                );

            if (startButton) {
                startTimer();
                return;
            }

            const pauseButton =
                event.target.closest(
                    "[data-action='pause-timer']"
                );

            if (pauseButton) {
                pauseTimer();
                return;
            }

            const resetButton =
                event.target.closest(
                    "[data-action='reset-timer']"
                );

            if (resetButton) {
                resetTimer();
                return;
            }

            const focusButton =
                event.target.closest(
                    "[data-action='focus-mode']"
                );

            if (focusButton) {
                setTimerMode("focus");
                return;
            }

            const breakButton =
                event.target.closest(
                    "[data-action='break-mode']"
                );

            if (breakButton) {
                setTimerMode("break");
                return;
            }

            const environmentButton =
                event.target.closest(
                    "[data-study-environment]"
                );

            if (
                environmentButton &&
                environmentButton.dataset.environment
            ) {
                setStudyEnvironment(
                    environmentButton.dataset.environment
                );

                return;
            }

            const soundButton =
                event.target.closest(
                    "[data-study-sound]"
                );

            if (
                soundButton &&
                soundButton.dataset.studySound
            ) {
                setStudySound(
                    soundButton.dataset.studySound
                );
            }
        }
    );


    const customInput =
        $("#customFocusMinutes");

    customInput?.addEventListener(
        "change",
        event => {
            setCustomFocusMinutes(
                event.target.value
            );
        }
    );


    customInput?.addEventListener(
        "input",
        event => {
            const value =
                Number(event.target.value);

            if (
                Number.isFinite(value) &&
                value > 0
            ) {
                customFocusMinutes =
                    Math.min(
                        Math.max(
                            Math.round(value),
                            1
                        ),
                        180
                    );
            }
        }
    );
}


/* =========================================================
   STUDY MODE UI
   ========================================================= */

function updateStudyModeUI() {
    const modeButtons =
        $$("[data-timer-mode-button]");

    modeButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.timerModeButton ===
                timerMode
        );
    });

    const focusCards =
        $$("[data-focus-card]");

    focusCards.forEach(card => {
        card.classList.toggle(
            "active",
            timerMode === "focus"
        );
    });

    const breakCards =
        $$("[data-break-card]");

    breakCards.forEach(card => {
        card.classList.toggle(
            "active",
            timerMode === "break"
        );
    });
}


/* =========================================================
   FOCUS MODE
   ========================================================= */

function setupFocusMode() {
    const focusModeButton =
        $("#focusModeButton") ||
        $("[data-action='open-focus-mode']");

    focusModeButton?.addEventListener(
        "click",
        openFocusMode
    );

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Escape" &&
                document.body.classList.contains(
                    "focus-mode-active"
                )
            ) {
                closeFocusMode();
            }
        }
    );

    updateFocusModeDisplay();
}


function openFocusMode() {
    document.body.classList.add(
        "focus-mode-active"
    );

    const focusMode =
        $("#focusMode");

    focusMode?.classList.add("show");

    updateFocusModeDisplay();

    showToast(
        "Focus mode activated 🌿"
    );
}


function closeFocusMode() {
    document.body.classList.remove(
        "focus-mode-active"
    );

    const focusMode =
        $("#focusMode");

    focusMode?.classList.remove("show");
}


function updateFocusModeDisplay() {
    const display =
        $("#focusModeTimer") ||
        $("[data-focus-mode-timer]");

    if (display) {
        const minutes =
            Math.floor(
                timerSeconds / 60
            );

        const seconds =
            timerSeconds % 60;

        display.textContent =
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;
    }

    const environment =
        $("#focusMode") ||
        document.body;

    environment.dataset.focusBackground =
        currentFocusBackground;

    environment.dataset.focusSound =
        currentFocusSound;
}


function stopFocusTimer() {
    focusRunning = false;

    clearInterval(
        focusTimerInterval
    );

    focusTimerInterval = null;
}


/* =========================================================
   STUDY ENVIRONMENT CARD
   ========================================================= */

function selectStudyCard(card) {
    if (!card) {
        return;
    }

    const environment =
        card.dataset.studyEnvironment;

    if (!environment) {
        return;
    }

    activeStudyEnvironment =
        environment;

    setStudyEnvironment(
        environment
    );
}


/* =========================================================
   END OF PART 5
   ========================================================= */
/* =========================================================
   PART 6
   STUDY PAGE VISUALS, PLAYLISTS, CARDS & ENVIRONMENTS
   ========================================================= */


/* =========================================================
   STUDY CARD ANIMATIONS
   ========================================================= */

function setupStudyCardAnimations() {
    const cards = $$("[data-study-card]");

    if (!cards.length) return;

    cards.forEach((card, index) => {
        card.style.setProperty("--study-card-index", index);

        // Prevent the animation from being added repeatedly.
        card.classList.remove("study-card-enter");

        requestAnimationFrame(() => {
            card.classList.add("study-card-enter");
        });

        card.addEventListener("mouseenter", () => {
            card.classList.add("study-card-hover");
        });

        card.addEventListener("mouseleave", () => {
            card.classList.remove("study-card-hover");
        });
    });
}


/* =========================================================
   STUDY CARD SELECTION
   ========================================================= */

function setupStudyCards() {
    const cards = $$("[data-study-card]");

    cards.forEach(card => {
        card.addEventListener("click", event => {
            /*
             * Don't select the whole card when the user clicks
             * an actual button, link, iframe, input, etc.
             */
            if (
                event.target.closest("button") ||
                event.target.closest("a") ||
                event.target.closest("input") ||
                event.target.closest("select") ||
                event.target.closest("iframe")
            ) {
                return;
            }

            const environment =
                card.dataset.studyCard ||
                card.dataset.environment ||
                card.dataset.studyEnvironment;

            if (environment) {
                selectStudyCard(environment);
            }
        });
    });
}


/* =========================================================
   STUDY CARD ACTIVE STATE
   ========================================================= */

function updateStudyCardSelection() {
    const cards = $$("[data-study-card]");

    cards.forEach(card => {
        const environment =
            card.dataset.studyCard ||
            card.dataset.environment ||
            card.dataset.studyEnvironment;

        const isActive = environment === activeStudyEnvironment;

        card.classList.toggle("active", isActive);
        card.classList.toggle("selected", isActive);
        card.setAttribute("aria-selected", String(isActive));

        if (isActive) {
            card.dataset.active = "true";
        } else {
            delete card.dataset.active;
        }
    });
}


/* =========================================================
   STUDY PLAYLIST EMBEDS
   ========================================================= */

function setupStudyPlaylists() {
    const playlistContainers = $$(
        "[data-study-playlist], [data-playlist], .study-playlist"
    );

    playlistContainers.forEach(container => {
        const iframe = $("iframe", container);

        if (!iframe) return;

        /*
         * Make embedded playlists behave nicely inside the
         * animated study cards.
         */
        iframe.setAttribute("loading", "lazy");
        iframe.setAttribute("allow", "autoplay; encrypted-media");

        const card = container.closest(
            "[data-study-card], .study-card, .environment-card"
        );

        if (card) {
            card.classList.add("has-playlist");
        }

        /*
         * Stop the card click event from triggering when the
         * user interacts with the embedded playlist.
         */
        iframe.addEventListener("click", event => {
            event.stopPropagation();
        });
    });
}


/* =========================================================
   PLAYLIST CARD ANIMATION
   ========================================================= */

function animatePlaylistCards() {
    const cards = $$(
        "[data-study-card], .study-card, .environment-card"
    );

    cards.forEach((card, index) => {
        card.style.setProperty(
            "--playlist-card-delay",
            `${index * 70}ms`
        );

        if (
            card.querySelector("iframe") ||
            card.matches("[data-study-playlist]") ||
            card.querySelector("[data-playlist]")
        ) {
            card.classList.add("playlist-card");
        }
    });
}


/* =========================================================
   STUDY ENVIRONMENT BACKGROUNDS
   ========================================================= */

const STUDY_ENVIRONMENTS = {
    forest: {
        name: "Forest",
        className: "study-environment-forest",
        backgroundClass: "environment-forest"
    },

    library: {
        name: "Library",
        className: "study-environment-library",
        backgroundClass: "environment-library"
    },

    rain: {
        name: "Rain",
        className: "study-environment-rain",
        backgroundClass: "environment-rain"
    },

    night: {
        name: "Night",
        className: "study-environment-night",
        backgroundClass: "environment-night"
    },

    cafe: {
        name: "Café",
        className: "study-environment-cafe",
        backgroundClass: "environment-cafe"
    }
};


/* =========================================================
   APPLY ENVIRONMENT
   ========================================================= */

function applyStudyEnvironment(environment) {
    const validEnvironment =
        STUDY_ENVIRONMENTS[environment]
            ? environment
            : "forest";

    const body = document.body;
    const studyPage = document.querySelector(".study-page");
    const focusMode = document.querySelector(".focus-mode");

    /*
     * Remove every possible environment class first.
     * This prevents Forest + Rain + Night from somehow
     * becoming a deeply confused weather forecast.
     */
    Object.values(STUDY_ENVIRONMENTS).forEach(config => {
        body.classList.remove(config.className);
        body.classList.remove(config.backgroundClass);

        if (studyPage) {
            studyPage.classList.remove(config.className);
            studyPage.classList.remove(config.backgroundClass);
        }

        if (focusMode) {
            focusMode.classList.remove(config.className);
            focusMode.classList.remove(config.backgroundClass);
        }
    });

    const config = STUDY_ENVIRONMENTS[validEnvironment];

    body.classList.add(config.className);
    body.classList.add(config.backgroundClass);

    if (studyPage) {
        studyPage.classList.add(config.className);
        studyPage.classList.add(config.backgroundClass);
    }

    if (focusMode) {
        focusMode.classList.add(config.className);
        focusMode.classList.add(config.backgroundClass);
    }

    body.dataset.studyEnvironment = validEnvironment;

    if (studyPage) {
        studyPage.dataset.studyEnvironment = validEnvironment;
    }

    if (focusMode) {
        focusMode.dataset.studyEnvironment = validEnvironment;
    }

    updateEnvironmentButtons(validEnvironment);
}


/* =========================================================
   ENVIRONMENT BUTTONS
   ========================================================= */

function updateEnvironmentButtons(environment) {
    const buttons = $$(
        "[data-study-environment], [data-environment]"
    );

    buttons.forEach(button => {
        const buttonEnvironment =
            button.dataset.studyEnvironment ||
            button.dataset.environment;

        const active = buttonEnvironment === environment;

        button.classList.toggle("active", active);
        button.classList.toggle("selected", active);

        button.setAttribute("aria-pressed", String(active));

        if (active) {
            button.dataset.active = "true";
        } else {
            delete button.dataset.active;
        }
    });
}


/* =========================================================
   ANIMATED BACKGROUND ENGINE
   ========================================================= */

function createStudyBackgroundParticles() {
    const containers = $$(
        "[data-study-background], .study-background, .study-bg"
    );

    containers.forEach(container => {
        /*
         * Don't create duplicate particles every time the page
         * re-renders.
         */
        if (container.dataset.particlesCreated === "true") {
            return;
        }

        container.dataset.particlesCreated = "true";

        const particleCount = 18;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("span");

            particle.className = "study-background-particle";

            particle.style.setProperty(
                "--particle-index",
                i
            );

            particle.style.setProperty(
                "--particle-delay",
                `${(i * 0.35).toFixed(2)}s`
            );

            particle.style.setProperty(
                "--particle-duration",
                `${5 + (i % 5)}s`
            );

            particle.style.setProperty(
                "--particle-left",
                `${(i * 37) % 100}%`
            );

            container.appendChild(particle);
        }
    });
}


/* =========================================================
   RAIN BACKGROUND
   ========================================================= */

function createRainEffect() {
    const containers = $$(
        "[data-rain-effect], .rain-effect, .study-rain"
    );

    containers.forEach(container => {
        if (container.dataset.rainCreated === "true") {
            return;
        }

        container.dataset.rainCreated = "true";

        for (let i = 0; i < 28; i++) {
            const drop = document.createElement("span");

            drop.className = "rain-drop";

            drop.style.setProperty(
                "--rain-index",
                i
            );

            drop.style.setProperty(
                "--rain-delay",
                `${(i * 0.18).toFixed(2)}s`
            );

            drop.style.setProperty(
                "--rain-duration",
                `${0.7 + ((i % 5) * 0.15)}s`
            );

            drop.style.setProperty(
                "--rain-left",
                `${(i * 29) % 100}%`
            );

            container.appendChild(drop);
        }
    });
}


/* =========================================================
   FOREST FIREFLY EFFECT
   ========================================================= */

function createForestFireflies() {
    const containers = $$(
        "[data-forest-effect], .forest-effect, .study-forest"
    );

    containers.forEach(container => {
        if (container.dataset.firefliesCreated === "true") {
            return;
        }

        container.dataset.firefliesCreated = "true";

        for (let i = 0; i < 16; i++) {
            const firefly = document.createElement("span");

            firefly.className = "forest-firefly";

            firefly.style.setProperty(
                "--firefly-index",
                i
            );

            firefly.style.setProperty(
                "--firefly-delay",
                `${(i * 0.42).toFixed(2)}s`
            );

            firefly.style.setProperty(
                "--firefly-left",
                `${(i * 43) % 100}%`
            );

            firefly.style.setProperty(
                "--firefly-top",
                `${20 + ((i * 17) % 65)}%`
            );

            container.appendChild(firefly);
        }
    });
}


/* =========================================================
   NIGHT SKY EFFECT
   ========================================================= */

function createNightStars() {
    const containers = $$(
        "[data-night-effect], .night-effect, .study-night"
    );

    containers.forEach(container => {
        if (container.dataset.starsCreated === "true") {
            return;
        }

        container.dataset.starsCreated = "true";

        for (let i = 0; i < 34; i++) {
            const star = document.createElement("span");

            star.className = "night-star";

            star.style.setProperty(
                "--star-index",
                i
            );

            star.style.setProperty(
                "--star-delay",
                `${(i * 0.21).toFixed(2)}s`
            );

            star.style.setProperty(
                "--star-left",
                `${(i * 31) % 100}%`
            );

            star.style.setProperty(
                "--star-top",
                `${(i * 19) % 80}%`
            );

            container.appendChild(star);
        }
    });
}


/* =========================================================
   STUDY AMBIENCE VISUAL SETUP
   ========================================================= */

function setupStudyAmbience() {
    createStudyBackgroundParticles();
    createRainEffect();
    createForestFireflies();
    createNightStars();

    applyStudyEnvironment(
        currentFocusBackground || "forest"
    );
}


/* =========================================================
   STUDY SOUND CONTROLS
   ========================================================= */

let studyAmbientAudio = null;

const STUDY_SOUND_FILES = {
    forest: "",
    rain: "",
    cafe: "",
    fireplace: "",
    none: ""
};


/*
 * The sound system deliberately does not invent external
 * audio URLs. If the HTML already provides audio elements,
 * those are used. Otherwise the visual environment still
 * works normally.
 */

function setupStudySoundSystem() {
    const audioElements = $$(
        "[data-study-sound-audio], audio[data-study-sound]"
    );

    audioElements.forEach(audio => {
        audio.loop = true;
        audio.preload = "none";
    });

    updateStudySoundUI();
}


function playStudySound(sound) {
    stopStudySound();

    currentFocusSound = sound;

    const audio =
        document.querySelector(
            `[data-study-sound-audio="${sound}"]`
        ) ||
        document.querySelector(
            `audio[data-study-sound="${sound}"]`
        );

    if (audio) {
        studyAmbientAudio = audio;

        audio.loop = true;

        const playPromise = audio.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                /*
                 * Browsers can block autoplay until the user
                 * interacts with the page. Humanity survives.
                 */
            });
        }
    }

    updateStudySoundUI();
}


function stopStudySound() {
    if (studyAmbientAudio) {
        studyAmbientAudio.pause();
        studyAmbientAudio.currentTime = 0;
        studyAmbientAudio = null;
    }

    const allAudio = $$(
        "[data-study-sound-audio], audio[data-study-sound]"
    );

    allAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
}


function toggleStudySound(sound) {
    if (currentFocusSound === sound && studyAmbientAudio) {
        stopStudySound();
        currentFocusSound = "none";
        updateStudySoundUI();
        return;
    }

    if (sound === "none") {
        stopStudySound();
        currentFocusSound = "none";
        updateStudySoundUI();
        return;
    }

    playStudySound(sound);
}


/* =========================================================
   STUDY SOUND BUTTON EVENTS
   ========================================================= */

function setupStudySoundEvents() {
    document.addEventListener("click", event => {
        const button = event.target.closest(
            "[data-study-sound], [data-sound]"
        );

        if (!button) return;

        const sound =
            button.dataset.studySound ||
            button.dataset.sound;

        if (!sound) return;

        event.preventDefault();

        toggleStudySound(sound);
    });
}


/* =========================================================
   ENVIRONMENT EVENTS
   ========================================================= */

function setupStudyEnvironmentEvents() {
    document.addEventListener("click", event => {
        const button = event.target.closest(
            "[data-study-environment], [data-environment]"
        );

        if (!button) return;

        const environment =
            button.dataset.studyEnvironment ||
            button.dataset.environment;

        if (!environment) return;

        if (!STUDY_ENVIRONMENTS[environment]) {
            return;
        }

        event.preventDefault();

        setStudyEnvironment(environment);

        applyStudyEnvironment(environment);
        updateStudyCardSelection();
    });
}


/* =========================================================
   KEEP ENVIRONMENT + CARD STATE IN SYNC
   ========================================================= */

function syncStudyVisualState() {
    const environment =
        activeStudyEnvironment ||
        currentFocusBackground ||
        "forest";

    currentFocusBackground = environment;

    applyStudyEnvironment(environment);
    updateEnvironmentButtons(environment);
    updateStudyCardSelection();

    setupStudyCardAnimations();
    setupStudyCards();
    setupStudyPlaylists();
    animatePlaylistCards();
}


/* =========================================================
   STUDY PAGE VISUAL REFRESH
   ========================================================= */

function refreshStudyVisuals() {
    setupStudyAmbience();
    setupStudySoundSystem();
    syncStudyVisualState();
}


/* =========================================================
   STUDY PAGE COMPLETE EVENT SETUP
   ========================================================= */

function setupCompleteStudyPage() {
    setupStudyTimerEvents();
    setupStudyEnvironmentEvents();
    setupStudySoundEvents();

    setupStudyCards();
    setupStudyCardAnimations();
    setupStudyPlaylists();
    animatePlaylistCards();

    setupStudyAmbience();
    setupStudySoundSystem();
}


/* =========================================================
   STUDY PAGE RE-INITIALISATION
   ========================================================= */

function reinitialiseStudyPage() {
    renderStudyPage();

    requestAnimationFrame(() => {
        setupStudyCards();
        setupStudyCardAnimations();
        setupStudyPlaylists();
        animatePlaylistCards();

        setupStudyAmbience();
        updateStudySoundUI();

        syncStudyVisualState();
    });
}


/* =========================================================
   FOCUS MODE VISUAL ENVIRONMENT
   ========================================================= */

function syncFocusModeEnvironment() {
    const focusMode = document.querySelector(".focus-mode");

    if (!focusMode) return;

    const environment =
        currentFocusBackground || "forest";

    Object.values(STUDY_ENVIRONMENTS).forEach(config => {
        focusMode.classList.remove(config.className);
        focusMode.classList.remove(config.backgroundClass);
    });

    const config =
        STUDY_ENVIRONMENTS[environment] ||
        STUDY_ENVIRONMENTS.forest;

    focusMode.classList.add(config.className);
    focusMode.classList.add(config.backgroundClass);

    focusMode.dataset.studyEnvironment = environment;
}


/* =========================================================
   FOCUS MODE SOUND SYNC
   ========================================================= */

function syncFocusModeSound() {
    const focusMode = document.querySelector(".focus-mode");

    if (!focusMode) return;

    focusMode.dataset.studySound =
        currentFocusSound || "none";
}


/* =========================================================
   FOCUS MODE OPEN OVERRIDE SUPPORT
   ========================================================= */

function refreshFocusModeVisuals() {
    syncFocusModeEnvironment();
    syncFocusModeSound();
    updateFocusModeDisplay();
}


/* =========================================================
   STUDY PAGE VISIBILITY
   ========================================================= */

function updateStudyPageVisibility() {
    const studyPage =
        document.querySelector(".study-page");

    if (!studyPage) return;

    const isStudyPage =
        currentPage === "study";

    studyPage.classList.toggle(
        "study-page-active",
        isStudyPage
    );
}


/* =========================================================
   STUDY PAGE ENTER ANIMATION
   ========================================================= */

function animateStudyPageEntrance() {
    const page =
        document.querySelector(".study-page");

    if (!page) return;

    page.classList.remove("study-page-enter");

    requestAnimationFrame(() => {
        page.classList.add("study-page-enter");
    });
}


/* =========================================================
   STUDY PAGE MASTER REFRESH
   ========================================================= */

function refreshAllStudyFeatures() {
    updateStudyPageVisibility();

    requestAnimationFrame(() => {
        setupStudyCardAnimations();
        updateStudyCardSelection();
        setupStudyPlaylists();
        animatePlaylistCards();

        setupStudyAmbience();
        syncStudyVisualState();
        syncFocusModeEnvironment();
        syncFocusModeSound();
    });
}


/* =========================================================
   SAFE STUDY FEATURE INITIALISATION
   ========================================================= */

function initialiseStudyFeatures() {
    /*
     * These checks make the function safe even if a particular
     * Study-page component isn't present in the HTML.
     */
    if (typeof setupStudyTimerEvents === "function") {
        setupStudyTimerEvents();
    }

    setupStudyEnvironmentEvents();
    setupStudySoundEvents();

    setupStudyCards();
    setupStudyCardAnimations();
    setupStudyPlaylists();
    animatePlaylistCards();

    setupStudyAmbience();
    setupStudySoundSystem();

    updateStudyPageVisibility();
}


/* =========================================================
   INITIAL STUDY FEATURE BOOTSTRAP
   ========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        () => {
            initialiseStudyFeatures();
        },
        { once: true }
    );
} else {
    initialiseStudyFeatures();
}


/* =========================================================
   END OF PART 6
   ========================================================= */
/* =========================================================
   PART 7
   PROFILE, SETTINGS, GLOBAL WIRING & FINAL INTEGRATION
   ========================================================= */


/* =========================================================
   PROFILE PAGE
   ========================================================= */

function renderProfile() {
    const user = getCurrentUserFromData();

    if (!user) return;

    const profilePage =
        document.querySelector(".profile-page") ||
        document.querySelector("#profilePage");

    if (!profilePage) return;

    const nameElements = $$(
        "[data-profile-name], .profile-name",
        profilePage
    );

    nameElements.forEach(element => {
        element.textContent = user.name || "Student";
    });

    const emailElements = $$(
        "[data-profile-email], .profile-email",
        profilePage
    );

    emailElements.forEach(element => {
        element.textContent = user.email || "";
    });

    const yearElements = $$(
        "[data-profile-year], .profile-year",
        profilePage
    );

    yearElements.forEach(element => {
        element.textContent =
            user.year ? `Year ${user.year}` : "";
    });

    const classElements = $$(
        "[data-profile-class], .profile-class",
        profilePage
    );

    classElements.forEach(element => {
        element.textContent = user.class || "";
    });

    const pointsElements = $$(
        "[data-profile-points], .profile-points",
        profilePage
    );

    pointsElements.forEach(element => {
        element.textContent =
            Number(user.points || 0).toLocaleString();
    });

    const initialsElements = $$(
        "[data-profile-initials], .profile-initials",
        profilePage
    );

    initialsElements.forEach(element => {
        element.textContent = getInitials(user.name);
    });

    renderProfileStats(user);
    renderProfileProgress(user);
}


/* =========================================================
   PROFILE STATS
   ========================================================= */

function renderProfileStats(user) {
    const sessions =
        Number(user.studySessions || 0);

    const completedAssignments =
        Array.isArray(appData.assignments)
            ? appData.assignments.filter(
                assignment =>
                    assignment.completed === true &&
                    assignment.userId === user.id
            ).length
            : 0;

    const bookings =
        Array.isArray(appData.bookings)
            ? appData.bookings.filter(
                booking => booking.studentId === user.id
            ).length
            : 0;

    const sessionElements = $$(
        "[data-stat-study-sessions]"
    );

    sessionElements.forEach(element => {
        element.textContent = sessions;
    });

    const assignmentElements = $$(
        "[data-stat-assignments]"
    );

    assignmentElements.forEach(element => {
        element.textContent = completedAssignments;
    });

    const bookingElements = $$(
        "[data-stat-bookings]"
    );

    bookingElements.forEach(element => {
        element.textContent = bookings;
    });
}


/* =========================================================
   PROFILE PROGRESS
   ========================================================= */

function renderProfileProgress(user) {
    const progress =
        Array.isArray(user.progress)
            ? user.progress
            : [];

    const progressBars = $$(
        "[data-profile-progress]"
    );

    progressBars.forEach((bar, index) => {
        const value =
            Number(progress[index] || 0);

        const maximum =
            Number(
                bar.dataset.max ||
                Math.max(value, 100)
            );

        const percentage =
            maximum > 0
                ? Math.min((value / maximum) * 100, 100)
                : 0;

        bar.style.setProperty(
            "--profile-progress",
            `${percentage}%`
        );

        bar.setAttribute(
            "aria-valuenow",
            String(value)
        );
    });
}


/* =========================================================
   EDIT PROFILE
   ========================================================= */

function openProfileEditor() {
    const user = getCurrentUserFromData();

    if (!user) return;

    const modal =
        document.querySelector(
            "[data-profile-editor]"
        ) ||
        document.querySelector(
            "#profileEditorModal"
        );

    if (!modal) return;

    const nameInput =
        modal.querySelector(
            "[name='profileName'], #profileName"
        );

    const classInput =
        modal.querySelector(
            "[name='profileClass'], #profileClass"
        );

    if (nameInput) {
        nameInput.value = user.name || "";
    }

    if (classInput) {
        classInput.value = user.class || "";
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
}


function closeProfileEditor() {
    const modal =
        document.querySelector(
            "[data-profile-editor]"
        ) ||
        document.querySelector(
            "#profileEditorModal"
        );

    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
}


function saveProfileChanges(event) {
    if (event) {
        event.preventDefault();
    }

    const modal =
        document.querySelector(
            "[data-profile-editor]"
        ) ||
        document.querySelector(
            "#profileEditorModal"
        );

    if (!modal) return;

    const nameInput =
        modal.querySelector(
            "[name='profileName'], #profileName"
        );

    const classInput =
        modal.querySelector(
            "[name='profileClass'], #profileClass"
        );

    const name =
        nameInput?.value.trim();

    const className =
        classInput?.value.trim();

    if (!name) {
        showToast(
            "Please enter your name.",
            "error"
        );
        return;
    }

    updateCurrentUser({
        name,
        class: className
    });

    saveData();
    saveCurrentUser();

    updateUserInterface();
    renderProfile();

    closeProfileEditor();

    showToast(
        "Profile updated successfully.",
        "success"
    );
}


/* =========================================================
   PROFILE EVENT SETUP
   ========================================================= */

function setupProfileEvents() {
    document.addEventListener("click", event => {
        const editButton =
            event.target.closest(
                "[data-action='edit-profile'], [data-edit-profile]"
            );

        if (editButton) {
            event.preventDefault();
            openProfileEditor();
            return;
        }

        const closeButton =
            event.target.closest(
                "[data-action='close-profile-editor']"
            );

        if (closeButton) {
            event.preventDefault();
            closeProfileEditor();
        }
    });

    document.addEventListener("submit", event => {
        const form =
            event.target.closest(
                "[data-profile-form]"
            );

        if (!form) return;

        saveProfileChanges(event);
    });
}


/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function renderSettings() {
    const settings =
        appData.settings || {};

    const notificationInputs = $$(
        "[data-setting='notifications']"
    );

    notificationInputs.forEach(input => {
        input.checked =
            settings.notifications !== false;
    });

    const reminderInputs = $$(
        "[data-setting='reminders']"
    );

    reminderInputs.forEach(input => {
        input.checked =
            settings.reminders !== false;
    });

    const darkModeInputs = $$(
        "[data-setting='darkMode']"
    );

    darkModeInputs.forEach(input => {
        input.checked =
            settings.darkMode === true;
    });

    applyTheme(
        settings.darkMode === true
    );
}


/* =========================================================
   THEME
   ========================================================= */

function applyTheme(isDark) {
    const root =
        document.documentElement;

    const body =
        document.body;

    root.classList.toggle(
        "dark-mode",
        isDark
    );

    body.classList.toggle(
        "dark-mode",
        isDark
    );

    root.dataset.theme =
        isDark ? "dark" : "light";

    body.dataset.theme =
        isDark ? "dark" : "light";
}


/* =========================================================
   UPDATE SETTING
   ========================================================= */

function updateSetting(name, value) {
    if (!appData.settings) {
        appData.settings = {};
    }

    appData.settings[name] = value;

    saveData();

    if (name === "darkMode") {
        applyTheme(Boolean(value));
    }

    if (name === "notifications") {
        updateNotificationState(Boolean(value));
    }

    if (name === "reminders") {
        updateReminderState(Boolean(value));
    }
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function updateNotificationState(enabled) {
    document.body.dataset.notifications =
        enabled ? "on" : "off";
}


function updateReminderState(enabled) {
    document.body.dataset.reminders =
        enabled ? "on" : "off";
}


/* =========================================================
   SETTINGS EVENT SETUP
   ========================================================= */

function setupSettingsEvents() {
    document.addEventListener("change", event => {
        const input =
            event.target.closest(
                "[data-setting]"
            );

        if (!input) return;

        const setting =
            input.dataset.setting;

        if (!setting) return;

        let value;

        if (
            input.type === "checkbox" ||
            input.type === "radio"
        ) {
            value = input.checked;
        } else {
            value = input.value;
        }

        updateSetting(setting, value);

        showToast(
            "Settings saved.",
            "success"
        );
    });
}


/* =========================================================
   RESET SETTINGS
   ========================================================= */

function resetSettings() {
    appData.settings = {
        notifications: true,
        reminders: true,
        darkMode: false
    };

    saveData();

    renderSettings();

    showToast(
        "Settings restored.",
        "success"
    );
}


/* =========================================================
   CLEAR LOCAL DATA
   ========================================================= */

function clearLocalData() {
    const confirmed =
        window.confirm(
            "This will remove the saved Peer Hub data from this browser. Continue?"
        );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);

    appData =
        structuredClone(DEFAULT_DATA);

    currentUser = null;

    showToast(
        "Local data cleared.",
        "success"
    );

    setTimeout(() => {
        window.location.reload();
    }, 500);
}


/* =========================================================
   SETTINGS BUTTONS
   ========================================================= */

function setupSettingsButtons() {
    document.addEventListener("click", event => {
        const resetButton =
            event.target.closest(
                "[data-action='reset-settings']"
            );

        if (resetButton) {
            event.preventDefault();
            resetSettings();
            return;
        }

        const clearButton =
            event.target.closest(
                "[data-action='clear-data']"
            );

        if (clearButton) {
            event.preventDefault();
            clearLocalData();
        }
    });
}


/* =========================================================
   RENDER PROFILE / SETTINGS WHEN PAGE CHANGES
   ========================================================= */

function renderAccountPageExtras() {
    if (currentPage === "profile") {
        renderProfile();
    }

    if (currentPage === "settings") {
        renderSettings();
    }
}


/* =========================================================
   PAGE-SPECIFIC REFRESH
   ========================================================= */

function refreshPageSpecificFeatures() {
    renderAccountPageExtras();

    if (currentPage === "study") {
        requestAnimationFrame(() => {
            refreshAllStudyFeatures();
            animateStudyPageEntrance();
        });
    }

    if (currentPage === "tutors") {
        if (typeof renderBookings === "function") {
            renderBookings();
        }

        if (typeof renderTutorPageExtras === "function") {
            renderTutorPageExtras();
        }
    }
}


/* =========================================================
   PATCH NAVIGATION REFRESH
   ========================================================= */

function setupPageRefreshWatcher() {
    document.addEventListener(
        "click",
        event => {
            const navButton =
                event.target.closest(
                    "[data-page], [data-nav]"
                );

            if (!navButton) return;

            setTimeout(() => {
                refreshPageSpecificFeatures();
            }, 0);
        }
    );
}


/* =========================================================
   GLOBAL ESCAPE KEY
   ========================================================= */

function setupEscapeKey() {
    document.addEventListener(
        "keydown",
        event => {
            if (event.key !== "Escape") {
                return;
            }

            closeTutorModal();
            closeBookingModal();
            closeProfileEditor();
            closeFocusMode();
        }
    );
}


/* =========================================================
   GLOBAL BACKDROP CLICK
   ========================================================= */

function setupModalBackdropClicks() {
    document.addEventListener(
        "click",
        event => {
            const modal =
                event.target.closest(
                    ".modal, .dialog, [role='dialog']"
                );

            if (!modal) return;

            if (event.target !== modal) {
                return;
            }

            if (
                modal.matches(
                    "[data-profile-editor], #profileEditorModal"
                )
            ) {
                closeProfileEditor();
            }

            if (
                modal.matches(
                    "[data-focus-mode], .focus-mode"
                )
            ) {
                closeFocusMode();
            }
        }
    );
}


/* =========================================================
   STUDY TIMER PERSISTENCE
   ========================================================= */

function saveStudyTimerState() {
    const timerState = {
        timerSeconds,
        timerRunning,
        timerMode,
        customFocusMinutes,
        currentFocusBackground,
        currentFocusSound
    };

    try {
        sessionStorage.setItem(
            "stOransStudyTimerState",
            JSON.stringify(timerState)
        );
    } catch (error) {
        console.warn(
            "Study timer state could not be saved.",
            error
        );
    }
}


function loadStudyTimerState() {
    try {
        const stored =
            sessionStorage.getItem(
                "stOransStudyTimerState"
            );

        if (!stored) return;

        const state =
            JSON.parse(stored);

        if (
            Number.isFinite(
                Number(state.timerSeconds)
            )
        ) {
            timerSeconds =
                Number(state.timerSeconds);
        }

        if (
            state.timerMode === "focus" ||
            state.timerMode === "break"
        ) {
            timerMode =
                state.timerMode;
        }

        if (
            Number.isFinite(
                Number(state.customFocusMinutes)
            )
        ) {
            customFocusMinutes =
                Number(state.customFocusMinutes);
        }

        if (
            STUDY_ENVIRONMENTS[
                state.currentFocusBackground
            ]
        ) {
            currentFocusBackground =
                state.currentFocusBackground;
        }

        if (
            typeof state.currentFocusSound === "string"
        ) {
            currentFocusSound =
                state.currentFocusSound;
        }

        /*
         * Never automatically restart a timer after a
         * page refresh. The browser does not need another
         * reason to surprise people.
         */
        timerRunning = false;

    } catch (error) {
        console.warn(
            "Study timer state could not be restored.",
            error
        );
    }
}


/* =========================================================
   TIMER STATE SAVE HOOK
   ========================================================= */

function setupTimerPersistence() {
    setInterval(() => {
        if (
            currentPage === "study" ||
            timerRunning
        ) {
            saveStudyTimerState();
        }
    }, 5000);
}


/* =========================================================
   STUDY SESSION SAFETY
   ========================================================= */

function ensureStudySessionData() {
    const user =
        getCurrentUserFromData();

    if (!user) return;

    if (
        !Number.isFinite(
            Number(user.studySessions)
        )
    ) {
        user.studySessions = 0;
    }

    if (
        !Array.isArray(user.progress)
    ) {
        user.progress = [];
    }

    saveData();
}


/* =========================================================
   STUDY SESSION EVENT
   ========================================================= */

function setupStudySessionHooks() {
    document.addEventListener(
        "studySessionCompleted",
        () => {
            ensureStudySessionData();

            const user =
                getCurrentUserFromData();

            if (!user) return;

            user.studySessions =
                Number(user.studySessions || 0) + 1;

            /*
             * Small Peer Point reward for actually
             * studying. Revolutionary concept.
             */
            user.points =
                Number(user.points || 0) + 5;

            saveData();

            updateUserInterface();

            if (currentPage === "profile") {
                renderProfile();
            }

            showToast(
                "+5 Peer Points • Study session complete!",
                "success"
            );
        }
    );
}


/* =========================================================
   SAFE STUDY SESSION COMPLETION WRAPPER
   ========================================================= */

function triggerStudySessionCompleted() {
    document.dispatchEvent(
        new CustomEvent(
            "studySessionCompleted"
        )
    );
}


/* =========================================================
   STUDY TIMER DISPLAY SAFETY
   ========================================================= */

function refreshTimerUI() {
    if (
        typeof updateTimerDisplay === "function"
    ) {
        updateTimerDisplay();
    }

    if (
        typeof updateTimerButtons === "function"
    ) {
        updateTimerButtons();
    }

    if (
        typeof updateFocusModeDisplay === "function"
    ) {
        updateFocusModeDisplay();
    }
}


/* =========================================================
   STUDY ENVIRONMENT PERSISTENCE
   ========================================================= */

function persistStudyEnvironment() {
    try {
        localStorage.setItem(
            "stOransStudyEnvironment",
            currentFocusBackground
        );
    } catch (error) {
        console.warn(
            "Study environment could not be saved.",
            error
        );
    }
}


function restoreStudyEnvironment() {
    try {
        const stored =
            localStorage.getItem(
                "stOransStudyEnvironment"
            );

        if (
            stored &&
            STUDY_ENVIRONMENTS[stored]
        ) {
            currentFocusBackground =
                stored;
        }
    } catch (error) {
        console.warn(
            "Study environment could not be restored.",
            error
        );
    }
}


/* =========================================================
   STUDY SOUND PERSISTENCE
   ========================================================= */

function persistStudySound() {
    try {
        localStorage.setItem(
            "stOransStudySound",
            currentFocusSound
        );
    } catch (error) {
        console.warn(
            "Study sound could not be saved.",
            error
        );
    }
}


function restoreStudySound() {
    try {
        const stored =
            localStorage.getItem(
                "stOransStudySound"
            );

        if (
            typeof stored === "string"
        ) {
            currentFocusSound =
                stored;
        }
    } catch (error) {
        console.warn(
            "Study sound could not be restored.",
            error
        );
    }
}


/* =========================================================
   PATCH ENVIRONMENT FUNCTIONS
   ========================================================= */

function persistCurrentStudyEnvironment() {
    persistStudyEnvironment();

    updateEnvironmentButtons(
        currentFocusBackground
    );

    syncFocusModeEnvironment();
}


/* =========================================================
   MASTER FEATURE SETUP
   ========================================================= */

function setupAllFeatureEvents() {
    /*
     * Academic features
     */
    if (
        typeof setupAcademicFeatures === "function"
    ) {
        setupAcademicFeatures();
    }

    /*
     * Tutor features
     */
    if (
        typeof setupTutorEvents === "function"
    ) {
        setupTutorEvents();
    }

    /*
     * Study features
     */
    initialiseStudyFeatures();

    /*
     * Account features
     */
    setupProfileEvents();
    setupSettingsEvents();
    setupSettingsButtons();

    /*
     * Global behaviour
     */
    setupPageRefreshWatcher();
    setupEscapeKey();
    setupModalBackdropClicks();
    setupStudySessionHooks();
    setupTimerPersistence();
}


/* =========================================================
   FINAL APPLICATION REFRESH
   ========================================================= */

function finalApplicationRefresh() {
    updateUserInterface();

    renderCurrentPage();

    renderAccountPageExtras();

    if (
        currentPage === "study"
    ) {
        refreshAllStudyFeatures();
    }

    if (
        typeof refreshTimerUI === "function"
    ) {
        refreshTimerUI();
    }
}


/* =========================================================
   APPLICATION STARTUP
   ========================================================= */

function bootPeerHub() {
    loadStudyTimerState();
    restoreStudyEnvironment();
    restoreStudySound();

    setupAllFeatureEvents();

    if (currentUser) {
        ensureStudySessionData();
        finalApplicationRefresh();
    } else {
        showAuth();
    }
}


/* =========================================================
   SAFE SINGLE STARTUP
   ========================================================= */

let peerHubBooted = false;

function safeBootPeerHub() {
    if (peerHubBooted) return;

    peerHubBooted = true;

    bootPeerHub();
}


/* =========================================================
   STARTUP
   ========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        safeBootPeerHub,
        { once: true }
    );
} else {
    safeBootPeerHub();
}


/* =========================================================
   GLOBAL ERROR PROTECTION
   ========================================================= */

window.addEventListener(
    "error",
    event => {
        console.error(
            "St Oran's Peer Hub error:",
            event.error || event.message
        );
    }
);


/* =========================================================
   SAVE BEFORE PAGE CLOSE
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {
        saveData();
        saveCurrentUser();
        saveStudyTimerState();
        persistStudyEnvironment();
        persistStudySound();
    }
);


/* =========================================================
   END OF PART 7
   ========================================================= */
/* =========================================================
   PART 8
   FINAL SUPPORT, ACCESSIBILITY & COMPATIBILITY LAYER
   ========================================================= */


/* =========================================================
   ACCESSIBILITY HELPERS
   ========================================================= */

function makeInteractiveElementsAccessible() {
    const clickableCards = $$(
        "[data-study-card], .study-card, .environment-card"
    );

    clickableCards.forEach(card => {
        const alreadyInteractive =
            card.matches(
                "button, a, input, select, textarea"
            );

        if (alreadyInteractive) return;

        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");

        card.addEventListener("keydown", event => {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                card.click();
            }
        });
    });
}


/* =========================================================
   FOCUS MANAGEMENT
   ========================================================= */

let lastFocusedElement = null;

function rememberFocus() {
    lastFocusedElement =
        document.activeElement;
}


function restoreFocus() {
    if (
        lastFocusedElement &&
        typeof lastFocusedElement.focus === "function"
    ) {
        try {
            lastFocusedElement.focus();
        } catch (error) {
            console.warn(
                "Focus could not be restored.",
                error
            );
        }
    }

    lastFocusedElement = null;
}


/* =========================================================
   MODAL FOCUS
   ========================================================= */

function focusFirstModalElement(modal) {
    if (!modal) return;

    const focusable = modal.querySelector(
        "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );

    if (focusable) {
        setTimeout(() => {
            focusable.focus();
        }, 50);
    }
}


/* =========================================================
   STUDY PAGE KEYBOARD SHORTCUTS
   ========================================================= */

function setupStudyKeyboardShortcuts() {
    document.addEventListener(
        "keydown",
        event => {
            /*
             * Don't hijack shortcuts while typing.
             */
            const tag =
                event.target?.tagName?.toLowerCase();

            if (
                tag === "input" ||
                tag === "textarea" ||
                tag === "select"
            ) {
                return;
            }

            /*
             * Space = start / pause timer
             */
            if (
                event.code === "Space" &&
                currentPage === "study"
            ) {
                event.preventDefault();

                if (timerRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }

                refreshTimerUI();
            }

            /*
             * R = reset timer
             */
            if (
                event.key.toLowerCase() === "r" &&
                currentPage === "study"
            ) {
                resetTimer();
                refreshTimerUI();
            }

            /*
             * F = Focus Mode
             */
            if (
                event.key.toLowerCase() === "f" &&
                currentPage === "study"
            ) {
                openFocusMode();
            }

            /*
             * Escape = close Focus Mode
             */
            if (
                event.key === "Escape" &&
                document.body.classList.contains(
                    "focus-mode-open"
                )
            ) {
                closeFocusMode();
            }
        }
    );
}


/* =========================================================
   STUDY TIMER BUTTON ACCESSIBILITY
   ========================================================= */

function updateTimerAccessibility() {
    const buttons = $$(
        "[data-action='start-timer'], [data-action='pause-timer'], [data-action='reset-timer']"
    );

    buttons.forEach(button => {
        button.setAttribute(
            "aria-live",
            "polite"
        );
    });

    const displays = $$(
        "[data-timer-display], .timer-display"
    );

    displays.forEach(display => {
        display.setAttribute(
            "aria-live",
            "polite"
        );

        display.setAttribute(
            "role",
            "timer"
        );
    });
}


/* =========================================================
   REDUCED MOTION SUPPORT
   ========================================================= */

function handleReducedMotionPreference() {
    const mediaQuery =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

    document.documentElement.classList.toggle(
        "reduced-motion",
        mediaQuery.matches
    );

    if (
        typeof mediaQuery.addEventListener ===
        "function"
    ) {
        mediaQuery.addEventListener(
            "change",
            event => {
                document.documentElement.classList.toggle(
                    "reduced-motion",
                    event.matches
                );
            }
        );
    }
}


/* =========================================================
   MOBILE STUDY PAGE
   ========================================================= */

function updateResponsiveStudyState() {
    const isMobile =
        window.innerWidth <= 768;

    document.body.classList.toggle(
        "study-mobile",
        isMobile
    );

    const studyPage =
        document.querySelector(".study-page");

    if (studyPage) {
        studyPage.classList.toggle(
            "study-mobile",
            isMobile
        );
    }
}


function setupResponsiveStudyState() {
    updateResponsiveStudyState();

    let resizeTimeout = null;

    window.addEventListener(
        "resize",
        () => {
            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                updateResponsiveStudyState();
            }, 120);
        }
    );
}


/* =========================================================
   TOAST CONTAINER
   ========================================================= */

function ensureToastContainer() {
    let container =
        document.querySelector(
            ".toast-container"
        );

    if (container) {
        return container;
    }

    container =
        document.createElement("div");

    container.className =
        "toast-container";

    container.setAttribute(
        "aria-live",
        "polite"
    );

    container.setAttribute(
        "aria-atomic",
        "true"
    );

    document.body.appendChild(container);

    return container;
}


/* =========================================================
   ENHANCED TOAST
   ========================================================= */

function showEnhancedToast(
    message,
    type = "info",
    duration = 3200
) {
    const container =
        ensureToastContainer();

    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${type}`;

    toast.setAttribute(
        "role",
        type === "error"
            ? "alert"
            : "status"
    );

    const messageElement =
        document.createElement("span");

    messageElement.className =
        "toast-message";

    messageElement.textContent =
        message;

    toast.appendChild(
        messageElement
    );

    const closeButton =
        document.createElement("button");

    closeButton.type = "button";
    closeButton.className =
        "toast-close";

    closeButton.setAttribute(
        "aria-label",
        "Dismiss notification"
    );

    closeButton.innerHTML = "&times;";

    closeButton.addEventListener(
        "click",
        () => {
            removeToast(toast);
        }
    );

    toast.appendChild(
        closeButton
    );

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        removeToast(toast);
    }, duration);
}


function removeToast(toast) {
    if (!toast) return;

    toast.classList.remove("show");

    setTimeout(() => {
        toast.remove();
    }, 250);
}


/* =========================================================
   AUTHENTICATION STATE CHECK
   ========================================================= */

function validateCurrentSession() {
    if (!currentUser) {
        return false;
    }

    const user =
        getUserById(currentUser);

    if (!user) {
        currentUser = null;
        saveCurrentUser();
        return false;
    }

    return true;
}


/* =========================================================
   SESSION RECOVERY
   ========================================================= */

function recoverSession() {
    if (
        validateCurrentSession()
    ) {
        return true;
    }

    currentUser = null;

    try {
        localStorage.removeItem(
            CURRENT_USER_KEY
        );
    } catch (error) {
        console.warn(
            "Session could not be cleared.",
            error
        );
    }

    return false;
}


/* =========================================================
   SAFE DATA VALIDATION
   ========================================================= */

function validateAppData() {
    if (!appData) {
        appData =
            structuredClone(DEFAULT_DATA);
    }

    if (!Array.isArray(appData.users)) {
        appData.users = [];
    }

    if (
        !Array.isArray(
            appData.assignments
        )
    ) {
        appData.assignments = [];
    }

    if (!Array.isArray(appData.tutors)) {
        appData.tutors = [];
    }

    if (
        !Array.isArray(
            appData.calendarEvents
        )
    ) {
        appData.calendarEvents = [];
    }

    if (
        !Array.isArray(
            appData.bookings
        )
    ) {
        appData.bookings = [];
    }

    if (!appData.settings) {
        appData.settings = {
            notifications: true,
            reminders: true,
            darkMode: false
        };
    }

    return appData;
}


/* =========================================================
   CURRENT USER VALIDATION
   ========================================================= */

function validateUserData() {
    const user =
        getCurrentUserFromData();

    if (!user) return null;

    if (
        typeof user.name !== "string"
    ) {
        user.name = "Student";
    }

    if (
        typeof user.email !== "string"
    ) {
        user.email = "";
    }

    if (
        !Number.isFinite(
            Number(user.points)
        )
    ) {
        user.points = 0;
    }

    if (
        !Number.isFinite(
            Number(user.studySessions)
        )
    ) {
        user.studySessions = 0;
    }

    if (!Array.isArray(user.progress)) {
        user.progress = [];
    }

    return user;
}


/* =========================================================
   DATA CLEANUP
   ========================================================= */

function runDataCleanup() {
    validateAppData();
    validateUserData();

    saveData();
}


/* =========================================================
   STUDY PAGE DOM CHECK
   ========================================================= */

function studyPageExists() {
    return Boolean(
        document.querySelector(
            ".study-page"
        ) ||
        document.querySelector(
            "#studyPage"
        ) ||
        document.querySelector(
            "[data-page='study']"
        )
    );
}


/* =========================================================
   STUDY PAGE RE-ENTRY
   ========================================================= */

function handleStudyPageEntry() {
    if (
        currentPage !== "study"
    ) {
        return;
    }

    if (!studyPageExists()) {
        return;
    }

    requestAnimationFrame(() => {
        refreshAllStudyFeatures();
        updateTimerAccessibility();
        makeInteractiveElementsAccessible();
    });
}


/* =========================================================
   NAVIGATION OBSERVER
   ========================================================= */

function setupStudyNavigationObserver() {
    document.addEventListener(
        "click",
        event => {
            const target =
                event.target.closest(
                    "[data-page], [data-nav], .nav-link"
                );

            if (!target) return;

            const page =
                target.dataset.page ||
                target.dataset.nav;

            if (page === "study") {
                setTimeout(() => {
                    handleStudyPageEntry();
                }, 50);
            }
        }
    );
}


/* =========================================================
   ENVIRONMENT CHANGE OBSERVER
   ========================================================= */

function setupEnvironmentPersistence() {
    document.addEventListener(
        "click",
        event => {
            const button =
                event.target.closest(
                    "[data-study-environment], [data-environment]"
                );

            if (!button) return;

            const environment =
                button.dataset.studyEnvironment ||
                button.dataset.environment;

            if (
                !environment ||
                !STUDY_ENVIRONMENTS[environment]
            ) {
                return;
            }

            currentFocusBackground =
                environment;

            persistStudyEnvironment();
            syncFocusModeEnvironment();
        }
    );
}


/* =========================================================
   SOUND CHANGE OBSERVER
   ========================================================= */

function setupSoundPersistence() {
    document.addEventListener(
        "click",
        event => {
            const button =
                event.target.closest(
                    "[data-study-sound], [data-sound]"
                );

            if (!button) return;

            const sound =
                button.dataset.studySound ||
                button.dataset.sound;

            if (!sound) return;

            setTimeout(() => {
                persistStudySound();
                syncFocusModeSound();
            }, 0);
        }
    );
}


/* =========================================================
   STUDY CARD VISUAL OBSERVER
   ========================================================= */

function setupStudyCardObserver() {
    const observer =
        new MutationObserver(
            mutations => {
                let shouldRefresh = false;

                mutations.forEach(
                    mutation => {
                        if (
                            mutation.type ===
                            "childList"
                        ) {
                            shouldRefresh = true;
                        }
                    }
                );

                if (
                    shouldRefresh &&
                    currentPage === "study"
                ) {
                    requestAnimationFrame(() => {
                        setupStudyCardAnimations();
                        setupStudyPlaylists();
                        animatePlaylistCards();
                    });
                }
            }
        );

    const studyPage =
        document.querySelector(
            ".study-page"
        );

    if (studyPage) {
        observer.observe(
            studyPage,
            {
                childList: true,
                subtree: true
            }
        );
    }
}


/* =========================================================
   FINAL ACCESSIBILITY SETUP
   ========================================================= */

function setupAccessibilityFeatures() {
    makeInteractiveElementsAccessible();
    updateTimerAccessibility();
    handleReducedMotionPreference();
}


/* =========================================================
   FINAL RESPONSIVE SETUP
   ========================================================= */

function setupResponsiveFeatures() {
    setupResponsiveStudyState();
}


/* =========================================================
   FINAL SUPPORT SETUP
   ========================================================= */

function setupFinalSupportFeatures() {
    validateAppData();
    recoverSession();
    runDataCleanup();

    setupStudyKeyboardShortcuts();
    setupAccessibilityFeatures();
    setupResponsiveFeatures();

    setupStudyNavigationObserver();
    setupEnvironmentPersistence();
    setupSoundPersistence();
    setupStudyCardObserver();
}


/* =========================================================
   FINAL BOOT PATCH
   ========================================================= */

function completePeerHubStartup() {
    setupFinalSupportFeatures();

    if (
        typeof renderCurrentPage ===
        "function"
    ) {
        renderCurrentPage();
    }

    updateUserInterface();

    if (
        currentPage === "study"
    ) {
        handleStudyPageEntry();
    }

    if (
        currentPage === "profile"
    ) {
        renderProfile();
    }

    if (
        currentPage === "settings"
    ) {
        renderSettings();
    }
}


/* =========================================================
   RUN FINAL SUPPORT LAYER
   ========================================================= */

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        completePeerHubStartup,
        { once: true }
    );
} else {
    completePeerHubStartup();
}


/* =========================================================
   END OF PART 8
   ========================================================= */
/* =========================================================
   PART 9
   FINAL PAGE INTEGRATION & STUDY PAGE REFRESH
   ========================================================= */


/* =========================================================
   PAGE REFRESH AFTER NAVIGATION
   ========================================================= */

function refreshAfterNavigation() {
    /*
     * Give the browser one frame to finish changing the
     * visible page before we initialise page-specific UI.
     */
    requestAnimationFrame(() => {
        updateUserInterface();

        if (currentPage === "home") {
            renderHome();
        }

        if (currentPage === "assignments") {
            renderAssignments();

            if (
                typeof setupAssignmentEvents === "function"
            ) {
                setupAssignmentEvents();
            }
        }

        if (currentPage === "calendar") {
            renderCalendar();

            if (
                typeof setupCalendarEvents === "function"
            ) {
                setupCalendarEvents();
            }
        }

        if (currentPage === "tutors") {
            renderTutors();

            if (
                typeof renderBookings === "function"
            ) {
                renderBookings();
            }
        }

        if (currentPage === "study") {
            renderStudyPage();

            requestAnimationFrame(() => {
                refreshAllStudyFeatures();
                updateTimerAccessibility();
                animateStudyPageEntrance();
            });
        }

        if (currentPage === "profile") {
            renderProfile();
        }

        if (currentPage === "settings") {
            renderSettings();
        }
    });
}


/* =========================================================
   STUDY PAGE TIMER SAFETY
   ========================================================= */

function ensureTimerIsValid() {
    if (!Number.isFinite(timerSeconds)) {
        timerSeconds =
            timerMode === "break"
                ? 5 * 60
                : customFocusMinutes * 60;
    }

    if (timerSeconds < 0) {
        timerSeconds = 0;
    }

    if (
        !Number.isFinite(customFocusMinutes) ||
        customFocusMinutes <= 0
    ) {
        customFocusMinutes = 25;
    }

    if (
        timerMode !== "focus" &&
        timerMode !== "break"
    ) {
        timerMode = "focus";
    }
}


/* =========================================================
   TIMER STATE DISPLAY
   ========================================================= */

function syncTimerState() {
    ensureTimerIsValid();

    updateTimerDisplay();
    updateTimerButtons();

    if (
        typeof updateFocusModeDisplay ===
        "function"
    ) {
        updateFocusModeDisplay();
    }

    saveStudyTimerState();
}


/* =========================================================
   STUDY ENVIRONMENT STATE
   ========================================================= */

function syncEnvironmentState() {
    if (
        !STUDY_ENVIRONMENTS[
            currentFocusBackground
        ]
    ) {
        currentFocusBackground =
            "forest";
    }

    applyStudyEnvironment(
        currentFocusBackground
    );

    updateEnvironmentButtons(
        currentFocusBackground
    );

    updateStudyCardSelection();

    syncFocusModeEnvironment();
}


/* =========================================================
   STUDY SOUND STATE
   ========================================================= */

function syncSoundState() {
    if (
        typeof currentFocusSound !==
        "string"
    ) {
        currentFocusSound = "none";
    }

    updateStudySoundUI();
    syncFocusModeSound();
}


/* =========================================================
   STUDY PAGE FINAL SYNC
   ========================================================= */

function finalStudyPageSync() {
    if (
        currentPage !== "study"
    ) {
        return;
    }

    ensureTimerIsValid();
    syncTimerState();
    syncEnvironmentState();
    syncSoundState();

    setupStudyCardAnimations();
    setupStudyPlaylists();
    animatePlaylistCards();

    updateStudyPageVisibility();
}


/* =========================================================
   PAGE CHANGE HOOK
   ========================================================= */

function setupFinalNavigationHook() {
    document.addEventListener(
        "click",
        event => {
            const navigation =
                event.target.closest(
                    "[data-page], [data-nav]"
                );

            if (!navigation) {
                return;
            }

            setTimeout(() => {
                refreshAfterNavigation();

                if (
                    currentPage === "study"
                ) {
                    finalStudyPageSync();
                }
            }, 20);
        }
    );
}


/* =========================================================
   STUDY PAGE VISIBILITY OBSERVER
   ========================================================= */

function observeStudyPageVisibility() {
    const studyPage =
        document.querySelector(
            ".study-page"
        );

    if (!studyPage) {
        return;
    }

    const observer =
        new MutationObserver(() => {
            if (
                currentPage === "study"
            ) {
                requestAnimationFrame(() => {
                    updateStudyPageVisibility();
                });
            }
        });

    observer.observe(
        studyPage,
        {
            attributes: true,
            attributeFilter: [
                "class",
                "style",
                "hidden"
            ]
        }
    );
}


/* =========================================================
   FINAL STUDY INITIALISATION
   ========================================================= */

function initialiseFinalStudyLayer() {
    ensureTimerIsValid();

    if (
        typeof restoreStudyEnvironment ===
        "function"
    ) {
        restoreStudyEnvironment();
    }

    if (
        typeof restoreStudySound ===
        "function"
    ) {
        restoreStudySound();
    }

    if (
        currentPage === "study"
    ) {
        finalStudyPageSync();
    }
}


/* =========================================================
   FINAL GLOBAL INITIALISATION
   ========================================================= */

function initialiseFinalIntegration() {
    setupFinalNavigationHook();
    observeStudyPageVisibility();

    initialiseFinalStudyLayer();

    /*
     * Make sure the saved theme is applied even when the
     * Settings page hasn't been opened yet.
     */
    if (
        appData &&
        appData.settings
    ) {
        applyTheme(
            appData.settings.darkMode === true
        );
    }

    updateUserInterface();
}


/* =========================================================
   START FINAL INTEGRATION
   ========================================================= */

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initialiseFinalIntegration,
        { once: true }
    );
} else {
    initialiseFinalIntegration();
}


/* =========================================================
   END OF PART 9
   ========================================================= */
