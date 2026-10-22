/* =========================================================
   ST ORAN'S PEER HUB
   MAIN JAVASCRIPT
   ========================================================= */

"use strict";

// Supabase browser client. The publishable key is designed for frontend use;
// never put a Supabase service-role/secret key or Google client secret here.
const supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(
        "https://yxrozzpqdzmksvivbutg.supabase.co",
        "sb_publishable_6rk7jHSRj4xllCHSnn-d1A_O5xGxtme"
    )
    : null;


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "stOransPeerHubPrototype";
const CURRENT_USER_KEY = "stOransPeerHubCurrentUser";


/* =========================================================
   DEMO DATA
   ========================================================= */

const DEFAULT_DATA = {
    users: [
        {
            id: "demo-maya",
            name: "Maya Smith",
            email: "maya@storans.school.nz",
            password: "maya123",
            year: "8",
            className: "8WI",
            points: 240,
            previousPoints: 80,
            sessions: 0,
            role: "student",
            subjects: ["English", "Science"],
            availability: ["Monday", "Wednesday"]
        }
    ],

    assignments: [
        {
            id: 1,
            title: "English persuasive writing",
            subject: "English",
            due: "Tomorrow",
            importance: "high",
            completed: false
        },
        {
            id: 2,
            title: "Science research report",
            subject: "Science",
            due: "Friday",
            importance: "medium",
            completed: false
        },
        {
            id: 3,
            title: "Mathematics practice questions",
            subject: "Mathematics",
            due: "Next Monday",
            importance: "medium",
            completed: false
        },
        {
            id: 4,
            title: "French vocabulary revision",
            subject: "French",
            due: "Next Tuesday",
            importance: "low",
            completed: true
        }
    ],

    tutors: [
        {
            id: 1,
            name: "Lucy Worthington",
            year: "13LW",
            subjects: ["English", "History"],
            availability: "Mon • Wed • Fri",
            initials: "LW",
            bio: "English enthusiast who loves helping with essays and writing."
        },
        {
            id: 2,
            name: "Aisha",
            year: "12",
            subjects: ["Mathematics", "Science"],
            availability: "Tue • Thu",
            initials: "A",
            bio: "Happy to help break complicated concepts into smaller steps."
        },
        {
            id: 3,
            name: "Sophie",
            year: "12",
            subjects: ["French", "English"],
            availability: "Mon • Thu",
            initials: "S",
            bio: "Languages, writing and revision support."
        },
        {
            id: 4,
            name: "Mia",
            year: "11",
            subjects: ["Science", "Mathematics"],
            availability: "Wed • Fri",
            initials: "M",
            bio: "Science and maths peer tutor."
        },
        {
            id: 5,
            name: "Noah",
            year: "11",
            subjects: ["Mathematics", "PE"],
            availability: "Tue • Wed",
            initials: "N",
            bio: "Maths help without making maths feel like punishment."
        },
        {
            id: 6,
            name: "Ella",
            year: "10",
            subjects: ["English", "French"],
            availability: "Mon • Fri",
            initials: "E",
            bio: "Happy to help with writing, reading and languages."
        }
    ],

    calendarEvents: [],

    settings: {
        notifications: true,
        reminders: true,
        darkMode: false
    }
};


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let appData = loadData();
let currentUser = loadCurrentUser();

let currentPage = "home";

let selectedCalendarDate = new Date();

let timerInterval = null;
let timerSeconds = 25 * 60;
let timerRunning = false;
let timerMode = "focus";
let customFocusMinutes = 25;


/*
 * Which Study card currently owns the timer.
 */
let activeStudyEnvironment = null;

let focusTimerInterval = null;
let focusSeconds = 25 * 60;
let focusRunning = false;

let currentFocusBackground = "forest";
let currentFocusSound = "forest";


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector, parent = document) => {
    return parent.querySelector(selector);
};

const $$ = (selector, parent = document) => {
    return [...parent.querySelectorAll(selector)];
};


/* =========================================================
   STORAGE FUNCTIONS
   ========================================================= */

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(DEFAULT_DATA);
        }

        const parsed = JSON.parse(saved);

        return {
            ...structuredClone(DEFAULT_DATA),
            ...parsed,
            users: parsed.users || structuredClone(DEFAULT_DATA.users),
            assignments:
                parsed.assignments ||
                structuredClone(DEFAULT_DATA.assignments),
            tutors:
                parsed.tutors ||
                structuredClone(DEFAULT_DATA.tutors),
            calendarEvents:
                parsed.calendarEvents ||
                [],
            bookings: parsed.bookings || [],
            notificationsList: parsed.notificationsList || [],
            settings: {
                ...DEFAULT_DATA.settings,
                ...(parsed.settings || {})
            }
        };
    } catch (error) {
        console.error("Could not load Peer Hub data:", error);
        return structuredClone(DEFAULT_DATA);
    }
}


function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );
    } catch (error) {
        console.error("Could not save Peer Hub data:", error);
    }
}

function getWorkspaceStorageKey(user = currentUser) {
    const userId = String(user?.id || "guest");
    return "stOransPeerHubWorkspace:" + userId;
}

function loadUserCalendarEvents(user = currentUser) {
    try {
        const saved = localStorage.getItem(getWorkspaceStorageKey(user));
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : [];
    } catch (error) {
        console.error("Could not load this user's calendar:", error);
        return [];
    }
}

function saveUserCalendarEvents() {
    try {
        localStorage.setItem(
            getWorkspaceStorageKey(),
            JSON.stringify({ calendarEvents: appData.calendarEvents || [] })
        );
    } catch (error) {
        console.error("Could not save this user's calendar:", error);
    }
}


function getSupabaseAuthId() {
    const user = getCurrentUserFromData();
    return user && String(user.id || "").startsWith("google-")
        ? String(user.id).slice(7)
        : null;
}

async function syncSupabaseCalendarEvents() {
    const authId = getSupabaseAuthId();
    if (!supabaseClient || !authId) return;

    const events = (appData.calendarEvents || []).filter(event =>
        event.source === "event" && event.id && event.title && event.date
    );

    if (!events.length) return;

    const rows = events.map(event => ({
        user_id: authId,
        event_id: String(event.id),
        title: String(event.title).slice(0, 160),
        event_date: event.date,
        event_time: String(event.time || ""),
        event_type: String(event.type || "Personal"),
        location: String(event.location || ""),
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabaseClient
        .from("calendar_events")
        .upsert(rows, { onConflict: "user_id,event_id" });

    if (error) {
        console.error("Could not sync calendar events:", error);
        showToast("Calendar saved on this device, but cloud sync failed. Please try again.");
    }
}

async function loadSupabaseCalendarEvents() {
    const authId = getSupabaseAuthId();
    if (!supabaseClient || !authId) return;

    const { data, error } = await supabaseClient
        .from("calendar_events")
        .select("event_id, title, event_date, event_time, event_type, location")
        .eq("user_id", authId)
        .order("event_date", { ascending: true });

    if (error) {
        console.error("Could not load calendar events:", error);
        showToast("Couldn't load calendar events from the cloud.");
        return;
    }

    const localEvents = (appData.calendarEvents || []).filter(event =>
        event.source !== "event"
    );
    const personalById = new Map(
        (appData.calendarEvents || [])
            .filter(event => event.source === "event")
            .map(event => [String(event.id), event])
    );

    (data || []).forEach(row => {
        personalById.set(String(row.event_id), {
            id: String(row.event_id),
            title: row.title,
            date: row.event_date,
            time: row.event_time || "",
            type: row.event_type || "Personal",
            location: row.location || "",
            source: "event",
            cloud: true
        });
    });

    appData.calendarEvents = localEvents.concat([...personalById.values()]);
    saveUserCalendarEvents();
    saveData();

    // Upload events created before cloud sync was enabled on this device.
    await syncSupabaseCalendarEvents();
}

function rebuildAssignmentCalendarEvents() {
    const personalEvents = (appData.calendarEvents || []).filter(
        event => event.source !== "assignment"
    );
    const assignmentEvents = (appData.assignments || []).map(assignment => ({
        id: "assignment-" + assignment.id,
        title: assignment.title,
        date: assignment.dueDate,
        type: "Assignment",
        time: "",
        source: "assignment",
        assignmentId: assignment.id
    }));
    appData.calendarEvents = personalEvents.concat(assignmentEvents);
    saveUserCalendarEvents();
}


function loadCurrentUser() {
    try {
        const saved = localStorage.getItem(CURRENT_USER_KEY);

        if (!saved) {
            return null;
        }

        return JSON.parse(saved);
    } catch (error) {
        console.error("Could not load current user:", error);
        return null;
    }
}


function saveCurrentUser() {
    if (!currentUser) {
        localStorage.removeItem(CURRENT_USER_KEY);
        return;
    }

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(currentUser)
    );
}


/* =========================================================
   USER HELPERS
   ========================================================= */

function getUserById(id) {
    return appData.users.find(user => user.id === id);
}


function getCurrentUserFromData() {
    if (!currentUser) {
        return null;
    }

    return (
        getUserById(currentUser.id) ||
        currentUser
    );
}


function updateCurrentUser(updates) {
    if (!currentUser) {
        return;
    }

    const userIndex = appData.users.findIndex(
        user => user.id === currentUser.id
    );

    if (userIndex === -1) {
        currentUser = {
            ...currentUser,
            ...updates
        };
    } else {
        appData.users[userIndex] = {
            ...appData.users[userIndex],
            ...updates
        };

        currentUser = appData.users[userIndex];
    }

    saveData();
    saveCurrentUser();
    void syncSupabaseProfile();
}


async function syncSupabaseProfile() {
    if (!supabaseClient || !currentUser || !String(currentUser.id || "").startsWith("google-")) {
        return;
    }

    const authId = String(currentUser.id).slice("google-".length);
    const user = getCurrentUserFromData() || currentUser;

    const profile = {
        id: authId,
        full_name: String(user.name || ""),
        year_level: String(user.year || ""),
        class_name: String(user.className || ""),
        role: ["student", "tutor", "both"].includes(user.role) ? user.role : "student",
        subjects: Array.isArray(user.subjects) ? user.subjects.map(String) : [],
        availability: Array.isArray(user.availability) ? user.availability.map(String) : [],
        bio: String(user.bio || ""),
        updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
        .from("profiles")
        .upsert(profile, { onConflict: "id" });

    if (error) {
        console.error("Could not sync profile to Supabase:", error);
    }
}


function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .map(part => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
}


function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initialiseApp();
});


async function initialiseApp() {
    setupAuthTabs();
    setupAuthentication();
    setupNavigation();
    setupTopbar();
    setupGlobalClicks();
    setupFocusMode();
    setupEnhancedFeatures();

    await restoreSupabaseSession();

    if (currentUser) {
        showApplication();
    } else {
        showAuth();
    }
}


/* =========================================================
   AUTHENTICATION
   ========================================================= */

function setupAuthTabs() {
    const tabs = $$(".auth-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.authTab;

            tabs.forEach(item => {
                item.classList.toggle(
                    "active",
                    item === tab
                );

                item.setAttribute(
                    "aria-selected",
                    item === tab ? "true" : "false"
                );
            });

            const signinForm = $("#signinForm");
            const signupForm = $("#signupForm");

            if (target === "signup") {
                signinForm?.classList.add("hidden");
                signupForm?.classList.remove("hidden");
            } else {
                signupForm?.classList.add("hidden");
                signinForm?.classList.remove("hidden");
            }
        });
    });
}


function setupAuthentication() {
    const signinForm = $("#signinForm");
    const signupForm = $("#signupForm");
    const googleButton = $("#googleDemo");

    signinForm?.addEventListener("submit", handleSignIn);
    signupForm?.addEventListener("submit", handleSignUp);

    googleButton?.addEventListener(
        "click",
        handleGoogleDemo
    );
}


function handleSignIn(event) {
    event.preventDefault();

    const email = $("#signinEmail")?.value
        .trim()
        .toLowerCase();

    const password = $("#signinPassword")?.value;

    const error = $("#signinError");

    if (error) {
        error.textContent = "";
    }

    if (!email || !password) {
        if (error) {
            error.textContent =
                "Please enter your school email and password.";
        }

        return;
    }

    const user = appData.users.find(
        account =>
            account.email.toLowerCase() === email &&
            account.password === password
    );

    if (!user) {
        if (error) {
            error.textContent =
                "We couldn't find an account with those details.";
        }

        return;
    }

    currentUser = user;

    saveCurrentUser();

    showToast(
        "Welcome back, " +
        user.name.split(" ")[0] +
        " 🌿"
    );

    showApplication();
}


function handleSignUp(event) {
    event.preventDefault();

    const name = $("#signupName")?.value.trim();
    const email = $("#signupEmail")?.value
        .trim()
        .toLowerCase();

    const year = $("#signupYear")?.value;
    const password = $("#signupPassword")?.value;

    const error = $("#signupError");

    if (error) {
        error.textContent = "";
    }

    if (!name || !email || !year || !password) {
        if (error) {
            error.textContent =
                "Please complete all the fields.";
        }

        return;
    }

    if (!/storans\.school\.nz$/i.test(email)) {
        if (error) {
            error.textContent =
                "Please use your St Oran's school email.";
        }

        return;
    }

    if (password.length < 6) {
        if (error) {
            error.textContent =
                "Your password needs at least 6 characters.";
        }

        return;
    }

    const existing = appData.users.find(
        user => user.email.toLowerCase() === email
    );

    if (existing) {
        if (error) {
            error.textContent =
                "An account with that email already exists.";
        }

        return;
    }

    const newUser = {
        id:
            "user-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2, 8),

        name,
        email,
        password,
        year,
        className: `${year}XX`,
        points: 0,
        previousPoints: 0,
        sessions: 0,
        role: "student",
        subjects: [],
        availability: []
    };

    appData.users.push(newUser);

    saveData();

    currentUser = newUser;

    saveCurrentUser();

    showToast("Account created successfully 🌿");

    showApplication();
}


async function handleGoogleDemo() {
    if (!supabaseClient) {
        showToast("Google sign-in could not load. Refresh and try again.");
        return;
    }

    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        console.error("Google sign-in failed:", error);
        showToast("Google sign-in failed. Please try again.");
    }
}

async function restoreSupabaseSession() {
    if (!supabaseClient) {
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) throw error;

        const authUser = data.session?.user;
        if (!authUser) return;

        const email = (authUser.email || "").trim().toLowerCase();

        if (!email.endsWith("@storans.school.nz")) {
            await supabaseClient.auth.signOut();
            currentUser = null;
            localStorage.removeItem(CURRENT_USER_KEY);
            showAuth();
            showToast("Please sign in with your St Oran's school Google account.");
            return;
        }

        const metadata = authUser.user_metadata || {};
        const name = metadata.full_name || metadata.name || email.split("@")[0];
        let user = appData.users.find(
            account => account.email?.toLowerCase() === email
        );

        if (!user) {
            user = {
                id: "google-" + authUser.id,
                name,
                email,
                year: "",
                className: "",
                points: 0,
                previousPoints: 0,
                sessions: 0,
                role: "student",
                subjects: [],
                availability: []
            };
            appData.users.push(user);
        } else {
            // A local/demo account may already exist with this email.
            // Once Google auth succeeds, always use the real Supabase auth UUID.
            user.id = "google-" + authUser.id;
            user.name = name;
            user.email = email;
        }

        saveData();
        currentUser = user;
        saveCurrentUser();

        // Keep personal assignments and calendar events separate per signed-in account.
        // Cloud assignments are loaded below using the authenticated user's ID.
        appData.assignments = [];
        appData.calendarEvents = loadUserCalendarEvents(currentUser);
        saveData();

        // Show the app as soon as Google has authenticated the student.
        // Optional data requests load in the background so slow queries do not
        // leave the sign-in screen visible for 30 seconds.
        showApplication();

        void (async () => {
            const backgroundLoads = await Promise.allSettled([
                syncSupabaseProfile(),
                loadSupabaseTutors(),
                loadSupabaseBookings(),
                loadSupabaseNotifications(),
                loadSupabasePoints()
            ]);

            backgroundLoads.forEach((result, index) => {
                if (result.status === "rejected") {
                    console.error("A background Peer Hub load failed:", index, result.reason);
                }
            });

            try {
                const { data: cloudAssignments, error: assignmentError } =
                    await supabaseClient
                        .from("assignments")
                        .select("id, title, subject, due_date, importance, completed")
                        .eq("user_id", authUser.id)
                        .order("created_at", { ascending: false });

                if (assignmentError) {
                    console.error("Could not load cloud assignments:", assignmentError);
                } else {
                    appData.assignments = (cloudAssignments || []).map(item => ({
                        id: item.id,
                        title: item.title,
                        subject: item.subject,
                        dueDate: item.due_date,
                        due: item.due_date
                            ? new Date(item.due_date + "T00:00:00").toLocaleDateString(
                                "en-NZ",
                                { day: "numeric", month: "short", year: "numeric" }
                            )
                            : "",
                        importance: item.importance,
                        completed: item.completed,
                        cloud: true
                    }));
                    rebuildAssignmentCalendarEvents();
                    await loadSupabaseCalendarEvents();
                    saveData();
                    if (currentUser?.id === user.id) {
                        renderPage(currentPage);
                    }
                }
            } catch (assignmentLoadError) {
                console.error("Could not load cloud assignments:", assignmentLoadError);
            }
        })();
    } catch (error) {
        console.error("Could not restore Supabase session:", error);
        showToast("We couldn't finish signing you in. Please try again.");
    }
}


