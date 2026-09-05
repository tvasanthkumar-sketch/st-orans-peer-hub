/* =========================================================
   ST ORAN'S PEER HUB
   SCRIPT.JS
   ========================================================= */

const STORAGE_KEY = "stOransPeerHubUsers";
const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";
const ASSIGNMENTS_KEY = "stOransPeerHubAssignments_";

let currentUser = null;
let assignments = [];

let currentCalendarDate = new Date();

let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
let pomodoroMode = "focus";
let pomodoroRunning = false;


/* =========================================================
   DEMO USERS
   ========================================================= */

const demoUsers = {
    "t.smith@storans.school.nz": {
        name: "Maya Smith",
        email: "t.smith@storans.school.nz",
        password: "maya123",
        year: "Year 8",
        className: "8XX",
        points: 420,
        sessions: 18,
        helped: 12,
        badges: 4,
        subjects: ["Maths", "English", "Science"],
        bio: "I love helping people with maths and science!",
        available: true,
        progressHistory: []
    },

    "l.worthington@storans.school.nz": {
        name: "Lucy Worthington",
        email: "l.worthington@storans.school.nz",
        password: "lucy123",
        year: "Year 8",
        className: "8XX",
        points: 310,
        sessions: 14,
        helped: 8,
        badges: 3,
        subjects: ["English", "Social Studies"],
        bio: "Happy to help with writing and social studies.",
        available: true,
        progressHistory: []
    }
};


/* =========================================================
   STORAGE HELPERS
   ========================================================= */

function normaliseUsers() {
    let users = {};

    try {
        users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        users = {};
    }

    Object.values(demoUsers).forEach(user => {
        if (!users[user.email]) {
            users[user.email] = user;
        }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    return users;
}


function saveUsers(users) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(users)
    );
}


function saveCurrentUser() {
    if (!currentUser) return;

    const users = normaliseUsers();

    users[currentUser.email] = currentUser;

    saveUsers(users);
}


function loadAssignments() {
    if (!currentUser) return [];

    try {
        return JSON.parse(
            localStorage.getItem(
                ASSIGNMENTS_KEY + currentUser.email
            )
        ) || [];
    } catch {
        return [];
    }
}


function saveAssignments() {
    if (!currentUser) return;

    localStorage.setItem(
        ASSIGNMENTS_KEY + currentUser.email,
        JSON.stringify(assignments)
    );
}


/* =========================================================
   INITIALISE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    normaliseUsers();

    setupLogin();
    setupSignup();
    setupNavigation();
    setupCalendar();
    setupRoro();
    setupStudyTimer();
    setupSettings();

    updateDate();
    updateClock();

    restoreLogin();

    setInterval(updateClock, 1000);
});


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", event => {

        event.preventDefault();

        const emailInput =
            document.getElementById("loginEmail");

        const passwordInput =
            document.getElementById("loginPassword");

        const rememberInput =
            document.getElementById("rememberMe");

        const error =
            document.getElementById("loginError");

        const email =
            emailInput.value.trim().toLowerCase();

        const password =
            passwordInput.value;

        const users = normaliseUsers();

        const user = users[email];

        if (!user || user.password !== password) {

            if (error) {
                error.textContent =
                    "Incorrect email or password.";
                error.classList.remove("hidden");
            }

            return;
        }

        if (error) {
            error.classList.add("hidden");
        }

        currentUser = {
            ...user
        };

        assignments = loadAssignments();

        if (rememberInput && rememberInput.checked) {

            localStorage.setItem(
                CURRENT_USER_KEY,
                currentUser.email
            );

        } else {

            sessionStorage.setItem(
                CURRENT_USER_KEY,
                currentUser.email
            );
        }

        showMainApp();
    });


    const forgotPassword =
        document.getElementById("forgotPassword");

    if (forgotPassword) {

        forgotPassword.addEventListener("click", event => {

            event.preventDefault();

            const email =
                document
                    .getElementById("loginEmail")
                    ?.value
                    .trim()
                    .toLowerCase();

            const users = normaliseUsers();

            if (!email || !users[email]) {

                alert(
                    "Enter your email address first."
                );

                return;
            }

            alert(
                "Demo mode: your password is " +
                users[email].password
            );
        });
    }


    const googleLogin =
        document.getElementById("googleLogin");

    if (googleLogin) {

        googleLogin.addEventListener("click", () => {

            const users = normaliseUsers();

            currentUser = {
                ...users["t.smith@storans.school.nz"]
            };

            assignments = loadAssignments();

            sessionStorage.setItem(
                CURRENT_USER_KEY,
                currentUser.email
            );

            showMainApp();
        });
    }


    const showSignup =
        document.getElementById("showSignup");

    if (showSignup) {

        showSignup.addEventListener(
            "click",
            showSignupScreen
        );
    }
}


/* =========================================================
   SIGNUP
   ========================================================= */

