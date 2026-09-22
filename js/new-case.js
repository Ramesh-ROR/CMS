/* New Case registration page logic */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  const TASKS_BY_WORKTYPE = {
    "Legislation": ["Create New Legislation", "Review New Legislation Draft", "Create an Amendment to an Existing Legislation", "Review a Draft Amendment to an Existing Legislation", "Repeal an Existing Legislation"],
    "Legal Advice and Opinion": ["Draft New Legal Advice/Interpretation", "Review Legal Advice/Interpretation"],
    "Translation": ["New Translation", "Review Translation"],
    "General": ["Others"],
    "Research and Publications": ["Official Gazette Issue", "Legal Publications", "Local Legislation", "Federal Legislation", "Legal Research", "Others"],
  };

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("new-case", [{ label: "New Case" }]);

    // Work type options
    const wtSel = document.getElementById("fWorkType");
    D.WORK_TYPES.forEach(w => wtSel.insertAdjacentHTML("beforeend", `<option value="${w.id}">${w.id}</option>`));

    // Team selects
    ["fHod", "fLead", "fTeam", "fAssoc", "fAdmin"].forEach(id => {
      const sel = document.getElementById(id);
      D.USERS.forEach(u => sel.insertAdjacentHTML("beforeend", `<option value="${u.id}">${u.name} — ${u.role}</option>`));
    });
    document.getElementById("fHod").value = "u1";

    // Entities
    ["fEntity", "fRelEntity"].forEach(id => {
      const sel = document.getElementById(id);
      sel.insertAdjacentHTML("beforeend", `<option value="">Select entity...</option>`);
      D.ENTITIES.forEach(e => sel.insertAdjacentHTML("beforeend", `<option>${e}</option>`));
    });

    window.onWorkTypeChange = function () {
      const wt = wtSel.value;
      const wtObj = D.WORK_TYPES.find(w => w.id === wt);
      const ctSel = document.getElementById("fCaseType");
      const taskSel = document.getElementById("fTask");
      ctSel.innerHTML = "";
      taskSel.innerHTML = "";
      if (!wtObj) {
        ctSel.innerHTML = `<option value="">Select work type first...</option>`;
        taskSel.innerHTML = `<option value="">Select work type first...</option>`;
        return;
      }
      ctSel.insertAdjacentHTML("beforeend", `<option value="">Select case type...</option>`);
      wtObj.caseTypes.forEach(ct => ctSel.insertAdjacentHTML("beforeend", `<option>${ct}</option>`));
      taskSel.insertAdjacentHTML("beforeend", `<option value="">Select task...</option>`);
      (TASKS_BY_WORKTYPE[wt] || ["Others"]).forEach(t => taskSel.insertAdjacentHTML("beforeend", `<option>${t}</option>`));
      updateAIDraftAssist();
    };

    /* ---------------------------------------------------------------- */
    /* AI Drafting Assistant — suggests Lead Member, Urgency and typical  */
    /* duration by learning from similar past cases of the same Case Type */
    /* ---------------------------------------------------------------- */
    function updateAIDraftAssist() {
      const slot = document.getElementById("aiDraftAssist");
      const caseType = document.getElementById("fCaseType").value;
      if (!caseType) { slot.innerHTML = ""; return; }
      const similar = D.CASES.filter(c => c.caseType === caseType);
      if (!similar.length) { slot.innerHTML = ""; return; }

      const leadCounts = {};
      similar.forEach(c => { if (c.lead) leadCounts[c.lead] = (leadCounts[c.lead] || 0) + 1; });
      const topLead = Object.entries(leadCounts).sort((a, b) => b[1] - a[1])[0];
      const urgencyCounts = {};
      similar.forEach(c => { urgencyCounts[c.urgency] = (urgencyCounts[c.urgency] || 0) + 1; });
      const topUrgency = Object.entries(urgencyCounts).sort((a, b) => b[1] - a[1])[0];
      const durations = similar.filter(c => c.csd && c.pcd).map(c => Math.round((new Date(c.pcd) - new Date(c.csd)) / 86400000));
      const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

      const leadUser = topLead ? D.userById(topLead[0]) : null;
      const parts = [];
      if (leadUser) parts.push(`Lead Member is most often <strong>${leadUser.name}</strong> for this case type (${topLead[1]} of ${similar.length} similar cases)`);
      if (topUrgency) parts.push(`typical Urgency is <strong>${topUrgency[0]}</strong>`);
      if (avgDuration) parts.push(`average case duration is <strong>~${avgDuration} days</strong> from opening to Proposed Completion Date`);

      slot.innerHTML = `
        <div class="ai-inline-note">
          <i class="bi bi-stars"></i>
          <span><strong>AI Drafting Assistant</strong> — Based on ${similar.length} similar "${caseType}" case${similar.length>1?"s":""}: ${parts.join("; ")}.</span>
          <span class="ai-chip ms-1"><i class="bi bi-info-circle"></i>Demo</span>
          ${leadUser || topUrgency ? `<button type="button" class="btn btn-sm btn-outline-primary ms-auto" id="btnApplyAISuggestion"><i class="bi bi-magic"></i>Apply Suggestions</button>` : ""}
        </div>`;

      const applyBtn = document.getElementById("btnApplyAISuggestion");
      if (applyBtn) {
        applyBtn.addEventListener("click", function () {
          if (leadUser) document.getElementById("fLead").value = leadUser.id;
          if (topUrgency) document.getElementById("fUrgency").value = topUrgency[0];
          A.toast("AI suggestions applied to the form in prototype mode.", { icon: "bi-magic" });
        });
      }
    }
    document.getElementById("fCaseType").addEventListener("change", updateAIDraftAssist);

    function validate(forRegister) {
      const errors = [];
      if (!wtSel.value) errors.push("Work Type is required.");
      if (!document.getElementById("fCaseType").value) errors.push("Case Type is required.");
      const title = document.querySelectorAll('input[placeholder="Enter case title..."]')[0];
      if (!title.value.trim()) errors.push("Case Title is required.");
      if (forRegister) {
        if (!document.getElementById("fLead").value) errors.push("Lead Member is required to register the case.");
        if (!document.querySelector('input[type="date"]').value) errors.push("Proposed Completion Date is required to register the case.");
      }
      return errors;
    }

    function showAlert(errors, success) {
      const box = document.getElementById("formAlertBox");
      if (success) {
        box.innerHTML = `<div class="alert alert-success d-flex align-items-center gap-2" style="border-radius:10px;font-size:13px;"><i class="bi bi-check-circle-fill"></i>${success}</div>`;
      } else {
        box.innerHTML = `<div class="alert alert-danger" style="border-radius:10px;font-size:13px;">
          <div class="fw-bold mb-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Please resolve the following before continuing:</div>
          <ul class="mb-0 ps-3">${errors.map(e => `<li>${e}</li>`).join("")}</ul>
        </div>`;
      }
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    document.getElementById("btnSave").addEventListener("click", function () {
      const errors = validate(false);
      if (errors.length) { showAlert(errors); return; }
      showAlert(null, "Case saved as Pending Case. It will remain in the registration queue until all mandatory fields are completed.");
      A.toast("Case saved to Pending Cases in prototype mode.");
    });

    document.getElementById("btnSaveRegister").addEventListener("click", function () {
      const errors = validate(true);
      if (errors.length) { showAlert(errors); return; }
      showAlert(null, "Case registered successfully. Reference number SLC-" + (D.WORK_TYPES.find(w=>w.id===wtSel.value)||{code:"GEN"}).code + "-2026-00" + Math.floor(100+Math.random()*800) + " has been generated.");
      A.demoActionModal("Case registered successfully in prototype mode. Reference number generated and case moved to Live Cases.");
    });

    document.getElementById("btnReset").addEventListener("click", function () {
      document.getElementById("newCaseForm").reset();
      document.getElementById("formAlertBox").innerHTML = "";
      window.onWorkTypeChange();
      A.toast("Form reset.", { icon: "bi-arrow-counterclockwise" });
    });
  });
})();
