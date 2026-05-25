# DrMuscat Agent Instructions

You are working on the DrMuscat platform.

Before doing any implementation, read the master spec files inside:

docs/master-spec/

Use PHASED_BUILD_ONLY mode.

Do not build the full platform in one pass.

Start with Phase 0 only.

Do not create database migrations yet.
Do not implement business features yet.
Do not implement payment gateways.
Do not implement AI chat.
Do not create Persian or Hindi public SEO routes.
Do not use doctor_centers as a writable canonical table.
Do not use legacy areas as a writable canonical table.
Do not create deprecated routes such as /en/dentist/al-khuwair.
Do not fake passing tests.
Do not disable TypeScript, lint, RLS, or validation to make the build pass.

If any conflict, failed command, missing dependency, route ambiguity, schema conflict, RLS ambiguity, or unclear requirement occurs:
STOP.
Do not guess.
Report the blocker and propose the smallest safe fix.

For every phase:
- List files you plan to create/edit before editing.
- Implement only allowed scope.
- Run validation commands.
- Produce a phase completion report.
- Stop after the phase and wait for approval.
