/* Completed Cases page logic — cases whose status is "Completed" */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;
  const PAGE_SIZE = 8;
  let currentPage = 1;
  let activeCode = "LEG";
  let sortField = null;
  let sortDir = 1;

  function completedCases() {
    return D.CASES.filter(c => c.status === "Completed");
  }

  function activeWorkType() {
    return D.WORK_TYPES.find(w => w.code === activeCode);
  }

  function populateFilterOptions() {
    const ctSel = document.getElementById("fCaseType");
    function rebuildCaseTypes() {
      ctSel.innerHTML = `<option value="">All Case Types</option>`;
      const types = (activeWorkType() || { caseTypes: [] }).caseTypes;
      types.forEach(t => ctSel.insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`));
    }
    rebuildCaseTypes();
    populateFilterOptions.rebuildCaseTypes = rebuildCaseTypes;

    const dSel = document.getElementById("fDirectorate");
    D.DIRECTORATES.forEach(d => dSel.insertAdjacentHTML("beforeend", `<option value="${d.id}">${d.name}</option>`));

    const uSel = document.getElementById("fUrgency");
    ["Low", "Medium", "High", "Very High"].forEach(u => uSel.insertAdjacentHTML("beforeend", `<option value="${u}">${u}</option>`));
  }

  function applyFilters(rows) {
    const search = document.getElementById("fSearch").value.trim().toLowerCase();
    const caseType = document.getElementById("fCaseType").value;
    const directorate = document.getElementById("fDirectorate").value;
    const urgency = document.getElementById("fUrgency").value;
    const classifiedOnly = document.getElementById("fClassified").checked;
    const wt = activeWorkType();

    return rows.filter(c => {
      if (wt && c.workType !== wt.id) return false;
      if (search) {
        const hay = `${c.ref} ${c.title} ${c.requestingEntity}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (caseType && c.caseType !== caseType) return false;
      if (directorate && c.directorate !== directorate) return false;
      if (urgency && c.urgency !== urgency) return false;
      if (classifiedOnly && !c.classified) return false;
      return true;
    });
  }

  function applySort(rows) {
    if (!sortField) return rows;
    return rows.slice().sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === "lead") { av = av ? D.userById(av).name : ""; bv = bv ? D.userById(bv).name : ""; }
      if (av === undefined || av === null) av = "";
      if (bv === undefined || bv === null) bv = "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });
  }

  function updateSortIndicators() {
    document.querySelectorAll("#completedCasesTable th.sortable").forEach(th => {
      th.classList.remove("sort-asc", "sort-desc");
      if (th.getAttribute("data-sort") === sortField) th.classList.add(sortDir === 1 ? "sort-asc" : "sort-desc");
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
        <td style="max-width:200px;">${c.requestingEntity}</td>
        <td>${c.lead ? A.userChip(c.lead) : '<span class="text-muted-soft">Not yet assigned</span>'}</td>
        <td>${A.fmtDate(c.pcd)}</td>
        <td>${A.fmtDate(c.lastActivity)}</td>
        <td><a href="case-workspace.html?ref=${c.ref}" class="btn btn-sm btn-light border" title="Open case"><i class="bi bi-arrow-right"></i></a></td>
      </tr>`;
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
    document.getElementById("fCaseType").value = "";
    document.getElementById("fDirectorate").value = "";
    document.getElementById("fUrgency").value = "";
    document.getElementById("fClassified").checked = false;
    currentPage = 1;
    render();
  }

  function render() {
    const all = completedCases();
    let filtered = applyFilters(all);
    filtered = applySort(filtered);
    renderPagination(filtered.length);
    updateSortIndicators();
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(start, start + PAGE_SIZE);
    document.getElementById("completedCasesTbody").innerHTML = pageRows.length
      ? pageRows.map(rowHtml).join("")
      : `<tr><td colspan="8" class="text-center text-muted-soft py-4">No completed cases match the current filters.</td></tr>`;
    const shownFrom = filtered.length ? start + 1 : 0;
    const shownTo = Math.min(start + PAGE_SIZE, filtered.length);
    document.getElementById("ccResultCount").textContent = `Showing ${shownFrom}–${shownTo} of ${filtered.length} completed cases`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("completed-cases", [{ label: "Completed Cases" }]);
    populateFilterOptions();

    document.querySelectorAll("#ccClassTabs .tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#ccClassTabs .tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCode = btn.getAttribute("data-code");
        populateFilterOptions.rebuildCaseTypes();
        document.getElementById("fCaseType").value = "";
        currentPage = 1;
        render();
      });
    });

    document.getElementById("fToggleBtn").addEventListener("click", function () {
      const expanded = this.getAttribute("aria-expanded") === "true";
      this.innerHTML = expanded
        ? `<i class="bi bi-sliders"></i>Filters<i class="bi bi-chevron-down ms-1"></i>`
        : `<i class="bi bi-sliders"></i>Filters<i class="bi bi-chevron-up ms-1"></i>`;
    });

    document.querySelectorAll("#completedCasesTable th.sortable").forEach(th => {
      th.addEventListener("click", () => {
        const field = th.getAttribute("data-sort");
        if (sortField === field) { sortDir *= -1; } else { sortField = field; sortDir = 1; }
        render();
      });
    });

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
