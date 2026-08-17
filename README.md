# Choco's Biscuit Quest

A 2D side-scrolling adventure starring Choco, a chibi chocolate lab. Collect dog biscuits, grab hot dogs for extra lives, boop woodland critters, and reach the doghouse.

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL shown by Vite.

## Controls

- Move: `A` / `D` or arrow keys
- Jump: `W`, Up Arrow, or Space
- Touch controls appear automatically on touch devices

## Game modes

- **Normal** (default): enemies and pit falls cost one life
- **Casual**: enemies only knock Choco back, and pit falls respawn Choco without costing a life

Choose a mode on the title screen with the buttons, Left/Right, or `N` / `C`.

## Build

```powershell
npm run build
npm run preview
```

All game art is original pixel art generated at runtime with Phaser. No external image or audio assets are required.

The original meadow chiptune soundtrack is synthesized at runtime with the Web Audio API and can be toggled from the game header.
