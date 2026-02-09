// Main translations index - combines all languages
import * as bg from './bg';
import * as en from './en';

const translations = {
  bg,
  en
};

export default translations;
export type Language = 'bg' | 'en';
