# Roadmap de Futuras Atualizacoes

Este documento organiza as proximas evolucoes do sistema financeiro pessoal.

## Prioridade 1: Faturas de Cartao

Criar uma entidade propria para faturas de cartao.

### Objetivo

Permitir que cada cartao tenha faturas mensais com abertura, fechamento, vencimento, pagamento e historico.

### Funcionalidades

- Criar faturas automaticamente por cartao.
- Vincular compras de credito a uma fatura especifica.
- Mostrar faturas abertas, fechadas e pagas.
- Permitir pagamento total ou parcial da fatura.
- Ajustar vencimento especifico de uma fatura.
- Mostrar limite usado por fatura.
- Separar data da compra da data da fatura.

### Entidade sugerida

```ts
CardInvoice {
  id: string;
  cardId: string;
  month: number;
  year: number;
  closingDate: Date;
  dueDate: Date;
  status: 'OPEN' | 'CLOSED' | 'PAID' | 'PARTIALLY_PAID';
  totalAmount: decimal;
  paidAmount: decimal;
}
```

## Prioridade 2: Assinaturas e Recorrencias

Criar controle de pagamentos recorrentes como streaming, internet, academia, software, aluguel e mensalidades.

### Funcionalidades

- Cadastro de assinatura.
- Recorrencia mensal, anual, semanal ou personalizada.
- Geracao automatica de lancamentos.
- Alertas antes da cobranca.
- Pausar, cancelar ou reativar assinatura.
- Visualizar custo mensal e anual.
- Listar assinaturas por conta, cartao ou categoria.

### Entidade sugerida

```ts
Subscription {
  id: string;
  name: string;
  amount: decimal;
  categoryId: string;
  accountId?: string;
  cardId?: string;
  paymentMethod: PaymentMethod;
  billingDay: number;
  nextBillingDate: Date;
  recurrence: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'PAUSED' | 'CANCELED';
  notes?: string;
}
```

## Prioridade 3: Orcamentos por Categoria

Permitir definir limites mensais por categoria.

### Exemplos

- Mercado: R$ 1.200 por mes.
- Lazer: R$ 500 por mes.
- iFood: R$ 300 por mes.

### Funcionalidades

- Definir limite mensal por categoria.
- Mostrar percentual utilizado.
- Alertar quando atingir 80%, 90% e 100%.
- Comparar orcado vs realizado.
- Criar recomendacoes de ajuste.

## Prioridade 4: Calendario Financeiro

Criar uma visao mensal em calendario.

### Funcionalidades

- Exibir receitas previstas.
- Exibir despesas pendentes.
- Exibir vencimento de faturas.
- Exibir assinaturas futuras.
- Exibir metas e lembretes.
- Permitir clicar no dia e cadastrar lancamento.

## Prioridade 5: Transferencias entre Contas

Adicionar transferencia como operacao propria.

### Funcionalidades

- Transferir de uma conta para outra.
- Nao contar como receita nem despesa.
- Registrar taxa, se houver.
- Manter historico entre contas.

## Prioridade 6: Importacao Bancaria

Permitir importar dados externos.

### Formatos

- CSV.
- OFX.
- Planilhas Excel.

### Funcionalidades

- Importar transacoes.
- Sugerir categorias automaticamente.
- Evitar duplicidade.
- Conciliar lancamentos existentes.

## Prioridade 7: Relatorios Avancados

Evoluir os relatorios para analises mais profundas.

### Relatorios

- Evolucao patrimonial.
- Fluxo de caixa diario.
- Comparativo mensal.
- Comparativo anual.
- Gastos por categoria.
- Gastos por cartao.
- Assinaturas ativas.
- Parcelas futuras.
- Projecao de saldo.

## Prioridade 8: Alertas Inteligentes

Criar alertas mais uteis.

### Exemplos

- Gasto acima da media.
- Fatura proxima do limite.
- Categoria estourou o orcamento.
- Assinatura vai vencer.
- Despesas maiores que receitas.
- Saldo previsto negativo.

## Prioridade 9: Automacoes

Criar regras automaticas para reduzir trabalho manual.

### Exemplos

- Se descricao contem "Uber", categoria = Transporte.
- Se descricao contem "iFood", categoria = Alimentacao.
- Se valor e descricao repetem todo mes, sugerir assinatura.
- Se compra no cartao passou do fechamento, sugerir proxima fatura.

## Prioridade 10: Experiencia Premium

Melhorias de usabilidade e acabamento.

### Funcionalidades

- Onboarding inicial.
- Wizard para cadastrar contas e cartoes.
- Atalhos de teclado.
- Busca global.
- Filtros salvos.
- Temas visuais.
- Widgets personalizaveis no dashboard.
- PWA para instalar no celular.
- Notificacoes push.

