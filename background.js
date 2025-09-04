const BACKEND_URL = 'http://127.0.0.1:5000/analyze';

// This function is injected into the webpage to extract its content
function scrapePageContent() {
    const textContent = document.body.innerText.substring(0, 8000);
    const title = document.title;
    const description = document.querySelector('meta[name="description"]')?.content || '';
    const links = [...document.querySelectorAll('a')].map(a => a.href).slice(0, 50);
    const inputs = [...document.querySelectorAll('input')];
    const hasPasswordInput = inputs.some(i => i.type === 'password');
    const inputTypes = inputs.map(i => i.type || 'text').slice(0, 30);
    
    return {
        url: window.location.href, textContent,
        metadata: { title, description },
        domElements: { links, hasPasswordInput, inputTypes }
    };
}

// Calls the backend, stores the result, and shows alerts
async function analyzeContent(pageData, tabId, tabUrl) {
    if (!pageData) {
        const idleResult = { status: 'idle', message: 'This is a browser page and cannot be scanned.', aiScore: 0, quantumVerified: false };
        chrome.runtime.sendMessage({ type: 'SCAN_RESULT', payload: idleResult });
        return;
    }

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pageData),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        const finalResult = { ...result, url: tabUrl, timestamp: new Date().getTime() };

        chrome.storage.local.set({ [tabUrl]: finalResult });
        chrome.runtime.sendMessage({ type: 'SCAN_RESULT', payload: finalResult });

        // --- NEW: Inject a warning banner on high-risk pages ---
        if (result.status === 'danger') {
            chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['warning.css']
            });
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: showWarningBanner,
                args: [result.message] // Pass the justification message
            });
        }
    } catch (error) {
        console.error('PhishGuardAI Analysis Error:', error);
        const errorResult = { status: 'error', message: `Analysis failed. Is the backend server running?`, aiScore: 0, quantumVerified: false };
        chrome.runtime.sendMessage({ type: 'SCAN_RESULT', payload: errorResult });
    }
}

// --- NEW: This function is injected onto the page to show the warning ---
function showWarningBanner(justification) {
    // Prevent multiple banners
    if (document.getElementById('phishguard-warning-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'phishguard-warning-banner';
    
    const icon = '&#9888;'; // Warning symbol
    const title = 'High-Risk Website Detected';
    
    banner.innerHTML = `
        <div class="phishguard-content">
            <div class="phishguard-icon">${icon}</div>
            <div class="phishguard-text">
                <div class="phishguard-title">${title}</div>
                <div class="phishguard-message">${justification}</div>
            </div>
        </div>
        <div class="phishguard-timer"></div>
    `;
    
    document.body.prepend(banner);

    // Remove the banner after 10 seconds
    setTimeout(() => {
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 500); // Wait for fade-out transition
    }, 10000);
}


// Main listener logic
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SCAN_PAGE') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab || !activeTab.id || !activeTab.url) return;

            if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('about:')) {
                analyzeContent(null, activeTab.id, activeTab.url);
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: scrapePageContent,
            }, (injectionResults) => {
                if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) {
                    console.error("PhishGuardAI scraping error:", chrome.runtime.lastError?.message);
                    return;
                }
                const pageData = injectionResults[0].result;
                // Pass tabId to analyzeContent
                analyzeContent(pageData, activeTab.id, activeTab.url);
            });
        });
    }
    return true;
});