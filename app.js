/**
 * AI Resume Optimizer - App logic
 * Low-latency, client-side SPA state, routing, and animations.
 */

import { ROASTER_CONFIG } from "./roasterConfig.js";

// Application State
const state = {
  resumeFile: null,
  resumeText: "",
  jobDescription: "",
  hasAnalyzed: false,
  currentScore: 85,
  activeTab: "optimize",
  toolsTab: "cover",
  aiProvider: localStorage.getItem("ai_provider") || "gemini",
  aiModel: localStorage.getItem("ai_model") || (localStorage.getItem("ai_provider") === "openai" ? "gpt-4o-mini" : "gemini-3.5-flash"),
  apiKey: (localStorage.getItem("ai_provider") || "gemini") === "gemini"
    ? localStorage.getItem("gemini_api_key") || ""
    : localStorage.getItem("openai_api_key") || "",
  currentTipIndex: 0,
  optimizationsHistory: [
    { role: "Senior UX Designer", company: "Google Inc.", score: 88, time: "2 hours ago", status: "success", delta: "+14 pts" },
    { role: "Product Manager", company: "Stripe Financial", score: 74, time: "Yesterday", status: "primary", delta: "Optimized" }
  ]
};

// DOM Cache
const dom = {
  logoBtn: document.getElementById("logo-btn"),
  navLinks: document.querySelectorAll(".nav-link"),
  bottomNavItems: document.querySelectorAll(".nav-item"),
  viewPanels: document.querySelectorAll(".view-panel"),
  
  // Navigation elements that are conditionally visible
  navLinkAnalysis: document.getElementById("nav-link-analysis"),
  bottomNavAnalysis: document.getElementById("bottom-nav-analysis"),
  
  // Optimize view
  dropZone: document.getElementById("drop-zone"),
  fileInput: document.getElementById("file-input"),
  uploadStatusText: document.getElementById("upload-status-text"),
  uploadSubtext: document.getElementById("upload-subtext"),
  jobInput: document.getElementById("job-description-input"),
  optimizeBtn: document.getElementById("optimize-btn"),
  dismissTipBtn: document.getElementById("dismiss-tip-btn"),
  tipCard: document.getElementById("tip-card"),
  seeExamplesBtn: document.getElementById("see-examples-btn"),
  tipTextContent: document.getElementById("tip-text-content"),
  tipExamplesContainer: document.getElementById("tip-examples-container"),
  tipBeforeText: document.getElementById("tip-before-text"),
  tipAfterText: document.getElementById("tip-after-text"),
  tipIndexLabel: document.getElementById("tip-index-label"),
  nextTipBtn: document.getElementById("next-tip-btn"),
  historyContainer: document.getElementById("history-container"),
  
  // Analysis view
  backToOptimizeBtn: document.getElementById("back-to-optimize-btn"),
  radialProgressBar: document.getElementById("radial-progress-bar"),
  analysisScoreVal: document.getElementById("analysis-score-val"),
  fitHeading: document.getElementById("fit-heading"),
  fitSummaryShort: document.getElementById("fit-summary-short"),
  analysisSummaryText: document.getElementById("analysis-summary-text"),
  foundKeywordsList: document.getElementById("found-keywords-list"),
  missingKeywordsList: document.getElementById("missing-keywords-list"),
  keywordsHelpBtn: document.getElementById("keywords-help-btn"),
  suggestionsListContainer: document.getElementById("suggestions-list-container"),
  
  // Tools view
  tabBtnCover: document.getElementById("tab-btn-cover"),
  tabBtnLinkedin: document.getElementById("tab-btn-linkedin"),
  tabBtnResume: document.getElementById("tab-btn-resume"),
  panelCover: document.getElementById("panel-cover"),
  panelLinkedin: document.getElementById("panel-linkedin"),
  panelResume: document.getElementById("panel-resume"),
  copyLetterBtn: document.getElementById("copy-letter-btn"),
  coverLetterText: document.getElementById("cover-letter-text"),
  copyResumeBtn: document.getElementById("copy-resume-btn"),
  downloadResumeBtn: document.getElementById("download-resume-btn"),
  optimizedResumeText: document.getElementById("optimized-resume-text"),
  toolsAtsScore: document.getElementById("tools-ats-score"),
  toolsProgressFill: document.getElementById("tools-progress-fill"),
  dashboardAtsScore: document.getElementById("dashboard-ats-score"),
  
  // Settings view & controls
  profileBtn: document.getElementById("profile-btn"),
  settingsModal: document.getElementById("settings-modal"),
  closeSettingsBtn: document.getElementById("close-settings-btn"),
  saveKeyBtn: document.getElementById("save-key-btn"),
  clearKeyBtn: document.getElementById("clear-key-btn"),
  apiKeyInput: document.getElementById("api-key-input"),
  apiKeyLabel: document.getElementById("api-key-label"),
  keyStatusText: document.getElementById("key-status-text"),
  keyStatusDot: document.getElementById("key-status-dot"),
  providerSelect: document.getElementById("provider-select"),
  modelSelect: document.getElementById("model-select"),
  
  // User Profile Account Dropdown & Chat Drawer
  avatarBtn: document.getElementById("avatar-btn"),
  profileDropdown: document.getElementById("profile-dropdown"),
  dropdownProplanTrigger: document.getElementById("dropdown-proplan-trigger"),
  dropdownSettingsTrigger: document.getElementById("dropdown-settings-trigger"),
  dropdownSignoutTrigger: document.getElementById("dropdown-signout-trigger"),
  
  chatDrawer: document.getElementById("chat-drawer"),
  closeChatBtn: document.getElementById("close-chat-btn"),
  chatBody: document.getElementById("chat-body"),
  chatInput: document.getElementById("chat-input"),
  sendChatBtn: document.getElementById("send-chat-btn"),
  
  // Download Options Dropdown
  downloadDropdown: document.getElementById("download-dropdown"),
  downloadItems: document.querySelectorAll(".download-item"),
  
  // Resume Roaster
  roastTriggerBtn: document.getElementById("roast-trigger-btn"),
  backFromRoasterBtn: document.getElementById("back-from-roaster-btn"),
  roasterIframe: document.getElementById("roaster-iframe"),
  roasterIframeLoader: document.getElementById("roaster-iframe-loader"),
  roasterFrameContainer: document.getElementById("roaster-frame-container"),
  
  // Miscellaneous
  fabHelpBtn: document.getElementById("fab-help-btn"),
  loadingOverlay: document.getElementById("loading-overlay"),
  toast: document.getElementById("notification-toast")
};

