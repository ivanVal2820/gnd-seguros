type GraphTokenResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
};

export async function getGraphAppToken() {
  const tenantId = process.env.GRAPH_TENANT_ID!;
  const clientId = process.env.GRAPH_CLIENT_ID!;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET!;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Faltan GRAPH_TENANT_ID / GRAPH_CLIENT_ID / GRAPH_CLIENT_SECRET en env");
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams();
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("grant_type", "client_credentials");
  body.set("scope", "https://graph.microsoft.com/.default");

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph token error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as GraphTokenResponse;
  return data.access_token;
}

export async function graphSendMail(params: {
  fromUpn: string; // user or shared mailbox UPN
  to: string[];
  subject: string;
  html: string;
}) {
  const accessToken = await getGraphAppToken();

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(params.fromUpn)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: params.subject,
          body: { contentType: "HTML", content: params.html },
          toRecipients: params.to.map((email) => ({
            emailAddress: { address: email },
          })),
        },
        saveToSentItems: true,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`sendMail error: ${res.status} ${text}`);
  }
}
