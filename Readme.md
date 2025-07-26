
# BlockIQ – Blockchain IQ Quiz (Farcaster Mini App)

![BlockIQ Logo](images/BlockIQ.png)

BlockIQ is a modern, interactive blockchain quiz web application and a fully-featured, production-ready Farcaster Mini App. This README is a **comprehensive, step-by-step guide** to building, deploying, and publishing a Farcaster Mini App from scratch. Use it as a reference for your own projects or to onboard new developers!

---

## Table of Contents

1. [What is a Farcaster Mini App?](#what-is-a-farcaster-mini-app)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure Overview](#project-structure-overview)
5. [Step-by-Step: Build BlockIQ & Farcaster Mini App](#step-by-step-build-blockiq--farcaster-mini-app)
6. [How This Project Was Built: Approach & Workflow](#how-this-project-was-built-approach--workflow)
7. [Useful Links & References](#useful-links--references)
8. [Final Tips for Juniors](#final-tips-for-juniors)

---

## What is a Farcaster Mini App?

A **Farcaster Mini App** is a web app that runs inside the Farcaster social protocol ecosystem (e.g., Warpcast, Nook). It can be embedded, discovered, and interacted with natively in Farcaster clients. Mini Apps:
- Use a signed manifest (`/.well-known/farcaster.json`) for discovery and verification
- Integrate with the Farcaster Mini App SDK for wallet and context
- Must call `sdk.actions.ready()` to signal readiness (hides splash screen)
- Require strict Content Security Policy (CSP) and security headers
- Can be shared, embedded, and indexed in Farcaster

---

## Features

- **100-question quiz** on blockchain, Base, and EVM topics.
- **Pay-to-see-score**: Users must pay a small ETH fee to reveal their score.
- **Web3 wallet integration**: Supports RainbowKit, WalletConnect, Coinbase Wallet, and Farcaster in-app wallet.
- **Responsive UI**: Built with Next.js, Tailwind CSS, and Radix UI components.
- **Shareable results**: Users can share their scores with friends.
- **Modern design**: Uses Geist fonts and a clean, accessible layout.
- **Security-focused**: Implements strict Content Security Policy (CSP) for Farcaster/Warpcast compatibility and safe wallet connections.

---

## Tech Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, PostCSS, Radix UI, Geist fonts
- **Web3**: wagmi, RainbowKit, viem, Base L2, WalletConnect, Privy
- **State & Data**: React hooks, TanStack React Query
- **Other**: Lucide icons, date-fns, recharts

---

## Project Structure Overview

```
frontend/
  app/                # Next.js app directory (pages, layout, global styles)
  components/         # UI and logic components (PayToSeeScore, ScoreDisplay, Web3Provider, etc.)
  hooks/              # Custom React hooks
  lib/                # Utility functions
  public/             # Static assets (logos, images)
    .well-known/      # Farcaster manifest
  styles/             # Global CSS
  tailwind.config.ts  # Tailwind CSS config
  postcss.config.mjs  # PostCSS config
  next.config.mjs     # Next.js config (includes CSP for Farcaster/Warpcast)
  package.json        # Project dependencies and scripts
images/
  BlockIQ.png         # Project logo
```

---

## Step-by-Step: Build BlockIQ & Farcaster Mini App

This guide is written for junior devs and anyone new to Farcaster Mini Apps. Follow each step carefully and ask questions if anything is unclear!

### 1. Project Setup

```sh
mkdir blockiq-mini-app && cd blockiq-mini-app
npx create-next-app@latest frontend --typescript
cd frontend
pnpm install
```

**Why?** This sets up a modern Next.js project with TypeScript for type safety and maintainability.

### 2. Styling Setup

- Install Tailwind CSS and PostCSS:
  ```sh
  pnpm install tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- Configure `tailwind.config.ts` and `postcss.config.mjs` as in the repo.
- Add Geist fonts: Download or install via npm, then import in `app/layout.tsx`.

**Why?** Tailwind and Geist provide a clean, responsive, and accessible UI foundation.

### 3. UI Component Libraries

- Install Radix UI, Lucide icons, and Geist:
  ```sh
  pnpm install @radix-ui/react-* lucide-react geist
  ```
- Build reusable UI components in `components/ui/` (buttons, dialogs, etc.).

**Why?** Radix UI and Lucide icons help you build accessible, beautiful interfaces quickly.

### 4. Web3 Integration

- Install wagmi, RainbowKit, viem, WalletConnect, and Privy:
  ```sh
  pnpm install wagmi @wagmi/core @wagmi/connectors @rainbow-me/rainbowkit viem privy
  ```
- Create `Web3Provider.tsx` and `ClientWeb3Provider.tsx` for wallet context and connection logic.
- Configure supported wallets (RainbowKit, WalletConnect, Coinbase, Farcaster in-app wallet).

**Why?** These libraries abstract wallet connections and blockchain interactions, making Web3 UX seamless.

### 5. Quiz Logic

- In `app/page.tsx`, define the `Question` type and import the full question pool from a separate file (e.g., `components/Quiz/quiz-questions.ts`).
- Use React hooks for quiz state, progress, and answer logic.
- Add navigation, answer selection, and progress indicators.

**Why?** Separating questions and logic keeps code maintainable and scalable.

### 6. Pay-to-See-Score Feature

- Create `PayToSeeScore.tsx`:
  - Use wagmi hooks to connect wallet, send ETH, and confirm transactions.
  - On payment success, reveal the score.
- Handle errors and edge cases (insufficient funds, rejected transactions).

**Why?** This feature demonstrates real blockchain utility and monetization.

### 7. Score Display & Sharing

- Create `ScoreDisplay.tsx`:
  - Show score, percentage, time spent, and a share button.
  - Use badges and icons for feedback.
- Implement social sharing (copy link, share to Farcaster, etc.).

**Why?** Sharing results increases engagement and virality.

### 8. Theming & Responsiveness

- Use Tailwind CSS for all styling.
- Add dark mode support via `next-themes` and Tailwind config.
- Test on mobile and desktop.

**Why?** Responsive, themeable UIs are essential for modern apps.

### 9. Security & Farcaster Integration

- Update `next.config.mjs` to set strict Content Security Policy (CSP) headers:
  - Allow Farcaster/Warpcast as frame ancestors.
  - Allow WalletConnect, Privy, and other endpoints in `connect-src`.
- Add `.well-known/farcaster.json` manifest for Farcaster Mini App registration.
- Test in Farcaster/Warpcast preview to ensure splash screen hides and app loads.

**Why?** Proper CSP is required for Farcaster/Warpcast embedding and secure wallet connections.

### 10. Testing, Debugging, and Polish

- Test the app on desktop and mobile.
- Add debug/test panels for development (remove before production).
- Polish UI, add tooltips, ensure accessibility (ARIA, keyboard navigation).

**Why?** Quality assurance and polish make your app production-ready.

### 11. Deployment

- Deploy on Vercel:
  - Push your code to GitHub.
  - Connect your repo to Vercel and deploy.
  - Set environment variables for wallet integrations as needed.
- After deploy, verify CSP headers and Farcaster/Warpcast preview.

**Why?** Vercel provides fast, reliable hosting for Next.js apps.

### 12. Farcaster Mini App Registration & Manifest

- Create `public/.well-known/farcaster.json` with your app metadata:
  ```json
  {
    "miniapp": {
      "version": "1",
      "name": "BlockIQ Quiz",
      "iconUrl": "https://www.blockiq.xyz/BlockIQ.png",
      "homeUrl": "https://www.blockiq.xyz/",
      "description": "Test your blockchain IQ!"
      // ...other fields
    }
  }
  ```
- Deploy your app so the manifest is accessible at `https://yourdomain.com/.well-known/farcaster.json`.
- Go to the [Warpcast Manifest Tool](https://warpcast.com/manifest), enter your domain, and follow the steps to **sign** the manifest with your Farcaster custody address.
- Update your manifest with the `accountAssociation` block from the tool.

### 13. Metadata and Embed Tags

- In `layout.tsx`, add OpenGraph, Twitter, and `fc:miniapp` meta tags for sharing and embedding.
- Add a favicon (`/BlockIQ.png`) for browser and Farcaster preview.

### 14. Troubleshooting & Best Practices

- **CSP errors:** Double-check your `next.config.mjs` and purge CDN cache if needed.
- **"Ready not called" error:** Ensure `sdk.actions.ready()` is called after full render, only once, and only in Farcaster.
- **Manifest not found:** Ensure `.well-known/farcaster.json` is accessible and signed.
- **App not showing in search:** Use a production domain, complete manifest, and register via the manifest tool.
- **WalletConnect issues:** Add all required domains to CSP, and avoid double-initializing wallet providers.
- **Debugging:** Add debug logs and test components to verify SDK and environment.

---

## How This Project Was Built: Approach & Workflow

1. **Planning:**
   - Defined the quiz concept, user flow, and requirements for Farcaster Mini App compatibility.
   - Researched official docs and best practices.
2. **Project Setup:**
   - Bootstrapped with Next.js, TypeScript, and Tailwind CSS.
   - Set up GitHub and Vercel for CI/CD.
3. **UI/UX Design:**
   - Designed a mobile-first, touch-friendly UI with clear branding (logo, name, header).
   - Used Card components for quiz, results, and payment.
4. **SDK Integration:**
   - Added `@farcaster/miniapp-sdk` and implemented a singleton manager for `ready()`.
   - Ensured robust environment detection and race condition handling.
5. **Manifest & Metadata:**
   - Created a compliant, signed manifest with all required and recommended fields.
   - Added OpenGraph, Twitter, and `fc:miniapp` meta tags for sharing and embedding.
6. **Security & CSP:**
   - Set strict CSP and security headers in `next.config.mjs`.
   - Allowed all required domains for Farcaster and wallet providers.
7. **Testing:**
   - Tested locally, in browser, and in Farcaster preview tool.
   - Debugged CSP, manifest, and SDK issues with logs and test components.
8. **Deployment:**
   - Deployed to Vercel with a custom domain.
   - Purged cache and verified headers after each deploy.
9. **Registration:**
   - Registered and signed the manifest using the Warpcast tool.
   - Verified app was indexed and discoverable in Farcaster.

---

## Useful Links & References

- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/docs/)
- [Neynar: Convert Web App to Mini App](https://docs.neynar.com/docs/convert-web-app-to-mini-app)
- [Warpcast Manifest Tool](https://warpcast.com/manifest)
- [Farcaster Mini App Preview Tool](https://miniapps.farcaster.xyz/preview)
- [Farcaster Mini App SDK](https://www.npmjs.com/package/@farcaster/miniapp-sdk)
- [Example Mini App Quiz](https://github.com/sodofi/miniapp-quiz)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

## Final Tips for Juniors

- **Read the codebase**: Understand how each part works—ask questions!
- **Use version control**: Commit often, write clear messages.
- **Test thoroughly**: Try every feature, especially wallet and Farcaster integration.
- **Keep security in mind**: CSP, wallet safety, and user privacy are critical.
- **Ask for feedback**: Senior devs are here to help you grow.

---

**You now have a complete, step-by-step reference for building and deploying Farcaster Mini Apps. Use this as your playbook for all future projects!**

---

## Guide: Building BlockIQ from Scratch:

This guide is written  to learn how to build a modern, secure, Web3-enabled Next.js app like BlockIQ. Follow each step carefully and ask questions if anything is unclear!

### 1. **Project Initialization**

```sh
mkdir blockiq-mini-app && cd blockiq-mini-app
npx create-next-app@latest frontend --typescript
cd frontend
pnpm install
```

**Why?** This sets up a modern Next.js project with TypeScript for type safety and maintainability.

### 2. **Styling Setup**

- Install Tailwind CSS and PostCSS:
  ```sh
  pnpm install tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- Configure `tailwind.config.ts` and `postcss.config.mjs` as in the repo.
- Add Geist fonts: Download or install via npm, then import in `app/layout.tsx`.

**Why?** Tailwind and Geist provide a clean, responsive, and accessible UI foundation.

### 3. **UI Component Libraries**

- Install Radix UI, Lucide icons, and Geist:
  ```sh
  pnpm install @radix-ui/react-* lucide-react geist
  ```
- Build reusable UI components in `components/ui/` (buttons, dialogs, etc.).

**Why?** Radix UI and Lucide icons help you build accessible, beautiful interfaces quickly.

### 4. **Web3 Integration**

- Install wagmi, RainbowKit, viem, WalletConnect, and Privy:
  ```sh
  pnpm install wagmi @wagmi/core @wagmi/connectors @rainbow-me/rainbowkit viem privy
  ```
- Create `Web3Provider.tsx` and `ClientWeb3Provider.tsx` for wallet context and connection logic.
- Configure supported wallets (RainbowKit, WalletConnect, Coinbase, Farcaster in-app wallet).

**Why?** These libraries abstract wallet connections and blockchain interactions, making Web3 UX seamless.

### 5. **Quiz Logic**

- In `app/page.tsx`, define the `Question` type and import the full question pool from a separate file (e.g., `components/Quiz/quiz-questions.ts`).
- Use React hooks for quiz state, progress, and answer logic.
- Add navigation, answer selection, and progress indicators.

**Why?** Separating questions and logic keeps code maintainable and scalable.

### 6. **Pay-to-See-Score Feature**

- Create `PayToSeeScore.tsx`:
  - Use wagmi hooks to connect wallet, send ETH, and confirm transactions.
  - On payment success, reveal the score.
- Handle errors and edge cases (insufficient funds, rejected transactions).

**Why?** This feature demonstrates real blockchain utility and monetization.

### 7. **Score Display & Sharing**

- Create `ScoreDisplay.tsx`:
  - Show score, percentage, time spent, and a share button.
  - Use badges and icons for feedback.
- Implement social sharing (copy link, share to Farcaster, etc.).

**Why?** Sharing results increases engagement and virality.

### 8. **Theming & Responsiveness**

- Use Tailwind CSS for all styling.
- Add dark mode support via `next-themes` and Tailwind config.
- Test on mobile and desktop.

**Why?** Responsive, themeable UIs are essential for modern apps.

### 9. **Security & Farcaster Integration**

- Update `next.config.mjs` to set strict Content Security Policy (CSP) headers:
  - Allow Farcaster/Warpcast as frame ancestors.
  - Allow WalletConnect, Privy, and other endpoints in `connect-src`.
- Add `.well-known/farcaster.json` manifest for Farcaster Mini App registration.
- Test in Farcaster/Warpcast preview to ensure splash screen hides and app loads.

**Why?** Proper CSP is required for Farcaster/Warpcast embedding and secure wallet connections.

### 10. **Testing, Debugging, and Polish**

- Test the app on desktop and mobile.
- Add debug/test panels for development (remove before production).
- Polish UI, add tooltips, ensure accessibility (ARIA, keyboard navigation).

**Why?** Quality assurance and polish make your app production-ready.

### 11. **Deployment**

- Deploy on Vercel:
  - Push your code to GitHub.
  - Connect your repo to Vercel and deploy.
  - Set environment variables for wallet integrations as needed.
- After deploy, verify CSP headers and Farcaster/Warpcast preview.

**Why?** Vercel provides fast, reliable hosting for Next.js apps.

---

## Running the Project

```sh
cd frontend
pnpm install
pnpm dev
```
Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## Deployment

- Deploy on Vercel, Netlify, or your preferred platform.
- Set environment variables for wallet integrations as needed.
- Ensure CSP headers are set for Farcaster/Warpcast compatibility.

---

## License

MIT

---

## Final Tips :

- **Read the codebase**: Understand how each part works—ask questions!
- **Use version control**: Commit often, write clear messages.
- **Test thoroughly**: Try every feature, especially wallet and Farcaster integration.
- **Keep security in mind**: CSP, wallet safety, and user privacy are critical.
- **Ask for feedback**: Senior devs are here to help you grow.

Feel free to further customize this README for your needs!

---

## How to Build BlockIQ from Scratch

### 1. **Initialize the Project**

```sh
mkdir blockiq-mini-app && cd blockiq-mini-app
npx create-next-app@latest frontend --typescript
cd frontend
pnpm install
```

### 2. **Set Up Styling**

- Install Tailwind CSS and PostCSS:
  ```sh
  pnpm install tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- Configure `tailwind.config.ts` and `postcss.config.mjs` as in the repo.
- Add Geist fonts and set up in `app/layout.tsx`.

### 3. **Add UI Component Libraries**

- Install Radix UI, Lucide icons, and Geist:
  ```sh
  pnpm install @radix-ui/react-* lucide-react geist
  ```

### 4. **Set Up Web3 Integration**

- Install wagmi, RainbowKit, viem, and WalletConnect:
  ```sh
  pnpm install wagmi @wagmi/core @wagmi/connectors @rainbow-me/rainbowkit viem
  ```
- Create `Web3Provider.tsx` and `ClientWeb3Provider.tsx` for wallet context.

### 5. **Build the Quiz Logic**

- In `app/page.tsx`, define the `Question` type and the full question pool.
- Implement quiz state, progress, and answer logic using React hooks.

### 6. **Implement Pay-to-See-Score**

- Create `PayToSeeScore.tsx`:
  - Use wagmi hooks to connect wallet, send ETH, and confirm transactions.
  - On payment success, reveal the score.

### 7. **Display Results**

- Create `ScoreDisplay.tsx`:
  - Show score, percentage, time spent, and a share button.
  - Use badges and icons for feedback.

### 8. **Add Theming and Responsiveness**

- Use Tailwind CSS for all styling.
- Add dark mode support via `next-themes` and Tailwind config.

### 9. **Configure Next.js**

- Update `next.config.mjs` for security headers and image optimization.
- Ignore build errors for TypeScript and ESLint during builds (for rapid prototyping).

### 10. **Test and Polish**

- Test the app on desktop and mobile.
- Polish UI, add helpful tooltips, and ensure accessibility.

---

## Running the Project

```sh
cd frontend
pnpm install
pnpm dev
```
Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## Deployment

- Deploy on Vercel, Netlify, or your preferred platform.
- Set environment variables for wallet integrations as needed.

---

## License

MIT

---

Feel free to further customize this README for your needs!
