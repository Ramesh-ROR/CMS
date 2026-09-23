/* ============================================================================
   SLC Case Management System — App Shell (Sidebar, Header, Modals, Toasts, AI)
   ============================================================================ */

(function (global) {
  "use strict";
  const D = global.SLC;

  /* ------------------------------------------------------------------ */
  /* Navigation model                                                    */
  /* ------------------------------------------------------------------ */
  const NAV = [
    { section: "Overview", items: [
      { key: "dashboard", label: "Dashboard", labelAr: "لوحة المعلومات", icon: "bi-speedometer2", href: "dashboard.html" },
    ]},
    { section: "Case Inboxes", items: [
      { key: "my-cases", label: "My Cases", labelAr: "قضاياي", icon: "bi-briefcase", href: "my-cases.html", count: 24 },
      { key: "pending-cases", label: "Pending Cases", labelAr: "القضايا المعلقة", icon: "bi-hourglass-split", href: "pending-cases.html", count: 6 },
      { key: "live-cases", label: "Live Cases", labelAr: "القضايا النشطة", icon: "bi-activity", href: "live-cases.html", count: 1248 },
      { key: "new-case", label: "New Case", labelAr: "قضية جديدة", icon: "bi-plus-circle", href: "new-case.html" },
    ]},
    { section: "Work", items: [
      { key: "tasks", label: "My Tasks", labelAr: "مهامي", icon: "bi-list-check", href: "tasks.html", count: 8 },
      { key: "reminders", label: "Reminders", labelAr: "التذكيرات", icon: "bi-alarm", href: "reminders.html", count: 5 },
      { key: "calendar", label: "Calendar", labelAr: "التقويم", icon: "bi-calendar3", href: "calendar.html" },
      { key: "search", label: "Search", labelAr: "بحث", icon: "bi-search", href: "search.html" },
    ]},
    { section: "Insights", items: [
      { key: "reports", label: "Reports", labelAr: "التقارير", icon: "bi-bar-chart-line", href: "reports.html" },
      { key: "management", label: "Management Console", labelAr: "وحدة الإدارة", icon: "bi-gear", href: "management.html" },
      { key: "roles-permissions", label: "Roles & Permissions", labelAr: "الأدوار والصلاحيات", icon: "bi-shield-lock", href: "roles-permissions.html" },
    ]},
  ];

  function avatarHtml(user, size) {
    size = size || 36;
    return `<div class="avatar" style="background:${user.color};width:${size}px;height:${size}px;font-size:${size*0.36}px">${user.initials}</div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Sidebar                                                             */
  /* ------------------------------------------------------------------ */
  function buildSidebar(active) {
    let html = `
    <div class="sidebar-brand">
      <img src="assets/dubai-crest-icon.png" alt="Government of Dubai" class="sidebar-brand-mark">
      <img src="assets/slc-logo-red.png" alt="The Supreme Legislation Committee" class="sidebar-brand-logo">
    </div>
    <nav class="sidebar-nav">`;
    NAV.forEach(sec => {
      html += `<div class="sidebar-section-label">${sec.section}</div>`;
      sec.items.forEach(it => {
        const isActive = it.key === active ? "active" : "";
        html += `<a href="${it.href}" class="sidebar-link ${isActive}" data-key="${it.key}">
          <i class="bi ${it.icon}"></i>
          <span class="link-text" data-en="${it.label}" data-ar="${it.labelAr}">${it.label}</span>
          ${it.count ? `<span class="badge-count">${it.count}</span>` : ""}
        </a>`;
      });
    });
    html += `</nav>
    <div class="sidebar-footer">
      <button class="sidebar-collapse-btn" id="sidebarCollapseBtn"><i class="bi bi-layout-sidebar-inset"></i><span>Collapse</span></button>
    </div>`;
    return html;
  }

  /* ------------------------------------------------------------------ */
  /* Header                                                              */
  /* ------------------------------------------------------------------ */
  function buildHeader() {
    const u = D.CURRENT_USER;
    const unread = D.NOTIFICATIONS.filter(n => n.unread).length;
    let notifHtml = D.NOTIFICATIONS.map(n => `
      <a href="#" class="dropdown-item d-flex gap-2 align-items-start py-2 px-3 ${n.unread ? "bg-light" : ""}" style="white-space:normal;">
        <i class="bi ${n.icon} mt-1" style="color:var(--slc-primary)"></i>
        <div>
          <div style="font-size:12.5px;color:var(--slc-text);line-height:1.35">${n.text}</div>
          <div style="font-size:10.8px;color:var(--slc-muted);margin-top:2px">${n.time}</div>
        </div>
      </a>`).join("");

    return `
    <button class="header-icon-btn d-lg-none" id="mobileNavToggle"><i class="bi bi-list"></i></button>
    <div class="header-search">
      <i class="bi bi-search"></i>
      <input type="text" id="globalHeaderSearch" placeholder="Search cases, documents, entities..." autocomplete="off">
    </div>
    <div class="header-actions">
      <div class="theme-switch" title="Toggle light / dark theme">
        <button id="themeLightBtn" class="active"><i class="bi bi-sun"></i></button>
        <button id="themeDarkBtn"><i class="bi bi-moon-stars"></i></button>
      </div>
      <div class="lang-switch">
        <button id="langEnBtn" class="active">EN</button>
        <button id="langArBtn">AR</button>
      </div>
      <div class="header-divider"></div>
      <button class="header-icon-btn" title="Help"><i class="bi bi-question-circle"></i></button>
      <div class="dropdown">
        <button class="header-icon-btn" data-bs-toggle="dropdown" data-bs-auto-close="outside" title="Notifications">
          <i class="bi bi-bell"></i>${unread ? '<span class="dot"></span>' : ""}
        </button>
        <div class="dropdown-menu dropdown-menu-end p-0" style="width:340px;max-height:420px;overflow-y:auto;">
          <div class="px-3 py-2 border-bottom fw-bold" style="font-size:13px;">Notifications</div>
          ${notifHtml}
          <div class="text-center py-2 border-top"><a href="#" style="font-size:12px;">View all notifications</a></div>
        </div>
      </div>
      <div class="header-divider"></div>
      <div class="dropdown">
        <div class="header-user" data-bs-toggle="dropdown">
          ${avatarHtml(u)}
          <div class="header-user-text d-none d-md-block">
            <div class="name">${u.name}</div>
            <div class="role">${u.titleLine}</div>
          </div>
          <i class="bi bi-chevron-down ms-1" style="font-size:10px;color:var(--slc-muted)"></i>
        </div>
        <div class="dropdown-menu dropdown-menu-end" style="font-size:13px;">
          <div class="px-3 py-2">
            <div class="fw-bold">${u.name}</div>
            <div class="text-muted-soft" style="font-size:11.5px;">${u.email}</div>
          </div>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>My Profile</a>
          <a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Preferences</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="index.html"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a>
        </div>
      </div>
    </div>`;
  }

  function buildBreadcrumb(trail) {
    let html = `<div class="breadcrumb-row"><a href="dashboard.html"><i class="bi bi-house"></i></a>`;
    trail.forEach((t, i) => {
      html += `<span class="sep">/</span>`;
      if (i === trail.length - 1) html += `<span class="current">${t.label}</span>`;
      else html += `<a href="${t.href}">${t.label}</a>`;
    });
    html += `</div>`;
    return html;
  }

  /* ------------------------------------------------------------------ */
  /* Toasts                                                              */
  /* ------------------------------------------------------------------ */
  function ensureToastStack() {
    let s = document.querySelector(".toast-stack");
    if (!s) { s = document.createElement("div"); s.className = "toast-stack"; document.body.appendChild(s); }
    return s;
  }
  function toast(message, opts) {
    opts = opts || {};
    const stack = ensureToastStack();
    const el = document.createElement("div");
    el.className = "slc-toast";
    el.innerHTML = `<i class="bi ${opts.icon || "bi-check-circle-fill"}"></i><div>${message}</div>`;
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(-6px)"; el.style.transition = "all .25s"; setTimeout(() => el.remove(), 250); }, opts.duration || 3200);
  }

  /* ------------------------------------------------------------------ */
  /* Demo Action Modal — for operations with no real backend              */
  /* ------------------------------------------------------------------ */
  function demoAction(message) {
    toast(message || "Record saved successfully in prototype mode.", { icon: "bi-check-circle-fill" });
  }

  function ensureDemoModal() {
    if (document.getElementById("demoActionModal")) return;
    const div = document.createElement("div");
    div.innerHTML = `
    <div class="modal fade" id="demoActionModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px;border:none;">
          <div class="modal-body text-center py-4 px-4">
            <div class="demo-success-icon" style="width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 14px;">
              <i class="bi bi-check-lg"></i>
            </div>
            <h6 class="fw-bold mb-2">Demo Action</h6>
            <p class="text-muted-soft mb-3" style="font-size:13px;" id="demoActionMsg">Record saved successfully in prototype mode.</p>
            <button class="btn btn-primary btn-sm px-4" data-bs-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    </div>`;
    document.body.appendChild(div.firstElementChild);
  }
  function demoActionModal(message) {
    ensureDemoModal();
    document.getElementById("demoActionMsg").textContent = message || "Record saved successfully in prototype mode.";
    const modal = new bootstrap.Modal(document.getElementById("demoActionModal"));
    modal.show();
  }

  /* ------------------------------------------------------------------ */
  /* Language / RTL toggle (demo)                                        */
  /* ------------------------------------------------------------------ */
  function applyLang(lang) {
    localStorage.setItem("slc_lang", lang);
    document.documentElement.setAttribute("lang", lang === "ar" ? "ar" : "en");
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.querySelectorAll("[data-en]").forEach(el => {
      const val = lang === "ar" ? el.getAttribute("data-ar") : el.getAttribute("data-en");
      if (val) el.textContent = val;
    });
    const enBtn = document.getElementById("langEnBtn"), arBtn = document.getElementById("langArBtn");
    if (enBtn && arBtn) {
      enBtn.classList.toggle("active", lang !== "ar");
      arBtn.classList.toggle("active", lang === "ar");
    }
    if (lang === "ar") {
      toast("تم التبديل إلى اللغة العربية (نسخة تجريبية للعرض المرئي)", { icon: "bi-translate" });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Light / Dark theme toggle                                           */
  /* ------------------------------------------------------------------ */
  function applyTheme(theme, opts) {
    theme = theme === "dark" ? "dark" : "light";
    localStorage.setItem("slc_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    const lightBtn = document.getElementById("themeLightBtn"), darkBtn = document.getElementById("themeDarkBtn");
    if (lightBtn && darkBtn) {
      lightBtn.classList.toggle("active", theme === "light");
      darkBtn.classList.toggle("active", theme === "dark");
    }
    window.dispatchEvent(new CustomEvent("slcthemechange", { detail: { theme } }));
    if (!opts || !opts.silent) {
      toast(theme === "dark" ? "Dark theme enabled (demo)." : "Light theme enabled (demo).", { icon: theme === "dark" ? "bi-moon-stars-fill" : "bi-sun-fill" });
    }
  }
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  /* Chart.js color helper — call inside chart-init code so canvases match the active theme */
  function chartTheme() {
    const dark = currentTheme() === "dark";
    return {
      text: dark ? "#8FA0B8" : "#6B7280",
      grid: dark ? "rgba(255,255,255,.08)" : "#F1F3F6",
      border: dark ? "#131C2E" : "#fff",
    };
  }
  /* Register a callback to run whenever the theme changes (e.g. to re-theme live Chart.js instances) */
  function onThemeChange(cb) {
    window.addEventListener("slcthemechange", cb);
  }

  /* ------------------------------------------------------------------ */
  /* AI Assistant panel                                                  */
  /* ------------------------------------------------------------------ */
  const AI_RESPONSES = {
    "summarize this case.": "**AI Case Summary** — This case concerns a proposed Federal Environmental Protection Legislation. The case is currently in Final Review milestone. Two checklist items remain pending (Team Final Approval, Secretary General Final Approval) and the Proposed Completion Date is 9 days away.",
    "what are the pending actions?": "Pending actions across your cases: (1) Complete Legal Review comments for SLC-LEG-2026-00128, (2) Proofread translation draft for SLC-TRN-2026-00114, (3) Respond to extension request on SLC-LEG-2026-00119.",
    "which cases are overdue?": "2 cases are past their Proposed Completion Date: SLC-LEG-2026-00119 (Ratification Review — Bilateral Investment Treaty, 5 days overdue) and SLC-GEN-2026-00061 (IT Infrastructure Upgrade, 1 day overdue).",
    "show cases requiring management attention.": "3 cases flagged for management attention based on inactivity or approaching deadlines: SLC-LAO-2026-00087 (Legal Opinion on PPP Framework, classified, no activity in 4 days), SLC-LEG-2026-00131 (still in First Review after 18 days), SLC-RP-2026-00033 (Official Gazette Issue 214, task overdue).",
    "summarize recent case activities.": "In the last 7 days: 14 activities logged across 6 live cases, including 3 translation requests, 2 milestone updates, 4 document uploads and 5 comments added.",
    "identify cases approaching their completion date.": "Cases approaching their Proposed Completion Date within 10 days: SLC-LEG-2026-00128 (9 days), SLC-TRN-2026-00114 (6 days), SLC-RP-2026-00033 (9 days), SLC-LAO-2026-00091 (in 15 days — monitor)."
  };

  function aiRespond(question) {
    const key = question.trim().toLowerCase();
    return AI_RESPONSES[key] || "This is a demonstration response. In the full solution, this would be generated from live case data using an AI-assisted analysis of case activities, milestones and documents.";
  }

  function buildAIPanel() {
    if (document.getElementById("aiPanel")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `
    <button class="ai-fab" id="aiFabBtn" title="AI Assistant"><i class="bi bi-stars"></i></button>
    <div class="ai-panel" id="aiPanel">
      <div class="ai-panel-head">
        <i class="bi bi-stars fs-5"></i>
        <div>
          <div style="font-weight:700;font-size:13.5px;">SLC AI Assistant</div>
          <div style="font-size:10.5px;opacity:.85;">AI-Assisted Capability — Demonstration Prototype</div>
        </div>
        <button class="btn-close btn-close-white ms-auto" id="aiCloseBtn" style="font-size:11px;"></button>
      </div>
      <div class="ai-panel-body" id="aiBody">
        <div class="ai-msg bot"><div class="bubble">Hello ${D.CURRENT_USER.name.split(" ")[0]}, I'm your AI-assisted CMS helper. Ask me about your cases, pending actions or deadlines.</div></div>
      </div>
      <div class="ai-quick" id="aiQuick"></div>
      <div class="ai-panel-input">
        <input type="text" id="aiInput" placeholder="Ask about your cases...">
        <button id="aiSendBtn"><i class="bi bi-send"></i></button>
      </div>
      <div class="ai-disclaimer">Demo AI capability — no real AI service connected.</div>
    </div>`;
    document.body.appendChild(wrap);

    const quick = document.getElementById("aiQuick");
    D.AI_QUICK_QUESTIONS.forEach(q => {
      const b = document.createElement("button");
      b.textContent = q;
      b.onclick = () => sendAI(q);
      quick.appendChild(b);
    });

    document.getElementById("aiFabBtn").onclick = () => document.getElementById("aiPanel").classList.add("open");
    document.getElementById("aiCloseBtn").onclick = () => document.getElementById("aiPanel").classList.remove("open");
    document.getElementById("aiSendBtn").onclick = () => {
      const inp = document.getElementById("aiInput");
      if (inp.value.trim()) { sendAI(inp.value.trim()); inp.value = ""; }
    };
    document.getElementById("aiInput").addEventListener("keydown", e => {
      if (e.key === "Enter") document.getElementById("aiSendBtn").click();
    });
  }

  function sendAI(question) {
    const body = document.getElementById("aiBody");
    document.getElementById("aiPanel").classList.add("open");
    const userMsg = document.createElement("div");
    userMsg.className = "ai-msg user";
    userMsg.innerHTML = `<div class="bubble">${question}</div>`;
    body.appendChild(userMsg);
    body.scrollTop = body.scrollHeight;
    setTimeout(() => {
      const botMsg = document.createElement("div");
      botMsg.className = "ai-msg bot";
      botMsg.innerHTML = `<div class="bubble">${aiRespond(question).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}<div style="margin-top:6px;"><span class="ai-chip"><i class="bi bi-stars"></i>AI-generated demo content</span></div></div>`;
      body.appendChild(botMsg);
      body.scrollTop = body.scrollHeight;
    }, 550);
  }

  /* ------------------------------------------------------------------ */
  /* Shell renderer                                                      */
  /* ------------------------------------------------------------------ */
  function renderShell(active, breadcrumbTrail) {
    document.body.insertAdjacentHTML("afterbegin", `<div class="app-shell" id="appShell">
      <aside class="app-sidebar" id="appSidebar"></aside>
      <div class="app-main">
        <header class="app-header" id="appHeader"></header>
        <main class="page-wrap" id="pageContent"></main>
      </div>
    </div>`);
    document.getElementById("appSidebar").innerHTML = buildSidebar(active);
    document.getElementById("appHeader").innerHTML = buildHeader();

    // Move any pre-existing page body content (declared before app.js ran) into pageContent
    const existing = document.getElementById("__pageBody");
    if (existing) {
      document.getElementById("pageContent").innerHTML = existing.innerHTML;
      existing.remove();
    }
    if (breadcrumbTrail) {
      const bc = document.createElement("div");
      bc.innerHTML = buildBreadcrumb(breadcrumbTrail);
      document.getElementById("pageContent").prepend(bc.firstElementChild);
    }

    // Collapse toggle
    document.getElementById("sidebarCollapseBtn").onclick = () => {
      document.getElementById("appShell").classList.toggle("sidebar-collapsed");
    };
    const mobBtn = document.getElementById("mobileNavToggle");
    if (mobBtn) mobBtn.onclick = () => document.getElementById("appShell").classList.toggle("sidebar-mobile-open");

    // Lang
    const savedLang = localStorage.getItem("slc_lang") || "en";
    applyLang(savedLang);
    document.getElementById("langEnBtn").onclick = () => applyLang("en");
    document.getElementById("langArBtn").onclick = () => applyLang("ar");

    // Theme (already applied pre-paint by the inline head script; just sync the toggle UI + wire clicks)
    applyTheme(currentTheme(), { silent: true });
    document.getElementById("themeLightBtn").onclick = () => applyTheme("light");
    document.getElementById("themeDarkBtn").onclick = () => applyTheme("dark");

    // AI assistant available everywhere
    buildAIPanel();

    // Global search enter -> search.html
    const gs = document.getElementById("globalHeaderSearch");
    if (gs) gs.addEventListener("keydown", e => {
      if (e.key === "Enter" && gs.value.trim()) {
        window.location.href = "search.html?q=" + encodeURIComponent(gs.value.trim());
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Small render helpers reused across pages                            */
  /* ------------------------------------------------------------------ */
  function urgencyBadge(u) {
    const cls = "badge-urgency-" + u.replace(" ", "");
    return `<span class="${cls}">${u}</span>`;
  }
  function milestoneBadge(id) {
    const m = D.milestoneById(id);
    if (!m) return "";
    return `<span class="badge-status badge-${m.badge}">${m.name}</span>`;
  }
  function classifiedFlag(isClassified) {
    return isClassified ? `<span class="classified-flag"><i class="bi bi-shield-lock-fill"></i>Classified</span>` : "";
  }
  function fmtDate(d) {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  function userChip(id) {
    const u = D.userById(id);
    if (!u) return "—";
    return `<div class="d-flex align-items-center gap-2">${avatarHtml(u, 26)}<span style="font-size:12.6px;">${u.name}</span></div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Shared AI insight card — used across every page to keep the AI      */
  /* touchpoints visually and structurally consistent.                   */
  /* ------------------------------------------------------------------ */
  function aiInsightCard(title, items, opts) {
    opts = opts || {};
    if (!items || !items.length) return "";
    return `<div class="section-card ai-insight-card">
      <div class="sc-header">
        <span><i class="bi bi-stars me-1" style="color:#7C3AED;"></i>${title}</span>
        <span class="ai-chip"><i class="bi bi-stars"></i>Demo</span>
      </div>
      <div class="sc-body pt-2">
        <div class="ai-insight-box">
          ${items.map(t => `<div class="ai-insight-item"><i class="bi bi-stars"></i><div>${t}</div></div>`).join("")}
          <div class="text-center mt-2"><span class="ai-chip"><i class="bi bi-info-circle"></i>${opts.label || "AI-Assisted Insight – Demo"}</span></div>
        </div>
      </div>
    </div>`;
  }
  /* Compact inline variant (single line, no card wrapper) for tight spaces */
  function aiInlineNote(text) {
    return `<div class="ai-inline-note"><i class="bi bi-stars"></i><span>${text}</span> <span class="ai-chip ms-1"><i class="bi bi-info-circle"></i>Demo</span></div>`;
  }

  global.SLCApp = {
    NAV, renderShell, toast, demoAction, demoActionModal, applyLang, avatarHtml,
    urgencyBadge, milestoneBadge, classifiedFlag, fmtDate, userChip, sendAI,
    applyTheme, currentTheme, chartTheme, onThemeChange, aiInsightCard, aiInlineNote,
  };
})(window);
