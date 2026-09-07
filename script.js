/* =========================================================
   ST ORAN'S PEER HUB
   MAIN JAVASCRIPT
   ========================================================= */

/* =========================================================
   STORAGE
   ========================================================= */

const USERS_KEY = "stOransPeerHubUsers";
const CURRENT_USER_KEY = "stOransCurrentUser";
const EVENTS_KEY = "stOransCalendarEvents";
const POMODORO_KEY = "stOransPomodoroData";


function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
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

    const demoAccounts = [
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

    demoAccounts.forEach(demo => {

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

    const index = users.findIndex(user => user.id === updatedUser.id);

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

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const error = document.getElementById("loginError");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    const users = getUsers();

    const user = users.find(
        u =>
            u.email.toLowerCase() === email &&
            u.password === password
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

    /*
       This is a DEMO Google button.

       A real Google login needs Google OAuth and a backend.
       This version gives the button useful prototype behaviour
       without pretending that static JavaScript can magically
       authenticate with Google.
    */

    const users = getUsers();

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

    const loginScreen = document.getElementById("loginScreen");
    const signupScreen = document.getElementById("signupScreen");
    const mainApp = document.getElementById("mainApp");

    if (loginScreen) loginScreen.style.display = "none";
    if (mainApp) mainApp.style.display = "none";

    if (signupScreen) {
        signupScreen.style.display = "flex";
    }
}


function showLogin(event) {

    if (event) event.preventDefault();

    const loginScreen = document.getElementById("loginScreen");
    const signupScreen = document.getElementById("signupScreen");
    const mainApp = document.getElementById("mainApp");

    if (signupScreen) signupScreen.style.display = "none";
    if (mainApp) mainApp.style.display = "none";

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }
}


function signupUser(event) {

    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const year = document.getElementById("signupYear").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;

    const error = document.getElementById("signupError");

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

    const alreadyExists = users.some(
        user => user.email.toLowerCase() === email
    );

    if (alreadyExists) {
        showError("An account with this email already exists.");
        return;
    }

    /*
       IMPORTANT:
       New accounts start with ZERO progress.
    */

    const newUser = {
        id: "user-" + Date.now(),
        name: name,
        email: email,
        password: password,
        year: year,
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

    if (error) {
        error.textContent = "";
        error.style.display = "none";
    }

    openMainApp();
}


/* =========================================================
   APP DISPLAY
   ========================================================= */

function openMainApp() {

    const loginScreen = document.getElementById("loginScreen");
    const signupScreen = document.getElementById("signupScreen");
    const mainApp = document.getElementById("mainApp");

    if (loginScreen) loginScreen.style.display = "none";
    if (signupScreen) signupScreen.style.display = "none";

    if (mainApp) {
        mainApp.style.display = "flex";
    }

    loadUserIntoSite();

    showPage("home");
}


/* =========================================================
   USER INFORMATION
   ========================================================= */

function loadUserIntoSite() {

    const user = getCurrentUser();

    if (!user) return;

    const welcomeName = document.getElementById("welcomeName");
    const greeting = document.getElementById("greeting");

    const topName = document.getElementById("topName");
    const topYear = document.getElementById("topYear");

    const profileName = document.getElementById("profileName");
    const profileYear = document.getElementById("profileYear");

    const settingsEmail = document.getElementById("settingsEmail");

    if (welcomeName) {
        welcomeName.textContent = user.name.split(" ")[0];
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
   GREETING / DATE
   ========================================================= */

function updateGreeting() {

    const greeting = document.getElementById("greeting");
    const todayLabel = document.getElementById("todayLabel");

    const now = new Date();
    const hour = now.getHours();

    let text = "Good evening";

    if (hour < 12) {
        text = "Good morning";
    } else if (hour < 18) {
        text = "Good afternoon";
    }

    if (greeting) {
        greeting.textContent = text;
    }

    if (todayLabel) {

        todayLabel.textContent = now.toLocaleDateString(
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
   NAVIGATION
   ========================================================= */

function showPage(pageName) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageName);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    /*
       Some versions of the HTML use page IDs with "Page".
       This fallback keeps navigation flexible without
       changing the HTML.
    */

    if (!selectedPage) {

        const alternative = document.getElementById(
            pageName + "Page"
        );

        if (alternative) {
            alternative.classList.add("active");
        }
    }

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.classList.remove("active");

        if (item.dataset.page === pageName) {
            item.classList.add("active");
        }
    });

    switch (pageName) {

        case "home":
            renderHome();
            break;

        case "calendar":
            renderCalendar();
            break;

        case "assignments":
            renderAssignments();
            break;

        case "peers":
            renderPeers();
            break;

        case "profile":
            updateProfile();
            break;

        case "progress":
            updateProgress();
            break;

        case "study":
            updateStudyStats();
            break;
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

    const quote = document.getElementById("homeQuote");

    if (quote) {

        const index =
            new Date().getDate() % quotes.length;

        quote.textContent = quotes[index];
    }

    updateHomeStats();
    renderMiniCalendar();
    renderDeadlines();
    renderRecommendedPeers();
}


function updateHomeStats() {

    const user = getCurrentUser();

    if (!user) return;

    const points = document.getElementById("homePoints");
    const helped = document.getElementById("homeHelped");
    const progressFill = document.getElementById("homeProgressFill");
    const progressCaption = document.getElementById("homeProgressCaption");

    if (points) {
        points.textContent = user.points || 0;
    }

    if (helped) {
        helped.textContent = user.helped || 0;
    }

    const percentage = Math.min(
        100,
        Math.round((user.points || 0) / 500 * 100)
    );

    if (progressFill) {
        progressFill.style.width = percentage + "%";
    }

    if (progressCaption) {
        progressCaption.textContent =
            `${user.points || 0} / 500 points`;
    }
}


/* =========================================================
   MINI CALENDAR
   ========================================================= */

function renderMiniCalendar() {

    const container = document.getElementById("miniCalendar");
    const title = document.getElementById("monthTitle");

    if (!container) return;

    const now = new Date();

    if (title) {
        title.textContent = now.toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        );
    }

    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    let html = "";

    const weekdays = [
        "S", "M", "T", "W", "T", "F", "S"
    ];

    weekdays.forEach(day => {
        html += `<div class="calendar-weekday">${day}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {

        const isToday = day === now.getDate();

        html += `
            <div class="calendar-day ${isToday ? "today" : ""}">
                ${day}
            </div>
        `;
    }

    container.innerHTML = html;
}


/* =========================================================
   FULL CALENDAR
   ========================================================= */

let calendarDate = new Date();


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


function renderCalendar() {

    const container =
        document.getElementById("fullCalendar");

    const title =
        document.getElementById("fullMonthTitle");

    if (!container) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

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

    const events = getEvents();

    let html = `
        <div class="calendar-header-row">
            <button onclick="changeCalendarMonth(-1)">‹</button>
            <button onclick="changeCalendarMonth(1)">›</button>
        </div>

        <div class="calendar-grid">
    `;

    const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    weekdays.forEach(day => {
        html += `
            <div class="calendar-weekday">
                ${day.substring(0, 3)}
            </div>
        `;
    });

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-cell empty"></div>`;
    }

    for (let day = 1; day <= days; day++) {

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayEvents =
            events.filter(event => event.date === dateString);

        const today = new Date();

        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

        html += `
            <div class="calendar-cell ${isToday ? "today" : ""}"
                 onclick="addCalendarEvent('${dateString}')">

                <div class="calendar-number">
                    ${day}
                </div>

                <div class="calendar-events">
        `;

        dayEvents.forEach(event => {

            html += `
                <div class="calendar-event">
                    ${escapeHTML(event.title)}
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

        <button class="primary-button calendar-add-button"
                onclick="addCalendarEvent()">
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


function addCalendarEvent(selectedDate) {

    const title = prompt(
        "What is the event called?"
    );

    if (!title || !title.trim()) return;

    let date = selectedDate;

    if (!date) {

        const input = prompt(
            "Enter the date (YYYY-MM-DD):"
        );

        if (!input) return;

        date = input.trim();
    }

    const events = getEvents();

    events.push({
        id: Date.now(),
        title: title.trim(),
        date: date
    });

    saveEvents(events);

    renderCalendar();
    renderMiniCalendar();
    renderDeadlines();
}


/* =========================================================
   DEADLINES
   ========================================================= */

const assignments = [
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


function renderDeadlines() {

    const container =
        document.getElementById("deadlineList");

    if (!container) return;

    const active =
        assignments.filter(item => !item.completed)
        .slice(0, 3);

    if (!active.length) {

        container.innerHTML =
            `<div class="empty-state">No upcoming deadlines 🎉</div>`;

        return;
    }

    container.innerHTML =
        active.map(item => `
            <div class="assignment-row">

                <div class="assignment-info">
                    <strong>${escapeHTML(item.title)}</strong>
                    <span>${escapeHTML(item.subject)}</span>
                </div>

                <div class="assignment-date">
                    ${formatDate(item.due)}
                </div>

            </div>
        `).join("");
}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignments() {

    const container =
        document.getElementById("assignmentPageList");

    if (!container) return;

    container.innerHTML =
        assignments.map(item => `
            <div class="assignment-card">

                <label class="assignment-check">
                    <input
                        type="checkbox"
                        ${item.completed ? "checked" : ""}
                        onchange="toggleAssignment(${item.id})"
                    >
                </label>

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

                <div class="priority">
                    ${escapeHTML(item.priority)}
                </div>

            </div>
        `).join("");
}


function toggleAssignment(id) {

    const assignment =
        assignments.find(item => item.id === id);

    if (!assignment) return;

    assignment.completed =
        !assignment.completed;

    renderAssignments();
    renderDeadlines();
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

    const peers =
        getPeers()
            .filter(user => user.id !== getCurrentUser()?.id)
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
        input ? input.value.trim().toLowerCase() : "";

    const peers =
        getPeers().filter(peer => {

            if (peer.id === getCurrentUser()?.id) {
                return false;
            }

            return (
                peer.name.toLowerCase().includes(search) ||
                peer.tags.some(tag =>
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

    const input =
        document.getElementById("mainPeerSearch");

    const subject =
        document.getElementById("subjectFilter")?.value || "";

    const year =
        document.getElementById("yearFilter")?.value || "";

    const availability =
        document.getElementById("availabilityFilter")?.value || "";

    const onlineOnly =
        document.getElementById("onlineFilter")?.checked;

    const search =
        input ? input.value.trim().toLowerCase() : "";

    let peers = getPeers();

    peers = peers.filter(peer => {

        if (peer.id === getCurrentUser()?.id) {
            return false;
        }

        const matchesSearch =
            !search ||
            peer.name.toLowerCase().includes(search) ||
            peer.tags.some(tag =>
                tag.toLowerCase().includes(search)
            );

        const matchesSubject =
            !subject ||
            peer.tags.includes(subject);

        const matchesYear =
            !year ||
            peer.year === year;

        const matchesAvailability =
            !availability ||
            (availability === "available" && peer.available);

        const matchesOnline =
            !onlineOnly || peer.online;

        return (
            matchesSearch &&
            matchesSubject &&
            matchesYear &&
            matchesAvailability &&
            matchesOnline
        );
    });

    const container =
        document.getElementById("searchResults");

    if (!container) return;

    if (!peers.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No peers found</h3>
                <p>Try changing your search or filters.</p>
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
                    <strong>${escapeHTML(peer.name)}</strong>
                    <span>${escapeHTML(peer.year)}</span>
                </div>

                <div class="online-indicator">
                    ${peer.online ? "Online" : "Offline"}
                </div>

            </div>

            <div class="subject-tags">

                ${peer.tags.length
                    ? peer.tags.map(tag =>
                        `<span class="subject-tag">${escapeHTML(tag)}</span>`
                      ).join("")
                    : `<span class="subject-tag">New member</span>`
                }

            </div>

            <div class="peer-card-bottom">

                <button
                    class="secondary-button"
                    onclick="viewPeer('${peer.id}')">
                    View profile
                </button>

                <button
                    class="primary-button"
                    onclick="bookPeer('${peer.id}')">
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
        getPeers().find(user => user.id === id);

    if (!peer) return;

    /*
       IMPORTANT:
       This ONLY opens the profile.
       It does NOT book the peer.
    */

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

            <h2>${escapeHTML(peer.name)}</h2>

            <p>${escapeHTML(peer.year)}</p>

            <div class="subject-tags">
                ${peer.tags.map(tag =>
                    `<span class="subject-tag">${escapeHTML(tag)}</span>`
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
                    onclick="closeModal(); bookPeer('${peer.id}')">
                    Book a session
                </button>

                <button
                    class="secondary-button"
                    onclick="closeModal()">
                    Close
                </button>

            </div>

        </div>
    `);
}


function bookPeer(id) {

    const peer =
        getPeers().find(user => user.id === id);

    if (!peer) return;

    openModal(`
        <h2>Book ${escapeHTML(peer.name)}</h2>

        <p>
            Choose a time for your peer-help session.
        </p>

        <label>
            Date
            <input type="date" id="bookingDate">
        </label>

        <label>
            Time
            <input type="time" id="bookingTime">
        </label>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="confirmBooking('${peer.id}')">
                Confirm booking
            </button>

            <button
                class="secondary-button"
                onclick="closeModal()">
                Cancel
            </button>

        </div>
    `);
}


function confirmBooking(peerId) {

    const peer =
        getPeers().find(user => user.id === peerId);

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
            (user.tags || []).map(tag =>
                `<span class="subject-tag">${escapeHTML(tag)}</span>`
            ).join("");
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
            <input id="editName"
                   value="${escapeAttribute(user.name)}">
        </label>

        <label>
            Subjects
            <input id="editTags"
                   value="${escapeAttribute(
                       (user.tags || []).join(", ")
                   )}">
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
                onclick="saveProfileChanges()">
                Save changes
            </button>

            <button
                class="secondary-button"
                onclick="closeModal()">
                Cancel
            </button>

        </div>
    `);
}


function saveProfileChanges() {

    const user = getCurrentUser();

    if (!user) return;

    const name =
        document.getElementById("editName")?.value.trim();

    const tags =
        document.getElementById("editTags")?.value
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean);

    const preferences =
        document.getElementById("editPreferences")?.value.trim();

    if (name) user.name = name;

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
        canvas.width = canvas.offsetWidth || 500;

    const height =
        canvas.height = canvas.offsetHeight || 220;

    ctx.clearRect(0, 0, width, height);

    const user = getCurrentUser();

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
   STUDY / POMODORO
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

    if (status) {

        if (pomodoroRunning) {
            status.textContent = "Stay focused.";
        } else {
            status.textContent = "Ready when you are.";
        }
    }
}


function updatePomodoroButtons() {

    const focus =
        document.getElementById("focusModeButton");

    const short =
        document.getElementById("shortBreakButton");

    const long =
        document.getElementById("longBreakButton");

    [focus, short, long].forEach(button => {

        if (button) {
            button.classList.remove("active");
        }
    });

    if (pomodoroMode === "focus" && focus) {
        focus.classList.add("active");
    }

    if (pomodoroMode === "short" && short) {
        short.classList.add("active");
    }

    if (pomodoroMode === "long" && long) {
        long.classList.add("active");
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
        document.getElementById("pomodoroStartButton");

    if (!button) return;

    button.textContent =
        pomodoroRunning ? "Pause" : "Start";
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

    const user = getCurrentUser();

    if (pomodoroMode === "focus" && user) {

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
        document.getElementById("pomodoroStatus");

    if (status) {
        status.textContent =
            "Session complete! 🌿";
    }

    updatePomodoroButtonText();
}


function changePomodoroTime() {

    if (pomodoroRunning) return;

    const currentMinutes =
        Math.round(pomodoroSeconds / 60);

    const answer =
        prompt(
            "How many minutes should the timer be?",
            currentMinutes
        );

    if (answer === null) return;

    const minutes =
        Number(answer);

    if (
        !Number.isFinite(minutes) ||
        minutes <= 0 ||
        minutes > 180
    ) {
        alert("Please enter a number between 1 and 180.");
        return;
    }

    pomodoroSeconds =
        Math.round(minutes * 60);

    updatePomodoroDisplay();
}


/* =========================================================
   STUDY STATS
   ========================================================= */

function updateStudyStats() {

    const user = getCurrentUser();

    if (!user) return;

    const sessions =
        document.getElementById("studySessionsToday");

    const minutes =
        document.getElementById("studyMinutesToday");

    const streak =
        document.getElementById("studyStreak");

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
            user.sessions > 0 ? "1" : "0";
    }
}


/* =========================================================
   RESOURCES
   ========================================================= */

function resourceNotice(resourceName) {

    openModal(`
        <h2>${escapeHTML(resourceName)}</h2>

        <p>
            This resource section is ready to be connected
            to your school study materials.
        </p>

        <button
            class="primary-button"
            onclick="closeModal()">
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

        <div class="notification-list">

            <p>🌿 Welcome to St Oran's Peer Hub.</p>

            <p>📚 Check your upcoming assignments.</p>

            <p>🐉 Roro is ready for a study session.</p>

        </div>

        <button
            class="primary-button"
            onclick="closeModal()">
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
        document.getElementById("roroSpeech");

    if (!speech) return;

    const random =
        Math.floor(
            Math.random() * roroMessages.length
        );

    speech.textContent =
        roroMessages[random];

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

    const mainApp =
        document.getElementById("mainApp");

    const loginScreen =
        document.getElementById("loginScreen");

    const signupScreen =
        document.getElementById("signupScreen");

    if (mainApp) {
        mainApp.style.display = "none";
    }

    if (signupScreen) {
        signupScreen.style.display = "none";
    }

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {
        loginForm.reset();
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

    const users = getUsers();

    const user =
        users.find(
            u =>
                u.email.toLowerCase() ===
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
   UTILITY FUNCTIONS
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) return "";

    const date =
        new Date(dateString + "T00:00:00");

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
   EVENT LISTENERS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Create demo accounts first */
    createDemoAccounts();

    /* Login form */
    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener(
            "submit",
            loginUser
        );
    }

    /* Signup form */
    const signupForm =
        document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener(
            "submit",
            signupUser
        );
    }

    /* Sidebar navigation */
    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const page =
                item.dataset.page;

            if (page) {
                showPage(page);
            }
        });
    });

    /* Pomodoro timer */
    const pomodoroTime =
        document.getElementById("pomodoroTime");

    if (pomodoroTime) {

        pomodoroTime.addEventListener(
            "click",
            changePomodoroTime
        );

        pomodoroTime.style.cursor = "pointer";
    }

    /* Modal background */
    const modal =
        document.getElementById("modal");

    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {
                    closeModal();
                }

            }
        );
    }

    /*
       START AT LOGIN SCREEN.
       This stops the website from randomly opening
       straight into the dashboard.
    */

    const loginScreen =
        document.getElementById("loginScreen");

    const signupScreen =
        document.getElementById("signupScreen");

    const mainApp =
        document.getElementById("mainApp");

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }

    if (signupScreen) {
        signupScreen.style.display = "none";
    }

    if (mainApp) {
        mainApp.style.display = "none";
    }

    /* Initial timer */
    setPomodoroMode("focus");

    /* Close modal with Escape */
    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeModal();
            }

        }
    );

});
