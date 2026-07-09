export const formatDate = (date: string | Date): string => new Date(date).toLocaleDateString('uk-UA', { timeZone: 'UTC' });
