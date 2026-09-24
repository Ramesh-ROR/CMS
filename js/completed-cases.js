/* Completed Cases page logic — cases whose status is "Completed" */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;
  const PAGE_SIZE = 8;
  let currentPage = 1;

  function completedCases() {
    return D.CASES.filter(c => c.status === "Completed");
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
    wtSel.addEventListener("change", () => { rebuildCaseTypes(wtSel.value); currentPage = 1; render(); });

    const dSel = document.getElementById("fDirectorate");
    D.DIRECTORATES.forEach(d => dSel.insertAdjacentHTML("beforeend", `<option value="${d.id}">${d.name}</option>`));

    const uSel = document.getElementById("fUrgency");
    ["Low", "Medium", "High", "Very High"].forEach(u => uSel.insertAdjacentHTML("beforeend", `<option value="${u}">${u}</option>`));
  }

  function applyFilters(rows) {
    const search = document.getElementById("fSearch").value.trim().toLowerCase();
    const workType = document.getElementById("fWorkType").value;
    const caseType = document.getElementById("fCaseType").value;
    const directorate = document.getElementById("fDirectorate").value;
    const urgency = document.getElementById("fUrgency").value;
    const classifiedOnly = document.getElementById("fClassified").checked;

    return rows.filter(c => {
      if (search) {
        const hay = `${c.ref} ${c.title} ${c.requestingEntity}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (workType && c.workType !== workType) return false;
      if (caseType && c.caseType !== caseType) return false;
      if (directorate && c.directorate !== directorate) return false;
      if (urgency && c.urgency !== urgency) return false;
      if (classifiedOnly && !c.classified) return false;
      return true;
    });
  }

  function rowHtml(c) {
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
        <td>${A.workflowBadge(c.milestone)}</td>
        <td>${A.urgencyBadge(c.urgency)}</td>
        <td>${A.fmtDate(c.pcd)}</td>
        <td>${A.fmtDate(c.lastActivity)}</td>
        <td><a href="case-workspace.html?ref=${c.ref}" class="btn btn-sm btn-light border" title="Open case"><i class="bi bi-arrow-right"></i></a></td>
      </tr>`;
  }

  function renderKpis(rows) {
    const total = rows.length;
    const classified = rows.filter(c => c.classified).length;
    const highUrgency = rows.filter(c => c.urgency === "High" || c.urgency === "Very High").length;
    const avgDays = total ? Math.round(rows.reduce((s, c) => s + (c.csd && c.acd ? (new Date(c.acd) - new Date(c.csd)) / 86400000 : 0), 0) / total) : 0;
    document.getElementById("ccKpiRow").innerHTML = `
      <div class="col-6 col-md-3">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:var(--light-blue);color:var(--primary-blue);"><i class="bi bi-check2-circle"></i></div>
          <div class="kpi-value">${total}</div>
        </div>
          <div class="kpi-label">Completed Cases</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:var(--grey-100);color:var(--grey-600);"><i class="bi bi-hourglass-bottom"></i></div>
          <div class="kpi-value">${avgDays}</div>
        </div>
          <div class="kpi-label">Avg. Days to Complete</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:var(--light-blue);color:var(--dark-blue);"><i class="bi bi-flag"></i></div>
          <div class="kpi-value">${highUrgency}</div>
        </div>
          <div class="kpi-label">High / Very High Urgency</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:var(--light-blue);color:var(--dark-blue);"><i class="bi bi-shield-lock"></i></div>
          <div class="kpi-value">${classified}</div>
        </div>
          <div class="kpi-label">Classified Cases</div>
        </div>
      </div>`;
  }

  function renderPagination(totalRows) {
    const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
    if (currentPage > pageCount) currentPage = pageCount;
    const el = document.getElementById("ccPagination");
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

  function resetFilters() {
    document.getElementById("fSearch").value = "";
    document.getElementById("fWorkType").value = "";
    document.getElementById("fCaseType").innerHTML = `<option value="">All Case Types</option>`;
    Array.from(new Set(D.WORK_TYPES.flatMap(w => w.caseTypes))).forEach(t =>
      document.getElementById("fCaseType").insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`));
    document.getElementById("fDirectorate").value = "";
    document.getElementById("fUrgency").value = "";
    document.getElementById("fClassified").checked = false;
    currentPage = 1;
    render();
  }

  function render() {
    const all = completedCases();
    const filtered = applyFilters(all);
    renderPagination(filtered.length);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(start, start + PAGE_SIZE);
    document.getElementById("completedCasesTbody").innerHTML = pageRows.length
      ? pageRows.map(rowHtml).join("")
      : `<tr><td colspan="11" class="text-center text-muted-soft py-4">No completed cases match the current filters.</td></tr>`;
    const shownFrom = filtered.length ? start + 1 : 0;
    const shownTo = Math.min(start + PAGE_SIZE, filtered.length);
    document.getElementById("ccResultCount").textContent = `Showing ${shownFrom}–${shownTo} of ${filtered.length} completed cases`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("completed-cases", [{ label: "Completed Cases" }]);
    const all = completedCases();
    renderKpis(all);
    populateFilterOptions();

    ["fSearch", "fCaseType", "fDirectorate", "fUrgency", "fClassified"].forEach(id => {
      document.getElementById(id).addEventListener("input", () => { currentPage = 1; render(); });
      document.getElementById(id).addEventListener("change", () => { currentPage = 1; render(); });
    });
    document.getElementById("fResetBtn").addEventListener("click", resetFilters);
    document.getElementById("exportBtn").addEventListener("click", () => {
      A.demoActionModal("Report exported successfully – Demo Mode");
    });

    render();
  });
})();
