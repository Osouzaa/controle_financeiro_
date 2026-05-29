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
  Avatar,
  Box,
  Divider,
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
import { useCurrentUser } from "../api/queries";
import { BrandLogo } from "../components/BrandLogo";
import { QuickTransactionDialog } from "../components/QuickTransactionDialog";
import { User } from "../types/domain";

const navGroups = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard", path: "/", icon: <Dashboard /> },
      { label: "Receitas", path: "/receitas", icon: <Paid /> },
      { label: "Despesas", path: "/despesas", icon: <TrendingDown /> },
      { label: "Transações", path: "/transacoes", icon: <ReceiptLong /> },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { label: "Categorias", path: "/categorias", icon: <Category /> },
      { label: "Contas", path: "/contas", icon: <AccountBalance /> },
      { label: "Cartões", path: "/cartoes", icon: <CreditCard /> },
    ],
  },
  {
    label: "Planejamento",
    items: [
      { label: "Parcelas", path: "/parcelas", icon: <Wallet /> },
      { label: "Metas", path: "/metas", icon: <Flag /> },
      { label: "Relatórios", path: "/relatorios", icon: <BarChart /> },
      { label: "Configurações", path: "/configuracoes", icon: <Settings /> },
    ],
  },
];

const drawerWidth = 260;

function getStoredUser() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "Usuário";
  const parts = source.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

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
  const { data: currentUser } = useCurrentUser();
  const user = currentUser || getStoredUser();
  const userName = user?.nome || "Usuário conectado";
  const userEmail = user?.email || "Sessão ativa";

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar sx={{ px: 2, minHeight: 72 }}>
        <BrandLogo size="sm" />
      </Toolbar>
      <List sx={{ px: 1.25, flex: 1, overflowY: "auto" }}>
        {navGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 1.25 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                px: 1.25,
                py: 0.75,
                color: "text.secondary",
                fontWeight: 800,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              {group.label}
            </Typography>
            {group.items.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.35,
                  minHeight: 42,
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
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: location.pathname === item.path ? 700 : 500,
                  }}
                />
              </ListItemButton>
            ))}
          </Box>
        ))}
      </List>
      <Box sx={{ px: 1.25, pb: 1.25 }}>
        <Divider sx={{ mb: 1.25 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 1.25,
            mb: 0.75,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
            minWidth: 0,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {getInitials(userName, userEmail)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userEmail}
            </Typography>
          </Box>
        </Box>
      </Box>
      <List sx={{ px: 1.25, pb: 2, pt: 0 }}>
        <ListItemButton
          onClick={() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
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
          boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
        }}
      >
        <Toolbar sx={{ gap: 1, px: { xs: 2, md: 4 }, minHeight: 74 }}>
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
              fontWeight: 700,
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
          px: { xs: 1.5, sm: 2.5, md: 3 },
          pb: 10,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "none",
          }}
        >
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
          boxShadow: "0 12px 28px rgba(15,23,42,0.12)",
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
