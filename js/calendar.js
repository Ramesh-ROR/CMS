/* ============================================================================
   SLC Case Management System — Calendar
   ============================================================================ */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  const TODAY_STR = "2026-09-21";
  let curYear = 2026, curMonth = 8; // September 2026 (0-indexed)

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function toKey(dateObj) { return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`; }

  /* ---------------------------------------------------------------------- */
  /* Build the unified event list from real demo data — no invented items    */
  /* ---------------------------------------------------------------------- */
  const EVENTS = [];
  D.CASES.forEach(c => {
    if (c.pcd) {
      EVENTS.push({ date: c.pcd, type: "pcd", title: `${c.ref} — Proposed Completion`, sub: c.title, ref: c.ref });
    }
  });
  D.TASKS.forEach(t => {
    const c = D.caseByRef(t.relatedCase);
    EVENTS.push({ date: t.due, type: "task", title: t.title, sub: `Task deadline · Assigned to ${D.userById(t.assignedTo) ? D.userById(t.assignedTo).name : "—"}`, ref: t.relatedCase, caseTitle: c ? c.title : "" });
  });
  D.REMINDERS.forEach(r => {
    const c = D.caseByRef(r.relatedCase);
    EVENTS.push({ date: r.date, type: "reminder", title: r.title, sub: `${r.type} · ${r.time} · ${D.userById(r.assignedTo) ? D.userById(r.assignedTo).name : "—"}`, ref: r.relatedCase, caseTitle: c ? c.title : "" });
  });

  function eventsOn(dateKey) {
    return EVENTS.filter(e => e.date === dateKey);
  }

  const TYPE_LABEL = { pcd: "Case Proposed Completion Date", task: "Task Deadline", reminder: "Reminder" };
  const TYPE_ICON = { pcd: "bi-flag-fill", task: "bi-list-check", reminder: "bi-alarm" };

  /* ---------------------------------------------------------------------- */
  /* AI schedule insight — recomputed for whichever month is in view          */
  /* ---------------------------------------------------------------------- */
  function renderAIInsights() {
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const monthEvents = EVENTS.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    });
    const byDate = {};
    monthEvents.forEach(e => { byDate[e.date] = (byDate[e.date] || 0) + 1; });
    const busiest = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0];
    const items = [];
    if (busiest && busiest[1] > 1) {
      items.push(`Your busiest day this month is ${new Date(busiest[0]).toLocaleDateString("en-GB",{day:"2-digit",month:"long"})} with ${busiest[1]} scheduled items.`);
    }
    const today = new Date(TODAY_STR);
    const next7 = EVENTS.filter(e => { const dd = (new Date(e.date) - today) / 86400000; return dd >= 0 && dd <= 7; });
    if (next7.length) {
      items.push(`${next7.length} item${next7.length>1?"s":""} ${next7.length>1?"fall":"falls"} in the next 7 days, including ${next7.filter(e=>e.type==="pcd").length} case completion date${next7.filter(e=>e.type==="pcd").length===1?"":"s"}.`);
    }
    items.push(`${monthEvents.length} total items scheduled across ${new Date(curYear,curMonth,1).toLocaleDateString("en-GB",{month:"long",year:"numeric"})} — ${daysInMonth} day month.`);
    document.getElementById("aiInsightSlot").innerHTML = A.aiInsightCard("AI Schedule Insight", items);
  }

  /* ---------------------------------------------------------------------- */
  /* Render month grid                                                       */
  /* ---------------------------------------------------------------------- */
  function renderMonth() {
    document.getElementById("monthLabel").textContent =
      new Date(curYear, curMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const firstDayOfWeek = new Date(curYear, curMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

    let html = "";
    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - firstDayOfWeek + 1;
      const cellDate = new Date(curYear, curMonth, dayOffset); // JS Date rolls over automatically
      const key = toKey(cellDate);
      const otherMonth = cellDate.getMonth() !== curMonth;
      const isToday = key === TODAY_STR;
      const items = eventsOn(key);
      const shown = items.slice(0, 3);
      const extra = items.length - shown.length;

      html += `
      <div class="cal-cell ${otherMonth ? "other-month" : ""} ${isToday ? "today" : ""}" data-date="${key}">
        <div class="cal-daynum">${cellDate.getDate()}</div>
        <div class="cal-chips">
          ${shown.map(e => `<div class="cal-chip cal-chip-${e.type}" title="${e.title.replace(/"/g, "&quot;")}">${e.title}</div>`).join("")}
          ${extra > 0 ? `<div class="cal-more">+${extra} more</div>` : ""}
        </div>
      </div>`;
    }
    document.getElementById("calGrid").innerHTML = html;

    document.querySelectorAll(".cal-cell").forEach(cell => {
      cell.addEventListener("click", () => openDayDetail(cell.dataset.date));
    });

    renderAIInsights();
  }

  /* ---------------------------------------------------------------------- */
  /* Day detail modal                                                         */
  /* ---------------------------------------------------------------------- */
  function openDayDetail(key) {
    const items = eventsOn(key);
    const d = new Date(key);
    document.getElementById("dayDetailTitle").textContent = d.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

    const body = document.getElementById("dayDetailBody");
    if (!items.length) {
      body.innerHTML = `<div class="text-center text-muted-soft py-4"><i class="bi bi-calendar-x" style="font-size:26px;display:block;margin-bottom:8px;"></i>No scheduled items on this date.</div>`;
    } else {
      body.innerHTML = items.map(e => `
        <div class="dd-item">
          <div class="dd-icon ${e.type}"><i class="bi ${TYPE_ICON[e.type]}"></i></div>
          <div class="flex-fill">
            <div class="dd-title">${e.ref ? `<a href="case-workspace.html?ref=${e.ref}">${e.title}</a>` : e.title}</div>
            <div class="dd-sub">${TYPE_LABEL[e.type]}${e.caseTitle ? " · " + e.caseTitle : ""}</div>
            <div class="dd-sub">${e.sub}</div>
          </div>
        </div>`).join("");
    }
    new bootstrap.Modal(document.getElementById("dayDetailModal")).show();
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("calendar", [{ label: "Calendar" }]);

    renderMonth();

    document.getElementById("btnPrevMonth").addEventListener("click", () => {
      curMonth--; if (curMonth < 0) { curMonth = 11; curYear--; }
      renderMonth();
    });
    document.getElementById("btnNextMonth").addEventListener("click", () => {
      curMonth++; if (curMonth > 11) { curMonth = 0; curYear++; }
      renderMonth();
    });
    document.getElementById("btnToday").addEventListener("click", () => {
      curYear = 2026; curMonth = 8;
      renderMonth();
    });
  });
})();
