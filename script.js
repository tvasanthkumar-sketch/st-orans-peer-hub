/* =========================================================
   ST ORAN'S PEER HUB
   JAVASCRIPT
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "stOransPeerHubUsers";
const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";


/* =========================================================
   DEMO USERS
   ========================================================= */

const demoUsers = {

    maya: {
        firstName: "Maya",
        lastName: "Smith",
        fullName: "Maya Smith",
        email: "t.smith@storans.school.nz",
        password: "Demo123",
        year: "Year 8",
        className: "8WI",
        initials: "MS",

        points: 240,
        helped: 8,
        sessions: 12,
        badges: 3,

        studySessions: 4,
        studyMinutes: 100,
        streak: 3,

        bio: "I enjoy helping people understand maths and science.",

        subjects: [
            "Maths",
            "Algebra",
            "Science",
            "Graphs"
        ],

        progressHistory: [
            80,
            105,
            130,
            165,
            205,
            240
        ]
    },


    lucy: {
        firstName: "Lucy",
        lastName: "Worthington",
        fullName: "Lucy Worthington",
        email: "l.worthington@storans.school.nz",
        password: "Lucy123",
        year: "Year 13",
        className: "13LW",
        initials: "LW",

        points: 520,
        helped: 21,
        sessions: 28,
        badges: 6,

        studySessions: 18,
        studyMinutes: 450,
        streak: 12,

        bio: "I love helping younger students with English, study skills and essay writing.",

        subjects: [
            "English",
            "Essay writing",
            "Study skills",
            "Literacy"
        ],

        progressHistory: [
            280,
            330,
            370,
            415,
            465,
            520
        ]
    }

};


/* =========================================================
   LOAD / SAVE USERS
   ========================================================= */

function getStoredUsers() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        let storedUsers = {};

        if (saved) {

            storedUsers =
                JSON.parse(saved) || {};

        }


        const mergedUsers = {

            maya: {
                ...demoUsers.maya,
                ...(storedUsers.maya || {}),
                progressHistory:
                    storedUsers.maya?.progressHistory
                        ? [...storedUsers.maya.progressHistory]
                        : [...demoUsers.maya.progressHistory]
            },

            lucy: {
                ...demoUsers.lucy,
                ...(storedUsers.lucy || {}),
                progressHistory:
                    storedUsers.lucy?.progressHistory
                        ? [...storedUsers.lucy.progressHistory]
                        : [...demoUsers.lucy.progressHistory]
            }

        };


        Object.keys(storedUsers).forEach(email => {

            if (
                email !== "maya" &&
                email !== "lucy"
            ) {

                mergedUsers[email] =
                    storedUsers[email];

            }

        });


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(mergedUsers)
        );

        return mergedUsers;

    }

    catch (error) {

        console.error(
            "Could not load users:",
            error
        );

        return {

            maya: {
                ...demoUsers.maya,
                progressHistory:
                    [...demoUsers.maya.progressHistory]
            },

            lucy: {
                ...demoUsers.lucy,
                progressHistory:
                    [...demoUsers.lucy.progressHistory]
            }

        };

    }

}


let users = getStoredUsers();


function saveUsers() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(users)
    );

}


function saveCurrentUser() {

    if (!currentUser) return;


    const email =
        currentUser.email.toLowerCase();


    users[email] = {
        ...currentUser,
        progressHistory:
            currentUser.progressHistory
                ? [...currentUser.progressHistory]
                : []
    };


    saveUsers();


    try {

        localStorage.setItem(
            CURRENT_USER_KEY,
            email
        );

    }

    catch (error) {

        console.error(
            "Could not save current user:",
            error
        );

    }

}


/* =========================================================
   PEERS
   ========================================================= */

const peers = [

    {
        id: 1,
        name: "Lucy Worthington",
        initials: "LW",
        year: "Year 13",
        subjects: [
            "English",
            "Essay writing",
            "Study skills"
        ],
        topics: [
            "Essay writing",
            "Paragraph structure",
            "Analysing texts",
            "Study skills"
        ],
        bio: "I love helping students become more confident with English and essay writing.",
        availability: "Available now",
        online: true,
        rating: "4.9",
        sessions: 28
    },


    {
        id: 2,
        name: "Aria Patel",
        initials: "AP",
        year: "Year 10",
        subjects: [
            "Maths",
            "Algebra",
            "Geometry"
        ],
        topics: [
            "Expanding brackets",
            "Factorising",
            "Linear equations",
            "Pythagoras"
        ],
        bio: "Happy to help with algebra, geometry and anything maths-related.",
        availability: "Available now",
        online: true,
        rating: "4.8",
        sessions: 17
    },


    {
        id: 3,
        name: "Sofia Chen",
        initials: "SC",
        year: "Year 11",
        subjects: [
            "Science",
            "Biology",
            "Chemistry"
        ],
        topics: [
            "Cells",
            "Chemical reactions",
            "Genetics",
            "Lab reports"
        ],
        bio: "I can help make tricky science concepts easier to understand.",
        availability: "This week",
        online: false,
        rating: "4.9",
        sessions: 22
    },


    {
        id: 4,
        name: "Ella Thompson",
        initials: "ET",
        year: "Year 9",
        subjects: [
            "Spanish",
            "Vocabulary"
        ],
        topics: [
            "Spanish vocabulary",
            "Basic grammar",
            "Speaking",
            "Writing"
        ],
        bio: "I enjoy helping with Spanish vocabulary and speaking practice.",
        availability: "This week",
        online: true,
        rating: "4.7",
        sessions: 11
    },


    {
        id: 5,
        name: "Noah Williams",
        initials: "NW",
        year: "Year 12",
        subjects: [
            "History",
            "Social Studies"
        ],
        topics: [
            "Case studies",
            "Essay structure",
            "Research",
            "Source analysis"
        ],
        bio: "Happy to help with Social Studies research and case studies.",
        availability: "Available now",
        online: false,
        rating: "4.8",
        sessions: 19
    },


    {
        id: 6,
        name: "Amelia Kumar",
        initials: "AK",
        year: "Year 10",
        subjects: [
            "Technology",
            "Design"
        ],
        topics: [
            "Design thinking",
            "Prototyping",
            "Laser cutting",
            "Product design"
        ],
        bio: "I can help with design processes, prototyping and technology projects.",
        availability: "This week",
        online: true,
        rating: "4.9",
        sessions: 15
    }

];


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

