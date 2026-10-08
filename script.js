/* =====================================================
   DECIDE — DECISION ELIMINATOR
   JAVASCRIPT
===================================================== */


/* =====================================================
   1. GLOBAL STATE
===================================================== */

let currentDecision = {
    question: "",
    category: "",
    description: "",
    options: []
};

let currentWinner = "";

let selectedPreference = "Cheapest";


/* =====================================================
   2. PAGE NAVIGATION
===================================================== */

function showPage(pageId) {

    // Hide every page
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });


    // Show requested page
    const page = document.getElementById(pageId);

    if (!page) {
        return;
    }

    page.classList.add("active");


    // Update navigation buttons
    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    const matchingNavButton = document.querySelector(`.nav-btn[data-page="${pageId}"]`);

    if (matchingNavButton) {
        matchingNavButton.classList.add("active");
    }


    // Close mobile menu
    const navLinks =
        document.getElementById("navLinks");

    if (navLinks) {
        navLinks.classList.remove("open");
    }


    // Run page-specific functions
    if (pageId === "history") {
        loadHistory();
    }

    if (pageId === "insights") {
        loadInsights();
    }


    // Scroll to top when supported
    const supportsScroll =
        typeof window.scrollTo === "function" &&
        !String(window.scrollTo).includes("notImplementedMethod");

    if (supportsScroll) {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


/* =====================================================
   3. MOBILE MENU
===================================================== */

function toggleMenu() {

    const nav =
        document.getElementById("navLinks");

    if (!nav) {
        return;
    }

    nav.classList.toggle("open");
}


/* =====================================================
   4. ADD DECISION OPTION
===================================================== */

function addOption() {

    const optionList =
        document.getElementById("optionList");


    const row =
        document.createElement("div");


    row.className =
        "option-row";


    row.innerHTML = `

        <input
            class="option-input"
            type="text"
            placeholder="Another option"
        >

        <button
            class="remove-option"
            onclick="removeOption(this)">
            ×
        </button>

    `;


    optionList.appendChild(row);


    // Automatically focus new input
    const newInput =
        row.querySelector(".option-input");

    newInput.focus();
}


/* =====================================================
   5. REMOVE OPTION
===================================================== */

function removeOption(button) {

    const rows =
        document.querySelectorAll(".option-row");


    // Always keep at least two choices
    if (rows.length <= 2) {

        showToast(
            "You need at least two options 💗"
        );

        return;
    }


    button.parentElement.remove();
}


/* =====================================================
   6. RANGE SLIDERS
===================================================== */

function updateRange(inputId, outputId) {

    const input =
        document.getElementById(inputId);

    const output =
        document.getElementById(outputId);


    if (!input || !output) {
        return;
    }


    output.textContent =
        input.value + "%";
}


/* =====================================================
   7. PREFERENCE SELECTION
===================================================== */

function selectPreference(element) {

    document
        .querySelectorAll(".preference-choice")
        .forEach(card => {

            card.classList.remove("selected");

        });


    element.classList.add("selected");


    selectedPreference =
        element.textContent.trim();
}


/* =====================================================
   8. CREATE DECISION
===================================================== */

function continueToPreferences() {

    const question =
        document
            .getElementById("decisionQuestion")
            .value
            .trim();


    const category =
        document
            .getElementById("category")
            .value;


    const description =
        document
            .getElementById("description")
            .value
            .trim();


    const inputs =
        document.querySelectorAll(
            ".option-input"
        );


    const options = [];


    // Collect options
    inputs.forEach(input => {

        const value =
            input.value.trim();


        if (value !== "") {

            options.push(value);

        }

    });


    // Validation
    if (question === "") {

        showToast(
            "Tell me what you're deciding! 💭"
        );

        return;
    }


    if (options.length < 2) {

        showToast(
            "Add at least two options!"
        );

        return;
    }


    // Remove duplicate options
    const uniqueOptions =
        [...new Set(options)];


    if (uniqueOptions.length < 2) {

        showToast(
            "Your options should be different."
        );

        return;
    }


    // Store current decision
    currentDecision = {

        question:
            question,

        category:
            category,

        description:
            description,

        options:
            uniqueOptions
    };


    showToast(
        "Decision created ✨"
    );


    setTimeout(() => {

        showPage("preferences");

    }, 400);
}


/* =====================================================
   9. GET PREFERENCE WEIGHTS
===================================================== */

function getWeights() {

    const budget =
        Number(
            document.getElementById(
                "budgetWeight"
            ).value
        );


    const time =
        Number(
            document.getElementById(
                "timeWeight"
            ).value
        );


    const preference =
        Number(
            document.getElementById(
                "preferenceWeight"
            ).value
        );


    return {
        budget,
        time,
        preference
    };
}


/* =====================================================
   10. GET PREVIOUS CHOICES
===================================================== */

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "decisionHistory"
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Could not read history:",
            error
        );

        return [];
    }
}


