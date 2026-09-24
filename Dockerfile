# syntax = docker/dockerfile:1

# A placeholder, and yours to replace: it serves one page, plus README.md
# rendered at /readme/, which is enough to prove the deploy path end to end.
# Whatever your app is built with, the image that replaces this one must serve
# HTTP on 0.0.0.0:$PORT (fly.toml sets PORT) and keep /readme/ serving the
# whole of README.md (spec/README.md says why).

FROM docker.io/pandoc/minimal:3.11.0.0 AS readme
WORKDIR /site
COPY README.md placeholder/readme.html ./
RUN ["pandoc", "README.md", "--from", "gfm", "--template", "readme.html", \
    "--output", "rendered.html"]

FROM docker.io/library/busybox:1.38.0
COPY placeholder/index.html /site/
COPY --from=readme /site/rendered.html /site/readme/index.html
CMD ["sh", "-c", "exec httpd -f -p 0.0.0.0:${PORT:-8080} -h /site"]
