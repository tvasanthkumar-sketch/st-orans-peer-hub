/* =========================================================
   ST ORAN'S PEER HUB
   MAIN JAVASCRIPT
   ========================================================= */

const USERS_KEY = "stOransPeerHubUsers";
const CURRENT_USER_KEY = "stOransCurrentUser";
const EVENTS_KEY = "stOransCalendarEvents";
const ASSIGNMENTS_KEY = "stOransAssignments";


/* =========================================================
   STORAGE
   ========================================================= */

function getUsers() {
    try {
        const stored = localStorage.getItem(USERS_KEY);

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        // Make sure users is actually an array
        if (Array.isArray(parsed)) {
            return parsed;
        }

        // Remove broken/old data
        localStorage.removeItem(USERS_KEY);
        return [];
    } catch {
        localStorage.removeItem(USERS_KEY);
        return [];
    }
}

function saveUsers(users) {
    if (!Array.isArray(users)) {
        console.error("saveUsers expected an array, but received:", users);
        return;
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch {
        return null;
    }
}

function saveCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function removeCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}


/* =========================================================
   DEMO ACCOUNTS
   ========================================================= */

function createDemoAccounts() {

    const users = getUsers();

    const demos = [
        {
            id: "demo-maya",
            name: "Maya Patel",
            email: "maya@storans.school.nz",
            password: "maya123",
            year: "Year 8",
            points: 120,
            helped: 8,
            sessions: 12,
            badges: ["Helpful Heart", "Study Starter"],
            tags: ["Maths", "Science"],
            preferences: "Happy to help with Maths and Science.",
            online: true,
            available: true
        },
        {
            id: "demo-lucy",
            name: "Lucy Williams",
            email: "lucy@storans.school.nz",
            password: "lucy123",
            year: "Year 9",
            points: 180,
            helped: 14,
            sessions: 19,
            badges: ["Study Star", "Peer Helper"],
            tags: ["English", "Social Studies"],
            preferences: "I can help with English and Social Studies.",
            online: true,
            available: true
        }
    ];

    let changed = false;

    demos.forEach(demo => {

        const exists = users.some(
            user => user.email.toLowerCase() === demo.email.toLowerCase()
        );

        if (!exists) {
            users.push(demo);
            changed = true;
        }
    });

    if (changed) {
        saveUsers(users);
    }
}


/* =========================================================
   CURRENT USER
   ========================================================= */

function updateCurrentUser(updatedUser) {

    const users = getUsers();

    const index = users.findIndex(
        user => user.id === updatedUser.id
    );

    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
    }

    saveCurrentUser(updatedUser);
}


/* =========================================================
   LOGIN
   ========================================================= */

function loginUser(event) {

    event.preventDefault();

    const email = document.getElementById("email")?.value
        .trim()
        .toLowerCase();

    const password =
        document.getElementById("password")?.value || "";

    const error =
        document.getElementById("loginError");

    const user = getUsers().find(
        user =>
            user.email.toLowerCase() === email &&
            user.password === password
    );

    if (!user) {

        if (error) {
            error.textContent = "Email or password is incorrect.";
            error.style.display = "block";
        }

        return;
    }

    if (error) {
        error.textContent = "";
        error.style.display = "none";
    }

    saveCurrentUser(user);
    openMainApp();
}


function googleLogin() {

    let users = getUsers();

    let googleUser = users.find(
        user => user.email === "google.demo@storans.school.nz"
    );

    if (!googleUser) {

        googleUser = {
            id: "google-demo",
            name: "Google Demo Student",
            email: "google.demo@storans.school.nz",
            password: "google-demo",
            year: "Year 8",
            points: 0,
            helped: 0,
            sessions: 0,
            badges: [],
            tags: [],
            preferences: "",
            online: true,
            available: true
        };

        users.push(googleUser);
        saveUsers(users);
    }

    saveCurrentUser(googleUser);
    openMainApp();
}


/* =========================================================
   SIGNUP
   ========================================================= */

function showSignup(event) {

    if (event) event.preventDefault();

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "none";
    document.getElementById("signupScreen").style.display = "flex";
}


