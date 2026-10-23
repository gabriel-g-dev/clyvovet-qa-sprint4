import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const style = 'body{font:22px system-ui;margin:28px;color:#153d38;background:#f6f9f8}h1{font-size:30px;margin:10px 0}h2{font-size:24px}p{margin:12px 0}pre{font:17px/1.35 monospace;white-space:pre-wrap;background:white;border:1px solid #bacdc7;padding:18px}a{color:#08634e}small{font-size:17px}.columns{display:grid;grid-template-columns:1fr 1fr;gap:20px}';

// Esta tela apenas apresenta arquivos e resultados. Não substitui a interface testada.
export async function startDemo(browser, out, report) {
  if (process.env.QA_RECORD !== 'true') return null;
  if (!process.env.DISPLAY || process.env.QA_HEADED !== 'true') throw new Error('Gravação contínua exige DISPLAY/Xvfb e QA_HEADED=true');
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const cases = JSON.parse(await readFile('manual/cases.json', 'utf8'));
  const azure = JSON.parse(await readFile('manual/azure-items.json', 'utf8'));
  const timeline = [];
  const setScreen = async (title, html) => {
    const filename = path.join(out, 'demo-screen.html');
    await writeFile(filename, '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>' + escape(title) + '</title><style>' + style + '</style><h1>' + escape(title) + '</h1>' + html + '</html>');
    await page.goto('file://' + filename); await page.bringToFront();
  };
  await setScreen('ClyvoVet — preparação da execução', '<p>Iniciando gravação contínua do navegador.</p>');
  let log = '';
  const recording = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'warning', '-y', '-f', 'x11grab', '-framerate', '20', '-video_size', '1600x1000', '-i', process.env.DISPLAY, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(out, 'demonstracao.mp4')], { stdio: ['ignore', 'ignore', 'pipe'] });
  const recordingExit = new Promise(resolve => recording.once('exit', resolve));
  recording.stderr.on('data', d => { log += d; });
  const began = Date.now();
  const mark = label => timeline.push({ second: Number(((Date.now() - began) / 1000).toFixed(2)), label });
  recording.on('error', e => { log += e.stack; });
  await pause(1200);
  if (recording.exitCode !== null || !recording.pid) throw new Error('Não foi possível iniciar FFmpeg: ' + log);
  mark('Ferramenta, ambiente e preparação real');
  const prepareLog = await readFile('artifacts/prepare.log', 'utf8').catch(() => 'Preparação concluída antes da abertura do navegador; consulte o log do job.');
  await setScreen('Preparação e dados controlados', '<p>Playwright 1.62.1 + Chromium + Node assert: automação da interface web Java e verificação HTTP real.</p><p>O navegador registra esta sessão sem cortes. Sem narração; roteiro próprio em docs/roteiro-narracao.md.</p><div class="columns"><div><h2>Comandos e isolamento</h2><pre>npm ci --ignore-scripts\nnpx playwright install --with-deps chromium\nnpm run prepare:app\nQA_HEADED=true QA_RECORD=true QA_DEMO=true npm test</pre><p>Java 17 / H2 em memória privado / 127.0.0.1:18080. Aplicação já iniciou e respondeu ao login. As fixtures são excluídas ao final de cada caso.</p><p>Commit real: <small>' + escape(report.revision) + '</small></p></div><div><h2>Massa da execução</h2><pre>ADMIN: admin@clyvovet.com.br / admin123\nTUTOR: gabriel@clyvovet.com.br / tutor123\nRex: tutor 1 | Mel: tutora 2\nD (UTC): ' + report.today + '\nQA-CT07: Cachorro / SRD / 2023-01-15 / 12.50\nDose QA: D-20 | reforço: D+365</pre><p>Dados públicos de demonstração. Não há produção, mocks HTTP, Oracle ou Supabase nesta suíte.</p><p>Arquivos: automation/run.mjs, scripts/prepare.sh e .github/workflows/qa.yml.</p></div></div>');
  await pause(15000);
  mark('Log real da compilação e configuração do runner');
  await setScreen('Preparação executada e código utilizado', '<div class="columns"><div><h2>Final do log de preparação</h2><pre>' + escape(prepareLog.split('\n').slice(-19).join('\n')) + '</pre></div><div><h2>Configuração real de scripts/prepare.sh</h2><pre>' + escape(await readFile('scripts/prepare.sh', 'utf8')) + '</pre></div></div>');
  await pause(10000);
  return {
    mark,
    async before(c) {
      if (!c.ui) return;
      const manual = cases.find(x => x.id === c.id); const item = azure.find(x => x.id === c.id);
      mark(c.id + ' — dados, vínculo e assertions');
      await setScreen(c.id + ' — ' + c.title, '<p><b>Azure Test Case ' + item.azureUrl.split('/').pop() + ' / PBI ' + item.pbi + '</b> · Sprint 4 · ' + escape(item.azureUrl) + '</p><p><b>Entrada:</b> ' + escape(manual.inputs) + '</p><p><b>Esperado:</b> ' + escape(manual.expected) + '</p><small>Trecho efetivamente executado em automation/run.mjs. O resultado ainda será verificado.</small><pre>' + escape(c.fn.toString()) + '</pre>');
      await pause(7000);
      mark(c.id + ' — execução real da interface');
    },
    async after(result) {
      if (result.type !== 'UI + HTTP') return;
      mark(result.id + ' — resultado ' + result.status);
      await setScreen(result.id + ' — resultado observado', '<h2>' + escape(result.status.toUpperCase()) + '</h2><p>' + escape(result.title) + '</p><p>As assertions terminaram; código de falha e erro são mantidos se houver divergência.</p><pre>' + escape(JSON.stringify({ durationMs: result.durationMs, http: result.http, browserEvents: result.browserEvents, error: result.error ?? null }, null, 2)) + '</pre>');
      await pause(2500);
    },
    async finish() {
      mark('Relatório completo da execução');
      await page.goto('file://' + path.join(out, 'report.html')); await page.bringToFront(); await pause(11000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pause(9000);
      mark('Fim da gravação contínua');
      recording.kill('SIGINT');
      const code = await recordingExit;
      await writeFile(path.join(out, 'recording.log'), log);
      await writeFile(path.join(out, 'timeline.json'), JSON.stringify(timeline, null, 2));
      await context.close();
      if (code !== 0) throw new Error('FFmpeg encerrou com código ' + code);
      report.continuousVideo = 'demonstracao.mp4'; report.timeline = timeline;
    }
  };
}
