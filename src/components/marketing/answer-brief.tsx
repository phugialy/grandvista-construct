type AnswerBriefProps = {
  eyebrow?: string;
  question: string;
  answer: string;
  points?: string[];
};

export function AnswerBrief({ eyebrow = "Quick Answer", question, answer, points = [] }: AnswerBriefProps) {
  return (
    <section className="border-b border-ink/10 bg-white">
      <div className="section-shell grid gap-8 py-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{question}</h2>
        </div>
        <div className="border-l-4 border-brand-red bg-warm-white p-6">
          <p className="text-lg leading-8 text-ink/78">{answer}</p>
          {points.length > 0 ? (
            <ul className="mt-5 grid gap-2 text-sm font-bold text-steel sm:grid-cols-2">
              {points.map((point) => (
                <li key={point} className="border border-ink/10 bg-white px-4 py-3">
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