function showAuth() {
    $("#authScreen")?.classList.remove("hidden");
    $("#app")?.classList.add("hidden");
}


function showApplication() {
    $("#authScreen")?.classList.add("hidden");
    $("#app")?.classList.remove("hidden");

    updateTopbar();

    navigateTo(currentPage);
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
    $$(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            const page = item.dataset.page;

            if (!page) {
                return;
            }

            navigateTo(page);
        });
    });
}


function navigateTo(page) {
    currentPage = page;

    $$(".nav-item").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.page === page
        );
    });

    renderPage(page);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function renderPage(page) {
    const container = $("#pageContent");

    if (!container) {
        return;
    }

    switch (page) {
        case "home":
            renderHome(container);
            break;

        case "calendar":
            renderCalendar(container);
            break;

        case "assignments":
            renderAssignments(container);
            break;

        case "tutors":
            renderTutors(container);
            break;

        case "points":
            renderPeerPoints(container);
            break;

        case "study":
            renderStudy(container);
            break;

        case "profile":
            renderProfile(container);
            break;

        case "settings":
          
         renderSettings(container);
            break;

        default:
            renderHome(container);
    }

    attachPageEvents();
}


/* =========================================================
   TOPBAR
   ========================================================= */

function setupTopbar() {
    $("#profileTop")?.addEventListener(
        "click",
        () => navigateTo("profile")
    );

    $("#notificationBtn")?.addEventListener(
        "click",
        showNotifications
    );
}


function updateTopbar() {
    const user = getCurrentUserFromData();

    if (!user) {
        return;
    }

    const name = $("#topName");
    const avatar = $("#topAvatar");

    if (name) {
        name.textContent = user.name.split(" ")[0];
    }

    if (avatar) {
        avatar.textContent = getInitials(user.name);
    }

    const dot = $("#notifDot");

    if (dot) {
        const notifications = appData.notificationsList || [];
        const hasUnread = notifications.some(notification =>
            (notification.userId === user.id ||
                (!notification.userId && user.id === "demo-maya")) &&
            !notification.read
        );

        dot.style.display =
            appData.settings.notifications && hasUnread
                ? "block"
                : "none";
    }
}


function showNotifications() {
    const incomplete = appData.assignments.filter(
        assignment => !assignment.completed
    );

    if (!appData.settings.notifications) {
        showToast("Notifications are turned off.");
        return;
    }

    if (incomplete.length === 0) {
        showToast("You're all caught up ✦");
        return;
    }

    showToast(
        `${incomplete.length} assignment${
            incomplete.length === 1 ? "" : "s"
        } still need attention.`
    );
}


/* =========================================================
   HOME PAGE
   ========================================================= */

function renderQuickGuide() {
    const dismissed = !!appData.settings?.quickGuideDismissed;
    if (dismissed) {
        return `
            <div class="quick-guide-reopen">
                <button type="button" class="text-button" data-action="show-quick-guide">
                    <span aria-hidden="true">✦</span> Show the quick guide
                </button>
            </div>
        `;
    }

    return `
        <section class="quick-guide card" aria-label="Peer Hub quick guide">
            <div class="quick-guide-heading">
                <div>
                    <p class="eyebrow">FIRST TIME HERE?</p>
                    <h2>Your mini guide</h2>
                    <p class="quick-guide-intro">The useful bits, without a 40-page instruction manual.</p>
                </div>
                <button type="button" class="icon-button quick-guide-close" data-action="dismiss-quick-guide" aria-label="Close quick guide" title="Close guide">×</button>
            </div>
            <div class="quick-guide-grid">
                <div class="quick-guide-item"><span class="quick-guide-icon" aria-hidden="true">🔔</span><div><strong>Notifications</strong><p>Tap the bell in the top bar to read updates. Delete old ones with the Delete button.</p></div></div>
                <div class="quick-guide-item"><span class="quick-guide-icon" aria-hidden="true">🌿</span><div><strong>Study full screen</strong><p>Open Study, choose an environment, then start Focus Mode for a distraction-free screen and timer.</p></div></div>
                <div class="quick-guide-item"><span class="quick-guide-icon" aria-hidden="true">📅</span><div><strong>Calendar</strong><p>See upcoming plans and add events so your study sessions and deadlines stay organised.</p></div></div>
                <div class="quick-guide-item"><span class="quick-guide-icon" aria-hidden="true">✓</span><div><strong>Assignments</strong><p>Add tasks, set due dates, and mark work complete. Due dates can show on your calendar.</p></div></div>
                <div class="quick-guide-item"><span class="quick-guide-icon" aria-hidden="true">🤝</span><div><strong>Find a Peer</strong><p>Browse peer tutors, check their subjects and availability, and request a session.</p></div></div>
                <div class="quick-guide-item"><span class="quick-guide-icon" aria-hidden="true">✦</span><div><strong>Peer Points</strong><p>Track points, levels, and the leaderboard as you use connected study features.</p></div></div>
            </div>
        </section>
    `;
}


function renderHome(container) {
    const user = getCurrentUserFromData();

    const assignments = appData.assignments.filter(
        assignment => !assignment.completed
    );

    const progress =
        user && user.points
            ? Math.min((user.points / 300) * 100, 100)
            : 0;

    container.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">WELCOME BACK</p>
                <h1>Good to see you, ${escapeHTML(
                    user?.name?.split(" ")[0] || "Student"
                )}.</h1>
                <p>Let's make today a little more productive.</p>
            </div>
        </div>

        <section class="home-hero card">
            <div class="home-hero-content">
                <p class="eyebrow">YOUR PEER HUB</p>

                <h2>
                    Learn together.<br>
                    Grow together.
                </h2>

                <p>
                    Find a peer, organise your work,
                    or settle into a focused study session.
                </p>

                <button
                    type="button"
                    class="primary-button"
                    data-action="find-peer"
                >
                    Find a Peer
                </button>
            </div>

            <div
                class="home-hero-dragon"
                aria-hidden="true"
            >
                🐉
            </div>
        </section>

        ${renderQuickGuide()}

        <section class="stats-grid">

            <div class="stat-card card">
                <div class="stat-icon">✦</div>
                <div>
                    <div class="stat-number">
                        ${user?.points || 0}
                    </div>
                    <div class="stat-label">
                        Peer Points
                    </div>
                </div>
            </div>

            <div class="stat-card card">
                <div class="stat-icon">✓</div>
                <div>
                    <div class="stat-number">
                        ${assignments.length}
                    </div>
                    <div class="stat-label">
                        Tasks Remaining
                    </div>
                </div>
            </div>

            <div class="stat-card card">
                <div class="stat-icon">◷</div>
                <div>
                    <div class="stat-number">
                        ${user?.sessions || 0}
                    </div>
                    <div class="stat-label">
                        Study Sessions
                    </div>
                </div>
            </div>

            <div class="stat-card card">
                <div class="stat-icon">↗</div>
                <div>
                    <div class="stat-number">
                        ${Math.round(progress)}%
                    </div>
                    <div class="stat-label">
                        Progress
                    </div>
                </div>
            </div>

        </section>

        <section class="home-grid">

            <div class="home-left">

                ${renderRoranCard()}

                <div class="card card-padding">

                    <div class="card-header">
                        <div>
                            <p class="eyebrow">UP NEXT</p>
                            <h3>Your assignments</h3>
                        </div>

                        <button
                            type="button"
                            class="text-button"
                            data-action="assignments"
                        >
                            View all
                        </button>
                    </div>

                    ${renderAssignmentPreview(assignments)}

                </div>

            </div>

            <div class="home-right">

                <div class="card card-padding">

                    <div class="card-header">
                        <div>
                            <p class="eyebrow">NEED HELP?</p>
                            <h3>Find a peer</h3>
                        </div>
                    </div>

                    <p class="card-description">
                        Search for someone who can help
                        with the subject you're working on.
                    </p>

                    <button
                        type="button"
                        class="primary-button"
                        data-action="find-peer"
                    >
                        Browse Tutors
                    </button>

                </div>

                <div class="card card-padding">

                    <div class="card-header">
                        <div>
                            <p class="eyebrow">FOCUS</p>
                            <h3>Study smarter</h3>
                        </div>
                    </div>

                    <p class="card-description">
                        Start a focused study session
                        with Roran keeping watch.
                    </p>

                    <button
                        type="button"
                        class="secondary-button focus-launch"
                        data-action="study"
                    >
                        Start Studying
                    </button>

                </div>

            </div>

        </section>
    `;
}


function renderAssignmentPreview(assignments) {
    if (assignments.length === 0) {
        return `
            <div class="empty-state">
                <div>✦</div>
                <p>You're all caught up.</p>
            </div>
        `;
    }

    return `
        <div class="assignment-list">
            ${assignments
                .slice(0, 3)
                .map(renderAssignmentRow)
                .join("")}
        </div>
    `;
}


function renderRoranCard() {
    return `
        <div class="card roran-card">

            <div class="roran-main">

                <div class="roran-art" aria-hidden="true">
                    🐉
                </div>

                <div class="roran-content">

                    <p class="eyebrow">
                        RORAN SAYS
                    </p>

                    <blockquote class="roran-quote">
                        “Small progress is still progress.
                        Now stop staring at the screen
                        and do the thing.”
                    </blockquote>

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar(container) {
    const month = selectedCalendarDate.getMonth();
    const year = selectedCalendarDate.getFullYear();
    const monthName = selectedCalendarDate.toLocaleDateString(
        "en-NZ",
        {
            month: "long",
            year: "numeric"
        }
    );

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startingDay = firstDay.getDay();

    if (startingDay === 0) {
        startingDay = 7;
    }

    const previousMonthDays = new Date(
        year,
        month,
        0
    ).getDate();

    let daysHTML = "";

    for (let i = startingDay - 1; i > 0; i--) {
        const date = previousMonthDays - i + 1;

        daysHTML += `
            <button
                type="button"
                class="calendar-day other-month"
                disabled
            >
                <span class="day-number">${date}</span>
            </button>
        `;
    }

    for (let date = 1; date <= lastDay.getDate(); date++) {
        const dateObject = new Date(
            year,
            month,
            date
        );

        const today = isSameDate(
            dateObject,
            new Date()
        );

        const selected = isSameDate(
            dateObject,
            selectedCalendarDate
        );

        const events = getEventsForDate(dateObject);

        daysHTML += `
            <button
                type="button"
                class="calendar-day
                    ${today ? "today" : ""}
                    ${selected ? "selected" : ""}"
                data-calendar-date="${formatDateKey(
                    dateObject
                )}"
            >

                <span class="day-number">
                    ${date}
                </span>

                <span class="day-events">
                    ${events
                        .slice(0, 3)
                        .map(
                            () =>
                                `<span class="calendar-event-dot"></span>`
                        )
                        .join("")}
                </span>

            </button>
        `;
    }

    const totalCells =
        startingDay - 1 + lastDay.getDate();

    const remainingCells =
        Math.ceil(totalCells / 7) * 7 - totalCells;

    for (let i = 1; i <= remainingCells; i++) {
        daysHTML += `
            <button
                type="button"
                class="calendar-day other-month"
                disabled
            >
                <span class="day-number">${i}</span>
            </button>
        `;
    }

    container.innerHTML = `
        <div class="page-header">

            <div>
                <p class="eyebrow">PLAN AHEAD</p>
                <h1>Calendar</h1>
                <p>Keep track of your study life.</p>
            </div>

        </div>

        <div class="calendar-toolbar">

            <div class="calendar-nav">

                <button
                    type="button"
                    class="icon-button"
                    data-calendar-action="previous"
                    aria-label="Previous month"
                >
                    ‹
                </button>

                <h2>${monthName}</h2>

                <button
                    type="button"
                    class="icon-button"
                    data-calendar-action="next"
                    aria-label="Next month"
                >
                    ›
                </button>

            </div>

            <div class="calendar-toolbar-actions">
                <button
                    type="button"
                    class="secondary-button"
                    data-calendar-action="add-event"
                >
                    + Add Event
                </button>

                <button
                    type="button"
                    class="calendar-today secondary-button"
                    data-calendar-action="today"
                >
                    Today
                </button>
            </div>

        </div>

        <div class="calendar-layout">

            <div class="card calendar-card">

                <div class="calendar-grid weekdays">

                    ${[
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"
                    ]
                        .map(
                            day =>
                                `<div class="calendar-weekday">${day}</div>`
                        )
                        .join("")}

                </div>

                <div class="calendar-grid">
                    ${daysHTML}
                </div>

            </div>

            <div
                id="selectedDayCard"
                class="card selected-day-card"
            >
                ${renderSelectedDay()}
            </div>

        </div>
    `;
}


function renderSelectedDay() {
    const date = selectedCalendarDate;
    const events = getEventsForDate(date);
    const readableDate = date.toLocaleDateString("en-NZ", {
        weekday: "long", day: "numeric", month: "long"
    });

    const eventRows = events.map(event => `
        <div class="day-item">
            <strong>${escapeHTML(event.title)}</strong>
            <span>
                ${escapeHTML(event.type || "Event")}
                ${event.time ? " · " + escapeHTML(formatEventTime(event.time)) : ""}
                ${event.location ? " · 📍 " + escapeHTML(event.location) : ""}
            </span>
            ${event.source === "event" ? `
                <div class="day-item-actions">
                    <button type="button" class="secondary-button" data-action="edit-calendar-event" data-id="${escapeHTML(String(event.id))}">Edit</button>
                    <button type="button" class="secondary-button" data-action="delete-calendar-event" data-id="${escapeHTML(String(event.id))}">Delete</button>
                </div>
            ` : ""}
        </div>
    `).join("");

    return `
        <p class="eyebrow">SELECTED DAY</p>
        <h3 class="selected-day-date">${readableDate}</h3>
        ${events.length ? eventRows : `
            <div class="empty-state"><div>✦</div><p>No events planned.</p></div>
        `}
    `;
}


async function deleteCalendarEvent(id) {
    const event = (appData.calendarEvents || []).find(item =>
        String(item.id) === String(id) && item.source === "event"
    );
    if (!event) {
        showToast("That personal calendar event could not be found.");
        return;
    }
    if (!window.confirm('Delete "' + event.title + '" from your calendar?')) return;

    const authId = getSupabaseAuthId();
    if (supabaseClient && authId) {
        try {
            const { data, error } = await supabaseClient
                .from("calendar_events")
                .delete()
                .eq("user_id", authId)
                .eq("event_id", String(event.id))
                .select("event_id");
            if (error) throw error;
            if (!data || !data.length) throw new Error("The database did not confirm the deletion.");
        } catch (error) {
            console.error("Could not delete calendar event:", error);
            showToast("Event was not deleted from the cloud. Please try again.");
            return;
        }
    }

    appData.calendarEvents = (appData.calendarEvents || []).filter(item =>
        !(String(item.id) === String(id) && item.source === "event")
    );
    saveUserCalendarEvents();
    saveData();
    closeModal();
    showToast("Calendar event deleted.");
    renderPage("calendar");
}

function openEditCalendarEventModal(id) {
    const event = (appData.calendarEvents || []).find(item =>
        String(item.id) === String(id) && item.source === "event"
    );
    if (!event) {
        showToast("That personal calendar event could not be found.");
        return;
    }

    openModal(`
        <div class="card-header">
            <div><p class="eyebrow">PLAN AHEAD</p><h2>Edit Calendar Event</h2></div>
            <button type="button" class="icon-button" data-action="close-modal" aria-label="Close">×</button>
        </div>
        <form id="calendarEventForm" class="modal-form">
            <div class="form-group">
                <label for="newEventTitle">Event</label>
                <input id="newEventTitle" type="text" maxlength="160" required value="${escapeHTML(event.title)}">
            </div>
            <div class="form-group">
                <label for="newEventDate">Date</label>
                <input id="newEventDate" type="date" required value="${escapeHTML(event.date)}">
            </div>
            <div class="form-group">
                <label for="newEventTime">Time <span>(optional)</span></label>
                <input id="newEventTime" type="time" value="${escapeHTML(event.time || "")}">
            </div>
            <div class="form-group">
                <label for="newEventType">Type</label>
                <select id="newEventType">
                    ${["Event", "School", "Study", "Personal"].map(type =>
                        `<option value="${type}" ${(event.type || "Event") === type ? "selected" : ""}>${type}</option>`
                    ).join("")}
                </select>
            </div>
            <div class="modal-actions">
                <button type="button" class="secondary-button" data-action="close-modal">Cancel</button>
                <button type="submit" class="primary-button">Save Changes</button>
            </div>
        </form>
    `);

    $("#calendarEventForm")?.addEventListener("submit", async submitEvent => {
        submitEvent.preventDefault();
        const title = $("#newEventTitle")?.value.trim();
        const date = $("#newEventDate")?.value;
        const time = $("#newEventTime")?.value || "";
        const type = $("#newEventType")?.value || "Event";
        if (!title || !date) return;

        const index = (appData.calendarEvents || []).findIndex(item =>
            String(item.id) === String(event.id) && item.source === "event"
        );
        if (index < 0) {
            showToast("This event is no longer in your calendar.");
            closeModal();
            return;
        }

        appData.calendarEvents[index] = {
            ...appData.calendarEvents[index], title, date, time, type
        };
        saveUserCalendarEvents();
        saveData();

        const authId = getSupabaseAuthId();
        if (supabaseClient && authId) {
            try {
                const { error } = await supabaseClient
                    .from("calendar_events")
                    .upsert({
                        user_id: authId,
                        event_id: String(event.id),
                        title: String(title).slice(0, 160),
                        event_date: date,
                        event_time: time,
                        event_type: type,
                        location: String(event.location || ""),
                        updated_at: new Date().toISOString()
                    }, { onConflict: "user_id,event_id" });
                if (error) throw error;
                showToast("Calendar event updated and synced ✦");
            } catch (error) {
                console.error("Could not update calendar event:", error);
                showToast("Changes saved on this device, but cloud sync failed. Please check your connection.");
            }
        } else {
            showToast("Calendar event updated ✦");
        }

        const parts = date.split("-").map(Number);
        selectedCalendarDate = new Date(parts[0], parts[1] - 1, parts[2]);
        closeModal();
        renderPage("calendar");
    });
}


function openAddCalendarEventModal() {
    const defaultDate = formatDateKey(selectedCalendarDate);

    openModal(`
        <div class="card-header">
            <div>
                <p class="eyebrow">PLAN AHEAD</p>
                <h2>Add Calendar Event</h2>
            </div>
            <button type="button" class="icon-button" data-action="close-modal" aria-label="Close">×</button>
        </div>

        <form id="calendarEventForm" class="modal-form">
            <div class="form-group">
                <label for="newEventTitle">Event</label>
                <input id="newEventTitle" type="text" required placeholder="e.g. Cultural Evening">
            </div>

            <div class="form-group">
                <label for="newEventDate">Date</label>
                <input id="newEventDate" type="date" value="${defaultDate}" required>
            </div>

            <div class="form-group">
                <label for="newEventTime">Time <span>(optional)</span></label>
                <input id="newEventTime" type="time">
            </div>

            <div class="form-group">
                <label for="newEventType">Type</label>
                <select id="newEventType">
                    <option value="Event">Event</option>
                    <option value="School">School</option>
                    <option value="Study">Study</option>
                    <option value="Personal">Personal</option>
                </select>
            </div>

            <div class="modal-actions">
                <button type="button" class="secondary-button" data-action="close-modal">Cancel</button>
                <button type="submit" class="primary-button">Add Event</button>
            </div>
        </form>
    `);

    $("#calendarEventForm")?.addEventListener("submit", event => {
        event.preventDefault();

        const title = $("#newEventTitle")?.value.trim();
        const date = $("#newEventDate")?.value;
        const time = $("#newEventTime")?.value || "";
        const type = $("#newEventType")?.value || "Event";

        if (!title || !date) return;

        appData.calendarEvents.push({
            id: "event-" + Date.now(),
            title,
            date,
            time,
            type,
            source: "event"
        });

        saveUserCalendarEvents();
        saveData();
        void syncSupabaseCalendarEvents();
        closeModal();

        const parts = date.split("-").map(Number);
        selectedCalendarDate = new Date(parts[0], parts[1] - 1, parts[2]);

        showToast("Event added to your calendar ✦");
        renderPage("calendar");
    });
}


function formatEventTime(time) {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;

    const date = new Date(2000, 0, 1, hours, minutes);
    return date.toLocaleTimeString("en-NZ", {
        hour: "numeric",
        minute: "2-digit"
    });
}


function getEventsForDate(date) {
    const key = formatDateKey(date);

    return appData.calendarEvents.filter(
        event => event.date === key
    );
}


function formatDateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}


