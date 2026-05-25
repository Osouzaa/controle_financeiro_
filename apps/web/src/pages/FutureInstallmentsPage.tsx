import { Card, CardContent, Chip, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useFutureInstallments } from '../api/queries';
import { PageHeader } from '../components/PageHeader';
import { money } from '../theme/theme';

export function FutureInstallmentsPage() {
  const { data = [], isLoading } = useFutureInstallments();

  return (
    <>
      <PageHeader title="Parcelas futuras" subtitle="Compras parceladas organizadas por vencimento e cartão, para você ver o que vem por aí." />
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 14px 32px rgba(15,23,42,0.06)',
        }}
      >
        <CardContent sx={{ p: { xs: 1.2, sm: 2 } }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Mês</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Parcela</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Valor</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cartão</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.dueDate?.slice(0, 7)}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{item.installmentNumber}/{item.installmentTotal}</TableCell>
                    <TableCell align="right">{money.format(Number(item.valor))}</TableCell>
                    <TableCell>{item.card?.nome || '-'}</TableCell>
                    <TableCell>
                      <Chip size="small" color="warning" label={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
}
