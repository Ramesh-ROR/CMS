/* ============================================================================
   SLC Case Management System — Reminders
   ============================================================================ */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  const STATUS_BADGE = {
    "Upcoming": "badge-info",
    "Due Today": "badge-warning",
    "Overdue": "badge-danger",
  };

  const TYPE_ICON = {
    "Case Activity": "bi-journal-check",
    "PCD Auto-Reminder": "bi-flag-fill",
    "Task Reminder": "bi-list-check",
    "Manual Reminder": "bi-hand-index-thumb",
  };

  let activeDate = null; // yyyy-mm-dd or null

  function weekdayShort(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-GB", { weekday: "short" });
  }
  function dayNum(dateStr) {
    return new Date(dateStr).getDate();
  }

  function renderAIInsights() {
    const overdue = D.REMINDERS.filter(r => r.status === "Overdue");
    const dueToday = D.REMINDERS.filter(r => r.status === "Due Today");
    const byUser = {};
    D.REMINDERS.forEach(r => { byUser[r.assignedTo] = (byUser[r.assignedTo] || 0) + 1; });
    const sameDayCases = {};
    D.REMINDERS.forEach(r => { const k = r.date + "|" + r.relatedCase; sameDayCases[k] = (sameDayCases[k] || 0) + 1; });
    const clusterable = Object.values(sameDayCases).filter(n => n > 1).length;
    const items = [];
    if (overdue.length) items.push(`${overdue.length} reminder${overdue.length>1?"s are":" is"} overdue: "${overdue[0].title}"${overdue.length>1?" and others":""} — resolve or snooze to keep the queue accurate.`);
    if (dueToday.length) items.push(`${dueToday.length} reminder${dueToday.length>1?"s are":" is"} due today and should be actioned before end of day.`);
    if (clusterable) items.push(`AI detected ${clusterable} case${clusterable>1?"s":""} with multiple reminders on the same day — these could be consolidated into a single follow-up.`);
    document.getElementById("aiInsightSlot").innerHTML = A.aiInsightCard("AI Reminder Digest", items);
  }

  function renderDateStrip() {
    const dates = Array.from(new Set(D.REMINDERS.map(r => r.date))).sort();
    const strip = document.getElementById("dateStrip");
    strip.innerHTML = dates.map(d => {
      const items = D.REMINDERS.filter(r => r.date === d);
      const worstStatus = items.some(r => r.status === "Overdue") ? "Overdue"
        : items.some(r => r.status === "Due Today") ? "Due Today" : "Upcoming";
      const color = worstStatus === "Overdue" ? "#B91C1C" : worstStatus === "Due Today" ? "#B45309" : "#8A6A3A";
      const isToday = d === "2026-09-21";
      return `
      <div class="date-chip ${activeDate === d ? "active" : ""} ${isToday ? "is-today" : ""}" data-date="${d}">
        <div class="dow">${isToday ? "Today" : weekdayShort(d)}</div>
        <div class="dnum">${dayNum(d)}</div>
        <div class="dcount" style="color:${color}">${items.length} reminder${items.length > 1 ? "s" : ""}</div>
      </div>`;
    }).join("");

    strip.querySelectorAll(".date-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const d = chip.dataset.date;
        activeDate = activeDate === d ? null : d;
        renderDateStrip();
        renderTable();
      });
    });
  }

  function renderTable() {
    const items = D.REMINDERS
      .filter(r => !activeDate || r.date === activeDate)
      .slice()
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    document.getElementById("reminderCountLabel").textContent =
      `Showing ${items.length} of ${D.REMINDERS.length} reminders` + (activeDate ? ` for ${A.fmtDate(activeDate)}` : "");
    document.getElementById("btnClearDateFilter").style.display = activeDate ? "" : "none";

    const tbody = document.querySelector("#remindersTable tbody");
    tbody.innerHTML = items.map(r => {
      const c = D.caseByRef(r.relatedCase);
      return `
      <tr>
        <td style="max-width:230px;font-weight:600;color:var(--slc-text);">${r.title}</td>
        <td>${c ? `<a class="ref-link" href="case-workspace.html?ref=${c.ref}">${c.ref}</a>` : "—"}</td>
        <td>${A.fmtDate(r.date)} <span class="text-muted-soft" style="font-size:11.5px;">${r.time}</span></td>
        <td>${A.userChip(r.assignedTo)}</td>
        <td><span class="type-pill"><i class="bi ${TYPE_ICON[r.type] || "bi-bell"}"></i>${r.type}</span></td>
        <td><span class="badge-status ${STATUS_BADGE[r.status] || "badge-muted"}">${r.status}</span></td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-light border" data-action="snooze" data-id="${r.id}" title="Snooze"><i class="bi bi-alarm"></i></button>
            <button class="btn btn-sm btn-light border" data-action="dismiss" data-id="${r.id}" title="Dismiss"><i class="bi bi-x-lg"></i></button>
            ${c ? `<a class="btn btn-sm btn-light border" href="case-workspace.html?ref=${c.ref}" title="View Case"><i class="bi bi-arrow-right-circle"></i></a>` : ""}
          </div>
        </td>
      </tr>`;
    }).join("");

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted-soft py-5">No reminders for this date.</td></tr>`;
    }

    tbody.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const r = D.REMINDERS.find(x => x.id === btn.dataset.id);
        if (action === "snooze") A.demoActionModal(`Reminder "${r.title}" snoozed until tomorrow — prototype mode.`);
        if (action === "dismiss") A.demoActionModal(`Reminder "${r.title}" dismissed — prototype mode.`);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("reminders", [{ label: "Reminders" }]);

    renderAIInsights();
    renderDateStrip();
    renderTable();

    document.getElementById("btnAddReminder").addEventListener("click", () => {
      A.demoActionModal("New reminder form would open here — prototype mode.");
    });
    document.getElementById("btnClearDateFilter").addEventListener("click", () => {
      activeDate = null;
      renderDateStrip();
      renderTable();
    });
  });
})();
