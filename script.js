```javascript
/* =========================================================
   ST ORAN'S PEER HUB
   MAIN JAVASCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE + APP STATE
   ========================================================= */

const STORAGE_KEY = "stOransPeerHubPrototype";
const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";

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
            studySessions: 0
        }
    ],

    tutors: [
        {
            id: "lucy",
            name: "Lucy Worthington",
            year: "Year 13",
            subjects: ["English", "Essay Writing", "Literacy"],
            availability: "Mon–Thu after 3:30pm",
            bio: "Great for essays, writing structure and study skills.",
            points: 520
        },
        {
            id: "aisha",
            name: "Aisha Patel",
            year: "Year 12",
            subjects: ["Maths", "Algebra", "Statistics"],
            availability: "Tue & Fri lunchtimes",
            bio: "Patient maths tutor who loves explaining tricky concepts.",
            points: 430
        },
        {
            id: "sophie",
            name: "Sophie Chen",
            year: "Year 11",
            subjects: ["Science", "Biology", "Chemistry"],
            availability: "Mon & Wed after school",
            bio: "Can help with science revision and understanding concepts.",
            points: 390
        },
        {
            id: "mia",
            name: "Mia Thompson",
            year: "Year 10",
            subjects: ["French", "Te Reo Māori"],
            availability: "Most lunchtimes",
            bio: "Happy to practise languages and help with vocabulary.",
            points: 315
        },
        {
            id: "noah",
            name: "Noah Wilson",
            year: "Year 13",
            subjects: ["Physics", "Maths", "Graphs"],
            availability: "Evenings & weekends",
            bio: "Physics and maths help, especially graphs and problem solving.",
            points: 610
        },
        {
            id: "ella",
            name: "Ella Brown",
            year: "Year 12",
            subjects: ["History", "Social Studies"],
            availability: "Thu after 4pm",
            bio: "Can help with research, source analysis and essays.",
            points: 355
        }
    ]
};

let appData;
let currentUser = null;
let currentPage = "home";
let currentCalendarDate = new Date();

let timer = {
    mode: "Focus",
    seconds: 25 * 60,
    running: false,
    interval: null,
    focusMinutes: 25,
    breakMinutes: 5
};

/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getInitials(name) {
    return String(name || "U")
        .split(" ")
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function todayISO() {
    const date = new Date();
    return formatISODate(date);
}

function formatISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatPrettyDate(dateString) {
    if (!dateString) return "";

    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-NZ", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));

    if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, currentUser.id);
    }
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        appData = structuredClone(defaultData);
        return;
    }

    try {
        appData = JSON.parse(saved);

        if (!appData.users) appData.users = [];
        if (!appData.tutors) appData.tutors = defaultData.tutors;
    } catch (error) {
        console.error("Could not load saved data:", error);
        appData = structuredClone(defaultData);
    }
}

function findUserById(id) {
    return appData.users.find(user => user.id === id);
}

function refreshCurrentUser() {
    if (!currentUser) return;

    const updated = findUserById(currentUser.id);

    if (updated) {
        currentUser = updated;
    }
}

function updateCurrentUser(updates) {
    if (!currentUser) return;

    const index = appData.users.findIndex(user => user.id === currentUser.id);

    if (index === -1) return;

    appData.users[index] = {
        ...appData.users[index],
        ...updates
    };

    currentUser = appData.users[index];

    saveData();
}

/* =========================================================
   AUTHENTICATION
   ========================================================= */

function setupAuth() {
    const tabs = $$(".auth-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const mode = tab.dataset.auth;

            tabs.forEach(item => item.classList.remove("active"));
            tab.classList.add("active");

            $("#signinForm").classList.toggle("hidden", mode !== "signin");
            $("#signupForm").classList.toggle("hidden", mode !== "signup");
        });
    });

    $("#signinForm").addEventListener("submit", handleSignIn);
    $("#signupForm").addEventListener("submit", handleSignUp);

    $("#googleDemo").addEventListener("click", () => {
        let demoUser = findUserById("demo-maya");

        if (!demoUser) {
            demoUser = {
                ...structuredClone(defaultData.users[0])
            };

            appData.users.push(demoUser);
        }

        loginUser(demoUser);
        showToast("Signed in with the demo Google account.");
    });
}

function isValidSchoolEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@storans\.school\.nz$/i.test(email);
}

function handleSignIn(event) {
    event.preventDefault();

    const email = $("#loginEmail").value.trim().toLowerCase();
    const password = $("#loginPassword").value;

    const user = appData.users.find(
        account =>
            account.email.toLowerCase() === email &&
            account.password === password
    );

    if (!user) {
        showToast("Incorrect email or password.");
        return;
    }

    loginUser(user);
    event.target.reset();
}

function handleSignUp(event) {
    event.preventDefault();

    const name = $("#signupName").value.trim();
    const email = $("#signupEmail").value.trim().toLowerCase();
    const year = $("#signupYear").value;
    const password = $("#signupPassword").value;

    if (!isValidSchoolEmail(email)) {
        showToast("Please use a St Oran's school email.");
        return;
    }

    if (password.length < 6) {
        showToast("Your password needs at least 6 characters.");
        return;
    }

    const existingUser = appData.users.find(
        user => user.email.toLowerCase() === email
    );

    if (existingUser) {
        showToast("An account with that email already exists.");
        return;
    }

    const newUser = {
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
        studySessions: 0
    };

    appData.users.push(newUser);
    saveData();

    loginUser(newUser);
    event.target.reset();

    showToast("Account created. Welcome to Peer Hub!");
}

function loginUser(user) {
    currentUser = user;

    localStorage.setItem(CURRENT_USER_KEY, user.id);

    $("#authScreen").classList.add("hidden");
    $("#app").classList.remove("hidden");

    currentPage = "home";

    updateTopBar();
    renderPage();
}

function logout() {
    stopTimer();

    currentUser = null;
    localStorage.removeItem(CURRENT_USER_KEY);

    $("#app").classList.add("hidden");
    $("#authScreen").classList.remove("hidden");

    showToast("You have been signed out.");
}

function restoreSession() {
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY);

    if (!savedUserId) return;

    const savedUser = findUserById(savedUserId);

    if (savedUser) {
        currentUser = savedUser;

        $("#authScreen").classList.add("hidden");
        $("#app").classList.remove("hidden");

        updateTopBar();
        renderPage();
    }
}

/* =========================================================
   TOP BAR
   ========================================================= */

function updateTopBar() {
    if (!currentUser) return;

    $("#avatar").textContent = getInitials(currentUser.name);
    $("#topName").textContent = currentUser.name.split(" ")[0];

    const unread = currentUser.notifications?.some(
        notification => !notification.read
    );

    $("#notifDot").style.display = unread ? "block" : "none";
}

function setupTopBar() {
    $("#profileTop").addEventListener("click", () => {
        navigate("profile");
    });

    $("#notificationBtn").addEventListener("click", showNotifications);
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
    $$(".nav-item").forEach(button => {
        button.addEventListener("click", () => {
            navigate(button.dataset.page);
        });
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
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPage() {
    if (!currentUser) return;

    refreshCurrentUser();
    updateTopBar();

    const content = $("#pageContent");

    switch (currentPage) {
        case "home":
            content.innerHTML = renderHome();
            bindHomeEvents();
            break;

        case "calendar":
            content.innerHTML = renderCalendarPage();
            bindCalendarEvents();
            break;

        case "assignments":
            content.innerHTML = renderAssignmentsPage();
            bindAssignmentEvents();
            break;

        case "tutors":
            content.innerHTML = renderTutorsPage();
            bindTutorEvents();
            break;

        case "study":
            content.innerHTML = renderStudyPage();
            bindStudyEvents();
            break;

        case "profile":
            content.innerHTML = renderProfilePage();
            bindProfileEvents();
            break;

        case "settings":
            content.innerHTML = renderSettingsPage();
            bindSettingsEvents();
            break;

        default:
            currentPage = "home";
            content.innerHTML = renderHome();
            bindHomeEvents();
    }
}

/* =========================================================
   HOME
   ========================================================= */

const quotes = [
    "Small progress is still progress.",
    "Your future self is quietly rooting for you.",
    "You do not need to finish everything today.",
    "A little effort now saves future-you a headache.",
    "Keep going. Even Roro believes in you.",
    "Progress beats perfection.",
    "One task. Then the next.",
    "You are capable of more than your procrastination suggests."
];

function getDailyQuote() {
    const date = new Date();
    const dayNumber = Math.floor(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
        86400000
    );

    return quotes[Math.abs(dayNumber) % quotes.length];
}

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function renderHome() {
    const upcomingAssignments = [...(currentUser.assignments || [])]
        .filter(assignment => !assignment.completed)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 4);

    const recommendedTutors = appData.tutors.slice(0, 3);

    return `
        <section class="welcome-banner">
            <p class="eyebrow">${getGreeting()}</p>
            <h2>${escapeHTML(currentUser.name.split(" ")[0])}.</h2>
            <p>
                Welcome back to your little corner of St Oran's.
                Time to make future-you slightly less stressed.
            </p>
            <div class="quote-card">
                “${escapeHTML(getDailyQuote())}”
            </div>
        </section>

        <div class="dashboard-grid">

            <section class="card dashboard-calendar">
                <div class="card-header">
                    <h3>This fortnight</h3>
                    <button class="small-btn" id="homeAddEvent">
                        + Add event
                    </button>
                </div>

                ${renderMiniCalendar()}
            </section>

            <section class="card">
                <div class="card-header">
                    <h3>Assignments due</h3>
                    <button class="small-btn" id="homeAddAssignment">
                        + Add
                    </button>
                </div>

                <div class="assignment-list">
                    ${
                        upcomingAssignments.length
                            ? upcomingAssignments.map(renderAssignmentItem).join("")
                            : `
                                <div class="empty-state">
                                    <div class="empty-icon">✓</div>
                                    <strong>Nothing due yet</strong>
                                    <p>Your future self thanks you.</p>
                                </div>
                            `
                    }
                </div>
            </section>
        </div>

        <section class="card" style="margin-top:20px;">
            <div class="card-header">
                <h3>Recommended peers</h3>
                <button class="small-btn" id="homeFindPeer">
                    Find a peer
                </button>
            </div>

            <div class="peer-grid">
                ${recommendedTutors.map(renderPeerCard).join("")}
            </div>
        </section>

        <section class="card" style="margin-top:20px;">
            <div class="card-header">
                <h3>Your Peer Points</h3>
                <span class="tag">${currentUser.points || 0} points</span>
            </div>

            <p class="muted" style="font-size:12px; line-height:1.6;">
                Earn points by tutoring, completing study sessions and
                keeping up with your work.
            </p>
        </section>
    `;
}

function renderMiniCalendar() {
    const start = new Date();
    start.setHours(12, 0, 0, 0);

    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    start.setDate(start.getDate() + mondayOffset);

    let html = `
        <div class="mini-calendar">
            ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                .map(dayName => `<div class="calendar-day-name">${dayName}</div>`)
                .join("")}
    `;

    for (let i = 0; i < 14; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        const iso = formatISODate(date);

        const events = currentUser.events?.filter(
            event => event.date === iso
        ) || [];

        const isToday = iso === todayISO();

        html += `
            <div
                class="calendar-day ${isToday ? "today" : ""} ${events.length ? "has-event" : ""}"
                title="${events.length ? escapeHTML(events.map(event => event.title).join(", ")) : ""}"
            >
                ${date.getDate()}
            </div>
        `;
    }

    html += `</div>`;

    return html;
}

function renderAssignmentItem(assignment) {
    return `
        <div class="assignment-item">
            <div class="assignment-info">
                <strong>${escapeHTML(assignment.title)}</strong>
                <span>
                    ${escapeHTML(assignment.subject || "School")}
                    · Due ${formatPrettyDate(assignment.dueDate)}
                </span>
            </div>

            <span class="priority ${assignment.priority}">
                ${escapeHTML(assignment.priority)}
            </span>
        </div>
    `;
}

function renderPeerCard(tutor) {
    return `
        <div class="peer-card">
            <div class="peer-avatar">
                ${getInitials(tutor.name)}
            </div>

            <strong>${escapeHTML(tutor.name)}</strong>

            <p>
                ${escapeHTML(tutor.year)} ·
                ${escapeHTML(tutor.bio)}
            </p>

            <div>
                ${tutor.subjects.slice(0, 3)
                    .map(subject => `<span class="tag">${escapeHTML(subject)}</span>`)
                    .join("")}
            </div>
        </div>
    `;
}

function bindHomeEvents() {
    $("#homeAddEvent")?.addEventListener("click", () => {
        openEventModal();
    });

    $("#homeAddAssignment")?.addEventListener("click", () => {
        navigate("assignments");
    });

    $("#homeFindPeer")?.addEventListener("click", () => {
        navigate("tutors");
    });
}

/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendarPage() {
    const monthName = currentCalendarDate.toLocaleDateString("en-NZ", {
        month: "long",
        year: "numeric"
    });

    return `
        <div class="page-header">
            <div>
                <h2>Calendar</h2>
                <p>Keep school, tutoring and study sessions in one place.</p>
            </div>

            <button class="primary-btn" id="calendarAddEvent">
                + Add event
            </button>
        </div>

        <section class="card">
            <div class="card-header">
                <button class="small-btn" id="previousMonth">←</button>
                <h3>${monthName}</h3>
                <button class="small-btn" id="nextMonth">→</button>
            </div>

            ${renderFullCalendar()}
        </section>
    `;
}

function renderFullCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const totalDays = lastDay.getDate();

    let html = `
        <div class="month-calendar">
            ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                .map(day => `<div class="month-heading">${day}</div>`)
                .join("")}
    `;

    for (let i = 0; i < startDay; i++) {
        html += `<div class="month-cell other-month"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const iso = formatISODate(date);

        const events = currentUser.events?.filter(
            event => event.date === iso
        ) || [];

        const assignments = currentUser.assignments?.filter(
            assignment => assignment.dueDate === iso
        ) || [];

        const isToday = iso === todayISO();

        html += `
            <div class="month-cell ${isToday ? "today" : ""}">
                <div class="month-number">${day}</div>

                ${events.map(event => `
                    <div class="month-event">
                        ${escapeHTML(event.title)}
                    </div>
                `).join("")}

                ${assignments.map(assignment => `
                    <div class="month-event">
                        📚 ${escapeHTML(assignment.title)}
                    </div>
                `).join("")}
            </div>
        `;
    }

    html += `</div>`;

    return html;
}

