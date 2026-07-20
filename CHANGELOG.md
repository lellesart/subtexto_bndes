# Histórico de versões

## 1.1.0-interna — 2026-07-20

Revisão da versão interna com recursos portados da versão pública.

- Adicionado `painel_controle.html` com painel `obs.desk`.
- Integração do painel com OBS WebSocket via `lowerThirdControl`.
- Campo de canal do overlay no painel, com persistência local.
- Monitor do OBS em dois modos: `Leve` e `Nítido`.
- Trava contra chamadas sobrepostas de screenshot do OBS para reduzir carga em computadores antigos.
- Adicionada importação de lista `.txt` no editor.
- Receptor do overlay atualizado para aceitar `show/hide` e `SHOW/HIDE`.
- Compatibilidade com payloads simples contendo apenas `name` e `role`.
- Cache do overlay atualizado para `bndes-obsdesk-20260720`.
- Mantidos os nomes padrão, templates e cores da versão BNDES.
- Adicionada licença de uso interno restrito para a versão institucional.

## 1.0.0-interna — 2026-07-17

Versão congelada para uso profissional nas transmissões.

- Editor de lower thirds com os três templates BNDES.
- Lista inicial com três entradas de Aloizio Mercadante, uma por template.
- Indicação destacada de participante no ar.
- Atualização de nomes pelo mesmo overlay do OBS.
- Integração com OBS WebSocket.
- Exportação de PNG e WebM.
- Fallback de Chroma Key para gravações sem transparência.
- Testes reais realizados em dois computadores com OBS.

Esta versão deve ser preservada. Novos recursos devem ser desenvolvidos em uma cópia separada para a versão pública.
