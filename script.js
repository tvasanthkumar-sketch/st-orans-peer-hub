/* =========================================================
   ST ORAN'S PEER HUB
   COMPLETE SCRIPT
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const USERS_KEY = "stOransPeerHubUsers";
const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";
const CALENDAR_KEY = "stOransPeerHubCalendar";


function safeGet(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
    } catch (error) {
        console.warn("Could not read localStorage:", error);
        return fallback;
    }
}


function safeSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn("Could not save to localStorage:", error);
        return false;
    }
}


function safeRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn("Could not remove localStorage item:", error);
    }
}


/* =========================================================
   DEMO USERS
   ========================================================= */

const demoUsers = {
    "maya@storans.school.nz": {
        firstName: "Maya",
        lastName: "Smith",
        fullName: "Maya Smith",
        email: "maya@storans.school.nz",
        password: "Demo123",
        year: "Year 8",
        className: "8XX",
        initials: "MS",
        points: 240,
        helped: 8,
        sessions: 12,
        badges: 3,
        studySessions: 7,
        studyMinutes: 175,
        streak: 4,
        bio: "I enjoy helping other students with Maths and English.",
        subjects: [
            "Maths",
            "Algebra",
            "English",
            "Essay Writing"
        ],
        preferences: "Online or in-person • After school",
        progressHistory: [
            60,
            90,
            110,
            145,
            170,
            205,
            240
        ]
    },

    "lucy@storans.school.nz": {
        firstName: "Lucy",
        lastName: "Worthington",
        fullName: "Lucy Worthington",
        email: "lucy@storans.school.nz",
        password: "Lucy123",
        year: "Year 13",
        className: "13XX",
        initials: "LW",
        points: 520,
        helped: 21,
        sessions: 28,
        badges: 6,
        studySessions: 15,
        studyMinutes: 390,
        streak: 8,
        bio: "I can help with Maths, Algebra and Calculus.",
        subjects: [
            "Maths",
            "Algebra",
            "Calculus"
        ],
        preferences: "In person • Lunch and after school",
        progressHistory: [
            310,
            345,
            380,
            420,
            455,
            490,
            520
        ]
    }
};


/* =========================================================
   USER DATA
   ========================================================= */

function getStoredUsers() {

    const saved = safeGet(USERS_KEY, null);

    if (!saved) {
        return {
            ...demoUsers
        };
    }

    try {
        const parsed = JSON.parse(saved);

        return {
            ...demoUsers,
            ...parsed
        };

    } catch (error) {

        console.warn("Could not parse stored users.");

        return {
            ...demoUsers
        };
    }
}


let users = getStoredUsers();


function saveUsers() {
    safeSet(
        USERS_KEY,
        JSON.stringify(users)
    );
}


function saveCurrentUser() {

    if (!currentUser) return;

    users[currentUser.email] = {
        ...currentUser
    };

    saveUsers();
}


function saveCurrentUserKey() {

    if (!currentUser) {
        safeRemove(CURRENT_USER_KEY);
        return;
    }

    safeSet(
        CURRENT_USER_KEY,
        currentUser.email
    );
}


/* =========================================================
   CURRENT USER
   ========================================================= */

let currentUser = null;


/* =========================================================
   PEERS
   ========================================================= */

const peers = [

    {
        id: 1,
        name: "Lucy",
        year: "Year 13",
        subjects: [
            "Maths",
            "Algebra",
            "Calculus"
        ],
        availability: "Available now",
        online: true,
        topics: [
            "expanding brackets",
            "equations",
            "calculus"
        ],
        bio: "I enjoy helping students understand Maths instead of just memorising steps."
    },

    {
        id: 2,
        name: "Amelia",
        year: "Year 11",
        subjects: [
            "Science",
            "Biology",
            "Chemistry"
        ],
        availability: "Available now",
        online: true,
        topics: [
            "cells",
            "genetics",
            "chemical reactions"
        ],
        bio: "Happy to help with Science, Biology and Chemistry."
    },

    {
        id: 3,
        name: "Sophie",
        year: "Year 10",
        subjects: [
            "Spanish",
            "Writing",
            "English"
        ],
        availability: "Later today",
        online: true,
        topics: [
            "Spanish writing",
            "vocabulary",
            "essay writing"
        ],
        bio: "I can help with Spanish writing, vocabulary and English."
    },

    {
        id: 4,
        name: "Ella",
        year: "Year 12",
        subjects: [
            "English",
            "Essay Writing",
            "History"
        ],
        availability: "Available now",
        online: false,
        topics: [
            "essay writing",
            "analysis",
            "history"
        ],
        bio: "I enjoy helping with essays, analysis and History."
    },

    {
        id: 5,
        name: "Noah",
        year: "Year 9",
        subjects: [
            "Maths",
            "Fractions",
            "Statistics"
        ],
        availability: "Available now",
        online: true,
        topics: [
            "fractions",
            "percentages",
            "statistics"
        ],
        bio: "I can help with Maths, especially fractions, percentages and statistics."
    }

];


/* =========================================================
   QUOTES
   ========================================================= */

const quotes = [

    "Small progress is still progress.",
    "Start before you feel ready.",
    "A little planning goes a long way.",
    "Learning is better together.",
    "Look how far you've come.",
    "Everyone has something they can teach.",
    "Your future self will thank you for starting today.",
    "Mistakes are proof that you're learning."

];


const pageQuotes = {

    home: quotes[0],
    calendar: quotes[2],
    assignments: quotes[1],
    peers: quotes[3],
    resources: quotes[6],
    profile: quotes[5],
    progress: quotes[4],
    settings: quotes[7]

};


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

const defaultAssignments = [

    {
        name: "English Speech",
        dateOffset: 1,
        priority: "High",
        icon: "E"
    },

    {
        name: "Algebra Practice",
        dateOffset: 3,
        priority: "Medium",
        icon: "M"
    },

    {
        name: "Science Report",
        dateOffset: 5,
        priority: "Low",
        icon: "S"
    }

];


function loadAssignments() {

    const saved = safeGet(
        "stOransPeerHubAssignments",
        null
    );

    if (!saved) {
        return [...defaultAssignments];
    }

    try {
        return JSON.parse(saved);
    } catch {
        return [...defaultAssignments];
    }
}


