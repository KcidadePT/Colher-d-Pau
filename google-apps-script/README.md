# Colher d'Pau - Google Apps Script

Esta pasta contém a versão de publicação do site através de um Google Apps Script Web App.

## Ficheiros

- `Code.gs` - ponto de entrada (`doGet`) da Web App.
- `Index.html` - página anfitriã responsiva.
- `appsscript.json` - manifesto do projeto Apps Script.

## Publicar

1. Abrir https://script.google.com/home e criar um novo projeto.
2. Substituir o conteúdo de `Code.gs` pelo deste diretório.
3. Criar um ficheiro HTML chamado `Index` e copiar o conteúdo de `Index.html`.
4. Em Project Settings, ativar a visualização do ficheiro de manifesto `appsscript.json`, se necessário, e copiar a configuração deste diretório.
5. Escolher `Deploy` > `New deployment` > `Web app`.
6. Executar como o utilizador que fez o deploy.
7. Definir o acesso para qualquer pessoa, caso o site deva ser público.
8. Autorizar o projeto e guardar o URL terminado em `/exec`.

O endereço apresentado dentro da Web App aponta para a versão pública atual do site no GitHub Pages, permitindo continuar a gerir o frontend e a carta a partir do mesmo repositório.

## Rollback

Antes desta adaptação foi criada a branch:

`rollback-before-google-apps-script-2026-09-11`

Ela aponta para o commit:

`60195340d22366a761d68049fff7a189291ede10`
