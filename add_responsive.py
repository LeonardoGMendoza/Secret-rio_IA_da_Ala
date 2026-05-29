import re

with open('dashboard/src/index.css', 'a', encoding='utf-8') as f:
    f.write('''
/* --- Responsividade (Mobile) --- */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding: 16px;
    gap: 16px;
  }
  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .nav-item {
    white-space: nowrap;
    padding: 8px 12px;
  }
  .topbar {
    padding: 16px;
    margin: 16px 16px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .user-profile {
    align-self: flex-end;
    margin-top: -40px;
  }
  .content-grid {
    padding: 16px;
  }
  .main-panels {
    grid-template-columns: 1fr;
  }
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
''')
print("CSS responsivo adicionado!")
