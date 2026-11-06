import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/ui/button";
import SiteLayout, { primaryButtonClass, useLang } from "@/app/components/SiteLayout";
import { homePath, podcastPath } from "@/content/routes";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const lang = useLang();

  return (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-4">404</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("notFound.title")}</h1>
        <p className="text-lg text-foreground/70 mb-8">{t("notFound.body")}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className={`${primaryButtonClass} px-8`}>
            <a href={homePath(lang)}>{t("nav.home")}</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <a href={podcastPath(lang)}>{t("nav.podcast")}</a>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
