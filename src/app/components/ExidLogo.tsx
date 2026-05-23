import Group1410103526 from '../imports/Group1410103526'

interface ExidLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ExidLogo({ className = '', size = 'md' }: ExidLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${className} relative`}
      style={{
        // Устанавливаем CSS переменные для изменения цвета в зависимости от темы
        '--fill-0': 'var(--foreground)'
      } as React.CSSProperties}
    >
      <div className="dark:invert">
        <Group1410103526 />
      </div>
    </div>
  )
}