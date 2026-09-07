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


/* =========================================================
   SCHOOL EMAIL
   ========================================================= */

const SCHOOL_EMAIL_DOMAINS = [
    "@storans.school.nz"
];

function isValidSchoolEmail(email) {
    const lowerEmail = String(email || "")
        .trim()
        .toLowerCase();

    return SCHOOL_EMAIL_DOMAINS.some(domain =>
        lowerEmail.endsWith(domain)
    );
}


/* =========================================================
   SAFE STORAGE FUNCTIONS
   ========================================================= */

function safeGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error("Could not read localStorage:", error);
        return null;
    }
}


function safeSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error("Could not save to localStorage:", error);
        return false;
    }
}


function safeRemove(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error("Could not remove localStorage item:", error);
        return false;
    }
}


/* =========================================================
   DEFAULT USERS
   ========================================================= */

const defaultUsers = {

    "maya@storans.school.nz": {
        firstName: "Maya",
        lastName: "Thompson",
        fullName: "Maya Thompson",
        email: "maya@storans.school.nz",
        password: "Maya123!",
        year: "Year 8",
        className: "8XX",
        initials: "MT",

        points: 120,
        helped: 8,
        sessions: 6,
        badges: 3,

        studySessions: 12,
        studyMinutes: 340,
        streak: 5,

        bio: "I enjoy helping other students with maths and science.",
        subjects: ["Maths", "Science"],

        preferences: "Friendly and patient",

        progressHistory: [
            10,
            25,
            40,
            55,
            72,
            88,
            100
        ]
    },

    "lucy@storans.school.nz": {
        firstName: "Lucy",
        lastName: "Williams",
        fullName: "Lucy Williams",
        email: "lucy@storans.school.nz",
        password: "Lucy123!",
        year: "Year 8",
        className: "8XX",
        initials: "LW",

        points: 95,
        helped: 5,
        sessions: 4,
        badges: 2,

        studySessions: 9,
        studyMinutes: 250,
        streak: 3,

        bio: "I like helping with English, art and creative projects.",
        subjects: ["English", "Art"],

        preferences: "Creative and encouraging",

        progressHistory: [
            8,
            20,
            35,
            50,
            65,
            78,
            90
        ]
    }

};


/* =========================================================
   LOAD USERS
   ========================================================= */

function getStoredUsers() {

    const stored = safeGet(USERS_KEY);

    if (!stored) {

        const copiedDefaults = JSON.parse(
            JSON.stringify(defaultUsers)
        );

        safeSet(
            USERS_KEY,
            JSON.stringify(copiedDefaults)
        );

        return copiedDefaults;
    }

    try {

        const parsed = JSON.parse(stored);

        if (!parsed || typeof parsed !== "object") {
            throw new Error("Invalid users object");
        }

        return parsed;

    } catch (error) {

        console.error(
            "Could not parse stored users:",
            error
        );

        const copiedDefaults = JSON.parse(
            JSON.stringify(defaultUsers)
        );

        safeSet(
            USERS_KEY,
            JSON.stringify(copiedDefaults)
        );

        return copiedDefaults;
    }
}


let users = getStoredUsers();


function saveUsers() {

    return safeSet(
        USERS_KEY,
        JSON.stringify(users)
    );
}


/* =========================================================
   CURRENT USER
   ========================================================= */

let currentUser = null;


function saveCurrentUser() {

    if (!currentUser) {
        safeRemove(CURRENT_USER_KEY);
        return;
    }

    safeSet(
        CURRENT_USER_KEY,
        JSON.stringify({
            email: currentUser.email
        })
    );
}


function clearCurrentUser() {
    safeRemove(CURRENT_USER_KEY);
    currentUser = null;
}


/* =========================================================
   USER DATA
   ========================================================= */

function loadUserData(email) {

    if (!email) {
        currentUser = null;
        return;
    }

    const account = users[email];

    if (!account) {
        currentUser = null;
        return;
    }

    currentUser = account;
}


function updateCurrentUser() {

    if (!currentUser || !currentUser.email) {
        return;
    }

    users[currentUser.email] = currentUser;

    saveUsers();
}


/* =========================================================
   DEMO PEERS
   ========================================================= */

