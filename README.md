# Agent pocket

![Banner](src/res/banner.png)

Agent pocket is a lightweight EVM wallet extension focused on fast signing and relay-driven agent workflows.

Website: **https://apocket.xyz**

## Overview

Agent pocket is built as a Chrome extension wallet with:
- local key management
- multi-network EVM support
- transaction/signature confirmation flow
- WebSocket relay integration for external app or agent requests

This repository currently uses a practical demo-first implementation, suitable for development, internal testing, and iterative product validation.

## Core Features

- Multi-network support:
  - BNB Smart Chain (BSC)
  - Ethereum
  - Arbitrum One
  - Polygon
- Wallet lifecycle:
  - create wallet (mnemonic)
  - import wallet (mnemonic / private key)
  - show address / receive QR
- Transaction flow:
  - send native token transfers
  - confirmation popup (`#confirm`) for relay-triggered requests
- Token management:
  - add custom ERC-20 by contract address
  - fetch token balances per selected network
- Relay capabilities:
  - WebSocket-based request channel
  - whitelist pubkey checks
  - nonce and signature verification for inbound relay payloads
- UI direction:
  - Neumorphism + glass-like visual style
  - yellow / orange palette aligned with BNB chain tone

## Tech Stack

- Frontend: React 18 + Vite
- Chain interaction: ethers v6
- QR rendering: react-qr-code
- Relay signature verification: tweetnacl
- Runtime target: Chrome Extension (Manifest-based)

## Project Structure

```text
src/
  background/        Background service and relay bootstrap
  components/        Shared UI components
  pages/             Wallet screens (Home, Send, Receive, Settings, ...)
  lib/               Core controllers (keyring, networks, relay, tokens, tx)
  styles/            Global theme and UI style system
  res/               Static assets (logo, banner)
docs/                Functional and protocol docs
scripts/             Utility scripts (e.g. rpc testing)
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start dev server

```bash
npm run dev
```

### 3. Build extension assets

```bash
npm run build
```

Build output goes to `dist/`.

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder (or `dist/` based on your packaging flow)

## Configuration Notes

- Network selection is persisted in `chrome.storage.local`.
- Relay URL can be set from Settings.
- Whitelist and auto-confirm options are available in Settings.

## Security Notes (Important)

- This project currently stores vault data in extension local storage for workflow continuity.
- Before production deployment, harden key management with audited encryption, secure unlock/session flow, and stricter secret handling.
- Never use development wallets with meaningful funds.

## Roadmap Suggestions

- stronger wallet encryption and password UX
- hardware wallet / MPC compatibility
- richer transaction decoding and risk hints
- multi-account management
- telemetry and reliability monitoring for relay

## License

No explicit license is declared yet. Add a `LICENSE` file before public distribution.