const defaultAssignments = [

    {
        id: 1,
        subject: "Maths",
        title: "Algebra practice",
        due: "2026-09-08",
        priority: "high",
        complete: false
    },


    {
        id: 2,
        subject: "Science",
        title: "Water cycle report",
        due: "2026-09-11",
        priority: "medium",
        complete: false
    },


    {
        id: 3,
        subject: "English",
        title: "Heroes and villains speech",
        due: "2026-09-15",
        priority: "high",
        complete: false
    },


    {
        id: 4,
        subject: "Social Studies",
        title: "Disaster case study",
        due: "2026-09-18",
        priority: "medium",
        complete: false
    },


    {
        id: 5,
        subject: "Spanish",
        title: "Vocabulary revision",
        due: "2026-09-05",
        priority: "low",
        complete: true
    }

];


function loadAssignments() {

    if (!currentUser) {

        return defaultAssignments.map(
            assignment => ({
                ...assignment
            })
        );

    }


    const key =
        `stOransPeerHubAssignments_${currentUser.email.toLowerCase()}`;


    try {

        const saved =
            localStorage.getItem(key);


        if (saved) {

            return JSON.parse(saved);

        }

    }

    catch (error) {

        console.error(
            "Could not load assignments:",
            error
        );

    }


    return defaultAssignments.map(
        assignment => ({
            ...assignment
        })
    );

}


function saveAssignments() {

    if (!currentUser) return;


    const key =
        `stOransPeerHubAssignments_${currentUser.email.toLowerCase()}`;


    try {

        localStorage.setItem(
            key,
            JSON.stringify(assignments)
        );

    }

    catch (error) {

        console.error(
            "Could not save assignments:",
            error
        );

    }

}


/* =========================================================
   RESOURCES
   ========================================================= */

const resources = [

    {
        subject: "Maths",
        title: "Algebra essentials",
        description: "A quick guide to equations, expanding brackets and factorising.",
        type: "Study guide"
    },


    {
        subject: "Maths",
        title: "Pythagoras practice",
        description: "Practice questions for right-angled triangles.",
        type: "Practice"
    },


    {
        subject: "English",
        title: "Essay structure",
        description: "A simple framework for planning strong analytical paragraphs.",
        type: "Study guide"
    },


    {
        subject: "Science",
        title: "Science investigation guide",
        description: "Planning variables, writing hypotheses and analysing results.",
        type: "Guide"
    },


    {
        subject: "Social Studies",
        title: "Case study checklist",
        description: "Everything you need to include in a strong case study.",
        type: "Checklist"
    },


    {
        subject: "Spanish",
        title: "Spanish vocabulary",
        description: "Useful vocabulary for common Year 8 topics.",
        type: "Vocabulary"
    }

];


/* =========================================================
   QUOTES
   ========================================================= */

const quotes = [

    "Small progress is still progress.",
    "You do not have to know everything to start.",
    "Consistency beats intensity.",
    "A difficult topic becomes easier one question at a time.",
    "The best students are not afraid to ask questions.",
    "Your future self will thank you for studying today.",
    "Helping someone else is one of the best ways to learn.",
    "Mistakes are evidence that you are actually trying."

];


const pageQuotes = {

    home: [
        "Small progress is still progress.",
        "Consistency beats intensity.",
        "You do not have to know everything to start."
    ],

    calendar: [
        "A little organisation saves a lot of stress.",
        "Future you deserves an organised calendar.",
        "One deadline at a time."
    ],

    assignments: [
        "Done is better than forgotten.",
        "Start before the deadline becomes a crisis.",
        "Small tasks become big wins when completed."
    ],

    peers: [
        "Everyone knows something you do not.",
        "Learning together makes difficult things easier.",
        "Asking for help is part of learning."
    ],

    resources: [
        "The right resource can change everything.",
        "Learn it. Practise it. Understand it."
    ],

    study: [
        "One focused session is better than an hour of distracted studying.",
        "You don't need motivation. You need a starting point.",
        "Future you is going to be very glad you studied."
    ],

    profile: [
        "Your strengths can become someone else's starting point.",
        "Everyone has something worth teaching."
    ],

    progress: [
        "Progress is easier to see when you look back.",
        "Every helpful action counts.",
        "Keep building."
    ],

    settings: [
        "Make the system work for you.",
        "Small adjustments can make a big difference."
    ]

};


/* =========================================================
   APP STATE
   ========================================================= */

let currentUser = null;

let currentPage = "home";

let selectedPeer = null;

let calendarDate = new Date();

let calendarEvents = [];

let currentAssignmentFilter = "all";

let pomodoroMode = "focus";

let pomodoroSeconds = 25 * 60;

let pomodoroTimer = null;

let pomodoroRunning = false;

let completedPomodoros = 0;

