import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactCurrency(amount: number, currency: string = 'USD'): string {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000000) {
    // Billions
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount / 1000000000).replace(/\.0+$/, '') + 'B';
  } else if (absAmount >= 1000000) {
    // Millions
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount / 1000000).replace(/\.0+$/, '') + 'M';
  } else if (absAmount >= 10000) {
    // Thousands (10K and above)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount / 1000).replace(/\.0+$/, '') + 'K';
  } else {
    // Less than 10K, show full amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDisplayCurrency(amount: number, currency: string = 'USD'): string {
  // Use compact format for values >= 10K
  return Math.abs(amount) >= 10000 ? formatCompactCurrency(amount, currency) : formatCurrency(amount, currency);
}