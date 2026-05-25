import { Add, CheckCircle, DeleteOutline, EditOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
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
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useAccounts, useCards, useCategories, useCreateResource, useDeleteResource, usePayTransaction, useTransactions, useUpdateResource } from '../api/queries';
import { PageHeader } from '../components/PageHeader';
import { TransactionType } from '../types/domain';
import { money } from '../theme/theme';
import { formatCurrencyInput, parseCurrencyToDecimal } from '../utils/currency';

type Props = {
  title: string;
  type?: TransactionType;
  resource?: 'categories' | 'accounts' | 'cards';
};

export function ListPage({ title, type, resource }: Props) {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, string> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Record<string, string> | null>(null);
  const params = type ? `?type=${type}` : '';
  const isResourcePage = Boolean(resource);
  const transactions = useTransactions(params, !isResourcePage);
  const categories = useCategories(!resource || resource === 'categories');
  const accounts = useAccounts(!resource || resource === 'accounts');
  const cards = useCards(!resource || resource === 'cards');
  const pay = usePayTransaction();
  const deleteResource = useDeleteResource(resource || 'transactions', [resource || 'transactions', 'dashboard', 'cards', 'future-installments']);

  const resourceData = resource === 'categories' ? categories.data : resource === 'accounts' ? accounts.data : resource === 'cards' ? cards.data : undefined;

  return (
    <Box>
      <PageHeader
        title={title}
        subtitle="Cadastre, filtre e acompanhe seus dados financeiros."
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingItem(null);
              setOpen(true);
            }}
          >
            Novo
          </Button>
        }
      />
      {((!isResourcePage && transactions.isLoading) ||
        (resource === 'categories' && categories.isLoading) ||
        (resource === 'accounts' && accounts.isLoading) ||
        (resource === 'cards' && cards.isLoading)) && <LinearProgress sx={{ mb: 2 }} />}
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          {resource ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Detalhes</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Acoes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(resourceData || []).map((item: any) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>
                        {resource === 'categories' && <Chip size="small" label={item.tipo === 'INCOME' ? 'Receita' : 'Despesa'} sx={{ bgcolor: item.cor, color: '#fff' }} />}
                        {resource === 'accounts' && money.format(Number(item.saldoInicial))}
                        {resource === 'cards' && `${money.format(Number(item.gasto || 0))} usados de ${money.format(Number(item.limite))}`}
                      </TableCell>
                      <TableCell>{resource === 'accounts' ? (item.ativo ? 'Ativa' : 'Inativa') : 'Ativo'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label="editar"
                          onClick={() => {
                            setEditingItem(normalizeResourceForEdit(resource, item));
                            setOpen(true);
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" aria-label="excluir" onClick={() => setItemToDelete(item)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Fatura</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Pagamento</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(transactions.data?.items || []).map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.data}</TableCell>
                      <TableCell>{item.paymentMethod === 'CREDIT_CARD' ? item.dueDate || '-' : '-'}</TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>{item.descricao}</Typography>
                        {item.isInstallment && (
                          <Typography variant="caption" color="text.secondary">
                            Parcela {item.installmentNumber}/{item.installmentTotal}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{item.category?.nome || '-'}</TableCell>
                      <TableCell>{item.paymentMethod || '-'}</TableCell>
                      <TableCell align="right" sx={{ color: item.type === 'INCOME' ? 'success.main' : 'error.main', fontWeight: 800 }}>
                        {money.format(Number(item.valor))}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={item.status} color={item.status === 'PAID' ? 'success' : item.status === 'PENDING' ? 'warning' : 'default'} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label="editar"
                          onClick={() => {
                            setEditingItem(normalizeTransactionForEdit(item));
                            setOpen(true);
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" aria-label="excluir" onClick={() => setItemToDelete(item as unknown as Record<string, string>)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                        {item.status === 'PENDING' && (
                          <Button size="small" startIcon={<CheckCircle />} onClick={() => pay.mutate(item.id)}>
                            Pagar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      <CreateDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingItem(null);
        }}
        type={type}
        resource={resource}
        editingItem={editingItem}
      />
      <ConfirmDeleteDialog
        open={Boolean(itemToDelete)}
        title="Confirmar exclusao"
        description={`Tem certeza que deseja apagar "${itemToDelete?.nome || itemToDelete?.descricao || 'este registro'}"? Essa acao nao pode ser desfeita.`}
        loading={deleteResource.isPending}
        onClose={() => setItemToDelete(null)}
        onConfirm={async () => {
          if (!itemToDelete?.id) return;
          await deleteResource.mutateAsync(itemToDelete.id);
          setItemToDelete(null);
        }}
      />
    </Box>
  );
}

function CreateDialog({
  open,
  onClose,
  type,
  resource,
  editingItem,
}: {
  open: boolean;
  onClose: () => void;
  type?: TransactionType;
  resource?: Props['resource'];
  editingItem?: Record<string, string> | null;
}) {
  const initialForm = { type: type || 'EXPENSE', data: new Date().toISOString().slice(0, 10), paymentMethod: 'PIX' };
  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const needsTransactionSupport = open && !resource;
  const { data: categories = [] } = useCategories(needsTransactionSupport);
  const { data: accounts = [] } = useAccounts(needsTransactionSupport);
  const { data: cards = [] } = useCards(needsTransactionSupport);
  const create = useCreateResource(resource || 'transactions', [resource || 'transactions', 'dashboard', 'cards']);
  const update = useUpdateResource(resource || 'transactions', [resource || 'transactions', 'dashboard', 'cards']);

  useEffect(() => {
    if (open && editingItem) {
      setForm({
        ...editingItem,
        tipo: editingItem.tipo || 'EXPENSE',
        cor: editingItem.cor || '#0F766E',
        icone: editingItem.icone || 'Category',
      });
    } else if (open && !editingItem) {
      setForm(initialForm);
    }
  }, [editingItem, open]);

  const field = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }));
  const save = async () => {
    const payload =
      resource === 'categories'
        ? { nome: form.nome, tipo: form.tipo || 'EXPENSE', cor: form.cor || '#0F766E', icone: form.icone || 'Category' }
        : resource === 'accounts'
          ? { nome: form.nome, saldoInicial: parseCurrencyToDecimal(form.saldoInicial || '') }
          : resource === 'cards'
            ? {
                nome: form.nome,
                limite: parseCurrencyToDecimal(form.limite || ''),
                fechamento: Number(form.fechamento),
                vencimento: Number(form.vencimento),
              }
            : {
                type: type || form.type,
                descricao: form.descricao,
                valor: parseCurrencyToDecimal(form.valor || ''),
                data: form.data,
                paymentMethod: form.paymentMethod,
                categoryId: form.categoryId || undefined,
                accountId: form.accountId || undefined,
                cardId: form.cardId || undefined,
                dueDate: form.dueDate || undefined,
                parcelas: form.parcelas ? Number(form.parcelas) : undefined,
              };
    if (editingItem?.id) {
      await update.mutateAsync({ id: editingItem.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    setForm({ type: type || 'EXPENSE', data: new Date().toISOString().slice(0, 10), paymentMethod: 'PIX' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingItem ? 'Editar registro' : 'Novo registro'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {resource === 'categories' && (
            <>
              <TextField label="Nome" value={form.nome || ''} onChange={(e) => field('nome', e.target.value)} />
              <TextField select label="Tipo" value={form.tipo || 'EXPENSE'} onChange={(e) => field('tipo', e.target.value)}>
                <MenuItem value="EXPENSE">Despesa</MenuItem>
                <MenuItem value="INCOME">Receita</MenuItem>
              </TextField>
              <TextField label="Cor" value={form.cor || '#0F766E'} onChange={(e) => field('cor', e.target.value)} />
              <TextField label="Ícone" value={form.icone || 'Category'} onChange={(e) => field('icone', e.target.value)} />
            </>
          )}
          {resource === 'accounts' && (
            <>
              <TextField label="Nome" value={form.nome || ''} onChange={(e) => field('nome', e.target.value)} />
              <TextField label="Saldo inicial" inputMode="numeric" value={form.saldoInicial || ''} onChange={(e) => field('saldoInicial', formatCurrencyInput(e.target.value))} />
            </>
          )}
          {resource === 'cards' && (
            <>
              <TextField label="Nome" value={form.nome || ''} onChange={(e) => field('nome', e.target.value)} />
              <TextField label="Limite" inputMode="numeric" value={form.limite || ''} onChange={(e) => field('limite', formatCurrencyInput(e.target.value))} />
              <TextField label="Fechamento" type="number" value={form.fechamento || ''} onChange={(e) => field('fechamento', e.target.value)} />
              <TextField label="Vencimento" type="number" value={form.vencimento || ''} onChange={(e) => field('vencimento', e.target.value)} />
            </>
          )}
          {!resource && (
            <>
              {!type && (
                <TextField select label="Tipo" value={form.type} onChange={(e) => field('type', e.target.value)}>
                  <MenuItem value="EXPENSE">Despesa</MenuItem>
                  <MenuItem value="INCOME">Receita</MenuItem>
                </TextField>
              )}
              <TextField label="Descrição" value={form.descricao || ''} onChange={(e) => field('descricao', e.target.value)} />
              <TextField label="Valor" inputMode="numeric" value={form.valor || ''} onChange={(e) => field('valor', formatCurrencyInput(e.target.value))} />
              <TextField type="date" label="Data" value={form.data} onChange={(e) => field('data', e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField select label="Categoria" value={form.categoryId || ''} onChange={(e) => field('categoryId', e.target.value)}>
                {categories
                  .filter((category) => category.tipo === (type || form.type))
                  .map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.nome}
                    </MenuItem>
                  ))}
              </TextField>
              {(type || form.type) === 'EXPENSE' && (
                <TextField select label="Pagamento" value={form.paymentMethod || 'PIX'} onChange={(e) => field('paymentMethod', e.target.value)}>
                  <MenuItem value="PIX">PIX</MenuItem>
                  <MenuItem value="DEBIT_CARD">Débito</MenuItem>
                  <MenuItem value="CREDIT_CARD">Crédito</MenuItem>
                  <MenuItem value="CASH">Dinheiro</MenuItem>
                  <MenuItem value="TRANSFER">Transferência</MenuItem>
                  <MenuItem value="BANK_SLIP">Boleto</MenuItem>
                </TextField>
              )}
              {form.paymentMethod === 'CREDIT_CARD' ? (
                <>
                  <TextField select label="Cartão" value={form.cardId || ''} onChange={(e) => field('cardId', e.target.value)}>
                    {cards.map((card) => (
                      <MenuItem key={card.id} value={card.id}>
                        {card.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="date"
                    label="Fatura"
                    value={form.dueDate || ''}
                    onChange={(e) => field('dueDate', e.target.value)}
                    helperText="Opcional. Vazio usa o fechamento do cartao."
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField label="Parcelas" type="number" value={form.parcelas || ''} onChange={(e) => field('parcelas', e.target.value)} />
                </>
              ) : (
                <TextField select label="Conta" value={form.accountId || ''} onChange={(e) => field('accountId', e.target.value)}>
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.nome}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={save} disabled={create.isPending || update.isPending}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function normalizeResourceForEdit(resource: Props['resource'], item: Record<string, string>) {
  if (resource === 'accounts') {
    return { ...item, saldoInicial: formatCurrencyInput(String(item.saldoInicial || '0')) };
  }
  if (resource === 'cards') {
    return { ...item, limite: formatCurrencyInput(String(item.limite || '0')) };
  }
  return item;
}

function normalizeTransactionForEdit(item: any) {
  return {
    id: item.id,
    type: item.type,
    descricao: item.descricao,
    valor: formatCurrencyInput(String(item.valor || '0')),
    data: item.data,
    paymentMethod: item.paymentMethod || 'PIX',
    categoryId: item.category?.id || item.categoryId || '',
    accountId: item.account?.id || item.accountId || '',
    cardId: item.card?.id || item.cardId || '',
    dueDate: item.dueDate || '',
  };
}

function ConfirmDeleteDialog({
  open,
  title,
  description,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          Apagar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
