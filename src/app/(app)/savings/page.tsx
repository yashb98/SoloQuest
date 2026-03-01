"use client";

import { useEffect, useState, useCallback } from "react";
import { PiggyBank, TrendingUp, CreditCard, Plus } from "lucide-react";

interface SavingsData {
  pots: Record<string, number>;
  recentSpending: Array<{
    id: number;
    category: string;
    amount: number;
    description: string;
    spentAt: string;
  }>;
  monthlyByCategory: Record<string, number>;
  monthlyTotal: number;
}

const potConfig = [
  { key: "rewards", label: "Rewards Fund", icon: "🎁", color: "text-sq-gold" },
  { key: "certs", label: "Certifications", icon: "📜", color: "text-sq-blue" },
  { key: "emergency", label: "Emergency", icon: "🛡️", color: "text-sq-green" },
];

const spendCategories = [
  "essentials",
  "daily",
  "food",
  "social",
  "transport",
  "other",
];

export default function SavingsPage() {
  const [data, setData] = useState<SavingsData | null>(null);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [showAddSpend, setShowAddSpend] = useState(false);
  const [formPot, setFormPot] = useState("rewards");
  const [formAmount, setFormAmount] = useState("");
  const [formNote, setFormNote] = useState("");
  const [spendCategory, setSpendCategory] = useState("food");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendDesc, setSpendDesc] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/savings");
    setData(await res.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSavings = async () => {
    if (!formAmount) return;
    await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "savings",
        pot: formPot,
        amount: parseFloat(formAmount),
        action: "deposit",
        note: formNote || undefined,
      }),
    });
    setFormAmount("");
    setFormNote("");
    setShowAddSavings(false);
    fetchData();
  };

  const handleAddSpend = async () => {
    if (!spendAmount || !spendDesc) return;
    await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "spend",
        category: spendCategory,
        amount: parseFloat(spendAmount),
        description: spendDesc,
      }),
    });
    setSpendAmount("");
    setSpendDesc("");
    setShowAddSpend(false);
    fetchData();
  };

  if (!data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-border/30 rounded w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="sq-panel p-6 h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalSaved = Object.values(data.pots).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-sq-gold">
          SAVINGS VAULT
        </h1>
        <span className="font-mono text-sm text-sq-muted">
          Total: £{totalSaved.toFixed(2)}
        </span>
      </div>

      {/* Savings Pots */}
      <div className="grid gap-4 sm:grid-cols-3">
        {potConfig.map((pot) => (
          <div key={pot.key} className="sq-panel p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{pot.icon}</span>
              <span className="font-display font-semibold text-sm text-sq-text">
                {pot.label}
              </span>
            </div>
            <p className={`font-mono text-2xl font-bold ${pot.color}`}>
              £{(data.pots[pot.key] || 0).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowAddSavings(!showAddSavings)}
          className="sq-button-gold flex items-center gap-2 text-sm"
        >
          <PiggyBank className="w-4 h-4" />
          Add Savings
        </button>
        <button
          onClick={() => setShowAddSpend(!showAddSpend)}
          className="sq-button-blue flex items-center gap-2 text-sm"
        >
          <CreditCard className="w-4 h-4" />
          Log Spending
        </button>
      </div>

      {/* Add Savings Form */}
      {showAddSavings && (
        <div className="sq-panel p-4 space-y-3">
          <h3 className="font-display font-semibold text-sm text-sq-gold">
            Deposit to Savings
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={formPot}
              onChange={(e) => setFormPot(e.target.value)}
              className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono"
            >
              {potConfig.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Amount (£)"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono"
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono"
            />
          </div>
          <button onClick={handleAddSavings} className="sq-button-gold text-sm">
            <Plus className="w-4 h-4 inline mr-1" />
            Deposit
          </button>
        </div>
      )}

      {/* Add Spend Form */}
      {showAddSpend && (
        <div className="sq-panel p-4 space-y-3">
          <h3 className="font-display font-semibold text-sm text-sq-blue">
            Log Spending
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={spendCategory}
              onChange={(e) => setSpendCategory(e.target.value)}
              className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono"
            >
              {spendCategories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Amount (£)"
              value={spendAmount}
              onChange={(e) => setSpendAmount(e.target.value)}
              className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono"
            />
            <input
              type="text"
              placeholder="Description"
              value={spendDesc}
              onChange={(e) => setSpendDesc(e.target.value)}
              className="bg-sq-bg border border-sq-border rounded-md px-3 py-2 text-sm text-sq-text font-mono"
            />
          </div>
          <button onClick={handleAddSpend} className="sq-button-blue text-sm">
            <Plus className="w-4 h-4 inline mr-1" />
            Log
          </button>
        </div>
      )}

      {/* Monthly Spending Summary */}
      <div className="sq-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-sq-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sq-blue" />
            This Month
          </h3>
          <span className="font-mono text-sm text-sq-muted">
            £{data.monthlyTotal.toFixed(2)}
          </span>
        </div>
        {Object.entries(data.monthlyByCategory).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(data.monthlyByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amount]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-mono text-sq-muted capitalize">
                    {cat}
                  </span>
                  <span className="font-mono text-sq-text">
                    £{amount.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sq-muted font-mono text-xs">
            No spending logged this month.
          </p>
        )}
      </div>

      {/* Recent Transactions */}
      {data.recentSpending.length > 0 && (
        <div className="sq-panel p-4 space-y-3">
          <h3 className="font-display font-semibold text-sm text-sq-text">
            Recent Spending
          </h3>
          <div className="space-y-2">
            {data.recentSpending.slice(0, 10).map((spend) => (
              <div
                key={spend.id}
                className="flex items-center justify-between text-xs border-b border-sq-border/30 pb-2"
              >
                <div>
                  <span className="font-mono text-sq-text">
                    {spend.description}
                  </span>
                  <span className="ml-2 font-mono text-sq-muted capitalize">
                    ({spend.category})
                  </span>
                </div>
                <span className="font-mono text-sq-text">
                  £{spend.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
