import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { primaryButtonClass, useLang } from "@/app/components/SiteLayout";
import { SUBIDA_URLS } from "@/content/site";
import { track } from "@/lib/analytics/posthog";
import { submitToFormspree } from "@/lib/formspree";

const TOPICS = ["podcast", "media", "speaking", "collab", "other"] as const;
type Topic = (typeof TOPICS)[number];

const fieldClass = "mt-2 bg-gray-50 border-0 text-foreground placeholder:text-muted-foreground rounded-xl";

const emptyValues = { name: "", email: "", show: "", message: "", website: "" };

export default function ContactForm({ defaultTopic = "podcast", page }: { defaultTopic?: Topic; page: string }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [topic, setTopic] = useState<Topic>(defaultTopic);
  const [values, setValues] = useState(emptyValues);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (status === "success") setStatus("idle");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Honeypot: bots fill the hidden field, people don't.
    if (values.website.trim()) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    const result = await submitToFormspree({
      _subject: `gregswierad.com: ${t(`form.topics.${topic}`, { lng: "pl" })} (${values.name})`,
      name: values.name,
      email: values.email,
      topic,
      show: values.show,
      message: values.message,
      page,
      lang,
    });

    if (!result.ok) {
      setStatus("error");
      setError(result.message || t(`form.errors.${result.reason}`));
      track("contact_failed", { topic, page, reason: result.reason });
      return;
    }

    track("contact_submitted", { topic, page });
    setStatus("success");
    setValues(emptyValues);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="topic" className="text-foreground">{t("form.fields.topic")}</Label>
        <select
          id="topic"
          name="topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value as Topic)}
          className={`${fieldClass} w-full h-9 px-3 text-sm`}
        >
          {TOPICS.map((value) => (
            <option key={value} value={value}>
              {t(`form.topics.${value}`)}
            </option>
          ))}
        </select>
      </div>

      {topic === "collab" ? (
        <p className="p-4 rounded-2xl bg-teal-50 text-foreground/80">
          {t("contact.collabHint")}{" "}
          <a href={SUBIDA_URLS.home[lang]} className="font-semibold text-teal-700 underline">
            subida.ai →
          </a>
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-foreground">{t("form.fields.name")}</Label>
              <Input id="name" name="name" value={values.name} onChange={handleChange} placeholder={t("form.placeholders.name")} className={fieldClass} required />
            </div>
            <div>
              <Label htmlFor="email" className="text-foreground">{t("form.fields.email")}</Label>
              <Input id="email" name="email" type="email" value={values.email} onChange={handleChange} placeholder={t("form.placeholders.email")} className={fieldClass} required />
            </div>
          </div>
          <div>
            <Label htmlFor="show" className="text-foreground">{t("form.fields.show")}</Label>
            <Input id="show" name="show" value={values.show} onChange={handleChange} placeholder={t("form.placeholders.show")} className={fieldClass} />
          </div>
          <div>
            <Label htmlFor="message" className="text-foreground">{t("form.fields.message")}</Label>
            <Textarea id="message" name="message" value={values.message} onChange={handleChange} placeholder={t("form.placeholders.message")} className={`${fieldClass} min-h-32`} required />
          </div>
          <Input id="website" name="website" value={values.website} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" />
          <Button type="submit" size="lg" className={`w-full ${primaryButtonClass}`} disabled={status === "submitting"}>
            <Mail className="mr-2 h-5 w-5" />
            {status === "submitting" ? t("form.sending") : t("form.submit")}
          </Button>
          {status === "success" && <p className="text-sm text-emerald-600 text-center">{t("contact.success")}</p>}
          {status === "error" && <p className="text-sm text-red-600 text-center">{error}</p>}
          {status !== "success" && <p className="text-sm text-muted-foreground text-center">{t("contact.replyTime")}</p>}
        </>
      )}
    </form>
  );
}