let studyMinutesThisVisit = 0;


/* =========================================================
   ASSIGNMENT STATE
   ========================================================= */

let assignments = loadAssignments();


/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupLogin();

    setupSignup();

    setupNavigation();

    updateDate();

    updateClock();

    setInterval(updateClock, 1000);

    setupRoro();

    restoreLogin();

});


/* =========================================================
   RESTORE LOGIN
   ========================================================= */

function restoreLogin() {

    let savedEmail = null;


    try {

        savedEmail =
            localStorage.getItem(
                CURRENT_USER_KEY
            );

    }

    catch (error) {

        return;

    }


    if (!savedEmail) return;


    const user =
        users[savedEmail];


    if (!user) {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

        return;

    }


    login(user, true);

}


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

    const form =
        document.getElementById("loginForm");

    if (!form) return;


    form.addEventListener("submit", event => {

        event.preventDefault();


        const email =
            document
                .getElementById("email")
                ?.value
                .trim()
                .toLowerCase();


        const password =
            document
                .getElementById("password")
                ?.value;


        const error =
            document.getElementById(
                "loginError"
            );


        const foundUser =
            Object.values(users).find(
                user =>
                    user.email.toLowerCase() === email &&
                    user.password === password
            );


        if (!foundUser) {

            if (error) {

                error.textContent =
                    "That email or password doesn't match an account.";

            }

            return;

        }


        if (error) {

            error.textContent = "";

        }


        login(foundUser);

    });

}


function login(user, restored = false) {

    currentUser = {

        ...user,

        progressHistory:
            user.progressHistory
                ? [...user.progressHistory]
                : [],

        subjects:
            user.subjects
                ? [...user.subjects]
                : []

    };


    assignments =
        loadAssignments();


    try {

        localStorage.setItem(
            CURRENT_USER_KEY,
            currentUser.email.toLowerCase()
        );

    }

    catch (error) {

        console.error(
            "Could not remember login:",
            error
        );

    }


    document
        .getElementById("loginScreen")
        ?.classList.add("hidden");


    document
        .getElementById("signupScreen")
        ?.classList.add("hidden");


    document
        .getElementById("mainApp")
        ?.classList.remove("hidden");


    updateUserUI();

    showPage("home");


    if (!restored) {

        roroSay(
            `Welcome back, ${currentUser.firstName}! 🐉`
        );

    }

}


/* =========================================================
   GOOGLE LOGIN
   ========================================================= */

function googleLogin() {

    const account =
        prompt(
            "Prototype Google login\n\nType:\n1 = Maya\n2 = Lucy"
        );


    if (account === null) {

        return;

    }


    if (account.trim() === "1") {

        const maya =
            users.maya || demoUsers.maya;

        login(maya);

        return;

    }


    if (account.trim() === "2") {

        const lucy =
            users.lucy || demoUsers.lucy;

        login(lucy);

        return;

    }


    alert(
        "For this prototype, enter 1 for Maya or 2 for Lucy."
    );

}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

function forgotPassword(event) {

    if (event) {

        event.preventDefault();

    }


    const email =
        prompt(
            "Enter the email address on your Peer Hub account:"
        );


    if (!email) return;


    const cleanEmail =
        email.trim().toLowerCase();


    const user =
        Object.values(users).find(
            account =>
                account.email.toLowerCase() === cleanEmail
        );


    if (!user) {

        alert(
            "No Peer Hub account was found with that email."
        );

        return;

    }


    const newPassword =
        prompt(
            "Prototype password reset:\n\nEnter your new password:"
        );


    if (!newPassword) return;


    if (newPassword.length < 6) {

        alert(
            "Your new password needs to be at least 6 characters."
        );

        return;

    }


    user.password =
        newPassword;


    users[user.email.toLowerCase()] =
        user;


    saveUsers();


    alert(
        "Your password has been changed. You can now log in with your new password."
    );

}


/* =========================================================
   SIGNUP SCREEN
   ========================================================= */

function showSignup(event) {

    if (event) {

        event.preventDefault();

    }


    document
        .getElementById("loginScreen")
        ?.classList.add("hidden");


    document
        .getElementById("mainApp")
        ?.classList.add("hidden");


    document
        .getElementById("signupScreen")
        ?.classList.remove("hidden");


    document
        .getElementById("signupError")
        ?.replaceChildren();

}


function showLogin(event) {

    if (event) {

        event.preventDefault();

    }


    document
        .getElementById("signupScreen")
        ?.classList.add("hidden");


    document
        .getElementById("mainApp")
        ?.classList.add("hidden");


    document
        .getElementById("loginScreen")
        ?.classList.remove("hidden");

}


