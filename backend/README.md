# Backend seguro do backoffice

O site publico continua em GitHub Pages. O `admin.html` deixa de receber qualquer token do GitHub: publica atraves de um Cloudflare Worker.

## O que fica escondido no Worker
- `GITHUB_TOKEN`: Fine-grained PAT com acesso apenas a `KcidadePT/Colher-d-Pau` e `Contents: Read and write`.
- `ADMIN_KEY`: palavra-passe longa escolhida para o backoffice.
- `ALLOWED_ORIGIN`: `https://kcidadept.github.io`.

## Deploy manual rapido
1. Criar uma conta Cloudflare e um Worker chamado `colher-d-pau-admin-api`.
2. Copiar `backend/worker.js` para o Worker.
3. Em Settings > Variables and Secrets adicionar os tres secrets acima.
4. Fazer Deploy.
5. Copiar o URL `https://...workers.dev`.
6. No `admin.html`, clicar `Configurar publicação`, colar esse URL e introduzir a `ADMIN_KEY`.

O URL fica guardado no `localStorage`; a palavra-passe apenas no `sessionStorage` e desaparece quando a sessao do browser termina.

## Funcionamento
Ao clicar `Aplicar alterações`, o browser envia apenas os dados da carta e, se existir, a imagem otimizada ao Worker. O Worker valida origem e palavra-passe e usa o token GitHub guardado como secret para gravar `assets/dishes/...jpg` e `js/data.js` no branch `main`.