function isSameDate(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}


/* =========================================================
   ASSIGNMENTS
   ========================================================= */

function renderAssignments(container) {
    const completed = appData.assignments.filter(
        assignment => assignment.completed
    );

    const incomplete = appData.assignments.filter(
        assignment => !assignment.completed
    );

    appData.settings = appData.settings || {};
    const hideCompleted = appData.settings.hideCompletedAssignments !== false;

    container.innerHTML = `
        <div class="page-header">

            <div>
                <p class="eyebrow">STAY ON TRACK</p>
                <h1>Assignments</h1>
                <p>
                    Keep your schoolwork organised
                    without turning your life into a spreadsheet.
                </p>
            </div>

            <button
                type="button"
                class="primary-button"
                data-action="add-assignment"
            >
                + Add Assignment
            </button>

        </div>

        <div class="card card-padding">

            <div class="card-header">
                <div>
                    <p class="eyebrow">TO DO</p>
                    <h3>${incomplete.length} remaining</h3>
                </div>
            </div>

            ${
                incomplete.length
                    ? `
                        <div class="assignment-list">
                            ${incomplete
                                .map(renderAssignmentRow)
                                .join("")}
                        </div>
                    `
                    : `
                        <div class="empty-state">
                            <div>✓</div>
                            <p>Nothing left to do. Suspiciously productive.</p>
                        </div>
                    `
            }

        </div>

        <div class="card card-padding">

            <div class="card-header">
                <div>
                    <p class="eyebrow">COMPLETED</p>
                    <h3>${completed.length} finished</h3>
                </div>
                <button
                    type="button"
                    class="secondary-button"
                    data-action="toggle-completed-assignments"
                    aria-expanded="${!hideCompleted}"
                >${hideCompleted ? "Show completed" : "Hide completed"}</button>
            </div>

            ${
                hideCompleted
                    ? ""
                    : completed.length
                        ? `
                            <div class="assignment-list">
                                ${completed
                                    .map(renderAssignmentRow)
                                    .join("")}
                            </div>
                        `
                        : `
                            <div class="empty-state">
                                <p>No completed assignments yet.</p>
                            </div>
                        `
            }

        </div>
    `;
}


function renderAssignmentRow(assignment) {
    return `
        <div
            class="assignment-row
                ${assignment.completed ? "completed" : ""}"
            data-assignment-id="${assignment.id}"
        >

            <button
                type="button"
                class="assignment-check"
                data-action="toggle-assignment"
                data-id="${assignment.id}"
                aria-label="${
                    assignment.completed
                        ? "Mark incomplete"
                        : "Mark complete"
                }"
            >
                ${assignment.completed ? "✓" : ""}
            </button>

            <div class="assignment-info">

                <strong class="assignment-title">
                    ${escapeHTML(assignment.title)}
                </strong>

                <span class="assignment-meta">
                    ${escapeHTML(assignment.subject)}
                    ·
                    ${escapeHTML(assignment.due)}
                </span>

            </div>

            <span
                class="importance ${escapeHTML(
                    assignment.importance
                )}"
            >
                ${escapeHTML(assignment.importance)}
            </span>

        </div>
    `;
}


function toggleAssignment(id) {
    const assignment = appData.assignments.find(
        item => String(item.id) === String(id)
    );

    if (!assignment) {
        return;
    }

    const previousCompleted = assignment.completed;
    assignment.completed = !assignment.completed;

    if (assignment.cloud && supabaseClient) {
        supabaseClient
            .from("assignments")
            .update({ completed: assignment.completed })
            .eq("id", assignment.id)
            .then(({ error }) => {
                if (error) {
                    console.error("Could not update cloud assignment:", error);
                    assignment.completed = previousCompleted;
                    saveData();
                    renderPage(currentPage);
                    showToast("Couldn't save that change. Please try again.");
                }
            });
    }

    if (assignment.completed) {
        updateCurrentUser({
            points:
                (getCurrentUserFromData()?.points || 0) + 10
        });

        showToast("Assignment completed! +10 points ✦");
    } else {
        showToast("Assignment moved back to your list.");
    }

    saveData();
    updateTopbar();
    renderPage(currentPage);
}


/* =========================================================
   TUTORS / FIND A PEER
   ========================================================= */

