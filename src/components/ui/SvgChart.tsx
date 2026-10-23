'use client';

import React from 'react';
import { formatInr } from '@/lib/currency';

interface ChartDataPoint {
  date: string;
  label: string;
  amountPaise: number;
}

interface SvgChartProps {
  data: ChartDataPoint[];
  title?: string;
}

export default function SvgChart({ data, title = 'Sales Trends' }: SvgChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-400 text-sm">
        No sales data recorded for this time range.
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amountPaise), 10000); // minimum scale of ₹100
  const height = 220;
  const paddingBottom = 30;
  const paddingTop = 20;
  const chartHeight = height - paddingBottom - paddingTop;

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-base font-bold text-stone-900">{title}</h3>
        <span className="text-xs text-stone-500 font-medium">Last 7 Days (₹ INR)</span>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[480px]">
          <svg
            viewBox={`0 0 ${data.length * 70 + 40} ${height}`}
            className="w-full h-56 overflow-visible"
          >
            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = paddingTop + chartHeight * (1 - pct);
              const labelPaise = Math.round(maxAmount * pct);
              return (
                <g key={pct}>
                  <line
                    x1="30"
                    y1={y}
                    x2={data.length * 70 + 30}
                    y2={y}
                    stroke="#f0ece6"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x="24"
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-stone-400 font-mono"
                  >
                    {formatInr(labelPaise, true, false)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((point, index) => {
              const barWidth = 34;
              const x = 50 + index * 70;
              const barHeight = Math.max(4, (point.amountPaise / maxAmount) * chartHeight);
              const y = paddingTop + (chartHeight - barHeight);

              return (
                <g key={point.date} className="group cursor-pointer">
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="6"
                    className="fill-amber-600 group-hover:fill-amber-500 transition-colors"
                  />

                  {/* Value on Hover / Top */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {formatInr(point.amountPaise, true, false)}
                  </text>

                  {/* X Axis Label */}
                  <text
                    x={x + barWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    className="text-[11px] fill-stone-500 font-medium"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
