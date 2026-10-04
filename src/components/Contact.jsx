import { useRef, useState } from "react";
import { PROFILE, SECTIONS } from "../data/profile";
import { Card, Section, SectionHead } from "./ui";
import Icon from "./Icon";

const META = SECTIONS.find(s => s.id === "contact");
const EMPTY = { name: "", email: "", company: "", message: "" };

const validate = v => {
  const errs = {};
  if (v.name.trim().length < 2) errs.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errs.email = "Enter a valid email address.";
  if (v.message.trim().length < 10) errs.message = "A little more detail, please (10+ characters).";
  return errs;
};

const fieldCls = bad =>
  `w-full rounded-xl border bg-elev px-3.5 py-3 text-[14.5px] text-fg transition placeholder:text-faint focus:border-a1 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--a1)_16%,transparent)] focus:outline-none ${
    bad ? "border-bad" : "border-line"
  }`;

function Field({ label, hint, error, children }) {
  return (
    <label className="grid gap-[7px]">
      <span className="text-[12.5px] font-semibold tracking-[.01em] text-dim">
        {label}
        {hint && <small className="ml-[5px] text-[11.5px] font-normal text-faint">{hint}</small>}
      </span>
      {children}
      {error && <em className="text-xs text-bad not-italic">{error}</em>}
    </label>
  );
}

export default function Contact() {
  const formRef = useRef(null);
  const [vals, setVals] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [note, setNote] = useState(null); // null | "ok" | "invalid" | "failed"
  const [sending, setSending] = useState(false);

  const bind = key => ({
    name: key,
    value: vals[key],
    "aria-invalid": errs[key] ? true : undefined,
    onChange: e => {
      setVals(v => ({ ...v, [key]: e.target.value }));
      if (errs[key]) setErrs(({ [key]: _, ...rest }) => rest);
    },
    className: fieldCls(errs[key]),
  });

  const submit = async e => {
    e.preventDefault();
    const found = validate(vals);
    setErrs(found);
    if (Object.keys(found).length) {
      setNote("invalid");
      formRef.current.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    setSending(true);
    setNote(null);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(formRef.current),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Send failed");
      setVals(EMPTY);
      setNote("ok");
    } catch {
      setNote("failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Section id={META.id} cursor={META.cursor}>
      <SectionHead eyebrow="07 / Contact" title="Let's" accent="work together">
        Open to backend engineering roles. Drop a note below and it lands straight in my inbox - I reply within a day.
      </SectionHead>

      <Card tilt delay={0.08} className="mt-[46px] max-w-[720px] p-[30px] max-xs:p-[22px]">
        <h3 className="text-[22px]">Send me a message</h3>
        <p className="mt-3 text-[14.5px] text-dim">It goes straight to my inbox, and I reply within a day.</p>

        <form ref={formRef} onSubmit={submit} noValidate className="mt-[22px] grid gap-3.5">
          <input type="hidden" name="access_key" value={PROFILE.web3formsKey} />
          <input type="hidden" name="subject" value="New message from your portfolio site" />
          <input type="hidden" name="from_name" value="Portfolio - harshadkalantri97.github.io" />
          {/* honeypot: real people never fill this */}
          <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute -left-[9999px] opacity-0" />

          <div className="grid gap-3.5 min-[521px]:grid-cols-2">
            <Field label="Your name" error={errs.name}>
              <input type="text" required minLength={2} maxLength={80} autoComplete="name" placeholder="Jane Doe" {...bind("name")} />
            </Field>
            <Field label="Email" error={errs.email}>
              <input type="email" required maxLength={120} autoComplete="email" placeholder="jane@company.com" {...bind("email")} />
            </Field>
          </div>

          <Field label="Company" hint="optional">
            <input type="text" maxLength={80} autoComplete="organization" placeholder="Acme Telecom" {...bind("company")} />
          </Field>

          <Field label="Message" error={errs.message}>
            <textarea rows={4} required minLength={10} maxLength={2000} placeholder="Role, team, stack - or just say hello." {...bind("message")} className={`${fieldCls(errs.message)} resize-y`} />
          </Field>

          <button className="btn btn-primary mt-1 justify-center" type="submit" disabled={sending} data-cursor="send()">
            <Icon name="send" size={17} />
            <span>{sending ? "Sending..." : "Send message"}</span>
          </button>

          <p role="status" aria-live="polite" className={`mt-0.5 min-h-[1.2em] text-[13.5px] ${note === "ok" ? "text-ok" : "text-bad"}`}>
            {note === "ok" && "Thanks - message sent. I'll reply within a day."}
            {note === "invalid" && "Please fix the highlighted fields."}
            {note === "failed" && (
              <>Could not send - please email <a className="text-a1" href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> directly.</>
            )}
          </p>
        </form>
      </Card>
    </Section>
  );
}
