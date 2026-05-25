import { zodResolver } from '@hookform/resolvers/zod';
import {
  AccountBalanceWallet,
  ArrowForward,
  DarkMode,
  EmailOutlined,
  LightMode,
  LockOutlined,
  PersonOutline,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '../api/client';

const schema = z.object({
  email: z.string().email({ message: 'Informe um e-mail válido.' }),
  senha: z.string().min(6, { message: 'A senha precisa ter pelo menos 6 caracteres.' }),
  lembrarLogin: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

type LoginPageProps = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
};

const formFieldSx = (isDark: boolean) => ({
  '& .MuiInputLabel-root': {
    color: isDark ? 'rgba(226, 232, 240, 0.82)' : 'rgba(51, 65, 85, 0.9)',
    fontSize: 14,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: isDark ? '#5eead4' : '#0f766e',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
    border: '1px solid',
    borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)',
    transition: 'border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
  },
  '& .MuiOutlinedInput-root:hover': {
    borderColor: isDark ? 'rgba(94, 234, 212, 0.35)' : 'rgba(15, 118, 110, 0.3)',
  },
  '& .MuiOutlinedInput-root.Mui-focused': {
    bgcolor: isDark ? 'rgba(15, 23, 42, 0.96)' : '#f8fafc',
    boxShadow: isDark ? '0 0 0 1px rgba(94, 234, 212, 0.15)' : '0 0 0 1px rgba(15, 118, 110, 0.12)',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: isDark ? '#5eead4' : '#0f766e',
  },
  '& .MuiOutlinedInput-input': {
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: 15,
  },
  '& .MuiInputAdornment-root': {
    color: isDark ? 'rgba(226, 232, 240, 0.75)' : 'rgba(51, 65, 85, 0.8)',
  },
  '& .MuiFormHelperText-root': {
    color: isDark ? 'rgba(226, 232, 240, 0.75)' : 'rgba(71, 85, 105, 0.95)',
  },
});

export function LoginPage({ mode, onToggleMode }: LoginPageProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = mode === 'dark';
  const [registerMode, setRegisterMode] = useState(false);
  const [error, setError] = useState('');

  const formSchema = registerMode
    ? schema.extend({ nome: z.string().min(2, { message: 'Informe seu nome.' }) })
    : schema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues & { nome: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: { lembrarLogin: true },
  });

  const mutation = useMutation({
    mutationFn: (payload: FormValues & { nome?: string }) => {
      const body = registerMode ? { nome: payload.nome, email: payload.email, senha: payload.senha } : payload;
      return api.post(registerMode ? '/auth/register' : '/auth/login', body);
    },
    onSuccess: ({ data }) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/');
    },
    onError: () => setError('Não foi possível autenticar. Verifique seus dados e tente novamente.'),
  });

  const pageBackground = isDark
    ? 'radial-gradient(circle at top right, rgba(20,184,166,0.08), transparent 26%), radial-gradient(circle at bottom left, rgba(59,130,246,0.08), transparent 20%), linear-gradient(135deg, #020617 0%, #111827 45%, #0f172a 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #ecfeff 48%, #dbf5f1 100%)';

  const heroBackground = isDark
    ? 'linear-gradient(180deg, rgba(15,118,110,0.18), rgba(15,23,42,0.92))'
    : 'linear-gradient(180deg, rgba(20,184,166,0.12), rgba(255,255,255,0.98))';

  const panelBg = isDark ? 'rgba(15,23,42,0.92)' : '#ffffff';
  const panelBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)';
  const panelShadow = isDark ? '0 24px 70px rgba(15,23,42,0.28)' : '0 18px 40px rgba(15,23,42,0.08)';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        background: pageBackground,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 1120,
          borderRadius: 4,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.88fr 1.12fr' },
          minHeight: { md: 640 },
          border: `1px solid ${panelBorder}`,
          bgcolor: panelBg,
          backdropFilter: 'blur(18px)',
          boxShadow: panelShadow,
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: { md: 5, lg: 6 },
            background: heroBackground,
            color: isDark ? '#f8fafc' : '#0f172a',
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.8 }}>
                Controle financeiro moderno
              </Typography>
              <Typography
                variant="h3"
                sx={{ mt: 1.5, lineHeight: 1.05, fontWeight: 700, maxWidth: 450 }}
              >
                Centralize suas finanças sem complicação.
              </Typography>
            </Box>

            <Typography
              sx={{
                maxWidth: 430,
                color: isDark ? 'rgba(248,250,252,0.84)' : 'rgba(15,23,42,0.82)',
                lineHeight: 1.7,
                fontSize: 16,
              }}
            >
              Acesse o seu painel com um fluxo simples, seguro e focado no que realmente importa.
            </Typography>
          </Stack>

          <Box
            sx={{
              p: 2.4,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.9)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}`,
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1.2, fontWeight: 700 }}>
              O que você encontra
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: isDark ? 'rgba(248,250,252,0.88)' : 'rgba(15,23,42,0.8)' }}>
                • Dashboard rápido e objetivo
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? 'rgba(248,250,252,0.88)' : 'rgba(15,23,42,0.8)' }}>
                • Entrada de transações mais prática
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? 'rgba(248,250,252,0.88)' : 'rgba(15,23,42,0.8)' }}>
                • Acompanhamento claro de metas e fluxo financeiro
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 4.5, md: 5 },
            bgcolor: 'transparent',
          }}
        >
          <Stack spacing={2.75} sx={{ width: '100%', maxWidth: 460 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: isDark ? 'rgba(20,184,166,0.14)' : 'rgba(15,118,110,0.08)',
                    color: theme.palette.primary.main,
                  }}
                >
                  <AccountBalanceWallet />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Financeiro
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(226,232,240,0.76)' : 'rgba(71,85,105,0.95)' }}>
                    Acesse o seu painel com foco.
                  </Typography>
                </Box>
              </Stack>

              <Tooltip title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}>
                <IconButton
                  onClick={onToggleMode}
                  sx={{
                    color: isDark ? '#e2e8f0' : '#334155',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
                    bgcolor: isDark ? 'rgba(15,23,42,0.5)' : 'rgba(248,250,252,0.9)',
                  }}
                >
                  {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Stack>

            <Box>
              <Typography
                variant="h4"
                sx={{ mb: 1, fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}
              >
                {registerMode ? 'Crie sua conta' : 'Entre no painel'}
              </Typography>
              <Typography
                sx={{
                  lineHeight: 1.65,
                  fontSize: 15,
                  color: isDark ? 'rgba(226,232,240,0.78)' : 'rgba(71,85,105,0.95)',
                }}
              >
                {registerMode
                  ? 'Cadastre-se para centralizar o controle financeiro da sua rotina.'
                  : 'Acesse o sistema com segurança e acompanhe seus resultados em tempo real.'}
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Stack spacing={2} component="form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
              {registerMode && (
                <TextField
                  fullWidth
                  label="Nome"
                  autoComplete="name"
                  placeholder="Maria Silva"
                  error={Boolean(errors.nome)}
                  helperText={errors.nome?.message}
                  sx={formFieldSx(isDark)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  {...register('nome')}
                />
              )}

              <TextField
                fullWidth
                label="E-mail"
                type="email"
                autoComplete="email"
                placeholder="seuemail@empresa.com"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                sx={formFieldSx(isDark)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                {...register('email')}
              />

              <TextField
                fullWidth
                label="Senha"
                type="password"
                autoComplete={registerMode ? 'new-password' : 'current-password'}
                placeholder="Digite sua senha"
                error={Boolean(errors.senha)}
                helperText={errors.senha?.message}
                sx={formFieldSx(isDark)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                {...register('senha')}
              />

              {!registerMode && (
                <FormControlLabel
                  control={<Checkbox defaultChecked {...register('lembrarLogin')} />}
                  label="Lembrar login neste dispositivo"
                  sx={{
                    color: isDark ? '#e2e8f0' : '#334155',
                    alignItems: 'flex-start',
                    fontSize: 14,
                    ml: 0,
                  }}
                />
              )}

              <Button
                type="submit"
                size="large"
                variant="contained"
                endIcon={<ArrowForward />}
                disabled={mutation.isPending}
                sx={{
                  py: 1.35,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
                  boxShadow: isDark ? '0 12px 28px rgba(20, 184, 166, 0.22)' : '0 12px 26px rgba(15, 118, 110, 0.16)',
                }}
              >
                {registerMode ? 'Criar conta' : 'Entrar'}
              </Button>

              <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }} />

              <Button
                onClick={() => setRegisterMode((value) => !value)}
                variant="text"
                color="inherit"
                sx={{
                  justifyContent: 'space-between',
                  color: isDark ? '#e2e8f0' : '#0f172a',
                  px: 0,
                  fontWeight: 600,
                }}
              >
                <span>{registerMode ? 'Já tenho conta' : 'Criar primeira conta'}</span>
                <span>{registerMode ? 'Voltar ao login' : 'Começar agora'}</span>
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
