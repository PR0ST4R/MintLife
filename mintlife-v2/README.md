# MintLife

A peaceful corner of the internet — a calm, ad-free home for small interactive experiences.

This is a fully static site (HTML/CSS/vanilla JS). No build step, no framework, no backend required to run it.

## Running locally

Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 5500
```

Then open the printed URL in your browser.

## Connecting real Google Sign-In (required step)

MintLife uses **Google Identity Services** for sign-in — this is real OAuth, not a simulation. To activate it:

1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create a new project (or use an existing one).
3. Click **Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Under **Authorized JavaScript origins**, add every origin you'll run the site from, for example:
   - `http://localhost:5500`
   - `https://yourdomain.com`
6. Save, then copy the generated **Client ID** (looks like `xxxxx.apps.googleusercontent.com`).
7. Open `js/auth.js` and paste it in at the top:

   ```js
   const GOOGLE_CLIENT_ID = "xxxxx.apps.googleusercontent.com";
   ```

That's it — no other code changes are needed. The sign-in button renders Google's official button, and a successful sign-in returns a signed JWT that MintLife decodes client-side to read the user's name, email, and profile photo. Data is then scoped to that user's Google account ID in `localStorage`.

> For a production app wanting verified, tamper-proof server-side sessions, send the `credential` JWT from `handleCredentialResponse()` in `js/auth.js` to your own backend and verify it there (e.g. with `google-auth-library`), rather than trusting the client-decoded payload for anything sensitive.

## Connecting a real AI backend to "Roast My Website"

`js/roast-engine.js` is intentionally isolated behind a single function, `RoastEngine.generate(url)`. Swap its internals for a `fetch()` call to your own AI-powered endpoint — the rest of the app (`js/roast-my-website.js`) only depends on the return shape:

```js
{
  scores: { design, performance, seo, accessibility }, // 0–100
  roast: "string"
}
```

## Project structure

```
mintlife/
├── index.html              Home page
├── account.html            Account page
├── tools/
│   ├── fake-chat.html
│   ├── roast-my-website.html
│   └── time-capsule.html
├── css/
│   ├── style.css           Design system (colors, type, components)
│   ├── home.css
│   ├── tool.css
│   └── chat-platforms.css  Visual styles per chat app
├── js/
│   ├── theme.js            Light/dark mode, persisted
│   ├── toast.js
│   ├── loader.js           Animated leaf loader
│   ├── auth.js              Google Identity Services + guest mode
│   ├── storage.js          Per-account data layer
│   ├── nav.js               Shared navbar account UI
│   ├── chat-renderer.js    Builds chat HTML per platform
│   ├── fake-chat.js
│   ├── roast-engine.js
│   ├── roast-my-website.js
│   └── time-capsule.js
└── assets/
    └── logo.svg
```

## Notes on data & privacy

- **Google users**: data (theme preference, fake chat drafts, time capsules, last roasted URL) is saved in `localStorage`, namespaced by the signed-in Google account ID.
- **Guests**: nothing is written to `localStorage`. Time capsules and other data exist only in memory for that tab and are lost on reload/close — guests see a clear warning about this wherever it applies.
