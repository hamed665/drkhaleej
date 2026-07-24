# P08 ADMIN-STATE-MACHINE scope contract

This branch extends the existing protected `/admin/imports/readiness` Pharmacy workflow. The final implementation must derive every visible workflow stage from bounded server readback, provide explicit readback-only refresh, stale and expiry handling, replay/fresh receipts, double-submit and multi-tab collision protection, and bounded audit history.

No automatic retry of Reservation, private mutation, or rollback is allowed. P09 real Admin canary, Production access, public/index/sitemap/route promotion, new database authority, Agent, Content, Hospital, Doctor, and Bulk remain closed.
