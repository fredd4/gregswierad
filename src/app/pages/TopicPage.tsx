import { ArrowLeft, Check, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/ui/button";
import SiteLayout, { primaryButtonClass, useLang } from "@/app/components/SiteLayout";
import { FaqList, TopicGrid, type FaqItem, type TopicItem } from "@/app/components/Sections";
import { podcastPath, TOPIC_SLUGS, type TopicSlug } from "@/content/routes";
import { HERO_PHOTO } from "@/content/site";

export type TopicPageItem = {
  summary: string;
  why: string[];
  fit: string;
  questions: string[];
  faq: FaqItem[];
};

/**
 * One page per podcast topic. Each one answers, in plain words and with Greg's name in
 * the answer, the question a host asks an assistant before they know who to invite
 * ("who can talk about A/B testing in apps?").
 */
export default function TopicPage({ slug }: { slug: TopicSlug }) {
  const { t } = useTranslation();
  const lang = useLang();
  const index = TOPIC_SLUGS.indexOf(slug);
  const topic = (t("topics.items", { returnObjects: true }) as TopicItem[])[index];
  const page = (t("topicPages.items", { returnObjects: true }) as TopicPageItem[])[index];

  return (
    <SiteLayout>
      <article>
        <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-8">
          <a href={`${podcastPath(lang)}#topics`} className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            {t("topicPages.back")}
          </a>
          <div className="grid md:grid-cols-[1.6fr_1fr] gap-10 items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-4">{t("topicPages.eyebrow")}</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{topic.title}</h1>
              <p className="text-xl text-foreground/80 mb-4">{topic.hook}</p>
              <p className="text-lg text-foreground/70 leading-relaxed">{page.summary}</p>
              <Button asChild size="lg" className={`${primaryButtonClass} px-8 py-6 text-lg mt-8`}>
                <a href={`${podcastPath(lang)}#contact`}>
                  <Mic className="mr-2 h-5 w-5" />
                  {t("topicPages.cta")}
                </a>
              </Button>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-lg bg-black aspect-square max-w-xs w-full mx-auto">
              <img src={HERO_PHOTO} alt={t("common.speakingAlt")} className="w-full h-full object-cover object-top" />
            </div>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-teal-50">
            <h2 className="text-2xl font-bold mb-4">{t("topicPages.coversTitle")}</h2>
            <ul className="space-y-3 text-foreground/80">
              {topic.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <Check className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-sm border border-foreground/5">
            <h2 className="text-2xl font-bold mb-4">{t("topicPages.whyTitle")}</h2>
            <ul className="space-y-3 text-foreground/80">
              {page.why.map((fact) => (
                <li key={fact} className="flex gap-2">
                  <span className="text-teal-600">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-foreground/70">
              <strong className="text-foreground">{t("topicPages.fitTitle")}</strong> {page.fit}
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{t("topicPages.questionsTitle")}</h2>
          <ol className="space-y-3 list-decimal pl-6 text-lg text-foreground/80 marker:text-teal-600 marker:font-semibold max-w-3xl">
            {page.questions.map((question) => (
              <li key={question} className="pl-1">{question}</li>
            ))}
          </ol>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{t("topicPages.faqTitle")}</h2>
          <FaqList items={page.faq} />
        </section>
      </article>

      <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-14 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">{t("topicPages.otherTopics")}</h2>
          <TopicGrid exclude={slug} />
        </div>
      </section>
    </SiteLayout>
  );
}
