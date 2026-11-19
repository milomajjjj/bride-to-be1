import { useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eventConfig } from "@/lib/event-config";
import { rsvpSchema } from "@/lib/rsvp-schema";
import { submitRsvp } from "@/lib/rsvp.functions";

export function InvitationRsvp() {
  const [attendance, setAttendance] = useState<"accept" | "decline">("accept");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const key = useRef<string | null>(null);
  const save = useServerFn(submitRsvp);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    key.current ??= crypto.randomUUID();
    const parsed = rsvpSchema.safeParse({ submissionKey: key.current, guestName: form.get("guestName"), attendance, guestCount: attendance === "decline" ? 0 : Number(form.get("guestCount")), message: form.get("message"), website: form.get("website") });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Please check your reply."); return; }
    setBusy(true); setError("");
    try { await save({ data: parsed.data }); setDone(true); }
    catch (err) { setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <section id="rsvp" className="section section-blush">
    <p className="eyebrow">A seat saved just for you</p>
    <h2 className="section-title">Will You Celebrate With Us?</h2>
    {done ? <div className="confirmation" role="status"><Heart /><h3 className="message-title">Your reply is on its way to forever.</h3><p className="section-copy">{attendance === "accept" ? `We can't wait to celebrate with you! ${eventConfig.brideName} will be so happy you're joining us.` : `Thank you for your lovely reply. You'll be with us in spirit!`}</p><div className="ornament"><Check /></div><p className="text-sm text-muted-foreground">Your RSVP has been saved.</p></div> : eventConfig.rsvp.enabled ? <>
      <p className="text-xs text-muted-foreground">Kindly reply by {eventConfig.rsvp.replyBy}</p>
      <form onSubmit={onSubmit} className="rsvp-form">
        <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></div>
        <label className="field-label" htmlFor="guestName">Your name</label><input className="form-input" id="guestName" name="guestName" placeholder="First and last name" autoComplete="name" required maxLength={100} />
        <fieldset><legend className="field-label">Will you be joining us?</legend><div className="attendance-options">
          <label className="attendance-option"><input type="radio" name="attendance" value="accept" checked={attendance === "accept"} onChange={() => setAttendance("accept")} /> Joyfully Accept</label>
          <label className="attendance-option"><input type="radio" name="attendance" value="decline" checked={attendance === "decline"} onChange={() => setAttendance("decline")} /> Regretfully Decline</label>
        </div></fieldset>
        {attendance === "accept" && <><label htmlFor="guestCount" className="field-label">Number of guests <span className="text-muted-foreground">(including you)</span></label><select className="form-input" name="guestCount" id="guestCount" defaultValue="1">{Array.from({ length: eventConfig.rsvp.maxGuests }, (_, i) => <option key={i} value={i + 1}>{i + 1} {i === 0 ? "guest" : "guests"}</option>)}</select></>}
        <label className="field-label" htmlFor="message">A little note for {eventConfig.brideName} <span className="text-muted-foreground">(optional)</span></label><textarea className="form-input" name="message" id="message" maxLength={1000} placeholder="Leave a little love for the bride-to-be…" />
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button variant="invitation" type="submit" disabled={busy} className="rsvp-submit"><Send />{busy ? "Sending your reply…" : "Send My RSVP"}</Button>
      </form>
    </> : <p className="section-copy">Replies are currently closed.</p>}
  </section>;
}