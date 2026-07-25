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

/**
 * Decap / Netlify CMS popup protocol (must wait for parent message):
 * 1) child → opener: "authorizing:github"
 * 2) parent → child: handshake message
 * 3) child → opener (message.origin): "authorization:github:success:{json}"
 */
function decapHandshakeScript(status, content) {
  const statusJson = JSON.stringify(status);
  const contentJson = JSON.stringify(content);
  return `
<script>
(function () {
  var status = ${statusJson};
  var content = ${contentJson};
  var extra = document.getElementById("extra");

  function setExtra(text) {
    if (extra) extra.textContent = text;
  }

  if (!window.opener) {
    setExtra("没有 opener：请关闭本页，在 /admin/ 重新登录并允许弹窗。");
    return;
  }

  var receiveMessage = function (message) {
    // 只响应来自后台页的握手，再把 token 交回去
    try {
      window.opener.postMessage(
        "authorization:github:" + status + ":" + JSON.stringify(content),
        message.origin
      );
      setExtra("已回传凭证，可关闭本窗口。");
      window.removeEventListener("message", receiveMessage, false);
      setTimeout(function () {
        try { window.close(); } catch (e) {}
      }, 500);
    } catch (e) {
      setExtra("回传失败: " + e);
    }
  };

  window.addEventListener("message", receiveMessage, false);

  try {
    window.opener.postMessage("authorizing:github", "*");
    setExtra("已通知后台，等待握手…");
  } catch (e) {
    setExtra("无法通知后台: " + e);
  }

  // 超时兜底：部分环境 parent 不回消息时直接按 * 再发一次
  setTimeout(function () {
    try {
      window.opener.postMessage(
        "authorization:github:" + status + ":" + JSON.stringify(content),
        "*"
      );
      setExtra("已尝试直接回传凭证。若后台仍未进入，请关闭弹窗后刷新 /admin/。");
    } catch (e) {}
  }, 1500);
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
         <p>请配置 <code>GITHUB_CLIENT_ID</code> 与 <code>GITHUB_CLIENT_SECRET</code> 后重新部署。</p>`
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
           <p>请从 <a href="/admin/" style="color:#8ab4ff">/admin/</a> 重新登录。</p>`
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
          `<h1 class="err">GitHub 换 token 失败</h1><p>${detail}</p>`,
          decapHandshakeScript("error", result)
        ),
        { status: 401, headers: { "content-type": "text/html;charset=UTF-8" } }
      );
    }

    return new Response(
      page(
        "登录成功",
        `<h1 class="ok">GitHub 授权成功</h1>
         <p>正在把凭证交回后台…</p>
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
