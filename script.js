document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       STORAGE
       ===================================================== */

    const USERS_KEY = "stOransPeerHubUsers";
    const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";
    const ASSIGNMENTS_KEY = "stOransPeerHubAssignments_";

    let currentUser = null;
    let assignments = [];

    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let timerMode = "focus";
    let timerRunning = false;


    /* =====================================================
       HELPERS
       ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function getUsers() {
        try {
            return JSON.parse(
                localStorage.getItem(USERS_KEY)
            ) || [];
        } catch (error) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );
    }

    function saveCurrentUser() {

        if (!currentUser) return;

        const users = getUsers();

        const index = users.findIndex(
            user =>
                user.email.toLowerCase() ===
                currentUser.email.toLowerCase()
        );

        if (index !== -1) {
            users[index] = currentUser;
            saveUsers(users);
        }
    }

    function loadAssignments() {

        if (!currentUser) return [];

        try {

            return JSON.parse(
                localStorage.getItem(
                    ASSIGNMENTS_KEY + currentUser.email
                )
            ) || [];

        } catch (error) {
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


    /* =====================================================
       DEMO USERS
       ===================================================== */

    function setupDemoUsers() {

        const users = getUsers();

        const demos = [

            {
                name: "Maya Smith",
                email: "t.smith@storans.school.nz",
                password: "maya123",
                year: "Year 8",
                className: "8MS",
                points: 420,
                sessions: 8,
                helped: 12,
                subjects: [
                    "Maths",
                    "English",
                    "Science"
                ],
                bio: "I like helping people with maths!",
                available: true,
                progressHistory: [
                    20,
                    35,
                    50,
                    70,
                    90
                ]
            },

            {
                name: "Lucy Worthington",
                email: "l.worthington@storans.school.nz",
                password: "lucy123",
                year: "Year 8",
                className: "8LW",
                points: 310,
                sessions: 5,
                helped: 7,
                subjects: [
                    "English",
                    "Social Studies"
                ],
                bio: "Happy to help with English.",
                available: true,
                progressHistory: [
                    20,
                    40,
                    55,
                    65
                ]
            }

        ];

        let changed = false;

        demos.forEach(demo => {

            const exists = users.some(
                user =>
                    user.email.toLowerCase() ===
                    demo.email.toLowerCase()
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

    setupDemoUsers();


    /* =====================================================
       SCREEN CONTROL
       ===================================================== */

    function showLogin() {

        $("loginScreen")?.classList.remove("hidden");
        $("signupModal")?.classList.add("hidden");
        $("app")?.classList.add("hidden");
    }


    function showSignupScreen() {

        $("loginScreen")?.classList.add("hidden");
        $("signupModal")?.classList.remove("hidden");
        $("app")?.classList.add("hidden");

        $("signupError")?.classList.add("hidden");
    }


    function showApp() {

        $("loginScreen")?.classList.add("hidden");
        $("signupModal")?.classList.add("hidden");
        $("app")?.classList.remove("hidden");

        updateUserInterface();

        showPage("homePage");
    }


    /* =====================================================
       LOGIN
       ===================================================== */

    const loginForm = $("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const email =
                    $("loginEmail")?.value
                        .trim()
                        .toLowerCase();

                const password =
                    $("loginPassword")?.value || "";

                const error = $("loginError");

                const users = getUsers();

                const user = users.find(
                    account =>
                        account.email.toLowerCase() === email &&
                        account.password === password
                );

                if (!user) {

                    if (error) {

                        error.textContent =
                            "Incorrect email or password.";

                        error.classList.remove("hidden");
                    }

                    return;
                }


                /* Successful login */

                currentUser = {
                    ...user
                };

                assignments = loadAssignments();

                if (error) {
                    error.textContent = "";
                    error.classList.add("hidden");
                }


                /* Remember me */

                if ($("rememberMe")?.checked) {

                    localStorage.setItem(
                        CURRENT_USER_KEY,
                        currentUser.email
                    );

                } else {

                    localStorage.removeItem(
                        CURRENT_USER_KEY
                    );
                }


                loginForm.reset();

                showApp();
            }
        );
    }


    /* =====================================================
       SIGNUP
       ===================================================== */

    const signupForm = $("signupForm");

    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const name =
                    $("signupName")?.value.trim();

                const email =
                    $("signupEmail")?.value
                        .trim()
                        .toLowerCase();

                const password =
                    $("signupPassword")?.value;

                const year =
                    $("signupYear")?.value;


                const error =
                    $("signupError");


                /* Validation */

                if (!name || !email || !password || !year) {

                    if (error) {

                        error.textContent =
                            "Please complete every field.";

                        error.classList.remove("hidden");
                    }

                    return;
                }


                const users = getUsers();


                /* Existing account */

                const existingUser = users.find(
                    user =>
                        user.email.toLowerCase() === email
                );

                if (existingUser) {

                    if (error) {

                        error.textContent =
                            "An account with that email already exists.";

                        error.classList.remove("hidden");
                    }

                    return;
                }


                /* New account */

                const newUser = {

                    name: name,

                    email: email,

                    password: password,

                    year: year,

                    className: "",

                    points: 0,

                    sessions: 0,

                    helped: 0,

                    subjects: [],

                    bio: "",

                    available: false,

                    progressHistory: []

                };


                users.push(newUser);

                saveUsers(users);


                /* Log new user in */

                currentUser = {
                    ...newUser
                };

                assignments = [];


                saveAssignments();


                /*
                   DO NOT automatically remember the account.
                   This prevents weird automatic login behaviour.
                */

                localStorage.removeItem(
                    CURRENT_USER_KEY
                );


                signupForm.reset();


                if (error) {
                    error.textContent = "";
                    error.classList.add("hidden");
                }


                showApp();
            }
        );
    }


    /* =====================================================
       SIGNUP / LOGIN BUTTONS
       ===================================================== */

    $("showSignup")?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            showSignupScreen();
        }
    );


    $("backToLogin")?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            showLogin();
        }
    );


    /* =====================================================
       FORGOT PASSWORD
       ===================================================== */

    $("forgotPassword")?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            const email = prompt(
                "Enter your school email:"
            );

            if (!email) return;

            const user = getUsers().find(
                account =>
                    account.email.toLowerCase() ===
                    email.trim().toLowerCase()
            );

            if (!user) {

                alert(
                    "No account was found with that email."
                );

                return;
            }

            alert(
                "Demo password: " + user.password
            );
        }
    );


    /* =====================================================
       GOOGLE DEMO LOGIN
       ===================================================== */

    $("googleLogin")?.addEventListener(
        "click",
        function () {

            const users = getUsers();

            const googleDemoUser = users.find(
                user =>
                    user.email.toLowerCase() ===
                    "t.smith@storans.school.nz"
            );

            if (!googleDemoUser) {

                alert(
                    "The Google demo account could not be found."
                );

                return;
            }


            currentUser = {
                ...googleDemoUser
            };

            assignments = loadAssignments();


            /* Google demo remembers the account */

            localStorage.setItem(
                CURRENT_USER_KEY,
                currentUser.email
            );


            showApp();
        }
    );


    /* =====================================================
       NAVIGATION
       ===================================================== */

    const pageIds = [

        "homePage",
        "calendarPage",
        "assignmentsPage",
        "peersPage",
        "resourcesPage",
        "studyPage",
        "progressPage",
        "profilePage",
        "settingsPage"

    ];


    function showPage(pageId) {

        pageIds.forEach(id => {

            const page = $(id);

            if (!page) return;

            if (id === pageId) {

                page.classList.add("active");
                page.style.display = "block";

            } else {

                page.classList.remove("active");
                page.style.display = "none";
            }
        });


        document
            .querySelectorAll("[data-page]")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.page === pageId
                );

            });


        if (pageId === "calendarPage") {
            renderCalendar();
        }

        if (pageId === "assignmentsPage") {
            renderAssignments();
        }

        if (pageId === "peersPage") {
            renderPeers();
        }

        if (pageId === "progressPage") {
            renderProgress();
        }

        if (pageId === "profilePage") {
            renderProfile();
        }
    }


    document
        .querySelectorAll("[data-page]")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    showPage(
                        this.dataset.page
                    );

                }
            );

        });


    document
        .querySelectorAll("a[data-page-link]")
        .forEach(link => {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    showPage(
                        this.dataset.pageLink
                    );

                }
            );

        });


    /* =====================================================
       USER INTERFACE
       ===================================================== */

    function updateUserInterface() {

        if (!currentUser) return;

        const name =
            currentUser.name || "Student";

        const year =
            currentUser.year || "Year 8";


        if ($("topUserName")) {
            $("topUserName").textContent = name;
        }

        if ($("topUserYear")) {
            $("topUserYear").textContent = year;
        }

        if ($("welcomeName")) {

            $("welcomeName").textContent =
                name.split(" ")[0];
        }

        if ($("homePoints")) {

            $("homePoints").textContent =
                currentUser.points || 0;
        }


        if ($("profileName")) {
            $("profileName").textContent = name;
        }

        if ($("profileEmail")) {
            $("profileEmail").textContent =
                currentUser.email;
        }

        if ($("profileYear")) {
            $("profileYear").textContent = year;
        }


        updateHomeProgress();


        /* Avatar */

        const initials =
            name
                .split(" ")
                .map(word => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();


        if ($("topAvatar")) {
            $("topAvatar").textContent = initials;
        }

        if ($("profileAvatar")) {
            $("profileAvatar").textContent = initials;
        }


        /* Study stats */

        if ($("sessionCount")) {
            $("sessionCount").textContent =
                currentUser.sessions || 0;
        }

        if ($("sessionPoints")) {
            $("sessionPoints").textContent =
                currentUser.points || 0;
        }
    }


    /* =====================================================
       HOME PROGRESS
       ===================================================== */

    function updateHomeProgress() {

        if (!currentUser) return;

        const points =
            currentUser.points || 0;

        const progress =
            points % 100;


        if ($("homeProgressFill")) {

            $("homeProgressFill").style.width =
                progress + "%";
        }


        if ($("homeProgressCaption")) {

            if (points === 0) {

                $("homeProgressCaption").textContent =
                    "You're just getting started.";

            } else {

                $("homeProgressCaption").textContent =
                    progress +
                    "% to your next milestone";
            }
        }
    }


    /* =====================================================
       CALENDAR
       ===================================================== */

    let calendarDate = new Date();


    function renderCalendar() {

        const calendar =
            $("fullCalendar");

        if (!calendar) return;


        const year =
            calendarDate.getFullYear();

        const month =
            calendarDate.getMonth();


        if ($("fullCalendarTitle")) {

            $("fullCalendarTitle").textContent =
                calendarDate.toLocaleDateString(
                    "en-NZ",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );
        }


        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();


        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        const startOffset =
            firstDay === 0
                ? 6
                : firstDay - 1;


        let html = "";


        for (
            let i = 0;
            i < startOffset;
            i++
        ) {

            html += `
                <div class="calendar-day empty"></div>
            `;
        }


        const today = new Date();


        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();


            html += `
                <div class="calendar-day ${isToday ? "today" : ""}">
                    <span class="calendar-number">
                        ${day}
                    </span>
                </div>
            `;
        }


        calendar.innerHTML = html;
    }


    $("previousMonth")?.addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );

            renderCalendar();
        }
    );


    $("nextMonth")?.addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );

            renderCalendar();
        }
    );


    $("todayButton")?.addEventListener(
        "click",
        function () {

            calendarDate = new Date();

            renderCalendar();
        }
    );


    /* =====================================================
       ASSIGNMENTS
       ===================================================== */

    function renderAssignments() {

        const list =
            $("assignmentPageList");

        if (!list) return;


        if (assignments.length === 0) {

            list.innerHTML = `
                <div class="empty-state">
                    <h3>No assignments yet 📚</h3>
                    <p>
                        Your assignments will appear here.
                    </p>
                </div>
            `;

            return;
        }


        list.innerHTML =
            assignments
                .map(assignment => `

                    <div class="assignment-item">

                        <div class="assignment-main">

                            <h3>
                                ${escapeHTML(
                                    assignment.title ||
                                    "Assignment"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    assignment.subject || ""
                                )}
                            </p>

                        </div>

                        <div class="assignment-date">

                            ${escapeHTML(
                                assignment.date || ""
                            )}

                        </div>

                    </div>

                `)
                .join("");
    }


    /* =====================================================
       PEERS
       ===================================================== */

    function renderPeers() {

        const container =
            $("peerResults");

        if (!container) return;


        const search =
            ($("peerSearch")?.value || "")
                .toLowerCase()
                .trim();


        const subject =
            $("subjectFilter")?.value || "";


        const year =
            $("yearFilter")?.value || "";


        const availability =
            $("availableFilter")?.value || "";


        let users = getUsers();


        users = users.filter(user => {

            if (
                currentUser &&
                user.email.toLowerCase() ===
                currentUser.email.toLowerCase()
            ) {
                return false;
            }


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


            const matchesAvailability =
                !availability ||
                (
                    availability === "available" &&
                    user.available
                ) ||
                (
                    availability === "unavailable" &&
                    !user.available
                );


            return (
                matchesSearch &&
                matchesSubject &&
                matchesYear &&
                matchesAvailability
            );

        });


        if (users.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No peers found</h3>
                    <p>
                        Try changing your search or filters.
                    </p>
                </div>
            `;

            return;
        }


        container.innerHTML =
            users.map(user => `

                <div class="peer-card">

                    <div class="peer-avatar">
                        ${escapeHTML(
                            (user.name || "S")
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div class="peer-info">

                        <h3>
                            ${escapeHTML(user.name)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                user.year || ""
                            )}
                        </p>

                        <div class="subject-tags">

                            ${(user.subjects || [])
                                .map(subject =>
                                    `<span>
                                        ${escapeHTML(subject)}
                                    </span>`
                                )
                                .join("")}

                        </div>

                    </div>

                    <div class="peer-status">

                        ${user.available
                            ? "Available"
                            : "Unavailable"}

                    </div>

                </div>

            `)
            .join("");
    }


    $("peerSearchButton")?.addEventListener(
        "click",
        renderPeers
    );

    $("peerSearch")?.addEventListener(
        "input",
        renderPeers
    );

    $("subjectFilter")?.addEventListener(
        "change",
        renderPeers
    );

    $("yearFilter")?.addEventListener(
        "change",
        renderPeers
    );

    $("availableFilter")?.addEventListener(
        "change",
        renderPeers
    );


    /* =====================================================
       STUDY TIMER
       ===================================================== */

    function updateTimerDisplay() {

        const minutes =
            Math.floor(timerSeconds / 60)
                .toString()
                .padStart(2, "0");


        const seconds =
            (timerSeconds % 60)
                .toString()
                .padStart(2, "0");


        if ($("pomodoroTime")) {

            $("pomodoroTime").textContent =
                `${minutes}:${seconds}`;
        }


        if ($("pomodoroStatus")) {

            $("pomodoroStatus").textContent =
                timerMode === "focus"
                    ? "Ready to study"
                    : timerMode === "short"
                        ? "Short break"
                        : "Long break";
        }


        document
            .querySelectorAll(".pomodoro-mode-button")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.mode === timerMode
                );

            });
    }


    function startTimer() {

        if (timerRunning) return;

        timerRunning = true;


        if ($("pomodoroStatus")) {

            $("pomodoroStatus").textContent =
                timerMode === "focus"
                    ? "Focus session in progress"
                    : "Break in progress";
        }


        timerInterval =
            setInterval(() => {

                timerSeconds--;

                updateTimerDisplay();


                if (timerSeconds <= 0) {

                    finishTimer();
                }

            }, 1000);
    }


    function pauseTimer() {

        timerRunning = false;

        clearInterval(timerInterval);

        timerInterval = null;
    }


    function resetTimer() {

        pauseTimer();

        setTimerMode(timerMode);
    }


    function finishTimer() {

        pauseTimer();


        if (
            currentUser &&
            timerMode === "focus"
        ) {

            currentUser.points =
                (currentUser.points || 0) + 5;


            currentUser.sessions =
                (currentUser.sessions || 0) + 1;


            if (!currentUser.progressHistory) {
                currentUser.progressHistory = [];
            }


            currentUser.progressHistory.push(
                currentUser.points
            );


            saveCurrentUser();

            updateUserInterface();


            showRoroMessage(
                "You finished a focus session! +5 points ⭐"
            );
        }


        alert(
            timerMode === "focus"
                ? "Focus session complete! 🎉"
                : "Break finished!"
        );


        setTimerMode(
            timerMode === "focus"
                ? "short"
                : "focus"
        );
    }


    function setTimerMode(mode) {

        pauseTimer();

        timerMode = mode;


        if (mode === "focus") {
            timerSeconds = 25 * 60;
        }

        if (mode === "short") {
            timerSeconds = 5 * 60;
        }

        if (mode === "long") {
            timerSeconds = 15 * 60;
        }


        updateTimerDisplay();
    }


    $("pomodoroStart")?.addEventListener(
        "click",
        startTimer
    );

    $("pomodoroPause")?.addEventListener(
        "click",
        pauseTimer
    );

    $("pomodoroReset")?.addEventListener(
        "click",
        resetTimer
    );


    document
        .querySelectorAll("[data-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    setTimerMode(
                        this.dataset.mode
                    );

                }
            );

        });


    updateTimerDisplay();


    /* =====================================================
       PROFILE
       ===================================================== */

    function renderProfile() {

        if (!currentUser) return;


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
                    ? "Available"
                    : "Not available";
        }


        if ($("profileSubjects")) {

            const subjects =
                currentUser.subjects || [];


            $("profileSubjects").innerHTML =
                subjects.length

                    ? subjects
                        .map(subject =>
                            `<span class="subject-tag">
                                ${escapeHTML(subject)}
                            </span>`
                        )
                        .join("")

                    : `
                        <span class="subject-tag">
                            No subjects added
                        </span>
                    `;
        }
    }


    /* =====================================================
       PROGRESS
       ===================================================== */

    function renderProgress() {

        if (!currentUser) return;


        if ($("progressPoints")) {
            $("progressPoints").textContent =
                currentUser.points || 0;
        }


        if ($("progressSessions")) {
            $("progressSessions").textContent =
                currentUser.sessions || 0;
        }


        if ($("progressAssignments")) {
            $("progressAssignments").textContent =
                assignments.length;
        }


        if ($("progressHelp")) {
            $("progressHelp").textContent =
                currentUser.helped || 0;
        }


        drawProgressChart();
    }


    function drawProgressChart() {

        const canvas =
            $("progressChart");

        if (!canvas || !currentUser) return;


        const ctx =
            canvas.getContext("2d");


        const data =
            currentUser.progressHistory || [];


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        if (data.length < 2) {

            ctx.font =
                "16px Arial";

            ctx.fillStyle =
                "#85847e";

            ctx.fillText(
                "Complete study sessions to see your progress.",
                20,
                50
            );

            return;
        }


        const max =
            Math.max(...data, 100);


        ctx.beginPath();


        data.forEach((value, index) => {

            const x =
                30 +
                (index / (data.length - 1)) *
                (canvas.width - 60);


            const y =
                canvas.height -
                30 -
                (value / max) *
                (canvas.height - 60);


            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

        });


        ctx.strokeStyle =
            "#7a2638";

        ctx.lineWidth = 3;

        ctx.stroke();
    }


    /* =====================================================
       SETTINGS
       ===================================================== */

    $("availabilitySetting")?.addEventListener(
        "change",
        function () {

            if (!currentUser) return;

            currentUser.available =
                this.checked;

            saveCurrentUser();
        }
    );


    $("signOutButton")?.addEventListener(
        "click",
        function () {

            pauseTimer();

            currentUser = null;

            assignments = [];


            localStorage.removeItem(
                CURRENT_USER_KEY
            );


            showLogin();
        }
    );


    /* =====================================================
       RORO
       ===================================================== */

    function showRoroMessage(message) {

        const buddy =
            $("roroBuddy");

        const speech =
            $("roroSpeech");


        if (!buddy) return;


        buddy.classList.add(
            "roro-visible"
        );


        if (speech) {
            speech.textContent = message;
        }


        setTimeout(() => {

            buddy.classList.remove(
                "roro-visible"
            );

        }, 5000);
    }


    $("roroBuddy")?.addEventListener(
        "click",
        function () {

            showRoroMessage(
                "You've got this! 🐉✨"
            );

        }
    );


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       STARTUP
       ===================================================== */

    const savedEmail =
        localStorage.getItem(
            CURRENT_USER_KEY
        );


    if (savedEmail) {

        const user =
            getUsers().find(
                account =>
                    account.email.toLowerCase() ===
                    savedEmail.toLowerCase()
            );


        if (user) {

            currentUser = {
                ...user
            };

            assignments =
                loadAssignments();

            showApp();

        } else {

            localStorage.removeItem(
                CURRENT_USER_KEY
            );

            showLogin();
        }

    } else {

        showLogin();
    }

});
