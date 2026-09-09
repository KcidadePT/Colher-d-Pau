const OWNER = "KcidadePT";
const REPO = "Colher-d-Pau";
const BRANCH = "main";
const DATA_PATH = "js/data.js";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Admin-Key",
    "Access-Control-Max-Age": "86400"
  };
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      ...cors(),
      ...extraHeaders
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

function decodeUtf8Base64(base64) {
  const binary = atob(String(base64 || "").replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
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
  const res = await github(`/contents/${encoded}?ref=${encodeURIComponent(BRANCH)}&_=${Date.now()}`, env, {
    cache: "no-store"
  });
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

async function readMenuData(env) {
  const file = await getFile(DATA_PATH, env);
  if (!file?.content) throw new Error("Ficheiro de dados da carta indisponível.");
  const text = decodeUtf8Base64(file.content);
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace < firstBrace) throw new Error("Formato de dados da carta inválido.");
  return JSON.parse(text.slice(firstBrace, lastBrace + 1));
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    const url = new URL(request.url);

    // Endpoint público, apenas de leitura. Serve sempre o data.js atual diretamente do GitHub.
    if (request.method === "GET" && url.pathname === "/menu-data") {
      try {
        if (!env.GITHUB_TOKEN) return json({ ok: false, error: "Backend não configurado." }, 500);
        const data = await readMenuData(env);
        return json({ ok: true, data, fetchedAt: new Date().toISOString() });
      } catch (error) {
        return json({ ok: false, error: error?.message || "Erro interno." }, 500);
      }
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