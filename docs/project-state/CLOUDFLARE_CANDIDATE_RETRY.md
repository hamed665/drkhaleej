# Cloudflare Candidate Retry Marker

This temporary marker retriggers the isolated `drkhaleej-web-candidate` workflow after the Cloudflare API token was rotated by the owner.

- No secret value is stored here.
- No Production DNS or custom-domain route is changed by this marker.
- The marker may be removed after the candidate run completes.
