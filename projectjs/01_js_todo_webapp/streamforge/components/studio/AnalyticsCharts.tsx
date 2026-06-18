"use client";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AnalyticsData } from "@/types/analytics";

interface Props { timeline: AnalyticsData["timeline"]; }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const tooltipStyle = { backgroundColor: "#1F1E24", border: "1px solid #2A292F", borderRadius: "8px", color: "#F5F3EE", fontSize: 12 };

export function ViewsChart({ timeline }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-display text-paper font-medium mb-4">Views over time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={timeline} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF5A36" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#FF5A36" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A292F" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#8C8983", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8C8983", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDate} />
          <Area type="monotone" dataKey="views" stroke="#FF5A36" strokeWidth={2} fill="url(#viewsGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EngagementChart({ timeline }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-display text-paper font-medium mb-4">Likes & new subscribers</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={timeline} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A292F" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#8C8983", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8C8983", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDate} />
          <Legend wrapperStyle={{ color: "#C9C6BD", fontSize: 12 }} />
          <Bar dataKey="likes" fill="#FF5A36" radius={[3, 3, 0, 0]} name="Likes" />
          <Bar dataKey="subscribers" fill="#8C8983" radius={[3, 3, 0, 0]} name="New subscribers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
