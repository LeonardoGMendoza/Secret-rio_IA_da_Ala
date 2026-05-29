-- Tabela de Usuários do Sistema (Acesso Web)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'secretario' ou 'bispado'
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Membros da Ala
CREATE TABLE membros (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) UNIQUE,
    endereco TEXT,
    vencimento_recomendacao DATE,
    status VARCHAR(50) DEFAULT 'ativo', -- 'ativo', 'mudou', 'faleceu'
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Disponibilidade do Bispado (Para a IA saber quando marcar)
CREATE TABLE agenda_bispado (
    id SERIAL PRIMARY KEY,
    data_disponivel DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    lider VARCHAR(100) DEFAULT 'Bispo', -- 'Bispo', '1º Conselheiro', etc
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Entrevistas Agendadas
CREATE TABLE entrevistas (
    id SERIAL PRIMARY KEY,
    membro_id INTEGER REFERENCES membros(id),
    nome_membro VARCHAR(255), -- Caso não esteja cadastrado na tabela de membros ainda
    telefone_membro VARCHAR(50),
    data_entrevista DATE NOT NULL,
    hora_entrevista TIME NOT NULL,
    assunto VARCHAR(255), -- 'Recomendação', 'Aconselhamento', etc
    lider VARCHAR(100) DEFAULT 'Bispo',
    status VARCHAR(50) DEFAULT 'agendada', -- 'agendada', 'realizada', 'cancelada'
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Mensagens do Conselho/Bispo
CREATE TABLE mensagens_lideranca (
    id SERIAL PRIMARY KEY,
    remetente_numero VARCHAR(50),
    remetente_nome VARCHAR(255),
    conteudo TEXT NOT NULL,
    destinatario VARCHAR(100), -- 'Bispo', 'Conselho'
    status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'lida'
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuários padrão
INSERT INTO usuarios (nome, usuario, senha, role) VALUES 
('Secretário Ala', 'secretario', 'ala123', 'secretario'),
('Bispo', 'bispo', 'bispo123', 'bispado');
