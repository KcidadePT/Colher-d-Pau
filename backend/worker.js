const OWNER = "KcidadePT";
const REPO = "Colher-d-Pau";
const BRANCH = "main";
const DATA_PATH = "js/data.js";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Admin-Key",
    "Access-Control-Max-Age": "86400"
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...cors()
    }
  });
}

function encodeUtf8Base64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function github(path, env, options = {}) {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "colher-d-pau-admin-worker",
      ...(options.headers || {})
    }
  });
}

async function getFile(path, env) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const res = await github(`/contents/${encoded}?ref=${encodeURIComponent(BRANCH)}`, env);
  if (res.status === 404) return null;
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).message || ""; } catch {}
    throw new Error(`Não foi possível ler ${path}. ${detail}`.trim());
  }
  return await res.json();
}

async function putFile(path, base64, message, env) {
  const current = await getFile(path, env);
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const body = { message, content: base64, branch: BRANCH };
  if (current?.sha) body.sha = current.sha;

  const res = await github(`/contents/${encoded}`, env, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).message || ""; } catch {}
    throw new Error(`Falha ao gravar ${path}. ${detail}`.trim());
  }

  return await res.json();
}

function cleanData(data) {
  const copy = structuredClone(data);
  for (const item of copy.food || []) delete item.imageData;
  for (const item of copy.beverages || []) delete item.imageData;
  for (const item of copy.chefSuggestion?.items || []) delete item.imageData;
  return copy;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Método inválido." }, 405);
    }

    if (!env.GITHUB_TOKEN || !env.ADMIN_KEY) {
      return json({ ok: false, error: "Backend não configurado." }, 500);
    }

    if (request.headers.get("X-Admin-Key") !== env.ADMIN_KEY) {
      return json({ ok: false, error: "Credenciais inválidas." }, 401);
    }

    try {
      const url = new URL(request.url);

      if (url.pathname === "/health") {
        return json({ ok: true, service: "colher-d-pau-admin-api" });
      }

      if (url.pathname !== "/publish") {
        return json({ ok: false, error: "Endpoint inexistente." }, 404);
      }

      const payload = await request.json();
      if (!payload?.data) {
        return json({ ok: false, error: "Dados da carta em falta." }, 400);
      }

      if (payload.image?.path && payload.image?.base64) {
        if (!/^assets\/dishes\/[a-z0-9._-]+\.jpg$/i.test(payload.image.path)) {
          return json({ ok: false, error: "Caminho de imagem inválido." }, 400);
        }

        await putFile(
          payload.image.path,
          payload.image.base64,
          `Atualizar fotografia ${payload.image.path.split("/").pop()}`,
          env
        );
      }

      const clean = cleanData(payload.data);
      const dataFile = `window.MENU_DATA = ${JSON.stringify(clean, null, 2)};\n`;

      await putFile(
        DATA_PATH,
        encodeUtf8Base64(dataFile),
        "Atualizar carta pelo backoffice",
        env
      );

      return json({ ok: true });
    } catch (error) {
      return json({ ok: false, error: error?.message || "Erro interno." }, 500);
    }
  }
};