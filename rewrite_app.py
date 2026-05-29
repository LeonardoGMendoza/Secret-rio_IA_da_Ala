with open('dashboard/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write('''import { useState, useEffect } from 'react';
import './index.css';

// Configurações e Mock Temporário
const CONFIG = {
  N8N_BASE: 'https://n8n.sandlj.com.br'
};

const MOCK_ENTREVISTAS = [
  { id: 1, membro: 'João Santos', data: '2026-06-01', hora: '19:00', assunto: 'Renovação de Recomendação', status: 'agendada' },
  { id: 2, membro: 'Família Souza', data: '2026-06-01', hora: '19:30', assunto: 'Aconselhamento', status: 'agendada' },
];

const MOCK_AGENDA_BISPADO = [
  { id: 1, data: '2026-06-01', inicio: '19:00', fim: '21:00', lider: 'Bispo' },
  { id: 2, data: '2026-06-05', inicio: '18:00', fim: '20:00', lider: '1º Conselheiro' },
];

const MOCK_MEMBROS = [
  { id: 1, nome: 'Maria Silva', telefone: '(11) 99999-1111', recomendacao: '2026-06-25', status: 'ativo' },
  { id: 2, nome: 'Carlos Oliveira', telefone: '(11) 99999-2222', recomendacao: '2027-01-10', status: 'ativo' },
];

function App() {
  const [user, setUser] = useState(null); // { nome, role }
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <LoginScreen onLogin={(u) => setUser(u)} />;
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} />
      
      <main className="main-content">
        <header className="topbar glass-panel">
          <div>
            <h1 className="page-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="page-subtitle">Bem-vindo de volta, {user.nome}.</p>
          </div>
          <div className="user-profile">
            <div className="avatar">{user.nome.charAt(0)}</div>
            <button className="btn-logout" onClick={() => setUser(null)}>Sair</button>
          </div>
        </header>

        <div className="content-grid">
          {activeTab === 'dashboard' && <Dashboard role={user.role} />}
          {activeTab === 'entrevistas' && <Entrevistas role={user.role} />}
          {activeTab === 'agenda' && <AgendaBispado role={user.role} />}
          {activeTab === 'membros' && user.role === 'secretario' && <MembrosList />}
          {activeTab === 'mensagens' && user.role === 'secretario' && <MensagensLideranca />}
        </div>
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (usuario === 'secretario' && senha === 'ala123') {
      onLogin({ nome: 'Secretário', role: 'secretario' });
    } else if (usuario === 'bispo' && senha === 'bispo123') {
      onLogin({ nome: 'Bispo', role: 'bispado' });
    } else {
      setErro(true);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel" style={{ textAlign: 'center' }}>
        <h1 style={{fontSize: '3rem', margin: 0}}>⛪</h1>
        <h2>Secretário IA da Ala</h2>
        <p>Acesse seu painel administrativo</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Usuário</label>
            <input type="text" placeholder="secretario ou bispo" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          {erro && <span className="error-message" style={{color: 'red'}}>Usuário ou senha incorretos.</span>}
          <button type="submit" className="btn-login" style={{width: '100%', padding: 12, marginTop: 10, background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 8}}>Entrar no Painel</button>
        </form>
      </div>
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab, role }) {
  const navs = role === 'secretario' ? [
    { id: 'dashboard', label: 'Visão Geral', icon: '🏠' },
    { id: 'entrevistas', label: 'Entrevistas', icon: '🗓️' },
    { id: 'agenda', label: 'Agenda do Bispo', icon: '⌚' },
    { id: 'membros', label: 'Membros & Recomendações', icon: '👥' },
    { id: 'mensagens', label: 'Avisos da IA', icon: '🤖' }
  ] : [
    { id: 'dashboard', label: 'Meu Resumo', icon: '🏠' },
    { id: 'entrevistas', label: 'Minhas Entrevistas', icon: '🗓️' },
    { id: 'agenda', label: 'Definir Minha Agenda', icon: '⌚' }
  ];

  return (
    <aside className="sidebar">
      <div className="logo" style={{textAlign: 'center', marginBottom: 30}}>
        <h1 style={{fontSize: '2rem', margin: 0}}>⛪</h1>
        <h2 style={{fontSize: '1.2rem', color: 'white'}}>Secretário IA</h2>
      </div>
      <nav className="nav-menu">
        {navs.map(n => (
          <button key={n.id} className={`nav-item ${activeTab === n.id ? 'active' : ''}`} onClick={() => setActiveTab(n.id)} style={{display: 'flex', gap: 10, alignItems: 'center', background: 'transparent', border: 'none', color: activeTab === n.id ? 'white' : '#aaa', width: '100%', padding: '12px 20px', cursor: 'pointer', textAlign: 'left', borderLeft: activeTab === n.id ? '3px solid var(--accent-primary)' : '3px solid transparent', backgroundColor: activeTab === n.id ? 'rgba(255,255,255,0.05)' : 'transparent'}}>
            <span>{n.icon}</span> {n.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Dashboard({ role }) {
  return (
    <div className="animate-fade-in">
      <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
        <MetricCard title="Entrevistas Hoje" value="2" icon="📋" color="var(--accent-primary)" />
        {role === 'secretario' && <MetricCard title="Recomendações a Vencer (30d)" value="3" icon="⚠️" color="var(--warning)" />}
        <MetricCard title="Avisos Não Lidos" value="1" icon="🔔" color="var(--success)" />
      </div>

      <div className="main-panels" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="panel glass-panel" style={{padding: 20, borderRadius: 12}}>
          <h2>🗓️ Próximas Entrevistas</h2>
          <ul style={{listStyle: 'none', padding: 0}}>
            {MOCK_ENTREVISTAS.map(e => (
              <li key={e.id} style={{padding: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between'}}>
                <div><strong>{e.membro}</strong><br/><small>{e.assunto}</small></div>
                <div style={{textAlign: 'right'}}><strong>{e.data}</strong><br/><small>{e.hora}</small></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div className="metric-card glass-panel" style={{padding: 20, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${color}`}}>
      <div>
        <h3 style={{margin: 0, fontSize: '0.9rem', color: '#aaa'}}>{title}</h3>
        <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{value}</div>
      </div>
      <div style={{fontSize: '2.5rem'}}>{icon}</div>
    </div>
  );
}

function AgendaBispado({ role }) {
  const [data, setData] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    alert('Funcionalidade de inserir no n8n será implementada em breve!');
  };

  return (
    <div className="animate-fade-in glass-panel" style={{padding: 24, borderRadius: 12}}>
      <h2>⌚ {role === 'bispado' ? 'Minha Disponibilidade (Bispo/Conselheiros)' : 'Agenda do Bispado'}</h2>
      <p>Configure os dias e horários que você estará disponível na igreja para entrevistas. A IA usará isso para marcar horários com os membros que mandarem mensagem no WhatsApp.</p>
      
      {role === 'bispado' && (
        <form onSubmit={handleAdd} style={{display: 'flex', gap: 15, marginBottom: 30, background: 'rgba(0,0,0,0.2)', padding: 15, borderRadius: 8}}>
          <div style={{flex: 1}}><label>Data</label><input type="date" value={data} onChange={e=>setData(e.target.value)} required style={{width: '100%', padding: 8}}/></div>
          <div style={{flex: 1}}><label>Início</label><input type="time" value={inicio} onChange={e=>setInicio(e.target.value)} required style={{width: '100%', padding: 8}}/></div>
          <div style={{flex: 1}}><label>Fim</label><input type="time" value={fim} onChange={e=>setFim(e.target.value)} required style={{width: '100%', padding: 8}}/></div>
          <div style={{display: 'flex', alignItems: 'flex-end'}}><button type="submit" style={{padding: '10px 20px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Salvar Horário</button></div>
        </form>
      )}

      <h3>Horários Cadastrados</h3>
      <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: 15}}>
        <thead>
          <tr style={{borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
            <th style={{padding: 10}}>Líder</th>
            <th style={{padding: 10}}>Data</th>
            <th style={{padding: 10}}>Horário</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_AGENDA_BISPADO.map(a => (
            <tr key={a.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
              <td style={{padding: 10}}>{a.lider}</td>
              <td style={{padding: 10}}>{a.data}</td>
              <td style={{padding: 10}}>{a.inicio} as {a.fim}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Entrevistas({ role }) {
  return (
    <div className="animate-fade-in glass-panel" style={{padding: 24, borderRadius: 12}}>
      <h2>🗓️ Controle de Entrevistas</h2>
      <p>Lista de entrevistas agendadas pela IA ou pelo secretário.</p>
      <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: 15}}>
        <thead>
          <tr style={{borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
            <th style={{padding: 10}}>Membro</th>
            <th style={{padding: 10}}>Assunto</th>
            <th style={{padding: 10}}>Data/Hora</th>
            <th style={{padding: 10}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_ENTREVISTAS.map(e => (
            <tr key={e.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
              <td style={{padding: 10}}><strong>{e.membro}</strong></td>
              <td style={{padding: 10}}>{e.assunto}</td>
              <td style={{padding: 10}}>{e.data} às {e.hora}</td>
              <td style={{padding: 10}}><span style={{background: 'var(--accent-primary)', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem'}}>{e.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MembrosList() {
  return (
    <div className="animate-fade-in glass-panel" style={{padding: 24, borderRadius: 12}}>
      <h2>👥 Membros & Recomendações</h2>
      <p>O robô monitora essa tabela e enviará um WhatsApp para quem tiver a recomendação vencendo em 30 dias.</p>
      <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: 15}}>
        <thead>
          <tr style={{borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
            <th style={{padding: 10}}>Membro</th>
            <th style={{padding: 10}}>WhatsApp</th>
            <th style={{padding: 10}}>Vencimento Rec.</th>
            <th style={{padding: 10}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_MEMBROS.map(m => (
            <tr key={m.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
              <td style={{padding: 10}}><strong>{m.nome}</strong></td>
              <td style={{padding: 10}}>{m.telefone}</td>
              <td style={{padding: 10, color: m.recomendacao.includes('2026-06') ? 'var(--warning)' : 'white'}}>{m.recomendacao}</td>
              <td style={{padding: 10}}>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MensagensLideranca() {
  return (
    <div className="animate-fade-in glass-panel" style={{padding: 24, borderRadius: 12}}>
      <h2>🤖 Avisos da IA</h2>
      <p>Mensagens, recados e mudanças de endereço captadas pela IA no WhatsApp ("peixe na água").</p>
      <div style={{background: 'rgba(0,0,0,0.2)', padding: 15, borderRadius: 8, marginBottom: 10, borderLeft: '4px solid var(--warning)'}}>
        <strong>De: João Santos</strong>
        <p>"Oi, mudei de casa. Meu novo endereço é Rua Nova, 123."</p>
        <button style={{background: 'var(--success)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: 4, cursor: 'pointer'}}>Marcar como Atualizado no LCR</button>
      </div>
    </div>
  );
}

export default App;
''')
print('Modificado src/App.jsx')
