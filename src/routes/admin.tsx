import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  Users,
  Heart,
  CalendarDays,
  LogOut,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Bride = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

type Wedding = {
  id: number;
  title: string;
  slug: string;
  wedding_date: string | null;
  venue: string | null;
  guests_count: number;
  bride?: {
    id: number;
    name: string;
    email: string;
  };
};

function AdminPage() {
  const navigate = useNavigate();

  const [brides, setBrides] = useState<Bride[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingWedding, setCreatingWedding] = useState(false);
const [createError, setCreateError] = useState("");
const [successMessage, setSuccessMessage] = useState("");
const [creatingBride, setCreatingBride] = useState(false);
const [brideError, setBrideError] = useState("");
const [brideSuccess, setBrideSuccess] = useState("");
const [selectedBrideId, setSelectedBrideId] = useState<number | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        navigate({ to: "/login" });
        return;
      }

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [bridesResponse, weddingsResponse] = await Promise.all([
        fetch(`${import.meta.env["VITE_API_URL"]}/api/brides`, { headers }),
        fetch(`${import.meta.env["VITE_API_URL"]}/api/weddings`, { headers }),
      ]);

      if (bridesResponse.status === 401 || weddingsResponse.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        navigate({ to: "/login" });
        return;
      }

      if (!bridesResponse.ok || !weddingsResponse.ok) {
        throw new Error("Unable to load dashboard information.");
      }

      const bridesData = await bridesResponse.json();
      const weddingsData = await weddingsResponse.json();

      setBrides(bridesData.brides);
      setWeddings(weddingsData.weddings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createBride(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const formElement = e.currentTarget;
  const form = new FormData(formElement);

  setCreatingBride(true);
  setBrideError("");
  setBrideSuccess("");
  setCreateError("");
  setSuccessMessage("");

  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
  navigate({ to: "/login" });
  return;
}

    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
    };

    const response = await fetch(
      `${import.meta.env["VITE_API_URL"]}/api/brides`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          Object.values(data.errors ?? {}).flat().join(" ") ||
          "Unable to create bride account."
      );
    }

    // Use the returned bride ID, or retrieve it by email.
    let brideId = data.bride?.id ?? data.user?.id;

    if (!brideId) {
      const bridesResponse = await fetch(
        `${import.meta.env["VITE_API_URL"]}/api/brides`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const bridesData = await bridesResponse.json();
      const createdBride = bridesData.brides?.find(
        (bride: Bride) => bride.email === payload.email
      );

      brideId = createdBride?.id;
    }

    if (!brideId) {
      throw new Error(
        "Account was created, but we couldn't retrieve its ID. Please refresh the dashboard."
      );
    }

    setSelectedBrideId(Number(brideId));
    setBrideSuccess("Bride account created! You can now configure her celebration.");
    formElement.reset();

    await loadDashboard();
  } catch (err) {
    setBrideError(
      err instanceof Error ? err.message : "Something went wrong."
    );
  } finally {
    setCreatingBride(false);
  }
}

  async function createWedding(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!selectedBrideId) {
    setCreateError("Please create a bride account first.");
    return;
  }

  const formElement = e.currentTarget;
  const form = new FormData(formElement);

  setCreatingWedding(true);
  setCreateError("");
  setSuccessMessage("");

  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
  navigate({ to: "/login" });
  return;
}

    const payload = {
      user_id: selectedBrideId,
      title: String(form.get("title")),
      wedding_date: String(form.get("wedding_date")),
      venue: String(form.get("venue")),

      settings: {
        bride_name: String(form.get("bride_name")),
        start_time: String(form.get("start_time")),
        location: String(form.get("location")),
        time_note: String(form.get("time_note")),
        invitation_message: String(form.get("invitation_message")),
        dress_code: String(form.get("dress_code")),
        dress_description: String(form.get("dress_description")),
        rsvp_enabled: form.get("rsvp_enabled") === "on",
        reply_by: String(form.get("reply_by")),
      },
    };

    const response = await fetch(
      `${import.meta.env["VITE_API_URL"]}/api/weddings`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          Object.values(data.errors ?? {}).flat().join(" ") ||
          "Unable to create celebration."
      );
    }

    setSuccessMessage("Celebration created successfully!");
    formElement.reset();
    setSelectedBrideId(null);
    setBrideSuccess("");

    await loadDashboard();
  } catch (err) {
    setCreateError(
      err instanceof Error ? err.message : "Something went wrong."
    );
  } finally {
    setCreatingWedding(false);
  }
}

  useEffect(() => {
    loadDashboard();
  }, []);

  function logout() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
  navigate({ to: "/login" });
  return;
}

    fetch(`${import.meta.env["VITE_API_URL"]}/api/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).finally(() => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      navigate({ to: "/login" });
    });
  }

  return (
    <main className="min-h-screen bg-[#faf6f3]">
      <header className="flex items-center justify-between border-b border-[#eadfd8] bg-white px-6 py-5 md:px-10">
        <div>
          <h1 className="font-serif text-2xl text-[#63483d]">
            Bride to Be
          </h1>
          <p className="text-xs text-[#927c70]">Administration Panel</p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border border-[#eadfd8] px-4 py-2 text-sm text-[#63483d] hover:bg-[#faf6f3]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-[#63483d]">
              Dashboard
            </h2>
            <p className="mt-2 text-sm text-[#927c70]">
              Manage your brides and their celebrations.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#a97965] px-4 py-2 text-sm text-white hover:bg-[#8f6452] disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

<section className="mb-8 rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm">
  <div className="mb-6">
    <h3 className="font-serif text-2xl text-[#63483d]">
      Step 1 — Create Bride Account
    </h3>
    <p className="mt-2 text-sm text-[#927c70]">
      Create the bride's login credentials before configuring her celebration.
    </p>
  </div>

  {brideError && (
    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {brideError}
    </div>
  )}

  {brideSuccess && (
    <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
      {brideSuccess}
    </div>
  )}

  <form onSubmit={createBride} className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Full Name *
        </label>
        <input
          name="name"
          required
          placeholder="Sarah Smith"
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Email Address *
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="sarah@example.com"
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Password *
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>
    </div>

    <button
      type="submit"
      disabled={creatingBride}
      className="rounded-lg bg-[#a97965] px-6 py-3 text-sm text-white hover:bg-[#8f6452] disabled:opacity-60"
    >
      {creatingBride ? "Creating Account..." : "Create Bride Account"}
    </button>
  </form>
</section>

<section className="mb-8 rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm">
  <div className="mb-6">
    <h3 className="font-serif text-2xl text-[#63483d]">
      Create a Wedding
    </h3>
    <p className="mt-2 text-sm text-[#927c70]">
      Configure a personalized celebration and invitation for a bride.
    </p>
  </div>

  {createError && (
    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {createError}
    </div>
  )}

  {successMessage && (
    <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
      {successMessage}
    </div>
  )}

  <form onSubmit={createWedding} className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2 rounded-lg border border-[#eadfd8] bg-[#faf6f3] p-4">
  <p className="text-xs text-[#927c70]">BRIDE ACCOUNT</p>

  {selectedBrideId ? (
    <p className="mt-1 font-medium text-[#63483d]">
      {brides.find((bride) => bride.id === selectedBrideId)?.name}
    </p>
  ) : (
    <p className="mt-1 text-sm text-[#927c70]">
      Create a bride account in Step 1 first.
    </p>
  )}
</div>

      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Wedding Title *
        </label>
        <input
          name="title"
          required
          placeholder="Sarah's Bride-to-Be Celebration"
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Bride's Name *
        </label>
        <input
          name="bride_name"
          required
          placeholder="Sarah"
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>

      

      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Celebration Date *
        </label>
        <input
          name="wedding_date"
          type="date"
          required
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Venue *
        </label>
        <input
          name="venue"
          required
          placeholder="Saint George Cathedral"
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Start Time *
        </label>
        <input
          name="start_time"
          type="time"
          required
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>

      

      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Location *
        </label>
        <input
          name="location"
          required
          placeholder="Beirut, Lebanon"
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-[#63483d]">
          Time Note
        </label>
        <input
          name="time_note"
          placeholder="An evening of celebration"
          className="w-full rounded-lg border border-[#eadfd8] p-3"
        />
      </div>
    </div>

    <div className="border-t border-[#eadfd8] pt-5">
      <h4 className="mb-4 font-serif text-xl text-[#63483d]">
        Invitation Content
      </h4>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-[#63483d]">
            Invitation Message
          </label>
          <textarea
            name="invitation_message"
            rows={3}
            placeholder="Join us for a beautiful celebration..."
            className="w-full rounded-lg border border-[#eadfd8] p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-[#63483d]">
            Dress Code
          </label>
          <input
            name="dress_code"
            placeholder="Pretty in Pink"
            className="w-full rounded-lg border border-[#eadfd8] p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-[#63483d]">
            Dress Code Description
          </label>
          <textarea
            name="dress_description"
            rows={2}
            placeholder="Wear your favorite shades..."
            className="w-full rounded-lg border border-[#eadfd8] p-3"
          />
        </div>
      </div>
    </div>

    <div className="border-t border-[#eadfd8] pt-5">
      <h4 className="mb-4 font-serif text-xl text-[#63483d]">
        RSVP Settings
      </h4>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-[#63483d]">
            Reply Deadline
          </label>
          <input
            name="reply_by"
            type="date"
            className="w-full rounded-lg border border-[#eadfd8] p-3"
          />
        </div>

      </div>

      <label className="mt-4 flex items-center gap-3 text-sm text-[#63483d]">
        <input
          type="checkbox"
          name="rsvp_enabled"
          defaultChecked
          className="h-4 w-4"
        />
        Enable RSVP
      </label>
    </div>

    <button
      type="submit"
      disabled={creatingWedding || !selectedBrideId}
      className="rounded-lg bg-[#a97965] px-6 py-3 text-sm text-white hover:bg-[#8f6452] disabled:opacity-60"
    >
      {creatingWedding ? "Creating Wedding..." : "Create Wedding"}
    </button>
  </form>
</section>


        <div className="mb-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#927c70]">Total Brides</span>
              <Users className="text-[#bd927d]" />
            </div>
            <p className="text-4xl font-semibold text-[#63483d]">
              {loading ? "—" : brides.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#927c70]">Total Weddings</span>
              <Heart className="text-[#bd927d]" />
            </div>
            <p className="text-4xl font-semibold text-[#63483d]">
              {loading ? "—" : weddings.length}
            </p>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Users className="text-[#bd927d]" />
            <h3 className="font-serif text-2xl text-[#63483d]">
              Bride Accounts
            </h3>
          </div>

          {loading ? (
            <p className="text-sm text-[#927c70]">Loading brides...</p>
          ) : brides.length === 0 ? (
            <p className="text-sm text-[#927c70]">No bride accounts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#eadfd8] text-[#927c70]">
                    <th className="py-3 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 font-medium">Account ID</th>
                  </tr>
                </thead>
                <tbody>
                  {brides.map((bride) => (
                    <tr key={bride.id} className="border-b border-[#f2eae5]">
                      <td className="py-4 pr-4 font-medium text-[#63483d]">
                        {bride.name}
                      </td>
                      <td className="py-4 pr-4 text-[#927c70]">
                        {bride.email}
                      </td>
                      <td className="py-4 text-[#927c70]">
                        #{bride.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="text-[#bd927d]" />
            <h3 className="font-serif text-2xl text-[#63483d]">
              All Weddings
            </h3>
          </div>

          {loading ? (
            <p className="text-sm text-[#927c70]">Loading weddings...</p>
          ) : weddings.length === 0 ? (
            <p className="text-sm text-[#927c70]">No weddings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#eadfd8] text-[#927c70]">
                    <th className="py-3 pr-4 font-medium">Wedding</th>
                    <th className="py-3 pr-4 font-medium">Bride</th>
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 font-medium">Guests</th>
                  </tr>
                </thead>
                <tbody>
                  {weddings.map((wedding) => (
                    <tr key={wedding.id} className="border-b border-[#f2eae5]">
                      <td className="py-4 pr-4 font-medium text-[#63483d]">
                        {wedding.title}
                      </td>
                      <td className="py-4 pr-4 text-[#927c70]">
                        {wedding.bride?.name ?? "—"}
                      </td>
                      <td className="py-4 pr-4 text-[#927c70]">
                        {wedding.wedding_date
                          ? new Date(wedding.wedding_date).toLocaleDateString()
                          : "Not set"}
                      </td>
                      <td className="py-4 text-[#927c70]">
                        {wedding.guests_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
