const templates = {
  "Packaging Damage":
    "We are very sorry for the inconvenience. We have escalated this to our logistics team and arranged a priority replacement. Thank you for your patience.",
  "Size / Fit Issue":
    "Thank you for highlighting this. We are revising our size guidance and can help with an instant exchange to the correct fit.",
  "Late Delivery":
    "We understand your frustration around delivery delay. We have shared your feedback with our courier partner and initiated service recovery support.",
  "Color Mismatch":
    "Thank you for your feedback. We are reviewing listing images for color accuracy and can assist with exchange or return immediately.",
  "Defective Unit":
    "Apologies for the defective product experience. We are arranging a replacement and quality check escalation to prevent repeats.",
  "Wrong Item":
    "We are sorry for the incorrect shipment. We have raised this with our fulfillment team and started a priority replacement process."
};

const themeCounts = {
  "Packaging Damage": 312,
  "Late Delivery": 271,
  "Size / Fit Issue": 199,
  "Color Mismatch": 128,
  "Defective Unit": 96,
  "Wrong Item": 83
};

const platforms = ["Amazon", "Flipkart", "Myntra"];
let activeTheme = "";

let reviews = [
  { id: "RV-32918", platform: "Amazon", rating: 1, issue: "Packaging Damage", text: "Received damaged packaging twice", sku: "SNK-441", severity: "Critical", sla: "3h 18m", sentiment: "Negative" },
  { id: "RV-33102", platform: "Flipkart", rating: 2, issue: "Size / Fit Issue", text: "Size chart mismatch, had to return", sku: "TSH-108", severity: "Product Gap", sla: "7h 02m", sentiment: "Negative" },
  { id: "RV-33444", platform: "Myntra", rating: 2, issue: "Late Delivery", text: "Good product, delivery experience was poor", sku: "KET-210", severity: "Win-Back", sla: "12h 44m", sentiment: "Neutral" },
  { id: "RV-33518", platform: "Amazon", rating: 1, issue: "Defective Unit", text: "Stopped working after one day", sku: "MIX-904", severity: "Critical", sla: "2h 09m", sentiment: "Negative" },
  { id: "RV-33572", platform: "Flipkart", rating: 4, issue: "Late Delivery", text: "Bit late but product quality is good", sku: "KET-210", severity: "Win-Back", sla: "15h 10m", sentiment: "Positive" },
  { id: "RV-33620", platform: "Amazon", rating: 5, issue: "General Praise", text: "Very happy with quality", sku: "JAR-018", severity: "Low", sla: "N/A", sentiment: "Positive" },
  { id: "RV-33641", platform: "Myntra", rating: 1, issue: "Wrong Item", text: "Completely different item delivered", sku: "TOP-555", severity: "Critical", sla: "4h 31m", sentiment: "Negative" },
  { id: "RV-33678", platform: "Amazon", rating: 3, issue: "Color Mismatch", text: "Color is different from listing", sku: "TSH-108", severity: "Product Gap", sla: "9h 40m", sentiment: "Neutral" },
  { id: "RV-33731", platform: "Flipkart", rating: 2, issue: "Packaging Damage", text: "Outer box broken on arrival", sku: "BOT-305", severity: "Critical", sla: "5h 12m", sentiment: "Negative" },
  { id: "RV-33793", platform: "Myntra", rating: 5, issue: "General Praise", text: "Great fit and quick delivery", sku: "TSH-108", severity: "Low", sla: "N/A", sentiment: "Positive" }
];

const state = {
  platform: "all",
  timeRange: 30,
  inboxSearch: "",
  inboxRating: "all"
};

const viewMeta = {
  overview: "Operational dashboard for high-volume multi-platform reviews",
  inbox: "Unified review intake with search and triage controls",
  sentiment: "Sentiment tracking for trend and risk monitoring",
  clusters: "Issue clustering for root-cause ownership",
  response: "Response drafting with reusable smart templates",
  routing: "Automation rules to route issues to the right teams",
  escalation: "SLA threshold controls for urgent interventions",
  insights: "Monthly summary narratives for business decisions"
};

