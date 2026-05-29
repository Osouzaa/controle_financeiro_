import { Add, Close, DeleteOutline, EditOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useCreateResource, useDeleteResource, useGoals, useUpdateResource } from '../api/queries';
import { PageHeader } from '../components/PageHeader';
import { money } from '../theme/theme';
import { formatCurrencyInput, parseCurrencyToDecimal } from '../utils/currency';

type GoalForm = { id?: string; nome: string; valorAlvo: string; valorAtual: string; prazo: string };

const dialogPaperProps = {
  sx: {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 24px 80px rgba(15,23,42,0.18)',
  },
};

const dialogTitleSx = {
  px: 3,
  py: 2.25,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 2,
  borderBottom: '1px solid',
  borderColor: 'divider',
};

const dialogActionsSx = {
  px: 3,
  py: 2,
  borderTop: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.default',
};

const emptyGoal = (): GoalForm => ({
  nome: '',
  valorAlvo: '',
  valorAtual: 'R$ 0,00',
  prazo: new Date().toISOString().slice(0, 10),
});

export function GoalsPage() {
  const { data = [], isLoading } = useGoals();
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalForm | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<GoalForm | null>(null);
  const remove = useDeleteResource('goals', ['goals', 'dashboard']);

  return (
    <Box>
      <PageHeader
        title="Metas"
        subtitle="Acompanhe reserva, viagens, carro e outros objetivos."
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingGoal(null);
              setOpen(true);
            }}
          >
            Nova meta
          </Button>
        }
      />
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      <Grid container spacing={2}>
        {data.map((goal) => {
          const percent = Math.min((Number(goal.valorAtual) / Number(goal.valorAlvo)) * 100, 100);
          return (
            <Grid item xs={12} md={4} key={goal.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 14px 32px rgba(15,23,42,0.06)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 2.4, '&:last-child': { pb: 2.4 } }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {goal.nome}
                      </Typography>
                      <Typography color="text.secondary" mt={0.5}>
                        Prazo: {goal.prazo}
                      </Typography>
                    </Box>
                    <Stack direction="row">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingGoal({
                            id: goal.id,
                            nome: goal.nome,
                            valorAlvo: formatCurrencyInput(String(goal.valorAlvo)),
                            valorAtual: formatCurrencyInput(String(goal.valorAtual)),
                            prazo: goal.prazo,
                          });
                          setOpen(true);
                        }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setGoalToDelete({
                            id: goal.id,
                            nome: goal.nome,
                            valorAlvo: goal.valorAlvo,
                            valorAtual: goal.valorAtual,
                            prazo: goal.prazo,
                          })
                        }
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Typography sx={{ fontWeight: 700, mt: 1.5 }}>
                    {money.format(Number(goal.valorAtual))} de {money.format(Number(goal.valorAlvo))}
                  </Typography>
                  <Box sx={{ height: 8, bgcolor: 'divider', borderRadius: 99, mt: 2, overflow: 'hidden' }}>
                    <Box sx={{ width: `${percent}%`, height: '100%', bgcolor: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <GoalDialog
        open={open}
        editingGoal={editingGoal}
        onClose={() => {
          setOpen(false);
          setEditingGoal(null);
        }}
      />
      <Dialog open={Boolean(goalToDelete)} onClose={() => setGoalToDelete(null)} fullWidth maxWidth="xs" PaperProps={dialogPaperProps}>
        <DialogTitle sx={dialogTitleSx}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Confirmar exclusao
          </Typography>
          <IconButton aria-label="fechar" onClick={() => setGoalToDelete(null)} size="small">
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <DialogContentText>Tem certeza que deseja apagar "{goalToDelete?.nome}"? Essa acao nao pode ser desfeita.</DialogContentText>
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button onClick={() => setGoalToDelete(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            disabled={remove.isPending}
            onClick={async () => {
              if (!goalToDelete?.id) return;
              await remove.mutateAsync(goalToDelete.id);
              setGoalToDelete(null);
            }}
          >
            Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function GoalDialog({ open, onClose, editingGoal }: { open: boolean; onClose: () => void; editingGoal: GoalForm | null }) {
  const [form, setForm] = useState<GoalForm>(emptyGoal());
  const create = useCreateResource('goals', ['goals', 'dashboard']);
  const update = useUpdateResource('goals', ['goals', 'dashboard']);

  useEffect(() => {
    if (open) {
      setForm(editingGoal || emptyGoal());
    }
  }, [editingGoal, open]);

  const save = async () => {
    const payload = {
      nome: form.nome,
      valorAlvo: parseCurrencyToDecimal(form.valorAlvo),
      valorAtual: parseCurrencyToDecimal(form.valorAtual),
      prazo: form.prazo,
    };

    if (editingGoal?.id) {
      await update.mutateAsync({ id: editingGoal.id, payload });
    } else {
      await create.mutateAsync(payload);
    }

    setForm(emptyGoal());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={dialogPaperProps}>
      <DialogTitle sx={dialogTitleSx}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingGoal ? 'Editar meta' : 'Nova meta'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Defina valor, progresso atual e prazo do objetivo.
          </Typography>
        </Box>
        <IconButton aria-label="fechar" onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2} mt={1}>
          <TextField label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <TextField label="Valor alvo" inputMode="numeric" value={form.valorAlvo} onChange={(e) => setForm({ ...form, valorAlvo: formatCurrencyInput(e.target.value) })} />
          <TextField label="Valor atual" inputMode="numeric" value={form.valorAtual} onChange={(e) => setForm({ ...form, valorAtual: formatCurrencyInput(e.target.value) })} />
          <TextField label="Prazo" type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} InputLabelProps={{ shrink: true }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={save} disabled={create.isPending || update.isPending}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
