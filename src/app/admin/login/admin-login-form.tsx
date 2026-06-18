export function AdminLoginForm({
  action,
  status,
}: {
  action: (formData: FormData) => void | Promise<void>;
  status?: string;
}) {
  return (
    <form action={action} className="w-full border border-white/14 bg-white p-8 text-ink" id="admin-login-form">
      <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">Secure Access</p>
      <h2 className="mt-4 text-4xl font-black leading-tight">Sign in to the control hub</h2>
      <p className="mt-4 leading-7 text-steel">
        Use the username and password assigned to the team member. The system will open the right workspace for that account.
      </p>
      {status === "invalid" ? (
        <p className="mt-6 border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
          The username or password did not match an active admin account.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-6 border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
          Sign in took too long or the admin service could not be reached. Please try again.
        </p>
      ) : null}
      <input
        className="mt-8 w-full border border-ink/14 p-4 outline-none focus:border-navy"
        autoComplete="username"
        name="username"
        placeholder="Username"
        required
        type="text"
      />
      <div className="mt-3 flex border border-ink/14 focus-within:border-navy">
        <input
          className="min-w-0 flex-1 p-4 outline-none"
          autoComplete="current-password"
          id="admin-password"
          name="password"
          placeholder="Password"
          required
          type="password"
        />
        <button
          aria-label="Show password"
          className="w-20 border-l border-ink/14 text-xs font-black uppercase tracking-[0.08em] text-navy hover:bg-warm-white"
          id="admin-password-toggle"
          type="button"
        >
          Show
        </button>
      </div>
      <button
        className="mt-5 w-full bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red disabled:cursor-wait disabled:bg-ink/45"
        id="admin-submit"
        type="button"
      >
        Sign In
      </button>
      <p className="mt-5 text-sm font-bold leading-6 text-steel">
        Access is invite-only. Account role and permissions are managed in the database, not selected on this screen.
      </p>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(() => {
  const form = document.getElementById("admin-login-form");
  const password = document.getElementById("admin-password");
  const toggle = document.getElementById("admin-password-toggle");
  const submit = document.getElementById("admin-submit");

  if (!form || !password || !toggle || !submit) return;

  password.addEventListener("copy", (event) => event.preventDefault());
  password.addEventListener("cut", (event) => event.preventDefault());

  toggle.addEventListener("click", () => {
    const visible = password.getAttribute("type") === "text";
    password.setAttribute("type", visible ? "password" : "text");
    toggle.textContent = visible ? "Show" : "Hide";
    toggle.setAttribute("aria-label", visible ? "Show password" : "Hide password");
  });

  const setPending = () => {
    submit.disabled = true;
    submit.textContent = "Signing In...";
  };

  const submitForm = () => {
    if (!form.reportValidity()) return;

    setPending();
    window.setTimeout(() => HTMLFormElement.prototype.submit.call(form), 80);
  };

  submit.addEventListener("click", submitForm);
  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submitForm();
  });
})();
          `,
        }}
      />
    </form>
  );
}
