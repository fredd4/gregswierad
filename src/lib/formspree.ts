const formspreeId = import.meta.env.VITE_FORMSPREE_ID ?? "";

export type FormspreeResult = { ok: true } | { ok: false; reason: "notConfigured" | "generic" | "network"; message?: string };

/** Posts a JSON payload to the site's Formspree form. `_subject` sets the email subject line. */
export async function submitToFormspree(payload: Record<string, unknown>): Promise<FormspreeResult> {
  if (!formspreeId) return { ok: false, reason: "notConfigured" };

  try {
    const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return { ok: false, reason: "generic", message: errorBody?.error };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}
