#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
revision=8e1245351b5a6a6406d7de09edbcbdfbb288234d
mkdir -p .work
if [ ! -d .work/java/.git ]; then
  git clone https://github.com/gabriel-g-dev/clyvovet-java.git .work/java
fi
git -C .work/java diff --quiet
git -C .work/java diff --cached --quiet
if ! git -C .work/java cat-file -e "$revision^{commit}" 2>/dev/null; then
  git -C .work/java fetch --depth=1 origin "$revision"
fi
git -C .work/java checkout --detach "$revision"
test "$(git -C .work/java rev-parse HEAD)" = "$revision"
maven_args=(-f .work/java/pom.xml -B --no-transfer-progress -DskipTests package)
if [ -n "${HTTPS_PROXY:-${HTTP_PROXY:-}}" ]; then
  node --input-type=module <<'NODE'
import fs from 'node:fs';
const p = new URL(process.env.HTTPS_PROXY || process.env.HTTP_PROXY);
const xml = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
fs.writeFileSync('.work/maven-settings.xml', '<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"><proxies><proxy><id>qa-env</id><active>true</active><protocol>http</protocol><host>' + xml(p.hostname) + '</host><port>' + (p.port || 80) + '</port>' + (p.username ? '<username>' + xml(decodeURIComponent(p.username)) + '</username><password>' + xml(decodeURIComponent(p.password)) + '</password>' : '') + '<nonProxyHosts>localhost|127.0.0.1</nonProxyHosts></proxy></proxies></settings>', {mode:0o600});
NODE
  maven_args+=(--settings .work/maven-settings.xml)
fi
bash .work/java/mvnw "${maven_args[@]}"
printf 'Aplicação preparada: %s\n' "$revision"