function bindCalendarEvents() {
    $("#calendarAddEvent")?.addEventListener("click", openEventModal);

    $("#previousMonth")?.addEventListener("click", () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderPage();
    });

    $("#nextMonth")?.addEventListener("click", () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderPage();
    });
}

/* =========================================================
   EVENT MODAL
   ========================================================= */

function openEventModal(date = todayISO()) {
    const modalRoot = $("#modalRoot");

    modalRoot.innerHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>Add calendar event</h3>
                    <button class="close-btn" id="closeModal">×</button>
                </div>

                <form id="eventForm">
                    <div class="form-grid">

                        <div class="form-group full-width">
                            <label for="eventTitle">Event name</label>
                            <input
                                id="eventTitle"
                                type="text"
                                placeholder="e.g. Maths test"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="eventDate">Date</label>
                            <input
                                id="eventDate"
                                type="date"
                                value="${date}"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="eventTime">Time</label>
                            <input
                                id="eventTime"
                                type="time"
                            >
                        </div>

                        <div class="form-group full-width">
                            <label for="eventType">Type</label>
                            <select id="eventType">
                                <option>School</option>
                                <option>Study</option>
                                <option>Tutoring</option>
                                <option>Personal</option>
                            </select>
                        </div>

                    </div>

                    <div class="modal-actions">
                        <button type="button" class="secondary-btn" id="cancelModal">
                            Cancel
                        </button>

                        <button type="submit" class="primary-btn">
                            Add event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    $("#closeModal").addEventListener("click", closeModal);
    $("#cancelModal").addEventListener("click", closeModal);

    $("#modalOverlay").addEventListener("click", event => {
        if (event.target.id === "modalOverlay") {
            closeModal();
        }
    });

    $("#eventForm").addEventListener("submit", event => {
        event.preventDefault();

        const newEvent = {
            id: `event-${Date.now()}`,
            title: $("#eventTitle").value.trim(),
            date: $("#eventDate").value,
            time: $("#eventTime").value,
            type: $("#eventType").value
        };

        if (!newEvent.title || !newEvent.date) return;

        currentUser.events = currentUser.events || [];
        currentUser.events.push(newEvent);

        updateCurrentUser({
            events: currentUser.events
        });

        closeModal();
        renderPage();

        showToast("Event added to your calendar.");
    });
}

