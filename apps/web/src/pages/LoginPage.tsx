import { zodResolver } from '@hookform/resolvers/zod';
import { AccountBalanceWallet, ArrowForward, ShieldOutlined, TrendingUp } from '@mui/icons-material';
import { Alert, Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '../api/client';

const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
  lembrarLogin: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [registerMode, setRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<FormValues & { nome: string }>({
    resolver: zodResolver(registerMode ? schema.extend({ nome: z.string().min(2) }) : schema),
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
    onError: () => setError('Nao foi possivel autenticar. Verifique seus dados.'),
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(420px, 520px) 1fr' },
        bgcolor: 'background.default',
      }}
    >
      <Stack
        justifyContent="center"
        sx={{
          minHeight: '100vh',
          px: { xs: 2.5, sm: 6, md: 7 },
          py: 5,
          bgcolor: 'background.paper',
          borderRight: { md: '1px solid' },
          borderColor: { md: 'divider' },
        }}
      >
        <Stack spacing={4} sx={{ width: '100%', maxWidth: 420 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: 'rgba(166,30,34,0.1)',
                }}
              >
                <AccountBalanceWallet />
              </Box>
              <Typography variant="h5" fontWeight={900}>
                Financeiro
              </Typography>
            </Stack>
            <Box>
              <Typography variant="h4" sx={{ mt: 4, mb: 1 }}>
                {registerMode ? 'Crie sua conta' : 'Entre no painel'}
              </Typography>
              <Typography color="text.secondary">
                Controle receitas, despesas, cartoes e metas em uma rotina simples.
              </Typography>
            </Box>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack spacing={2} component="form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
            {registerMode && <TextField label="Nome" autoComplete="name" {...register('nome')} />}
            <TextField label="E-mail" type="email" autoComplete="email" {...register('email')} />
            <TextField label="Senha" type="password" autoComplete={registerMode ? 'new-password' : 'current-password'} {...register('senha')} />
            {!registerMode && <FormControlLabel control={<Checkbox defaultChecked {...register('lembrarLogin')} />} label="Lembrar login" />}
            <Button type="submit" size="large" variant="contained" endIcon={<ArrowForward />} disabled={mutation.isPending}>
              {registerMode ? 'Criar conta' : 'Entrar'}
            </Button>
            <Button onClick={() => setRegisterMode((value) => !value)}>
              {registerMode ? 'Ja tenho conta' : 'Criar primeira conta'}
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          overflow: 'hidden',
          backgroundImage:
            "linear-gradient(90deg, rgba(47,47,47,0.38), rgba(47,47,47,0.08)), url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            position: 'absolute',
            left: 48,
            bottom: 48,
            width: 430,
            color: '#fff',
            textShadow: '0 2px 18px rgba(0,0,0,0.24)',
          }}
        >
          <Typography variant="h3" fontWeight={900}>
            Clareza financeira todos os dias.
          </Typography>
          <Typography sx={{ fontSize: 18, opacity: 0.92 }}>
            Lancamentos rapidos, dashboards objetivos e controle mensal sem friccao.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <InfoPill icon={<TrendingUp fontSize="small" />} label="Dashboard mensal" />
            <InfoPill icon={<ShieldOutlined fontSize="small" />} label="Dados protegidos" />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.16)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.28)',
      }}
    >
      {icon}
      <Typography fontWeight={800} fontSize={14}>
        {label}
      </Typography>
    </Stack>
  );
}
