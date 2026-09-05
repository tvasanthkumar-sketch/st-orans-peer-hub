// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    loginScreen.style.display = "none";
    mainApp.style.display = "flex";
});


// Demo school account button
function demoLogin() {
    loginScreen.style.display = "none";
    mainApp.style.display = "flex";
}


// Forgot password
function forgotPassword(event) {
    event.preventDefault();

    alert("For this prototype, password recovery would be connected to the school's account system.");
}


// Sign up
function showSignup(event) {
    event.preventDefault();

    alert("The sign-up and profile setup page will be added next.");
}


// ===============================
// PAGE NAVIGATION
// ===============================

function showPage(pageId) {

    // Hide every page
    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.remove("active-page");
    });

    // Show selected page
    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }

    // Update sidebar
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(function(item) {
        item.classList.remove("active");

        if (item.dataset.page === pageId) {
            item.classList.add("active");
        }
    });
}


// Make sidebar navigation work
document.querySelectorAll(".nav-item").forEach(function(item) {

    item.addEventListener("click", function(event) {

        event.preventDefault();

        const pageId = item.dataset.page;

        showPage(pageId);

    });

});


// ===============================
// PEER SEARCH
// ===============================

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


function searchPeers() {

    const searchInput = document.getElementById("peerSearch");

    const searchTerm = searchInput.value.trim();

    if (searchTerm !== "") {

        document.getElementById("mainPeerSearch").value = searchTerm;

        showPage("peers");

        searchMainPeers();
    }
}


function searchMainPeers() {

    const input = document.getElementById("mainPeerSearch");

    const searchTerm = input.value.toLowerCase().trim();

    const resultsContainer = document.getElementById("searchResults");

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

            return subject.toLowerCase().includes(searchTerm) ||
                   searchTerm.includes(subject.toLowerCase());

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

                    <span class="${peer.availability === "Available" ? "available" : "busy"}">
                        ${peer.availability}
                    </span>

                    <button class="primary-button">
                        View profile
                    </button>

                </div>

            </div>
        `;

    }).join("");

}
