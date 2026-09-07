/* =========================================================
   ST ORAN'S PEER HUB
   MAIN JAVASCRIPT
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

        if (value === null) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error("Storage read error:", error);
        return fallback;
    }
}


function safeSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Storage save error:", error);
        return false;
    }
}


function safeRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Storage remove error:", error);
    }
}


/* =========================================================
   DEMO USERS
   ========================================================= */

const defaultUsers = {

    "maya@storans.school.nz": {
        firstName: "Maya",
        lastName: "Patel",
        fullName: "Maya Patel",
        email: "maya@storans.school.nz",
        password: "Maya123",
        year: "Year 10",
        className: "10MP",
        initials: "MP",

        points: 65,
        helped: 7,
        sessions: 5,
        badges: 2,

        studySessions: 4,
        studyMinutes: 100,
        streak: 3,

        bio: "I enjoy helping students with maths and science.",
        subjects: [
            "Maths",
            "Science"
        ],

        preferences: "Online sessions after school.",
        progressHistory: [
            10,
            18,
            28,
            35,
            45,
            55,
            65
        ]
    },


    "lucy@storans.school.nz": {
        firstName: "Lucy",
        lastName: "Wilson",
        fullName: "Lucy Wilson",
        email: "lucy@storans.school.nz",
        password: "Lucy123",
        year: "Year 11",
        className: "11LW",
        initials: "LW",

        points: 90,
        helped: 10,
        sessions: 8,
        badges: 3,

        studySessions: 7,
        studyMinutes: 175,
        streak: 5,

        bio: "Happy to help with English and Spanish.",
        subjects: [
            "English",
            "Spanish"
        ],

        preferences: "Online or library sessions.",
        progressHistory: [
            12,
            22,
            34,
            48,
            60,
            76,
            90
        ]
    }

};


/* =========================================================
   USERS
   ========================================================= */

let users = safeGet(USERS_KEY, null);

if (!users || typeof users !== "object") {
    users = {};
}


let usersChanged = false;


Object.keys(defaultUsers).forEach(function (email) {

    if (!users[email]) {
        users[email] = defaultUsers[email];
        usersChanged = true;
    }

});


if (usersChanged) {
    safeSet(USERS_KEY, users);
}


/* =========================================================
   CURRENT USER
   ========================================================= */

let currentUser = null;


const savedCurrentUser = safeGet(
    CURRENT_USER_KEY,
    null
);


if (
    savedCurrentUser &&
    savedCurrentUser.email &&
    users[savedCurrentUser.email]
) {
    currentUser = users[savedCurrentUser.email];
}


/* =========================================================
   CALENDAR
   ========================================================= */

let calendarEvents = safeGet(
    CALENDAR_KEY,
    []
);


if (!Array.isArray(calendarEvents)) {
    calendarEvents = [];
}


/* =========================================================
   SIGNUP DATA
   ========================================================= */

let signupData = {};


/* =========================================================
   POMODORO
   ========================================================= */

let pomodoroMode = "focus";

let pomodoroMinutes = {
    focus: 25,
    short: 5,
    long: 15
};

let pomodoroSeconds = 0;

let pomodoroInterval = null;

let pomodoroRunning = false;


/* =========================================================
   QUOTES
   ========================================================= */

const quotes = [

    "Small progress is still progress.",

    "You do not have to know everything to start.",

    "Helping someone else helps build your own confidence.",

    "One focused hour can change your whole afternoon.",

    "You are allowed to learn at your own pace.",

    "Consistency beats last-minute panic.",

    "Ask questions. That is literally how learning works."

];


const pageQuotes = {

    calendar: "A little organisation now saves a lot of panic later.",

    assignments: "Future you will be very grateful you started today.",

    peers: "Everyone knows something you do not. Everyone can learn something from you.",

    resources: "Good resources make studying smarter, not just longer.",

    profile: "Your strengths are worth sharing.",

    progress: "Progress does not have to be perfect to count.",

    settings: "Make the Peer Hub work for you."

};


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

const assignments = [

    {
        id: 1,
        subject: "Maths",
        title: "Algebra practice",
        date: "2026-09-10",
        priority: "high",
        complete: false
    },

    {
        id: 2,
        subject: "Science",
        title: "Water cycle notes",
        date: "2026-09-12",
        priority: "medium",
        complete: false
    },

    {
        id: 3,
        subject: "English",
        title: "Hero speech draft",
        date: "2026-09-15",
        priority: "medium",
        complete: false
    },

    {
        id: 4,
        subject: "Spanish",
        title: "Vocabulary revision",
        date: "2026-09-18",
        priority: "low",
        complete: false
    }

];


/* =========================================================
   PEERS
   ========================================================= */

const peers = [

    {
        name: "Maya Patel",
        year: "Year 10",
        subjects: ["Maths", "Science"],
        topics: [
            "Algebra",
            "Fractions",
            "Biology"
        ],
        availability: "Available now",
        online: true,
        bio: "I enjoy helping with maths and science."
    },

    {
        name: "Lucy Wilson",
        year: "Year 11",
        subjects: ["English", "Spanish"],
        topics: [
            "Essay writing",
            "Grammar",
            "Vocabulary"
        ],
        availability: "Later today",
        online: true,
        bio: "Happy to help with English and Spanish."
    },

    {
        name: "Amelia Chen",
        year: "Year 9",
        subjects: ["Science", "Maths"],
        topics: [
            "Chemistry",
            "Equations",
            "Graphs"
        ],
        availability: "Available now",
        online: false,
        bio: "I can help make tricky science concepts simpler."
    },

    {
        name: "Sofia Kumar",
        year: "Year 12",
        subjects: ["History", "English"],
        topics: [
            "Essay writing",
            "Research",
            "Source analysis"
        ],
        availability: "Online",
        online: true,
        bio: "I can help with essays and research."
    }

];


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

