/* Management Console page logic */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  /* Local copy of the expandable-section toggle helper (case-workspace.js is not loaded on this page) */
  function toggleSection(id) {
    document.getElementById(id).classList.toggle("open");
  }
  window.toggleSection = toggleSection;

  function openModule(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("open");
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.openModule = openModule;

  /* ---------------------------------------------------------------------- */
  /* Invented but consistent master data not present in demo-data.js         */
  /* ---------------------------------------------------------------------- */
  const USER_STATUS = { u6: "Inactive", u10: "Inactive" }; // rest are Active

  const ENTITY_TYPES = {
    "Government of Dubai — Executive Council": { type: "Executive Authority", contact: "Office of the Executive Director" },
    "Dubai Municipality": { type: "Government Department", contact: "Legal Affairs Section" },
    "Roads and Transport Authority (RTA)": { type: "Government Authority", contact: "Legal Affairs Department" },
    "Dubai Health Authority (DHA)": { type: "Government Authority", contact: "Regulatory Affairs Department" },
    "Dubai Land Department": { type: "Government Department", contact: "Legal Affairs Department" },
    "Dubai Economic Department": { type: "Government Department", contact: "Legal Services Section" },
    "Dubai Electricity and Water Authority (DEWA)": { type: "Government Authority", contact: "Legal Affairs Division" },
    "Dubai Courts": { type: "Judicial Authority", contact: "Office of the Director General" },
    "Community Development Authority": { type: "Government Authority", contact: "Policy and Legislation Unit" },
    "Dubai Police General Headquarters": { type: "Government Authority", contact: "Legal Affairs General Department" },
    "Knowledge and Human Development Authority (KHDA)": { type: "Government Authority", contact: "Legal Affairs Unit" },
    "Dubai Statistics Center": { type: "Government Department", contact: "Director's Office" },
    "Ministry of Justice": { type: "Federal Ministry", contact: "Legislation Department" },
    "Ministry of Finance": { type: "Federal Ministry", contact: "Legal Affairs Department" },
    "Dubai Media Office": { type: "Government Department", contact: "Media Relations Unit" },
  };

  const EXPERTS = [
    { name: "Dr. Yousef Al Rumaithi", specialty: "Constitutional Law", affiliation: "Dubai Courts — Legal Advisory Panel", contact: "y.alrumaithi@legalpanel.ae" },
    { name: "Dr. Amina Al Shehhi", specialty: "International Treaties & Conventions", affiliation: "Ministry of Foreign Affairs — External Consultant", contact: "amina.alshehhi@mofaconsult.ae" },
    { name: "Mr. Hamad Al Tayer", specialty: "Public Procurement Law", affiliation: "Independent Legal Consultant", contact: "hamad.altayer@legalconsult.ae" },
    { name: "Dr. Latifa Al Neyadi", specialty: "Data Protection & Privacy Law", affiliation: "UAE University — College of Law", contact: "l.alneyadi@uaeu.ac.ae" },
    { name: "Mr. Saeed Al Ketbi", specialty: "Administrative & Regulatory Law", affiliation: "Independent Legal Consultant", contact: "saeed.alketbi@legalconsult.ae" },
    { name: "Dr. Maitha Al Ali", specialty: "Legislative Drafting & Legal Translation", affiliation: "Dubai Judicial Institute", contact: "maitha.alali@dji.gov.ae" },
  ];

  const DOC_BANK = [
    { name: "Legal Opinion Template.docx", type: "Word", updated: "2026-08-12", by: "u3" },
    { name: "Translation Request Form.pdf", type: "PDF", updated: "2026-07-30", by: "u12" },
    { name: "Official Gazette Submission Template.docx", type: "Word", updated: "2026-06-15", by: "u10" },
    { name: "Legislation Drafting Checklist.xlsx", type: "Excel", updated: "2026-08-01", by: "u2" },
    { name: "Case Registration Acknowledgement Letter.docx", type: "Word", updated: "2026-05-20", by: "u4" },
    { name: "Committee Formation Template.docx", type: "Word", updated: "2026-04-18", by: "u4" },
  ];

  const AUDIT_TRAIL = [
    { user: "u4", action: "Registered new case", target: "SLC-LEG-2026-00131", ts: "2026-09-19 08:40" },
    { user: "u5", action: "Deleted a case activity", target: "SLC-LEG-2026-00073", ts: "2026-09-19 14:12" },
    { user: "u9", action: "Approved classified case access", target: "SLC-LAO-2026-00102", ts: "2026-09-18 11:05" },
    { user: "u6", action: "Updated a document version", target: "SLC-TRN-2026-00114", ts: "2026-09-18 10:20" },
    { user: "u1", action: "Approved milestone change to Final Review", target: "SLC-LEG-2026-00128", ts: "2026-09-17 15:50" },
    { user: "u5", action: "Added new user account (Layla Al Qassimi)", target: "System — User Management", ts: "2026-09-16 09:30" },
    { user: "u2", action: "Edited case general details", target: "SLC-LEG-2026-00119", ts: "2026-09-16 13:22" },
    { user: "u9", action: "Modified role permissions for Case Monitor", target: "System — Roles & Permissions", ts: "2026-09-15 17:05" },
    { user: "u7", action: "Approved legal advice sign-off", target: "SLC-LAO-2026-00087", ts: "2026-09-15 12:40" },
    { user: "u4", action: "Cancelled pending case", target: "SLC-RP-2026-00041", ts: "2026-09-12 10:15" },
  ];

  /* Flattened case type master, joined to parent work type */
  const CASE_TYPE_ROWS = [];
  D.WORK_TYPES.forEach(w => w.caseTypes.forEach(ct => CASE_TYPE_ROWS.push({ caseType: ct, workType: w.id, color: w.color })));

  /* Reports user rights — representative subset derived from ROLE_PERMISSIONS "Report Access" */
  const REPORT_RIGHT_ROLES = ["Secretary General", "Head of Directorate (HOD)", "Registration Team", "Directorate Legal Staff", "System Admin", "Power System Admin", "Case Type Supervisor"];

  /* Management Console module rights (module label -> role access flags) */
  const CONSOLE_MODULES = [
    "User Management", "Roles & Permissions", "System Roles", "Case Roles", "Work Type Masters",
    "Case Type Masters", "Milestone Masters", "Entity Masters", "Expert Masters", "Document Bank",
    "Reports User Rights", "Management Console User Rights", "Audit Trail",
  ];
  const CONSOLE_RIGHTS = {
    "User Management": { sysadmin: true, pwradmin: true, reg: true, hod: false, sg: false },
    "Roles & Permissions": { sysadmin: true, pwradmin: true, reg: false, hod: false, sg: false },
    "System Roles": { sysadmin: true, pwradmin: true, reg: false, hod: false, sg: false },
    "Case Roles": { sysadmin: true, pwradmin: true, reg: false, hod: false, sg: false },
    "Work Type Masters": { sysadmin: true, pwradmin: true, reg: false, hod: false, sg: false },
    "Case Type Masters": { sysadmin: true, pwradmin: true, reg: false, hod: false, sg: false },
    "Milestone Masters": { sysadmin: true, pwradmin: true, reg: false, hod: false, sg: false },
    "Entity Masters": { sysadmin: true, pwradmin: true, reg: true, hod: false, sg: false },
    "Expert Masters": { sysadmin: true, pwradmin: true, reg: false, hod: false, sg: false },
    "Document Bank": { sysadmin: true, pwradmin: true, reg: true, hod: false, sg: false },
    "Reports User Rights": { sysadmin: true, pwradmin: true, reg: false, hod: false, sg: false },
    "Management Console User Rights": { sysadmin: true, pwradmin: true, reg: false, hod: false, sg: false },
    "Audit Trail": { sysadmin: true, pwradmin: true, reg: true, hod: false, sg: true },
  };

  /* Module tile config for the top index grid */
  const MODULES = [
    { id: "sec-users", icon: "bi-people", color: "#0078D4", bg: "var(--light-blue)", title: "User Management", desc: "Manage SLC user accounts, system roles and directorate assignment.", count: () => D.USERS.length + " users" },
    { id: "sec-roles-summary", icon: "bi-shield-lock", color: "#6D28D9", bg: "#F3E8FF", title: "Roles & Permissions", desc: "System role and case role summary — links to the full permissions matrix.", count: () => D.SYSTEM_ROLES.length + " + " + D.CASE_ROLES.length + " roles" },
    { id: "sec-system-roles", icon: "bi-person-badge", color: "#005A9E", bg: "#D6EAF8", title: "System Roles", desc: "The 13 BRD-defined system roles and their elevated authority flags.", count: () => D.SYSTEM_ROLES.length + " roles" },
    { id: "sec-case-roles", icon: "bi-person-workspace", color: "#107C10", bg: "#DCFCE7", title: "Case Roles", desc: "Per-case team roles: Lead, Team, Associate and Admin Member.", count: () => D.CASE_ROLES.length + " roles" },
    { id: "sec-work-types", icon: "bi-diagram-3", color: "#8764B8", bg: "#F1E9FE", title: "Work Type Masters", desc: "The 5 SLC work types and their configured case types.", count: () => D.WORK_TYPES.length + " work types" },
    { id: "sec-case-types", icon: "bi-tags", color: "#C2410C", bg: "#FFEDD5", title: "Case Type Masters", desc: "Flattened list of every case type across all work types.", count: () => CASE_TYPE_ROWS.length + " case types" },
    { id: "sec-milestones", icon: "bi-flag", color: "#B45309", bg: "#FEF3C7", title: "Milestone Masters", desc: "Case lifecycle milestones, colours, badges and how they are set.", count: () => D.MILESTONES.length + " milestones" },
    { id: "sec-entities", icon: "bi-building", color: "#003D6B", bg: "#EAF4FB", title: "Entity Masters", desc: "Requesting and related government entities on file.", count: () => D.ENTITIES.length + " entities" },
    { id: "sec-experts", icon: "bi-mortarboard", color: "#BE185D", bg: "#FCE7F3", title: "Expert Masters", desc: "Subject-matter and legal experts available for case consultation.", count: () => EXPERTS.length + " experts" },
    { id: "sec-doc-bank", icon: "bi-file-earmark-text", color: "#4B5563", bg: "#F3F4F6", title: "Document Bank", desc: "Reusable template documents for case activities and correspondence.", count: () => DOC_BANK.length + " templates" },
    { id: "sec-reports-rights", icon: "bi-bar-chart-line", color: "#15803D", bg: "#DCFCE7", title: "Reports User Rights", desc: "Which system roles can access Case and Operational report categories.", count: () => REPORT_RIGHT_ROLES.length + " roles shown" },
    { id: "sec-console-rights", icon: "bi-key", color: "#7C2D12", bg: "#FCE7E3", title: "Console User Rights", desc: "Which system roles can access each Management Console module.", count: () => CONSOLE_MODULES.length + " modules" },
    { id: "sec-audit", icon: "bi-clock-history", color: "#374151", bg: "#F3F4F6", title: "Audit Trail", desc: "Recent administrative and case-level actions across the system.", count: () => AUDIT_TRAIL.length + " recent events" },
  ];

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("management", [{ label: "Management Console" }]);

    /* --- KPI row --- */
    const inactiveCount = Object.keys(USER_STATUS).length;
    const kpis = [
      { icon: "bi-people", bg: "var(--light-blue)", color: "var(--primary-blue)", value: D.USERS.length, label: "Total Users", sub: `${D.USERS.length - inactiveCount} active / ${inactiveCount} inactive`, target: "sec-users" },
      { icon: "bi-person-badge", bg: "#F3E8FF", color: "#6D28D9", value: D.SYSTEM_ROLES.length, label: "System Roles", sub: D.SYSTEM_ROLES.filter(r => r.elevated).length + " elevated", target: "sec-system-roles" },
      { icon: "bi-diagram-3", bg: "#DCFCE7", color: "#15803D", value: D.WORK_TYPES.length, label: "Work Types", sub: CASE_TYPE_ROWS.length + " case types", target: "sec-work-types" },
      { icon: "bi-building", bg: "#EAF4FB", color: "#003D6B", value: D.ENTITIES.length, label: "Registered Entities", sub: "Requesting / related bodies", target: "sec-entities" },
    ];
    document.getElementById("mgmtKpiRow").innerHTML = kpis.map(k => `
      <div class="col-6 col-md-3">
        <a href="#${k.target}" class="kpi-card-link" onclick="openModule('${k.target}');return false;">
        <div class="kpi-card compact">
          <div class="kpi-top">
          <div class="kpi-icon" style="background:${k.bg};color:${k.color};"><i class="bi ${k.icon}"></i></div>
          <div class="kpi-value">${k.value}</div>
        </div>
          <div class="kpi-label">${k.label}</div>
          <div class="kpi-trend up" style="color:var(--slc-muted);"><i class="bi bi-dash"></i>${k.sub}</div>
        </div>
        </a>
      </div>`).join("");

    /* --- Module tile grid --- */
    document.getElementById("moduleTiles").innerHTML = MODULES.map(m => `
      <div class="col-6 col-md-4 col-xl-3">
        <div class="module-tile" onclick="openModule('${m.id}')">
          <div class="mt-icon" style="background:${m.bg};color:${m.color};"><i class="bi ${m.icon}"></i></div>
          <div class="mt-title">${m.title}</div>
          <div class="mt-desc">${m.desc}</div>
          <span class="mt-count">${m.count()}</span>
        </div>
      </div>`).join("");

    /* --- Section meta counts (top-right of each accordion header) --- */
    document.getElementById("metaUsers").textContent = D.USERS.length + " users";
    document.getElementById("metaRolesSummary").textContent = (D.SYSTEM_ROLES.length + D.CASE_ROLES.length) + " roles total";
    document.getElementById("metaSystemRoles").textContent = D.SYSTEM_ROLES.length + " roles";
    document.getElementById("metaCaseRoles").textContent = D.CASE_ROLES.length + " roles";
    document.getElementById("metaWorkTypes").textContent = D.WORK_TYPES.length + " work types";
    document.getElementById("metaCaseTypes").textContent = CASE_TYPE_ROWS.length + " case types";
    document.getElementById("metaMilestones").textContent = D.MILESTONES.length + " milestones";
    document.getElementById("metaEntities").textContent = D.ENTITIES.length + " entities";
    document.getElementById("metaExperts").textContent = EXPERTS.length + " experts";
    document.getElementById("metaDocBank").textContent = DOC_BANK.length + " templates";
    document.getElementById("metaReportsRights").textContent = REPORT_RIGHT_ROLES.length + " roles";
    document.getElementById("metaConsoleRights").textContent = CONSOLE_MODULES.length + " modules";
    document.getElementById("metaAudit").textContent = AUDIT_TRAIL.length + " events";

    /* --- User Management table --- */
    document.getElementById("tblUsers").innerHTML = D.USERS.map(u => {
      const status = USER_STATUS[u.id] || "Active";
      return `<tr>
        <td>${A.userChip(u.id)}</td>
        <td>${u.role}</td>
        <td>${D.DIRECTORATES.find(d => d.id === u.directorate) ? D.DIRECTORATES.find(d => d.id === u.directorate).name : u.directorate}</td>
        <td style="font-size:12.2px;color:var(--slc-muted);">${u.email}</td>
        <td><span class="status-pill ${status === "Active" ? "active" : "inactive"}">${status}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-light border me-1" onclick="SLCApp.demoActionModal('User details updated successfully in prototype mode.')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-light border" onclick="SLCApp.demoActionModal('${status === "Active" ? "User account deactivated" : "User account activated"} successfully in prototype mode.')"><i class="bi ${status === "Active" ? "bi-person-dash" : "bi-person-check"}"></i></button>
        </td>
      </tr>`;
    }).join("");

    /* --- System Roles table --- */
    document.getElementById("tblSystemRoles").innerHTML = D.SYSTEM_ROLES.map(r => `
      <tr>
        <td class="fw-700">${r.name}${r.elevated ? ' <span class="badge-status badge-purple ms-1">Elevated</span>' : ""}</td>
        <td>${r.elevated ? '<i class="bi bi-check-lg rights-check"></i>' : '<i class="bi bi-dash rights-dash"></i>'}</td>
        <td style="max-width:520px;">${r.desc}</td>
      </tr>`).join("");

    /* --- Case Roles table --- */
    document.getElementById("tblCaseRoles").innerHTML = D.CASE_ROLES.map(r => `
      <tr><td class="fw-700">${r.name}</td><td>${r.desc}</td></tr>`).join("");

    /* --- Work Type Masters table --- */
    document.getElementById("tblWorkTypes").innerHTML = D.WORK_TYPES.map(w => `
      <tr>
        <td><span class="swatch-dot" style="background:${w.color};"></span> <strong>${w.id}</strong></td>
        <td>${w.code}</td>
        <td style="font-size:12.4px;">${w.caseTypes.join(", ")}</td>
      </tr>`).join("");

    /* --- Case Type Masters table --- */
    document.getElementById("tblCaseTypes").innerHTML = CASE_TYPE_ROWS.map(ct => `
      <tr>
        <td>${ct.caseType}</td>
        <td><span class="swatch-dot" style="background:${ct.color};"></span> ${ct.workType}</td>
      </tr>`).join("");

    /* --- Milestone Masters table --- */
    document.getElementById("tblMilestones").innerHTML = D.MILESTONES.slice().sort((a, b) => a.order - b.order).map(m => `
      <tr>
        <td>${m.order}</td>
        <td><span class="swatch-dot" style="background:${m.color};"></span></td>
        <td class="fw-700">${m.name}</td>
        <td>${A.milestoneBadge(m.id)}</td>
        <td style="font-size:12.2px;color:var(--slc-muted);">${m.how}</td>
      </tr>`).join("");

    /* --- Entity Masters table --- */
    document.getElementById("tblEntities").innerHTML = D.ENTITIES.map(e => {
      const info = ENTITY_TYPES[e] || { type: "Government Entity", contact: "General Office" };
      return `<tr><td class="fw-700">${e}</td><td>${info.type}</td><td style="font-size:12.3px;color:var(--slc-muted);">${info.contact}</td></tr>`;
    }).join("");

    /* --- Expert Masters table --- */
    document.getElementById("tblExperts").innerHTML = EXPERTS.map(ex => `
      <tr>
        <td class="fw-700">${ex.name}</td>
        <td>${ex.specialty}</td>
        <td style="font-size:12.3px;color:var(--slc-muted);">${ex.affiliation}</td>
        <td style="font-size:12.2px;color:var(--slc-muted);">${ex.contact}</td>
      </tr>`).join("");

    /* --- Document Bank table --- */
    document.getElementById("tblDocBank").innerHTML = DOC_BANK.map(d => `
      <tr>
        <td><i class="bi ${d.type === "PDF" ? "bi-file-earmark-pdf text-danger" : d.type === "Excel" ? "bi-file-earmark-spreadsheet text-success" : "bi-file-earmark-word text-primary"} me-2"></i>${d.name}</td>
        <td>${d.type}</td>
        <td>${A.fmtDate(d.updated)}</td>
        <td>${A.userChip(d.by)}</td>
      </tr>`).join("");

    /* --- Reports User Rights table --- */
    document.getElementById("tblReportsRights").innerHTML = REPORT_RIGHT_ROLES.map(rn => {
      const perms = D.ROLE_PERMISSIONS[rn] || [];
      const hasReports = perms.indexOf("Report Access") !== -1;
      const caseAccess = hasReports;
      const opAccess = hasReports && rn !== "Case Type Supervisor"; // Case Type Supervisor scoped to case reports only, per BRD case-type supervision remit
      return `<tr>
        <td class="fw-700">${rn}</td>
        <td>${caseAccess ? '<i class="bi bi-check-lg rights-check"></i>' : '<i class="bi bi-dash rights-dash"></i>'}</td>
        <td>${opAccess ? '<i class="bi bi-check-lg rights-check"></i>' : '<i class="bi bi-dash rights-dash"></i>'}</td>
      </tr>`;
    }).join("");

    /* --- Management Console User Rights table --- */
    document.getElementById("tblConsoleRights").innerHTML = CONSOLE_MODULES.map(mod => {
      const r = CONSOLE_RIGHTS[mod];
      const cell = v => v ? '<i class="bi bi-check-lg rights-check"></i>' : '<i class="bi bi-dash rights-dash"></i>';
      return `<tr>
        <td class="fw-700">${mod}</td>
        <td>${cell(r.sysadmin)}</td>
        <td>${cell(r.pwradmin)}</td>
        <td>${cell(r.reg)}</td>
        <td>${cell(r.hod)}</td>
        <td>${cell(r.sg)}</td>
      </tr>`;
    }).join("");

    /* --- Audit Trail table --- */
    document.getElementById("tblAudit").innerHTML = AUDIT_TRAIL.map(a => `
      <tr>
        <td>${A.userChip(a.user)}</td>
        <td>${a.action}</td>
        <td>${a.target.indexOf("SLC-") === 0 ? `<a class="ref-link" href="case-workspace.html?ref=${a.target}">${a.target}</a>` : a.target}</td>
        <td style="font-size:12.2px;color:var(--slc-muted);">${a.ts}</td>
      </tr>`).join("");

    /* --- Deep link from Management Console top-nav dropdown (e.g. management.html#sec-users) --- */
    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      if (document.getElementById(targetId)) openModule(targetId);
    }
  });
})();