function showLogin(event) {

    if (event) event.preventDefault();

    document.getElementById("signupScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "none";
    document.getElementById("loginScreen").style.display = "flex";
}


function signupUser(event) {

    event.preventDefault();

    const name =
        document.getElementById("signupName").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim().toLowerCase();

    const year =
        document.getElementById("signupYear").value;

    const password =
        document.getElementById("signupPassword").value;

    const confirmPassword =
        document.getElementById("signupConfirmPassword").value;

    const error =
        document.getElementById("signupError");

    function showError(message) {

        if (error) {
            error.textContent = message;
            error.style.display = "block";
        }
    }

    if (!name) {
        showError("Please enter your name.");
        return;
    }

    if (!email.endsWith("@storans.school.nz")) {
        showError("Please use your St Oran's school email.");
        return;
    }

    if (!year) {
        showError("Please select your year level.");
        return;
    }

    if (password.length < 6) {
        showError("Your password needs at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        showError("Your passwords do not match.");
        return;
    }

    const users = getUsers();

    if (
        users.some(
            user => user.email.toLowerCase() === email
        )
    ) {
        showError("An account with this email already exists.");
        return;
    }

    const newUser = {
        id: "user-" + Date.now(),
        name,
        email,
        password,
        year,

        /* NEW ACCOUNTS START WITH NOTHING */
        points: 0,
        helped: 0,
        sessions: 0,
        badges: [],
        tags: [],
        preferences: "",
        online: true,
        available: true
    };

    users.push(newUser);

    saveUsers(users);
    saveCurrentUser(newUser);

    openMainApp();
}


/* =========================================================
   APP
   ========================================================= */

function openMainApp() {

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("signupScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "flex";

    loadUserIntoSite();
    showPage("home");
}


function loadUserIntoSite() {

    const user = getCurrentUser();

    if (!user) return;

    const firstName =
        user.name.split(" ")[0];

    const welcomeName =
        document.getElementById("welcomeName");

    const topName =
        document.getElementById("topName");

    const topYear =
        document.getElementById("topYear");

    const profileName =
        document.getElementById("profileName");

    const profileYear =
        document.getElementById("profileYear");

    const settingsEmail =
        document.getElementById("settingsEmail");

    if (welcomeName) {
        welcomeName.textContent = firstName;
    }

    if (topName) {
        topName.textContent = user.name;
    }

    if (topYear) {
        topYear.textContent = user.year;
    }

    if (profileName) {
        profileName.textContent = user.name;
    }

    if (profileYear) {
        profileYear.textContent = user.year;
    }

    if (settingsEmail) {
        settingsEmail.textContent = user.email;
    }

    updateGreeting();
    updateHomeStats();
    updateProfile();
    updateProgress();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(pageName) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const page =
        document.getElementById(pageName);

    if (page) {
        page.classList.add("active");
    }

    const alternative =
        document.getElementById(pageName + "Page");

    if (!page && alternative) {
        alternative.classList.add("active");
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

            if (item.dataset.page === pageName) {
                item.classList.add("active");
            }
        });

    if (pageName === "home") {
        renderHome();
    }

    if (pageName === "calendar") {
        renderCalendar();
    }

    if (pageName === "assignments") {
        renderAssignments();
    }

    if (pageName === "peers") {
        renderPeers();
    }

    if (pageName === "profile") {
        updateProfile();
    }

    if (pageName === "progress") {
        updateProgress();
    }

    if (pageName === "study") {
        updateStudyStats();
    }
}


/* =========================================================
   DATE / GREETING
   ========================================================= */

function updateGreeting() {

    const greeting =
        document.getElementById("greeting");

    const todayLabel =
        document.getElementById("todayLabel");

    const now = new Date();
    const hour = now.getHours();

    let message = "Good evening";

    if (hour < 12) {
        message = "Good morning";
    } else if (hour < 18) {
        message = "Good afternoon";
    }

    if (greeting) {
        greeting.textContent = message;
    }

    if (todayLabel) {

        todayLabel.textContent =
            now.toLocaleDateString(
                "en-NZ",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                }
            );
    }
}


/* =========================================================
   HOME
   ========================================================= */

const quotes = [
    "Small progress is still progress.",
    "You don't have to be perfect to make progress.",
    "Future you will be glad you started today.",
    "A little studying now saves a lot of panic later.",
    "Your effort counts, even when nobody sees it."
];


function renderHome() {

    const quote =
        document.getElementById("homeQuote");

    if (quote) {

        quote.textContent =
            quotes[new Date().getDate() % quotes.length];
    }

    updateHomeStats();
    renderMiniCalendar();
    renderDeadlines();
    renderRecommendedPeers();
}


function updateHomeStats() {

    const user = getCurrentUser();

    if (!user) return;

    const points =
        document.getElementById("homePoints");

    const helped =
        document.getElementById("homeHelped");

    const progressFill =
        document.getElementById("homeProgressFill");

    const caption =
        document.getElementById("homeProgressCaption");

    if (points) {
        points.textContent = user.points || 0;
    }

    if (helped) {
        helped.textContent = user.helped || 0;
    }

    const percentage =
        Math.min(
            100,
            Math.round((user.points || 0) / 500 * 100)
        );

    if (progressFill) {
        progressFill.style.width =
            percentage + "%";
    }

    if (caption) {
        caption.textContent =
            `${user.points || 0} / 500 points`;
    }
}


/* =========================================================
   MINI CALENDAR
   ========================================================= */

function renderMiniCalendar() {

    const container =
        document.getElementById("miniCalendar");

    const title =
        document.getElementById("monthTitle");

    if (!container) return;

    const now = new Date();

    if (title) {

        title.textContent =
            now.toLocaleDateString(
                "en-NZ",
                {
                    month: "long",
                    year: "numeric"
                }
            );
    }

    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    let html = "";

    [
        "S", "M", "T", "W", "T", "F", "S"
    ].forEach(day => {

        html += `
            <div class="calendar-weekday">
                ${day}
            </div>
        `;
    });

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {

        const isToday =
            day === now.getDate();

        html += `
            <div class="calendar-day ${isToday ? "today" : ""}">
                ${day}
            </div>
        `;
    }

    container.innerHTML = html;
}


/* =========================================================
   CALENDAR EVENTS
   ========================================================= */

function getEvents() {

    try {

        return JSON.parse(
            localStorage.getItem(EVENTS_KEY)
        ) || [];

    } catch {

        return [];
    }
}


function saveEvents(events) {

    localStorage.setItem(
        EVENTS_KEY,
        JSON.stringify(events)
    );
}


let calendarDate = new Date();


function renderCalendar() {

    const container =
        document.getElementById("fullCalendar");

    const title =
        document.getElementById("fullMonthTitle");

    if (!container) return;

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();

    if (title) {

        title.textContent =
            calendarDate.toLocaleDateString(
                "en-NZ",
                {
                    month: "long",
                    year: "numeric"
                }
            );
    }

    const firstDay =
        new Date(year, month, 1).getDay();

    const days =
        new Date(year, month + 1, 0).getDate();

    const events =
        getEvents();

    let html = `
        <div class="calendar-header-row">
            <button onclick="changeCalendarMonth(-1)">‹</button>
            <button onclick="changeCalendarMonth(1)">›</button>
        </div>

        <div class="calendar-grid">
    `;

    [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ].forEach(day => {

        html += `
            <div class="calendar-weekday">
                ${day}
            </div>
        `;
    });

    for (let i = 0; i < firstDay; i++) {

        html += `
            <div class="calendar-cell empty"></div>
        `;
    }

    for (let day = 1; day <= days; day++) {

        const date =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayEvents =
            events.filter(event => event.date === date);

        const today = new Date();

        const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;

        html += `
            <div
                class="calendar-cell ${isToday ? "today" : ""}"
                onclick="addCalendarEvent('${date}')"
            >

                <div class="calendar-number">
                    ${day}
                </div>

                <div class="calendar-events">
        `;

        /* EVENTS NOW ACTUALLY RENDER INSIDE THE DATE */

        dayEvents.forEach(event => {

            html += `
                <div
                    class="calendar-event"
                    title="${escapeAttribute(event.priority)} priority"
                >
                    <strong>
                        ${escapeHTML(event.title)}
                    </strong>

                    <small>
                        ${escapeHTML(event.priority)}
                    </small>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    html += `
        </div>

        <button
            class="primary-button calendar-add-button"
            onclick="addCalendarEvent()"
        >
            + Add event
        </button>
    `;

    container.innerHTML = html;
}


function changeCalendarMonth(amount) {

    calendarDate.setMonth(
        calendarDate.getMonth() + amount
    );

    renderCalendar();
}


/* =========================================================
   ADD CALENDAR EVENT
   ========================================================= */

function addCalendarEvent(selectedDate = "") {

    openModal(`

        <h2>Add event</h2>

        <label>
            Event name
            <input
                type="text"
                id="eventTitle"
                placeholder="e.g. Maths test"
            >
        </label>

        <label>
            Date
            <input
                type="date"
                id="eventDate"
                value="${selectedDate}"
            >
        </label>

        <label>
            Importance
            <select id="eventPriority">

                <option value="Low">
                    Low
                </option>

                <option value="Medium" selected>
                    Medium
                </option>

                <option value="High">
                    High
                </option>

                <option value="Urgent">
                    Urgent
                </option>

            </select>
        </label>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="saveCalendarEvent()"
            >
                Add event
            </button>

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

        </div>
    `);
}


function saveCalendarEvent() {

    const title =
        document.getElementById("eventTitle")?.value.trim();

    const date =
        document.getElementById("eventDate")?.value;

    const priority =
        document.getElementById("eventPriority")?.value;

    if (!title) {

        alert("Please enter an event name.");

        return;
    }

    if (!date) {

        alert("Please choose a date.");

        return;
    }

    const events = getEvents();

    events.push({

        id: Date.now(),

        title,

        date,

        priority: priority || "Medium"
    });

    saveEvents(events);

    closeModal();

    /*
       Re-render EVERYTHING immediately.
       This is the bit the previous version was
       annoyingly failing to do properly.
    */

    renderCalendar();
    renderMiniCalendar();
    renderDeadlines();
}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

const defaultAssignments = [
    {
        id: 1,
        title: "Science Investigation",
        subject: "Science",
        due: "2026-09-15",
        priority: "High",
        completed: false
    },
    {
        id: 2,
        title: "Spanish Writing",
        subject: "Spanish",
        due: "2026-09-18",
        priority: "Medium",
        completed: false
    },
    {
        id: 3,
        title: "Social Studies Case Study",
        subject: "Social Studies",
        due: "2026-09-22",
        priority: "High",
        completed: false
    }
];


function getAssignments() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(ASSIGNMENTS_KEY)
            );

        if (Array.isArray(saved)) {
            return saved;
        }

    } catch {}

    saveAssignments(defaultAssignments);

    return [...defaultAssignments];
}


function saveAssignments(assignments) {

    localStorage.setItem(
        ASSIGNMENTS_KEY,
        JSON.stringify(assignments)
    );
}


function renderAssignments() {

    const container =
        document.getElementById("assignmentPageList");

    if (!container) return;

    const assignments =
        getAssignments();

    let html = `

        <div class="assignment-add-area">

            <button
                class="primary-button"
                onclick="addAssignment()"
            >
                + Add assignment
            </button>

        </div>
    `;

    if (!assignments.length) {

        html += `
            <div class="empty-state">

                <h3>No assignments yet</h3>

                <p>
                    Add your first assignment above.
                </p>

            </div>
        `;

        container.innerHTML = html;

        return;
    }

    assignments.forEach(assignment => {

        html += `

            <div class="assignment-card">

                <label class="assignment-check">

                    <input
                        type="checkbox"
                        ${assignment.completed ? "checked" : ""}
                        onchange="toggleAssignment(${assignment.id})"
                    >

                </label>

                <div class="assignment-info">

                    <strong>
                        ${escapeHTML(assignment.title)}
                    </strong>

                    <span>
                        ${escapeHTML(assignment.subject)}
                    </span>

                </div>

                <div class="assignment-date">

                    ${formatDate(assignment.due)}

                </div>

                <div class="priority">

                    ${escapeHTML(assignment.priority)}

                </div>

            </div>
        `;
    });

    container.innerHTML = html;
}


/* =========================================================
   ADD ASSIGNMENT
   ========================================================= */

function addAssignment() {

    openModal(`

        <h2>Add assignment</h2>

        <label>
            Assignment name

            <input
                type="text"
                id="assignmentTitle"
                placeholder="e.g. Algebra homework"
            >
        </label>

        <label>
            Subject

            <input
                type="text"
                id="assignmentSubject"
                placeholder="e.g. Maths"
            >
        </label>

        <label>
            Due date

            <input
                type="date"
                id="assignmentDue"
            >
        </label>

        <label>
            Importance

            <select id="assignmentPriority">

                <option value="Low">
                    Low
                </option>

                <option value="Medium" selected>
                    Medium
                </option>

                <option value="High">
                    High
                </option>

                <option value="Urgent">
                    Urgent
                </option>

            </select>
        </label>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="saveAssignment()"
            >
                Add assignment
            </button>

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

        </div>
    `);
}


function saveAssignment() {

    const title =
        document
            .getElementById("assignmentTitle")
            ?.value.trim();

    const subject =
        document
            .getElementById("assignmentSubject")
            ?.value.trim();

    const due =
        document
            .getElementById("assignmentDue")
            ?.value;

    const priority =
        document
            .getElementById("assignmentPriority")
            ?.value;

    if (!title) {

        alert("Please enter an assignment name.");

        return;
    }

    if (!subject) {

        alert("Please enter a subject.");

        return;
    }

    if (!due) {

        alert("Please choose a due date.");

        return;
    }

    const assignments =
        getAssignments();

    assignments.push({

        id: Date.now(),

        title,

        subject,

        due,

        priority: priority || "Medium",

        completed: false
    });

    saveAssignments(assignments);

    closeModal();

    renderAssignments();
    renderDeadlines();
}


/* =========================================================
   TOGGLE ASSIGNMENT
   ========================================================= */

function toggleAssignment(id) {

    const assignments =
        getAssignments();

    const assignment =
        assignments.find(
            item => item.id === id
        );

    if (!assignment) return;

    assignment.completed =
        !assignment.completed;

    saveAssignments(assignments);

    renderAssignments();
    renderDeadlines();
}


/* =========================================================
   DEADLINES
   ========================================================= */

function renderDeadlines() {

    const container =
        document.getElementById("deadlineList");

    if (!container) return;

    const assignments =
        getAssignments();

    const active =
        assignments
            .filter(item => !item.completed)
            .sort(
                (a, b) =>
                    new Date(a.due) -
                    new Date(b.due)
            )
            .slice(0, 3);

    if (!active.length) {

        container.innerHTML = `
            <div class="empty-state">
                No upcoming deadlines 🎉
            </div>
        `;

        return;
    }

    container.innerHTML =
        active.map(item => `

            <div class="assignment-row">

                <div class="assignment-info">

                    <strong>
                        ${escapeHTML(item.title)}
                    </strong>

                    <span>
                        ${escapeHTML(item.subject)}
                    </span>

                </div>

                <div class="assignment-date">
                    ${formatDate(item.due)}
                </div>

            </div>

        `).join("");
}


/* =========================================================
   PEERS
   ========================================================= */

function getPeers() {

    return getUsers().map(user => ({
        ...user,
        tags: user.tags || []
    }));
}


function renderRecommendedPeers() {

    const container =
        document.getElementById("recommendedPeers");

    if (!container) return;

    const currentUser =
        getCurrentUser();

    const peers =
        getPeers()
            .filter(
                peer => peer.id !== currentUser?.id
            )
            .slice(0, 3);

    if (!peers.length) {

        container.innerHTML =
            `<div class="empty-state">No peers available yet.</div>`;

        return;
    }

    container.innerHTML =
        peers.map(peer => peerCard(peer)).join("");
}


function searchPeers() {

    const input =
        document.getElementById("peerSearch");

    const search =
        input?.value.trim().toLowerCase() || "";

    const currentUser =
        getCurrentUser();

    const peers =
        getPeers().filter(peer => {

            if (peer.id === currentUser?.id) {
                return false;
            }

            return (
                peer.name.toLowerCase().includes(search) ||
                peer.tags.some(
                    tag =>
                        tag.toLowerCase().includes(search)
                )
            );
        });

    const container =
        document.getElementById("recommendedPeers");

    if (container) {

        container.innerHTML =
            peers.map(peer => peerCard(peer)).join("");
    }
}


function searchMainPeers() {

    const search =
        document
            .getElementById("mainPeerSearch")
            ?.value
            .trim()
            .toLowerCase() || "";

    const subject =
        document
            .getElementById("subjectFilter")
            ?.value || "";

    const year =
        document
            .getElementById("yearFilter")
            ?.value || "";

    const availability =
        document
            .getElementById("availabilityFilter")
            ?.value || "";

    const onlineOnly =
        document
            .getElementById("onlineFilter")
            ?.checked;

    const currentUser =
        getCurrentUser();

    let peers =
        getPeers().filter(
            peer => peer.id !== currentUser?.id
        );

    peers =
        peers.filter(peer => {

            const searchMatch =
                !search ||
                peer.name
                    .toLowerCase()
                    .includes(search) ||
                peer.tags.some(
                    tag =>
                        tag
                            .toLowerCase()
                            .includes(search)
                );

            const subjectMatch =
                !subject ||
                peer.tags.includes(subject);

            const yearMatch =
                !year ||
                peer.year === year;

            const availabilityMatch =
                !availability ||
                (
                    availability === "available" &&
                    peer.available
                );

            const onlineMatch =
                !onlineOnly ||
                peer.online;

            return (
                searchMatch &&
                subjectMatch &&
                yearMatch &&
                availabilityMatch &&
                onlineMatch
            );
        });

    const container =
        document.getElementById("searchResults");

    if (!container) return;

    if (!peers.length) {

        container.innerHTML = `
            <div class="empty-state">

                <h3>No peers found</h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        peers.map(peer => peerCard(peer)).join("");
}


function renderPeers() {
    searchMainPeers();
}


function peerCard(peer) {

    const initials =
        peer.name
            .split(" ")
            .map(part => part[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

    return `

        <div class="peer-card">

            <div class="peer-card-top">

                <div class="avatar-small">
                    ${escapeHTML(initials)}
                </div>

                <div>
                    <strong>
                        ${escapeHTML(peer.name)}
                    </strong>

                    <span>
                        ${escapeHTML(peer.year)}
                    </span>
                </div>

                <div class="online-indicator">
                    ${peer.online ? "Online" : "Offline"}
                </div>

            </div>

            <div class="subject-tags">

                ${
                    peer.tags.length
                    ? peer.tags.map(tag =>
                        `<span class="subject-tag">
                            ${escapeHTML(tag)}
                        </span>`
                    ).join("")
                    : `<span class="subject-tag">
                        New member
                    </span>`
                }

            </div>

            <div class="peer-card-bottom">

                <button
                    class="secondary-button"
                    onclick="viewPeer('${peer.id}')"
                >
                    View profile
                </button>

                <button
                    class="primary-button"
                    onclick="bookPeer('${peer.id}')"
                >
                    Book
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   PEER PROFILE
   ========================================================= */

function viewPeer(id) {

    const peer =
        getPeers().find(
            user => user.id === id
        );

    if (!peer) return;

    openModal(`

        <div class="peer-profile-modal">

            <div class="avatar-small">

                ${escapeHTML(
                    peer.name
                        .split(" ")
                        .map(x => x[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                )}

            </div>

            <h2>
                ${escapeHTML(peer.name)}
            </h2>

            <p>
                ${escapeHTML(peer.year)}
            </p>

            <div class="subject-tags">

                ${peer.tags.map(tag =>
                    `<span class="subject-tag">
                        ${escapeHTML(tag)}
                    </span>`
                ).join("")}

            </div>

            <p>
                ${escapeHTML(
                    peer.preferences ||
                    "This peer hasn't added a bio yet."
                )}
            </p>

            <div class="modal-actions">

                <button
                    class="primary-button"
                    onclick="closeModal(); bookPeer('${peer.id}')"
                >
                    Book a session
                </button>

                <button
                    class="secondary-button"
                    onclick="closeModal()"
                >
                    Close
                </button>

            </div>

        </div>
    `);
}


function bookPeer(id) {

    const peer =
        getPeers().find(
            user => user.id === id
        );

    if (!peer) return;

    openModal(`

        <h2>
            Book ${escapeHTML(peer.name)}
        </h2>

        <p>
            Choose a time for your peer-help session.
        </p>

        <label>
            Date

            <input
                type="date"
                id="bookingDate"
            >
        </label>

        <label>
            Time

            <input
                type="time"
                id="bookingTime"
            >
        </label>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="confirmBooking('${peer.id}')"
            >
                Confirm booking
            </button>

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

        </div>
    `);
}


function confirmBooking(peerId) {

    const peer =
        getPeers().find(
            user => user.id === peerId
        );

    const date =
        document.getElementById("bookingDate")?.value;

    const time =
        document.getElementById("bookingTime")?.value;

    if (!peer || !date || !time) {

        alert("Please choose a date and time.");

        return;
    }

    closeModal();

    alert(
        `Your session with ${peer.name} is booked for ${formatDate(date)} at ${time}.`
    );

    const user = getCurrentUser();

    if (user) {

        user.points =
            (user.points || 0) + 10;

        updateCurrentUser(user);

        updateHomeStats();
        updateProgress();
    }
}


/* =========================================================
   PROFILE
   ========================================================= */

function updateProfile() {

    const user = getCurrentUser();

    if (!user) return;

    const name =
        document.getElementById("profileName");

    const year =
        document.getElementById("profileYear");

    const tags =
        document.getElementById("profileTags");

    const preferences =
        document.getElementById("profilePreferences");

    if (name) {
        name.textContent = user.name;
    }

    if (year) {
        year.textContent = user.year;
    }

    if (tags) {

        tags.innerHTML =
            (user.tags || [])
                .map(tag =>
                    `<span class="subject-tag">
                        ${escapeHTML(tag)}
                    </span>`
                )
                .join("");
    }

    if (preferences) {

        preferences.textContent =
            user.preferences ||
            "Add your study preferences here.";
    }
}


function editProfile() {

    const user = getCurrentUser();

    if (!user) return;

    openModal(`

        <h2>Edit profile</h2>

        <label>
            Name

            <input
                id="editName"
                value="${escapeAttribute(user.name)}"
            >
        </label>

        <label>
            Subjects

            <input
                id="editTags"
                value="${escapeAttribute(
                    (user.tags || []).join(", ")
                )}"
            >
        </label>

        <label>
            Preferences

            <textarea id="editPreferences">${escapeHTML(
                user.preferences || ""
            )}</textarea>
        </label>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="saveProfileChanges()"
            >
                Save changes
            </button>

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

        </div>
    `);
}


function saveProfileChanges() {

    const user = getCurrentUser();

    if (!user) return;

    const name =
        document.getElementById("editName")
            ?.value
            .trim();

    const tags =
        document.getElementById("editTags")
            ?.value
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean);

    const preferences =
        document.getElementById("editPreferences")
            ?.value
            .trim();

    if (name) {
        user.name = name;
    }

    user.tags = tags || [];
    user.preferences = preferences || "";

    updateCurrentUser(user);

    loadUserIntoSite();

    closeModal();
}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress() {

    const user = getCurrentUser();

    if (!user) return;

    const points =
        document.getElementById("progressPoints");

    const helped =
        document.getElementById("progressHelped");

    const sessions =
        document.getElementById("progressSessions");

    const badges =
        document.getElementById("progressBadges");

    if (points) {
        points.textContent = user.points || 0;
    }

    if (helped) {
        helped.textContent = user.helped || 0;
    }

    if (sessions) {
        sessions.textContent = user.sessions || 0;
    }

    if (badges) {
        badges.textContent =
            (user.badges || []).length;
    }

    drawProgressChart();
}


function drawProgressChart() {

    const canvas =
        document.getElementById("progressChart");

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    const width =
        canvas.width =
            canvas.offsetWidth || 500;

    const height =
        canvas.height =
            canvas.offsetHeight || 220;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    const user =
        getCurrentUser();

    const points =
        user?.points || 0;

    const values = [
        0,
        Math.round(points * 0.15),
        Math.round(points * 0.32),
        Math.round(points * 0.48),
        Math.round(points * 0.7),
        points
    ];

    const max =
        Math.max(...values, 100);

    const padding = 30;

    ctx.beginPath();

    values.forEach((value, index) => {

        const x =
            padding +
            index *
            ((width - padding * 2) /
            (values.length - 1));

        const y =
            height -
            padding -
            (value / max) *
            (height - padding * 2);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#b79a62";
    ctx.stroke();
}


/* =========================================================
   POMODORO
   ========================================================= */

let pomodoroMode = "focus";
let pomodoroSeconds = 25 * 60;
let pomodoroTimer = null;
let pomodoroRunning = false;

const pomodoroLengths = {
    focus: 25,
    short: 5,
    long: 15
};


function setPomodoroMode(mode) {

    if (!pomodoroLengths[mode]) return;

    pomodoroMode = mode;

    clearInterval(pomodoroTimer);

    pomodoroRunning = false;

    pomodoroSeconds =
        pomodoroLengths[mode] * 60;

    updatePomodoroDisplay();
    updatePomodoroButtons();
    updatePomodoroButtonText();
}


function updatePomodoroDisplay() {

    const display =
        document.getElementById("pomodoroTime");

    const status =
        document.getElementById("pomodoroStatus");

    if (display) {

        const minutes =
            Math.floor(pomodoroSeconds / 60);

        const seconds =
            pomodoroSeconds % 60;

        display.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    if (status && pomodoroRunning) {
        status.textContent = "Stay focused.";
    }

    if (status && !pomodoroRunning) {
        status.textContent = "Ready when you are.";
    }
}


function updatePomodoroButtons() {

    const buttons = [

        document.getElementById("focusModeButton"),
        document.getElementById("shortBreakButton"),
        document.getElementById("longBreakButton")

    ];

    buttons.forEach(button => {

        if (button) {
            button.classList.remove("active");
        }
    });

    if (
        pomodoroMode === "focus" &&
        buttons[0]
    ) {
        buttons[0].classList.add("active");
    }

    if (
        pomodoroMode === "short" &&
        buttons[1]
    ) {
        buttons[1].classList.add("active");
    }

    if (
        pomodoroMode === "long" &&
        buttons[2]
    ) {
        buttons[2].classList.add("active");
    }
}


function togglePomodoro() {

    if (pomodoroRunning) {

        clearInterval(pomodoroTimer);

        pomodoroRunning = false;

        updatePomodoroDisplay();
        updatePomodoroButtonText();

        return;
    }

    pomodoroRunning = true;

    updatePomodoroDisplay();
    updatePomodoroButtonText();

    pomodoroTimer =
        setInterval(() => {

            pomodoroSeconds--;

            updatePomodoroDisplay();

            if (pomodoroSeconds <= 0) {

                clearInterval(pomodoroTimer);

                pomodoroRunning = false;

                completePomodoro();
            }

        }, 1000);
}


function updatePomodoroButtonText() {

    const button =
        document.getElementById(
            "pomodoroStartButton"
        );

    if (!button) return;

    button.textContent =
        pomodoroRunning
            ? "Pause"
            : "Start";
}


function resetPomodoro() {

    clearInterval(pomodoroTimer);

    pomodoroRunning = false;

    pomodoroSeconds =
        pomodoroLengths[pomodoroMode] * 60;

    updatePomodoroDisplay();
    updatePomodoroButtonText();
}


function skipPomodoro() {

    clearInterval(pomodoroTimer);

    pomodoroRunning = false;

    if (pomodoroMode === "focus") {
        setPomodoroMode("short");
    } else {
        setPomodoroMode("focus");
    }
}


function completePomodoro() {

    const user =
        getCurrentUser();

    if (
        pomodoroMode === "focus" &&
        user
    ) {

        user.sessions =
            (user.sessions || 0) + 1;

        user.points =
            (user.points || 0) + 10;

        updateCurrentUser(user);

        updateProgress();
        updateHomeStats();
        updateStudyStats();
    }

    const status =
        document.getElementById(
            "pomodoroStatus"
        );

    if (status) {
        status.textContent =
            "Session complete! 🌿";
    }

    updatePomodoroButtonText();
}


function changePomodoroTime() {

    if (pomodoroRunning) return;

    const current =
        Math.round(
            pomodoroSeconds / 60
        );

    const answer =
        prompt(
            "How many minutes should the timer be?",
            current
        );

    if (answer === null) return;

    const minutes =
        Number(answer);

    if (
        !Number.isFinite(minutes) ||
        minutes <= 0 ||
        minutes > 180
    ) {

        alert(
            "Please enter a number between 1 and 180."
        );

        return;
    }

    pomodoroSeconds =
        Math.round(minutes * 60);

    updatePomodoroDisplay();
}


function updateStudyStats() {

    const user =
        getCurrentUser();

    if (!user) return;

    const sessions =
        document.getElementById(
            "studySessionsToday"
        );

    const minutes =
        document.getElementById(
            "studyMinutesToday"
        );

    const streak =
        document.getElementById(
            "studyStreak"
        );

    if (sessions) {
        sessions.textContent =
            user.sessions || 0;
    }

    if (minutes) {
        minutes.textContent =
            (user.sessions || 0) * 25;
    }

    if (streak) {
        streak.textContent =
            user.sessions > 0
                ? "1"
                : "0";
    }
}


/* =========================================================
   RESOURCES
   ========================================================= */

function resourceNotice(resourceName) {

    openModal(`

        <h2>
            ${escapeHTML(resourceName)}
        </h2>

        <p>
            This resource section is ready to be
            connected to your school study materials.
        </p>

        <button
            class="primary-button"
            onclick="closeModal()"
        >
            Close
        </button>

    `);
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function showNotifications() {

    openModal(`

        <h2>Notifications</h2>

        <p>
            🌿 Welcome to St Oran's Peer Hub.
        </p>

        <p>
            📚 Check your upcoming assignments.
        </p>

        <p>
            🐉 Roro is ready for a study session.
        </p>

        <button
            class="primary-button"
            onclick="closeModal()"
        >
            Done
        </button>

    `);
}


/* =========================================================
   RORO
   ========================================================= */

const roroMessages = [
    "You've got this! 🐉",
    "Tiny steps still count.",
    "Time to focus?",
    "Your future self says thanks.",
    "I believe in you. Probably more than your textbook does.",
    "Study break? Sensible. Staring at the screen for three hours isn't studying."
];


function roroInteract() {

    const speech =
        document.getElementById(
            "roroSpeech"
        );

    if (!speech) return;

    const message =
        roroMessages[
            Math.floor(
                Math.random() *
                roroMessages.length
            )
        ];

    speech.textContent = message;

    speech.classList.add("show");

    setTimeout(() => {

        speech.classList.remove("show");

    }, 4000);
}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(content) {

    const modal =
        document.getElementById("modal");

    const modalContent =
        document.getElementById("modalContent");

    if (!modal || !modalContent) return;

    modalContent.innerHTML = content;

    modal.style.display = "flex";
}


function closeModal() {

    const modal =
        document.getElementById("modal");

    if (modal) {
        modal.style.display = "none";
    }
}


/* =========================================================
   SIGN OUT
   ========================================================= */

function signOut() {

    clearInterval(pomodoroTimer);

    pomodoroRunning = false;

    removeCurrentUser();

    document.getElementById("mainApp").style.display = "none";
    document.getElementById("signupScreen").style.display = "none";
    document.getElementById("loginScreen").style.display = "flex";

    const form =
        document.getElementById("loginForm");

    if (form) {
        form.reset();
    }
}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

function forgotPassword(event) {

    if (event) event.preventDefault();

    const email =
        prompt("Enter your St Oran's email:");

    if (!email) return;

    const user =
        getUsers().find(
            user =>
                user.email.toLowerCase() ===
                email.trim().toLowerCase()
        );

    if (!user) {

        alert(
            "No account was found with that email."
        );

        return;
    }

    alert(
        "This prototype cannot send real password-reset emails yet."
    );
}


/* =========================================================
   UTILITIES
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) return "";

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-NZ",
        {
            day: "numeric",
            month: "short"
        }
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return escapeHTML(value);
}


/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createDemoAccounts();

        const loginForm =
            document.getElementById("loginForm");

        if (loginForm) {
            loginForm.addEventListener(
                "submit",
                loginUser
            );
        }

        const signupForm =
            document.getElementById("signupForm");

        if (signupForm) {
            signupForm.addEventListener(
                "submit",
                signupUser
            );
        }

        /* SIDEBAR */

        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                item.addEventListener(
                    "click",
                    () => {

                        const page =
                            item.dataset.page;

                        if (page) {
                            showPage(page);
                        }
                    }
                );
            });

        /* POMODORO */

        const timer =
            document.getElementById(
                "pomodoroTime"
            );

        if (timer) {

            timer.addEventListener(
                "click",
                changePomodoroTime
            );

            timer.style.cursor = "pointer";
        }

        /* MODAL */

        const modal =
            document.getElementById("modal");

        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {
                        closeModal();
                    }

                }
            );
        }

        /* START AT LOGIN */

        const loginScreen =
            document.getElementById(
                "loginScreen"
            );

        const signupScreen =
            document.getElementById(
                "signupScreen"
            );

        const mainApp =
            document.getElementById(
                "mainApp"
            );

        if (loginScreen) {
            loginScreen.style.display =
                "flex";
        }

        if (signupScreen) {
            signupScreen.style.display =
                "none";
        }

        if (mainApp) {
            mainApp.style.display =
                "none";
        }

        setPomodoroMode("focus");

        document.addEventListener(
            "keydown",
            event => {

                if (event.key === "Escape") {
                    closeModal();
                }

            }
        );
    }
);
