"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ============================================================
// Custom Tooltip Component (Shared)
// ============================================================
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-neutral-400 mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-neutral-300">
            {entry.name}: <strong className="text-white">{entry.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 1. User Registration Trend (Area Chart)
// ============================================================
export function UserRegistrationChart({
  data,
}: {
  data: { month: string; users: number; premium: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#737373", fontSize: 12 }}
          axisLine={{ stroke: "#262626" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#737373", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#a3a3a3" }}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="users"
          name="Total Registrations"
          stroke="#3b82f6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUsers)"
        />
        <Area
          type="monotone"
          dataKey="premium"
          name="Premium Users"
          stroke="#f59e0b"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPremium)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// 2. Workspace Creation Trend (Bar Chart)
// ============================================================
export function WorkspaceCreationChart({
  data,
}: {
  data: { month: string; roadmap: number; dashboard: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#737373", fontSize: 12 }}
          axisLine={{ stroke: "#262626" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#737373", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#a3a3a3" }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="roadmap"
          name="Roadmap"
          fill="#f59e0b"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
        <Bar
          dataKey="dashboard"
          name="Dashboard"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// 3. Subscription Tier Pie Chart
// ============================================================
const TIER_COLORS = ["#525252", "#f59e0b"];

export function TierDistributionPieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }: any) => {
            if (!active || !payload || !payload.length) return null;
            const entry = payload[0];
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
            return (
              <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 shadow-xl">
                <p className="text-sm text-white font-medium">
                  {entry.name}: {entry.value}
                </p>
                <p className="text-xs text-neutral-400">{pct}% of total</p>
              </div>
            );
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#a3a3a3" }}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-neutral-400">{value}</span>
          )}
        />
        {/* Center Label */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white text-2xl font-bold"
        >
          {total}
        </text>
        <text
          x="50%"
          y="56%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-neutral-500 text-xs"
        >
          Total Users
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// 4. Revenue Trend (Area Chart)
// ============================================================
export function RevenueTrendChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#737373", fontSize: 12 }}
          axisLine={{ stroke: "#262626" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#737373", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip
          content={({ active, payload, label }: any) => {
            if (!active || !payload || !payload.length) return null;
            return (
              <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 shadow-xl">
                <p className="text-xs text-neutral-400 mb-1">{label}</p>
                <p className="text-sm text-emerald-400 font-bold">
                  Rp {payload[0].value.toLocaleString("id-ID")}
                </p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue (IDR)"
          stroke="#10b981"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
