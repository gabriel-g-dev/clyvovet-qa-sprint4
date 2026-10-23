"""Confere a gravação contínua; não concatena, acelera ou remove trechos."""
from pathlib import Path
import json
import subprocess
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'artifacts/desktop').resolve()
report = json.loads((root / 'results.json').read_text())
assert report.get('continuousVideo') == 'demonstracao.mp4', 'Gravação contínua ausente'
assert not report.get('recordingError'), report.get('recordingError')
ffprobe = subprocess.check_output(['node', '--input-type=module', '-e', "import probe from 'ffprobe-static'; process.stdout.write(probe.path)"]).decode()
probe = json.loads(subprocess.check_output([
    ffprobe, '-v', 'error', '-show_format', '-show_streams', '-of', 'json',
    str(root / 'demonstracao.mp4')
]))
video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
assert video['codec_name'] == 'h264' and video['pix_fmt'] == 'yuv420p'
assert video['width'] == 1600 and video['height'] == 1000
duration = float(probe['format']['duration'])
assert 180 <= duration <= 360, f'Duração fora da faixa de demonstração: {duration}s'
metadata = {'durationSeconds': duration, 'width': video['width'], 'height': video['height'],
            'codec': video['codec_name'], 'continuous': True, 'audio': False,
            'passed': report['passed'], 'failed': report['failed'], 'total': report['total']}
(root / 'video-metadata.json').write_text(json.dumps(metadata, indent=2))
print(json.dumps(metadata))