function closeModal() {
    $("#modalRoot").innerHTML = "";
}

/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignmentsPage() {
    const assignments = [...(currentUser.assignments || [])]
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return `
        <div class="page-header">
            <div>
                <h2>Assignments</h2>
                <p>Track what is due without letting it ambush you.</p>
            </div>

            <button class="primary-btn" id="addAssignmentBtn">
                + Add assignment
            </button>
        </div>

        <section class="card">

            <div class="assignment-list">
                ${
                    assignments.length
                        ? assignments.map(assignment => `
                            <div class="assignment-item">
                                <div class="assignment-info">
                                    <strong>
                                        ${escapeHTML(assignment.title)}
                                    </strong>

                                    <span>
                                        ${escapeHTML(assignment.subject)}
                                        · Due ${formatPrettyDate(assignment.dueDate)}
                                    </span>
                                </div>

                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span class="priority ${assignment.priority}">
                                        ${escapeHTML(assignment.priority)}
                                    </span>

                                    <button
                                        class="small-btn delete-assignment"
                                        data-id="${assignment.id}"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        `).join("")
                        : `
                            <div class="empty-state">
                                <div class="empty-icon">✓</div>
                                <strong>No assignments yet</strong>
                                <p>Add your first assignment above.</p>
                            </div>
                        `
                }
            </div>
        </section>
    `;
}

