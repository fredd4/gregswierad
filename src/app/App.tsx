import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Trophy, Rocket, TrendingUp, Code, Palette, Target, Sparkles, Mail, ExternalLink, ArrowLeft, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

type View = "home" | "contact";

export default function App() {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null);
  const formspreeId = (import.meta as { env?: { VITE_FORMSPREE_ID?: string } }).env?.VITE_FORMSPREE_ID ?? "";
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    role: "",
    message: "",
    website: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const language = i18n.resolvedLanguage || i18n.language;
    if (language) {
      document.documentElement.lang = language;
    }
  }, [i18n.language, i18n.resolvedLanguage]);

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "pl", label: "Polski" },
    { value: "es", label: "Español" },
  ];
  const activeLanguage = i18n.resolvedLanguage || i18n.language || "en";
  const contactBenefits = t("contact.benefits.items", { returnObjects: true }) as Array<{
    emphasis: string;
    body: string;
  }>;
  const performanceMarketingItems = t("expertise.items.performanceMarketing.details.whatYouGetItems", {
    returnObjects: true,
  }) as string[];
  const productUxApproachItems = t("expertise.items.productUx.details.approachItems", {
    returnObjects: true,
  }) as string[];
  const productUxExamplesItems = t("expertise.items.productUx.details.examplesItems", {
    returnObjects: true,
  }) as string[];
  const aiToolsProofItems = t("expertise.items.aiTools.details.proofItems", { returnObjects: true }) as string[];

  const renderLanguageSwitcher = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          aria-label={t("common.language")}
        >
          <Globe className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={activeLanguage}
          onValueChange={(value) => i18n.changeLanguage(value)}
        >
          {languageOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const handleFormChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (formStatus === "success") {
      setFormStatus("idle");
    }
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("submitting");
    setFormError(null);

    if (!formspreeId) {
      setFormStatus("error");
      setFormError(t("form.errors.notConfigured"));
      return;
    }

    if (formValues.website.trim()) {
      setFormStatus("success");
      return;
    }

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          email: formValues.email,
          organization: formValues.organization,
          role: formValues.role,
          message: formValues.message,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        setFormStatus("error");
        setFormError(errorBody?.error || t("form.errors.generic"));
        return;
      }

      setFormStatus("success");
      setFormValues((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        email: "",
        organization: "",
        role: "",
        message: "",
      }));
    } catch {
      setFormStatus("error");
      setFormError(t("form.errors.network"));
    }
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    onActivate: () => void,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  };

  const achievements = [
    {
      id: "mentorist",
      icon: Rocket,
      logoUrl: "/images/products/mentorist.webp",
      title: t("achievements.items.mentorist.title"),
      shortDescription: t("achievements.items.mentorist.shortDescription"),
      revenue: t("achievements.items.mentorist.revenue"),
      link: "https://www.mentorist.app/",
      fullStory: t("achievements.items.mentorist.fullStory"),
    },
    {
      id: "iqelite",
      icon: Sparkles,
      logoUrl: "/images/products/iqelite.webp",
      title: t("achievements.items.iqelite.title"),
      shortDescription: t("achievements.items.iqelite.shortDescription"),
      revenue: t("achievements.items.iqelite.revenue"),
      link: null,
      fullStory: t("achievements.items.iqelite.fullStory"),
    },
    {
      id: "neurony",
      icon: TrendingUp,
      logoUrl: "/images/products/neurony-szaleja.webp",
      title: t("achievements.items.neurony.title"),
      shortDescription: t("achievements.items.neurony.shortDescription"),
      revenue: t("achievements.items.neurony.revenue"),
      link: "https://neuronyszaleja.pl/",
      fullStory: t("achievements.items.neurony.fullStory"),
    },
    {
      id: "hackyeah",
      icon: Trophy,
      logoUrl: "/images/products/hackyeah.webp",
      title: t("achievements.items.hackyeah.title"),
      shortDescription: t("achievements.items.hackyeah.shortDescription"),
      revenue: t("achievements.items.hackyeah.revenue"),
      link: "https://www.instagram.com/p/DQBkuY0Ddq2/",
      fullStory: t("achievements.items.hackyeah.fullStory"),
    },
  ];

  const expertise = [
    {
      id: "performance-marketing",
      icon: Target,
      title: t("expertise.items.performanceMarketing.title"),
      shortDescription: t("expertise.items.performanceMarketing.shortDescription"),
      imageUrl: "/images/marketing.webp",
      fullDetails: (
        <div className="space-y-4">
          <p>{t("expertise.items.performanceMarketing.details.intro")}</p>
          
          <div>
            <h4 className="font-bold text-lg mb-2">{t("expertise.items.performanceMarketing.details.whatYouGetTitle")}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {performanceMarketingItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          
          <p>{t("expertise.items.performanceMarketing.details.closing")}</p>
        </div>
      ),
    },
    {
      id: "technical",
      icon: Code,
      title: t("expertise.items.fullStack.title"),
      shortDescription: t("expertise.items.fullStack.shortDescription"),
      imageUrl: "/images/development.webp",
      fullDetails: (
        <div className="space-y-4">
          <p>{t("expertise.items.fullStack.details.intro")}</p>
          
          <div>
            <h4 className="font-bold text-lg mb-2">{t("expertise.items.fullStack.details.typicalStackTitle")}</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("expertise.items.fullStack.details.typicalStackFrontend")}</li>
              <li>{t("expertise.items.fullStack.details.typicalStackBackend")}</li>
              <li>{t("expertise.items.fullStack.details.typicalStackInfrastructure")}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-2">{t("expertise.items.fullStack.details.whatThisMeansTitle")}</h4>
            <p>{t("expertise.items.fullStack.details.whatThisMeansBody")}</p>
          </div>
          
          <p>{t("expertise.items.fullStack.details.closing")}</p>
        </div>
      ),
    },
    {
      id: "product-ux",
      icon: Palette,
      title: t("expertise.items.productUx.title"),
      shortDescription: t("expertise.items.productUx.shortDescription"),
      imageUrl: "/images/product.webp",
      fullDetails: (
        <div className="space-y-4">
          <p>{t("expertise.items.productUx.details.intro")}</p>
          
          <div>
            <h4 className="font-bold text-lg mb-2">{t("expertise.items.productUx.details.approachTitle")}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {productUxApproachItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-2">{t("expertise.items.productUx.details.examplesTitle")}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {productUxExamplesItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          
          <p>{t("expertise.items.productUx.details.closing")}</p>
        </div>
      ),
    },
    {
      id: "ai-tools",
      icon: Sparkles,
      title: t("expertise.items.aiTools.title"),
      shortDescription: t("expertise.items.aiTools.shortDescription"),
      imageUrl: "/images/ai.webp",
      fullDetails: (
        <div className="space-y-4">
          <p>{t("expertise.items.aiTools.details.intro")}</p>
          
          <div>
            <h4 className="font-bold text-lg mb-2">{t("expertise.items.aiTools.details.proofTitle")}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {aiToolsProofItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-2">{t("expertise.items.aiTools.details.howItHelpsTitle")}</h4>
            <p>{t("expertise.items.aiTools.details.howItHelpsBody")}</p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-2">{t("expertise.items.aiTools.details.idealUseTitle")}</h4>
            <p>{t("expertise.items.aiTools.details.idealUseBody")}</p>
          </div>
        </div>
      ),
    },
  ];

  if (currentView === "contact") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <button 
              onClick={() => setCurrentView("home")}
              className="flex items-center gap-2 text-lg font-bold text-teal-600 hover:opacity-80 transition-opacity whitespace-nowrap sm:text-xl md:text-2xl"
            >
              <ImageWithFallback 
                src="/images/logo.webp" 
                alt={t("common.logoAlt")}
                className="h-8 w-8 object-contain"
              />
              {t("common.brandName")}
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              {renderLanguageSwitcher()}
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView("home")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("nav.backHome")}
              </Button>
            </div>
          </div>
        </header>

        {/* Contact Content */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Text */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-8">{t("contact.title")}</h1>
              
              <h3 className="text-2xl font-bold mb-6">{t("contact.benefitsTitle")}</h3>
              <div className="space-y-4 text-lg text-foreground/70 leading-relaxed">
                {contactBenefits.map((benefit, index) => (
                  <p key={`${benefit.emphasis}-${index}`}>
                    <strong className="text-foreground">{benefit.emphasis}</strong> {benefit.body}
                  </p>
                ))}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="p-8 bg-white rounded-3xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">{t("contact.formTitle")}</h2>
              <form className="space-y-5" onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-foreground">{t("form.fields.firstName")}</Label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      value={formValues.firstName}
                      onChange={handleFormChange}
                      placeholder={t("form.placeholders.firstName")}
                      className="mt-2 bg-gray-50 border-0 text-foreground placeholder:text-muted-foreground rounded-xl" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-foreground">{t("form.fields.lastName")}</Label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      value={formValues.lastName}
                      onChange={handleFormChange}
                      placeholder={t("form.placeholders.lastName")}
                      className="mt-2 bg-gray-50 border-0 text-foreground placeholder:text-muted-foreground rounded-xl" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground">{t("form.fields.email")}</Label>
                  <Input 
                    id="email" 
                    name="email"
                    value={formValues.email}
                    onChange={handleFormChange}
                    type="email" 
                    placeholder={t("form.placeholders.email")}
                    className="mt-2 bg-gray-50 border-0 text-foreground placeholder:text-muted-foreground rounded-xl" 
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="organization" className="text-foreground">{t("form.fields.organization")}</Label>
                  <Input 
                    id="organization" 
                    name="organization"
                    value={formValues.organization}
                    onChange={handleFormChange}
                    placeholder={t("form.placeholders.organization")}
                    className="mt-2 bg-gray-50 border-0 text-foreground placeholder:text-muted-foreground rounded-xl" 
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-foreground">{t("form.fields.role")}</Label>
                  <Input 
                    id="role" 
                    name="role"
                    value={formValues.role}
                    onChange={handleFormChange}
                    placeholder={t("form.placeholders.role")}
                    className="mt-2 bg-gray-50 border-0 text-foreground placeholder:text-muted-foreground rounded-xl" 
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-foreground">{t("form.fields.message")}</Label>
                  <Textarea 
                    id="message" 
                    name="message"
                    value={formValues.message}
                    onChange={handleFormChange}
                    placeholder={t("form.placeholders.message")}
                    className="mt-2 min-h-32 bg-gray-50 border-0 text-foreground placeholder:text-muted-foreground rounded-xl"
                    required
                  />
                </div>
                <Input
                  id="website"
                  name="website"
                  value={formValues.website}
                  onChange={handleFormChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-full"
                  disabled={formStatus === "submitting"}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  {formStatus === "submitting" ? t("form.sending") : t("form.submit")}
                </Button>
                {formStatus === "success" && (
                  <p className="text-sm text-emerald-600 text-center">
                    {t("contact.success")}
                  </p>
                )}
                {formStatus === "error" && (
                  <p className="text-sm text-red-600 text-center">
                    {formError}
                  </p>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {t("contact.replyTime")}
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center text-muted-foreground">
            <p>{t("footer.rights")}</p>
            <p className="mt-2">{t("footer.domain")}</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-bold text-teal-600 whitespace-nowrap sm:text-xl md:text-2xl">
              <ImageWithFallback 
                src="/images/logo.webp" 
                alt={t("common.logoAlt")}
                className="h-8 w-8 object-contain"
              />
              {t("common.brandName")}
            </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {renderLanguageSwitcher()}
            <Button 
              onClick={() => setCurrentView("contact")}
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-full px-6"
            >
              <Mail className="mr-2 hidden h-4 w-4 sm:inline-flex" />
              {t("nav.bookCall")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                {t("hero.title.before")}{" "}
                <span className="bg-gradient-to-r from-teal-600 via-slate-500 to-orange-400 bg-clip-text text-transparent">
                  {t("hero.title.highlight")}
                </span>{" "}
                {t("hero.title.after")}
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 mb-10 leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <Button 
                onClick={() => setCurrentView("contact")}
                size="lg" 
                className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-full px-10 py-7 text-lg"
              >
                <Mail className="mr-2 h-5 w-5" />
                {t("hero.cta")}
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden flex items-center justify-center">
                <ImageWithFallback 
                  src="/images/hero.webp" 
                  alt={t("common.profileAlt")}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="p-8 md:p-12 bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl shadow-sm">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("about.title")}</h2>
              <div className="space-y-4 text-lg text-foreground/70 leading-relaxed">
                <p>{t("about.paragraphs.0")}</p>
                <p>{t("about.paragraphs.1")}</p>
                <p>{t("about.paragraphs.2")}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="w-32 h-32 bg-teal-600/20 rounded-full flex items-center justify-center">
                <Rocket className="h-16 w-16 text-teal-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Greg - Public Speaking Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("work.title")}</h2>
            <div className="space-y-4 text-lg text-foreground/70 leading-relaxed">
              <p>{t("work.paragraphs.0")}</p>
              <p>{t("work.paragraphs.1")}</p>
              <p>{t("work.paragraphs.2")}</p>
              <p>{t("work.paragraphs.3")}</p>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img 
                src="/images/gregspeaking.webp" 
                alt={t("common.speakingAlt")}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("achievements.title")}</h2>
          <p className="text-lg text-foreground/60 mb-10">
            {t("achievements.subtitle")}
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => {
              const bgColors = [
                'bg-gradient-to-br from-blue-50 to-cyan-50',
                'bg-gradient-to-br from-orange-50 to-pink-50',
                'bg-gradient-to-br from-teal-50 to-green-50',
                'bg-gradient-to-br from-purple-50 to-pink-50'
              ];
              const iconBgColors = ['bg-teal-600', 'bg-secondary', 'bg-teal-600', 'bg-purple-600'];
              
              return (
                <div
                  key={achievement.id}
                  className={`p-8 ${bgColors[index]} rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer group`}
                  onClick={() => setSelectedAchievement(achievement.id)}
                  onKeyDown={(event) =>
                    handleCardKeyDown(event, () =>
                      setSelectedAchievement(achievement.id),
                    )
                  }
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                      {achievement.logoUrl ? (
                        <ImageWithFallback
                          src={achievement.logoUrl}
                          alt={`${achievement.title} logo`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className={`w-14 h-14 ${iconBgColors[index]} rounded-full flex items-center justify-center`}>
                          <achievement.icon className="h-7 w-7 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-teal-600 transition-colors">
                        {achievement.title}
                      </h3>
                      {achievement.revenue && (
                        <p className="text-sm font-semibold text-secondary mb-2">
                          {achievement.revenue}
                        </p>
                      )}
                      <p className="text-foreground/70 mb-3">
                        {achievement.shortDescription}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-teal-600 font-medium group-hover:underline">
                          {t("achievements.readStory")}
                        </span>
                        {achievement.link && (
                          <a 
                            href={achievement.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-foreground/60 hover:text-teal-600 transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {t("achievements.visit")}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="bg-gradient-to-br from-white to-teal-50/30">
        <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("expertise.title")}</h2>
        <p className="text-lg text-foreground/60 mb-12">
          {t("expertise.subtitle")}
        </p>
        <div className="space-y-12">
          {expertise.map((item, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={item.id} 
                className="grid md:grid-cols-2 gap-8 items-center cursor-pointer group"
                onClick={() => setSelectedExpertise(item.id)}
                onKeyDown={(event) =>
                  handleCardKeyDown(event, () =>
                    setSelectedExpertise(item.id),
                  )
                }
                role="button"
                tabIndex={0}
              >
                {/* Text Content */}
                <div className={`${isEven ? 'md:order-1' : 'md:order-2'} space-y-4`}>
                  <h3 className="text-2xl md:text-3xl font-bold group-hover:text-teal-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-lg text-foreground/70 leading-relaxed">
                    {item.shortDescription}
                  </p>
                  <span className="inline-block text-teal-600 font-medium group-hover:underline">
                    {t("expertise.readMore")}
                  </span>
                </div>
                
                {/* Image */}
                <div className={`${isEven ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="aspect-video overflow-hidden flex items-center justify-center">
                    <ImageWithFallback 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="p-12 text-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl shadow-sm">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <Button 
            onClick={() => setCurrentView("contact")}
            size="lg" 
            className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-full px-8"
          >
            <Mail className="mr-2 h-5 w-5" />
            {t("cta.button")}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-foreground/60">
          <p>{t("footer.rights")}</p>
          <p className="mt-2">{t("footer.domain")}</p>
        </div>
      </footer>

      {/* Achievement Modals */}
      {achievements.map((achievement) => (
        <Dialog 
          key={achievement.id}
          open={selectedAchievement === achievement.id}
          onOpenChange={(open) => !open && setSelectedAchievement(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-3xl border-0 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 flex items-center justify-center">
                  {achievement.logoUrl ? (
                    <ImageWithFallback
                      src={achievement.logoUrl}
                      alt={`${achievement.title} logo`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                      <achievement.icon className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <DialogTitle className="text-2xl">{achievement.title}</DialogTitle>
              </div>
              {achievement.revenue && (
                <p className="text-sm font-semibold text-secondary">
                  {achievement.revenue}
                </p>
              )}
            </DialogHeader>
            <DialogDescription className="text-base leading-relaxed whitespace-pre-line text-foreground">
              {achievement.fullStory}
            </DialogDescription>
            {achievement.link && (
              <div className="mt-4">
                <a 
                  href={achievement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-teal-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("achievements.visitWebsite")}
                </a>
              </div>
            )}
          </DialogContent>
        </Dialog>
      ))}

      {/* Expertise Modals */}
      {expertise.map((item) => (
        <Dialog 
          key={item.id}
          open={selectedExpertise === item.id}
          onOpenChange={(open) => !open && setSelectedExpertise(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-3xl border-0 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-2xl">{item.title}</DialogTitle>
              </div>
            </DialogHeader>
            <DialogDescription className="text-base leading-relaxed text-foreground">
              {item.fullDetails}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}