let loginScreen;
let signupScreen;
let mainApp;

let loginForm;
let signupForm;

let loginError;
let signupError;


/* =========================================================
   SCHOOL EMAIL
   ========================================================= */

function isValidSchoolEmail(email) {

    const cleanEmail = String(email || "")
        .trim()
        .toLowerCase();

    return cleanEmail.endsWith(
        "@storans.school.nz"
    );
}


/* =========================================================
   LOGIN SCREEN
   ========================================================= */

function showLogin(event) {

    if (event) {
        event.preventDefault();
    }

    stopPomodoro();

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }

    if (signupScreen) {
        signupScreen.style.display = "none";
    }

    if (mainApp) {
        mainApp.style.display = "none";
    }

    if (loginError) {
        loginError.textContent = "";
    }

}


/* =========================================================
   SIGNUP SCREEN
   ========================================================= */

function showSignup(event) {

    if (event) {
        event.preventDefault();
    }

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (signupScreen) {
        signupScreen.style.display = "flex";
    }

    if (mainApp) {
        mainApp.style.display = "none";
    }

    if (signupError) {
        signupError.textContent = "";
    }

}


/* =========================================================
   LOGIN ERROR
   ========================================================= */

function showLoginError(message) {

    if (!loginError) {
        return;
    }

    loginError.textContent = message;
    loginError.style.display = "block";
}


/* =========================================================
   SIGNUP ERROR
   ========================================================= */

function showSignupError(message) {

    if (!signupError) {
        return;
    }

    signupError.textContent = message;
    signupError.style.display = "block";
}


/* =========================================================
   LOGIN
   ========================================================= */

function login(account, email, remember) {

    if (!account) {
        showLoginError(
            "We couldn't find that account."
        );

        return;
    }


    currentUser = account;


    /*
       Save the latest version of the account.
       This makes sure changes are not lost.
    */

    users[email] = currentUser;

    safeSet(
        USERS_KEY,
        users
    );


    if (remember) {

        safeSet(
            CURRENT_USER_KEY,
            {
                email: email
            }
        );

    } else {

        safeRemove(
            CURRENT_USER_KEY
        );

    }


    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (signupScreen) {
        signupScreen.style.display = "none";
    }

    if (mainApp) {
        mainApp.style.display = "block";
    }


    loadUserData();

    showPage("home");

}


/* =========================================================
   LOGIN FORM
   ========================================================= */

function setupLogin() {

    loginForm = document.getElementById(
        "loginForm"
    );

    loginError = document.getElementById(
        "loginError"
    );


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
                loginError.textContent = "";
            }


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
                    "We couldn't find an account with that school email. If you just created the account, make sure you are using the exact email you signed up with."
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
   GOOGLE LOGIN
   ========================================================= */

function googleLogin() {

    showModal(`

        <h2>Continue with Google</h2>

        <p style="margin-top:10px; color:#85847e;">
            This Peer Hub prototype cannot connect to real
            Google accounts yet.
        </p>

        <p style="margin-top:8px; color:#85847e;">
            Choose a demo student account to continue.
        </p>

        <div
            class="modal-actions"
            style="
                display:flex;
                gap:10px;
                margin-top:22px;
                flex-wrap:wrap;
            "
        >

            <button
                class="secondary-button"
                onclick="googleDemoLogin('maya@storans.school.nz')"
            >
                Continue as Maya
            </button>

            <button
                class="primary-button"
                onclick="googleDemoLogin('lucy@storans.school.nz')"
            >
                Continue as Lucy
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
   SIGNUP
   ========================================================= */

function setupSignup() {

    signupForm = document.getElementById(
        "signupForm"
    );

    signupError = document.getElementById(
        "signupError"
    );


    if (!signupForm) {
        return;
    }


    signupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "signupName"
                )?.value.trim();


            const email =
                document.getElementById(
                    "signupEmail"
                )?.value
                    .trim()
                    .toLowerCase();


            const year =
                document.getElementById(
                    "signupYear"
                )?.value;


            const password =
                document.getElementById(
                    "signupPassword"
                )?.value || "";


            const confirmPassword =
                document.getElementById(
                    "signupConfirmPassword"
                )?.value || "";


            if (signupError) {
                signupError.textContent = "";
            }


            if (
                !name ||
                !email ||
                !year ||
                !password ||
                !confirmPassword
            ) {

                showSignupError(
                    "Please complete every field."
                );

                return;
            }


            if (!isValidSchoolEmail(email)) {

                showSignupError(
                    "Please use your St Oran's school email address."
                );

                return;
            }


            if (password.length < 6) {

                showSignupError(
                    "Your password needs to be at least 6 characters."
                );

                return;
            }


            if (password !== confirmPassword) {

                showSignupError(
                    "Your passwords do not match."
                );

                return;
            }


            if (users[email]) {

                showSignupError(
                    "An account with this email already exists. Try logging in instead."
                );

                return;
            }


            const nameParts =
                name.split(/\s+/);


            const firstName =
                nameParts.shift() || "";


            const lastName =
                nameParts.join(" ") || "";


            const initials =
                (
                    firstName.charAt(0) +
                    lastName.charAt(0)
                ).toUpperCase();


            const newUser = {

                firstName: firstName,

                lastName: lastName,

                fullName: name,

                email: email,

                password: password,

                year: year,

                className:
                    year.replace(
                        "Year ",
                        ""
                    ) + "XX",

                initials:
                    initials || "S",

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


            /*
               IMPORTANT:
               Save the account BEFORE logging in.
            */

            users[email] = newUser;


            const saved =
                safeSet(
                    USERS_KEY,
                    users
                );


            if (!saved) {

                delete users[email];


                showSignupError(
                    "Your browser did not allow the account to be saved. Try opening the website in a normal browser window rather than private browsing."
                );

                return;
            }


            /*
               Log the newly-created user in immediately.
               This avoids the annoying "account not found"
               problem after signup.
            */

            currentUser =
                newUser;


            safeRemove(
                CURRENT_USER_KEY
            );


            if (signupScreen) {
                signupScreen.style.display = "none";
            }

            if (loginScreen) {
                loginScreen.style.display = "none";
            }

            if (mainApp) {
                mainApp.style.display = "block";
            }


            loadUserData();

            showPage("home");


            roroSay(
                "Welcome to Peer Hub, " +
                firstName +
                "! 🐉 Your progress starts from zero."
            );

        }
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

        <h2>Forgot your password?</h2>

        <p style="margin-top:10px; color:#85847e;">
            This is a prototype, so password recovery is
            simulated rather than connected to school email.
        </p>

        <p style="margin-top:10px; color:#85847e;">
            If this were the real school version, this would
            send a reset link to your St Oran's email.
        </p>

        <div style="margin-top:20px;">

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Close
            </button>

        </div>

    `);

}


