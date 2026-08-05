# The Device Layer

An independent tech blog about security, from the metal up — hardware, firmware,
authentication protocols, and the trust decisions baked into the devices we carry.
A side project; not affiliated with any company or product.

## Structure

Deliberately boring: static HTML + CSS + two lines of vanilla JS. No framework, no
build step, no dependencies.

```
index.html          # home: masthead, post index, about
posts/*.html        # one file per article
css/style.css       # design system (dark terminal aesthetic, green accent)
js/main.js          # footer year
feed.xml            # RSS (hand-maintained)
assets/favicon.svg  # layered-stack mark
```

## Writing a post

1. Copy an existing file in `posts/` and edit the content.
2. Add the post to the list in `index.html` (newest first).
3. Add an `<item>` to `feed.xml` (newest first).

## Develop

Open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

`.github/workflows/deploy.yml` publishes the repo root to **GitHub Pages** on every push
to `main` (enable Settings → Pages → Source: "GitHub Actions" once). Any static host
works too — there is nothing to build.
