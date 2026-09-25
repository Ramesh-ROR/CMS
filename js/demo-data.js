/* ============================================================================
   SLC Case Management System — Demo Data
   Supreme Legislation Committee, Dubai
   All data below is fictitious dummy data created for prototype demonstration
   purposes only. Terminology follows SLC_BRDv1.0_29092015.
   ============================================================================ */

(function (global) {
  "use strict";

  /* ---------------------------------------------------------------------- */
  /*  Directorates / Sections                                               */
  /* ---------------------------------------------------------------------- */
  const DIRECTORATES = [
    { id: "LEG", name: "Legislation Directorate", nameAr: "إدارة التشريعات", workType: "Legislation" },
    { id: "LAO", name: "Legal Advice and Opinion Directorate", nameAr: "إدارة الاستشارات والآراء القانونية", workType: "Legal Advice and Opinion" },
    { id: "TRN", name: "Translation Section", nameAr: "قسم الترجمة", workType: "Translation" },
    { id: "GEN", name: "General Section", nameAr: "القسم العام", workType: "General" },
    { id: "RP", name: "Research and Publications Section", nameAr: "قسم البحوث والنشر", workType: "Research and Publications" },
  ];

  /* ---------------------------------------------------------------------- */
  /*  Work Types & Case Types                                                */
  /* ---------------------------------------------------------------------- */
  const WORK_TYPES = [
    {
      id: "Legislation",
      code: "LEG",
      color: "#0033A0",
      caseTypes: ["Local Legislations", "Federal Legislations", "Treaties & Conventions"],
    },
    {
      id: "Legal Advice and Opinion",
      code: "LAO",
      color: "#107C10",
      caseTypes: ["Legal Advice", "Official Interpretation of Legislation"],
    },
    {
      id: "Translation",
      code: "TRN",
      color: "#8764B8",
      caseTypes: ["Arabic to English Translation", "English to Arabic Translation"],
    },
    {
      id: "General",
      code: "GEN",
      color: "#6B7280",
      caseTypes: [
        "Human Resource", "Information Technology", "Finance and Admin", "Events",
        "Training and Professional Development", "Strategy and Corporate Excellence",
        "Legal Auditing", "Committees", "Media and Communication",
        "Knowledge and Legislative Comparison", "Others",
      ],
    },
    {
      id: "Research and Publications",
      code: "RP",
      color: "#C239B3",
      caseTypes: ["Official Gazette", "Legislation Publications", "Others"],
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*  System Roles (BRD 6.1.1.2)                                            */
  /* ---------------------------------------------------------------------- */
  const SYSTEM_ROLES = [
    { id: "SG", name: "Secretary General", elevated: false, desc: "SLC Secretary General" },
    { id: "HOD", name: "Head of Directorate (HOD)", elevated: false, desc: "Supervises all directorate cases. A user can be HOD of one or more directorates." },
    { id: "REG", name: "Registration Team", elevated: false, desc: "Responsible for registration of all SLC cases and following up progress." },
    { id: "DADMIN", name: "Directorate Admin Staff", elevated: false, desc: "Admin staff of a specific directorate." },
    { id: "DLEGAL", name: "Directorate Legal Staff", elevated: false, desc: "Legal staff of a specific directorate." },
    { id: "SYSADMIN", name: "System Admin", elevated: false, desc: "Full authority of managing normal cases in the system." },
    { id: "PWRADMIN", name: "Power System Admin", elevated: true, desc: "Full authority of managing normal and classified cases." },
    { id: "CTS", name: "Case Type Supervisor", elevated: true, desc: "Supervises cases of specific case type(s)." },
    { id: "DPA", name: "Directorate Power Admin", elevated: true, desc: "Views all pending and live cases of assigned directorate(s)." },
    { id: "DRA", name: "Directorate Registration Admin", elevated: true, desc: "Registers new/pending cases for assigned directorate(s)." },
    { id: "MONITOR", name: "Case Monitor", elevated: true, desc: "View access to specific cases without being part of the team." },
    { id: "SMS", name: "SMS User", elevated: true, desc: "Dispatches SMS using the SMS gateway." },
    { id: "DEMAIL", name: "Directorate Email", elevated: true, desc: "Uses the directorate email to send emails from the system." },
  ];

  const CASE_ROLES = [
    { id: "LEAD", name: "Lead Member", desc: "Main controller of the case. A case must have a Lead Member." },
    { id: "TEAM", name: "Team Member", desc: "Directorate Legal Staff selected to work on the case." },
    { id: "ASSOC", name: "Associate Member", desc: "Directorate Legal/Admin Staff outside the directorate, selected to work on the case." },
    { id: "ADMIN", name: "Admin Member", desc: "Directorate Admin Staff selected to administer the case. A case must have at least one." },
  ];

  /* ---------------------------------------------------------------------- */
  /*  Case Milestones (BRD 6.1.1.15) — ordered, with colors                 */
  /* ---------------------------------------------------------------------- */
  const MILESTONES = [
    { id: "opened", name: "Case Opened", color: "#FFFFFF", badge: "muted", order: 1, how: "Auto (after Case first save)" },
    { id: "registered", name: "Case Registered", color: "#F3F4F6", badge: "muted", order: 2, how: "Auto (after Case Registration)" },
    { id: "first_review", name: "First Review", color: "#F5C242", badge: "warning", order: 3, how: "Manual" },
    { id: "first_draft", name: "First Draft", color: "#F08C1A", badge: "orange", order: 4, how: "Manual" },
    { id: "further_review", name: "Further Review", color: "#0033A0", badge: "info", order: 5, how: "Manual" },
    { id: "further_draft", name: "Further Draft/Amendment", color: "#0033A0", badge: "primary-dark", order: 6, how: "Manual" },
    { id: "final_draft", name: "Final Draft/Amendment", color: "#003D6B", badge: "navy", order: 7, how: "Manual" },
    { id: "final_review", name: "Final Review", color: "#6B3FA0", badge: "purple-dark", order: 8, how: "Manual" },
    { id: "signoff", name: "Sign Off/Acceptance", color: "#8B5CF6", badge: "purple", order: 9, how: "Manual" },
    { id: "awaiting_customer", name: "Awaiting Customer Response", color: "#FDE68A", badge: "pale-yellow", order: 10, how: "Manual" },
    { id: "awaiting_internal", name: "Awaiting Internal Further Instructions", color: "#7C2D12", badge: "maroon", order: 11, how: "Manual" },
    { id: "completed", name: "Case Completed", color: "#16A34A", badge: "success", order: 12, how: "Manual (system checks all mandatory items)" },
    { id: "on_hold", name: "Case On Hold", color: "#DC2626", badge: "danger", order: 13, how: "Manual" },
    { id: "closed", name: "Case Closed", color: "#EC4899", badge: "pink", order: 14, how: "Manual" },
    { id: "cancelled", name: "Case Cancelled", color: "#9CA3AF", badge: "grey", order: 15, how: "Manual (Registration Team only)" },
    { id: "archived", name: "Case Archived", color: "#78350F", badge: "dark-brown", order: 16, how: "Manual (Registration Team only)" },
  ];

  function milestoneById(id) { return MILESTONES.find(m => m.id === id); }

  /* Simplified visual tracker sequence used in Case Workspace progress bar */
  const WORKSPACE_TRACKER = [
    "Case Opened", "Case Registered", "Under Review", "Legal Review", "Translation", "Final Review", "Case Completed",
  ];

  /* ---------------------------------------------------------------------- */
  /*  Users                                                                  */
  /* ---------------------------------------------------------------------- */
  const USERS = [
    { id: "u1", name: "Ahmed Al Mansoori", nameAr: "أحمد المنصوري", role: "Head of Directorate", directorate: "LEG", email: "ahmed.almansoori@slc.gov.ae", initials: "AM", color: "#1565C0" },
    { id: "u2", name: "Fatima Al Hashimi", nameAr: "فاطمة الهاشمي", role: "Directorate Legal Staff", directorate: "LEG", email: "fatima.alhashimi@slc.gov.ae", initials: "FH", color: "#107C10" },
    { id: "u3", name: "Mohammed Al Nuaimi", nameAr: "محمد النعيمي", role: "Directorate Legal Staff", directorate: "LAO", email: "mohammed.alnuaimi@slc.gov.ae", initials: "MN", color: "#8764B8" },
    { id: "u4", name: "Sara Al Mazrouei", nameAr: "سارة المزروعي", role: "Registration Team", directorate: "GEN", email: "sara.almazrouei@slc.gov.ae", initials: "SM", color: "#C239B3" },
    { id: "u5", name: "Khalid Al Mansouri", nameAr: "خالد المنصوري", role: "System Admin", directorate: "GEN", email: "khalid.almansouri@slc.gov.ae", initials: "KM", color: "#37474F" },
    { id: "u6", name: "Mariam Al Suwaidi", nameAr: "مريم السويدي", role: "Directorate Admin Staff", directorate: "TRN", email: "mariam.alsuwaidi@slc.gov.ae", initials: "MS", color: "#F08C1A" },
    { id: "u7", name: "Rashid Al Falasi", nameAr: "راشد الفلاسي", role: "Head of Directorate", directorate: "LAO", email: "rashid.alfalasi@slc.gov.ae", initials: "RF", color: "#16A34A" },
    { id: "u8", name: "Noura Al Shamsi", nameAr: "نورة الشامسي", role: "Directorate Legal Staff", directorate: "LEG", email: "noura.alshamsi@slc.gov.ae", initials: "NS", color: "#DC2626" },
    { id: "u9", name: "Omar Al Zaabi", nameAr: "عمر الزعابي", role: "Power System Admin", directorate: "GEN", email: "omar.alzaabi@slc.gov.ae", initials: "OZ", color: "#455A64" },
    { id: "u10", name: "Hessa Al Marri", nameAr: "حصة المري", role: "Directorate Legal Staff", directorate: "RP", email: "hessa.almarri@slc.gov.ae", initials: "HM", color: "#6B3FA0" },
    { id: "u11", name: "Abdulla Al Kaabi", nameAr: "عبدالله الكعبي", role: "Secretary General", directorate: "GEN", email: "abdulla.alkaabi@slc.gov.ae", initials: "AK", color: "#1F2937" },
    { id: "u12", name: "Layla Al Qassimi", nameAr: "ليلى القاسمي", role: "Directorate Legal Staff", directorate: "TRN", email: "layla.alqassimi@slc.gov.ae", initials: "LQ", color: "#0288D1" },
  ];

  const CURRENT_USER = { ...USERS[0], titleLine: "Head of Directorate — Legislation Directorate" };

  function userById(id) { return USERS.find(u => u.id === id); }
  function userByName(name) { return USERS.find(u => u.name === name); }

  /* ---------------------------------------------------------------------- */
  /*  Entities (Requesting / Related)                                        */
  /* ---------------------------------------------------------------------- */
  const ENTITIES = [
    "Government of Dubai — Executive Council", "Dubai Municipality", "Roads and Transport Authority (RTA)",
    "Dubai Health Authority (DHA)", "Dubai Land Department", "Dubai Economic Department",
    "Dubai Electricity and Water Authority (DEWA)", "Dubai Courts", "Community Development Authority",
    "Dubai Police General Headquarters", "Knowledge and Human Development Authority (KHDA)",
    "Dubai Statistics Center", "Ministry of Justice", "Ministry of Finance", "Dubai Media Office",
  ];

  /* ---------------------------------------------------------------------- */
  /*  Cases                                                                  */
  /* ---------------------------------------------------------------------- */
  const CASES = [
    {
      ref: "SLC-LEG-2026-00128", systemNo: "SYS-2026-04512", classified: false,
      title: "Draft Federal Environmental Protection Legislation",
      titleAr: "مشروع تشريع اتحادي لحماية البيئة",
      workType: "Legislation", caseType: "Federal Legislations",
      task: "Create New Legislation",
      urgency: "High", status: "Live", milestone: "final_review",
      workspaceStage: 5,
      directorate: "LEG", hod: "u1", lead: "u2", team: ["u8"], associate: [], admin: ["u4"],
      requestingEntity: "Government of Dubai — Executive Council",
      workSource: "Email", csd: "2026-01-12", crd: "2026-01-14", rcd: "2026-01-20",
      pcd: "2026-09-30", acd: null, icd: "2026-10-15",
      lastActivity: "2026-09-18", complexity: "High",
      progressPct: 68,
    },
    {
      ref: "SLC-LAO-2026-00087", systemNo: "SYS-2026-03876", classified: true,
      title: "Legal Opinion on Public-Private Partnership Framework",
      titleAr: "رأي قانوني حول إطار الشراكة بين القطاعين العام والخاص",
      workType: "Legal Advice and Opinion", caseType: "Legal Advice",
      task: "Draft New Legal Advice/Interpretation",
      urgency: "Very High", status: "Live", milestone: "further_review",
      workspaceStage: 3,
      directorate: "LAO", hod: "u7", lead: "u3", team: [], associate: ["u8"], admin: ["u4"],
      requestingEntity: "Dubai Economic Department",
      workSource: "In Person", csd: "2026-02-03", crd: "2026-02-04", rcd: "2026-02-10",
      pcd: "2026-09-25", acd: null, icd: "2026-09-28",
      lastActivity: "2026-09-17", complexity: "High",
      progressPct: 45,
    },
    {
      ref: "SLC-TRN-2026-00114", systemNo: "SYS-2026-04490", classified: false,
      title: "Translation of Federal Environmental Protection Legislation (AR→EN)",
      titleAr: "ترجمة تشريع حماية البيئة الاتحادي",
      workType: "Translation", caseType: "Arabic to English Translation",
      task: "New Translation",
      urgency: "High", status: "Live", milestone: "first_draft",
      workspaceStage: 4,
      directorate: "TRN", hod: "u6", lead: "u12", team: [], associate: [], admin: ["u6"],
      requestingEntity: "Legislation Directorate", workSource: "Internal", csd: "2026-08-30", crd: "2026-08-30", rcd: "2026-08-31",
      pcd: "2026-09-27", acd: null, icd: null,
      lastActivity: "2026-09-19", complexity: "Medium",
      progressPct: 55, relatedCase: "SLC-LEG-2026-00128",
    },
    {
      ref: "SLC-GEN-2026-00052", systemNo: "SYS-2026-02244", classified: false,
      title: "Committee Formation — Legislative Comparison Working Group",
      titleAr: "تشكيل لجنة — فريق عمل المقارنة التشريعية",
      workType: "General", caseType: "Committees",
      task: "Others",
      urgency: "Medium", status: "Live", milestone: "signoff",
      workspaceStage: 6,
      directorate: "GEN", hod: "u9", lead: "u4", team: [], associate: [], admin: ["u4"],
      requestingEntity: "Secretary General Office", workSource: "Internal Post", csd: "2026-01-05", crd: "2026-01-06", rcd: "2026-01-10",
      pcd: "2026-09-22", acd: null, icd: null,
      lastActivity: "2026-09-15", complexity: "Low",
      progressPct: 82,
    },
    {
      ref: "SLC-LEG-2026-00131", systemNo: "SYS-2026-04601", classified: false,
      title: "Amendment to Local Traffic and Roads Legislation",
      titleAr: "تعديل تشريع الطرق والمرور المحلي",
      workType: "Legislation", caseType: "Local Legislations",
      task: "Create an Amendment to an Existing Legislation",
      urgency: "Medium", status: "Live", milestone: "first_review",
      workspaceStage: 2,
      directorate: "LEG", hod: "u1", lead: "u8", team: ["u2"], associate: [], admin: ["u4"],
      requestingEntity: "Roads and Transport Authority (RTA)",
      workSource: "Email", csd: "2026-09-01", crd: "2026-09-02", rcd: "2026-09-05",
      pcd: "2026-11-30", acd: null, icd: null,
      lastActivity: "2026-09-19", complexity: "Medium",
      progressPct: 22,
    },
    {
      ref: "SLC-LEG-2026-00119", systemNo: "SYS-2026-04120", classified: false,
      title: "Ratification Review — Bilateral Investment Treaty",
      titleAr: "مراجعة تصديق — معاهدة الاستثمار الثنائية",
      workType: "Legislation", caseType: "Treaties & Conventions",
      task: "Review New Legislation Draft",
      urgency: "High", status: "Live", milestone: "final_draft",
      workspaceStage: 5,
      directorate: "LEG", hod: "u1", lead: "u2", team: ["u8"], associate: ["u3"], admin: ["u4"],
      requestingEntity: "Ministry of Finance",
      workSource: "Post", crd: "2026-05-12", csd: "2026-05-11", rcd: "2026-05-16",
      pcd: "2026-08-15", acd: null, icd: "2026-08-20",
      lastActivity: "2026-09-10", complexity: "High",
      progressPct: 74, overdue: true,
    },
    {
      ref: "SLC-RP-2026-00033", systemNo: "SYS-2026-03310", classified: false,
      title: "Official Gazette Issue No. 214 — Q3 Local Legislations",
      titleAr: "الجريدة الرسمية العدد 214 — تشريعات الربع الثالث",
      workType: "Research and Publications", caseType: "Official Gazette",
      task: "Official Gazette Issue",
      urgency: "Medium", status: "Live", milestone: "further_draft",
      workspaceStage: 4,
      directorate: "RP", hod: "u9", lead: "u10", team: [], associate: [], admin: ["u4"],
      requestingEntity: "Research and Publications Section",
      workSource: "Internal", csd: "2026-07-01", crd: "2026-07-01", rcd: "2026-07-03",
      pcd: "2026-09-30", acd: null, icd: null,
      lastActivity: "2026-09-16", complexity: "Medium",
      progressPct: 60,
    },
    {
      ref: "SLC-LAO-2026-00091", systemNo: "SYS-2026-03910", classified: false,
      title: "Official Interpretation of Public Procurement Legislation Art. 14",
      titleAr: "تفسير رسمي لتشريع المشتريات العامة — المادة 14",
      workType: "Legal Advice and Opinion", caseType: "Official Interpretation of Legislation",
      task: "Review Legal Advice/Interpretation",
      urgency: "Low", status: "Live", milestone: "first_draft",
      workspaceStage: 3,
      directorate: "LAO", hod: "u7", lead: "u3", team: [], associate: [], admin: ["u4"],
      requestingEntity: "Dubai Land Department",
      workSource: "Fax", csd: "2026-08-18", crd: "2026-08-19", rcd: "2026-08-22",
      pcd: "2026-10-05", acd: null, icd: null,
      lastActivity: "2026-09-12", complexity: "Low",
      progressPct: 30,
    },
    {
      ref: "SLC-GEN-2026-00048", systemNo: "SYS-2026-02110", classified: false,
      title: "Annual Legal Auditing Report — Directorate Compliance Review",
      titleAr: "تقرير التدقيق القانوني السنوي",
      workType: "General", caseType: "Legal Auditing",
      task: "Others",
      urgency: "Medium", status: "Completed", milestone: "completed",
      workspaceStage: 7,
      directorate: "GEN", hod: "u9", lead: "u4", team: [], associate: [], admin: ["u4"],
      requestingEntity: "Secretary General Office", workSource: "Internal", csd: "2026-03-01", crd: "2026-03-01", rcd: "2026-03-04",
      pcd: "2026-06-30", acd: "2026-06-28", icd: null,
      lastActivity: "2026-06-28", complexity: "Medium",
      progressPct: 100,
    },
    {
      ref: "SLC-TRN-2026-00098", systemNo: "SYS-2026-03100", classified: false,
      title: "Translation of Legal Advice — PPP Framework (Pending Translation)",
      titleAr: "ترجمة الرأي القانوني — إطار الشراكة",
      workType: "Translation", caseType: "Arabic to English Translation",
      task: "New Translation",
      urgency: "Very High", status: "Live", milestone: "registered",
      workspaceStage: 2,
      directorate: "TRN", hod: "u6", lead: "u12", team: [], associate: [], admin: ["u6"],
      requestingEntity: "Legal Advice and Opinion Directorate", workSource: "Internal", csd: "2026-09-10", crd: "2026-09-10", rcd: "2026-09-11",
      pcd: "2026-09-24", acd: null, icd: null,
      lastActivity: "2026-09-19", complexity: "Medium",
      progressPct: 25, relatedCase: "SLC-LAO-2026-00087",
    },
    {
      ref: "SLC-LEG-2026-00073", systemNo: "SYS-2026-03005", classified: false,
      title: "Repeal Review — Outdated Municipal Advertising Legislation",
      titleAr: "مراجعة إلغاء — تشريع الإعلانات البلدية",
      workType: "Legislation", caseType: "Local Legislations",
      task: "Repeal an Existing Legislation",
      urgency: "Low", status: "Pending", milestone: "opened",
      workspaceStage: 1,
      directorate: "LEG", hod: "u1", lead: null, team: [], associate: [], admin: [],
      requestingEntity: "Dubai Municipality", workSource: "Email", csd: "2026-09-18", crd: null, rcd: null,
      pcd: null, acd: null, icd: null,
      lastActivity: "2026-09-18", complexity: "Low",
      progressPct: 5, missing: ["Case Receipt Date", "Lead Member", "Administrators"],
    },
    {
      ref: "SLC-LAO-2026-00102", systemNo: "SYS-2026-04002", classified: true,
      title: "Legal Advice — Data Protection Compliance for Government Entities",
      titleAr: "استشارة قانونية — الامتثال لحماية البيانات",
      workType: "Legal Advice and Opinion", caseType: "Legal Advice",
      task: "Draft New Legal Advice/Interpretation",
      urgency: "High", status: "Pending", milestone: "opened",
      workspaceStage: 1,
      directorate: "LAO", hod: "u7", lead: null, team: [], associate: [], admin: [],
      requestingEntity: "Dubai Health Authority (DHA)", workSource: "Email", csd: "2026-09-17", crd: null, rcd: null,
      pcd: null, acd: null, icd: null,
      lastActivity: "2026-09-17", complexity: "Medium",
      progressPct: 5, missing: ["Case Receipt Date", "Lead Member", "Work Source Confirmation"],
    },
    {
      ref: "SLC-RP-2026-00041", systemNo: "SYS-2026-03998", classified: false,
      title: "Legislation Publications Bulletin — Legal Research Digest Vol. 9",
      titleAr: "نشرة المنشورات التشريعية — المجلد 9",
      workType: "Research and Publications", caseType: "Legislation Publications",
      task: "Legal Research",
      urgency: "Low", status: "Pending", milestone: "opened",
      workspaceStage: 1,
      directorate: "RP", hod: "u9", lead: null, team: [], associate: [], admin: [],
      requestingEntity: "Research and Publications Section", workSource: "Internal", csd: "2026-09-14", crd: null, rcd: null,
      pcd: null, acd: null, icd: null,
      lastActivity: "2026-09-14", complexity: "Low",
      progressPct: 5, missing: ["Case Receipt Date", "Lead Member"],
    },
    {
      ref: "SLC-GEN-2026-00061", systemNo: "SYS-2026-04250", classified: false,
      title: "IT Infrastructure Upgrade Request — Directorate Workstations",
      titleAr: "طلب ترقية البنية التحتية لتقنية المعلومات",
      workType: "General", caseType: "Information Technology",
      task: "Others",
      urgency: "Medium", status: "Live", milestone: "first_draft",
      workspaceStage: 3,
      directorate: "GEN", hod: "u9", lead: "u5", team: [], associate: [], admin: ["u4"],
      requestingEntity: "Support Services Directorate", workSource: "Internal", csd: "2026-08-01", crd: "2026-08-01", rcd: "2026-08-04",
      pcd: "2026-09-20", acd: null, icd: null,
      lastActivity: "2026-09-08", complexity: "Low",
      progressPct: 40, overdue: true,
    },
    {
      ref: "SLC-LEG-2026-00099", systemNo: "SYS-2026-03700", classified: false,
      title: "New Federal Legislation — Digital Government Services",
      titleAr: "تشريع اتحادي جديد — خدمات الحكومة الرقمية",
      workType: "Legislation", caseType: "Federal Legislations",
      task: "Create New Legislation",
      urgency: "High", status: "Completed", milestone: "closed",
      workspaceStage: 7,
      directorate: "LEG", hod: "u1", lead: "u2", team: ["u8"], associate: [], admin: ["u4"],
      requestingEntity: "Government of Dubai — Executive Council", workSource: "Email", csd: "2026-02-10", crd: "2026-02-11", rcd: "2026-02-15",
      pcd: "2026-07-30", acd: "2026-07-25", icd: null,
      lastActivity: "2026-08-02", complexity: "High",
      progressPct: 100,
    },
  ];

  function caseByRef(ref) { return CASES.find(c => c.ref === ref); }

  /* ---------------------------------------------------------------------- */
  /*  Pending Approvals — cases currently awaiting the logged-in user's      */
  /*  (CURRENT_USER) sign-off at their current workflow stage.               */
  /* ---------------------------------------------------------------------- */
  const PENDING_APPROVALS = [
    { ref: "SLC-LEG-2026-00128", stage: "Pre-Closure Approval", submitted: "2026-09-18", by: "u1" },
    { ref: "SLC-LAO-2026-00087", stage: "Registration Approval", submitted: "2026-09-17", by: "u1" },
    { ref: "SLC-RP-2026-00033", stage: "Pre-Approval", submitted: "2026-09-16", by: "u1" },
    { ref: "SLC-LEG-2026-00131", stage: "Registration Approval", submitted: "2026-09-15", by: "u1" },
    { ref: "SLC-LEG-2026-00119", stage: "Pre-Closure Approval", submitted: "2026-09-14", by: "u1" },
    { ref: "SLC-LAO-2026-00102", stage: "Pre-Approval", submitted: "2026-09-12", by: "u1" },
  ];

  /* ---------------------------------------------------------------------- */
  /*  Case Activities (subset, focused on featured cases)                   */
  /* ---------------------------------------------------------------------- */
  const ACTIVITIES = {
    "SLC-LEG-2026-00128": [
      { date: "2026-09-18 14:22", user: "u2", type: "Legal Review Started", mode: "Manual", desc: "Final review of Article 12 amendments started following comments from Dubai Municipality.", attachments: ["Legal_Review_Notes_v3.docx"], status: "Completed" },
      { date: "2026-09-15 09:05", user: "u12", type: "Translation Requested", mode: "Manual", desc: "Translation of final draft requested (Arabic to English) for Executive Council submission.", attachments: ["Translation_Request_Form.pdf"], status: "In Progress" },
      { date: "2026-09-10 16:40", user: "u8", type: "Comment Added", mode: "Manual", desc: "Added clarification note on penalty clause aligned with Federal Law No. 24 of 1999.", attachments: [], status: "Completed" },
      { date: "2026-09-02 11:15", user: "u2", type: "Document Uploaded", mode: "Manual", desc: "Uploaded Legislation Second Draft Review incorporating stakeholder feedback.", attachments: ["Legislation_Second_Draft_Review.docx"], status: "Completed" },
      { date: "2026-08-20 10:00", user: "u4", type: "Milestone Updated", mode: "Automatic", desc: "Milestone changed from Further Review to Further Draft/Amendment.", attachments: [], status: "Completed" },
      { date: "2026-07-30 13:30", user: "u2", type: "Email Sent", mode: "Manual", desc: "Circulated first draft to Technical Office for preliminary comments.", attachments: ["First_Draft_Circulation_Email.msg"], status: "Completed" },
      { date: "2026-01-20 09:00", user: "u4", type: "Case Registered", mode: "Automatic", desc: "Case registration cycle completed and reference number generated.", attachments: [], status: "Completed" },
    ],
    "SLC-LAO-2026-00087": [
      { date: "2026-09-17 15:10", user: "u3", type: "Comment Added", mode: "Manual", desc: "Preliminary position shared with Directorate Legal Staff for internal alignment.", attachments: [], status: "Completed" },
      { date: "2026-09-11 10:20", user: "u8", type: "Document Uploaded", mode: "Manual", desc: "Uploaded relevant legislation references (Federal Law No. 2 of 2015).", attachments: ["Relevant_Legislation_Ref.pdf"], status: "Completed" },
      { date: "2026-08-28 09:45", user: "u3", type: "Task Assigned", mode: "Manual", desc: "Assigned research task on PPP frameworks in comparable jurisdictions to Associate Member.", attachments: [], status: "Completed" },
      { date: "2026-02-10 09:00", user: "u4", type: "Case Registered", mode: "Automatic", desc: "Case registration cycle completed and reference number generated.", attachments: [], status: "Completed" },
    ],
    "SLC-TRN-2026-00114": [
      { date: "2026-09-19 08:40", user: "u12", type: "Translation Completed", mode: "Manual", desc: "First draft translation completed, pending proofreading.", attachments: ["FEPL_Translation_Draft1_EN.docx"], status: "Completed" },
      { date: "2026-08-31 09:15", user: "u6", type: "Case Registered", mode: "Automatic", desc: "Translation pending case auto-registered from Legislation Directorate request.", attachments: [], status: "Completed" },
    ],
  };

  /* ---------------------------------------------------------------------- */
  /*  Checklists — templates by case type (BRD 6.1.1.16)                    */
  /* ---------------------------------------------------------------------- */
  const CHECKLIST_TEMPLATES = {
    "Local Legislations": [
      "Original Request", "Case Registered", "Acknowledgement Issued to Case Team",
      "Acknowledgement Issued to Requesting Entity", "Initial Legislation Draft from Requesting Authority",
      "Legislation First Review", "Legislation Preliminary Report", "Legislation First Draft",
      "Legislation First Draft Review", "Legislation Second Draft", "Legislation Second Draft Review",
      "Legislation Final Draft", "Legislation Final Draft Translated", "Legislation Reasons & Objectives Completed",
      "Team Final Approval", "Proof Reader Final Approval", "Technical Office Final Approval",
      "Requesting Entity Final Approval", "Related Entities Final Approval", "Secretary General Final Approval",
      "Final Legislation Sign-Off", "Final Approved Legislation (Arabic - Scanned Copy with Issuing Authority Signature)",
      "Final Approved Legislation (Arabic - MS Word)", "Complete Updated Legislation (Arabic)",
      "Final Approved Legislation (English - Scanned Copy with Issuing Authority Signature)",
      "Final Approved Legislation (English - MS Word)", "Complete Updated Legislation (English)",
      "Legislation Press Release", "Notification to Research and Publications Team",
      "Notification to All Relevant Entities", "Notification to Executive Council",
      "Notification to Department of Finance", "Notification to Media (Dubai Media Office)",
      "Official Gazette Publication", "Case Completed", "Case Closed",
    ],
    "Federal Legislations": [
      "Original Request", "Case Registered", "Acknowledgement Issued to Case Team",
      "Acknowledgement Issued to Requesting Entity", "Legislation First Review", "Legislation Preliminary Report",
      "Legislation First Draft", "Legislation First Draft Review", "Legislation Final Draft",
      "Legislation Final Draft Translated", "Team Final Approval", "Technical Office Final Approval",
      "Requesting Entity Final Approval", "Secretary General Final Approval", "Final Legislation Sign-Off",
      "Final Approved Legislation (Arabic - Scanned Copy with Issuing Authority Signature)",
      "Final Approved Legislation (English - Scanned Copy with Issuing Authority Signature)",
      "Case Completed", "Case Closed",
    ],
    "Treaties & Conventions": [
      "Original Request", "Case Registered", "Acknowledgement Issued to Case Team",
      "Preliminary Report", "Ratification Review", "Legal Opinion Drafted", "Translation Completed",
      "Team Final Approval", "Secretary General Final Approval", "Final Approved Treaty Document",
      "Notification to Ministry of Foreign Affairs", "Case Completed", "Case Closed",
    ],
    "Legal Advice": [
      "Original Request", "Case Registered", "Acknowledgement Issued to Requesting Entity",
      "Relevant Legislation Research Completed", "Draft Legal Opinion", "Internal Legal Review",
      "Final Approved Document", "Send Copy to the Entity", "Case Completed", "Case Closed",
    ],
    "Official Interpretation of Legislation": [
      "Original Request", "Case Registered", "Relevant Legislation Research Completed",
      "Draft Interpretation", "Internal Legal Review", "Final Approved Interpretation",
      "Send Copy to the Entity", "Case Completed", "Case Closed",
    ],
    "Arabic to English Translation": [
      "Original Request", "Case Registered", "Document Analysis Completed", "First Draft Translation",
      "Proofreading Completed", "Final Approved Translation", "Case Completed", "Case Closed",
    ],
    "English to Arabic Translation": [
      "Original Request", "Case Registered", "Document Analysis Completed", "First Draft Translation",
      "Proofreading Completed", "Final Approved Translation", "Case Completed", "Case Closed",
    ],
    "Official Gazette": [
      "Legislation Received for Publication", "Case Registered", "Issue Compilation Started",
      "Editorial Review Completed", "Final Layout Approved", "Official Gazette Published",
      "Notification Sent to Legislation Team", "Case Completed", "Case Closed",
    ],
    "Legislation Publications": [
      "Original Request", "Case Registered", "Content Compilation Completed", "Editorial Review Completed",
      "Publishing House Coordination", "Final Publication Approved", "Case Completed", "Case Closed",
    ],
    "_default": [
      "Original Request", "Case Registered", "Acknowledgement Issued to Case Team",
      "Work in Progress", "Internal Review Completed", "Final Approval", "Case Completed", "Case Closed",
    ],
  };

  function getChecklist(caseType) {
    return CHECKLIST_TEMPLATES[caseType] || CHECKLIST_TEMPLATES._default;
  }

  /* Deterministic pseudo-random status generator so checklist state is stable across page loads */
  function seededChecklistState(ref, items) {
    let seed = 0;
    for (let i = 0; i < ref.length; i++) seed += ref.charCodeAt(i);
    return items.map((label, idx) => {
      const v = (seed + idx * 7) % 10;
      let status = "pending";
      if (v < 6) status = "completed";
      else if (v < 8) status = "pending";
      else status = "attention";
      return { label, status };
    });
  }

  /* ---------------------------------------------------------------------- */
  /*  Attachments                                                            */
  /* ---------------------------------------------------------------------- */
  const ATTACHMENTS = {
    "SLC-LEG-2026-00128": [
      { name: "Final Approved Legislation.pdf", type: "PDF", uploadedBy: "u2", date: "2026-09-18", version: "v3.0", status: "Approved", size: "2.4 MB" },
      { name: "Preliminary Report.docx", type: "Word", uploadedBy: "u2", date: "2026-01-25", version: "v1.0", status: "Final", size: "540 KB" },
      { name: "Legal Opinion.pdf", type: "PDF", uploadedBy: "u8", date: "2026-04-12", version: "v1.0", status: "Final", size: "1.1 MB" },
      { name: "Translation Request.pdf", type: "PDF", uploadedBy: "u12", date: "2026-09-15", version: "v1.0", status: "Submitted", size: "320 KB" },
      { name: "Official Gazette Draft.pdf", type: "PDF", uploadedBy: "u10", date: "2026-09-05", version: "v0.2", status: "Draft", size: "1.8 MB" },
    ],
    "SLC-LAO-2026-00087": [
      { name: "Relevant Legislation Ref.pdf", type: "PDF", uploadedBy: "u8", date: "2026-09-11", version: "v1.0", status: "Final", size: "980 KB" },
      { name: "Draft Legal Opinion.docx", type: "Word", uploadedBy: "u3", date: "2026-09-05", version: "v2.1", status: "In Review", size: "410 KB" },
    ],
  };

  function attachmentsFor(ref) {
    return ATTACHMENTS[ref] || [
      { name: "Original Request.pdf", type: "PDF", uploadedBy: "u4", date: "2026-09-01", version: "v1.0", status: "Final", size: "300 KB" },
    ];
  }

  /* ---------------------------------------------------------------------- */
  /*  Tasks                                                                  */
  /* ---------------------------------------------------------------------- */
  const TASKS = [
    { id: "T-1042", title: "Review Article 12 amendments", relatedCase: "SLC-LEG-2026-00128", assignedTo: "u2", assignedBy: "u1", start: "2026-09-15", due: "2026-09-22", priority: "High", status: "In Progress" },
    { id: "T-1043", title: "Compile PPP framework comparative research", relatedCase: "SLC-LAO-2026-00087", assignedTo: "u8", assignedBy: "u3", start: "2026-09-10", due: "2026-09-20", priority: "High", status: "In Progress" },
    { id: "T-1044", title: "Proofread first draft translation", relatedCase: "SLC-TRN-2026-00114", assignedTo: "u12", assignedBy: "u6", start: "2026-09-19", due: "2026-09-23", priority: "Medium", status: "New" },
    { id: "T-1045", title: "Prepare Official Gazette Issue 214 layout", relatedCase: "SLC-RP-2026-00033", assignedTo: "u10", assignedBy: "u9", start: "2026-09-08", due: "2026-09-18", priority: "Medium", status: "Overdue" },
    { id: "T-1046", title: "Confirm committee member nominations", relatedCase: "SLC-GEN-2026-00052", assignedTo: "u4", assignedBy: "u9", start: "2026-09-01", due: "2026-09-14", priority: "Low", status: "Completed" },
    { id: "T-1047", title: "Draft acknowledgement letter to RTA", relatedCase: "SLC-LEG-2026-00131", assignedTo: "u8", assignedBy: "u1", start: "2026-09-16", due: "2026-09-24", priority: "Medium", status: "New" },
    { id: "T-1048", title: "Coordinate with Ministry of Finance on treaty annex", relatedCase: "SLC-LEG-2026-00119", assignedTo: "u2", assignedBy: "u1", start: "2026-09-05", due: "2026-09-15", priority: "High", status: "Overdue" },
    { id: "T-1049", title: "Review IT infrastructure vendor quotations", relatedCase: "SLC-GEN-2026-00061", assignedTo: "u5", assignedBy: "u9", start: "2026-09-02", due: "2026-09-19", priority: "Low", status: "In Progress" },
  ];

  /* ---------------------------------------------------------------------- */
  /*  Reminders                                                              */
  /* ---------------------------------------------------------------------- */
  const REMINDERS = [
    { id: "R-501", title: "Follow up on translation completion", relatedCase: "SLC-TRN-2026-00114", date: "2026-09-23", time: "09:00", assignedTo: "u12", type: "Case Activity", status: "Upcoming" },
    { id: "R-502", title: "Executive Council submission deadline approaching", relatedCase: "SLC-LEG-2026-00128", date: "2026-09-28", time: "10:00", assignedTo: "u1", type: "PCD Auto-Reminder", status: "Upcoming" },
    { id: "R-503", title: "Official Gazette expected publication date", relatedCase: "SLC-RP-2026-00033", date: "2026-09-29", time: "08:30", assignedTo: "u10", type: "PCD Auto-Reminder", status: "Upcoming" },
    { id: "R-504", title: "Request extension for treaty ratification review", relatedCase: "SLC-LEG-2026-00119", date: "2026-09-21", time: "11:00", assignedTo: "u2", type: "Task Reminder", status: "Due Today" },
    { id: "R-505", title: "Confirm legal advice sign-off meeting", relatedCase: "SLC-LAO-2026-00087", date: "2026-09-20", time: "14:00", assignedTo: "u3", type: "Manual Reminder", status: "Overdue" },
  ];

  /* ---------------------------------------------------------------------- */
  /*  Notifications                                                          */
  /* ---------------------------------------------------------------------- */
  const NOTIFICATIONS = [
    { icon: "bi-signpost-split", text: "Case SLC-LEG-2026-00128 milestone updated to Final Review", time: "2 hours ago", unread: true },
    { icon: "bi-translate", text: "Translation case SLC-TRN-2026-00114 draft completed", time: "5 hours ago", unread: true },
    { icon: "bi-exclamation-triangle", text: "3 tasks are overdue and require attention", time: "Yesterday", unread: true },
    { icon: "bi-journal-text", text: "Official Gazette Issue 214 publication approaching (9 days)", time: "Yesterday", unread: false },
    { icon: "bi-person-plus", text: "You were assigned to case SLC-LEG-2026-00131", time: "2 days ago", unread: false },
    { icon: "bi-bell", text: "Reminder due today: Confirm legal advice sign-off meeting", time: "2 days ago", unread: false },
  ];

  /* ---------------------------------------------------------------------- */
  /*  Roles & Permissions Matrix                                             */
  /* ---------------------------------------------------------------------- */
  const PERMISSION_ACTIONS = ["View", "Create", "Edit", "Delete", "Approve", "Register", "Manage", "Report Access"];
  const ROLE_PERMISSIONS = {
    "Secretary General": ["View", "Report Access"],
    "Head of Directorate (HOD)": ["View", "Edit", "Approve", "Report Access"],
    "Registration Team": ["View", "Create", "Edit", "Register", "Report Access"],
    "Directorate Admin Staff": ["View", "Edit", "Report Access"],
    "Directorate Legal Staff": ["View", "Edit", "Report Access"],
    "System Admin": ["View", "Create", "Edit", "Delete", "Register", "Manage", "Report Access"],
    "Power System Admin": ["View", "Create", "Edit", "Delete", "Approve", "Register", "Manage", "Report Access"],
    "Case Type Supervisor": ["View", "Approve", "Report Access"],
    "Directorate Power Admin": ["View", "Edit", "Report Access"],
    "Directorate Registration Admin": ["View", "Create", "Register"],
    "Case Monitor": ["View"],
    "SMS User": ["View", "Manage"],
    "Directorate Email": ["View", "Manage"],
  };

  /* ---------------------------------------------------------------------- */
  /*  Reports Catalog                                                        */
  /* ---------------------------------------------------------------------- */
  const REPORTS_CATALOG = {
    "Case Reports": [
      { id: "rep-work-type", name: "Cases by Classification", desc: "Breakdown of live and closed cases across all classifications.", chart: "doughnut" },
      { id: "rep-case-type", name: "Cases by Case Type", desc: "Distribution of cases across configured case types.", chart: "bar" },
      { id: "rep-directorate", name: "Cases by Directorate", desc: "Directorate-wise caseload comparison.", chart: "bar" },
      { id: "rep-status", name: "Case Status Report", desc: "Live, pending, completed, and closed case distribution.", chart: "doughnut" },
      { id: "rep-milestone", name: "Case Milestone Report", desc: "Current milestone breakdown for all live cases.", chart: "horizontalBar" },
      { id: "rep-aging", name: "Case Aging Report", desc: "Days open by case, grouped into aging buckets.", chart: "bar" },
      { id: "rep-completion", name: "Case Completion Performance", desc: "Monthly completion performance vs. proposed completion dates.", chart: "line" },
      { id: "rep-overdue", name: "Overdue Cases", desc: "Cases that have exceeded their Proposed Completion Date.", chart: "bar" },
      { id: "rep-classified", name: "Classified Cases", desc: "Classified case volume and status (Power Admin access only).", chart: "doughnut" },
      { id: "rep-registration", name: "Registration Performance", desc: "Average time to complete case registration cycle.", chart: "line" },
    ],
    "Operational Reports": [
      { id: "rep-workload", name: "User Workload Report", desc: "Active case and task load per user.", chart: "bar" },
      { id: "rep-task-perf", name: "Task Performance", desc: "Task completion rate and average turnaround.", chart: "line" },
      { id: "rep-activity", name: "Activity Report", desc: "Volume of case activities logged over time.", chart: "bar" },
      { id: "rep-docs", name: "Document Statistics", desc: "Document uploads by type and directorate.", chart: "doughnut" },
      { id: "rep-translation", name: "Translation Cases", desc: "Translation case volume and completion performance.", chart: "bar" },
      { id: "rep-gazette", name: "Official Gazette Cases", desc: "Gazette issue publication tracking.", chart: "line" },
    ],
  };

  /* ---------------------------------------------------------------------- */
  /*  Export                                                                 */
  /* ---------------------------------------------------------------------- */
  global.SLC = {
    DIRECTORATES, WORK_TYPES, SYSTEM_ROLES, CASE_ROLES, MILESTONES, WORKSPACE_TRACKER,
    USERS, CURRENT_USER, ENTITIES, CASES, ACTIVITIES, PENDING_APPROVALS, CHECKLIST_TEMPLATES, ATTACHMENTS,
    TASKS, REMINDERS, NOTIFICATIONS, PERMISSION_ACTIONS, ROLE_PERMISSIONS, REPORTS_CATALOG,
    milestoneById, userById, userByName, caseByRef, getChecklist, seededChecklistState, attachmentsFor,
  };
})(window);
