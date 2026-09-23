/* Roles & Permissions page logic */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  /* Visual treatment for each of the 8 permission action columns */
  const ACTION_STYLE = {
    "View": { icon: "bi-eye", color: "#8A6A3A" },
    "Create": { icon: "bi-plus-circle", color: "#16A34A" },
    "Edit": { icon: "bi-pencil", color: "#BF9A5E" },
    "Delete": { icon: "bi-trash", color: "#DC2626" },
    "Approve": { icon: "bi-check2-circle", color: "#7C3AED" },
    "Register": { icon: "bi-clipboard-check", color: "#C2410C" },
    "Manage": { icon: "bi-sliders", color: "#B45309" },
    "Report Access": { icon: "bi-bar-chart-line", color: "#0B7285" },
  };

  const CASE_ROLE_STYLE = {
    LEAD: { icon: "bi-star-fill", color: "#B45309", bg: "#FEF3C7" },
    TEAM: { icon: "bi-people-fill", color: "#6B4F24", bg: "#EFE4D0" },
    ASSOC: { icon: "bi-person-plus-fill", color: "#8764B8", bg: "#F1E9FE" },
    ADMIN: { icon: "bi-clipboard-data-fill", color: "#15803D", bg: "#DCFCE7" },
  };

  /* Find a real illustrative example of each case role in use, from demo case data */
  function caseRoleExample(roleId) {
    let found = null;
    D.CASES.some(c => {
      if (roleId === "LEAD" && c.lead) { found = { user: c.lead, ref: c.ref }; return true; }
      if (roleId === "TEAM" && c.team && c.team.length) { found = { user: c.team[0], ref: c.ref }; return true; }
      if (roleId === "ASSOC" && c.associate && c.associate.length) { found = { user: c.associate[0], ref: c.ref }; return true; }
      if (roleId === "ADMIN" && c.admin && c.admin.length) { found = { user: c.admin[0], ref: c.ref }; return true; }
      return false;
    });
    if (!found) return "";
    const u = D.userById(found.user);
    return `<strong>${u.name}</strong> is currently assigned as this role on <strong>${found.ref}</strong>.`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("roles-permissions", [{ label: "Roles & Permissions" }]);

    /* --- Summary KPI row --- */
    const elevatedCount = D.SYSTEM_ROLES.filter(r => r.elevated).length;
    const avgActions = Math.round(
      D.SYSTEM_ROLES.reduce((sum, r) => sum + (D.ROLE_PERMISSIONS[r.name] || []).length, 0) / D.SYSTEM_ROLES.length
    );
    const fullAccessRole = D.SYSTEM_ROLES.slice().sort((a, b) =>
      (D.ROLE_PERMISSIONS[b.name] || []).length - (D.ROLE_PERMISSIONS[a.name] || []).length
    )[0];
    const kpis = [
      { icon: "bi-person-badge", bg: "#F5EBD8", color: "#8A6A3A", value: D.SYSTEM_ROLES.length, label: "System Roles", sub: "Defined per BRD 6.1.1.2", target: "matrixSection" },
      { icon: "bi-shield-exclamation", bg: "#F3E8FF", color: "#6D28D9", value: elevatedCount, label: "Elevated Roles", sub: "Require special authority", target: "matrixSection" },
      { icon: "bi-grid-3x3-gap", bg: "#FFE8D1", color: "#C2540A", value: D.PERMISSION_ACTIONS.length, label: "Permission Actions", sub: "View, Create, Edit and more", target: "matrixSection" },
      { icon: "bi-person-workspace", bg: "#DCFCE7", color: "#15803D", value: D.CASE_ROLES.length, label: "Case Roles", sub: "Per-case activity based", target: "caseRolesSection" },
    ];
    document.getElementById("rpKpiRow").innerHTML = kpis.map(k => `
      <div class="col-6 col-md-3">
        <a href="#${k.target}" class="kpi-card-link" onclick="SLCApp.scrollToSection('${k.target}');return false;">
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

    /* --- AI access review insight --- */
    const assignedRoleNames = new Set(D.USERS.map(u => u.role));
    const unusedElevated = D.SYSTEM_ROLES.filter(r => r.elevated && !assignedRoleNames.has(r.name));
    const aiItems = [];
    if (unusedElevated.length) {
      aiItems.push(`${unusedElevated.length} elevated role${unusedElevated.length>1?"s have":" has"} no user currently assigned: ${unusedElevated.map(r=>r.name).join(", ")} — review whether these are still required.`);
    }
    aiItems.push(`${fullAccessRole.name} holds the broadest permission set (${(D.ROLE_PERMISSIONS[fullAccessRole.name]||[]).length} of ${D.PERMISSION_ACTIONS.length} actions) — access reviews should prioritize this role.`);
    aiItems.push(`Average system role carries ${avgActions} of ${D.PERMISSION_ACTIONS.length} permitted actions, consistent with the BRD's principle of least-privilege access by directorate function.`);
    document.getElementById("aiInsightSlot").innerHTML = A.aiInsightCard("AI Access Review", aiItems);

    /* --- Matrix header row (action columns) --- */
    const headRow = document.querySelector("#permMatrix thead tr");
    D.PERMISSION_ACTIONS.forEach(action => {
      const st = ACTION_STYLE[action] || { icon: "bi-circle", color: "#6B7280" };
      const th = document.createElement("th");
      th.innerHTML = `<div class="action-col-head"><span class="action-col-dot" style="background:${st.color};"></span><i class="bi ${st.icon}" style="color:${st.color};font-size:14px;"></i><span>${action}</span></div>`;
      headRow.appendChild(th);
    });

    /* --- Matrix body rows --- */
    document.getElementById("permMatrixBody").innerHTML = D.SYSTEM_ROLES.map(role => {
      const perms = D.ROLE_PERMISSIONS[role.name] || [];
      const cells = D.PERMISSION_ACTIONS.map(action => {
        const has = perms.indexOf(action) !== -1;
        return `<td>${has ? '<i class="bi bi-check-lg action-check"></i>' : '<i class="bi bi-dash action-dash"></i>'}</td>`;
      }).join("");
      return `<tr class="${role.elevated ? "elevated-row" : ""}">
        <th class="role-col">
          <div class="role-name-line">${role.name}${role.elevated ? '<span class="elevated-tag"><i class="bi bi-shield-exclamation"></i> Elevated</span>' : ""}</div>
          <div class="role-desc-line">${role.desc}</div>
        </th>
        ${cells}
      </tr>`;
    }).join("");

    /* --- Case role cards --- */
    document.getElementById("caseRoleCards").innerHTML = D.CASE_ROLES.map(cr => {
      const st = CASE_ROLE_STYLE[cr.id] || { icon: "bi-person", color: "#6B7280", bg: "#F3F4F6" };
      const example = caseRoleExample(cr.id);
      return `<div class="col-md-6 col-xl-3">
        <div class="case-role-card">
          <div class="crc-icon" style="background:${st.bg};color:${st.color};"><i class="bi ${st.icon}"></i></div>
          <div class="crc-title">${cr.name}</div>
          <div class="crc-desc">${cr.desc}</div>
          ${example ? `<div class="crc-example">${example}</div>` : ""}
        </div>
      </div>`;
    }).join("");
  });
})();