function setupSignup() {

    const signupForm =
        document.getElementById("signupForm");

    const signupModal =
        document.getElementById("signupModal");

    const closeSignup =
        document.getElementById("closeSignup");

    if (closeSignup) {

        closeSignup.addEventListener("click", () => {

            if (signupModal) {
                signupModal.classList.add("hidden");
            }
        });
    }


    if (signupModal) {

        signupModal.addEventListener("click", event => {

            if (event.target === signupModal) {
                signupModal.classList.add("hidden");
            }
        });
    }


    if (!signupForm) return;

    signupForm.addEventListener("submit", event => {

        event.preventDefault();

        const name =
            document
                .getElementById("signupName")
                ?.value
                .trim();

        const email =
            document
                .getElementById("signupEmail")
                ?.value
                .trim()
                .toLowerCase();

        const password =
            document
                .getElementById("signupPassword")
                ?.value;

        if (!name || !email || !password) {

            alert(
                "Please fill in all the required fields."
            );

            return;
        }


        const users = normaliseUsers();

        if (users[email]) {

            alert(
                "An account with that email already exists."
            );

            return;
        }


        /*
         * IMPORTANT:
         * New users start completely fresh.
         */

        const newUser = {

            name: name,

            email: email,

            password: password,

            year: "Year 8",

            className: "8XX",

            points: 0,

            sessions: 0,

            helped: 0,

            badges: 0,

            subjects: [],

            bio: "",

            available: false,

            progressHistory: []

        };


        users[email] = newUser;

        saveUsers(users);


        currentUser = {
            ...newUser
        };

        assignments = [];

        saveAssignments();


        sessionStorage.setItem(
            CURRENT_USER_KEY,
            currentUser.email
        );


        signupForm.reset();

        if (signupModal) {
            signupModal.classList.add("hidden");
        }

        showMainApp();
    });
}


/* =========================================================
   SCREEN SWITCHING
   ========================================================= */

function showLoginScreen() {

    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");

    const signupModal =
        document.getElementById("signupModal");


    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }

    if (signupModal) {
        signupModal.classList.add("hidden");
    }

    currentUser = null;
    assignments = [];

    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
}


function showSignupScreen() {

    const signupModal =
        document.getElementById("signupModal");

    if (signupModal) {
        signupModal.classList.remove("hidden");
    }
}


function showMainApp() {

    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }

    updateUserInterface();

    renderAssignments();
    renderCalendar();
    renderPeers();
    renderProgress();

    showPage("homePage");
}


/* =========================================================
   RESTORE LOGIN
   ========================================================= */

function restoreLogin() {

    const savedEmail =
        localStorage.getItem(CURRENT_USER_KEY) ||
        sessionStorage.getItem(CURRENT_USER_KEY);

    if (!savedEmail) return;

    const users = normaliseUsers();

    if (!users[savedEmail]) return;

    currentUser = {
        ...users[savedEmail]
    };

    assignments = loadAssignments();

    showMainApp();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const pageId =
                item.dataset.page;

            if (!pageId) return;

            showPage(pageId);

            navItems.forEach(nav => {
                nav.classList.remove("active");
            });

            item.classList.add("active");
        });
    });
}


