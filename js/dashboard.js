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

    const palette = { blue: "#B8863E", teal: "#0B7285", green: "#16A34A", purple: "#8764B8", orange: "#F08C1A", pink: "#C239B3", grey: "#9CA3AF", red: "#DC2626" };

    /* --- Monthly Trend --- */
    charts.push(new Chart(document.getElementById("chartTrend"), {
      type: "line",
      data: {
        labels: ["Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"],
        datasets: [
          { label: "Registered", data: [92,101,88,110,122,118,131,127,140,135,148,156], borderColor: palette.blue, backgroundColor: "rgba(184,134,62,.08)", fill: true, tension: .35, pointRadius: 3 },
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

    /* --- Directorate bar --- */
    charts.push(new Chart(document.getElementById("chartDirectorate"), {
      type: "bar",
      data: {
        labels: D.DIRECTORATES.map(d => d.id),
        datasets: [{ label: "Live Cases", data: [412, 268, 198, 231, 139], backgroundColor: palette.blue, borderRadius: 6, maxBarThickness: 34 }],
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: t.grid } }, x: { grid: { display: false } } }, maintainAspectRatio: false },
    }));

    /* --- Status distribution --- */
    charts.push(new Chart(document.getElementById("chartStatus"), {
      type: "pie",
      data: {
        labels: ["Live", "Pending", "Completed", "On Hold", "Closed/Archived"],
        datasets: [{ data: [1248, 86, 156, 24, 312], backgroundColor: [palette.blue, "#F5C242", palette.green, palette.red, palette.grey], borderWidth: 2, borderColor: t.border }],
      },
      options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10.5 }, usePointStyle: true } } }, maintainAspectRatio: false },
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

    /* --- Completion performance --- */
    charts.push(new Chart(document.getElementById("chartCompletion"), {
      type: "bar",
      data: {
        labels: ["Apr","May","Jun","Jul","Aug","Sep"],
        datasets: [
          { label: "On-Time", data: [88,94,101,97,110,103], backgroundColor: palette.green, borderRadius: 6, stack: "s" },
          { label: "Delayed", data: [15,11,9,14,8,12], backgroundColor: palette.red, borderRadius: 6, stack: "s" },
        ],
      },
      options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true } } }, scales: { y: { grid: { color: t.grid }, stacked: true }, x: { grid: { display: false }, stacked: true } }, maintainAspectRatio: false },
    }));

    A.onThemeChange(retheme);

    /* --- AI Insights --- */
    const aiBox = document.getElementById("aiInsightsBox");
    aiBox.innerHTML = D.AI_INSIGHTS.map(t => `<div class="ai-insight-item"><i class="bi bi-stars"></i><div>${t}</div></div>`).join("")
      + `<div class="text-center mt-2"><span class="ai-chip"><i class="bi bi-info-circle"></i>AI-Assisted Insight – Demo</span></div>`;

    /* --- Recent cases table --- */
    const recent = D.CASES.slice().sort((a,b) => new Date(b.lastActivity) - new Date(a.lastActivity)).slice(0, 6);
    document.querySelector("#recentCasesTable tbody").innerHTML = recent.map(c => `
      <tr class="${c.classified ? "row-classified" : ""}">
        <td><a class="ref-link" href="case-workspace.html?ref=${c.ref}">${c.ref}</a>${c.classified ? " " + A.classifiedFlag(true) : ""}</td>
        <td style="max-width:260px;">${c.title}</td>
        <td>${c.workType}</td>
        <td>${A.milestoneBadge(c.milestone)}</td>
        <td>${A.urgencyBadge(c.urgency)}</td>
        <td>${A.fmtDate(c.pcd)}</td>
        <td><a href="case-workspace.html?ref=${c.ref}" class="btn btn-sm btn-light border"><i class="bi bi-arrow-right"></i></a></td>
      </tr>`).join("");

    /* --- Cases requiring attention --- */
    const attention = D.CASES.filter(c => c.overdue || c.classified).slice(0, 4);
    document.getElementById("attentionList").innerHTML = attention.map(c => `
      <a href="case-workspace.html?ref=${c.ref}" class="d-flex align-items-start gap-2 py-2 border-bottom text-decoration-none" style="border-color:var(--slc-border) !important;">
        <i class="bi ${c.overdue ? "bi-exclamation-triangle-fill text-danger" : "bi-shield-lock-fill text-primary"} mt-1"></i>
        <div>
          <div style="font-size:12.3px;font-weight:600;color:var(--slc-text);">${c.ref}</div>
          <div style="font-size:11.6px;color:var(--slc-muted);">${c.overdue ? "Past Proposed Completion Date" : "Classified — restricted visibility"}</div>
        </div>
      </a>`).join("");

    /* --- Upcoming milestones --- */
    const upcoming = D.CASES.filter(c => c.pcd && c.status === "Live").sort((a,b) => new Date(a.pcd) - new Date(b.pcd)).slice(0, 5);
    document.getElementById("milestoneList").innerHTML = upcoming.map(c => `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--slc-border) !important;">
        <div>
          <div style="font-size:12.3px;font-weight:600;">${c.ref}</div>
          <div style="font-size:11.3px;color:var(--slc-muted);">PCD: ${A.fmtDate(c.pcd)}</div>
        </div>
        ${A.milestoneBadge(c.milestone)}
      </div>`).join("");

    /* --- Pending approvals --- */
    const approvals = [
      { text: "Secretary General Final Approval — SLC-LEG-2026-00128", by: "u1" },
      { text: "Milestone change request — SLC-LAO-2026-00087", by: "u7" },
      { text: "Official Gazette publication sign-off — SLC-RP-2026-00033", by: "u9" },
    ];
    document.getElementById("approvalsList").innerHTML = approvals.map(a => `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--slc-border) !important;">
        <div style="font-size:12.2px;max-width:190px;">${a.text}</div>
        <button class="btn btn-sm btn-outline-primary" onclick="SLCApp.demoActionModal('Approval recorded successfully in prototype mode.')">Review</button>
      </div>`).join("");

    /* --- Recent activities --- */
    const allActivities = [];
    Object.keys(D.ACTIVITIES).forEach(ref => D.ACTIVITIES[ref].forEach(a => allActivities.push({ ...a, ref })));
    allActivities.sort((a,b) => new Date(b.date) - new Date(a.date));
    document.getElementById("recentActivitiesList").innerHTML = allActivities.slice(0, 5).map(a => `
      <div class="d-flex gap-2 py-2 border-bottom" style="border-color:var(--slc-border) !important;">
        <i class="bi bi-clock-history mt-1 text-muted-soft"></i>
        <div>
          <div style="font-size:12.2px;"><strong>${a.type}</strong> — ${a.ref}</div>
          <div style="font-size:11.2px;color:var(--slc-muted);">${a.date} · ${D.userById(a.user).name}</div>
        </div>
      </div>`).join("");

    /* --- Reminders --- */
    document.getElementById("reminderList").innerHTML = D.REMINDERS.slice(0, 4).map(r => `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--slc-border) !important;">
        <div>
          <div style="font-size:12.2px;font-weight:600;">${r.title}</div>
          <div style="font-size:11.2px;color:var(--slc-muted);">${A.fmtDate(r.date)} · ${r.relatedCase}</div>
        </div>
        <span class="badge-status ${r.status === "Overdue" ? "badge-danger" : r.status === "Due Today" ? "badge-warning" : "badge-info"}">${r.status}</span>
      </div>`).join("");
  });
})();
