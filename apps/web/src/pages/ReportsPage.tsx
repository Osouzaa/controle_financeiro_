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
      <PageHeader
        title="Relatórios"
        subtitle="Análise anual, categorias, cartões e exportação com dados prontos para decisão."
        action={
          <Button variant="contained" startIcon={<Download />} onClick={exportCsv}>
            Exportar Excel
          </Button>
        }
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 14px 32px rgba(15,23,42,0.06)',
            }}
          >
            <CardContent sx={{ p: 2.4, '&:last-child': { pb: 2.4 } }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                Mensal {year}
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => money.format(Number(value))} />
                  <Bar dataKey="receitas" fill="#22C55E" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="despesas" fill="#DC2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
