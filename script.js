/* =====================================================
   ST ORAN'S PEER HUB
   JAVASCRIPT
===================================================== */


/* =====================================================
   DEMO ACCOUNTS
===================================================== */

const demoAccounts = {

    "t.smith@storans.school.nz": {

        password: "Demo123",

        name: "Maya",

        year: "Year 8",

        points: 240,

        helped: 8,

        sessions: 12,

        badges: 3,

        subjects: [
            "Maths",
            "Algebra",
            "English",
            "Essay Writing"
        ],

        preferences:
            "Online or in-person • After school",

        history: [
            60,
            90,
            110,
            145,
            170,
            205,
            240
        ],

        assignments: [

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

        ],

        studyStreak: 6,

        totalFocusMinutes: 150

    },


    "l.worthington@storans.school.nz": {

        password: "Lucy123",

        name: "Lucy",

        year: "Year 13",

        points: 520,

        helped: 21,

        sessions: 28,

        badges: 6,

        subjects: [
            "English",
            "Essay Writing",
            "Study Skills"
        ],

        preferences:
            "In person • Lunch and after school",

        history: [
            310,
            345,
            380,
            420,
            455,
            490,
            520
        ],

        assignments: [

            {
                name: "Calculus Assessment",
                dateOffset: 2,
                priority: "High",
                icon: "C"
            },

            {
                name: "English Essay",
                dateOffset: 6,
                priority: "Medium",
                icon: "E"
            }

        ],

        studyStreak: 14,

        totalFocusMinutes: 420

    }

};


/* =====================================================
   PEERS
===================================================== */

const peers = [

    {
        name: "Lucy Worthington",
        initials: "LW",
        year: "Year 13",
        subjects: [
            "English",
            "Essay Writing",
            "Study Skills"
        ],
        availability: "Available now",
        online: true,
        topics: [
            "essay writing",
            "paragraph structure",
            "analysing texts",
            "study skills"
        ],
        rating: "4.9",
        sessions: 28
    },


    {
        name: "Aria Patel",
        initials: "AP",
        year: "Year 10",
        subjects: [
            "Maths",
            "Algebra",
            "Geometry"
        ],
        availability: "Available now",
        online: true,
        topics: [
            "expanding brackets",
            "factorising",
            "linear equations",
            "Pythagoras"
        ],
        rating: "4.8",
        sessions: 17
    },


    {
        name: "Sofia Chen",
        initials: "SC",
        year: "Year 11",
        subjects: [
            "Science",
            "Biology",
            "Chemistry"
        ],
        availability: "Later today",
        online: true,
        topics: [
            "cells",
            "genetics",
            "chemical reactions",
            "lab reports"
        ],
        rating: "4.9",
        sessions: 22
    },


    {
        name: "Ella Thompson",
        initials: "ET",
        year: "Year 9",
        subjects: [
            "Spanish",
            "Vocabulary"
        ],
        availability: "Later today",
        online: true,
        topics: [
            "Spanish vocabulary",
            "basic grammar",
            "speaking",
            "writing"
        ],
        rating: "4.7",
        sessions: 11
    },


    {
        name: "Noah Williams",
        initials: "NW",
        year: "Year 12",
        subjects: [
            "Social Studies",
            "History"
        ],
        availability: "Available now",
        online: false,
        topics: [
            "case studies",
            "essay structure",
            "research",
            "source analysis"
        ],
        rating: "4.8",
        sessions: 19
    },


    {
        name: "Amelia Kumar",
        initials: "AK",
        year: "Year 10",
        subjects: [
            "Technology",
            "Design"
        ],
        availability: "Available now",
        online: true,
        topics: [
            "design thinking",
            "prototyping",
            "laser cutting",
            "product design"
        ],
        rating: "4.9",
        sessions: 15
    }

];


/* =====================================================
   QUOTES
===================================================== */

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

    home: "Small progress is still progress.",

    calendar: "A little planning goes a long way.",

    assignments: "Start before you feel ready.",

    peers: "Learning is better together.",

    resources: "Your future self will thank you for starting today.",

    profile: "Everyone has something they can teach.",

    progress: "Look how far you've come.",

    settings: "Small changes can make a big difference.",

    study: "One focused session is enough to make today count."

};


/* =====================================================
   STATE
===================================================== */

let currentUser = null;

let currentEmail = null;

let signupDraft = {};

let currentPage = "home";

let calendarDate = new Date();

let currentAssignmentFilter = "all";

let newAccountEmail = null;

let calendarEvents = [];

let buddyHidden = false;


/* =====================================================
   POMODORO
===================================================== */

let pomodoro = {

    mode: "focus",

    seconds: 25 * 60,

    running: false,

    interval: null,

    round: 1,

    completedRounds: 0

};


/* =====================================================
   ELEMENTS
===================================================== */

const loginForm =
    document.getElementById("loginForm");

const loginScreen =
    document.getElementById("loginScreen");

const mainApp =
    document.getElementById("mainApp");

const loginError =
    document.getElementById("loginError");


/* =====================================================
   START
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();

    renderDate();

    renderMiniCalendar();

    showBuddyMessage(
        "Ready when you are! ✦"
    );

});


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener("submit", event => {

    event.preventDefault();

    loginError.style.display = "none";


    const email =
        document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();


    const password =
        document.getElementById("password").value;


    const account =
        getAccounts()[email];


    if (!email.endsWith("@storans.school.nz")) {

        return showLoginError(
            "Please use your St Oran's school email address."
        );

    }


    if (!account) {

        return showLoginError(
            "We couldn't find an account with that school email."
        );

    }


    if (password !== account.password) {

        return showLoginError(
            "Incorrect password. Please try again."
        );

    }


    login(account, email);

});


function showLoginError(message) {

    loginError.textContent = message;

    loginError.style.display = "block";

}


/* =====================================================
   ACCOUNTS
===================================================== */