// ==================== SETTINGS MANAGEMENT ====================

function initSettings() {
  dom.providerSelect.value = state.aiProvider;

  // Render model selection dynamically
  dom.modelSelect.innerHTML = "";
  if (state.aiProvider === "gemini") {
    dom.modelSelect.innerHTML = `
      <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
      <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option>
    `;
    dom.apiKeyLabel.textContent = "GEMINI API KEY";
    dom.apiKeyInput.placeholder = "AIzaSy...";
    state.apiKey = localStorage.getItem("gemini_api_key") || "";
    state.aiModel = localStorage.getItem("ai_model") || "gemini-3.5-flash";
    if (!["gemini-3.5-flash", "gemini-3.1-flash-lite"].includes(state.aiModel)) {
      state.aiModel = "gemini-3.5-flash";
    }
  } else {
    dom.modelSelect.innerHTML = `
      <option value="gpt-4o-mini">GPT-4o Mini</option>
      <option value="gpt-4o">GPT-4o</option>
    `;
    dom.apiKeyLabel.textContent = "OPENAI API KEY";
    dom.apiKeyInput.placeholder = "sk-proj-...";
    state.apiKey = localStorage.getItem("openai_api_key") || "";
    state.aiModel = localStorage.getItem("ai_model") || "gpt-4o-mini";
    if (!["gpt-4o-mini", "gpt-4o"].includes(state.aiModel)) {
      state.aiModel = "gpt-4o-mini";
    }
  }

  dom.modelSelect.value = state.aiModel;
  dom.apiKeyInput.value = state.apiKey;

  if (state.apiKey) {
    dom.keyStatusText.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px; color: var(--secondary);">check_circle</span> Configured`;
    dom.keyStatusText.style.color = "var(--secondary)";
    dom.keyStatusDot.className = "key-status-dot configured";
  } else {
    dom.keyStatusText.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px; color: var(--error);">warning</span> Not Configured`;
    dom.keyStatusText.style.color = "var(--error)";
    dom.keyStatusDot.className = "key-status-dot unconfigured";
  }
}

// Switch Provider Dropdown Event
dom.providerSelect.addEventListener("change", (e) => {
  state.aiProvider = e.target.value;
  localStorage.setItem("ai_provider", e.target.value);
  // Reset default model when switching provider
  state.aiModel = e.target.value === "openai" ? "gpt-4o-mini" : "gemini-3.5-flash";
  localStorage.setItem("ai_model", state.aiModel);
  initSettings();
});

// Switch Model Event
dom.modelSelect.addEventListener("change", (e) => {
  state.aiModel = e.target.value;
  localStorage.setItem("ai_model", e.target.value);
});

dom.profileBtn.addEventListener("click", () => {
  dom.settingsModal.classList.toggle("active");
  initSettings();
});

dom.closeSettingsBtn.addEventListener("click", () => {
  dom.settingsModal.classList.remove("active");
});

dom.saveKeyBtn.addEventListener("click", () => {
  const value = dom.apiKeyInput.value.trim();
  if (!value) {
    showToast("Please enter an API key.");
    return;
  }
  
  if (state.aiProvider === "gemini") {
    localStorage.setItem("gemini_api_key", value);
  } else {
    localStorage.setItem("openai_api_key", value);
  }
  
  state.apiKey = value;
  initSettings();
  dom.settingsModal.classList.remove("active");
  showToast(`${state.aiProvider === "gemini" ? "Gemini" : "OpenAI"} API key saved!`);
});

dom.clearKeyBtn.addEventListener("click", () => {
  if (state.aiProvider === "gemini") {
    localStorage.removeItem("gemini_api_key");
  } else {
    localStorage.removeItem("openai_api_key");
  }
  state.apiKey = "";
  initSettings();
  showToast(`${state.aiProvider === "gemini" ? "Gemini" : "OpenAI"} API key cleared.`);
});

// Run settings initializer
initSettings();
updateAtsScore(state.currentScore);

// ==================== PROFILE DROPDOWN MANAGEMENT ====================

if (dom.avatarBtn && dom.profileDropdown) {
  dom.avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dom.profileDropdown.classList.toggle("active");
    dom.settingsModal.classList.remove("active"); // close settings modal if open
  });
  
  if (dom.dropdownProplanTrigger) {
    dom.dropdownProplanTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dom.profileDropdown.classList.remove("active");
      switchView("tools");
      switchToolsTab("resume");
      showToast("Welcome to your Premium Pro Optimized Resume panel!");
    });
  }
  
  if (dom.dropdownSettingsTrigger) {
    dom.dropdownSettingsTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dom.profileDropdown.classList.remove("active");
      dom.settingsModal.classList.add("active");
      initSettings();
    });
  }
  
  if (dom.dropdownSignoutTrigger) {
    dom.dropdownSignoutTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dom.profileDropdown.classList.remove("active");
      localStorage.removeItem("gemini_api_key");
      state.apiKey = "";
      initSettings();
      showToast("Signed out. Saved configuration cleared.");
    });
  }
}

