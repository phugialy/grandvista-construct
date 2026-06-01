# Grandvista Website Roadmap

## Strategic Aim

Grandvista should not present itself as a small local contractor trying to look large overnight. The website should position the company as an emerging commercial construction partner with direction, discipline, and the ambition to grow into larger commercial, corporate, industrial, and technically demanding work.

The site must communicate one central idea:

**Important projects deserve a builder with direction.**

This gives Grandvista a serious confidence layer without overclaiming. It says the company understands that commercial construction carries pressure, risk, money, timelines, operations, and future business value.

## Core Brand Direction

### Positioning

Grandvista builds commercial environments for owners, operators, and businesses preparing for what comes next.

### Stronger Positioning Line

Grandvista is a growth-minded construction partner built for commercial projects with purpose, pressure, and possibility.

### Brand Belief

Every project carries a business story before it becomes a construction scope.

### Brand Promise

Grandvista brings planning, field coordination, and ownership-minded communication to commercial projects that matter to the people behind them.

### Vision

Grandvista is building toward larger commercial, corporate, industrial, and complex environments through disciplined systems, stronger partnerships, and accountable field execution.

### Practical Website Message

The site should make visitors feel:

- Grandvista understands what is at stake.
- Grandvista is organized enough to trust.
- Grandvista is serious without pretending to be a national giant today.
- Grandvista treats every project as a step toward bigger responsibility.
- Grandvista is worth a project conversation.

## Buyer Confidence Layer

The website needs to answer different emotional questions for different buyers.

| Audience | What They Are Really Asking | Website Response |
| --- | --- | --- |
| Business owner | Can they get my place open without killing my budget? | Show budget awareness, opening-readiness, permit awareness, and usable built outcomes. |
| Developer | Can they handle schedule, trades, and site complexity? | Show coordination, site discipline, schedule thinking, trade management, and repeatable process. |
| Architect / designer | Will they respect design intent and coordinate correctly? | Show drawing awareness, constructability review, communication habits, and finish/detail sensitivity. |
| Corporate client | Are they mature enough to manage risk, documentation, safety, and communication? | Show documentation, safety mindset, process maturity, reporting, and future scalability. |
| Subcontractor | Are they organized enough to partner with? | Show clear scopes, communication standards, project readiness, and professional trade coordination. |

The brand cannot only say, "We build commercial projects." It needs to say:

**We understand what is at stake behind every project.**

## Recommended Navigation

- Home
- What We Build
- How We Work
- Project Stories
- Our Direction
- Company
- Start a Project

This avoids the small-contractor pattern of Home / Services / Gallery / About / Contact.

## Page Strategy

### Home

Purpose: Establish confidence fast.

Key sections:

- Hero with strong project imagery or short cinematic construction clip.
- Brand belief: "Every Project Starts With What Is at Stake."
- What We Build overview.
- How We Work overview.
- Project Stories preview.
- Buyer confidence section.
- Our Direction preview.
- Start a Project CTA.

Recommended hero headline options:

- Important Projects Deserve a Builder With Direction
- Building the Spaces Businesses Depend On
- Commercial Construction for What Comes Next

Recommended support copy:

Grandvista is a commercial construction partner helping owners, operators, and project teams move from business need to usable built environment through clear planning, field coordination, and accountable execution.

### What We Build

Purpose: Replace generic "services" with elevated commercial categories.

Content categories:

- Commercial Environments
- Restaurant / Food Service
- Retail / Customer-Facing Spaces
- Medical / Office
- Warehouse / Operational Facilities
- Ground-Up Commercial
- Tilt-Wall / Shell / Site-Driven Work
- Adaptive Reuse / Building Improvement
- Specialty Commercial Projects

Each category should explain:

- Who it serves.
- What is at stake.
- Common project risks.
- How Grandvista supports the work.
- Related project stories.

### How We Work

Purpose: Make Grandvista feel more mature and trustworthy.

Recommended process pillars:

- Project Discovery
- Scope Intelligence
- Budget Awareness
- Schedule Planning
- Permit and Inspection Readiness
- Trade Coordination
- Field Accountability
- Owner Communication
- Turnover Discipline

Core line:

Construction is built in the field, but won in the planning.

### Project Stories

Purpose: Turn completed work into business-development proof.

Each project story should include:

- Project name
- Project type
- Location
- Client type
- Project intent
- What was at stake
- Construction challenge
- Delivery approach
- Built outcome
- Photos
- Optional video
- Related build categories

Avoid simple labels like "restaurant remodel" or "salon finish-out." Reframe smaller projects as commercial environments with business purpose.

