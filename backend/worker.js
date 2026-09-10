const OWNER = "KcidadePT";
const REPO = "Colher-d-Pau";
const BRANCH = "main";
const DATA_PATH = "js/data.js";

function cors(env = {}) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

function json(body, status = 200, extraHeaders = {}, env = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      ...cors(env),
      ...extraHeaders
    }
  });
}

function encodeUtf8Base64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function decodeUtf8Base64(base64) {
  const binary = atob(String(base64 || "").replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function base64UrlEncode(text) {
  return encodeUtf8Base64(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  let b64 = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return decodeUtf8Base64(b64);
}

async function hmacSign(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
  let binary = "";
  for (const byte of sig) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function makeSignedToken(payload, secret) {
  const body = base64UrlEncode(JSON.stringify(payload));
  return body + "." + await hmacSign(body, secret);
}

async function readSignedToken(token, secret) {
  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) return null;
  const expected = await hmacSign(body, secret);
  if (signature !== expected) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(body));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function safeReturnTo(value, env) {
  try {
    const target = new URL(value || "");
    const allowed = new URL(env.ALLOWED_ORIGIN || "https://kcidadept.github.io");
    if (target.origin !== allowed.origin) return allowed.origin + "/Colher-d-Pau/admin.html";
    return target.href;
  } catch {
    return (env.ALLOWED_ORIGIN || "https://kcidadept.github.io") + "/Colher-d-Pau/admin.html";
  }
}

function callbackUrl(request) {
  const url = new URL(request.url);
  return url.origin + "/auth/callback";
}

function authorizedUsers(env) {
  return String(env.GITHUB_ALLOWED_USERS || OWNER).split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
}

async function createState(returnTo, env) {
  return makeSignedToken({ returnTo: safeReturnTo(returnTo, env), exp: Date.now() + 10 * 60 * 1000 }, env.SESSION_SECRET);
}

async function readSession(request, env) {
  const header = request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || !env.SESSION_SECRET) return null;
  const session = await readSignedToken(match[1], env.SESSION_SECRET);
  if (!session?.login || !authorizedUsers(env).includes(String(session.login).toLowerCase())) return null;
  return session;
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
  const res = await github(`/contents/${encoded}?ref=${encodeURIComponent(BRANCH)}&_=${Date.now()}`, env, { cache: "no-store" });
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
  const res = await github(`/contents/${encoded}`, env, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/auth/login") {
      if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET || !env.SESSION_SECRET) return json({ ok: false, error: "OAuth GitHub ainda não configurado." }, 500, {}, env);
      const state = await createState(url.searchParams.get("return_to"), env);
      const authorize = new URL("https://github.com/login/oauth/authorize");
      authorize.searchParams.set("client_id", env.GITHUB_OAUTH_CLIENT_ID);
      authorize.searchParams.set("redirect_uri", callbackUrl(request));
      authorize.searchParams.set("scope", "read:user");
      authorize.searchParams.set("state", state);
      return Response.redirect(authorize.toString(), 302);
    }

    if (request.method === "GET" && url.pathname === "/auth/callback") {
      try {
        const state = await readSignedToken(url.searchParams.get("state"), env.SESSION_SECRET);
        if (!state?.returnTo) throw new Error("Estado de autenticação inválido.");
        const code = url.searchParams.get("code");
        if (!code) throw new Error("O GitHub não devolveu um código de autenticação.");

        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: env.GITHUB_OAUTH_CLIENT_ID, client_secret: env.GITHUB_OAUTH_CLIENT_SECRET, code, redirect_uri: callbackUrl(request) })
        });
        const tokenBody = await tokenRes.json();
        if (!tokenRes.ok || !tokenBody.access_token) throw new Error(tokenBody.error_description || "Falha no login GitHub.");

        const userRes = await fetch("https://api.github.com/user", { headers: { "Accept": "application/vnd.github+json", "Authorization": `Bearer ${tokenBody.access_token}`, "User-Agent": "colher-d-pau-admin-worker" } });
        const user = await userRes.json();
        if (!userRes.ok || !user.login) throw new Error("Não foi possível identificar a conta GitHub.");
        if (!authorizedUsers(env).includes(String(user.login).toLowerCase())) throw new Error("Esta conta GitHub não está autorizada a gerir a carta.");

        const sessionToken = await makeSignedToken({ login: user.login, name: user.name || user.login, avatar: user.avatar_url || "", exp: Date.now() + 8 * 60 * 60 * 1000 }, env.SESSION_SECRET);
        return Response.redirect(state.returnTo + "#auth_token=" + encodeURIComponent(sessionToken), 302);
      } catch (error) {
        const fallback = safeReturnTo(null, env);
        return Response.redirect(fallback + "#auth_error=" + encodeURIComponent(error?.message || "Falha na autenticação."), 302);
      }
    }

    if (request.method === "GET" && url.pathname === "/auth/me") {
      const session = await readSession(request, env);
      if (!session) return json({ ok: false, error: "Sessão inválida ou expirada." }, 401, {}, env);
      return json({ ok: true, user: { login: session.login, name: session.name, avatar: session.avatar } }, 200, {}, env);
    }

    if (request.method === "GET" && url.pathname === "/menu-data") {
      try {
        if (!env.GITHUB_TOKEN) return json({ ok: false, error: "Backend não configurado." }, 500, {}, env);
        const data = await readMenuData(env);
        return json({ ok: true, data, fetchedAt: new Date().toISOString() }, 200, {}, env);
      } catch (error) {
        return json({ ok: false, error: error?.message || "Erro interno." }, 500, {}, env);
      }
    }

    if (request.method !== "POST") return json({ ok: false, error: "Método inválido." }, 405, {}, env);
    if (!env.GITHUB_TOKEN || !env.SESSION_SECRET) return json({ ok: false, error: "Backend não configurado." }, 500, {}, env);

    const session = await readSession(request, env);
    if (!session) return json({ ok: false, error: "Sessão inválida ou expirada." }, 401, {}, env);

    try {
      if (url.pathname !== "/publish") return json({ ok: false, error: "Endpoint inexistente." }, 404, {}, env);
      const payload = await request.json();
      if (!payload?.data) return json({ ok: false, error: "Dados da carta em falta." }, 400, {}, env);

      if (payload.image?.path && payload.image?.base64) {
        if (!/^assets\/dishes\/[a-z0-9._-]+\.jpg$/i.test(payload.image.path)) return json({ ok: false, error: "Caminho de imagem inválido." }, 400, {}, env);
        await putFile(payload.image.path, payload.image.base64, `Atualizar fotografia ${payload.image.path.split("/").pop()}`, env);
      }

      const clean = cleanData(payload.data);
      const dataFile = `window.MENU_DATA = ${JSON.stringify(clean, null, 2)};\n`;
      await putFile(DATA_PATH, encodeUtf8Base64(dataFile), `Atualizar carta pelo backoffice (${session.login})`, env);
      return json({ ok: true }, 200, {}, env);
    } catch (error) {
      return json({ ok: false, error: error?.message || "Erro interno." }, 500, {}, env);
    }
  }
};