function getAccounts() {

    const saved =
        JSON.parse(
            localStorage.getItem("peerHubAccounts") || "{}"
        );


    return {
        ...demoAccounts,
        ...saved
    };

}


function savePrototypeAccount(email, account) {

    const saved =
        JSON.parse(
            localStorage.getItem("peerHubAccounts") || "{}"
        );


    saved[email] = account;


    localStorage.setItem(
        "peerHubAccounts",
        JSON.stringify(saved)
    );

}


/* =====================================================
   LOGIN
===================================================== */

function login(account, email) {

    currentEmail = email;

    currentUser =
        JSON.parse(
            JSON.stringify(account)
        );


    currentUser.email = email;


    if (!currentUser.assignments) {

        currentUser.assignments = [];

    }


    if (!currentUser.history) {

        currentUser.history =
            Array(7).fill(0);

    }


    if (
        currentUser.studyStreak === undefined
    ) {

        currentUser.studyStreak = 0;

    }


    if (
        currentUser.totalFocusMinutes === undefined
    ) {

        currentUser.totalFocusMinutes = 0;

    }


    if (
        currentUser.points === undefined
    ) {

        currentUser.points = 0;

    }


    if (
        currentUser.badges === undefined
    ) {

        currentUser.badges = 0;

    }


    if (
        currentUser.sessions === undefined
    ) {

        currentUser.sessions = 0;

    }


    if (
        currentUser.helped === undefined
    ) {

        currentUser.helped = 0;

    }


    if (
        document.getElementById("rememberMe").checked
    ) {

        localStorage.setItem(
            "peerHubEmail",
            email
        );

    }


    loginScreen.style.display = "none";

    mainApp.style.display = "flex";


    updateUserUI();

    showPage("home");

}


/* =====================================================
   GOOGLE LOGIN
===================================================== */

function googleLogin() {

    showModal(`

        <h2>
            Continue with Google
        </h2>

        <p>
            This prototype simulates Google sign-in.
            The real school version should connect to St Oran's approved Google authentication.
        </p>

        <div class="modal-actions">

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

            <button
                class="primary-button"
                onclick="demoGoogleAccount()"
            >
                Use demo Google account
            </button>

        </div>

    `);

}


function demoGoogleAccount() {

    closeModal();

    login(
        demoAccounts["t.smith@storans.school.nz"],
        "t.smith@storans.school.nz"
    );

}


/* =====================================================
   FORGOT PASSWORD
===================================================== */

function forgotPassword(event) {

    event.preventDefault();


    showModal(`

        <h2>
            Password help
        </h2>

        <p>
            These are the demo accounts for this prototype:
        </p>


        <div class="login-help-box">

            <strong>
                Maya
            </strong>

            <span>
                t.smith@storans.school.nz
            </span>

            <span>
                Password:
                <b>Demo123</b>
            </span>

        </div>


        <div class="login-help-box">

            <strong>
                Lucy
            </strong>

            <span>
                l.worthington@storans.school.nz
            </span>

            <span>
                Password:
                <b>Lucy123</b>
            </span>

        </div>


        <p class="muted">
            New prototype accounts use password
            <strong>Study123</strong>.
        </p>


        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Close
            </button>

        </div>

    `);

}


/* =====================================================
   SIGN UP
===================================================== */

function showSignup(event) {

    event?.preventDefault();

    signupDraft = {};

    signupStep(1);

}


function signupStep(step) {

    let html = "";


    if (step === 1) {

        html = `

            <span class="eyebrow">
                CREATE ACCOUNT
            </span>

            <h2>
                Let's get you set up.
            </h2>

            <p>
                New accounts start completely fresh.
                No fake points, no mysterious badges, no academic accomplishments from the future.
            </p>

            <div class="signup-step">

                <input
                    id="suFirst"
                    placeholder="First name"
                >

                <input
                    id="suLast"
                    placeholder="Last name"
                >

                <input
                    id="suEmail"
                    type="email"
                    placeholder="School email"
                >

                <select id="suYear">

                    <option value="">
                        Year level
                    </option>

                    ${[
                        8,
                        9,
                        10,
                        11,
                        12,
                        13
                    ].map(year => `
                        <option>
                            Year ${year}
                        </option>
                    `).join("")}

                </select>

            </div>


            <div class="modal-actions">

                <button
                    class="primary-button"
                    onclick="signupNext(1)"
                >
                    Continue →
                </button>

            </div>

        `;

    }


    if (step === 2) {

        html = `

            <span class="eyebrow">
                YOUR STRENGTHS
            </span>

            <h2>
                What can you help with?
            </h2>

            <p>
                Choose subjects or skills you feel confident with.
                You can change these any time.
            </p>


            <div class="signup-subject-grid">

                ${[
                    "Maths",
                    "English",
                    "Science",
                    "Spanish",
                    "Social Studies",
                    "Technology",
                    "Algebra",
                    "Essay Writing",
                    "Biology",
                    "Study Skills"
                ].map(subject => `

                    <label class="subject-choice">

                        <input
                            type="checkbox"
                            name="suSubject"
                            value="${subject}"
                        >

                        <span>
                            ${subject}
                        </span>

                    </label>

                `).join("")}

            </div>


            <div class="modal-actions">

                <button
                    class="secondary-button"
                    onclick="signupStep(1)"
                >
                    Back
                </button>

                <button
                    class="primary-button"
                    onclick="signupNext(2)"
                >
                    Continue →
                </button>

            </div>

        `;

    }


    if (step === 3) {

        html = `

            <span class="eyebrow">
                AVAILABILITY
            </span>

            <h2>
                When can you help?
            </h2>

            <p>
                These can be changed later.
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
                    onclick="signupStep(2)"
                >
                    Back
                </button>

                <button
                    class="primary-button"
                    onclick="finishSignup()"
                >
                    Create profile →
                </button>

            </div>

        `;

    }


    showModal(html);

}


