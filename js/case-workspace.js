/* Case Workspace page logic */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  function toggleSection(id) {
    document.getElementById(id).classList.toggle("open");
  }
  window.toggleSection = toggleSection;

  function fieldRow(label, value) {
    return `<div class="col-md-4 col-sm-6 mb-3">
      <div style="font-size:10.8px;font-weight:700;color:var(--slc-muted);text-transform:uppercase;letter-spacing:.04em;">${label}</div>
      <div style="font-size:13.3px;color:var(--slc-text);margin-top:2px;">${value !== null && value !== undefined && value !== "" ? value : "—"}</div>
    </div>`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("my-cases", null);

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || "SLC-LEG-2026-00128";
    const c = D.caseByRef(ref) || D.CASES[0];
    const milestone = D.milestoneById(c.milestone);
    const hod = D.userById(c.hod);
    const lead = c.lead ? D.userById(c.lead) : null;

    document.getElementById("pageContent").prepend((function () {
      const d = document.createElement("div");
      d.innerHTML = `<div class="breadcrumb-row"><a href="dashboard.html"><i class="bi bi-house"></i></a><span class="sep">/</span><a href="my-cases.html">My Cases</a><span class="sep">/</span><span class="current">${c.ref}</span></div>`;
      return d.firstElementChild;
    })());

    document.title = c.ref + " — Case Workspace — SLC CMS";

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
            ${A.milestoneBadge(c.milestone)}
            <span class="badge-status badge-primary-dark">${c.workType}</span>
            <span class="badge-status badge-muted">${c.caseType}</span>
            ${A.urgencyBadge(c.urgency)}
            <span class="badge-status badge-info">${c.status}</span>
          </div>
        </div>
        <div class="text-md-end">
          <div class="d-flex gap-2 justify-content-md-end mb-3 flex-wrap">
            <button class="btn btn-sm btn-light border" onclick="window.print()"><i class="bi bi-printer"></i>Print</button>
            <button class="btn btn-sm btn-outline-primary" onclick="SLCApp.demoActionModal('Case updated successfully in prototype mode.')"><i class="bi bi-pencil"></i>Edit</button>
            <button class="btn btn-sm btn-primary" onclick="document.getElementById('aiFabBtn').click();SLCApp.sendAI('Summarize this case.')"><i class="bi bi-stars"></i>Ask AI</button>
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

    /* ---------------- Progress tracker ---------------- */
    document.getElementById("wsTracker").innerHTML = D.WORKSPACE_TRACKER.map((label, i) => {
      const stepNum = i + 1;
      const cls = stepNum < c.workspaceStage ? "done" : stepNum === c.workspaceStage ? "current" : "";
      const icon = stepNum < c.workspaceStage ? '<i class="bi bi-check-lg"></i>' : stepNum;
      return `<div class="ms-step ${cls}"><div class="ms-line"></div><div class="ms-dot">${icon}</div><div class="ms-label">${label}</div></div>`;
    }).join("");

    /* ---------------- AI Case Summary ---------------- */
    document.getElementById("aiCaseSummaryBox").innerHTML = `
      This case concerns <strong>${c.title}</strong>, requested by <strong>${c.requestingEntity}</strong>. The case is currently at the
      <strong>${milestone.name}</strong> milestone under the ${c.workType} work type (${c.caseType}).
      ${c.pcd ? `The Proposed Completion Date is <strong>${A.fmtDate(c.pcd)}</strong>.` : "No Proposed Completion Date has been set yet."}
      Lead responsibility sits with <strong>${lead ? lead.name : "an unassigned lead member"}</strong>, supervised by ${hod.name} (${D.DIRECTORATES.find(d=>d.id===c.directorate).name}).
      Based on recent activity, ${c.overdue ? "this case has exceeded its proposed timeline and may need management escalation." : "the case is progressing within its expected milestone duration."}
      <div class="mt-2"><span class="ai-chip"><i class="bi bi-stars"></i>AI-generated demo content</span></div>`;

    /* ---------------- General Details ---------------- */
    document.getElementById("generalDetailsBody").innerHTML = `
      <div class="row">
        ${fieldRow("Classified", c.classified ? "Yes" : "No")}
        ${fieldRow("Case Ref. No.", c.ref)}
        ${fieldRow("System No.", c.systemNo)}
        ${fieldRow("Case Start Date (CSD)", A.fmtDate(c.csd))}
        ${fieldRow("Case Receipt Date (CRD)", A.fmtDate(c.crd))}
        ${fieldRow("Case Registration Completed Date", A.fmtDate(c.rcd))}
        ${fieldRow("Work Source", c.workSource)}
        ${fieldRow("Work Type", c.workType)}
        ${fieldRow("Case Type", c.caseType)}
        ${fieldRow("Task", c.task)}
        ${fieldRow("Urgency", c.urgency)}
        ${fieldRow("Requesting Entity Type", "Government Entity")}
        ${fieldRow("Requesting Entity Name", c.requestingEntity)}
        ${fieldRow("Physical Case File Location", "Registration & Documentation Section, Rm. 204")}
        ${fieldRow("Proposed Completion Date (PCD)", A.fmtDate(c.pcd))}
        ${fieldRow("Instructed Completion Date (ICD)", A.fmtDate(c.icd))}
        ${fieldRow("Actual Completion Date (ACD)", A.fmtDate(c.acd))}
        ${fieldRow("Old Reference No.", "—")}
        ${fieldRow("Registered By", "Sara Al Mazrouei")}
      </div>`;

    /* ---------------- Work Type Details ---------------- */
    document.getElementById("workTypeDetailsBody").innerHTML = renderWorkTypeDetails(c);

    /* ---------------- Activities ---------------- */
    const activities = D.ACTIVITIES[c.ref] || [];
    document.getElementById("activityCount").textContent = activities.length + " logged";
    if (activities.length) {
      const daysSince = Math.round((new Date("2026-09-21") - new Date(activities[0].date.split(" ")[0])) / 86400000);
      const userCounts = {};
      activities.forEach(a => { userCounts[a.user] = (userCounts[a.user] || 0) + 1; });
      const mostActive = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];
      const typeCounts = {};
      activities.forEach(a => { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1; });
      const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
      document.getElementById("activitySummarySlot").innerHTML = A.aiInlineNote(
        `<strong>AI Activity Summary</strong> — ${activities.length} activities logged, most recently ${daysSince === 0 ? "today" : daysSince + " day" + (daysSince>1?"s":"") + " ago"} (${activities[0].type}). ` +
        `${D.userById(mostActive[0]).name} is the most active contributor (${mostActive[1]} entries). Dominant activity type: ${topType[0]} (${topType[1]}).`
      );
    } else {
      document.getElementById("activitySummarySlot").innerHTML = "";
    }
    document.getElementById("activityTimeline").innerHTML = activities.length ? activities.map(a => `
      <div class="timeline-item">
        <div class="timeline-dot"><i class="bi bi-dot"></i></div>
        <div class="timeline-card">
          <div class="d-flex justify-content-between flex-wrap">
            <div class="timeline-type">${a.type}</div>
            <div class="timeline-meta">${a.date} · ${D.userById(a.user).name}</div>
          </div>
          <div class="timeline-desc">${a.desc}</div>
          ${a.attachments.length ? `<div class="timeline-attach">${a.attachments.map(f => `<a href="#" onclick="event.preventDefault();SLCApp.demoActionModal('Opening ${f} in prototype mode.')"><i class="bi bi-paperclip"></i>${f}</a>`).join("")}</div>` : ""}
          <div class="mt-2"><span class="badge-status ${a.status === "Completed" ? "badge-success" : "badge-warning"}">${a.status}</span></div>
        </div>
      </div>`).join("") : `<div class="text-muted-soft text-center py-4">No activities logged yet for this case.</div>`;

    /* ---------------- Milestone detail ---------------- */
    document.getElementById("milestoneDetailBody").innerHTML = `
      <div class="row">
        ${fieldRow("Current Milestone", `<span class="badge-status badge-${milestone.badge}">${milestone.name}</span>`)}
        ${fieldRow("How Set", milestone.how)}
        ${fieldRow("Responsible User", lead ? lead.name : hod.name)}
        ${fieldRow("Planned Date", A.fmtDate(c.pcd))}
        ${fieldRow("Actual / Expected Date", A.fmtDate(c.acd) !== "—" ? A.fmtDate(c.acd) : "In progress")}
        ${fieldRow("Milestone Comments", "Draft incorporates feedback from Technical Office review cycle.")}
      </div>
      <div class="mt-2">
        <button class="btn btn-sm btn-outline-primary" onclick="SLCApp.demoActionModal('Milestone update request submitted for approval in prototype mode.')"><i class="bi bi-arrow-repeat"></i>Request Milestone Update</button>
      </div>`;

    /* ---------------- Checklist ---------------- */
    const items = D.getChecklist(c.caseType);
    const state = D.seededChecklistState(c.ref, items);
    const doneCount = state.filter(s => s.status === "completed").length;
    const pct = Math.round((doneCount / state.length) * 100);
    document.getElementById("checklistPct").textContent = pct + "% complete";
    document.getElementById("checklistBody").innerHTML = `
      <div class="checklist-progress-wrap">
        <div class="checklist-progress-bar"><div class="fill" style="width:${pct}%"></div></div>
        <div style="font-size:12.5px;font-weight:700;color:var(--slc-primary-darker);">${pct}%</div>
      </div>
      ${state.map(s => `
        <div class="checklist-item ${s.status}">
          <div class="checklist-icon ${s.status}"><i class="bi ${s.status === "completed" ? "bi-check-lg" : s.status === "attention" ? "bi-exclamation" : "bi-circle"}"></i></div>
          <div class="checklist-label">${s.label}</div>
          ${s.status !== "completed" ? `<button class="btn btn-sm btn-light border" onclick="SLCApp.demoActionModal('Checklist item marked complete in prototype mode.')">Mark Done</button>` : `<span class="text-muted-soft" style="font-size:11px;">Satisfied</span>`}
        </div>`).join("")}`;

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
      </div>`).join("") + `<div class="mt-2"><span class="ai-chip"><i class="bi bi-stars"></i>AI Document Classification – Demo</span></div>`;

    /* ---------------- Team ---------------- */
    const teamRoleRows = [["Head of Directorate", [c.hod]], ["Lead Member", c.lead ? [c.lead] : []], ["Team Members", c.team], ["Associate Members", c.associate], ["Administrators", c.admin]];
    document.getElementById("teamBody").innerHTML = teamRoleRows.map(([role, ids]) => `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--slc-border) !important;">
        <div style="font-size:11.3px;font-weight:700;color:var(--slc-muted);text-transform:uppercase;min-width:170px;">${role}</div>
        <div class="d-flex gap-3 flex-wrap flex-grow-1">${ids.length ? ids.map(id => A.userChip(id)).join("") : '<span class="text-muted-soft" style="font-size:12px;">None assigned</span>'}</div>
      </div>`).join("")
      + `<div class="mt-3"><button class="btn btn-sm btn-outline-primary" onclick="SLCApp.demoActionModal('Team updated successfully in prototype mode.')"><i class="bi bi-person-plus"></i>Manage Team</button></div>`;

    /* ---------------- Related cases ---------------- */
    const related = c.relatedCase ? [D.caseByRef(c.relatedCase)].filter(Boolean) : D.CASES.filter(x => x.relatedCase === c.ref);
    document.getElementById("relatedBody").innerHTML = related.length ? related.map(r => `
      <a href="case-workspace.html?ref=${r.ref}" class="d-flex align-items-center justify-content-between py-2 border-bottom text-decoration-none" style="border-color:var(--slc-border) !important;">
        <div>
          <div class="ref-link" style="font-size:12.8px;">${r.ref}</div>
          <div style="font-size:12px;color:var(--slc-text);">${r.title}</div>
        </div>
        ${A.milestoneBadge(r.milestone)}
      </a>`).join("") : `<div class="text-muted-soft text-center py-3">No related cases linked.</div>`;

    /* ---------------- Tasks ---------------- */
    const relTasks = D.TASKS.filter(t => t.relatedCase === c.ref);
    document.getElementById("tasksBody").innerHTML = (relTasks.length ? relTasks.map(t => `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--slc-border) !important;">
        <div>
          <div style="font-size:12.6px;font-weight:600;">${t.title}</div>
          <div style="font-size:11.2px;color:var(--slc-muted);">Assigned to ${D.userById(t.assignedTo).name} · Due ${A.fmtDate(t.due)}</div>
        </div>
        <span class="badge-status ${t.status === "Overdue" ? "badge-danger" : t.status === "Completed" ? "badge-success" : "badge-info"}">${t.status}</span>
      </div>`).join("") : `<div class="text-muted-soft text-center py-3">No tasks linked to this case.</div>`)
      + `<div class="mt-3"><button class="btn btn-sm btn-primary" onclick="SLCApp.demoActionModal('Task assigned successfully in prototype mode.')"><i class="bi bi-plus-lg"></i>Assign Task</button></div>`;

    /* ---------------- Reminders ---------------- */
    const relReminders = D.REMINDERS.filter(r => r.relatedCase === c.ref);
    document.getElementById("remindersBody").innerHTML = (relReminders.length ? relReminders.map(r => `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--slc-border) !important;">
        <div>
          <div style="font-size:12.6px;font-weight:600;">${r.title}</div>
          <div style="font-size:11.2px;color:var(--slc-muted);">${A.fmtDate(r.date)} at ${r.time} · ${r.type}</div>
        </div>
        <span class="badge-status ${r.status === "Overdue" ? "badge-danger" : r.status === "Due Today" ? "badge-warning" : "badge-info"}">${r.status}</span>
      </div>`).join("") : `<div class="text-muted-soft text-center py-3">No reminders linked to this case.</div>`)
      + `<div class="mt-3"><button class="btn btn-sm btn-primary" onclick="SLCApp.demoActionModal('Reminder set successfully in prototype mode.')"><i class="bi bi-plus-lg"></i>Add Reminder</button></div>`;

    /* ---------------- Audit trail ---------------- */
    const audit = [
      { d: c.lastActivity + " 09:12", u: "u4", a: "Viewed case workspace" },
      { d: c.rcd + " 10:00", u: "u4", a: "Completed case registration cycle" },
      { d: c.csd + " 08:30", u: hod ? c.hod : "u4", a: "Opened new case" },
    ];
    document.getElementById("auditBody").innerHTML = `
      <div class="table-scroll"><table class="table-modern mb-0">
        <thead><tr><th>Date/Time</th><th>User</th><th>Action</th></tr></thead>
        <tbody>${audit.map(x => `<tr><td>${x.d}</td><td>${D.userById(x.u).name}</td><td>${x.a}</td></tr>`).join("")}</tbody>
      </table></div>`;
  });

  function renderWorkTypeDetails(c) {
    const common = `${fieldRow("Complexity", c.complexity)}`;
    if (c.workType === "Legislation") {
      return `<div class="row">
        ${common}
        ${fieldRow("Legislation Category", "Administrative and Regulatory Government Legislation")}
        ${fieldRow("Legislation Committee", "Administrative and Regulatory Government Legislation")}
        ${fieldRow("Legislation Type", "Executive Council Resolution")}
        ${fieldRow("Legislation Issuing Authority", "Executive Council of Dubai")}
        ${fieldRow("Legislation No.", "—  (pending issuance)")}
        ${fieldRow("Legislation Status", "In Force — Draft Amendment")}
        ${fieldRow("Translation Required", c.workType === "Legislation" && c.relatedCase ? "Yes — linked translation case" : "To be determined")}
        ${fieldRow("Official Gazette", "Pending final sign-off")}
      </div>
      <div class="d-flex gap-2 mt-2 flex-wrap">
        <button class="btn btn-sm btn-light border" onclick="SLCApp.demoActionModal('Relevant Legislation panel opened in prototype mode.')"><i class="bi bi-journal-bookmark"></i>Relevant Legislation</button>
        <button class="btn btn-sm btn-light border" onclick="SLCApp.demoActionModal('Preliminary Report panel opened in prototype mode.')"><i class="bi bi-file-earmark-text"></i>Preliminary Report</button>
        <button class="btn btn-sm btn-light border" onclick="SLCApp.demoActionModal('Other Materials panel opened in prototype mode.')"><i class="bi bi-folder2-open"></i>Other Materials</button>
      </div>`;
    }
    if (c.workType === "Legal Advice and Opinion") {
      return `<div class="row">
        ${common}
        ${fieldRow("Legal Advice Category", "Contracts and Commercial Affairs")}
        ${fieldRow("Enquiry (English)", "Request for legal opinion on the applicability of the proposed PPP framework to existing concession agreements.")}
        ${fieldRow("Relevant Legislation Details", "Legislation Bank — Federal Law No. 2 of 2015")}
        ${fieldRow("Date of Advice", A.fmtDate(c.pcd))}
      </div>`;
    }
    if (c.workType === "Translation") {
      return `<div class="row">
        ${common}
        ${fieldRow("Purpose of Translation", "Internal")}
        ${fieldRow("Type of Document", "Local Legislation — Draft")}
        ${fieldRow("Number of Words", "8,420")}
        ${fieldRow("Number of Pages", "34")}
        ${fieldRow("Number of Words (Translated)", "8,610")}
        ${fieldRow("Number of Pages (Translated)", "36")}
      </div>`;
    }
    if (c.workType === "Research and Publications") {
      return `<div class="row">
        ${common}
        ${fieldRow("Official Gazette Issue No.", "OG-214")}
        ${fieldRow("Official Gazette Expected Date of Publication", A.fmtDate(c.pcd))}
        ${fieldRow("Publishing House", "Dubai Government Printing Press")}
        ${fieldRow("Number of Pages", "112")}
      </div>`;
    }
    return `<div class="row">
      ${common}
      ${fieldRow("Concerned Directorate / Section", D.DIRECTORATES.find(d => d.id === c.directorate).name)}
      ${fieldRow("Comments", "Internal coordination case — no external work type fields apply.")}
    </div>`;
  }
})();
