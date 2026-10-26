import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { CheckCircle2, XCircle, Instagram, Mail } from "lucide-react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import { bootstrapFacebookTracking, createFacebookEventId, sendFacebookServerEvent } from "@/lib/analytics/facebook";

const IG_URL = "https://www.instagram.com/gregswierad/";

const STATS = [
  {
    value: "1 000",
    desc: "książek sprzedanych w pierwszym miesiącu reklam",
    client: "Paulina Sapoń, Neurony szaleją",
  },
  {
    value: "500",
    desc: "książek sprzedanych w przedsprzedaży",
    client: "Kamil, Silne dziecko",
  },
  {
    value: "€400 000+",
    desc: "własnego budżetu reklamowego na Meta Ads przez 7 lat",
    client: "Mentorist (własny startup)",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Sprawdzamy, czy Twój produkt kwalifikuje się",
    desc: "Krótka rozmowa — 30 minut. Patrzę na Twój produkt, stronę i obecną sprzedaż. Mówię szczerze, czy widzę potencjał na skalowanie przez Meta Ads.",
  },
  {
    n: "02",
    title: "Buduję kampanię i tworzę kreacje",
    desc: "Przejmuję konto reklamowe, tworzę kreacje (z AI — kilkanaście wariantów tygodniowo), ustawiam analitykę, optymalizuję kampanie. Ty się nie musisz tym zajmować.",
  },
  {
    n: "03",
    title: "Płacisz tylko procent od sprzedaży, którą przyniosę",
    desc: "Bez stałych opłat. Bez faktur co miesiąc. Mój zarobek jest bezpośrednio związany z Twoim wynikiem. Mamy ten sam cel.",
  },
];

const YES_ITEMS = [
  "Masz gotowy produkt (cyfrowy lub fizyczny) z ceną minimum 97 PLN",
  "Masz działający sklep lub landing page sprzedażowy",
  "Masz już pierwsze sprzedaże — organiczne lub z reklam",
  "Masz 1 000–2 000 PLN miesięcznie na budżet reklamowy",
  "Chcesz partnera, który razem z Tobą buduje sprzedaż — nie agencji, której płacisz za \"prowadzenie konta\"",
  "Wolisz tworzyć kolejne produkty niż zajmować się marketingiem",
];

const NO_ITEMS = [
  "Produkt jeszcze nie istnieje lub jest w fazie \"wkrótce\"",
  "Produkt nie ma realnej, oryginalnej wartości — reklamy tego nie naprawią",
  "Budżet reklamowy poniżej 1 000 PLN miesięcznie",
];

const FAQ_ITEMS = [
  {
    q: "Ile wynosi Twój procent od sprzedaży?",
    a: "Ustalamy to indywidualnie — zależy od produktu, marży i skali. Typowo to 15–25% od sprzedaży wygenerowanej przez moje kampanie. Wszystko transparentnie, z dostępem do danych.",
  },
  {
    q: "Co jeśli kampania nie zadziała?",
    a: "Nie zarobię nic. Dlatego przed każdą współpracą sprawdzam, czy widzę realny potencjał — i mówię szczerze, jeśli go nie widzę. Nie przyjmuję każdego klienta.",
  },
  {
    q: "Ile muszę mieć na reklamy?",
    a: "Minimum 1 000–2 000 PLN miesięcznie na sam budżet reklamowy. To moje minimum, żeby zebrać sensowne dane i zoptymalizować kampanię. Przy mniejszym budżecie nie jestem w stanie dać Ci rzetelnych wyników.",
  },
  {
    q: "Jak szybko zobaczę wyniki?",
    a: "Pierwsze dane mam po 7–14 dniach. Pełna optymalizacja kampanii trwa 30–60 dni. Pomogłem sprzedać 1 000 książek w pierwszym miesiącu — ale każdy produkt i rynek jest inny.",
  },
];