const elements = {
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  platformFilter: document.getElementById("platformFilter"),
  timeRange: document.getElementById("timeRange"),
  kpis: document.getElementById("kpis"),
  platformList: document.getElementById("platformList"),
  queueList: document.getElementById("queueList"),
  themeChips: document.getElementById("themeChips"),
  templateList: document.getElementById("templateList"),
  replyEditor: document.getElementById("replyEditor"),
  copyReplyBtn: document.getElementById("copyReplyBtn"),
  clearReplyBtn: document.getElementById("clearReplyBtn"),
  inboxSearch: document.getElementById("inboxSearch"),
  inboxRating: document.getElementById("inboxRating"),
  inboxTable: document.getElementById("inboxTable"),
  sentimentBars: document.getElementById("sentimentBars"),
  clusterList: document.getElementById("clusterList"),
  templateSelect: document.getElementById("templateSelect"),
  responseStudioEditor: document.getElementById("responseStudioEditor"),
  applyTemplateBtn: document.getElementById("applyTemplateBtn"),
  copyStudioBtn: document.getElementById("copyStudioBtn"),
  saveRoutingBtn: document.getElementById("saveRoutingBtn"),
  saveEscalationBtn: document.getElementById("saveEscalationBtn"),
  insightList: document.getElementById("insightList"),
  exportBtn: document.getElementById("exportBtn"),
  themeToggle: document.getElementById("themeToggle"),
  statusText: document.getElementById("statusText"),
  toast: document.getElementById("toast"),
  subTitle: document.getElementById("subTitle")
};

function setThemeButtonLabel(isDarkMode) {
  elements.themeToggle.textContent = isDarkMode ? "Bright Mode" : "Dark Mode";
}

function applyTheme(isDarkMode) {
  document.body.classList.toggle("dark-mode", isDarkMode);
  setThemeButtonLabel(isDarkMode);
  localStorage.setItem("sellergrid-theme", isDarkMode ? "dark" : "bright");
}