const peers = [

    {
        name: "Maya Thompson",
        year: "Year 8",
        subjects: ["Maths", "Science"],
        bio: "I enjoy helping other students with maths and science.",
        initials: "MT",
        points: 120
    },

    {
        name: "Lucy Williams",
        year: "Year 8",
        subjects: ["English", "Art"],
        bio: "I like helping with English, art and creative projects.",
        initials: "LW",
        points: 95
    },

    {
        name: "Sophie Patel",
        year: "Year 9",
        subjects: ["Science", "Maths"],
        bio: "Happy to help with science and problem solving.",
        initials: "SP",
        points: 145
    },

    {
        name: "Amelia Jones",
        year: "Year 9",
        subjects: ["English", "Social Studies"],
        bio: "I love essays, speeches and creative writing.",
        initials: "AJ",
        points: 110
    }

];


/* =========================================================
   QUOTES
   ========================================================= */

const quotes = [

    "Small progress is still progress.",
    "You don't have to be perfect to improve.",
    "One step at a time.",
    "Your future self will thank you.",
    "Keep going. You've got this.",
    "A little effort every day adds up.",
    "Learning takes time. That's normal."
];


const pageQuotes = {

    home: "Small progress is still progress.",
    peers: "Everyone has something they can teach.",
    calendar: "Plan it, then make it happen.",
    assignments: "One task at a time.",
    resources: "Knowledge is built one step at a time.",
    profile: "Look how far you've already come."
};


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

let assignments = [

    {
        title: "Maths practice",
        subject: "Maths",
        due: "Friday",
        completed: false
    },

    {
        title: "Science notes",
        subject: "Science",
        due: "Monday",
        completed: false
    },

    {
        title: "English paragraph",
        subject: "English",
        due: "Wednesday",
        completed: false
    }

];


/* =========================================================
   CALENDAR
   ========================================================= */

function getCalendarEvents() {

    const stored = safeGet(CALENDAR_KEY);

    if (!stored) {
        return [];
    }

    try {

        const parsed = JSON.parse(stored);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch {

        return [];
    }
}


let calendarEvents = getCalendarEvents();


function saveCalendarEvents() {

    safeSet(
        CALENDAR_KEY,
        JSON.stringify(calendarEvents)
    );
}


/* =========================================================
   APP STATE
   ========================================================= */

let currentPage = "home";

let pomodoroMinutes = 25;
let pomodoroSeconds = 0;
let pomodoroRunning = false;
let pomodoroInterval = null;

let signupData = {};

let loginForm = null;
let loginError = null;


/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getInitials(name) {

    return String(name || "")
        .split(" ")
        .filter(Boolean)
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

    loginForm = $("loginForm");
    loginError = $("loginError");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const emailInput = $("email");
            const passwordInput = $("password");
            const rememberInput = $("rememberMe");

            const email = emailInput
                ? emailInput.value.trim().toLowerCase()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";

            const remember = rememberInput
                ? rememberInput.checked
                : false;


            hideLoginError();


            if (!email || !password) {

                showLoginError(
                    "Please enter your email and password."
                );

                return;
            }


            if (!isValidSchoolEmail(email)) {

                showLoginError(
                    "Please use your St Oran's school email address."
                );

                return;
            }


            const account = users[email];


            if (!account) {

                showLoginError(
                    "We couldn't find an account with that email. Please check the spelling or create an account first."
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
                remember
            );

        }
    );
}


/* =========================================================
   LOGIN ERROR
   ========================================================= */

function showLoginError(message) {

    loginError = loginError || $("loginError");

    if (!loginError) {

        alert(message);

        return;
    }

    loginError.textContent = message;
    loginError.style.display = "block";
}


function hideLoginError() {

    loginError = loginError || $("loginError");

    if (loginError) {
        loginError.style.display = "none";
    }
}


/* =========================================================
   LOGIN FUNCTION
   ========================================================= */

function login(account, email, remember = false) {

    if (!account) {

        showLoginError(
            "That account could not be found."
        );

        return;
    }


    loadUserData(email);


    if (!currentUser) {

        showLoginError(
            "Something went wrong loading your account."
        );

        return;
    }


    if (remember) {
        saveCurrentUser();
    } else {
        safeRemove(CURRENT_USER_KEY);
    }


    hideLoginScreen();
    hideSignupScreen();
    showApp();

    showPage("home");
}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLogin() {

    stopPomodoro();

    const loginScreen = $("loginScreen");
    const signupScreen = $("signupScreen");
    const app = $("app");

    if (loginScreen) {
        loginScreen.style.display = "";
        loginScreen.classList.remove("hidden");
    }

    if (signupScreen) {
        signupScreen.style.display = "none";
    }

    if (app) {
        app.style.display = "none";
    }

    hideLoginError();
}


function hideLoginScreen() {

    const loginScreen = $("loginScreen");

    if (loginScreen) {
        loginScreen.style.display = "none";
    }
}


