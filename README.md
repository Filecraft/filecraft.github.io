# Filecraft website

[Visit Filecraft](https://filecraft.github.io/) · [Brand assets](https://filecraft.github.io/brand/)

The landing pages, guides and download directory for Filecraft. Product source
and published packages live in [Filecraft/Filecraft](https://github.com/Filecraft/Filecraft).

## Edit and preview

Edit `scripts/brand_layout.py` for the shared layout and English, French and
Spanish homepages. Edit `scripts/build-product-pages.py` for other page copy.
`style.css` contains the visual system; `site.js` adds optional interaction.
Do not hand-edit generated HTML. The workspace has its own application assets.

```sh
python3 -m venv .site-env
.site-env/bin/python -m pip install Markdown==3.7
python3 scripts/build-product-pages.py
.site-env/bin/python scripts/build-docs.py
python3 scripts/build-seo.py
python3 -m http.server 8892
```

Release data comes from published GitHub assets. Never invent a download URL.
The product repository's guarded sync scripts update metadata and current docs.

## Check

```sh
python3 scripts/test-product-pages.py
python3 scripts/test-filecraft-identity.py
python3 scripts/check-site.py
python3 scripts/test-seo.py
node scripts/test-platform.cjs
node scripts/test-download-filter.cjs
```

Browser checks use Playwright from the local product checkout:

```sh
PREPARE_ROOT=/absolute/path/to/Filecraft node scripts/test-brand.cjs http://127.0.0.1:8892
PREPARE_ROOT=/absolute/path/to/Filecraft node scripts/test-redesign.cjs http://127.0.0.1:8892
PREPARE_ROOT=/absolute/path/to/Filecraft node scripts/test-privacy-offline.cjs http://127.0.0.1:8892
```

No runtime framework, remote fonts, analytics or cookies. Languages are static
pages and navigation works without JavaScript. Processing documents requires
JavaScript in the separate workspace. The theme choice lasts for the page only.

Pages publishes `main:/`. Current original source is Apache-2.0; dependencies
and historical releases retain their terms. See LICENSE and NOTICE.
