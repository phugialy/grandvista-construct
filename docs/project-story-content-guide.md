# Writing a project story

This is the brief for whoever writes the narrative content on a `/project-stories/[slug]`
page — the operator today, an AI agent later. It maps to three fields already on the
`projects` table (`project_intent`, `story_body`, `built_outcome`) and to three sections
on the admin form. **None of this appears as a label on the public page** — visitors see
one flowing story, not a labeled template. The structure exists to keep the writing
consistent and to serve SEO/AEO, not to be visible.

## The seed you start from

Every project starts with three things the operator provides, regardless of who writes
the narrative:

- **Name** and **Location**
- **Intention** — one line describing what this piece is about and what stage the
  project is at. This is written in plain language, exactly like: *"new project coming
  in Frisco, it's a new restaurant"*, *"brand new doctor's office in Plano"*, *"Sushi's
  Restaurant project came to finished."* The stage (announced / in progress / completed)
  is read directly out of this line — there's no separate status field to fill in
  independently of it.

Whoever writes the three beats below should treat the Intention line as the brief, not
just a form field — it's the one input that has to be true to what actually happened,
and everything else expands on it.

## The three beats

### 1. Intro (`project_intent`)

**Job**: answer "what is this and where" in the first sentence, before anything else.
This is the sentence a search snippet or an AI answer engine is most likely to lift
directly — it needs to stand alone and be specific enough to be worth quoting.

- Name the project type and the real place. "A new sushi and tapas restaurant opening
  in Dallas" beats "An exciting new project" every time — specificity is what makes a
  sentence quotable and what makes a reader recognize the place.
- One sentence, two at most. This is a hook, not a summary.
- Write from the Intention line — don't invent a different angle than what the operator
  actually described.

### 2. The Build (`story_body`)

**Job**: the substance. This is where real detail lives — what the project actually
required, what made it non-trivial, how it moved from start to finish. This is the part
that earns trust ("this GC actually knows what they're doing"), and it's also where
concrete, checkable details help most: a real number, a real timeline, a real
constraint that got solved. Generic project-management language ("we communicated
throughout") reads as filler; a specific detail ("coordinated kitchen layout, sushi bar
sightlines, and back-of-house flow before permitting") reads as proof.

- Ground it in what's specific to *this* project's topic — the actual building type,
  the actual neighborhood, a real constraint. If a sentence could be copy-pasted into
  any other project's page unchanged, rewrite it.
- Two to four short paragraphs. Plain prose, no subheadings needed inside it.

### 3. Outcome (`built_outcome`)

**Job**: the satisfying close, and the second most quotable sentence on the page after
the intro. This is what should stick with a reader — "now open and serving," "the
client's team moved in ahead of their opening date" — something concrete enough to be
a real answer to "what happened here," not a vague sign-off.

- One or two sentences. Bolded/visually set apart on the page, so it needs to work as a
  standalone line, not a continuation of the previous paragraph.
- Match the stage from the Intention line — an announced project doesn't get an
  "outcome" yet (leave it blank or write it as what's expected), a completed one does.

## Why this shape, specifically

Statistics, citations, and concrete specifics measurably increase how often AI answer
engines cite a page (Princeton's GEO study found up to a 40-41% lift from adding real
numbers and specifics over generic prose). The Intro/Outcome beats are written to be
independently quotable for exactly that reason — an AI engine or a search snippet
should be able to lift either sentence on its own and have it read as a complete,
specific answer.

## Brief for an AI agent (future — not built yet)

When an AI-drafting step is added, it should receive exactly the seed above — name,
location, Intention line — and nothing else invented. The output should be three
fields matching this document's Job/how-to for each beat, written in Grandvista's plain,
direct voice (short sentences, real details over adjectives, no marketing language like
"state-of-the-art" or "premier"). The agent should never write specifics it wasn't
given — a real photo caption or a supplied detail is fair game to reference; a
guessed square footage or completion date is not.