/* =========================================================
   LOAD USER DATA
   ========================================================= */

function loadUserData() {

    if (!currentUser) {
        return;
    }


    const topName =
        document.getElementById("topName");

    const topYear =
        document.getElementById("topYear");

    const topAvatar =
        document.getElementById("topAvatar");

    const welcomeName =
        document.getElementById("welcomeName");

    const profileName =
        document.getElementById("profileName");

    const profileYear =
        document.getElementById("profileYear");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const settingsEmail =
        document.getElementById("settingsEmail");


    if (topName) {
        topName.textContent =
            currentUser.firstName ||
            currentUser.fullName ||
            "Student";
    }


    if (topYear) {
        topYear.textContent =
            currentUser.year ||
            "Year 8";
    }


    if (topAvatar) {
        topAvatar.textContent =
            currentUser.initials ||
            "S";
    }


    if (welcomeName) {
        welcomeName.textContent =
            currentUser.firstName ||
            "Student";
    }


    if (profileName) {
        profileName.textContent =
            currentUser.fullName ||
            "Student";
    }


    if (profileYear) {
        profileYear.textContent =
            currentUser.year ||
            "Year 8";
    }


    if (profileAvatar) {
        profileAvatar.textContent =
            currentUser.initials ||
            "S";
    }


    if (settingsEmail) {
        settingsEmail.textContent =
            currentUser.email ||
            "";
    }


    updateHomeProgress();

    renderProfile();

    renderProgress();

    renderStudyStats();

    renderAssignments();

    renderCalendar();

    renderRecommendedPeers();

    updateQuotes();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function (event) {

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


function showPage(pageName) {

    if (!pageName) {
        return;
    }


    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(function (page) {

        page.classList.remove(
            "active-page"
        );

    });


    const target =
        document.getElementById(
            pageName
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(function (item) {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );

    });


    updateQuotes();


    if (pageName === "calendar") {
        renderCalendar();
    }


    if (pageName === "progress") {
        renderProgress();
    }


    if (pageName === "study") {
        updatePomodoroDisplay();
    }

}


/* =========================================================
   DATE / GREETING
   ========================================================= */

function updateDateAndGreeting() {

    const now =
        new Date();


    const hour =
        now.getHours();


    let greeting =
        "Good morning";


    if (hour >= 12 && hour < 18) {
        greeting = "Good afternoon";
    }


    if (hour >= 18) {
        greeting = "Good evening";
    }


    const greetingElement =
        document.getElementById(
            "greeting"
        );


    if (greetingElement) {
        greetingElement.textContent =
            greeting;
    }


    const todayLabel =
        document.getElementById(
            "todayLabel"
        );


    if (todayLabel) {

        todayLabel.textContent =
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


    const monthTitle =
        document.getElementById(
            "monthTitle"
        );


    const fullMonthTitle =
        document.getElementById(
            "fullMonthTitle"
        );


    const monthName =
        now.toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        );


    if (monthTitle) {
        monthTitle.textContent =
            monthName;
    }


    if (fullMonthTitle) {
        fullMonthTitle.textContent =
            monthName;
    }

}


/* =========================================================
   QUOTES
   ========================================================= */

function updateQuotes() {

    const homeQuote =
        document.getElementById(
            "homeQuote"
        );


    if (homeQuote) {

        const index =
            new Date().getDate() %
            quotes.length;

        homeQuote.textContent =
            quotes[index];

    }


    const pageQuoteElements =
        document.querySelectorAll(
            ".pageQuote"
        );


    pageQuoteElements.forEach(function (element) {

        const page =
            element.closest(".page");


        if (!page) {
            return;
        }


        element.textContent =
            pageQuotes[page.id] ||
            quotes[
                new Date().getDate() %
                quotes.length
            ];

    });

}


/* =========================================================
   MINI CALENDAR
   ========================================================= */

function renderMiniCalendar() {

    const container =
        document.getElementById(
            "miniCalendar"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        now.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    let startDay =
        firstDay.getDay();


    /*
       Convert Sunday = 0 into
       Monday = 0.
    */

    startDay =
        (startDay + 6) % 7;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        const blank =
            document.createElement(
                "span"
            );

        container.appendChild(
            blank
        );

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const element =
            document.createElement(
                "span"
            );


        element.textContent =
            day;


        if (
            day === now.getDate()
        ) {

            element.classList.add(
                "today"
            );

        }


        container.appendChild(
            element
        );

    }

}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar() {

    renderMiniCalendar();


    const container =
        document.getElementById(
            "fullCalendar"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        now.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    let startDay =
        firstDay.getDay();


    startDay =
        (startDay + 6) % 7;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const headings = [
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT",
        "SUN"
    ];


    headings.forEach(function (day) {

        const heading =
            document.createElement(
                "div"
            );


        heading.className =
            "calendar-heading";


        heading.textContent =
            day;


        container.appendChild(
            heading
        );

    });


    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "calendar-cell empty";


        container.appendChild(
            empty
        );

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "calendar-cell";


        if (
            day === now.getDate()
        ) {

            cell.classList.add(
                "today"
            );

        }


        const number =
            document.createElement(
                "strong"
            );


        number.textContent =
            day;


        cell.appendChild(
            number
        );


        const dateString =
            formatDateKey(
                new Date(
                    year,
                    month,
                    day
                )
            );


        const dayEvents =
            calendarEvents.filter(
                function (event) {

                    return event.date ===
                        dateString;

                }
            );


        dayEvents.forEach(function (event) {

            const eventElement =
                document.createElement(
                    "small"
                );


            eventElement.textContent =
                event.title;


            eventElement.title =
                "Click to remove";


            eventElement.style.cursor =
                "pointer";


            eventElement.onclick =
                function () {

                    removeCalendarEvent(
                        event.id
                    );

                };


            cell.appendChild(
                eventElement
            );

        });


        container.appendChild(
            cell
        );

    }


    addCalendarButton();

}


/* =========================================================
   CALENDAR ADD BUTTON
   ========================================================= */

function addCalendarButton() {

    const calendarCard =
        document.querySelector(
            ".calendar-full .card-header"
        );


    if (!calendarCard) {
        return;
    }


    if (
        document.getElementById(
            "addCalendarEventButton"
        )
    ) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "addCalendarEventButton";


    button.className =
        "primary-button";


    button.textContent =
        "+ Add event";


    button.onclick =
        addCalendarEvent;


    calendarCard.appendChild(
        button
    );

}


/* =========================================================
   ADD CALENDAR EVENT
   ========================================================= */

function addCalendarEvent() {

    const title =
        prompt(
            "What is the event or deadline called?"
        );


    if (!title || !title.trim()) {
        return;
    }


    const dateInput =
        prompt(
            "Enter the date as YYYY-MM-DD"
        );


    if (!dateInput) {
        return;
    }


    const validDate =
        /^\d{4}-\d{2}-\d{2}$/.test(
            dateInput
        );


    if (!validDate) {

        alert(
            "Please use the format YYYY-MM-DD."
        );

        return;
    }


    calendarEvents.push({

        id:
            Date.now(),

        title:
            title.trim(),

        date:
            dateInput

    });


    safeSet(
        CALENDAR_KEY,
        calendarEvents
    );


    renderCalendar();


    roroSay(
        "Event added to your calendar! 🐉"
    );

}


/* =========================================================
   REMOVE CALENDAR EVENT
   ========================================================= */

function removeCalendarEvent(id) {

    const confirmed =
        confirm(
            "Remove this calendar event?"
        );


    if (!confirmed) {
        return;
    }


    calendarEvents =
        calendarEvents.filter(
            function (event) {

                return event.id !== id;

            }
        );


    safeSet(
        CALENDAR_KEY,
        calendarEvents
    );


    renderCalendar();

}


/* =========================================================
   DATE KEY
   ========================================================= */

function formatDateKey(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignments() {

    const homeList =
        document.getElementById(
            "deadlineList"
        );


    const pageList =
        document.getElementById(
            "assignmentPageList"
        );


    const activeAssignments =
        assignments.filter(
            function (assignment) {

                return !assignment.complete;

            }
        );


    if (homeList) {

        homeList.innerHTML = "";


        activeAssignments
            .slice(0, 4)
            .forEach(
                function (assignment) {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "assignment-row";


                    row.innerHTML = `

                        <div>

                            <strong>
                                ${escapeHTML(
                                    assignment.title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    assignment.subject
                                )}
                            </span>

                        </div>

                        <div>

                            <span>
                                ${formatShortDate(
                                    assignment.date
                                )}
                            </span>

                            <span
                                class="priority ${assignment.priority}"
                            >
                                ${assignment.priority.toUpperCase()}
                            </span>

                        </div>

                    `;


                    homeList.appendChild(
                        row
                    );

                }
            );

    }


    if (pageList) {

        pageList.innerHTML = "";


        assignments.forEach(
            function (assignment) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "assignment-card" +
                    (
                        assignment.complete
                            ? " complete"
                            : ""
                    );


                card.innerHTML = `

                    <button
                        class="assignment-check"
                        onclick="toggleAssignment(${assignment.id})"
                    >
                        ${assignment.complete ? "✓" : ""}
                    </button>


                    <div class="assignment-info">

                        <strong>
                            ${escapeHTML(
                                assignment.title
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                assignment.subject
                            )}
                        </span>

                    </div>


                    <div class="assignment-date">

                        <strong>
                            ${formatShortDate(
                                assignment.date
                            )}
                        </strong>

                        <span>
                            ${assignment.priority}
                        </span>

                    </div>

                `;


                pageList.appendChild(
                    card
                );

            }
        );

    }

}


function toggleAssignment(id) {

    const assignment =
        assignments.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!assignment) {
        return;
    }


    assignment.complete =
        !assignment.complete;


    if (
        assignment.complete &&
        currentUser
    ) {

        currentUser.points =
            (currentUser.points || 0) + 1;


        saveCurrentUser();

    }


    renderAssignments();

    updateHomeProgress();

}


/* =========================================================
   PEER SEARCH
   ========================================================= */

function renderRecommendedPeers() {

    const container =
        document.getElementById(
            "recommendedPeers"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    peers.slice(0, 3).forEach(
        function (peer) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "peer-row";


            row.innerHTML = `

                <div class="avatar avatar-small">
                    ${getInitials(peer.name)}
                </div>


                <div class="peer-row-info">

                    <strong>
                        ${escapeHTML(
                            peer.name
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            peer.subjects.join(", ")
                        )}
                    </span>

                </div>


                <span class="peer-availability">
                    ${escapeHTML(
                        peer.availability
                    )}
                </span>

            `;


            row.onclick =
                function () {

                    viewPeer(
                        peer.name
                    );

                };


            row.style.cursor =
                "pointer";


            container.appendChild(
                row
            );

        }
    );

}


function searchPeers() {

    const input =
        document.getElementById(
            "peerSearch"
        );


    const query =
        input?.value
            .trim()
            .toLowerCase() ||
        "";


    showPage("peers");


    const mainSearch =
        document.getElementById(
            "mainPeerSearch"
        );


    if (mainSearch) {
        mainSearch.value =
            query;
    }


    searchMainPeers();

}


function searchMainPeers() {

    const query =
        document.getElementById(
            "mainPeerSearch"
        )?.value
            .trim()
            .toLowerCase() ||
        "";


    const subject =
        document.getElementById(
            "subjectFilter"
        )?.value ||
        "";


    const year =
        document.getElementById(
            "yearFilter"
        )?.value ||
        "";


    const availability =
        document.getElementById(
            "availabilityFilter"
        )?.value ||
        "";


    const onlineOnly =
        document.getElementById(
            "onlineFilter"
        )?.checked === true;


    const results =
        peers.filter(
            function (peer) {

                const searchable = [

                    peer.name,

                    peer.year,

                    peer.bio,

                    ...peer.subjects,

                    ...peer.topics

                ]
                    .join(" ")
                    .toLowerCase();


                const matchesQuery =
                    !query ||
                    searchable.includes(
                        query
                    );


                const matchesSubject =
                    !subject ||
                    peer.subjects.includes(
                        subject
                    );


                const matchesYear =
                    !year ||
                    peer.year === year;


                const matchesAvailability =
                    !availability ||
                    peer.availability ===
                        availability;


                const matchesOnline =
                    !onlineOnly ||
                    peer.online;


                return (
                    matchesQuery &&
                    matchesSubject &&
                    matchesYear &&
                    matchesAvailability &&
                    matchesOnline
                );

            }
        );


    renderPeerResults(
        results
    );

}


function renderPeerResults(results) {

    const container =
        document.getElementById(
            "searchResults"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!results.length) {

        container.innerHTML = `

            <div class="empty-state">

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


    results.forEach(
        function (peer) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "peer-card";


            card.innerHTML = `

                <div class="peer-card-top">

                    <div class="avatar">
                        ${getInitials(peer.name)}
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(
                                peer.name
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                peer.year
                            )}
                        </p>

                    </div>

                </div>


                <p>
                    ${escapeHTML(
                        peer.bio
                    )}
                </p>


                <div class="subject-tags">

                    ${peer.subjects
                        .map(
                            function (subject) {

                                return `
                                    <span class="subject-tag">
                                        ${escapeHTML(
                                            subject
                                        )}
                                    </span>
                                `;

                            }
                        )
                        .join("")}

                </div>


                <div class="peer-card-bottom">

                    <span>
                        ${peer.online
                            ? "● Online"
                            : "○ Offline"}
                    </span>


                    <button
                        class="secondary-button"
                        onclick="viewPeer('${escapeAttribute(
                            peer.name
                        )}')"
                    >
                        View profile
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   VIEW PEER
   ========================================================= */

