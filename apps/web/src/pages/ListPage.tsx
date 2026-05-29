import {
  Add,
  CheckCircle,
  Close,
  DeleteOutline,
  EditOutlined,
} from "@mui/icons-material";
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
  FormControlLabel,
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
  Switch,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  useAccounts,
  useCards,
  useCategories,
  useCreateResource,
  useDeleteResource,
  usePayTransaction,
  useTransactions,
  useUpdateResource,
} from "../api/queries";
import { PageHeader } from "../components/PageHeader";
import { FixedBillsModal } from "./FixedBillsPage";
import { TransactionType } from "../types/domain";
import { money } from "../theme/theme";
import { formatCurrencyInput, parseCurrencyToDecimal } from "../utils/currency";

type Props = {
  title: string;
  type?: TransactionType;
  resource?: "categories" | "accounts" | "cards";
};

const dialogPaperProps = {
  sx: {
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 24px 80px rgba(15,23,42,0.18)",
  },
};

const dialogTitleSx = {
  px: 3,
  py: 2.25,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 2,
  borderBottom: "1px solid",
  borderColor: "divider",
};

const dialogActionsSx = {
  px: 3,
  py: 2,
  borderTop: "1px solid",
  borderColor: "divider",
  bgcolor: "background.default",
};

function formatDate(value?: string) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function monthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    from: toInputDate(start),
    to: toInputDate(end),
  };
}

function toInputDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function statusLabel(status?: string) {
  if (status === "PAID") return "Pago";
  if (status === "PENDING") return "Pendente";
  if (status === "CANCELED") return "Cancelado";
  return status || "-";
}

