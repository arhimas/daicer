# Store & Vendor System Study Case

## 1. Overview

The goal is to implement a system where the DM can spawn a **Vendor** (NPC) in a room. Players can interact with this Vendor to buy/sell items using a currency system (Gold). The Agent (LLM) will mediate negotiations and expose items for sale.

## 2. Current State Analysis

### 2.1 Backend Entities

- **Character**: Contains `race`, `class`, `equipment` (inventory).
  - _Gap_: No explicit `currency` field found in schema, though submission payload includes it.
- **EntitySheet**: The instance in the room. Contains `inventory`.
  - _Gap_: No explicit `currency` field found in schema.
- **Equipment**: Well-defined schema (`api::equipment` and `inventory-item` component). Includes `cost_quantity` and `cost_unit`.

### 2.2 Frontend

- **Character Creation**: Has a polished `EquipmentShop` component.
- **Gold Logic**: Currently handled in `useEquipmentLogic` state (`equipmentGold`) and sent in payload as `currency: { gp: ... }`.
- **Missing**: Verified that this `currency` data is likely lost or unpersisted on the backend due to schema mismatch.

## 3. High-Level Design (Proposed)

### 3.1 Primitive Coin Register

We need a persistent way to store player wealth.

- **Schema Change**: Add a `currency` JSON field to both `Character` (blueprint) and `EntitySheet` (instance).
- **Structure**:
  ```json
  {
    "pp": 0, // Platinum
    "gp": 0, // Gold
    "ep": 0, // Electrum
    "sp": 0, // Silver
    "cp": 0 // Copper
  }
  ```
- **UI**: A simple "Coin Register" on the character sheet to view and edit these values manually (Primitive Phase).

### 3.2 Vendor Entity

A Vendor is simply an **NPC Entity** with an inventory of items they want to sell.

- **Identification**: The DM (or LLM) tags an entity as a "Vendor".
- **Inventory**: The `inventory` component on the `EntitySheet` serves as the "Store Stock".
- **Prices**: Default to the `Equipment` database `cost`. Optionally, the Vendor can have a `priceModifier` (e.g., 1.5x) stored in a metadata field (future).

### 3.3 LLM Negotiation Flow

1.  **Context**: When a player interacts with a Vendor, the LLM receives the Vendor's `inventory` and the Player's `currency`.
2.  **Negotiation**: The LLM roleplays the merchant.
3.  **Transaction**:
    - If the player buys an item, the Agent invokes a tool (e.g., `transfer_item` + `deduct_currency`).
    - _Action_: We need a `trade_transaction` tool that handles the atomic swap of Item <-> Gold.

### 3.4 Frontend Store Interface

We can reuse and adapt the `EquipmentShop` component for live gameplay.

- **Mode**: `game` mode (checks gold limits).
- **Source**: Instead of "All Items", it filters to display _only_ items in the target Vendor's inventory.
- **Integration**: Clicking "Trade" on a Vendor opens this modal.

## 4. Entity Structure (Refined)

### 4.1 Character / Entity Sheet

- **Race**: Linked via `api::race`.
- **Body Parts**: The user requested "two hands, two feet".
  - Current `inventory-item` slots: `main_hand`, `off_hand`, `hands` (gloves), `feet` (boots).
  - _Recommendation_: Keep current slots for simplicity unless specific "left/right" tracking is needed for mechanics. The generic `hands` and `feet` slots cover standard 5e equipment rules.

### 4.2 Equipment

- Existing schema is robust (`weight`, `cost`, `damage`, `properties`).
- No changes needed immediately.

## 5. Implementation Roadmap

1.  **Backend Schema Update**:
    - Add `currency` (JSON) to `Character` and `EntitySheet`.
    - Re-generate types.
2.  **Data Migration**:
    - Update `spawn-service` to initialize currency.
3.  **Frontend Update**:
    - Display `currency` on the Player Sheet.
    - Create `VendorView` component (adapter for `EquipmentShop`).
4.  **Agent Tools**:
    - Create `manage_currency` tool (add/remove gold).
    - Create `trade_item` tool.

---

_Created by Antigravity_
