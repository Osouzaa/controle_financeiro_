export function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  const cents = Number(digits || '0');

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function parseCurrencyToDecimal(value: string) {
  const digits = value.replace(/\D/g, '');
  const cents = Number(digits || '0');

  return (cents / 100).toFixed(2);
}
