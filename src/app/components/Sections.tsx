import { ExternalLink, Headphones } from "lucide-react";
import { useTranslation } from "react-i18next";
import { APPEARANCES } from "@/content/site";

export type TopicItem = { title: string; hook: string; points: string[] };

export function TopicGrid({ detailed = false }: { detailed?: boolean }) {
  const { t } = useTranslation();
  const topics = t("topics.items", { returnObjects: true }) as TopicItem[];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {topics.map((topic, index) => (
        <article key={topic.title} className="p-6 bg-white rounded-3xl shadow-sm border border-foreground/5 flex flex-col">
          <span className="text-sm font-semibold text-teal-600 mb-2">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="text-lg font-bold mb-2 leading-snug">{topic.title}</h3>
          <p className="text-foreground/70">{topic.hook}</p>
          {detailed && (
            <ul className="mt-4 space-y-2 text-sm text-foreground/70 list-disc pl-5">
              {topic.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}

export function AppearanceList({ emptyLink = true }: { emptyLink?: boolean }) {
  const { t, i18n } = useTranslation();

  if (APPEARANCES.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-50 to-pink-50 flex flex-col sm:flex-row sm:items-center gap-3">
        <Headphones className="h-6 w-6 text-secondary flex-shrink-0" />
        <p className="text-foreground/80">
          {t("appearances.empty")}{" "}
          {emptyLink && (
            <a href="/podcast" className="font-semibold text-teal-700 hover:underline">
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