// Click outside to dismiss dropdowns
window.addEventListener("click", (e) => {
  // Dismiss profile dropdown
  if (dom.profileDropdown && dom.avatarBtn && dom.profileDropdown.classList.contains("active") && !dom.profileDropdown.contains(e.target) && !dom.avatarBtn.contains(e.target)) {
    dom.profileDropdown.classList.remove("active");
  }
  // Dismiss settings modal
  if (dom.settingsModal && dom.settingsModal.classList.contains("active") && e.target === dom.settingsModal) {
    dom.settingsModal.classList.remove("active");
  }
});

// ==================== CLIENT-SIDE RESUME PARSING ====================


function parseTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error("Failed to read text file."));
    reader.readAsText(file);
  });
}

async function parsePDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      text += strings.join(" ") + "\n";
    }
    return text;
  } catch (err) {
    console.error("PDF.js error: ", err);
    throw new Error("Failed to parse PDF document. Make sure it contains extractable text.");
  }
}

async function parseDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
  } catch (err) {
    console.error("Mammoth error: ", err);
    throw new Error("Failed to parse DOCX document.");
  }
}

async function parseResumeFile(file) {
  const fileName = file.name;
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  if (ext === '.txt') return await parseTXT(file);
  if (ext === '.pdf') return await parsePDF(file);
  if (ext === '.docx') return await parseDOCX(file);
  throw new Error("Unsupported file extension");
}

// ==================== ROUTING SYSTEM ====================

function switchView(targetViewId) {
  // Check if trying to view analysis without analyzing first
  if (targetViewId === "analysis" && !state.hasAnalyzed) {
    showToast("Please run an optimization scan first!");
    return;
  }

  state.activeTab = targetViewId;

  // Toggle active view panel
  dom.viewPanels.forEach(panel => {
    panel.classList.remove("active");
    if (panel.id === `view-${targetViewId}`) {
      panel.classList.add("active");
    }
  });

  // Update header navigation links active state
  dom.navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.dataset.target === targetViewId) {
      link.classList.add("active");
    }
  });

  // Update bottom navigation bar items active state
  dom.bottomNavItems.forEach(item => {
    item.classList.remove("active");
    if (item.dataset.target === targetViewId) {
      item.classList.add("active");
      // Add visual icon filling effect if supported
      const icon = item.querySelector(".material-symbols-outlined");
      if (icon) {
        icon.style.fontVariationSettings = "'FILL' 1";
      }
    } else {
      const icon = item.querySelector(".material-symbols-outlined");
      if (icon) {
        icon.style.fontVariationSettings = "'FILL' 0";
      }
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Trigger special actions based on view
  if (targetViewId === "analysis") {
    updateAtsScore(state.currentScore);
  }
}

// Bind routing events
dom.logoBtn.addEventListener("click", () => switchView("optimize"));
dom.navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    switchView(link.dataset.target);
  });
});
dom.bottomNavItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    switchView(item.dataset.target);
  });
});
dom.backToOptimizeBtn.addEventListener("click", () => switchView("optimize"));

// ==================== FILE UPLOAD HANDLER ====================

// Click to browse
dom.dropZone.addEventListener("click", () => {
  dom.fileInput.click();
});

dom.fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleSelectedFile(e.target.files[0]);
  }
});

// Drag and drop events
['dragenter', 'dragover'].forEach(eventName => {
  dom.dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dom.dropZone.classList.add("dragover");
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dom.dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dom.dropZone.classList.remove("dragover");
  }, false);
});

dom.dropZone.addEventListener("drop", (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length > 0) {
    handleSelectedFile(files[0]);
  }
}, false);

function handleSelectedFile(file) {
  // Validate extension
  const validExtensions = ['.pdf', '.docx', '.txt'];
  const fileName = file.name;
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  
  if (!validExtensions.includes(extension)) {
    showToast("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
    return;
  }

  // Validate size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showToast("File is too large. Max limit is 5MB.");
    return;
  }

  state.resumeFile = file;
  dom.uploadStatusText.innerHTML = `<span style="color: var(--primary); font-weight: 600;">${fileName}</span>`;
  dom.uploadSubtext.textContent = "File selected. Ready to optimize.";
  showToast("Resume uploaded successfully!");
}

// ==================== REAL-TIME MULTI-PROVIDER AI CHECKER ====================

dom.optimizeBtn.addEventListener("click", async () => {
  const jobText = dom.jobInput.value.trim();
  
  if (!state.resumeFile) {
    showToast("Please upload your resume first!");
    return;
  }
  
  if (!jobText) {
    showToast("Please paste the target job description!");
    return;
  }

  // Verify key is set for active provider
  const activeKey = state.aiProvider === "gemini" 
    ? localStorage.getItem("gemini_api_key") 
    : localStorage.getItem("openai_api_key");
    
  if (!activeKey) {
    dom.settingsModal.classList.add("active");
    showToast(`Please configure your ${state.aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key in Settings first.`);
    return;
  }

  state.jobDescription = jobText;
  
  // Show loading spinner overlay
  dom.loadingOverlay.classList.add("active");

  // Dynamic scanner step simulation
  const statuses = [
    "Parsing resume document structure...",
    "Extracting profile skills and achievements...",
    "Benchmarking resume against recruiter keywords...",
    "Matching candidate credentials to ATS templates...",
    "Assembling tailored resume refactoring schema..."
  ];
  let currentStatusIdx = 0;
  const statusEl = document.getElementById("scanner-status");
  if (statusEl) statusEl.textContent = statuses[0];

  const statusInterval = setInterval(() => {
    currentStatusIdx = (currentStatusIdx + 1) % statuses.length;
    if (statusEl) statusEl.textContent = statuses[currentStatusIdx];
  }, 1200);

  try {
    // 1. Extract text from uploaded Resume File
    const resumeText = await parseResumeFile(state.resumeFile);
    state.resumeText = resumeText;
    
    // 2. Query Selected AI Provider
    const analysis = await queryAIService(resumeText, jobText);
    
    // 3. Render analysis outputs to the DOM
    renderAnalysisResults(analysis);
    
    // Set flag and unlock tabs
    state.hasAnalyzed = true;
    dom.navLinkAnalysis.style.display = "block";
    dom.bottomNavAnalysis.style.display = "flex";
    
    // Hide loader
    clearInterval(statusInterval);
    dom.loadingOverlay.classList.remove("active");
    
    // Route to results
    switchView("analysis");
    showToast("Resume optimization complete!");
    
  } catch (err) {
    console.error("Optimization error: ", err);
    clearInterval(statusInterval);
    dom.loadingOverlay.classList.remove("active");
    showToast(`Error: ${err.message || "Failed to analyze resume. Check your API key."}`);
  }
});

