import './SearchBar.css'

export default function SearchBar({ value, onChange, placeholder = 'Buscar...', children }) {
  return (
    <div className="searchbar-row">
      <div className="searchbar-wrap">
        <span className="searchbar-icon">⌕</span>
        <input
          className="searchbar-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {value && (
          <button className="searchbar-clear" onClick={() => onChange('')}>✕</button>
        )}
      </div>
      {children && <div className="searchbar-filters">{children}</div>}
    </div>
  )
}
