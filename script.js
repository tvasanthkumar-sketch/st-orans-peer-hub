document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       STORAGE
       ========================================= */

    const USERS_KEY = "stOransPeerHubUsers";
    const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";
    const ASSIGNMENTS_KEY = "stOransPeerHubAssignments_";

    let currentUser = null;
    let assignments = [];

    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let timerMode = "focus";
    let timerRunning = false;


    /* =========================================
       HELPERS
       ========================================= */

    function $(id) {
        return document.getElementById(id);
    }

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function saveCurrentUser() {
        if (!currentUser) return;

        const users = getUsers();
        const index = users.findIndex(
            u => u.email.toLowerCase() === currentUser.email.toLowerCase()
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
                localStorage.getItem(ASSIGNMENTS_KEY + currentUser.email)
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


    /* =========================================
       DEMO USERS
       ========================================= */

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

        let changed = false;

        demos.forEach(demo => {
            const exists = users.some(
                u => u.email.toLowerCase() === demo.email.toLowerCase()
            );

            if (!exists) {
                users.push(demo);
                changed = true;
            }
        });

        if (changed) saveUsers(users);
    }

    setupDemoUsers();


    /* =========================================
       SCREEN CONTROL
       ========================================= */

    function showLogin() {
        const login = $("loginScreen");
        const app = $("app");
        const modal = $("signupModal");

        if (login) login.classList.remove("hidden");
        if (app) app.classList.add("hidden");
        if (modal) modal.classList.add("hidden");
    }

    function showSignup() {
        const modal = $("signupModal");

        if (modal) {
            modal.classList.remove("hidden");
        }
    }

    function showApp() {
        const login = $("loginScreen");
        const app = $("app");
        const modal = $("signupModal");

        if (login) login.classList.add("hidden");
        if (modal) modal.classList.add("hidden");

        if (app) {
            app.classList.remove("hidden");
        }

        updateUserInterface();
        showPage("homePage");
    }


    /* =========================================
       LOGIN
       ========================================= */

    const loginForm = $("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = $("loginEmail")?.value.trim().toLowerCase();
            const password = $("loginPassword")?.value;

            const users = getUsers();

            const user = users.find(
                u =>
                    u.email.toLowerCase() === email &&
                    u.password === password
            );

            const error = $("loginError");

            if (!user) {
                if (error) {
                    error.textContent = "Incorrect email or password.";
                }
                return;
            }

            currentUser = { ...user };
            assignments = loadAssignments();

            if ($("rememberMe")?.checked) {
                localStorage.setItem(
                    CURRENT_USER_KEY,
                    currentUser.email
                );
            }

            if (error) error.textContent = "";

            showApp();
        });
    }


    /* =========================================
       SIGNUP
       ========================================= */

    const signupForm = $("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = $("signupName")?.value.trim();
            const email = $("signupEmail")?.value.trim().toLowerCase();
            const password = $("signupPassword")?.value;

            if (!name || !email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            const users = getUsers();

            if (
                users.some(
                    u => u.email.toLowerCase() === email
                )
            ) {
                alert("An account with that email already exists.");
                return;
            }

            const newUser = {
                name,
                email,
                password,
                year: "Year 8",
                className: "8XX",

                /* NEW USERS START WITH NOTHING */
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

            showApp();
        });
    }


    /* =========================================
       SIGNUP BUTTONS
       ========================================= */

    $("showSignup")?.addEventListener("click", function (e) {
        e.preventDefault();
        showSignup();
    });

    $("closeSignup")?.addEventListener("click", function () {
        $("signupModal")?.classList.add("hidden");
    });


    /* =========================================
       FORGOT PASSWORD
       ========================================= */

    $("forgotPassword")?.addEventListener("click", function (e) {
        e.preventDefault();

        const email = prompt("Enter your email:");

        if (!email) return;

        const user = getUsers().find(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            alert("No account was found with that email.");
            return;
        }

        alert("Demo password: " + user.password);
    });


    /* =========================================
       GOOGLE DEMO LOGIN
       ========================================= */

    $("googleLogin")?.addEventListener("click", function () {
        const user = getUsers().find(
            u => u.email === "t.smith@storans.school.nz"
        );

        if (!user) return;

        currentUser = { ...user };
        assignments = loadAssignments();

        showApp();
    });


    /* =========================================
       NAVIGATION
       ========================================= */

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

        /* Update navigation buttons */
        document.querySelectorAll("[data-page]").forEach(button => {
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


    /* Catch basically any nav button that points at a page */
    document.querySelectorAll("[data-page]").forEach(button => {
        button.addEventListener("click", function () {
            showPage(this.dataset.page);
        });
    });


    /* Also support buttons/links using href="#pageId" */
    document.querySelectorAll("a[href^='#']").forEach(link => {
        const id = link.getAttribute("href").substring(1);

        if (pageIds.includes(id)) {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                showPage(id);
            });
        }
    });


    /* =========================================
       USER INTERFACE
       ========================================= */

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
            $("welcomeName").textContent = name.split(" ")[0];
        }

        if ($("homePoints")) {
            $("homePoints").textContent = currentUser.points || 0;
        }

        if ($("profileName")) {
            $("profileName").textContent = name;
        }

        if ($("profileEmail")) {
            $("profileEmail").textContent = currentUser.email;
        }

        if ($("profileYear")) {
            $("profileYear").textContent = year;
        }

        updateHomeProgress();
    }


    /* =========================================
       HOME PROGRESS
       ========================================= */

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
                progress + "% to your next milestone";
        }
    }


    /* =========================================
       CALENDAR
       ========================================= */

    let calendarDate = new Date();

    function renderCalendar() {
        const calendar = $("fullCalendar");

        if (!calendar) return;

        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        const title = calendarDate.toLocaleDateString(
            "en-NZ",
            {
                month: "long",
                year: "numeric"
            }
        );

        if ($("fullCalendarTitle")) {
            $("fullCalendarTitle").textContent = title;
        }

        if ($("miniCalendarTitle")) {
            $("miniCalendarTitle").textContent = title;
        }

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

        /* Convert Sunday-first JS day to Monday-first */
        const startOffset = firstDay === 0
            ? 6
            : firstDay - 1;

        let html = "";

        for (let i = 0; i < startOffset; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }

        const today = new Date();

        for (let day = 1; day <= daysInMonth; day++) {

            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

            html += `
                <div class="calendar-day ${isToday ? "today" : ""}">
                    <span class="calendar-number">${day}</span>
                </div>
            `;
        }

        calendar.innerHTML = html;

        /* Mini calendar */
        if ($("miniCalendar")) {
            $("miniCalendar").innerHTML = html;
        }
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


    /* =========================================
       ASSIGNMENTS
       ========================================= */

    function renderAssignments() {
        const list = $("assignmentPageList");

        if (!list) return;

        if (assignments.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <h3>No assignments yet 📚</h3>
                    <p>Your assignments will appear here.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = assignments.map(a => `
            <div class="assignment-item">
                <div class="assignment-main">
                    <h3>${escapeHTML(a.title || "Assignment")}</h3>
                    <p>${escapeHTML(a.subject || "")}</p>
                </div>
                <div class="assignment-date">
                    ${escapeHTML(a.date || "")}
                </div>
            </div>
        `).join("");
    }


    /* =========================================
       PEERS
       ========================================= */

    function renderPeers() {
        const container = $("peerResults");

        if (!container) return;

        const search =
            ($("peerSearch")?.value || "")
                .toLowerCase()
                .trim();

        const subject =
            $("subjectFilter")?.value || "";

        const year =
            $("yearFilter")?.value || "";

        const available =
            $("availableFilter")?.value || "";

        let users = getUsers();

        users = users.filter(user => {
            if (
                currentUser &&
                user.email === currentUser.email
            ) {
                return false;
            }

            const matchesSearch =
                !search ||
                user.name.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search);

            const matchesSubject =
                !subject ||
                (user.subjects || []).includes(subject);

            const matchesYear =
                !year ||
                user.year === year;

            const matchesAvailability =
                !available ||
                (available === "available" && user.available);

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
                    <p>Try changing your search or filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="peer-card">
                <div class="peer-avatar">
                    ${(user.name || "S").charAt(0)}
                </div>

                <div class="peer-info">
                    <h3>${escapeHTML(user.name)}</h3>
                    <p>${escapeHTML(user.year || "")}</p>

                    <div class="subject-tags">
                        ${(user.subjects || []).map(s =>
                            `<span>${escapeHTML(s)}</span>`
                        ).join("")}
                    </div>
                </div>

                <div class="peer-status">
                    ${user.available ? "Available" : "Unavailable"}
                </div>
            </div>
        `).join("");
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


    /* =========================================
       STUDY TIMER
       ========================================= */

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
                    ? "Focus"
                    : timerMode === "short"
                        ? "Short break"
                        : "Long break";
        }
    }

    function startTimer() {
        if (timerRunning) return;

        timerRunning = true;

        timerInterval = setInterval(() => {

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

        if (timerMode === "focus") {
            timerSeconds = 25 * 60;
        } else if (timerMode === "short") {
            timerSeconds = 5 * 60;
        } else {
            timerSeconds = 15 * 60;
        }

        updateTimerDisplay();
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

            if ($("sessionPoints")) {
                $("sessionPoints").textContent =
                    currentUser.points;
            }

            if ($("sessionCount")) {
                $("sessionCount").textContent =
                    currentUser.sessions;
            }

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

    document.querySelectorAll(
        "[data-mode]"
    ).forEach(button => {
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


    /* =========================================
       PROFILE
       ========================================= */

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
                currentUser.bio || "No bio yet.";
        }

        if ($("profileAvailable")) {
            $("profileAvailable").checked =
                !!currentUser.available;
        }

        if ($("profileSubjects")) {
            $("profileSubjects").innerHTML =
                (currentUser.subjects || [])
                    .map(s =>
                        `<span>${escapeHTML(s)}</span>`
                    )
                    .join("");
        }
    }


    /* =========================================
       PROGRESS
       ========================================= */

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
        const canvas = $("progressChart");

        if (!canvas || !currentUser) return;

        const ctx = canvas.getContext("2d");

        const data =
            currentUser.progressHistory || [];

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        if (data.length < 2) {
            ctx.font = "16px Arial";
            ctx.fillText(
                "Complete study sessions to see your progress.",
                20,
                50
            );
            return;
        }

        const max = Math.max(...data, 100);

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

        ctx.strokeStyle = "#7a2638";
        ctx.lineWidth = 3;
        ctx.stroke();
    }


    /* =========================================
       SETTINGS
       ========================================= */

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


    /* =========================================
       RORO
       ========================================= */

    function showRoroMessage(message) {
        const buddy = $("roroBuddy");
        const speech = $("roroSpeech");

        if (!buddy) return;

        buddy.classList.add("roro-visible");

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


    /* =========================================
       ESCAPE HTML
       ========================================= */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================
       RESTORE LOGIN
       ========================================= */

    const savedEmail =
        localStorage.getItem(
            CURRENT_USER_KEY
        );

    if (savedEmail) {

        const user = getUsers().find(
            u =>
                u.email.toLowerCase() ===
                savedEmail.toLowerCase()
        );

        if (user) {
            currentUser = { ...user };
            assignments = loadAssignments();

            showApp();
        } else {
            showLogin();
        }

    } else {
        showLogin();
    }

});