function signupNext(step) {

    if (step === 1) {

        const first =
            document.getElementById("suFirst").value.trim();

        const last =
            document.getElementById("suLast").value.trim();

        const email =
            document
                .getElementById("suEmail")
                .value
                .trim()
                .toLowerCase();

        const year =
            document.getElementById("suYear").value;


        if (
            !first ||
            !last ||
            !email ||
            !year
        ) {

            return alert(
                "Please complete all fields."
            );

        }


        if (
            !email.endsWith("@storans.school.nz")
        ) {

            return alert(
                "Please use your St Oran's school email address."
            );

        }


        if (getAccounts()[email]) {

            return alert(
                "That school email already has a prototype account."
            );

        }


        signupDraft = {

            first,

            last,

            email,

            year

        };


        signupStep(2);

    }


    else if (step === 2) {

        signupDraft.subjects =
            [
                ...document.querySelectorAll(
                    'input[name="suSubject"]:checked'
                )
            ].map(
                input => input.value
            );


        signupStep(3);

    }

}


/* =====================================================
   FINISH SIGNUP
===================================================== */

function finishSignup() {

    const preferences = [];


    if (
        document.getElementById("prefAfter")?.checked
    ) {

        preferences.push(
            "After school"
        );

    }


    if (
        document.getElementById("prefLunch")?.checked
    ) {

        preferences.push(
            "Lunch"
        );

    }


    if (
        document.getElementById("prefOnline")?.checked
    ) {

        preferences.push(
            "Online"
        );

    }


    if (
        document.getElementById("prefInPerson")?.checked
    ) {

        preferences.push(
            "In person"
        );

    }


    const account = {

        password: "Study123",

        name:
            `${signupDraft.first} ${signupDraft.last}`,

        year:
            signupDraft.year,

        points: 0,

        helped: 0,

        sessions: 0,

        badges: 0,

        subjects:
            signupDraft.subjects || [],

        preferences:
            preferences.length
                ? preferences.join(" • ")
                : "No preferences set yet",

        history:
            Array(7).fill(0),

        assignments: [],

        studyStreak: 0,

        totalFocusMinutes: 0,

        level: 1

    };


    savePrototypeAccount(
        signupDraft.email,
        account
    );


    newAccountEmail =
        signupDraft.email;


    closeModal();


    showModal(`

        <div class="success-icon">
            ✓
        </div>

        <span class="eyebrow">
            PROFILE READY
        </span>

        <h2>
            Welcome to Peer Hub, ${signupDraft.first}. ✦
        </h2>

        <p>
            Your journey starts at
            <strong>0 Peer Points</strong>.
        </p>

        <div class="new-account-stats">

            <span>
                <b>0</b>
                Points
            </span>

            <span>
                <b>0</b>
                Sessions
            </span>

            <span>
                <b>0</b>
                Badges
            </span>

        </div>

        <div class="login-help-box">

            <strong>
                Your prototype password
            </strong>

            <span>
                Study123
            </span>

        </div>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="enterNewAccount()"
            >
                Enter Peer Hub →
            </button>

        </div>

    `);

}


function enterNewAccount() {

    const accounts =
        getAccounts();

    login(
        accounts[newAccountEmail],
        newAccountEmail
    );

    closeModal();

}


/* =====================================================
   SIGN OUT
===================================================== */

function signOut() {

    currentUser = null;

    currentEmail = null;

    mainApp.style.display = "none";

    loginScreen.style.display = "flex";

    loginForm.reset();

    stopPomodoro();

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    showPage(
                        item.dataset.page
                    );

                }
            );

        });

}


function showPage(page) {

    currentPage = page;


    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove(
                "active-page"
            );

        });


    const target =
        document.getElementById(page);


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
                item.dataset.page === page
            );

        });


    renderPage(page);

    updateBuddyForPage(page);

}


/* =====================================================
   PAGE RENDER
===================================================== */

function renderPage(page) {

    renderPageQuote(page);


    if (page === "home") {

        renderHome();

    }


    if (page === "calendar") {

        renderCalendar();

    }


    if (page === "assignments") {

        renderAssignments();

    }


    if (page === "peers") {

        searchMainPeers();

    }


    if (page === "profile") {

        renderProfile();

    }


    if (page === "progress") {

        renderProgress();

    }


    if (page === "study") {

        renderStudyPage();

    }

}


/* =====================================================
   USER UI
===================================================== */

function updateUserUI() {

    if (!currentUser) return;


    document.getElementById(
        "topName"
    ).textContent =
        currentUser.name.split(" ")[0];


    document.getElementById(
        "topYear"
    ).textContent =
        currentUser.year;


    document.getElementById(
        "topAvatar"
    ).textContent =
        initials(currentUser.name);


    document.getElementById(
        "welcomeName"
    ).textContent =
        currentUser.name.split(" ")[0];


    document.getElementById(
        "homePoints"
    ).textContent =
        currentUser.points;


    document.getElementById(
        "homeHelped"
    ).textContent =
        `You've helped ${currentUser.helped} students this term.`;


    document.getElementById(
        "progressPoints"
    ).textContent =
        currentUser.points;


    document.getElementById(
        "progressHelped"
    ).textContent =
        currentUser.helped;


    document.getElementById(
        "progressSessions"
    ).textContent =
        currentUser.sessions;


    document.getElementById(
        "progressBadges"
    ).textContent =
        currentUser.badges;


    document.getElementById(
        "progressStreak"
    ).textContent =
        currentUser.studyStreak;


    document.getElementById(
        "studyStreak"
    ).textContent =
        currentUser.studyStreak;


    document.getElementById(
        "profileAvatar"
    ).textContent =
        initials(currentUser.name);


    document.getElementById(
        "profileName"
    ).textContent =
        currentUser.name;


    document.getElementById(
        "profileYear"
    ).textContent =
        `${currentUser.year}`;


    document.getElementById(
        "settingsEmail"
    ).textContent =
        currentUser.email;


    renderProfile();

    renderHome();

    renderProgress();

}


