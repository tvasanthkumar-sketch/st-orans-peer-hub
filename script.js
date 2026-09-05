/* =========================================================
   ST ORAN'S PEER HUB
   Main JavaScript
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "stOransPeerHubUsers";
const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";
const ASSIGNMENTS_KEY = "stOransPeerHubAssignments_";


/* =========================================================
   DEMO USERS
   ========================================================= */

const demoUsers = [
    {
        email: "t.smith@storans.school.nz",
        password: "maya123",
        name: "Maya Smith",
        year: "Year 8",
        className: "8WI",

        points: 420,
        sessions: 18,
        minutes: 450,
        helped: 12,
        badges: 4,
        streak: 6,

        subjects: ["Maths", "Science", "English"],

        bio: "I enjoy helping people with Maths and Science.",

        available: true,

        progressHistory: [
            { date: "2026-08-20", points: 300 },
            { date: "2026-08-24", points: 340 },
            { date: "2026-08-28", points: 380 },
            { date: "2026-09-01", points: 420 }
        ],

        settings: {
            notifications: true,
            availability: true,
            studyReminder: true
        }
    },

    {
        email: "l.worthington@storans.school.nz",
        password: "lucy123",
        name: "Lucy Worthington",
        year: "Year 8",
        className: "8WI",

        points: 310,
        sessions: 14,
        minutes: 330,
        helped: 8,
        badges: 3,
        streak: 4,

        subjects: ["English", "Social Studies", "Spanish"],

        bio: "Happy to help with English and languages!",

        available: true,

        progressHistory: [
            { date: "2026-08-20", points: 220 },
            { date: "2026-08-25", points: 250 },
            { date: "2026-08-30", points: 280 },
            { date: "2026-09-01", points: 310 }
        ],

        settings: {
            notifications: true,
            availability: true,
            studyReminder: false
        }
    }
];


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentUser = null;
let assignments = [];

let calendarDate = new Date();

let pomodoroTimer = null;
let pomodoroRunning = false;

let pomodoroMode = "focus";

let pomodoroDurations = {
    focus: 25,
    short: 5,
    long: 15
};

