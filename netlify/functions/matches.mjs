
export default async function handler(request) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8"
  };

  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );
  }

  const token = process.env.FOOTBALL_DATA_TOKEN;

  if (!token) {
    return new Response(
      JSON.stringify({ error: "API token is not configured." }),
      { status: 500, headers }
    );
  }

  try {
    const upstream = await fetch(
      "https://api.football-data.org/v4/matches",
      {
        headers: {
          "X-Auth-Token": token,
          "Accept": "application/json"
        }
      }
    );

    const body = await upstream.text();
    const responseHeaders = {
      "Content-Type":
        upstream.headers.get("content-type") ||
        "application/json; charset=utf-8"
    };

    if (upstream.ok) {
      responseHeaders["Netlify-CDN-Cache-Control"] =
        "public, durable, max-age=60, stale-while-revalidate=120";
    } else {
      responseHeaders["Cache-Control"] = "no-store";
    }

    return new Response(body, {
      status: upstream.status,
      headers: responseHeaders
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Could not connect to football-data.org." }),
      { status: 502, headers }
    );
  }
}