/* =====================================================
   11. CALCULATE HISTORY BONUS
===================================================== */

function getHistoryBonus(option) {

    const history =
        getHistory();


    let timesChosen = 0;


    history.forEach(item => {

        if (
            item.winner.toLowerCase() ===
            option.toLowerCase()
        ) {

            timesChosen++;

        }

    });


    /*
        Maximum bonus = 20 points.

        This is the beginning of our
        "learning from past choices"
        system.
    */

    return Math.min(
        timesChosen * 5,
        20
    );
}


/* =====================================================
   12. SCORE EACH OPTION
===================================================== */

function calculateScore(option, index) {

    const weights =
        getWeights();


    /*
        Base score.

        Every option starts around 50.
    */

    let score = 50;


    /*
        Different preferences influence
        the score.
    */

    if (selectedPreference === "Cheapest") {

        score +=
            weights.budget * 0.25;

    }


    if (selectedPreference === "Fastest") {

        score +=
            weights.time * 0.25;

    }


    if (
        selectedPreference ===
        "❤️ My Favourite"
    ) {

        score +=
            weights.preference * 0.25;

    }


    /*
        Personal preference contribution.
    */

    score +=
        weights.preference * 0.15;


    /*
        Time contribution.
    */

    score +=
        weights.time * 0.08;


    /*
        Budget contribution.
    */

    score +=
        weights.budget * 0.08;


    /*
        Previous choices.

        If the user has selected this
        option before, it gets a bonus.
    */

    const historyBonus =
        getHistoryBonus(option);


    score += historyBonus;


    /*
        Small variation based on position.

        This prevents every option from
        receiving exactly the same score.
    */

    score += index * 2;


    /*
        Keep score between 0 and 99.
    */

    score =
        Math.max(
            0,
            Math.min(
                Math.round(score),
                99
            )
        );


    return score;
}


/* =====================================================
   13. FIND BEST OPTION
===================================================== */

function findBestOption() {

    let bestOption =
        currentDecision.options[0];


    let bestScore =
        -Infinity;


    currentDecision.options.forEach(
        (option, index) => {

            const score =
                calculateScore(
                    option,
                    index
                );


            if (score > bestScore) {

                bestScore =
                    score;

                bestOption =
                    option;
            }

        }
    );


    return {
        option: bestOption,
        score: bestScore
    };
}


/* =====================================================
   14. START ELIMINATION
===================================================== */

function startElimination() {

    if (
        !currentDecision.options ||
        currentDecision.options.length < 2
    ) {

        showToast(
            "Create a decision first!"
        );

        showPage("create");

        return;
    }


    showPage("elimination");


    const options =
        [...currentDecision.options];


    const optionElement =
        document.getElementById(
            "currentOption"
        );


    const reasonElement =
        document.getElementById(
            "reason"
        );


    const progress =
        document.getElementById(
            "progressBar"
        );


    const eliminationText =
        document.getElementById(
            "eliminationText"
        );


    let index = 0;


    /*
        Reset progress.
    */

    progress.style.width =
        "0%";


    /*
        Reasons shown during analysis.
    */

    const reasons = [

        "Checking your preferences...",

        "Comparing suitability...",

        "Looking at your decision history...",

        "Calculating weighted score...",

        "Finding the strongest match..."

    ];


    function checkNextOption() {

        if (index >= options.length) {

            setTimeout(
                finishDecision,
                500
            );

            return;
        }


        const option =
            options[index];


        optionElement.textContent =
            option;


        eliminationText.textContent =
            `Analyzing ${index + 1} of ${options.length} options...`;


        reasonElement.textContent =
            reasons[
                index % reasons.length
            ];


        progress.style.width =
            (
                ((index + 1) /
                options.length) *
                100
            ) + "%";


        /*
            Add a small animation to the card.
        */

        optionElement.style.animation =
            "none";


        void optionElement.offsetWidth;


        optionElement.style.animation =
            "winnerPop .45s ease";


        index++;


        setTimeout(
            checkNextOption,
            900
        );
    }


    checkNextOption();
}


