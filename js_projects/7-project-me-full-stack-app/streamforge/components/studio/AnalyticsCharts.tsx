"use client";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AnalyticsData } from "@/types/analytics";

interface Props { timeline: AnalyticsData["timeline"]; }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const tooltipStyle = { backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#f9fafb", fontSize: 12 };

export function ViewsChart({ timeline }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <h3 className="text-white font-medium mb-4">Views over time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={timeline} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDate} />
          <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} fill="url(#viewsGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EngagementChart({ timeline }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <h3 className="text-white font-medium mb-4">Likes & new subscribers</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={timeline} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDate} />
          <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
          <Bar dataKey="likes" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Likes" />
          <Bar dataKey="subscribers" fill="#10b981" radius={[3, 3, 0, 0]} name="New subscribers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