function renderTutors(container) {
 const user=getCurrentUserFromData();appData.bookings=appData.bookings||[];const own=appData.tutors.find(t=>String(t.userId)===String(user?.id));const subjects=["English","Mathematics","Science","French","Te Reo Māori","History","Social Studies","Physics","Chemistry","Biology","PE","Digital Technology"];
 container.innerHTML=`<div class="page-header"><div><p class="eyebrow">LEARN TOGETHER</p><h1>Find a Peer</h1><p>Find help, offer your strengths, and arrange a specific time to study.</p></div><button class="primary-button" type="button" data-action="edit-tutor-profile">${own?"Edit tutor profile":"Become a Peer"}</button></div><section class="feature-panel"><p class="eyebrow">YOUR TUTOR PROFILE</p><h2>${own?"You're listed as a tutor":"Share what you're good at"}</h2><p>${own?"Your subjects and available times are visible to other students.":"Create a profile so classmates can find you by subject and request a session."}</p><button class="secondary-button" type="button" data-action="edit-tutor-profile">${own?"Update profile":"Create profile"}</button></section><div class="filter-bar"><input type="search" id="tutorSearch" placeholder="Search by name or subject..." aria-label="Search tutors"><select id="subjectFilter"><option value="">All subjects</option>${subjects.map(s=>`<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join("")}</select></div><div id="tutorGrid" class="tutor-grid">${appData.tutors.filter(t=>String(t.userId||"")!==String(user?.id)).map(renderTutorCard).join("")||'<p class="empty-state">No other tutors yet. Create a tutor profile to get started.</p>'}</div><section class="feature-panel"><p class="eyebrow">YOUR SESSIONS</p><h2>Booking requests</h2><p class="muted">Requests remain pending until the tutor accepts or declines.</p><div class="booking-list">${appData.bookings.filter(b=>b.studentId===user?.id||b.tutorUserId===user?.id).slice().reverse().map(renderBookingRow).join("")||'<p class="muted">No sessions yet.</p>'}</div></section>`;
 $("#tutorSearch")?.addEventListener("input",filterTutors);$("#subjectFilter")?.addEventListener("change",filterTutors);
}

async function loadSupabaseTutors() {
    if (!supabaseClient || !currentUser || !String(currentUser.id || "").startsWith("google-")) return;
    const { data: tutorRows, error: tutorError } = await supabaseClient
        .from("tutor_profiles")
        .select("user_id, bio, subjects, availability, active")
        .eq("active", true);
    if (tutorError) {
        console.error("Could not load tutor profiles:", tutorError);
        return;
    }
    if (!tutorRows?.length) {
        appData.tutors = (appData.tutors || []).filter(t => !t.cloud);
        saveData();
        return;
    }
    const { data: profileRows, error: profileError } = await supabaseClient
        .from("profiles")
        .select("id, full_name, year_level, class_name")
        .in("id", tutorRows.map(t => t.user_id));
    if (profileError) {
        console.error("Could not load tutor profile details:", profileError);
        return;
    }
    const profileMap = new Map((profileRows || []).map(p => [p.id, p]));
    const cloudTutors = tutorRows.map(t => {
        const p = profileMap.get(t.user_id) || {};
        const name = p.full_name || "Student tutor";
        return {
            id: "cloud-" + t.user_id,
            userId: "google-" + t.user_id,
            name,
            year: p.year_level || "—",
            className: p.class_name || "",
            subjects: Array.isArray(t.subjects) ? t.subjects : [],
            availability: Array.isArray(t.availability) && t.availability.length ? t.availability.join(" · ") : "Availability by arrangement",
            initials: getInitials(name),
            bio: t.bio || "",
            cloud: true
        };
    });
    appData.tutors = [...(appData.tutors || []).filter(t => !t.cloud), ...cloudTutors];
    saveData();
}

function openTutorProfileEditor() {
    const user = getCurrentUserFromData();
    if (!user) return;
    const existing = appData.tutors.find(t => String(t.userId) === String(user.id));
    const subjects = ["English","Mathematics","Science","French","Te Reo Māori","History","Social Studies","Physics","Chemistry","Biology","PE","Digital Technology"];
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","After school","Lunchtime","Weekends"];
    openModal(`
        <div class="card-header">
            <div><p class="eyebrow">BECOME A PEER</p><h2>${existing ? "Edit your tutor profile" : "Create your tutor profile"}</h2></div>
            <button type="button" class="icon-button" id="closeTutorProfileEditor" aria-label="Close">×</button>
        </div>
        <form id="tutorProfileForm" class="modal-form">
            <div class="form-group"><label for="tutorBio">A little about how you can help</label><textarea id="tutorBio" name="bio" rows="3" maxlength="400" placeholder="E.g. I can help explain algebra step by step.">${escapeHTML(existing?.bio || user.bio || "")}</textarea></div>
            <fieldset class="form-group"><legend>Subjects you can help with</legend><div class="form-check-grid">${subjects.map(subject => `<label class="checkbox-label"><input type="checkbox" name="tutorSubjects" value="${escapeHTML(subject)}" ${(existing?.subjects || user.subjects || []).includes(subject) ? "checked" : ""}> ${escapeHTML(subject)}</label>`).join("")}</div></fieldset>
            <fieldset class="form-group"><legend>When you're usually available</legend><div class="form-check-grid">${days.map(day => `<label class="checkbox-label"><input type="checkbox" name="tutorAvailability" value="${escapeHTML(day)}" ${(existing?.availability || user.availability || []).includes(day) ? "checked" : ""}> ${escapeHTML(day)}</label>`).join("")}</div></fieldset>
            <p id="tutorProfileMessage" class="muted" role="status"></p>
            <div class="modal-actions"><button type="button" class="secondary-button" id="cancelTutorProfileEditor">Cancel</button><button type="submit" class="primary-button">Save tutor profile</button></div>
        </form>
    `);
    $("#closeTutorProfileEditor")?.addEventListener("click", closeModal);
    $("#cancelTutorProfileEditor")?.addEventListener("click", closeModal);
    $("#tutorProfileForm")?.addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const selectedSubjects = $('input[name="tutorSubjects"]:checked', form).map(input => input.value);
        const selectedAvailability = $('input[name="tutorAvailability"]:checked', form).map(input => input.value);
        const bio = $("#tutorBio", form)?.value.trim() || "";
        const message = $("#tutorProfileMessage", form);
        if (!selectedSubjects.length) {
            if (message) message.textContent = "Choose at least one subject before saving.";
            return;
        }
        const submit = $('button[type="submit"]', form);
        if (submit) { submit.disabled = true; submit.textContent = "Saving…"; }
        try {
            if (!supabaseClient) {
                throw new Error("Supabase did not load on this page. Your profile was not saved to the database. Refresh the page and try again.");
            }
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            if (sessionError) throw sessionError;
            const authUser = sessionData?.session?.user;
            if (!authUser) {
                throw new Error("No active Google sign-in session was found. Sign out, then sign in again with your St Oran's school Google account.");
            }
            const authEmail = String(authUser.email || "").toLowerCase();
            if (!authEmail.endsWith("@storans.school.nz")) {
                throw new Error("The signed-in email (" + authEmail + ") does not match the @storans.school.nz domain allowed by the current database policies. The database policy must be updated to allow your school's actual account domain.");
            }
            const { error } = await supabaseClient.from("tutor_profiles").upsert({
                user_id: authUser.id,
                bio,
                subjects: selectedSubjects,
                availability: selectedAvailability,
                active: true,
                updated_at: new Date().toISOString()
            }, { onConflict: "user_id" });
            if (error) throw error;
            const { data: savedRow, error: verifyError } = await supabaseClient
                .from("tutor_profiles")
                .select("user_id")
                .eq("user_id", authUser.id)
                .maybeSingle();
            if (verifyError) throw verifyError;
            if (!savedRow) throw new Error("Supabase accepted the save request but the row could not be read back. Check the tutor_profiles Row Level Security policies.");
            updateCurrentUser({ role: "tutor", subjects: selectedSubjects, availability: selectedAvailability, bio });
            await loadSupabaseTutors();
            closeModal();
            showToast("Your tutor profile has been saved.");
            renderPage("tutors");
        } catch (error) {
            console.error("Could not save tutor profile:", error);
            const detail = error?.message || String(error);
            if (message) message.textContent = "Database save failed: " + detail;
            showToast("Tutor profile wasn't saved. See the message in the form.");

            if (submit) { submit.disabled = false; submit.textContent = "Save tutor profile"; }
        }
    });
}
function renderTutorCard(t){return `<article class="tutor-card card" data-tutor-name="${escapeHTML(String(t.name||"").toLowerCase())}" data-tutor-subjects="${escapeHTML((t.subjects||[]).join(" ").toLowerCase())}"><div class="tutor-avatar">${escapeHTML(t.initials||getInitials(t.name))}</div><div class="tutor-year">Year ${escapeHTML(String(t.year||"—"))}</div><h3>${escapeHTML(t.name||"Student tutor")}</h3><div class="tutor-subjects">${(t.subjects||[]).map(s=>`<span class="subject-tag">${escapeHTML(s)}</span>`).join("")}</div><p>${escapeHTML(t.bio||"Peer tutor")}</p><div class="tutor-availability">◷ ${escapeHTML(t.availability||"Availability by arrangement")}</div><div class="tutor-buttons"><button type="button" class="primary-button" data-action="book-tutor" data-id="${escapeHTML(String(t.id))}">Choose a time</button><button type="button" class="secondary-button" data-action="view-tutor" data-id="${escapeHTML(String(t.id))}">View</button></div></article>`;}
function renderBookingRow(b){const user=getCurrentUserFromData(),isTutor=b.tutorUserId===user?.id,status=b.status||"pending",demoResponse=!b.tutorUserId&&b.studentId===user?.id;return `<article class="booking-row"><div><strong>${escapeHTML(isTutor?b.studentName:b.tutorName)}</strong><p>${escapeHTML(b.subject)} · ${escapeHTML(b.date)} at ${escapeHTML(b.time)}</p><p class="booking-location">📍 ${escapeHTML(b.location||"Not specified")}</p><span class="booking-status status-${escapeHTML(status)}">${escapeHTML(status)}</span></div>${(isTutor||demoResponse)&&status==="pending"?`<div class="booking-actions"><button type="button" class="primary-button" data-action="update-booking" data-id="${escapeHTML(String(b.id))}" data-status="accepted">${demoResponse?"Simulate accept":"Accept"}</button><button type="button" class="secondary-button" data-action="update-booking" data-id="${escapeHTML(String(b.id))}" data-status="declined">${demoResponse?"Simulate decline":"Decline"}</button></div>`:""}</article>`;}

function filterTutors(){const q=($("#tutorSearch")?.value||"").trim().toLowerCase(),s=($("#subjectFilter")?.value||"").trim().toLowerCase();$$(".tutor-card").forEach(c=>{const n=c.dataset.tutorName||"",ss=c.dataset.tutorSubjects||"";c.style.display=(!q||n.includes(q)||ss.includes(q))&&(!s||ss.includes(s))?"":"none";});}
/* =========================================================
   STUDY PAGE
   ========================================================= */
function getSpotifyEmbedUrl(spotifyUrl) {
    try {
        const url = new URL(spotifyUrl);
        const parts = url.pathname.split("/").filter(Boolean);

        const playlistIndex = parts.indexOf("playlist");

        if (playlistIndex === -1 || !parts[playlistIndex + 1]) {
            return "";
        }

        const playlistId = parts[playlistIndex + 1];

        return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
    } catch (error) {
        return "";
    }
}
function getStudyPlaylists() {
    return [
        {
            id: "rain",
            icon: "🌧️",
            title: "Rainy Focus",
            description: "Rain • Lo-fi • Ambient",
            spotify:
                "https://open.spotify.com/playlist/37i9dQZF1DX8ymr6UES7vc?si=zHMR9PgqShChIsgGJ8enOA",
            theme: "rain",
            fullscreenBackground: "rain",
            sound: "rain"
        },
        {
            id: "cafe",
            icon: "☕",
            title: "Study Café",
            description: "Café • Lo-fi • Soft jazz",
            spotify:
                "https://open.spotify.com/playlist/37i9dQZF1DX9RwfGbeGQwP?si=2W5EvODHQ0iJW_w6YKC8xQ",
            theme: "cafe",
            fullscreenBackground: "cafe",
            sound: "cafe"
        },
        {
            id: "forest",
            icon: "🌲",
            title: "Forest Study",
            description: "Nature • Piano • Ambient",
            spotify:
                "https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8?si=ZZ_WvJL-RCOaSCwiIrQi6Q",
            theme: "forest",
            fullscreenBackground: "forest",
            sound: "forest"
        },
        {
            id: "academia",
            icon: "📚",
            title: "Dark Academia",
            description: "Classical • Piano • Orchestral",
            spotify:
                "https://open.spotify.com/playlist/3MelsVnZV5g03wyiJsybHk?si=EI-1KuwXSjyczW84kfPppQ",
            theme: "academia",
            fullscreenBackground: "academia",
            sound: "academia"
        },
        {
            id: "midnight",
            icon: "🌙",
            title: "Midnight Focus",
            description: "Dreamy • Ambient • Soft instrumental",
            spotify:
                "https://open.spotify.com/playlist/6asedDPn710ueu5byDKXul?si=5LGw1r7FRz63_VfBKA4X4Q",
            theme: "midnight",
            fullscreenBackground: "night",
            sound: "midnight"
        },
        {
            id: "lyrics",
            icon: "🧠",
            title: "No Lyrics",
            description: "Instrumental • Minimal • Deep focus",
            spotify:
                "https://open.spotify.com/playlist/37i9dQZF1DWVceT0UosQME?si=AEmZ_Pw7Ru-XFpuD4_YgvQ",
            theme: "lyrics",
            fullscreenBackground: "lyrics",
            sound: "minimal"
        }
    ];
}


function renderStudy(container) {
    const studyPlaylists = getStudyPlaylists();

    container.innerHTML = `
        <div class="page-header">

            <div>
                <p class="eyebrow">
                    FOCUS & PRODUCTIVITY
                </p>

                <h1>Study</h1>

                <p>
                    Choose your atmosphere and settle in.
                </p>
            </div>

        </div>
<div class="timer-settings">
    <div class="timer-settings-label">
        <span class="eyebrow">FOCUS TIMER</span>
        <strong>Focus length</strong>
        <p>Choose how long you want each focus session to be.</p>
    </div>

    <div class="timer-length-control">
        <button
            type="button"
            class="timer-length-button"
            id="decreaseFocusMinutes"
            aria-label="Decrease focus time"
        >
            −
        </button>

        <div class="timer-length-value">
            <input
                type="number"
                id="focusMinutes"
                min="1"
                max="120"
                value="${customFocusMinutes}"
                aria-label="Focus length in minutes"
            >
            <span>min</span>
        </div>

        <button
            type="button"
            class="timer-length-button"
            id="increaseFocusMinutes"
            aria-label="Increase focus time"
        >
            +
        </button>
    </div>
</div>
        <div class="study-environment-grid">



            ${studyPlaylists.map(playlist => `
                <article
                    class="study-environment-card theme-${playlist.theme}"
                    data-playlist-id="${playlist.id}"
                >

                    <div class="study-environment-overlay"></div>

                    <div class="study-environment-content">

                        <div class="study-environment-top">

                            <div
                                class="study-environment-icon"
                                aria-hidden="true"
                            >
                                ${playlist.icon}
                            </div>

                            <button
                                type="button"
                                class="study-fullscreen-button"
                                data-playlist-action="fullscreen"
                                data-playlist-id="${playlist.id}"
                                aria-label="Open ${playlist.title} in full screen"
                                title="Full screen"
                            >
                                ⛶
                            </button>

                        </div>

<div class="study-environment-title">
    <p class="study-environment-label">
        STUDY ATMOSPHERE
    </p>
    <h3>${playlist.title}</h3>
    <p>${playlist.description}</p>
</div>


<div class="study-card-timer">
    <span class="study-card-timer-label">
        FOCUS
    </span>

    <input
        type="text"
        class="study-card-timer-input"
        data-study-timer="${playlist.id}"
        value="${formatTime(customFocusMinutes * 60)}"
        aria-label="Focus timer length"
        inputmode="numeric"
    >
</div>

                        <div class="study-environment-actions">

                            <button
                                type="button"
                                class="primary-button study-start-button"
                                data-playlist-action="start"
                                data-playlist-id="${playlist.id}"
                            >
                                ▶ Start
                            </button>

                            <button
                                type="button"
                                class="secondary-button study-playlist-button"
                                data-playlist-action="open"
                                data-playlist-id="${playlist.id}"
                            >
                                ♪ Playlist
                            </button>

                        </div>

                    </div>

                </article>
            `).join("")}

        </div>
    `;

    /*
     * If a timer is already running and the Study page gets
     * re-rendered, immediately put its current time back
     * into the correct card.
     */
    updateTimerDisplay();


const timerInputs = document.querySelectorAll(
    ".study-card-timer-input"
);

timerInputs.forEach(input => {

    function applyCustomTime() {
        const raw = input.value.trim();
        const minutesPart = raw.includes(":")
            ? raw.split(":")[0]
            : raw;

        let minutes = Number(
            minutesPart.replace(/[^0-9]/g, "")
        );

        if (!Number.isFinite(minutes) || minutes < 1) {
            minutes = 25;
        }

        minutes = Math.min(minutes, 120);

        customFocusMinutes = minutes;

        if (timerMode === "focus" && !timerRunning) {
            timerSeconds = minutes * 60;
        }

        input.value = formatTime(minutes * 60);

        updateTimerDisplay();
    }

    input.addEventListener("change", applyCustomTime);

    input.addEventListener("blur", applyCustomTime);

    input.addEventListener("focus", () => {
        input.select();
    });

});

/* Focus length controls */
const focusMinutesInput = document.querySelector("#focusMinutes");
const decreaseButton = document.querySelector("#decreaseFocusMinutes");
const increaseButton = document.querySelector("#increaseFocusMinutes");

function applyFocusMinutes(value) {
    let minutes = Number(value);

    if (!Number.isFinite(minutes)) {
        minutes = customFocusMinutes || 25;
    }

    minutes = Math.max(1, Math.min(120, Math.round(minutes)));
    customFocusMinutes = minutes;

    if (!timerRunning && timerMode === "focus") {
        timerSeconds = minutes * 60;
    }

    if (focusMinutesInput) {
        focusMinutesInput.value = minutes;
    }

    updateTimerDisplay();
    updateFocusDisplay();
}

focusMinutesInput?.addEventListener("change", event => {
    applyFocusMinutes(event.target.value);
});

decreaseButton?.addEventListener("click", () => {
    applyFocusMinutes(customFocusMinutes - 1);
});

increaseButton?.addEventListener("click", () => {
    applyFocusMinutes(customFocusMinutes + 1);
});
}
function renderProfile(container) {
    const user = currentUser;

    if (!user) {
        return;
    }

    const initials = user.name
        .split(" ")
        .map(name => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    container.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">YOUR PROFILE</p>
                <h1>${user.name}</h1>
                <p>
                    Keep track of your Peer Hub progress
                    and school details.
                </p>
            </div>
        </div>

        <div class="profile-grid">

            <section class="profile-card">
                <div class="profile-avatar">
                    ${initials}
                </div>

                <div class="profile-main">
                    <h2>${user.name}</h2>
                    <p>${user.email}</p>

                    <span class="profile-year">
                        ${user.year || "Student"}
                        ${user.className ? ` · ${user.className}` : ""}
                    </span>
                </div>
            </section>

            <section class="profile-card">
                <p class="eyebrow">PEER POINTS</p>

                <strong class="profile-stat">
                    ${user.points || 0}
                </strong>

                <p>
                    Points earned through helping and learning.
                </p>
            </section>

            <section class="profile-card">
                <p class="eyebrow">STUDY SESSIONS</p>

                <strong class="profile-stat">
                    ${user.sessions || 0}
                </strong>

                <p>
                    Focus sessions completed.
                </p>
            </section>

            <section class="profile-card profile-edit-card">
                <p class="eyebrow">SCHOOL DETAILS</p>
                <h2>Complete your profile</h2>
                <p>Adding your year level and class helps other students recognise your profile.</p>

                <form id="profileDetailsForm">
                    <div class="form-group">
                        <label for="profileYear">Year level</label>
                        <select id="profileYear" name="year" required>
                            <option value="">Choose your year</option>
                            ${[7, 8, 9, 10, 11, 12, 13].map(year => `
                                <option value="${year}" ${String(user.year || "") === String(year) ? "selected" : ""}>Year ${year}</option>
                            `).join("")}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="profileClass">Class</label>
                        <input
                            id="profileClass"
                            name="className"
                            type="text"
                            maxlength="12"
                            placeholder="e.g. 8WI"
                            value="${escapeHTML(user.className || "")}"
                            required
                        >
                    </div>

                    <button type="submit" class="primary-button">Save school details</button>
                    <p id="profileDetailsMessage" role="status" aria-live="polite"></p>
                </form>
            </section>

        </div>
    `;

    $("#profileDetailsForm")?.addEventListener("submit", async event => {
        event.preventDefault();

        const year = $("#profileYear")?.value;
        const className = $("#profileClass")?.value.trim().toUpperCase();
        const message = $("#profileDetailsMessage");

        if (!year || !className) {
            if (message) message.textContent = "Please choose your year and enter your class.";
            return;
        }

        updateCurrentUser({ year, className });

        if (message) message.textContent = "School details saved.";
        showToast("School details saved 🌿");
    });
}
function renderSettings(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">PREFERENCES</p>
                <h1>Settings</h1>
                <p>
                    Manage your Peer Hub preferences.
                </p>
            </div>
        </div>

        <div class="settings-grid">

            <section class="settings-card">
                <div>
                    <p class="eyebrow">ACCOUNT</p>
                    <h2>Account details</h2>
                    <p>
                        Your Peer Hub account is currently signed in.
                    </p>
                </div>

                <div class="settings-detail">
                    <span>Name</span>
                    <strong>${currentUser?.name || "Student"}</strong>
                </div>

                <div class="settings-detail">
                    <span>Email</span>
                    <strong>${currentUser?.email || "Not available"}</strong>
                </div>
            </section>

            <section class="settings-card">
                <div>                    <p class="eyebrow">STUDY</p>
                    <h2>Study preferences</h2>
                    <p>
                        Your study settings can be adjusted from the Study page.
                    </p>
                </div>

                <button
                    type="button"
                    class="secondary-button"
                    data-page="study"
                >
                    Open Study
                </button>
            </section>

            <section class="settings-card">
                <div>
                    <p class="eyebrow">PEER HUB</p>
                    <h2>About</h2>
                    <p>
                        St Oran's Peer Hub helps students find peers,
                        organise study sessions and keep track of progress.
                    </p>
                </div>

                <div class="settings-detail">
                    <span>Version</span>
                    <strong>Prototype</strong>
                </div>
            </section>

        </div>
    `;
}

/* =========================================================
   TIMER
   ========================================================= */

function formatTime(seconds) {
    const safeSeconds = Math.max(0, seconds);

    const minutes = Math.floor(
        safeSeconds / 60
    );

    const remaining =
        safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remaining
    ).padStart(2, "0")}`;
}


