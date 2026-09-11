# Prepare website

Official site: https://gonisulaimann.github.io/

This repository publishes the landing page and documentation for
[Prepare](https://github.com/gonisulaimann/Prepare). App code and download
assets remain in that repository. Pages serves `main:/` with HTTPS.

Edit `index.html`, `style.css`, `site.js`, or documentation Markdown files.
After editing Markdown, regenerate the committed HTML documentation:

```sh
python3 -m venv .site-env
.site-env/bin/python -m pip install Markdown==3.7
.site-env/bin/python scripts/build-docs.py
python3 scripts/check-site.py
```

The generator is development-only; the deployed site has no runtime dependencies,
analytics, external fonts or document uploads. Keep canonical URLs at
`https://gonisulaimann.github.io/`. Do not rewrite GitHub release download URLs
as Pages paths. The old `/Prepare/` page redirects here; legacy documentation
files remain available there for existing links.

Hippocratic License 3.0 core; see LICENSE and NOTICE.
