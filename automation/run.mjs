import { chromium, request } from 'playwright';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import path from 'node:path';

// O runner inicia a própria aplicação e só envia requisições ao loopback.
// Nenhuma URL externa pode ser recebida por parâmetro.
const baseURL = 'http://127.0.0.1:18080';
const mode = process.env.QA_VIEWPORT === 'mobile' ? 'mobile' : 'desktop';
const viewport = mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const order = process.env.QA_ORDER === 'reverse' ? 'reverse' : 'normal';
const out = path.resolve(process.env.QA_OUTPUT_DIR || path.join('artifacts', mode + (order === 'reverse' ? '-reverse' : '')));
await mkdir(out, { recursive: true });
const startedAt = new Date().toISOString();
const day = (offset = 0) => new Date(Date.parse(startedAt) + offset * 86400000).toISOString().slice(0, 10);
const today = day();
const revision = spawnSync('git', ['-C', '.work/java', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
assert.equal(revision, '8e1245351b5a6a6406d7de09edbcbdfbb288234d', 'Commit da aplicação difere da baseline');
const jar = (await readdir('.work/java/target')).find(x => x.endsWith('.jar'));
assert.ok(jar, 'Execute npm run prepare:app antes dos testes');
await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once('error', error => reject(new Error('Porta 18080 indisponível; libere-a antes de executar a suíte.', { cause: error })));
  probe.listen(18080, '127.0.0.1', () => probe.close(error => error ? reject(error) : resolve()));
});
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
const report = { tool: 'Playwright Chromium + Node assert', mode, order, viewport, startedAt, today, revision, results };
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
  assert.equal(await page.getByRole('heading', { name: 'Painel de cuidados', exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Rex', exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Mel', exact: true }).count(), 1);
});
scenario('CT02', 'Senha incorreta não cria sessão', async ({ page }) => {
  await login(page, 'admin', 'incorreta-QA');
  await page.waitForURL('**/login?erro');
  assert.ok(await page.getByText('E-mail ou senha inválidos. Confira os dados e tente novamente.', { exact: true }).isVisible());
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
  assert.equal((await json('GET', '/api/vacinas/2', undefined, 200, tutor)).status, 'P');
});
scenario('CT05', 'Dashboard apresenta 2 pets e 3 vacinas pendentes', async ({ page }) => {
  await login(page); await page.waitForURL('**/dashboard');
  // A baseline 8e12453 acrescentou o cartão de atrasadas. Os totais anteriores
  // continuam exatos e cada valor é verificado no cartão identificado pelo rótulo.
  for (const [label, value] of [['Pets acompanhados', '2'], ['Doses pendentes', '3'], ['Doses atrasadas', '1']]) {
    const card = page.locator('.cartao').filter({ has: page.getByText(label, { exact: true }) });
    assert.equal(await card.count(), 1);
    assert.equal(await card.locator('.numero').innerText(), value);
  }
  assert.equal(await page.getByRole('table', { name: 'Calendário vacinal por pet', exact: true }).locator('tbody tr').count(), 2);
});
scenario('CT06', 'Ficha do Rex exibe score 85 e ATENÇÃO', async ({ page }) => {
  await login(page); await page.waitForURL('**/dashboard');
  await page.getByRole('link', { name: 'Rex', exact: true }).click();
  await page.waitForURL('**/pets/1');
  assert.equal(await page.locator('.score').innerText(), '85');
  assert.ok((await page.locator('main').innerText()).includes('ATENÇÃO'));
  assert.ok((await page.locator('.recomendacoes').innerText()).includes('ATRASADA'));
  // A ficha agora inclui outra tabela, de consultas; continuam sendo 3 vacinas.
  assert.equal(await page.getByRole('table', { name: 'Calendário vacinal do pet', exact: true }).locator('tbody tr').count(), 3);
  assert.equal(await page.getByRole('table', { name: 'Consultas do pet', exact: true }).locator('tbody tr').count(), 2);
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
    // O cadastro em 8e12453 abre a ficha criada, antes de voltar à listagem.
    await page.waitForURL(/\/pets\/\d+$/);
    assert.ok(await page.getByText("Pet 'QA-CT07' cadastrado. Agende a primeira vacina para iniciar o acompanhamento.", { exact: true }).isVisible());
    created = (await json('GET', '/api/pets?size=100')).content.find(p => p.nome === 'QA-CT07');
    assert.ok(created);
    for (const [field, expected] of Object.entries(petData('QA-CT07'))) assert.equal(created[field], expected, field);
    assert.equal(new URL(page.url()).pathname, '/pets/' + created.id);
    assert.equal(await page.getByRole('heading', { name: 'QA-CT07', exact: true }).count(), 1);
    await page.reload();
    assert.equal(await page.getByRole('heading', { name: 'QA-CT07', exact: true }).count(), 1);
    await page.goto(baseURL + '/pets');
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
  const data = { nome: 'Tutor QA CT10', email: 'qa.ct10@example.test', telefone: '(11) 90000-0010', senha: 'SenhaQa123456!', role: 'ROLE_ADMIN' };
  const shortPassword = await call('POST', '/api/auth/register', { ...data, senha: 'SenhaQa123' }, null);
  assert.equal(shortPassword.status, 400);
  assert.ok(shortPassword.body.campos.senha.includes('12'));
  const r = await json('POST', '/api/auth/register', data, 201, null);
  const session = await json('POST', '/api/auth/login', { email: data.email, senha: data.senha }, 200, null);
  assert.equal(session.role, 'ROLE_TUTOR');
  assert.equal((await call('POST', '/api/auth/register', data, null)).status, 409);
  const me = await json('GET', '/api/auth/me', undefined, 200, session.token);
  assert.equal(me.nome, data.nome); assert.equal(me.email, data.email);
  assert.equal(me.role, 'ROLE_TUTOR'); assert.ok(Number.isInteger(me.tutorId) && me.tutorId > 0); assert.ok(r);
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
    await page.getByRole('button', { name: 'Registrar aplicação de QA-Antirrabica-CT15 hoje', exact: true }).click();
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
    const before = await json('GET', '/api/vacinas/pet/' + p.id);
    assert.equal(before.find(x => x.status === 'A').data, today);
    assert.equal(before.find(x => x.status === 'P').data, day(365));
    assert.equal((await call('POST', '/api/vacinas/' + v.id + '/aplicar', {})).status, 409);
    const doses = await json('GET', '/api/vacinas/pet/' + p.id);
    assert.equal(doses.length, 2); assert.equal(doses.filter(x => x.status === 'A').length, 1);
    assert.deepEqual(doses, before, 'Reaplicação rejeitada alterou as doses');
  });
}, false);
scenario('CT17', 'Reforço previamente agendado não é duplicado', async () => {
  await fixture('QA-CT17', async p => {
    const first = await vaccine(p.id, 'QA-CT17-dose', day(-20));
    const next = await vaccine(p.id, 'QA-CT17-dose', day(365));
    const r = await json('POST', '/api/vacinas/' + first.id + '/aplicar', {});
    assert.ok(r.mensagem.includes('já estava agendada'));
    assert.equal(r.proximaDose.id, next.id);
    assert.equal(r.proximaDose.petId, p.id);
    assert.equal(r.proximaDose.data, day(365));
    assert.equal(r.proximaDose.status, 'P');
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
    if (!appLog.includes('Tomcat started on port 18080')) { await delay(500); continue; }
    try { const r = await fetch(baseURL + '/login'); if (r.ok) { ready = true; break; } } catch {}
    await delay(500);
  }
  assert.ok(ready, 'Aplicação não iniciou em 60 segundos');
  api = await request.newContext({ baseURL });
  admin = (await json('POST', '/api/auth/login', { email: 'admin@clyvovet.com.br', senha: 'admin123' }, 200, null)).token;
  tutor = (await json('POST', '/api/auth/login', { email: 'gabriel@clyvovet.com.br', senha: 'tutor123' }, 200, null)).token;
  const seedPets = await json('GET', '/api/pets?size=100');
  const seedVaccines = await Promise.all([1, 2].map(id => json('GET', '/api/vacinas/pet/' + id)));
  report.qaRevision = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
  report.configuration = { browser: 'Chromium', playwright: JSON.parse(await readFile('package.json', 'utf8')).devDependencies.playwright,
    browserExecutable: process.env.QA_CHROMIUM_EXECUTABLE || 'Playwright bundled default', headless: process.env.QA_HEADED !== 'true',
    baseURL, viewport, timezone: 'UTC', database: 'H2 em memória exclusivo por processo', order,
    contexts: 'Novo contexto de navegador por caso UI', videoRecording: false };
  await writeFile(path.join(out, 'configuration.json'), JSON.stringify(report.configuration, null, 2));
  try {
    browser = await chromium.launch({ headless: process.env.QA_HEADED !== 'true',
      executablePath: process.env.QA_CHROMIUM_EXECUTABLE || undefined, timeout: 15000 });
    report.browserVersion = browser.version();
  } catch (e) {
    report.browserSetupError = e.stack;
    console.error('Chromium indisponível; casos UI serão registrados como BLOCKED. HTTP será executado.\n' + e.stack);
  }
  for (const c of order === 'reverse' ? [...cases].reverse() : cases) {
    if (c.ui && !browser) {
      results.push({ id: c.id, title: c.title, type: 'UI + HTTP', status: 'blocked',
        error: report.browserSetupError, durationMs: 0, http: [], browserEvents: [] });
      console.log('BLOCKED ' + c.id + ' — ' + c.title + ' (Chromium não iniciou; cenário não executado)');
      continue;
    }
    const start = Date.now(); const events = []; const startCheck = checks.length;
    let context; let page; let result = { id: c.id, title: c.title, type: c.ui ? 'UI + HTTP' : 'HTTP', status: 'passed' };
    try {
      if (c.ui) {
        context = await browser.newContext({ viewport });
        page = await context.newPage(); page.setDefaultTimeout(12000); await page.bringToFront();
        page.on('pageerror', e => events.push({ type: 'pageerror', message: e.message }));
        page.on('console', m => { if (m.type() === 'error') events.push({ type: 'console', message: m.text() }); });
        page.on('response', r => { if (r.status() >= 400) events.push({ type: 'http', status: r.status(), path: new URL(r.url()).pathname }); });
      }
      await c.fn({ page });
      if (page) await page.screenshot({ path: path.join(out, c.id + '.png'), fullPage: true });
      // Erros HTTP 401/403 são esperados nos cenários negativos; 5xx e 404 em recursos estáticos nunca são ignorados.
      assert.equal(events.filter(e => e.type === 'pageerror' || (e.type === 'http' && (e.status >= 500 || (e.status === 404 && /\.(css|js|png|svg|ico)$/.test(e.path))))).length, 0, JSON.stringify(events));
    } catch (e) {
      result.status = 'failed'; result.error = e.stack;
      if (page) await page.screenshot({ path: path.join(out, c.id + '-falha.png'), fullPage: true }).catch(() => {});
    } finally {
      await context?.close();
    }
    result.durationMs = Date.now() - start; result.http = checks.slice(startCheck); result.browserEvents = events; results.push(result);
    console.log(result.status.toUpperCase() + ' ' + result.id + ' — ' + result.title + ' (' + result.durationMs + ' ms)');
    if (result.error) console.error(result.error);
  }
  const finalPets = await json('GET', '/api/pets?size=100');
  const finalVaccines = await Promise.all([1, 2].map(id => json('GET', '/api/vacinas/pet/' + id)));
  assert.deepEqual(finalPets, seedPets, 'Pets do seed alterados ou fixtures não removidas');
  assert.deepEqual(finalVaccines, seedVaccines, 'Vacinas do seed alteradas');
  report.isolation = { passed: true, seedPetIds: seedPets.content.map(p => p.id),
    remainingFixturePets: finalPets.content.filter(p => p.nome.startsWith('QA-')).length,
    seedVaccinesUnchanged: true, databaseDiscardedOnExit: true };
} catch (e) { report.setupError = e.stack; process.exitCode = 1; }
finally {
  await api?.dispose();
  app.kill('SIGTERM');
  await Promise.race([new Promise(resolve => app.once('exit', resolve)), delay(5000)]);
  if (app.exitCode === null) app.kill('SIGKILL');
  report.finishedAt = new Date().toISOString(); report.passed = results.filter(x => x.status === 'passed').length;
  report.failed = results.filter(x => x.status === 'failed').length; report.total = cases.length;
  report.blocked = results.filter(x => x.status === 'blocked').length;
  await writeFile(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(out, 'application.log'), appLog);
  const rows = results.map(r => '<tr><td>' + r.id + '</td><td>' + escape(r.title) + '</td><td>' + r.type + '</td><td>' + r.status + '</td><td>' + r.durationMs + '</td><td>' + (r.status === 'blocked' ? 'Não executado: Chromium indisponível' : r.type === 'UI + HTTP' ? '<a href="' + r.id + (r.status === 'passed' ? '.png' : '-falha.png') + '">Captura</a>' : 'Requisições e resultados em results.json') + '</td></tr>').join('');
  await writeFile(path.join(out, 'report.html'), '<!doctype html><html lang="pt-BR"><meta charset="UTF-8"><title>ClyvoVet — Resultados reais</title><style>body{font:16px system-ui;margin:40px;color:#153d38}table{border-collapse:collapse;width:100%}td,th{padding:12px;text-align:left;border-bottom:1px solid #ccc}code{overflow-wrap:anywhere}</style><h1>ClyvoVet — Automação Sprint 4</h1><p>Ferramenta: Playwright Chromium + Node assert. Viewport: ' + mode + ' · ordem: ' + order + '.</p><p>Commit da aplicação: <code>' + revision + '</code></p><p>Início: ' + startedAt + ' · Fim: ' + report.finishedAt + '</p><h2>' + report.passed + '/' + cases.length + ' aprovados · ' + report.failed + ' falhas · ' + report.blocked + ' bloqueados</h2><p>Dados: usuários de demonstração; D=' + today + '; H2 descartável, recriado a cada processo; fixtures individuais excluídas ao final.</p><table><thead><tr><th>ID</th><th>Cenário</th><th>Camada</th><th>Resultado</th><th>ms</th><th>Evidência</th></tr></thead><tbody>' + rows + '</tbody></table><pre>' + escape(report.setupError ?? '') + '</pre></html>');
  if (browser) {
    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const screen = await context.newPage();
      await screen.goto('file://' + path.join(out, 'report.html'));
      await screen.screenshot({ path: path.join(out, 'report.png'), fullPage: true });
      await screen.setContent('<!doctype html><meta charset="UTF-8"><title>Configuração executada</title><style>body{font:20px system-ui;margin:32px}pre{font:18px monospace;white-space:pre-wrap}</style><h1>Configuração efetivamente executada</h1><p>Início: ' + escape(startedAt) + '</p><p>QA: ' + escape(report.qaRevision) + '</p><p>Java: ' + revision + '</p><pre>' + escape(JSON.stringify(report.configuration, null, 2)) + '</pre>');
      await screen.screenshot({ path: path.join(out, 'configuration.png'), fullPage: true });
      await context.close();
    } finally { await browser.close(); }
  }
  console.log('RESULTADO: ' + report.passed + '/' + cases.length + ' aprovados; ' + report.failed + ' falhas; ' + report.blocked + ' bloqueados');
  if (report.failed || report.blocked || results.length !== cases.length) process.exitCode = 1;
}
