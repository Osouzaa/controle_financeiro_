import {
  Add,
  AccountBalance,
  BarChart,
  Category,
  CreditCard,
  Dashboard,
  Flag,
  Logout,
  Menu,
  Paid,
  ReceiptLong,
  Settings,
  TrendingDown,
  Wallet,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Drawer,
  Fab,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { QuickTransactionDialog } from "../components/QuickTransactionDialog";

const nav = [
  { label: "Dashboard", path: "/", icon: <Dashboard /> },
  { label: "Receitas", path: "/receitas", icon: <Paid /> },
  { label: "Despesas", path: "/despesas", icon: <TrendingDown /> },
  { label: "Transações", path: "/transacoes", icon: <ReceiptLong /> },
  { label: "Categorias", path: "/categorias", icon: <Category /> },
  { label: "Contas", path: "/contas", icon: <AccountBalance /> },
  { label: "Cartões", path: "/cartoes", icon: <CreditCard /> },
  { label: "Parcelas", path: "/parcelas", icon: <Wallet /> },
  { label: "Metas", path: "/metas", icon: <Flag /> },
  { label: "Relatórios", path: "/relatorios", icon: <BarChart /> },
  { label: "Configurações", path: "/configuracoes", icon: <Settings /> },
];

const drawerWidth = 260;

export function AppLayout({
  mode,
  onToggleMode,
}: {
  mode: "light" | "dark";
  onToggleMode: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar sx={{ px: 2.5, minHeight: 72 }}>
        <Typography
          variant="h6"
          color="primary"
          fontWeight={900}
          letterSpacing={0}
        >
          Financeiro
        </Typography>
      </Toolbar>
      <List sx={{ px: 1.25, flex: 1 }}>
        {nav.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              setOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 48,
              color: "text.secondary",
              "& .MuiListItemIcon-root": { color: "text.secondary" },
              "&.Mui-selected": {
                bgcolor: "rgba(15,118,110,0.1)",
                color: "primary.main",
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
              "&.Mui-selected:hover": { bgcolor: "rgba(15,118,110,0.14)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 800 : 600,
              }}
            />
          </ListItemButton>
        ))}
      </List>
      <List sx={{ px: 1.25, pb: 2 }}>
        <ListItemButton
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          sx={{ borderRadius: 2, minHeight: 48, color: "text.secondary" }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        color="inherit"
        elevation={0}
        sx={{
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          backdropFilter: "blur(14px)",
        }}
      >
        <Toolbar sx={{ gap: 1, px: { xs: 2, md: 4 } }}>
          {!desktop && (
            <IconButton onClick={() => setOpen(true)} aria-label="menu">
              <Menu />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              color: "text.primary",
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            Controle financeiro pessoal
          </Typography>
          <Tooltip title={mode === "light" ? "Modo escuro" : "Modo claro"}>
            <IconButton onClick={onToggleMode}>
              {mode === "light" ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={desktop ? "permanent" : "temporary"}
        open={desktop || open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          pt: { xs: 9, md: 10 },
          px: { xs: 2, md: 4 },
          pb: 10,
        }}
      >
        <Box>
          <Outlet />
        </Box>
      </Box>
      <Fab
        color="primary"
        onClick={() => setQuickOpen(true)}
        sx={{
          position: "fixed",
          right: { xs: 18, md: 32 },
          bottom: { xs: 18, md: 32 },
        }}
        aria-label="lançamento rápido"
      >
        <Add />
      </Fab>
      <QuickTransactionDialog
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />
    </Box>
  );
}
