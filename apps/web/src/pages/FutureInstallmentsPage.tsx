import { Card, CardContent, Chip, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useFutureInstallments } from '../api/queries';
import { PageHeader } from '../components/PageHeader';
import { money } from '../theme/theme';

export function FutureInstallmentsPage() {
  const { data = [], isLoading } = useFutureInstallments();

  return (
    <>
      <PageHeader title="Parcelas futuras" subtitle="Compras parceladas organizadas por vencimento e cartão." />
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mês</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Parcela</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Cartão</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.dueDate?.slice(0, 7)}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>
                      {item.installmentNumber}/{item.installmentTotal}
                    </TableCell>
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