/* =====================================================
   HOME
===================================================== */

function renderHome() {

    if (!currentUser) return;


    document.getElementById(
        "greeting"
    ).textContent =
        greeting();


    document.getElementById(
        "homeQuote"
    ).textContent =
        dailyQuote();


    renderMiniCalendar();

    renderDeadlines();

    renderRecommendedPeers();


    const percent =
        Math.min(
            100,
            (currentUser.points % 100)
        );


    document.getElementById(
        "homeProgressFill"
    ).style.width =
        `${percent}%`;


    const level =
        getLevel();


    document.getElementById(
        "homeProgressCaption"
    ).textContent =
        `${level.pointsIntoLevel} / 100 points until Level ${level.level + 1}.`;

}


function renderDeadlines() {

    const container =
        document.getElementById(
            "deadlineList"
        );


    if (!container) return;


    if (
        !currentUser.assignments ||
        currentUser.assignments.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-small">

                <span>
                    ✓
                </span>

                <p>
                    No assignments yet.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        currentUser.assignments
            .slice(0, 4)
            .map(assignment => `

                <div class="task-item">

                    <div class="task-subject">
                        ${assignment.icon}
                    </div>

                    <div class="task-info">

                        <strong>
                            ${assignment.name}
                        </strong>

                        <span>
                            Due in ${assignment.dateOffset} day${assignment.dateOffset === 1 ? "" : "s"}
                        </span>

                    </div>

                    <span class="priority ${assignment.priority.toLowerCase()}">
                        ${assignment.priority}
                    </span>

                </div>

            `)
            .join("");

}


function renderRecommendedPeers() {

    const container =
        document.getElementById(
            "recommendedPeers"
        );


    if (!container) return;


    container.innerHTML =
        peers.slice(0, 3)
            .map(peer => `

                <div class="peer-row">

                    <div class="avatar avatar-small">
                        ${peer.initials}
                    </div>

                    <div class="peer-row-info">

                        <strong>
                            ${peer.name}
                        </strong>

                        <span>
                            ${peer.subjects.slice(0, 3).join(" · ")}
                        </span>

                    </div>

                    <span class="peer-availability">
                        ${peer.availability}
                    </span>

                </div>

            `)
            .join("");

}


/* =====================================================
   DATE
===================================================== */

function renderDate() {

    const now = new Date();


    document.getElementById(
        "todayLabel"
    ).textContent =
        now.toLocaleDateString(
            "en-NZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    document.getElementById(
        "studyDate"
    ).textContent =
        now.toLocaleDateString(
            "en-NZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

}


function greeting() {

    const hour =
        new Date().getHours();


    if (hour < 12)
        return "Good morning";


    if (hour < 18)
        return "Good afternoon";


    return "Good evening";

}


/* =====================================================
   CALENDAR
===================================================== */

function renderMiniCalendar() {

    const container =
        document.getElementById(
            "miniCalendar"
        );


    if (!container) return;


    const now =
        new Date();


    const year =
        now.getFullYear();

    const month =
        now.getMonth();


    document.getElementById(
        "monthTitle"
    ).textContent =
        now.toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        );


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


    let start =
        first.getDay();

    start =
        start === 0
            ? 6
            : start - 1;


    let html = "";


    for (
        let i = 0;
        i < start;
        i++
    ) {

        html += `
            <span class="empty-day"></span>
        `;

    }


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const today =
            day === now.getDate();


        html += `

            <span
                class="${today ? "today-number" : ""}"
            >
                ${day}
            </span>

        `;

    }


    container.innerHTML =
        html;

}


function renderCalendar() {

    const calendar =
        document.getElementById(
            "fullCalendar"
        );


    const title =
        document.getElementById(
            "fullMonthTitle"
        );


    if (!calendar || !title)
        return;


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    title.textContent =
        calendarDate.toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        );


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    let start =
        firstDay.getDay();


    start =
        start === 0
            ? 6
            : start - 1;


    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const names = [
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT",
        "SUN"
    ];


    let html =
        names
            .map(
                name =>
                    `<div class="day-name">${name}</div>`
            )
            .join("");


    for (
        let i = 0;
        i < start;
        i++
    ) {

        html += `
            <div class="calendar-empty"></div>
        `;

    }


    const today =
        new Date();


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();


        html += `

            <div
                class="${isToday ? "current" : ""}"
            >

                <strong>
                    ${day}
                </strong>

            </div>

        `;

    }


    calendar.innerHTML =
        html;

}


function changeMonth(amount) {

    calendarDate.setMonth(
        calendarDate.getMonth() + amount
    );


    renderCalendar();

}


function showAddEvent() {

    showModal(`

        <h2>
            Add calendar event
        </h2>

        <p>
            Calendar events are saved for this prototype session.
        </p>

        <div class="signup-step">

            <input
                id="eventName"
                placeholder="Event name"
            >

            <input
                id="eventDate"
                type="date"
            >

        </div>

        <div class="modal-actions">

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

            <button
                class="primary-button"
                onclick="addEvent()"
            >
                Add event
            </button>

        </div>

    `);

}


function addEvent() {

    const name =
        document.getElementById(
            "eventName"
        ).value.trim();


    const date =
        document.getElementById(
            "eventDate"
        ).value;


    if (!name || !date) {

        return alert(
            "Please enter an event name and date."
        );

    }


    calendarEvents.push({
        name,
        date
    });


    closeModal();

    alert(
        "Event added to your calendar."
    );

}


/* =====================================================
   ASSIGNMENTS
===================================================== */

