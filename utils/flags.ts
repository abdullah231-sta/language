// utils/flags.ts
export const getFlagEmoji = (countryCode: string): string => {
  const flags: { [key: string]: string } = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'SA': '🇸🇦',
    'AE': '🇦🇪',
    'EG': '🇪🇬',
    'ES': '🇪🇸',
    'MX': '🇲🇽',
    'FR': '🇫🇷',
    'DE': '🇩🇪',
    'CN': '🇨🇳',
    'JP': '🇯🇵',
    'KR': '🇰🇷',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'IT': '🇮🇹',
    'RU': '🇷🇺',
    'TR': '🇹🇷',
    'NL': '🇳🇱'
  };
  
  return flags[countryCode] || '🏳️';
};

export const getCountryName = (countryCode: string): string => {
  const countries: { [key: string]: string } = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'EG': 'Egypt',
    'ES': 'Spain',
    'MX': 'Mexico',
    'FR': 'France',
    'DE': 'Germany',
    'CN': 'China',
    'JP': 'Japan',
    'KR': 'South Korea',
    'IN': 'India',
    'BR': 'Brazil',
    'CA': 'Canada',
    'AU': 'Australia',
    'IT': 'Italy',
    'RU': 'Russia',
    'TR': 'Turkey',
    'NL': 'Netherlands'
  };
  
  return countries[countryCode] || 'Unknown';
};