async function queryAIService(resumeText, jobText) {
  const prompt = `You are an expert ATS review system and career coach.
Analyze the candidate's Resume Text against the target Job Description.
Identify key alignment, missing terms, design advice, and draft optimized copy.
You must return the analysis strictly as a valid, parsable JSON block matching this schema:
{
  "score": <number representing ATS match score between 0 and 100>,
  "fitHeading": "<2-4 words overall summary heading like 'Excellent Fit!', 'Strong Match!', or 'Needs Work'>",
  "fitSummaryShort": "<short 1-sentence fit summary>",
  "analysisSummaryText": "<detailed 2-3 sentence analysis of alignment and missing areas>",
  "foundKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword3", "keyword4", ...],
  "coverLetter": "<a complete tailored cover letter draft based on the resume and job description>",
  "linkedInHeadline": "<suggested optimized high-impact LinkedIn headline>",
  "linkedInTips": ["tip 1", "tip 2"],
  "bulletSuggestions": [
    { "type": "Impact Sentence"|"Experience Gap", "suggestion": "Suggested action phrase...", "textToApply": "Text details to copy/apply" }
  ],
  "optimizedResume": "<a completely rewritten, refactored, and polished version of the candidate's entire resume, tailored to fit the target job description perfectly. Ensure all standard sections (Summary, Skills, Experience, Education) are presented clearly in standard text format. Include quantified metrics in accomplishments to make it stand out.>"
}

Resume Text:
${resumeText}

Job Description:
${jobText}`;

  if (state.aiProvider === "gemini") {
    return await queryGeminiAPI(prompt);
  } else {
    return await queryOpenAIAPI(prompt);
  }
}

async function executeGeminiRequest(prompt, model, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
    throw new Error(`Gemini API error: ${errorMessage}`);
  }

  const resData = await response.json();
  const textResult = resData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResult) {
    throw new Error("Empty response received from Gemini API.");
  }

  return parseJSONResponse(textResult);
}