### Our Direction

Purpose: Communicate ambition without sounding fake.

Core title:

Built for What Comes Next

Core message:

Grandvista is building more than a project list. The company is building the systems, partnerships, documentation habits, and field discipline required for larger commercial and industrial work.

Avoid saying Grandvista already builds Apple campuses, data centers, oil rigs, or major national projects. Instead say Grandvista is growing toward larger commercial, corporate, industrial, and technically demanding environments.

### Company

Purpose: Tell the company story with credibility, restraint, and purpose.

Content should include:

- Who Grandvista is.
- What kind of work the company takes seriously.
- Why commercial construction matters to the company.
- How the team thinks about trust, field discipline, and growth.
- Leadership/team content when available.

### Start a Project

Purpose: Qualify serious opportunities and signal professional process.

CTA language:

- Start a Project Conversation
- Request a Project Review
- Talk Through a Project
- Discuss Your Next Build

Avoid:

- Free estimate
- Call now
- No job too small
- Best price

Recommended form fields:

- Name
- Company
- Email
- Phone
- Project location
- Project type
- New construction or existing space
- Estimated timeline
- Estimated budget range
- Current stage
- Architect/designer involved?
- Permit status
- Short project description
- File upload

## Visual Direction

The site should feel like construction, architecture, and business strategy.

### Palette

The existing logo uses navy, red, and white. The site should refine that into a more premium commercial palette:

- Deep navy / near black-blue
- Warm white
- Concrete gray
- Steel gray
- Controlled red accent
- Optional muted bronze/copper only if it does not fight the logo

Use red sparingly for calls to action, active states, and small brand moments. Avoid letting the site become too loud, patriotic, or contractor-template heavy.

### Typography

Use strong, condensed or sturdy headlines paired with a clean, highly readable body font. The typography should feel disciplined and commercial, not playful, luxury-real-estate, or generic tech.

### Imagery

Prioritize:

- Real jobsite activity
- Commercial interiors
- Exterior construction progress
- Materials, steel, framing, concrete, equipment
- Wide shots mixed with detail shots
- Before/during/after sequences
- Short field clips

Avoid:

- Generic smiling hard-hat stock photos
- Residential imagery
- Over-edited construction photos
- Images that feel staged or fake

## Technical Architecture

### Recommended Stack

- Frontend: Next.js
- Hosting/CDN: Vercel
- Database/CMS: Supabase Postgres
- Auth: Supabase Auth
- Media: Cloudinary, Mux, Vercel Blob, or Supabase Storage
- Email: Resend
- Analytics: Vercel Analytics plus Google Analytics or Plausible
- Heatmaps/session behavior later: Microsoft Clarity or Hotjar
- Redis later: Upstash Redis

### Performance Principle

The public website should not hit the database for every visitor. Public pages should be static, cached, or incrementally regenerated. The database should primarily support admin editing, lead capture, and controlled dynamic features.

### Caching Plan

Use:

- Static generation for main pages.
- Incremental Static Regeneration for CMS-driven pages.
- CDN caching for public pages and media.
- Responsive images with AVIF/WebP.
- Lazy loading for below-the-fold media.
- Video poster images and mobile fallbacks.

Redis is not required on day one, but should be planned for:

- Rate limiting forms.
- Aggregating page/project view counts.
- Caching admin dashboard summaries.
- Temporary lead/session intent tracking.
- Popular project ranking.

### Media Plan

Large images and clips are part of the brand experience, but they must be handled carefully.

Requirements:

- Desktop and mobile versions of hero video.
- Poster image for every video.
- Short clips, ideally 8-12 seconds.
- Muted autoplay only where appropriate.
- Pause control for accessibility.
- Static fallback for mobile or slow networks.
- CDN-hosted media.
- Upload compression workflow.

For Phase 1, Supabase Storage or Vercel Blob can work. If video becomes central to the brand, use Mux. If image transformations become heavy, use Cloudinary.

## Analytics And Capture

The site should capture more than page views. It should help Grandvista understand buyer intent.

Track:

- Page views
- Project story views
- Build-category interest
- CTA clicks
- Contact form starts
- Contact form submissions
- Phone/email clicks
- Scroll depth on project stories
- Traffic source and UTM data
- Device type
- City/region
- Returning visitors

Lead records should store:

- Source page
- Last viewed project category
- CTA clicked
- UTM campaign data
- Selected project type
- Budget range
- Timeline
- Current stage

This gives Grandvista better sales context when following up.

## CMS And Admin Requirements

The client should manage:

