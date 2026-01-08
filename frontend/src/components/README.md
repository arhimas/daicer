<div align="center">

# 🧱 Daicer Components (`src/components`)

**The Building Blocks.**

> **Atomic Design meets Video Game UI.**

</div>

---

## 📂 Organization

We roughly follow Atomic Design, but mapped to Gameplay Concepts.

### 1. `ui/` (The Primitives)

These are "Dumb" components. They have no game logic.

- **`Button`**: The standard neo-brutalist interaction point.
- **`Card`**: Glassmorphic containers.
- **`Input`**: Styled form elements.

### 2. `game/` (The Gameplay)

These are "Smart" components connected to `useGameStore`.

- **`TurnTracker`**: The initiative ribbon at the top of the screen.
- **`ChatBox`**: The socket-connected narrative stream.
- **`CharacterSheet`**: The complex tabbed interface for player stats.

### 3. `layout/` (The Shell)

- **`GameLayout`**: The HUD wrapper (incorporates the 3D Canvas + UI Overlay).
- **`LobbyLayout`**: The pre-game screens.

---

## 🎨 Design Rules

1.  **Strict Dark Mode**: There is no light theme. Do not add one.
2.  **Tailwind Tokens**: Use `bg-surface-900`, not `bg-black`.
3.  **Framer Motion**: Use `<AnimatePresence>` for all mount/unmount events.