async function queryGeminiAPI(prompt) {
  const apiKey = localStorage.getItem("gemini_api_key");
  const model = state.aiModel || "gemini-3.5-flash";

  try {
    return await executeGeminiRequest(prompt, model, apiKey);
  } catch (err) {
    const errMsg = err.message || "";
    if (errMsg.includes("high demand") || errMsg.includes("503") || errMsg.includes("overloaded") || errMsg.includes("limit")) {
      const fallbackModel = model === "gemini-3.5-flash" ? "gemini-3.1-flash-lite" : "gemini-3.5-flash";
      console.warn(`Primary model ${model} failed. Retrying with fallback: ${fallbackModel}`);
      try {
        return await executeGeminiRequest(prompt, fallbackModel, apiKey);
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw err;
  }
}

async function queryOpenAIAPI(prompt) {
  const apiKey = localStorage.getItem("openai_api_key");
  const model = state.aiModel || "gpt-4o-mini";
  const url = "https://api.openai.com/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }

  const resData = await response.json();
  const textResult = resData.choices?.[0]?.message?.content;
  if (!textResult) {
    throw new Error("Empty response received from OpenAI API.");
  }

  return parseJSONResponse(textResult);
}

function parseJSONResponse(textResult) {
  let cleanText = textResult.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  return JSON.parse(cleanText.trim());
}

function renderAnalysisResults(analysis) {
  const newScore = analysis.score || 85;
  updateAtsScore(newScore);
  
  dom.fitHeading.textContent = analysis.fitHeading || "Analysis Complete";
  dom.fitSummaryShort.textContent = analysis.fitSummaryShort || "";
  dom.analysisSummaryText.textContent = analysis.analysisSummaryText || "";
  
  // Render keywords lists
  dom.foundKeywordsList.innerHTML = "";
  dom.missingKeywordsList.innerHTML = "";
  
  const foundKws = analysis.foundKeywords || [];
  foundKws.forEach(kw => {
    const el = document.createElement("div");
    el.className = "keyword-tag found";
    el.innerHTML = `<span class="material-symbols-outlined">check_circle</span><span>${kw}</span>`;
    dom.foundKeywordsList.appendChild(el);
  });
  
  const missingKws = analysis.missingKeywords || [];
  missingKws.forEach(kw => {
    const el = document.createElement("div");
    el.className = "keyword-tag missing";
    el.innerHTML = `<span class="material-symbols-outlined">warning</span><span>${kw}</span>`;
    el.addEventListener("click", () => showKeywordHelper(kw));
    dom.missingKeywordsList.appendChild(el);
  });
  
  const total = foundKws.length + missingKws.length;
  document.getElementById("keyword-count-badge").textContent = `${foundKws.length}/${total} Found`;
  
  // Render Cover Letter
  dom.coverLetterText.value = analysis.coverLetter || "";
  
  // Render Optimized Resume
  dom.optimizedResumeText.value = analysis.optimizedResume || "";
  
  // Render LinkedIn tips
  if (analysis.linkedInHeadline) {
    document.getElementById("linkedin-headline-val").textContent = `"${analysis.linkedInHeadline}"`;
  }
  
  // Render smart improvements suggestions list
  dom.suggestionsListContainer.innerHTML = "";
  const suggestions = analysis.bulletSuggestions || [];
  suggestions.forEach((sug, idx) => {
    const icon = sug.type === "Impact Sentence" ? "lightbulb" : "psychology";
    const box = document.createElement("div");
    box.className = "bullet-fix-box";
    box.innerHTML = `
      <div class="bullet-fix-icon">
        <span class="material-symbols-outlined">${icon}</span>
      </div>
      <div class="bullet-fix-content">
        <p class="font-label-md" style="font-weight: bold; color: var(--on-surface);">${sug.type} Suggestion</p>
        <p class="font-body-md text-on-surface-variant" style="font-style: italic; margin-top: 4px;">
          "${sug.suggestion}"
        </p>
        <span class="bullet-fix-cta" id="sug-cta-${idx}">Apply this change &rarr;</span>
      </div>
    `;
    dom.suggestionsListContainer.appendChild(box);
    
    // Bind click event
    box.querySelector(`#sug-cta-${idx}`).addEventListener("click", () => {
      showToast("Applied suggestion detail to clipboard!");
      navigator.clipboard.writeText(sug.textToApply || sug.suggestion);
    });
  });
}


function addNewHistoryItem(score) {
  const jdInput = dom.jobInput.value;
  // Get job title
  let role = "UX Researcher";
  if (jdInput.toLowerCase().includes("product manager")) role = "Product Manager";
  else if (jdInput.toLowerCase().includes("engineer") || jdInput.toLowerCase().includes("developer")) role = "Software Engineer";
  else role = "Senior UX Designer";
  
  const newItem = {
    role: role,
    company: "Nexus Technologies",
    score: score,
    time: "Just now",
    status: score >= 85 ? "success" : "primary",
    delta: `+${Math.floor(Math.random() * 8) + 4} pts`
  };

  // Add to start of array
  state.optimizationsHistory.unshift(newItem);
  renderHistory();
}

function renderHistory() {
  // Empty recent optimizations block and re-populate
  const headerHtml = dom.historyContainer.previousElementSibling.outerHTML;
  
  // Re-generate list
  let cardsHtml = "";
  state.optimizationsHistory.forEach(item => {
    const badgeClass = item.status === "success" ? "success" : "pending";
    const barClass = item.status === "success" ? "success" : "primary";
    const iconClass = item.status === "success" ? "trending_up" : "check_circle";
    
    cardsHtml += `
      <div class="glass-card history-card" data-score="${item.score}" data-role="${item.role}" data-company="${item.company}">
        <div class="history-meta">
          <div class="history-icon-box ${item.status === 'success' ? '' : 'pending'}">
            <span class="material-symbols-outlined">description</span>
          </div>
          <div style="text-align: right;">
            <div class="history-badge ${badgeClass}">
              <span class="material-symbols-outlined" style="font-size: 16px;">${iconClass}</span>
              <span class="font-label-sm">${item.delta}</span>
            </div>
            <div class="history-time">${item.time}</div>
          </div>
        </div>
        <h4 class="font-label-md">${item.role}</h4>
        <p class="font-body-md text-on-surface-variant">${item.company}</p>
        <div class="history-progress-bar">
          <div class="avatar-stack">
            <div class="avatar-stack-item">AI</div>
            <div class="avatar-stack-item" style="background-color: var(--primary-container); color: white;">JD</div>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${barClass}" style="width: ${item.score}%;"></div>
          </div>
          <span class="font-label-sm">${item.score}%</span>
        </div>
      </div>
    `;
  });

  // Re-add placeholder card
  cardsHtml += `
    <div class="history-empty" id="empty-state-trigger">
      <span class="material-symbols-outlined">history</span>
      <p class="font-label-md">Analyze more resumes to see<br/>detailed trends and insights here.</p>
    </div>
  `;

  dom.historyContainer.innerHTML = cardsHtml;
  
  // Re-bind click events for history items
  document.querySelectorAll(".history-card").forEach(card => {
    card.addEventListener("click", () => {
      const selectedScore = parseInt(card.dataset.score);
      updateAtsScore(selectedScore);
      dom.fitHeading.textContent = selectedScore >= 85 ? "Excellent Fit!" : "Strong Match!";
      switchView("analysis");
    });
  });
}

// Bind initial history cards
renderHistory();

// ==================== CIRCULAR PROGRESS ANIMATION ====================

function updateAtsScore(score) {
  state.currentScore = score;
  
  if (dom.analysisScoreVal) dom.analysisScoreVal.textContent = `${score}%`;
  if (dom.toolsAtsScore) dom.toolsAtsScore.textContent = `${score}%`;
  if (dom.dashboardAtsScore) dom.dashboardAtsScore.textContent = `${score}% ATS Score`;
  
  if (dom.toolsProgressFill) {
    dom.toolsProgressFill.style.width = `${score}%`;
  }
  
  animateScoreCircle(score);
}

function animateScoreCircle(score) {
  // SVG radius is 70, circumference is 2 * PI * 70 = ~439.8 (440)
  const circumference = 440;
  if (!dom.radialProgressBar) return;
  dom.radialProgressBar.style.strokeDashoffset = circumference;
  
  // Allow DOM rendering frame to start offset animation
  requestAnimationFrame(() => {
    setTimeout(() => {
      const offset = circumference - (circumference * score) / 100;
      dom.radialProgressBar.style.strokeDashoffset = offset;
    }, 100);
  });
}

// ==================== CAREER TOOLS TAB SWITCHER ====================

function switchToolsTab(tab) {
  state.toolsTab = tab;
  
  // Reset all active classes
  dom.tabBtnCover.classList.remove("active");
  dom.tabBtnLinkedin.classList.remove("active");
  dom.tabBtnResume.classList.remove("active");
  dom.panelCover.classList.remove("active");
  dom.panelLinkedin.classList.remove("active");
  dom.panelResume.classList.remove("active");
  
  // Set target active
  if (tab === "cover") {
    dom.tabBtnCover.classList.add("active");
    dom.panelCover.classList.add("active");
  } else if (tab === "linkedin") {
    dom.tabBtnLinkedin.classList.add("active");
    dom.panelLinkedin.classList.add("active");
  } else if (tab === "resume") {
    dom.tabBtnResume.classList.add("active");
    dom.panelResume.classList.add("active");
  }
}

// Export switch tab to window for onclick handlers
window.switchToolsTab = switchToolsTab;

// ==================== COPY COVER LETTER ====================

dom.copyLetterBtn.addEventListener("click", () => {
  dom.coverLetterText.select();
  dom.coverLetterText.setSelectionRange(0, 99999);
  
  try {
    navigator.clipboard.writeText(dom.coverLetterText.value);
    showToast("Cover Letter copied to clipboard!");
    
    // Visual feedback
    const originalText = dom.copyLetterBtn.innerHTML;
    dom.copyLetterBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">check</span><span>Copied!</span>';
    dom.copyLetterBtn.style.background = "var(--secondary)";
    
    setTimeout(() => {
      dom.copyLetterBtn.innerHTML = originalText;
      dom.copyLetterBtn.style.background = "";
    }, 2000);
  } catch (err) {
    showToast("Failed to copy text automatically.");
  }
});

// ==================== COPY & DOWNLOAD OPTIMIZED RESUME ====================

dom.copyResumeBtn.addEventListener("click", () => {
  dom.optimizedResumeText.select();
  dom.optimizedResumeText.setSelectionRange(0, 99999);
  
  try {
    navigator.clipboard.writeText(dom.optimizedResumeText.value);
    showToast("Optimized Resume copied to clipboard!");
    
    const originalText = dom.copyResumeBtn.innerHTML;
    dom.copyResumeBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">check</span><span>Copied!</span>';
    dom.copyResumeBtn.style.background = "var(--secondary)";
    
    setTimeout(() => {
      dom.copyResumeBtn.innerHTML = originalText;
      dom.copyResumeBtn.style.background = "";
    }, 2000);
  } catch (err) {
    showToast("Failed to copy text automatically.");
  }
});

// Toggle download dropdown
dom.downloadResumeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const text = dom.optimizedResumeText.value;
  if (!text || text.startsWith("Please configure") || text.startsWith("Please run")) {
    showToast("No optimized resume content to download.");
    return;
  }
  const isHidden = dom.downloadDropdown.style.display === "none" || dom.downloadDropdown.style.display === "";
  dom.downloadDropdown.style.display = isHidden ? "flex" : "none";
});