function setTimerMode(mode) {
    timerRunning = false;

    clearInterval(timerInterval);

    timerMode = mode;

if (mode === "focus") {
    timerSeconds = customFocusMinutes * 60;
} else if (mode === "shortBreak") {
        timerSeconds = 5 * 60;
    } else {
        timerSeconds = 15 * 60;
    }

    /*
     * Do NOT clear activeStudyEnvironment.
     * The selected Study card should keep owning
     * the timer after the Study page re-renders.
     */
    renderPage("study");

    updateTimerDisplay();
}


function toggleTimer() {
    if (timerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}


let focusSessionStartPromise = null;
let activeFocusSessionId = null;

async function startSupabaseFocusSession(durationSeconds) {
    const user = getCurrentUserFromData();
    if (!supabaseClient || !user || !String(user.id || "").startsWith("google-")) {
        return null;
    }
    const { data, error } = await supabaseClient.rpc("start_focus_session", {
        p_duration_seconds: durationSeconds
    });
    if (error) throw error;
    activeFocusSessionId = data;
    return data;
}

async function completeSupabaseFocusSession() {
    const sessionId = await focusSessionStartPromise;
    focusSessionStartPromise = null;
    activeFocusSessionId = null;
    if (!sessionId || !supabaseClient) return false;
    const { data, error } = await supabaseClient.rpc("complete_focus_session", {
        p_session_id: sessionId
    });
    if (error) throw error;
    await loadSupabasePoints();
    return Number(data || 0) === 20;
}

function startTimer() {
    if (timerRunning) {
        return;
    }

    /*
     * Web Audio needs a user interaction before browsers
     * will allow sound to play.
     */
    if (activeStudyEnvironment) {
        const playlist = getStudyPlaylists().find(
            item => item.id === activeStudyEnvironment
        );

        if (playlist) {
            startStudySound(playlist.sound);
        }
    }

    if (timerMode === "focus") {
        const user = getCurrentUserFromData();
        if (supabaseClient && user && String(user.id || "").startsWith("google-")) {
            focusSessionStartPromise = startSupabaseFocusSession(Math.max(60, customFocusMinutes * 60))
                .catch(error => {
                    console.error("Could not start saved focus session:", error);
                    showToast("Focus session started, but database tracking failed.");
                    return null;
                });
        } else {
            focusSessionStartPromise = null;
        }
    }

    timerRunning = true;

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        timerSeconds--;

        updateTimerDisplay();

        if (timerSeconds <= 0) {
            finishTimer();
        }

    }, 1000);

    updateTimerDisplay();
}


function pauseTimer() {
    timerRunning = false;

    clearInterval(timerInterval);

    stopStudySound();

    updateTimerDisplay();
}


function resetTimer() {
    clearInterval(timerInterval);

    timerRunning = false;

    stopStudySound();

   if (timerMode === "focus") {
    timerSeconds = customFocusMinutes * 60;
} else if (timerMode === "shortBreak") {
        timerSeconds = 5 * 60;
    } else {
        timerSeconds = 15 * 60;
    }

    updateTimerDisplay();
}


function updateTimerDisplay() {
    const display = $("#timerDisplay");

    if (display) {
        display.textContent =
            formatTime(timerSeconds);
    }

    /* Keep the active Study card in sync with the timer. */
    if (activeStudyEnvironment) {
        const activeInput = document.querySelector(
            `[data-study-timer="${activeStudyEnvironment}"]`
        );

        if (activeInput && document.activeElement !== activeInput) {
            activeInput.value = formatTime(timerSeconds);
        }
    }
}


function finishTimer() {
    clearInterval(timerInterval);

    timerRunning = false;

    timerSeconds = 0;

    stopStudySound();

    updateTimerDisplay();

    if (timerMode === "focus") {
        const user = getCurrentUserFromData();

        if (supabaseClient && user && String(user.id || "").startsWith("google-")) {
            completeSupabaseFocusSession().then(awarded => {
                if (awarded) {
                    updateCurrentUser({ sessions: (user?.sessions || 0) + 1 });
                    showToast("Focus session complete! +20 points saved ✦");
                } else {
                    showToast("Focus session was already recorded. No duplicate points added.");
                }
                if (currentPage === "points") renderPage("points");
            }).catch(error => {
                console.error("Could not save completed focus session:", error);
                showToast("Focus finished, but its points could not be saved. Check the database connection.");
            });
        } else {
            updateCurrentUser({
                points: (user?.points || 0) + 20,
                sessions: (user?.sessions || 0) + 1
            });
            showToast("Focus session complete! +20 points ✦");
        }

    } else {

        showToast(
            "Break finished. Back to it."
        );
    }

    setTimeout(() => {

        if (currentPage === "study") {

            renderStudy(
                $("#pageContent")
            );

            attachPageEvents();

        }

    }, 100);
}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(content) {
    const root = $("#modalRoot");

    if (!root) {
        return;
    }

    root.innerHTML = `
        <div
            class="modal-backdrop"
            data-action="close-modal"
        >

            <div
                class="modal"
                role="dialog"
                aria-modal="true"
                data-modal-content
            >

                ${content}

            </div>

        </div>
    `;

    const modal =
        $("[data-modal-content]", root);

    modal?.addEventListener(
        "click",
        event => {
            const deleteButton = event.target.closest('[data-action="delete-notification"]');
            if (deleteButton && modal.contains(deleteButton)) {
                event.preventDefault();
                event.stopPropagation();
                void deleteNotification(deleteButton.dataset.id);
                return;
            }
            event.stopPropagation();
        }
    );

    // Bind every modal close control (Cancel and ×).
    $$("[data-action=\"close-modal\"]", root).forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            closeModal();
        });
    });

    const backdrop = $(".modal-backdrop", root);
    backdrop?.addEventListener("click", event => {
        if (event.target === backdrop) closeModal();
    });
}


function closeModal() {
    const root = $("#modalRoot");

    if (root) {
        root.innerHTML = "";
    }
}


function openAddAssignmentModal() {
    openModal(`
        <div class="card-header">

            <div>
                <p class="eyebrow">
                    NEW TASK
                </p>

                <h2>
                    Add Assignment
                </h2>
            </div>

            <button
                type="button"
                class="icon-button"
                data-action="close-modal"
                aria-label="Close"
            >
                ×
            </button>

        </div>

        <form
            id="assignmentForm"
            class="modal-form"
        >

            <div class="form-group">

                <label for="newAssignmentTitle">
                    Assignment
                </label>

                <input
                    id="newAssignmentTitle"
                    type="text"
                    required
                    placeholder="e.g. Science report"
                >

            </div>

            <div class="form-group">

                <label for="newAssignmentSubject">
                    Subject
                </label>

                <input
                    id="newAssignmentSubject"
                    type="text"
                    required
                    placeholder="e.g. Science"
                >

            </div>

            <div class="form-group">

                <label for="newAssignmentDue">
                    Due
                </label>

                <input
                    id="newAssignmentDue"
                    type="date"
                    required
                    aria-label="Assignment due date"
                >

            </div>

            <div class="form-group">

                <label for="newAssignmentImportance">
                    Importance
                </label>

                <select id="newAssignmentImportance">
                    <option value="low">Low</option>
                    <option value="medium" selected>
                        Medium
                    </option>
                    <option value="high">High</option>
                </select>

            </div>

            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    data-action="close-modal"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    Add Assignment
                </button>

            </div>

        </form>
    `);

    $("#assignmentForm")?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const title =
                $("#newAssignmentTitle").value.trim();

            const subject =
                $("#newAssignmentSubject").value.trim();

            const dueDate =
                $("#newAssignmentDue").value;

            const due =
                dueDate
                    ? new Date(dueDate + "T00:00:00").toLocaleDateString(
                        "en-NZ",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "";

            const importance =
                $("#newAssignmentImportance").value;

            if (!title || !subject || !due) {
                return;
            }

            const assignmentId = Date.now();
            const newAssignment = {
                id: assignmentId,
                title,
                subject,
                due,
                dueDate,
                importance,
                completed: false
            };

            const saveAssignment = async () => {
                if (supabaseClient && String(currentUser?.id || "").startsWith("google-")) {
                    const { data: sessionData } = await supabaseClient.auth.getSession();
                    const authUser = sessionData.session?.user;

                    if (authUser) {
                        const { data: saved, error } = await supabaseClient
                            .from("assignments")
                            .insert({
                                user_id: authUser.id,
                                title,
                                subject,
                                due_date: dueDate,
                                importance,
                                completed: false
                            })
                            .select("id, title, subject, due_date, importance, completed")
                            .single();

                        if (error) {
                            console.error("Could not save assignment to Supabase:", error);
                            showToast("Assignment wasn't saved. Check the database setup and try again.");
                            return;
                        }

                        Object.assign(newAssignment, {
                            id: saved.id,
                            dueDate: saved.due_date,
                            cloud: true
                        });
                    }
                }

                appData.assignments.push(newAssignment);

                appData.calendarEvents.push({
                    id: "assignment-" + newAssignment.id,
                    title,
                    date: dueDate,
                    type: "Assignment",
                    time: "",
                    source: "assignment",
                    assignmentId: newAssignment.id
                });

                saveUserCalendarEvents();
                saveData();
                closeModal();
                showToast("Assignment added successfully.");
                renderPage("assignments");
            };

            saveAssignment();
        }
    );
}


function openTutorModal(tutor) {

    if (!tutor) {
        return;
    }

    openModal(`
        <div class="card-header">

            <div>
                <p class="eyebrow">
                    PEER TUTOR
                </p>

                <h2>
                    ${escapeHTML(tutor.name)}
                </h2>
            </div>

            <button
                type="button"
                class="icon-button"
                id="closeTutorModal"
                aria-label="Close"
            >
                ×
            </button>

        </div>

        <div class="modal-form">

            <p>
                ${escapeHTML(tutor.bio)}
            </p>

            <div class="tutor-subjects">

                ${tutor.subjects
                    .map(
                        subject =>
                            `<span class="subject-tag">${escapeHTML(
                                subject
                            )}</span>`
                    )
                    .join("")}

            </div>

            <p>
                <strong>Availability:</strong>
                ${escapeHTML(tutor.availability)}
            </p>

            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="closeTutorModalBottom"
                >
                    Close
                </button>

                <button
                    type="button"
                    class="primary-button"
                    data-action="request-tutor"
                    data-id="${tutor.id}"
                >
                    Request Session
                </button>

            </div>

        </div>
    `);

    $("#closeTutorModal")?.addEventListener(
        "click",
        closeModal
    );

    $("#closeTutorModalBottom")?.addEventListener(
        "click",
        closeModal
    );
}


/* =========================================================
   FOCUS MODE
   ========================================================= */

let focusAudioContext = null;
let focusSoundNodes = [];


/* -------------------------
   SETUP
   ------------------------- */

function setupFocusMode() {

    $("#focusModeClose")?.addEventListener(
        "click",
        closeFocusMode
    );

    $("#focusStart")?.addEventListener(
        "click",
        startFocusTimer
    );

    $("#focusPause")?.addEventListener(
        "click",
        pauseFocusTimer
    );

    $("#focusReset")?.addEventListener(
        "click",
        resetFocusTimer
    );

    $$(".background-option").forEach(option => {

        option.addEventListener("click", () => {

            setFocusBackground(
                option.dataset.background
            );

        });

    });

    $("#focusSpotifyButton")?.addEventListener(
        "click",
        openSpotify
    );

    createFocusBackground();
   setupDraggableSpotify();
}
function setupDraggableSpotify() {
    const player = $("#focusSpotifyEmbed");

    if (!player) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    player.addEventListener("pointerdown", event => {
    if (!event.target.closest(".spotify-drag-handle")) return;

        isDragging = true;

        const rect = player.getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        player.setPointerCapture(event.pointerId);
    });

    player.addEventListener("pointermove", event => {
        if (!isDragging) return;

        const overlay = $("#focusModeOverlay");

        if (!overlay) return;

        const overlayRect = overlay.getBoundingClientRect();

        let left = event.clientX - overlayRect.left - offsetX;
        let top = event.clientY - overlayRect.top - offsetY;

        const maxLeft = overlayRect.width - player.offsetWidth;
        const maxTop = overlayRect.height - player.offsetHeight;

        left = Math.max(0, Math.min(left, maxLeft));
        top = Math.max(0, Math.min(top, maxTop));

        player.style.left = `${left}px`;
        player.style.top = `${top}px`;
        player.style.right = "auto";
    });

    player.addEventListener("pointerup", event => {
        isDragging = false;

        if (player.hasPointerCapture(event.pointerId)) {
            player.releasePointerCapture(event.pointerId);
        }
    });

    player.addEventListener("pointercancel", () => {
        isDragging = false;
    });
}

/* -------------------------
   OPEN FOCUS MODE
   ------------------------- */

function openFocusMode(
    backgroundOverride = null,
    soundOverride = null
) {

    const overlay =
        $("#focusModeOverlay");

    if (!overlay) {
        console.error(
            "Focus Mode overlay not found."
        );

        return;
    }

    overlay.classList.add("active");

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

    /* Keep the fullscreen timer tied to the main Study timer. */
    if (!timerRunning && timerSeconds <= 0) {
        timerSeconds = customFocusMinutes * 60;
    }

    focusSeconds = timerSeconds;
    focusRunning = timerRunning;

    createFocusBackground();

    const background =
        backgroundOverride ||
        currentFocusBackground ||
        "forest";

    const sound =
        soundOverride ||
        currentFocusSound ||
        background;

    currentFocusSound = sound;

    setFocusBackground(background);

    updateFocusDisplay();
}
/* -------------------------
   OPEN STUDY ENVIRONMENT
   ------------------------- */

function openStudyEnvironmentFullscreen(playlistId) {
    const playlist = getStudyPlaylists().find(
        item => item.id === playlistId
    );

    if (!playlist) return;

    currentFocusBackground = playlist.fullscreenBackground;
    currentFocusSound = playlist.sound;

    const spotifyContainer = $("#focusSpotifyEmbed");

    if (spotifyContainer) {
        const embedUrl = getSpotifyEmbedUrl(playlist.spotify);

        spotifyContainer.innerHTML = embedUrl
            ? `
<div class="spotify-drag-handle">
    <span>⠿</span>
    <span>Drag music player</span>
</div>

<iframe
    src="${embedUrl}"
    width="100%"
    height="152"
    frameborder="0"
    allowfullscreen=""
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    loading="lazy"
    title="${playlist.title} Spotify playlist"
></iframe>
            `
            : `
                <p class="focus-spotify-placeholder">
                    🎵 Study music unavailable
                </p>
            `;
    }

    openFocusMode();
}

/* -------------------------
   CLOSE FOCUS MODE
   ------------------------- */

function closeFocusMode() {

    const overlay =
        $("#focusModeOverlay");

    if (!overlay) {
        return;
    }

    /*
     * Remove focus before hiding the overlay.
     * This prevents the aria-hidden warning.
     */
    if (
        overlay.contains(
            document.activeElement
        )
    ) {
        document.activeElement.blur();
    }

    overlay.classList.remove("active");

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );

    clearInterval(
        focusTimerInterval
    );

    focusRunning = false;

    stopStudySound();
}


/* -------------------------
   FOCUS TIMER
   ------------------------- */

function startFocusTimer() {
    if (timerRunning) {
        focusRunning = true;
        updateFocusDisplay();
        return;
    }

    timerMode = "focus";

    if (timerSeconds <= 0) {
        timerSeconds = customFocusMinutes * 60;
    }

    startTimer();

    focusRunning = timerRunning;
    focusSeconds = timerSeconds;
    updateFocusDisplay();
}


function pauseFocusTimer() {
    pauseTimer();

    focusRunning = false;
    focusSeconds = timerSeconds;
    updateFocusDisplay();
}


function resetFocusTimer() {
    resetTimer();

    focusRunning = false;
    focusSeconds = timerSeconds;
    updateFocusDisplay();
}


function updateFocusDisplay() {

    const display =
        $("#focusModeTimer");

    if (display) {

        focusSeconds = timerSeconds;

        display.textContent =
            formatTime(
                timerSeconds
            );

    }

    const start =
        $("#focusStart");

    if (start) {

        start.textContent =
            focusRunning
                ? "Running"
                : "Start";

    }

    const progress =
        $("#focusProgressBar");

    if (progress) {

        const totalFocusSeconds =
            Math.max(1, customFocusMinutes * 60);

        const percentage =
            ((totalFocusSeconds - focusSeconds) /
                totalFocusSeconds) *
            100;

        progress.style.width =
            `${Math.max(
                0,
                Math.min(
                    100,
                    percentage
                )
            )}%`;
    }
}


