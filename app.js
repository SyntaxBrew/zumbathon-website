document.addEventListener("DOMContentLoaded", () => {
    // ============================================================
    // CONFIGURATION SETTINGS
    // ============================================================
    const EVENT_DATE = new Date("June 5, 2026 00:00:00").getTime();
    const DONATION_PAGE_URL = "https://donate.bccancerfoundation.com/site/TR?px=3047741&fr_id=2800&pg=personal"; 
    const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(DONATION_PAGE_URL)}`;

    // ============================================================
    // 1. LIVE DONATION TRACKER BLOCK
    // ============================================================
    async function getDonationData() {
        try {
            const response = await fetch(PROXY_URL);
            if (!response.ok) throw new Error("Proxy connection failed.");
            
            const data = await response.json();
            const htmlString = data.contents;

            // Parse the string into readable HTML nodes
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, "text/html");

            // Luminate Online specific structural target matches
            const amountRaisedEl = doc.querySelector('.amount-raised, .progress-bar-value, .amount');
            const goalAmountEl = doc.querySelector('.goal-amount, .progress-bar-goal');
            const genericProgressEl = doc.querySelector('.progress-bar-container, .inner-progress');

            let raised = 0;
            let goal = 5000; // Default fallback goal

            // Extract Raised Amount
            if (amountRaisedEl) {
                raised = parseFloat(amountRaisedEl.textContent.replace(/[^0-9.]/g, ''));
            } else {
                // Regex fallback searching directly for currency configurations inside the html structure
                const raisedMatch = htmlString.match(/\$[\d,]+\.\d{2}/);
                if (raisedMatch) {
                    raised = parseFloat(raisedMatch[0].replace(/[^0-9.]/g, ''));
                }
            }

            // Extract Goal Amount
            if (goalAmountEl) {
                goal = parseFloat(goalAmountEl.textContent.replace(/[^0-9.]/g, ''));
            }

            // Render calculations to frontend dashboard nodes
            if (raised > 0) {
                updateDonationUI(raised, goal);
            } else {
                // Semi-hardcoded data approximation placeholder if platform returns zero values temporarily
                updateDonationUI(350, 5000); 
            }

        } catch (error) {
            console.error("Error connecting to BC Cancer Foundation elements:", error);
            updateDonationUI(350, 5000); // Fail-safe UI rendering defaults
        }
    }

    function updateDonationUI(raised, goal) {
        const percentage = Math.min((raised / goal) * 100, 100);
        
        document.getElementById("amount-raised").innerText = `$${raised.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        document.getElementById("amount-goal").innerText = `$${goal.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
        document.getElementById("progress-fill").style.width = `${percentage}%`;
    }

    // ============================================================
    // 2. HERO COUNTDOWN CLOCK BLOCK
    // ============================================================
    function startCountdown() {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = EVENT_DATE - now;

            if (distance < 0) {
                clearInterval(timer);
                document.querySelector(".countdown").innerHTML = "<div class='countdown-finished'>EVENT HAS STARTED! 🎉</div>";
                return;
            }

            // Metric time interval processing calculations
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Print values to existing HTML placeholder element bindings
            document.getElementById("days").innerText = String(days).padStart(2, "0");
            document.getElementById("hours").innerText = String(hours).padStart(2, "0");
            document.getElementById("minutes").innerText = String(minutes).padStart(2, "0");
            document.getElementById("seconds").innerText = String(seconds).padStart(2, "0");
        }, 1000);
    }

    // Execute application subsystems
    getDonationData();
    startCountdown();
});