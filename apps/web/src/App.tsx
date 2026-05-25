import { CssBaseline, ThemeProvider } from '@mui/material';
import { useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ListPage } from './pages/ListPage';
import { FutureInstallmentsPage } from './pages/FutureInstallmentsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { buildTheme } from './theme/theme';

function RequireAuth({ children }: { children: JSX.Element }) {
  return localStorage.getItem('accessToken') ? children : <Navigate to="/login" replace />;
}

export function App() {
  const [mode, setMode] = useState<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  const theme = useMemo(() => buildTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppLayout mode={mode} onToggleMode={toggleMode} />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="receitas" element={<ListPage title="Receitas" type="INCOME" />} />
            <Route path="despesas" element={<ListPage title="Despesas" type="EXPENSE" />} />
            <Route path="transacoes" element={<ListPage title="Transações" />} />
            <Route path="categorias" element={<ListPage title="Categorias" resource="categories" />} />
            <Route path="contas" element={<ListPage title="Contas" resource="accounts" />} />
            <Route path="cartoes" element={<ListPage title="Cartões" resource="cards" />} />
            <Route path="parcelas" element={<FutureInstallmentsPage />} />
            <Route path="metas" element={<GoalsPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
