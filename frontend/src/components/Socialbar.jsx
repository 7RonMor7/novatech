import './SocialBar.css';

const redes = [
  {
    nombre: 'Facebook',
    url: 'https://www.facebook.com',
    icon: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
    color: '#1877F2',
    aura: 'rgba(24, 119, 242, 0.45)',
  },
  {
    nombre: 'Instagram',
    url: 'https://www.instagram.com/ronaldmor_7/',
    icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
    color: '#E1306C',
    aura: 'rgba(225, 48, 108, 0.45)',
  },
  {
    nombre: 'X / Twitter',
    url: 'https://x.com/MiguelO38906454',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968830.png',
    color: '#000000',
    aura: 'rgba(180, 180, 180, 0.45)',
  },
  {
    nombre: 'YouTube',
    url: 'https://www.youtube.com',
    icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
    color: '#FF0000',
    aura: 'rgba(255, 0, 0, 0.45)',
  },
  {
    nombre: 'TikTok',
    url: 'https://www.tiktok.com/@ospina__083?_r=1&_t=ZS-96KskoOwMeS',
    icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
    color: '#010101',
    aura: 'rgba(105, 201, 208, 0.50)',
  },
  {
    nombre: 'WhatsApp',
    url: 'https://wa.me/573011462373',
    icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
    color: '#25D366',
    aura: 'rgba(37, 211, 102, 0.45)',
  },
  {
    nombre: 'LinkedIn',
    url: 'https://www.linkedin.com',
    icon: 'https://cdn-icons-png.flaticon.com/512/3536/3536505.png',
    color: '#0A66C2',
    aura: 'rgba(10, 102, 194, 0.45)',
  },
];

export default function SocialBar() {
  return (
    <div className="social-bar">
      <div className="social-bar__header">
        <div className="social-bar__line" />
        <span className="social-bar__label">Síguenos en redes</span>
        <div className="social-bar__line" />
      </div>

      <div className="social-bar__icons">
        {redes.map((red) => (
          <a
            key={red.nombre}
            href={red.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            style={{
              '--aura-color': red.aura,
              '--icon-color': red.color,
            }}
            title={red.nombre}
            aria-label={red.nombre}
          >
            <img
              src={red.icon}
              alt={red.nombre}
              className="social-btn__img"
              draggable={false}
            />
            <span className="social-btn__tooltip">{red.nombre}</span>
          </a>
        ))}
      </div>
    </div>
  );
}