function viewPeer(name) {

    const peer =
        peers.find(
            function (item) {

                return item.name === name;

            }
        );


    if (!peer) {
        return;
    }


    /*
       IMPORTANT:
       Viewing a profile DOES NOT book anything.
    */

    showModal(`

        <div style="display:flex; gap:15px; align-items:center;">

            <div class="large-avatar">
                ${getInitials(peer.name)}
            </div>

            <div>

                <h2>
                    ${escapeHTML(
                        peer.name
                    )}
                </h2>

                <p style="color:#85847e;">
                    ${escapeHTML(
                        peer.year
                    )}
                </p>

            </div>

        </div>


        <p style="margin-top:20px; color:#85847e;">
            ${escapeHTML(
                peer.bio
            )}
        </p>


        <div
            class="subject-tags"
            style="margin-top:15px;"
        >

            ${peer.subjects
                .map(
                    function (subject) {

                        return `
                            <span class="subject-tag">
                                ${escapeHTML(
                                    subject
                                )}
                            </span>
                        `;

                    }
                )
                .join("")}

        </div>


        <p
            style="
                margin-top:15px;
                color:#173c32;
                font-size:12px;
                font-weight:700;
            "
        >
            ${escapeHTML(
                peer.availability
            )}
        </p>


        <div
            style="
                display:flex;
                gap:10px;
                margin-top:22px;
                justify-content:flex-end;
            "
        >

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Close
            </button>

            <button
                class="primary-button"
                onclick="bookPeer('${escapeAttribute(
                    peer.name
                )}')"
            >
                Book session
            </button>

        </div>

    `);

}


