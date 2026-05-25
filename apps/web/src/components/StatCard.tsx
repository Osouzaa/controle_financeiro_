import { Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export function StatCard({ label, value, icon, tone, loading }: { label: string; value: string; icon: ReactNode; tone?: string; loading?: boolean }) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 36px rgba(47,47,47,0.1)',
        },
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              color: tone || 'primary.main',
              bgcolor: tone ? `${tone}18` : 'rgba(166,30,34,0.1)',
              flexShrink: 0,
            }}
          >
            {icon}
          </Stack>
          <Stack minWidth={0} spacing={0.25}>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={110} height={32} />
            ) : (
              <Typography variant="h6" fontWeight={900} noWrap sx={{ lineHeight: 1.2 }}>
                {value}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
