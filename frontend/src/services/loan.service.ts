import api from './api';

export interface Loan {
  _id: string;
  userId: string;
  loanName: string;
  loanType: 'personal' | 'mortgage' | 'auto' | 'student' | 'business' | 'other';
  lender: string;
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  status: 'active' | 'paid_off' | 'defaulted';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  monthsRemaining?: number;
  totalInterest?: number;
  paidAmount?: number;
  progressPercentage?: number;
}

export interface LoanStats {
  byType: Array<{
    type: string;
    count: number;
    totalPrincipal: number;
    currentBalance: number;
    monthlyPayment: number;
    averageInterestRate: number;
    paidAmount: number;
  }>;
  overall: {
    totalLoans: number;
    activeLoans: number;
    paidOffLoans: number;
    totalPrincipal: number;
    currentBalance: number;
    totalPaidOff: number;
    totalMonthlyPayment: number;
    averageInterestRate: number;
    payoffProgress: number;
  };
  upcomingPayments: Array<{
    loanName: string;
    monthlyPayment: number;
    nextPaymentDate: string;
  }>;
}

export interface LoanQueryParams {
  type?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateLoanDto {
  loanName: string;
  loanType: Loan['loanType'];
  lender: string;
  principalAmount: number;
  currentBalance?: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  notes?: string;
}

export interface UpdateLoanDto extends Partial<CreateLoanDto> {
  status?: Loan['status'];
}

export interface RecordPaymentDto {
  amount: number;
}

class LoanService {
  async getLoans(params?: LoanQueryParams) {
    const response = await api.get('/loans', { params });
    return response.data.data;
  }

  async getLoanById(id: string) {
    const response = await api.get(`/loans/${id}`);
    return response.data.data;
  }

  async getLoanStats(): Promise<LoanStats> {
    const response = await api.get('/loans/stats');
    return response.data.data;
  }

  async createLoan(loan: CreateLoanDto) {
    const response = await api.post('/loans', loan);
    return response.data.data;
  }

  async updateLoan(id: string, loan: UpdateLoanDto) {
    const response = await api.put(`/loans/${id}`, loan);
    return response.data.data;
  }

  async recordPayment(id: string, payment: RecordPaymentDto) {
    const response = await api.post(`/loans/${id}/payment`, payment);
    return response.data.data;
  }

  async deleteLoan(id: string) {
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  }
}

export default new LoanService();