import { useState, type FormEvent } from "react";
import { Heart, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env["VITE_API_URL"];

export type InvitationData = {
  guest: {
    name: string;
    attendance_limit: number;
  };
  wedding: {
    id: number;
    title: string;
    slug: string;
    date: string | null;
    venue: string | null;
    settings: {
  bride_name?: string;
  start_time?: string;
  location?: string;
  time_note?: string;
  invitation_message?: string;
  dress_code?: string;
  dress_description?: string;
  rsvp_enabled?: boolean;
  reply_by?: string;
};
  };
  rsvp: {
    status: "pending" | "attending" | "declined";
    attendees_count: number;
    message?: string | null;
  } | null;
};

type Props = {
  invitation: InvitationData;
  token: string;
};

export function InvitationRsvp({ invitation, token }: Props) {
  const guest = invitation.guest;
  const settings = invitation.wedding.settings ?? {};

  const [attendance, setAttendance] = useState<"accept" | "decline">(
    invitation.rsvp?.status === "declined" ? "decline" : "accept"
  );

  const [guestCount, setGuestCount] = useState(
    String(invitation.rsvp?.attendees_count || 1)
  );

  const [message, setMessage] = useState(
    invitation.rsvp?.message ?? ""
  );

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(
    invitation.rsvp !== null &&
    invitation.rsvp.status !== "pending"
  );
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/invitation/${encodeURIComponent(token)}/rsvp`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: attendance === "accept" ? "attending" : "declined",
            attendees_count:
              attendance === "decline" ? 0 : Number(guestCount),
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not submit your RSVP.");
      }

      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="rsvp" className="section section-blush">
      <p className="eyebrow">A seat saved just for you</p>
      <h2 className="section-title">Will You Celebrate With Us?</h2>

      {!settings.rsvp_enabled ? (
        <p className="section-copy">Replies are currently closed.</p>
      ) : done ? (
        <div className="confirmation" role="status">
          <Heart />
          <h3 className="message-title">
            Your reply is on its way to forever.
          </h3>
          <p className="section-copy">
            {attendance === "accept"
              ? `We can't wait to celebrate with you, ${guest.name}!`
              : "Thank you for your lovely reply. You'll be with us in spirit!"}
          </p>
          <div className="ornament"><Check /></div>
          <p className="text-sm text-muted-foreground">
            Your RSVP has been saved.
          </p>
        </div>
      ) : (
        <>
          <p className="text-base md:text-lg font-medium text-foreground mb-5">
  Welcome, {guest.name}!
  {settings.reply_by && (
    <span className="block text-sm font-normal text-muted-foreground mt-2">
      Kindly reply by {settings.reply_by}
    </span>
  )}
</p>

          <form onSubmit={onSubmit} className="rsvp-form">
            <fieldset>
              <legend className="field-label">
                Will you be joining us?
              </legend>

              <div className="attendance-options">
                <label className="attendance-option">
                  <input
                    type="radio"
                    name="attendance"
                    checked={attendance === "accept"}
                    onChange={() => setAttendance("accept")}
                  />
                  Joyfully Accept
                </label>

                <label className="attendance-option">
                  <input
                    type="radio"
                    name="attendance"
                    checked={attendance === "decline"}
                    onChange={() => setAttendance("decline")}
                  />
                  Regretfully Decline
                </label>
              </div>
            </fieldset>

            {attendance === "accept" && (
              <>
                <label htmlFor="guestCount" className="field-label">
                  Number of guests (including you)
                </label>

                <select
                  className="form-input"
                  name="guestCount"
                  id="guestCount"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                >
                  {Array.from(
                    { length: guest.attendance_limit },
                    (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} {i === 0 ? "guest" : "guests"}
                      </option>
                    )
                  )}
                </select>
              </>
            )}

            <label className="field-label" htmlFor="message">
              A little note for {settings.bride_name || "the bride"}{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>

            <textarea
              className="form-input"
              name="message"
              id="message"
              maxLength={1000}
              placeholder="Leave a little love for the bride-to-be…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {error && (
              <p className="form-error" role="alert">{error}</p>
            )}

            <Button
              variant="invitation"
              type="submit"
              disabled={busy}
              className="rsvp-submit"
            >
              <Send />
              {busy ? "Sending your reply…" : "Send My RSVP"}
            </Button>
          </form>
        </>
      )}
    </section>
  );
}