// Hide download dropdown on document click
document.addEventListener("click", (e) => {
  if (dom.downloadDropdown && !dom.downloadDropdown.contains(e.target) && e.target !== dom.downloadResumeBtn) {
    dom.downloadDropdown.style.display = "none";
  }
});

// Bind download formats
dom.downloadItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    dom.downloadDropdown.style.display = "none";
    
    const format = item.dataset.format;
    const text = dom.optimizedResumeText.value;
    
    let originalName = "Resume";
    if (state.resumeFile) {
      originalName = state.resumeFile.name.slice(0, state.resumeFile.name.lastIndexOf('.'));
    }
    
    try {
      if (format === "txt") {
        triggerBlobDownload(text, `${originalName}_Optimized.txt`, "text/plain;charset=utf-8");
      } else if (format === "md") {
        triggerBlobDownload(text, `${originalName}_Optimized.md`, "text/markdown;charset=utf-8");
      } else if (format === "html") {
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Optimized Resume</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1c1b1f; max-width: 800px; margin: 40px auto; padding: 24px; background-color: #fcfbfe; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 0.95rem; background: #ffffff; padding: 24px; border: 1px solid #e1e0e5; border-radius: 12px; box-shadow: 0 4px 12px rgba(53, 37, 205, 0.05); }
  </style>
</head>
<body>
  <pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>`;
        triggerBlobDownload(htmlContent, `${originalName}_Optimized.html`, "text/html;charset=utf-8");
      } else if (format === "pdf") {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Optimized Resume - Print Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1c1b1f; padding: 20px; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 0.95rem; border: none; }
    @media print {
      body { padding: 0; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
        window.close();
      }, 500);
    }
  </script>
</body>
</html>`);
        printWindow.document.close();
        showToast("Triggering browser PDF print dialog...");
      }
    } catch (err) {
      console.error(err);
      showToast("Download failed.");
    }
  });
});

function triggerBlobDownload(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(`${filename} download triggered!`);
}

// ==================== CHECKLIST & INTERACTIVE ACTIONS ====================

// Toggle avatar list item
document.getElementById("chk-item-avatar").addEventListener("click", () => {
  const item = document.getElementById("chk-item-avatar");
  const action = document.getElementById("chk-action-avatar");
  const isDone = item.classList.contains("done");
  
  if (isDone) {
    item.classList.remove("done");
    action.textContent = "OPTIMIZE";
    action.className = "checklist-right action";
    showToast("Profile avatar checklist item unchecked.");
    updateAtsScore(Math.max(state.currentScore - 3, 0));
  } else {
    item.classList.add("done");
    action.textContent = "DONE";
    action.className = "checklist-right done";
    showToast("Profile avatar checklist item completed!");
    updateAtsScore(Math.min(state.currentScore + 3, 99));
  }
});

