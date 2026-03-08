# Penalty System

The penalty system makes gold a real currency. You earn gold by completing quests, you lose gold when you fail quests or spend money in real life. Gold can go negative (debt).

**Core rule: 1 pound = 10 gold.**

---

## How You Lose Gold

### 1. Failed Daily Quests

**When:** End of each day (fires when the next day's reset runs).

**What happens:** Every daily quest you didn't complete gets penalized.

**Formula:**

```
penalty per quest = quest's goldBase
total daily penalty = sum of all failed quest goldBases
```

**Example:**
- "Morning workout" (goldBase: 15) - not completed = -15G
- "Read 30 mins" (goldBase: 10) - not completed = -10G
- "Apply to 2 jobs" (goldBase: 20) - completed = no penalty
- **Total penalty: -25G**

Each failed quest creates a Penalty record with reason `"quest_failed"` and description `"Failed daily: {title}"`.

---

### 2. Failed Weekly Quests

**When:** Every Monday (start of new week). Tracked via ISO week strings (e.g. `2026-W10`) stored in `hunter.lastWeeklyReset`.

**What happens:** Every weekly quest you didn't complete by end of Sunday gets penalized, then all weekly quests reset for the new week.

**Formula:**

```
penalty per quest = quest's goldBase
total weekly penalty = sum of all failed weekly quest goldBases
```

Each creates a Penalty record with description `"Failed weekly: {title}"`.

---

### 3. Spending (Real-Life Expenses)

**When:** Every time you log spending on the Savings page.

**Conversion:**

```
gold cost = round(amount in pounds * 10)
```

**Examples:**
| Spend | Gold Deducted |
|-------|---------------|
| Groceries for 30 pounds | -300G |
| Phone bill for 15 pounds | -150G |
| Coffee for 3.50 pounds | -35G |
| Rent for 800 pounds | -8,000G |

Each spend creates a Penalty record with reason `"spending"` and description like `"Groceries (30.00 pounds)"`.

**Debt is allowed.** If you have 50G and spend 100 pounds (1,000G), you go to -950G.

---

### 4. Streak Break

**When:** You miss a full day without completing any quests (and have no streak shields).

**Formula:**

```
penalty = min(floor(current gold * 0.10), 500)
```

- 10% of your gold, capped at 500G max
- Streak resets to 0

**Protection:** Streak shields (max 3, earned every 21-day streak milestone) block this penalty entirely.

**Examples:**
| Current Gold | Penalty |
|-------------|---------|
| 200G | -20G |
| 2,000G | -200G |
| 6,000G | -500G (capped) |
| -500G (in debt) | 0G (10% of negative is 0) |

---

## Debt System

Gold can go negative. When in debt:

- **TopBar** shows a skull icon with red "DEBT -XXG" instead of the normal gold coin
- **Penalties page** shows a red warning banner: "You owe XXXG. Complete quests to clear your debt."
- There's no restriction on spending while in debt (you can keep spending)
- Earn gold back by completing quests to clear the debt

---

## Quest Deletion

Some quests are one-time (e.g. "Update LinkedIn profile"). After completing them, you can delete them so they don't come back.

**Rules:**
- Delete button (red trash icon) only appears on **completed** quests
- Soft delete: quest is marked `isActive: false` (not removed from DB)
- Inactive quests don't show up on the quest board and don't reset daily/weekly
- Prevents false penalties for tasks you've already permanently done

---

## The Reset Flow (When Penalties Fire)

When the daily reset route (`POST /api/quests/reset`) fires:

```
1. Check streak (did you complete anything yesterday?)
   - Yes: streak + 1
   - No shields: lose 10% gold (max 500), streak = 0
   - Has shield: use shield, keep streak

2. Award streak milestone bonuses (gold + titles)

3. Penalize incomplete DAILY quests
   - For each: penalty = goldBase
   - Create Penalty records

4. If Monday: Penalize incomplete WEEKLY quests
   - For each: penalty = goldBase
   - Create Penalty records
   - Reset all weekly quests

5. Reset all daily quests (mark incomplete)

6. Update hunter gold:
   gold += streakBonus - streakPenalty - dailyPenalties - weeklyPenalties
```

---

## Penalty Data Model

```
Penalty {
  id          Int       - Auto-increment
  questId     Int?      - Links to quest (null for spending)
  questTitle  String    - Quest name for display
  goldLost    Int       - Amount deducted
  reason      String    - "quest_failed" or "spending"
  description String    - Human-readable explanation
  createdAt   DateTime  - When it happened
}
```

---

## Penalties Page (`/penalties`)

Shows:
1. **Current gold** (red if in debt)
2. **Debt warning banner** (if gold < 0)
3. **Summary cards**: Today / This Week / This Month totals
4. **Monthly breakdown**: Failed quests vs Spending split
5. **Today's penalties**: List with icons (swords for quest fails, credit card for spending)
6. **Full history**: Last 50 penalties with timestamps

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/quests/reset` | POST | Triggers daily/weekly penalties + resets |
| `/api/savings` | POST | Log spending (deducts gold) |
| `/api/penalties` | GET | Get penalty history + summaries |
| `/api/quests?id=X` | DELETE | Soft-delete a completed quest |

---

## Summary

| Penalty Type | Trigger | Formula | Cap |
|---|---|---|---|
| Daily quest fail | End of day | goldBase per quest | None |
| Weekly quest fail | Monday | goldBase per quest | None |
| Spending | Manual log | 1 pound = 10G | None (debt allowed) |
| Streak break | Miss a day | 10% of gold | 500G max |