function saveAssignments() {

    safeSet(
        "stOransPeerHubAssignments",
        JSON.stringify(assignments)
    );
}


let assignments = loadAssignments();


/* =========================================================
   CALENDAR
   ========================================================= */

const defaultCalendarEvents = [

    {
        title: "Maths assignment",
        date: "2026-09-08",
        type: "Assignment"
    },

    {
        title: "Science report",
        date: "2026-09-11",
        type: "Assignment"
    }

];


function loadCalendarEvents() {

    const saved = safeGet(
        CALENDAR_KEY,
        null
    );

    if (!saved) {
        return [...defaultCalendarEvents];
    }

    try {

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [...defaultCalendarEvents];
        }

        return parsed;

    } catch {

        return [...defaultCalendarEvents];
    }
}


function saveCalendarEvents() {

    safeSet(
        CALENDAR_KEY,
        JSON.stringify(calendarEvents)
    );
}


let calendarEvents = loadCalendarEvents();


/* =========================================================
   APP STATE
   ========================================================= */

let selectedPeer = null;

let pomodoroMode = "focus";

let pomodoroSeconds = 25 * 60;

let pomodoroTotalSeconds = 25 * 60;

let pomodoroTimer = null;

let pomodoroRunning = false;

let completedPomodoros = 0;

let studyMinutesThisVisit = 0;


/* =========================================================
   DOM REFERENCES
   ========================================================= */

let loginForm;
let loginScreen;
let signupScreen;
let mainApp;
let loginError;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function today() {
    return new Date();
}


function formatDate(
    date,
    options = {
        weekday: "long",
        month: "long",
        day: "numeric"
    }
) {
    return date.toLocaleDateString(
        "en-NZ",
        options
    );
}


function greeting() {

    const hour = today().getHours();

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 18) {
        return "Good afternoon";
    }

    return "Good evening";
}


function dailyQuote() {

    const date = today();

    const key = Math.floor(
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ).getTime() / 86400000
    );

    return quotes[
        ((key % quotes.length) + quotes.length) %
        quotes.length
    ];
}


/* =========================================================
   LOGIN
   ========================================================= */

function showLogin(event) {

    if (event) {
        event.preventDefault();
    }

    const login = document.getElementById("loginScreen");
    const signup = document.getElementById("signupScreen");
    const app = document.getElementById("mainApp");

    if (signup) {
        signup.classList.add("hidden");
        signup.style.display = "none";
    }

    if (app) {
        app.classList.add("hidden");
        app.style.display = "none";
    }

    if (login) {
        login.classList.remove("hidden");
        login.style.display = "flex";
    }
}


function showLoginError(message) {

    const error = document.getElementById("loginError");

    if (!error) {
        alert(message);
        return;
    }

    error.textContent = message;
    error.style.display = "block";
}


function setupLogin() {

    loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");

            const remember =
                document.getElementById("rememberMe");

            const email =
                emailInput?.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput?.value || "";

            if (loginError) {
                loginError.style.display = "none";
            }

            if (!email || !password) {
                showLoginError(
                    "Please enter your email and password."
                );
                return;
            }

            if (!email.endsWith("@storans.school.nz")) {
                showLoginError(
                    "Please use your St Oran's school email address."
                );
                return;
            }

            const account = users[email];

            if (!account) {

                showLoginError(
                    "We couldn't find an account with that school email."
                );

                return;
            }

            if (password !== account.password) {

                showLoginError(
                    "Incorrect password. Please try again."
                );

                return;
            }

            login(
                account,
                email,
                remember?.checked === true
            );
        }
    );
}


/* =========================================================
   ACTUAL LOGIN
   ========================================================= */

function login(
    account,
    email,
    remember = false
) {

    currentUser = {
        ...account,
        email: email
    };

    loadUserData();

    if (remember) {
        saveCurrentUserKey();
    } else {
        safeRemove(CURRENT_USER_KEY);
    }

    const login = document.getElementById("loginScreen");
    const signup = document.getElementById("signupScreen");
    const app = document.getElementById("mainApp");

    if (login) {
        login.classList.add("hidden");
        login.style.display = "none";
    }

    if (signup) {
        signup.classList.add("hidden");
        signup.style.display = "none";
    }

    if (app) {
        app.classList.remove("hidden");
        app.style.display = "flex";
    }

    showPage("home");

    renderDate();
    renderRecommended();
    renderDeadlines();
    renderFullCalendar();
}


/* =========================================================
   GOOGLE LOGIN
   ========================================================= */

function googleLogin() {

    showModal(`
        <h2>Continue with Google</h2>

        <p>
            This prototype simulates Google sign-in.
            In the real school version, this would use
            St Oran's approved school authentication.
        </p>

        <div class="modal-actions">

            <button
                class="secondary-button"
                onclick="closeModal()">
                Cancel
            </button>

            <button
                class="primary-button"
                onclick="demoGoogleAccount()">
                Use demo Google account
            </button>

        </div>
    `);
}


function demoGoogleAccount() {

    closeModal();

    login(
        users["maya@storans.school.nz"],
        "maya@storans.school.nz",
        false
    );
}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

function forgotPassword(event) {

    if (event) {
        event.preventDefault();
    }

    showModal(`
        <h2>Password recovery</h2>

        <p>
            In the real version, password recovery would
            be handled through the school's approved
            Google account system.
        </p>

        <p>
            This prototype does not send real password
            recovery emails.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()">
                Close
            </button>

        </div>
    `);
}


/* =========================================================
   SIGNUP
   ========================================================= */

let signupData = {};


function setupSignup() {
    // Signup uses the existing HTML buttons/functions.
}


function showSignup(event) {

    if (event) {
        event.preventDefault();
    }

    const login = document.getElementById("loginScreen");
    const signup = document.getElementById("signupScreen");
    const app = document.getElementById("mainApp");

    if (login) {
        login.classList.add("hidden");
        login.style.display = "none";
    }

    if (app) {
        app.classList.add("hidden");
        app.style.display = "none";
    }

    if (signup) {
        signup.classList.remove("hidden");
        signup.style.display = "flex";
    }

    /*
       If your signup screen is already a proper HTML form,
       leave it alone.

       The existing prototype also supports the modal signup
       system below.
    */

    if (typeof signupStep === "function") {
        signupStep(1, {});
    }
}


