import { zodResolver } from '@hookform/resolvers/zod';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAccounts, useCards, useCategories, useCreateResource } from '../api/queries';
import { formatCurrencyInput, parseCurrencyToDecimal } from '../utils/currency';

const schema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  valor: z.string().min(1),
  descricao: z.string().min(2),
  categoryId: z.string().optional(),
  paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH', 'TRANSFER', 'BANK_SLIP']).optional(),
  accountId: z.string().optional(),
  cardId: z.string().optional(),
  dueDate: z.string().optional(),
  parcelas: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof schema>;

const dialogPaperProps = {
  sx: {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 24px 80px rgba(15,23,42,0.18)',
  },
};

export function QuickTransactionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: cards = [] } = useCards();
  const create = useCreateResource('transactions', ['transactions', 'dashboard', 'future-installments', 'cards']);
  const { control, register, handleSubmit, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', paymentMethod: 'PIX' },
  });
  const type = watch('type');
  const paymentMethod = watch('paymentMethod');

  const submit = handleSubmit(async (values) => {
    const isIncome = values.type === 'INCOME';
    await create.mutateAsync({
      ...values,
      valor: parseCurrencyToDecimal(values.valor),
      data: new Date().toISOString().slice(0, 10),
      paymentMethod: isIncome ? undefined : values.paymentMethod,
      cardId: isIncome ? undefined : values.cardId,
      dueDate: isIncome ? undefined : values.dueDate,
      parcelas: !isIncome && values.parcelas && values.parcelas > 1 ? values.parcelas : undefined,
    });
    reset({ type: 'EXPENSE', paymentMethod: 'PIX' });
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={dialogPaperProps}>
      <DialogTitle
        sx={{
          px: 3,
          py: 2.25,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Lançamento rápido
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registre uma movimentação sem sair da tela atual.
          </Typography>
        </Box>
        <IconButton aria-label="fechar" onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2} mt={1}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup exclusive fullWidth value={field.value} onChange={(_, value) => value && field.onChange(value)}>
                <ToggleButton value="EXPENSE">Despesa</ToggleButton>
                <ToggleButton value="INCOME">Receita</ToggleButton>
              </ToggleButtonGroup>
            )}
          />
          <Controller
            name="valor"
            control={control}
            render={({ field }) => (
              <TextField
                label="Valor"
                autoFocus
                inputMode="numeric"
                value={field.value || ''}
                onChange={(event) => field.onChange(formatCurrencyInput(event.target.value))}
              />
            )}
          />
          <TextField label={type === 'INCOME' ? 'Origem do ganho' : 'Descrição'} {...register('descricao')} />
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <FormControl>
                <InputLabel>Categoria</InputLabel>
                <Select label="Categoria" {...field} value={field.value || ''}>
                  {categories
                    .filter((category) => category.tipo === type)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.nome}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          />
          {type === 'EXPENSE' && (
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <InputLabel>Pagamento</InputLabel>
                  <Select label="Pagamento" {...field}>
                    <MenuItem value="PIX">PIX</MenuItem>
                    <MenuItem value="DEBIT_CARD">Débito</MenuItem>
                    <MenuItem value="CREDIT_CARD">Crédito</MenuItem>
                    <MenuItem value="CASH">Dinheiro</MenuItem>
                    <MenuItem value="TRANSFER">Transferência</MenuItem>
                    <MenuItem value="BANK_SLIP">Boleto</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          )}
          {type === 'EXPENSE' && paymentMethod === 'CREDIT_CARD' ? (
            <>
              <Controller
                name="cardId"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <InputLabel>Cartão</InputLabel>
                    <Select label="Cartão" {...field} value={field.value || ''}>
                      {cards.map((card) => (
                        <MenuItem key={card.id} value={card.id}>
                          {card.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <TextField
                label="Fatura"
                type="date"
                helperText="Opcional. Vazio usa o vencimento do cartão."
                InputLabelProps={{ shrink: true }}
                {...register('dueDate')}
              />
              <TextField label="Parcelas" type="number" inputProps={{ min: 1 }} {...register('parcelas')} />
            </>
          ) : (
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <InputLabel>Conta</InputLabel>
                  <Select label="Conta" {...field} value={field.value || ''}>
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={create.isPending}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
