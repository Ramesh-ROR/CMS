/* Register Case page logic */
(function () {
  "use strict";
  const D = window.SLC, A = window.SLCApp;

  document.addEventListener("DOMContentLoaded", function () {
    A.renderShell("new-case", [{ label: "Register Case" }]);
    A.initTabs("#newCaseTabs", "#newCasePanels");

    // Work type options
    const wtSel = document.getElementById("fWorkType");
    D.WORK_TYPES.forEach(w => wtSel.insertAdjacentHTML("beforeend", `<option value="${w.id}">${w.id}</option>`));

    // Team selects
    ["fHod", "fLead", "fTeam", "fAdmin"].forEach(id => {
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
      ctSel.innerHTML = "";
      if (!wtObj) {
        ctSel.innerHTML = `<option value="">Select work type first...</option>`;
        return;
      }
      ctSel.insertAdjacentHTML("beforeend", `<option value="">Select case type...</option>`);
      wtObj.caseTypes.forEach(ct => ctSel.insertAdjacentHTML("beforeend", `<option>${ct}</option>`));
    };

    function validate(forRegister) {
      const errors = [];
      if (!wtSel.value) errors.push("Work Type is required.");
      if (!document.getElementById("fCaseType").value) errors.push("Case Type is required.");
      const title = document.querySelectorAll('input[placeholder="Enter case title..."]')[0];
      if (!title.value.trim()) errors.push("Case Title is required.");
      if (forRegister) {
        if (!document.getElementById("fHod").value) errors.push("Head of Directorate is required to register the case.");
        if (!document.getElementById("fLead").value) errors.push("Lead Member is required to register the case.");
        if (!Array.from(document.getElementById("fAdmin").selectedOptions).length) errors.push("At least one Administrator is required to register the case.");
        if (!document.getElementById("fEntity").value) errors.push("Requesting Entity Name is required to register the case.");
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
      showAlert(null, "Case saved successfully.");
      A.toast("Case saved successfully.");
    });

    document.getElementById("btnSaveRegister").addEventListener("click", function () {
      const errors = validate(true);
      if (errors.length) { showAlert(errors); return; }
      const ref = "SLC-" + (D.WORK_TYPES.find(w => w.id === wtSel.value) || { code: "GEN" }).code + "-2026-00" + Math.floor(100 + Math.random() * 800);
      showAlert(null, `Case ${ref} registered successfully.`);
      A.demoActionModal(`Case ${ref} registered successfully.`);
    });

    document.getElementById("btnReset").addEventListener("click", function () {
      document.getElementById("newCaseForm").reset();
      document.getElementById("formAlertBox").innerHTML = "";
      window.onWorkTypeChange();
      A.toast("Form reset.", { icon: "bi-arrow-counterclockwise" });
    });
  });
})();