function signupStep(step, data = {}) {

    signupData = {
        ...signupData,
        ...data
    };

    let html = "";


    /* STEP 1 */

    if (step === 1) {

        html = `

            <h2>Create your Peer Hub account</h2>

            <p>
                Set up your student profile.
                This is a prototype, so nothing is
                sent to the school.
            </p>

            <div class="signup-step">

                <input
                    id="suFirst"
                    placeholder="First name"
                    value="${signupData.first || ""}"
                >

                <input
                    id="suLast"
                    placeholder="Last name"
                    value="${signupData.last || ""}"
                >

                <input
                    id="suEmail"
                    type="email"
                    placeholder="School email"
                    value="${signupData.email || ""}"
                >

                <select id="suYear">

                    <option value="">
                        Year level
                    </option>

                    ${[8,9,10,11,12,13].map(
                        y => `
                            <option
                                ${signupData.year === `Year ${y}` ? "selected" : ""}
                            >
                                Year ${y}
                            </option>
                        `
                    ).join("")}

                </select>

            </div>

            <div class="modal-actions">

                <button
                    class="primary-button"
                    onclick="signupNext(1)">
                    Continue
                </button>

            </div>
        `;
    }


    /* STEP 2 */

    if (step === 2) {

        html = `

            <h2>What can you help with?</h2>

            <p>
                Select subjects or skills.
                You can change these later.
            </p>

            <div class="signup-step">

                ${
                    [
                        "Maths",
                        "English",
                        "Science",
                        "Spanish",
                        "History",
                        "Algebra",
                        "Essay Writing",
                        "Biology"
                    ].map(subject => `

                        <label>

                            <input
                                type="checkbox"
                                name="suSubject"
                                value="${subject}"
                            >

                            ${subject}

                        </label>

                    `).join("")
                }

            </div>

            <div class="modal-actions">

                <button
                    class="secondary-button"
                    onclick="signupStep(1, signupData)">
                    Back
                </button>

                <button
                    class="primary-button"
                    onclick="signupNext(2)">
                    Continue
                </button>

            </div>
        `;
    }


    /* STEP 3 */

    if (step === 3) {

        html = `

            <h2>When can you help?</h2>

            <p>
                Choose the times and session types
                that suit you.
            </p>

            <div class="signup-step">

                <label>
                    <input
                        type="checkbox"
                        id="prefAfter"
                    >
                    After school
                </label>

                <label>
                    <input
                        type="checkbox"
                        id="prefLunch"
                    >
                    Lunch
                </label>

                <label>
                    <input
                        type="checkbox"
                        id="prefOnline"
                    >
                    Online tutoring
                </label>

                <label>
                    <input
                        type="checkbox"
                        id="prefInPerson"
                    >
                    In person
                </label>

            </div>

            <div class="modal-actions">

                <button
                    class="secondary-button"
                    onclick="signupStep(2, signupData)">
                    Back
                </button>

                <button
                    class="primary-button"
                    onclick="finishSignup()">
                    Create profile
                </button>

            </div>
        `;
    }


    showModal(html);
}


function signupNext(step) {

    if (step === 1) {

        const first =
            document.getElementById("suFirst")
                ?.value.trim();

        const last =
            document.getElementById("suLast")
                ?.value.trim();

        const email =
            document.getElementById("suEmail")
                ?.value.trim()
                .toLowerCase();

        const year =
            document.getElementById("suYear")
                ?.value;

        if (!first || !last || !email || !year) {

            alert(
                "Please complete all fields."
            );

            return;
        }

        if (!email.endsWith("@storans.school.nz")) {

            alert(
                "Please use your St Oran's school email address."
            );

            return;
        }

        signupData = {
            first,
            last,
            email,
            year
        };

        signupStep(
            2,
            signupData
        );

        return;
    }


    if (step === 2) {

        const subjects = [
            ...document.querySelectorAll(
                'input[name="suSubject"]:checked'
            )
        ].map(
            checkbox => checkbox.value
        );

        signupData.subjects = subjects;

        signupStep(
            3,
            signupData
        );
    }
}


function finishSignup() {

    const first =
        signupData.first ||
        document.getElementById("suFirst")?.value ||
        "Student";

    const last =
        signupData.last || "";

    const email =
        signupData.email ||
        document.getElementById("suEmail")?.value
            .trim()
            .toLowerCase();

    const year =
        signupData.year ||
        document.getElementById("suYear")?.value ||
        "Year 8";

    const subjects =
        signupData.subjects || [];


    if (!email) {

        alert(
            "Please enter your school email."
        );

        return;
    }


    if (users[email]) {

        alert(
            "An account with this email already exists."
        );

        return;
    }


    const initials =
        (
            first.charAt(0) +
            last.charAt(0)
        ).toUpperCase();


    /*
       IMPORTANT:
       A brand-new student starts at ZERO.
       No fake points. No fake sessions.
       Humanity has suffered enough from websites
       inventing statistics.
    */

    const newUser = {

        firstName: first,

        lastName: last,

        fullName:
            `${first} ${last}`.trim(),

        email: email,

        password: "ChangeMe123",

        year: year,

        className:
            `${year.replace("Year ", "")}XX`,

        initials: initials,

        points: 0,

        helped: 0,

        sessions: 0,

        badges: 0,

        studySessions: 0,

        studyMinutes: 0,

        streak: 0,

        bio:
            "I am part of the St Oran's Peer Hub.",

        subjects: subjects,

        preferences:
            "No preferences added yet.",

        progressHistory: [0]

    };


    users[email] = newUser;

    saveUsers();


    signupData = {};


    showModal(`

        <h2>Profile ready 🎓</h2>

        <p>
            Your Peer Hub profile has been created.
        </p>

        <p>
            You currently have <strong>0 points</strong>,
            0 sessions and 0 completed study sessions.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="
                    closeModal();
                    login(
                        users['${email}'],
                        '${email}',
                        false
                    );
                ">
                Enter Peer Hub
            </button>

        </div>
    `);
}