function setupSignup() {

    const form =
        document.getElementById(
            "signupForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const firstName =
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


            const yearValue =
                document
                    .getElementById("signupYear")
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById("signupPassword")
                    ?.value;


            const confirmPassword =
                document
                    .getElementById("signupConfirmPassword")
                    ?.value;


            const error =
                document.getElementById(
                    "signupError"
                );


            if (error) {

                error.textContent = "";

            }


            /* -----------------------------
               BASIC VALIDATION
            ----------------------------- */

            if (
                !firstName ||
                !email ||
                !yearValue ||
                !password ||
                !confirmPassword
            ) {

                if (error) {

                    error.textContent =
                        "Please fill in every field.";

                }

                return;

            }


            if (!email.includes("@")) {

                if (error) {

                    error.textContent =
                        "Please enter a valid email address.";

                }

                return;

            }


            if (password.length < 6) {

                if (error) {

                    error.textContent =
                        "Password must be at least 6 characters.";

                }

                return;

            }


            if (password !== confirmPassword) {

                if (error) {

                    error.textContent =
                        "The passwords don't match.";

                }

                return;

            }


            if (users[email]) {

                if (error) {

                    error.textContent =
                        "An account with that email already exists.";

                }

                return;

            }


            /*
               Generate a simple surname placeholder
               because the current HTML only asks for
               one name.
            */

            const lastName =
                "Student";


            const initials =
                `${firstName[0]}${lastName[0]}`
                    .toUpperCase();


            /*
               IMPORTANT:
               BRAND NEW ACCOUNT STARTS COMPLETELY EMPTY.
            */

            const newUser = {

                firstName,

                lastName,

                fullName:
                    firstName,

                email,

                password,

                year:
                    `Year ${yearValue}`,

                className:
                    `${yearValue}XX`,

                initials,

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

                progressHistory: []

            };


            users[email] =
                newUser;


            saveUsers();


            currentUser = {

                ...newUser,

                progressHistory: [],

                subjects: []

            };


            assignments =
                defaultAssignments.map(
                    assignment => ({
                        ...assignment
                    })
                );


            try {

                localStorage.setItem(
                    CURRENT_USER_KEY,
                    email
                );

            }

            catch (storageError) {

                console.error(
                    storageError
                );

            }


            form.reset();


            document
                .getElementById("signupScreen")
                ?.classList.add("hidden");


            document
                .getElementById("loginScreen")
                ?.classList.add("hidden");


            document
                .getElementById("mainApp")
                ?.classList.remove("hidden");


            updateUserUI();

            showPage("home");


            roroSay(
                "Welcome to Peer Hub! Let's get studying 🐉"
            );


            alert(
                "Account created! 🎉\n\nYour progress starts at zero."
            );

        }
    );

}


/* =========================================================
   SIGN OUT
   ========================================================= */

function signOut() {

    stopPomodoro();

    saveCurrentUser();

    saveAssignments();


    currentUser = null;


    try {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

    }

    catch (error) {

        console.error(
            error
        );

    }


    document
        .getElementById("mainApp")
        ?.classList.add("hidden");


    document
        .getElementById("signupScreen")
        ?.classList.add("hidden");


    document
        .getElementById("loginScreen")
        ?.classList.remove("hidden");


    document
        .getElementById("loginForm")
        ?.reset();


    roroHide();

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

    roroReactToPage(page);

}


function renderPage(page) {

    renderQuote(page);


    switch (page) {

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

        case "resources":
            break;

        case "study":
            renderStudyPage();
            break;

        case "profile":
            renderProfile();
            break;

        case "progress":
            renderProgress();
            break;

        case "settings":
            renderSettings();
            break;

    }

}


/* =========================================================
   USER UI
   ========================================================= */

function updateUserUI() {

    if (!currentUser) return;


    setText(
        "topName",
        currentUser.firstName
    );


    setText(
        "topYear",
        currentUser.year
    );


    setText(
        "welcomeName",
        currentUser.firstName
    );


    setText(
        "homePoints",
        currentUser.points
    );


    setText(
        "homeHelped",
        `You've helped ${currentUser.helped} student${currentUser.helped === 1 ? "" : "s"} this term.`
    );


    setText(
        "progressPoints",
        currentUser.points
    );


    setText(
        "progressHelped",
        currentUser.helped
    );


    setText(
        "progressSessions",
        currentUser.sessions
    );


    setText(
        "progressBadges",
        currentUser.badges
    );


    setText(
        "settingsEmail",
        currentUser.email
    );


    setText(
        "profileName",
        currentUser.fullName
    );


    setText(
        "profileYear",
        `${currentUser.year} · ${currentUser.className}`
    );


    const avatar =
        document.getElementById(
            "topAvatar"
        );


    if (avatar) {

        avatar.textContent =
            currentUser.initials;

    }


    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    if (profileAvatar) {

        profileAvatar.textContent =
            currentUser.initials;

    }


    renderHomeProgress();

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

    if (!currentUser) return;


    const hour =
        new Date().getHours();


    let greeting;


    if (hour < 12) {

        greeting = "Good morning";

    }

    else if (hour < 18) {

        greeting = "Good afternoon";

    }

    else {

        greeting = "Good evening";

    }


    setText(
        "greeting",
        greeting
    );


    renderRecommendedPeers();

    renderUpcomingAssignments();

    renderMiniCalendar();

    renderHomeProgress();

}


