import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COMPANY_COLORS } from "../config";

type Props = { data: Record<string, number | string>[]; companies: string[] };

export function RankingChart({ data, companies }: Props) {
  return (
    <div className="chart-wrap" aria-label="일자별 평균 순위 흐름 차트">
      <ResponsiveContainer width="100%" height={330}>
        <LineChart data={data} margin={{ top: 16, right: 18, left: -18, bottom: 6 }}>
          <CartesianGrid stroke="#e8edf4" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} minTickGap={36} />
          <YAxis reversed domain={[1, 10]} ticks={[1, 2, 4, 6, 8, 10]} tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}위`, "평균 순위"]} />
          {companies.map((company) => (
            <Line
              key={company}
              dataKey={company}
              name={company}
              type="monotone"
              stroke={COMPANY_COLORS[company]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