function hideSignupScreen() {

    const signupScreen = $("signupScreen");

    if (signupScreen) {
        signupScreen.style.display = "none";
    }
}


function showApp() {

    const app = $("app");

    if (app) {
        app.style.display = "";
        app.classList.remove("hidden");
    }
}


/* =========================================================
   SIGNUP
   ========================================================= */

function showSignup() {

    signupData = {};

    const loginScreen = $("loginScreen");
    const signupScreen = $("signupScreen");
    const app = $("app");

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (app) {
        app.style.display = "none";
    }

    if (signupScreen) {

        signupScreen.style.display = "";

        signupStep(1);
    }

    else {

        showSignupModal();
    }
}


/* =========================================================
   SIGNUP MODAL
   ========================================================= */

function showSignupModal() {

    signupData = {};

    showModal(`

        <h2>Create your Peer Hub account</h2>

        <p>
            Create your student account below.
        </p>

        <div class="form-group">
            <label>First name</label>
            <input
                id="signupFirstName"
                type="text"
                placeholder="First name"
            >
        </div>

        <div class="form-group">
            <label>Last name</label>
            <input
                id="signupLastName"
                type="text"
                placeholder="Last name"
            >
        </div>

        <div class="form-group">
            <label>School email</label>
            <input
                id="signupEmail"
                type="email"
                placeholder="example@storans.school.nz"
            >
        </div>

        <div class="form-group">
            <label>Password</label>
            <input
                id="signupPassword"
                type="password"
                placeholder="Create a password"
            >
        </div>

        <div class="form-group">
            <label>Confirm password</label>
            <input
                id="signupPasswordConfirm"
                type="password"
                placeholder="Confirm your password"
            >
        </div>

        <div class="form-group">
            <label>Year level</label>

            <select id="signupYear">
                <option value="Year 7">Year 7</option>
                <option value="Year 8" selected>Year 8</option>
                <option value="Year 9">Year 9</option>
                <option value="Year 10">Year 10</option>
                <option value="Year 11">Year 11</option>
                <option value="Year 12">Year 12</option>
                <option value="Year 13">Year 13</option>
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
                onclick="createAccountFromModal()"
            >
                Create account
            </button>

        </div>

    `);
}


/* =========================================================
   CREATE ACCOUNT FROM MODAL
   ========================================================= */

function createAccountFromModal() {

    const first = $("signupFirstName")?.value.trim();
    const last = $("signupLastName")?.value.trim();
    const email = $("signupEmail")?.value.trim().toLowerCase();
    const password = $("signupPassword")?.value || "";
    const confirmPassword =
        $("signupPasswordConfirm")?.value || "";

    const year =
        $("signupYear")?.value || "Year 8";


    if (!first || !last || !email) {

        alert(
            "Please fill in your first name, last name and email."
        );

        return;
    }


    if (!isValidSchoolEmail(email)) {

        alert(
            "Please use your St Oran's school email address."
        );

        return;
    }


    if (password.length < 6) {

        alert(
            "Your password needs to be at least 6 characters."
        );

        return;
    }


    if (password !== confirmPassword) {

        alert(
            "Your passwords do not match."
        );

        return;
    }


    if (users[email]) {

        alert(
            "An account with this email already exists. Try logging in instead."
        );

        return;
    }


    createNewAccount({
        first,
        last,
        email,
        password,
        year
    });
}


/* =========================================================
   CREATE ACCOUNT
   ========================================================= */

function createNewAccount(data) {

    const initials = getInitials(
        `${data.first} ${data.last}`
    );


    const newUser = {

        firstName: data.first,

        lastName: data.last,

        fullName:
            `${data.first} ${data.last}`.trim(),

        email: data.email,

        password: data.password,

        year: data.year,

        className:
            data.year.replace("Year ", "") + "XX",

        initials: initials,


        /* NEW USERS START WITH NOTHING */

        points: 0,

        helped: 0,

        sessions: 0,

        badges: 0,

        studySessions: 0,

        studyMinutes: 0,

        streak: 0,


        bio:
            "I am part of the St Oran's Peer Hub.",

        subjects: [],

        preferences:
            "No preferences added yet.",

        progressHistory: [0]

    };


    users[data.email] = newUser;


    const saved = saveUsers();


    if (!saved) {

        alert(
            "Your account could not be saved by your browser. Try opening the website normally rather than from a restricted/private file."
        );

        return;
    }


    /*
       IMPORTANT:
       We log the exact newly-created account in immediately.
       No searching localStorage again.
    */

    currentUser = newUser;

    closeModal();

    hideLoginScreen();

    hideSignupScreen();

    showApp();

    showPage("home");


    setTimeout(() => {

        showModal(`

            <h2>Account created! 🎉</h2>

            <p>
                Welcome to Peer Hub,
                <strong>${escapeHTML(newUser.firstName)}</strong>.
            </p>

            <p>
                Your account starts with zero points,
                sessions and progress, because apparently
                students have to earn things. Revolutionary concept.
            </p>

            <div class="modal-actions">

                <button
                    class="primary-button"
                    onclick="closeModal()"
                >
                    Enter Peer Hub
                </button>

            </div>

        `);

    }, 200);
}


