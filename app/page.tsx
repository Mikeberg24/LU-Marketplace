export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="text-xl font-extrabold tracking-tight">LU Marketplace</div>
          <nav className="flex items-center gap-3">
            <a
              href="/marketplace"
              className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Browse
            </a>
            <a
              href="/sell"
              className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Post a Listing
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="mb-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
          Verified Liberty students only
        </p>

        <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
          The Liberty Student Marketplace
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          Buy and sell textbooks, graduation gear, tickets, and campus essentials —
          all from verified Liberty students. Local pickup. No shipping. No sketchy strangers.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/marketplace"
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Browse Listings
          </a>
          <a
            href="/sell"
            className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-gray-50"
          >
            Post a Listing
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-5xl px-6 pb-14">
        <h2 className="text-2xl font-bold">What you can buy & sell</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h3 className="text-lg font-bold">📚 Textbooks & Academics</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
              <li>Textbooks by course</li>
              <li>Calculators & iClickers</li>
              <li>Lab equipment</li>
              <li>Study materials</li>
            </ul>
          </div>

          <div className="rounded-2xl border p-6">
            <h3 className="text-lg font-bold">🎓 Graduation</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
              <li>Cap & gown</li>
              <li>Honors cords</li>
              <li>Graduation tickets</li>
              <li>Professional attire</li>
            </ul>
          </div>

          <div className="rounded-2xl border p-6">
            <h3 className="text-lg font-bold">🎟️ Events & Tickets</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
              <li>Hockey & football games</li>
              <li>Concerts & local events</li>
              <li>Student org events</li>
            </ul>
          </div>

          <div className="rounded-2xl border p-6">
            <h3 className="text-lg font-bold">🪑 Campus Life</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
              <li>Dorm furniture</li>
              <li>Mini fridges & appliances</li>
              <li>Bikes & scooters</li>
              <li>Room décor</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-2xl font-bold">How it works</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["1", "Sign up", "Use your Liberty email (verified students only)."],
              ["2", "List or search", "Post an item or browse by category/course."],
              ["3", "Connect", "Message and coordinate a campus meetup."],
              ["4", "Save money", "Pay less, sell fast, help other Flames."],
            ].map(([step, title, desc]) => (
              <div key={step} className="rounded-2xl border bg-white p-6">
                <div className="text-sm font-bold text-gray-500">Step {step}</div>
                <div className="mt-2 text-lg font-bold">{title}</div>
                <div className="mt-2 text-gray-600">{desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/marketplace"
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Browse Listings
            </a>
            <a
              href="/sell"
              className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-100"
            >
              Post a Listing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-gray-500">
          Built by Liberty students, for Liberty students. <span className="mx-1">•</span> LU Marketplace
        </div>
      </footer>
    </main>
  );
}
