/* ============================================================================
   SLC Case Management System — Reports (catalog / landing) page logic
   ============================================================================ */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  const CHART_ICON = {
    doughnut: { icon: "bi-pie-chart-fill", bg: "var(--light-blue)", color: "var(--primary-blue)" },
    bar: { icon: "bi-bar-chart-fill", bg: "#E9F7EF", color: "#107C10" },
    horizontalBar: { icon: "bi-bar-chart-steps", bg: "#F3E8FF", color: "#7C3AED" },
    line: { icon: "bi-graph-up", bg: "#FFF4E5", color: "#C2540A" },
  };

  const GROUP_ICON = {
    "Case Reports": "bi-folder2-open",
    "Operational Reports": "bi-clipboard-data",
  };

  function reportCardHtml(r) {
    const ci = CHART_ICON[r.chart] || CHART_ICON.bar;
    return `
    <div class="col-md-6 col-xl-4">
      <div class="report-card">
        <div class="d-flex align-items-start justify-content-between">
          <div class="rc-icon" style="background:${ci.bg};color:${ci.color};"><i class="bi ${ci.icon}"></i></div>
          <span class="chart-type-tag">${r.chart}</span>
        </div>
        <div class="rc-name">${r.name}</div>
        <div class="rc-desc">${r.desc}</div>
        <div class="rc-actions">
          <a href="report-details.html?id=${r.id}" class="btn btn-sm btn-primary"><i class="bi bi-eye"></i>View Report</a>
          <button class="btn btn-sm btn-light border" onclick="SLCApp.demoActionModal('Report &quot;${r.name}&quot; generated successfully in prototype mode.')"><i class="bi bi-play-fill"></i>Generate</button>
          <button class="btn btn-sm btn-light border" onclick="SLCApp.toast('Report exported successfully in prototype mode.')"><i class="bi bi-download"></i>Export</button>
        </div>
      </div>
    </div>`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("reports", [{ label: "Reports" }]);

    const wrap = document.getElementById("reportGroups");
    let html = "";
    Object.keys(D.REPORTS_CATALOG).forEach(groupName => {
      html += `<div class="report-group-title"><i class="bi ${GROUP_ICON[groupName] || "bi-folder"}"></i>${groupName}</div>`;
      html += `<div class="row g-3">${D.REPORTS_CATALOG[groupName].map(reportCardHtml).join("")}</div>`;
    });
    wrap.innerHTML = html;
  });
})();
