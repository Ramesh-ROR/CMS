/* Dashboard page logic */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;
  const charts = [];

  function retheme() {
    const t = A.chartTheme();
    Chart.defaults.color = t.text;
    charts.forEach(ch => {
      if (ch.options.scales) {
        Object.values(ch.options.scales).forEach(sc => { if (sc.grid) sc.grid.color = t.grid; });
      }
      ch.data.datasets.forEach(ds => { if (ds.borderColor === "#fff" || ds.borderColor === t.border) ds.borderColor = t.border; });
      ch.update("none");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("dashboard", [{ label: "Dashboard" }]);
    const t = A.chartTheme();
    Chart.defaults.font.family = "Segoe UI, Inter, sans-serif";
    Chart.defaults.color = t.text;
    Chart.defaults.font.size = 11.5;

    const palette = { blue: "#0033A0", darkBlue: "#0033A0", teal: "#0B7285", green: "#16A34A", purple: "#8764B8", orange: "#F08C1A", pink: "#C239B3", grey: "#9CA3AF", red: "#DC2626" };

    /* --- Monthly Trend --- */
    charts.push(new Chart(document.getElementById("chartTrend"), {
      type: "line",
      data: {
        labels: ["Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"],
        datasets: [
          { label: "Registered", data: [92,101,88,110,122,118,131,127,140,135,148,156], borderColor: palette.blue, backgroundColor: "rgba(0,120,212,.08)", fill: true, tension: .35, pointRadius: 3 },
          { label: "Closed", data: [80,95,84,99,108,112,120,119,126,124,138,142], borderColor: palette.green, backgroundColor: "rgba(22,163,74,.06)", fill: true, tension: .35, pointRadius: 3 },
        ],
      },
      options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true } } }, scales: { y: { grid: { color: t.grid } }, x: { grid: { display: false } } }, maintainAspectRatio: false },
    }));

    /* --- Work Type doughnut --- */
    charts.push(new Chart(document.getElementById("chartWorkType"), {
      type: "doughnut",
      data: {
        labels: D.WORK_TYPES.map(w => w.id),
        datasets: [{ data: [412, 268, 198, 231, 139], backgroundColor: D.WORK_TYPES.map(w => w.color), borderWidth: 2, borderColor: t.border }],
      },
      options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10.5 }, usePointStyle: true } } }, cutout: "68%", maintainAspectRatio: false },
    }));

    /* --- Directorate grouped bar: Live vs. Completed only (no Pending) --- */
    const DIRECTORATE_CASELOAD = {
      "Legislation Directorate": { live: 145, completed: 238 },
      "Legal Advice and Opinion Directorate": { live: 96, completed: 174 },
      "Translation Section": { live: 72, completed: 121 },
      "General Section": { live: 84, completed: 149 },
      "Research and Publications Section": { live: 61, completed: 102 },
    };
    charts.push(new Chart(document.getElementById("chartDirectorate"), {
      type: "bar",
      data: {
        labels: D.DIRECTORATES.map(d => d.id),
        datasets: [
          { label: "Live Cases", data: D.DIRECTORATES.map(d => DIRECTORATE_CASELOAD[d.name].live), backgroundColor: palette.blue, borderRadius: 6, maxBarThickness: 26 },
          { label: "Completed Cases", data: D.DIRECTORATES.map(d => DIRECTORATE_CASELOAD[d.name].completed), backgroundColor: palette.green, borderRadius: 6, maxBarThickness: 26 },
        ],
      },
      options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true } } }, scales: { y: { grid: { color: t.grid } }, x: { grid: { display: false } } }, maintainAspectRatio: false },
    }));

    /* --- Aging --- */
    charts.push(new Chart(document.getElementById("chartAging"), {
      type: "bar",
      data: {
        labels: ["0-15 days", "16-30 days", "31-60 days", "61-90 days", "90+ days"],
        datasets: [{ label: "Cases", data: [420, 356, 241, 138, 93], backgroundColor: [palette.green, palette.blue, "#F5C242", palette.orange, palette.red], borderRadius: 6 }],
      },
      options: { indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { grid: { color: t.grid } }, y: { grid: { display: false } } }, maintainAspectRatio: false },
    }));

    /* --- Completion performance: Target / Completed / Within SLA / Beyond SLA --- */
    charts.push(new Chart(document.getElementById("chartCompletion"), {
      type: "bar",
      data: {
        labels: ["Apr","May","Jun","Jul","Aug","Sep"],
        datasets: [
          { label: "Target", data: [100,100,100,100,100,100], backgroundColor: "rgba(0,0,0,.08)", borderRadius: 6 },
          { label: "Within SLA", data: [88,94,101,97,110,103], backgroundColor: palette.blue, borderRadius: 6, stack: "s" },
          { label: "Beyond SLA", data: [15,11,9,14,8,12], backgroundColor: palette.red, borderRadius: 6, stack: "s" },
        ],
      },
      options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true } } }, scales: { y: { grid: { color: t.grid } }, x: { grid: { display: false } } }, maintainAspectRatio: false },
    }));

    A.onThemeChange(retheme);

    /* --- Cases requiring attention --- */
    const ATTENTION_ITEMS = [
      { ref: "SLC-LEG-2026-00128", title: "Federal Environmental Legislation", stage: "Pre-Approved", note: "Requires approval", icon: "bi-hourglass-split", tone: "warning" },
      { ref: "SLC-LEG-2026-00119", title: "Ratification Review — Bilateral Investment Treaty", stage: "In Progress", note: "Past Proposed Completion Date", icon: "bi-exclamation-triangle-fill", tone: "danger" },
      { ref: "SLC-GEN-2026-00061", title: "IT Infrastructure Upgrade Request", stage: "In Progress", note: "Past Proposed Completion Date", icon: "bi-exclamation-triangle-fill", tone: "danger" },
      { ref: "SLC-LAO-2026-00087", title: "Legal Opinion on PPP Framework", stage: "In Progress", note: "Classified — restricted visibility", icon: "bi-shield-lock-fill", tone: "info" },
      { ref: "SLC-LEG-2026-00131", title: "Amendment to Local Traffic and Roads Legislation", stage: "Registered", note: "Delayed milestone — 18 days in First Review", icon: "bi-clock-history", tone: "warning" },
      { ref: "SLC-RP-2026-00033", title: "Official Gazette Issue No. 214", stage: "In Progress", note: "Registration action required", icon: "bi-clipboard-check", tone: "info" },
    ];
    const TONE_CLASS = { warning: "text-warning", danger: "text-danger", info: "text-primary" };
    document.getElementById("attentionList").innerHTML = ATTENTION_ITEMS.map(x => `
      <a href="case-workspace.html?ref=${x.ref}" class="d-flex align-items-start gap-2 py-2 border-bottom text-decoration-none" style="border-color:var(--slc-border) !important;">
        <i class="bi ${x.icon} ${TONE_CLASS[x.tone]} mt-1"></i>
        <div class="flex-grow-1">
          <div style="font-size:12.3px;font-weight:600;color:var(--slc-text);">${x.ref} <span class="text-muted-soft fw-normal">— ${x.title}</span></div>
          <div style="font-size:11.3px;color:var(--slc-muted);margin-top:2px;">${x.note}</div>
        </div>
        <span class="badge-status badge-muted">${x.stage}</span>
      </a>`).join("");

    /* --- Pending approvals --- */
    const approvals = D.PENDING_APPROVALS;
    document.querySelector("#approvalsTable tbody").innerHTML = approvals.map(a => {
      const c = D.caseByRef(a.ref);
      return `<tr>
        <td><a class="ref-link" href="case-workspace.html?ref=${a.ref}">${a.ref}</a></td>
        <td style="max-width:220px;">${c.title}</td>
        <td>${c.workType}</td>
        <td><span class="badge-status badge-info">${a.stage}</span></td>
        <td>${A.fmtDate(a.submitted)}</td>
        <td>${A.userChip(a.by)}</td>
        <td><button class="btn btn-sm btn-outline-primary" onclick="SLCApp.demoActionModal('Approval recorded successfully in prototype mode.')">Review</button></td>
      </tr>`;
    }).join("");

    /* --- Recent activities --- */
    const allActivities = [];
    Object.keys(D.ACTIVITIES).forEach(ref => D.ACTIVITIES[ref].forEach(a => allActivities.push({ ...a, ref })));
    allActivities.sort((a,b) => new Date(b.date) - new Date(a.date));
    document.getElementById("recentActivitiesList").innerHTML = allActivities.slice(0, 6).map(a => {
      const [datePart, timePart] = a.date.split(" ");
      return `
      <div class="d-flex gap-2 py-2 border-bottom" style="border-color:var(--slc-border) !important;">
        <i class="bi bi-clock-history mt-1 text-muted-soft"></i>
        <div>
          <div style="font-size:11.2px;font-weight:700;color:var(--slc-muted);">${timePart || ""}</div>
          <div style="font-size:12.2px;margin-top:1px;"><strong>${a.type}</strong> — ${a.ref}</div>
          <div style="font-size:11.2px;color:var(--slc-muted);">${datePart} · ${D.userById(a.user).name}</div>
        </div>
      </div>`;
    }).join("");
  });
})();