/* =========================================================
   USER UI
   ========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value ?? "";
    }
}


function loadUserData() {

    if (!currentUser) {
        return;
    }


    setText(
        "topName",
        currentUser.fullName ||
        currentUser.name
    );

    setText(
        "topYear",
        currentUser.year
    );

    setText(
        "topAvatar",
        currentUser.initials ||
        currentUser.fullName?.charAt(0) ||
        "S"
    );


    setText(
        "welcomeName",
        currentUser.firstName ||
        currentUser.name ||
        "Student"
    );


    setText(
        "profileName",
        currentUser.fullName ||
        currentUser.name
    );

    setText(
        "profileYear",
        currentUser.year
    );


    setText(
        "profileAvatar",
        currentUser.initials ||
        currentUser.fullName?.charAt(0) ||
        "S"
    );


    setText(
        "settingsEmail",
        currentUser.email
    );


    const profileTags =
        document.getElementById(
            "profileTags"
        );

    if (profileTags) {

        profileTags.innerHTML =
            (currentUser.subjects || [])
                .map(
                    subject =>
                        `<span>${subject}</span>`
                )
                .join("");
    }


    setText(
        "profilePreferences",
        currentUser.preferences ||
        "No preferences added yet."
    );


    setText(
        "progressPoints",
        currentUser.points || 0
    );

    setText(
        "progressHelped",
        currentUser.helped || 0
    );

    setText(
        "progressSessions",
        currentUser.sessions || 0
    );

    setText(
        "progressBadges",
        currentUser.badges || 0
    );


    setText(
        "homePoints",
        currentUser.points || 0
    );


    setText(
        "homeHelped",
        `You've helped ${currentUser.helped || 0} students this term.`
    );


    const nextBadge =
        ((Math.floor(
            (currentUser.points || 0) / 300
        ) + 1) * 300);


    const percentage =
        Math.min(
            100,
            ((currentUser.points || 0) /
                nextBadge) * 100
        );


    const progressFill =
        document.getElementById(
            "homeProgressFill"
        );

    if (progressFill) {
        progressFill.style.width =
            percentage + "%";
    }


    setText(
        "homeProgressCaption",
        `${nextBadge - (currentUser.points || 0)} points until your next badge`
    );


    drawChart();
}


/* =========================================================
   POINTS
   ========================================================= */

function addPoints(amount) {

    if (!currentUser) {
        return;
    }

    currentUser.points =
        (currentUser.points || 0) +
        Number(amount || 0);


    if (!Array.isArray(
        currentUser.progressHistory
    )) {

        currentUser.progressHistory = [];
    }


    currentUser.progressHistory.push(
        currentUser.points
    );


    if (
        currentUser.progressHistory.length > 12
    ) {

        currentUser.progressHistory.shift();
    }


    saveCurrentUser();

    loadUserData();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const page =
                        item.dataset.page;

                    if (page) {
                        showPage(page);
                    }
                }
            );
        });
}


function showPage(id) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );
        });


    const target =
        document.getElementById(id);

    if (target) {

        target.classList.add(
            "active-page"
        );
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === id
            );
        });


    if (id === "peers") {

        searchMainPeers();
    }


    if (id === "calendar") {

        renderFullCalendar();
    }


    if (id === "progress") {

        drawChart();
    }
}


/* =========================================================
   DATE / CLOCK
   ========================================================= */

function updateDate() {

    const date = today();

    setText(
        "todayLabel",
        date
            .toLocaleDateString(
                "en-NZ",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }
            )
            .toUpperCase()
    );


    setText(
        "greeting",
        greeting()
    );


    const monthTitle =
        date.toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        );


    setText(
        "monthTitle",
        monthTitle
    );

    setText(
        "fullMonthTitle",
        monthTitle
    );


    setText(
        "homeQuote",
        dailyQuote()
    );


    const ids = [
        "calendar",
        "assignments",
        "peers",
        "resources",
        "profile",
        "progress",
        "settings"
    ];


    document
        .querySelectorAll(".pageQuote")
        .forEach(
            (element, index) => {

                element.textContent =
                    pageQuotes[
                        ids[index]
                    ] ||
                    dailyQuote();
            }
        );
}


function updateClock() {

    const clock =
        document.getElementById(
            "clock"
        );

    if (!clock) {
        return;
    }

    clock.textContent =
        today().toLocaleTimeString(
            "en-NZ",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
}


/* =========================================================
   MINI CALENDAR
   ========================================================= */

function renderMiniCalendar() {

    const calendar =
        document.getElementById(
            "miniCalendar"
        );

    if (!calendar) {
        return;
    }


    const date = today();

    const year =
        date.getFullYear();

    const month =
        date.getMonth();

    const first =
        new Date(
            year,
            month,
            1
        );

    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    const previousDays =
        new Date(
            year,
            month,
            0
        ).getDate();

    const start =
        (first.getDay() + 6) % 7;


    let html = "";


    for (
        let i = 0;
        i < start;
        i++
    ) {

        html += `
            <span>
                ${previousDays - start + i + 1}
            </span>
        `;
    }


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        html += `
            <span
                class="${day === date.getDate() ? "today" : ""}">
                ${day}
            </span>
        `;
    }


    calendar.innerHTML = html;
}


/* =========================================================
   FULL CALENDAR
   ========================================================= */

function dateKey(year, month, day) {

    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}


function getEventsForDate(dateString) {

    return calendarEvents.filter(
        event =>
            event.date === dateString
    );
}


function renderFullCalendar() {

    const calendar =
        document.getElementById(
            "fullCalendar"
        );

    if (!calendar) {
        return;
    }


    const date = today();

    const year =
        date.getFullYear();

    const month =
        date.getMonth();

    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    const start =
        (
            new Date(
                year,
                month,
                1
            ).getDay() + 6
        ) % 7;


    let html = `

        ${[
            "MON",
            "TUE",
            "WED",
            "THU",
            "FRI",
            "SAT",
            "SUN"
        ]
        .map(
            day =>
                `<div class="day-name">${day}</div>`
        )
        .join("")}

    `;


    for (
        let i = 0;
        i < start;
        i++
    ) {

        html += `
            <div class="empty-day"></div>
        `;
    }


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const key =
            dateKey(
                year,
                month,
                day
            );


        const events =
            getEventsForDate(key);


        html += `

            <div
                class="${
                    day === date.getDate()
                        ? "current"
                        : ""
                } calendar-day">

                <strong>
                    ${day}
                </strong>

                <div class="calendar-events">

                    ${
                        events.map(
                            event => `
                                <small
                                    class="calendar-event"
                                    title="${event.title}">
                                    ${event.title}
                                </small>
                            `
                        ).join("")
                    }

                </div>

            </div>
        `;
    }


    calendar.innerHTML = html;
}


