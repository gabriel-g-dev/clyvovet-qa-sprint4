import { chromium, request } from 'playwright';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// O runner inicia a própria aplicação e só envia requisições ao loopback.
// Nenhuma URL externa pode ser recebida por parâmetro.
const baseURL = 'http://127.0.0.1:18080';
const mode = process.env.QA_VIEWPORT === 'mobile' ? 'mobile' : 'desktop';
const viewport = mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const out = path.resolve('artifacts', mode);
await mkdir(out, { recursive: true });
const startedAt = new Date().toISOString();
const day = (offset = 0) => new Date(Date.parse(startedAt) + offset * 86400000).toISOString().slice(0, 10);
const today = day();
const revision = spawnSync('git', ['-C', '.work/java', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
assert.equal(revision, 'c686580b6ae21c0e828a9057f8d5a5b53c94e254', 'Commit da aplicação difere da baseline');
const jar = (await readdir('.work/java/target')).find(x => x.endsWith('.jar'));
assert.ok(jar, 'Execute npm run prepare:app antes dos testes');
const app = spawn('java', ['-Duser.timezone=UTC', '-jar', '.work/java/target/' + jar,
  '--server.address=127.0.0.1', '--server.port=18080', '--spring.jpa.show-sql=false',
  '--spring.datasource.url=jdbc:h2:mem:qa_' + process.pid + ';DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE'],
{ stdio: ['ignore', 'pipe', 'pipe'] });
let appLog = '';
app.stdout.on('data', d => { appLog += d; });
app.stderr.on('data', d => { appLog += d; });
let browser;
let api;
const results = [];
const checks = [];
const report = { tool: 'Playwright Chromium + Node assert', mode, viewport, startedAt, today, revision, results };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const escape = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const petData = name => ({ nome: name, especie: 'Cachorro', raca: 'SRD', dataNascimento: '2023-01-15', peso: 12.5, tutorId: 1 });
let admin;
let tutor;
async function call(method, route, data, token = admin) {
  const response = await api.fetch(route, { method, data, headers: token ? { Authorization: 'Bearer ' + token } : {} });
  const text = await response.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  // Tokens e cabeçalhos de autenticação nunca são escritos em evidências.
  checks.push({ method, route, status: response.status() });
  return { status: response.status(), body };
}
async function json(method, route, data, status = 200, token = admin) {
  const r = await call(method, route, data, token);
  assert.equal(r.status, status, method + ' ' + route + ': ' + JSON.stringify(r.body));
  return r.body;
}
async function login(page, profile = 'admin', password) {
  await page.goto(baseURL + '/login');
  await page.getByLabel('E-mail', { exact: true }).fill(profile === 'admin' ? 'admin@clyvovet.com.br' : 'gabriel@clyvovet.com.br');
  await page.getByLabel('Senha', { exact: true }).fill(password ?? (profile === 'admin' ? 'admin123' : 'tutor123'));
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}
async function fixture(name, run) {
  const p = await json('POST', '/api/pets', petData(name), 201);
  try { await run(p); }
  finally { await json('DELETE', '/api/pets/' + p.id, undefined, 204); }
}
async function vaccine(petId, name, date = today, interval = 365) {
  return json('POST', '/api/vacinas', { nome: name, dataAplicacao: date, status: 'P', intervaloReforcoDias: interval, petId }, 201);
}
const cases = [];
function scenario(id, title, fn, ui = true) { cases.push({ id, title, fn, ui }); }

scenario('CT01', 'ADMIN autentica e abre o dashboard', async ({ page }) => {
  await login(page);
  await page.waitForURL('**/dashboard');
  assert.equal(await page.getByRole('heading', { name: 'Dashboard', exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Rex', exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Mel', exact: true }).count(), 1);
});
scenario('CT02', 'Senha incorreta não cria sessão', async ({ page }) => {
  await login(page, 'admin', 'incorreta-QA');
  await page.waitForURL('**/login?erro');
  assert.ok(await page.getByText('E-mail ou senha inválidos.', { exact: true }).isVisible());
  await page.goto(baseURL + '/dashboard');
  assert.equal(new URL(page.url()).pathname, '/login');
});
scenario('CT03', 'TUTOR lista somente Rex e suas pendências', async ({ page }) => {
  await login(page, 'tutor');
  await page.waitForURL('**/dashboard');
  assert.equal(await page.getByRole('link', { name: 'Rex', exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Mel', exact: true }).count(), 0);
  await page.goto(baseURL + '/pets');
  assert.equal(await page.getByRole('link', { name: 'Mel', exact: true }).count(), 0);
  const pets = await json('GET', '/api/pets', undefined, 200, tutor);
  assert.deepEqual(pets.content.map(p => p.nome), ['Rex']);
});
scenario('CT04', 'TUTOR recebe acesso negado no cadastro ADMIN', async ({ page }) => {
  await login(page, 'tutor'); await page.waitForURL('**/dashboard');
  const response = await page.goto(baseURL + '/pets/novo');
  assert.equal(response.status(), 403);
  assert.ok(await page.getByRole('heading', { name: 'Acesso negado', exact: true }).isVisible());
  assert.equal((await call('POST', '/api/vacinas/2/aplicar', {}, tutor)).status, 403);
});
scenario('CT05', 'Dashboard apresenta 2 pets e 3 vacinas pendentes', async ({ page }) => {
  await login(page); await page.waitForURL('**/dashboard');
  assert.deepEqual(await page.locator('.cartao .numero').allTextContents(), ['2', '3']);
  assert.equal(await page.locator('tbody tr').count(), 2);
});
scenario('CT06', 'Ficha do Rex exibe score 85 e ATENÇÃO', async ({ page }) => {
  await login(page); await page.waitForURL('**/dashboard');
  await page.getByRole('link', { name: 'Rex', exact: true }).click();
  await page.waitForURL('**/pets/1');
  assert.equal(await page.locator('.score').innerText(), '85');
  assert.ok((await page.locator('main').innerText()).includes('ATENÇÃO'));
  assert.ok((await page.locator('.recomendacoes').innerText()).includes('ATRASADA'));
  assert.equal(await page.locator('tbody tr').count(), 3);
});
scenario('CT07', 'ADMIN cadastra pet pela interface e dados persistem', async ({ page }) => {
  let created;
  try {
    await login(page); await page.waitForURL('**/dashboard'); await page.goto(baseURL + '/pets/novo');
    await page.getByLabel('Nome', { exact: true }).fill('QA-CT07');
    await page.getByLabel('Espécie', { exact: true }).fill('Cachorro');
    await page.getByLabel('Raça', { exact: true }).fill('SRD');
    await page.getByLabel('Data de nascimento', { exact: true }).fill('2023-01-15');
    await page.getByLabel('Peso (kg)', { exact: true }).fill('12.50');
    await page.getByLabel('Tutor responsável', { exact: true }).selectOption('1');
    await page.getByRole('button', { name: 'Cadastrar pet', exact: true }).click();
    await page.waitForURL('**/pets');
    assert.ok(await page.getByText("Pet 'QA-CT07' cadastrado com sucesso.", { exact: true }).isVisible());
    created = (await json('GET', '/api/pets?size=100')).content.find(p => p.nome === 'QA-CT07');
    assert.ok(created); assert.equal(created.peso, 12.5); assert.equal(created.tutorId, 1);
    await page.reload(); assert.equal(await page.getByRole('link', { name: 'QA-CT07', exact: true }).count(), 1);
  } finally {
    created ??= (await json('GET', '/api/pets?size=100')).content.find(p => p.nome === 'QA-CT07');
    if (created) await json('DELETE', '/api/pets/' + created.id, undefined, 204);
  }
});
scenario('CT08', 'Formulário vazio mostra seis erros e não grava', async ({ page }) => {
  await login(page); await page.waitForURL('**/dashboard'); await page.goto(baseURL + '/pets/novo');
  await page.getByRole('button', { name: 'Cadastrar pet', exact: true }).click();
  await page.getByText('Nome é obrigatório', { exact: true }).waitFor();
  assert.equal(await page.locator('.erro-campo').count(), 6);
  for (const message of ['Nome é obrigatório', 'Espécie é obrigatória', 'Raça é obrigatória', 'Data de nascimento é obrigatória', 'Peso é obrigatório', 'Tutor é obrigatório'])
    assert.ok(await page.getByText(message, { exact: true }).isVisible());
  assert.equal((await json('GET', '/api/pets')).totalElements, 2);
});
scenario('CT09', 'JWT identifica o tutor e bloqueia token ausente ou inválido', async () => {
  assert.equal((await call('GET', '/api/pets', undefined, null)).status, 401);
  assert.equal((await call('GET', '/api/pets', undefined, 'token-invalido-QA')).status, 401);
  const me = await json('GET', '/api/auth/me', undefined, 200, tutor);
  assert.equal(me.email, 'gabriel@clyvovet.com.br'); assert.equal(me.role, 'ROLE_TUTOR'); assert.equal(me.tutorId, 1);
  assert.equal((await call('POST', '/api/auth/login', { email: 'admin@clyvovet.com.br', senha: 'incorreta-QA' }, null)).status, 401);
}, false);
scenario('CT10', 'Cadastro público fixa ROLE_TUTOR e rejeita e-mail repetido', async () => {
  const data = { nome: 'Tutor QA CT10', email: 'qa.ct10@example.test', telefone: '(11) 90000-0010', senha: 'SenhaQa123', role: 'ROLE_ADMIN' };
  const r = await json('POST', '/api/auth/register', data, 201, null);
  const session = await json('POST', '/api/auth/login', { email: data.email, senha: data.senha }, 200, null);
  assert.equal(session.role, 'ROLE_TUTOR');
  assert.equal((await call('POST', '/api/auth/register', data, null)).status, 409);
  const me = await json('GET', '/api/auth/me', undefined, 200, session.token);
  assert.equal(me.nome, data.nome); assert.ok(r);
  // Usuário sem endpoint de exclusão: eliminado com o H2 ao encerrar o processo.
}, false);
scenario('CT11', 'TUTOR não acessa Mel nem transfere seu pet por tutorId', async () => {
  assert.equal((await call('GET', '/api/pets/2', undefined, tutor)).status, 403);
  assert.equal((await call('GET', '/api/pets/2/inteligencia-preventiva', undefined, tutor)).status, 403);
  const data = { ...petData('QA-CT11'), tutorId: 2 };
  const p = await json('POST', '/api/pets', data, 201, tutor);
  try {
    assert.equal(p.tutorId, 1);
    const updated = await json('PUT', '/api/pets/' + p.id, data, 200, tutor);
    assert.equal(updated.tutorId, 1);
  } finally { await json('DELETE', '/api/pets/' + p.id, undefined, 204); }
}, false);
scenario('CT12', 'Pet percorre criação, filtro, edição e exclusão', async () => {
  const p = await json('POST', '/api/pets', petData('QA-CT12'), 201);
  let removed = false;
  try {
    const fetched = await json('GET', '/api/pets/' + p.id); assert.equal(fetched.nome, 'QA-CT12');
    const list = await json('GET', '/api/pets/especie/cachorro'); assert.ok(list.some(x => x.id === p.id));
    const edited = await json('PUT', '/api/pets/' + p.id, { ...petData('QA-CT12-editado'), peso: 13.25 });
    assert.equal(edited.nome, 'QA-CT12-editado'); assert.equal(edited.peso, 13.25);
    await json('DELETE', '/api/pets/' + p.id, undefined, 204); removed = true;
    assert.equal((await call('GET', '/api/pets/' + p.id)).status, 404);
  } finally { if (!removed) await json('DELETE', '/api/pets/' + p.id, undefined, 204); }
}, false);
scenario('CT13', 'Histórico de Rex e valor da consulta respeitam o perfil', async () => {
  const history = await json('GET', '/api/consultas/pet/1', undefined, 200, tutor);
  assert.equal(history.length, 2); assert.ok(history.some(x => x.tipo === 'Rotina' && x.valor === 180));
  assert.ok(history.some(x => x.tipo === 'Retorno' && x.valor === 90));
  await fixture('QA-CT13', async p => {
    const created = await json('POST', '/api/consultas', { data: day(10) + 'T10:30:00', tipo: 'Rotina', descricao: 'Check-up QA CT13', status: 'A', valor: 999, petId: p.id, funcionarioId: 1 }, 201, tutor);
    assert.equal(created.valor, 0);
  });
}, false);
scenario('CT14', 'Score sem histórico é 40 e nunca fica abaixo de zero', async () => {
  await fixture('QA-CT14', async p => {
    const initial = await json('GET', '/api/pets/' + p.id + '/inteligencia-preventiva');
    assert.equal(initial.scoreSaude, 40); assert.equal(initial.statusEngajamento, 'CRÍTICO');
    for (let i = 1; i <= 6; i++) await vaccine(p.id, 'QA-CT14-dose-' + i, day(-20));
    const result = await json('GET', '/api/pets/' + p.id + '/inteligencia-preventiva');
    assert.equal(result.scoreSaude, 0); assert.equal(result.statusEngajamento, 'CRÍTICO');
  });
}, false);
scenario('CT15', 'Baixa pela interface cria reforço e atualiza score', async ({ page }) => {
  await fixture('QA-CT15', async p => {
    await json('POST', '/api/consultas', { data: day(-45) + 'T10:30:00', tipo: 'Rotina', descricao: 'Check-up QA CT15', status: 'R', valor: 180, petId: p.id, funcionarioId: 1 }, 201);
    const v = await vaccine(p.id, 'QA-Antirrabica-CT15', day(-20));
    await login(page); await page.waitForURL('**/dashboard'); await page.goto(baseURL + '/pets/' + p.id);
    assert.equal(await page.locator('.score').innerText(), '85');
    await page.getByRole('button', { name: 'Registrar aplicação', exact: true }).click();
    await page.getByText(/Próxima dose agendada automaticamente/).waitFor();
    assert.equal(await page.locator('.score').innerText(), '100');
    assert.ok((await page.locator('main').innerText()).includes('EXCELENTE'));
    const applied = await json('GET', '/api/vacinas/' + v.id); assert.equal(applied.status, 'A'); assert.equal(applied.data, today);
    const doses = await json('GET', '/api/vacinas/pet/' + p.id);
    assert.equal(doses.length, 2); const next = doses.find(x => x.status === 'P'); assert.equal(next.data, day(365));
  });
});
scenario('CT16', 'Reaplicação retorna 409 e mantém somente duas doses', async () => {
  await fixture('QA-CT16', async p => {
    const v = await vaccine(p.id, 'QA-CT16-dose', day(-20));
    await json('POST', '/api/vacinas/' + v.id + '/aplicar', {});
    assert.equal((await call('POST', '/api/vacinas/' + v.id + '/aplicar', {})).status, 409);
    const doses = await json('GET', '/api/vacinas/pet/' + p.id);
    assert.equal(doses.length, 2); assert.equal(doses.filter(x => x.status === 'A').length, 1);
  });
}, false);
scenario('CT17', 'Reforço previamente agendado não é duplicado', async () => {
  await fixture('QA-CT17', async p => {
    const first = await vaccine(p.id, 'QA-CT17-dose', day(-20));
    const next = await vaccine(p.id, 'QA-CT17-dose', day(365));
    const r = await json('POST', '/api/vacinas/' + first.id + '/aplicar', {});
    assert.ok(r.mensagem.includes('já estava agendada')); assert.equal(r.proximaDose, null);
    const doses = await json('GET', '/api/vacinas/pet/' + p.id);
    assert.equal(doses.length, 2); assert.equal(doses.filter(x => x.status === 'P').length, 1);
    assert.equal(doses.find(x => x.status === 'P').id, next.id);
  });
}, false);
scenario('CT18', 'Data futura retorna 400 sem aplicar nem criar reforço', async () => {
  await fixture('QA-CT18', async p => {
    const v = await vaccine(p.id, 'QA-CT18-dose', day(-20));
    const r = await call('POST', '/api/vacinas/' + v.id + '/aplicar', { dataAplicacao: day(1) });
    assert.equal(r.status, 400); assert.ok(JSON.stringify(r.body).includes('futuro'));
    const unchanged = await json('GET', '/api/vacinas/' + v.id); assert.equal(unchanged.status, 'P'); assert.equal(unchanged.data, day(-20));
    assert.equal((await json('GET', '/api/vacinas/pet/' + p.id)).length, 1);
  });
}, false);
scenario('CT19', 'Erros 404 e data inválida retornam contrato verificável', async () => {
  const absent = await call('GET', '/api/pets/999999'); assert.equal(absent.status, 404); assert.ok(absent.body.mensagem.includes('999999'));
  const bad = await call('POST', '/api/pets', { ...petData('QA-CT19'), dataNascimento: '31/99/2026' });
  assert.equal(bad.status, 400); assert.ok(bad.body.mensagem.includes('ISO'));
}, false);

try {
  let ready = false;
  for (let i = 0; i < 120; i++) {
    if (app.exitCode !== null) throw new Error('Aplicação encerrou durante a inicialização');
    try { const r = await fetch(baseURL + '/login'); if (r.ok) { ready = true; break; } } catch {}
    await delay(500);
  }
  assert.ok(ready, 'Aplicação não iniciou em 60 segundos');
  api = await request.newContext({ baseURL });
  admin = (await json('POST', '/api/auth/login', { email: 'admin@clyvovet.com.br', senha: 'admin123' }, 200, null)).token;
  tutor = (await json('POST', '/api/auth/login', { email: 'gabriel@clyvovet.com.br', senha: 'tutor123' }, 200, null)).token;
  browser = await chromium.launch({ headless: process.env.QA_HEADED !== 'true', slowMo: process.env.QA_DEMO === 'true' ? 220 : 0 });
  if (mode === 'desktop') {
    const configuration = await browser.newContext({ viewport, recordVideo: { dir: path.join(out, 'configuration'), size: viewport } });
    const screen = await configuration.newPage();
    const source = await readFile('automation/run.mjs', 'utf8');
    await screen.setContent('<!doctype html><html lang="pt-BR"><meta charset="UTF-8"><style>body{font:24px system-ui;margin:42px;color:#153d38}pre{font:18px monospace;white-space:pre-wrap;background:#eef4f2;padding:22px}</style><h1>ClyvoVet — configuração da automação</h1><p>Playwright 1.62.1 · Chromium · Node assert · Java 17 · H2 descartável</p><p>Commit da aplicação: ' + revision + '</p><pre>npm install --ignore-scripts\nnpx playwright install --with-deps chromium\nnpm run prepare:app\nnpm test\n\nADMIN: admin@clyvovet.com.br / admin123\nTUTOR: gabriel@clyvovet.com.br / tutor123\nD=' + today + '\n\nFixtures QA independentes, excluídas ao final.\nSem mocks HTTP, sem Oracle, sem Supabase, sem produção.</pre><h2>Trecho do arquivo de testes efetivamente executado</h2><pre>' + escape(source.slice(source.indexOf("scenario('CT01'"), source.indexOf("scenario('CT02'"))) + '</pre></html>');
    await delay(4500); await screen.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await delay(3500);
    const video = screen.video(); await configuration.close(); report.configurationVideo = path.relative(out, await video.path());
  }
  for (const c of cases) {
    const start = Date.now(); const events = []; const startCheck = checks.length;
    let context; let page; let result = { id: c.id, title: c.title, type: c.ui ? 'UI + HTTP' : 'HTTP', status: 'passed' };
    try {
      if (c.ui) {
        context = await browser.newContext({ viewport, recordVideo: { dir: path.join(out, 'videos'), size: viewport } });
        page = await context.newPage(); page.setDefaultTimeout(12000);
        page.on('pageerror', e => events.push({ type: 'pageerror', message: e.message }));
        page.on('console', m => { if (m.type() === 'error') events.push({ type: 'console', message: m.text() }); });
        page.on('response', r => { if (r.status() >= 400) events.push({ type: 'http', status: r.status(), path: new URL(r.url()).pathname }); });
      }
      await c.fn({ page });
      if (page) await page.screenshot({ path: path.join(out, c.id + '.png'), fullPage: true });
      if (page && process.env.QA_DEMO === 'true') await delay(1100);
      // Erros HTTP 401/403 são esperados nos cenários negativos; 5xx e 404 em recursos estáticos nunca são ignorados.
      assert.equal(events.filter(e => e.type === 'pageerror' || (e.type === 'http' && (e.status >= 500 || (e.status === 404 && /\.(css|js|png|svg|ico)$/.test(e.path))))).length, 0, JSON.stringify(events));
    } catch (e) {
      result.status = 'failed'; result.error = e.stack;
      if (page) await page.screenshot({ path: path.join(out, c.id + '-falha.png'), fullPage: true }).catch(() => {});
    } finally {
      if (context) { const video = page.video(); await context.close(); result.video = path.relative(out, await video.path()); }
    }
    result.durationMs = Date.now() - start; result.http = checks.slice(startCheck); result.browserEvents = events; results.push(result);
    console.log(result.status.toUpperCase() + ' ' + result.id + ' — ' + result.title + ' (' + result.durationMs + ' ms)');
    if (result.error) console.error(result.error);
  }
} catch (e) { report.setupError = e.stack; process.exitCode = 1; }
finally {
  await browser?.close(); await api?.dispose();
  app.kill('SIGTERM');
  await Promise.race([new Promise(resolve => app.once('exit', resolve)), delay(5000)]);
  if (app.exitCode === null) app.kill('SIGKILL');
  report.finishedAt = new Date().toISOString(); report.passed = results.filter(x => x.status === 'passed').length;
  report.failed = results.filter(x => x.status === 'failed').length; report.total = cases.length;
  await writeFile(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(out, 'application.log'), appLog);
  const rows = results.map(r => '<tr><td>' + r.id + '</td><td>' + escape(r.title) + '</td><td>' + r.type + '</td><td>' + r.status + '</td><td>' + r.durationMs + '</td><td>' + (r.video ? '<a href="' + r.video + '">Vídeo real</a> · <a href="' + r.id + (r.status === 'passed' ? '.png' : '-falha.png') + '">Captura</a>' : 'Requisições e assertions em results.json') + '</td></tr>').join('');
  await writeFile(path.join(out, 'report.html'), '<!doctype html><html lang="pt-BR"><meta charset="UTF-8"><title>ClyvoVet — Resultados reais</title><style>body{font:16px system-ui;margin:40px;color:#153d38}table{border-collapse:collapse;width:100%}td,th{padding:12px;text-align:left;border-bottom:1px solid #ccc}code{overflow-wrap:anywhere}</style><h1>ClyvoVet — Automação Sprint 4</h1><p>Ferramenta: Playwright Chromium + Node assert. Viewport: ' + mode + '.</p><p>Commit da aplicação: <code>' + revision + '</code></p><p>Início: ' + startedAt + ' · Fim: ' + report.finishedAt + '</p><h2>' + report.passed + '/' + cases.length + ' aprovados · ' + report.failed + ' falhas</h2><p>Dados: usuários de demonstração; D=' + today + '; H2 descartável, recriado a cada processo; fixtures individuais excluídas ao final.</p><table><thead><tr><th>ID</th><th>Cenário</th><th>Camada</th><th>Resultado</th><th>ms</th><th>Evidência</th></tr></thead><tbody>' + rows + '</tbody></table><pre>' + escape(report.setupError ?? '') + '</pre></html>');
  if (mode === 'desktop' && results.length === cases.length) {
    const reportBrowser = await chromium.launch();
    try {
      const context = await reportBrowser.newContext({ viewport, recordVideo: { dir: path.join(out, 'summary'), size: viewport } });
      const screen = await context.newPage(); await screen.goto('file://' + path.join(out, 'report.html'));
      await delay(4500); await screen.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await delay(4500);
      const video = screen.video(); await context.close(); report.summaryVideo = path.relative(out, await video.path());
      await writeFile(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
    } finally { await reportBrowser.close(); }
  }
  console.log('RESULTADO: ' + report.passed + '/' + cases.length + ' aprovados; ' + report.failed + ' falhas');
  if (report.failed || results.length !== cases.length) process.exitCode = 1;
}
