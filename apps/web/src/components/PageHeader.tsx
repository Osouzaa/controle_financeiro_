import { Box, Button, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <Box
      sx={{
        mb: 3,
        p: { xs: 2.15, sm: 2.5 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderTop: '2px solid',
        borderTopColor: 'primary.main',
        bgcolor: 'background.paper',
        boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" mt={0.75} sx={{ lineHeight: 1.6, maxWidth: 760 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
    </Box>
  );
}

export function HeaderButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button variant="contained" onClick={onClick}>
      {children}
    </Button>
  );
}