// Toggle portfolio list item
document.getElementById("chk-item-portfolio").addEventListener("click", () => {
  const item = document.getElementById("chk-item-portfolio");
  const action = document.getElementById("chk-action-portfolio");
  const isDone = item.classList.contains("done");
  
  if (isDone) {
    item.classList.remove("done");
    action.textContent = "OPTIMIZE NOW";
    action.className = "checklist-right action";
    showToast("Portfolio checklist item unchecked.");
    updateAtsScore(Math.max(state.currentScore - 2, 0));
  } else {
    item.classList.add("done");
    action.textContent = "DONE";
    action.className = "checklist-right done";
    showToast("LinkedIn section configured for portfolio integrations!");
    updateAtsScore(Math.min(state.currentScore + 2, 99));
  }
});

// Toggle recruiter open states
document.getElementById("chk-item-work").addEventListener("click", () => {
  const item = document.getElementById("chk-item-work");
  const action = document.getElementById("chk-action-work");
  const isDone = item.classList.contains("done");
  
  if (isDone) {
    item.classList.remove("done");
    action.textContent = "SETUP";
    action.className = "checklist-right action";
    showToast("Recruiter filter disabled.");
    updateAtsScore(Math.max(state.currentScore - 2, 0));
  } else {
    item.classList.add("done");
    action.textContent = "DONE";
    action.className = "checklist-right done";
    showToast("Restricted Open to Work recruiters filter is enabled.");
    updateAtsScore(Math.min(state.currentScore + 2, 99));
  }
});


function applySuggestion(id) {
  if (id === 1) {
    showToast("Applied conversion funnels phrase to clipboard!");
    navigator.clipboard.writeText("Spearheaded design for user acquisition funnel, improving conversion rate by 14% through data-driven iterations.");
  } else {
    // Navigate user to cover letter tab with drafted details
    switchView("tools");
    switchToolsTab("cover");
    
    // Prepend dynamic draft
    dom.coverLetterText.value = `[DRAFTED NOTE: Highly experienced in stakeholder management, streamlining review pipelines, and cross-functional leadership...]\n\n` + dom.coverLetterText.value;
    showToast("Drafted stakeholder management phrase in Cover Letter!");
  }
}
window.applySuggestion = applySuggestion;

function showKeywordHelper(kw) {
  showToast(`Tip: Include "${kw}" in your latest experience description.`);
}

// AI Insider Tips Data
const aiTips = [
  {
    tip: "Resumes specifying quantified career achievements see a 40% higher recruiter engagement rate.",
    before: "Responsible for designing and maintaining the design system.",
    after: "Designed and maintained a centralized Figma design system, reducing design-to-development handoff by <strong>32%</strong> across 4 product lines."
  },
  {
    tip: "Using active verbs instead of passive phrases (like 'assisted with') makes your impact stand out.",
    before: "Assisted with updating the user signup flow to reduce dropoffs.",
    after: "Spearheaded user signup funnel redesign, decreasing onboarding friction and driving a <strong>14% increase</strong> in conversion."
  },
  {
    tip: "ATS screeners scan for WCAG accessibility compliance keywords for frontend and UX positions.",
    before: "Help verify accessibility standards inside software platforms.",
    after: "Audited and refactored core user flows for WCAG 2.1 AA accessibility compliance, reducing legal compliance risks for over 2M users."
  }
];

function updateTipUI() {
  const currentTip = aiTips[state.currentTipIndex];
  dom.tipTextContent.textContent = currentTip.tip;
  dom.tipBeforeText.innerHTML = `"${currentTip.before}"`;
  dom.tipAfterText.innerHTML = `"${currentTip.after}"`;
  dom.tipIndexLabel.textContent = `Tip ${state.currentTipIndex + 1} of ${aiTips.length}`;
}

// Miscellaneous triggers
dom.dismissTipBtn.addEventListener("click", () => {
  dom.tipCard.style.display = "none";
});

dom.seeExamplesBtn.addEventListener("click", () => {
  const isHidden = dom.tipExamplesContainer.style.display === "none";
  if (isHidden) {
    updateTipUI();
    dom.tipExamplesContainer.style.display = "block";
    dom.seeExamplesBtn.textContent = "Hide Examples";
  } else {
    dom.tipExamplesContainer.style.display = "none";
    dom.seeExamplesBtn.textContent = "See Examples";
  }
});

dom.nextTipBtn.addEventListener("click", () => {
  state.currentTipIndex = (state.currentTipIndex + 1) % aiTips.length;
  updateTipUI();
});

// ==================== INTERACTIVE AI CHATBOT DRAWER ====================

// Toggle Chat Drawer
dom.fabHelpBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dom.chatDrawer.classList.toggle("active");
});

dom.closeChatBtn.addEventListener("click", () => {
  dom.chatDrawer.classList.remove("active");
});

// Close chat when clicking outside
document.addEventListener("click", (e) => {
  if (dom.chatDrawer && !dom.chatDrawer.contains(e.target) && e.target !== dom.fabHelpBtn) {
    dom.chatDrawer.classList.remove("active");
  }
});

// Prevent closing drawer when clicking inside
dom.chatDrawer.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Escape HTML utility
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function executeGeminiChatRequest(systemContext, model, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemContext }] }]
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
    throw new Error(`Gemini API error: ${errorMessage}`);
  }
  const resData = await response.json();
  return resData.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to process that. Please try again.";
}