/* =========================================================
   ADD CALENDAR EVENT
   ========================================================= */

function addCalendarEvent() {

    const title =
        prompt(
            "What is the event called?"
        );


    if (!title || !title.trim()) {
        return;
    }


    const date =
        prompt(
            "What date? Use YYYY-MM-DD, for example 2026-09-15."
        );


    if (!date) {
        return;
    }


    const validDate =
        /^\d{4}-\d{2}-\d{2}$/;


    if (!validDate.test(date)) {

        alert(
            "Please use the format YYYY-MM-DD."
        );

        return;
    }


    const type =
        prompt(
            "Event type? Example: Assignment, Test, Meeting"
        ) ||
        "Event";


    calendarEvents.push({

        title:
            title.trim(),

        date:
            date,

        type:
            type.trim()

    });


    saveCalendarEvents();

    renderFullCalendar();

    renderMiniCalendar();


    showModal(`

        <h2>Event added ✓</h2>

        <p>
            <strong>${title.trim()}</strong>
            has been added to
            ${date}.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()">
                Done
            </button>

        </div>

    `);
}


/* =========================================================
   REMOVE CALENDAR EVENT
   ========================================================= */

function removeCalendarEvent() {

    if (!calendarEvents.length) {

        alert(
            "There are no calendar events to remove."
        );

        return;
    }


    const eventList =
        calendarEvents
            .map(
                (event, index) =>
                    `${index + 1}. ${event.title} — ${event.date}`
            )
            .join("\n");


    const choice =
        prompt(
            `Which event do you want to remove?\n\n${eventList}\n\nEnter the number:`
        );


    if (!choice) {
        return;
    }


    const index =
        Number(choice) - 1;


    if (
        Number.isNaN(index) ||
        index < 0 ||
        index >= calendarEvents.length
    ) {

        alert(
            "That isn't a valid event number."
        );

        return;
    }


    const removed =
        calendarEvents.splice(
            index,
            1
        )[0];


    saveCalendarEvents();

    renderFullCalendar();

    renderMiniCalendar();


    alert(
        `"${removed.title}" was removed.`
    );
}


/* =========================================================
   DEADLINES / ASSIGNMENTS
   ========================================================= */

function dateWithOffset(offset) {

    const date = today();

    date.setDate(
        date.getDate() +
        Number(offset || 0)
    );

    return date.toLocaleDateString(
        "en-NZ",
        {
            weekday: "long",
            month: "short",
            day: "numeric"
        }
    );
}


function renderDeadlines() {

    const deadlineList =
        document.getElementById(
            "deadlineList"
        );


    if (deadlineList) {

        deadlineList.innerHTML =
            assignments
                .map(
                    assignment => `

                        <div class="assignment">

                            <div class="assignment-icon">
                                ${assignment.icon}
                            </div>

                            <div class="assignment-info">

                                <strong>
                                    ${assignment.name}
                                </strong>

                                <span>
                                    Due
                                    ${dateWithOffset(
                                        assignment.dateOffset
                                    )}
                                </span>

                            </div>

                            <span
                                class="priority ${assignment.priority.toLowerCase()}">
                                ${assignment.priority}
                            </span>

                        </div>

                    `
                )
                .join("");
    }


    const assignmentPageList =
        document.getElementById(
            "assignmentPageList"
        );


    if (assignmentPageList) {

        assignmentPageList.innerHTML =
            assignments
                .map(
                    assignment => `

                        <div
                            class="assignment"
                            style="
                                padding:14px 0;
                                border-bottom:1px solid #ece5da
                            ">

                            <div class="assignment-icon">
                                ${assignment.icon}
                            </div>

                            <div class="assignment-info">

                                <strong>
                                    ${assignment.name}
                                </strong>

                                <span>
                                    Due
                                    ${dateWithOffset(
                                        assignment.dateOffset
                                    )}
                                </span>

                            </div>

                            <span
                                class="priority ${assignment.priority.toLowerCase()}">
                                ${assignment.priority}
                            </span>

                        </div>

                    `
                )
                .join("");
    }
}


/* =========================================================
   PEER SEARCH
   ========================================================= */

function peerMatches(
    peer,
    term,
    subject,
    year,
    availability,
    online
) {

    const searchable =
        [
            peer.name,
            peer.year,
            ...peer.subjects,
            ...peer.topics
        ]
        .join(" ")
        .toLowerCase();


    return (

        (!term ||
            searchable.includes(term))

        &&

        (!subject ||
            peer.subjects.includes(subject))

        &&

        (!year ||
            peer.year === year)

        &&

        (!availability ||
            availability === "Online"
                ? peer.online
                : peer.availability === availability)

        &&

        (!online ||
            peer.online)

    );
}


function searchPeers() {

    const input =
        document.getElementById(
            "peerSearch"
        );

    const mainInput =
        document.getElementById(
            "mainPeerSearch"
        );


    const term =
        input?.value.trim() || "";


    if (mainInput) {
        mainInput.value = term;
    }


    showPage("peers");

    searchMainPeers();
}