let pomodoroRemaining =
    pomodoroDurations.focus * 60;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function normaliseUsers() {

    const stored =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    demoUsers.forEach(user => {

        if (!stored[user.email]) {
            stored[user.email] = user;
        }

    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stored)
    );

    return stored;
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


function getInitials(name) {

    if (!name) return "SO";

    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function loadAssignments() {

    if (!currentUser) {
        return [];
    }

    const key =
        ASSIGNMENTS_KEY + currentUser.email;

    return JSON.parse(
        localStorage.getItem(key)
    ) || [];
}


function saveAssignments() {

    if (!currentUser) return;

    const key =
        ASSIGNMENTS_KEY + currentUser.email;

    localStorage.setItem(
        key,
        JSON.stringify(assignments)
    );
}


/* =========================================================
   SCREEN SWITCHING
   ========================================================= */

function showLoginScreen() {

    const loginScreen = $("loginScreen");
    const signupModal = $("signupModal");
    const app = $("app");

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (signupModal) {
        signupModal.classList.add("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }

}


function showSignupScreen() {

    const loginScreen = $("loginScreen");
    const signupModal = $("signupModal");

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (signupModal) {
        signupModal.classList.remove("hidden");
    }

}


function showMainApp() {

    const loginScreen = $("loginScreen");
    const signupModal = $("signupModal");
    const app = $("app");

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (signupModal) {
        signupModal.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }

    updateUserInterface();
    renderAssignments();
    renderCalendar();
    renderPeers();
    renderProgress();
    renderStudyStats();
    updateSettings();

    showPage("homePage");
}


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

    const form = $("loginForm");

    if (!form) return;

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            $("loginEmail").value.trim().toLowerCase();

        const password =
            $("loginPassword").value;

        const remember =
            $("rememberMe").checked;

        const error =
            $("loginError");

        const users =
            normaliseUsers();

        const user =
            users[email];


        if (!user) {

            showError(
                error,
                "We couldn't find an account with that email."
            );

            return;
        }


        if (user.password !== password) {

            showError(
                error,
                "That password is incorrect."
            );

            return;
        }


        currentUser = {
            ...user
        };

        assignments =
            loadAssignments();


        if (remember) {

            localStorage.setItem(
                CURRENT_USER_KEY,
                currentUser.email
            );

        } else {

            localStorage.removeItem(
                CURRENT_USER_KEY
            );

        }


        hideError(error);

        form.reset();

        showMainApp();

    });

}


/* =========================================================
   SIGNUP
   ========================================================= */

function setupSignup() {

    const form = $("signupForm");

    if (!form) return;


    form.addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            $("signupName").value.trim();

        const email =
            $("signupEmail").value.trim().toLowerCase();

        const password =
            $("signupPassword").value;

        const year =
            $("signupYear").value;

        const error =
            $("signupError");


        if (!name || !email || !password || !year) {

            showError(
                error,
                "Please complete all the fields."
            );

            return;
        }


        if (password.length < 6) {

            showError(
                error,
                "Your password needs at least 6 characters."
            );

            return;
        }


        const users =
            normaliseUsers();


        if (users[email]) {

            showError(
                error,
                "An account with that email already exists."
            );

            return;
        }


        /* ---------------------------------------------
           NEW USERS START WITH ZERO PROGRESS
           --------------------------------------------- */

        const newUser = {

            email: email,

            password: password,

            name: name,

            year: year,

            className:
                year.replace("Year ", "") + "XX",

            points: 0,

            sessions: 0,

            minutes: 0,

            helped: 0,

            badges: 0,

            streak: 0,

            subjects: [],

            bio: "",

            available: false,

            progressHistory: [],

            settings: {

                notifications: false,

                availability: false,

                studyReminder: false

            }

        };


        users[email] =
            newUser;

        saveUsers(users);


        currentUser = {
            ...newUser
        };


        assignments = [];

        saveAssignments();


        localStorage.setItem(
            CURRENT_USER_KEY,
            email
        );


        form.reset();

        hideError(error);

        showMainApp();


        showRoro(
            "Welcome to Peer Hub! 🐉"
        );

    });

}


/* =========================================================
   SIGNUP / LOGIN BUTTONS
   ========================================================= */

function setupSignupNavigation() {

    const showSignup =
        $("showSignup");

    const backToLogin =
        $("backToLogin");


    if (showSignup) {

        showSignup.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                showSignupScreen();

            }
        );

    }


    if (backToLogin) {

        backToLogin.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                showLoginScreen();

            }
        );

    }

}


/* =========================================================
   GOOGLE DEMO LOGIN
   ========================================================= */

function setupGoogleLogin() {

    const button =
        $("googleLogin");

    if (!button) return;


    button.addEventListener(
        "click",
        function() {

            const users =
                normaliseUsers();

            const demo =
                users["t.smith@storans.school.nz"];


            currentUser = {
                ...demo
            };

            assignments =
                loadAssignments();


            localStorage.setItem(
                CURRENT_USER_KEY,
                currentUser.email
            );


            showMainApp();


            showRoro(
                "Logged in with the demo account! 🐉"
            );

        }
    );

}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

function setupForgotPassword() {

    const button =
        $("forgotPassword");

    if (!button) return;


    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            const email =
                $("loginEmail").value.trim().toLowerCase();


            if (!email) {

                alert(
                    "Enter your school email first."
                );

                return;
            }


            const users =
                normaliseUsers();

            const user =
                users[email];


            if (!user) {

                alert(
                    "No account was found with that email."
                );

                return;
            }


            alert(
                "Prototype password reminder:\n\n" +
                user.password
            );

        }
    );

}


/* =========================================================
   RESTORE LOGIN
   ========================================================= */

function restoreLogin() {

    const savedEmail =
        localStorage.getItem(
            CURRENT_USER_KEY
        );


    if (!savedEmail) {

        showLoginScreen();

        return;
    }


    const users =
        normaliseUsers();

    const user =
        users[savedEmail];


    if (!user) {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

        showLoginScreen();

        return;
    }


    currentUser = {
        ...user
    };


    assignments =
        loadAssignments();


    showMainApp();

}