function renderRecommendedPeers() {

    const container =
        document.getElementById(
            "recommendedPeers"
        );


    if (!container) return;


    container.innerHTML =
        peers
            .slice(0, 3)
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
                            ${peer.subjects.join(" · ")}
                        </span>

                    </div>

                    <span class="peer-availability">
                        ${peer.availability}
                    </span>

                </div>

            `)
            .join("");

}


function renderUpcomingAssignments() {

    const container =
        document.getElementById(
            "deadlineList"
        );


    if (!container) return;


    const upcoming =
        assignments
            .filter(item => !item.complete)
            .sort(
                (a, b) =>
                    new Date(a.due) -
                    new Date(b.due)
            )
            .slice(0, 4);


    container.innerHTML =
        upcoming
            .map(item => `

                <div class="assignment-row">

                    <div>

                        <strong>
                            ${item.title}
                        </strong>

                        <span>
                            ${item.subject}
                        </span>

                    </div>

                    <div>

                        <strong>
                            ${formatDate(item.due)}
                        </strong>

                        <span class="priority ${item.priority}">
                            ${capitalize(item.priority)}
                        </span>

                    </div>

                </div>

            `)
            .join("");

}


/* =========================================================
   HOME PROGRESS
   ========================================================= */

function renderHomeProgress() {

    if (!currentUser) return;


    const points =
        currentUser.points;


    const progress =
        Math.min(
            100,
            (points / 500) * 100
        );


    const fill =
        document.getElementById(
            "homeProgressFill"
        );


    if (fill) {

        fill.style.width =
            `${progress}%`;

    }


    const caption =
        document.getElementById(
            "homeProgressCaption"
        );


    if (caption) {

        if (points === 0) {

            caption.textContent =
                "Start helping others to earn your first Peer Points.";

        }

        else {

            caption.textContent =
                `${Math.max(0, 500 - points)} points until 500.`;

        }

    }

}


/* =========================================================
   DATE
   ========================================================= */

function updateDate() {

    const today =
        new Date();


    setText(
        "todayLabel",
        today.toLocaleDateString(
            "en-NZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        )
    );


    setText(
        "monthTitle",
        today.toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        )
    );

}


function updateClock() {

    /*
       Kept as a separate function so the study screen
       can use the same live time later.
    */

}


/* =========================================================
   QUOTES
   ========================================================= */

function renderQuote(page) {

    const elements =
        document.querySelectorAll(
            ".pageQuote"
        );


    const quote =
        getDailyQuote(
            pageQuotes[page] || quotes
        );


    elements.forEach(element => {

        element.textContent =
            quote;

    });


    const homeQuote =
        document.getElementById(
            "homeQuote"
        );


    if (homeQuote) {

        homeQuote.textContent =
            getDailyQuote(
                pageQuotes.home
            );

    }

}


function getDailyQuote(list) {

    const day =
        Math.floor(
            Date.now() /
            86400000
        );


    return list[
        day % list.length
    ];

}


/* =========================================================
   MINI CALENDAR
   ========================================================= */

function renderMiniCalendar() {

    const container =
        document.getElementById(
            "miniCalendar"
        );


    if (!container) return;


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        today.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    let startingDay =
        firstDay.getDay();


    startingDay =
        startingDay === 0
            ? 6
            : startingDay - 1;


    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    let html = "";


    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        html += `<span></span>`;

    }


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const isToday =
            day === today.getDate();


        html += `

            <span
                class="${isToday ? "today" : ""}"
            >
                ${day}
            </span>

        `;

    }


    container.innerHTML =
        html;

}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar() {

    const container =
        document.getElementById(
            "fullCalendar"
        );


    const title =
        document.getElementById(
            "fullMonthTitle"
        );


    if (!container || !title) return;


    title.textContent =
        calendarDate.toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        );


    const year =
        calendarDate.getFullYear();


    const month =
        calendarDate.getMonth();


    const first =
        new Date(
            year,
            month,
            1
        );


    let startingDay =
        first.getDay();


    startingDay =
        startingDay === 0
            ? 6
            : startingDay - 1;


    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    let html = "";


    [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ].forEach(day => {

        html += `
            <div class="calendar-heading">
                ${day}
            </div>
        `;

    });


    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        html += `
            <div class="calendar-cell empty"></div>
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


        const event =
            calendarEvents.find(item => {

                const date =
                    new Date(
                        `${item.date}T00:00:00`
                    );


                return (
                    date.getDate() === day &&
                    date.getMonth() === month &&
                    date.getFullYear() === year
                );

            });


        html += `

            <div
                class="calendar-cell ${isToday ? "today" : ""}"
            >

                <strong>
                    ${day}
                </strong>

                ${
                    event
                        ? `<small>${event.title}</small>`
                        : ""
                }

            </div>

        `;

    }


    container.innerHTML =
        html;

}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignments() {

    const container =
        document.getElementById(
            "assignmentPageList"
        );


    if (!container) return;


    let list =
        [...assignments];


    if (
        currentAssignmentFilter ===
        "upcoming"
    ) {

        list =
            list.filter(
                item => !item.complete
            );

    }


    if (
        currentAssignmentFilter ===
        "complete"
    ) {

        list =
            list.filter(
                item => item.complete
            );

    }


    container.innerHTML =
        list
            .map(item => `

                <div
                    class="assignment-card
                    ${item.complete ? "complete" : ""}"
                >

                    <button
                        class="assignment-check"
                        onclick="toggleAssignment(${item.id})"
                    >
                        ${item.complete ? "✓" : ""}
                    </button>


                    <div class="assignment-info">

                        <strong>
                            ${item.title}
                        </strong>

                        <span>
                            ${item.subject}
                        </span>

                    </div>


                    <div class="assignment-date">

                        <strong>
                            ${formatDate(item.due)}
                        </strong>

                        <span>
                            ${getDueLabel(item.due)}
                        </span>

                    </div>


                    <span
                        class="priority ${item.priority}"
                    >
                        ${capitalize(item.priority)}
                    </span>

                </div>

            `)
            .join("");

}


function toggleAssignment(id) {

    const assignment =
        assignments.find(
            item => item.id === id
        );


    if (!assignment) return;


    assignment.complete =
        !assignment.complete;


    if (assignment.complete) {

        addPoints(2);

        roroSay(
            "Assignment completed! That's progress. 🐉"
        );

    }


    saveAssignments();

    renderAssignments();

    renderHome();

}


/* =========================================================
   PEERS
   ========================================================= */

function renderPeers() {

    searchMainPeers();

}


