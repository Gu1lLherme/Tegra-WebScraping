# Tegra Challenger: Web scraping workflow with n8n 

## Desafio do Projeto

**Tegra-WebScraping:** Construir um fluxo de trabalho de automação de web scraping usando **n8n** que:  
- Extrai conteúdo de websites  
- Lida com medidas comuns anti-bot  
- Armazena os dados processados em um banco de dados vetorial **Supabase** para pesquisa semântica  
- Utiliza componentes de IA com **OpenAI Model** para geração de embeddings e RAG.

---

## 1. Configuração (Setup)

Para executar este workflow, você precisará dos seguintes serviços e credenciais:

| Serviço          | Credencial                       | Necessária | Descrição                                                                 |
|------------------|----------------------------------|----------- |----------------------------------------------------------------------------|
| n8n              | N/A                              | ✅         | Ambiente de execução para o `workflow.json`.                              |
| Google Sheets    | Chave de API / OAuth 2.0         | ✅         | Fonte de dados inicial para as URLs a serem processadas.                  |
| Supabase         | URL do Projeto + `anon key`      | ✅         | Banco de dados principal para o Vector Store e tabela de status.          |
| OpenAI           | Chave de API                     | ✅         | Utilizada para gerar embeddings (vetores numéricos).                      |

### Configuração passo a passo

1. **Importar o Workflow**  
   - Importe o arquivo `workflow.json` no seu ambiente n8n.

2. **Configurar a Tabela de Input (Google Sheets)**  
   - Crie uma planilha com as colunas mínimas:  
     - `url`  
     - `status`  
   - Inicialize a coluna `status` com `PENDENTE` para as URLs que precisam ser processadas.

3. **Atualizar Credenciais no n8n**  
   - Configure os nós do **Google Sheets**, **Supabase** e **OpenAI** com suas credenciais.

4. **Configurar o Nó Supabase (LOAD - Upload to Database)**  
   - Verifique se a tabela no Supabase está pronta para receber os dados (campos para `chunk`, `metadata` e `embedding`).

5. **Pronto para Executar **  
   - O workflow pode ser ativado manualmente ou via **cron job**.

---

## 2. Documentação do Workflow (Visão Geral da Arquitetura)

O workflow está dividido em **5 etapas lógicas**:

### 1️⃣ Entrada de Informações (Input)
- **Trigger:** O workflow é iniciado manualmente.  
- **Google Sheets:** Busca as URLs de input.  
- **Verificador de Status:** Filtra apenas URLs com `PENDENTE`.

---

### 2️⃣ EXTRAÇÃO (Extract)
Responsável por navegar e extrair o conteúdo principal das páginas, com mecanismo anti-bot.

- **LOOP PRINCIPAL:** Itera sobre as URLs.  
- **Puppeteer:** Faz a extração inicial (renderização completa).
- **Mecanismo de Retentativas:** Caso a extração falhe, o Puppeteer tenta novamente até **2 vezes** antes de marcar a URL como falha.  
- **Filtro de Links:** Limita a 10 sublinks relevantes por página.  
- **LOOP SECUNDÁRIO:** Extrai conteúdo dos sublinks filtrados.  

---

### 3️⃣ TRANSFORME (Transform)
Prepara o texto para geração de embeddings.

- **Combina Conteúdos:** Consolida texto principal + sublinks.  
- **Intelligent Chunking:** Divide o texto em chunks menores e coesos para melhorar a busca semântica.

---

### 4️⃣ LOAD (Carregamento)
- **OpenAI Embeddings:** Gera vetores numéricos para cada chunk.  
- **Supabase Vector Store:** Insere chunks, embeddings e metadados.  
- **Atualiza Status:** Marca URL como `PROCESSADO` no Google Sheets.

---

### 5️⃣ Busca Semântica (RAG Agent Architecture)
Arquitetura que consome os dados extraídos.

- **Metadata Agent & RAG Agent:** Usa LLM (OpenAI) para processar consultas.  
- **Vector Store com Rerank:** Busca semântica no Supabase e reclassifica resultados antes de gerar a resposta final.

---

## 3. Perguntas a Abordar
Este projeto visa responder:
- Como automatizar a extração e indexação de conteúdo web de forma robusta?
- Como lidar com medidas anti-bot em larga escala?
- Como estruturar dados para busca semântica eficiente?

---

## 4. Desafio: Parte Mais Difícil & Solução

**Desafio:**  
Garantir a robustez da extração dos links internos da pagina principal dos websites e aos bloqueios comuns (Cloudflare, CAPTCHAs, tempo de carregamento, etc.).

**Soluções adotadas:**

- **Estratégia Híbrida com Puppeteer:**  
  Utilização do **Puppeteer** no loop principal para lidar com páginas dinâmicas renderizadas em JavaScript, garantindo maior fidelidade na captura do conteúdo.

- **Mecanismo de Retentativas:**  
  Em caso de falha na extração, o Puppeteer executa automaticamente **até 2 novas tentativas** antes de marcar a URL como não processada.  
  Isso permite contornar falhas temporárias (ex: timeouts, carregamento lento) sem depender de serviços externos.

- **Filtro de Links Inteligente:**  
  Reduz o ruído ao limitar e priorizar sublinks relevantes, otimizando tempo de execução e qualidade do conteúdo extraído.

---

## 5. Escalabilidade: Processando 500 URLs/dia

Para escalar de forma eficiente:

1. **Scraping Distribuído/Gerenciado:**  
   Migrar do Puppeteer local para uma **API de scraping com proxies rotativos**.

2. **Execução Paralela:**  
   Configurar o n8n em **modo Cluster**, permitindo processamento paralelo no LOOP PRINCIPAL.

3. **Fila de Tarefas:**  
   Substituir Google Sheets por uma **fila (ex: Redis)** ou banco de dados para enfileirar tarefas assíncronas em larga escala.

---

## 6. Melhoria Futuras

### **Sistema de Qualidade e Classificação Semântica Pré-Chunking**

Antes do chunking, aplicar um nó LLM para:

- **Limpeza de Ruído:**  
  Remover elementos como rodapés, menus e boilerplate.  

- **Classificação de Qualidade:**  
  Avaliar densidade e relevância do conteúdo.  
   Permite descartar páginas vazias ou de baixa qualidade, reduzindo custos de API e garantindo dados de alto valor no Vector Store.

---

## Créditos
Desafio desenvolvido no contexto Tegra Challenger, utilizando:
- [n8n](https://n8n.io)  
- [Supabase](https://supabase.com)  
- [OpenAI](https://openai.com)  
- [Puppeteer](https://github.com/drudge/n8n-nodes-puppeteer)