function bindAssignmentEvents() {
    $("#addAssignmentBtn")?.addEventListener(
        "click",
        openAssignmentModal
    );

    $$(".delete-assignment").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.id;

            currentUser.assignments =
                currentUser.assignments.filter(
                    assignment => assignment.id !== id
                );

            updateCurrentUser({
                assignments: currentUser.assignments
            });

            renderPage();
            showToast("Assignment removed.");
        });
    });
}

function openAssignmentModal() {
    $("#modalRoot").innerHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>Add assignment</h3>
                    <button class="close-btn" id="closeModal">×</button>
                </div>

                <form id="assignmentForm">

                    <div class="form-grid">

                        <div class="form-group full-width">
                            <label for="assignmentTitle">Assignment</label>
                            <input
                                id="assignmentTitle"
                                type="text"
                                placeholder="e.g. Algebra test"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="assignmentSubject">Subject</label>
                            <input
                                id="assignmentSubject"
                                type="text"
                                placeholder="Maths"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="assignmentDue">Due date</label>
                            <input
                                id="assignmentDue"
                                type="date"
                                value="${todayISO()}"
                                required
                            >
                        </div>

                        <div class="form-group full-width">
                            <label for="assignmentPriority">Importance</label>
                            <select id="assignmentPriority">
                                <option value="high">High</option>
                                <option value="medium" selected>Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                    </div>

                    <div class="modal-actions">
                        <button type="button" class="secondary-btn" id="cancelModal">
                            Cancel
                        </button>

                        <button type="submit" class="primary-btn">
                            Add assignment
                        </button>
                    </div>

                </form>
            </div>
        </div>
    `;

    $("#closeModal").addEventListener("click", closeModal);
    $("#cancelModal").addEventListener("click", closeModal);

    $("#assignmentForm").addEventListener("submit", event => {
        event.preventDefault();

        const title = $("#assignmentTitle").value.trim();
        const subject = $("#assignmentSubject").value.trim();
        const dueDate = $("#assignmentDue").value;
        const priority = $("#assignmentPriority").value;

        const assignment = {
            id: `assignment-${Date.now()}`,
            title,
            subject,
            dueDate,
            priority,
            completed: false
        };

        currentUser.assignments = currentUser.assignments || [];
        currentUser.assignments.push(assignment);

        /*
         * Assignments automatically create a calendar event
         * on their due date.
         */
        currentUser.events = currentUser.events || [];

        currentUser.events.push({
            id: `assignment-event-${Date.now()}`,
            title: `Due: ${title}`,
            date: dueDate,
            time: "",
            type: "Assignment",
            assignmentId: assignment.id
        });

        updateCurrentUser({
            assignments: currentUser.assignments,
            events: currentUser.events
        });

        closeModal();
        renderPage();

        showToast("Assignment added and saved to your calendar.");
    });
}

/* =========================================================
   TUTORS
   ========================================================= */

function renderTutorsPage() {
    return `
        <div class="page-header">
            <div>
                <h2>Find a Peer</h2>
                <p>Find someone who knows the thing your brain has decided to reject.</p>
            </div>
        </div>

        <section class="card">

            <div class="filter-row">
                <input
                    id="tutorSearch"
                    type="search"
                    placeholder="Search subject or tutor..."
                >

                <select id="tutorYear">
                    <option value="">Any year</option>
                    ${Array.from({ length: 6 }, (_, i) =>
                        `<option value="Year ${i + 8}">Year ${i + 8}</option>`
                    ).join("")}
                </select>

                <select id="tutorAvailability">
                    <option value="">Any availability</option>
                    <option value="lunchtime">Lunchtimes</option>
                    <option value="after school">After school</option>
                    <option value="evenings">Evenings</option>
                    <option value="weekends">Weekends</option>
                </select>
            </div>

            <div id="tutorResults" class="tutor-grid">
                ${renderTutorCards(appData.tutors)}
            </div>

        </section>
    `;
}

function renderTutorCards(tutors) {
    if (!tutors.length) {
        return `
            <div class="empty-state" style="grid-column:1/-1;">
                <div class="empty-icon">♧</div>
                <strong>No peers found</strong>
                <p>Try changing your filters.</p>
            </div>
        `;
    }

    return tutors.map(tutor => `
        <article class="tutor-card">

            <div class="tutor-top">
                <div class="peer-avatar">
                    ${getInitials(tutor.name)}
                </div>

                <div class="tutor-info">
                    <strong>${escapeHTML(tutor.name)}</strong>
                    <span>${escapeHTML(tutor.year)}</span>
                </div>
            </div>

            <div class="tags">
                ${tutor.subjects
                    .map(subject =>
                        `<span class="tag">${escapeHTML(subject)}</span>`
                    )
                    .join("")}
            </div>

            <p class="availability">
                ◷ ${escapeHTML(tutor.availability)}
            </p>

            <p class="muted" style="font-size:11px;line-height:1.5;margin-bottom:13px;">
                ${escapeHTML(tutor.bio)}
            </p>

            <button
                class="primary-btn book-tutor"
                data-tutor="${tutor.id}"
                style="width:100%;"
            >
                Book a session
            </button>

        </article>
    `).join("");
}

function bindTutorEvents() {
    const search = $("#tutorSearch");
    const year = $("#tutorYear");
    const availability = $("#tutorAvailability");

    function filterTutors() {
        const searchValue = search.value.toLowerCase().trim();
        const yearValue = year.value;
        const availabilityValue = availability.value;

        const filtered = appData.tutors.filter(tutor => {
            const matchesSearch =
                !searchValue ||
                tutor.name.toLowerCase().includes(searchValue) ||
                tutor.subjects.some(subject =>
                    subject.toLowerCase().includes(searchValue)
                );

            const matchesYear =
                !yearValue || tutor.year === yearValue;

            const tutorAvailability =
                tutor.availability.toLowerCase();

            const matchesAvailability =
                !availabilityValue ||
                tutorAvailability.includes(availabilityValue);

            return (
                matchesSearch &&
                matchesYear &&
                matchesAvailability
            );
        });

        $("#tutorResults").innerHTML = renderTutorCards(filtered);
        bindTutorButtons();
    }

    search.addEventListener("input", filterTutors);
    year.addEventListener("change", filterTutors);
    availability.addEventListener("change", filterTutors);

    bindTutorButtons();
}

function bindTutorButtons() {
    $$(".book-tutor").forEach(button => {
        button.addEventListener("click", () => {
            openBookingModal(button.dataset.tutor);
        });
    });
}

/* =========================================================
   BOOKING
   ========================================================= */

function openBookingModal(tutorId) {
    const tutor = appData.tutors.find(
        item => item.id === tutorId
    );

    if (!tutor) return;

    $("#modalRoot").innerHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">

                <div class="modal-header">
                    <h3>Book ${escapeHTML(tutor.name)}</h3>
                    <button class="close-btn" id="closeModal">×</button>
                </div>

                <p class="muted" style="font-size:12px;line-height:1.5;margin-bottom:18px;">
                    ${escapeHTML(tutor.bio)}
                </p>

                <form id="bookingForm">

                    <div class="form-grid">

                        <div class="form-group">
                            <label for="bookingDate">Date</label>
                            <input
                                id="bookingDate"
                                type="date"
                                value="${todayISO()}"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="bookingTime">Time</label>
                            <input
                                id="bookingTime"
                                type="time"
                                required
                            >
                        </div>

                        <div class="form-group full-width">
                            <label for="bookingSubject">
                                Subject / topic
                            </label>

                            <input
                                id="bookingSubject"
                                type="text"
                                placeholder="e.g. Algebra"
                                required
                            >
                        </div>

                    </div>

                    <div class="modal-actions">
                        <button type="button" class="secondary-btn" id="cancelModal">
                            Cancel
                        </button>

                        <button type="submit" class="primary-btn">
                            Request booking
                        </button>
                    </div>

                </form>
            </div>
        </div>
    `;

    $("#closeModal").addEventListener("click", closeModal);
    $("#cancelModal").addEventListener("click", closeModal);

    $("#bookingForm").addEventListener("submit", event => {
        event.preventDefault();

        const booking = {
            id: `booking-${Date.now()}`,
            tutorId: tutor.id,
            tutorName: tutor.name,
            date: $("#bookingDate").value,
            time: $("#bookingTime").value,
            subject: $("#bookingSubject").value.trim(),
            status: "pending"
        };

        currentUser.bookings = currentUser.bookings || [];
        currentUser.bookings.push(booking);

        currentUser.notifications =
            currentUser.notifications || [];

        currentUser.notifications.unshift({
            id: `notification-${Date.now()}`,
            title: "Booking request sent",
            message: `Your request to ${tutor.name} is waiting for confirmation.`,
            read: false
        });

        updateCurrentUser({
            bookings: currentUser.bookings,
            notifications: currentUser.notifications
        });

        closeModal();
        renderPage();

        showToast("Booking request sent.");
    });
}

