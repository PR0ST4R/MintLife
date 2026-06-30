/* ===========================================================
   roast-engine.js — generates scores + a roast for a URL
   ===========================================================

   This is intentionally structured behind a single async function,
   RoastEngine.generate(url), so a real AI backend can be dropped in
   later without touching any UI code.

   TO CONNECT A REAL AI BACKEND LATER:
   Replace the body of `generate()` with a fetch() call to your
   server endpoint, e.g.:

     async function generate(url) {
       const res = await fetch("/api/roast", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ url })
       });
       return res.json(); // must match the RoastResult shape below
     }

   RoastResult shape:
   {
     scores: { design: 0-100, performance: 0-100, seo: 0-100, accessibility: 0-100 },
     roast: "string, multi-paragraph"
   }
   =========================================================== */

const RoastEngine = (() => {

  const OPENERS = [
    "Well, well, well.",
    "Let's be honest with each other.",
    "Okay, I clicked the link. I have thoughts.",
    "First impressions matter, and yours just walked in wearing socks and sandals.",
    "I'll be gentle. Mostly.",
  ];

  const DESIGN_LINES = [
    "the color palette looks like it was chosen during a power outage",
    "someone really committed to the 2014 gradient renaissance",
    "the layout has main character energy but supporting character execution",
    "there's a font on here doing entirely too much emotional labor",
    "the whitespace is either intentional minimalism or a missing CSS file — hard to say",
    "it has the confident chaos of a site built at 2am with conviction",
  ];

  const PERF_LINES = [
    "loading speed suggests the server is also taking a moment for itself",
    "the page loads at a pace best described as 'reflective'",
    "performance-wise, this site is in no rush, and honestly, neither are we anymore",
    "it loaded fast enough that I didn't have time to make tea, which I respect",
    "somewhere, a hamster on a wheel is personally responsible for this load time",
  ];

  const SEO_LINES = [
    "search engines will find this site the way you find your keys: eventually, with effort",
    "the meta tags are giving 'optional homework'",
    "ranking on page one feels less like a goal and more like a personality trait it doesn't have yet",
    "Google might index this sometime this fiscal quarter",
  ];

  const A11Y_LINES = [
    "accessibility-wise, it's trying, and that counts for something",
    "alt text exists here the way vegetables exist in a kid's meal: technically",
    "contrast ratios are having a small disagreement with readability",
    "it mostly works with a screen reader, in the same way a maze 'mostly' has an exit",
  ];

  const CLOSERS = [
    "Anyway — keep going, it's got potential, and someone out there genuinely loves it (probably whoever built it).",
    "In its defense, every great site started out a little rough. This one's just... rougher.",
    "Ship it anyway. Iteration is a love language.",
    "I'm rooting for you. Quietly. From a distance.",
  ];

  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function seededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function pick(rand, arr) {
    return arr[Math.floor(rand() * arr.length)];
  }

  function scoreFor(rand, base) {
    const val = Math.round(base + (rand() - 0.5) * 50);
    return Math.max(28, Math.min(96, val));
  }

  function normalizeUrl(input) {
    let url = input.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    return url;
  }

  async function generate(rawUrl) {
    const url = normalizeUrl(rawUrl);
    let hostname = url;
    try {
      hostname = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      /* keep raw */
    }

    const seed = hashString(hostname + new Date().toDateString());
    const rand = seededRandom(seed);

    const scores = {
      design: scoreFor(rand, 70),
      performance: scoreFor(rand, 65),
      seo: scoreFor(rand, 60),
      accessibility: scoreFor(rand, 68),
    };

    const roast = [
      pick(rand, OPENERS),
      `I took a look at **${hostname}**, and ${pick(rand, DESIGN_LINES)}.`,
      `On performance: ${pick(rand, PERF_LINES)}.`,
      `As for SEO, ${pick(rand, SEO_LINES)}.`,
      `And accessibility — ${pick(rand, A11Y_LINES)}.`,
      pick(rand, CLOSERS),
    ].join("\n\n");

    // simulate a small amount of "thinking" time for the experience
    await new Promise((r) => setTimeout(r, 900));

    return { scores, roast, hostname };
  }

  return { generate, normalizeUrl };
})();
