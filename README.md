# Subtexto - Gerador de Lower Third

Ferramenta leve para criação e exibição de lower thirds em transmissões.

**Versão atual: 1.1.0-interna** — revisão da versão BNDES para uso profissional.

## Estrutura

- `index.html`: editor principal e controle de lower thirds.
- `painel_controle.html`: painel `obs.desk` para operação rápida com OBS, cenas, fontes, áudio, monitor e envio de LTs.
- `overlay.html`: fonte de navegador transparente para o OBS.
- `js/overlay.js`: renderizador leve usado pelo overlay.
- `assets/`: logo e ícones necessários em tempo de execução.

## Uso com OBS

1. Hospede esta pasta em um endereço acessível pelo computador que executa o OBS.
2. Abra o editor pelo `index.html`.
3. No OBS, adicione uma Fonte de Navegador apontando para `overlay.html` usando a URL copiada pelo editor.
4. Mantenha o editor aberto para enviar os comandos de exibição e atualização, ou use `painel_controle.html` para operação via painel.

Exemplo de URL do overlay:

```text
overlay.html?channel=principal&res=1920x1080
```

O canal usado no editor ou no painel deve ser o mesmo da URL da fonte de navegador do OBS.

O funcionamento depende de internet para acessar o GitHub Pages e de uma conexão local com o OBS WebSocket.

Os testes operacionais de OBS foram realizados em dois computadores. Antes de uma atualização, repetir o fluxo de mostrar, atualizar e ocultar em cada máquina.

## Arquivos necessários

A pasta `assets` deve permanecer junto do projeto, pois o editor e o overlay carregam os arquivos diretamente dela.

## Importação de listas

Além de projetos `.lowerthird.json`, esta versão aceita importação de lista `.txt`.

Formato esperado:

```text
Nome do participante
Cargo do participante
Outro participante
Outro cargo
```

Cada par de linhas vira um participante.

## Política desta versão

Esta é a versão interna com identidade e templates BNDES. A versão pública deve permanecer em uma cópia separada, sem os templates e assets institucionais.

## Licença

Esta versão é distribuída sob licença de uso interno restrito. Veja o arquivo `LICENSE`.

Esta não é uma licença de software livre ou de código aberto. O uso, publicação, redistribuição ou adaptação fora do ambiente autorizado depende de autorização prévia.