/* =====================================================
   15. FINISH DECISION
===================================================== */

function finishDecision() {

    const result =
        findBestOption();


    currentWinner =
        result.option;


    /*
        Display winner.
    */

    const winnerElement =
        document.getElementById(
            "winner"
        );


    winnerElement.textContent =
        currentWinner;


    /*
        Display score.
    */

    document.getElementById(
        "winnerScore"
    ).textContent =
        `Recommendation score: ${result.score}%`;


    /*
        Update explanation.
    */

    document.getElementById(
        "reasonPreference"
    ).textContent =
        `${selectedPreference} priority`;


    document.getElementById(
        "reasonBudget"
    ).textContent =
        "Matches your selected priorities";


    document.getElementById(
        "reasonOverall"
    ).textContent =
        "Highest weighted recommendation";


    /*
        Save decision.
    */

    saveDecision(
        currentWinner,
        result.score
    );


    /*
        Show result page.
    */

    showPage("result");


    /*
        Celebration.
    */

    createConfetti();
}


/* =====================================================
   16. SAVE DECISION TO LOCAL STORAGE
===================================================== */

function saveDecision(
    winner,
    score
) {

    const history =
        getHistory();


    const newDecision = {

        id:
            Date.now(),

        question:
            currentDecision.question,

        category:
            currentDecision.category,

        description:
            currentDecision.description,

        options:
            currentDecision.options,

        winner:
            winner,

        score:
            score,

        preference:
            selectedPreference,

        weights:
            getWeights(),

        date:
            new Date().toLocaleString()

    };


    history.unshift(
        newDecision
    );


    /*
        Keep maximum 30 decisions.
    */

    const limitedHistory =
        history.slice(0, 30);


    localStorage.setItem(

        "decisionHistory",

        JSON.stringify(
            limitedHistory
        )

    );
}


/* =====================================================
   17. LOAD HISTORY
===================================================== */

function loadHistory() {

    const history =
        getHistory();


    const container =
        document.getElementById(
            "historyList"
        );


    if (!container) {
        return;
    }


    /*
        No history yet.
    */

    if (history.length === 0) {

        container.innerHTML = `

            <div class="card">

                <h3>
                    No decisions yet 💭
                </h3>

                <p
                    style="
                        color:var(--muted);
                        margin-top:8px;
                    "
                >
                    Make your first decision
                    and your history will
                    appear here.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    history.forEach(item => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "card history-item";


        card.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(
                        item.winner
                    )}
                </strong>

                <div>
                    ${escapeHTML(
                        item.question
                    )}
                </div>

                <div class="history-date">

                    ${escapeHTML(
                        item.category
                    )}

                    •
                    
                    ${escapeHTML(
                        item.date
                    )}

                </div>

            </div>


            <div class="score">

                ${item.score}%

            </div>

        `;


        container.appendChild(
            card
        );

    });
}


/* =====================================================
   18. INSIGHTS
===================================================== */

