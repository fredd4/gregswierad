import type { ReactNode } from "react";
import { useEffect } from "react";
import { Globe, Linkedin, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { LINKEDIN_URL, SUBIDA_URLS, type Lang } from "@/content/site";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "pl", label: "Polski" },
  { value: "es", label: "Español" },
];

export const useLang = (): Lang => {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);
  return (["pl", "en", "es"].includes(lang) ? lang : "en") as Lang;
};

export const primaryButtonClass =
  "bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-full";

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const lang = useLang();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          aria-label={t("common.language")}
        >
          <Globe className="h-4 w-4" />
          <span className="uppercase">{lang}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={lang} onValueChange={(value) => i18n.changeLanguage(value)}>
          {LANGUAGE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SiteLayout({ children, title }: { children: ReactNode; title?: string }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
    if (title) document.title = `${title} | Greg Swierad`;
  }, [lang, i18n.language, title]);

  const navLinks = [
    { href: "/#about", label: t("nav.about") },
    { href: "/#topics", label: t("nav.topics") },
    { href: "/#projects", label: t("nav.projects") },
    { href: "/podcast", label: t("nav.podcast") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/95 backdrop-blur shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-teal-600 whitespace-nowrap sm:text-xl hover:opacity-80 transition-opacity"
          >
            <img src="/images/logo.webp" alt={t("common.logoAlt")} className="h-8 w-8 object-contain" />
            {t("common.brandName")}
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-foreground/70">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-teal-600 transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-3">
            <LanguageSwitcher />
            <Button asChild className={`${primaryButtonClass} px-4 sm:px-5`}>
              <a href="/podcast#contact">
                <Mic className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("nav.invite")}</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-foreground/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/60">
          <p>{t("footer.rights")}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href={SUBIDA_URLS.home[lang]} className="hover:text-teal-600 transition-colors">
              {t("footer.studio")}
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer me"
              className="inline-flex items-center gap-1 hover:text-teal-600 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              {t("footer.linkedin")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
