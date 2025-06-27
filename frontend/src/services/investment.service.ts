import api from './api';

export interface Investment {
  _id: string;
  userId: string;
  name: string;
  type: 'stocks' | 'bonds' | 'mutual_funds' | 'etf' | 'crypto' | 'real_estate' | 'other';
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  broker: string;
  notes?: string;
  currency: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  totalValue?: number;
  investedAmount?: number;
  gainLoss?: number;
  gainLossPercentage?: number;
}

export interface InvestmentStats {
  byType: Array<{
    type: string;
    count: number;
    totalInvested: number;
    currentValue: number;
    gainLoss: number;
    gainLossPercentage: number;
  }>;
  overall: {
    totalInvested: number;
    currentValue: number;
    gainLoss: number;
    gainLossPercentage: number;
    brokersCount: number;
    totalInvestments: number;
  };
}

export interface InvestmentQueryParams {
  type?: string;
  broker?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateInvestmentDto {
  name: string;
  type: Investment['type'];
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  broker: string;
  notes?: string;
  currency?: string;
  tags?: string[];
}

export interface UpdateInvestmentDto extends Partial<CreateInvestmentDto> {}

class InvestmentService {
  async getInvestments(params?: InvestmentQueryParams) {
    const response = await api.get('/investments', { params });
    return response.data.data;
  }

  async getInvestmentById(id: string) {
    const response = await api.get(`/investments/${id}`);
    return response.data.data;
  }

  async getInvestmentStats(): Promise<InvestmentStats> {
    const response = await api.get('/investments/stats');
    return response.data.data;
  }

  async createInvestment(investment: CreateInvestmentDto) {
    const response = await api.post('/investments', investment);
    return response.data.data;
  }

  async updateInvestment(id: string, investment: UpdateInvestmentDto) {
    const response = await api.put(`/investments/${id}`, investment);
    return response.data.data;
  }

  async deleteInvestment(id: string) {
    const response = await api.delete(`/investments/${id}`);
    return response.data;
  }
}

export default new InvestmentService();