import { Box, Stack, Typography } from '@mui/material';

type BrandLogoProps = {
  compact?: boolean;
  size?: 'sm' | 'md';
  tone?: 'default' | 'light';
};

export function BrandLogo({ compact = false, size = 'md', tone = 'default' }: BrandLogoProps) {
  const markSize = size === 'sm' ? 36 : 44;
  const isLight = tone === 'light';

  return (
    <Stack direction="row" spacing={1.15} alignItems="center" sx={{ minWidth: 0 }}>
      <Box
        aria-hidden
        sx={{
          width: markSize,
          height: markSize,
          flex: `0 0 ${markSize}px`,
          borderRadius: 2.2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: isLight ? 'rgba(20,184,166,0.14)' : 'rgba(15,118,110,0.1)',
          color: isLight ? '#5eead4' : 'primary.main',
        }}
      >
        <svg width="70%" height="70%" viewBox="0 0 48 48" role="img" focusable="false">
          <path
            d="M11 31.5V15.8c0-2.1 1.7-3.8 3.8-3.8h18.4c2.1 0 3.8 1.7 3.8 3.8v16.4c0 2.1-1.7 3.8-3.8 3.8H15.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 29.5c3.9-8.6 8-8.6 12-1.2 1.7 3.2 4.1 4.9 7.2 4.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 20h9"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </Box>
      {!compact && (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant={size === 'sm' ? 'subtitle1' : 'h6'}
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              color: isLight ? '#f8fafc' : 'text.primary',
              letterSpacing: 0,
            }}
          >
            Financeiro
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: isLight ? 'rgba(226,232,240,0.74)' : 'text.secondary',
              lineHeight: 1.2,
              mt: 0.35,
            }}
          >
            Controle pessoal
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