function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const target =
        document.getElementById(pageId);

    if (target) {
        target.classList.add("active");
    }

    if (pageId === "calendarPage") {
        renderCalendar();
    }

    if (pageId === "peersPage") {
        renderPeers();
    }

    if (pageId === "progressPage") {
        renderProgress();
    }
}


/* =========================================================
   USER INTERFACE
   ========================================================= */

function updateUserInterface() {

    if (!currentUser) return;


    const initials =
        getInitials(currentUser.name);


    const topAvatar =
        document.getElementById("topAvatar");

    const topUserName =
        document.getElementById("topUserName");

    const topUserYear =
        document.getElementById("topUserYear");

    const welcomeName =
        document.getElementById("welcomeName");


    if (topAvatar) {
        topAvatar.textContent = initials;
    }

    if (topUserName) {
        topUserName.textContent =
            currentUser.name;
    }

    if (topUserYear) {
        topUserYear.textContent =
            currentUser.year || "Year 8";
    }

    if (welcomeName) {
        welcomeName.textContent =
            currentUser.name.split(" ")[0];
    }


    const homePoints =
        document.getElementById("homePoints");

    if (homePoints) {
        homePoints.textContent =
            currentUser.points || 0;
    }


    const progressFill =
        document.getElementById(
            "homeProgressFill"
        );

    const progressCaption =
        document.getElementById(
            "homeProgressCaption"
        );


    const points =
        currentUser.points || 0;

    const progress =
        Math.min((points % 100) / 100 * 100, 100);

    if (progressFill) {
        progressFill.style.width =
            `${progress}%`;
    }

    if (progressCaption) {

        const next =
            Math.ceil((points + 1) / 100) * 100;

        progressCaption.textContent =
            `${points} points • ${next - points} until next level`;
    }


    updateProfile();
}


function updateProfile() {

    if (!currentUser) return;

    const avatar =
        document.getElementById("profileAvatar");

    const name =
        document.getElementById("profileName");

    const email =
        document.getElementById("profileEmail");

    const year =
        document.getElementById("profileYear");

    const subjects =
        document.getElementById("profileSubjects");

    const bio =
        document.getElementById("profileBio");

    const available =
        document.getElementById("profileAvailable");


    if (avatar) {
        avatar.textContent =
            getInitials(currentUser.name);
    }

    if (name) {
        name.textContent =
            currentUser.name;
    }

    if (email) {
        email.textContent =
            currentUser.email;
    }

    if (year) {
        year.textContent =
            currentUser.year || "Year 8";
    }

    if (bio) {
        bio.textContent =
            currentUser.bio ||
            "No bio added yet.";
    }

    if (available) {
        available.textContent =
            currentUser.available
                ? "Available to help"
                : "Currently unavailable";
    }

    if (subjects) {

        const list =
            currentUser.subjects || [];

        if (!list.length) {

            subjects.innerHTML =
                `<span class="muted">
                    No subjects added yet.
                 </span>`;

        } else {

            subjects.innerHTML =
                list
                    .map(subject =>
                        `<span class="subject-tag">
                            ${escapeHTML(subject)}
                         </span>`
                    )
                    .join("");
        }
    }
}


function getInitials(name) {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join("");
}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignments() {

    const homeList =
        document.getElementById(
            "homeAssignments"
        );

    const pageList =
        document.getElementById(
            "assignmentPageList"
        );


    const html =
        assignments.length
            ? assignments.map(renderAssignment).join("")
            : `
                <div class="empty-state">
                    <div class="empty-state-icon">✦</div>
                    <h3>No assignments yet</h3>
                    <p>Your assignments will appear here.</p>
                </div>
              `;


    if (homeList) {
        homeList.innerHTML =
            assignments.length
                ? assignments
                    .slice(0, 4)
                    .map(renderAssignment)
                    .join("")
                : html;
    }

    if (pageList) {
        pageList.innerHTML = html;
    }
}