/* =========================================================
   STUDY SESSION
   ========================================================= */

function renderStudyPage() {
    const minutes = Math.floor(timer.seconds / 60);
    const seconds = timer.seconds % 60;

    return `
        <div class="page-header">
            <div>
                <h2>Study Session</h2>
                <p>Focus mode. Tiny dragon supervision included.</p>
            </div>
        </div>

        <div class="study-layout">

            <section class="timer-card">

                <div class="timer-mode">
                    ${timer.mode}
                </div>

                <div id="timerDisplay" class="timer-display">
                    ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}
                </div>

                <div class="timer-controls">
                    <button
                        type="button"
                        class="timer-btn primary"
                        id="timerStart"
                    >
                        ${timer.running ? "Pause" : "Start"}
                    </button>

                    <button
                        type="button"
                        class="timer-btn"
                        id="timerReset"
                    >
                        Reset
                    </button>
                </div>

                <div style="margin-top:22px;color:rgba(255,255,255,.65);font-size:11px;">
                    🐉 Roro says: one little focus session. That's it.
                </div>

            </section>

            <section class="card timer-settings">

                <div class="card-header">
                    <h3>Session settings</h3>
                </div>

                <label>
                    <span>Focus minutes</span>
                    <input
                        id="focusMinutes"
                        type="number"
                        min="1"
                        max="120"
                        value="${timer.focusMinutes}"
                    >
                </label>

                <label>
                    <span>Break minutes</span>
                    <input
                        id="breakMinutes"
                        type="number"
                        min="1"
                        max="60"
                        value="${timer.breakMinutes}"
                    >
                </label>

                <button
                    type="button"
                    class="secondary-btn"
                    id="applyTimerSettings"
                >
                    Apply settings
                </button>

                <div style="margin-top:15px;padding:15px;background:var(--cream);border-radius:12px;">
                    <strong style="font-size:12px;color:var(--green-dark);">
                        Study streak
                    </strong>

                    <p style="font-size:11px;color:var(--muted);margin-top:5px;">
                        ${currentUser.studySessions || 0}
                        completed sessions
                    </p>
                </div>

            </section>

        </div>
    `;
}

