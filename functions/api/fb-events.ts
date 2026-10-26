import { buildUserData, sendFacebookEvent } from "../_utils/facebook";

type Env = {
  FB_ACCESS_TOKEN?: string;
  FB_PIXEL_ID?: string;
  FB_TEST_EVENT_CODE?: string;
};

type FbEventRequest = {
  eventName: string;
  eventTime?: number;
  eventId?: string;
  eventSourceUrl?: string;
  actionSource?: string;
  userData?: {
    email?: string;
    phone?: string;
    fbp?: string;
    fbc?: string;
  };
  customData?: Record<string, unknown>;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const getClientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") ??
  request.headers.get("x-forwarded-for") ??
  undefined;

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  let body: FbEventRequest;
  try {
    body = (await request.json()) as FbEventRequest;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  if (!body.eventName) {
    return jsonResponse({ error: "Missing eventName." }, 400);
  }

  try {
    const userData = await buildUserData({
      email: body.userData?.email,
      phone: body.userData?.phone,
      fbp: body.userData?.fbp,
      fbc: body.userData?.fbc,
      clientIp: getClientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    const result = await sendFacebookEvent({
      env,
      eventName: body.eventName,
      eventTime: body.eventTime ?? Math.floor(Date.now() / 1000),
      eventId: body.eventId,
      eventSourceUrl: body.eventSourceUrl,
      actionSource: body.actionSource,
      userData,
      customData: body.customData,
    });

    return jsonResponse({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send Facebook event.";
    return jsonResponse({ error: message }, 500);
  }
};
