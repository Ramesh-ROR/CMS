/* Case Workspace page logic */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  const ACTIVITY_TYPE = { "Legal Review Started": "Review", "Translation Requested": "Translation", "Comment Added": "Comment", "Document Uploaded": "Document" };
  function activityType(a) {
    return ACTIVITY_TYPE[a.type] || (a.type.includes("Translation") ? "Translation" : a.type.includes("Document") ? "Document" : a.type.includes("Comment") ? "Comment" : a.type.includes("Review") ? "Review" : "General");
  }

  function fieldRow(label, value) {
    return `<div class="col-md-4 col-sm-6 mb-3">
      <div style="font-size:10.8px;font-weight:700;color:var(--slc-muted);text-transform:uppercase;letter-spacing:.04em;">${label}</div>
      <div style="font-size:13.3px;color:var(--slc-text);margin-top:2px;">${value !== null && value !== undefined && value !== "" ? value : "—"}</div>
    </div>`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("live-cases", null);
    A.initTabs("#cwTabs", "#cwPanels");

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || "SLC-LEG-2026-00128";
    const c = D.caseByRef(ref) || D.CASES[0];
    const hod = D.userById(c.hod);
    const lead = c.lead ? D.userById(c.lead) : null;

    document.getElementById("pageContent").prepend((function () {
      const d = document.createElement("div");
      d.innerHTML = `<div class="breadcrumb-row"><a href="dashboard.html"><i class="bi bi-house"></i></a><span class="sep">/</span><a href="live-cases.html">Live Cases</a><span class="sep">/</span><span class="current">${c.ref}</span></div>`;
      return d.firstElementChild;
    })());

    document.title = c.ref + " — Case Workspace — Tadween Portal";

    /* ---------------- Header ---------------- */
    document.getElementById("caseHeaderBox").innerHTML = `
      <div class="d-flex justify-content-between flex-wrap gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
            <span style="font-size:12px;font-weight:700;color:var(--slc-primary-darker);">${c.ref}</span>
            <span style="font-size:11px;color:var(--slc-muted);">System No: ${c.systemNo}</span>
            ${A.classifiedFlag(c.classified)}
          </div>
          <h2 style="font-size:20px;font-weight:800;margin:0;">${c.title}</h2>
          <div style="font-size:12.5px;color:var(--slc-muted);margin-top:2px;" dir="auto">${c.titleAr}</div>
          <div class="d-flex align-items-center gap-2 flex-wrap mt-3">
            ${A.workflowBadge(c.milestone)}
            <span class="badge-status badge-primary-dark">${c.workType}</span>
            <span class="badge-status badge-muted">${c.caseType}</span>
            ${A.urgencyBadge(c.urgency)}
            <span class="badge-status badge-info">${c.status}</span>
          </div>
        </div>
        <div class="text-md-end">
          <div class="d-flex gap-2 justify-content-md-end mb-3 flex-wrap">
            <div class="dropdown">
              <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown"><i class="bi bi-download"></i>Export</button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" onclick="event.preventDefault();SLCApp.toast('Report exported successfully.');"><i class="bi bi-file-earmark-excel me-2" style="color:#107C10;"></i>Export to Excel</a></li>
                <li><a class="dropdown-item" href="#" onclick="event.preventDefault();SLCApp.toast('Report exported successfully.');"><i class="bi bi-file-earmark-pdf me-2" style="color:#B91C1C;"></i>Export to PDF</a></li>
              </ul>
            </div>
            <button class="btn btn-sm btn-outline-primary" onclick="SLCApp.demoActionModal('Case updated successfully in prototype mode.')"><i class="bi bi-pencil"></i>Edit</button>
          </div>
          <div class="d-flex gap-4 justify-content-md-end flex-wrap">
            <div>
              <div style="font-size:10.5px;color:var(--slc-muted);font-weight:700;text-transform:uppercase;">HOD</div>
              <div class="d-flex align-items-center gap-2 mt-1">${A.avatarHtml(hod, 26)}<span style="font-size:12.5px;font-weight:600;">${hod.name}</span></div>
            </div>
            <div>
              <div style="font-size:10.5px;color:var(--slc-muted);font-weight:700;text-transform:uppercase;">Lead Member</div>
              <div class="d-flex align-items-center gap-2 mt-1">${lead ? A.avatarHtml(lead,26) + `<span style="font-size:12.5px;font-weight:600;">${lead.name}</span>` : "<span class=\"text-muted-soft\">Not yet assigned</span>"}</div>
            </div>
          </div>
        </div>
      </div>`;

    /* ---------------- Workflow stepper ---------------- */
    document.getElementById("wsWorkflow").innerHTML = A.workflowStepperHtml(c.milestone);

    /* ---------------- General Details ---------------- */
    document.getElementById("generalDetailsBody").innerHTML = `
      <div class="row">
        ${fieldRow("Classified", c.classified ? "Yes" : "No")}
        ${fieldRow("Case Ref. No.", c.ref)}
        ${fieldRow("System No.", c.systemNo)}
        ${fieldRow("Case Start Date (CSD)", A.fmtDate(c.csd))}
        ${fieldRow("Case Registration Completed Date", A.fmtDate(c.rcd))}
        ${fieldRow("Registered By", "Sara Al Mazrouei")}
        ${fieldRow("Work Type", c.workType)}
        ${fieldRow("Case Type", c.caseType)}
        ${fieldRow("Urgency", c.urgency)}
        ${fieldRow("Requesting Entity Type", "Government Entity")}
        ${fieldRow("Requesting Entity Name", c.requestingEntity)}
        ${fieldRow("Proposed Completion Date (PCD)", A.fmtDate(c.pcd))}
        ${fieldRow("Instructed Completion Date (ICD)", A.fmtDate(c.icd))}
        ${fieldRow("Actual Completion Date (ACD)", A.fmtDate(c.acd))}
        ${fieldRow("Old Reference No.", "—")}
      </div>`;

    /* ---------------- Activities ---------------- */
    const activities = D.ACTIVITIES[c.ref] || [];
    document.getElementById("activityCount").textContent = activities.length + " logged";
    document.getElementById("activityTbody").innerHTML = activities.length ? activities.map(a => `
      <tr>
        <td><span class="badge-status badge-muted">${activityType(a)}</span></td>
        <td style="font-weight:600;">${a.type}</td>
        <td style="max-width:320px;">${a.desc}</td>
        <td>${D.userById(a.user).name}</td>
        <td>${a.date}</td>
        <td><button class="btn btn-sm btn-light border" title="View" onclick="SLCApp.demoActionModal('Opening activity details in prototype mode.')"><i class="bi bi-eye"></i></button></td>
      </tr>`).join("") : `<tr><td colspan="6" class="text-center text-muted-soft py-4">No activities logged yet for this case.</td></tr>`;

    /* ---------------- Attachments ---------------- */
    const files = D.attachmentsFor(c.ref);
    document.getElementById("attachmentsBody").innerHTML = files.map(f => `
      <div class="doc-row">
        <div class="doc-icon ${f.type === "PDF" ? "pdf" : f.type === "Word" ? "word" : ""}"><i class="bi ${f.type === "PDF" ? "bi-file-earmark-pdf" : "bi-file-earmark-word"}"></i></div>
        <div class="flex-grow-1">
          <div style="font-size:12.8px;font-weight:600;">${f.name}</div>
          <div style="font-size:11.2px;color:var(--slc-muted);">${f.version} · ${f.size} · Uploaded by ${D.userById(f.uploadedBy).name} on ${A.fmtDate(f.date)}</div>
        </div>
        <span class="badge-status badge-muted">${f.status}</span>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-light border" onclick="SLCApp.demoActionModal('Preview opened in prototype mode.')"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-light border" onclick="SLCApp.demoActionModal('Download started in prototype mode.')"><i class="bi bi-download"></i></button>
          <button class="btn btn-sm btn-light border text-danger" onclick="SLCApp.demoActionModal('Document removed from active list in prototype mode.')"><i class="bi bi-trash"></i></button>
        </div>
      </div>`).join("");

    /* ---------------- Team ---------------- */
    const teamRoleRows = [["Head of Directorate", [c.hod]], ["Lead Member", c.lead ? [c.lead] : []], ["Team Members", c.team], ["Associate Members", c.associate], ["Administrators", c.admin]];
    document.getElementById("teamBody").innerHTML = teamRoleRows.map(([role, ids]) => `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--slc-border) !important;">
        <div style="font-size:11.3px;font-weight:700;color:var(--slc-muted);text-transform:uppercase;min-width:170px;">${role}</div>
        <div class="d-flex gap-3 flex-wrap flex-grow-1">${ids.length ? ids.map(id => A.userChip(id)).join("") : '<span class="text-muted-soft" style="font-size:12px;">None assigned</span>'}</div>
      </div>`).join("")
      + `<div class="mt-3"><button class="btn btn-sm btn-outline-primary" onclick="SLCApp.demoActionModal('Team updated successfully in prototype mode.')"><i class="bi bi-person-plus"></i>Manage Team</button></div>`;

    /* ---------------- Workflow progress collapse ---------------- */
    const wsBody = new bootstrap.Collapse(document.getElementById("wsWorkflowBody"), { toggle: false });
    const wsToggleLabel = document.getElementById("wsWorkflowToggleLabel");
    document.getElementById("wsWorkflowToggle").addEventListener("click", () => {
      const expanded = document.getElementById("wsWorkflowBody").classList.contains("show");
      wsBody.toggle();
      wsToggleLabel.innerHTML = expanded ? `Show Details<i class="bi bi-chevron-down ms-1"></i>` : `Hide Details<i class="bi bi-chevron-up ms-1"></i>`;
    });
  });
})();