/* =========================================================
   SIGNUP SCREEN VERSION
   ========================================================= */

function signupStep(step) {

    const signupScreen = $("signupScreen");

    if (!signupScreen) {
        return;
    }


    signupScreen.innerHTML = `

        <div class="signup-container">

            <h1>Create your Peer Hub account</h1>

            <p>
                Join St Oran's Peer Hub.
            </p>

            <div class="form-group">
                <label>First name</label>

                <input
                    id="suFirstName"
                    type="text"
                    placeholder="First name"
                >
            </div>

            <div class="form-group">
                <label>Last name</label>

                <input
                    id="suLastName"
                    type="text"
                    placeholder="Last name"
                >
            </div>

            <div class="form-group">
                <label>School email</label>

                <input
                    id="suEmail"
                    type="email"
                    placeholder="example@storans.school.nz"
                >
            </div>

            <div class="form-group">
                <label>Create a password</label>

                <input
                    id="suPassword"
                    type="password"
                    placeholder="At least 6 characters"
                >
            </div>

            <div class="form-group">
                <label>Confirm password</label>

                <input
                    id="suPasswordConfirm"
                    type="password"
                    placeholder="Confirm password"
                >
            </div>

            <div class="form-group">
                <label>Year level</label>

                <select id="suYear">

                    <option value="Year 7">
                        Year 7
                    </option>

                    <option value="Year 8" selected>
                        Year 8
                    </option>

                    <option value="Year 9">
                        Year 9
                    </option>

                    <option value="Year 10">
                        Year 10
                    </option>

                    <option value="Year 11">
                        Year 11
                    </option>

                    <option value="Year 12">
                        Year 12
                    </option>

                    <option value="Year 13">
                        Year 13
                    </option>

                </select>

            </div>


            <button
                class="primary-button"
                onclick="signupNext(1)"
            >
                Continue
            </button>


            <button
                class="secondary-button"
                onclick="showLogin()"
            >
                Back to login
            </button>

        </div>

    `;
}


/* =========================================================
   SIGNUP NEXT
   ========================================================= */

function signupNext(step) {

    if (step !== 1) {
        return;
    }


    const first =
        $("suFirstName")?.value.trim();

    const last =
        $("suLastName")?.value.trim();

    const email =
        $("suEmail")?.value.trim().toLowerCase();

    const password =
        $("suPassword")?.value || "";

    const passwordConfirm =
        $("suPasswordConfirm")?.value || "";

    const year =
        $("suYear")?.value || "Year 8";


    if (!first || !last || !email) {

        alert(
            "Please complete all the required fields."
        );

        return;
    }


    if (!isValidSchoolEmail(email)) {

        alert(
            "Please use your St Oran's school email address."
        );

        return;
    }


    if (password.length < 6) {

        alert(
            "Your password must be at least 6 characters."
        );

        return;
    }


    if (password !== passwordConfirm) {

        alert(
            "Your passwords do not match."
        );

        return;
    }


    if (users[email]) {

        alert(
            "An account with that email already exists. Please log in instead."
        );

        return;
    }


    createNewAccount({

        first,
        last,
        email,
        password,
        year

    });
}


/* =========================================================
   GOOGLE LOGIN
   ========================================================= */

function googleLogin() {

    showModal(`

        <h2>Continue with Google</h2>

        <p>
            Google sign-in is simulated in this prototype.
        </p>

        <p>
            Choose a demo student account:
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
                onclick="googleDemoLogin('maya@storans.school.nz')"
            >
                Maya
            </button>

            <button
                class="primary-button"
                onclick="googleDemoLogin('lucy@storans.school.nz')"
            >
                Lucy
            </button>

        </div>

    `);
}


