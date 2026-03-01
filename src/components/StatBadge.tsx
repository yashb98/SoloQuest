"use client";

interface StatBadgeProps {
  rank: string;
  level: number;
}

const rankStyles: Record<string, string> = {
  E: "bg-gray-100 text-gray-600 border-gray-200",
  D: "bg-green-50 text-green-700 border-green-200",
  C: "bg-blue-50 text-blue-700 border-blue-200",
  B: "bg-purple-50 text-purple-700 border-purple-200",
  A: "bg-orange-50 text-orange-700 border-orange-200",
  S: "bg-yellow-50 text-yellow-700 border-yellow-300",
  National: "bg-red-50 text-red-700 border-red-200",
};

export default function StatBadge({ rank, level }: StatBadgeProps) {
  const style = rankStyles[rank] || rankStyles.E;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold tracking-[0.02em] border ${style}`}
    >
      {rank}-{level}
    </span>
  );
}