/* =========================================================
   USER INTERFACE
   ========================================================= */

function updateUserInterface() {

    if (!currentUser) return;


    const initials =
        getInitials(currentUser.name);


    if ($("topAvatar")) {
        $("topAvatar").textContent =
            initials;
    }


    if ($("topUserName")) {
        $("topUserName").textContent =
            currentUser.name;
    }


    if ($("topUserYear")) {
        $("topUserYear").textContent =
            currentUser.year;
    }


    if ($("welcomeName")) {
        $("welcomeName").textContent =
            currentUser.name.split(" ")[0];
    }


    if ($("homePoints")) {
        $("homePoints").textContent =
            currentUser.points || 0;
    }


    updateProfile();

    updateStats();

}


/* =========================================================
   PROFILE
   ========================================================= */

function updateProfile() {

    if (!currentUser) return;


    const initials =
        getInitials(currentUser.name);


    if ($("profileAvatar")) {
        $("profileAvatar").textContent =
            initials;
    }


    if ($("profileName")) {
        $("profileName").textContent =
            currentUser.name;
    }


    if ($("profileEmail")) {
        $("profileEmail").textContent =
            currentUser.email;
    }


    if ($("profileYear")) {
        $("profileYear").textContent =
            currentUser.year;
    }


    if ($("profileBio")) {

        $("profileBio").textContent =
            currentUser.bio ||
            "No bio added yet.";

    }


    if ($("profileAvailable")) {

        $("profileAvailable").textContent =
            currentUser.available
                ? "Available to help"
                : "Not currently available";

    }


    if ($("profileSubjects")) {

        if (
            currentUser.subjects &&
            currentUser.subjects.length
        ) {

            $("profileSubjects").innerHTML =
                currentUser.subjects
                    .map(subject =>
                        `<span class="subject-tag">
                            ${escapeHTML(subject)}
                        </span>`
                    )
                    .join("");

        } else {

            $("profileSubjects").innerHTML =
                `<span class="subject-tag">
                    No subjects added
                </span>`;

        }

    }

}


/* =========================================================
   STATS
   ========================================================= */

function updateStats() {

    if (!currentUser) return;


    if ($("homePoints")) {

        $("homePoints").textContent =
            currentUser.points || 0;

    }


    const sessions =
        currentUser.sessions || 0;

    const assignmentsCompleted =
        currentUser.assignmentsCompleted || 0;

    const helped =
        currentUser.helped || 0;


    if ($("progressPoints")) {

        $("progressPoints").textContent =
            currentUser.points || 0;

    }


    if ($("progressSessions")) {

        $("progressSessions").textContent =
            sessions;

    }


    if ($("progressAssignments")) {

        $("progressAssignments").textContent =
            assignmentsCompleted;

    }


    if ($("progressHelp")) {

        $("progressHelp").textContent =
            helped;

    }


    const percentage =
        Math.min(
            100,
            ((currentUser.points || 0) / 500) * 100
        );


    if ($("homeProgressFill")) {

        $("homeProgressFill").style.width =
            percentage + "%";

    }


    if ($("homeProgressCaption")) {

        if ((currentUser.points || 0) === 0) {

            $("homeProgressCaption").textContent =
                "You're just getting started.";

        } else {

            $("homeProgressCaption").textContent =
                `${currentUser.points} points earned. Keep going!`;

        }

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(".nav-link")
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    const page =
                        this.dataset.page;

                    showPage(page);

                }
            );

        });


    document
        .querySelectorAll("[data-page-link]")
        .forEach(link => {

            link.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    showPage(
                        this.dataset.pageLink
                    );

                }
            );

        });

}