function initTheme() {
  const savedTheme = localStorage.getItem("sellergrid-theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkMode = savedTheme ? savedTheme === "dark" : prefersDark;
  applyTheme(isDarkMode);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.setTimeout(() => elements.toast.classList.remove("show"), 1500);
}

function filteredReviews() {
  return reviews.filter((review) => {
    const byPlatform = state.platform === "all" || review.platform === state.platform;
    return byPlatform;
  });
}

function getScaleByTimeRange() {
  if (state.timeRange === 7) {
    return 0.26;
  }
  if (state.timeRange === 90) {
    return 2.9;
  }
  return 1;
}

function renderKpis() {
  const list = filteredReviews();
  const scale = getScaleByTimeRange();
  const ingested = Math.round(list.length * 1248 * scale);
  const critical = Math.round(list.filter((item) => item.severity === "Critical").length * 17 * scale);
  const categorized = 90 + (list.length % 8);
  const avgTat = (4.5 - list.filter((item) => item.sentiment === "Negative").length * 0.05).toFixed(1);

  elements.kpis.innerHTML = [
    { label: `Reviews Ingested (${state.timeRange}d)`, value: ingested.toLocaleString(), delta: "+14.2% vs prior period", type: "good" },
    { label: "Auto-Categorized", value: `${categorized.toFixed(1)}%`, delta: "Model confidence stable", type: "good" },
    { label: "Critical Reviews", value: critical.toLocaleString(), delta: "Needs resolution under 24h", type: "warn" },
    { label: "Avg Response TAT", value: `${avgTat}h`, delta: "-1.1h improved", type: "good" }
  ]
    .map(
      (item) => `
      <article class="kpi">
        <div class="label">${item.label}</div>
        <div class="value">${item.value}</div>
        <div class="delta ${item.type}">${item.delta}</div>
      </article>`
    )
    .join("");
}

function renderPlatformSnapshot() {
  const list = filteredReviews();
  const counts = platforms.map((platform) => {
    const count = list.filter((item) => item.platform === platform).length;
    return { platform, count };
  });

  const max = Math.max(...counts.map((item) => item.count), 1);
  elements.platformList.innerHTML = counts
    .map((item) => {
      const width = Math.max((item.count / max) * 100, item.count ? 12 : 0);
      return `
      <div class="platform-row">
        <span>${item.platform}</span>
        <div class="track"><div class="fill" style="width:${width}%;"></div></div>
        <strong>${Math.round(item.count * 288).toLocaleString()}</strong>
      </div>`;
    })
    .join("");
}

function severityTagClass(severity) {
  if (severity === "Critical") {
    return "t-critical";
  }
  if (severity === "Product Gap") {
    return "t-product";
  }
  return "t-opportunity";
}

function renderQueue() {
  const queueData = filteredReviews().filter((item) => item.rating <= 2 && item.severity !== "Low");
  const themed = activeTheme ? queueData.filter((item) => item.issue === activeTheme) : queueData;

  if (!themed.length) {
    elements.queueList.innerHTML = "<div class='ticket'>No tickets match current filters.</div>";
    return;
  }

  elements.queueList.innerHTML = themed
    .map(
      (item) => `
      <div class="ticket" data-id="${item.id}">
        <div class="head"><b>#${item.id}</b><span class="tag ${severityTagClass(item.severity)}">${item.severity}</span></div>
        <div>"${item.text}"</div>
        <small>${item.platform} | SKU: ${item.sku} | SLA left: ${item.sla}</small>
        <div class="ticket-actions">
          <button type="button" data-action="resolve" data-id="${item.id}">Resolve</button>
          <button type="button" data-action="template" data-issue="${item.issue}">Use Template</button>
        </div>
      </div>`
    )
    .join("");
}

function renderThemeChips() {
  const items = Object.entries(themeCounts)
    .map(([theme, count]) => {
      const active = activeTheme === theme ? "active" : "";
      return `<button type="button" class="chip ${active}" data-theme="${theme}">${theme} (${count})</button>`;
    })
    .join("");
  elements.themeChips.innerHTML = `<button type="button" class="chip ${activeTheme === "" ? "active" : ""}" data-theme="">All Themes</button>${items}`;
}

function renderTemplateList() {
  const items = Object.entries(templates)
    .map(
      ([key, value]) => `
      <div class="template">
        <b>${key}</b>
        <p>${value}</p>
        <div class="inline-actions">
          <button type="button" class="secondary template-apply" data-template="${key}">Use</button>
        </div>
      </div>`
    )
    .join("");

  elements.templateList.innerHTML = items;
  elements.templateSelect.innerHTML = Object.keys(templates)
    .map((key) => `<option value="${key}">${key}</option>`)
    .join("");
}

function renderInboxTable() {
  const search = state.inboxSearch.toLowerCase().trim();
  const rows = filteredReviews().filter((item) => {
    const matchesRating = state.inboxRating === "all" || String(item.rating) === state.inboxRating;
    const target = `${item.id} ${item.platform} ${item.issue} ${item.text} ${item.sku}`.toLowerCase();
    const matchesSearch = search === "" || target.includes(search);
    return matchesRating && matchesSearch;
  });

  elements.inboxTable.innerHTML = rows
    .map(
      (item) => `
      <tr>
        <td>#${item.id}</td>
        <td>${item.platform}</td>
        <td>${item.rating}</td>
        <td>${item.issue}</td>
        <td>${item.sku}</td>
      </tr>`
    )
    .join("");

  if (!rows.length) {
    elements.inboxTable.innerHTML = "<tr><td colspan='5'>No matching reviews found.</td></tr>";
  }
}

function renderSentiment() {
  const list = filteredReviews();
  const counts = {
    Positive: list.filter((item) => item.sentiment === "Positive").length,
    Neutral: list.filter((item) => item.sentiment === "Neutral").length,
    Negative: list.filter((item) => item.sentiment === "Negative").length
  };
  const max = Math.max(...Object.values(counts), 1);

  elements.sentimentBars.innerHTML = Object.entries(counts)
    .map(([key, value]) => {
      const width = (value / max) * 100;
      return `
      <div class="bar-row">
        <span>${key}</span>
        <div class="track"><div class="fill" style="width:${width}%;"></div></div>
        <strong>${value}</strong>
      </div>`;
    })
    .join("");
}

function renderClusters() {
  elements.clusterList.innerHTML = Object.entries(themeCounts)
    .map(
      ([theme, count]) => `
      <div class="cluster">
        <div><b>${theme}</b> - ${count} mentions</div>
        <label>
          Assign Owner
          <select data-cluster="${theme}" class="cluster-owner">
            <option value="Support Team">Support Team</option>
            <option value="Logistics Team">Logistics Team</option>
            <option value="Catalog Team">Catalog Team</option>
          </select>
        </label>
      </div>`
    )
    .join("");
}

function renderInsights() {
  const list = filteredReviews();
  const negatives = list.filter((item) => item.sentiment === "Negative").length;
  const topIssue = Object.entries(
    list.reduce((acc, item) => {
      acc[item.issue] = (acc[item.issue] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  const insights = [
    `${list.length} reviews sampled for active filter scope (${state.timeRange}d).`,
    `${negatives} reviews are negative and should be prioritized for intervention.`,
    `Top issue this cycle: ${topIssue ? `${topIssue[0]} (${topIssue[1]} mentions)` : "No issue data"}.`,
    "Recommended action: run focused QA and update listing communication for top two issues."
  ];

  elements.insightList.innerHTML = insights.map((item) => `<li>${item}</li>`).join("");
}

function setStatusText() {
  const scope = state.platform === "all" ? "All Platforms" : state.platform;
  elements.statusText.textContent = `Active Scope: ${scope} | Time Window: ${state.timeRange} days | Queue size: ${filteredReviews().length}`;
}

function switchView(view) {
  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  elements.views.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `view-${view}`);
  });

  elements.subTitle.textContent = viewMeta[view] || viewMeta.overview;

  showToast(`Switched to ${view}`);
}

function renderAll() {
  renderKpis();
  renderPlatformSnapshot();
  renderQueue();
  renderThemeChips();
  renderTemplateList();
  renderInboxTable();
  renderSentiment();
  renderClusters();
  renderInsights();
  setStatusText();
}

async function copyToClipboard(value) {
  if (!value.trim()) {
    showToast("Nothing to copy");
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    showToast("Copied to clipboard");
  } catch (_error) {
    showToast("Clipboard unavailable in this browser");
  }
}

function exportInsights() {
  const payload = {
    generatedAt: new Date().toISOString(),
    filters: {
      platform: state.platform,
      timeRange: state.timeRange
    },
    queue: filteredReviews().filter((item) => item.rating <= 2),
    insights: Array.from(elements.insightList.querySelectorAll("li")).map((li) => li.textContent)
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "sellergrid-weekly-insights.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Weekly insights exported");
}

function bindEvents() {
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });

  elements.platformFilter.addEventListener("change", (event) => {
    state.platform = event.target.value;
    renderAll();
  });

  elements.timeRange.addEventListener("change", (event) => {
    state.timeRange = Number(event.target.value);
    renderAll();
  });

  elements.themeChips.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-theme]");
    if (!button) {
      return;
    }
    activeTheme = button.dataset.theme;
    renderThemeChips();
    renderQueue();
  });

  elements.queueList.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    if (action === "resolve") {
      const id = button.dataset.id;
      reviews = reviews.filter((item) => item.id !== id);
      showToast(`Ticket #${id} resolved`);
      renderAll();
      return;
    }

    if (action === "template") {
      const issue = button.dataset.issue;
      elements.replyEditor.value = templates[issue] || "";
      switchView("response");
      elements.templateSelect.value = issue in templates ? issue : elements.templateSelect.value;
      elements.responseStudioEditor.value = elements.replyEditor.value;
      showToast("Template loaded in Response Studio");
    }
  });

  elements.templateList.addEventListener("click", (event) => {
    const button = event.target.closest("button.template-apply");
    if (!button) {
      return;
    }

    const name = button.dataset.template;
    elements.replyEditor.value = templates[name];
    showToast(`${name} template applied`);
  });

  elements.copyReplyBtn.addEventListener("click", () => copyToClipboard(elements.replyEditor.value));
  elements.clearReplyBtn.addEventListener("click", () => {
    elements.replyEditor.value = "";
    showToast("Reply text cleared");
  });

  elements.inboxSearch.addEventListener("input", (event) => {
    state.inboxSearch = event.target.value;
    renderInboxTable();
  });

  elements.inboxRating.addEventListener("change", (event) => {
    state.inboxRating = event.target.value;
    renderInboxTable();
  });

  elements.applyTemplateBtn.addEventListener("click", () => {
    const selected = elements.templateSelect.value;
    elements.responseStudioEditor.value = templates[selected] || "";
    showToast("Template applied");
  });

  elements.copyStudioBtn.addEventListener("click", () => copyToClipboard(elements.responseStudioEditor.value));

  elements.saveRoutingBtn.addEventListener("click", () => showToast("Routing rules saved"));
  elements.saveEscalationBtn.addEventListener("click", () => showToast("Escalation rules saved"));

  elements.themeToggle.addEventListener("click", () => {
    const isDarkMode = !document.body.classList.contains("dark-mode");
    applyTheme(isDarkMode);
    showToast(isDarkMode ? "Dark mode enabled" : "Bright mode enabled");
  });

  elements.exportBtn.addEventListener("click", exportInsights);
}

bindEvents();
initTheme();
renderAll();
