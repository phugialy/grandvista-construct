import { createPartner, deletePartner, updatePartner } from "@/app/admin/partners/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { tradeCategories } from "@/lib/admin-partners";

type PartnerFormData = {
  id?: string;
  slug?: string;
  name?: string;
  trade_category?: string | null;
  website_url?: string | null;
  blurb?: string | null;
  logo_url?: string | null;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
};

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

export function PartnerForm({ partner }: { partner?: PartnerFormData }) {
  const action = partner?.id ? updatePartner : createPartner;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {partner?.id ? <input name="partner_id" type="hidden" value={partner.id} /> : null}

      <div className="grid gap-6">
        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Partner basics</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 font-bold md:col-span-2">
              Name
              <input className={inputClass} defaultValue={partner?.name} name="name" required />
            </label>
            <label className="grid gap-2 font-bold">
              Trade category
              <select className={inputClass} defaultValue={partner?.trade_category ?? ""} name="trade_category">
                <option value="">Select category</option>
                {tradeCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-bold">
              Website
              <span className="text-xs font-normal text-steel">Optional.</span>
              <input
                className={inputClass}
                defaultValue={partner?.website_url ?? ""}
                name="website_url"
                placeholder="https://..."
                type="url"
              />
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Listing content</p>
          <div className="mt-5 grid gap-5">
            <label className="grid gap-2 font-bold">
              Blurb
              <span className="text-xs font-normal text-steel">
                1-2 sentences on the relationship — shown on the Partners page.
              </span>
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                defaultValue={partner?.blurb ?? ""}
                maxLength={300}
                name="blurb"
              />
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Logo</p>
          <p className="mt-2 text-xs font-normal text-steel">Optional &mdash; the listing looks fine without one.</p>
          <div className="mt-5">
            <ImageUploadField defaultUrl={partner?.logo_url} name="logo_url" />
          </div>
        </section>
      </div>

      <aside className="grid content-start gap-6">
        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Status</p>
          <div className="mt-5 grid gap-3">
            <label className="flex items-center gap-3 font-black">
              <input defaultChecked={partner?.published ?? true} name="published" type="checkbox" />
              Published
            </label>
            <label className="flex items-center gap-3 font-black">
              <input defaultChecked={partner?.featured} name="featured" type="checkbox" />
              Featured on homepage
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Display order</p>
          <label className="mt-5 grid gap-2 font-bold">
            Sort order
            <span className="text-xs font-normal text-steel">Lower numbers show first. Defaults to 0.</span>
            <input className={inputClass} defaultValue={partner?.sort_order ?? 0} name="sort_order" type="number" />
          </label>
        </section>

        <section className="grid gap-3">
          <label className="grid gap-2 font-bold">
            Slug
            <input className={inputClass} defaultValue={partner?.slug} name="slug" placeholder="Auto-created if blank" />
          </label>
        </section>

        <button
          className="bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
          type="submit"
        >
          {partner?.id ? "Save Partner" : "Create Partner"}
        </button>

        {partner?.id ? (
          <section className="border border-brand-red/25 bg-white p-6">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Danger zone</p>
            <p className="mt-3 text-sm font-bold leading-6 text-steel">Delete this partner.</p>
            <button
              className="mt-5 w-full border border-brand-red px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-brand-red hover:bg-brand-red hover:text-white"
              formAction={deletePartner}
              formNoValidate
              type="submit"
            >
              Delete Partner
            </button>
          </section>
        ) : null}
      </aside>
    </form>
  );
}
