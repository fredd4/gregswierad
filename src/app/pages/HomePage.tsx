import { ArrowRight, ExternalLink, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/ui/button";
import ContactForm from "@/app/components/ContactForm";
import SiteLayout, { primaryButtonClass, useLang } from "@/app/components/SiteLayout";
import { AppearanceList, TopicGrid } from "@/app/components/Sections";
import { PORTRAITS, PROJECTS, SUBIDA_URLS } from "@/content/site";

export default function HomePage() {
  const { t } = useTranslation();
  const lang = useLang();
  const aboutParagraphs = t("about.paragraphs", { returnObjects: true }) as string[];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-4">{t("hero.eyebrow")}</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{t("hero.title")}</h1>
            <p className="text-lg md:text-xl text-foreground/70 mb-8 leading-relaxed">{t("hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button asChild size="lg" className={`${primaryButtonClass} px-8 py-6 text-lg`}>
                <a href="/podcast">
                  <Mic className="mr-2 h-5 w-5" />
                  {t("hero.ctaPrimary")}
                </a>
              </Button>
              <p className="text-foreground/70">
                {t("hero.ctaSecondaryLead")}{" "}
                <a href={SUBIDA_URLS.home[lang]} className="font-semibold text-teal-700 hover:underline whitespace-nowrap">
                  {t("hero.ctaSecondary")} <ArrowRight className="inline h-4 w-4" />
                </a>
              </p>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl bg-black aspect-[4/5] max-w-sm mx-auto md:max-w-none w-full">
            <img src={PORTRAITS[0].web} alt={t("common.portraitAlt")} className="w-full h-full object-cover object-top" />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("about.title")}</h2>
            <div className="space-y-4 text-lg text-foreground/75 leading-relaxed">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg md:mt-16">
            <img src="/images/gregspeaking.webp" alt={t("common.speakingAlt")} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Topics */}
      <section id="topics" className="scroll-mt-24 bg-gradient-to-br from-blue-50 to-teal-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("topics.title")}</h2>
          <p className="text-lg text-foreground/70 mb-10 max-w-3xl">{t("topics.subtitle")}</p>
          <TopicGrid />
          <a href="/podcast" className="inline-block mt-8 font-semibold text-teal-700 hover:underline">
            {t("topics.more")}
          </a>
        </div>
      </section>

      {/* Appearances */}
      <section id="appearances" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">{t("appearances.title")}</h2>
        <AppearanceList />
      </section>

      {/* Projects */}
      <section id="projects" className="scroll-mt-24 bg-gradient-to-br from-gray-50 to-blue-50/30 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("projects.title")}</h2>
          <p className="text-lg text-foreground/70 mb-10">{t("projects.subtitle")}</p>
          <div className="grid md:grid-cols-2 gap-5">
            {PROJECTS.map((project) => {
              const url = typeof project.url === "string" ? project.url : project.url?.[lang];
              return (
                <article key={project.id} className="p-6 bg-white rounded-3xl shadow-sm border border-foreground/5 flex gap-4">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    {project.logo ? (
                      <img src={project.logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center">
                        {t(`projects.items.${project.id}.name`).charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{t(`projects.items.${project.id}.name`)}</h3>
                    <p className="text-sm font-semibold text-secondary mt-1 mb-2">{t(`projects.items.${project.id}.stat`)}</p>
                    <p className="text-foreground/70">{t(`projects.items.${project.id}.body`)}</p>
                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
                        <ExternalLink className="h-4 w-4" />
                        {t("projects.visit")}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <a href={SUBIDA_URLS.caseStudies[lang]} className="inline-block mt-8 font-semibold text-teal-700 hover:underline">
            {t("projects.allCases")}
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("contact.title")}</h2>
            <p className="text-lg text-foreground/70 leading-relaxed">{t("contact.subtitle")}</p>
          </div>
          <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-lg">
            <ContactForm page="home" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