/* =========================================================
   BOOK PEER
   ========================================================= */

function bookPeer(name) {

    const peer =
        peers.find(
            function (item) {

                return item.name === name;

            }
        );


    if (!peer) {
        return;
    }


    showModal(`

        <h2>
            Book a session
        </h2>

        <p
            style="
                margin-top:10px;
                color:#85847e;
            "
        >
            Book a tutoring session with
            <strong>
                ${escapeHTML(
                    peer.name
                )}
            </strong>.
        </p>


        <div class="form-group" style="margin-top:18px;">

            <label>
                Session date
            </label>

            <input
                id="bookingDate"
                type="date"
            >

        </div>


        <div class="form-group">

            <label>
                Session type
            </label>

            <select id="bookingType">

                <option>
                    Online
                </option>

                <option>
                    In person
                </option>

            </select>

        </div>


        <div
            style="
                display:flex;
                gap:10px;
                justify-content:flex-end;
                margin-top:20px;
            "
        >

            <button
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

            <button
                class="primary-button"
                onclick="confirmBooking('${escapeAttribute(
                    peer.name
                )}')"
            >
                Confirm booking
            </button>

        </div>

    `);

}


function confirmBooking(name) {

    const date =
        document.getElementById(
            "bookingDate"
        )?.value;


    const type =
        document.getElementById(
            "bookingType"
        )?.value ||
        "Online";


    if (!date) {

        alert(
            "Please choose a date."
        );

        return;
    }


    calendarEvents.push({

        id:
            Date.now(),

        title:
            `Tutoring with ${name}`,

        date:
            date

    });


    safeSet(
        CALENDAR_KEY,
        calendarEvents
    );


    if (currentUser) {

        currentUser.sessions =
            (currentUser.sessions || 0) + 1;


        currentUser.points =
            (currentUser.points || 0) + 2;


        currentUser.progressHistory =
            currentUser.progressHistory || [];


        currentUser.progressHistory.push(
            currentUser.points
        );


        saveCurrentUser();

    }


    closeModal();

    renderCalendar();

    loadUserData();


    roroSay(
        `Session booked with ${name}! 🐉`
    );

}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfile() {

    if (!currentUser) {
        return;
    }


    const tags =
        document.getElementById(
            "profileTags"
        );


    const preferences =
        document.getElementById(
            "profilePreferences"
        );


    if (tags) {

        tags.innerHTML = "";


        if (
            !currentUser.subjects ||
            !currentUser.subjects.length
        ) {

            tags.innerHTML = `

                <span class="subject-tag">
                    No subjects added yet
                </span>

            `;

        } else {

            currentUser.subjects.forEach(
                function (subject) {

                    const tag =
                        document.createElement(
                            "span"
                        );


                    tag.className =
                        "subject-tag";


                    tag.textContent =
                        subject;


                    tags.appendChild(
                        tag
                    );

                }
            );

        }

    }


    if (preferences) {

        preferences.textContent =
            currentUser.preferences ||
            "No preferences added yet.";

    }

}


