function page(title, bodyHtml, script = "") {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #111; color: #f2f2f2; }
    .box { max-width: 420px; margin: 10vh auto; padding: 1.5rem; border-radius: 12px; background: #1c1c1e; border: 1px solid #333; }
    h1 { font-size: 1.15rem; margin: 0 0 .75rem; }
    p { margin: 0 0 .75rem; line-height: 1.5; color: #bbb; font-size: .95rem; }
    code { color: #8ab4ff; word-break: break-all; }
    .ok { color: #6dd58c; }
    .err { color: #ff8a80; }
  </style>
</head>
<body>
  <div class="box">${bodyHtml}</div>
  ${script}
</body>
</html>`;
}

function decapHandshakeScript(status, content) {
  const payload = JSON.stringify(content);
  // Decap/Netlify CMS popup protocol
  return `
<script>
(function () {
  var status = ${JSON.stringify(status)};
  var content = ${payload};
  var msg = "authorization:github:" + status + ":" + JSON.stringify(content);

  function notify() {
    if (window.opener) {
      try {
        window.opener.postMessage("authorizing:github", "*");
        window.opener.postMessage(msg, "*");
      } catch (e) {
        document.getElementById("extra").textContent = "postMessage 失败: " + e;
      }
    } else {
      var el = document.getElementById("extra");
      if (el) {
        el.innerHTML = "未检测到打开本页的后台窗口（window.opener 为空）。请关闭本页，回到 <a href=\"/admin/\" style=\"color:#8ab4ff\">/admin/</a> 重新点登录（需允许弹窗）。";
      }
    }
  }

  notify();
  // 再试一次，兼容部分浏览器时机
  setTimeout(notify, 300);

  if (window.opener && status === "success") {
    setTimeout(function () {
      try { window.close(); } catch (e) {}
    }, 800);
  }
})();
</script>`;
}

export async function onRequest(context) {
  const { request, env } = context;
  const client_id = env.GITHUB_CLIENT_ID;
  const client_secret = env.GITHUB_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return new Response(
      page(
        "OAuth 未配置",
        `<h1 class="err">环境变量缺失</h1>
         <p>请在 Cloudflare Pages → Settings → Environment variables 配置：</p>
         <p><code>GITHUB_CLIENT_ID</code><br/><code>GITHUB_CLIENT_SECRET</code></p>
         <p>保存后必须重新部署一次。</p>`
      ),
      { status: 500, headers: { "content-type": "text/html;charset=UTF-8" } }
    );
  }

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response(
        page(
          "缺少 code",
          `<h1 class="err">回调参数不完整</h1>
           <p>URL 中没有 <code>code</code>。请从 <a href="/admin/" style="color:#8ab4ff">/admin/</a> 重新登录。</p>`
        ),
        { status: 400, headers: { "content-type": "text/html;charset=UTF-8" } }
      );
    }

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "user-agent": "shourenkong-decap-oauth",
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
        redirect_uri: `${url.origin}/api/callback`,
      }),
    });

    const result = await tokenRes.json();

    if (result.error || !result.access_token) {
      const detail = result.error_description || result.error || JSON.stringify(result);
      return new Response(
        page(
          "授权失败",
          `<h1 class="err">GitHub 换 token 失败</h1>
           <p>${detail}</p>
           <p>请检查 Client Secret 是否正确、OAuth App 的 Callback 是否为 <code>${url.origin}</code>。</p>`,
          decapHandshakeScript("error", result)
        ),
        { status: 401, headers: { "content-type": "text/html;charset=UTF-8" } }
      );
    }

    return new Response(
      page(
        "登录成功",
        `<h1 class="ok">GitHub 授权成功</h1>
         <p>正在把凭证交回后台…若未自动关闭，请关闭此窗口返回管理页。</p>
         <p id="extra"></p>`,
        decapHandshakeScript("success", {
          token: result.access_token,
          provider: "github",
        })
      ),
      { status: 200, headers: { "content-type": "text/html;charset=UTF-8" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      page(
        "服务器错误",
        `<h1 class="err">回调异常</h1><p>${String(error?.message || error)}</p>`
      ),
      { status: 500, headers: { "content-type": "text/html;charset=UTF-8" } }
    );
  }
}
