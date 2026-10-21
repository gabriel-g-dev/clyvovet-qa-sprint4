"""Monta uma demonstração com gravações REAIS do Playwright, sem simular ações."""
from pathlib import Path
import json
import subprocess
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'artifacts/desktop').resolve()
report = json.loads((root / 'results.json').read_text())
assert report['passed'] == report['total'] and report['failed'] == 0
segments = [(report['configurationVideo'], 'Configuracao real: ferramenta, dados, comandos e codigo utilizado')]
segments += [(r['video'], r['id'] + ' | ' + r['title'] + ' | ' + r['status'].upper()) for r in report['results'] if r.get('video')]
segments += [(report['summaryVideo'], 'Resultados reais: ' + str(report['passed']) + '/' + str(report['total']) + ' cenarios aprovados')]
work = root / 'video-build'
work.mkdir(exist_ok=True)
outputs = []
for i, (video, title) in enumerate(segments):
    label = work / ('label-' + str(i) + '.txt')
    label.write_text(title)
    output = work / ('segment-' + str(i) + '.mp4')
    filters = 'scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:980:(ow-iw)/2:0:color=0x102e2a,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile=' + str(label) + ':fontcolor=white:fontsize=23:x=24:y=932'
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(root / video), '-vf', filters, '-r', '24', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '25', '-pix_fmt', 'yuv420p', str(output)], check=True)
    outputs.append(output)
concat = work / 'segments.txt'
concat.write_text('\n'.join("file '" + str(p) + "'" for p in outputs))
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(concat), '-c', 'copy', '-movflags', '+faststart', str(root / 'demonstracao.mp4')], check=True)
print('Video gerado de capturas reais:', root / 'demonstracao.mp4')