function searchMainPeers() {

    const searchInput =
        document.getElementById(
            "mainPeerSearch"
        );

    const subjectInput =
        document.getElementById(
            "subjectFilter"
        );

    const yearInput =
        document.getElementById(
            "yearFilter"
        );

    const availabilityInput =
        document.getElementById(
            "availabilityFilter"
        );

    const onlineInput =
        document.getElementById(
            "onlineFilter"
        );

    const results =
        document.getElementById(
            "searchResults"
        );


    if (!results) {
        return;
    }


    const term =
        searchInput?.value
            .trim()
            .toLowerCase() || "";


    const subject =
        subjectInput?.value || "";


    const year =
        yearInput?.value || "";


    const availability =
        availabilityInput?.value || "";


    const online =
        onlineInput?.checked || false;


    let matches =
        peers.filter(
            peer =>
                peerMatches(
                    peer,
                    term,
                    subject,
                    year,
                    availability,
                    online
                )
        );


    if (
        !term &&
        !subject &&
        !year &&
        !availability &&
        !online
    ) {

        matches =
            peers.slice(0, 4);
    }


    if (!matches.length) {

        results.innerHTML = `

            <div
                class="card"
                style="
                    text-align:center;
                    padding:50px
                ">

                <h2
                    style="
                        font-family:'Playfair Display',serif;
                        color:#234b38
                    ">
                    No peers found
                </h2>

                <p class="muted">
                    Try another subject, topic or filter.
                </p>

            </div>
        `;

        return;
    }


    results.innerHTML =
        matches
            .map(peerCard)
            .join("");
}


function peerCard(peer) {

    return `

        <div class="peer-result-card">

            <div class="avatar peer-avatar">
                ${peer.name.charAt(0)}
            </div>

            <div class="peer-result-info">

                <h3>
                    ${peer.name}
                </h3>

                <p>
                    ${peer.year}
                    •
                    ${
                        peer.online
                            ? "Online available"
                            : "In person"
                    }
                </p>

                <div class="tags">

                    ${
                        peer.subjects
                            .map(
                                subject =>
                                    `<span>${subject}</span>`
                            )
                            .join("")
                    }

                </div>

            </div>

            <div class="peer-result-right">

                <span
                    class="${
                        peer.availability.includes(
                            "Available"
                        )
                            ? "available"
                            : "busy"
                    }">

                    ${peer.availability}

                </span>

                <button
                    class="primary-button"
                    onclick="viewPeer('${peer.name}')">

                    View profile

                </button>

            </div>

        </div>

    `;
}


/* =========================================================
   RECOMMENDED PEERS
   ========================================================= */

function renderRecommended() {

    const box =
        document.getElementById(
            "recommendedPeers"
        );


    if (!box) {
        return;
    }


    box.innerHTML =
        peers
            .slice(0, 3)
            .map(
                peer => `

                    <div class="peer">

                        <div class="avatar peer-avatar">
                            ${peer.name.charAt(0)}
                        </div>

                        <div class="peer-info">

                            <strong>
                                ${peer.name}
                            </strong>

                            <span>
                                ${peer.subjects
                                    .slice(0, 2)
                                    .join(" • ")}
                            </span>

                        </div>

                        <span
                            class="${
                                peer.availability.includes(
                                    "Available"
                                )
                                    ? "available"
                                    : "busy"
                            }">

                            ${peer.availability}

                        </span>

                    </div>

                `
            )
            .join("");
}


/* =========================================================
   VIEW PEER PROFILE
   ========================================================= */

/*
   IMPORTANT FIX:

   Clicking "View profile" ONLY opens the profile.

   It does NOT book anything.

   Booking is a separate button.
*/

function viewPeer(name) {

    const peer =
        peers.find(
            item => item.name === name
        );


    if (!peer) {
        return;
    }


    selectedPeer = peer;


    showModal(`

        <h2>
            ${peer.name}
        </h2>

        <p>
            ${peer.year}
            •
            ${
                peer.online
                    ? "Online or in person"
                    : "In person"
            }
        </p>

        <p>
            ${peer.bio}
        </p>

        <div
            class="tags"
            style="margin-top:15px">

            ${
                peer.subjects
                    .map(
                        subject =>
                            `<span>${subject}</span>`
                    )
                    .join("")
            }

        </div>

        <div class="online-box">

            <strong>
                ${peer.availability}
            </strong>

            <p style="margin-top:5px">

                Topics they can help with:
                ${peer.topics.join(", ")}

            </p>

        </div>

        <div class="modal-actions">

            <button
                class="secondary-button"
                onclick="closeModal()">

                Close

            </button>

            <button
                class="primary-button"
                onclick="bookSession('${peer.name}')">

                Book session

            </button>

        </div>

    `);
}


/* =========================================================
   BOOK SESSION
   ========================================================= */

function bookSession(name) {

    const peer =
        peers.find(
            item => item.name === name
        );


    if (!peer) {
        return;
    }


    showModal(`

        <h2>
            Book with ${peer.name}
        </h2>

        <p>
            Select a session type and time.
        </p>

        <div class="signup-step">

            <select id="sessionType">

                <option>
                    In person
                </option>

                <option>
                    Online tutoring
                </option>

            </select>

            <select id="sessionTime">

                <option>
                    Today • 3:30 PM
                </option>

                <option>
                    Today • 4:15 PM
                </option>

                <option>
                    Tomorrow • 3:30 PM
                </option>

            </select>

        </div>

        <div class="modal-actions">

            <button
                class="secondary-button"
                onclick="viewPeer('${peer.name}')">

                Back

            </button>

            <button
                class="primary-button"
                onclick="confirmBooking('${peer.name}')">

                Confirm booking

            </button>

        </div>

    `);
}


function confirmBooking(name) {

    const sessionType =
        document.getElementById(
            "sessionType"
        );


    const sessionTime =
        document.getElementById(
            "sessionTime"
        );


    const online =
        sessionType?.value ===
        "Online tutoring";


    const selectedTime =
        sessionTime?.value ||
        "Scheduled session";


    if (currentUser) {

        currentUser.sessions =
            (currentUser.sessions || 0) + 1;

        addPoints(2);

        saveCurrentUser();

        loadUserData();
    }


    showModal(`

        <h2>
            Session booked ✓
        </h2>

        <p>
            Your session with
            <strong>${name}</strong>
            has been booked.
        </p>

        <p>
            ${selectedTime}
        </p>

        ${
            online
                ? `
                    <div class="online-box">

                        <strong>
                            Online tutoring
                        </strong>

                        <p>
                            When the session begins,
                            both students will see
                            the meeting option.
                        </p>

                    </div>
                `
                : `
                    <div class="online-box">

                        <strong>
                            In-person session
                        </strong>

                        <p>
                            Meet at the
                            school-approved location.
                        </p>

                    </div>
                `
        }

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()">

                Done

            </button>

        </div>

    `);
}


/* =========================================================
   PROFILE
   ========================================================= */

