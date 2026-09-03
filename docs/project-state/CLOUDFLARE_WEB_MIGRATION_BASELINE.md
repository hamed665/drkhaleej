# Cloudflare Web Migration Live Baseline

> Public pre-cutover evidence only. No DNS or Production mutation is performed by this snapshot.

- Captured UTC: 2026-09-03T03:04:17Z
- Source branch head: 61cdc38cfc69a8edd414b8f571514fb26751878c
- Canonical production URL under preservation: `https://www.drkhaleej.com/en/om`

## Recursive DNS snapshot
### drkhaleej.com NS
```text
drkhaleej.com.		1800	IN	NS	meilani.ns.cloudflare.com.
drkhaleej.com.		1800	IN	NS	eugene.ns.cloudflare.com.
```
### drkhaleej.com SOA
```text
drkhaleej.com.		1800	IN	SOA	eugene.ns.cloudflare.com. dns.cloudflare.com. 2413440270 10000 2400 604800 1800
```
### drkhaleej.com A
```text
drkhaleej.com.		300	IN	A	216.150.16.129
drkhaleej.com.		300	IN	A	216.150.1.129
```
### drkhaleej.com AAAA
```text
```
### drkhaleej.com CAA
```text
```
### www.drkhaleej.com CNAME
```text
www.drkhaleej.com.	600	IN	CNAME	99f83eafeb1926bc.vercel-dns-017.com.
```
### www.drkhaleej.com A
```text
www.drkhaleej.com.	599	IN	CNAME	99f83eafeb1926bc.vercel-dns-017.com.
99f83eafeb1926bc.vercel-dns-017.com. 300 IN A	216.150.16.193
99f83eafeb1926bc.vercel-dns-017.com. 300 IN A	216.150.1.193
```
### www.drkhaleej.com AAAA
```text
www.drkhaleej.com.	599	IN	CNAME	99f83eafeb1926bc.vercel-dns-017.com.
```
## Authoritative DNS snapshot
### drkhaleej.com A via eugene.ns.cloudflare.com
```text
drkhaleej.com.		300	IN	A	216.150.16.1
drkhaleej.com.		300	IN	A	216.150.1.1
```
### drkhaleej.com AAAA via eugene.ns.cloudflare.com
```text
```
### drkhaleej.com CAA via eugene.ns.cloudflare.com
```text
```
### www.drkhaleej.com CNAME via eugene.ns.cloudflare.com
```text
www.drkhaleej.com.	600	IN	CNAME	99f83eafeb1926bc.vercel-dns-017.com.
```
### www.drkhaleej.com A via eugene.ns.cloudflare.com
```text
www.drkhaleej.com.	600	IN	CNAME	99f83eafeb1926bc.vercel-dns-017.com.
```
### www.drkhaleej.com AAAA via eugene.ns.cloudflare.com
```text
www.drkhaleej.com.	600	IN	CNAME	99f83eafeb1926bc.vercel-dns-017.com.
```
### drkhaleej.com A via meilani.ns.cloudflare.com
```text
drkhaleej.com.		300	IN	A	216.150.1.129
drkhaleej.com.		300	IN	A	216.150.16.129
```
### drkhaleej.com AAAA via meilani.ns.cloudflare.com
```text
```
### drkhaleej.com CAA via meilani.ns.cloudflare.com
```text
```
### www.drkhaleej.com CNAME via meilani.ns.cloudflare.com
```text
www.drkhaleej.com.	600	IN	CNAME	99f83eafeb1926bc.vercel-dns-017.com.
```
### www.drkhaleej.com A via meilani.ns.cloudflare.com
```text
www.drkhaleej.com.	600	IN	CNAME	99f83eafeb1926bc.vercel-dns-017.com.
```
### www.drkhaleej.com AAAA via meilani.ns.cloudflare.com
```text
www.drkhaleej.com.	600	IN	CNAME	99f83eafeb1926bc.vercel-dns-017.com.
```
## Redirect and proxy/CDN evidence
### http://drkhaleej.com/
```text
HTTP/1.0 308 Permanent Redirect
Location: https://drkhaleej.com/
server: Vercel
HTTP/2 308 
cache-control: public, max-age=0, must-revalidate
location: https://www.drkhaleej.com/
server: Vercel
strict-transport-security: max-age=63072000
x-vercel-id: iad1::8k448-1788404659436-bace01b5a9cd
HTTP/2 308 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
location: /en/om
server: Vercel
strict-transport-security: max-age=63072000
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::mh9pw-1788404659531-3f5e664e07b3
HTTP/2 200 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
server: Vercel
strict-transport-security: max-age=63072000
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::8thmx-1788404659755-ae6768d22626
```
### https://drkhaleej.com/
```text
HTTP/2 308 
cache-control: public, max-age=0, must-revalidate
location: https://www.drkhaleej.com/
server: Vercel
strict-transport-security: max-age=63072000
x-vercel-id: iad1::2mq22-1788404659907-3c612cc82253
HTTP/2 308 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
location: /en/om
server: Vercel
strict-transport-security: max-age=63072000
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::8nwk6-1788404660013-23434f8c5483
HTTP/2 200 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
server: Vercel
strict-transport-security: max-age=63072000
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::8nwk6-1788404660077-084298342dce
```
### http://www.drkhaleej.com/
```text
HTTP/1.0 308 Permanent Redirect
Location: https://www.drkhaleej.com/
server: Vercel
HTTP/2 308 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
location: /en/om
server: Vercel
strict-transport-security: max-age=63072000
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::8thmx-1788404660306-ced958e4f8fd
HTTP/2 200 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
server: Vercel
strict-transport-security: max-age=63072000
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::8thmx-1788404660392-5af325737a6c
```
### https://www.drkhaleej.com/
```text
HTTP/2 308 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
location: /en/om
server: Vercel
strict-transport-security: max-age=63072000
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::vjqv7-1788404660554-0df5c9c52bc1
HTTP/2 200 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
server: Vercel
strict-transport-security: max-age=63072000
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::m42d5-1788404660610-d5ee67650829
```
## Production header/cache baseline
### https://www.drkhaleej.com/en/om
```text
HTTP/2 200 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
content-type: text/html; charset=utf-8
cross-origin-opener-policy: same-origin-allow-popups
permissions-policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=(), bluetooth=(), serial=()
referrer-policy: strict-origin-when-cross-origin
server: Vercel
strict-transport-security: max-age=63072000
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
x-content-type-options: nosniff
x-frame-options: DENY
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::5lbrd-1788404660772-e056c2bcb20d
```
### https://www.drkhaleej.com/ar/om
```text
HTTP/2 200 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
content-type: text/html; charset=utf-8
cross-origin-opener-policy: same-origin-allow-popups
permissions-policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=(), bluetooth=(), serial=()
referrer-policy: strict-origin-when-cross-origin
server: Vercel
strict-transport-security: max-age=63072000
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
x-content-type-options: nosniff
x-frame-options: DENY
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::bpgp4-1788404660926-97925de5e065
```
### https://www.drkhaleej.com/robots.txt
```text
HTTP/2 200 
age: 55886
cache-control: public, max-age=0, must-revalidate
content-type: text/plain; charset=utf-8
cross-origin-opener-policy: same-origin-allow-popups
etag: "adfd555ceac8ea708a5d48518e4e2b18"
last-modified: Wed, 02 Sep 2026 11:32:55 GMT
permissions-policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=(), bluetooth=(), serial=()
referrer-policy: strict-origin-when-cross-origin
server: Vercel
strict-transport-security: max-age=63072000
x-content-type-options: nosniff
x-frame-options: DENY
x-vercel-cache: HIT
x-vercel-id: iad1::pw4vw-1788404661412-e8cd2b70d0d0
content-length: 229
```
### https://www.drkhaleej.com/sitemap.xml
```text
HTTP/2 200 
age: 0
cache-control: public, max-age=0, must-revalidate
content-type: application/xml
cross-origin-opener-policy: same-origin-allow-popups
permissions-policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=(), bluetooth=(), serial=()
referrer-policy: strict-origin-when-cross-origin
server: Vercel
strict-transport-security: max-age=63072000
x-content-type-options: nosniff
x-frame-options: DENY
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::pq6tg-1788404661596-0706a7c8b0f0
```
### https://www.drkhaleej.com/admin/login
```text
HTTP/2 200 
age: 0
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
content-type: text/html; charset=utf-8
cross-origin-opener-policy: same-origin-allow-popups
permissions-policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=(), bluetooth=(), serial=()
referrer-policy: strict-origin-when-cross-origin
server: Vercel
strict-transport-security: max-age=63072000
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
x-content-type-options: nosniff
x-frame-options: DENY
x-powered-by: Next.js
x-vercel-cache: MISS
x-vercel-id: iad1::iad1::6k5g2-1788404663035-817e7ea0f03e
```
## TLS certificate baseline
### drkhaleej.com
```text
subject=CN = drkhaleej.com
issuer=C = US, O = Let's Encrypt, CN = YR2
serial=0562D8C9ED7189EBCC41F8B368A6D68CA2AC
notBefore=Aug 28 03:34:05 2026 GMT
notAfter=Nov 26 03:34:04 2026 GMT
X509v3 Subject Alternative Name: 
    DNS:drkhaleej.com
```
### www.drkhaleej.com
```text
subject=CN = www.drkhaleej.com
issuer=C = US, O = Let's Encrypt, CN = YR1
serial=06EB4D64D0AD9E720B29A583A6B0874C194B
notBefore=Aug 27 12:37:45 2026 GMT
notAfter=Nov 25 12:37:44 2026 GMT
X509v3 Subject Alternative Name: 
    DNS:www.drkhaleej.com
```
## SEO content fingerprints
### https://www.drkhaleej.com/en/om
- HTTP: 200
- SHA256: 78d9b2cb9988899c8811fc18fd6ce7978362b79181b3bdb9d667e31833cb7afe
- Canonical / robots / hreflang evidence:
```text
<link rel="canonical" href="https://www.drkhaleej.com/en/om"/>
<link rel="alternate" hrefLang="en-OM" href="https://www.drkhaleej.com/en/om"/>
<link rel="alternate" hrefLang="ar-OM" href="https://www.drkhaleej.com/ar/om"/>
<link rel="alternate" hrefLang="en" href="https://www.drkhaleej.com/en/om"/>
<link rel="alternate" hrefLang="ar" href="https://www.drkhaleej.com/ar/om"/>
<link rel="alternate" hrefLang="x-default" href="https://www.drkhaleej.com/en/om"/>
```
### https://www.drkhaleej.com/ar/om
- HTTP: 200
- SHA256: 167374ef04b1e34553da2c13146e432d842df5ef4a4488634997db8939c956cb
- Canonical / robots / hreflang evidence:
```text
<link rel="canonical" href="https://www.drkhaleej.com/ar/om"/>
<link rel="alternate" hrefLang="en-OM" href="https://www.drkhaleej.com/en/om"/>
<link rel="alternate" hrefLang="ar-OM" href="https://www.drkhaleej.com/ar/om"/>
<link rel="alternate" hrefLang="en" href="https://www.drkhaleej.com/en/om"/>
<link rel="alternate" hrefLang="ar" href="https://www.drkhaleej.com/ar/om"/>
<link rel="alternate" hrefLang="x-default" href="https://www.drkhaleej.com/en/om"/>
```
### https://www.drkhaleej.com/robots.txt
- HTTP: 200
- SHA256: ac2a83f7580612b803abbfc40b7cf7b0ad019cad1d27389481fc7093f8d11c98
- Canonical / robots / hreflang evidence:
```text
```
### https://www.drkhaleej.com/sitemap.xml
- HTTP: 200
- SHA256: 156ee27a3c49163d647a55383a0baf3bb331dee1fa602e29d77f03d515f3f4a7
- Canonical / robots / hreflang evidence:
```text
```
## Interpretation rules
- Authoritative answers above are the rollback DNS evidence. Do not mutate DNS until the candidate runtime and environment parity gates are green.
- If public records terminate at a CDN/proxy, the hidden origin is intentionally recorded as not externally observable rather than guessed.
- `x-vercel-*` evidence, if present, is recorded only as an observed header and is not treated as proof of account ownership.
