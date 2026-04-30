import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'am', label: '🇪🇹 አማርኛ' },
  { code: 'om', label: '🇪🇹 Afaan Oromo' },
  { code: 'sw', label: '🇰🇪 Kiswahili' },
];

const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const handleChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('userNativeLang', lang);
  };

  return (
    <div style={styles.wrapper}>
      <Globe style={styles.icon} aria-hidden="true" />
      <select
        value={currentLang}
        onChange={handleChange}
        style={styles.select}
        aria-label="Select interface language"
        id="language-switcher"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#00f5ff';
          e.currentTarget.style.boxShadow = '0 0 8px rgba(0,245,255,0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#00f5ff';
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,245,255,0.25)';
          e.currentTarget.style.outline = 'none';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    position: 'relative',
  },
  icon: {
    width: '15px',
    height: '15px',
    color: '#7c3aed',
    flexShrink: 0,
    pointerEvents: 'none',
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    background: 'rgba(13, 13, 26, 0.85)',
    color: '#e2e8f0',
    border: '1px solid rgba(124, 58, 237, 0.5)',
    borderRadius: '6px',
    padding: '4px 28px 4px 8px',
    fontSize: '12px',
    fontFamily: 'inherit',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237c3aed'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    minWidth: '130px',
    letterSpacing: '0.01em',
  },
};

export default LanguageDropdown;
