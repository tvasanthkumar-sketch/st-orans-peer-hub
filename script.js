/* =========================================================
   ST ORAN'S PEER HUB
   Main JavaScript
   ========================================================= */

/* =========================
   STORAGE
========================= */

const STORAGE_KEY = "stOransPeerHubUsers";
const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";
const ASSIGNMENTS_KEY = "stOransPeerHubAssignments_";


/* =========================
   DEMO USERS
========================= */

const demoUsers = {
    "t.smith@storans.school.nz": {
        firstName: "Maya",
        lastName: "Smith",
        fullName: "Maya Smith",
        email: "t.smith@storans.school.nz",
        password: "maya123",
        year: "Year 8",
        className: "8XX",
        initials: "MS",
        points: 420,
        helped: 8,
        sessions: 12,
        badges: 4,
        studySessions: 18,
        studyMinutes: 540,
        streak: 6,
        bio: "I love helping people with maths and science!",
        subjects: ["Maths", "Science"],
        progressHistory: [
            { date: "2026-08-25", points: 280 },
            { date: "2026-08-27", points: 320 },
            { date: "2026-08-30", points: 360 },
            { date: "2026-09-02", points: 390 },
            { date: "2026-09-06", points: 420 }
        ]
    },

    "l.worthington@storans.school.nz": {
        firstName: "Lucy",
        lastName: "Worthington",
        fullName: "Lucy Worthington",
        email: "l.worthington@storans.school.nz",
        password: "lucy123",
        year: "Year 8",
        className: "8XX",
        initials: "LW",
        points: 310,
        helped: 5,
        sessions: 9,
        badges: 3,
        studySessions: 12,
        studyMinutes: 360,
        streak: 4,
        bio: "Always happy to help with English and art!",
        subjects: ["English", "Art"],
        progressHistory: [
            { date: "2026-08-25", points: 180 },
            { date: "2026-08-28", points: 220 },
            { date: "2026-09-01", points: 260 },
            { date: "2026-09-04", points: 290 },
            { date: "2026-09-06", points: 310 }
        ]
    }
};


/* =========================
   GLOBAL VARIABLES
========================= */

let currentUser = null;
let assignments = [];
let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60;
let pomodoroMode = "focus";
let studyRunning = false;


/* =========================
   ASSIGNMENTS
========================= */

const defaultAssignments = [
    {
        id: 1,
        subject: "Maths",
        title: "Algebra Practice",
        description: "Complete the algebra practice questions.",
        due: "2026-09-10",
        priority: "High",
        completed: false
    },
    {
        id: 2,
        subject: "Science",
        title: "Water Cycle Diagram",
        description: "Finish and label your water cycle diagram.",
        due: "2026-09-12",
        priority: "Medium",
        completed: false
    },
    {
        id: 3,
        subject: "English",
        title: "Heroes and Villains Speech",
        description: "Continue working on your speech.",
        due: "2026-09-15",
        priority: "Medium",
        completed: false
    }
];


function getStoredUsers() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            const users = { ...demoUsers };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
            return users;
        }

        const users = JSON.parse(saved);

        if (!users || typeof users !== "object") {
            return { ...demoUsers };
        }

        return users;

    } catch (error) {
        console.error("Could not load users:", error);
        return { ...demoUsers };
    }
}


function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}


/* =========================
   USER NORMALISATION
========================= */