function bindStudyEvents() {
    $("#timerStart").addEventListener("click", () => {
        if (timer.running) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    $("#timerReset").addEventListener("click", resetTimer);

    $("#applyTimerSettings").addEventListener("click", () => {
        const focus = Number($("#focusMinutes").value);
        const breakTime = Number($("#breakMinutes").value);

        if (
            !Number.isFinite(focus) ||
            !Number.isFinite(breakTime) ||
            focus < 1 ||
            breakTime < 1
        ) {
            showToast("Please enter valid timer lengths.");
            return;
        }

        timer.focusMinutes = Math.min(focus, 120);
        timer.breakMinutes = Math.min(breakTime, 60);

        resetTimer();

        showToast("Timer settings updated.");
    });
}

function updateTimerDisplay() {
    const display = $("#timerDisplay");

    if (!display) return;

    const minutes = Math.floor(timer.seconds / 60);
    const seconds = timer.seconds % 60;

    display.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
    if (timer.running) return;

    timer.running = true;

    timer.interval = setInterval(() => {
        timer.seconds--;

        updateTimerDisplay();

        if (timer.seconds <= 0) {
            completeTimerMode();
        }
    }, 1000);

    renderPage();
}

function pauseTimer() {
    timer.running = false;

    clearInterval(timer.interval);
    timer.interval = null;

    renderPage();
}

function stopTimer() {
    timer.running = false;

    clearInterval(timer.interval);
    timer.interval = null;
}

function resetTimer() {
    stopTimer();

    timer.mode = "Focus";
    timer.seconds = timer.focusMinutes * 60;

    renderPage();
}

function completeTimerMode() {
    stopTimer();

    if (timer.mode === "Focus") {
        currentUser.studySessions =
            (currentUser.studySessions || 0) + 1;

        currentUser.points =
            (currentUser.points || 0) + 10;

        currentUser.progress =
            currentUser.progress || [];

        currentUser.progress.push(currentUser.points);

        currentUser.notifications =
            currentUser.notifications || [];

        currentUser.notifications.unshift({
            id: `notification-${Date.now()}`,
            title: "Study session complete",
            message: "You earned 10 Peer Points. Roro is smug about it.",
            read: false
        });

        updateCurrentUser({
            studySessions: currentUser.studySessions,
            points: currentUser.points,
            progress: currentUser.progress,
            notifications: currentUser.notifications
        });

        timer.mode = "Break";
        timer.seconds = timer.breakMinutes * 60;

        showToast("Focus session complete. Take your break.");
    } else {
        timer.mode = "Focus";
        timer.seconds = timer.focusMinutes * 60;

        showToast("Break finished. Back to focus.");
    }

    renderPage();
}

/* =========================================================
   PROFILE
   ========================================================= */

function renderProfilePage() {
    const completedAssignments =
        currentUser.assignments?.filter(
            assignment => assignment.completed
        ).length || 0;

    return `
        <div class="page-header">
            <div>
                <h2>My Profile</h2>
                <p>Your Peer Hub profile and progress.</p>
            </div>
        </div>

        <section class="card">

            <div class="profile-header">

                <div class="profile-avatar">
                    ${getInitials(currentUser.name)}
                </div>

                <div>
                    <h3>${escapeHTML(currentUser.name)}</h3>
                    <p>
                        ${escapeHTML(currentUser.year)}
                        ${currentUser.className
                            ? ` · ${escapeHTML(currentUser.className)}`
                            : ""}
                    </p>
                    <p>${escapeHTML(currentUser.email)}</p>
                </div>

            </div>

            <div class="stats-grid">

                <div class="stat-box">
                    <strong>${currentUser.points || 0}</strong>
                    <span>Peer Points</span>
                </div>

                <div class="stat-box">
                    <strong>${currentUser.studySessions || 0}</strong>
                    <span>Study sessions</span>
                </div>

                <div class="stat-box">
                    <strong>${completedAssignments}</strong>
                    <span>Completed assignments</span>
                </div>

            </div>

        </section>

        <section class="card" style="margin-top:20px;">
            <div class="card-header">
                <h3>Progress</h3>
            </div>

            ${renderProgressChart()}
        </section>
    `;
}

function renderProgressChart() {
    const data = currentUser.progress || [0];

    if (data.length < 2) {
        return `
            <div class="empty-state">
                <div class="empty-icon">✦</div>
                <strong>Your progress will appear here</strong>
                <p>Complete study sessions to start building your graph.</p>
            </div>
        `;
    }

    const max = Math.max(...data, 10);
    const width = 700;
    const height = 230;
    const padding = 30;

    const points = data.map((value, index) => {
        const x =
            padding +
            (index / Math.max(data.length - 1, 1)) *
            (width - padding * 2);

        const y =
            height -
            padding -
            (value / max) *
            (height - padding * 2);

        return `${x},${y}`;
    }).join(" ");

    return `
        <div style="width:100%;overflow-x:auto;">
            <svg
                viewBox="0 0 ${width} ${height}"
                width="100%"
                height="230"
                role="img"
                aria-label="Peer Points progress graph"
            >
                <line
                    x1="${padding}"
                    y1="${height - padding}"
                    x2="${width - padding}"
                    y2="${height - padding}"
                    stroke="#dedbd1"
                    stroke-width="1"
                />

                <polyline
                    points="${points}"
                    fill="none"
                    stroke="#173c32"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                ${data.map((value, index) => {
                    const x =
                        padding +
                        (index / Math.max(data.length - 1, 1)) *
                        (width - padding * 2);

                    const y =
                        height -
                        padding -
                        (value / max) *
                        (height - padding * 2);

                    return `
                        <circle
                            cx="${x}"
                            cy="${y}"
                            r="5"
                            fill="#b79a62"
                        />
                    `;
                }).join("")}
            </svg>
        </div>
    `;
}

function bindProfileEvents() {
    // Reserved for future profile editing.
}

/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettingsPage() {
    return `
        <div class="page-header">
            <div>
                <h2>Settings</h2>
                <p>Manage your Peer Hub preferences.</p>
            </div>
        </div>

        <section class="card">

            <div class="settings-list">

                <div class="setting-row">
                    <div>
                        <strong>Notifications</strong>
                        <span>Receive reminders about bookings and study sessions.</span>
                    </div>

                    <button
                        class="toggle active"
                        id="notificationToggle"
                        aria-label="Toggle notifications"
                    ></button>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Daily motivation</strong>
                        <span>Show a daily quote on your home page.</span>
                    </div>

                    <button
                        class="toggle active"
                        id="motivationToggle"
                        aria-label="Toggle daily motivation"
                    ></button>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Demo account</strong>
                        <span>This prototype uses local browser storage.</span>
                    </div>

                    <span class="tag">Prototype</span>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Account</strong>
                        <span>${escapeHTML(currentUser.email)}</span>
                    </div>

                    <button
                        class="burgundy-btn"
                        id="logoutBtn"
                    >
                        Sign out
                    </button>
                </div>

            </div>

        </section>

        <section class="card" style="margin-top:20px;">
            <div class="card-header">
                <h3>About Peer Hub</h3>
            </div>

            <p class="muted" style="font-size:12px;line-height:1.7;">
                St Oran's Peer Hub is a student-focused prototype for
                organising schoolwork, finding peer tutors and making
                studying slightly less painful.
            </p>
        </section>
    `;
}

function bindSettingsEvents() {
    $("#logoutBtn").addEventListener("click", logout);

    $("#notificationToggle").addEventListener("click", event => {
        event.currentTarget.classList.toggle("active");
    });

    $("#motivationToggle").addEventListener("click", event => {
        event.currentTarget.classList.toggle("active");
    });
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function showNotifications() {
    const notifications = currentUser.notifications || [];

    $("#modalRoot").innerHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">

                <div class="modal-header">
                    <h3>Notifications</h3>
                    <button class="close-btn" id="closeModal">×</button>
                </div>

                <div class="notification-list">

                    ${
                        notifications.length
                            ? notifications.map(notification => `
                                <div class="notification-item">
                                    <strong>
                                        ${escapeHTML(notification.title)}
                                    </strong>

                                    <p>
                                        ${escapeHTML(notification.message)}
                                    </p>
                                </div>
                            `).join("")
                            : `
                                <div class="empty-state">
                                    <div class="empty-icon">♢</div>
                                    <strong>No notifications</strong>
                                    <p>Peace and quiet. Suspicious, but nice.</p>
                                </div>
                            `
                    }

                </div>

                ${
                    notifications.length
                        ? `
                            <div class="modal-actions">
                                <button
                                    class="secondary-btn"
                                    id="markNotificationsRead"
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

    $("#closeModal").addEventListener("click", closeModal);

    $("#markNotificationsRead")?.addEventListener("click", () => {
        currentUser.notifications =
            currentUser.notifications.map(notification => ({
                ...notification,
                read: true
            }));

        updateCurrentUser({
            notifications: currentUser.notifications
        });

        closeModal();
        updateTopBar();

        showToast("Notifications marked as read.");
    });
}

/* =========================================================
   INITIALISE
   ========================================================= */

function initialiseApp() {
    loadData();

    /*
     * IMPORTANT:
     * currentUser is established BEFORE any page rendering.
     * This prevents the old "Cannot access currentUser before
     * initialization" error.
     */

    setupAuth();
    setupNavigation();
    setupTopBar();

    restoreSession();

    if (!currentUser) {
        $("#authScreen").classList.remove("hidden");
        $("#app").classList.add("hidden");
    }
}

document.addEventListener("DOMContentLoaded", initialiseApp);
```
