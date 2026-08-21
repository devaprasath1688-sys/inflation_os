const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function twoDigits(num: number): string {
  if (num < 20) return ones[num];

  const ten = Math.floor(num / 10);
  const one = num % 10;

  return `${tens[ten]}${one ? `-${ones[one]}` : ''}`;
}

function threeDigits(num: number): string {
  if (num < 100) return twoDigits(num);

  const hundred = Math.floor(num / 100);
  const remainder = num % 100;

  return `${ones[hundred]} Hundred${remainder ? ` ${twoDigits(remainder)}` : ''}`;
}

export function numberToIndianWords(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '';
  }

  const num = Math.floor(value);

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  const parts: string[] = [];

  if (crore) {
    parts.push(`${threeDigits(crore)} Crore`);
  }

  if (lakh) {
    parts.push(`${twoDigits(lakh)} Lakh`);
  }

  if (thousand) {
    parts.push(`${twoDigits(thousand)} Thousand`);
  }

  if (remainder) {
    parts.push(threeDigits(remainder));
  }

  return `${parts.join(' ')} Rupees`;
}

export function formatIndianCurrency(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '';
  }

  return `₹${Math.floor(value).toLocaleString('en-IN')}`;
}