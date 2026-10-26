declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const FBC_COOKIE = "_fbc";
const FBP_COOKIE = "_fbp";
const FBC_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

type FacebookServerEventParams = {
  eventName: string;
  eventId?: string;
  eventSourceUrl?: string;
  userData?: { email?: string };
  customData?: Record<string, unknown>;
};

const readCookie = (name: string) => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : undefined;
};

const writeCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
};

const buildFbcFromFbclid = (fbclid: string) => `fb.1.${Date.now()}.${fbclid}`;

const getFbclidFromLocation = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("fbclid");
};

const ensureFacebookCookieFromClickId = () => {
  const fbclid = getFbclidFromLocation();
  if (!fbclid) return;

  const currentFbc = readCookie(FBC_COOKIE);
  if (currentFbc?.endsWith(fbclid)) return;

  writeCookie(FBC_COOKIE, buildFbcFromFbclid(fbclid), FBC_MAX_AGE_SECONDS);
};

let pixelBootstrapped = false;

const initFacebookPixel = () => {
  if (typeof window === "undefined" || pixelBootstrapped) return;

  const pixelId = import.meta.env.VITE_FB_PIXEL_ID;
  if (!pixelId) return;

  pixelBootstrapped = true;
  const script = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
  `;
  const scriptEl = document.createElement("script");
  scriptEl.innerHTML = script;
  document.head.appendChild(scriptEl);

  if (typeof window.fbq === "function") {
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }
};

export const bootstrapFacebookTracking = () => {
  ensureFacebookCookieFromClickId();
  initFacebookPixel();
};

export const sendFacebookServerEvent = async (params: FacebookServerEventParams) => {
  try {
    const response = await fetch("/api/fb-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: params.eventName,
        eventTime: Math.floor(Date.now() / 1000),
        eventId: params.eventId,
        eventSourceUrl: params.eventSourceUrl ?? (typeof window !== "undefined" ? window.location.href : undefined),
        userData: {
          fbp: readCookie(FBP_COOKIE),
          fbc: readCookie(FBC_COOKIE),
          email: params.userData?.email,
        },
        customData: params.customData,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn("[analytics] Facebook S2S event failed", {
        status: response.status,
        body: text,
        eventName: params.eventName,
      });
    }
  } catch (error) {
    console.warn("[analytics] Facebook S2S event failed", error);
  }
};

export const createFacebookEventId = (prefix: string) => {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${randomId}`;
};