/* -------------------------
   FINISH FOCUS TIMER
   ------------------------- */

function finishFocusTimer() {

    clearInterval(
        focusTimerInterval
    );

    focusRunning = false;

    focusSeconds = timerSeconds;

    stopStudySound();

    updateFocusDisplay();

    const user = getCurrentUserFromData();
    if (supabaseClient && user && String(user.id || "").startsWith("google-")) {
        completeSupabaseFocusSession().then(awarded => {
            if (awarded) {
                updateCurrentUser({ sessions: (user?.sessions || 0) + 1 });
                showToast("Focus session complete! +20 points saved ✦");
            } else {
                showToast("Focus session was already recorded. No duplicate points added.");
            }
            if (currentPage === "points") renderPage("points");
        }).catch(error => {
            console.error("Could not save completed focus session:", error);
            showToast("Focus finished, but its points could not be saved. Check the database connection.");
        });
    } else {
        updateCurrentUser({
            points: (user?.points || 0) + 20,
            sessions: (user?.sessions || 0) + 1
        });
        showToast("Focus session complete! +20 points ✦");
    }
}


/* =========================================================
   FOCUS BACKGROUNDS
   ========================================================= */

function createFocusBackground() {
    const overlay = $("#focusModeOverlay");
    if (!overlay) return;

    let backgroundLayer = $("#focusBackgroundLayer");

    if (!backgroundLayer) {
        backgroundLayer = document.createElement("div");
        backgroundLayer.id = "focusBackgroundLayer";
        backgroundLayer.className = "focus-background-layer";
        backgroundLayer.setAttribute("aria-hidden", "true");
        overlay.prepend(backgroundLayer);
    } else {
        backgroundLayer.classList.add("focus-background-layer");
    }

    let atmosphere = $("#focusAtmosphere");

    if (!atmosphere) {
        atmosphere = document.createElement("div");
        atmosphere.id = "focusAtmosphere";
        atmosphere.className = "focus-atmosphere";
        atmosphere.setAttribute("aria-hidden", "true");
        overlay.appendChild(atmosphere);
    } else {
        atmosphere.classList.add("focus-atmosphere");
    }
}

/* -------------------------
   CHANGE BACKGROUND
   ------------------------- */

function setFocusBackground(
    background
) {

    const overlay =
        $("#focusModeOverlay");

    if (!overlay) {
        return;
    }

    createFocusBackground();

    currentFocusBackground =
        background || "forest";

    /*
     * Remove every possible environment class.
     */
   overlay.classList.remove(
    "forest",
    "rain",
    "academia",    "night",
    "cafe",
    "lyrics"
);

    overlay.classList.add(
        currentFocusBackground
    );

    /*
     * The old background buttons still work.
     */
    $$(".background-option").forEach(
        option => {

            option.classList.toggle(
                "active",
                option.dataset.background ===
                    currentFocusBackground
            );

        }
    );

    updateFocusAtmosphere(
        currentFocusBackground
    );

    /*
     * Stop any previous environment sound.
     * The selected sound will be started by
     * the appropriate user action.
     */
    stopStudySound();
}


/* =========================================================
   ATMOSPHERE
   ========================================================= */

function updateFocusAtmosphere(
    background
) {

    const atmosphere =
        $("#focusAtmosphere");

    if (!atmosphere) {
        return;
    }

    atmosphere.innerHTML = "";


    /* -------------------------
       RAIN
       ------------------------- */

    if (background === "rain") {

        for (let i = 0; i < 90; i++) {

            const drop =
                document.createElement(
                    "span"
                );

            /*
             * Your stylesheet uses .rain-drop.
             */
            drop.className =
                "rain-drop";

            drop.style.left =
                `${Math.random() * 100}%`;

            drop.style.animationDelay =
                `${Math.random() * 1.5}s`;

            drop.style.animationDuration =
                `${0.55 + Math.random() * 0.5}s`;

            atmosphere.appendChild(
                drop
            );
        }

        return;
    }


    /* -------------------------
       NIGHT
       ------------------------- */

    if (background === "night") {

        for (let i = 0; i < 90; i++) {

            const star =
                document.createElement(
                    "span"
                );

            star.className =
                "focus-star";

            star.style.left =
                `${Math.random() * 100}%`;

            star.style.top =
                `${Math.random() * 100}%`;

            star.style.animationDelay =
                `${Math.random() * 4}s`;

            star.style.animationDuration =
                `${2 + Math.random() * 3}s`;

            atmosphere.appendChild(
                star
            );
        }

        return;
    }


    /* -------------------------
       FOREST
       ------------------------- */

    if (background === "forest") {

        for (let i = 0; i < 35; i++) {

            const particle =
                document.createElement(
                    "span"
                );

            /*
             * Your stylesheet uses .forest-leaf.
             */
            particle.className =
                "forest-leaf";

            particle.style.left =
                `${Math.random() * 100}%`;

            particle.style.top =
                `${Math.random() * 100}%`;

            particle.style.animationDelay =
                `${Math.random() * 5}s`;

            particle.style.animationDuration =
                `${4 + Math.random() * 5}s`;

            atmosphere.appendChild(
                particle
            );
        }

        return;
    }


    /* -------------------------
       ACADEMIA
       ------------------------- */

    if (background === "academia") {

        for (let i = 0; i < 40; i++) {

            const particle =
                document.createElement(
                    "span"
                );

            /*
             * Your stylesheet uses .academia-particle.
             */
            particle.className =
                "academia-particle";

            particle.style.left =
                `${Math.random() * 100}%`;

            particle.style.top =
                `${Math.random() * 100}%`;

            particle.style.animationDelay =
                `${Math.random() * 6}s`;

            particle.style.animationDuration =
                `${5 + Math.random() * 6}s`;

            atmosphere.appendChild(
                particle
            );
        }

        return;
    }


    /* -------------------------
       CAFE / LYRICS
       ------------------------- */

    if (
        background === "cafe" ||
        background === "lyrics"
    ) {

        /*
         * Use subtle floating particles rather
         * than leaving the atmosphere completely empty.
         */
        for (let i = 0; i < 24; i++) {

            const particle =
                document.createElement(
                    "span"
                );

            particle.className =
                "academia-particle";

            particle.style.left =
                `${Math.random() * 100}%`;

            particle.style.top =
                `${Math.random() * 100}%`;

            particle.style.animationDelay =
                `${Math.random() * 6}s`;

            particle.style.animationDuration =
                `${6 + Math.random() * 6}s`;

            atmosphere.appendChild(
                particle
            );
        }
    }
}


/* =========================================================
   STUDY ENVIRONMENT SOUND
   ========================================================= */

function getAudioContext() {

    if (!focusAudioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        focusAudioContext =
            new AudioContext();
    }

    if (
        focusAudioContext.state ===
        "suspended"
    ) {

        focusAudioContext.resume();

    }

    return focusAudioContext;
}


function createNoiseSource(
    context,
    type = "white"
) {

    const bufferSize =
        context.sampleRate * 2;

    const buffer =
        context.createBuffer(
            1,
            bufferSize,
            context.sampleRate
        );

    const data =
        buffer.getChannelData(0);

    let lastValue = 0;

    for (
        let i = 0;
        i < bufferSize;
        i++
    ) {

        const random =
            Math.random() * 2 - 1;

        if (type === "brown") {

            lastValue =
                (lastValue + 0.02 * random) /
                1.02;

            data[i] =
                lastValue * 3.5;

        } else if (
            type === "pink"
        ) {

            lastValue =
                0.98 * lastValue +
                0.02 * random;

            data[i] =
                lastValue;

        } else {

            data[i] =
                random;
        }
    }

    const source =
        context.createBufferSource();

    source.buffer = buffer;
    source.loop = true;

    return source;
}


function addAmbientNoise(
    context,
    type,
    volume,
    filterType,
    frequency
) {

    const source =
        createNoiseSource(
            context,
            type
        );

    const filter =
        context.createBiquadFilter();

    filter.type =
        filterType;

    filter.frequency.value =
        frequency;

    const gain =
        context.createGain();

    gain.gain.value =
        volume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(
        context.destination
    );

    source.start();

    focusSoundNodes.push(
        source,
        filter,
        gain
    );
}


function addAmbientTone(
    context,
    frequency,
    volume,
    waveform = "sine"
) {

    const oscillator =
        context.createOscillator();

    const gain =
        context.createGain();

    oscillator.type =
        waveform;

    oscillator.frequency.value =
        frequency;

    gain.gain.value =
        volume;

    oscillator.connect(gain);

    gain.connect(
        context.destination
    );

    oscillator.start();

    focusSoundNodes.push(
        oscillator,
        gain
    );
}


function startStudySound(
    sound
) {

    stopStudySound();

    const context =
        getAudioContext();

    if (!context) {
        return;
    }

    try {

        switch (sound) {

            case "rain":

                addAmbientNoise(
                    context,
                    "white",
                    0.035,
                    "lowpass",
                    1800
                );

                addAmbientNoise(
                    context,
                    "pink",
                    0.018,
                    "highpass",
                    350
                );

                break;


            case "cafe":

                addAmbientNoise(
                    context,
                    "pink",
                    0.012,
                    "lowpass",
                    900
                );

                addAmbientTone(
                    context,
                    92,
                    0.012,
                    "sine"
                );

                addAmbientTone(
                    context,
                    184,
                    0.004,
                    "sine"
                );

                break;


            case "forest":

                addAmbientNoise(
                    context,
                    "pink",
                    0.025,
                    "lowpass",
                    750
                );

                addAmbientTone(
                    context,
                    110,
                    0.006,
                    "sine"
                );

                break;


            case "academia":

                addAmbientNoise(
                    context,
                    "brown",
                    0.018,
                    "lowpass",
                    1200
                );

                addAmbientTone(
                    context,
                    65,
                    0.008,
                    "triangle"
                );

                break;


            case "midnight":

                addAmbientNoise(
                    context,
                    "pink",
                    0.012,
                    "lowpass",
                    500
                );

                addAmbientTone(
                    context,
                    55,
                    0.008,
                    "sine"
                );

                addAmbientTone(
                    context,
                    110,
                    0.003,
                    "sine"
                );

                break;


            case "minimal":

                addAmbientNoise(
                    context,
                    "brown",
                    0.009,
                    "lowpass",
                    600
                );

                break;

            default:
                break;
        }

    } catch (error) {

        console.warn(
            "Study sound could not start:",
            error
        );

        stopStudySound();
    }
}


function stopStudySound() {

    if (
        !focusSoundNodes ||
        focusSoundNodes.length === 0
    ) {
        return;
    }

    focusSoundNodes.forEach(
        node => {

            try {

                if (
                    typeof node.stop ===
                    "function"
                ) {
                    node.stop();
                }

            } catch (error) {
                // Already stopped.
            }

            try {
                node.disconnect();
            } catch (error) {
                // Already disconnected.
            }
        }
    );

    focusSoundNodes = [];
}


/* =========================================================
   GLOBAL CLICK HANDLING
   ========================================================= */

function setupGlobalClicks() {

    document.addEventListener(
        "click",
        event => {

            const actionElement =
                event.target.closest(
                    "[data-action]"
                );

            if (!actionElement) {
                return;
            }

            const action =
                actionElement.dataset.action;

            switch (action) {

                case "find-peer":
                    navigateTo("tutors");
                    break;

                case "assignments":
                    navigateTo("assignments");
                    break;

                case "study":
                    navigateTo("study");
                    break;

                case "toggle-assignment":
                    toggleAssignment(
                        actionElement.dataset.id
                    );
                    break;

                case "toggle-completed-assignments":
                    appData.settings = appData.settings || {};
                    appData.settings.hideCompletedAssignments =
                        appData.settings.hideCompletedAssignments === false;
                    saveData();
                    renderPage("assignments");
                    break;

                case "add-assignment":
                    openAddAssignmentModal();
                    break;

                case "close-modal":
                    closeModal();
                    break;

                case "edit-calendar-event":
                    openEditCalendarEventModal(actionElement.dataset.id);
                    break;

                case "delete-calendar-event":
                    void deleteCalendarEvent(actionElement.dataset.id);
                    break;

                case "dismiss-quick-guide":
                    appData.settings = appData.settings || {};
                    appData.settings.quickGuideDismissed = true;
                    saveData();
                    renderPage("home");
                    break;

                case "show-quick-guide":
                    appData.settings = appData.settings || {};
                    appData.settings.quickGuideDismissed = false;
                    saveData();
                    renderPage("home");
                    break;

                case "delete-notification":
                    event.preventDefault();
                    event.stopPropagation();
                    void deleteNotification(actionElement.dataset.id);
                    break;

                case "edit-tutor-profile":
                    openTutorProfileEditor();
                    break;

                case "view-tutor": {

                    const tutor =
                        appData.tutors.find(
                            item =>
                                String(item.id) ===
                                String(
                                    actionElement.dataset.id
                                )
                        );

                    openTutorModal(tutor);

                    break;
                }

                case "book-tutor":
                case "request-tutor": {

                    const tutor =
                        appData.tutors.find(
                            item =>
                                String(item.id) ===
                                String(
                                    actionElement.dataset.id
                                )
                        );

                    requestTutor(tutor);

                    break;
                }

                case "spotify":
                    openSpotify();
                    break;

                case "sign-out":
                    signOut();
                    break;

                case "reset-data":
                    resetApplicationData();
                    break;
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal();

                if (
                    $("#focusModeOverlay")
                        ?.classList
                        .contains("active")
                ) {

                    closeFocusMode();

                }

            }

        }
    );
}


/* =========================================================
   PAGE EVENT ATTACHMENT
   ========================================================= */

function attachPageEvents() {

    /* -------------------------
       Calendar
       ------------------------- */

    $$("[data-calendar-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset
                            .calendarAction;

                    if (
                        action ===
                        "previous"
                    ) {

                        selectedCalendarDate =
                            new Date(
                                selectedCalendarDate
                                    .getFullYear(),
                                selectedCalendarDate
                                    .getMonth() - 1,
                                1
                            );

                        renderPage(
                            "calendar"
                        );
                    }

                    if (
                        action ===
                        "next"
                    ) {

                        selectedCalendarDate =
                            new Date(
                                selectedCalendarDate
                                    .getFullYear(),
                                selectedCalendarDate
                                    .getMonth() + 1,
                                1
                            );

                        renderPage(
                            "calendar"
                        );
                    }

                    if (
                        action ===
                        "add-event"
                    ) {
                        openAddCalendarEventModal();
                        return;
                    }

                    if (
                        action ===
                        "today"
                    ) {

                        selectedCalendarDate =
                            new Date();

                        renderPage(
                            "calendar"
                        );
                    }

                }
            );

        });


    $$("[data-calendar-date]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const dateString =
                        button.dataset
                            .calendarDate;

                    const parts =
                        dateString
                            .split("-")
                            .map(Number);

                    selectedCalendarDate =
                        new Date(
                            parts[0],
                            parts[1] - 1,
                            parts[2]
                        );

                    renderPage(
                        "calendar"
                    );

                }
            );

        });


    /* -------------------------
       Tutor filtering
       ------------------------- */

    $("#tutorSearch")
        ?.addEventListener(
            "input",
            filterTutors
        );

    $("#subjectFilter")
        ?.addEventListener(
            "change",
            filterTutors
        );


    /* -------------------------
       Study timer
       ------------------------- */

    $("#timerStart")
        ?.addEventListener(
            "click",
            toggleTimer
        );

    $("#timerReset")
        ?.addEventListener(
            "click",
            resetTimer
        );

    $("#timerFocusMode")
        ?.addEventListener(
            "click",
            () => {

                const playlist =
                    activeStudyEnvironment
                        ? getStudyPlaylists()
                            .find(
                                item =>
                                    item.id ===
                                    activeStudyEnvironment
                            )
                        : null;

                if (playlist) {

                    openFocusMode(
                        playlist.fullscreenBackground,
                        playlist.sound
                    );

                } else {

                    openFocusMode();

                }

            }
        );


    $$("[data-timer-mode]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setTimerMode(
                        button.dataset
                            .timerMode
                    );

                }
            );

        });

    /* -------------------------
       Study environments
       ------------------------- */

    $$("[data-playlist-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const action =
                        button.dataset
                            .playlistAction;

                    const playlistId =
                        button.dataset
                            .playlistId;

                    const playlist =
                        getStudyPlaylists()
                            .find(
                                item =>
                                    item.id ===
                                    playlistId
                            );

                    if (!playlist) {
                        return;
                    }


                    /* -------------------------
                       OPEN SPOTIFY PLAYLIST
                       ------------------------- */

                    if (
                        action === "open"
                    ) {

                        window.open(
                            playlist.spotify,
                            "_blank",
                            "noopener,noreferrer"
                        );

                        return;
                    }

                    /* -------------------------
                       START STUDY CARD
                       ------------------------- */

                    if (
                        action === "start"
                    ) {

                        /*
                         * THIS is the important part.
                         * The timer now knows which
                         * Study card owns it.
                         */
                        activeStudyEnvironment =
                            playlistId;

                        currentFocusBackground =
                            playlist.fullscreenBackground;

                        currentFocusSound =
                            playlist.sound;

                        /*
                         * Always use a fresh 25-minute
                         * focus timer when changing into
                         * a Study environment.
                         */
                        if (
                            timerMode !==
                            "focus"
                        ) {

                            timerMode =
                                "focus";

                            timerSeconds =
                                customFocusMinutes * 60;

                        }

                        /*
                         * If the timer isn't running,
                         * start it.
                         */
                        if (!timerRunning) {

                            startTimer();

                        } else {

                            /*
                             * If another environment was
                             * already running, just move
                             * the displayed timer to this
                             * card and switch its sound.
                             */
                            startStudySound(
                                playlist.sound
                            );

                            updateTimerDisplay();

                        }

                        showToast(
                            `${playlist.title} started.`
                        );

                        return;
                    }


                    /* -------------------------
                       FULLSCREEN
                       ------------------------- */

                    if (
                        action ===
                        "fullscreen"
                    ) {

                        activeStudyEnvironment =
                            playlistId;

                        currentFocusBackground =
                            playlist.fullscreenBackground;

                        currentFocusSound =
                            playlist.sound;

                        openStudyEnvironmentFullscreen(
                            playlistId
                        );

                        return;
                    }

                }
            );

        });


    /* -------------------------
       Settings
       ------------------------- */

    $$("[data-setting]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const setting =
                        button.dataset.setting;

                    if (
                        !Object.prototype
                            .hasOwnProperty.call(
                                appData.settings,
                                setting
                            )
                    ) {
                        return;
                    }

                    appData.settings[setting] =
                        !appData.settings[setting];

                    saveData();

                    updateTopbar();

                    renderPage(
                        "settings"
                    );

                    showToast(
                        `${setting
                            .charAt(0)
                            .toUpperCase() +
                            setting.slice(1)
                        } ${
                            appData.settings[
                                setting
                            ]
                                ? "enabled"
                                : "disabled"
                        }.`
                    );

                }
            );

        });
}