function googleDemoLogin(email) {

    const account = users[email];


    if (!account) {

        alert(
            "The demo Google account could not be found."
        );

        return;
    }


    closeModal();

    login(
        account,
        email,
        false
    );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(pageName) {

    currentPage = pageName;


    const pages =
        document.querySelectorAll(
            ".page, [data-page]"
        );


    pages.forEach(page => {

        const pageId =
            page.dataset.page ||
            page.id;

        if (
            pageId === pageName ||
            pageId === `${pageName}Page`
        ) {

            page.style.display = "";

            page.classList.add("active");

        } else {

            if (
                page.classList.contains("page") ||
                page.hasAttribute("data-page")
            ) {

                page.style.display = "none";

                page.classList.remove("active");
            }
        }

    });


    const navItems =
        document.querySelectorAll(
            "[data-nav]"
        );


    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.nav === pageName
        );

    });


    updatePageQuote(pageName);

    if (pageName === "calendar") {
        renderCalendar();
    }

    if (pageName === "profile") {
        renderProfile();
    }

    if (pageName === "peers") {
        renderPeers();
    }

    if (pageName === "assignments") {
        renderAssignments();
    }

    if (pageName === "home") {
        updateHome();
    }
}


/* =========================================================
   NAVIGATION BUTTONS
   ========================================================= */

function setupNavigation() {

    document.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "[data-nav]"
                );

            if (!button) {
                return;
            }

            event.preventDefault();

            showPage(
                button.dataset.nav
            );

        }
    );
}


/* =========================================================
   PAGE QUOTE
   ========================================================= */

function updatePageQuote(page) {

    const quote =
        pageQuotes[page] ||
        quotes[
            Math.floor(
                Math.random() * quotes.length
            )
        ];


    const quoteElements =
        document.querySelectorAll(
            "[data-page-quote], .page-quote"
        );


    quoteElements.forEach(element => {

        element.textContent = quote;

    });
}


/* =========================================================
   DATE + CLOCK
   ========================================================= */