function editProfile() {

    if (!currentUser) {
        return;
    }


    const currentSubjects =
        currentUser.subjects?.join(
            ", "
        ) || "";


    const subjects =
        prompt(
            "Subjects you can help with (separate with commas):",
            currentSubjects
        );


    if (subjects === null) {
        return;
    }


    const preferences =
        prompt(
            "Your session preferences:",
            currentUser.preferences ||
                ""
        );


    if (preferences === null) {
        return;
    }


    currentUser.subjects =
        subjects
            .split(",")
            .map(
                function (item) {

                    return item.trim();

                }
            )
            .filter(Boolean);


    currentUser.preferences =
        preferences.trim();


    saveCurrentUser();

    renderProfile();


    roroSay(
        "Profile updated! 🐉"
    );

}


/* =========================================================
   SAVE CURRENT USER
   ========================================================= */

function saveCurrentUser() {

    if (!currentUser || !currentUser.email) {
        return false;
    }


    users[currentUser.email] =
        currentUser;


    return safeSet(
        USERS_KEY,
        users
    );

}


/* =========================================================
   HOME PROGRESS
   ========================================================= */

function updateHomeProgress() {

    if (!currentUser) {
        return;
    }


    const points =
        currentUser.points || 0;


    const helped =
        currentUser.helped || 0;


    const homePoints =
        document.getElementById(
            "homePoints"
        );


    const homeHelped =
        document.getElementById(
            "homeHelped"
        );


    const progressFill =
        document.getElementById(
            "homeProgressFill"
        );


    const caption =
        document.getElementById(
            "homeProgressCaption"
        );


    if (homePoints) {
        homePoints.textContent =
            points;
    }


    if (homeHelped) {

        homeHelped.textContent =
            `You've helped ${helped} student${helped === 1 ? "" : "s"} this term.`;

    }


    const percentage =
        Math.min(
            100,
            (points % 100)
        );


    if (progressFill) {
        progressFill.style.width =
            percentage + "%";
    }


    if (caption) {

        const remaining =
            100 - percentage;


        if (remaining === 100) {

            caption.textContent =
                "Start earning Peer Points.";

        } else {

            caption.textContent =
                `${remaining} points until the next 100-point milestone.`;

        }

    }

}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    if (!currentUser) {
        return;
    }


    const progressPoints =
        document.getElementById(
            "progressPoints"
        );


    const progressHelped =
        document.getElementById(
            "progressHelped"
        );


    const progressSessions =
        document.getElementById(
            "progressSessions"
        );


    const progressBadges =
        document.getElementById(
            "progressBadges"
        );


    if (progressPoints) {
        progressPoints.textContent =
            currentUser.points || 0;
    }


    if (progressHelped) {
        progressHelped.textContent =
            currentUser.helped || 0;
    }


    if (progressSessions) {
        progressSessions.textContent =
            currentUser.sessions || 0;
    }


    if (progressBadges) {
        progressBadges.textContent =
            currentUser.badges || 0;
    }


    drawProgressChart();

}


