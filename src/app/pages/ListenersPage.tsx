import { useState } from "react";
import type { FormEvent } from "react";
import { ExternalLink, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import SiteLayout, { primaryButtonClass, useLang } from "@/app/components/SiteLayout";
import { MENTORIST_URL, NARALINGO_URL } from "@/content/site";
import { track } from "@/lib/analytics/posthog";
import { submitToFormspree } from "@/lib/formspree";

const APPS = [
  { id: "naralingo", url: NARALINGO_URL },
  { id: "mentorist", url: MENTORIST_URL },
] as const;
type AppId = (typeof APPS)[number]["id"];

const fieldClass = "mt-2 bg-gray-50 border-0 text-foreground placeholder:text-muted-foreground rounded-xl";

/** `?ep=` (or `?show=`) lets a host's link say which episode a listener came from. */
const episodeFromUrl = () => {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("ep") || params.get("show") || "";
};

export default function ListenersPage() {
  const { t } = useTranslation();
  const lang = useLang();
  const [episode] = useState(episodeFromUrl);
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(episode);
  const [website, setWebsite] = useState("");
  const [apps, setApps] = useState<AppId[]>(["naralingo", "mentorist"]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const toggleApp = (id: AppId) =>
    setApps((prev) => (prev.includes(id) ? prev.filter((app) => app !== id) : [...prev, id]));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (apps.length === 0) {
      setStatus("error");
      setError(t("listeners.pickOne"));
      return;
    }
    if (website.trim()) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    const result = await submitToFormspree({
      _subject: `gregswierad.com: prezent dla słuchacza (${apps.join(" + ")})`,
      email,
      topic: "listener_gift",
      apps: apps.join(", "),
      show,
      episode,
      page: "listeners",
      lang,
    });

    if (!result.ok) {
      setStatus("error");
      setError(result.message || t(`form.errors.${result.reason}`));
      return;
    }

    track("gift_requested", { apps, show, episode });
    setStatus("success");
  };

  return (
    <SiteLayout title={t("listeners.eyebrow")}>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-4 inline-flex items-center gap-2">
          <Gift className="h-4 w-4" />
          {t("listeners.eyebrow")}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{t("listeners.title")}</h1>
        <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-3xl">{t("listeners.intro")}</p>

        <div className="grid md:grid-cols-2 gap-5 mt-10">
          {APPS.map((app) => (
            <article key={app.id} className="p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl">
              <h2 className="text-xl font-bold mb-2">{t(`listeners.offers.${app.id}.title`)}</h2>
              <p className="text-foreground/75 mb-3">{t(`listeners.offers.${app.id}.body`)}</p>
              <a href={app.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-teal-700 font-medium hover:underline">
                <ExternalLink className="h-4 w-4" />
                {t("listeners.visit")}
              </a>
            </article>
          ))}
        </div>

        <div className="mt-10 p-6 sm:p-8 bg-white rounded-3xl shadow-lg max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">{t("listeners.formTitle")}</h2>
          {status === "success" ? (
            <p className="text-lg text-emerald-700">{t("listeners.success")}</p>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <fieldset>
                <legend className="text-sm font-medium text-foreground">{t("listeners.fields.apps")}</legend>
                <div className="mt-2 flex flex-wrap gap-3">
                  {APPS.map((app) => (
                    <label key={app.id} className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={apps.includes(app.id)}
                        onChange={() => toggleApp(app.id)}
                        className="h-4 w-4 accent-teal-600"
                      />
                      {app.id === "naralingo" ? "Naralingo" : "Mentorist"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <Label htmlFor="gift-email" className="text-foreground">{t("listeners.fields.email")}</Label>
                <Input id="gift-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("listeners.placeholders.email")} className={fieldClass} required />
              </div>
              <div>
                <Label htmlFor="gift-show" className="text-foreground">{t("listeners.fields.show")}</Label>
                <Input id="gift-show" value={show} onChange={(e) => setShow(e.target.value)} placeholder={t("listeners.placeholders.show")} className={fieldClass} />
              </div>
              <Input name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />
              <Button type="submit" size="lg" className={`w-full ${primaryButtonClass}`} disabled={status === "submitting"}>
                <Gift className="mr-2 h-5 w-5" />
                {status === "submitting" ? t("form.sending") : t("listeners.submit")}
              </Button>
              {status === "error" && <p className="text-sm text-red-600 text-center">{error}</p>}
              <p className="text-sm text-muted-foreground">{t("listeners.note")}</p>
            </form>
          )}
        </div>

        <a href="/#about" className="inline-block mt-8 font-semibold text-teal-700 hover:underline">
          {t("listeners.aboutLink")}
        </a>
      </section>
    </SiteLayout>
  );
}
