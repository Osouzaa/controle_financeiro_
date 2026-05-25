# Estrategia para Integrar e Vender para Empresas

Este documento descreve como evoluir o sistema financeiro pessoal para uma solucao vendavel para empresas, equipes e pequenos negocios.

## Posicionamento

O produto pode evoluir para uma plataforma de controle financeiro simples para pequenas empresas, profissionais autonomos, consultorias, prestadores de servico e equipes administrativas.

### Proposta de valor

- Controle financeiro sem complexidade de ERP.
- Visao clara de receitas, despesas, caixa e cartoes.
- Organizacao de contas a pagar e receber.
- Relatorios gerenciais simples.
- Automacao de recorrencias, faturas e alertas.
- Multiusuario com permissoes.

## Publico-alvo

- MEIs.
- Pequenas empresas.
- Escritorios de servicos.
- Consultores e freelancers.
- Lojas pequenas.
- Agencias.
- Clinicas.
- Empresas familiares.
- Times financeiros que ainda usam planilhas.

## Adaptacoes Necessarias

## 1. Multiempresa

Hoje o sistema funciona por usuario. Para vender para empresas, precisa suportar organizacoes.

### Entidades sugeridas

```ts
Organization {
  id: string;
  name: string;
  document: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
}

OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'FINANCE' | 'VIEWER';
}
```

## 2. Permissoes e Perfis

Empresas precisam controlar quem pode ver, criar, editar ou aprovar informacoes.

### Perfis sugeridos

- Dono.
- Administrador.
- Financeiro.
- Operador.
- Somente leitura.

### Permissoes

- Ver dashboard.
- Criar lancamento.
- Editar lancamento.
- Apagar lancamento.
- Aprovar pagamento.
- Exportar relatorio.
- Gerenciar usuarios.
- Gerenciar configuracoes.

## 3. Contas a Pagar e Receber

Empresas precisam de previsibilidade.

### Funcionalidades

- Contas a pagar.
- Contas a receber.
- Clientes.
- Fornecedores.
- Vencimentos.
- Baixa de pagamento.
- Juros, multa e desconto.
- Status: pendente, pago, vencido, cancelado.

## 4. Clientes e Fornecedores

Adicionar cadastro de entidades comerciais.

### Entidades sugeridas

```ts
Customer {
  id: string;
  organizationId: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
}

Supplier {
  id: string;
  organizationId: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
}
```

## 5. Centros de Custo

Empresas precisam separar gastos por area, projeto ou unidade.

### Exemplos

- Administrativo.
- Marketing.
- Vendas.
- Operacao.
- Projeto A.
- Filial 1.

## 6. Aprovacoes

Fluxo para controlar despesas antes do pagamento.

### Exemplo

1. Operador cadastra despesa.
2. Gestor aprova.
3. Financeiro paga.
4. Sistema registra baixa.

## 7. Anexos e Comprovantes

Adicionar upload de documentos.

### Tipos

- Nota fiscal.
- Recibo.
- Comprovante PIX.
- Boleto.
- Contrato.

### Armazenamento

- Supabase Storage.
- S3.
- Cloudflare R2.

## 8. Integracoes Bancarias

Para empresas, integracoes aumentam muito o valor percebido.

### Possibilidades

- Importacao OFX.
- Importacao CSV.
- Open Finance.
- Webhooks bancarios.
- Conciliacao bancaria.
- Integracao com contas PJ.

## 9. Emissao e Controle de Cobrancas

Para vender melhor, o sistema pode ajudar empresas a cobrar clientes.

### Funcionalidades

- Gerar cobrancas.
- Registrar recebimentos.
- Enviar lembretes.
- Controlar inadimplencia.
- Integrar com gateways de pagamento.

### Gateways possiveis

- Stripe.
- Mercado Pago.
- Asaas.
- Iugu.
- Gerencianet/Efi.

## 10. Planos e Monetizacao

### Plano Free

- 1 usuario.
- 1 empresa.
- Lancamentos limitados.
- Dashboard basico.

### Plano Pro

- Lancamentos ilimitados.
- Relatorios.
- Faturas.
- Assinaturas.
- Exportacao.

### Plano Business

- Multiusuario.
- Permissoes.
- Centros de custo.
- Aprovacoes.
- Anexos.
- Integracoes.
- Suporte prioritario.

## 11. Modelo Tecnico SaaS

### Requisitos

- Multi-tenant por `organizationId`.
- Isolamento de dados por empresa.
- Auditoria de acoes.
- Controle de plano.
- Limites por assinatura.
- Logs de seguranca.
- Backup.
- LGPD.

### Auditoria sugerida

```ts
AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: json;
  createdAt: Date;
}
```

## 12. Funcionalidades para Vendas

### Diferenciais comerciais

- Dashboard simples para dono de empresa.
- Controle de caixa sem planilha.
- Alertas de vencimentos.
- Relatorios exportaveis.
- Fluxo de aprovacao.
- Controle por centro de custo.
- Visao de inadimplencia.
- Previsao de caixa.

## 13. Roadmap B2B Sugerido

### Fase 1: Base empresarial

- Organization.
- Usuarios por empresa.
- Permissoes.
- Multi-tenant.

### Fase 2: Operacao financeira

- Contas a pagar.
- Contas a receber.
- Clientes.
- Fornecedores.
- Centros de custo.

### Fase 3: Controle e gestao

- Aprovacoes.
- Anexos.
- Relatorios gerenciais.
- Auditoria.

### Fase 4: Produto comercial

- Planos.
- Checkout.
- Controle de assinatura.
- Limites por plano.
- Onboarding empresarial.

### Fase 5: Integracoes

- Importacao bancaria.
- Gateway de pagamento.
- Open Finance.
- API publica.

## 14. Cuidados Antes de Vender

- Melhorar seguranca.
- Criar testes automatizados.
- Criar backups.
- Implementar auditoria.
- Documentar termos de uso e privacidade.
- Garantir isolamento de dados.
- Monitorar erros.
- Criar suporte e canal de atendimento.

## 15. Possivel Pitch

Controle financeiro simples para pequenas empresas que querem sair das planilhas sem implantar um ERP complexo.

O sistema organiza receitas, despesas, contas, cartoes, faturas, recorrencias, relatorios e alertas em uma experiencia moderna e facil de usar.

