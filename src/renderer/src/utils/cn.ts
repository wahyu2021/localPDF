import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitas untuk merangkai class Tailwind secara cerdas tanpa bentrok (conflict).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
