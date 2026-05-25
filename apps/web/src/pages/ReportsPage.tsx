import { Download } from '@mui/icons-material';
import { Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { money } from '../theme/theme';

type Report = {
  monthly: Array<{ month: string; receitas: number; despesas: number }>;
  byCategory: Array<{ name: string; value: number }>;
  byCard: Array<{ name: string; value: number }>;
};

export function ReportsPage() {
  const year = new Date().getFullYear();
  const { data } = useQuery({ queryKey: ['reports', year], queryFn: async () => (await api.get<Report>(`/reports?year=${year}`)).data });

  const exportCsv = () => {
    const rows = ['mes,receitas,despesas', ...(data?.monthly || []).map((item) => `${item.month},${item.receitas},${item.despesas}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Relatórios" subtitle="Análise anual, categorias, cartões e exportação." action={<Button variant="contained" startIcon={<Download />} onClick={exportCsv}>Exportar Excel</Button>} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Mensal {year}</Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => money.format(Number(value))} />
                  <Bar dataKey="receitas" fill="#22C55E" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="despesas" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
