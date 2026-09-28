# Observation Window — Setup Checklist

**2026-09-20 through 2026-09-24.** Meta configuration frozen. Measurement is the work.

---

## Done (no action needed)

**Landing page instrumented.** Eight events added to `static/ai-check/index.html`, 64 lines, JS syntax validated, Hugo build clean.

| Event | Fires when |
|---|---|
| `five_second_visit` | 5s of *visible* time (a backgrounded tab does not accrue) |
| `ten_second_visit` | 10s visible |
| `thirty_second_visit` | 30s visible — separates a skim from a read |
| `hero_cta_click` | any "Request the free check" button |
| `form_visible` | form card ≥50% in viewport for ≥1 full second |
| `phone_click` / `text_click` / `email_click` | tel: / sms: / mailto: taps |

**The design property that matters:** every one of these sends *the moment it triggers*. None of them wait for page unload. GA4's built-in `user_engagement` is an unload beacon, which is exactly why it may be dying inside Instagram's webview. These cannot fail that way.

Each event carries `creative` and `adset` parameters pulled from the UTMs, so you can split D from E in GA4.

Each event also goes to the **Meta pixel** as a custom event. That matters later: a mid-funnel event like `ten_second_visit` happens often enough that Meta could eventually optimize toward it, which is a path out of the learning-phase problem that a rare Lead event can never solve.

**`form_submit` already existed.** The thank-you page fires `generate_lead` (GA4) and `fbq('track','Lead')`. Item 8 on the review's list was already covered.

**Scheduled 8:05am check rewritten** for the freeze: report-only, no changes permitted, reports the new events, and tracks the decision rule below.

---

## Your move, in order

### 1. Push the site change

```
cd "/Users/spencerstein/Downloads/ssj/Cowork/Life/Local /spencer-scott-digital"
git add static/ai-check/index.html
git commit -m "Add engagement and intent instrumentation to ai-check"
git push
```

Nothing below works until this is live.

### 2. GA4 → Admin → Data streams → web stream → **Enhanced measurement ON**

Currently off, which is why there is no `scroll` or `click` data at all. Turn it on as a backstop. Don't lean on its scroll event; `form_visible` is the better signal because it measures reaching the actual conversion area rather than a percentage of page height.

### 3. Run the controlled in-app test

The review was right that I shouldn't wave away the zero engagement as a webview problem without reproducing it. The new instrumentation makes this a clean test:

1. On your phone, **cellular not home wifi** (your home IP is filtered out of GA4).
2. Open Instagram. Find any link in a story or bio and tap it, so you're genuinely inside Instagram's in-app browser.
3. In that browser's address bar, go to `ailocalbusiness.biz/ai-check/`.
4. Stay **35 seconds**. Scroll down until the form is on screen. Don't submit.
5. Swipe the browser closed the way a normal person would.
6. GA4 → Reports → Realtime → **"Event count by event name"** card.

**Reading the result:**

| What you see | Meaning |
|---|---|
| `five/ten/thirty_second_visit` + `form_visible` present, `user_engagement` absent | **Webview beacon failure reproduced.** The 27 zeros were a measurement artifact and the new events are trustworthy. |
| All of them present including `user_engagement` | Tracking is fine. The 27 zeros were real behavior and E's traffic genuinely bounces. |
| None of them present | The push didn't land, or something is blocking the tag. Tell me. |

This is the single highest-value thing you can do today.

### 4. Tally

Check form views for Sep 18–19 while you're in there. The review is right that I oversold this: the iframe is `loading="lazy"` but its `src` is assigned immediately, so a browser can load it before it truly enters the viewport. Treat it as **directional, not proof**. `form_visible` supersedes it going forward.

---

## The decision rule, pre-committed

The review's statistical correction is right and I checked it. My "3%" assumed the 10% conversion rate was known, when it was 2 leads from 20 views. Running it properly as a Beta-Binomial:

| E's cumulative landing page views, still zero leads | Probability |
|---|---|
| 34 (where we are) | **5.1%** |
| 50 | 2.3% |
| **60** | **1.6%** |
| 80 | 0.8% |

So: **60 landing page views with zero leads is the threshold.** At 5.1% today the silence is suggestive but not conclusive. At 1.6% it is conclusive. At E's current ~17–19 views/day that lands in roughly 2–3 more days, which fits the freeze window almost exactly.

The daily check now reports the running count and will tell you when you cross it.

---

## On the economics, which the review raised and I had skipped

Allowable CPL = gross profit per client × close rate. Against the current **$71.60**:

| Gross profit per client | Close rate needed to break even at $71.60/lead |
|---|---|
| $500 | 14% |
| $1,500 | 5% |
| $3,000 | 2.4% |

Slot in your real numbers, including the hours it takes you to produce a report by hand. But on any plausible version of this, **$71.60 is probably fine**, and the whole optimization exercise may be premature relative to just getting more leads of any cost. Worth holding in mind before the window closes.

---

## Where I part company with the review, slightly

**It's right on everything structural.** Too reactive, measurement before optimization theory, no forced 50/50 Stories, static-on-Reels not disqualifying but high CTR not proof of intent, and the Tally caveat. I've adopted all of it.

**Two things I'd add:**

**The freeze isn't as clean as it reads.** D was changed to Stories-only and had its geo widened on 9/19, hours before the window opens. So D's first day or two inside the window is still settling from a change. It isn't a violation of the freeze, but don't read D's early numbers as a steady state.

**Meta-side instrumentation is the underrated part.** The review treats the new events purely as diagnostics. They're also a potential fix. If `ten_second_visit` or `form_visible` fires often enough, it becomes a viable optimization target, which addresses the root problem: a Lead event that fires twice a fortnight can never train anything. That's a candidate for after the window, not during.
