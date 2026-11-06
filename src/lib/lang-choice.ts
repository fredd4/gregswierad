const KEY = "gs-lang";

/** The language a visitor picked in the switcher or via `?lang=`; never a guess. */
export function readLangChoice(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveLangChoice(lang: string) {
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    // Storage can be blocked (private mode); the URL still carries the language.
  }
}
