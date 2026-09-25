/* My Approvals page logic — cases pending the current user's approval */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;
  const PAGE_SIZE = 8;
  let currentPage = 1;

  function applyFilters(rows) {
    const search = document.getElementById("fSearch").value.trim().toLowerCase();
    return rows.filter(a => {
      const c = D.caseByRef(a.ref);
      if (search) {
        const hay = `${a.ref} ${c ? c.title : ""} ${a.stage}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }

  function rowHtml(a) {
    const c = D.caseByRef(a.ref);
    return `
      <tr>
        <td><a class="ref-link" href="case-workspace.html?ref=${a.ref}">${a.ref}</a></td>
        <td style="max-width:260px;">${c.title}</td>
        <td>${c.workType}</td>
        <td><span class="badge-status badge-info">${a.stage}</span></td>
        <td>${A.fmtDate(a.submitted)}</td>
        <td>${A.userChip(a.by)}</td>
        <td><button class="btn btn-sm btn-outline-primary" onclick="SLCApp.demoActionModal('Approval recorded successfully in prototype mode.')">Review</button></td>
      </tr>`;
  }

  function renderPagination(totalRows) {
    const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
    if (currentPage > pageCount) currentPage = pageCount;
    const el = document.getElementById("maPagination");
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
    const all = D.PENDING_APPROVALS;
    const filtered = applyFilters(all);
    renderPagination(filtered.length);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(start, start + PAGE_SIZE);
    document.getElementById("myApprovalsTbody").innerHTML = pageRows.length
      ? pageRows.map(rowHtml).join("")
      : `<tr><td colspan="7" class="text-center text-muted-soft py-4">No approvals pending — you're all caught up.</td></tr>`;
    const shownFrom = filtered.length ? start + 1 : 0;
    const shownTo = Math.min(start + PAGE_SIZE, filtered.length);
    document.getElementById("maResultCount").textContent = `Showing ${shownFrom}–${shownTo} of ${filtered.length} pending approvals`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("my-approvals", [{ label: "My Approvals" }]);
    document.getElementById("fSearch").addEventListener("input", () => { currentPage = 1; render(); });
    document.getElementById("fResetBtn").addEventListener("click", () => {
      document.getElementById("fSearch").value = "";
      currentPage = 1;
      render();
    });
    render();
  });
})();
