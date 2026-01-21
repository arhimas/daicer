# UX & Admin: The SOTA Remediation Plan

> **Status**: **Major Pain Point**
> **Severity**: High (Bottleneck for Content Creation)
> **Reference**: `src/api/entity-sheet/content-types/entity-sheet/schema.json`

---

## 1. Current State (The "Components" Trap)
Inventory management is currently implemented as a **Repeatable Component** (`game.inventory-item`), NOT a direct Many-to-Many relation.

*   **Schema**: `src/api/entity-sheet/content-types/entity-sheet/schema.json` (Line 81)
    ```json
    "inventory": {
      "type": "component",
      "repeatable": true,
      "component": "game.inventory-item"
    }
    ```
*   **Implication**: To add an item, you don't just "Pick" it. You must "Create Component" -> "Select Item Reference" -> "Set Quantity" -> "Set Equipped Status".
*   **UI Friction**: Strapi's Content Manager collapses repeatable components. You can't see your inventory at a glance; you see `Item 1`, `Item 2`, `Item 3` (collapsed).

## 2. Problem & Root Cause
**Why is it a problem?**
- **Blindness**: You cannot see what a character is carrying without clicking 20 dropdowns.
- **Slowness**: Adding a "Starter Kit" (Sword, Shield, Armor, 5 Potions) takes ~25 clicks.

**Root Cause**:
1.  **Data Modeling**: Using a Repeatable Component (`game.inventory-item`) gives flexibility (custom quantity per sheet) but sacrifices UX (Strapi has no Grid View for components).
2.  **Tooling Gap**: We rely on the generic Data Editor instead of a specialized Game Editor.

---

## 3. High-Level SOTA Solution
**"The Visual Inventory Grid (Plugin)"**

We will build a custom **Inventory Manager Plugin** that visualizes `entity.inventory` as a **2D Grid of Slots**.

-   **Backend**: Remains `repeatable component`.
-   **Frontend**: A new Interface that abstracts the data structure.

---

## 4. Execution Plan (Phases)

### Phase 1: The "Inventory Manager" Component
**Goal**: Build a React interface that parses the confusing Component List into a sane Grid.

*   **Task 1.1: Data Transformer**
    *   *Input*: `[{ item: { name: "Sword" }, qty: 1, equipped: true }]`
    *   *Output*: `GridSlot[0] = { icon: "sword.png", count: 1 }`
    *   *Location*: `src/plugins/dm-screen/admin/src/components/InventoryManager`

*   **Task 1.2: Drag & Drop Logic**
    *   *Library*: Use `dnd-kit` or `react-beautiful-dnd`.
    *   *Action*: Dropping "Shield" onto Key 2 updates the Component List in the background (`form.setFieldValue('inventory', newListComponent)`).

### Phase 2: The "Compendium" Sidebar
**Goal**: Fast Item lookup.

*   **Task 2.1: Item API Hook**
    *   *Query*: `GET /api/items?filters[type]=weapon`.
    *   *Performance*: Implement `useQuery` with caching (React Query) so the list doesn't reload on every drag.

*   **Task 2.2: Quick Add Template**
    *   *Feature*: "Add Starter Pack".
    *   *Logic*: A single button that pushes *multiple* components into the `inventory` array at once.

### Phase 3: The "DM Screen" Dashboard
**Goal**: A Unified View for the Session.

*   **Task 3.1: Route Extension**
    *   *File*: `src/plugins/dm-screen/server/routes/index.ts`.
    *   *Route*: `/dashboard/:roomId`.
    *   *Access*: Admin Only.

*   **Task 3.2: Initiative Tracker**
    *   *Source*: `turn-pipeline.ts` snapshots or `activeTurn`.
    *   *UI*: A vertical sorting list that allows dragging entities to reorder initiative (writes to `entity-sheet.initiative`).