function renderAssignments() {

    const container =
        document.getElementById(
            "assignmentPageList"
        );


    if (!container) return;


    let list =
        [...currentUser.assignments];


    if (
        currentAssignmentFilter === "upcoming"
    ) {

        list =
            list.filter(
                item => !item.complete
            );

    }


    if (
        currentAssignmentFilter === "complete"
    ) {

        list =
            list.filter(
                item => item.complete
            );

    }


    if (!list.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✓
                </div>

                <h3>
                    Nothing here yet
                </h3>

                <p>
                    Add an assignment when you have one.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        list.map((item, index) => `

            <div class="assignment-card">

                <button
                    class="assignment-check"
                    onclick="toggleAssignment(${index})"
                >
                    ${item.complete ? "✓" : ""}
                </button>

                <div class="assignment-info">

                    <strong>
                        ${item.name}
                    </strong>

                    <span>
                        ${item.complete ? "Complete" : "In progress"}
                    </span>

                </div>

                <div class="assignment-date">

                    <strong>
                        ${item.dateOffset}
                        day${item.dateOffset === 1 ? "" : "s"}
                    </strong>

                    <span>
                        remaining
                    </span>

                </div>

                <span
                    class="priority ${item.priority.toLowerCase()}"
                >
                    ${item.priority}
                </span>

            </div>

        `).join("");

}


function filterAssignments(filter, button) {

    currentAssignmentFilter =
        filter;


    document
        .querySelectorAll(".filter-tab")
        .forEach(tab =>
            tab.classList.remove("active")
        );


    button.classList.add("active");


    renderAssignments();

}


function toggleAssignment(index) {

    const assignment =
        currentUser.assignments[index];


    assignment.complete =
        !assignment.complete;


    if (assignment.complete) {

        addPoints(2);

    }


    saveCurrentUser();

    renderAssignments();

    renderHome();

}


function showAddAssignment() {

    showModal(`

        <h2>
            Add assignment
        </h2>

        <p>
            Add something you need to keep track of.
        </p>

        <div class="signup-step">

            <input
                id="assignmentName"
                placeholder="e.g. Algebra practice"
            >

            <input
                id="assignmentDays"
                type="number"
                min="0"
                placeholder="Days until due"
            >

            <select id="assignmentPriority">

                <option>
                    High
                </option>

                <option selected>
                    Medium
                </option>

                <option>
                    Low
                </option>

            </select>

        </div>


        <div class="modal-actions">

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

            <button
                class="primary-button"
                onclick="addAssignment()"
            >
                Add assignment
            </button>

        </div>

    `);

}


function addAssignment() {

    const name =
        document.getElementById(
            "assignmentName"
        ).value.trim();


    const days =
        Number(
            document.getElementById(
                "assignmentDays"
            ).value
        );


    const priority =
        document.getElementById(
            "assignmentPriority"
        ).value;


    if (!name || Number.isNaN(days)) {

        return alert(
            "Please complete the assignment details."
        );

    }


    currentUser.assignments.push({

        name,

        dateOffset: days,

        priority,

        icon:
            name.charAt(0).toUpperCase(),

        complete: false

    });


    saveCurrentUser();

    closeModal();

    renderAssignments();

    renderHome();

}


/* =====================================================
   PEERS
===================================================== */

function searchMainPeers() {

    const search =
        (
            document.getElementById(
                "mainPeerSearch"
            )?.value || ""
        )
        .toLowerCase()
        .trim();


    const subject =
        document.getElementById(
            "subjectFilter"
        )?.value || "";


    const year =
        document.getElementById(
            "yearFilter"
        )?.value || "";


    const availability =
        document.getElementById(
            "availabilityFilter"
        )?.value || "";


    const online =
        document.getElementById(
            "onlineFilter"
        )?.checked || false;


    const results =
        peers.filter(peer => {

            const searchable =
                [
                    peer.name,
                    peer.year,
                    ...peer.subjects,
                    ...peer.topics
                ]
                .join(" ")
                .toLowerCase();


            const searchMatch =
                !search ||
                searchable.includes(search);


            const subjectMatch =
                !subject ||
                peer.subjects.includes(subject);


            const yearMatch =
                !year ||
                peer.year === year;


            const availabilityMatch =
                !availability ||
                (
                    availability === "Online"
                    ? peer.online
                    : peer.availability === availability
                );


            const onlineMatch =
                !online ||
                peer.online;


            return (
                searchMatch &&
                subjectMatch &&
                yearMatch &&
                availabilityMatch &&
                onlineMatch
            );

        });


    renderPeerResults(results);

}


function renderPeerResults(results) {

    const container =
        document.getElementById(
            "searchResults"
        );


    if (!container) return;


    if (!results.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ⌕
                </div>

                <h3>
                    No peers found
                </h3>

                <p>
                    Try another topic or filter.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        results.map((peer, index) => `

            <div class="peer-result-card">

                <div class="avatar">
                    ${peer.initials}
                </div>

                <div class="peer-result-info">

                    <h3>
                        ${peer.name}
                    </h3>

                    <p>
                        ${peer.year}
                    </p>

                    <div class="subject-tags">

                        ${peer.subjects.map(subject => `

                            <span class="subject-tag">
                                ${subject}
                            </span>

                        `).join("")}

                    </div>

                    <small>
                        ★ ${peer.rating}
                        · ${peer.sessions} sessions
                    </small>

                </div>

                <div class="peer-result-right">

                    ${
                        peer.online
                            ? `<span class="online-badge">Online</span>`
                            : ""
                    }

                    <button
                        class="primary-button"
                        onclick="viewPeer(${index})"
                    >
                        View profile
                    </button>

                </div>

            </div>

        `).join("");

}


function viewPeer(index) {

    const peer =
        peers[index];


    showModal(`

        <div class="peer-profile-modal">

            <div class="avatar large-modal-avatar">
                ${peer.initials}
            </div>

            <span class="eyebrow">
                ${peer.year}
            </span>

            <h2>
                ${peer.name}
            </h2>

            <p>
                ★ ${peer.rating}
                · ${peer.sessions} sessions
            </p>


            <div class="modal-section">

                <h3>
                    Can help with
                </h3>

                <div class="subject-tags">

                    ${peer.topics.map(topic => `

                        <span class="subject-tag">
                            ${topic}
                        </span>

                    `).join("")}

                </div>

            </div>


            <div class="modal-section">

                <h3>
                    Availability
                </h3>

                <p>
                    ${peer.availability}
                    ${peer.online ? " · Online available" : ""}
                </p>

            </div>


            <button
                class="primary-button full-width"
                onclick="showBooking('${peer.name}')"
            >
                Book a session
            </button>

        </div>

    `);

}


function showBooking(name) {

    showModal(`

        <span class="eyebrow">
            BOOK A SESSION
        </span>

        <h2>
            Study with ${name}
        </h2>

        <p>
            Choose a session time.
        </p>


        <div class="booking-options">

            <button
                class="booking-option"
                onclick="confirmBooking('${name}', 'Monday · 3:30 PM')"
            >
                Monday · 3:30 PM
                <span>30 min →</span>
            </button>

            <button
                class="booking-option"
                onclick="confirmBooking('${name}', 'Wednesday · 4:00 PM')"
            >
                Wednesday · 4:00 PM
                <span>30 min →</span>
            </button>

            <button
                class="booking-option"
                onclick="confirmBooking('${name}', 'Friday · 3:30 PM')"
            >
                Friday · 3:30 PM
                <span>30 min →</span>
            </button>

        </div>


        <button
            class="secondary-button full-width"
            onclick="startOnlineSession('${name}')"
        >
            Book online tutoring
        </button>

    `);

}


function confirmBooking(name, time) {

    addPoints(2);

    closeModal();

    showBuddyMessage(
        `Session booked! 🎓`
    );


    showModal(`

        <div class="success-icon">
            ✓
        </div>

        <h2>
            Session booked!
        </h2>

        <p>
            Your session with
            <strong>${name}</strong>
            is booked for
            <strong>${time}</strong>.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Done
            </button>

        </div>

    `);

}


function startOnlineSession(name) {

    showModal(`

        <span class="eyebrow">
            ONLINE TUTORING
        </span>

        <h2>
            ${name}'s online room
        </h2>

        <div class="online-screen">

            <div>

                <div class="online-avatar">
                    ${initials(name)}
                </div>

                <p>
                    Video tutoring room
                </p>

                <small>
                    This is a prototype preview.
                </small>

            </div>

        </div>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Leave room
            </button>

        </div>

    `);

}


/* =====================================================
   RESOURCES
===================================================== */

function resourceNotice(name) {

    showModal(`

        <span class="eyebrow">
            ${name.toUpperCase()}
        </span>

        <h2>
            School resources
        </h2>

        <p>
            In the full version, this section would connect directly to St Oran's existing learning resources.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Close
            </button>

        </div>

    `);

}


/* =====================================================
   PROFILE
===================================================== */

function renderProfile() {

    if (!currentUser) return;


    document.getElementById(
        "profileTags"
    ).innerHTML =
        currentUser.subjects.length
            ? currentUser.subjects.map(subject => `
                <span class="subject-tag">
                    ${subject}
                </span>
            `).join("")
            : `
                <span class="subject-tag">
                    Add subjects
                </span>
            `;


    document.getElementById(
        "profilePreferences"
    ).textContent =
        currentUser.preferences;

}


function editProfile() {

    showModal(`

        <h2>
            Edit profile
        </h2>

        <p>
            Profile editing will connect to the school account in the full version.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Close
            </button>

        </div>

    `);

}


/* =====================================================
   POMODORO
===================================================== */

function renderStudyPage() {

    updatePomodoroDisplay();

    updateBuddyForPage("study");

}


function setPomodoroMode(mode) {

    stopPomodoro();


    pomodoro.mode =
        mode;


    pomodoro.seconds =
        mode === "focus"
            ? 25 * 60
            : 5 * 60;


    document
        .getElementById("focusTab")
        .classList.toggle(
            "active",
            mode === "focus"
        );


    document
        .getElementById("breakTab")
        .classList.toggle(
            "active",
            mode === "break"
        );


    updatePomodoroDisplay();

}


function togglePomodoro() {

    if (pomodoro.running) {

        pausePomodoro();

    } else {

        startPomodoro();

    }

}


function startPomodoro() {

    pomodoro.running = true;


    document.getElementById(
        "pomodoroButton"
    ).textContent =
        "Pause";


    showBuddyMessage(
        pomodoro.mode === "focus"
            ? "Let's focus. You've got this! ✦"
            : "Tiny break. Breathe. Stretch. ✦"
    );


    pomodoro.interval =
        setInterval(
            pomodoroTick,
            1000
        );

}


function pausePomodoro() {

    pomodoro.running = false;


    clearInterval(
        pomodoro.interval
    );


    document.getElementById(
        "pomodoroButton"
    ).textContent =
        "Resume";


    showBuddyMessage(
        "Paused. Your work isn't going anywhere. ✦"
    );

}


function stopPomodoro() {

    pomodoro.running = false;


    clearInterval(
        pomodoro.interval
    );


    pomodoro.interval = null;

}


function pomodoroTick() {

    pomodoro.seconds--;


    updatePomodoroDisplay();


    if (
        pomodoro.seconds <= 0
    ) {

        finishPomodoro();

    }

}


function finishPomodoro() {

    stopPomodoro();


    if (
        pomodoro.mode === "focus"
    ) {

        currentUser.points += 5;

        currentUser.studyStreak += 1;

        currentUser.totalFocusMinutes += 25;

        currentUser.sessions += 1;


        pomodoro.completedRounds++;


        checkBadges();


        saveCurrentUser();


        celebrateBuddy();


        showModal(`

            <div class="celebration">

                <div class="celebration-star">
                    ✦
                </div>

                <span class="eyebrow">
                    FOCUS ROUND COMPLETE
                </span>

                <h2>
                    You did it! 🎉
                </h2>

                <p>
                    25 minutes completed.
                    You've earned
                    <strong>+5 Peer Points</strong>.
                </p>

                <div class="earned-points">
                    +5
                </div>

                <button
                    class="primary-button full-width"
                    onclick="closeModal(); setPomodoroMode('break'); startPomodoro();"
                >
                    Start 5 minute break
                </button>

            </div>

        `);

    }


    else {

        showBuddyMessage(
            "Break complete. Ready for another round? ✦"
        );


        setPomodoroMode("focus");

    }


    updateUserUI();

}


function resetPomodoro() {

    stopPomodoro();


    pomodoro.seconds =
        pomodoro.mode === "focus"
            ? 25 * 60
            : 5 * 60;


    document.getElementById(
        "pomodoroButton"
    ).textContent =
        pomodoro.mode === "focus"
            ? "Start focus"
            : "Start break";


    updatePomodoroDisplay();

}


function updatePomodoroDisplay() {

    const minutes =
        Math.floor(
            pomodoro.seconds / 60
        );


    const seconds =
        pomodoro.seconds % 60;


    document.getElementById(
        "pomodoroDisplay"
    ).textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    document.getElementById(
        "pomodoroMode"
    ).textContent =
        pomodoro.mode === "focus"
            ? "FOCUS SESSION"
            : "SHORT BREAK";


    document.getElementById(
        "pomodoroRound"
    ).textContent =
        `Round ${pomodoro.round} of 4`;

}


/* =====================================================
   GAMIFICATION
===================================================== */

function getLevel() {

    const level =
        Math.floor(
            currentUser.points / 100
        ) + 1;


    const pointsIntoLevel =
        currentUser.points % 100;


    return {
        level,
        pointsIntoLevel
    };

}


function checkBadges() {

    const possibleBadges = [

        {
            condition:
                currentUser.totalFocusMinutes >= 25,
            name: "First Focus"
        },

        {
            condition:
                currentUser.totalFocusMinutes >= 125,
            name: "Study Starter"
        },

        {
            condition:
                currentUser.helped >= 1,
            name: "Peer Helper"
        },

        {
            condition:
                currentUser.studyStreak >= 5,
            name: "On a Roll"
        },

        {
            condition:
                currentUser.points >= 500,
            name: "Peer Champion"
        }

    ];


    const earned =
        possibleBadges.filter(
            badge => badge.condition
        ).length;


    currentUser.badges =
        Math.max(
            currentUser.badges,
            earned
        );

}


function renderProgress() {

    if (!currentUser) return;


    const level =
        getLevel();


    document.getElementById(
        "progressLevel"
    ).textContent =
        level.level;


    document.getElementById(
        "levelPercent"
    ).textContent =
        `${level.pointsIntoLevel}%`;


    document.getElementById(
        "levelProgressFill"
    ).style.width =
        `${level.pointsIntoLevel}%`;


    document.getElementById(
        "levelCaption"
    ).textContent =
        `${level.pointsIntoLevel} / 100 points until Level ${level.level + 1}.`;


    drawProgressChart();

    renderBadges();

}


function drawProgressChart() {

    const canvas =
        document.getElementById(
            "progressChart"
        );


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const width =
        canvas.width =
            canvas.clientWidth * 2;


    const height =
        canvas.height =
            canvas.clientHeight * 2;


    ctx.scale(2, 2);


    const w =
        canvas.clientWidth;

    const h =
        canvas.clientHeight;


    ctx.clearRect(
        0,
        0,
        w,
        h
    );


    const values =
        currentUser.history.length
            ? currentUser.history
            : [0, 0, 0, 0, 0, 0, 0];


    const max =
        Math.max(
            100,
            ...values
        );


    const padding = 35;


    ctx.strokeStyle =
        "#e5ddd0";

    ctx.lineWidth =
        1;


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const y =
            padding +
            ((h - padding * 2) / 3) * i;


        ctx.beginPath();

        ctx.moveTo(
            padding,
            y
        );

        ctx.lineTo(
            w - padding,
            y
        );

        ctx.stroke();

    }


    const points =
        values.map(
            (value, index) => {

                const x =
                    padding +
                    (
                        (w - padding * 2) /
                        (values.length - 1)
                    ) *
                    index;


                const y =
                    h -
                    padding -
                    (
                        value / max
                    ) *
                    (
                        h - padding * 2
                    );


                return {
                    x,
                    y
                };

            }
        );


    ctx.beginPath();


    points.forEach(
        (point, index) => {

            if (index === 0) {

                ctx.moveTo(
                    point.x,
                    point.y
                );

            } else {

                ctx.lineTo(
                    point.x,
                    point.y
                );

            }

        }
    );


    ctx.strokeStyle =
        "#234b38";

    ctx.lineWidth =
        3;

    ctx.stroke();


    points.forEach(
        point => {

            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#fffdf8";

            ctx.fill();

            ctx.strokeStyle =
                "#234b38";

            ctx.stroke();

        }
    );

}


/* =====================================================
   BADGES
===================================================== */

function renderBadges() {

    const container =
        document.getElementById(
            "badgesGrid"
        );


    if (!container) return;


    const badges = [

        {
            icon: "🌱",
            title: "First Focus",
            description: "Complete your first focus round",
            unlocked:
                currentUser.totalFocusMinutes >= 25
        },

        {
            icon: "📚",
            title: "Study Starter",
            description: "Complete 5 focus rounds",
            unlocked:
                currentUser.totalFocusMinutes >= 125
        },

        {
            icon: "🤝",
            title: "Peer Helper",
            description: "Help your first student",
            unlocked:
                currentUser.helped >= 1
        },

        {
            icon: "🔥",
            title: "On a Roll",
            description: "Reach a 5 round study streak",
            unlocked:
                currentUser.studyStreak >= 5
        },

        {
            icon: "⭐",
            title: "Peer Champion",
            description: "Reach 500 Peer Points",
            unlocked:
                currentUser.points >= 500
        }

    ];


    container.innerHTML =
        badges.map(badge => `

            <div
                class="badge-card ${badge.unlocked ? "unlocked" : "locked"}"
            >

                <div class="badge-icon">
                    ${badge.icon}
                </div>

                <h3>
                    ${badge.title}
                </h3>

                <p>
                    ${badge.description}
                </p>

                <small>
                    ${
                        badge.unlocked
                            ? "✓ Unlocked"
                            : "Locked"
                    }
                </small>

            </div>

        `).join("");

}


/* =====================================================
   POINTS
===================================================== */

function addPoints(amount) {

    if (!currentUser) return;


    currentUser.points += amount;


    const history =
        currentUser.history;


    history[history.length - 1] =
        currentUser.points;


    checkBadges();

    saveCurrentUser();

    updateUserUI();

}


/* =====================================================
   SAVE USER
===================================================== */

function saveCurrentUser() {

    if (!currentUser || !currentEmail)
        return;


    savePrototypeAccount(
        currentEmail,
        currentUser
    );

}


/* =====================================================
   STUDY BUDDY
===================================================== */

function updateBuddyForPage(page) {

    const messages = {

        home:
            "What are we getting done today? ✦",

        calendar:
            "Future you will appreciate this. 📅",

        assignments:
            "One task at a time. You've got this!",

        peers:
            "Everyone knows something you don't. 🤝",

        resources:
            "Let's find something useful! 📚",

        study:
            "Shhh... focus mode. 🤫",

        profile:
            "You have things worth teaching! ✦",

        progress:
            "Look at your progress! 📈",

        settings:
            "Making everything work nicely. ⚙"

    };


    showBuddyMessage(
        messages[page] ||
        "Ready when you are! ✦"
    );

}


function showBuddyMessage(message) {

    const bubble =
        document.getElementById(
            "buddyMood"
        );


    const studyBubble =
        document.getElementById(
            "studyBuddyMessage"
        );


    if (bubble)
        bubble.textContent =
            message;


    if (studyBubble)
        studyBubble.textContent =
            message;

}


function celebrateBuddy() {

    const buddy =
        document.getElementById(
            "studyBuddy"
        );


    buddy.classList.add(
        "buddy-celebrate"
    );


    showBuddyMessage(
        "YOU DID IT! 🎉 +5"
    );


    setTimeout(
        () => {

            buddy.classList.remove(
                "buddy-celebrate"
            );

        },
        1800
    );

}


function toggleBuddy() {

    buddyHidden =
        !buddyHidden;


    document
        .getElementById(
            "studyBuddy"
        )
        .classList.toggle(
            "buddy-hidden",
            buddyHidden
        );


    document.getElementById(
        "buddyToggle"
    ).checked =
        !buddyHidden;

}


function setBuddyVisibility() {

    const visible =
        document.getElementById(
            "buddyToggle"
        ).checked;


    buddyHidden =
        !visible;


    document
        .getElementById(
            "studyBuddy"
        )
        .classList.toggle(
            "buddy-hidden",
            buddyHidden
        );

}


/* =====================================================
   LITTLE MOUSE FOLLOW
===================================================== */

document.addEventListener(
    "mousemove",
    event => {

        const buddy =
            document.getElementById(
                "studyBuddy"
            );


        if (
            !buddy ||
            buddyHidden
        ) return;


        const x =
            (
                event.clientX /
                window.innerWidth
            ) - 0.5;


        const y =
            (
                event.clientY /
                window.innerHeight
            ) - 0.5;


        buddy.style.setProperty(
            "--buddy-x",
            `${x * 8}px`
        );


        buddy.style.setProperty(
            "--buddy-y",
            `${y * 5}px`
        );

    }
);


/* =====================================================
   MODALS
===================================================== */

function showModal(content) {

    document.getElementById(
        "modalContent"
    ).innerHTML =
        content;


    document.getElementById(
        "modal"
    ).classList.add(
        "open"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal() {

    document.getElementById(
        "modal"
    ).classList.remove(
        "open"
    );


    document.body.style.overflow =
        "";

}


function closeModalOutside(event) {

    if (
        event.target.id === "modal"
    ) {

        closeModal();

    }

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =====================================================
   NOTIFICATIONS
===================================================== */

function showNotifications() {

    showModal(`

        <span class="eyebrow">
            NOTIFICATIONS
        </span>

        <h2>
            You're all caught up.
        </h2>

        <p>
            Session reminders, assignment reminders and Peer Hub updates will appear here in the full version.
        </p>

        <div class="notification-item">
            ✦ St Roroans is ready to study with you.
        </div>

        <div class="notification-item">
            📚 Keep an eye on your upcoming assignments.
        </div>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Done
            </button>

        </div>

    `);

}


/* =====================================================
   HELPERS
===================================================== */

function initials(name) {

    return name
        .split(" ")
        .map(
            part => part[0]
        )
        .join("")
        .slice(0, 2)
        .toUpperCase();

}


function dailyQuote() {

    const day =
        Math.floor(
            Date.now() / 86400000
        );


    return quotes[
        day % quotes.length
    ];

}


function renderPageQuote(page) {

    document
        .querySelectorAll(".pageQuote")
        .forEach(
            element => {

                element.textContent =
                    pageQuotes[page] ||
                    quotes[0];

            }
        );

}


function resourceNotice(title) {

    showModal(`

        <h2>
            ${title}
        </h2>

        <p>
            These resources would connect to the St Oran's learning platform in the full version.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Close
            </button>

        </div>

    `);

}


/* =====================================================
   AUTO SAVE + REMEMBERED ACCOUNT
===================================================== */

window.addEventListener(
    "beforeunload",
    saveCurrentUser
);
