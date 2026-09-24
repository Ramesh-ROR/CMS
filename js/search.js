/* ============================================================================
   SLC Case Management System — Search page logic
   ============================================================================ */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  function statusBadge(status) {
    const map = {
      "Live": "badge-info", "Pending": "badge-warning", "Completed": "badge-success",
      "On Hold": "badge-danger", "Closed": "badge-grey",
    };
    return `<span class="badge-status ${map[status] || "badge-muted"}">${status}</span>`;
  }

  /* ---------------------------------------------------------------- */
  /* Build filter dropdown options                                     */
  /* ---------------------------------------------------------------- */
  function populateFilterOptions() {
    // Work Type
    const wtSel = document.getElementById("fWorkType");
    D.WORK_TYPES.forEach(w => {
      const o = document.createElement("option");
      o.value = w.id; o.textContent = w.id;
      wtSel.appendChild(o);
    });

    // Case Type (grouped by work type, value = "workType||caseType")
    function rebuildCaseTypeOptions(filterWorkType) {
      const ctSel = document.getElementById("fCaseType");
      const prevVal = ctSel.value;
      ctSel.innerHTML = `<option value="">All Case Types</option>`;
      D.WORK_TYPES.forEach(w => {
        if (filterWorkType && w.id !== filterWorkType) return;
        const grp = document.createElement("optgroup");
        grp.label = w.id;
        w.caseTypes.forEach(ct => {
          const o = document.createElement("option");
          o.value = w.id + "||" + ct; o.textContent = ct;
          grp.appendChild(o);
        });
        ctSel.appendChild(grp);
      });
      if ([...ctSel.options].some(o => o.value === prevVal)) ctSel.value = prevVal;
    }
    rebuildCaseTypeOptions(null);
    wtSel.addEventListener("change", () => rebuildCaseTypeOptions(wtSel.value || null));

    // Requesting Entity — union of ENTITIES + distinct entities seen on cases
    const entitySet = new Set(D.ENTITIES);
    D.CASES.forEach(c => { if (c.requestingEntity) entitySet.add(c.requestingEntity); });
    const entSel = document.getElementById("fEntity");
    [...entitySet].sort().forEach(e => {
      const o = document.createElement("option");
      o.value = e; o.textContent = e;
      entSel.appendChild(o);
    });

    // Team Members
    const teamSel = document.getElementById("fTeam");
    D.USERS.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(u => {
      const o = document.createElement("option");
      o.value = u.name; o.textContent = u.name;
      teamSel.appendChild(o);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Filtering                                                          */
  /* ---------------------------------------------------------------- */
  function getFiltered() {
    const q = document.getElementById("heroSearchInput").value.trim().toLowerCase();
    const ref = document.getElementById("fRef").value.trim().toLowerCase();
    const title = document.getElementById("fTitle").value.trim().toLowerCase();
    const ctRaw = document.getElementById("fCaseType").value;
    const workType = document.getElementById("fWorkType").value;
    let caseTypeFilterWT = "", caseType = "";
    if (ctRaw) { const parts = ctRaw.split("||"); caseTypeFilterWT = parts[0]; caseType = parts[1]; }
    const entity = document.getElementById("fEntity").value;
    const activityKw = document.getElementById("fActivity").value.trim().toLowerCase();
    const docKw = document.getElementById("fDoc").value.trim().toLowerCase();
    const teamName = document.getElementById("fTeam").value;

    return D.CASES.filter(c => {
      if (q) {
        const hay = [c.ref, c.title, c.workType, c.caseType, c.requestingEntity].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (ref && !c.ref.toLowerCase().includes(ref)) return false;
      if (title && !c.title.toLowerCase().includes(title)) return false;
      if (workType && c.workType !== workType) return false;
      if (caseType && (c.workType !== caseTypeFilterWT || c.caseType !== caseType)) return false;
      if (entity && c.requestingEntity !== entity) return false;
      if (activityKw) {
        const acts = D.ACTIVITIES[c.ref] || [];
        const found = acts.some(a => (a.type + " " + a.desc).toLowerCase().includes(activityKw));
        if (!found) return false;
      }
      if (docKw) {
        const docs = D.attachmentsFor(c.ref) || [];
        const found = docs.some(d => d.name.toLowerCase().includes(docKw));
        if (!found) return false;
      }
      if (teamName) {
        const u = D.userByName(teamName);
        if (u) {
          const inTeam = c.lead === u.id || (c.team || []).includes(u.id) || (c.associate || []).includes(u.id) || (c.admin || []).includes(u.id) || c.hod === u.id;
          if (!inTeam) return false;
        }
      }
      return true;
    });
  }

  function rowHtml(c) {
    return `
      <tr class="${c.classified ? "row-classified" : ""}">
        <td><a class="ref-link" href="case-workspace.html?ref=${c.ref}">${c.ref}</a>${c.classified ? " " + A.classifiedFlag(true) : ""}</td>
        <td style="max-width:280px;">${c.title}</td>
        <td>${c.workType}<div class="text-muted-soft" style="font-size:11px;">${c.caseType}</div></td>
        <td>${c.requestingEntity}</td>
        <td>${A.workflowBadge(c.milestone)}</td>
        <td>${A.urgencyBadge(c.urgency)}</td>
        <td>${A.fmtDate(c.pcd)}</td>
        <td>${statusBadge(c.status)}</td>
      </tr>`;
  }

  function renderResults() {
    const results = getFiltered();
    document.getElementById("resultCount").textContent = `${results.length} case${results.length === 1 ? "" : "s"} found`;
    document.querySelector("#resultsTable tbody").innerHTML = results.length
      ? results.map(c => rowHtml(c)).join("")
      : `<tr><td colspan="8" class="text-center text-muted-soft py-4">No cases match your search criteria.</td></tr>`;
  }

  /* ---------------------------------------------------------------- */
  /* Init                                                               */
  /* ---------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("search", [{ label: "Database Search" }]);

    populateFilterOptions();

    // Pre-fill from ?q=
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    if (qParam) document.getElementById("heroSearchInput").value = qParam;

    renderResults();

    document.getElementById("runSearchBtn").addEventListener("click", renderResults);
    document.getElementById("heroSearchBtn").addEventListener("click", renderResults);
    document.getElementById("heroSearchInput").addEventListener("keydown", e => {
      if (e.key === "Enter") renderResults();
    });
    document.getElementById("clearFiltersBtn").addEventListener("click", () => {
      ["fRef", "fTitle", "fActivity", "fDoc", "fOldRef"].forEach(id => document.getElementById(id).value = "");
      ["fWorkType", "fCaseType", "fEntity", "fTeam"].forEach(id => document.getElementById(id).value = "");
      document.getElementById("heroSearchInput").value = "";
      renderResults();
    });
  });
})();