function drawProgressChart() {

    const canvas =
        document.getElementById(
            "progressChart"
        );


    if (!canvas || !currentUser) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    if (!ctx) {
        return;
    }


    const rect =
        canvas.getBoundingClientRect();


    const width =
        rect.width || 600;


    const height =
        300;


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        width * dpr;


    canvas.height =
        height * dpr;


    ctx.scale(
        dpr,
        dpr
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const history =
        currentUser.progressHistory?.length
            ? currentUser.progressHistory
            : [0];


    const max =
        Math.max(
            10,
            ...history
        );


    const padding = 35;


    /*
       Grid lines
    */

    ctx.strokeStyle =
        "#e4e0d7";

    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding +
            (
                (height -
                    padding * 2) *
                i /
                4
            );


        ctx.beginPath();

        ctx.moveTo(
            padding,
            y
        );

        ctx.lineTo(
            width - padding,
            y
        );

        ctx.stroke();

    }


    /*
       Progress line
    */

    ctx.strokeStyle =
        "#173c32";

    ctx.lineWidth = 3;

    ctx.beginPath();


    history.forEach(
        function (value, index) {

            const x =
                padding +
                (
                    (width -
                        padding * 2) *
                    index /
                    Math.max(
                        1,
                        history.length - 1
                    )
                );


            const y =
                height -
                padding -
                (
                    (value / max) *
                    (
                        height -
                        padding * 2
                    )
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


    /*
       Points
    */

    history.forEach(
        function (value, index) {

            const x =
                padding +
                (
                    (width -
                        padding * 2) *
                    index /
                    Math.max(
                        1,
                        history.length - 1
                    )
                );


            const y =
                height -
                padding -
                (
                    (value / max) *
                    (
                        height -
                        padding * 2
                    )
                );


            ctx.fillStyle =
                "#b79a62";


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
   STUDY SESSION
   ========================================================= */

function renderStudyStats() {

    if (!currentUser) {
        return;
    }


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


/* =========================================================
   POMODORO MODE
   ========================================================= */

function setPomodoroMode(mode) {

    if (
        mode !== "focus" &&
        mode !== "short" &&
        mode !== "long"
    ) {
        return;
    }


    stopPomodoro();


    pomodoroMode =
        mode;


    const buttons = {

        focus:
            document.getElementById(
                "focusModeButton"
            ),

        short:
            document.getElementById(
                "shortBreakButton"
            ),

        long:
            document.getElementById(
                "longBreakButton"
            )

    };


    Object.keys(buttons).forEach(
        function (key) {

            if (buttons[key]) {

                buttons[key].classList.toggle(
                    "active",
                    key === mode
                );

            }

        }
    );


    resetPomodoro();

}


/* =========================================================
   POMODORO DISPLAY
   ========================================================= */

function updatePomodoroDisplay() {

    const element =
        document.getElementById(
            "pomodoroTime"
        );


    if (!element) {
        return;
    }


    const totalSeconds =
        pomodoroSeconds;


    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    element.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* =========================================================
   RESET POMODORO
   ========================================================= */

function resetPomodoro() {

    stopPomodoro();


    pomodoroSeconds =
        pomodoroMinutes[
            pomodoroMode
        ] * 60;


    updatePomodoroDisplay();


    const status =
        document.getElementById(
            "pomodoroStatus"
        );


    const button =
        document.getElementById(
            "pomodoroStartButton"
        );


    if (status) {
        status.textContent =
            "Ready when you are.";
    }


    if (button) {
        button.textContent =
            "Start focus";
    }

}


/* =========================================================
   TOGGLE POMODORO
   ========================================================= */

function togglePomodoro() {

    if (pomodoroRunning) {

        stopPomodoro();


        const status =
            document.getElementById(
                "pomodoroStatus"
            );


        if (status) {
            status.textContent =
                "Paused. Take a breath.";
        }


        return;
    }


    if (pomodoroSeconds <= 0) {
        resetPomodoro();
    }


    pomodoroRunning =
        true;


    const button =
        document.getElementById(
            "pomodoroStartButton"
        );


    const status =
        document.getElementById(
            "pomodoroStatus"
        );


    if (button) {
        button.textContent =
            "Pause";
    }


    if (status) {
        status.textContent =
            "Focus mode is running.";
    }


    pomodoroInterval =
        setInterval(
            function () {

                pomodoroSeconds--;

                updatePomodoroDisplay();


                if (
                    pomodoroSeconds <= 0
                ) {

                    completePomodoro();

                }

            },
            1000
        );

}


/* =========================================================
   STOP POMODORO
   ========================================================= */

function stopPomodoro() {

    if (pomodoroInterval) {

        clearInterval(
            pomodoroInterval
        );

        pomodoroInterval =
            null;

    }


    pomodoroRunning =
        false;


    const button =
        document.getElementById(
            "pomodoroStartButton"
        );


    if (button) {

        button.textContent =
            "Start focus";

    }

}


/* =========================================================
   COMPLETE POMODORO
   ========================================================= */

function completePomodoro() {

    stopPomodoro();


    if (currentUser) {

        if (
            pomodoroMode === "focus"
        ) {

            currentUser.studySessions =
                (currentUser.studySessions || 0) + 1;


            currentUser.studyMinutes =
                (currentUser.studyMinutes || 0) +
                pomodoroMinutes.focus;


            currentUser.points =
                (currentUser.points || 0) + 5;


            currentUser.progressHistory =
                currentUser.progressHistory || [];


            currentUser.progressHistory.push(
                currentUser.points
            );


            saveCurrentUser();

        }

    }


    const status =
        document.getElementById(
            "pomodoroStatus"
        );


    if (status) {

        status.textContent =
            "Session complete! Nice work.";

    }


    roroSay(
        "You finished your focus session! 🐉✨"
    );


    renderStudyStats();

    updateHomeProgress();

    renderProgress();


    resetPomodoro();

}


/* =========================================================
   SKIP POMODORO
   ========================================================= */

function skipPomodoro() {

    stopPomodoro();


    if (
        pomodoroMode === "focus"
    ) {

        setPomodoroMode(
            "short"
        );

    } else {

        setPomodoroMode(
            "focus"
        );

    }

}


/* =========================================================
   CHANGE POMODORO TIME
   ========================================================= */

function changePomodoroTime() {

    const current =
        pomodoroMinutes[
            pomodoroMode
        ];


    const input =
        prompt(
            "How many minutes should this timer be?",
            current
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


    pomodoroMinutes[
        pomodoroMode
    ] =
        Math.round(minutes);


    resetPomodoro();

}


/* =========================================================
   RESOURCE NOTICE
   ========================================================= */

function resourceNotice(resource) {

    showModal(`

        <h2>
            ${escapeHTML(resource)}
        </h2>

        <p
            style="
                margin-top:10px;
                color:#85847e;
            "
        >
            This prototype is ready for the school's
            real study resources to be connected here.
        </p>

        <div style="margin-top:20px;">

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Close
            </button>

        </div>

    `);

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function showNotifications() {

    showModal(`

        <h2>
            Notifications
        </h2>

        <p
            style="
                margin-top:15px;
                color:#85847e;
            "
        >
            You're all caught up. 🎉
        </p>

        <div
            style="
                margin-top:20px;
            "
        >

            <button
                class="primary-button"
                onclick="closeModal()"
            >
                Done
            </button>

        </div>

    `);

}


/* =========================================================
   MODAL
   ========================================================= */

function showModal(content) {

    const modal =
        document.getElementById(
            "modal"
        );


    const modalContent =
        document.getElementById(
            "modalContent"
        );


    if (!modal || !modalContent) {
        return;
    }


    modalContent.innerHTML =
        content;


    modal.style.display =
        "flex";

}


function closeModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* Close modal when clicking outside */

function setupModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (!modal) {
        return;
    }


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================================
   RORO
   ========================================================= */

const roroMessages = [

    "You can do this. 🐉",

    "Tiny progress still counts.",

    "I believe in you. Unfortunately, I am now emotionally invested.",

    "One task at a time.",

    "Drink some water too. Humans need that apparently.",

    "That was actually pretty good. 🐉✨",

    "Future you is going to be grateful."

];


function roroSay(message) {

    const speech =
        document.getElementById(
            "roroSpeech"
        );


    const buddy =
        document.getElementById(
            "roroBuddy"
        );


    if (!speech || !buddy) {
        return;
    }


    speech.textContent =
        message;


    speech.classList.add(
        "roro-talking"
    );


    buddy.classList.add(
        "roro-happy"
    );


    setTimeout(
        function () {

            speech.classList.remove(
                "roro-talking"
            );

            buddy.classList.remove(
                "roro-happy"
            );

        },
        3500
    );

}


function roroInteract() {

    const message =
        roroMessages[
            Math.floor(
                Math.random() *
                roroMessages.length
            )
        ];


    roroSay(
        message
    );

}


/* =========================================================
   SIGN OUT
   ========================================================= */

function signOut() {

    stopPomodoro();


    currentUser =
        null;


    safeRemove(
        CURRENT_USER_KEY
    );


    showLogin();


    const email =
        document.getElementById(
            "email"
        );


    const password =
        document.getElementById(
            "password"
        );


    if (email) {
        email.value = "";
    }


    if (password) {
        password.value = "";
    }


    const remember =
        document.getElementById(
            "rememberMe"
        );


    if (remember) {
        remember.checked = false;
    }

}


/* =========================================================
   UTILITY
   ========================================================= */

function getInitials(name) {

    return String(name || "Student")
        .split(/\s+/)
        .map(
            function (part) {

                return part.charAt(0);

            }
        )
        .join("")
        .slice(0, 2)
        .toUpperCase();

}


function formatShortDate(dateString) {

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
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return String(value ?? "")
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );

}


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function () {

        const progressPage =
            document.getElementById(
                "progress"
            );


        if (
            progressPage &&
            progressPage.classList.contains(
                "active-page"
            )
        ) {

            drawProgressChart();

        }

    }
);


/* =========================================================
   KEYBOARD ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   POMODORO TIME CLICK
   ========================================================= */

function setupPomodoroTimeEditing() {

    const time =
        document.getElementById(
            "pomodoroTime"
        );


    if (!time) {
        return;
    }


    time.title =
        "Click to change timer";


    time.style.cursor =
        "pointer";


    time.addEventListener(
        "click",
        function () {

            changePomodoroTime();

        }
    );

}


/* =========================================================
   INITIALISE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loginScreen =
            document.getElementById(
                "loginScreen"
            );


        signupScreen =
            document.getElementById(
                "signupScreen"
            );


        mainApp =
            document.getElementById(
                "mainApp"
            );


        /*
           ALWAYS start at login.

           This prevents the website from randomly opening
           straight into the dashboard.
        */

        if (mainApp) {
            mainApp.style.display =
                "none";
        }


        if (signupScreen) {
            signupScreen.style.display =
                "none";
        }


        if (loginScreen) {
            loginScreen.style.display =
                "flex";
        }


        setupLogin();

        setupSignup();

        setupNavigation();

        setupModal();

        setupPomodoroTimeEditing();

        updateDateAndGreeting();

        renderMiniCalendar();

        renderAssignments();

        renderRecommendedPeers();

        updateQuotes();


        /*
           If a remembered user exists, we still start
           at the login screen as requested. They can log
           in normally.
        */

        if (currentUser) {

            console.log(
                "Remembered account available:",
                currentUser.email
            );

        }


        /*
           Search with Enter key.
        */

        const peerSearch =
            document.getElementById(
                "peerSearch"
            );


        if (peerSearch) {

            peerSearch.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        searchPeers();

                    }

                }
            );

        }


        const mainPeerSearch =
            document.getElementById(
                "mainPeerSearch"
            );


        if (mainPeerSearch) {

            mainPeerSearch.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        searchMainPeers();

                    }

                }
            );

        }


        /*
           Keep the date fresh.
        */

        setInterval(
            updateDateAndGreeting,
            60000
        );

    }
);
