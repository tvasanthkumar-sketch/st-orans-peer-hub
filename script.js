// ========================================
// DEMO ACCOUNT
// ========================================

// ========================================
// DEMO ACCOUNTS
// ========================================

const demoAccounts = {

    "t.smith@storans.school.nz": {
        password: "Demo123",
        name: "Maya",
        year: "Year 8",
        points: 240,
        helped: 8,
        sessions: 12,
        badges: 3
    },

    "l.worthington@storans.school.nz": {
        password: "Lucy123",
        name: "Lucy",
        year: "Year 13",
        points: 520,
        helped: 21,
        sessions: 28,
        badges: 6
    }

};
let currentUser = null;

// ========================================
// LOGIN ELEMENTS
// ========================================

const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");
const loginError = document.getElementById("loginError");


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value
        .trim()
        .toLowerCase();

    const password = document.getElementById("password").value;


    // Clear previous error
    loginError.textContent = "";
    loginError.style.display = "none";


    // Check that the email is a St Oran's email
    if (!email.endsWith("@storans.school.nz")) {

        showLoginError(
            "Please use your St Oran's school email address."
        );

        return;
    }


    // Find the account
    const account = demoAccounts[email];


    // Account doesn't exist
    if (!account) {

        showLoginError(
            "We couldn't find an account with that school email."
        );

        return;
    }


    // Password is incorrect
    if (password !== account.password) {

        showLoginError(
            "Incorrect password. Please try again."
        );

        return;
    }


    // Save the logged-in student
    currentUser = account;


    // Load their information
    loadUserData();


    // Open the dashboard
    loginScreen.style.display = "none";
    mainApp.style.display = "flex";

});
// ========================================
// SHOW LOGIN ERROR
// ========================================

function showLoginError(message) {

    loginError.textContent = message;

    loginError.style.display = "block";

}


// ========================================
// DEMO SCHOOL ACCOUNT LOGIN
// ========================================

function demoLogin() {

    loginScreen.style.display = "none";

    mainApp.style.display = "flex";

}


// ========================================
// FORGOT PASSWORD
// ========================================

function forgotPassword(event) {

    event.preventDefault();

    alert(
        "In the real St Oran's version, password recovery would connect to the school's account system."
    );

}


// ========================================
// SIGN UP
// ========================================

function showSignup(event) {

    event.preventDefault();

    alert(
        "The sign-up and profile setup page will be added next."
    );

}


// ========================================
// PAGE NAVIGATION
// ========================================

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {

        page.classList.remove("active-page");

    });


    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.add("active-page");

    }


    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(function(item) {

        item.classList.remove("active");

        if (item.dataset.page === pageId) {

            item.classList.add("active");

        }

    });

}


// ========================================
// SIDEBAR NAVIGATION
// ========================================

document.querySelectorAll(".nav-item").forEach(function(item) {

    item.addEventListener("click", function(event) {

        event.preventDefault();

        const pageId = item.dataset.page;

        showPage(pageId);

    });

});


// ========================================
// PEER DATA
// ========================================

const peers = [

    {
        name: "Lucy",
        year: "Year 13",
        subjects: ["Maths", "Algebra", "Calculus"],
        availability: "Available"
    },

    {
        name: "Amelia",
        year: "Year 11",
        subjects: ["Science", "Biology", "Chemistry"],
        availability: "Available"
    },

    {
        name: "Sophie",
        year: "Year 10",
        subjects: ["Spanish", "Writing", "English"],
        availability: "Later today"
    },

    {
        name: "Ella",
        year: "Year 12",
        subjects: ["English", "Essay Writing", "History"],
        availability: "Available"
    }

];


// ========================================
// DASHBOARD PEER SEARCH
// ========================================

function searchPeers() {

    const searchInput = document.getElementById("peerSearch");

    const searchTerm = searchInput.value.trim();

    if (searchTerm !== "") {

        document.getElementById("mainPeerSearch").value = searchTerm;

        showPage("peers");

        searchMainPeers();

    }

}


// ========================================
// MAIN PEER SEARCH
// ========================================

function searchMainPeers() {

    const input = document.getElementById("mainPeerSearch");

    const searchTerm = input.value.toLowerCase().trim();

    const resultsContainer =
        document.getElementById("searchResults");


    if (searchTerm === "") {

        resultsContainer.innerHTML = `
            <div class="empty-state">
                <span>⌕</span>
                <h2>What do you need help with?</h2>
                <p>Search for a topic to find students who can help.</p>
            </div>
        `;

        return;

    }


    const matches = peers.filter(function(peer) {

        return peer.subjects.some(function(subject) {

            return (
                subject.toLowerCase().includes(searchTerm) ||
                searchTerm.includes(subject.toLowerCase())
            );

        });

    });


    if (matches.length === 0) {

        resultsContainer.innerHTML = `
            <div class="empty-state">
                <span>⌕</span>
                <h2>No peers found</h2>
                <p>Try searching for another subject or topic.</p>
            </div>
        `;

        return;

    }


    resultsContainer.innerHTML = matches.map(function(peer) {

        return `
            <div class="peer-result-card">

                <div class="avatar peer-avatar">
                    ${peer.name.charAt(0)}
                </div>

                <div class="peer-result-info">

                    <h3>${peer.name}</h3>

                    <p>${peer.year}</p>

                    <div class="tags">

                        ${peer.subjects.map(function(subject) {

                            return `<span>${subject}</span>`;

                        }).join("")}

                    </div>

                </div>

                <div class="peer-result-right">

                    <span class="${
                        peer.availability === "Available"
                            ? "available"
                            : "busy"
                    }">

                        ${peer.availability}

                    </span>

                    <button
                        class="primary-button"
                        onclick="viewPeer('${peer.name}')"
                    >
                        View profile
                    </button>

                </div>

            </div>
        `;

    }).join("");

}


// ========================================
// VIEW PEER
// ========================================

function viewPeer(name) {

    alert(
        "Peer profile for " + name +
        " will open here. Booking a session will be available soon."
    );

}
