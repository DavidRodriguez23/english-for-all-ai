import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'

export function useT() {
  const { uiLanguage } = useStore()
  return translations[uiLanguage] || translations.es
}
