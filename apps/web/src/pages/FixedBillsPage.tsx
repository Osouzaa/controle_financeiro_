import { Add, CheckCircle, DeleteOutline, RadioButtonUnchecked } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import { useCreateResource, useDeleteFixedBill, useFixedBillChecklist, useToggleFixedBillPayment } from '../api/queries';
import { PageHeader } from '../components/PageHeader';
import { money } from '../theme/theme';
import { formatCurrencyInput, parseCurrencyToDecimal } from '../utils/currency';

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function FixedBillsPage() {
  return (
    <Box>
      <PageHeader
        title="Checklist mensal"
        subtitle="Contas fixas sem vencimento para conferir no fim do mês."
      />
      <FixedBillsPanel />
    </Box>
  );
}

export function FixedBillsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Despesas fixas</DialogTitle>
      <DialogContent>
        <FixedBillsChecklist />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

function FixedBillsPanel() {
  return (
    <Card sx={{ mb: 2.5 }}>
      <CardContent sx={{ p: { xs: 2, md: 2.4 }, '&:last-child': { pb: { xs: 2, md: 2.4 } } }}>
        <FixedBillsChecklist />
      </CardContent>
    </Card>
  );
}

function FixedBillsChecklist() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useFixedBillChecklist(month, year);
  const toggle = useToggleFixedBillPayment(month, year);
  const remove = useDeleteFixedBill(month, year);

  const paidPercent = data?.summary.total ? Math.round((data.summary.paid / data.summary.total) * 100) : 0;

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField select label="Mês" size="small" value={month} onChange={(event) => setMonth(Number(event.target.value))} sx={{ minWidth: 180 }}>
              {months.map((label, index) => (
                <MenuItem key={label} value={index + 1}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Ano" size="small" type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} sx={{ width: 120 }} />
          </Stack>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
            Conta fixa
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
          <SummaryItem label="Pagas" value={`${data?.summary.paid || 0}/${data?.summary.total || 0}`} />
          <SummaryItem label="Pendente" value={money.format(data?.summary.pendingAmount || 0)} />
          <SummaryItem label="Progresso" value={`${paidPercent}%`} />
        </Stack>
      </Stack>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      <TableContainer sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Conta fixa</TableCell>
              <TableCell>Finaliza em</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.items || []).map((item) => (
              <TableRow key={item.id} hover>
                <TableCell width={72}>
                  <Checkbox
                    checked={item.paid}
                    disabled={toggle.isPending}
                    icon={<RadioButtonUnchecked />}
                    checkedIcon={<CheckCircle />}
                    onChange={(event) => toggle.mutate({ id: item.id, paid: event.target.checked })}
                    sx={{ p: 0.5 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 700, textDecoration: item.paid ? 'line-through' : 'none' }}>
                    {item.nome}
                  </Typography>
                  <Typography variant="caption" color={item.paid ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 700 }}>
                    {item.paid ? 'Pago' : 'Pendente'}
                  </Typography>
                </TableCell>
                <TableCell>{item.endDate ? formatDate(item.endDate) : 'Sem data final'}</TableCell>
                <TableCell align="right">{item.valor ? money.format(Number(item.valor)) : '-'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="excluir conta fixa"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`Apagar "${item.nome}" das despesas fixas?`)) {
                        remove.mutate(item.id);
                      }
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!isLoading && !data?.items.length && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>Nenhuma conta fixa cadastrada.</Typography>
            <Typography color="text.secondary" mt={0.5}>
              Cadastre faculdade, seguro, aluguel ou qualquer conta recorrente para montar o checklist do mês.
            </Typography>
          </CardContent>
        </Card>
      )}

      <FixedBillDialog open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}

function formatDate(value?: string) {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
    </Box>
  );
}

function FixedBillDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [endDate, setEndDate] = useState('');
  const create = useCreateResource('fixed-bills', ['fixed-bills', 'fixed-bills-checklist']);

  const save = async () => {
    if (!nome.trim()) return;
    await create.mutateAsync({
      nome: nome.trim(),
      valor: valor ? parseCurrencyToDecimal(valor) : undefined,
      endDate: endDate || undefined,
    });
    setNome('');
    setValor('');
    setEndDate('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nova conta fixa</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Nome" value={nome} onChange={(event) => setNome(event.target.value)} autoFocus />
          <TextField
            label="Valor opcional"
            inputMode="numeric"
            value={valor}
            onChange={(event) => setValor(formatCurrencyInput(event.target.value))}
            helperText="Sem vencimento. Ela aparece no checklist de todo mês."
          />
          <TextField
            label="Data de finalização"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            helperText="Opcional. Deixe vazio para repetir todos os meses."
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={save} disabled={create.isPending || !nome.trim()}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
