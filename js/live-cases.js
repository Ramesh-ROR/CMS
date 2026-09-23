/* Live Cases page logic — registered and active cases (status "Live") */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;
  const PAGE_SIZE = 8;
  let currentPage = 1;

  function liveCases() {
    return D.CASES.filter(c => c.status === "Live");
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
    uSel.insertAdjacentHTML("beforeend", `<option value="High,Very High">High &amp; Very High</option>`);

    const mSel = document.getElementById("fMilestone");
    const usedMilestones = Array.from(new Set(liveCases().map(c => c.milestone)));
    D.MILESTONES.filter(m => usedMilestones.includes(m.id)).sort((a, b) => a.order - b.order)
      .forEach(m => mSel.insertAdjacentHTML("beforeend", `<option value="${m.id}">${m.name}</option>`));
  }

  function applyFilters(rows) {
    const search = document.getElementById("fSearch").value.trim().toLowerCase();
    const workType = document.getElementById("fWorkType").value;
    const caseType = document.getElementById("fCaseType").value;
    const directorate = document.getElementById("fDirectorate").value;
    const urgency = document.getElementById("fUrgency").value;
    const milestone = document.getElementById("fMilestone").value;
    const dateFrom = document.getElementById("fDateFrom").value;
    const dateTo = document.getElementById("fDateTo").value;
    const classifiedOnly = document.getElementById("fClassified").checked;
    const overdueOnly = document.getElementById("fOverdue").checked;

    return rows.filter(c => {
      if (search) {
        const hay = `${c.ref} ${c.title} ${c.requestingEntity}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (workType && c.workType !== workType) return false;
      if (caseType && c.caseType !== caseType) return false;
      if (directorate && c.directorate !== directorate) return false;
      if (urgency && !urgency.split(",").includes(c.urgency)) return false;
      if (milestone && c.milestone !== milestone) return false;
      if (classifiedOnly && !c.classified) return false;
      if (overdueOnly && !c.overdue) return false;
      if (dateFrom && c.pcd && c.pcd < dateFrom) return false;
      if (dateTo && c.pcd && c.pcd > dateTo) return false;
      return true;
    });
  }

  function rowHtml(c) {
    const dName = (D.DIRECTORATES.find(d => d.id === c.directorate) || {}).name || c.directorate;
    return `
      <tr class="${c.classified ? "row-classified" : ""}">
        <td>
          <a class="ref-link" href="case-workspace.html?ref=${c.ref}">${c.ref}</a>
          ${c.overdue ? `<div class="mt-1"><span class="badge-status badge-danger"><i class="bi bi-exclamation-triangle-fill" style="margin-right:2px;"></i>Overdue</span></div>` : ""}
          ${c.classified ? `<div class="mt-1">${A.classifiedFlag(true)}</div>` : ""}
        </td>
        <td style="max-width:250px;">${c.title}</td>
        <td>${c.workType}</td>
        <td>${c.caseType}</td>
        <td style="font-size:12.2px;">${dName}</td>
        <td>${c.lead ? A.userChip(c.lead) : '<span class="text-muted-soft">Not yet assigned</span>'}</td>
        <td>${A.milestoneBadge(c.milestone)}</td>
        <td>${A.urgencyBadge(c.urgency)}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="lc-progress-bar"><div class="fill" style="width:${c.progressPct || 0}%;"></div></div>
            <span style="font-size:11px;color:var(--slc-muted);">${c.progressPct || 0}%</span>
          </div>
        </td>
        <td>${A.fmtDate(c.pcd)}</td>
        <td>${A.fmtDate(c.lastActivity)}</td>
        <td><a href="case-workspace.html?ref=${c.ref}" class="btn btn-sm btn-light border" title="Open case"><i class="bi bi-arrow-right"></i></a></td>
      </tr>`;
  }

  function renderKpis(all) {
    const total = all.length;
    const highUrgency = all.filter(c => c.urgency === "High" || c.urgency === "Very High").length;
    const classified = all.filter(c => c.classified).length;
    const overdue = all.filter(c => c.overdue).length;
    document.getElementById("lcKpiRow").innerHTML = `
      <div class="col-6 col-md-3">
        <a href="javascript:void(0)" class="kpi-card-link" onclick="window.__lcKpiClick('all')">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:#F5EBD8;color:#8A6A3A;"><i class="bi bi-activity"></i></div>
          <div class="kpi-value">${total}</div>
        </div>
          <div class="kpi-label">Live Cases</div>
        </div>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a href="javascript:void(0)" class="kpi-card-link" onclick="window.__lcKpiClick('urgency')">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:#FFE8D1;color:#C2540A;"><i class="bi bi-flag"></i></div>
          <div class="kpi-value">${highUrgency}</div>
        </div>
          <div class="kpi-label">High / Very High Urgency</div>
        </div>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a href="javascript:void(0)" class="kpi-card-link" onclick="window.__lcKpiClick('classified')">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:#F5EBD8;color:#6B4F24;"><i class="bi bi-shield-lock"></i></div>
          <div class="kpi-value">${classified}</div>
        </div>
          <div class="kpi-label">Classified Cases</div>
        </div>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a href="javascript:void(0)" class="kpi-card-link" onclick="window.__lcKpiClick('overdue')">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:#FEE2E2;color:#B91C1C;"><i class="bi bi-exclamation-triangle"></i></div>
          <div class="kpi-value">${overdue}</div>
        </div>
          <div class="kpi-label">Overdue Cases</div>
        </div>
        </a>
      </div>`;
  }

  function renderAIInsights(all) {
    const counts = {};
    all.forEach(c => { counts[c.milestone] = (counts[c.milestone] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const topMilestone = top ? D.milestoneById(top[0]) : null;
    const overdue = all.filter(c => c.overdue);
    const byWorkType = {};
    all.forEach(c => { byWorkType[c.workType] = (byWorkType[c.workType] || 0) + 1; });
    const busiestWT = Object.entries(byWorkType).sort((a, b) => b[1] - a[1])[0];
    const items = [];
    if (topMilestone) items.push(`"${topMilestone.name}" is the busiest milestone right now, holding ${top[1]} of ${all.length} live cases (${Math.round(top[1]/all.length*100)}%) — a likely throughput bottleneck.`);
    if (overdue.length) items.push(`${overdue.length} live case${overdue.length>1?"s are":" is"} past ${overdue.length>1?"their":"its"} Proposed Completion Date: ${overdue.map(c=>c.ref).join(", ")}.`);
    if (busiestWT) items.push(`${busiestWT[0]} accounts for the largest share of this view (${busiestWT[1]} cases) — consider directorate workload balancing.`);
    document.getElementById("aiInsightSlot").innerHTML = A.aiInsightCard("AI Portfolio Insights", items);
  }

  function renderPagination(totalRows) {
    const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
    if (currentPage > pageCount) currentPage = pageCount;
    const el = document.getElementById("lcPagination");
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

  function render() {
    const all = liveCases();
    const filtered = applyFilters(all);
    renderPagination(filtered.length);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(start, start + PAGE_SIZE);
    document.getElementById("liveCasesTbody").innerHTML = pageRows.length
      ? pageRows.map(rowHtml).join("")
      : `<tr><td colspan="12" class="text-center text-muted-soft py-4">No cases match the current filters.</td></tr>`;
    const shownFrom = filtered.length ? start + 1 : 0;
    const shownTo = Math.min(start + PAGE_SIZE, filtered.length);
    document.getElementById("lcResultCount").textContent = `Showing ${shownFrom}–${shownTo} of ${filtered.length} live cases`;
  }

  function applyParamsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("overdue")) document.getElementById("fOverdue").checked = true;
    if (params.has("classified")) document.getElementById("fClassified").checked = true;
    if (params.has("urgency")) document.getElementById("fUrgency").value = params.get("urgency");
  }

  function resetFilters() {
    document.getElementById("fSearch").value = "";
    document.getElementById("fWorkType").value = "";
    document.getElementById("fCaseType").innerHTML = `<option value="">All Case Types</option>`;
    Array.from(new Set(D.WORK_TYPES.flatMap(w => w.caseTypes))).forEach(t =>
      document.getElementById("fCaseType").insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`));
    document.getElementById("fDirectorate").value = "";
    document.getElementById("fUrgency").value = "";
    document.getElementById("fMilestone").value = "";
    document.getElementById("fDateFrom").value = "";
    document.getElementById("fDateTo").value = "";
    document.getElementById("fClassified").checked = false;
    document.getElementById("fOverdue").checked = false;
    currentPage = 1;
    render();
  }

  /* Clicking a KPI card jumps straight to the matching slice of this same table */
  window.__lcKpiClick = function (type) {
    resetFilters();
    if (type === "urgency") document.getElementById("fUrgency").value = "High,Very High";
    if (type === "classified") document.getElementById("fClassified").checked = true;
    if (type === "overdue") document.getElementById("fOverdue").checked = true;
    currentPage = 1;
    render();
    document.querySelector(".filter-bar, .table-card").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("live-cases", [{ label: "Live Cases" }]);
    renderKpis(liveCases());
    renderAIInsights(liveCases());
    populateFilterOptions();
    applyParamsFromUrl();

    ["fSearch", "fCaseType", "fDirectorate", "fUrgency", "fMilestone", "fDateFrom", "fDateTo", "fClassified", "fOverdue"].forEach(id => {
      document.getElementById(id).addEventListener("input", () => { currentPage = 1; render(); });
      document.getElementById(id).addEventListener("change", () => { currentPage = 1; render(); });
    });
    document.getElementById("fResetBtn").addEventListener("click", resetFilters);
    document.getElementById("exportBtn").addEventListener("click", () => {
      A.demoActionModal("Live case list exported successfully (CSV) in prototype mode.");
    });

    render();
  });
})();