function loadInsights() {

    const history =
        getHistory();


    const totalElement =
        document.getElementById(
            "totalDecisions"
        );


    const categoryElement =
        document.getElementById(
            "favoriteCategory"
        );


    const choiceElement =
        document.getElementById(
            "favoriteChoice"
        );


    if (!totalElement) {
        return;
    }


    /*
        Total decisions
    */

    totalElement.textContent =
        history.length;


    /*
        No data.
    */

    if (history.length === 0) {

        categoryElement.textContent =
            "—";


        choiceElement.textContent =
            "—";


        document.getElementById(
            "preferenceBar"
        ).style.width =
            "0%";


        document.getElementById(
            "confidenceBar"
        ).style.width =
            "0%";


        return;
    }


    /*
        ------------------------------------
        MOST COMMON CATEGORY
        ------------------------------------
    */

    const categories = {};


    history.forEach(item => {

        if (!categories[item.category]) {

            categories[item.category] =
                0;
        }


        categories[item.category]++;
    });


    const favoriteCategory =
        Object.keys(categories)
            .sort(
                (a, b) =>
                    categories[b] -
                    categories[a]
            )[0];


    categoryElement.textContent =
        favoriteCategory;


    /*
        ------------------------------------
        MOST COMMON CHOICE
        ------------------------------------
    */

    const choices = {};


    history.forEach(item => {

        if (!choices[item.winner]) {

            choices[item.winner] =
                0;
        }


        choices[item.winner]++;
    });


    const favoriteChoice =
        Object.keys(choices)
            .sort(
                (a, b) =>
                    choices[b] -
                    choices[a]
            )[0];


    choiceElement.textContent =
        favoriteChoice;


    /*
        ------------------------------------
        PREFERENCE CONSISTENCY
        ------------------------------------
    */

    const preferenceCounts = {};


    history.forEach(item => {

        const preference =
            item.preference ||
            "Unknown";


        preferenceCounts[
            preference
        ] =
            (
                preferenceCounts[
                    preference
                ] || 0
            ) + 1;

    });


    const highestPreference =
        Math.max(
            ...Object.values(
                preferenceCounts
            )
        );


    const consistency =
        Math.round(
            (
                highestPreference /
                history.length
            ) * 100
        );


    /*
        ------------------------------------
        DECISION CONFIDENCE
        ------------------------------------
    */

    const averageScore =
        history.reduce(
            (total, item) =>
                total +
                Number(item.score || 0),
            0
        ) /
        history.length;


    document.getElementById(
        "preferenceBar"
    ).style.width =
        consistency + "%";


    document.getElementById(
        "confidenceBar"
    ).style.width =
        Math.round(
            averageScore
        ) + "%";
}


/* =====================================================
   19. CLEAR HISTORY
===================================================== */

function clearHistory() {

    const confirmed =
        confirm(
            "Are you sure you want to delete all your decision history?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        "decisionHistory"
    );


    loadHistory();

    loadInsights();


    showToast(
        "History cleared 🗑️"
    );
}


/* =====================================================
   20. TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2200);
}


/* =====================================================
   21. CONFETTI
===================================================== */

function createConfetti() {

    const symbols = [
        "✦",
        "●",
        "◆",
        "♥",
        "✧"
    ];


    const colors = [
        "#ff5f9e",
        "#ff91bc",
        "#a66cff",
        "#ffcae0",
        "#d93678"
    ];


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        piece.className =
            "confetti";


        piece.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        piece.style.left =
            Math.random() *
            100 +
            "vw";


        piece.style.color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        piece.style.fontSize =
            (
                Math.random() *
                10 +
                8
            ) +
            "px";


        piece.style.animationDuration =
            (
                Math.random() *
                2 +
                2
            ) +
            "s";


        piece.style.animationDelay =
            (
                Math.random() *
                .5
            ) +
            "s";


        document.body.appendChild(
            piece
        );


        setTimeout(() => {

            piece.remove();

        }, 4500);
    }
}


/* =====================================================
   22. FLOATING BACKGROUND PARTICLES
===================================================== */

function createParticles() {

    const particleCount =
        window.innerWidth < 600
            ? 12
            : 25;


    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );


        particle.className =
            "particle";


        particle.style.left =
            Math.random() *
            100 +
            "vw";


        particle.style.animationDuration =
            (
                Math.random() *
                10 +
                8
            ) +
            "s";


        particle.style.animationDelay =
            (
                Math.random() *
                10
            ) +
            "s";


        particle.style.opacity =
            Math.random() *
            .35;


        const size =
            Math.random() *
            8 +
            4;


        particle.style.width =
            size + "px";


        particle.style.height =
            size + "px";


        document.body.appendChild(
            particle
        );
    }
}


/* =====================================================
   23. SAFE HTML
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}


/* =====================================================
   24. KEYBOARD SHORTCUT
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        /*
            Press Escape to close
            mobile navigation.
        */

        if (
            event.key === "Escape"
        ) {

            const nav =
                document.getElementById(
                    "navLinks"
                );


            if (nav) {

                nav.classList.remove(
                    "open"
                );
            }
        }

    }
);


/* =====================================================
   25. INITIALIZE APP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
            Create animated particles.
        */

        createParticles();


        /*
            Load saved data.
        */

        loadHistory();

        loadInsights();


        /*
            Set initial slider values.
        */

        updateRange(
            "budgetWeight",
            "budgetValue"
        );


        updateRange(
            "timeWeight",
            "timeValue"
        );


        updateRange(
            "preferenceWeight",
            "preferenceValue"
        );

    }
);