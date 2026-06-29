import AppHeader from './AppHeader';
import AppBottomNav from './AppBottomNav';
import AppFooter from './AppFooter';

export default function MainLayout({ children, view, setView, clearEdit, editingInvoice }) {
  return (
    <div className="main-layout-wrapper">
      <AppHeader
        view={view}
        setView={setView}
        clearEdit={clearEdit}
        editingInvoice={editingInvoice}
      />

      <main className="main-layout-content">
        <div className="w-full">
          {children}
        </div>
      </main>

      <AppBottomNav 
        view={view}
        setView={setView}
        clearEdit={clearEdit}
      />
      <AppFooter />
    </div>
  );
}