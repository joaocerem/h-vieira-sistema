CREATE TABLE empresas (
    id UUID DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    CONSTRAINT pk_empresas PRIMARY KEY (id)
);

CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    identificador_de_acesso TEXT NOT NULL,
    situacao_de_acesso TEXT,
    CONSTRAINT pk_usuarios PRIMARY KEY (id)
);

CREATE TABLE clientes (
    id UUID DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    CONSTRAINT pk_clientes PRIMARY KEY (id),
    CONSTRAINT uq_clientes_nome UNIQUE (nome)
);

CREATE TABLE fornecedores (
    id UUID DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    CONSTRAINT pk_fornecedores PRIMARY KEY (id),
    CONSTRAINT uq_fornecedores_nome UNIQUE (nome)
);

CREATE TABLE categorias (
    id UUID DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    CONSTRAINT pk_categorias PRIMARY KEY (id)
);
