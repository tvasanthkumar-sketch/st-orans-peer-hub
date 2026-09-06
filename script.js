/* =========================================================
   ST ORAN'S PEER HUB
   JAVASCRIPT
   ========================================================= */


/* =========================================================
   DEMO DATA
   ========================================================= */

const users = {

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
        bio: "I enjoy helping people understand maths and science. I am usually available after school.",
        subjects: [
            "Maths",
            "Algebra",
            "Science",
            "Graphs"
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
        bio: "I love helping younger students with English, study skills and essay writing.",
        subjects: [
            "English",
            "Essay writing",
            "Study skills",
            "Literacy"
        ]
    }

};


const peers = [

    {
        id: 1,
        name: "Lucy Worthington",
        initials: "LW",
        year: "Year 13",
        subjects: ["English", "Essay writing", "Study skills"],
        topics: [
            "Essay writing",
            "Paragraph structure",
            "Analysing texts",
            "Study skills"
        ],
        bio: "I love helping students become more confident with English and essay writing.",
        availability: "Today",
        online: true,
        rating: "4.9",
        sessions: 28
    },

    {
        id: 2,
        name: "Aria Patel",
        initials: "AP",
        year: "Year 10",
        subjects: ["Maths", "Algebra", "Geometry"],
        topics: [
            "Expanding brackets",
            "Factorising",
            "Linear equations",
            "Pythagoras"
        ],
        bio: "Happy to help with algebra, geometry and anything maths-related.",
        availability: "Today",
        online: true,
        rating: "4.8",
        sessions: 17
    },

    {
        id: 3,
        name: "Sofia Chen",
        initials: "SC",
        year: "Year 11",
        subjects: ["Science", "Biology", "Chemistry"],
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
        subjects: ["Spanish", "Vocabulary"],
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
        subjects: ["Social Studies", "History"],
        topics: [
            "Case studies",
            "Essay structure",
            "Research",
            "Source analysis"
        ],
        bio: "Happy to help with Social Studies research and case studies.",
        availability: "Today",
        online: false,
        rating: "4.8",
        sessions: 19
    },

    {
        id: 6,
        name: "Amelia Kumar",
        initials: "AK",
        year: "Year 10",
        subjects: ["Technology", "Design"],
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


const assignments = [

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


const quotes = [

    "Small progress is still progress.",
    "You do not have to know everything to start.",
    "Consistency beats intensity.",
    "A difficult topic becomes easier one question at a time.",
    "Learning is not about being the smartest person in the room.",
    "The best students are not afraid to ask questions.",
    "Your future self will thank you for studying today.",
    "Helping someone else is one of the best ways to learn.",
    "Mistakes are evidence that you are actually trying.",
    "Keep going. Your understanding is catching up."

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
        "Learn it. Practise it. Understand it.",
        "Knowledge grows when it is shared."
    ],

    profile: [
        "Your strengths can become someone else's starting point.",
        "You can always learn something new.",
        "Everyone has something worth teaching."
    ],

    progress: [
        "Progress is easier to see when you look back.",
        "Every helpful action counts.",
        "Keep building."
    ],

    settings: [
        "Make the system work for you.",
        "Small adjustments can make a big difference.",
        "Stay organised, stay flexible."

    ]

};


/* =========================================================
   APP STATE
   ========================================================= */

let currentUser = null;
let currentPage = "home";

let calendarDate = new Date();

let currentAssignmentFilter = "all";

let currentResourceCategory = "all";

let selectedPeer = null;

let signupStep = 1;

let signupDraft = {};

let calendarEvents = [];

let currentPointsHistory = [
    105,
    128,
    154,
    181,
    210,
    240
];


/* =========================================================
   START APP
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupLogin();

    renderDate();

});


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value
            .trim()
            .toLowerCase();

        const password =
            document.getElementById("loginPassword").value;

        const error =
            document.getElementById("loginError");

        let foundUser = null;

        Object.values(users).forEach(user => {

            if (
                user.email.toLowerCase() === email &&
                user.password === password
            ) {
                foundUser = user;
            }

        });


        if (!foundUser) {

            error.textContent =
                "That email or password doesn't match a demo account.";

            return;
        }


        error.textContent = "";

        login(foundUser);

    });

}


/* =========================================================
   LOGIN USER
   ========================================================= */

function login(user) {

    currentUser = {
        ...user
    };

    document
        .getElementById("loginScreen")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");

    updateUserUI();

    navigateTo("home");

}


/* =========================================================
   GOOGLE LOGIN
   ========================================================= */

function showGoogleLogin() {

    openModal("googleModal");

}


function googleLogin(account) {

    closeModal("googleModal");

    if (account === "maya") {
        login(users.maya);
    }

    if (account === "lucy") {
        login(users.lucy);
    }

}


/* =========================================================
   SIGN UP
   ========================================================= */

function showSignup() {

    signupStep = 1;

    signupDraft = {};

    openModal("signupModal");

    renderSignupStep();

}


function signupNext(step) {

    if (signupStep === 1) {

        const first =
            document.getElementById("suFirst").value.trim();

        const last =
            document.getElementById("suLast").value.trim();

        const year =
            document.getElementById("suYear").value;


        if (!first || !last) {

            alert("Please enter your first and last name.");

            return;
        }


        signupDraft.firstName = first;
        signupDraft.lastName = last;
        signupDraft.year = year;

    }


    if (signupStep === 2) {

        const subjects =
            [...document.querySelectorAll(
                "#signupSubjects input:checked"
            )].map(input => input.value);

        signupDraft.subjects = subjects;

    }


    signupStep = step;

    renderSignupStep();

}


function renderSignupStep() {

    const content =
        document.getElementById("signupContent");

    const progress =
        document.querySelectorAll(
            ".signup-progress span"
        );


    progress.forEach((item, index) => {

        item.classList.toggle(
            "active",
            index < signupStep
        );

    });


    if (signupStep === 1) {

        content.innerHTML = `

            <span class="eyebrow">
                Create your account
            </span>

            <h2>Let's get you set up.</h2>

            <p>
                Your profile can be changed whenever you need.
            </p>

            <div class="form-group">

                <label>First name</label>

                <input
                    type="text"
                    id="suFirst"
                    placeholder="First name"
                    value="${signupDraft.firstName || ""}"
                >

            </div>

            <div class="form-group">

                <label>Last name</label>

                <input
                    type="text"
                    id="suLast"
                    placeholder="Last name"
                    value="${signupDraft.lastName || ""}"
                >

            </div>

            <div class="form-group">

                <label>Year level</label>

                <select id="suYear">

                    ${[8, 9, 10, 11, 12, 13].map(year => `
                        <option
                            value="${year}"
                            ${signupDraft.year == year ? "selected" : ""}
                        >
                            Year ${year}
                        </option>
                    `).join("")}

                </select>

            </div>

            <button
                class="primary-button full-width"
                onclick="signupNext(2)"
            >
                Continue →
            </button>

        `;

    }


    if (signupStep === 2) {

        const subjectList = [
            "Maths",
            "English",
            "Science",
            "Social Studies",
            "Spanish",
            "Technology"
        ];

        content.innerHTML = `

            <span class="eyebrow">
                Your strengths
            </span>

            <h2>What can you help with?</h2>

            <p>
                Choose subjects you feel confident helping another student with.
            </p>

            <div
                id="signupSubjects"
                class="signup-subject-grid"
            >

                ${subjectList.map(subject => `
                    <label class="subject-choice">

                        <input
                            type="checkbox"
                            value="${subject}"
                            ${signupDraft.subjects?.includes(subject) ? "checked" : ""}
                        >

                        <span>${subject}</span>

                    </label>
                `).join("")}

            </div>

            <button
                class="primary-button full-width"
                onclick="signupNext(3)"
            >
                Continue →
            </button>

        `;

    }


    if (signupStep === 3) {

        content.innerHTML = `

            <span class="eyebrow">
                Almost there
            </span>

            <h2>Choose your availability.</h2>

            <p>
                You can change this later at any time.
            </p>

            <div class="availability-choice-list">

                <label class="availability-choice">

                    <input
                        type="checkbox"
                        checked
                    >

                    <span>
                        Monday after school
                    </span>

                </label>

                <label class="availability-choice">

                    <input
                        type="checkbox"
                        checked
                    >

                    <span>
                        Wednesday after school
                    </span>

                </label>

                <label class="availability-choice">

                    <input
                        type="checkbox"
                    >

                    <span>
                        Friday after school
                    </span>

                </label>

            </div>

            <button
                class="primary-button full-width"
                onclick="finishSignup()"
            >
                Enter Peer Hub →
            </button>

        `;

    }

}


function finishSignup() {

    const firstName =
        signupDraft.firstName || "New";

    const lastName =
        signupDraft.lastName || "Student";

    const year =
        signupDraft.year || "8";

    const newUser = {

        firstName,
        lastName,

        fullName:
            `${firstName} ${lastName}`,

        email:
            `${firstName.toLowerCase()}.${lastName.toLowerCase()}@storans.school.nz`,

        password: "Demo123",

        year:
            `Year ${year}`,

        className:
            `${year}XX`,

        initials:
            `${firstName[0]}${lastName[0]}`.toUpperCase(),

        points: 0,

        helped: 0,

        sessions: 0,

        badges: 0,

        bio:
            "I am part of the St Oran's Peer Hub.",

        subjects:
            signupDraft.subjects || []

    };


    currentUser = newUser;

    closeModal("signupModal");

    document
        .getElementById("loginScreen")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");

    updateUserUI();

    navigateTo("home");

}


/* =========================================================
   SIGN OUT
   ========================================================= */

function signOut() {

    currentUser = null;

    document
        .getElementById("app")
        .classList.add("hidden");

    document
        .getElementById("loginScreen")
        .classList.remove("hidden");

    document
        .getElementById("loginForm")
        .reset();

}


/* =========================================================
   USER UI
   ========================================================= */

function updateUserUI() {

    if (!currentUser) {
        return;
    }


    const elements = {

        topUserName:
            document.getElementById("topUserName"),

        topUserYear:
            document.getElementById("topUserYear"),

        topAvatar:
            document.getElementById("topAvatar"),

        sidebarPoints:
            document.getElementById("sidebarPoints"),

        homePoints:
            document.getElementById("homePoints"),

        homeHelped:
            document.getElementById("homeHelped"),

        profileName:
            document.getElementById("profileName"),

        profileYear:
            document.getElementById("profileYear"),

        profileBio:
            document.getElementById("profileBio"),

        settingsEmail:
            document.getElementById("settingsEmail"),

        progressPoints:
            document.getElementById("progressPoints"),

        progressSessions:
            document.getElementById("progressSessions"),

        progressBadges:
            document.getElementById("progressBadges")

    };


    if (elements.topUserName)
        elements.topUserName.textContent =
            currentUser.firstName;


    if (elements.topUserYear)
        elements.topUserYear.textContent =
            currentUser.year;


    if (elements.topAvatar)
        elements.topAvatar.textContent =
            currentUser.initials;


    if (elements.sidebarPoints)
        elements.sidebarPoints.textContent =
            currentUser.points;


    if (elements.homePoints)
        elements.homePoints.textContent =
            currentUser.points;


    if (elements.homeHelped)
        elements.homeHelped.textContent =
            currentUser.helped;


    if (elements.profileName)
        elements.profileName.textContent =
            currentUser.fullName;


    if (elements.profileYear)
        elements.profileYear.textContent =
            `${currentUser.year} · ${currentUser.className}`;


    if (elements.profileBio)
        elements.profileBio.textContent =
            currentUser.bio;


    if (elements.settingsEmail)
        elements.settingsEmail.textContent =
            currentUser.email;


    if (elements.progressPoints)
        elements.progressPoints.textContent =
            currentUser.points;


    if (elements.progressSessions)
        elements.progressSessions.textContent =
            currentUser.helped;


    if (elements.progressBadges)
        elements.progressBadges.textContent =
            currentUser.badges;


    renderProfileSubjects();

    renderHome();

    renderProgress();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function navigateTo(page) {

    currentPage = page;


    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove("active-page");

        });


    const target =
        document.getElementById(`page-${page}`);


    if (target) {

        target.classList.add("active-page");

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    renderPage(page);

}


/* =========================================================
   PAGE RENDERER
   ========================================================= */

function renderPage(page) {

    renderPageQuote(page);


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
            renderResources();
            break;

        case "profile":
            renderProfileSubjects();
            break;

        case "progress":
            renderProgress();
            break;

    }

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

    if (!currentUser) {
        return;
    }


    const greeting =
        document.getElementById("greeting");


    const hour =
        new Date().getHours();


    let greetingText;


    if (hour < 12) {

        greetingText = "Good morning";

    } else if (hour < 18) {

        greetingText = "Good afternoon";

    } else {

        greetingText = "Good evening";

    }


    if (greeting) {

        greeting.textContent =
            `${greetingText}, ${currentUser.firstName}.`;

    }


    renderRecommendedPeers();

    renderUpcomingTasks();

}


function renderRecommendedPeers() {

    const container =
        document.getElementById("recommendedPeers");

    if (!container) {
        return;
    }


    const recommended =
        peers.slice(0, 3);


    container.innerHTML =
        recommended.map(peer => `

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

        `).join("");

}


function renderUpcomingTasks() {

    const container =
        document.getElementById("upcomingTasks");

    if (!container) {
        return;
    }


    const upcoming =
        assignments
            .filter(item => !item.complete)
            .slice(0, 4);


    container.innerHTML =
        upcoming.map(item => `

            <div class="task-item">

                <div class="task-subject">
                    ${item.subject.substring(0, 2).toUpperCase()}
                </div>

                <div class="task-info">

                    <strong>
                        ${item.title}
                    </strong>

                    <span>
                        Due ${formatDate(item.due)}
                    </span>

                </div>

                <span class="priority ${item.priority}">
                    ${capitalize(item.priority)}
                </span>

            </div>

        `).join("");

}


/* =========================================================
   DATE + GREETING
   ========================================================= */

function renderDate() {

    const dateElement =
        document.getElementById("homeDate");


    if (!dateElement) {
        return;
    }


    const today =
        new Date();


    dateElement.textContent =
        today.toLocaleDateString(
            "en-NZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


/* =========================================================
   QUOTES
   ========================================================= */

function dailyQuote() {

    const day =
        Math.floor(
            Date.now() / 86400000
        );

    return quotes[day % quotes.length];

}


function renderPageQuote(page) {

    const quoteElement =
        document.getElementById("dailyQuote");


    if (!quoteElement) {
        return;
    }


    const pageList =
        pageQuotes[page] || quotes;


    const day =
        Math.floor(
            Date.now() / 86400000
        );


    const index =
        day % pageList.length;


    quoteElement.textContent =
        pageList[index];

}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar() {

    const grid =
        document.getElementById("calendarGrid");

    const monthTitle =
        document.getElementById("calendarMonth");


    if (!grid || !monthTitle) {
        return;
    }


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    monthTitle.textContent =
        calendarDate.toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        );


    const firstDay =
        new Date(year, month, 1).getDay();


    const daysInMonth =
        new Date(year, month + 1, 0).getDate();


    const previousMonthDays =
        new Date(year, month, 0).getDate();


    let html = "";


    const dayNames = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];


    dayNames.forEach(day => {

        html += `
            <div class="calendar-day-name">
                ${day}
            </div>
        `;

    });


    for (
        let i = firstDay - 1;
        i >= 0;
        i--
    ) {

        html += `
            <div class="calendar-day other-month">
                <span class="calendar-number">
                    ${previousMonthDays - i}
                </span>
            </div>
        `;

    }


    const today =
        new Date();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();


        const hasEvent =
            calendarEvents.some(event => {

                const eventDate =
                    new Date(event.date);

                return (
                    eventDate.getDate() === day &&
                    eventDate.getMonth() === month &&
                    eventDate.getFullYear() === year
                );

            });


        html += `

            <button
                class="calendar-day ${isToday ? "today" : ""}"
                onclick="selectCalendarDay(${day})"
            >

                <span class="calendar-number">
                    ${day}
                </span>

                ${
                    hasEvent
                        ? `<div class="calendar-event-dot"></div>`
                        : ""
                }

            </button>

        `;

    }


    const totalCells =
        Math.ceil(
            (firstDay + daysInMonth) / 7
        ) * 7;


    for (
        let day = 1;
        day <= totalCells - firstDay - daysInMonth;
        day++
    ) {

        html += `
            <div class="calendar-day other-month">
                <span class="calendar-number">
                    ${day}
                </span>
            </div>
        `;

    }


    grid.innerHTML = html;


    renderCalendarEvents();

}


