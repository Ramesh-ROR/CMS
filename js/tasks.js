/* ============================================================================
   SLC Case Management System — Tasks Inbox
   ============================================================================ */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  /* Demo "today" — fixed to match the prototype's current date (21-Sep-2026) */
  const TODAY = new Date(2026, 8, 21);

  const STATUS_COLUMNS = [
    { key: "New", label: "New", colClass: "col-new" },
    { key: "In Progress", label: "In Progress", colClass: "col-inprogress" },
    { key: "Completed", label: "Completed", colClass: "col-completed" },
    { key: "Overdue", label: "Overdue", colClass: "col-overdue" },
  ];

  const STATUS_BADGE = {
    "New": "badge-info",
    "In Progress": "badge-warning",
    "Completed": "badge-success",
    "Overdue": "badge-danger",
  };

  const PRIORITY_BADGE = {
    "High": "badge-orange",
    "Medium": "badge-info",
    "Low": "badge-muted",
  };

  const FILTERS = [
    { key: "all", label: "All Tasks", fn: () => true,
      emptyTitle: "No tasks found", emptySub: "There are no tasks in the system yet." },
    { key: "mine", label: "My Tasks", fn: t => t.assignedTo === D.CURRENT_USER.id,
      emptyTitle: "No tasks assigned to you", emptySub: "You currently have no open or completed tasks assigned to your name." },
    { key: "by", label: "Assigned By Me", fn: t => t.assignedBy === D.CURRENT_USER.id,
      emptyTitle: "You haven't assigned any tasks", emptySub: "Tasks you assign to team members will appear here." },
    { key: "to", label: "Assigned To Me", fn: t => t.assignedTo === D.CURRENT_USER.id,
      emptyTitle: "Nothing assigned to you right now", emptySub: "When a colleague assigns you a task, it will show up in this view." },
  ];

  let activeFilter = "all";

  /* ---------------------------------------------------------------------- */
  /* Working-day urgency calculation (BRD: Not Urgent / Becoming Urgent /    */
  /* Urgent / Critical / Overdue — UAE working week is Sun–Thu)             */
  /* ---------------------------------------------------------------------- */
  function workingDaysUntil(dueStr) {
    const due = new Date(dueStr);
    due.setHours(0, 0, 0, 0);
    const today = new Date(TODAY);
    today.setHours(0, 0, 0, 0);
    if (due < today) return -1;
    if (due.getTime() === today.getTime()) return 0;
    let count = 0;
    const cur = new Date(today);
    cur.setDate(cur.getDate() + 1);
    while (cur <= due) {
      const dow = cur.getDay(); // Fri=5, Sat=6 are the UAE weekend
      if (dow !== 5 && dow !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  function urgencyFlag(task) {
    if (task.status === "Completed") return { label: "—", cls: "flag-none" };
    if (task.status === "Overdue") return { label: "Overdue", cls: "flag-overdue" };
    const wd = workingDaysUntil(task.due);
    if (wd < 0) return { label: "Overdue", cls: "flag-overdue" };
    if (wd <= 2) return { label: "Critical", cls: "flag-critical" };
    if (wd <= 3) return { label: "Urgent", cls: "flag-urgent" };
    if (wd <= 5) return { label: "Becoming Urgent", cls: "flag-becoming-urgent" };
    return { label: "Not Urgent", cls: "flag-not-urgent" };
  }

  /* ---------------------------------------------------------------------- */
  /* AI prioritization insight                                               */
  /* ---------------------------------------------------------------------- */
  function renderAIInsights() {
    const open = D.TASKS.filter(t => t.status !== "Completed");
    const flagged = open.map(t => ({ t, flag: urgencyFlag(t) }));
    const critical = flagged.filter(x => x.flag.label === "Overdue" || x.flag.label === "Critical");
    const load = {};
    open.forEach(t => { load[t.assignedTo] = (load[t.assignedTo] || 0) + 1; });
    const busiest = Object.entries(load).sort((a, b) => b[1] - a[1])[0];
    const busiestUser = busiest ? D.userById(busiest[0]) : null;
    const items = [];
    if (critical.length) {
      items.push(`AI suggests prioritizing ${critical.length} task${critical.length>1?"s":""} first: ${critical.slice(0,3).map(x=>`"${x.t.title}"`).join(", ")}${critical.length>3?" and others":""} — flagged Overdue or Critical.`);
    }
    if (busiestUser && busiest[1] >= 2) {
      items.push(`${busiestUser.name} currently holds the largest open task load (${busiest[1]} tasks) — consider redistributing if deadlines cluster.`);
    }
    const notUrgent = flagged.filter(x => x.flag.label === "Not Urgent").length;
    items.push(notUrgent
      ? `${open.length} open tasks across the team; ${notUrgent} are not yet time-sensitive and can be deferred.`
      : `${open.length} open tasks across the team, and all currently carry an active urgency flag.`);
    document.getElementById("aiInsightSlot").innerHTML = A.aiInsightCard("AI Task Prioritization", items);
  }

  /* ---------------------------------------------------------------------- */
  /* Kanban board                                                            */
  /* ---------------------------------------------------------------------- */
  function renderKanban() {
    const row = document.getElementById("kanbanRow");
    row.innerHTML = STATUS_COLUMNS.map(col => {
      const items = D.TASKS.filter(t => t.status === col.key);
      const cards = items.map(t => {
        const c = D.caseByRef(t.relatedCase);
        const flag = urgencyFlag(t);
        const assignee = D.userById(t.assignedTo);
        return `
        <div class="kanban-card">
          <div class="k-title">${t.title}</div>
          ${c ? `<a class="k-case k-case-link" href="case-workspace.html?ref=${c.ref}">${c.ref}</a>` : ""}
          <div class="k-meta">
            <div class="d-flex align-items-center gap-1">${A.avatarHtml(assignee, 22)}<span>${assignee ? assignee.name.split(" ")[0] : "—"}</span></div>
            <span class="badge-status ${flag.cls}" style="font-size:10px;">${flag.label}</span>
          </div>
          <div class="k-meta" style="margin-top:4px;">
            <span><i class="bi bi-calendar3 me-1"></i>Due ${A.fmtDate(t.due)}</span>
          </div>
        </div>`;
      }).join("") || `<div class="text-center text-muted-soft py-4" style="font-size:12px;">No tasks</div>`;

      return `
      <div class="col-md-6 col-xl-3">
        <div class="kanban-col ${col.colClass}">
          <div class="kanban-col-head">
            <span class="title"><span class="dot"></span>${col.label}</span>
            <span class="count-pill">${items.length}</span>
          </div>
          ${cards}
        </div>
      </div>`;
    }).join("");
  }

  /* ---------------------------------------------------------------------- */
  /* Filter tabs                                                             */
  /* ---------------------------------------------------------------------- */
  function renderTabs() {
    const wrap = document.getElementById("taskFilterTabs");
    wrap.innerHTML = FILTERS.map(f => `
      <button type="button" class="btn btn-light border ${f.key === activeFilter ? "active" : ""}" data-filter="${f.key}">${f.label}</button>
    `).join("");
    wrap.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;
        renderTabs();
        renderTable();
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Detailed table                                                          */
  /* ---------------------------------------------------------------------- */
  function renderTable() {
    const filter = FILTERS.find(f => f.key === activeFilter);
    const items = D.TASKS.filter(filter.fn);
    const tbody = document.querySelector("#tasksTable tbody");
    const emptyState = document.getElementById("tasksEmptyState");
    const countLabel = document.getElementById("taskCountLabel");

    countLabel.textContent = `Showing ${items.length} of ${D.TASKS.length} tasks`;

    if (!items.length) {
      document.getElementById("tasksTable").style.display = "none";
      emptyState.style.display = "block";
      emptyState.innerHTML = `
        <i class="bi bi-inbox"></i>
        <div class="es-title">${filter.emptyTitle}</div>
        <div class="es-sub">${filter.emptySub}</div>`;
      return;
    }
    document.getElementById("tasksTable").style.display = "";
    emptyState.style.display = "none";

    tbody.innerHTML = items.map(t => {
      const c = D.caseByRef(t.relatedCase);
      const flag = urgencyFlag(t);
      return `
      <tr>
        <td style="max-width:240px;font-weight:600;color:var(--slc-text);">${t.title}</td>
        <td>${c ? `<a class="ref-link" href="case-workspace.html?ref=${c.ref}">${c.ref}</a>` : "—"}</td>
        <td>${A.userChip(t.assignedTo)}</td>
        <td>${A.userChip(t.assignedBy)}</td>
        <td><span class="badge-status ${PRIORITY_BADGE[t.priority] || "badge-muted"}">${t.priority}</span></td>
        <td>${A.fmtDate(t.due)}</td>
        <td><span class="badge-status ${STATUS_BADGE[t.status] || "badge-muted"}">${t.status}</span></td>
        <td><span class="badge-status ${flag.cls}">${flag.label}</span></td>
        <td>
          <div class="dropdown">
            <button class="btn btn-sm btn-light border" data-bs-toggle="dropdown"><i class="bi bi-three-dots"></i></button>
            <ul class="dropdown-menu dropdown-menu-end" style="font-size:12.5px;">
              <li><a class="dropdown-item" href="#" data-action="complete" data-id="${t.id}"><i class="bi bi-check2-circle me-2"></i>Mark Complete</a></li>
              <li><a class="dropdown-item" href="#" data-action="reassign" data-id="${t.id}"><i class="bi bi-person-gear me-2"></i>Reassign</a></li>
              <li><a class="dropdown-item" href="#" data-action="snooze" data-id="${t.id}"><i class="bi bi-alarm me-2"></i>Snooze Reminder</a></li>
              ${c ? `<li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="case-workspace.html?ref=${c.ref}"><i class="bi bi-arrow-right-circle me-2"></i>View Case</a></li>` : ""}
            </ul>
          </div>
        </td>
      </tr>`;
    }).join("");

    tbody.querySelectorAll("[data-action]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        const action = el.dataset.action;
        const task = D.TASKS.find(t => t.id === el.dataset.id);
        const messages = {
          complete: `Task "${task.title}" marked as complete in prototype mode.`,
          reassign: `Reassignment dialog would open here for task "${task.title}" — prototype mode.`,
          snooze: `Reminder for task "${task.title}" snoozed by 1 day — prototype mode.`,
        };
        A.demoActionModal(messages[action]);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("tasks", [{ label: "Tasks" }]);

    renderAIInsights();
    renderKanban();
    renderTabs();
    renderTable();

    document.getElementById("btnAddTask").addEventListener("click", () => {
      A.demoActionModal("New task form would open here — prototype mode. Task would be added to the board once saved.");
    });
    document.getElementById("btnAssignTask").addEventListener("click", () => {
      A.demoActionModal("Task assignment dialog would open here — prototype mode.");
    });
  });
})();