function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    const page =
        $(pageId);

    if (page) {

        page.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-link")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageId
            );

        });


    if (pageId === "calendarPage") {
        renderCalendar();
    }


    if (pageId === "peersPage") {
        renderPeers();
    }


    if (pageId === "progressPage") {
        renderProgress();
    }


    if (pageId === "studyPage") {
        renderStudyStats();
    }

}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignments() {

    const homeList =
        $("homeAssignments");

    const pageList =
        $("assignmentPageList");


    if (!assignments) {
        assignments = [];
    }


    if (!assignments.length) {

        const emptyHTML = `
            <div class="empty-state">
                <div style="font-size:30px;">📚</div>
                <h3>No assignments yet</h3>
                <p>Your assignments will appear here.</p>
            </div>
        `;


        if (homeList) {
            homeList.innerHTML =
                emptyHTML;
        }


        if (pageList) {
            pageList.innerHTML =
                emptyHTML;
        }


        return;
    }


    const sorted =
        [...assignments].sort(
            (a, b) =>
                new Date(a.dueDate) -
                new Date(b.dueDate)
        );


    const assignmentHTML =
        sorted.map(assignment => {

            const completed =
                assignment.completed === true;


            return `
                <div class="assignment-item
                    ${completed ? "completed" : ""}">

                    <div class="assignment-info">

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

                    <div class="assignment-due">

                        ${
                            completed
                                ? "Completed ✓"
                                : formatDate(
                                    assignment.dueDate
                                  )
                        }

                    </div>

                </div>
            `;

        }).join("");


    if (pageList) {

        pageList.innerHTML =
            assignmentHTML;

    }


    if (homeList) {

        homeList.innerHTML =
            sorted
                .slice(0, 3)
                .map(assignment => {

                    return `
                        <div class="assignment-item">

                            <div class="assignment-info">

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

                            <div class="assignment-due">
                                ${formatDate(
                                    assignment.dueDate
                                )}
                            </div>

                        </div>
                    `;

                }).join("");

    }

}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar() {

    const calendar =
        $("fullCalendar");

    if (!calendar) return;


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    const monthName =
        calendarDate.toLocaleString(
            "en-NZ",
            {
                month: "long"
            }
        );


    if ($("fullCalendarTitle")) {

        $("fullCalendarTitle").textContent =
            `${monthName} ${year}`;

    }


    calendar.innerHTML = "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /*
       Convert Sunday-first JavaScript
       to Monday-first calendar.

       Sunday = 0
       Monday = 1

       Monday-first index:
       Sunday becomes 6
    */

    const startingDay =
        (firstDay + 6) % 7;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        const blank =
            document.createElement("div");

        blank.className =
            "calendar-day empty";

        calendar.appendChild(blank);

    }


    const today =
        new Date();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement("div");

        cell.className =
            "calendar-day";


        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();


        if (isToday) {
            cell.classList.add("today");
        }


        cell.innerHTML = `
            <div class="calendar-day-number">
                ${day}
            </div>
        `;


        /*
           Add assignments due on this date
        */

        assignments.forEach(
            assignment => {

                if (!assignment.dueDate) {
                    return;
                }


                const due =
                    new Date(
                        assignment.dueDate
                    );


                if (
                    due.getFullYear() === year &&
                    due.getMonth() === month &&
                    due.getDate() === day
                ) {

                    const event =
                        document.createElement("div");

                    event.className =
                        "calendar-event";


                    event.textContent =
                        assignment.title;


                    cell.appendChild(event);

                }

            }
        );


        calendar.appendChild(cell);

    }

}


/* =========================================================
   CALENDAR CONTROLS
   ========================================================= */

function setupCalendarControls() {

    if ($("previousMonth")) {

        $("previousMonth")
            .addEventListener(
                "click",
                function() {

                    calendarDate.setMonth(
                        calendarDate.getMonth() - 1
                    );

                    renderCalendar();

                }
            );

    }


    if ($("nextMonth")) {

        $("nextMonth")
            .addEventListener(
                "click",
                function() {

                    calendarDate.setMonth(
                        calendarDate.getMonth() + 1
                    );

                    renderCalendar();

                }
            );

    }


    if ($("todayButton")) {

        $("todayButton")
            .addEventListener(
                "click",
                function() {

                    calendarDate =
                        new Date();

                    renderCalendar();

                }
            );

    }

}


/* =========================================================
   PEERS
   ========================================================= */