function renderAssignment(assignment) {

    const priority =
        assignment.priority || "low";

    return `
        <div class="assignment-item priority-${priority}">
            <div class="assignment-main">
                <h3>
                    ${escapeHTML(
                        assignment.title ||
                        "Assignment"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        assignment.subject ||
                        ""
                    )}
                </p>
            </div>

            <div class="assignment-date">
                ${escapeHTML(
                    assignment.due ||
                    ""
                )}
            </div>
        </div>
    `;
}


/* =========================================================
   CALENDAR
   ========================================================= */

function setupCalendar() {

    const previous =
        document.getElementById(
            "previousMonth"
        );

    const next =
        document.getElementById(
            "nextMonth"
        );

    const today =
        document.getElementById(
            "todayButton"
        );


    if (previous) {

        previous.addEventListener(
            "click",
            () => {

                currentCalendarDate.setMonth(
                    currentCalendarDate.getMonth() - 1
                );

                renderCalendar();
            }
        );
    }


    if (next) {

        next.addEventListener(
            "click",
            () => {

                currentCalendarDate.setMonth(
                    currentCalendarDate.getMonth() + 1
                );

                renderCalendar();
            }
        );
    }


    if (today) {

        today.addEventListener(
            "click",
            () => {

                currentCalendarDate =
                    new Date();

                renderCalendar();
            }
        );
    }
}


function renderCalendar() {

    const calendar =
        document.getElementById(
            "fullCalendar"
        );

    const miniCalendar =
        document.getElementById(
            "miniCalendar"
        );

    if (!calendar && !miniCalendar) return;


    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();


    const monthName =
        currentCalendarDate.toLocaleString(
            "en-NZ",
            {
                month: "long"
            }
        );


    const title =
        `${monthName} ${year}`;


    const fullTitle =
        document.getElementById(
            "fullCalendarTitle"
        );

    const miniTitle =
        document.getElementById(
            "miniCalendarTitle"
        );


    if (fullTitle) {
        fullTitle.textContent = title;
    }

    if (miniTitle) {
        miniTitle.textContent = title;
    }


    /*
     * JS gives Sunday = 0.
     * Your calendar starts Monday.
     *
     * This converts:
     * Sunday -> 6
     * Monday -> 0
     * Tuesday -> 1
     */

    const firstDay =
        (
            new Date(year, month, 1).getDay()
            + 6
        ) % 7;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const todayDate =
        new Date();


    let html = "";


    for (let i = 0; i < firstDay; i++) {

        html += `
            <div class="calendar-day empty"></div>
        `;
    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const isToday =
            day === todayDate.getDate() &&
            month === todayDate.getMonth() &&
            year === todayDate.getFullYear();


        const dayAssignments =
            assignments.filter(
                assignment =>
                    assignment.date ===
                    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            );


        html += `
            <div class="calendar-day ${isToday ? "today" : ""}">

                <div class="calendar-day-number">
                    ${day}
                </div>

                ${
                    dayAssignments
                        .map(a =>
                            `<div class="calendar-event">
                                ${escapeHTML(a.title)}
                             </div>`
                        )
                        .join("")
                }

            </div>
        `;
    }


    if (calendar) {
        calendar.innerHTML = html;
    }

    if (miniCalendar) {
        miniCalendar.innerHTML = html;
    }
}


/* =========================================================
   PEERS
   ========================================================= */

