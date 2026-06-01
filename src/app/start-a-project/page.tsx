const projectTypes = [
  "Commercial Interior",
  "Restaurant / Food Service",
  "Retail",
  "Salon / Wellness",
  "Medical / Office",
  "Warehouse / Industrial",
  "Ground-Up Construction",
  "Tilt-Wall / Shell",
  "Building Improvement",
  "Other Commercial Project",
];

export default function StartProjectPage() {
  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <section className="section-shell grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Start a Project</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">Start a project conversation.</h1>
          <p className="mt-6 text-lg leading-8 text-steel">
            This form is structured to qualify serious commercial opportunities and help Grandvista
            understand project stage, scope, schedule, and risk before the first call.
          </p>
        </div>
        <form className="grid gap-4 border border-ink/12 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="border border-ink/14 p-4" placeholder="Name" />
            <input className="border border-ink/14 p-4" placeholder="Company" />
            <input className="border border-ink/14 p-4" placeholder="Email" />
            <input className="border border-ink/14 p-4" placeholder="Phone" />
          </div>
          <input className="border border-ink/14 p-4" placeholder="Project location" />
          <select className="border border-ink/14 p-4" defaultValue="">
            <option value="" disabled>
              Project type
            </option>
            {projectTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <div className="grid gap-4 md:grid-cols-2">
            <select className="border border-ink/14 p-4" defaultValue="">
              <option value="" disabled>
                Current stage
              </option>
              <option>Exploring ideas</option>
              <option>Site selected</option>
              <option>Plans in progress</option>
              <option>Permit stage</option>
              <option>Ready to bid</option>
              <option>Ready to build</option>
            </select>
            <select className="border border-ink/14 p-4" defaultValue="">
              <option value="" disabled>
                Estimated timeline
              </option>
              <option>0-3 months</option>
              <option>3-6 months</option>
              <option>6-12 months</option>
              <option>12+ months</option>
            </select>
          </div>
          <textarea
            className="min-h-36 border border-ink/14 p-4"
            placeholder="Short project description"
          />
          <button
            type="button"
            className="bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
          >
            Submit Project Review
          </button>
        </form>
      </section>
    </main>
  );
}