function editProfile() {

    showModal(`

        <h2>
            Edit profile
        </h2>

        <p>
            Your profile settings can be connected
            to the student database in the full version.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()">

                Done

            </button>

        </div>

    `);
}


/* =========================================================
   RESOURCES
   ========================================================= */

function resourceNotice(title) {

    showModal(`

        <h2>
            ${title}
        </h2>

        <p>
            This section is ready for links to
            St Oran's approved learning resources.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()">

                Close

            </button>

        </div>

    `);
}


/* =========================================================
   POMODORO
   ========================================================= */

function formatTime(seconds) {

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}


function setPomodoroMode(mode) {

    clearInterval(pomodoroTimer);

    pomodoroRunning = false;

    pomodoroMode = mode;


    if (mode === "focus") {

        pomodoroSeconds =
            25 * 60;

    } else if (mode === "short") {

        pomodoroSeconds =
            5 * 60;

    } else if (mode === "long") {

        pomodoroSeconds =
            15 * 60;

    } else if (mode === "custom") {

        if (
            !pomodoroSeconds ||
            pomodoroSeconds <= 0
        ) {

            pomodoroSeconds =
                25 * 60;
        }
    }


    pomodoroTotalSeconds =
        pomodoroSeconds;


    updatePomodoroDisplay();
}


function updatePomodoroDisplay() {

    const display =
        document.getElementById(
            "pomodoroTime"
        );


    if (display) {

        display.textContent =
            formatTime(
                pomodoroSeconds
            );
    }


    const button =
        document.getElementById(
            "pomodoroStart"
        );


    if (button) {

        button.textContent =
            pomodoroRunning
                ? "Pause"
                : "Start";
    }
}


function startPomodoro() {

    if (pomodoroRunning) {

        pausePomodoro();

        return;
    }


    pomodoroRunning = true;

    updatePomodoroDisplay();


    clearInterval(pomodoroTimer);


    pomodoroTimer =
        setInterval(
            () => {

                if (
                    pomodoroSeconds <= 0
                ) {

                    finishPomodoro();

                    return;
                }


                pomodoroSeconds--;

                updatePomodoroDisplay();

            },
            1000
        );
}


function pausePomodoro() {

    clearInterval(
        pomodoroTimer
    );

    pomodoroRunning = false;

    updatePomodoroDisplay();
}


function resetPomodoro() {

    clearInterval(
        pomodoroTimer
    );

    pomodoroRunning = false;

    pomodoroSeconds =
        pomodoroTotalSeconds;

    updatePomodoroDisplay();
}


function finishPomodoro() {

    clearInterval(
        pomodoroTimer
    );

    pomodoroRunning = false;


    const completedSeconds =
        pomodoroTotalSeconds;


    const completedMinutes =
        Math.round(
            completedSeconds / 60
        );


    if (
        pomodoroMode === "focus"
        ||
        pomodoroMode === "custom"
    ) {

        completedPomodoros++;

        studyMinutesThisVisit +=
            completedMinutes;


        if (currentUser) {

            currentUser.studySessions =
                (currentUser.studySessions || 0) + 1;

            currentUser.studyMinutes =
                (currentUser.studyMinutes || 0) +
                completedMinutes;


            addPoints(5);

            saveCurrentUser();

            loadUserData();
        }
    }


    alert(
        "Study session complete! 🐉"
    );


    setPomodoroMode("short");
}


function changePomodoroTime() {

    pausePomodoro();


    const currentMinutes =
        Math.max(
            1,
            Math.round(
                pomodoroTotalSeconds / 60
            )
        );


    const input =
        prompt(
            "How many minutes should the timer be?",
            currentMinutes
        );


    if (input === null) {
        return;
    }


    const minutes =
        Number(input);


    if (
        !Number.isFinite(minutes) ||
        minutes < 1 ||
        minutes > 180
    ) {

        alert(
            "Please enter a number between 1 and 180 minutes."
        );

        return;
    }


    pomodoroMode = "custom";

    pomodoroSeconds =
        Math.round(minutes * 60);

    pomodoroTotalSeconds =
        pomodoroSeconds;


    updatePomodoroDisplay();
}


/* =========================================================
   OLD START TIMER SUPPORT
   ========================================================= */

function startTimer() {

    let seconds =
        25 * 60;


    showModal(`

        <h2>
            Study timer
        </h2>

        <div
            class="online-screen"
            id="timerDisplay">

            25:00

        </div>

        <div class="modal-actions">

            <button
                class="primary-button"
                id="timerButton"
                onclick="runTimer()">

                Start

            </button>

        </div>

    `);


    window.timerSeconds =
        seconds;
}


function runTimer() {

    clearInterval(
        window.timerInterval
    );


    const button =
        document.getElementById(
            "timerButton"
        );


    if (button) {
        button.textContent =
            "Running...";
    }


    window.timerInterval =
        setInterval(
            () => {

                window.timerSeconds--;


                const display =
                    document.getElementById(
                        "timerDisplay"
                    );


                if (!display) {

                    clearInterval(
                        window.timerInterval
                    );

                    return;
                }


                display.textContent =
                    formatTime(
                        window.timerSeconds
                    );


                if (
                    window.timerSeconds <= 0
                ) {

                    clearInterval(
                        window.timerInterval
                    );

                    display.textContent =
                        "00:00";

                    alert(
                        "Study session complete! 🐉"
                    );
                }

            },
            1000
        );
}


/* =========================================================
   PROGRESS CHART
   ========================================================= */

