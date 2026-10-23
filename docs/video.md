# Demonstração da automação

O [vídeo publicado](../evidence/demonstracao.mp4) tem aproximadamente 49 segundos e é uma montagem das capturas reais do Playwright da execução 39641753093. Não é uma animação nem uma execução simulada.

1. Abertura: ferramenta/versão, comandos de preparação, commit, dados de demonstração e trecho do teste realmente executado.
2. Nove gravações da interface: login válido/inválido, isolamento do TUTOR, acesso negado, dashboard, ficha/score, cadastro, validação e aplicação com reforço.
3. Encerramento: relatório gerado após as assertions, com 19 resultados individuais e total 19/19.

As gravações brutas e os relatórios estão no ZIP desktop. A montagem apenas normaliza o tamanho e acrescenta legendas com os IDs/nomes reais; não inventa cliques, telas, resultados ou áudio. O relatório HTTP também está em JSON e os logs de configuração/execução estão no GitHub Actions.

## Apresentação oral opcional (não é pendência do vídeo)

Abra o README na develop e diga: “Este é o plano de testes de sistema do ClyvoVet. Mobile, Java e .NET são aplicações independentes.” Abra a matriz e um Test Case no Azure: mostre Summary, Steps e o vínculo Tests com o PBI. Em seguida reproduza o MP4. Ao terminar, abra a execução do Actions e os resultados JSON: “Foram 19 cenários novos aprovados em desktop e tela de celular. Os 176 testes .NET são regressão preexistente. O problema visual e as lacunas técnicas estão registrados, e os casos manuais não executados continuam planejados.”

Para refazer a gravação, execute os comandos do README com QA_DEMO=true. O runner cria os vídeos e o relatório. O script make-video.py monta o MP4 a partir dos arquivos efetivamente gerados nessa execução.