function renderPeers() {

    const results =
        $("peerResults");

    if (!results) return;


    const users =
        normaliseUsers();


    const search =
        (
            $("peerSearch")?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const subject =
        $("subjectFilter")?.value ||
        "";


    const year =
        $("yearFilter")?.value ||
        "";


    const availability =
        $("availableFilter")?.value ||
        "";


    const peers =
        Object.values(users)
            .filter(user => {

                if (
                    currentUser &&
                    user.email === currentUser.email
                ) {
                    return false;
                }


                const matchesSearch =
                    !search ||
                    user.name
                        .toLowerCase()
                        .includes(search) ||
                    (
                        user.subjects || []
                    )
                        .some(s =>
                            s.toLowerCase()
                                .includes(search)
                        );


                const matchesSubject =
                    !subject ||
                    (
                        user.subjects || []
                    ).includes(subject);


                const matchesYear =
                    !year ||
                    user.year === year;


                const matchesAvailability =
                    !availability ||
                    (
                        availability === "available"
                            ? user.available
                            : !user.available
                    );


                return (
                    matchesSearch &&
                    matchesSubject &&
                    matchesYear &&
                    matchesAvailability
                );

            });


    if (!peers.length) {

        results.innerHTML = `
            <div class="empty-state">

                <div style="font-size:30px;">
                    🔎
                </div>

                <h3>
                    No peers found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>
        `;

        return;
    }


    results.innerHTML =
        peers.map(user => {

            const initials =
                getInitials(user.name);


            const subjects =
                (
                    user.subjects || []
                )
                .map(subject =>
                    `<span class="subject-tag">
                        ${escapeHTML(subject)}
                    </span>`
                )
                .join("");


            return `
                <div class="peer-card">

                    <div class="peer-avatar avatar">
                        ${initials}
                    </div>

                    <div class="peer-info">

                        <h3>
                            ${escapeHTML(user.name)}
                        </h3>

                        <p>
                            ${escapeHTML(user.year)}
                            ·
                            ${escapeHTML(
                                user.className || ""
                            )}
                        </p>

                        <div class="peer-subjects">
                            ${subjects}
                        </div>

                    </div>

                    <div class="peer-availability
                        ${
                            user.available
                                ? "available"
                                : "unavailable"
                        }">

                        ${
                            user.available
                                ? "Available"
                                : "Unavailable"
                        }

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   PEER SEARCH
   ========================================================= */

function setupPeerSearch() {

    const button =
        $("peerSearchButton");


    if (button) {

        button.addEventListener(
            "click",
            renderPeers
        );

    }


    [
        "peerSearch",
        "subjectFilter",
        "yearFilter",
        "availableFilter"
    ].forEach(id => {

        const element =
            $(id);

        if (!element) return;


        element.addEventListener(
            "change",
            renderPeers
        );

    });


    const search =
        $("peerSearch");


    if (search) {

        search.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    renderPeers();

                }

            }
        );

    }

}


/* =========================================================
   STUDY TIMER
   ========================================================= */

function setupStudyTimer() {

    const start =
        $("pomodoroStart");

    const pause =
        $("pomodoroPause");

    const reset =
        $("pomodoroReset");


    if (start) {

        start.addEventListener(
            "click",
            startPomodoro
        );

    }


    if (pause) {

        pause.addEventListener(
            "click",
            pausePomodoro
        );

    }


    if (reset) {

        reset.addEventListener(
            "click",
            resetPomodoro
        );

    }


    document
        .querySelectorAll(
            ".pomodoro-mode-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    const mode =
                        this.dataset.mode;

                    setPomodoroMode(mode);

                }
            );

        });


    updatePomodoroDisplay();

}


function setPomodoroMode(mode) {

    if (!pomodoroDurations[mode]) {
        return;
    }


    pausePomodoro();


    pomodoroMode =
        mode;


    pomodoroRemaining =
        pomodoroDurations[mode] * 60;


    document
        .querySelectorAll(
            ".pomodoro-mode-button"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.mode === mode
            );

        });


    updatePomodoroStatus();

    updatePomodoroDisplay();

}


function startPomodoro() {

    if (pomodoroRunning) {
        return;
    }


    pomodoroRunning =
        true;


    updatePomodoroStatus();


    pomodoroTimer =
        setInterval(
            function() {

                pomodoroRemaining--;

                updatePomodoroDisplay();


                if (pomodoroRemaining <= 0) {

                    finishPomodoro();

                }

            },
            1000
        );

}


function pausePomodoro() {

    pomodoroRunning =
        false;


    if (pomodoroTimer) {

        clearInterval(
            pomodoroTimer
        );

        pomodoroTimer =
            null;

    }


    updatePomodoroStatus();

}


function resetPomodoro() {

    pausePomodoro();


    pomodoroRemaining =
        pomodoroDurations[pomodoroMode] * 60;


    updatePomodoroStatus();

    updatePomodoroDisplay();

}


function finishPomodoro() {

    pausePomodoro();


    if (
        pomodoroMode === "focus" &&
        currentUser
    ) {

        /*
           Completed focus session:
           +5 points
        */

        currentUser.sessions =
            (currentUser.sessions || 0) + 1;


        currentUser.minutes =
            (currentUser.minutes || 0) +
            pomodoroDurations.focus;


        currentUser.points =
            (currentUser.points || 0) + 5;


        if (!currentUser.progressHistory) {

            currentUser.progressHistory = [];

        }


        currentUser.progressHistory.push({

            date:
                new Date()
                    .toISOString()
                    .split("T")[0],

            points:
                currentUser.points

        });


        saveCurrentUser();

        updateUserInterface();

        renderProgress();

        renderStudyStats();


        showRoro(
            "Study session complete! +5 points 🐉"
        );

    }


    alert(
        pomodoroMode === "focus"
            ? "Study session complete! 🎉"
            : "Break complete!"
    );


    setPomodoroMode(
        pomodoroMode === "focus"
            ? "short"
            : "focus"
    );

}


function updatePomodoroDisplay() {

    const display =
        $("pomodoroTime");

    if (!display) return;


    const minutes =
        Math.floor(
            pomodoroRemaining / 60
        );

    const seconds =
        pomodoroRemaining % 60;


    display.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


function updatePomodoroStatus() {

    const status =
        $("pomodoroStatus");

    if (!status) return;


    if (pomodoroRunning) {

        status.textContent =
            pomodoroMode === "focus"
                ? "Focus mode"
                : "Take a break";

        return;
    }


    if (
        pomodoroRemaining ===
        pomodoroDurations[pomodoroMode] * 60
    ) {

        status.textContent =
            pomodoroMode === "focus"
                ? "Ready to study"
                : "Ready for a break";

    } else {

        status.textContent =
            "Paused";

    }

}


/* =========================================================
   STUDY STATS
   ========================================================= */

function renderStudyStats() {

    if (!currentUser) return;


    if ($("sessionMinutes")) {

        $("sessionMinutes").textContent =
            currentUser.minutes || 0;

    }


    if ($("sessionCount")) {

        $("sessionCount").textContent =
            currentUser.sessions || 0;

    }


    if ($("sessionPoints")) {

        $("sessionPoints").textContent =
            currentUser.points || 0;

    }

}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    if (!currentUser) return;


    updateStats();

    renderProgressChart();

}


/* =========================================================
   PROGRESS CHART
   ========================================================= */

function renderProgressChart() {

    const canvas =
        $("progressChart");

    if (!canvas || !currentUser) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    const history =
        currentUser.progressHistory || [];


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (!history.length) {

        ctx.font =
            "14px DM Sans";

        ctx.fillStyle =
            "#85847e";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Complete study sessions to see your progress here.",
            canvas.width / 2,
            canvas.height / 2
        );

        return;
    }


    const points =
        history.map(
            item => item.points
        );


    const max =
        Math.max(
            ...points,
            10
        );


    const min =
        Math.min(
            ...points,
            0
        );


    const padding =
        40;


    const chartWidth =
        canvas.width -
        padding * 2;


    const chartHeight =
        canvas.height -
        padding * 2;


    /*
       Axes
    */

    ctx.beginPath();

    ctx.moveTo(
        padding,
        padding
    );

    ctx.lineTo(
        padding,
        canvas.height - padding
    );

    ctx.lineTo(
        canvas.width - padding,
        canvas.height - padding
    );

    ctx.strokeStyle =
        "#e4e0d7";

    ctx.stroke();


    /*
       Line
    */

    ctx.beginPath();


    history.forEach(
        (item, index) => {

            const x =
                padding +
                (
                    index /
                    Math.max(
                        history.length - 1,
                        1
                    )
                ) *
                chartWidth;


            const y =
                canvas.height -
                padding -
                (
                    (
                        item.points - min
                    ) /
                    Math.max(
                        max - min,
                        1
                    )
                ) *
                chartHeight;


            if (index === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }
    );


    ctx.strokeStyle =
        "#7a2638";

    ctx.lineWidth =
        3;

    ctx.stroke();


    /*
       Points
    */

    history.forEach(
        (item, index) => {

            const x =
                padding +
                (
                    index /
                    Math.max(
                        history.length - 1,
                        1
                    )
                ) *
                chartWidth;


            const y =
                canvas.height -
                padding -
                (
                    (
                        item.points - min
                    ) /
                    Math.max(
                        max - min,
                        1
                    )
                ) *
                chartHeight;


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#7a2638";

            ctx.fill();

        }
    );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function updateSettings() {

    if (!currentUser) return;


    const settings =
        currentUser.settings || {};


    if ($("notificationsSetting")) {

        $("notificationsSetting").checked =
            !!settings.notifications;

    }


    if ($("availabilitySetting")) {

        $("availabilitySetting").checked =
            !!settings.availability;

    }


    if ($("studyReminderSetting")) {

        $("studyReminderSetting").checked =
            !!settings.studyReminder;

    }

}


function setupSettings() {

    const notification =
        $("notificationsSetting");

    const availability =
        $("availabilitySetting");

    const reminder =
        $("studyReminderSetting");


    if (notification) {

        notification.addEventListener(
            "change",
            function() {

                if (!currentUser) return;

                currentUser.settings.notifications =
                    this.checked;

                saveCurrentUser();

            }
        );

    }


    if (availability) {

        availability.addEventListener(
            "change",
            function() {

                if (!currentUser) return;

                currentUser.settings.availability =
                    this.checked;

                currentUser.available =
                    this.checked;

                saveCurrentUser();

                updateProfile();

                renderPeers();

            }
        );

    }


    if (reminder) {

        reminder.addEventListener(
            "change",
            function() {

                if (!currentUser) return;

                currentUser.settings.studyReminder =
                    this.checked;

                saveCurrentUser();

            }
        );

    }

}


/* =========================================================
   SIGN OUT
   ========================================================= */

function setupSignOut() {

    const button =
        $("signOutButton");

    if (!button) return;


    button.addEventListener(
        "click",
        function() {

            saveCurrentUser();

            currentUser =
                null;

            assignments = [];

            localStorage.removeItem(
                CURRENT_USER_KEY
            );


            resetPomodoro();


            showLoginScreen();


            showRoro(
                "See you next time! 🐉"
            );

        }
    );

}


/* =========================================================
   EDIT PROFILE
   ========================================================= */

function setupEditProfile() {

    const button =
        $("editProfileButton");

    if (!button) return;


    button.addEventListener(
        "click",
        function() {

            if (!currentUser) return;


            const bio =
                prompt(
                    "Write a short bio:",
                    currentUser.bio || ""
                );


            if (bio === null) {
                return;
            }


            currentUser.bio =
                bio.trim();


            saveCurrentUser();

            updateProfile();


            showRoro(
                "Profile updated! 🐉"
            );

        }
    );

}


/* =========================================================
   RORO
   ========================================================= */

function setupRoro() {

    const buddy =
        $("roroBuddy");

    if (!buddy) return;


    buddy.addEventListener(
        "click",
        function() {

            const messages = [

                "Keep going! 🐉",

                "You've got this!",

                "One step at a time.",

                "Your future self will thank you.",

                "Time for a study session?",

                "I believe in you!"

            ];


            const randomMessage =
                messages[
                    Math.floor(
                        Math.random() *
                        messages.length
                    )
                ];


            showRoro(
                randomMessage
            );

        }
    );

}


function showRoro(message) {

    const buddy =
        $("roroBuddy");

    const speech =
        $("roroSpeech");


    if (!buddy) return;


    if (speech && message) {

        speech.textContent =
            message;

    }


    buddy.classList.add(
        "roro-visible"
    );


    clearTimeout(
        showRoro.timeout
    );


    showRoro.timeout =
        setTimeout(
            function() {

                hideRoro();

            },
            5000
        );

}


function hideRoro() {

    const buddy =
        $("roroBuddy");

    if (!buddy) return;


    buddy.classList.remove(
        "roro-visible"
    );

}


/* =========================================================
   DATE + CLOCK
   ========================================================= */

function updateDate() {

    const element =
        $("currentDate");

    if (!element) return;


    const now =
        new Date();


    element.textContent =
        now.toLocaleDateString(
            "en-NZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


function updateClock() {

    const element =
        $("clock");

    if (!element) return;


    const now =
        new Date();


    element.textContent =
        now.toLocaleTimeString(
            "en-NZ",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


/* =========================================================
   HOME SEARCH
   ========================================================= */

function setupHomeSearch() {

    const search =
        $("homeSearch");

    if (!search) return;


    search.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key !== "Enter"
            ) {
                return;
            }


            const query =
                search.value
                    .trim()
                    .toLowerCase();


            if (!query) return;


            const pages = {

                "assignment":
                    "assignmentsPage",

                "calendar":
                    "calendarPage",

                "peer":
                    "peersPage",

                "study":
                    "studyPage",

                "progress":
                    "progressPage",

                "resource":
                    "resourcesPage",

                "profile":
                    "profilePage",

                "setting":
                    "settingsPage"

            };


            for (
                const keyword in pages
            ) {

                if (
                    query.includes(keyword)
                ) {

                    showPage(
                        pages[keyword]
                    );

                    return;

                }

            }

        }
    );

}


/* =========================================================
   ERROR HELPERS
   ========================================================= */

function showError(element, message) {

    if (!element) return;


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );

}


function hideError(element) {

    if (!element) return;


    element.textContent =
        "";

    element.classList.add(
        "hidden"
    );

}


/* =========================================================
   FORM RESET / CLEANUP
   ========================================================= */

function setupInputCleanup() {

    [
        "loginEmail",
        "loginPassword"
    ].forEach(id => {

        const input =
            $(id);

        if (!input) return;


        input.addEventListener(
            "input",
            function() {

                hideError(
                    $("loginError")
                );

            }
        );

    });


    [
        "signupName",
        "signupEmail",
        "signupPassword",
        "signupYear"
    ].forEach(id => {

        const input =
            $(id);

        if (!input) return;


        input.addEventListener(
            "input",
            function() {

                hideError(
                    $("signupError")
                );

            }
        );

        input.addEventListener(
            "change",
            function() {

                hideError(
                    $("signupError")
                );

            }
        );

    });

}


/* =========================================================
   UTILITIES
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "No date";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
        return "No date";
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
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   START EVERYTHING
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Make sure demo accounts exist
        */

        normaliseUsers();


        /*
           Login / account system
        */

        setupLogin();

        setupSignup();

        setupSignupNavigation();

        setupGoogleLogin();

        setupForgotPassword();


        /*
           Navigation
        */

        setupNavigation();


        /*
           Calendar
        */

        setupCalendarControls();


        /*
           Peers
        */

        setupPeerSearch();


        /*
           Study timer
        */

        setupStudyTimer();


        /*
           Settings
        */

        setupSettings();


        /*
           Profile
        */

        setupEditProfile();


        /*
           Sign out
        */

        setupSignOut();


        /*
           Roro
        */

        setupRoro();


        /*
           Search
        */

        setupHomeSearch();


        /*
           Error cleanup
        */

        setupInputCleanup();


        /*
           Date + clock
        */

        updateDate();

        updateClock();


        setInterval(
            updateClock,
            1000
        );


        /*
           Restore previous login
        */

        restoreLogin();

    }
);


/* =========================================================
   SAVE BEFORE LEAVING
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        if (currentUser) {

            saveCurrentUser();

            saveAssignments();

        }

    }
);
