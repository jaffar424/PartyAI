# CymbalMart Shopping Agent

## Overview
The **CymbalMart Shopping Agent** is an intelligent party planner and retail procurement agent designed specifically for busy hosts. It bridges the gap between high-level event intent and a fully finalized, budget-aligned shopping cart ready for CymbalMart 1-Hour Delivery or Curbside Pickup.

---

## Critical User Journey (CUJ)

* **User**: Busy hosts needing event planning.
* **Goal**: Convert intent into a curated, budget-conscious shopping list.

### Tasks & Stages:

### 1. Define Event
* **Party Type & Occasion**: Birthday, Game Day Tailgate, Backyard BBQ, Cocktail Soirée, Kids Adventure, Dinner Party, Holiday Gathering.
* **Theme & Vibe**: Custom theme or curated inspirations.
* **Budget**: Hard cap target budget ($) with real-time tracking against CymbalMart retail pricing.
* **Guest Count**: Adults and Kids count, automatically powering portion math (ice reserves, drink volume, appetizer pieces).
* **Special Requests**: Dietary accommodations (Vegetarian, Vegan, Gluten-Free, Nut-Free, Halal) and custom host requests.

### 2. Review List
* **Budget Alignment**: Real-time comparison of estimated total vs. host budget target, plus CymbalMart Member Rollback savings.
* **CymbalMart Aisles & Departments**:
  * Aisle 1: Fresh Produce & Bakery
  * Aisle 3: Butcher & Seafood
  * Aisle 5: Party Supplies & Paper Goods
  * Aisle 7: Snacks & Pantry Staples
  * Aisle 9: Beverages & Chilled Ice
* **Portion Math Explanations**: Exact justifications for each item (e.g. 1.5 lbs ice/guest, 25% tableware buffer).

### 3. Refine & Checkout
* **Refine Constraints**:
  * AI-powered dietary substitution (e.g. instant gluten-free or vegan swap).
  * 1-Click Budget Trimmer (cuts non-essential items to fit target budget).
  * Dynamic guest count scaling.
* **Finalize & Checkout**:
  * Fulfillment selection: **Curbside Pickup at CymbalMart Store #142**, **1-Hour Express Delivery**, or **Interactive In-Store Shopping Checklist**.
  * CymbalMart Member Rewards discount deduction.
  * Instant order receipt generation and export.

---

## Technical Stack
* **Client**: React 19, TypeScript, Tailwind CSS, Lucide icons.
* **Server**: Express full-stack backend with `@google/genai` Gemini 3.8 Flash.
* **Procurement Intelligence**: Calibrated portion calculators with resilient algorithmic fallback.