async function queryChatAPI(userMessage) {
  const activeProvider = state.aiProvider;
  const apiKey = activeProvider === "gemini" 
    ? localStorage.getItem("gemini_api_key") 
    : localStorage.getItem("openai_api_key");

  if (!apiKey) {
    return "Please configure your API Key in Settings to get real-time tailored advice based on your resume!";
  }

  // Construct context
  let systemContext = "You are a professional, friendly, and concise resume coach. You help the user rewrite bullet points, suggest keywords, or prepare for job interviews. Answer their question directly in 2-3 short, highly actionable sentences.\n";
  if (state.resumeText) {
    systemContext += `The candidate's Resume Text is:\n"""\n${state.resumeText}\n"""\n\n`;
  }
  if (state.jobDescription) {
    systemContext += `The candidate's Target Job Description is:\n"""\n${state.jobDescription}\n"""\n\n`;
  }
  systemContext += `Candidate Question: "${userMessage}"`;

  try {
    if (activeProvider === "gemini") {
      const model = state.aiModel || "gemini-3.5-flash";
      try {
        return await executeGeminiChatRequest(systemContext, model, apiKey);
      } catch (err) {
        const errMsg = err.message || "";
        if (errMsg.includes("high demand") || errMsg.includes("503") || errMsg.includes("overloaded") || errMsg.includes("limit")) {
          const fallbackModel = model === "gemini-3.5-flash" ? "gemini-3.1-flash-lite" : "gemini-3.5-flash";
          console.warn(`Primary chat model ${model} failed. Retrying with fallback: ${fallbackModel}`);
          return await executeGeminiChatRequest(systemContext, fallbackModel, apiKey);
        }
        throw err;
      }
    } else {
      const model = state.aiModel || "gpt-4o-mini";
      const url = "https://api.openai.com/v1/chat/completions";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: systemContext }]
        })
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const resData = await response.json();
      return resData.choices?.[0]?.message?.content || "I was unable to process that. Please try again.";
    }
  } catch (err) {
    console.error("Chat API error: ", err);
    return "Error communicating with the AI service. Please verify your API Key and network connection.";
  }
}

// Send Message Handler
async function handleSendChatMessage() {
  const message = dom.chatInput.value.trim();
  if (!message) return;

  // Append user message
  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user";
  userMsg.innerHTML = `<p>${escapeHtml(message)}</p>`;
  dom.chatBody.appendChild(userMsg);
  
  dom.chatInput.value = "";
  dom.chatBody.scrollTop = dom.chatBody.scrollHeight;

  // Append typing indicator
  const typingMsg = document.createElement("div");
  typingMsg.className = "chat-message bot";
  typingMsg.id = "chat-typing-indicator";
  typingMsg.innerHTML = `<p><em>Thinking...</em></p>`;
  dom.chatBody.appendChild(typingMsg);
  dom.chatBody.scrollTop = dom.chatBody.scrollHeight;

  // Get API Response
  const responseText = await queryChatAPI(message);

  // Remove typing indicator & append bot message
  const indicator = document.getElementById("chat-typing-indicator");
  if (indicator) indicator.remove();

  const botMsg = document.createElement("div");
  botMsg.className = "chat-message bot";
  botMsg.innerHTML = `<p>${escapeHtml(responseText)}</p>`;
  dom.chatBody.appendChild(botMsg);
  dom.chatBody.scrollTop = dom.chatBody.scrollHeight;
}

dom.sendChatBtn.addEventListener("click", handleSendChatMessage);
dom.chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSendChatMessage();
  }
});

// ==================== AI RESUME ROASTER ====================

dom.roastTriggerBtn.addEventListener("click", () => {
  // 1. Navigate to Roaster Screen
  switchView("roaster");

  const targetUrl = ROASTER_CONFIG.hostedUrl ? ROASTER_CONFIG.hostedUrl.trim() : "";

  // If the url is empty, placeholder, or still github.com default (meaning not yet updated by the developer)
  if (!targetUrl || targetUrl === "https://github.com" || targetUrl === "" || targetUrl.includes("PLACEHOLDER")) {
    dom.roasterIframeLoader.style.display = "none";
    dom.roasterIframe.style.display = "none";
    
    // Check if under-development message is already appended
    let devMsg = document.getElementById("roaster-under-dev-msg");
    if (!devMsg) {
      devMsg = document.createElement("div");
      devMsg.id = "roaster-under-dev-msg";
      devMsg.style.cssText = "position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 24px; text-align: center; background: rgba(9, 9, 13, 0.98); z-index: 6;";
      devMsg.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 56px; color: #f59e0b; animation: pulseAnimation 2s infinite;">construction</span>
        <h3 class="font-headline-md" style="color: #ffffff;">Resume Roaster Under Development</h3>
        <p class="font-body-md text-on-surface-variant" style="max-width: 420px; margin: 0 auto; font-size: 0.875rem; line-height: 1.5;">
          This feature is currently under active development. The developer needs to configure the hosted link in <code style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; color: #f59e0b; font-family: 'Geist Mono', monospace;">roasterConfig.js</code> to link the live service.
        </p>
      `;
      dom.roasterFrameContainer.appendChild(devMsg);
    } else {
      devMsg.style.display = "flex";
    }
    return;
  }

  // Remove under dev msg if it exists
  const devMsg = document.getElementById("roaster-under-dev-msg");
  if (devMsg) devMsg.style.display = "none";
  dom.roasterIframe.style.display = "block";

  // 2. Reset and show loader
  dom.roasterIframeLoader.style.display = "flex";
  
  // 3. Set iframe src to the developer configured URL
  if (dom.roasterIframe.src !== targetUrl) {
    dom.roasterIframe.src = targetUrl;
  } else {
    // If already loaded, hide the loader immediately
    dom.roasterIframeLoader.style.display = "none";
  }

  // 4. Register onload event to dismiss spinner
  dom.roasterIframe.onload = () => {
    dom.roasterIframeLoader.style.display = "none";
  };
});

// Back navigation listener
dom.backFromRoasterBtn.addEventListener("click", () => {
  switchView("optimize");
});

// ==================== GENERAL UTILITIES ====================

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  
  setTimeout(() => {
    dom.toast.classList.remove("show");
  }, 2500);
}
