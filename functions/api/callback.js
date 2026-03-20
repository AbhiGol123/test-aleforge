export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code parameter from GitHub.", { status: 400 });
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();

  if (data.error) {
    return new Response(JSON.stringify(data), { status: 400 });
  }

  // Communicate the token back to Decap CMS
  const script = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Authorizing...</title>
    </head>
    <body>
      <script>
        const receiveMessage = (e) => {
          if (e.data !== "authorizing:github") return;

          window.opener.postMessage(
            'authorization:github:success:' + JSON.stringify({
              token: '${data.access_token}',
              provider: 'github'
            }),
            e.origin
          );
        };

        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      </script>
    </body>
    </html>
  `;

  return new Response(script, {
    headers: { "content-type": "text/html;charset=UTF-8" },
  });
}
