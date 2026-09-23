/* Pending Cases page logic
   BRD: "Pending Cases includes all pending cases that didn't complete the
   registration cycle."

   JUDGMENT CALL: demo-data.js does not define a fixed count of "required
   registration fields" per case type, only a per-case `missing` array. For a
   readable Registration Status column we assume a flat set of 5 required
   registration fields (Case Receipt Date, Lead Member, Team/Associate Members,
   Administrators, Work Source Confirmation) and express completeness as
   "X of 5 missing". This is a demo-only approximation, not a BRD-defined rule. */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;
  const REQUIRED_FIELDS_COUNT = 5;

  function pendingCases() {
    return D.CASES.filter(c => c.status === "Pending");
  }

  function populateFilterOptions(rows) {
    const wtSel = document.getElementById("fWorkType");
    Array.from(new Set(rows.map(c => c.workType))).forEach(w => wtSel.insertAdjacentHTML("beforeend", `<option value="${w}">${w}</option>`));

    const wsSel = document.getElementById("fWorkSource");
    Array.from(new Set(rows.map(c => c.workSource))).forEach(w => wsSel.insertAdjacentHTML("beforeend", `<option value="${w}">${w}</option>`));

    const dSel = document.getElementById("fDirectorate");
    Array.from(new Set(rows.map(c => c.directorate))).forEach(id => {
      const d = D.DIRECTORATES.find(x => x.id === id);
      dSel.insertAdjacentHTML("beforeend", `<option value="${id}">${d ? d.name : id}</option>`);
    });
  }

  function applyFilters(rows) {
    const search = document.getElementById("fSearch").value.trim().toLowerCase();
    const workType = document.getElementById("fWorkType").value;
    const workSource = document.getElementById("fWorkSource").value;
    const directorate = document.getElementById("fDirectorate").value;
    const classifiedOnly = document.getElementById("fClassified").checked;
    return rows.filter(c => {
      if (search) {
        const hay = `${c.ref} ${c.systemNo} ${c.title} ${c.requestingEntity}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (workType && c.workType !== workType) return false;
      if (workSource && c.workSource !== workSource) return false;
      if (directorate && c.directorate !== directorate) return false;
      if (classifiedOnly && !c.classified) return false;
      return true;
    });
  }

  function rowHtml(c) {
    const missing = c.missing || [];
    const missingCount = missing.length;
    const pct = Math.round(((REQUIRED_FIELDS_COUNT - missingCount) / REQUIRED_FIELDS_COUNT) * 100);
    return `
      <tr class="${c.classified ? "row-classified" : ""}">
        <td>
          <a class="ref-link" href="case-workspace.html?ref=${c.ref}">${c.ref}</a>
          <div style="font-size:10.8px;color:var(--slc-muted);">${c.systemNo}</div>
          ${c.classified ? `<div class="mt-1">${A.classifiedFlag(true)}</div>` : ""}
        </td>
        <td style="max-width:240px;">${c.title}</td>
        <td>${c.workType}</td>
        <td>${c.caseType}</td>
        <td>${c.workSource}</td>
        <td>${A.fmtDate(c.csd)}</td>
        <td style="max-width:190px;">${c.requestingEntity}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="reg-progress-bar"><div class="fill" style="width:${pct}%;"></div></div>
            <span style="font-size:11px;color:#B45309;font-weight:700;white-space:nowrap;">${missingCount} of ${REQUIRED_FIELDS_COUNT} missing</span>
          </div>
        </td>
        <td style="max-width:220px;">
          ${missing.map(m => `<span class="missing-chip"><i class="bi bi-exclamation-triangle-fill"></i>${m}</span>`).join("")}
        </td>
        <td>${A.userChip(c.hod)}<div style="font-size:10.5px;color:var(--slc-muted);margin-top:2px;">Directorate HOD (default owner)</div></td>
        <td>
          <div class="d-flex flex-column gap-1">
            <a href="new-case.html" class="btn btn-sm btn-primary"><i class="bi bi-clipboard-check"></i>Complete Registration</a>
            <a href="case-workspace.html?ref=${c.ref}" class="btn btn-sm btn-light border"><i class="bi bi-eye"></i>View</a>
          </div>
        </td>
      </tr>`;
  }

  function renderKpis(rows) {
    const total = rows.length;
    const classified = rows.filter(c => c.classified).length;
    const avgMissing = total ? (rows.reduce((s, c) => s + (c.missing || []).length, 0) / total).toFixed(1) : "0.0";
    const oldest = rows.slice().sort((a, b) => new Date(a.csd) - new Date(b.csd))[0];
    document.getElementById("pcKpiRow").innerHTML = `
      <div class="col-6 col-md-3">
        <a href="javascript:void(0)" class="kpi-card-link" onclick="window.__pcKpiClick('all')">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:#FEF3C7;color:#B45309;"><i class="bi bi-hourglass-split"></i></div>
          <div class="kpi-value">${total}</div>
        </div>
          <div class="kpi-label">Pending Cases</div>
        </div>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a href="javascript:void(0)" class="kpi-card-link" onclick="window.__pcKpiClick('table')">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:#FFE8D1;color:#C2540A;"><i class="bi bi-list-check"></i></div>
          <div class="kpi-value">${avgMissing}</div>
        </div>
          <div class="kpi-label">Avg. Missing Fields / Case</div>
        </div>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a href="javascript:void(0)" class="kpi-card-link" onclick="window.__pcKpiClick('classified')">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:#F5EBD8;color:#6B4F24;"><i class="bi bi-shield-lock"></i></div>
          <div class="kpi-value">${classified}</div>
        </div>
          <div class="kpi-label">Classified Pending</div>
        </div>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a href="${oldest ? `case-workspace.html?ref=${oldest.ref}` : "javascript:void(0)"}" class="kpi-card-link">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:#FEE2E2;color:#B91C1C;"><i class="bi bi-calendar-x"></i></div>
          <div class="kpi-value">${oldest ? A.fmtDate(oldest.csd) : "—"}</div>
        </div>
          <div class="kpi-label">Oldest Awaiting Registration</div>
        </div>
        </a>
      </div>`;
  }

  function renderAIInsights(all) {
    if (!all.length) { document.getElementById("aiInsightSlot").innerHTML = ""; return; }
    const today = new Date("2026-09-21");
    const ageDays = c => Math.round((today - new Date(c.csd)) / 86400000);
    const aging = all.filter(c => ageDays(c) >= 3);
    const missingCounts = {};
    all.forEach(c => (c.missing || []).forEach(m => { missingCounts[m] = (missingCounts[m] || 0) + 1; }));
    const topMissing = Object.entries(missingCounts).sort((a, b) => b[1] - a[1])[0];
    const noLead = all.filter(c => !c.lead).length;
    const items = [];
    if (aging.length) items.push(`${aging.length} of ${all.length} pending cases ${aging.length>1?"have":"has"} been awaiting registration for 3+ days — oldest is ${all.slice().sort((a,b)=>new Date(a.csd)-new Date(b.csd))[0].ref} (${ageDays(all.slice().sort((a,b)=>new Date(a.csd)-new Date(b.csd))[0])} days).`);
    if (topMissing) items.push(`"${topMissing[0]}" is the most common missing field across pending cases (${topMissing[1]} of ${all.length}) — consider a Registration Team reminder.`);
    if (noLead) items.push(`${noLead} pending case${noLead>1?"s":""} still ${noLead>1?"have":"has"} no Lead Member assigned, which blocks registration completion.`);
    document.getElementById("aiInsightSlot").innerHTML = A.aiInsightCard("AI Registration Insights", items);
  }

  function render() {
    const all = pendingCases();
    renderAIInsights(all);
    const filtered = applyFilters(all);
    document.getElementById("pendingCasesTbody").innerHTML = filtered.length
      ? filtered.map(rowHtml).join("")
      : `<tr><td colspan="11" class="text-center text-muted-soft py-4">No pending cases match the current filters.</td></tr>`;
    document.getElementById("pcResultCount").textContent = `Showing ${filtered.length} of ${all.length} pending cases`;
  }

  function resetFilters() {
    document.getElementById("fSearch").value = "";
    document.getElementById("fWorkType").value = "";
    document.getElementById("fWorkSource").value = "";
    document.getElementById("fDirectorate").value = "";
    document.getElementById("fClassified").checked = false;
    render();
  }

  /* Clicking a KPI card jumps straight to the matching slice of this same table */
  window.__pcKpiClick = function (type) {
    if (type === "classified") {
      resetFilters();
      document.getElementById("fClassified").checked = true;
      render();
    } else {
      resetFilters();
    }
    document.querySelector(".filter-bar, .table-card").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("pending-cases", [{ label: "Pending Cases" }]);
    const all = pendingCases();
    renderKpis(all);
    populateFilterOptions(all);

    ["fSearch", "fWorkType", "fWorkSource", "fDirectorate", "fClassified"].forEach(id => {
      document.getElementById(id).addEventListener("input", render);
      document.getElementById(id).addEventListener("change", render);
    });
    document.getElementById("fResetBtn").addEventListener("click", resetFilters);
    document.getElementById("exportBtn").addEventListener("click", () => {
      A.demoActionModal("Pending case list exported successfully (CSV) in prototype mode.");
    });

    render();
  });
})();
