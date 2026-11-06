import { ArrowRight, ExternalLink, Headphones } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/app/components/SiteLayout";
import { podcastPath, TOPIC_SLUGS, topicPath } from "@/content/routes";
import { APPEARANCES } from "@/content/site";

export type TopicItem = { title: string; hook: string; points: string[] };
export type FaqItem = { q: string; a: string };

export function TopicGrid({ detailed = false, exclude }: { detailed?: boolean; exclude?: string }) {
  const { t } = useTranslation();
  const lang = useLang();
  const topics = (t("topics.items", { returnObjects: true }) as TopicItem[])
    .map((topic, index) => ({ ...topic, index, href: topicPath(lang, TOPIC_SLUGS[index]) }))
    .filter((topic) => TOPIC_SLUGS[topic.index] !== exclude);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {topics.map((topic) => (
        <article key={topic.title} className="p-6 bg-white rounded-3xl shadow-sm border border-foreground/5 flex flex-col">
          <span className="text-sm font-semibold text-teal-600 mb-2">{String(topic.index + 1).padStart(2, "0")}</span>
          <h3 className="text-lg font-bold mb-2 leading-snug">
            <a href={topic.href} className="hover:text-teal-700 transition-colors">
              {topic.title}
            </a>
          </h3>
          <p className="text-foreground/70">{topic.hook}</p>
          {detailed && (
            <ul className="mt-4 space-y-2 text-sm text-foreground/70 list-disc pl-5">
              {topic.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
          <a href={topic.href} className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline">
            {t("topicPages.more")} <ArrowRight className="h-4 w-4" />
          </a>
        </article>
      ))}
    </div>
  );
}

/** Questions and answers shown on the page; the same items go into FAQPage schema (src/content/head.ts). */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-foreground/10 bg-white rounded-3xl shadow-sm border border-foreground/5">
      {items.map((item) => (
        <div key={item.q} className="p-6">
          <h3 className="text-lg font-bold mb-2">{item.q}</h3>
          <p className="text-foreground/75 leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  );
}

export function AppearanceList({ emptyLink = true }: { emptyLink?: boolean }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();

  if (APPEARANCES.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-50 to-pink-50 flex flex-col sm:flex-row sm:items-center gap-3">
        <Headphones className="h-6 w-6 text-secondary flex-shrink-0" />
        <p className="text-foreground/80">
          {t("appearances.empty")}{" "}
          {emptyLink && (
            <a href={podcastPath(lang)} className="font-semibold text-teal-700 hover:underline">
              {t("appearances.emptyCta")}
            </a>
          )}
        </p>
      </div>
    );
  }

  const dateFormat = new Intl.DateTimeFormat(i18n.resolvedLanguage || "en", { year: "numeric", month: "long" });

  return (
    <ul className="divide-y divide-foreground/10 bg-white rounded-3xl shadow-sm border border-foreground/5">
      {APPEARANCES.map((item) => (
        <li key={item.url} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="font-bold">{item.show}</p>
            <p className="text-foreground/70">{item.title}</p>
            <p className="text-sm text-foreground/50">
              {dateFormat.format(new Date(item.date))} · {item.lang.toUpperCase()}
            </p>
          </div>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-600 font-medium hover:underline">
            <ExternalLink className="h-4 w-4" />
            {t("appearances.listen")}
          </a>
        </li>
      ))}
    </ul>
  );
}
