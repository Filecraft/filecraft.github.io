# Search visibility and deployment

The current canonical website is https://gonisulaimann.github.io/.
An organization migration is pending organization creation and authenticated owner
access. No canonical or download link points to an unowned domain.

## Implemented

- Unique canonical URLs, titles, descriptions, OpenGraph and Twitter metadata
  for the landing page and all generated HTML documentation.
- Local 1200×630 social image; no external fonts or runtime libraries.
- Semantic headings, descriptive product screenshot alt text, keyboard access,
  static content, and no-JavaScript download links.
- robots.txt permits crawling and references the sitemap.
- scripts/build-seo.py discovers published HTML canonical URLs and generates
  sitemap.xml deterministically. CI regenerates it and fails if committed
  crawl files drift. Run this generator when adding/removing pages.
- SoftwareApplication JSON-LD describes the stable native Mac 0.4.0 download,
  free price, supported OS, author, features, screenshot and actual license.
  Portable is visibly labeled as a separate browser preview, not native Windows.
- SEO regression checks validate metadata, sitemap coverage, JSON-LD fields,
  and lightweight HTML/CSS/JS budgets.

## Accuracy and limits

Prepare is Hippocratic License 3.0 core ethical-source software, not OSI-approved
open source. The site does not mislabel the license to target search keywords.
Prepare creates compressed PDFs from images; it does not compress existing PDF
inputs. Visible copy and structured data maintain this distinction.

No user ratings or reviews have been invented. SoftwareApplication schema is
valid structured metadata, not a guarantee of Google's software rich-result
eligibility (which may require review/rating information). Search rankings,
indexing dates and rich snippets are controlled by search engines.

Search Console ownership verification and sitemap submission have not been done.
The site owner can add a URL-prefix property, supply the verification token, then
submit https://gonisulaimann.github.io/sitemap.xml. No fabricated verification
meta tag or obsolete sitemap-ping endpoint is used.

References:
- https://developers.google.com/search/docs/appearance/structured-data/software-app
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://docs.github.com/en/pages/quickstart

## Organization naming

The existing `prepare` GitHub account prevents claiming that organization name.
GitHub CLI currently exposes `gh org list`, not `gh org create`. Organization
creation uses https://github.com/organizations/plan and requires browser login.
A variant `prepare-utility` requires `prepare-utility/prepare-utility.github.io`
and yields https://prepare-utility.github.io/, not https://prepare.github.io/.
Only create redirects and change canonicals after the destination is owned and
its deployment is verified. Preserve release artifacts and hashes during moves.