- Projects
- Project categories
- Project images/videos
- Homepage featured projects
- What We Build categories
- Process pillars
- Team/company content
- Testimonials
- Site settings
- Lead submissions
- Future insights/articles
- Future careers/subcontractor pages

Roles:

- Admin
- Editor
- Viewer

Admin should be simple and field-based. The client should not need to understand technical page-building to update project stories.

## Database Model

Phase 1 tables:

- projects
- project_categories
- project_media
- build_categories
- process_pillars
- leads
- lead_events
- team_members
- testimonials
- site_settings
- pages
- media_assets
- admin_profiles

Future tables:

- insights
- subcontractor_applications
- careers
- job_posts
- case_study_metrics
- newsletter_subscribers
- lead_pipeline_statuses

## Security And Reliability

Requirements:

- Protected admin routes
- Role-based admin access
- Supabase row-level security
- Server-side form validation
- File upload validation
- Spam protection with Cloudflare Turnstile or reCAPTCHA
- Rate limiting for forms
- Environment variable separation
- Database backups
- Error logging

## Phase Roadmap

### Phase 0: Strategy And Foundation

Goal: Confirm brand direction, site structure, technical architecture, and content model before UI build.

Tasks:

- Finalize positioning and messaging.
- Confirm audience matrix.
- Finalize navigation.
- Define sitemap.
- Define CMS content types.
- Define database schema.
- Define lead workflow.
- Define analytics events.
- Confirm media strategy.
- Select stack and services.

Deliverables:

- Strategy brief.
- Technical architecture.
- Content model.
- Initial wireframe direction.

### Phase 1: Brand And Website Foundation

Goal: Launch a credible, fast, mobile-friendly website with the core brand experience and lead capture.

Build:

- Next.js project setup.
- Design system foundations.
- Responsive layout shell.
- Homepage.
- What We Build page.
- How We Work page.
- Project Stories overview.
- Project detail template.
- Our Direction page.
- Company page.
- Start a Project form.
- Basic CMS/admin.
- Lead storage and email notifications.
- Image optimization.
- Analytics baseline.
- SEO metadata.

Success criteria:

- Website feels serious, commercial, and growth-minded.
- Client can manage project stories.
- Leads are captured and stored.
- Site is fast on mobile and desktop.
- Messaging speaks to buyer confidence.

### Phase 2: Proof And Media Expansion

Goal: Make the site stronger as a sales tool by deepening project proof and visual storytelling.

Build:

- Before/during/after project galleries.
- Short project video support.
- Project filters by category/type.
- Featured project modules.
- Stronger case study fields.
- Media library improvements.
- Better dashboard for lead review.
- Downloadable capability statement.
- Safety and Quality page.
- Subcontractor/Partner page.

Success criteria:

- Smaller projects feel meaningful and professionally delivered.
- Grandvista can show work by intent, not just image gallery.
- Better support for architects, developers, and subcontractors.

### Phase 3: Authority And Business Development

Goal: Support larger opportunities, search visibility, and outbound business development.

Build:

- Insights/articles section.
- SEO city/service landing pages.
- Careers page.
- Advanced lead scoring.
- CRM-style lead pipeline.
- Email campaign integration.
- Retargeting pixels if ads are used.
- Case study performance tracking.
- Subcontractor application workflow.

Success criteria:

- Site supports marketing campaigns and future hiring.
- Grandvista can see what visitors care about.
- Website becomes a business-development system, not just a brochure.

### Phase 4: Scalable Client/Project Platform

Goal: Prepare the site for higher traffic, richer workflows, and more operational use.

Build:

- Redis-backed rate limiting and view aggregation.
- Client portal exploration.
- Private file sharing for active leads or clients.
- Document upload/review workflows.
- Advanced admin reporting.
- Project update feeds.
- More robust media processing.

Success criteria:

- Site can support heavier traffic and richer client workflows.
- Backend remains protected from unnecessary public load.
- Grandvista has a scalable digital foundation.

## Immediate Implementation Order

1. Scaffold the Next.js app.
2. Add brand tokens for color, type, spacing, and layout.
3. Build static first-pass pages using structured content files.
4. Create the project story content model.
5. Add CMS/database once UI direction is stable.
6. Add lead form and analytics.
7. Optimize images/media.
8. Verify responsive behavior and performance.

## Working Principle

Build the website in a way that can start simple but grow serious:

- Static where possible.
- Dynamic only where useful.
- CMS-managed where the client needs control.
- Cached for public visitors.
- Structured for future sales, SEO, and operational workflows.