function normaliseUsers() {
    const users = getStoredUsers();
    const fixedUsers = {};

    Object.values(users).forEach(user => {
        if (!user || !user.email) return;

        const email = user.email.trim().toLowerCase();

        fixedUsers[email] = {
            ...user,
            email,
            year: user.year || "Year 8",
            className: user.className || "8XX",
            initials:
                user.initials ||
                `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase(),
            points: Number(user.points) || 0,
            helped: Number(user.helped) || 0,
            sessions: Number(user.sessions) || 0,
            badges: Number(user.badges) || 0,
            studySessions: Number(user.studySessions) || 0,
            studyMinutes: Number(user.studyMinutes) || 0,
            streak: Number(user.streak) || 0,
            subjects: Array.isArray(user.subjects) ? user.subjects : [],
            progressHistory: Array.isArray(user.progressHistory)
                ? user.progressHistory
                : []
        };
    });

    saveUsers(fixedUsers);

    return fixedUsers;
}


/* =========================
   ASSIGNMENTS STORAGE
========================= */

function loadAssignments() {
    if (!currentUser) {
        return [];
    }

    const key = ASSIGNMENTS_KEY + currentUser.email;

    try {
        const saved = localStorage.getItem(key);

        if (saved) {
            return JSON.parse(saved);
        }

        return [...defaultAssignments];

    } catch (error) {
        console.error("Could not load assignments:", error);
        return [...defaultAssignments];
    }
}


function saveAssignments() {
    if (!currentUser) return;

    const key = ASSIGNMENTS_KEY + currentUser.email;

    localStorage.setItem(
        key,
        JSON.stringify(assignments)
    );
}


/* =========================
   DOM READY
========================= */

document.addEventListener("DOMContentLoaded", () => {

    setupLogin();
    setupSignup();
    setupNavigation();
    setupRoro();
    setupStudyTimer();

    updateDate();
    updateClock();

    setInterval(updateClock, 1000);

    restoreLogin();

});


/* =========================
   LOGIN
========================= */

function setupLogin() {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            login();
        });
    }

    const showSignup = document.getElementById("showSignup");

    if (showSignup) {
        showSignup.addEventListener("click", event => {
            event.preventDefault();
            showSignupScreen();
        });
    }

    const forgotPassword = document.getElementById("forgotPassword");

    if (forgotPassword) {
        forgotPassword.addEventListener("click", event => {
            event.preventDefault();
            forgotPasswordFunction();
        });
    }

    const googleLogin = document.getElementById("googleLogin");

    if (googleLogin) {
        googleLogin.addEventListener("click", () => {
            demoGoogleLogin();
        });
    }
}


function login() {

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const rememberInput = document.getElementById("rememberMe");
    const error = document.getElementById("loginError");

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    const users = normaliseUsers();

    const user = users[email];

    if (!user || user.password !== password) {

        if (error) {
            error.textContent = "Incorrect email or password.";
            error.classList.remove("hidden");
        }

        return;
    }

    if (error) {
        error.textContent = "";
        error.classList.add("hidden");
    }

    currentUser = { ...user };

    assignments = loadAssignments();

    saveUsers(users);

    if (rememberInput && rememberInput.checked) {
        localStorage.setItem(
            CURRENT_USER_KEY,
            currentUser.email
        );
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    showMainApp();

    resetLoginForm();
}


/* =========================
   RESTORE LOGIN
========================= */

function restoreLogin() {

    const savedEmail = localStorage.getItem(CURRENT_USER_KEY);

    if (!savedEmail) {
        showLoginScreen();
        return;
    }

    const users = normaliseUsers();
    const user = users[savedEmail.toLowerCase()];

    if (!user) {
        localStorage.removeItem(CURRENT_USER_KEY);
        showLoginScreen();
        return;
    }

    currentUser = { ...user };

    assignments = loadAssignments();

    showMainApp(true);
}


/* =========================
   SIGNUP
========================= */

function setupSignup() {

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", event => {
            event.preventDefault();
            signup();
        });
    }

    const backToLogin = document.getElementById("backToLogin");

    if (backToLogin) {
        backToLogin.addEventListener("click", event => {
            event.preventDefault();
            showLoginScreen();
        });
    }

    const closeSignup = document.getElementById("closeSignup");

    if (closeSignup) {
        closeSignup.addEventListener("click", () => {
            showLoginScreen();
        });
    }
}


function signup() {

    const firstNameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const yearInput = document.getElementById("signupYear");
    const error = document.getElementById("signupError");

    if (!firstNameInput || !emailInput || !passwordInput) {
        return;
    }

    const firstName = firstNameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const yearValue = yearInput ? yearInput.value : "Year 8";

    if (!firstName || !email || !password) {

        showSignupError(
            error,
            "Please fill in all required fields."
        );

        return;
    }

    if (password.length < 6) {

        showSignupError(
            error,
            "Your password needs to be at least 6 characters."
        );

        return;
    }

    const users = normaliseUsers();

    if (users[email]) {

        showSignupError(
            error,
            "An account with that email already exists."
        );

        return;
    }

    const newUser = {
        firstName,
        lastName: "Student",
        fullName: firstName,
        email,
        password,

        // FIXED: no more "Year Year 8"
        year: yearValue,

        // FIXED: no more "Year 8XX"
        className: `${yearValue.replace("Year ", "")}XX`,

        initials: firstName
            .split(" ")
            .map(word => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),

        // New accounts start completely empty
        points: 0,
        helped: 0,
        sessions: 0,
        badges: 0,
        studySessions: 0,
        studyMinutes: 0,
        streak: 0,

        bio: "New Peer Hub member.",
        subjects: [],
        progressHistory: []
    };

    users[email] = newUser;

    saveUsers(users);

    currentUser = { ...newUser };

    // New accounts do NOT magically have completed work
    assignments = [];

    saveAssignments();

    localStorage.setItem(
        CURRENT_USER_KEY,
        currentUser.email
    );

    showMainApp();

    resetSignupForm();
}


/* =========================
   SIGNUP ERROR
========================= */

function showSignupError(errorElement, message) {

    if (!errorElement) {
        alert(message);
        return;
    }

    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
}


/* =========================
   SCREEN SWITCHING
========================= */

function showLoginScreen() {

    const loginScreen = document.getElementById("loginScreen");
    const signupScreen = document.getElementById("signupScreen");
    const mainApp = document.getElementById("mainApp");

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (signupScreen) {
        signupScreen.classList.add("hidden");
    }

    if (mainApp) {
        mainApp.classList.add("hidden");
    }

    hideRoro();
}


function showSignupScreen() {

    const loginScreen = document.getElementById("loginScreen");
    const signupScreen = document.getElementById("signupScreen");

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (signupScreen) {
        signupScreen.classList.remove("hidden");
    }
}


function showMainApp() {

    const loginScreen = document.getElementById("loginScreen");
    const signupScreen = document.getElementById("signupScreen");
    const mainApp = document.getElementById("mainApp");

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (signupScreen) {
        signupScreen.classList.add("hidden");
    }

    if (mainApp) {
        mainApp.classList.remove("hidden");
    }

    updateUserInterface();

    renderAssignments();
    renderCalendar();
    renderPeers();
    renderProgress();
    updateStudyStats();

    showRoro();
}


/* =========================
   LOGOUT
========================= */

function logout() {

    stopPomodoro();

    if (currentUser) {
        saveCurrentUserData();
        saveAssignments();
    }

    currentUser = null;
    assignments = [];

    localStorage.removeItem(CURRENT_USER_KEY);

    showLoginScreen();

    resetLoginForm();
}


/* =========================
   SAVE CURRENT USER
========================= */

function saveCurrentUserData() {

    if (!currentUser) return;

    const users = normaliseUsers();

    users[currentUser.email] = {
        ...users[currentUser.email],
        ...currentUser
    };

    saveUsers(users);
}


/* =========================
   UI USER DATA
========================= */

function updateUserInterface() {

    if (!currentUser) return;

    const topName = document.getElementById("topName");
    const topYear = document.getElementById("topYear");
    const topAvatar = document.getElementById("topAvatar");

    if (topName) {
        topName.textContent = currentUser.firstName;
    }

    if (topYear) {
        topYear.textContent =
            `${currentUser.year} · ${currentUser.className}`;
    }

    if (topAvatar) {
        topAvatar.textContent = currentUser.initials;
    }

    const welcomeName = document.getElementById("welcomeName");

    if (welcomeName) {
        welcomeName.textContent = currentUser.firstName;
    }

    updateStats();
}


function updateStats() {

    if (!currentUser) return;

    const points = document.getElementById("pointsDisplay");
    const helped = document.getElementById("helpedDisplay");
    const sessions = document.getElementById("sessionsDisplay");
    const badges = document.getElementById("badgesDisplay");

    if (points) points.textContent = currentUser.points || 0;
    if (helped) helped.textContent = currentUser.helped || 0;
    if (sessions) sessions.textContent = currentUser.sessions || 0;
    if (badges) badges.textContent = currentUser.badges || 0;
}


/* =========================
   NAVIGATION
========================= */

function setupNavigation() {

    const navLinks = document.querySelectorAll("[data-page]");

    navLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            if (!currentUser) return;

            const pageId = link.dataset.page;

            showPage(pageId);

        });

    });
}


function showPage(pageId) {

    if (!currentUser) return;

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }

    document.querySelectorAll("[data-page]").forEach(link => {
        link.classList.remove("active");

        if (link.dataset.page === pageId) {
            link.classList.add("active");
        }
    });

    if (pageId === "progressPage") {
        renderProgress();
    }

    if (pageId === "calendarPage") {
        renderCalendar();
    }

    if (pageId === "assignmentsPage") {
        renderAssignments();
    }

    if (pageId === "studyPage") {
        updateStudyStats();
    }
}


/* =========================
   DATE + CLOCK
========================= */

function updateDate() {

    const dateElement = document.getElementById("currentDate");

    if (!dateElement) return;

    const now = new Date();

    dateElement.textContent =
        now.toLocaleDateString("en-NZ", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}


function updateClock() {

    const clock = document.getElementById("clock");

    if (!clock) return;

    const now = new Date();

    clock.textContent =
        now.toLocaleTimeString("en-NZ", {
            hour: "2-digit",
            minute: "2-digit"
        });
}


/* =========================
   ASSIGNMENTS
========================= */

function renderAssignments() {

    if (!currentUser) return;

    const list =
        document.getElementById("assignmentPageList");

    if (!list) return;

    list.innerHTML = "";

    if (assignments.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                <h3>No assignments yet 📚</h3>
                <p>Your assignments will appear here when they're added.</p>
            </div>
        `;

        return;
    }

    assignments.forEach(assignment => {

        const card = document.createElement("div");

        card.className =
            `assignment-card ${assignment.completed ? "completed" : ""}`;

        card.innerHTML = `
            <label class="assignment-check">
                <input
                    type="checkbox"
                    ${assignment.completed ? "checked" : ""}
                    onchange="toggleAssignment(${assignment.id})"
                >
                <span></span>
            </label>

            <div class="assignment-info">
                <span class="subject-tag">
                    ${escapeHTML(assignment.subject)}
                </span>

                <h3>${escapeHTML(assignment.title)}</h3>

                <p>${escapeHTML(assignment.description || "")}</p>
            </div>

            <div class="assignment-date">
                <strong>${formatDate(assignment.due)}</strong>
                <span class="${assignment.priority === "High" ? "high-priority" : ""}">
                    ${escapeHTML(assignment.priority)}
                </span>
            </div>
        `;

        list.appendChild(card);
    });
}


function toggleAssignment(id) {

    const assignment =
        assignments.find(item => item.id === id);

    if (!assignment) return;

    assignment.completed = !assignment.completed;

    if (assignment.completed) {
        currentUser.points += 10;
    } else {
        currentUser.points = Math.max(
            0,
            currentUser.points - 10
        );
    }

    saveCurrentUserData();
    saveAssignments();

    renderAssignments();
    updateStats();
    renderProgress();
}


/* =========================
   CALENDAR
========================= */

function renderCalendar() {

    const calendar =
        document.getElementById("fullCalendar");

    if (!calendar) return;

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    calendar.innerHTML = "";

    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");

        empty.className = "calendar-cell empty";

        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {

        const cell = document.createElement("div");

        cell.className = "calendar-cell";

        const isToday =
            day === now.getDate();

        if (isToday) {
            cell.classList.add("today");
        }

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayAssignments =
            assignments.filter(a => a.due === dateString);

        cell.innerHTML = `
            <span class="calendar-day-number">${day}</span>
            ${dayAssignments
                .map(a => `
                    <div class="calendar-assignment">
                        ${escapeHTML(a.title)}
                    </div>
                `)
                .join("")}
        `;

        calendar.appendChild(cell);
    }
}


/* =========================
   PEERS
========================= */

function renderPeers() {

    const results =
        document.getElementById("peerResults");

    if (!results) return;

    const users = normaliseUsers();

    const peers =
        Object.values(users)
            .filter(user =>
                currentUser &&
                user.email !== currentUser.email
            );

    results.innerHTML = "";

    if (peers.length === 0) {

        results.innerHTML = `
            <div class="empty-state">
                <h3>No peers found</h3>
                <p>There aren't any other students registered yet.</p>
            </div>
        `;

        return;
    }

    peers.forEach(peer => {

        const card = document.createElement("div");

        card.className = "peer-card";

        card.innerHTML = `
            <div class="peer-avatar">
                ${escapeHTML(peer.initials)}
            </div>

            <div class="peer-info">
                <h3>${escapeHTML(peer.fullName)}</h3>

                <p>
                    ${escapeHTML(peer.year)}
                    ·
                    ${escapeHTML(peer.className)}
                </p>

                <p>${escapeHTML(peer.bio || "")}</p>

                <div class="subject-tags">
                    ${
                        peer.subjects.length
                            ? peer.subjects.map(subject =>
                                `<span class="subject-tag">
                                    ${escapeHTML(subject)}
                                </span>`
                            ).join("")
                            : `<span class="muted">No subjects added yet</span>`
                    }
                </div>
            </div>

            <div class="peer-availability">
                Available
            </div>
        `;

        results.appendChild(card);
    });
}


/* =========================
   PROGRESS
========================= */

function renderProgress() {

    if (!currentUser) return;

    const points =
        document.getElementById("progressPoints");

    const sessions =
        document.getElementById("progressSessions");

    const minutes =
        document.getElementById("progressMinutes");

    const streak =
        document.getElementById("progressStreak");

    if (points) {
        points.textContent = currentUser.points || 0;
    }

    if (sessions) {
        sessions.textContent =
            currentUser.studySessions || 0;
    }

    if (minutes) {
        minutes.textContent =
            currentUser.studyMinutes || 0;
    }

    if (streak) {
        streak.textContent =
            currentUser.streak || 0;
    }

    renderProgressChart();
}


function renderProgressChart() {

    const canvas =
        document.getElementById("progressChart");

    if (!canvas || !currentUser) return;

    const ctx = canvas.getContext("2d");

    const history =
        currentUser.progressHistory || [];

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (history.length < 2) {

        ctx.font = "16px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "Complete activities to build your progress chart.",
            canvas.width / 2,
            canvas.height / 2
        );

        return;
    }

    const padding = 40;

    const maxPoints =
        Math.max(
            ...history.map(item => item.points),
            100
        );

    const chartWidth =
        canvas.width - padding * 2;

    const chartHeight =
        canvas.height - padding * 2;

    ctx.beginPath();

    history.forEach((item, index) => {

        const x =
            padding +
            (index / (history.length - 1)) *
            chartWidth;

        const y =
            canvas.height -
            padding -
            (item.points / maxPoints) *
            chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    history.forEach((item, index) => {

        const x =
            padding +
            (index / (history.length - 1)) *
            chartWidth;

        const y =
            canvas.height -
            padding -
            (item.points / maxPoints) *
            chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}


/* =========================
   STUDY TIMER
========================= */

function setupStudyTimer() {

    const startButton =
        document.getElementById("pomodoroStart");

    const resetButton =
        document.getElementById("pomodoroReset");

    if (startButton) {
        startButton.addEventListener(
            "click",
            togglePomodoro
        );
    }

    if (resetButton) {
        resetButton.addEventListener(
            "click",
            resetPomodoro
        );
    }

    updatePomodoroDisplay();
}


function togglePomodoro() {

    if (studyRunning) {
        pausePomodoro();
    } else {
        startPomodoro();
    }
}


function startPomodoro() {

    if (pomodoroInterval) return;

    studyRunning = true;

    updatePomodoroButton();

    pomodoroInterval =
        setInterval(() => {

            pomodoroSeconds--;

            updatePomodoroDisplay();

            if (pomodoroSeconds <= 0) {

                finishPomodoro();
            }

        }, 1000);
}


function pausePomodoro() {

    clearInterval(pomodoroInterval);

    pomodoroInterval = null;

    studyRunning = false;

    updatePomodoroButton();
}


function stopPomodoro() {

    clearInterval(pomodoroInterval);

    pomodoroInterval = null;

    studyRunning = false;

    updatePomodoroButton();
}


function resetPomodoro() {

    pausePomodoro();

    pomodoroMode = "focus";
    pomodoroSeconds = 25 * 60;

    updatePomodoroDisplay();
}


function finishPomodoro() {

    clearInterval(pomodoroInterval);

    pomodoroInterval = null;

    studyRunning = false;

    if (currentUser && pomodoroMode === "focus") {

        currentUser.studySessions =
            (currentUser.studySessions || 0) + 1;

        currentUser.studyMinutes =
            (currentUser.studyMinutes || 0) + 25;

        currentUser.points =
            (currentUser.points || 0) + 10;

        saveCurrentUserData();

        updateStats();
        updateStudyStats();
        renderProgress();
    }

    if (pomodoroMode === "focus") {

        pomodoroMode = "break";
        pomodoroSeconds = 5 * 60;

    } else {

        pomodoroMode = "focus";
        pomodoroSeconds = 25 * 60;
    }

    updatePomodoroDisplay();
    updatePomodoroButton();
}


function updatePomodoroDisplay() {

    const time =
        document.getElementById("pomodoroTime");

    const status =
        document.getElementById("pomodoroStatus");

    if (time) {

        const minutes =
            Math.floor(pomodoroSeconds / 60);

        const seconds =
            pomodoroSeconds % 60;

        time.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    if (status) {

        status.textContent =
            pomodoroMode === "focus"
                ? "Focus time"
                : "Break time";
    }
}


function updatePomodoroButton() {

    const button =
        document.getElementById("pomodoroStart");

    if (!button) return;

    button.textContent =
        studyRunning
            ? "Pause"
            : "Start";
}


function updateStudyStats() {

    if (!currentUser) return;

    const sessions =
        document.getElementById("studySessions");

    const minutes =
        document.getElementById("studyMinutes");

    const streak =
        document.getElementById("studyStreak");

    if (sessions) {
        sessions.textContent =
            currentUser.studySessions || 0;
    }

    if (minutes) {
        minutes.textContent =
            currentUser.studyMinutes || 0;
    }

    if (streak) {
        streak.textContent =
            currentUser.streak || 0;
    }
}


/* =========================
   RORO
========================= */

function setupRoro() {

    const buddy =
        document.getElementById("roroBuddy");

    if (!buddy) return;

    buddy.addEventListener("click", () => {

        const speech =
            document.getElementById("roroSpeech");

        if (!speech) return;

        speech.classList.toggle("roro-talking");

    });
}


function showRoro() {

    const roro =
        document.getElementById("roroBuddy");

    if (roro) {
        roro.classList.add("roro-visible");
    }
}


function hideRoro() {

    const roro =
        document.getElementById("roroBuddy");

    if (roro) {
        roro.classList.remove("roro-visible");
    }
}


/* =========================
   FORGOT PASSWORD
========================= */

function forgotPasswordFunction() {

    const email =
        prompt("Enter the email address for your account:");

    if (!email) return;

    const normalisedEmail =
        email.trim().toLowerCase();

    const users = normaliseUsers();

    const user = users[normalisedEmail];

    if (!user) {

        alert(
            "No account was found with that email address."
        );

        return;
    }

    alert(
        `Your password is: ${user.password}\n\n` +
        `This is a prototype, so passwords are stored locally.`
    );
}


/* =========================
   GOOGLE DEMO LOGIN
========================= */

function demoGoogleLogin() {

    const users = normaliseUsers();

    const user =
        users["t.smith@storans.school.nz"];

    if (!user) return;

    currentUser = { ...user };

    assignments = loadAssignments();

    localStorage.setItem(
        CURRENT_USER_KEY,
        currentUser.email
    );

    showMainApp();
}


/* =========================
   FORM RESET
========================= */

function resetLoginForm() {

    const form =
        document.getElementById("loginForm");

    if (form) {
        form.reset();
    }

    const error =
        document.getElementById("loginError");

    if (error) {
        error.textContent = "";
        error.classList.add("hidden");
    }
}


function resetSignupForm() {

    const form =
        document.getElementById("signupForm");

    if (form) {
        form.reset();
    }

    const error =
        document.getElementById("signupError");

    if (error) {
        error.textContent = "";
        error.classList.add("hidden");
    }
}


/* =========================
   HELPERS
========================= */

function formatDate(dateString) {

    if (!dateString) return "";

    const date = new Date(
        `${dateString}T00:00:00`
    );

    return date.toLocaleDateString("en-NZ", {
        day: "numeric",
        month: "short"
    });
}


function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   BEFORE LEAVING PAGE
========================= */

window.addEventListener("beforeunload", () => {

    if (currentUser) {
        saveCurrentUserData();
        saveAssignments();
    }

});
