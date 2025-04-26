
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CaseStatusData = {
  name: string;
  quantidade: number;
  cor: string;
};

type CaseStatusChartProps = {
  data: CaseStatusData[];
};

export function CaseStatusChart({ data }: CaseStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Casos</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip 
              formatter={(value) => [`${value} casos`]}
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
              }}
            />
            {data.map((entry, index) => (
              <Bar
                key={`bar-${index}`}
                dataKey="quantidade"
                fill={entry.cor}
                name={entry.name}
                barSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
