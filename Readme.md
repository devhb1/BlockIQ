# BlockIQ - Blockchain IQ Quiz

![BlockIQ Logo](images/BlockIQ.png)

BlockIQ is a modern, interactive blockchain quiz web application. Users can test their knowledge of blockchain concepts, Base, EVM, and general crypto topics. The app features a pay-to-see-score mechanism using Ethereum, leveraging Web3 wallets and the Base L2 network.

---

## Features

- **100-question quiz** on blockchain, Base, and EVM topics.
- **Pay-to-see-score**: Users must pay a small ETH fee to reveal their score.
- **Web3 wallet integration**: Supports RainbowKit, WalletConnect, Coinbase Wallet, and Farcaster in-app wallet.
- **Responsive UI**: Built with Next.js, Tailwind CSS, and Radix UI components.
- **Shareable results**: Users can share their scores with friends.
- **Modern design**: Uses Geist fonts and a clean, accessible layout.

---

## Tech Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, PostCSS, Radix UI, Geist fonts
- **Web3**: wagmi, RainbowKit, viem, Base L2, WalletConnect
- **State & Data**: React hooks, TanStack React Query
- **Other**: Lucide icons, date-fns, recharts

---

## Folder Structure

```
frontend/
  app/                # Next.js app directory (pages, layout, global styles)
  components/         # UI and logic components (PayToSeeScore, ScoreDisplay, Web3Provider, etc.)
  hooks/              # Custom React hooks
  lib/                # Utility functions
  public/             # Static assets (logos, images)
  styles/             # Global CSS
  tailwind.config.ts  # Tailwind CSS config
  postcss.config.mjs  # PostCSS config
  next.config.mjs     # Next.js config
  package.json        # Project dependencies and scripts
images/
  BlockIQ.png         # Project logo
```

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
