# Filecraft website

Official site: https://filecraft.github.io/

This repository publishes the landing page and documentation for
[Filecraft](https://github.com/Filecraft/Filecraft). App code and download
assets remain in that repository. Pages serves `main:/` with HTTPS.

Edit `index.html`, `style.css`, `platform.js`, or documentation Markdown files.
After editing Markdown, regenerate the committed HTML documentation:

```sh
python3 -m venv .site-env
.site-env/bin/python -m pip install Markdown==3.7
.site-env/bin/python scripts/build-docs.py
python3 scripts/build-seo.py
python3 scripts/check-site.py
python3 scripts/test-seo.py
node scripts/test-platform.cjs
```

The generator is development-only; the deployed site has no runtime dependencies,
analytics, external fonts or document uploads. Keep canonical URLs at
`https://filecraft.github.io/`. Do not rewrite GitHub release download URLs
as Pages paths. The old `/Filecraft/` page redirects here; legacy documentation
files remain available there for existing links.

Hippocratic License 3.0 core; see LICENSE and NOTICE.
