const FACTION_KEY = "sw_faction";

const NAV_LINKS = [
    { key: "home", href: "index.html", label: "בית" },
    { key: "quiz", href: "quiz.html", label: "חידון" },
    { key: "challenge", href: "challenge.html", label: "אתגר" }
];

function $(id) {
    return document.getElementById(id);
}

function getFaction() {
    return sessionStorage.getItem(FACTION_KEY);
}

function setFaction(faction) {
    sessionStorage.setItem(FACTION_KEY, faction);
}


function renderHeader() {

    const header = $("site-header");
    if (!header) {
        return;
    }
    let links = `
            <li><a href="index.html" data-nav="home">בית</a></li>
            <li><a href="quiz.html" data-nav="quiz">חידון</a></li>
            <li><a href="challenge.html" data-nav="challenge">אתגר</a></li>
        `;

    header.innerHTML = `
        <div class="header-inner">
            <a href="index.html" class="site-brand">
                <span class="brand-title">STAR WARS</span>
            </a>

            <nav class="site-nav">
                <ul>
                    ${links}
                </ul>
            </nav>
        </div>
    `;

    const page = document.body.dataset.page;
    const navLinks = document.querySelectorAll(".site-nav a");

    for (const link of navLinks) {
        if (link.dataset.nav === page) {
            link.classList.add("active");
        }
    }
}

function renderFooter() {
    const footer = $("site-footer");
    if (!footer) {
        return;
    }
    footer.innerHTML = `
        <div class="footer-inner">
            <p class="footer-text">
                built with HTML5 · CSS3 · JavaScript
            </p>
        </div>
    `;
}


function calcResult() {
    let jedi = 0;
    let sith = 0;

    const answers = document.querySelectorAll("#quiz-form input[type=radio]:checked");
    for (const answer of answers) {
        jedi += Number(answer.dataset.jedi);
        sith += Number(answer.dataset.sith);
    }
    if (jedi > sith) {return "jedi";}
    if (sith > jedi) {return "sith";}
    if (Math.random() < 0.5) {return "jedi";}
    return "sith";
}

function showResult(faction) {

    $("quiz-form").hidden = true;

    const panel = $("result-panel");

    panel.hidden = false;
    panel.className = "result-panel result-panel--" + faction;

    if (faction === "jedi") {

        $("result-title").textContent = "אתה שייך ל-Jedi";
        $("result-continue").href = "jedi.html";
        $("result-continue").textContent = "המשך אל ה-Jedi";

    } else {

        $("result-title").textContent = "אתה שייך ל-Sith";
        $("result-continue").href = "sith.html";
        $("result-continue").textContent = "המשך אל ה-Sith";
    }
}

function initQuizPage() {
    const form = $("quiz-form");
    if (!form) {
        return;
    }
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const faction = calcResult();
        setFaction(faction);
        showResult(faction);
        $("result-panel").scrollIntoView({
            behavior: "smooth"
        });
    });

    $("retake-quiz-btn").addEventListener("click", function () {
        form.reset();
        form.hidden = false;
        $("result-panel").hidden = true;
        form.scrollIntoView({
            behavior: "smooth"
        });

    });
}

let currentAnswer = 0;

function setFeedback(text, className) {

    $("math-feedback").textContent = text;
    $("math-feedback").className = className;
}

function newQuestion() {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;

    currentAnswer = a + b;

    $("math-question").textContent = a + " + " + b + " = ?";
    $("math-answer").value = "";
    $("math-answer").disabled = false;
    $("math-submit-btn").disabled = false;
    setFeedback("", "");
}

async function updateScoreDisplay() {

    try {
        const response = await fetch("/api/scores");

        const data = await response.json();

        $("score-jedi").textContent = data.jedi;
        $("score-sith").textContent = data.sith;

        if (data.jedi > data.sith) {
            $("score-leader").textContent = "מוביל: Jedi";
        }
        else if (data.sith > data.jedi) {
            $("score-leader").textContent = "מוביל: Sith";
        }
        else {
            $("score-leader").textContent = "תיקו";
        }
    }
    catch {
        $("score-jedi").textContent = "—";
        $("score-sith").textContent = "—";
        $("score-leader").textContent = "אין חיבור";
    }
}

async function addPoint(faction) {
    if (faction !== "jedi" && faction !== "sith") {
        return;
    }
    try {
        await fetch("/api/scores/" + faction, {
            method: "POST"
        });
    }
    catch {}
    updateScoreDisplay();
}

function initChallengePage() {
    const faction = getFaction();
    if (faction) {
        document.body.classList.add("theme-" + faction);
    }
    updateScoreDisplay();
    newQuestion();

    const form = $("math-form");

    if (!form) {
        return;
    }
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const input = $("math-answer");
        if (input.value.trim() === "") {
            setFeedback(
                "נא להזין מספר",
                "feedback-message feedback-error"
            );
            return;
        }
        const answer = Number(input.value);
        if (answer === currentAnswer) {
            setFeedback(
                "נכון! 🎉",
                "feedback-message feedback-success"
            );
            input.disabled = true;
            $("math-submit-btn").disabled = true;
            if (faction) {
                addPoint(faction);
            }
        }
        else {
            setFeedback(
                "לא נכון, נסה שוב",
                "feedback-message feedback-error"
            );
        }
    });

    $("new-question-btn").addEventListener("click", function () {
        newQuestion();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    const page = document.body.dataset.page;
    if (page === "quiz") {
        initQuizPage();
    }
    if (page === "challenge") {
        initChallengePage();
    }
});