function changeMonth(amount) {

    calendarDate.setMonth(
        calendarDate.getMonth() + amount
    );

    renderCalendar();

}


function selectCalendarDay(day) {

    const selected =
        new Date(
            calendarDate.getFullYear(),
            calendarDate.getMonth(),
            day
        );


    alert(
        `Selected ${selected.toLocaleDateString(
            "en-NZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        )}`
    );

}


function renderCalendarEvents() {

    const container =
        document.getElementById("calendarEvents");


    if (!container) {
        return;
    }


    const today =
        new Date();


    const defaultEvents = [

        {
            title: "Maths assignment",
            date: "2026-09-08",
            type: "Assignment"
        },

        {
            title: "Science report",
            date: "2026-09-11",
            type: "Assignment"
        },

        {
            title: "Peer tutoring session",
            date: "2026-09-12",
            type: "Tutoring"
        }

    ];


    const events =
        [...defaultEvents, ...calendarEvents];


    container.innerHTML =
        events
            .slice(0, 6)
            .map(event => `

                <div class="event-item">

                    <strong>
                        ${event.title}
                    </strong>

                    <span>
                        ${formatDate(event.date)}
                        · ${event.type}
                    </span>

                </div>

            `)
            .join("");

}


function showAddEvent() {

    const dateInput =
        document.getElementById("eventDate");


    if (dateInput) {

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }


    openModal("eventModal");

}


