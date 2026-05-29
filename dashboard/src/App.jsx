import { useState, useEffect, useCallback } from 'react';
import './index.css';

const N8N = 'https://n8n.sandlj.com.br/webhook';

// ─── Helpers ────────────────────────────────────────────────────────────────
const api = {
  get: (path) => fetch(`${N8N}${path}`).then(r => r.json()).catch(() => []),
  post: (path, body) => fetch(`${N8N}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json()).catch(() => ({}))
};

// ─── App Root ────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} />
      <main className="main-content">
        <header className="topbar glass-panel">
          <div>
            <h1 className="page-title">
              {{ dashboard: 'Visão Geral', entrevistas: 'Entrevistas', agenda: 'Agenda do Bispado', membros: 'Membros & Recomendações', mensagens: 'Avisos da IA' }[activeTab]}
            </h1>
            <p className="page-subtitle">Bem-vindo, {user.nome} — Sistema Secretário IA da Ala</p>
          </div>
          <div className="user-profile">
            <div className="avatar">{user.nome.charAt(0)}</div>
            <button className="btn-logout" onClick={() => setUser(null)}>Sair</button>
          </div>
        </header>
        <div className="content-grid">
          {activeTab === 'dashboard'    && <Dashboard role={user.role} />}
          {activeTab === 'entrevistas'  && <Entrevistas role={user.role} />}
          {activeTab === 'agenda'       && <AgendaBispado role={user.role} lider={user.lider} />}
          {activeTab === 'membros'      && user.role === 'secretario' && <MembrosList />}
          {activeTab === 'mensagens'    && user.role === 'secretario' && <MensagensLideranca />}
        </div>
      </main>
    </div>
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────
const USERS = {
  secretario:   { nome: 'Secretário',      role: 'secretario',   lider: null },
  bispo:        { nome: 'Bispo',           role: 'bispado',      lider: 'Bispo' },
  '1conselheiro': { nome: '1º Conselheiro', role: 'bispado',     lider: '1_conselheiro' },
  '2conselheiro': { nome: '2º Conselheiro', role: 'bispado',     lider: '2_conselheiro' },
};
const SENHAS = {
  secretario: 'ala123', bispo: 'bispo123', '1conselheiro': 'cons123', '2conselheiro': 'cons123'
};

function LoginScreen({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (SENHAS[usuario] === senha) {
      onLogin(USERS[usuario]);
    } else {
      setErro(true);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 8 }}>⛪</div>
        <h2 style={{ margin: '0 0 4px' }}>Secretário IA da Ala</h2>
        <p style={{ color: '#aaa', marginBottom: 24 }}>Acesse seu painel administrativo</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Usuário</label>
            <input type="text" placeholder="secretario / bispo / 1conselheiro" value={usuario} onChange={e => { setUsuario(e.target.value); setErro(false); }} />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input type="password" placeholder="Senha" value={senha} onChange={e => { setSenha(e.target.value); setErro(false); }} />
          </div>
          {erro && <span style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>Usuário ou senha incorretos.</span>}
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 12 }}>Entrar no Painel</button>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, role }) {
  const navs = role === 'secretario' ? [
    { id: 'dashboard',   label: 'Visão Geral',          icon: '🏠' },
    { id: 'entrevistas', label: 'Entrevistas',           icon: '🗓️' },
    { id: 'agenda',      label: 'Agenda do Bispo',       icon: '⌚' },
    { id: 'membros',     label: 'Membros & Recomend.',   icon: '👥' },
    { id: 'mensagens',   label: 'Avisos da IA',          icon: '🤖' },
  ] : [
    { id: 'dashboard',   label: 'Meu Resumo',            icon: '🏠' },
    { id: 'entrevistas', label: 'Minhas Entrevistas',    icon: '🗓️' },
    { id: 'agenda',      label: 'Minha Disponibilidade', icon: '⌚' },
  ];

  return (
    <aside className="sidebar">
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ fontSize: '2.5rem' }}>⛪</div>
        <h2 style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>Secretário IA</h2>
      </div>
      <nav className="nav-menu">
        {navs.map(n => (
          <button
            key={n.id}
            className={`nav-item ${activeTab === n.id ? 'active' : ''}`}
            onClick={() => setActiveTab(n.id)}
          >
            <span>{n.icon}</span> {n.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ role }) {
  const [entrevistas, setEntrevistas] = useState([]);
  const [membros, setMembros] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/secretario-listar-entrevistas'),
      api.get('/secretario-listar-membros'),
      role === 'secretario' ? api.get('/secretario-listar-mensagens') : Promise.resolve([])
    ]).then(([e, m, msg]) => {
      setEntrevistas(Array.isArray(e) ? e : []);
      setMembros(Array.isArray(m) ? m : []);
      setMensagens(Array.isArray(msg) ? msg : []);
      setLoading(false);
    });
  }, [role]);

  const hoje = new Date().toISOString().split('T')[0];
  const entrevistasHoje = entrevistas.filter(e => e.data_agendamento && e.data_agendamento.startsWith(hoje));
  const recVencendo = membros.filter(m => {
    if (!m.recomendacao_vencimento) return false;
    const diff = (new Date(m.recomendacao_vencimento) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });
  const msgNaoLidas = mensagens.filter(m => !m.lida);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <div className="metrics-row">
        <MetricCard title="Entrevistas Hoje" value={entrevistasHoje.length} icon="📋" color="var(--accent-primary)" />
        {role === 'secretario' && <MetricCard title="Recomendações a Vencer (30d)" value={recVencendo.length} icon="⚠️" color="var(--warning)" />}
        {role === 'secretario' && <MetricCard title="Avisos Não Lidos" value={msgNaoLidas.length} icon="🔔" color="var(--success)" />}
      </div>
      <div className="main-panels">
        <div className="panel glass-panel">
          <h2>🗓️ Próximas Entrevistas</h2>
          {entrevistas.length === 0
            ? <p style={{ color: '#aaa' }}>Nenhuma entrevista agendada.</p>
            : <ul style={{ listStyle: 'none', padding: 0 }}>
                {entrevistas.slice(0, 5).map(e => (
                  <li key={e.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>{e.membro_nome}</strong><br /><small style={{ color: '#aaa' }}>{e.assunto} — {e.lider}</small></div>
                    <div style={{ textAlign: 'right' }}><strong>{e.data_agendamento?.split('T')[0]}</strong><br /><small>{String(e.hora_inicio).slice(0,5)}</small></div>
                  </li>
                ))}
              </ul>
          }
        </div>
        {role === 'secretario' && (
          <div className="panel glass-panel">
            <h2>⚠️ Recomendações Vencendo</h2>
            {recVencendo.length === 0
              ? <p style={{ color: '#aaa' }}>Nenhuma recomendação vencendo em 30 dias.</p>
              : <ul style={{ listStyle: 'none', padding: 0 }}>
                  {recVencendo.map(m => (
                    <li key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><strong>{m.nome}</strong><br /><small style={{ color: '#aaa' }}>{m.telefone}</small></div>
                      <div style={{ textAlign: 'right' }}><span style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>Vence: {m.recomendacao_vencimento?.split('T')[0]}</span></div>
                    </li>
                  ))}
                </ul>
            }
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div className="metric-card glass-panel" style={{ borderLeft: `4px solid ${color}` }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', fontWeight: 400 }}>{title}</h3>
        <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginTop: 4 }}>{value}</div>
      </div>
      <div style={{ fontSize: '2.5rem' }}>{icon}</div>
    </div>
  );
}

// ─── Entrevistas ─────────────────────────────────────────────────────────────
function Entrevistas({ role }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ membro_nome: '', lider: 'Bispo', data_agendamento: '', hora_inicio: '', hora_fim: '', assunto: '' });
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState(null);

  const carregar = useCallback(() => {
    setLoading(true);
    api.get('/secretario-listar-entrevistas').then(data => {
      setLista(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    const res = await api.post('/secretario-adicionar-entrevista', form);
    setSalvando(false);
    if (res && !res.error) {
      showToast('Entrevista agendada com sucesso!');
      setShowForm(false);
      setForm({ membro_nome: '', lider: 'Bispo', data_agendamento: '', hora_inicio: '', hora_fim: '', assunto: '' });
      carregar();
    } else {
      showToast('Erro ao salvar. Tente novamente.', 'error');
    }
  };

  const handleStatus = async (id, status) => {
    await api.post('/secretario-atualizar-entrevista', { id, status });
    showToast(`Status atualizado para "${status}"`);
    carregar();
  };

  const statusColor = { agendada: 'var(--accent-primary)', realizada: 'var(--success)', cancelada: '#ff6b6b' };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: 24, borderRadius: 12, position: 'relative' }}>
      {toast && <Toast msg={toast.msg} tipo={toast.tipo} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>🗓️ Controle de Entrevistas</h2>
        {role === 'secretario' && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancelar' : '+ Novo Agendamento'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSalvar} className="form-grid" style={{ marginBottom: 24 }}>
          <div className="input-group"><label>Membro</label><input value={form.membro_nome} onChange={e => setForm({ ...form, membro_nome: e.target.value })} required placeholder="Nome do membro" /></div>
          <div className="input-group"><label>Líder</label>
            <select value={form.lider} onChange={e => setForm({ ...form, lider: e.target.value })}>
              <option value="Bispo">Bispo</option>
              <option value="1_conselheiro">1º Conselheiro</option>
              <option value="2_conselheiro">2º Conselheiro</option>
            </select>
          </div>
          <div className="input-group"><label>Assunto</label><input value={form.assunto} onChange={e => setForm({ ...form, assunto: e.target.value })} placeholder="Ex: Renovação de Recomendação" /></div>
          <div className="input-group"><label>Data</label><input type="date" value={form.data_agendamento} onChange={e => setForm({ ...form, data_agendamento: e.target.value })} required /></div>
          <div className="input-group"><label>Início</label><input type="time" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} required /></div>
          <div className="input-group"><label>Fim</label><input type="time" value={form.hora_fim} onChange={e => setForm({ ...form, hora_fim: e.target.value })} required /></div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-success" disabled={salvando}>{salvando ? 'Salvando...' : '✓ Salvar Agendamento'}</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : lista.length === 0
        ? <p style={{ color: '#aaa' }}>Nenhuma entrevista agendada.</p>
        : (
          <table className="data-table">
            <thead><tr><th>Membro</th><th>Assunto</th><th>Líder</th><th>Data/Hora</th><th>Status</th>{role === 'secretario' && <th>Ações</th>}</tr></thead>
            <tbody>
              {lista.map(e => (
                <tr key={e.id}>
                  <td><strong>{e.membro_nome}</strong></td>
                  <td>{e.assunto}</td>
                  <td>{e.lider}</td>
                  <td>{e.data_agendamento?.split('T')[0]} às {String(e.hora_inicio).slice(0,5)}</td>
                  <td><span className="badge" style={{ background: statusColor[e.status] || '#555' }}>{e.status}</span></td>
                  {role === 'secretario' && (
                    <td style={{ display: 'flex', gap: 5 }}>
                      <button className="btn-sm btn-success" onClick={() => handleStatus(e.id, 'realizada')}>✓</button>
                      <button className="btn-sm btn-danger" onClick={() => handleStatus(e.id, 'cancelada')}>✕</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  );
}

// ─── Agenda do Bispado ────────────────────────────────────────────────────────
function AgendaBispado({ role, lider }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ lider: lider || 'Bispo', data_disponivel: '', hora_inicio: '', hora_fim: '' });
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState(null);

  const carregar = useCallback(() => {
    api.get('/secretario-listar-agenda').then(data => {
      setLista(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await api.post('/secretario-adicionar-agenda', form);
    setSalvando(false);
    showToast('Horário salvo na agenda!');
    carregar();
  };

  const handleRemover = async (id) => {
    await api.post('/secretario-remover-agenda', { id });
    showToast('Horário removido.');
    carregar();
  };

  const liderLabel = { Bispo: 'Bispo', '1_conselheiro': '1º Conselheiro', '2_conselheiro': '2º Conselheiro' };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: 24, borderRadius: 12, position: 'relative' }}>
      {toast && <Toast msg={toast.msg} tipo={toast.tipo} />}
      <h2>⌚ {role === 'bispado' ? 'Minha Disponibilidade' : 'Agenda do Bispado'}</h2>
      <p style={{ color: '#aaa', marginBottom: 20 }}>
        {role === 'bispado'
          ? 'Configure os dias e horários em que você estará disponível. A IA usará esses horários para marcar entrevistas automaticamente.'
          : 'Visualize e gerencie todos os horários disponíveis do Bispado para entrevistas.'}
      </p>

      <form onSubmit={handleSalvar} className="form-grid" style={{ marginBottom: 24 }}>
        {role === 'secretario' && (
          <div className="input-group"><label>Líder</label>
            <select value={form.lider} onChange={e => setForm({ ...form, lider: e.target.value })}>
              <option value="Bispo">Bispo</option>
              <option value="1_conselheiro">1º Conselheiro</option>
              <option value="2_conselheiro">2º Conselheiro</option>
            </select>
          </div>
        )}
        <div className="input-group"><label>Data</label><input type="date" value={form.data_disponivel} onChange={e => setForm({ ...form, data_disponivel: e.target.value })} required /></div>
        <div className="input-group"><label>Início</label><input type="time" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} required /></div>
        <div className="input-group"><label>Fim</label><input type="time" value={form.hora_fim} onChange={e => setForm({ ...form, hora_fim: e.target.value })} required /></div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : '+ Adicionar Horário'}</button>
        </div>
      </form>

      <h3>Horários Cadastrados</h3>
      {loading ? <LoadingSpinner /> : lista.length === 0
        ? <p style={{ color: '#aaa' }}>Nenhum horário cadastrado ainda.</p>
        : (
          <table className="data-table">
            <thead><tr><th>Líder</th><th>Data</th><th>Horário</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>
              {lista.map(a => (
                <tr key={a.id}>
                  <td>{liderLabel[a.lider] || a.lider}</td>
                  <td>{a.data_disponivel?.split('T')[0]}</td>
                  <td>{String(a.hora_inicio).slice(0,5)} às {String(a.hora_fim).slice(0,5)}</td>
                  <td><span className="badge" style={{ background: a.disponivel ? 'var(--success)' : '#555' }}>{a.disponivel ? 'Disponível' : 'Ocupado'}</span></td>
                  <td><button className="btn-sm btn-danger" onClick={() => handleRemover(a.id)}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  );
}

// ─── Membros ──────────────────────────────────────────────────────────────────
function MembrosList() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', telefone: '', endereco: '', recomendacao_vencimento: '', status: 'ativo' });
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState({});
  const [toast, setToast] = useState(null);

  const carregar = useCallback(() => {
    api.get('/secretario-listar-membros').then(data => {
      setLista(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    if (editando) {
      await api.post('/secretario-editar-membro', { ...form, id: editando });
      showToast('Membro atualizado!');
    } else {
      await api.post('/secretario-adicionar-membro', form);
      showToast('Membro adicionado com sucesso!');
    }
    setSalvando(false);
    setShowForm(false);
    setEditando(null);
    setForm({ nome: '', telefone: '', endereco: '', recomendacao_vencimento: '', status: 'ativo' });
    carregar();
  };

  const handleEditar = (m) => {
    setEditando(m.id);
    setForm({
      nome: m.nome,
      telefone: m.telefone || '',
      endereco: m.endereco || '',
      recomendacao_vencimento: m.recomendacao_vencimento?.split('T')[0] || '',
      status: m.status || 'ativo'
    });
    setShowForm(true);
  };

  const handleAvisarZap = async (membro) => {
    setEnviando(prev => ({ ...prev, [membro.id]: true }));
    const res = await api.post('/secretario-alerta-recomendacao', {
      membro_id: membro.id,
      nome: membro.nome,
      telefone: membro.telefone,
      vencimento: membro.recomendacao_vencimento?.split('T')[0]
    });
    setEnviando(prev => ({ ...prev, [membro.id]: false }));
    if (res && !res.error) {
      showToast(`✅ Mensagem enviada para ${membro.nome} no WhatsApp!`);
    } else {
      showToast('Erro ao enviar. Verifique a Z-API.', 'error');
    }
  };

  const diasParaVencer = (data) => {
    if (!data) return 999;
    return Math.ceil((new Date(data) - new Date()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: 24, borderRadius: 12, position: 'relative' }}>
      {toast && <Toast msg={toast.msg} tipo={toast.tipo} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>👥 Membros & Recomendações</h2>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ nome: '', telefone: '', endereco: '', recomendacao_vencimento: '', status: 'ativo' }); }}>
          {showForm ? '✕ Cancelar' : '+ Adicionar Membro'}
        </button>
      </div>
      <p style={{ color: '#aaa', marginBottom: 16 }}>O robô monitora recomendações vencendo em 30 dias e você pode avisar pelo WhatsApp com um clique.</p>

      {showForm && (
        <form onSubmit={handleSalvar} className="form-grid" style={{ marginBottom: 24 }}>
          <div className="input-group"><label>Nome</label><input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required placeholder="Nome completo" /></div>
          <div className="input-group"><label>WhatsApp</label><input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="5511999999999" /></div>
          <div className="input-group"><label>Endereço</label><input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, bairro" /></div>
          <div className="input-group"><label>Vencimento Recomendação</label><input type="date" value={form.recomendacao_vencimento} onChange={e => setForm({ ...form, recomendacao_vencimento: e.target.value })} /></div>
          <div className="input-group"><label>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="ativo">Ativo</option>
              <option value="mudou">Mudou</option>
              <option value="faleceu">Faleceu</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-success" disabled={salvando}>{salvando ? 'Salvando...' : editando ? '✓ Atualizar' : '✓ Salvar Membro'}</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : lista.length === 0
        ? <p style={{ color: '#aaa' }}>Nenhum membro cadastrado.</p>
        : (
          <table className="data-table">
            <thead><tr><th>Membro</th><th>WhatsApp</th><th>Vencimento Rec.</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {lista.map(m => {
                const dias = diasParaVencer(m.recomendacao_vencimento);
                const urgente = dias >= 0 && dias <= 30;
                const vencida = dias < 0;
                return (
                  <tr key={m.id}>
                    <td><strong>{m.nome}</strong></td>
                    <td>{m.telefone}</td>
                    <td style={{ color: vencida ? '#ff6b6b' : urgente ? 'var(--warning)' : 'inherit' }}>
                      {m.recomendacao_vencimento?.split('T')[0] || '—'}
                      {urgente && <span style={{ marginLeft: 8, fontSize: '0.75rem', background: 'var(--warning)', color: '#000', padding: '2px 6px', borderRadius: 4 }}>{dias}d</span>}
                      {vencida && <span style={{ marginLeft: 8, fontSize: '0.75rem', background: '#ff6b6b', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>Vencida</span>}
                    </td>
                    <td><span className="badge" style={{ background: m.status === 'ativo' ? 'var(--success)' : '#555' }}>{m.status}</span></td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn-sm" onClick={() => handleEditar(m)}>✏️ Editar</button>
                      {(urgente || vencida) && (
                        <button
                          className="btn-sm btn-zap"
                          disabled={enviando[m.id]}
                          onClick={() => handleAvisarZap(m)}
                        >
                          {enviando[m.id] ? '⏳...' : '📱 Avisar Zap'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )
      }
    </div>
  );
}

// ─── Mensagens da IA ──────────────────────────────────────────────────────────
function MensagensLideranca() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const carregar = useCallback(() => {
    api.get('/secretario-listar-mensagens').then(data => {
      setLista(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const showToast = (msg) => { setToast({ msg }); setTimeout(() => setToast(null), 3000); };

  const handleMarcarLida = async (id) => {
    await api.post('/secretario-marcar-mensagem-lida', { id });
    showToast('Marcado como atualizado!');
    carregar();
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: 24, borderRadius: 12, position: 'relative' }}>
      {toast && <Toast msg={toast.msg} />}
      <h2>🤖 Avisos da IA</h2>
      <p style={{ color: '#aaa', marginBottom: 20 }}>Mensagens e recados captados pela IA no WhatsApp que precisam de atenção do Secretário.</p>
      {loading ? <LoadingSpinner /> : lista.length === 0
        ? <p style={{ color: '#aaa' }}>Nenhum aviso pendente. Tudo em ordem! ✅</p>
        : lista.map(m => (
          <div key={m.id} style={{
            background: 'rgba(0,0,0,0.2)',
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            borderLeft: `4px solid ${m.lida ? '#555' : 'var(--warning)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong>{m.remetente_nome}</strong>
              <small style={{ color: '#aaa' }}>{m.criado_em?.split('T')[0]}</small>
            </div>
            <p style={{ margin: '0 0 10px', color: '#ddd' }}>"{m.mensagem}"</p>
            {!m.lida && (
              <button className="btn-success" style={{ fontSize: '0.85rem', padding: '6px 14px' }} onClick={() => handleMarcarLida(m.id)}>
                ✓ Marcar como Atualizado no LCR
              </button>
            )}
            {m.lida && <span style={{ fontSize: '0.8rem', color: '#777' }}>✓ Atualizado</span>}
          </div>
        ))
      }
    </div>
  );
}

// ─── Componentes Auxiliares ──────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

function Toast({ msg, tipo = 'success' }) {
  const bg = tipo === 'error' ? '#ff6b6b' : tipo === 'success' ? 'var(--success)' : 'var(--accent-primary)';
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: bg, color: 'white', padding: '12px 20px',
      borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      animation: 'slideIn 0.3s ease', maxWidth: 350
    }}>
      {msg}
    </div>
  );
}

export default App;