function updateDateTime() {

    const now = new Date();


    const dateText =
        now.toLocaleDateString(
            "en-NZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );


    const timeText =
        now.toLocaleTimeString(
            "en-NZ",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );


    document
        .querySelectorAll(
            "[data-current-date], #currentDate"
        )
        .forEach(element => {

            element.textContent = dateText;

        });


    document
        .querySelectorAll(
            "[data-current-time], #currentTime"
        )
        .forEach(element => {

            element.textContent = timeText;

        });
}


/* =========================================================
   HOME
   ========================================================= */

function updateHome() {

    if (!currentUser) {
        return;
    }


    const nameElements =
        document.querySelectorAll(
            "[data-user-name], #userName"
        );


    nameElements.forEach(element => {

        element.textContent =
            currentUser.firstName ||
            currentUser.fullName;

    });


    document
        .querySelectorAll(
            "[data-user-points], #userPoints"
        )
        .forEach(element => {

            element.textContent =
                currentUser.points || 0;

        });


    document
        .querySelectorAll(
            "[data-user-streak], #userStreak"
        )
        .forEach(element => {

            element.textContent =
                currentUser.streak || 0;

        });
}


/* =========================================================
   PEERS
   ========================================================= */

function renderPeers() {

    const container =
        $("peersContainer") ||
        $("peerGrid") ||
        document.querySelector(
            "[data-peers]"
        );


    if (!container) {
        return;
    }


    container.innerHTML = peers.map(peer => `

        <div class="peer-card">

            <div class="peer-avatar">
                ${escapeHTML(peer.initials)}
            </div>

            <h3>
                ${escapeHTML(peer.name)}
            </h3>

            <p>
                ${escapeHTML(peer.year)}
            </p>

            <p>
                ${peer.subjects
                    .map(subject =>
                        escapeHTML(subject)
                    )
                    .join(" • ")}
            </p>

            <button
                class="secondary-button"
                onclick="viewPeer('${escapeHTML(peer.name)}')"
            >
                View profile
            </button>

        </div>

    `).join("");
}


/* =========================================================
   VIEW PEER
   ========================================================= */

function viewPeer(name) {

    const peer =
        peers.find(
            person => person.name === name
        );


    if (!peer) {
        return;
    }


    showModal(`

        <div class="peer-profile">

            <div class="peer-avatar">
                ${escapeHTML(peer.initials)}
            </div>

            <h2>
                ${escapeHTML(peer.name)}
            </h2>

            <p>
                ${escapeHTML(peer.year)}
            </p>

            <p>
                ${escapeHTML(peer.bio)}
            </p>

            <p>
                <strong>Subjects:</strong>
                ${peer.subjects
                    .map(subject =>
                        escapeHTML(subject)
                    )
                    .join(", ")}
            </p>

            <div class="modal-actions">

                <button
                    class="secondary-button"
                    onclick="closeModal()"
                >
                    Close
                </button>

                <button
                    class="primary-button"
                    onclick="bookSession('${escapeHTML(peer.name)}')"
                >
                    Book session
                </button>

            </div>

        </div>

    `);
}


/* =========================================================
   BOOK SESSION
   ========================================================= */

function bookSession(peerName) {

    if (!currentUser) {
        return;
    }


    closeModal();


    showModal(`

        <h2>Book a session</h2>

        <p>
            You're booking a peer session with
            <strong>${escapeHTML(peerName)}</strong>.
        </p>

        <div class="form-group">

            <label>Date</label>

            <input
                id="bookingDate"
                type="date"
            >

        </div>

        <div class="form-group">

            <label>Time</label>

            <input
                id="bookingTime"
                type="time"
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
                onclick="confirmBooking('${escapeHTML(peerName)}')"
            >
                Confirm booking
            </button>

        </div>

    `);
}


function confirmBooking(peerName) {

    const date =
        $("bookingDate")?.value;

    const time =
        $("bookingTime")?.value;


    if (!date || !time) {

        alert(
            "Please choose a date and time."
        );

        return;
    }


    calendarEvents.push({

        id: Date.now(),

        title:
            `Peer session with ${peerName}`,

        date,

        time,

        type: "Peer session"

    });


    saveCalendarEvents();


    currentUser.sessions =
        (currentUser.sessions || 0) + 1;


    updateCurrentUser();

    closeModal();


    showModal(`

        <h2>Session booked 📚</h2>

        <p>
            Your session with
            <strong>${escapeHTML(peerName)}</strong>
            has been added to your calendar.
        </p>

        <div class="modal-actions">

            <button
                class="primary-button"
                onclick="closeModal(); showPage('calendar')"
            >
                View calendar
            </button>

        </div>

    `);
}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar() {

    const container =
        $("calendarEvents") ||
        $("calendarList") ||
        document.querySelector(
            "[data-calendar-events]"
        );


    if (!container) {
        return;
    }


    if (calendarEvents.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>No events yet</h3>

                <p>
                    Add something to your calendar.
                </p>

            </div>

        `;

        return;
    }


    const sorted =
        [...calendarEvents]
            .sort(
                (a, b) =>
                    `${a.date} ${a.time || ""}`
                        .localeCompare(
                            `${b.date} ${b.time || ""}`
                        )
            );


    container.innerHTML =
        sorted.map(event => `

            <div class="calendar-event">

                <div>

                    <h3>
                        ${escapeHTML(event.title)}
                    </h3>

                    <p>
                        ${escapeHTML(event.date)}
                        ${event.time
                            ? ` • ${escapeHTML(event.time)}`
                            : ""}
                    </p>

                </div>

                <button
                    class="secondary-button"
                    onclick="removeCalendarEvent(${event.id})"
                >
                    Remove
                </button>

            </div>

        `).join("");
}


/* =========================================================
   ADD CALENDAR EVENT
   ========================================================= */

function addCalendarEvent() {

    showModal(`

        <h2>Add calendar event</h2>

        <div class="form-group">

            <label>Event name</label>

            <input
                id="eventTitle"
                type="text"
                placeholder="e.g. Maths test"
            >

        </div>

        <div class="form-group">

            <label>Date</label>

            <input
                id="eventDate"
                type="date"
            >

        </div>

        <div class="form-group">

            <label>Time</label>

            <input
                id="eventTime"
                type="time"
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
                onclick="saveNewCalendarEvent()"
            >
                Add event
            </button>

        </div>

    `);
}


function saveNewCalendarEvent() {

    const title =
        $("eventTitle")?.value.trim();

    const date =
        $("eventDate")?.value;

    const time =
        $("eventTime")?.value;


    if (!title || !date) {

        alert(
            "Please enter an event name and date."
        );

        return;
    }


    calendarEvents.push({

        id: Date.now(),

        title,

        date,

        time,

        type: "Personal"

    });


    saveCalendarEvents();

    closeModal();

    renderCalendar();
}


function removeCalendarEvent(id) {

    calendarEvents =
        calendarEvents.filter(
            event => event.id !== id
        );


    saveCalendarEvents();

    renderCalendar();
}


/* =========================================================
   CALENDAR BUTTONS
   ========================================================= */

function setupCalendarButtons() {

    const buttons = [

        "addEventButton",
        "addCalendarEvent",
        "calendarAddButton"

    ];


    buttons.forEach(id => {

        const button = $(id);

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            addCalendarEvent
        );

    });
}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignments() {

    const container =
        $("assignmentsContainer") ||
        $("assignmentList") ||
        document.querySelector(
            "[data-assignments]"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        assignments.map(
            (assignment, index) => `

            <div class="assignment-card">

                <div>

                    <h3>
                        ${escapeHTML(assignment.title)}
                    </h3>

                    <p>
                        ${escapeHTML(assignment.subject)}
                        • Due ${escapeHTML(assignment.due)}
                    </p>

                </div>

                <button
                    class="secondary-button"
                    onclick="toggleAssignment(${index})"
                >
                    ${assignment.completed
                        ? "Completed ✓"
                        : "Mark done"}
                </button>

            </div>

        `
        ).join("");
}


function toggleAssignment(index) {

    if (!assignments[index]) {
        return;
    }


    assignments[index].completed =
        !assignments[index].completed;


    renderAssignments();
}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfile() {

    if (!currentUser) {
        return;
    }


    document
        .querySelectorAll(
            "[data-profile-name]"
        )
        .forEach(element => {

            element.textContent =
                currentUser.fullName;

        });


    document
        .querySelectorAll(
            "[data-profile-email]"
        )
        .forEach(element => {

            element.textContent =
                currentUser.email;

        });


    document
        .querySelectorAll(
            "[data-profile-points]"
        )
        .forEach(element => {

            element.textContent =
                currentUser.points || 0;

        });


    document
        .querySelectorAll(
            "[data-profile-helped]"
        )
        .forEach(element => {

            element.textContent =
                currentUser.helped || 0;

        });


    document
        .querySelectorAll(
            "[data-profile-sessions]"
        )
        .forEach(element => {

            element.textContent =
                currentUser.sessions || 0;

        });


    document
        .querySelectorAll(
            "[data-profile-streak]"
        )
        .forEach(element => {

            element.textContent =
                currentUser.streak || 0;

        });
}


/* =========================================================
   RESOURCES
   ========================================================= */

function setupResources() {

    document
        .querySelectorAll(
            "[data-resource]"
        )
        .forEach(resource => {

            resource.addEventListener(
                "click",
                function() {

                    const url =
                        resource.dataset.resource;

                    if (url) {
                        window.open(
                            url,
                            "_blank"
                        );
                    }

                }
            );

        });
}


/* =========================================================
   POMODORO
   ========================================================= */

function updatePomodoroDisplay() {

    const minutes =
        String(
            Math.floor(
                pomodoroMinutes
            )
        ).padStart(2, "0");


    const seconds =
        String(
            pomodoroSeconds
        ).padStart(2, "0");


    const display =
        `${minutes}:${seconds}`;


    document
        .querySelectorAll(
            "#pomodoroTime, [data-pomodoro-time]"
        )
        .forEach(element => {

            element.textContent =
                display;

        });
}


function startPomodoro() {

    if (pomodoroRunning) {
        return;
    }


    pomodoroRunning = true;


    pomodoroInterval =
        setInterval(
            function() {

                if (
                    pomodoroMinutes === 0 &&
                    pomodoroSeconds === 0
                ) {

                    stopPomodoro();

                    alert(
                        "Pomodoro complete! 🎉"
                    );

                    return;
                }


                if (pomodoroSeconds > 0) {

                    pomodoroSeconds--;

                } else {

                    pomodoroMinutes--;

                    pomodoroSeconds = 59;

                }


                updatePomodoroDisplay();

            },
            1000
        );
}


function pausePomodoro() {

    if (pomodoroInterval) {

        clearInterval(
            pomodoroInterval
        );

        pomodoroInterval = null;

    }

    pomodoroRunning = false;
}


function stopPomodoro() {

    if (pomodoroInterval) {

        clearInterval(
            pomodoroInterval
        );

        pomodoroInterval = null;

    }

    pomodoroRunning = false;
}


function resetPomodoro() {

    stopPomodoro();

    pomodoroMinutes = 25;
    pomodoroSeconds = 0;

    updatePomodoroDisplay();
}


function changePomodoroTime() {

    if (pomodoroRunning) {

        alert(
            "Pause the timer before changing the time."
        );

        return;
    }


    const input =
        prompt(
            "How many minutes would you like?",
            pomodoroMinutes
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
            "Please choose between 1 and 180 minutes."
        );

        return;
    }


    pomodoroMinutes =
        Math.floor(minutes);

    pomodoroSeconds = 0;

    updatePomodoroDisplay();
}


/* =========================================================
   POMODORO BUTTONS
   ========================================================= */

function setupPomodoro() {

    const start =
        $("pomodoroStart");

    const pause =
        $("pomodoroPause");

    const reset =
        $("pomodoroReset");

    const time =
        $("pomodoroTime");


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


    if (time) {

        time.addEventListener(
            "click",
            changePomodoroTime
        );

    }


    updatePomodoroDisplay();
}


/* =========================================================
   MODAL
   ========================================================= */

function showModal(content) {

    let modal =
        $("modal");


    if (!modal) {

        modal =
            document.createElement("div");

        modal.id = "modal";

        modal.className = "modal";

        document.body.appendChild(modal);
    }


    modal.innerHTML = `

        <div class="modal-overlay"
             onclick="closeModal()">

            <div
                class="modal-content"
                onclick="event.stopPropagation()"
            >

                <button
                    class="modal-close"
                    onclick="closeModal()"
                    aria-label="Close"
                >
                    ×
                </button>

                ${content}

            </div>

        </div>

    `;


    modal.style.display = "block";
}


function closeModal() {

    const modal =
        $("modal");

    if (modal) {

        modal.style.display = "none";

        modal.innerHTML = "";

    }
}


/* =========================================================
   RORO
   ========================================================= */

function setupRoro() {

    const roro =
        $("roro");


    if (!roro) {
        return;
    }


    roro.addEventListener(
        "click",
        function() {

            const messages = [

                "You can do it! 🐉",

                "Tiny steps still count.",

                "Go study, human. 📚",

                "I believe in you.",

                "Hydration check! 💧",

                "Your future self is watching."

            ];


            const message =
                messages[
                    Math.floor(
                        Math.random() *
                        messages.length
                    )
                ];


            showModal(`

                <h2>Roro 🐉</h2>

                <p>
                    ${escapeHTML(message)}
                </p>

                <div class="modal-actions">

                    <button
                        class="primary-button"
                        onclick="closeModal()"
                    >
                        Thanks Roro
                    </button>

                </div>

            `);

        }
    );
}


/* =========================================================
   SIGN OUT
   ========================================================= */

function signOut() {

    stopPomodoro();

    clearCurrentUser();

    showLogin();
}


/* =========================================================
   GLOBAL BUTTON SUPPORT
   ========================================================= */

function setupGlobalButtons() {

    const signOutButtons =
        document.querySelectorAll(
            "[data-signout]"
        );


    signOutButtons.forEach(button => {

        button.addEventListener(
            "click",
            signOut
        );

    });


    const signupButtons =
        document.querySelectorAll(
            "[data-signup]"
        );


    signupButtons.forEach(button => {

        button.addEventListener(
            "click",
            showSignup
        );

    });


    const googleButtons =
        document.querySelectorAll(
            "[data-google-login]"
        );


    googleButtons.forEach(button => {

        button.addEventListener(
            "click",
            googleLogin
        );

    });

}


/* =========================================================
   INITIALISE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           IMPORTANT:
           Always start on the login page.
           We are NOT automatically logging anyone in.
        */

        showLogin();


        setupLogin();

        setupNavigation();

        setupCalendarButtons();

        setupPomodoro();

        setupRoro();

        setupGlobalButtons();

        setupResources();


        renderPeers();

        renderAssignments();

        updateDateTime();


        setInterval(
            updateDateTime,
            30000
        );

    }
);


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function() {

        updatePomodoroDisplay();

    }
);


/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO HTML ONCLICK
   ========================================================= */

window.showLogin = showLogin;

window.showSignup = showSignup;

window.signupStep = signupStep;

window.signupNext = signupNext;

window.googleLogin = googleLogin;

window.googleDemoLogin = googleDemoLogin;

window.createAccountFromModal =
    createAccountFromModal;

window.login = login;

window.showPage = showPage;

window.viewPeer = viewPeer;

window.bookSession = bookSession;

window.confirmBooking = confirmBooking;

window.addCalendarEvent =
    addCalendarEvent;

window.saveNewCalendarEvent =
    saveNewCalendarEvent;

window.removeCalendarEvent =
    removeCalendarEvent;

window.toggleAssignment =
    toggleAssignment;

window.startPomodoro =
    startPomodoro;

window.pausePomodoro =
    pausePomodoro;

window.resetPomodoro =
    resetPomodoro;

window.changePomodoroTime =
    changePomodoroTime;

window.showModal =
    showModal;

window.closeModal =
    closeModal;

window.signOut =
    signOut;
