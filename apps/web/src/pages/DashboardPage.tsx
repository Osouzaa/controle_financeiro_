import {
  AccountBalance,
  CreditCard,
  EventBusy,
  Paid,
  Savings,
  Today,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../api/queries";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { money } from "../theme/theme";

export function DashboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data, isLoading } = useDashboard(month, year);
  const years = useMemo(() => [year - 1, year, year + 1], [year]);

  const hasCategoryData = Boolean(
    data?.charts.byCategory.some((item) => item.value > 0),
  );
  const hasCardData = Boolean(
    data?.charts.byCard.some((item) => item.value > 0),
  );
  const hasMonthlyData = Boolean(
    data?.charts.monthlyEvolution.some(
      (item) => item.receitas > 0 || item.despesas > 0,
    ),
  );

  const stats = [
    ["Saldo atual", data?.cards.saldoAtual, <AccountBalance />, "#22C55E"],
    ["Receitas do mes", data?.cards.receitasMes, <TrendingUp />, "#22C55E"],
    ["Despesas do mes", data?.cards.despesasMes, <TrendingDown />, "#EF4444"],
    ["Gasto hoje", data?.cards.gastoHoje, <Today />, "#EF4444"],
    ["Total cartao", data?.cards.totalCartao, <CreditCard />, "#A61E22"],
    ["Total investido", data?.cards.totalInvestido, <Savings />, "#2563EB"],
    ["Saldo final do mes", data?.cards.saldoFinalMes, <Wallet />, "#22C55E"],
    ["Contas pendentes", data?.cards.contasPendentes, <EventBusy />, "#F97316"],
    ["Receitas previstas", data?.cards.receitasPrevistas, <Paid />, "#22C55E"],
    [
      "Despesas previstas",
      data?.cards.despesasPrevistas,
      <TrendingDown />,
      "#EF4444",
    ],
  ] as const;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader
        title="Dashboard"
        subtitle="Visao mensal de saldo, cartoes, alertas e evolucao financeira."
        action={
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <TextField
              select
              size="small"
              label="Mes"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              sx={{ minWidth: 110, flex: 1 }}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <MenuItem key={index + 1} value={index + 1}>
                  {String(index + 1).padStart(2, "0")}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Ano"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              sx={{ minWidth: 110, flex: 1 }}
            >
              {years.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mt: -1 }}>
        {stats.map(([label, value, icon, tone]) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={2.4}
            key={label}
            sx={{ minWidth: 0 }}
          >
            <StatCard
              label={label}
              value={
                typeof value === "number" && label !== "Contas pendentes"
                  ? money.format(value)
                  : String(value ?? 0)
              }
              icon={icon}
              tone={tone}
              loading={isLoading}
            />
          </Grid>
        ))}
      </Grid>

      {Boolean(data?.alertas.length) && (
        <Stack spacing={1.5}>
          {data?.alertas.map((alerta) => (
            <Alert severity="warning" key={alerta}>
              {alerta}
            </Alert>
          ))}
        </Stack>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Gastos por categoria">
            {isLoading ? (
              <Skeleton height={280} />
            ) : hasCategoryData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.charts.byCategory || []}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={105}
                    label
                  >
                    {(data?.charts.byCategory || []).map((entry) => (
                      <Cell key={entry.name} fill={entry.color || "#A61E22"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => money.format(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhuma despesa categorizada neste mes." />
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Evolucao financeira">
            {isLoading ? (
              <Skeleton height={280} />
            ) : hasMonthlyData ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.charts.monthlyEvolution || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(47,47,47,0.12)"
                  />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => money.format(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="receitas"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="A evolucao aparece assim que houver receitas ou despesas." />
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Receitas vs despesas">
            {isLoading ? (
              <Skeleton height={280} />
            ) : hasMonthlyData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.charts.incomeVsExpense || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(47,47,47,0.12)"
                  />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => money.format(Number(value))} />
                  <Bar
                    dataKey="receitas"
                    fill="#22C55E"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="despesas"
                    fill="#EF4444"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Compare receitas e despesas depois dos primeiros lancamentos." />
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Gastos por cartao">
            {isLoading ? (
              <Skeleton height={280} />
            ) : hasCardData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.charts.byCard || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(47,47,47,0.12)"
                  />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => money.format(Number(value))} />
                  <Bar dataKey="value" fill="#A61E22" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Os gastos por cartao aparecem ao usar credito." />
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Typography variant="h6">{title}</Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        height: 300,
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "rgba(47,47,47,0.02)",
        px: 2,
        textAlign: "center",
      }}
    >
      <Typography fontWeight={800}>Sem dados no periodo</Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {message}
      </Typography>
    </Stack>
  );
}