function addEvent() {

    const title =
        document.getElementById("eventTitle").value.trim();

    const date =
        document.getElementById("eventDate").value;

    const type =
        document.getElementById("eventType").value;


    if (!title || !date) {

        alert("Please enter an event title and date.");

        return;
    }


    calendarEvents.push({

        title,

        date,

        type:
            capitalize(type)

    });


    closeModal("eventModal");

    document
        .getElementById("eventTitle")
        .value = "";


    renderCalendar();

}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignments() {

    const container =
        document.getElementById("assignmentList");


    if (!container) {
        return;
    }


    let filtered =
        [...assignments];


    if (currentAssignmentFilter === "upcoming") {

        filtered =
            filtered.filter(
                item => !item.complete
            );

    }


    if (currentAssignmentFilter === "complete") {

        filtered =
            filtered.filter(
                item => item.complete
            );

    }


    if (!filtered.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✓
                </div>

                <h3>
                    Nothing here
                </h3>

                <p>
                    This section is currently empty.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered.map(item => `

            <div
                class="assignment-card ${item.complete ? "complete" : ""}"
            >

                <button
                    class="assignment-check"
                    onclick="toggleAssignment(${item.id})"
                >
                    ✓
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

                <span class="priority ${item.priority}">
                    ${capitalize(item.priority)}
                </span>

            </div>

        `).join("");

}


function filterAssignments(filter, button) {

    currentAssignmentFilter =
        filter;


    document
        .querySelectorAll(".filter-tab")
        .forEach(tab => {

            tab.classList.remove("active");

        });


    if (button) {
        button.classList.add("active");
    }


    renderAssignments();

}


function toggleAssignment(id) {

    const assignment =
        assignments.find(
            item => item.id === id
        );


    if (!assignment) {
        return;
    }


    assignment.complete =
        !assignment.complete;


    if (assignment.complete) {

        addPoints(2);

    }


    renderAssignments();

    renderHome();

}


function showAddAssignment() {

    const dateInput =
        document.getElementById("assignmentDate");


    if (dateInput) {

        const date =
            new Date();

        date.setDate(
            date.getDate() + 7
        );

        dateInput.value =
            date.toISOString().split("T")[0];

    }


    openModal("assignmentModal");

}


function addAssignment() {

    const subject =
        document.getElementById(
            "assignmentSubject"
        ).value;

    const title =
        document.getElementById(
            "assignmentTitle"
        ).value.trim();

    const due =
        document.getElementById(
            "assignmentDate"
        ).value;

    const priority =
        document.getElementById(
            "assignmentPriority"
        ).value;


    if (!title || !due) {

        alert("Please enter an assignment title and due date.");

        return;
    }


    assignments.push({

        id:
            Date.now(),

        subject,

        title,

        due,

        priority,

        complete:
            false

    });


    closeModal("assignmentModal");

    document
        .getElementById("assignmentTitle")
        .value = "";


    renderAssignments();

    renderHome();

}


/* =========================================================
   FIND PEERS
   ========================================================= */

function renderPeers() {

    filterPeers();

}


function filterPeers() {

    const search =
        (
            document.getElementById(
                "peerSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const subject =
        document.getElementById(
            "subjectFilter"
        )?.value || "all";


    const year =
        document.getElementById(
            "yearFilter"
        )?.value || "all";


    const availability =
        document.getElementById(
            "availabilityFilter"
        )?.value || "all";


    const onlineOnly =
        document.getElementById(
            "onlineOnly"
        )?.checked || false;


    const filtered =
        peers.filter(peer => {

            const searchableText =
                [
                    peer.name,
                    peer.year,
                    ...peer.subjects,
                    ...peer.topics,
                    peer.bio
                ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(search);


            const matchesSubject =
                subject === "all" ||
                peer.subjects.includes(subject);


            const peerYear =
                peer.year.replace(
                    "Year ",
                    ""
                );


            const matchesYear =
                year === "all" ||
                peerYear === year;


            const matchesAvailability =
                availability === "all" ||
                (
                    availability === "today" &&
                    peer.availability === "Today"
                ) ||
                (
                    availability === "week" &&
                    peer.availability === "This week"
                ) ||
                (
                    availability === "online" &&
                    peer.online
                );


            const matchesOnline =
                !onlineOnly ||
                peer.online;


            return (
                matchesSearch &&
                matchesSubject &&
                matchesYear &&
                matchesAvailability &&
                matchesOnline
            );

        });


    const container =
        document.getElementById(
            "peerResults"
        );


    const count =
        document.getElementById(
            "peerResultsCount"
        );


    if (!container) {
        return;
    }


    if (count) {

        count.textContent =
            `${filtered.length} peer${filtered.length === 1 ? "" : "s"} found`;

    }


    if (!filtered.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ⌕
                </div>

                <h3>
                    No peers found
                </h3>

                <p>
                    Try another subject, topic or filter.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        filtered.map(peer => `

            <div class="peer-card">

                <div class="peer-card-top">

                    <div class="avatar avatar-small">
                        ${peer.initials}
                    </div>

                    <div class="peer-card-info">

                        <h3>
                            ${peer.name}
                        </h3>

                        <p>
                            ${peer.year}
                        </p>

                    </div>

                    ${
                        peer.online
                            ? `<span class="online-badge">Online</span>`
                            : ""
                    }

                </div>


                <p class="peer-card-bio">
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
                        ★ ${peer.rating} · ${peer.sessions} sessions
                    </span>

                    <button
                        class="primary-button"
                        onclick="viewPeer(${peer.id})"
                    >
                        View profile
                    </button>

                </div>

            </div>

        `).join("");

}


/* =========================================================
   PEER PROFILE
   ========================================================= */

function viewPeer(id) {

    selectedPeer =
        peers.find(
            peer => peer.id === id
        );


    if (!selectedPeer) {
        return;
    }


    const content =
        document.getElementById(
            "peerModalContent"
        );


    content.innerHTML = `

        <div class="peer-profile-modal-header">

            <div class="avatar">
                ${selectedPeer.initials}
            </div>

            <div>

                <h2>
                    ${selectedPeer.name}
                </h2>

                <p>
                    ${selectedPeer.year}
                    · ★ ${selectedPeer.rating}
                </p>

            </div>

        </div>


        <div class="modal-section">

            <h3>
                About
            </h3>

            <p>
                ${selectedPeer.bio}
            </p>

        </div>


        <div class="modal-section">

            <h3>
                Can help with
            </h3>

            <div class="subject-tags">

                ${selectedPeer.topics.map(topic => `
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
                ${selectedPeer.availability}
                ${selectedPeer.online ? " · Online available" : ""}
            </p>

        </div>


        <div class="modal-section">

            <button
                class="primary-button full-width"
                onclick="showBooking(${selectedPeer.id})"
            >
                Book a session
            </button>

        </div>

    `;


    openModal("peerModal");

}


/* =========================================================
   BOOKING
   ========================================================= */

function showBooking(peerId) {

    selectedPeer =
        peers.find(
            peer => peer.id === peerId
        );


    if (!selectedPeer) {
        return;
    }


    closeModal("peerModal");


    const content =
        document.getElementById(
            "bookingContent"
        );


    content.innerHTML = `

        <span class="eyebrow">
            Book a session
        </span>

        <h2>
            Study with ${selectedPeer.name}
        </h2>

        <p>
            Choose a time that works for you.
        </p>


        <div class="booking-options">

            <button
                class="booking-option"
                onclick="confirmBooking('Monday', '3:30 PM')"
            >

                <div>

                    <strong>
                        Monday · 3:30 PM
                    </strong>

                    <span>
                        30 minute session
                    </span>

                </div>

                <span>
                    →
                </span>

            </button>


            <button
                class="booking-option"
                onclick="confirmBooking('Wednesday', '4:00 PM')"
            >

                <div>

                    <strong>
                        Wednesday · 4:00 PM
                    </strong>

                    <span>
                        30 minute session
                    </span>

                </div>

                <span>
                    →
                </span>

            </button>


            <button
                class="booking-option"
                onclick="confirmBooking('Friday', '3:30 PM')"
            >

                <div>

                    <strong>
                        Friday · 3:30 PM
                    </strong>

                    <span>
                        30 minute session
                    </span>

                </div>

                <span>
                    →
                </span>

            </button>

        </div>


        <div class="modal-section">

            <button
                class="secondary-button full-width"
                onclick="startOnlineSession()"
            >
                Book online tutoring
            </button>

        </div>

    `;


    openModal("bookingModal");

}


function confirmBooking(day, time) {

    closeModal("bookingModal");


    addPoints(2);


    alert(
        `Session booked with ${selectedPeer.name} for ${day} at ${time}.`
    );

}


function startOnlineSession() {

    closeModal("bookingModal");


    alert(
        `Online tutoring with ${selectedPeer.name} would open here in the full version.`
    );

}


/* =========================================================
   RESOURCES
   ========================================================= */

function renderResources() {

    filterResources();

}


function filterResources() {

    const search =
        (
            document.getElementById(
                "resourceSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        resources.filter(resource => {

            const matchesCategory =
                currentResourceCategory === "all" ||
                resource.subject === currentResourceCategory;


            const searchable =
                [
                    resource.subject,
                    resource.title,
                    resource.description,
                    resource.type
                ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchable.includes(search);


            return (
                matchesCategory &&
                matchesSearch
            );

        });


    const container =
        document.getElementById(
            "resourceGrid"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        filtered.map(resource => `

            <div class="resource-card">

                <div class="resource-icon">
                    ▤
                </div>

                <span class="eyebrow">
                    ${resource.subject}
                </span>

                <h3>
                    ${resource.title}
                </h3>

                <p>
                    ${resource.description}
                </p>

                <div class="resource-card-footer">

                    <span>
                        ${resource.type}
                    </span>

                    <button
                        class="text-button"
                        onclick="openResource('${resource.title.replace(/'/g, "\\'")}')"
                    >
                        Open →
                    </button>

                </div>

            </div>

        `).join("");

}


function filterResourceCategory(category, button) {

    currentResourceCategory =
        category;


    document
        .querySelectorAll(".resource-category")
        .forEach(item => {

            item.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    }


    renderResources();

}


function openResource(title) {

    alert(
        `"${title}" would open from the school's resource library in the full version.`
    );

}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfileSubjects() {

    const container =
        document.getElementById(
            "profileSubjects"
        );


    if (!container || !currentUser) {
        return;
    }


    container.innerHTML =
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

}


function editProfile() {

    alert(
        "Profile editing would connect to your school account in the full version."
    );

}


/* =========================================================
   PROGRESS
   ========================================================= */

function renderProgress() {

    if (!currentUser) {
        return;
    }


    const chart =
        document.getElementById(
            "pointsChart"
        );


    if (!chart) {
        return;
    }


    const ctx =
        chart.getContext("2d");


    const width =
        chart.width;

    const height =
        chart.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const values =
        [...currentPointsHistory];


    const max =
        Math.max(
            ...values
        ) + 30;


    const min =
        Math.max(
            0,
            Math.min(...values) - 30
        );


    const padding = {

        left: 55,

        right: 25,

        top: 25,

        bottom: 45

    };


    const graphWidth =
        width -
        padding.left -
        padding.right;


    const graphHeight =
        height -
        padding.top -
        padding.bottom;


    /* GRID */

    ctx.strokeStyle =
        "#e6e2d9";

    ctx.lineWidth =
        1;


    for (let i = 0; i <= 4; i++) {

        const y =
            padding.top +
            graphHeight * (i / 4);


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


    /* Y LABELS */

    ctx.fillStyle =
        "#85847e";

    ctx.font =
        "12px DM Sans";


    for (let i = 0; i <= 4; i++) {

        const value =
            Math.round(
                max -
                (max - min) *
                (i / 4)
            );


        const y =
            padding.top +
            graphHeight * (i / 4);


        ctx.fillText(
            value,
            10,
            y + 4
        );

    }


    /* POINTS */

    const points =
        values.map((value, index) => {

            const x =
                padding.left +
                graphWidth *
                (
                    index /
                    (values.length - 1)
                );


            const y =
                padding.top +
                graphHeight *
                (
                    1 -
                    (value - min) /
                    (max - min)
                );


            return {
                x,
                y,
                value
            };

        });


    /* LINE */

    ctx.beginPath();

    points.forEach((point, index) => {

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

    });


    ctx.strokeStyle =
        "#173c32";

    ctx.lineWidth =
        3;

    ctx.stroke();


    /* AREA */

    ctx.lineTo(
        points[points.length - 1].x,
        height - padding.bottom
    );

    ctx.lineTo(
        points[0].x,
        height - padding.bottom
    );

    ctx.closePath();


    ctx.fillStyle =
        "rgba(23, 60, 50, 0.08)";

    ctx.fill();


    /* DOTS */

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


    /* MONTH LABELS */

    const months = [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep"
    ];


    ctx.fillStyle =
        "#85847e";

    ctx.font =
        "12px DM Sans";


    points.forEach((point, index) => {

        ctx.fillText(
            months[index],
            point.x - 10,
            height - 18
        );

    });


    renderBadges();

}


function renderBadges() {

    const container =
        document.getElementById(
            "badgesGrid"
        );


    if (!container) {
        return;
    }


    const badges = [

        {
            icon: "✦",
            title: "First Step",
            description: "Joined the Peer Hub"
        },

        {
            icon: "✓",
            title: "Helpful",
            description: "Completed 5 sessions"
        },

        {
            icon: "♧",
            title: "Peer Mentor",
            description: "Helped 8 students"
        },

        {
            icon: "▤",
            title: "Resourceful",
            description: "Shared 5 resources"
        }

    ];


    container.innerHTML =
        badges.map(badge => `

            <div class="badge-card">

                <div class="badge-icon">
                    ${badge.icon}
                </div>

                <h3>
                    ${badge.title}
                </h3>

                <p>
                    ${badge.description}
                </p>

            </div>

        `).join("");

}


/* =========================================================
   POINTS
   ========================================================= */

function addPoints(amount) {

    if (!currentUser) {
        return;
    }


    currentUser.points += amount;


    currentPointsHistory[
        currentPointsHistory.length - 1
    ] = currentUser.points;


    updateUserUI();

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function showNotifications() {

    openModal("notificationModal");

}


function showForgotPassword() {

    openModal("forgotModal");

}


/* =========================================================
   MODAL HELPERS
   ========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.remove("hidden");

        document.body.style.overflow =
            "hidden";

    }

}


function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.add("hidden");

        document.body.style.overflow =
            "";

    }

}


document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        document
            .querySelectorAll(".modal")
            .forEach(modal => {

                modal.classList.add("hidden");

            });


        document.body.style.overflow =
            "";

    }
);


/* =========================================================
   HELPERS
   ========================================================= */

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


    if (difference < 0) {

        return "Overdue";

    }


    if (difference === 0) {

        return "Due today";

    }


    if (difference === 1) {

        return "Due tomorrow";

    }


    return `${difference} days left`;

}


function capitalize(text) {

    if (!text) {
        return "";
    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =========================================================
   INITIAL DATA
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