const scrollToContact = () => {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function OfferPage() {
  const formspreeId =
    (import.meta as { env?: { VITE_FORMSPREE_ID?: string } }).env?.VITE_FORMSPREE_ID ?? "";

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    message: "",
    honeypot: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Prowadzę Twój marketing na Meta Ads | Greg Swierad";

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      "Prowadzę Twój marketing na Meta Ads i płacisz mi tylko procent od sprzedaży, którą przyniosę. Zero retainerów. Zero faktur co miesiąc.",
    );

    bootstrapFacebookTracking();

    const eventId = createFacebookEventId("offer-view");
    if (typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", {}, { eventID: eventId });
    }
    sendFacebookServerEvent({
      eventName: "ViewContent",
      eventId,
      customData: { source: "offer-page" },
    });
  }, []);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (formStatus === "success") setFormStatus("idle");
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");
    setFormError(null);

    if (formValues.honeypot.trim()) {
      setFormStatus("success");
      return;
    }

    if (!formspreeId) {
      setFormStatus("error");
      setFormError("Formularz nie jest jeszcze skonfigurowany. Napisz bezpośrednio na greg@taulab.com");
      return;
    }

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "offer-landing",
          name: formValues.name,
          email: formValues.email,
          message: formValues.message,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        setFormStatus("error");
        setFormError(errorBody?.error ?? "Coś poszło nie tak. Spróbuj ponownie.");
        return;
      }

      const eventId = createFacebookEventId("offer-lead-form");
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {}, { eventID: eventId });
      }
      await sendFacebookServerEvent({
        eventName: "Lead",
        eventId,
        userData: { email: formValues.email },
        customData: { source: "offer-form" },
      });

      setFormStatus("success");
      setFormValues({ name: "", email: "", message: "", honeypot: "" });
    } catch {
      setFormStatus("error");
      setFormError("Błąd sieci. Spróbuj ponownie.");
    }
  };

  const handleIgClick = () => {
    const eventId = createFacebookEventId("offer-lead-ig");
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", {}, { eventID: eventId });
    }
    sendFacebookServerEvent({
      eventName: "Lead",
      eventId,
      customData: { source: "offer-ig-cta" },
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-teal-50/20 overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700">
              Meta Ads · Revenue Share
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 md:text-5xl">
              Prowadzę Twój marketing na Meta&nbsp;Ads.{" "}
              <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                Płacisz mi tylko procent od sprzedaży, którą przyniosę.
              </span>
            </h1>
            <p className="text-xl leading-relaxed text-gray-500">
              Zero retainerów. Zero faktur co miesiąc. Ja zarabiam tylko wtedy, kiedy Ty zarabiasz.
            </p>
            <Button
              size="lg"
              onClick={scrollToContact}
              className="rounded-full bg-teal-600 px-10 text-base font-bold text-white hover:bg-teal-700"
            >
              <Mail className="mr-2 h-5 w-5" />
              Napisz do mnie →
            </Button>
          </div>

          <div className="flex items-center justify-center">
            <div className="aspect-square w-full max-w-sm overflow-hidden rounded-3xl">
              <ImageWithFallback
                src="/images/hero.webp"
                alt="Greg Swierad"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="border-y border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Wyniki, nie obietnice
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.value}
                className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
              >
                <p className="whitespace-nowrap text-4xl font-extrabold tracking-tight text-teal-600 md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-4 text-base leading-relaxed text-gray-600">{stat.desc}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {stat.client}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-14 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Jak wygląda współpraca
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="space-y-4 border-t-2 border-teal-500 pt-6">
              <span className="text-5xl font-extrabold text-gray-100">{step.n}</span>
              <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="leading-relaxed text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Qualification ── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-14 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Ten model jest dla Ciebie, jeśli
          </h2>
          <div className="grid gap-6 md:grid-cols-2">

            {/* TAK */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-4 py-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Pasuje</span>
              </div>
              <div className="space-y-4">
                {YES_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <p className="leading-relaxed text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* NIE */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5">
                <XCircle className="h-4 w-4 text-rose-500" />
                <span className="text-sm font-semibold text-rose-600">Nie pasuje</span>
              </div>
              <div className="space-y-4">
                {NO_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-400" />
                    <p className="leading-relaxed text-gray-500">{item}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── About Greg ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Kim jestem</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-600">
              <p>
                Przez 7 lat budowałem własne startupy — głównie Mentoristę, aplikację do wdrażania
                wiedzy z książek. W tym czasie wydałem ponad €400 000 własnych pieniędzy na reklamy
                Meta. Nauczyłem się na własnej skórze, co działa — i co tylko wygląda dobrze w
                prezentacji agencji.
              </p>
              <p>
                Dziś pomagam founderom i twórcom, którzy mają świetny produkt, ale nie chcą spędzać
                kolejnego roku na ogarnianiu marketingu. Działam wyłącznie na revenue share — bo
                tylko tak mam pewność, że robimy to naprawdę dobrze.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <ImageWithFallback
                src="/images/gregspeaking.webp"
                alt="Greg Swierad"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Najczęstsze pytania
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                className="rounded-xl border border-gray-200 bg-white px-6"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-gray-900 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base leading-relaxed text-gray-600">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Contact / Final CTA ── */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2">

          {/* Left — copy */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Sprawdźmy, czy pasujemy do siebie
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              Napisz do mnie — odpowiem w ciągu 24 godzin. Jeśli Twój produkt kwalifikuje się,
              zaproponuję krótką rozmowę, żebyśmy mogli ocenić potencjał współpracy.
            </p>

            <div className="mt-10 space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                Alternatywnie
              </p>
              <a
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleIgClick}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-teal-300 hover:bg-teal-50/40"
              >
                <Instagram className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="font-semibold text-gray-900">Instagram DM</p>
                  <p className="text-sm text-gray-500">@gregswierad</p>
                </div>
              </a>
              <a
                href="mailto:greg@taulab.com"
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-teal-300 hover:bg-teal-50/40"
              >
                <Mail className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">greg@taulab.com</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Napisz do mnie</h3>

            {formStatus === "success" ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <p className="text-lg font-semibold text-gray-900">Wiadomość wysłana!</p>
                <p className="text-gray-500">Odpowiem w ciągu 24 godzin.</p>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleFormSubmit}>
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Imię i nazwisko *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formValues.name}
                    onChange={handleFormChange}
                    placeholder="Jan Kowalski"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleFormChange}
                    placeholder="jan@firma.com"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Opisz swój produkt i obecną sprzedaż *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formValues.message}
                    onChange={handleFormChange}
                    placeholder="Czym jest Twój produkt, ile kosztuje, czy masz już sprzedaże?"
                    className="mt-1.5 min-h-32"
                    required
                  />
                </div>
                {/* honeypot */}
                <Input
                  name="honeypot"
                  value={formValues.honeypot}
                  onChange={handleFormChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full bg-teal-600 font-semibold text-white hover:bg-teal-700"
                  disabled={formStatus === "submitting"}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {formStatus === "submitting" ? "Wysyłam..." : "Wyślij wiadomość"}
                </Button>
                {formStatus === "error" && (
                  <p className="text-center text-sm text-red-600">{formError}</p>
                )}
                <p className="text-center text-sm text-gray-400">
                  Odpowiem w ciągu 24 godzin.
                </p>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-500">
          <p>© 2026 Greg Swierad · gregswierad.com · subida.ai · greg@taulab.com</p>
        </div>
      </footer>

    </div>
  );
}
