/* ============================================================================
   SLC Case Management System — App Shell (Sidebar, Header, Modals, Toasts, AI)
   ============================================================================ */

(function (global) {
  "use strict";
  const D = global.SLC;

  /* ------------------------------------------------------------------ */
  /* Navigation model — horizontal top menu (no sidebar)                 */
  /* ------------------------------------------------------------------ */
  const NAV = [
    { key: "dashboard", label: "Dashboard", labelAr: "لوحة المعلومات", href: "dashboard.html" },
    { key: "my-approvals", label: "My Approvals", labelAr: "الموافقات الخاصة بي", href: "my-approvals.html" },
    { key: "new-case", label: "Register Case", labelAr: "تسجيل قضية", href: "new-case.html" },
    { key: "live-cases", label: "Live Cases", labelAr: "القضايا النشطة", href: "live-cases.html" },
    { key: "completed-cases", label: "Completed Cases", labelAr: "القضايا المكتملة", href: "completed-cases.html" },
    {
      key: "reports", label: "Reports", labelAr: "التقارير", href: "reports.html",
      matchKeys: ["reports"],
      dropdown: [
        { label: "Case Summary Report", href: "reports.html", icon: "bi-clipboard-data" },
        { label: "Cases by Classification", href: "report-details.html?id=rep-work-type", icon: "bi-diagram-3" },
        { label: "Cases by Directorate", href: "report-details.html?id=rep-directorate", icon: "bi-building" },
        { label: "Case Aging Report", href: "report-details.html?id=rep-aging", icon: "bi-hourglass-split" },
        { label: "Case Completion Performance", href: "report-details.html?id=rep-completion", icon: "bi-graph-up" },
        { label: "Case Milestone Report", href: "report-details.html?id=rep-milestone", icon: "bi-signpost-split" },
        { label: "Case Status Report", href: "report-details.html?id=rep-status", icon: "bi-pie-chart" },
        { label: "Registration Performance", href: "report-details.html?id=rep-registration", icon: "bi-clipboard-check" },
        { label: "User Workload Report", href: "report-details.html?id=rep-workload", icon: "bi-people" },
        { label: "Activity Report", href: "report-details.html?id=rep-activity", icon: "bi-activity" },
      ],
    },
    { key: "search", label: "Database Search", labelAr: "بحث", href: "search.html" },
    {
      key: "management", label: "Management Console", labelAr: "وحدة الإدارة", href: "management.html",
      matchKeys: ["management", "roles-permissions"],
      dropdown: [
        { label: "User Management", href: "management.html#sec-users", icon: "bi-people" },
        { label: "Roles & Permissions", href: "roles-permissions.html", icon: "bi-shield-lock" },
        { label: "Work Type Masters", href: "management.html#sec-work-types", icon: "bi-diagram-3" },
        { label: "Case Type Masters", href: "management.html#sec-case-types", icon: "bi-tags" },
        { label: "Milestone Masters", href: "management.html#sec-milestones", icon: "bi-flag" },
        { label: "Entity Masters", href: "management.html#sec-entities", icon: "bi-building" },
        { label: "Expert Masters", href: "management.html#sec-experts", icon: "bi-mortarboard" },
        { label: "Document Bank", href: "management.html#sec-doc-bank", icon: "bi-file-earmark-text" },
        { label: "Reports User Rights", href: "management.html#sec-reports-rights", icon: "bi-bar-chart-line" },
        { label: "Audit Trail", href: "management.html#sec-audit", icon: "bi-clock-history" },
      ],
    },
  ];

  /* Five-stage case workflow (BRD-aligned, simplified from the granular milestone list
     for at-a-glance status tracking). Each granular milestone rolls up into one stage. */
  const WORKFLOW_STAGES = ["Registered", "Pre-Approved", "In Progress", "Pre-Closure Approval", "Closed"];
  const MILESTONE_TO_STAGE = {
    opened: 0, registered: 0,
    first_review: 1,
    first_draft: 2, further_review: 2, further_draft: 2, final_draft: 2, final_review: 2,
    awaiting_customer: 2, awaiting_internal: 2,
    signoff: 3,
    completed: 4, on_hold: 4, closed: 4, cancelled: 4, archived: 4,
  };
  function workflowStageIndex(milestoneId) {
    const idx = MILESTONE_TO_STAGE[milestoneId];
    return idx === undefined ? 0 : idx;
  }
  function workflowStageName(milestoneId) {
    return WORKFLOW_STAGES[workflowStageIndex(milestoneId)];
  }
  const WORKFLOW_BADGE_CLASS = ["badge-muted", "badge-primary-dark", "badge-info", "badge-navy", "badge-success"];
  function workflowBadge(milestoneId) {
    const idx = workflowStageIndex(milestoneId);
    return `<span class="badge-status ${WORKFLOW_BADGE_CLASS[idx]}">${WORKFLOW_STAGES[idx]}</span>`;
  }
  /* Horizontal workflow stepper markup for the Case Workspace */
  function workflowStepperHtml(milestoneId) {
    const current = workflowStageIndex(milestoneId);
    return WORKFLOW_STAGES.map((label, i) => {
      const cls = i < current ? "done" : i === current ? "current" : "";
      const icon = i < current ? '<i class="bi bi-check-lg"></i>' : (i + 1);
      return `<div class="wf-step ${cls}"><div class="wf-line"></div><div class="wf-dot">${icon}</div><div class="wf-label">${label}</div></div>`;
    }).join("");
  }

  function avatarHtml(user, size) {
    size = size || 36;
    return `<div class="avatar" style="background:${user.color};width:${size}px;height:${size}px;font-size:${size*0.36}px">${user.initials}</div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Brand bar — app name on the left, utility area (lang / accessibility/  */
  /* notifications / user) on the top-right, above the main menu bar.    */
  /* ------------------------------------------------------------------ */
  function buildBrandBar() {
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
      <div class="app-brand-row app-brand-row-logos">
        <div class="d-flex align-items-center gap-2">
          <img src="assets/SLC_logo.png" alt="The Supreme Legislation Committee" class="app-brand-logo logo-on-light" width="160" height="40">
          <img src="assets/SLC_logo_white.png" alt="The Supreme Legislation Committee" class="app-brand-logo logo-on-dark" width="160" height="40">
        </div>
        <img src="assets/Tadweenlogo1.png" alt="Tadween Portal" class="app-brand-logo" width="140" height="60">
      </div>
      <div class="app-brand-row app-brand-row-utility">
        <div class="app-brand-name" style="font-weight:700;font-size:14px;color:var(--slc-text);">Case Management System &ndash; Tadween Portal</div>
        <div class="header-actions">
          <div class="lang-switch">
            <button id="langEnBtn" class="active">EN</button>
            <button id="langArBtn">AR</button>
          </div>
          <div class="header-divider"></div>
          <button class="header-icon-btn" id="a11yToggleBtn" title="Accessibility – Visually Impaired"><i class="bi bi-universal-access"></i></button>
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
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Top navigation bar (replaces the former left sidebar) — search box   */
  /* sits at the far right of this same bar.                             */
  /* ------------------------------------------------------------------ */
  function buildTopNav(active) {
    let html = `<div class="app-topnav-inner">`;
    NAV.forEach(it => {
      const keys = it.matchKeys || [it.key];
      const isActive = keys.indexOf(active) !== -1 ? "active" : "";
      if (it.dropdown) {
        html += `<div class="topnav-item">
          <a href="${it.href}" class="topnav-link ${isActive}" data-key="${it.key}">
            <span data-en="${it.label}" data-ar="${it.labelAr}">${it.label}</span><i class="bi bi-chevron-down"></i>
          </a>
          <div class="topnav-dropdown">
            ${it.dropdown.map(d => `<a href="${d.href}"><i class="bi ${d.icon}"></i>${d.label}</a>`).join("")}
          </div>
        </div>`;
      } else {
        html += `<a href="${it.href}" class="topnav-link ${isActive}" data-key="${it.key}">
          <span data-en="${it.label}" data-ar="${it.labelAr}">${it.label}</span>
        </a>`;
      }
    });
    html += `
      <div class="topnav-search">
        <div class="header-search">
          <i class="bi bi-search"></i>
          <input type="text" id="globalHeaderSearch" placeholder="Search cases, documents, entities..." autocomplete="off">
        </div>
      </div>
    </div>`;
    return html;
  }

  /* ------------------------------------------------------------------ */
  /* Accessibility (demo) — toggles a body-level class that increases    */
  /* base font size, underlines links and strengthens focus outlines.    */
  /* No backend / persistence beyond this session is implied.           */
  /* ------------------------------------------------------------------ */
  function toggleAccessibilityMode() {
    const on = document.documentElement.classList.toggle("a11y-mode");
    const btn = document.getElementById("a11yToggleBtn");
    if (btn) btn.classList.toggle("a11y-active", on);
    toast(on ? "Accessibility mode enabled (demo)." : "Accessibility mode disabled (demo).", { icon: "bi-universal-access" });
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
  /* Shell renderer                                                      */
  /* ------------------------------------------------------------------ */
  function renderShell(active, breadcrumbTrail) {
    document.body.insertAdjacentHTML("afterbegin", `<div class="app-shell" id="appShell">
      <div class="app-brand-bar" id="appBrandBar"></div>
      <nav class="app-topnav" id="appTopNav"></nav>
      <div class="app-main">
        <main class="page-wrap" id="pageContent"></main>
      </div>
    </div>`);
    document.getElementById("appBrandBar").innerHTML = buildBrandBar();
    document.getElementById("appTopNav").innerHTML = buildTopNav(active);

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

    // Mobile top-nav toggle
    const mobBtn = document.getElementById("mobileNavToggle");
    if (mobBtn) mobBtn.onclick = () => document.getElementById("appTopNav").classList.toggle("mobile-open");
    // Mobile: tap a dropdown parent to expand its submenu in place
    document.querySelectorAll(".topnav-item > .topnav-link").forEach(link => {
      link.addEventListener("click", e => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          link.parentElement.classList.toggle("dropdown-open");
        }
      });
    });

    // Lang
    const savedLang = localStorage.getItem("slc_lang") || "en";
    applyLang(savedLang);
    document.getElementById("langEnBtn").onclick = () => applyLang("en");
    document.getElementById("langArBtn").onclick = () => applyLang("ar");

    // Theme (already applied pre-paint by the inline head script; theme toggle UI is hidden,
    // no visible buttons to wire in this build)
    applyTheme(currentTheme(), { silent: true });

    // Accessibility (demo)
    const a11yBtn = document.getElementById("a11yToggleBtn");
    if (a11yBtn) a11yBtn.onclick = toggleAccessibilityMode;

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

  /* Smooth-scroll to a same-page section and briefly flash it, used by clickable KPI/data cards
     that drill into a section further down the same page rather than to another page. */
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("section-flash");
    setTimeout(() => el.classList.remove("section-flash"), 1200);
  }

  /* ------------------------------------------------------------------ */
  /* Reusable horizontal tab-panel controller — Register Case / Case     */
  /* Workspace both use this to swap visible sections without navigating.*/
  /* ------------------------------------------------------------------ */
  function initTabs(navSelector, panelSelector) {
    const tabs = document.querySelectorAll(navSelector + " .tab-btn");
    tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        tabs.forEach(b => b.classList.remove("active"));
        document.querySelectorAll(panelSelector + " .tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
      });
    });
  }

  global.SLCApp = {
    NAV, renderShell, toast, demoAction, demoActionModal, applyLang, avatarHtml,
    urgencyBadge, milestoneBadge, classifiedFlag, fmtDate, userChip,
    applyTheme, currentTheme, chartTheme, onThemeChange,
    scrollToSection, initTabs, toggleAccessibilityMode,
    workflowStageIndex, workflowStageName, workflowBadge, workflowStepperHtml, WORKFLOW_STAGES,
  };
})(window);
