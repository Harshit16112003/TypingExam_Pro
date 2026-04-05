import { cn } from "../lib/utils";

export function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex flex-col items-center">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colors[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="mt-1 text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-lg font-bold text-gray-900">{value}</span>
    </div>
  );
}

export function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-extrabold text-indigo-600">{value}</span>
    </div>
  );
}

export function ProgressItem({ label, progress }: { label: string; progress: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-bold text-gray-900">{progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