export function ListPage({ title, type, resource }: Props) {
  const [open, setOpen] = useState(false);
  const [fixedBillsOpen, setFixedBillsOpen] = useState(false);
  const today = new Date();
  const currentMonthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [from, setFrom] = useState(currentMonthStart);
  const [to, setTo] = useState(currentDate);
  const [status, setStatus] = useState("");
  const [editingItem, setEditingItem] = useState<Record<string, string> | null>(
    null,
  );
  const [itemToDelete, setItemToDelete] = useState<Record<
    string,
    string
  > | null>(null);
  const isResourcePage = Boolean(resource);
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (!isResourcePage && from && to) {
    params.set("from", from);
    params.set("to", to);
  }
  if (!isResourcePage && status) params.set("status", status);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const transactions = useTransactions(queryString, !isResourcePage);
  const categories = useCategories(!resource || resource === "categories");
  const accounts = useAccounts(!resource || resource === "accounts");
  const cards = useCards(!resource || resource === "cards");
  const pay = usePayTransaction();
  const deleteResource = useDeleteResource(resource || "transactions", [
    resource || "transactions",
    "dashboard",
    "cards",
    "future-installments",
  ]);

  const resourceData =
    resource === "categories"
      ? categories.data
      : resource === "accounts"
        ? accounts.data
        : resource === "cards"
          ? cards.data
          : undefined;
  const isIncomePage = type === "INCOME";
  const subtitle = isIncomePage
    ? "Registre ganhos como salário, renda extra, reembolsos e outros recebimentos."
    : "Cadastre, filtre e acompanhe seus dados financeiros.";

  return (
    <Box>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {type === "EXPENSE" && (
              <Button variant="outlined" onClick={() => setFixedBillsOpen(true)}>
                Fixas
              </Button>
            )}
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
          </Stack>
        }
      />
      {((!isResourcePage && transactions.isLoading) ||
        (resource === "categories" && categories.isLoading) ||
        (resource === "accounts" && accounts.isLoading) ||
        (resource === "cards" && cards.isLoading)) && (
        <LinearProgress sx={{ mb: 2 }} />
      )}
      {!isResourcePage && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: { xs: 1.5, md: 2 } } }}>
            <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ lg: "center" }} justifyContent="space-between">
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const range = monthRange(new Date());
                    setFrom(range.from);
                    setTo(range.to);
                  }}
                >
                  Mês atual
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const previous = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const range = monthRange(previous);
                    setFrom(range.from);
                    setTo(range.to);
                  }}
                >
                  Mês anterior
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFrom(currentDate);
                    setTo(currentDate);
                  }}
                >
                  Hoje
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="De"
                  type="date"
                  size="small"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Até"
                  type="date"
                  size="small"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  select
                  label="Status"
                  size="small"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="PAID">Pago</MenuItem>
                  <MenuItem value="PENDING">Pendente</MenuItem>
                  <MenuItem value="CANCELED">Cancelado</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 14px 32px rgba(15,23,42,0.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 1.2, sm: 2 } }}>
          {resource ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Detalhes</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(resourceData || []).map((item: any) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>
                        {resource === "categories" && (
                          <Chip
                            size="small"
                            label={
                              item.tipo === "INCOME" ? "Receita" : "Despesa"
                            }
                            sx={{ bgcolor: item.cor, color: "#fff" }}
                          />
                        )}
                        {resource === "accounts" &&
                          money.format(Number(item.saldoInicial))}
                        {resource === "cards" &&
                          `${money.format(Number(item.gasto || 0))} usados de ${money.format(Number(item.limite))}`}
                      </TableCell>
                      <TableCell>
                        {resource === "accounts"
                          ? item.ativo
                            ? "Ativa"
                            : "Inativa"
                          : "Ativo"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label="editar"
                          onClick={() => {
                            setEditingItem(
                              normalizeResourceForEdit(resource, item),
                            );
                            setOpen(true);
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="excluir"
                          onClick={() => setItemToDelete(item)}
                        >
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
                    <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Categoria</TableCell>
                    {!isIncomePage && <TableCell sx={{ fontWeight: 700 }}>Pagamento</TableCell>}
                    {isIncomePage && <TableCell sx={{ fontWeight: 700 }}>Conta</TableCell>}
                    {!isIncomePage && <TableCell sx={{ fontWeight: 700 }}>Fatura</TableCell>}
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Valor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(transactions.data?.items || []).map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{formatDate(item.data)}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          {item.descricao}
                        </Typography>
                        {item.isInstallment && (
                          <Typography variant="caption" color="text.secondary">
                            Parcela {item.installmentNumber}/
                            {item.installmentTotal}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{item.category?.nome || "-"}</TableCell>
                      {!isIncomePage && <TableCell>{item.paymentMethod || "-"}</TableCell>}
                      {isIncomePage && <TableCell>{item.account?.nome || "-"}</TableCell>}
                      {!isIncomePage && (
                        <TableCell>
                          {item.paymentMethod === "CREDIT_CARD"
                            ? formatDate(item.dueDate)
                            : "-"}
                        </TableCell>
                      )}
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            item.type === "INCOME"
                              ? "success.main"
                              : "error.main",
                          fontWeight: 700,
                        }}
                      >
                        {money.format(Number(item.valor))}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={statusLabel(item.status)}
                          color={item.status === "PAID" ? "success" : item.status === "PENDING" ? "warning" : "default"}
                        />
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
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="excluir"
                          onClick={() =>
                            setItemToDelete(
                              item as unknown as Record<string, string>,
                            )
                          }
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                        {item.status === "PENDING" && (
                          <Button
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => pay.mutate(item.id)}
                          >
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
      <FixedBillsModal open={fixedBillsOpen} onClose={() => setFixedBillsOpen(false)} />
      <ConfirmDeleteDialog
        open={Boolean(itemToDelete)}
        title="Confirmar exclusao"
        description={`Tem certeza que deseja apagar "${itemToDelete?.nome || itemToDelete?.descricao || "este registro"}"? Essa acao nao pode ser desfeita.`}
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
  resource?: Props["resource"];
  editingItem?: Record<string, string> | null;
}) {
  const initialForm = {
    type: type || "EXPENSE",
    data: new Date().toISOString().slice(0, 10),
    paymentMethod: "PIX",
    recorrente: "false",
    endDate: "",
  };
  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const needsTransactionSupport = open && !resource;
  const { data: categories = [] } = useCategories(needsTransactionSupport);
  const { data: accounts = [] } = useAccounts(needsTransactionSupport);
  const { data: cards = [] } = useCards(needsTransactionSupport);
  const create = useCreateResource(resource || "transactions", [
    resource || "transactions",
    "dashboard",
    "cards",
  ]);
  const createFixedBill = useCreateResource("fixed-bills", [
    "fixed-bills",
    "fixed-bills-checklist",
  ]);
  const update = useUpdateResource(resource || "transactions", [
    resource || "transactions",
    "dashboard",
    "cards",
  ]);

  useEffect(() => {
    if (open && editingItem) {
      setForm({
        ...editingItem,
        tipo: editingItem.tipo || "EXPENSE",
        cor: editingItem.cor || "#0F766E",
        icone: editingItem.icone || "Category",
      });
    } else if (open && !editingItem) {
      setForm(initialForm);
    }
  }, [editingItem, open]);

  const field = (name: string, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));
  const save = async () => {
    const transactionType = type || form.type;
    const isIncome = transactionType === "INCOME";
    const isRecurringExpense = !resource && !editingItem?.id && transactionType === "EXPENSE" && form.recorrente === "true";
    const payload =
      resource === "categories"
        ? {
            nome: form.nome,
            tipo: form.tipo || "EXPENSE",
            cor: form.cor || "#0F766E",
            icone: form.icone || "Category",
          }
        : resource === "accounts"
          ? {
              nome: form.nome,
              saldoInicial: parseCurrencyToDecimal(form.saldoInicial || ""),
            }
          : resource === "cards"
            ? {
                nome: form.nome,
                limite: parseCurrencyToDecimal(form.limite || ""),
                vencimento: Number(form.vencimento),
              }
            : {
                type: transactionType,
                descricao: form.descricao,
                valor: parseCurrencyToDecimal(form.valor || ""),
                data: form.data,
                paymentMethod: isIncome ? undefined : form.paymentMethod,
                categoryId: form.categoryId || undefined,
                accountId: form.accountId || undefined,
                cardId: isIncome ? undefined : form.cardId || undefined,
                dueDate: isIncome ? undefined : form.dueDate || undefined,
                parcelas: !isIncome && form.parcelas ? Number(form.parcelas) : undefined,
              };
    if (editingItem?.id) {
      await update.mutateAsync({ id: editingItem.id, payload });
    } else {
      await create.mutateAsync(payload);
      if (isRecurringExpense) {
        await createFixedBill.mutateAsync({
          nome: form.descricao,
          valor: parseCurrencyToDecimal(form.valor || ""),
          endDate: form.endDate || undefined,
        });
      }
    }
    setForm({
      type: type || "EXPENSE",
      data: new Date().toISOString().slice(0, 10),
      paymentMethod: "PIX",
      recorrente: "false",
      endDate: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={dialogPaperProps}>
      <DialogTitle sx={dialogTitleSx}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingItem ? "Editar registro" : type === "INCOME" ? "Nova receita" : "Novo registro"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {type === "INCOME" ? "Informe de onde veio o ganho e em qual conta entrou." : "Preencha os dados principais do lançamento."}
          </Typography>
        </Box>
        <IconButton aria-label="fechar" onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2} mt={1}>
          {resource === "categories" && (
            <>
              <TextField
                label="Nome"
                value={form.nome || ""}
                onChange={(e) => field("nome", e.target.value)}
              />
              <TextField
                select
                label="Tipo"
                value={form.tipo || "EXPENSE"}
                onChange={(e) => field("tipo", e.target.value)}
              >
                <MenuItem value="EXPENSE">Despesa</MenuItem>
                <MenuItem value="INCOME">Receita</MenuItem>
              </TextField>
              <TextField
                label="Cor"
                value={form.cor || "#0F766E"}
                onChange={(e) => field("cor", e.target.value)}
              />
              <TextField
                label="Ícone"
                value={form.icone || "Category"}
                onChange={(e) => field("icone", e.target.value)}
              />
            </>
          )}
          {resource === "accounts" && (
            <>
              <TextField
                label="Nome"
                value={form.nome || ""}
                onChange={(e) => field("nome", e.target.value)}
              />
              <TextField
                label="Saldo inicial"
                inputMode="numeric"
                value={form.saldoInicial || ""}
                onChange={(e) =>
                  field("saldoInicial", formatCurrencyInput(e.target.value))
                }
              />
            </>
          )}
          {resource === "cards" && (
            <>
              <TextField
                label="Nome"
                value={form.nome || ""}
                onChange={(e) => field("nome", e.target.value)}
              />
              <TextField
                label="Limite"
                inputMode="numeric"
                value={form.limite || ""}
                onChange={(e) =>
                  field("limite", formatCurrencyInput(e.target.value))
                }
              />
              <TextField
                label="Dia de vencimento"
                type="number"
                value={form.vencimento || ""}
                onChange={(e) => field("vencimento", e.target.value)}
                helperText="Dia do mês usado para alertas e faturas do cartão."
                inputProps={{ min: 1, max: 31 }}
              />
            </>
          )}
          {!resource && (
            <>
              {!type && (
                <TextField
                  select
                  label="Tipo"
                  value={form.type}
                  onChange={(e) => field("type", e.target.value)}
                >
                  <MenuItem value="EXPENSE">Despesa</MenuItem>
                  <MenuItem value="INCOME">Receita</MenuItem>
                </TextField>
              )}
              <TextField
                label={type === "INCOME" ? "Origem do ganho" : "Descrição"}
                value={form.descricao || ""}
                onChange={(e) => field("descricao", e.target.value)}
              />
              <TextField
                label="Valor"
                inputMode="numeric"
                value={form.valor || ""}
                onChange={(e) =>
                  field("valor", formatCurrencyInput(e.target.value))
                }
              />
              <TextField
                type="date"
                label="Data"
                value={form.data}
                onChange={(e) => field("data", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              {(type || form.type) === "EXPENSE" && !editingItem?.id && (
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.recorrente === "true"}
                        onChange={(event) => field("recorrente", event.target.checked ? "true" : "false")}
                      />
                    }
                    label="Despesa recorrente"
                  />
                  {form.recorrente === "true" && (
                    <TextField
                      type="date"
                      label="Data de finalização"
                      value={form.endDate || ""}
                      onChange={(e) => field("endDate", e.target.value)}
                      helperText="Opcional. Deixe vazio para repetir todos os meses."
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Stack>
              )}
              <TextField
                select
                label="Categoria"
                value={form.categoryId || ""}
                onChange={(e) => field("categoryId", e.target.value)}
              >
                {categories
                  .filter((category) => category.tipo === (type || form.type))
                  .map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.nome}
                    </MenuItem>
                  ))}
              </TextField>
              {(type || form.type) === "EXPENSE" && (
                <TextField
                  select
                  label="Pagamento"
                  value={form.paymentMethod || "PIX"}
                  onChange={(e) => field("paymentMethod", e.target.value)}
                >
                  <MenuItem value="PIX">PIX</MenuItem>
                  <MenuItem value="DEBIT_CARD">Débito</MenuItem>
                  <MenuItem value="CREDIT_CARD">Crédito</MenuItem>
                  <MenuItem value="CASH">Dinheiro</MenuItem>
                  <MenuItem value="TRANSFER">Transferência</MenuItem>
                  <MenuItem value="BANK_SLIP">Boleto</MenuItem>
                </TextField>
              )}
              {(type || form.type) === "EXPENSE" && form.paymentMethod === "CREDIT_CARD" ? (
                <>
                  <TextField
                    select
                    label="Cartão"
                    value={form.cardId || ""}
                    onChange={(e) => field("cardId", e.target.value)}
                  >
                    {cards.map((card) => (
                      <MenuItem key={card.id} value={card.id}>
                        {card.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="date"
                    label="Fatura"
                    value={form.dueDate || ""}
                    onChange={(e) => field("dueDate", e.target.value)}
                    helperText="Opcional. Vazio usa o vencimento do cartão."
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Parcelas"
                    type="number"
                    value={form.parcelas || ""}
                    onChange={(e) => field("parcelas", e.target.value)}
                  />
                </>
              ) : (
                <TextField
                  select
                  label="Conta"
                  value={form.accountId || ""}
                  onChange={(e) => field("accountId", e.target.value)}
                >
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
      <DialogActions sx={dialogActionsSx}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={create.isPending || update.isPending}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function normalizeResourceForEdit(
  resource: Props["resource"],
  item: Record<string, string>,
) {
  if (resource === "accounts") {
    return {
      ...item,
      saldoInicial: formatCurrencyInput(String(item.saldoInicial || "0")),
    };
  }
  if (resource === "cards") {
    return { ...item, limite: formatCurrencyInput(String(item.limite || "0")) };
  }
  return item;
}

function normalizeTransactionForEdit(item: any) {
  return {
    id: item.id,
    type: item.type,
    descricao: item.descricao,
    valor: formatCurrencyInput(String(item.valor || "0")),
    data: item.data,
    paymentMethod: item.paymentMethod || "PIX",
    categoryId: item.category?.id || item.categoryId || "",
    accountId: item.account?.id || item.accountId || "",
    cardId: item.card?.id || item.cardId || "",
    dueDate: item.dueDate || "",
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={dialogPaperProps}>
      <DialogTitle sx={dialogTitleSx}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <IconButton aria-label="fechar" onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          Apagar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
