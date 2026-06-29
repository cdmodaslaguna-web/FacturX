import by1 from '../../assets/logos/by1.png';

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <span>System by:</span>
      <img src={by1} alt="System Logo" style={{ height: '14px', objectFit: 'contain' }} />
      <span>2026</span>
    </footer>
  );
}
