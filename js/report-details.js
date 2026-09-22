/* ============================================================================
   SLC Case Management System — Report Details (drill-down) page logic
   Chart figures marked "illustrative" are demo figures consistent with the
   ~1,248 live-case scale established on the Executive Dashboard; figures
   reused directly from dashboard.js / demo-data.js are noted inline.
   ============================================================================ */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;
  const charts = [];
  let t = { text: "#6B7280", grid: "#F1F3F6", border: "#fff" };

  function retheme() {
    t = A.chartTheme();
    Chart.defaults.color = t.text;
    charts.forEach(ch => {
      if (ch.options.scales) Object.values(ch.options.scales).forEach(sc => { if (sc.grid) sc.grid.color = t.grid; });
      ch.data.datasets.forEach(ds => { if (ds.borderWidth === 2) ds.borderColor = t.border; });
      ch.update("none");
    });
  }

  const palette = { blue: "#0078D4", teal: "#0B7285", green: "#16A34A", purple: "#8764B8", orange: "#F08C1A", pink: "#C239B3", grey: "#9CA3AF", red: "#DC2626", yellow: "#F5C242" };
  const MONTHS12 = ["Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"];

  function pct(v, total) { return total ? ((v / total) * 100).toFixed(1) + "%" : "—"; }

  /* ------------------------------------------------------------------ */
  /* Shared table builder for simple label/value breakdowns              */
  /* ------------------------------------------------------------------ */
  function countTable(labels, values, labelHeader, valueHeader) {
    const total = values.reduce((a, b) => a + b, 0);
    return {
      cols: [labelHeader, valueHeader, "% of Total"],
      rows: labels.map((l, i) => [l, values[i].toLocaleString(), pct(values[i], total)]),
    };
  }

  /* ------------------------------------------------------------------ */
  /* Real-data computation: user workload from live cases + tasks        */
  /* ------------------------------------------------------------------ */
  function computeUserWorkload() {
    return D.USERS.map(u => {
      const caseCount = D.CASES.filter(c =>
        c.lead === u.id || c.hod === u.id ||
        (c.team || []).includes(u.id) || (c.associate || []).includes(u.id) || (c.admin || []).includes(u.id)
      ).length;
      const taskCount = D.TASKS.filter(t => t.assignedTo === u.id).length;
      return { user: u, caseCount, taskCount, total: caseCount + taskCount };
    }).filter(w => w.total > 0).sort((a, b) => b.total - a.total).slice(0, 8);
  }

  /* ------------------------------------------------------------------ */
  /* Case type breakdown (illustrative, sums to each work type's total   */
  /* from the Executive Dashboard's Cases-by-Work-Type figures)          */
  /* ------------------------------------------------------------------ */
  const CASE_TYPE_BREAKDOWN = [
    { wt: "Legislation", ct: "Local Legislations", count: 210 },
    { wt: "Legislation", ct: "Federal Legislations", count: 142 },
    { wt: "Legislation", ct: "Treaties & Conventions", count: 60 },
    { wt: "Legal Advice and Opinion", ct: "Legal Advice", count: 190 },
    { wt: "Legal Advice and Opinion", ct: "Official Interpretation of Legislation", count: 78 },
    { wt: "Translation", ct: "Arabic to English Translation", count: 132 },
    { wt: "Translation", ct: "English to Arabic Translation", count: 66 },
    { wt: "General", ct: "Human Resource", count: 28 },
    { wt: "General", ct: "Information Technology", count: 34 },
    { wt: "General", ct: "Finance and Admin", count: 22 },
    { wt: "General", ct: "Events", count: 18 },
    { wt: "General", ct: "Training and Professional Development", count: 15 },
    { wt: "General", ct: "Strategy and Corporate Excellence", count: 12 },
    { wt: "General", ct: "Legal Auditing", count: 26 },
    { wt: "General", ct: "Committees", count: 31 },
    { wt: "General", ct: "Media and Communication", count: 14 },
    { wt: "General", ct: "Knowledge and Legislative Comparison", count: 19 },
    { wt: "General", ct: "Others", count: 12 },
    { wt: "Research and Publications", ct: "Official Gazette", count: 58 },
    { wt: "Research and Publications", ct: "Legislation Publications", count: 52 },
    { wt: "Research and Publications", ct: "Others", count: 29 },
  ];

  /* ------------------------------------------------------------------ */
  /* Per-report chart + table + narrative builders                       */
  /* ------------------------------------------------------------------ */
  const BUILDERS = {

    "rep-work-type": () => {
      const labels = D.WORK_TYPES.map(w => w.id);
      const data = [412, 268, 198, 231, 139];
      return {
        primary: { type: "doughnut", labels, datasets: [{ data, backgroundColor: D.WORK_TYPES.map(w => w.color), borderWidth: 2, borderColor: t.border }], cutout: "66%" },
        chartTitle1: "Live &amp; Closed Cases by Work Type",
        table: countTable(labels, data, "Work Type", "Cases"),
        narrative: "Legislation accounts for the largest share of case volume (33%), followed by Legal Advice and Opinion (21%). This mirrors the breakdown shown on the Executive Dashboard.",
      };
    },

    "rep-case-type": () => {
      const sorted = CASE_TYPE_BREAKDOWN.slice().sort((a, b) => b.count - a.count).slice(0, 8);
      return {
        primary: {
          type: "bar", indexAxis: "y",
          labels: sorted.map(x => x.ct),
          datasets: [{ label: "Cases", data: sorted.map(x => x.count), backgroundColor: palette.blue, borderRadius: 6 }],
        },
        chartTitle1: "Top Case Types (Chart shows top 8 of 21 configured case types)",
        table: {
          cols: ["Work Type", "Case Type", "Cases", "% of Total"],
          rows: CASE_TYPE_BREAKDOWN.map(x => [x.wt, x.ct, x.count.toLocaleString(), pct(x.count, 1248)]),
        },
        narrative: "Local Legislations (210) and Legal Advice (190) are the highest-volume case types. Within the General work type, Committees and Information Technology lead the caseload.",
      };
    },

    "rep-directorate": () => {
      const labels = D.DIRECTORATES.map(d => d.name);
      const data = [412, 268, 198, 231, 139];
      return {
        primary: { type: "bar", labels, datasets: [{ label: "Live Cases", data, backgroundColor: D.WORK_TYPES.map(w => w.color), borderRadius: 6, maxBarThickness: 46 }], showLegend: false },
        chartTitle1: "Live Caseload by Directorate",
        table: countTable(labels, data, "Directorate", "Live Cases"),
        narrative: "The Legislation Directorate carries the heaviest caseload (33%), consistent with the volume of Local and Federal Legislation cases currently in progress.",
      };
    },

    "rep-status": () => {
      const labels = ["Live", "Pending", "Completed", "On Hold", "Closed/Archived"];
      const data = [1248, 86, 156, 24, 312];
      return {
        primary: { type: "doughnut", labels, datasets: [{ data, backgroundColor: [palette.blue, palette.yellow, palette.green, palette.red, palette.grey], borderWidth: 2, borderColor: t.border }], cutout: "66%" },
        chartTitle1: "Case Status Distribution (reused from Executive Dashboard)",
        table: countTable(labels, data, "Status", "Cases"),
        narrative: "Live cases represent 68% of the total case register. Pending cases (86) are awaiting registration completion — see the Registration Performance report for cycle-time detail.",
      };
    },

    "rep-milestone": () => {
      const ms = D.MILESTONES.filter(m => m.order <= 11).sort((a, b) => a.order - b.order);
      const data = [62, 118, 165, 210, 188, 156, 142, 98, 61, 33, 15];
      const labels = ms.map(m => m.name);
      return {
        primary: { type: "bar", indexAxis: "y", labels, datasets: [{ label: "Live Cases", data, backgroundColor: ms.map(m => m.color === "#FFFFFF" || m.color === "#F3F4F6" ? "#9CA3AF" : m.color), borderRadius: 6 }], showLegend: false },
        chartTitle1: "Live Cases by Current Milestone",
        table: countTable(labels, data, "Milestone", "Cases"),
        narrative: "First Draft (210) and Further Review (188) hold the largest concentration of live cases, indicating drafting and review stages as the primary throughput bottleneck.",
      };
    },

    "rep-aging": () => {
      const labels = ["0-15 days", "16-30 days", "31-60 days", "61-90 days", "90+ days"];
      const data = [420, 356, 241, 138, 93];
      return {
        primary: { type: "bar", labels, datasets: [{ label: "Cases", data, backgroundColor: [palette.green, palette.blue, palette.yellow, palette.orange, palette.red], borderRadius: 6 }], showLegend: false },
        chartTitle1: "Case Aging (Days Open) — reused from Executive Dashboard",
        table: countTable(labels, data, "Age Bracket", "Cases"),
        narrative: "93 live cases have been open more than 90 days. Combined with the 61-90 day bracket, 231 cases (18.5%) warrant an aging review by directorate leadership.",
      };
    },

    "rep-completion": () => {
      const labels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
      const onTime = [88, 94, 101, 97, 110, 103];
      const delayed = [15, 11, 9, 14, 8, 12];
      const rate = onTime.map((v, i) => +(v / (v + delayed[i]) * 100).toFixed(1));
      return {
        primary: { type: "line", labels, datasets: [{ label: "On-Time Completion Rate %", data: rate, borderColor: palette.green, backgroundColor: "rgba(22,163,74,.08)", fill: true, tension: .35, pointRadius: 3 }], showLegend: false },
        chartTitle1: "Monthly On-Time Completion Rate (derived from Dashboard completion figures)",
        table: { cols: ["Month", "On-Time", "Delayed", "Completion Rate"], rows: labels.map((m, i) => [m, onTime[i], delayed[i], rate[i] + "%"]) },
        narrative: "Completion performance improved from 85.4% in April to 89.6% in September, with a peak of 93.2% in August.",
      };
    },

    "rep-overdue": () => {
      const labels = D.WORK_TYPES.map(w => w.id);
      const data = [7, 4, 2, 5, 1];
      return {
        primary: { type: "bar", labels, datasets: [{ label: "Overdue Cases", data, backgroundColor: D.WORK_TYPES.map(w => w.color), borderRadius: 6 }], showLegend: false },
        chartTitle1: "Overdue Cases by Work Type (19 total, per Executive Dashboard KPI)",
        table: countTable(labels, data, "Work Type", "Overdue Cases"),
        narrative: "Legislation cases account for over a third of all overdue cases (7 of 19). Ratification Review — Bilateral Investment Treaty (SLC-LEG-2026-00119) is 5 days past its Proposed Completion Date.",
      };
    },

    "rep-classified": () => {
      const labels = ["Live", "Pending", "Completed", "On Hold"];
      const data = [36, 14, 5, 2];
      return {
        primary: { type: "doughnut", labels, datasets: [{ data, backgroundColor: [palette.blue, palette.yellow, palette.green, palette.red], borderWidth: 2, borderColor: t.border }], cutout: "66%" },
        chartTitle1: "Classified Case Status (57 total, Power Admin access only)",
        table: countTable(labels, data, "Status", "Classified Cases"),
        narrative: "Classified cases follow a similar status distribution to the overall register, with 63% currently Live. Access to this report is restricted to Power System Admin and above.",
      };
    },

    "rep-registration": () => {
      const labels = MONTHS12;
      const data = [6.2, 5.8, 6.0, 5.5, 5.2, 5.6, 5.1, 4.8, 4.9, 4.6, 4.4, 4.2];
      return {
        primary: { type: "line", labels, datasets: [{ label: "Avg. Days to Complete Registration", data, borderColor: palette.teal, backgroundColor: "rgba(11,114,133,.08)", fill: true, tension: .35, pointRadius: 3 }], showLegend: false },
        chartTitle1: "Average Registration Cycle Time (Case Receipt to Case Registered)",
        table: { cols: ["Month", "Avg. Days"], rows: labels.map((m, i) => [m, data[i].toFixed(1)]) },
        narrative: "The average registration cycle has improved from 6.2 days to 4.2 days over the past year, reflecting faster intake processing by the Registration Team.",
      };
    },

    "rep-workload": () => {
      const w = computeUserWorkload();
      const labels = w.map(x => x.user.name);
      return {
        primary: {
          type: "bar", labels,
          datasets: [
            { label: "Active Cases", data: w.map(x => x.caseCount), backgroundColor: palette.blue, borderRadius: 6, stack: "s" },
            { label: "Open Tasks", data: w.map(x => x.taskCount), backgroundColor: palette.purple, borderRadius: 6, stack: "s" },
          ],
          options: { scales: { y: { stacked: true, grid: { color: t.grid } }, x: { stacked: true, grid: { display: false } } } },
        },
        chartTitle1: "Active Case &amp; Task Load per User (computed from current demo dataset)",
        table: {
          cols: ["User", "Role", "Active Cases", "Open Tasks", "Total Load"],
          rows: w.map(x => [x.user.name, x.user.role, x.caseCount, x.taskCount, x.total]),
        },
        narrative: `${w[0].user.name} currently carries the highest combined workload (${w[0].total} items) across the demo dataset, largely driven by Head of Directorate case oversight.`,
      };
    },

    "rep-task-perf": () => {
      const data = [5.8, 5.6, 5.9, 5.4, 5.2, 5.5, 5.1, 4.9, 5.0, 4.7, 4.5, 4.3];
      const statusCounts = {};
      D.TASKS.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
      const statusLabels = Object.keys(statusCounts);
      const statusData = statusLabels.map(s => statusCounts[s]);
      return {
        primary: { type: "line", labels: MONTHS12, datasets: [{ label: "Avg. Task Turnaround (days)", data, borderColor: palette.orange, backgroundColor: "rgba(240,140,26,.08)", fill: true, tension: .35, pointRadius: 3 }], showLegend: false },
        chartTitle1: "Average Task Turnaround Trend",
        secondary: { type: "doughnut", labels: statusLabels, datasets: [{ data: statusData, backgroundColor: [palette.blue, palette.yellow, palette.red, palette.green], borderWidth: 2, borderColor: t.border }], cutout: "66%" },
        chartTitle2: "Current Task Status Mix (live sample)",
        table: { cols: ["Status", "Tasks", "% of Sample"], rows: statusLabels.map((s, i) => [s, statusData[i], pct(statusData[i], D.TASKS.length)]) },
        narrative: "Average task turnaround has fallen from 5.8 to 4.3 days over the past year. Of the current task sample, 2 tasks are overdue and require follow-up.",
      };
    },

    "rep-activity": () => {
      const data = [520, 548, 561, 590, 604, 588, 622, 645, 630, 668, 690, 712];
      return {
        primary: { type: "bar", labels: MONTHS12, datasets: [{ label: "Activities Logged", data, backgroundColor: palette.blue, borderRadius: 6 }], showLegend: false },
        chartTitle1: "Case Activity Volume Logged Over Time",
        table: { cols: ["Month", "Activities Logged"], rows: MONTHS12.map((m, i) => [m, data[i]]) },
        narrative: "Case activity volume has grown steadily, up 37% over the past 12 months, consistent with the rising live case count across directorates.",
      };
    },

    "rep-docs": () => {
      const labels = ["PDF", "Word", "Excel", "Scanned/Image", "Other"];
      const data = [2140, 1380, 420, 310, 150];
      return {
        primary: { type: "doughnut", labels, datasets: [{ data, backgroundColor: [palette.red, "#2563EB", palette.green, palette.purple, palette.grey], borderWidth: 2, borderColor: t.border }], cutout: "66%" },
        chartTitle1: "Document Uploads by File Type",
        table: countTable(labels, data, "File Type", "Documents"),
        narrative: "PDF remains the dominant document format (49% of uploads), consistent with final approved legislation and legal opinion documents being stored as signed PDFs.",
      };
    },

    "rep-translation": () => {
      const labels = ["Arabic to English Translation", "English to Arabic Translation"];
      const data = [132, 66];
      const monthly = [14, 12, 15, 18, 16, 17, 19, 15, 20, 16, 18, 18];
      return {
        primary: { type: "bar", labels, datasets: [{ label: "Cases", data, backgroundColor: [palette.purple, "#B9A2D9"], borderRadius: 6 }], showLegend: false },
        chartTitle1: "Translation Cases by Direction",
        secondary: { type: "line", labels: MONTHS12, datasets: [{ label: "Monthly Completions", data: monthly, borderColor: palette.purple, backgroundColor: "rgba(135,100,184,.08)", fill: true, tension: .35, pointRadius: 3 }] },
        chartTitle2: "Monthly Translation Completions",
        table: countTable(labels, data, "Translation Direction", "Cases"),
        narrative: "Arabic-to-English translation makes up two-thirds of translation case volume, largely driven by legislation and legal advice cases requiring English versions for Executive Council submission.",
      };
    },

    "rep-gazette": () => {
      const data = [3, 2, 4, 3, 5, 4, 3, 5, 4, 6, 5, 6];
      return {
        primary: { type: "line", labels: MONTHS12, datasets: [{ label: "Gazette Issues Published", data, borderColor: palette.pink, backgroundColor: "rgba(194,57,179,.08)", fill: true, tension: .35, pointRadius: 3 }], showLegend: false },
        chartTitle1: "Official Gazette Issue Publication Tracking",
        table: { cols: ["Month", "Issues Published"], rows: MONTHS12.map((m, i) => [m, data[i]]) },
        narrative: "Gazette publication cadence has increased in the second half of the year. The most recent issue in progress is Official Gazette Issue No. 214 (case SLC-RP-2026-00033), covering Q3 local legislations.",
      };
    },
  };

  /* ------------------------------------------------------------------ */
  /* Chart rendering                                                     */
  /* ------------------------------------------------------------------ */
  function makeChart(canvasId, cfg) {
    const baseOptions = {
      maintainAspectRatio: false,
      indexAxis: cfg.indexAxis || undefined,
      cutout: cfg.cutout || undefined,
      plugins: { legend: { display: cfg.showLegend !== false, position: "bottom", labels: { boxWidth: 10, usePointStyle: true, font: { size: 10.5 } } } },
    };
    if (cfg.type !== "doughnut" && cfg.type !== "pie") {
      baseOptions.scales = { y: { grid: { color: t.grid } }, x: { grid: { display: false } } };
    }
    const options = Object.assign(baseOptions, cfg.options || {});
    return new Chart(document.getElementById(canvasId), {
      type: cfg.type,
      data: { labels: cfg.labels, datasets: cfg.datasets },
      options,
    });
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    let id = params.get("id");

    function findReport(reportId) {
      for (const group of Object.keys(D.REPORTS_CATALOG)) {
        const found = D.REPORTS_CATALOG[group].find(r => r.id === reportId);
        if (found) return found;
      }
      return null;
    }

    let report = id ? findReport(id) : null;
    if (!report) {
      report = D.REPORTS_CATALOG["Case Reports"][0];
      id = report.id;
    }

    A.renderShell("reports", [{ label: "Reports", href: "reports.html" }, { label: report.name }]);

    t = A.chartTheme();
    Chart.defaults.font.family = "Segoe UI, Inter, sans-serif";
    Chart.defaults.color = t.text;
    Chart.defaults.font.size = 11.5;

    document.getElementById("rptTitle").textContent = report.name;
    document.getElementById("rptDesc").textContent = report.desc;
    document.getElementById("rptChartTag").textContent = report.chart + " chart";

    const builder = BUILDERS[id] || BUILDERS["rep-work-type"];
    const cfg = builder();

    document.getElementById("chartTitle1").innerHTML = cfg.chartTitle1 || report.name;
    charts.push(makeChart("chartPrimary", cfg.primary));

    if (cfg.secondary) {
      document.getElementById("secondaryChartCard").style.display = "";
      document.getElementById("chartTitle2").innerHTML = cfg.chartTitle2 || "Detail";
      charts.push(makeChart("chartSecondary", cfg.secondary));
    }

    A.onThemeChange(retheme);

    document.getElementById("rptNarrative").innerHTML =
      `<div>${cfg.narrative}</div><div class="mt-2"><span class="ai-chip"><i class="bi bi-info-circle"></i>AI-Assisted Capability – Demonstration Prototype</span></div>`;

    document.getElementById("rptTableHead").innerHTML = cfg.table.cols.map(c => `<th>${c}</th>`).join("");
    document.getElementById("rptTableBody").innerHTML = cfg.table.rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join("")}</tr>`).join("");
    document.getElementById("tableSubtitle").textContent = `${cfg.table.rows.length} row${cfg.table.rows.length === 1 ? "" : "s"}`;
  });
})();
