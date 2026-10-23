# Evidências reais

Execução principal: [39641753093](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/actions/runs/39641753093) · branch develop · commit de QA d1f4d1f79956101c0729c3388e16647d2a5b9022 · aplicação Java c686580b6ae21c0e828a9057f8d5a5b53c94e254.

| Artefato | Conteúdo |
|---|---|
| [demonstracao.mp4](demonstracao.mp4) | Vídeo único com configuração, nove execuções reais da interface e relatório final |
| [desktop.zip](desktop.zip) | report.html, results.json, nove capturas, vídeos brutos, logs e MP4; extrair tudo e abrir report.html |
| [mobile.zip](mobile.zip) | Relatório, capturas e vídeos da interface Java em viewport 390 × 844 |
| [regressao-dotnet.zip](regressao-dotnet.zip) | TRX originais: 131 unitários e 45 de integração aprovados |
| [desktop-results.json](desktop-results.json) / [mobile-results.json](mobile-results.json) | Resultados por cenário, durações, status HTTP e eventos de console |
| [desktop-CT15.png](desktop-CT15.png) | Dose aplicada, próximo reforço e score 100 |
| [mobile-CT06.png](mobile-CT06.png) | Score do Rex e evidência do overflow do cabeçalho |

São 19 cenários distintos, executados em dois tamanhos: **38 execuções**, não 38 cenários. Nenhum dos 176 testes preexistentes .NET foi somado aos 19 novos.

A primeira execução (39639520637) teve 17/19 aprovados: CT15/CT18 usaram o nome de campo de entrada na assertion de saída. A correção passou a conferir data, conforme VacinaResponseDTO, sem mudar o sistema. A execução 39640251920 aprovou 19/19 em ambos os tamanhos; a execução principal acima repetiu os resultados com a gravação completa.

O console registrou o 403 esperado de CT04, sem erros JavaScript, 404 de recursos estáticos ou 5xx. A inspeção visual encontrou QA-VIS01, documentado separadamente. Os arquivos não contêm JWTs ou chaves de produção. As senhas visíveis são somente as públicas do seed de demonstração.
