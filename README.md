# Dashboard Financeiro

## Sobre o Projeto

Dashboard financeiro desenvolvido por Tiago Cruz para visualização e gerenciamento de finanças pessoais. O projeto oferece uma interface intuitiva para acompanhamento de receitas, despesas e saldo, com visualizações gráficas e filtros dinâmicos.

## Tecnologias Utilizadas

- **Frontend:**
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui (componentes)
  - Recharts (gráficos)
  - React Query (gerenciamento de estado)

- **Backend:**
  - Supabase (banco de dados e autenticação)
  - PostgreSQL

## Funcionalidades

1. **Visão Geral Financeira**
   - Saldo total
   - Total de receitas
   - Total de despesas
   - Meta de economia (10% da receita)

2. **Análise Gráfica**
   - Gráfico de histórico com receitas, despesas e saldo
   - Gráfico de pizza para categorias de despesas
   - Filtro por período (3, 6 ou 12 meses)

3. **Gestão de Transações**
   - Formulário para adicionar novas transações
   - Lista das últimas transações
   - Top 5 maiores despesas do mês

## Estrutura do Banco de Dados

### Tabelas

1. **categories**
   - id: string (PK)
   - name: string
   - type: 'income' | 'expense'
   - color: string
   - created_at: string

2. **accounts**
   - id: string (PK)
   - name: string
   - type: string
   - balance: number
   - created_at: string
   - updated_at: string

3. **transactions**
   - id: string (PK)
   - description: string
   - amount: number
   - type: 'income' | 'expense'
   - category_id: string (FK)
   - account_id: string (FK)
   - date: string
   - created_at: string
   - updated_at: string

## Arquitetura do Projeto

```
finance-dashboard-helper/
├── src/
│   ├── components/      # Componentes React
│   │   ├── ui/         # Componentes de UI reutilizáveis
│   │   └── TransactionForm.tsx
│   ├── hooks/          # Custom hooks React
│   │   └── useFinanceData.ts
│   ├── integrations/   # Integrações com serviços externos
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── types/          # Definições de tipos TypeScript
│   │   └── finance.ts
│   └── pages/          # Páginas da aplicação
│       └── Index.tsx
```

## Instalação e Configuração

1. **Pré-requisitos**
   - Node.js
   - Bun (gerenciador de pacotes)
   - Conta no Supabase

2. **Configuração do Ambiente**
   ```bash
   # Clone o repositório
   git clone [url-do-repositório]

   # Instale as dependências
   bun install

   # Configure as variáveis de ambiente
   cp .env.example .env
   # Adicione suas credenciais do Supabase
   ```

3. **Configuração do Supabase**
   - Crie um novo projeto no Supabase
   - Configure as tabelas conforme a estrutura descrita acima
   - Copie as credenciais de conexão para o arquivo .env

4. **Executando o Projeto**
   ```bash
   bun run dev
   ```

## Manutenção

O projeto utiliza várias ferramentas para manter a qualidade do código:

- TypeScript para tipagem estática
- ESLint para linting de código
- Prettier para formatação de código
- React Query para cache e gerenciamento de estado

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request

## Autor

**Tiago Cruz**

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
