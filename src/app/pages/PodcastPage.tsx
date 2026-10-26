import { useState } from "react";
import { Check, Copy, Download, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContactForm from "@/app/components/ContactForm";
import SiteLayout, { useLang } from "@/app/components/SiteLayout";
import { AppearanceList, TopicGrid } from "@/app/components/Sections";
import { LANGS, LISTENERS_PATHS, PORTRAITS, type Lang } from "@/content/site";
import { track } from "@/lib/analytics/posthog";

function CopyButton({ text, onCopied }: { text: string; onCopied?: () => void }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.();
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); the text stays selectable.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-full border border-teal-600/30 px-3 py-1 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? t("common.copied") : t("common.copy")}
    </button>
  );
}

export default function PodcastPage() {
  const { t } = useTranslation();
  const lang = useLang();
  const [bioLang, setBioLang] = useState<Lang | null>(null);
  const activeBioLang = bioLang ?? lang;

  const facts = t("podcast.facts.items", { returnObjects: true }) as string[];
  const questions = t("podcast.questions.items", { returnObjects: true }) as string[];
  const practical = t("podcast.practical.items", { returnObjects: true }) as Array<{ label: string; value: string }>;
  const giftUrl = `gregswierad.com${LISTENERS_PATHS[lang]}`;

  const bios = (["short", "long"] as const).map((variant) => ({
    variant,
    label: t(`podcast.bio.${variant}Label`),
    text: t(`podcast.bio.${variant}`, { lng: activeBioLang }),
  }));

  const photos = [
    ...PORTRAITS.map((portrait, index) => ({ ...portrait, label: `${t("common.portraitAlt")} ${index + 1}` })),
    { web: "/images/gregspeaking.webp", download: "/images/gregspeaking.webp", label: t("podcast.photos.speaking") },
  ];

  return (
    <SiteLayout title={t("podcast.title")}>
      {/* Intro */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-4">{t("podcast.eyebrow")}</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{t("podcast.title")}</h1>
            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">{t("podcast.intro")}</p>
          </div>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-teal-50">
            <h2 className="text-xl font-bold mb-4">{t("podcast.facts.title")}</h2>
            <ul className="space-y-2 text-foreground/80">
              {facts.map((fact) => (
                <li key={fact} className="flex gap-2">
                  <span className="text-teal-600">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section id="bio" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t("podcast.bio.title")}</h2>
            <p className="text-foreground/60">{t("podcast.bio.langNote")}</p>
          </div>
          <div className="inline-flex rounded-full bg-gray-100 p-1 self-start">
            {LANGS.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setBioLang(code)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold uppercase transition-colors ${
                  activeBioLang === code ? "bg-white shadow text-teal-700" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-5">
          {bios.map((bio) => (
            <div key={bio.variant} className="p-6 bg-white rounded-3xl shadow-sm border border-foreground/5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-bold">{bio.label}</h3>
                <CopyButton text={bio.text} onCopied={() => track("bio_copied", { variant: bio.variant, bio_lang: activeBioLang })} />
              </div>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line" lang={activeBioLang}>
                {bio.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Photos */}
      <section id="photos" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">{t("podcast.photos.title")}</h2>
        <p className="text-foreground/60 mb-6">{t("podcast.photos.note")}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <figure key={photo.web} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-foreground/5">
              <div className="aspect-[4/5] bg-black">
                <img src={photo.web} alt={photo.label} loading="lazy" className="w-full h-full object-cover object-top" />
              </div>
              <figcaption className="p-3">
                <a
                  href={photo.download}
                  download
                  onClick={() => track("photo_downloaded", { photo: index + 1 })}
                  className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline"
                >
                  <Download className="h-4 w-4" />
                  {t("podcast.photos.download")}
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section id="topics" className="scroll-mt-24 bg-gradient-to-br from-blue-50 to-teal-50 py-14 mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-8">{t("podcast.topicsTitle")}</h2>
          <TopicGrid detailed />
        </div>
      </section>

      {/* Questions + practical */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-10">
          <div>
            <h2 className="text-3xl font-bold mb-6">{t("podcast.questions.title")}</h2>
            <ol className="space-y-3 list-decimal pl-6 text-foreground/80 marker:text-teal-600 marker:font-semibold">
              {questions.map((question) => (
                <li key={question} className="pl-1">{question}</li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">{t("podcast.practical.title")}</h2>
            <dl className="space-y-4">
              {practical.map((item) => (
                <div key={item.label}>
                  <dt className="text-sm font-semibold text-foreground/50 uppercase tracking-wide">{item.label}</dt>
                  <dd className="text-foreground/85">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Listener gift */}
      <section id="gift" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-orange-50 to-pink-50 flex flex-col md:flex-row gap-6 md:items-center">
          <Gift className="h-10 w-10 text-secondary flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{t("podcast.gift.title")}</h2>
            <p className="text-foreground/75 mb-4">{t("podcast.gift.body")}</p>
            <div className="flex flex-wrap items-center gap-3">
              <a href={LISTENERS_PATHS[lang]} className="text-lg font-bold text-teal-700 break-all hover:underline">
                {giftUrl}
              </a>
              <CopyButton text={giftUrl} onCopied={() => track("gift_link_copied", { gift_lang: lang })} />
            </div>
            <p className="text-sm text-foreground/55 mt-3">{t("podcast.gift.linkNote")}</p>
          </div>
        </div>
      </section>

      {/* Appearances */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-3xl font-bold mb-6">{t("podcast.appearancesTitle")}</h2>
        <AppearanceList emptyLink={false} />
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("podcast.contactTitle")}</h2>
            <p className="text-lg text-foreground/70 leading-relaxed">{t("podcast.contactBody")}</p>
          </div>
          <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-lg">
            <ContactForm page="podcast" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