/* =========================================================
   TUTOR REQUEST
   ========================================================= */

function requestTutor(tutor) {

    if (!tutor) {
        return;
    }

    closeModal();

    showToast(
        `Session request sent to ${tutor.name}. ✦`
    );
}


/* =========================================================
   SPOTIFY
   ========================================================= */

function openSpotify() {

    window.open(
        "https://open.spotify.com/",
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   SIGN OUT
   ========================================================= */

async function signOut() {

    if (supabaseClient) {
        try {
            await supabaseClient.auth.signOut();
        } catch (error) {
            console.error("Supabase sign-out failed:", error);
        }
    }

    clearInterval(
        timerInterval
    );

    clearInterval(
        focusTimerInterval
    );

    stopStudySound();

    timerRunning = false;

    focusRunning = false;

    currentUser = null;

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    currentPage = "home";

    closeModal();

    closeFocusMode();

    showAuth();

    showToast(
        "You've been signed out."
    );
}


/* =========================================================
   RESET DATA
   ========================================================= */

function resetApplicationData() {

    const confirmed =
        window.confirm(
            "Reset the Peer Hub demo data?"
        );

    if (!confirmed) {
        return;
    }

    appData =
        structuredClone(
            DEFAULT_DATA
        );

    saveData();

    const demo =
        appData.users.find(
            user =>
                user.id ===
                "demo-maya"
        );

    currentUser = demo;

    saveCurrentUser();

    showToast(
        "Demo data has been reset."
    );

    updateTopbar();

    navigateTo("home");
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout = null;


function showToast(message) {

    const toast =
        $("#toast");

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimeout
    );

    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3200);
}


/* =========================================================
   ACCESSIBILITY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "/" &&
            ![
                "INPUT",
                "TEXTAREA",
                "SELECT"
            ].includes(
                document.activeElement
                    ?.tagName
            )
        ) {

            event.preventDefault();

            if (
                currentPage !==
                "tutors"
            ) {

                navigateTo(
                    "tutors"
                );

            }

            setTimeout(() => {

                $("#tutorSearch")
                    ?.focus();

            }, 100);

        }

    }
);


/* =========================================================
   PREVENT ACCIDENTAL FORM SUBMISSIONS
   ========================================================= */

document.addEventListener(
    "submit",
    event => {

        const form =
            event.target;

        if (
            form.id !==
                "signinForm" &&
            form.id !==
                "signupForm" &&
            form.id !==
                "assignmentForm" &&
            form.id !==
                "calendarEventForm"
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================================
   END OF SCRIPT
   ========================================================= */
/* Lucy feedback: tutor registration, specific booking times, notifications and points. */
function setupEnhancedFeatures(){appData.bookings=appData.bookings||[];appData.notificationsList=appData.notificationsList||[];const nav=$(".main-nav");if(nav&&!$('.nav-item[data-page="points"]',nav)){const b=document.createElement("button");b.type="button";b.className="nav-item";b.dataset.page="points";b.title="Peer Points";b.innerHTML='<span class="nav-icon">✦</span><span class="nav-text">Peer Points</span>';b.addEventListener("click",()=>navigateTo("points"));nav.appendChild(b);}const side=$(".sidebar");if(side&&!side.querySelector('[data-action="sign-out"]')){const b=document.createElement("button");b.type="button";b.className="secondary-button sidebar-signout";b.dataset.action="sign-out";b.textContent="Sign out";b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();signOut();});side.appendChild(b);}document.addEventListener("click",e=>{const el=e.target.closest("[data-action]");if(!el)return;const a=el.dataset.action;if(a==="edit-tutor-profile")openTutorProfileForm();if(a==="book-tutor")openSpecificBookingForm(appData.tutors.find(t=>String(t.id)===String(el.dataset.id)));if(a==="view-tutor")openTutorDetails(appData.tutors.find(t=>String(t.id)===String(el.dataset.id)));if(a==="update-booking")updateBookingStatus(el.dataset.id,el.dataset.status);});document.addEventListener("submit",e=>{if(e.target.id==="tutorProfileForm"){e.preventDefault();saveTutorProfile();}if(e.target.id==="specificBookingForm"){e.preventDefault();createSpecificBooking();}});saveData();}
function openTutorProfileForm(){const u=getCurrentUserFromData();if(!u)return;const t=appData.tutors.find(x=>String(x.userId)===String(u.id)),subs=["English","Mathematics","Science","French","Te Reo Māori","History","Social Studies","Physics","Chemistry","Biology","PE","Digital Technology"],days=["Monday","Tuesday","Wednesday","Thursday","Friday"];openModal(`<div class="card-header"><div><p class="eyebrow">PEER TUTOR</p><h2>${t?"Edit your tutor profile":"Become a tutor"}</h2></div><button type="button" class="icon-button" data-action="close-modal">×</button></div><form id="tutorProfileForm" class="modal-form"><div class="form-group"><label for="tutorBio">Short introduction</label><textarea id="tutorBio" required maxlength="240" placeholder="What can you help other students with?">${escapeHTML(t?.bio||"")}</textarea></div><div class="form-group"><label for="tutorSubjects">Subjects you can tutor</label><select id="tutorSubjects" multiple size="5" required>${subs.map(s=>`<option value="${escapeHTML(s)}" ${(t?.subjects||[]).includes(s)?"selected":""}>${escapeHTML(s)}</option>`).join("")}</select><small>Hold Cmd (Mac) or Ctrl (Windows) to choose multiple.</small></div><div class="form-group"><label>Days available</label><div class="choice-chips">${days.map(d=>`<label><input type="checkbox" name="tutorDays" value="${d}" ${(t?.availableDays||[]).includes(d)?"checked":""}> ${d}</label>`).join("")}</div></div><div class="form-grid"><div class="form-group"><label for="tutorStart">From</label><input id="tutorStart" type="time" value="${escapeHTML(t?.startTime||"15:30")}" required></div><div class="form-group"><label for="tutorEnd">Until</label><input id="tutorEnd" type="time" value="${escapeHTML(t?.endTime||"16:30")}" required></div></div><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button type="submit" class="primary-button">Save profile</button></div></form>`);}
async function saveTutorProfile(){const u=getCurrentUserFromData();if(!u)return;const bio=$("#tutorBio")?.value.trim()||"",subjects=[...($("#tutorSubjects")?.selectedOptions||[])].map(o=>o.value),availableDays=$$('input[name="tutorDays"]:checked').map(x=>x.value),startTime=$("#tutorStart")?.value||"",endTime=$("#tutorEnd")?.value||"";if(!bio||!subjects.length||!availableDays.length||!startTime||!endTime||startTime>=endTime){showToast("Add an introduction, subjects, available days and a valid time range.");return;}const saveButton=$('#tutorProfileForm button[type="submit"]');if(saveButton){saveButton.disabled=true;saveButton.textContent="Saving…";}try{let authId=null;const isGoogleUser=String(u.id||"").startsWith("google-");if(isGoogleUser){if(!supabaseClient)throw new Error("Supabase did not load. Refresh the page and try again.");const {data,error:sessionError}=await supabaseClient.auth.getSession();if(sessionError)throw sessionError;const authUser=data?.session?.user;if(!authUser)throw new Error("Your Google sign-in session has expired. Sign in again and retry.");authId=authUser.id;const {error}=await supabaseClient.from("tutor_profiles").upsert({user_id:authId,bio,subjects,availability:[...availableDays,startTime+"–"+endTime],active:true,updated_at:new Date().toISOString()},{onConflict:"user_id"});if(error)throw error;const {data:verify,error:verifyError}=await supabaseClient.from("tutor_profiles").select("user_id").eq("user_id",authId).maybeSingle();if(verifyError)throw verifyError;if(!verify)throw new Error("The database did not return the saved tutor row. Check the tutor_profiles table policies.");}else if(supabaseClient){throw new Error("Please sign in with your school Google account before saving a tutor profile.");}let t=appData.tutors.find(x=>String(x.userId)===String(u.id));const row={id:t?.id||("tutor-"+u.id),userId:u.id,name:u.name,year:u.year||"Student",initials:getInitials(u.name),subjects,bio,availableDays,startTime,endTime,availability:availableDays.join(" · ")+" · "+startTime+"–"+endTime,cloud:!!authId};if(t)Object.assign(t,row);else appData.tutors.push(row);updateCurrentUser({role:"tutor",tutorProfile:true,subjects,bio,availability:availableDays});saveData();if(authId)await loadSupabaseTutors();closeModal();showToast("Tutor profile saved to the database.");renderPage("tutors");}catch(error){console.error("Tutor profile database save failed:",error);showToast("Tutor profile NOT saved: "+(error?.message||String(error)));if(saveButton){saveButton.disabled=false;saveButton.textContent="Save profile";}}}
function openSpecificBookingForm(t) {
    const u = getCurrentUserFromData();
    if (!u || !t) return;
    if (String(t.userId || "") === String(u.id)) {
        showToast("That's your own tutor profile.");
        return;
    }

    const d = new Date();
    const today = d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");

    openModal(`
        <div class="card-header">
            <div><p class="eyebrow">BOOK A PEER</p><h2>Choose a session time</h2></div>
            <button type="button" class="icon-button" data-action="close-modal">×</button>
        </div>
        <form id="specificBookingForm" class="modal-form" data-tutor-id="${escapeHTML(String(t.id))}">
            <p>Request a session with <strong>${escapeHTML(t.name)}</strong>. It stays pending until they respond.</p>
            <div class="form-group">
                <label for="bookingSubject">Subject</label>
                <select id="bookingSubject" required>${(t.subjects || []).map(s => `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join("")}</select>
            </div>
            <div class="form-group"><label for="bookingDate">Date</label><input id="bookingDate" type="date" min="${today}" required></div>
            <div class="form-group"><label for="bookingTime">Start time</label><input id="bookingTime" type="time" value="${escapeHTML(t.startTime || "15:30")}" required><small>Usual availability: ${escapeHTML(t.availability || "By arrangement")}</small></div>
            <div class="form-group"><label for="bookingDuration">Duration</label><select id="bookingDuration"><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60" selected>1 hour</option></select></div>
            <div class="form-group">
                <label for="bookingLocation">Meeting location</label>
                <select id="bookingLocation" required>
                    <option value="Library">Library</option>
                    <option value="School grounds">School grounds</option>
                    <option value="Café">Café</option>
                    <option value="Online">Online</option>
                    <option value="Custom">Custom location…</option>
                </select>
            </div>
            <div class="form-group hidden" id="customBookingLocationGroup">
                <label for="bookingCustomLocation">Custom meeting place</label>
                <input id="bookingCustomLocation" type="text" maxlength="160" placeholder="Enter a meeting place">
            </div>
            <div class="form-group"><label for="bookingNote">What would you like help with? (optional)</label><textarea id="bookingNote" maxlength="240"></textarea></div>
            <div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button type="submit" class="primary-button">Send request</button></div>
        </form>
    `);

    const locationSelect = $("#bookingLocation");
    const customGroup = $("#customBookingLocationGroup");
    const customInput = $("#bookingCustomLocation");
    locationSelect?.addEventListener("change", () => {
        const custom = locationSelect.value === "Custom";
        customGroup?.classList.toggle("hidden", !custom);
        if (customInput) customInput.required = custom;
    });
}
async function createSpecificBooking(){
 const u=getCurrentUserFromData(),f=$("#specificBookingForm");
 if(!u||!f)return;
 const t=appData.tutors.find(x=>String(x.id)===String(f.dataset.tutorId)),
 subject=$("#bookingSubject")?.value,
 date=$("#bookingDate")?.value,
 time=$("#bookingTime")?.value,
 duration=Number($("#bookingDuration")?.value||60),
 note=$("#bookingNote")?.value.trim()||"",
 locationChoice=$("#bookingLocation")?.value||"",
 customLocation=$("#bookingCustomLocation")?.value.trim()||"",
 location=locationChoice==="Custom"?customLocation:locationChoice;
 if(!t||!date||!time||!subject||!location)return;
 if(locationChoice==="Custom"&&!customLocation){showToast("Enter a meeting place for this session.");return;}
 if(!supabaseClient||!String(u.id||"").startsWith("google-")||!String(t.userId||"").startsWith("google-")){
   showToast("Real session requests need a signed-in school account and a tutor with a saved database profile.");return;
 }
 const day=new Date(date+"T12:00:00").toLocaleDateString("en-NZ",{weekday:"long"}),start=Number(time.slice(0,2))*60+Number(time.slice(3,5)),end=start+duration,ts=t.startTime?Number(t.startTime.slice(0,2))*60+Number(t.startTime.slice(3,5)):0,te=t.endTime?Number(t.endTime.slice(0,2))*60+Number(t.endTime.slice(3,5)):1440;
 if(String(t.userId)===String(u.id)){showToast("That's your own tutor profile.");return;}
 if(t.availableDays?.length&&!t.availableDays.includes(day)){showToast("Choose one of the tutor's available days.");return;}
 if(start<ts||end>te){showToast("Choose a time within the tutor's available hours.");return;}
 const submit=f.querySelector('button[type="submit"]');if(submit){submit.disabled=true;submit.textContent="Sending…";}
 try{
   const requestedAt=new Date(date+"T"+time+":00").toISOString();
   const payload={requester_id:String(u.id).slice(7),tutor_id:String(t.userId).slice(7),subject,requested_at:requestedAt,location,notes:"Duration: "+duration+" minutes"+(note?"\n"+note:""),status:"pending"};
   const {data,error}=await supabaseClient.from("bookings").insert(payload).select("id, requester_id, tutor_id, subject, requested_at, location, notes, status, created_at").single();
   if(error)throw error;
   const b=mapSupabaseBooking(data,u,t);
   appData.bookings=appData.bookings||[];appData.bookings.push(b);saveData();
   closeModal();showToast("Session request saved to the database.");await loadSupabaseBookings();renderPage("tutors");
 }catch(error){
   console.error("Could not save session request:",error);
   showToast("Session request NOT saved: "+(error?.message||String(error)));
   if(submit){submit.disabled=false;submit.textContent="Send request";}
 }
}
function mapSupabaseBooking(row,user,knownTutor){
 const dateTime=new Date(row.requested_at),date=dateTime.getFullYear()+"-"+String(dateTime.getMonth()+1).padStart(2,"0")+"-"+String(dateTime.getDate()).padStart(2,"0"),time=String(dateTime.getHours()).padStart(2,"0")+":"+String(dateTime.getMinutes()).padStart(2,"0"),notes=String(row.notes||""),durationMatch=notes.match(/Duration:\s*(\d+)\s*minutes/i),duration=Number(durationMatch?.[1]||60),note=notes.replace(/Duration:\s*\d+\s*minutes\n?/i,"").trim();
 const requesterId="google-"+row.requester_id,tutorUserId="google-"+row.tutor_id,profiles=appData.users||[],requester=profiles.find(x=>String(x.id)===requesterId),tutor=knownTutor||appData.tutors.find(x=>String(x.userId)===tutorUserId);
 return {id:row.id,tutorId:tutor?.id||("cloud-"+row.tutor_id),tutorUserId,tutorName:tutor?.name||"Peer tutor",studentId:requesterId,studentName:requester?.name||(requesterId===user?.id?user.name:"Student"),subject:row.subject,date,time,duration,startMinutes:Number(time.slice(0,2))*60+Number(time.slice(3,5)),note,location:row.location||"Not specified",status:row.status,createdAt:row.created_at,cloud:true};
}
async function loadSupabaseBookings(){
 const user=getCurrentUserFromData();
 if(!supabaseClient||!user||!String(user.id||"").startsWith("google-"))return;
 try{
   const authId=String(user.id).slice(7);
   const {data,error}=await supabaseClient.from("bookings").select("id, requester_id, tutor_id, subject, requested_at, location, notes, status, created_at").order("created_at",{ascending:false});
   if(error)throw error;
   const rows=(data||[]).filter(x=>x.requester_id===authId||x.tutor_id===authId);
   const mapped=rows.map(row=>mapSupabaseBooking(row,user));
   const cloudIds=new Set(mapped.map(x=>String(x.id)));
   appData.bookings=(appData.bookings||[]).filter(x=>!x.cloud&&!cloudIds.has(String(x.id))).concat(mapped);
   syncAcceptedBookingCalendarEvents(mapped, user);
   saveData();
 }catch(error){console.error("Could not load session requests:",error);}
}

function syncAcceptedBookingCalendarEvents(bookings, user) {
 const currentUserId=String(user?.id||"");
 const cloudBookingIds=new Set((bookings||[]).map(b=>"booking-"+String(b.id)));
 appData.calendarEvents=(appData.calendarEvents||[]).filter(event =>
   event.source!=="booking" || !cloudBookingIds.has(String(event.id))
 );

 (bookings||[]).filter(booking=>booking.cloud&&booking.status==="accepted").forEach(booking=>{
   const isTutor=String(booking.tutorUserId)===currentUserId;
   const otherName=isTutor?(booking.studentName||"Student"):(booking.tutorName||"Peer tutor");
   const eventId="booking-"+String(booking.id);
   const event={
     id:eventId,
     title:"Peer tutoring: "+booking.subject+" with "+otherName,
     date:booking.date,
     time:booking.time,
     location:booking.location||"",
     type:"Tutoring",
     source:"booking",
     bookingId:booking.id,
     cloud:true
   };
   const existingIndex=appData.calendarEvents.findIndex(item=>String(item.id)===eventId);
   if(existingIndex>=0)appData.calendarEvents[existingIndex]=event;
   else appData.calendarEvents.push(event);
 });

 saveUserCalendarEvents();
 saveData();
}
async function updateBookingStatus(id,status){
 const user=getCurrentUserFromData(),booking=(appData.bookings||[]).find(x=>String(x.id)===String(id));
 if(!booking||booking.tutorUserId!==user?.id||!["accepted","declined"].includes(status)){showToast("Only the listed tutor can respond to this request.");return;}
 if(booking.cloud){
   try{
     const {data,error}=await supabaseClient.from("bookings").update({status}).eq("id",id).select("id").maybeSingle();
     if(error)throw error;
     if(!data)throw new Error("The database did not confirm the status change.");
   }catch(error){console.error("Could not update booking:",error);showToast("Booking update failed: "+(error?.message||String(error)));return;}
 }
 booking.status=status;
 appData.notificationsList.push({id:"notice-"+Date.now(),userId:booking.studentId,message:"Your session with "+booking.tutorName+" was "+status+".",read:false});
 if(status==="accepted"){
   if(!appData.calendarEvents.some(e=>e.id==="booking-"+booking.id))appData.calendarEvents.push({id:"booking-"+booking.id,title:"Peer tutoring: "+booking.subject+" with "+booking.tutorName,date:booking.date,time:booking.time,location:booking.location||"",type:"Tutoring",source:"booking",bookingId:booking.id});
   if(!booking.cloud){awardPeerPoints(booking.tutorUserId,10,"Accepted a tutoring request");awardPeerPoints(booking.studentId,5,"Booked a peer study session");}
 }
 saveUserCalendarEvents();saveData();showToast("Booking "+status+".");await loadSupabaseBookings();if(booking.cloud)await loadSupabasePoints();renderPage("tutors");
}

async function loadSupabaseNotifications(){
 const user=getCurrentUserFromData();
 if(!supabaseClient||!user||!String(user.id||"").startsWith("google-"))return;
 try{
  const authId=String(user.id).slice(7);
  const {data,error}=await supabaseClient.from("notifications")
   .select("id, user_id, title, message, booking_id, is_read, created_at")
   .eq("user_id",authId)
   .order("created_at",{ascending:false})
   .limit(50);
  if(error)throw error;
  const cloud=(data||[]).map(n=>({
   id:n.id,userId:"google-"+n.user_id,title:n.title,
   message:n.message,bookingId:n.booking_id,read:!!n.is_read,
   date:n.created_at,cloud:true
  }));
  appData.notificationsList=(appData.notificationsList||[])
   .filter(n=>!n.cloud&&n.userId!==user.id).concat(cloud);
  saveData();
  updateTopbar();
 }catch(error){console.error("Could not load notifications:",error);}
}
async function loadSupabasePoints(){
 const user=getCurrentUserFromData();
 if(!supabaseClient||!user||!String(user.id||"").startsWith("google-"))return;
 try{
  const authId=String(user.id).slice(7);
  const {data,error}=await supabaseClient.from("points_transactions").select("id, points, reason, created_at").eq("user_id",authId).order("created_at",{ascending:false});
  if(error)throw error;
  user.pointHistory=(data||[]).map(row=>({id:row.id,amount:Number(row.points||0),reason:row.reason,date:row.created_at}));
  user.points=user.pointHistory.reduce((sum,item)=>sum+item.amount,0);
  saveData();
 }catch(error){console.error("Could not load Peer Points:",error);}
}
let supabaseLeaderboard = null;
let supabaseLeaderboardLoading = false;
async function loadSupabaseLeaderboard(){
 const user=getCurrentUserFromData();
 if(!supabaseClient||!user||!String(user.id||"").startsWith("google-")||supabaseLeaderboardLoading||supabaseLeaderboard!==null)return;
 supabaseLeaderboardLoading=true;
 try{
  const {data,error}=await supabaseClient.rpc("get_peer_points_leaderboard");
  if(error)throw error;
  supabaseLeaderboard=(data||[]).map(row=>({id:"google-"+row.profile_id,name:String(row.full_name||"St Oran's student"),points:Number(row.points||0)}));
  if(currentPage==="points")renderPage("points");
 }catch(error){
  console.error("Could not load school leaderboard:",error);
  supabaseLeaderboard=[];
  if(currentPage==="points")renderPage("points");
 }finally{
  supabaseLeaderboardLoading=false;
 }
}
function awardPeerPoints(id,amount,reason){if(!id)return;const u=appData.users.find(x=>String(x.id)===String(id));if(!u)return;u.points=Number(u.points||0)+amount;u.pointHistory=u.pointHistory||[];u.pointHistory.push({amount,reason,date:new Date().toISOString()});appData.notificationsList.push({id:"points-"+Date.now(),userId:u.id,message:"+"+amount+" Peer Points: "+reason+".",read:false});}
function getPeerLevel(p){if(p>=500)return{name:"Scholar",floor:500,next:null};if(p>=300)return{name:"Mentor",floor:300,next:500};if(p>=150)return{name:"Collaborator",floor:150,next:300};if(p>=50)return{name:"Contributor",floor:50,next:150};return{name:"New Leaf",floor:0,next:50};}
function renderPeerPoints(c){
 const u=getCurrentUserFromData(),isRealUser=!!(supabaseClient&&u&&String(u.id||"").startsWith("google-"));
 if(isRealUser&&supabaseLeaderboard===null&&!supabaseLeaderboardLoading)void loadSupabaseLeaderboard();
 const users=isRealUser?(supabaseLeaderboard||[]):(appData.users||[]).slice().sort((a,b)=>Number(b.points||0)-Number(a.points||0));
 const p=Number(u?.points||0),l=getPeerLevel(p),prog=l.next?Math.min(100,Math.round((p-l.floor)/(l.next-l.floor)*100)):100,h=(u?.pointHistory||[]).slice().reverse().slice(0,6);
 const leaderboardRows=users.map((x,i)=>`<div class="leaderboard-row ${x.id===u?.id?"is-current-user":""}"><span class="leaderboard-rank">${i+1}</span><span class="leaderboard-avatar">${escapeHTML(getInitials(x.name))}</span><span class="leaderboard-name">${escapeHTML(x.name)}${x.id===u?.id?" (you)":""}<small>${getPeerLevel(Number(x.points||0)).name}</small></span><strong>${Number(x.points||0)} pts</strong></div>`).join("");
 c.innerHTML=`<div class="page-header"><div><p class="eyebrow">YOUR PROGRESS</p><h1>Peer Points</h1><p>Helping each other should count for something.</p></div></div><section class="points-hero card"><p class="eyebrow">YOUR CURRENT LEVEL</p><h2>${l.name} ✦</h2><div class="points-total">${p}<span> points</span></div><div class="points-progress"><div class="points-progress-fill" style="width:${prog}%"></div></div><p>${l.next?l.next-p+" points until "+getPeerLevel(l.next).name:"You've reached the highest current level."}</p></section><div class="points-columns"><section class="feature-panel points-panel"><p class="eyebrow">HOW TO EARN POINTS</p><h2>Give help. Get better.</h2><ul class="points-rules"><li><strong>+10</strong><span>Tutor request accepted</span></li><li><strong>+5</strong><span>Book a peer study session</span></li><li><strong>+20</strong><span>Complete a focus session</span></li><li><strong>+10</strong><span>Help a classmate as a tutor</span></li></ul><p class="muted">Points are saved to your school account when earned through connected features.</p></section><section class="feature-panel points-panel"><p class="eyebrow">RECENT ACTIVITY</p><h2>Point history</h2>${h.length?h.map(x=>`<div class="point-history-row"><span>${escapeHTML(x.reason)}</span><strong>+${Number(x.amount||0)} pts</strong></div>`).join(""):'<p class="muted">Your activity will appear here as you earn points.</p>'}</section></div><section class="feature-panel"><p class="eyebrow">FRIENDLY COMPETITION</p><h2>${isRealUser?"School leaderboard":"Leaderboard"}</h2><p class="muted">${isRealUser?(supabaseLeaderboard===null?"Loading live school rankings…":supabaseLeaderboard.length?"Live totals from school accounts. Only names and Peer Points are shown.":"No shared school profiles are available yet."):"Demo account names and points are shown for this prototype."}</p><div class="leaderboard">${leaderboardRows||(!isRealUser?'<p class="muted">No leaderboard entries yet.</p>':"")}</div></section>`;
}
function openTutorDetails(t){if(!t)return;openModal(`<div class="card-header"><div><p class="eyebrow">PEER TUTOR</p><h2>${escapeHTML(t.name)}</h2></div><button type="button" class="icon-button" data-action="close-modal">×</button></div><div class="modal-form"><p>${escapeHTML(t.bio||"")}</p><div class="tutor-subjects">${(t.subjects||[]).map(s=>`<span class="subject-tag">${escapeHTML(s)}</span>`).join("")}</div><p><strong>Availability:</strong> ${escapeHTML(t.availability||"By arrangement")}</p><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">Close</button><button type="button" class="primary-button" data-action="book-tutor" data-id="${escapeHTML(String(t.id))}">Choose a time</button></div></div>`);}
async function deleteNotification(id){
 const u=getCurrentUserFromData();
 if(!u||!id){showToast("This notification cannot be deleted.");return;}
 const notification=(appData.notificationsList||[]).find(n=>String(n.id)===String(id));
 if(!notification){showToast("Notification not found.");return;}
 if(!window.confirm("Delete this notification? This cannot be undone."))return;
 if(notification.cloud&&supabaseClient&&String(u.id||"").startsWith("google-")){
  try{
   const authId=String(u.id).slice(7);
   const {data,error}=await supabaseClient.from("notifications")
    .delete().eq("id",id).eq("user_id",authId).select("id");
   if(error)throw error;
   if(!data||!data.length){showToast("Could not delete this notification. Check the Supabase delete policy.");return;}
  }catch(error){
   console.error("Could not delete notification:",error);
   showToast("Couldn't delete it. Check the Supabase notification permissions.");
   return;
  }
 }
 appData.notificationsList=(appData.notificationsList||[])
  .filter(n=>String(n.id)!==String(id));
 saveData();
 updateTopbar();
 showToast("Notification deleted.");
 await showNotifications();
}

async function showNotifications(){
 if(!appData.settings.notifications){showToast("Notifications are turned off.");return;}
 const u=getCurrentUserFromData();
 if(supabaseClient&&u&&String(u.id||"").startsWith("google-")){
  await loadSupabaseNotifications();
  const msgs=(appData.notificationsList||[]).filter(n=>n.cloud&&n.userId===u.id);
  if(!msgs.length){showToast("You're all caught up ✦");return;}
  openModal(`<div class="card-header"><div><p class="eyebrow">UPDATES</p><h2>Notifications</h2></div><button type="button" class="icon-button" data-action="close-modal" aria-label="Close notifications">×</button></div><div class="modal-form notification-list">${msgs.slice(0,12).map(n=>`<article class="notification-row"><span class="notification-dot"></span><p><strong>${escapeHTML(n.title||"Update")}</strong><br>${escapeHTML(n.message)}</p><button type="button" class="secondary-button notification-delete" data-action="delete-notification" data-id="${escapeHTML(String(n.id))}" aria-label="Delete notification">Delete</button></article>`).join("")}</div><div class="modal-actions"><button type="button" class="primary-button" data-action="close-modal">Done</button></div>`);
  try{
   const authId=String(u.id).slice(7);
   const {error}=await supabaseClient.from("notifications").update({is_read:true}).eq("user_id",authId).eq("is_read",false);
   if(error)throw error;
   msgs.forEach(n=>n.read=true);saveData();updateTopbar();
  }catch(error){console.error("Could not mark notifications read:",error);}
  return;
 }
 const msgs=(appData.notificationsList||[]).filter(n=>n.userId===u?.id||(!n.userId&&u?.id==="demo-maya"));
 if(!msgs.length){const n=(appData.assignments||[]).filter(a=>!a.completed).length;showToast(n?n+" assignments still need attention.":"You're all caught up ✦");return;}
 openModal(`<div class="card-header"><div><p class="eyebrow">UPDATES</p><h2>Notifications</h2></div><button type="button" class="icon-button" data-action="close-modal" aria-label="Close notifications">×</button></div><div class="modal-form notification-list">${msgs.slice().reverse().slice(0,12).map(n=>`<article class="notification-row"><span class="notification-dot"></span><p>${escapeHTML(n.title||"Update")}<br>${escapeHTML(n.message||"")}</p><button type="button" class="secondary-button notification-delete" data-action="delete-notification" data-id="${escapeHTML(String(n.id||""))}" aria-label="Delete notification">Delete</button></article>`).join("")}</div><div class="modal-actions"><button type="button" class="primary-button" data-action="close-modal">Done</button></div>`);
 msgs.forEach(n=>n.read=true);saveData();updateTopbar();
}