function searchPeers() {

    showPage("peers");


    const homeSearch =
        document.getElementById(
            "peerSearch"
        );


    const mainSearch =
        document.getElementById(
            "mainPeerSearch"
        );


    if (
        homeSearch &&
        mainSearch
    ) {

        mainSearch.value =
            homeSearch.value;

    }


    searchMainPeers();

}


function searchMainPeers() {

    const search =
        (
            document.getElementById(
                "mainPeerSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


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


    const onlineOnly =
        document.getElementById(
            "onlineFilter"
        )?.checked || false;


    const filtered =
        peers.filter(peer => {

            const searchable =
                [
                    peer.name,
                    peer.year,
                    ...peer.subjects,
                    ...peer.topics,
                    peer.bio
                ]
                .join(" ")
                .toLowerCase();


            const searchMatch =
                !search ||
                searchable.includes(search);


            const subjectMatch =
                !subject ||
                peer.subjects.includes(
                    subject
                );


            const yearMatch =
                !year ||
                peer.year === year;


            const availabilityMatch =
                !availability ||
                (
                    availability ===
                    "Available now" &&
                    peer.availability ===
                    "Available now"
                ) ||
                (
                    availability ===
                    "Later today" &&
                    peer.availability ===
                    "This week"
                ) ||
                (
                    availability ===
                    "Online" &&
                    peer.online
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


    renderPeerResults(
        filtered
    );

}


function renderPeerResults(list) {

    const container =
        document.getElementById(
            "searchResults"
        );


    if (!container) return;


    if (!list.length) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No peers found
                </h3>

                <p>
                    Try another subject or topic.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        list
            .map(peer => `

                <div class="peer-card">

                    <div class="peer-card-top">

                        <div class="avatar">
                            ${peer.initials}
                        </div>

                        <div>

                            <h3>
                                ${peer.name}
                            </h3>

                            <p>
                                ${peer.year}
                            </p>

                        </div>

                    </div>


                    <p>
                        ${peer.bio}
                    </p>


                    <div class="subject-tags">

                        ${peer.subjects.map(subject => `

                            <span class="subject-tag">
                                ${subject}
                            </span>

                        `).join("")}

                    </div>


                    <div class="peer-card-bottom">

                        <span>
                            ★ ${peer.rating}
                            · ${peer.sessions} sessions
                        </span>


                        <button
                            class="primary-button"
                            onclick="viewPeer(${peer.id})"
                        >
                            View profile
                        </button>

                    </div>

                </div>

            `)
            .join("");

}


/* =========================================================
   PEER PROFILE
   ========================================================= */

function viewPeer(id) {

    selectedPeer =
        peers.find(
            peer => peer.id === id
        );


    if (!selectedPeer) return;


    const onlineText =
        selectedPeer.online
            ? " · Online"
            : "";


    const message =
        `
        ${selectedPeer.name}
        · ${selectedPeer.year}

        \n\n
        ${selectedPeer.bio}

        \n\n
        Can help with:
        ${selectedPeer.topics.join(", ")}

        \n\n
        ${selectedPeer.availability}${onlineText}

        \n\n
        Book a session from the prototype?
        `;


    const result =
        confirm(message);


    if (result) {

        bookPeer();

    }

}


function bookPeer() {

    if (!selectedPeer) return;


    addPoints(2);

    currentUser.sessions += 1;


    saveCurrentUser();

    updateUserUI();


    roroSay(
        `Session booked! Roro approves. 🐉`
    );


    alert(
        `Prototype booking confirmed with ${selectedPeer.name}.`
    );

}


/* =========================================================
   RESOURCES
   ========================================================= */

function resourceNotice(type) {

    alert(
        `${type} would connect to the school's resource library in the full version.`
    );

}


/* =========================================================
   STUDY SESSION
   ========================================================= */

function renderStudyPage() {

    if (!currentUser) return;


    setText(
        "studySessionsToday",
        currentUser.studySessions
    );


    setText(
        "studyMinutesToday",
        currentUser.studyMinutes
    );


    setText(
        "studyStreak",
        currentUser.streak
    );


    updatePomodoroDisplay();

}


function setPomodoroMode(mode) {

    stopPomodoro();


    pomodoroMode =
        mode;


    if (mode === "focus") {

        pomodoroSeconds =
            25 * 60;

    }


    if (mode === "short") {

        pomodoroSeconds =
            5 * 60;

    }


    if (mode === "long") {

        pomodoroSeconds =
            15 * 60;

    }


    document
        .querySelectorAll(
            ".pomodoro-mode-button"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    if (mode === "focus") {

        document
            .getElementById(
                "focusModeButton"
            )
            ?.classList.add("active");

    }


    if (mode === "short") {

        document
            .getElementById(
                "shortBreakButton"
            )
            ?.classList.add("active");

    }


    if (mode === "long") {

        document
            .getElementById(
                "longBreakButton"
            )
            ?.classList.add("active");

    }


    updatePomodoroDisplay();


    const status =
        mode === "focus"
            ? "Ready to focus."
            : "Time for a little break.";


    setText(
        "pomodoroStatus",
        status
    );

}


function togglePomodoro() {

    if (pomodoroRunning) {

        pausePomodoro();

    }

    else {

        startPomodoro();

    }

}


function startPomodoro() {

    if (pomodoroRunning) return;


    pomodoroRunning =
        true;


    const button =
        document.getElementById(
            "pomodoroStartButton"
        );


    if (button) {

        button.textContent =
            "Pause";

    }


    setText(
        "pomodoroStatus",
        pomodoroMode === "focus"
            ? "Focus mode is running."
            : "Enjoy your break."
    );


    roroSay(
        pomodoroMode === "focus"
            ? "Focus time! I'll keep watch. 👀🐉"
            : "Break time! Stretch those legs."
    );


    pomodoroTimer =
        setInterval(() => {

            pomodoroSeconds--;

            updatePomodoroDisplay();


            if (
                pomodoroSeconds <= 0
            ) {

                finishPomodoro();

            }

        }, 1000);

}


function pausePomodoro() {

    pomodoroRunning =
        false;


    clearInterval(
        pomodoroTimer
    );


    pomodoroTimer =
        null;


    const button =
        document.getElementById(
            "pomodoroStartButton"
        );


    if (button) {

        button.textContent =
            "Resume";

    }


    setText(
        "pomodoroStatus",
        "Paused. Your brain has been temporarily released from duty."
    );


    roroSay(
        "Paused? Fair. Even dragons need breaks. 🐉"
    );

}


function stopPomodoro() {

    clearInterval(
        pomodoroTimer
    );


    pomodoroTimer =
        null;


    pomodoroRunning =
        false;

}


function resetPomodoro() {

    stopPomodoro();


    if (pomodoroMode === "focus") {

        pomodoroSeconds =
            25 * 60;

    }

    else if (
        pomodoroMode === "short"
    ) {

        pomodoroSeconds =
            5 * 60;

    }

    else {

        pomodoroSeconds =
            15 * 60;

    }


    const button =
        document.getElementById(
            "pomodoroStartButton"
        );


    if (button) {

        button.textContent =
            "Start focus";

    }


    setText(
        "pomodoroStatus",
        "Ready when you are."
    );


    updatePomodoroDisplay();

}


function skipPomodoro() {

    stopPomodoro();

    finishPomodoro(true);

}


function finishPomodoro(skipped = false) {

    stopPomodoro();


    const wasFocus =
        pomodoroMode === "focus";


    if (
        wasFocus &&
        !skipped
    ) {

        completedPomodoros++;


        currentUser.studySessions += 1;

        currentUser.studyMinutes += 25;

        studyMinutesThisVisit += 25;


        addPoints(5);


        if (
            currentUser.streak === 0
        ) {

            currentUser.streak = 1;

        }


        saveCurrentUser();


        updateUserUI();


        setText(
            "studySessionsToday",
            currentUser.studySessions
        );


        setText(
            "studyMinutesToday",
            currentUser.studyMinutes
        );


        setText(
            "studyStreak",
            currentUser.streak
        );


        roroCelebrate();


        alert(
            "Pomodoro complete! +5 Peer Points 🎉"
        );

    }


    if (wasFocus) {

        setPomodoroMode("short");

        setText(
            "pomodoroStatus",
            "Focus complete. Take your break."
        );

    }

    else {

        setPomodoroMode("focus");

        setText(
            "pomodoroStatus",
            "Break finished. Ready to focus again."
        );

    }


    renderStudyPage();

}


function updatePomodoroDisplay() {

    const minutes =
        Math.floor(
            pomodoroSeconds / 60
        );


    const seconds =
        pomodoroSeconds % 60;


    setText(
        "pomodoroTime",
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    );

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


    roro.classList.add(
        "roro-visible"
    );


    setTimeout(() => {

        roroSay(
            "Hi! I'm Roro 🐉"
        );

    }, 1200);


    setInterval(() => {

        if (
            Math.random() < 0.35
        ) {

            roro.classList.add(
                "roro-bounce"
            );


            setTimeout(() => {

                roro.classList.remove(
                    "roro-bounce"
                );

            }, 700);

        }

    }, 5000);

}


function roroReactToPage(page) {

    const messages = {

        home:
            "Ready to make today count? 🐉",

        calendar:
            "Look at you being organised. I'm impressed.",

        assignments:
            "Let's defeat those deadlines.",

        peers:
            "Everyone knows something useful!",

        resources:
            "Knowledge hoard activated. 📚",

        study:
            "Study mode! I shall guard the vibes.",

        profile:
            "Your skills can help someone else.",

        progress:
            "Look how far you've come! 🐉",

        settings:
            "A tidy system makes a tidy brain."

    };


    if (
        messages[page]
    ) {

        roroSay(
            messages[page]
        );

    }

}


function roroSay(message) {

    const speech =
        document.getElementById(
            "roroSpeech"
        );


    if (!speech) return;


    speech.textContent =
        message;


    const roro =
        document.getElementById(
            "roroBuddy"
        );


    if (!roro) return;


    roro.classList.add(
        "roro-talking"
    );


    clearTimeout(
        window.roroSpeechTimeout
    );


    window.roroSpeechTimeout =
        setTimeout(() => {

            roro.classList.remove(
                "roro-talking"
            );

        }, 900);

}


function roroInteract() {

    const messages = [

        "You clicked me. I live here now. 🐉",

        "Your study buddy has arrived.",

        "Tiny dragon. Massive academic expectations.",

        "One question at a time. You've got this.",

        "I believe in you. Unfortunately, I cannot do your homework."

    ];


    const message =
        messages[
            Math.floor(
                Math.random() *
                messages.length
            )
        ];


    roroSay(
        message
    );


    const roro =
        document.getElementById(
            "roroBuddy"
        );


    if (roro) {

        roro.classList.add(
            "roro-happy"
        );


        setTimeout(() => {

            roro.classList.remove(
                "roro-happy"
            );

        }, 900);

    }

}


function roroCelebrate() {

    const roro =
        document.getElementById(
            "roroBuddy"
        );


    if (!roro) return;


    roroSay(
        "YOU DID IT! 🎉🐉 +5 POINTS"
    );


    roro.classList.add(
        "roro-celebrate"
    );


    setTimeout(() => {

        roro.classList.remove(
            "roro-celebrate"
        );

    }, 1600);

}


function roroHide() {

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


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfile() {

    if (!currentUser) return;


    const tags =
        document.getElementById(
            "profileTags"
        );


    if (tags) {

        if (
            currentUser.subjects.length
        ) {

            tags.innerHTML =
                currentUser.subjects
                    .map(subject => `

                        <span class="subject-tag">
                            ${subject}
                        </span>

                    `)
                    .join("");

        }

        else {

            tags.innerHTML = `

                <span class="subject-tag">
                    No subjects added yet
                </span>

            `;

        }

    }


    setText(
        "profilePreferences",
        currentUser.subjects.length
            ? "Your profile can be changed whenever your strengths or interests change."
            : "Add subjects you feel confident helping others with."
    );

}


function editProfile() {

    alert(
        "Profile editing would connect to the student's school account in the full version."
    );

}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    if (!currentUser) return;


    updateUserUI();


    const canvas =
        document.getElementById(
            "progressChart"
        );


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const width =
        canvas.width =
            canvas.clientWidth || 700;


    const height =
        canvas.height =
            300;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
       BRAND NEW USERS:
       There is no graph until they actually
       have progress.
    */

    if (
        !currentUser.progressHistory ||
        currentUser.progressHistory.length === 0
    ) {

        ctx.fillStyle =
            "#85847e";

        ctx.font =
            "16px DM Sans";

        ctx.textAlign =
            "center";


        ctx.fillText(
            "Your progress will appear here once you start earning Peer Points.",
            width / 2,
            height / 2
        );


        ctx.textAlign =
            "left";


        return;

    }


    const values =
        currentUser.progressHistory;


    if (
        values.length === 1
    ) {

        ctx.fillStyle =
            "#85847e";

        ctx.font =
            "16px DM Sans";

        ctx.textAlign =
            "center";


        ctx.fillText(
            `You've earned ${values[0]} Peer Points so far.`,
            width / 2,
            height / 2
        );


        ctx.textAlign =
            "left";


        return;

    }


    const max =
        Math.max(
            ...values
        );


    const min =
        Math.min(
            ...values
        );


    const range =
        Math.max(
            1,
            max - min
        );


    const padding = {

        left: 55,

        right: 25,

        top: 30,

        bottom: 40

    };


    const graphWidth =
        width -
        padding.left -
        padding.right;


    const graphHeight =
        height -
        padding.top -
        padding.bottom;


    ctx.strokeStyle =
        "#e4e0d7";

    ctx.lineWidth =
        1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding.top +
            (
                graphHeight *
                i /
                4
            );


        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width - padding.right,
            y
        );

        ctx.stroke();

    }


    const points =
        values.map(
            (value, index) => {

                const x =
                    padding.left +
                    graphWidth *
                    (
                        index /
                        (
                            values.length -
                            1
                        )
                    );


                const y =
                    padding.top +
                    graphHeight *
                    (
                        1 -
                        (
                            value -
                            min
                        ) /
                        range
                    );


                return {
                    x,
                    y,
                    value
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

            }

            else {

                ctx.lineTo(
                    point.x,
                    point.y
                );

            }

        }
    );


    ctx.strokeStyle =
        "#173c32";

    ctx.lineWidth =
        3;

    ctx.stroke();


    points.forEach(point => {

        ctx.beginPath();


        ctx.arc(
            point.x,
            point.y,
            5,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#ffffff";

        ctx.fill();


        ctx.strokeStyle =
            "#173c32";

        ctx.lineWidth =
            2;

        ctx.stroke();

    });


    ctx.fillStyle =
        "#85847e";

    ctx.font =
        "12px DM Sans";


    points.forEach(
        (point, index) => {

            ctx.fillText(
                index ===
                values.length - 1
                    ? "Now"
                    : `Step ${index + 1}`,
                point.x - 15,
                height - 15
            );

        }
    );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettings() {

    if (!currentUser) return;


    setText(
        "settingsEmail",
        currentUser.email
    );

}


/* =========================================================
   POINTS
   ========================================================= */

function addPoints(amount) {

    if (!currentUser) return;


    currentUser.points += amount;


    if (
        !currentUser.progressHistory
    ) {

        currentUser.progressHistory =
            [];

    }


    /*
       Only record actual progress.
    */

    currentUser.progressHistory.push(
        currentUser.points
    );


    currentUser.progressHistory =
        currentUser.progressHistory.slice(-6);


    saveCurrentUser();


    updateUserUI();


    if (
        currentPage === "progress"
    ) {

        renderProgress();

    }

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function showNotifications() {

    alert(
        "Notifications\n\n• No new tutoring requests\n• Your next assignment is Maths: Algebra practice\n• Roro says: keep going! 🐉"
    );

}


/* =========================================================
   HELPERS
   ========================================================= */

function setText(id, text) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            text;

    }

}


function formatDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        "en-NZ",
        {
            day: "numeric",
            month: "short"
        }
    );

}


function getDueLabel(dateString) {

    const due =
        new Date(
            `${dateString}T00:00:00`
        );


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        Math.ceil(
            (
                due - today
            ) /
            86400000
        );


    if (
        difference < 0
    ) {

        return "Overdue";

    }


    if (
        difference === 0
    ) {

        return "Due today";

    }


    if (
        difference === 1
    ) {

        return "Due tomorrow";

    }


    return `${difference} days left`;

}


function capitalize(text) {

    if (!text) return "";


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =========================================================
   INITIAL CALENDAR DATA
   ========================================================= */

calendarEvents = [

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
