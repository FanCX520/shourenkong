export async function onRequest(context) {
  const { request, env } = context;
  const client_id = env.GITHUB_CLIENT_ID;

  if (!client_id) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family:system-ui;padding:2rem">
        <h1>OAuth 未配置</h1>
        <p>Cloudflare 环境变量缺少 <code>GITHUB_CLIENT_ID</code>。请在 Pages → Settings → Environment variables 中添加后重新部署。</p>
      </body></html>`,
      { status: 500, headers: { "content-type": "text/html;charset=UTF-8" } }
    );
  }

  try {
    const url = new URL(request.url);
    const redirectUrl = new URL("https://github.com/login/oauth/authorize");
    redirectUrl.searchParams.set("client_id", client_id);
    redirectUrl.searchParams.set("redirect_uri", `${url.origin}/api/callback`);
    redirectUrl.searchParams.set("scope", "repo user");
    redirectUrl.searchParams.set(
      "state",
      [...crypto.getRandomValues(new Uint8Array(16))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
    return Response.redirect(redirectUrl.href, 302);
  } catch (error) {
    console.error(error);
    return new Response(String(error?.message || error), { status: 500 });
  }
}
