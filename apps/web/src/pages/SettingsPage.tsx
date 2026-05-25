import { Card, CardContent, Stack, Switch, TextField, Typography } from '@mui/material';
import { PageHeader } from '../components/PageHeader';

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Configurações" subtitle="Preferências do sistema, alertas e parâmetros financeiros." />
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography>Alertas automáticos</Typography>
              <Switch defaultChecked />
            </Stack>
            <TextField label="Orçamento mensal padrão" defaultValue="3000.00" />
            <TextField label="E-mail para notificações" defaultValue="" />
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
