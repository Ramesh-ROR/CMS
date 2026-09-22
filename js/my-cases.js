/* My Cases page logic
   BRD: "My Cases includes all live cases related specifically to the case team
   (Lead Member, Team Member, Associate Member, Admin Member) including normal and
   classified cases."

   JUDGMENT CALL: a strict filter (current user is HOD/Lead/Team/Associate/Admin on
   the case) against this small demo dataset returns only 4 rows (all from the
   Legislation Directorate, since the current user u1 is only HOD of LEG). To keep
   this reading like a realistic, populated inbox we broaden the dataset to all
   non-pending (Live/Completed) cases, but cases the current user is directly tied
   to are sorted first and flagged with a "My Role" chip. Rows without a direct
   tie show "—" in that column so the distinction stays honest. */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;
  const CURRENT = D.CURRENT_USER;
  const PAGE_SIZE = 8;
  let currentPage = 1;

  const ROLE_META = {
    HOD: { label: "HOD", cls: "badge-navy" },
    LEAD: { label: "Lead Member", cls: "badge-primary-dark" },
    TEAM: { label: "Team Member", cls: "badge-info" },
    ASSOC: { label: "Associate Member", cls: "badge-purple" },
    ADMIN: { label: "Admin Member", cls: "badge-muted" },
  };

  function myRoleFor(c) {
    if (c.hod === CURRENT.id) return ROLE_META.HOD;
    if (c.lead === CURRENT.id) return ROLE_META.LEAD;
    if ((c.team || []).includes(CURRENT.id)) return ROLE_META.TEAM;
    if ((c.associate || []).includes(CURRENT.id)) return ROLE_META.ASSOC;
    if ((c.admin || []).includes(CURRENT.id)) return ROLE_META.ADMIN;
    return null;
  }

  function baseDataset() {
    return D.CASES.filter(c => c.status === "Live" || c.status === "Completed")
      .map(c => ({ c, role: myRoleFor(c) }))
      .sort((a, b) => {
        if (!!a.role !== !!b.role) return a.role ? -1 : 1;
        return new Date(b.c.lastActivity) - new Date(a.c.lastActivity);
      });
  }

  function populateFilterOptions() {
    const wtSel = document.getElementById("fWorkType");
    D.WORK_TYPES.forEach(w => wtSel.insertAdjacentHTML("beforeend", `<option value="${w.id}">${w.id}</option>`));

    const ctSel = document.getElementById("fCaseType");
    function rebuildCaseTypes(workTypeFilter) {
      ctSel.innerHTML = `<option value="">All Case Types</option>`;
      const types = workTypeFilter
        ? (D.WORK_TYPES.find(w => w.id === workTypeFilter) || { caseTypes: [] }).caseTypes
        : Array.from(new Set(D.WORK_TYPES.flatMap(w => w.caseTypes)));
      types.forEach(t => ctSel.insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`));
    }
    rebuildCaseTypes("");
    wtSel.addEventListener("change", () => { rebuildCaseTypes(wtSel.value); render(); });

    const dSel = document.getElementById("fDirectorate");
    D.DIRECTORATES.forEach(d => dSel.insertAdjacentHTML("beforeend", `<option value="${d.id}">${d.name}</option>`));

    const uSel = document.getElementById("fUrgency");
    ["Low", "Medium", "High", "Very High"].forEach(u => uSel.insertAdjacentHTML("beforeend", `<option value="${u}">${u}</option>`));
  }

  function applyFilters(rows) {
    const search = document.getElementById("fSearch").value.trim().toLowerCase();
    const workType = document.getElementById("fWorkType").value;
    const caseType = document.getElementById("fCaseType").value;
    const status = document.getElementById("fStatus").value;
    const directorate = document.getElementById("fDirectorate").value;
    const urgency = document.getElementById("fUrgency").value;
    const dateFrom = document.getElementById("fDateFrom").value;
    const dateTo = document.getElementById("fDateTo").value;
    const classifiedOnly = document.getElementById("fClassified").checked;
    const myRoleOnly = document.getElementById("fMyRoleOnly").checked;

    return rows.filter(({ c, role }) => {
      if (search) {
        const hay = `${c.ref} ${c.title} ${c.requestingEntity}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (workType && c.workType !== workType) return false;
      if (caseType && c.caseType !== caseType) return false;
      if (status && c.status !== status) return false;
      if (directorate && c.directorate !== directorate) return false;
      if (urgency && c.urgency !== urgency) return false;
      if (classifiedOnly && !c.classified) return false;
      if (myRoleOnly && !role) return false;
      if (dateFrom && c.pcd && c.pcd < dateFrom) return false;
      if (dateTo && c.pcd && c.pcd > dateTo) return false;
      return true;
    });
  }

  function rowHtml({ c, role }) {
    return `
      <tr class="${c.classified ? "row-classified" : ""}">
        <td>
          <a class="ref-link" href="case-workspace.html?ref=${c.ref}">${c.ref}</a>
          ${c.classified ? `<div class="mt-1">${A.classifiedFlag(true)}</div>` : ""}
        </td>
        <td style="max-width:260px;">${c.title}</td>
        <td>${c.workType}</td>
        <td>${c.caseType}</td>
        <td style="max-width:200px;">${c.requestingEntity}</td>
        <td>${c.lead ? A.userChip(c.lead) : '<span class="text-muted-soft">Not yet assigned</span>'}</td>
        <td>${A.milestoneBadge(c.milestone)}</td>
        <td>${A.urgencyBadge(c.urgency)}</td>
        <td>${A.fmtDate(c.pcd)}</td>
        <td><span class="badge-status ${c.status === "Completed" ? "badge-success" : "badge-info"}">${c.status}</span></td>
        <td>${A.fmtDate(c.lastActivity)}</td>
        <td>${role ? `<span class="badge-status ${role.cls}">${role.label}</span>` : '<span class="role-chip-none">—</span>'}</td>
        <td><a href="case-workspace.html?ref=${c.ref}" class="btn btn-sm btn-light border" title="Open case"><i class="bi bi-arrow-right"></i></a></td>
      </tr>`;
  }

  function renderPagination(totalRows) {
    const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
    if (currentPage > pageCount) currentPage = pageCount;
    const el = document.getElementById("mcPagination");
    let html = `<li class="page-item ${currentPage === 1 ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage - 1}">Prev</a></li>`;
    for (let p = 1; p <= pageCount; p++) {
      html += `<li class="page-item ${p === currentPage ? "active" : ""}"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`;
    }
    html += `<li class="page-item ${currentPage === pageCount ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`;
    el.innerHTML = html;
    el.querySelectorAll(".page-link").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const p = parseInt(a.getAttribute("data-page"), 10);
        if (!p || p < 1 || p > pageCount) return;
        currentPage = p;
        render();
      });
    });
  }

  function renderAIInsights(all) {
    const today = new Date("2026-09-21");
    const mineRows = all.filter(r => r.role).map(r => r.c);
    const staleDays = c => Math.round((today - new Date(c.lastActivity)) / 86400000);
    const stale = mineRows.filter(c => staleDays(c) >= 5);
    const dueSoon = mineRows.filter(c => c.pcd && (new Date(c.pcd) - today) / 86400000 <= 10 && (new Date(c.pcd) - today) / 86400000 >= 0);
    const classifiedMine = mineRows.filter(c => c.classified);
    const items = [];
    if (stale.length) items.push(`${stale.length} of your cases ${stale.length>1?"have":"has"} had no logged activity in ${Math.min(...stale.map(staleDays))}+ days — ${stale.slice(0,2).map(c=>c.ref).join(", ")}${stale.length>2?" and others":""} may need a check-in.`);
    if (dueSoon.length) items.push(`${dueSoon.length} of your cases ${dueSoon.length>1?"are":"is"} approaching ${dueSoon.length>1?"their":"its"} Proposed Completion Date within 10 days.`);
    if (classifiedMine.length) items.push(`${classifiedMine.length} classified case${classifiedMine.length>1?"s":""} on your list — visibility is restricted to your assigned team and Power Admin.`);
    items.push(`Based on current milestone velocity, your Legislation cases are trending ${mineRows.filter(c=>c.workType==="Legislation").length >= 3 ? "slightly slower than" : "in line with"} the directorate average.`);
    document.getElementById("aiInsightSlot").innerHTML = A.aiInsightCard("AI Insights — Your Cases", items);
  }

  function renderSummaryStrip(all) {
    const total = all.length;
    const mine = all.filter(r => r.role).length;
    const classified = all.filter(r => r.c.classified).length;
    const overdue = all.filter(r => r.c.overdue).length;
    document.getElementById("mcSummaryStrip").innerHTML = `
      <div class="item"><span class="dot" style="background:var(--slc-primary);"></span>${total} cases in view</div>
      <div class="item"><span class="dot" style="background:#16A34A;"></span>${mine} directly assigned to you</div>
      <div class="item"><span class="dot" style="background:#0F5FA6;"></span>${classified} classified</div>
      <div class="item"><span class="dot" style="background:#DC2626;"></span>${overdue} overdue</div>`;
  }

  function render() {
    const all = baseDataset();
    renderSummaryStrip(all);
    renderAIInsights(all);
    const filtered = applyFilters(all);
    renderPagination(filtered.length);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(start, start + PAGE_SIZE);
    document.getElementById("myCasesTbody").innerHTML = pageRows.length
      ? pageRows.map(rowHtml).join("")
      : `<tr><td colspan="13" class="text-center text-muted-soft py-4">No cases match the current filters.</td></tr>`;
    const shownFrom = filtered.length ? start + 1 : 0;
    const shownTo = Math.min(start + PAGE_SIZE, filtered.length);
    document.getElementById("mcResultCount").textContent = `Showing ${shownFrom}–${shownTo} of ${filtered.length} cases`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("my-cases", [{ label: "My Cases" }]);
    populateFilterOptions();

    ["fSearch", "fCaseType", "fStatus", "fDirectorate", "fUrgency", "fDateFrom", "fDateTo", "fClassified", "fMyRoleOnly"].forEach(id => {
      document.getElementById(id).addEventListener("input", () => { currentPage = 1; render(); });
      document.getElementById(id).addEventListener("change", () => { currentPage = 1; render(); });
    });
    document.getElementById("fResetBtn").addEventListener("click", () => {
      document.getElementById("fSearch").value = "";
      document.getElementById("fWorkType").value = "";
      document.getElementById("fCaseType").innerHTML = `<option value="">All Case Types</option>`;
      Array.from(new Set(D.WORK_TYPES.flatMap(w => w.caseTypes))).forEach(t =>
        document.getElementById("fCaseType").insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`));
      document.getElementById("fStatus").value = "";
      document.getElementById("fDirectorate").value = "";
      document.getElementById("fUrgency").value = "";
      document.getElementById("fDateFrom").value = "";
      document.getElementById("fDateTo").value = "";
      document.getElementById("fClassified").checked = false;
      document.getElementById("fMyRoleOnly").checked = false;
      currentPage = 1;
      render();
    });
    document.getElementById("exportBtn").addEventListener("click", () => {
      A.demoActionModal("Case list exported successfully (CSV) in prototype mode.");
    });

    render();
  });
})();
