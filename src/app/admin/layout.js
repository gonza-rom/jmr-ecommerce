// src/app/admin/layout.js
import AdminSidebar from './sidebar';

export const metadata = { title: 'Admin — JMR Marroquinería' };

export default function AdminLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f5f4f2',
      fontFamily: "'Inter', sans-serif",
    }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <div style={{ padding: '24px 16px', maxWidth: 1200 }}
          className="admin-main-content">
          {children}
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) {
          .admin-main-content {
            padding: 32px 36px !important;
          }
        }
      `}</style>
    </div>
  );
}