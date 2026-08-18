import { createJobPosting, deleteJobPosting, updateJobPosting } from "@/app/admin/careers/actions";
import { JobPostingImageField } from "@/components/admin/job-posting-image-field";
import { departments, employmentTypes } from "@/lib/admin-careers";

type JobPostingFormData = {
  id?: string;
  slug?: string;
  title?: string;
  department?: string | null;
  location?: string | null;
  employment_type?: string | null;
  pay_range?: string | null;
  summary?: string | null;
  description?: string | null;
  status?: string;
  closes_at?: string | null;
  application_count?: number;
  hero_image_url?: string | null;
  hero_image_alt?: string | null;
};

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

export function JobPostingForm({ posting }: { posting?: JobPostingFormData }) {
  const action = posting?.id ? updateJobPosting : createJobPosting;
  const status = posting?.status ?? "draft";
  const closesAtValue = posting?.closes_at ? posting.closes_at.slice(0, 10) : "";
  const hasApplications = (posting?.application_count ?? 0) > 0;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {posting?.id ? <input name="posting_id" type="hidden" value={posting.id} /> : null}

      <div className="grid gap-6">
        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Role basics</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 font-bold md:col-span-2">
              Title
              <input className={inputClass} defaultValue={posting?.title} name="title" required />
            </label>
            <label className="grid gap-2 font-bold">
              Department
              <select className={inputClass} defaultValue={posting?.department ?? ""} name="department">
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-bold">
              Employment type
              <select className={inputClass} defaultValue={posting?.employment_type ?? ""} name="employment_type">
                <option value="">Select type</option>
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-bold">
              Location
              <input className={inputClass} defaultValue={posting?.location ?? ""} name="location" />
            </label>
            <label className="grid gap-2 font-bold">
              Pay range
              <span className="text-xs font-normal text-steel">Optional. Free text, e.g. &quot;$70k&ndash;$90k, DOE&quot;.</span>
              <input className={inputClass} defaultValue={posting?.pay_range ?? ""} name="pay_range" />
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Listing content</p>
          <div className="mt-5 grid gap-5">
            <label className="grid gap-2 font-bold">
              Listing summary
              <span className="text-xs font-normal text-steel">Short summary shown on the careers list card.</span>
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                defaultValue={posting?.summary ?? ""}
                maxLength={300}
                name="summary"
                placeholder="Runs day-to-day field coordination on active commercial builds."
              />
            </label>
            <label className="grid gap-2 font-bold">
              Full description
              <span className="text-xs font-normal text-steel">
                One flexible field &mdash; responsibilities, requirements, whatever the role needs.
              </span>
              <textarea
                className={`${inputClass} min-h-52 resize-y`}
                defaultValue={posting?.description ?? ""}
                name="description"
              />
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Hero image</p>
          <p className="mt-2 text-xs font-normal text-steel">
            Optional &mdash; the listing looks fine without one.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <JobPostingImageField defaultUrl={posting?.hero_image_url} />
            <label className="grid gap-2 font-bold">
              Alt text
              <span className="text-xs font-normal text-steel">Optional. Describe the image for accessibility.</span>
              <input className={inputClass} defaultValue={posting?.hero_image_alt ?? ""} name="hero_image_alt" />
            </label>
          </div>
        </section>
      </div>

      <aside className="grid content-start gap-6">
        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Status</p>
          <div className="mt-5 grid gap-3">
            <label className="flex items-center gap-3 font-black">
              <input defaultChecked={status === "draft"} name="status" type="radio" value="draft" />
              Draft
            </label>
            <label className="flex items-center gap-3 font-black">
              <input defaultChecked={status === "published"} name="status" type="radio" value="published" />
              Published
            </label>
            <label className="flex items-center gap-3 font-black">
              <input defaultChecked={status === "closed"} name="status" type="radio" value="closed" />
              Closed
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Auto-close</p>
          <label className="mt-5 grid gap-2 font-bold">
            Closes on
            <span className="text-xs font-normal text-steel">
              Optional. Leave blank to close manually anytime. Stops new applications automatically after this date.
            </span>
            <input className={inputClass} defaultValue={closesAtValue} name="closes_at" type="date" />
          </label>
        </section>

        <section className="grid gap-3">
          <label className="grid gap-2 font-bold">
            Slug
            <input className={inputClass} defaultValue={posting?.slug} name="slug" placeholder="Auto-created if blank" />
          </label>
        </section>

        <button
          className="bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
          type="submit"
        >
          {posting?.id ? "Save Posting" : "Create Posting"}
        </button>

        {posting?.id ? (
          <section className="border border-brand-red/25 bg-white p-6">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Danger zone</p>
            {hasApplications ? (
              <p className="mt-3 text-sm font-bold leading-6 text-steel">
                This posting has real applications on file, so it can only be closed, not deleted. Set status to
                Closed above to stop new applications.
              </p>
            ) : (
              <>
                <p className="mt-3 text-sm font-bold leading-6 text-steel">
                  Delete this posting. Only available while it has zero applications.
                </p>
                <button
                  className="mt-5 w-full border border-brand-red px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-brand-red hover:bg-brand-red hover:text-white"
                  formAction={deleteJobPosting}
                  formNoValidate
                  type="submit"
                >
                  Delete Posting
                </button>
              </>
            )}
          </section>
        ) : null}
      </aside>
    </form>
  );
}
