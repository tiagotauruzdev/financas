import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line, Pie } from "recharts";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  PieChart,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { useState } from "react";
import { useAccounts, useTransactions, useCategories } from "@/hooks/useFinanceData";
import { TransactionForm } from "@/components/TransactionForm";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Index = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

  const calculateTotals = () => {
    if (!transactions) return { balance: 0, income: 0, expenses: 0 };

    return transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === 'income') {
        acc.income += amount;
      } else {
        acc.expenses += amount;
      }
      acc.balance = acc.income - acc.expenses;
      return acc;
    }, { balance: 0, income: 0, expenses: 0 });
  };

  const totals = calculateTotals();
  
  // Calcula tendências comparando com mês anterior
  const calculateTrends = () => {
    if (!transactions) return { balance: 0, income: 0, expenses: 0 };
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthData = transactions.filter(t => 
      new Date(t.date).getMonth() === currentMonth
    );
    const lastMonthData = transactions.filter(t => 
      new Date(t.date).getMonth() === lastMonth
    );
    
    const getCurrentTotals = (data: typeof transactions) => {
      return data.reduce((acc, t) => ({
        income: acc.income + (t.type === 'income' ? Number(t.amount) : 0),
        expenses: acc.expenses + (t.type === 'expense' ? Number(t.amount) : 0),
        balance: acc.balance + (t.type === 'income' ? Number(t.amount) : -Number(t.amount))
      }), { balance: 0, income: 0, expenses: 0 });
    };
    
    const currentTotals = getCurrentTotals(currentMonthData);
    const lastTotals = getCurrentTotals(lastMonthData);
    
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      const trend = ((current - previous) / Math.abs(previous)) * 100;
      // Limita a variação a ±999%
      return Math.max(Math.min(trend, 999), -999);
    };

    return {
      balance: calculateTrend(currentTotals.balance, lastTotals.balance),
      income: calculateTrend(currentTotals.income, lastTotals.income),
      expenses: calculateTrend(currentTotals.expenses, lastTotals.expenses)
    };
  };

  const trends = calculateTrends();

  // Top 5 maiores despesas do mês atual
  const topExpenses = transactions
    ?.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5) || [];

  const CATEGORY_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD",
    "#D4A5A5", "#9B5DE5", "#00BBF9", "#00F5D4", "#FEE440"
  ];

  const expensesByCategory = (categories
    ?.filter(cat => cat.type === 'expense')
    .map(category => ({
      name: category.name,
      value: transactions
        ?.filter(t => t.category_id === category.id)
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0
    }))
    .filter(cat => cat.value > 0) || [])
    .sort((a, b) => b.value - a.value)
    .map((category, index) => ({
      ...category,
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));

  const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + cat.value, 0);

  const [selectedPeriod, setSelectedPeriod] = useState(3);

  const balanceHistory = transactions
    ? Object.entries(
        transactions.reduce((acc: Record<string, { income: number; expenses: number }>, transaction) => {
          const date = new Date(transaction.date).toLocaleDateString('pt-BR', { month: 'short' });
          if (!acc[date]) {
            acc[date] = { income: 0, expenses: 0 };
          }
          if (transaction.type === 'income') {
            acc[date].income += Number(transaction.amount);
          } else {
            acc[date].expenses += Number(transaction.amount);
          }
          return acc;
        }, {})
      )
      .map(([date, values]) => ({
        date,
        income: values.income,
        expenses: values.expenses,
        balance: values.income - values.expenses
      }))
      .sort((a, b) => {
        const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
        return months.indexOf(a.date) - months.indexOf(b.date);
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard Financeiro</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
        
        {/* Formulário de Transação */}
        <TransactionForm />

        {/* Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Saldo Total</p>
            <h3 className="text-2xl font-semibold text-gray-800">
              {formatCurrency(totals.balance)}
            </h3>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-success" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Receitas</p>
            <h3 className="text-2xl font-semibold text-success">
              {formatCurrency(totals.income)}
            </h3>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowDownRight className="h-6 w-6 text-danger" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Despesas</p>
            <h3 className="text-2xl font-semibold text-danger">
              {formatCurrency(totals.expenses)}
            </h3>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Economia</p>
            <h3 className="text-2xl font-semibold text-purple-600">
              {formatCurrency(totals.income * 0.1)} {/* 10% da receita como meta de economia */}
            </h3>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Histórico do Saldo</h3>
              <select 
                className="border rounded p-1 text-sm"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              >
                <option value="3">Últimos 3 meses</option>
                <option value="6">Últimos 6 meses</option>
                <option value="12">Último ano</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={balanceHistory.slice(-selectedPeriod)}
                >
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === 'balance' ? 'Saldo' :
                      name === 'income' ? 'Receitas' : 'Despesas'
                    ]}
                  />
                  <Legend formatter={(value) => 
                    value === 'balance' ? 'Saldo' :
                    value === 'income' ? 'Receitas' : 'Despesas'
                  }/>
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Despesas por Categoria</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#10B981"
                    labelLine={true}
                    label={({ name }) => name}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name
                    ]} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Top 5 Maiores Despesas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Maiores Despesas do Mês</h3>
          <div className="space-y-4">
            {topExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">{expense.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="text-danger font-semibold">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Últimas Transações */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimas Transações</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Descrição</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.slice(0, 5).map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{transaction.description}</td>
                    <td className={`py-3 px-4 text-sm text-right ${
                      transaction.type === "income" ? "text-success" : "text-danger"
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