function renderPeers() {

    const results =
        document.getElementById(
            "peerResults"
        );

    if (!results) return;


    const search =
        document.getElementById(
            "peerSearch"
        )?.value
        .trim()
        .toLowerCase() || "";


    const subject =
        document.getElementById(
            "subjectFilter"
        )?.value || "";


    const year =
        document.getElementById(
            "yearFilter"
        )?.value || "";


    const availableOnly =
        document.getElementById(
            "availableFilter"
        )?.checked || false;


    const users =
        Object.values(normaliseUsers())
            .filter(user =>
                user.email !== currentUser?.email
            )
            .filter(user => {

                const matchesSearch =
                    !search ||
                    user.name
                        .toLowerCase()
                        .includes(search) ||
                    user.email
                        .toLowerCase()
                        .includes(search);

                const matchesSubject =
                    !subject ||
                    (user.subjects || [])
                        .includes(subject);

                const matchesYear =
                    !year ||
                    user.year === year;

                const matchesAvailable =
                    !availableOnly ||
                    user.available;

                return (
                    matchesSearch &&
                    matchesSubject &&
                    matchesYear &&
                    matchesAvailable
                );
            });


    if (!users.length) {

        results.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⌕</div>
                <h3>No peers found</h3>
                <p>
                    Try changing your search or filters.
                </p>
            </div>
        `;

        return;
    }


    results.innerHTML =
        users.map(user => {

            const subjects =
                (user.subjects || [])
                    .map(
                        subject =>
                            `<span class="subject-tag">
                                ${escapeHTML(subject)}
                             </span>`
                    )
                    .join("");


            return `
                <div class="peer-card">

                    <div class="peer-avatar">
                        ${getInitials(user.name)}
                    </div>

                    <div class="peer-info">

                        <h3>
                            ${escapeHTML(user.name)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                user.year || "Year 8"
                            )}
                        </p>

                        <div>
                            ${subjects}
                        </div>

                    </div>

                    ${
                        user.available
                            ? `<div class="peer-status">
                                Available
                               </div>`
                            : ""
                    }

                </div>
            `;

        }).join("");
}


/* Peer filters */

document.addEventListener("input", event => {

    if (
        event.target.id === "peerSearch"
    ) {
        renderPeers();
    }
});


document.addEventListener("change", event => {

    if (
        [
            "subjectFilter",
            "yearFilter",
            "availableFilter"
        ].includes(event.target.id)
    ) {
        renderPeers();
    }
});


const peerSearchButton =
    document.getElementById(
        "peerSearchButton"
    );

if (peerSearchButton) {

    peerSearchButton.addEventListener(
        "click",
        renderPeers
    );
}


/* =========================================================
   STUDY TIMER
   ========================================================= */

function setupStudyTimer() {

    const start =
        document.getElementById(
            "pomodoroStart"
        );

    const pause =
        document.getElementById(
            "pomodoroPause"
        );

    const reset =
        document.getElementById(
            "pomodoroReset"
        );


    if (start) {

        start.addEventListener(
            "click",
            () => {

                if (pomodoroRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }

            }
        );
    }


    if (pause) {

        pause.addEventListener(
            "click",
            pauseTimer
        );
    }


    if (reset) {

        reset.addEventListener(
            "click",
            resetTimer
        );
    }


    const modeButtons =
        document.querySelectorAll(
            "[data-mode]"
        );


    modeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const mode =
                    button.dataset.mode;

                if (
                    mode === "focus" ||
                    mode === "short" ||
                    mode === "long"
                ) {

                    setPomodoroMode(mode);
                }
            }
        );
    });


    updatePomodoroDisplay();
}


function getModeSeconds(mode) {

    if (mode === "short") {
        return 5 * 60;
    }

    if (mode === "long") {
        return 15 * 60;
    }

    return 25 * 60;
}


function setPomodoroMode(mode) {

    pauseTimer();

    pomodoroMode = mode;

    pomodoroSeconds =
        getModeSeconds(mode);

    document
        .querySelectorAll("[data-mode]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.mode === mode
            );
        });


    updatePomodoroDisplay();
}


function startTimer() {

    if (pomodoroRunning) return;

    pomodoroRunning = true;


    pomodoroTimer =
        setInterval(() => {

            pomodoroSeconds--;

            updatePomodoroDisplay();


            if (pomodoroSeconds <= 0) {

                clearInterval(
                    pomodoroTimer
                );

                pomodoroTimer = null;

                pomodoroRunning = false;

                finishPomodoro();
            }

        }, 1000);


    updatePomodoroButtons();
}


function pauseTimer() {

    if (pomodoroTimer) {

        clearInterval(
            pomodoroTimer
        );

        pomodoroTimer = null;
    }

    pomodoroRunning = false;

    updatePomodoroButtons();
}


function resetTimer() {

    pauseTimer();

    pomodoroSeconds =
        getModeSeconds(pomodoroMode);

    updatePomodoroDisplay();
}


function finishPomodoro() {

    if (pomodoroMode === "focus") {

        if (currentUser) {

            /*
             * +5 points for a completed
             * study session.
             */

            currentUser.points =
                (currentUser.points || 0) + 5;

            currentUser.sessions =
                (currentUser.sessions || 0) + 1;


            if (!currentUser.progressHistory) {
                currentUser.progressHistory = [];
            }


            currentUser.progressHistory.push({

                date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                points:
                    currentUser.points,

                minutes: 25

            });


            saveCurrentUser();

            updateUserInterface();

            renderProgress();
        }


        showRoro(
            "Nice work! You finished a study session. ✨"
        );

        alert(
            "Study session complete! +5 points 🎉"
        );


        setPomodoroMode("short");

    } else {

        showRoro(
            "Break time finished. Ready when you are! 🌿"
        );

        alert(
            "Break finished! Time to get back to it."
        );

        setPomodoroMode("focus");
    }
}


function updatePomodoroDisplay() {

    const display =
        document.getElementById(
            "pomodoroTime"
        );

    const status =
        document.getElementById(
            "pomodoroStatus"
        );


    if (display) {

        const minutes =
            Math.floor(
                pomodoroSeconds / 60
            );

        const seconds =
            pomodoroSeconds % 60;


        display.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }


    if (status) {

        if (pomodoroMode === "focus") {
            status.textContent =
                pomodoroRunning
                    ? "Stay focused 🌿"
                    : "Ready to focus?";
        }

        if (pomodoroMode === "short") {
            status.textContent =
                "Short break";
        }

        if (pomodoroMode === "long") {
            status.textContent =
                "Long break";
        }
    }

    updatePomodoroButtons();
}


function updatePomodoroButtons() {

    const start =
        document.getElementById(
            "pomodoroStart"
        );

    if (!start) return;

    start.textContent =
        pomodoroRunning
            ? "Pause"
            : "Start";
}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    if (!currentUser) return;


    const points =
        document.getElementById(
            "progressPoints"
        );

    const sessions =
        document.getElementById(
            "progressSessions"
        );

    const assignmentsCount =
        document.getElementById(
            "progressAssignments"
        );

    const help =
        document.getElementById(
            "progressHelp"
        );


    if (points) {
        points.textContent =
            currentUser.points || 0;
    }

    if (sessions) {
        sessions.textContent =
            currentUser.sessions || 0;
    }

    if (assignmentsCount) {
        assignmentsCount.textContent =
            assignments.length;
    }

    if (help) {
        help.textContent =
            currentUser.helped || 0;
    }


    renderProgressChart();
}


function renderProgressChart() {

    const canvas =
        document.getElementById(
            "progressChart"
        );

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");


    const history =
        currentUser?.progressHistory || [];


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (!history.length) {

        ctx.fillStyle = "#85847e";

        ctx.font = "14px sans-serif";

        ctx.textAlign = "center";

        ctx.fillText(
            "Complete a study session to start tracking your progress.",
            canvas.width / 2,
            canvas.height / 2
        );

        return;
    }


    const data =
        history.slice(-7);


    const padding = 45;

    const width =
        canvas.width - padding * 2;

    const height =
        canvas.height - padding * 2;


    const max =
        Math.max(
            ...data.map(item =>
                item.points || 0
            ),
            10
        );


    ctx.strokeStyle = "#b79a62";

    ctx.lineWidth = 2;

    ctx.beginPath();


    data.forEach((item, index) => {

        const x =
            padding +
            (
                index /
                Math.max(data.length - 1, 1)
            ) *
            width;


        const y =
            canvas.height -
            padding -
            (
                (item.points || 0) /
                max
            ) *
            height;


        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

    });


    ctx.stroke();


    data.forEach((item, index) => {

        const x =
            padding +
            (
                index /
                Math.max(data.length - 1, 1)
            ) *
            width;


        const y =
            canvas.height -
            padding -
            (
                (item.points || 0) /
                max
            ) *
            height;


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#7a2638";

        ctx.fill();

    });
}


/* =========================================================
   SETTINGS
   ========================================================= */

function setupSettings() {

    const availability =
        document.getElementById(
            "availabilitySetting"
        );

    const notifications =
        document.getElementById(
            "notificationsSetting"
        );

    const reminder =
        document.getElementById(
            "studyReminderSetting"
        );

    const signOut =
        document.getElementById(
            "signOutButton"
        );


    if (availability) {

        availability.addEventListener(
            "change",
            () => {

                if (!currentUser) return;

                currentUser.available =
                    availability.checked;

                saveCurrentUser();

                renderPeers();

                updateProfile();
            }
        );
    }


    if (signOut) {

        signOut.addEventListener(
            "click",
            () => {

                saveCurrentUser();
                saveAssignments();

                showLoginScreen();
            }
        );
    }
}


/* =========================================================
   RORO
   ========================================================= */

function setupRoro() {

    const roro =
        document.getElementById(
            "roroBuddy"
        );

    if (!roro) return;


    setTimeout(() => {

        showRoro(
            "Welcome to Peer Hub! 🐉"
        );

    }, 1200);


    roro.addEventListener(
        "click",
        () => {

            showRoro(
                getRoroMessage()
            );

        }
    );
}


function showRoro(message) {

    const roro =
        document.getElementById(
            "roroBuddy"
        );

    const speech =
        document.getElementById(
            "roroSpeech"
        );


    if (!roro) return;


    if (speech) {
        speech.textContent =
            message;
    }


    roro.classList.add(
        "roro-visible"
    );


    clearTimeout(
        window.roroHideTimer
    );


    window.roroHideTimer =
        setTimeout(() => {

            hideRoro();

        }, 6000);
}


function hideRoro() {

    const roro =
        document.getElementById(
            "roroBuddy"
        );

    if (roro) {
        roro.classList.remove(
            "roro-visible"
        );
    }
}


function getRoroMessage() {

    const messages = [

        "You've got this! 🌿",

        "Small progress is still progress.",

        "Need a study break? Your brain isn't a machine. 🐉",

        "Go crush that assignment. ✨",

        "One task at a time.",

        "Future you will be glad you studied today."

    ];

    return messages[
        Math.floor(
            Math.random() * messages.length
        )
    ];
}


/* =========================================================
   DATE / CLOCK
   ========================================================= */

function updateDate() {

    const elements =
        document.querySelectorAll(
            "[data-current-date]"
        );

    const date =
        new Date();


    elements.forEach(element => {

        element.textContent =
            date.toLocaleDateString(
                "en-NZ",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
    });
}


function updateClock() {

    const clock =
        document.getElementById(
            "currentClock"
        );

    if (!clock) return;

    clock.textContent =
        new Date().toLocaleTimeString(
            "en-NZ",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


/* =========================================================
   HELPERS
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   SAVE BEFORE LEAVING
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (currentUser) {

            saveCurrentUser();
            saveAssignments();
        }
    }
);
