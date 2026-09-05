document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       STORAGE
    ========================================================= */

    const USERS_KEY = "stOransPeerHubUsers";
    const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";
    const ASSIGNMENTS_KEY = "stOransPeerHubAssignments_";

    let currentUser = null;
    let assignments = [];

    /* =========================================================
       TIMER
    ========================================================= */

    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let timerMode = "focus";
    let timerRunning = false;

    /* =========================================================
       HELPER
    ========================================================= */

    function $(id) {
        return document.getElementById(id);
    }

    /* =========================================================
       USERS
    ========================================================= */

    function getUsers() {
        try {
            const saved = localStorage.getItem(USERS_KEY);

            if (!saved) {
                return [];
            }

            const parsed = JSON.parse(saved);

            // Prevent old/broken localStorage data from crashing the site
            if (!Array.isArray(parsed)) {
                console.warn("Invalid user data found. Resetting users.");
                localStorage.removeItem(USERS_KEY);
                return [];
            }

            return parsed;
        } catch (error) {
            console.warn("Could not read users. Resetting users.", error);
            localStorage.removeItem(USERS_KEY);
            return [];
        }
    }

    function saveUsers(users) {
        if (!Array.isArray(users)) {
            users = [];
        }

        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function saveCurrentUser() {
        if (!currentUser) return;

        const users = getUsers();

        const index = users.findIndex(
            user =>
                user &&
                typeof user.email === "string" &&
                user.email.toLowerCase() === currentUser.email.toLowerCase()
        );

        if (index !== -1) {
            users[index] = currentUser;
            saveUsers(users);
        }
    }

    /* =========================================================
       DEMO USERS
    ========================================================= */

    function setupDemoUsers() {

        let users = getUsers();

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
                subjects: ["Maths", "English", "Science"],
                bio: "I like helping people with maths!",
                available: true,
                progressHistory: [20, 35, 50, 70, 90]
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
                subjects: ["English", "Social Studies"],
                bio: "Happy to help with English.",
                available: true,
                progressHistory: [20, 40, 55, 65]
            }
        ];

        demos.forEach(demo => {

            const exists = users.some(
                user =>
                    user &&
                    typeof user.email === "string" &&
                    user.email.toLowerCase() === demo.email.toLowerCase()
            );

            if (!exists) {
                users.push(demo);
            }
        });

        saveUsers(users);
    }

    setupDemoUsers();

    /* =========================================================
       ASSIGNMENTS
    ========================================================= */

    function loadAssignments() {

        if (!currentUser) return [];

        try {

            const saved = localStorage.getItem(
                ASSIGNMENTS_KEY + currentUser.email
            );

            if (!saved) return [];

            const parsed = JSON.parse(saved);

            return Array.isArray(parsed) ? parsed : [];

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
       LOGIN / APP SCREENS
    ========================================================= */

    function showLogin() {

        const login = $("loginScreen");
        const app = $("app");
        const modal = $("signupModal");

        if (login) {
            login.classList.remove("hidden");
            login.style.display = "";
        }

        if (app) {
            app.classList.add("hidden");
        }

        if (modal) {
            modal.classList.add("hidden");
        }
    }

    function showSignup() {

        const modal = $("signupModal");

        if (!modal) return;

        modal.classList.remove("hidden");
        modal.style.display = "";

        const error = $("signupError");

        if (error) {
            error.textContent = "";
        }
    }

    function showApp() {

        const login = $("loginScreen");
        const app = $("app");
        const modal = $("signupModal");

        if (login) {
            login.classList.add("hidden");
        }

        if (modal) {
            modal.classList.add("hidden");
        }

        if (app) {
            app.classList.remove("hidden");
            app.style.display = "";
        }

        updateUserInterface();

        showPage("homePage");
    }

    /* =========================================================
       LOGIN
    ========================================================= */

    const loginForm = $("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (e) {

            e.preventDefault();

            const emailInput = $("loginEmail");
            const passwordInput = $("loginPassword");
            const error = $("loginError");

            const email = emailInput
                ? emailInput.value.trim().toLowerCase()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";

            const users = getUsers();

            const user = users.find(
                u =>
                    u &&
                    typeof u.email === "string" &&
                    u.email.toLowerCase() === email &&
                    u.password === password
            );

            if (!user) {

                if (error) {
                    error.textContent = "Incorrect email or password.";
                }

                return;
            }

            currentUser = { ...user };

            assignments = loadAssignments();

            const remember = $("rememberMe");

            if (remember && remember.checked) {

                localStorage.setItem(
                    CURRENT_USER_KEY,
                    currentUser.email
                );

            } else {

                localStorage.removeItem(CURRENT_USER_KEY);
            }

            if (error) {
                error.textContent = "";
            }

            showApp();
        });
    }

    /* =========================================================
       SIGN UP
    ========================================================= */

    const signupForm = $("signupForm");

    if (signupForm) {

        signupForm.addEventListener("submit", function (e) {

            e.preventDefault();

            const nameInput = $("signupName");
            const emailInput = $("signupEmail");
            const passwordInput = $("signupPassword");
            const yearInput = $("signupYear");
            const error = $("signupError");

            const name = nameInput
                ? nameInput.value.trim()
                : "";

            const email = emailInput
                ? emailInput.value.trim().toLowerCase()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";

            const year = yearInput
                ? yearInput.value
                : "Year 8";

            if (!name || !email || !password) {

                if (error) {
                    error.textContent = "Please fill in all fields.";
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

            const users = getUsers();

            const existingUser = users.find(
                user =>
                    user &&
                    typeof user.email === "string" &&
                    user.email.toLowerCase() === email
            );

            if (existingUser) {

                if (error) {
                    error.textContent =
                        "An account with that email already exists.";
                }

                return;
            }

            /* New students start with NOTHING */
            const newUser = {
                name: name,
                email: email,
                password: password,
                year: year || "Year 8",
                className: "8XX",

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

            currentUser = { ...newUser };

            assignments = [];

            saveAssignments();

            localStorage.setItem(
                CURRENT_USER_KEY,
                currentUser.email
            );

            signupForm.reset();

            if (error) {
                error.textContent = "";
            }

            showApp();
        });
    }

    /* =========================================================
       OPEN SIGNUP
    ========================================================= */

    const showSignupButton = $("showSignup");

    if (showSignupButton) {

        showSignupButton.addEventListener("click", function (e) {

            e.preventDefault();

            showSignup();
        });
    }

    /* =========================================================
       BACK TO LOGIN
    ========================================================= */

    const backToLogin = $("backToLogin");

    if (backToLogin) {

        backToLogin.addEventListener("click", function (e) {

            e.preventDefault();

            const modal = $("signupModal");

            if (modal) {
                modal.classList.add("hidden");
            }

            showLogin();
        });
    }

    /* =========================================================
       CLOSE SIGNUP
    ========================================================= */

    const closeSignup = $("closeSignup");

    if (closeSignup) {

        closeSignup.addEventListener("click", function () {

            const modal = $("signupModal");

            if (modal) {
                modal.classList.add("hidden");
            }
        });
    }

    /* =========================================================
       FORGOT PASSWORD
    ========================================================= */

    const forgotPassword = $("forgotPassword");

    if (forgotPassword) {

        forgotPassword.addEventListener("click", function (e) {

            e.preventDefault();

            const email = prompt("Enter your email:");

            if (!email) return;

            const user = getUsers().find(
                u =>
                    u &&
                    typeof u.email === "string" &&
                    u.email.toLowerCase() ===
                    email.trim().toLowerCase()
            );

            if (!user) {

                alert("No account was found with that email.");

                return;
            }

            alert("Demo password: " + user.password);
        });
    }

    /* =========================================================
       GOOGLE DEMO LOGIN
    ========================================================= */

    const googleLogin = $("googleLogin");

    if (googleLogin) {

        googleLogin.addEventListener("click", function (e) {

            e.preventDefault();

            const users = getUsers();

            const user = users.find(
                u =>
                    u &&
                    typeof u.email === "string" &&
                    u.email.toLowerCase() ===
                    "t.smith@storans.school.nz"
            );

            if (!user) {

                alert("Demo Google account could not be found.");

                setupDemoUsers();

                return;
            }

            currentUser = { ...user };

            assignments = loadAssignments();

            localStorage.setItem(
                CURRENT_USER_KEY,
                currentUser.email
            );

            showApp();
        });
    }

    /* =========================================================
       PAGES
    ========================================================= */

    const pageIds = [
        "homePage",
        "calendarPage",
        "assignmentsPage",
        "peersPage",
        "resourcesPage",
        "studyPage",
        "profilePage",
        "progressPage",
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

            button.addEventListener("click", function () {

                showPage(this.dataset.page);
            });
        });

    document
        .querySelectorAll("a[href^='#']")
        .forEach(link => {

            const id = link
                .getAttribute("href")
                .substring(1);

            if (pageIds.includes(id)) {

                link.addEventListener("click", function (e) {

                    e.preventDefault();

                    showPage(id);
                });
            }
        });

    /* =========================================================
       USER INTERFACE
    ========================================================= */

    function updateUserInterface() {

        if (!currentUser) return;

        const name = currentUser.name || "Student";
        const year = currentUser.year || "Year 8";

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
    }

    function updateHomeProgress() {

        if (!currentUser) return;

        const points = currentUser.points || 0;

        const progress = points % 100;

        if ($("homeProgressFill")) {

            $("homeProgressFill").style.width =
                progress + "%";
        }

        if ($("homeProgressCaption")) {

            $("homeProgressCaption").textContent =
                progress +
                "% to your next milestone";
        }
    }

    /* =========================================================
       CALENDAR
    ========================================================= */

    let calendarDate = new Date();

    function renderCalendar() {

        const calendar = $("fullCalendar");

        if (!calendar) return;

        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        const firstDay = new Date(
            year,
            month,
            1
        ).getDay();

        const daysInMonth = new Date(
            year,
            month + 1,
            0
        ).getDate();

        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        const heading = $("calendarMonth");

        if (heading) {

            heading.textContent =
                monthNames[month] +
                " " +
                year;
        }

        let html = "";

        const weekdays = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ];

        weekdays.forEach(day => {

            html += `
                <div class="calendar-day-name">
                    ${day}
                </div>
            `;
        });

        for (let i = 0; i < firstDay; i++) {

            html += `
                <div class="calendar-day empty"></div>
            `;
        }

        for (let day = 1; day <= daysInMonth; day++) {

            const today = new Date();

            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

            html += `
                <div class="calendar-day ${isToday ? "today" : ""}">
                    <span>${day}</span>
                </div>
            `;
        }

        calendar.innerHTML = html;
    }

    $("prevMonth")?.addEventListener(
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

    /* =========================================================
       ASSIGNMENTS
    ========================================================= */

    function renderAssignments() {

        const container = $("assignmentsList");

        if (!container) return;

        if (assignments.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No assignments yet</h3>
                    <p>Your assignments will appear here.</p>
                </div>
            `;

            return;
        }

        container.innerHTML = assignments
            .map((assignment, index) => {

                return `
                    <div class="assignment-card">

                        <div>
                            <h3>${escapeHTML(assignment.title)}</h3>

                            <p>
                                ${escapeHTML(
                                    assignment.subject || ""
                                )}
                            </p>

                            ${
                                assignment.due
                                    ? `<small>Due ${escapeHTML(
                                          assignment.due
                                      )}</small>`
                                    : ""
                            }
                        </div>

                        <button
                            class="secondary-button"
                            onclick="deleteAssignment(${index})"
                        >
                            Delete
                        </button>

                    </div>
                `;
            })
            .join("");
    }

    window.deleteAssignment = function (index) {

        assignments.splice(index, 1);

        saveAssignments();

        renderAssignments();
    };

    /* =========================================================
       ADD ASSIGNMENT
    ========================================================= */

    $("assignmentForm")?.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();

            const title = $("assignmentTitle")?.value.trim();
            const subject = $("assignmentSubject")?.value.trim();
            const due = $("assignmentDue")?.value;

            if (!title) return;

            assignments.push({
                title: title,
                subject: subject || "",
                due: due || ""
            });

            saveAssignments();

            this.reset();

            renderAssignments();
        }
    );

    /* =========================================================
       PEERS
    ========================================================= */

    function renderPeers() {

        const container = $("peersList");

        if (!container) return;

        let users = getUsers();

        users = users.filter(
            user =>
                user &&
                user.email !== currentUser?.email
        );

        if (users.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No peers found</h3>
                    <p>There aren't any other students yet.</p>
                </div>
            `;

            return;
        }

        container.innerHTML = users
            .map(user => {

                const subjects =
                    Array.isArray(user.subjects)
                        ? user.subjects
                        : [];

                return `
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
                                ${escapeHTML(
                                    user.name || "Student"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    user.year || "Student"
                                )}
                            </p>

                            <div class="tags">

                                ${subjects
                                    .map(
                                        subject =>
                                            `<span class="tag">
                                                ${escapeHTML(
                                                    subject
                                                )}
                                            </span>`
                                    )
                                    .join("")}

                            </div>

                            <p class="peer-bio">
                                ${escapeHTML(
                                    user.bio || ""
                                )}
                            </p>

                        </div>

                    </div>
                `;
            })
            .join("");
    }

    $("peerSearch")?.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .toLowerCase()
                    .trim();

            document
                .querySelectorAll(".peer-card")
                .forEach(card => {

                    const text =
                        card.textContent
                            .toLowerCase();

                    card.style.display =
                        text.includes(search)
                            ? ""
                            : "none";
                });
        }
    );

    /* =========================================================
       POMODORO
    ========================================================= */

    function updateTimerDisplay() {

        const minutes =
            Math.floor(timerSeconds / 60);

        const seconds =
            timerSeconds % 60;

        const display =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");

        if ($("pomodoroTime")) {
            $("pomodoroTime").textContent = display;
        }
    }

    function updateTimerButtons() {

        if ($("pomodoroStart")) {

            $("pomodoroStart").disabled =
                timerRunning;
        }

        if ($("pomodoroPause")) {

            $("pomodoroPause").disabled =
                !timerRunning;
        }
    }

    function startTimer() {

        if (timerRunning) return;

        timerRunning = true;

        updateTimerButtons();

        if ($("pomodoroStatus")) {
            $("pomodoroStatus").textContent =
                timerMode === "focus"
                    ? "Focus time"
                    : "Break time";
        }

        timerInterval = setInterval(
            function () {

                if (timerSeconds > 0) {

                    timerSeconds--;

                    updateTimerDisplay();

                } else {

                    clearInterval(timerInterval);

                    timerInterval = null;

                    timerRunning = false;

                    if (timerMode === "focus") {

                        timerMode = "break";

                        timerSeconds = 5 * 60;

                        if (currentUser) {

                            currentUser.sessions =
                                (currentUser.sessions || 0) + 1;

                            currentUser.points =
                                (currentUser.points || 0) + 10;

                            if (
                                !Array.isArray(
                                    currentUser.progressHistory
                                )
                            ) {
                                currentUser.progressHistory = [];
                            }

                            currentUser.progressHistory.push(
                                Math.min(
                                    currentUser.points,
                                    100
                                )
                            );

                            saveCurrentUser();

                            updateUserInterface();
                        }

                    } else {

                        timerMode = "focus";

                        timerSeconds = 25 * 60;
                    }

                    updateTimerDisplay();

                    updateTimerButtons();

                    if ($("pomodoroStatus")) {

                        $("pomodoroStatus").textContent =
                            timerMode === "focus"
                                ? "Ready to focus"
                                : "Take a break!";
                    }

                    updateRoroMessage();
                }
            },
            1000
        );
    }

    function pauseTimer() {

        if (timerInterval) {

            clearInterval(timerInterval);

            timerInterval = null;
        }

        timerRunning = false;

        updateTimerButtons();

        if ($("pomodoroStatus")) {

            $("pomodoroStatus").textContent =
                "Paused";
        }
    }

    function resetTimer() {

        if (timerInterval) {

            clearInterval(timerInterval);

            timerInterval = null;
        }

        timerRunning = false;

        timerMode = "focus";

        timerSeconds = 25 * 60;

        updateTimerDisplay();

        updateTimerButtons();

        if ($("pomodoroStatus")) {

            $("pomodoroStatus").textContent =
                "Ready to focus";
        }
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

    updateTimerDisplay();

    updateTimerButtons();

    /* =========================================================
       TIMER SETTINGS
    ========================================================= */

    $("sessionMinutes")?.addEventListener(
        "change",
        function () {

            const minutes =
                parseInt(this.value);

            if (
                !isNaN(minutes) &&
                minutes > 0
            ) {

                timerSeconds =
                    minutes * 60;

                updateTimerDisplay();
            }
        }
    );

    /* =========================================================
       PROFILE
    ========================================================= */

    function renderProfile() {

        if (!currentUser) return;

        if ($("profileName")) {

            $("profileName").textContent =
                currentUser.name || "Student";
        }

        if ($("profileEmail")) {

            $("profileEmail").textContent =
                currentUser.email || "";
        }

        if ($("profileYear")) {

            $("profileYear").textContent =
                currentUser.year || "Year 8";
        }

        if ($("profileClass")) {

            $("profileClass").textContent =
                currentUser.className || "8XX";
        }

        if ($("profilePoints")) {

            $("profilePoints").textContent =
                currentUser.points || 0;
        }

        if ($("profileSessions")) {

            $("profileSessions").textContent =
                currentUser.sessions || 0;
        }

        if ($("profileHelped")) {

            $("profileHelped").textContent =
                currentUser.helped || 0;
        }
    }

    /* =========================================================
       PROFILE EDITING
    ========================================================= */

    $("profileForm")?.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();

            if (!currentUser) return;

            const name =
                $("profileEditName")?.value.trim();

            const bio =
                $("profileBio")?.value.trim();

            if (name) {
                currentUser.name = name;
            }

            if (bio !== undefined) {
                currentUser.bio = bio;
            }

            saveCurrentUser();

            updateUserInterface();

            renderProfile();

            alert("Profile updated!");
        }
    );

    /* =========================================================
       PROGRESS
    ========================================================= */

    function renderProgress() {

        if (!currentUser) return;

        const points =
            currentUser.points || 0;

        const sessions =
            currentUser.sessions || 0;

        const helped =
            currentUser.helped || 0;

        if ($("progressPoints")) {

            $("progressPoints").textContent =
                points;
        }

        if ($("progressSessions")) {

            $("progressSessions").textContent =
                sessions;
        }

        if ($("progressHelped")) {

            $("progressHelped").textContent =
                helped;
        }

        const history =
            Array.isArray(
                currentUser.progressHistory
            )
                ? currentUser.progressHistory
                : [];

        const chart =
            $("progressChart");

        if (!chart) return;

        if (history.length === 0) {

            chart.innerHTML = `
                <div class="empty-state">
                    <h3>Your progress starts here</h3>
                    <p>
                        Complete study sessions to build
                        your progress history.
                    </p>
                </div>
            `;

            return;
        }

        chart.innerHTML = history
            .map(value => {

                const height =
                    Math.max(
                        5,
                        Math.min(100, value)
                    );

                return `
                    <div
                        class="progress-bar"
                        style="height:${height}%"
                    ></div>
                `;
            })
            .join("");
    }

    /* =========================================================
       SETTINGS
    ========================================================= */

    $("availabilitySetting")?.addEventListener(
        "change",
        function () {

            if (!currentUser) return;

            currentUser.available =
                this.checked;

            saveCurrentUser();

            updateRoroMessage();
        }
    );

    $("notificationsSetting")?.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "stOransNotifications",
                this.checked
            );
        }
    );

    $("studyReminderSetting")?.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "stOransStudyReminder",
                this.checked
            );
        }
    );

    /* =========================================================
       SIGN OUT
    ========================================================= */

    $("signOutButton")?.addEventListener(
        "click",
        function () {

            currentUser = null;

            assignments = [];

            localStorage.removeItem(
                CURRENT_USER_KEY
            );

            resetTimer();

            showLogin();
        }
    );

    /* =========================================================
       RORO
    ========================================================= */

    const roroMessages = [
        "You've got this! 🐉",
        "Small steps still count.",
        "Time to focus!",
        "I'm rooting for you!",
        "One task at a time.",
        "You are doing better than you think."
    ];

    function updateRoroMessage() {

        const speech = $("roroSpeech");

        if (!speech) return;

        const randomMessage =
            roroMessages[
                Math.floor(
                    Math.random() *
                    roroMessages.length
                )
            ];

        speech.textContent =
            randomMessage;
    }

    if ($("roroBuddy")) {

        setTimeout(
            function () {

                $("roroBuddy").classList.add(
                    "roro-visible"
                );

                updateRoroMessage();

            },
            500
        );
    }

    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHTML(value) {

        if (value === null ||
            value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =========================================================
       RESTORE LOGIN
    ========================================================= */

    const savedEmail =
        localStorage.getItem(
            CURRENT_USER_KEY
        );

    if (savedEmail) {

        const user = getUsers().find(
            u =>
                u &&
                typeof u.email === "string" &&
                u.email.toLowerCase() ===
                savedEmail.toLowerCase()
        );

        if (user) {

            currentUser = { ...user };

            assignments = loadAssignments();

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
