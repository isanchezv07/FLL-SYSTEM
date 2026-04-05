const ALL = async ({ request }) => {
  const url = new URL(request.url);
  const backendURL = `http://127.0.0.1:3000${url.pathname}${url.search}`;
  try {
    const body = request.method !== "GET" && request.method !== "HEAD" ? await request.text() : void 0;
    const forwardHeaders = {
      "Content-Type": "application/json"
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) forwardHeaders["Authorization"] = authHeader;
    const response = await fetch(backendURL, {
      method: request.method,
      headers: forwardHeaders,
      body
    });
    const data = await response.text();
    const contentType = response.headers.get("Content-Type") || "application/json";
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  } catch (error) {
    console.error("API proxy error:", error);
    return new Response(JSON.stringify({ error: "API service unavailable" }), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
