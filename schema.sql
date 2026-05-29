-- Banco de Dados: Secretário IA da Ala

-- Tabela de Membros (Atualizada via Excel/Manualmente)
CREATE TABLE IF NOT EXISTS membros (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(30),
    endereco TEXT,
    recomendacao_vencimento DATE,
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, mudou, faleceu
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos (Entrevistas com o Bispado)
CREATE TABLE IF NOT EXISTS entrevistas (
    id SERIAL PRIMARY KEY,
    membro_nome VARCHAR(150),
    membro_id INT REFERENCES membros(id),
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    lider VARCHAR(50) NOT NULL, -- Bispo, 1_conselheiro, 2_conselheiro
    assunto VARCHAR(200),
    status VARCHAR(50) DEFAULT 'agendada', -- agendada, realizada, cancelada
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Recados e Avisos para o Bispado
CREATE TABLE IF NOT EXISTS mensagens_lideranca (
    id SERIAL PRIMARY KEY,
    remetente_nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(30),
    mensagem TEXT NOT NULL,
    lider_destino VARCHAR(50) DEFAULT 'Conselho', -- Bispo, Conselho, etc.
    lida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserindo alguns dados de teste (Serão apagados depois quando subir o Excel oficial)
INSERT INTO membros (nome, telefone, endereco, recomendacao_vencimento, status) VALUES
('João Santos', '5511999991111', 'Rua das Flores, 123', CURRENT_DATE + INTERVAL '15 days', 'ativo'),
('Maria Silva', '5511988882222', 'Av Principal, 456', CURRENT_DATE + INTERVAL '2 months', 'ativo'),
('Pedro Oliveira', '5511977773333', 'Rua Alegre, 789', CURRENT_DATE - INTERVAL '5 days', 'ativo');

INSERT INTO entrevistas (membro_nome, data_agendamento, hora_inicio, hora_fim, lider, assunto) VALUES
('João Santos', CURRENT_DATE + INTERVAL '1 day', '19:00', '19:30', 'Bispo', 'Renovação de Recomendação'),
('Maria Silva', CURRENT_DATE + INTERVAL '2 days', '20:00', '21:00', '1_conselheiro', 'Aconselhamento');

INSERT INTO mensagens_lideranca (remetente_nome, telefone, mensagem, lider_destino) VALUES
('Pedro Oliveira', '5511977773333', 'Irmão, me mudei para a cidade vizinha, preciso transferir meus registros.', 'Secretário');