function drawChart() {

    const canvas =
        document.getElementById(
            "progressChart"
        );


    if (
        !canvas ||
        !currentUser
    ) {
        return;
    }


    const values =
        Array.isArray(
            currentUser.progressHistory
        )
            ? currentUser.progressHistory
            : [currentUser.points || 0];


    if (!values.length) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    const ratio =
        window.devicePixelRatio || 1;


    const width =
        canvas.clientWidth ||
        500;


    const height =
        270;


    canvas.width =
        width * ratio;

    canvas.height =
        height * ratio;


    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const max =
        Math.max(
            ...values
        );


    const min =
        Math.min(
            ...values
        );


    const pad = 35;


    ctx.font =
        "11px DM Sans";


    ctx.strokeStyle =
        "#ddd6c8";


    ctx.fillStyle =
        "#918b81";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const y =
            pad +
            i *
            (
                (height - pad * 1.6) /
                4
            );


        ctx.beginPath();

        ctx.moveTo(
            pad,
            y
        );

        ctx.lineTo(
            width - pad,
            y
        );

        ctx.stroke();


        const value =
            Math.round(
                max -
                (
                    (max - min) *
                    i /
                    4
                )
            );


        ctx.fillText(
            value,
            5,
            y + 4
        );
    }


    ctx.strokeStyle =
        "#7d3343";

    ctx.lineWidth =
        3;


    ctx.beginPath();


    values.forEach(
        (value, index) => {

            const x =
                pad +
                index *
                (
                    (width - pad * 2) /
                    Math.max(
                        1,
                        values.length - 1
                    )
                );


            const y =
                pad +
                (
                    (max - value) /
                    (max - min || 1)
                ) *
                (
                    height -
                    pad * 1.6
                );


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


    ctx.stroke();


    ctx.fillStyle =
        "#c9a653";


    values.forEach(
        (value, index) => {

            const x =
                pad +
                index *
                (
                    (width - pad * 2) /
                    Math.max(
                        1,
                        values.length - 1
                    )
                );


            const y =
                pad +
                (
                    (max - value) /
                    (max - min || 1)
                ) *
                (
                    height -
                    pad * 1.6
                );


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    );
}


/* =========================================================
   MODALS
   ========================================================= */

function showModal(html) {

    const modal =
        document.getElementById(
            "modal"
        );


    const content =
        document.getElementById(
            "modalContent"
        );


    if (!modal || !content) {

        alert(
            "The modal element is missing from the HTML."
        );

        return;
    }


    content.innerHTML =
        html;


    modal.classList.add(
        "open"
    );
}


function closeModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (modal) {

        modal.classList.remove(
            "open"
        );
    }


    clearInterval(
        window.timerInterval
    );


    clearInterval(
        pomodoroTimer
    );
}


/* =========================================================
   RORO
   ========================================================= */

function setupRoro() {

    const roroButton =
        document.getElementById(
            "roro"
        );


    if (!roroButton) {
        return;
    }


    roroButton.addEventListener(
        "click",
        () => {

            roroSay(
                "Hi! I'm Roro! 🐉"
            );
        }
    );
}


function roroSay(message) {

    const speech =
        document.getElementById(
            "roroSpeech"
        );


    if (!speech) {
        return;
    }


    speech.textContent =
        message;


    speech.classList.add(
        "show"
    );


    clearTimeout(
        window.roroTimeout
    );


    window.roroTimeout =
        setTimeout(
            () => {

                speech.classList.remove(
                    "show"
                );

            },
            4000
        );
}


/* =========================================================
   SIGN OUT
   ========================================================= */

function signOut() {

    currentUser = null;

    clearInterval(
        pomodoroTimer
    );

    safeRemove(
        CURRENT_USER_KEY
    );


    const app =
        document.getElementById(
            "mainApp"
        );


    const login =
        document.getElementById(
            "loginScreen"
        );


    if (app) {

        app.classList.add(
            "hidden"
        );

        app.style.display =
            "none";
    }


    if (login) {

        login.classList.remove(
            "hidden"
        );

        login.style.display =
            "flex";
    }


    const password =
        document.getElementById(
            "password"
        );


    if (password) {
        password.value = "";
    }


    if (loginError) {
        loginError.style.display =
            "none";
    }
}


/* =========================================================
   CALENDAR BUTTON SUPPORT
   ========================================================= */

function setupCalendarButtons() {

    const addButtons = [

        document.getElementById(
            "addEventButton"
        ),

        document.getElementById(
            "addCalendarEventButton"
        ),

        document.getElementById(
            "addEvent"
        )

    ];


    addButtons
        .filter(Boolean)
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        addCalendarEvent();
                    }
                );
            }
        );


    const removeButtons = [

        document.getElementById(
            "removeEventButton"
        ),

        document.getElementById(
            "removeCalendarEventButton"
        ),

        document.getElementById(
            "removeEvent"
        )

    ];


    removeButtons
        .filter(Boolean)
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        removeCalendarEvent();
                    }
                );
            }
        );
}


/* =========================================================
   POMODORO BUTTON SUPPORT
   ========================================================= */

function setupPomodoro() {

    const display =
        document.getElementById(
            "pomodoroTime"
        );


    if (display) {

        display.style.cursor =
            "pointer";

        display.title =
            "Click to change timer length";


        display.addEventListener(
            "click",
            changePomodoroTime
        );
    }


    const start =
        document.getElementById(
            "pomodoroStart"
        );


    if (start) {

        start.addEventListener(
            "click",
            startPomodoro
        );
    }


    const reset =
        document.getElementById(
            "pomodoroReset"
        );


    if (reset) {

        reset.addEventListener(
            "click",
            resetPomodoro
        );
    }


    updatePomodoroDisplay();
}


/* =========================================================
   INITIALISE EVERYTHING
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
           IMPORTANT:

           We deliberately DO NOT restore the previous
           logged-in account here.

           That was the reason the website could skip
           the login screen.

           Every page load starts at LOGIN.
        */

        setupLogin();

        setupSignup();

        setupNavigation();

        setupCalendarButtons();

        setupPomodoro();

        setupRoro();


        updateDate();

        updateClock();


        setInterval(
            updateClock,
            1000
        );


        renderMiniCalendar();

        renderFullCalendar();

        renderDeadlines();

        renderRecommended();


        const searchResults =
            document.getElementById(
                "searchResults"
            );


        if (
            searchResults &&
            !searchResults.innerHTML.trim()
        ) {

            searchResults.innerHTML = `

                <div
                    class="card"
                    style="
                        text-align:center;
                        padding:50px
                    ">

                    <h2
                        style="
                            font-family:'Playfair Display',serif;
                            color:#234b38
                        ">

                        What do you need help with?

                    </h2>

                    <p class="muted">

                        Search for a subject or topic
                        to find students who can help.

                    </p>

                </div>

            `;
        }


        /*
           FORCE LOGIN SCREEN ON STARTUP.
        */

        showLogin();

    }
);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (currentUser) {
            drawChart();
        }
    }
);
