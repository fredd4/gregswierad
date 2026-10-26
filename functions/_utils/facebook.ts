type FacebookEnv = {
  FB_ACCESS_TOKEN?: string;
  FB_PIXEL_ID?: string;
  FB_TEST_EVENT_CODE?: string;
};

type UserData = {
  em?: string;
  ph?: string;
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
};

const textEncoder = new TextEncoder();

const sha256 = async (value: string) => {
  const data = textEncoder.encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const normalizeHash = async (value?: string) => (value ? sha256(value) : undefined);

export const buildUserData = async (input: {
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
}): Promise<UserData> => {
  const [em, ph] = await Promise.all([normalizeHash(input.email), normalizeHash(input.phone)]);

  return {
    ...(em ? { em } : {}),
    ...(ph ? { ph } : {}),
    ...(input.fbp ? { fbp: input.fbp } : {}),
    ...(input.fbc ? { fbc: input.fbc } : {}),
    ...(input.clientIp ? { client_ip_address: input.clientIp } : {}),
    ...(input.userAgent ? { client_user_agent: input.userAgent } : {}),
  };
};

export const sendFacebookEvent = async (params: {
  env: FacebookEnv;
  eventName: string;
  eventTime: number;
  eventId?: string;
  eventSourceUrl?: string;
  actionSource?: string;
  userData: UserData;
  customData?: Record<string, unknown>;
}) => {
  const { env, eventName, eventTime, eventId, eventSourceUrl, actionSource, userData, customData } =
    params;

  if (!env.FB_ACCESS_TOKEN || !env.FB_PIXEL_ID) {
    throw new Error("Facebook CAPI credentials are not configured.");
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        ...(eventId ? { event_id: eventId } : {}),
        ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
        action_source: actionSource ?? "website",
        user_data: userData,
        ...(customData ? { custom_data: customData } : {}),
      },
    ],
    ...(env.FB_TEST_EVENT_CODE ? { test_event_code: env.FB_TEST_EVENT_CODE } : {}),
  };

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${env.FB_PIXEL_ID}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, access_token: env.FB_ACCESS_TOKEN }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Facebook CAPI error: ${response.status} ${text}`);
  }

  return response.json();
};
