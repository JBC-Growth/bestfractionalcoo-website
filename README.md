# Best Fractional COO - Website

Static site for bestfractionalcoo.com: a fractional COO practice for growing law firms.

## Pages

| URL | File |
| --- | --- |
| `/` | `index.html` - hero, readiness checklist, services preview, process, about preview |
| `/services` | `services.html` - Assessment, 90-Day Operating Reset, Fractional COO Partnership |
| `/law-firms` | `law-firms.html` - law firm operations |
| `/pricing` | `pricing.html` - price cards, comparison table, FAQ |
| `/about` | `about.html` - bio and track record (placeholders) |
| `/insights` | `insights.html` - article list and Founder Bottleneck Scorecard |
| `/contact` | `contact.html` - Book a Fit Call form |

Shared files: `styles.css`, `site.js`, `logo.jpg`, `victoria.jpg`.

`vercel.json` turns on clean URLs, so `/services` serves `services.html`.

## Contact form email (Resend)

The form posts to `api/contact.js`, a Vercel serverless function that sends the request through [Resend](https://resend.com):

- **To:** victoria@bestfractionalcoo.com
- **CC:** jason@jbcgrowth.com
- **Reply-To:** the visitor's email, so replying goes straight to them

The form only sends when the site runs on Vercel. GitHub Pages serves static files and cannot run the function.

### Setup

1. **Resend:** create an account, add the domain `bestfractionalcoo.com`, and add the DNS records Resend shows in GoDaddy. Wait for the domain to show as verified.
2. **Resend:** create an API key with sending access.
3. **Vercel:** import this GitHub repo as a new project (no build settings needed).
4. **Vercel:** under Settings > Environment Variables, add `RESEND_API_KEY`, then redeploy.
5. **GoDaddy:** point `bestfractionalcoo.com` at Vercel (Vercel's Domains page shows the exact records).

Optional environment variables override the defaults in `api/contact.js`:

| Variable | Default |
| --- | --- |
| `CONTACT_TO` | `victoria@bestfractionalcoo.com` |
| `CONTACT_CC` | `jason@jbcgrowth.com` |
| `CONTACT_FROM` | `Best Fractional COO Website <website@bestfractionalcoo.com>` |

The `from` address must be on the domain verified in Resend.

## Open items

- Confirm business name ("Best Fractional COO" vs. logo's "thefractionalCOO")
- Phone number and booking link, if she wants them on the site
- Verified track-record figures and testimonials for the About page
