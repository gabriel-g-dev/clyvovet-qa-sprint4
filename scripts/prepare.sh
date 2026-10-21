#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
revision=c686580b6ae21c0e828a9057f8d5a5b53c94e254
mkdir -p .work
if [ ! -d .work/java/.git ]; then
  git clone https://github.com/gabriel-g-dev/clyvovet-java.git .work/java
fi
git -C .work/java checkout --detach "$revision"
test "$(git -C .work/java rev-parse HEAD)" = "$revision"
bash .work/java/mvnw -f .work/java/pom.xml -B -DskipTests package
printf 'Aplicação preparada: %s\n' "$revision"
