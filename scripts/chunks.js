 // --- FUNÇÃO DE CHUNKING ---
function criarChunksInteligentes(texto, tamanhoMaxCarac = 3500, overlapCarac = 300) {
    const chunks = [];
    let inicio = 0;

    if (texto.length > 200000) {
        console.warn('O texto combinado é excessivamente grande. Pode causar falha no processamento.');
    }

    while (inicio < texto.length) {
        let fim = inicio + tamanhoMaxCarac;

        if (fim < texto.length) {
            const ultimoPonto = texto.lastIndexOf('.', fim);
            const ultimaQuebra = texto.lastIndexOf('\n', fim);

            const limiteMinimo = inicio + tamanhoMaxCarac * 0.75;
            let melhorQuebra = Math.max(ultimoPonto, ultimaQuebra);
            
            if (melhorQuebra > limiteMinimo) {
                fim = melhorQuebra + 1;
            } else {
                fim = inicio + tamanhoMaxCarac;
            }
        }

        const chunk = texto.slice(inicio, fim).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }

       
        inicio = fim - overlapCarac;
        if (inicio < 0) inicio = 0; 
    }

    return chunks;
}

// --- PROCESSAMENTO PRINCIPAL ---

const inputItem = $input.first().json['combined_text '];
const resultados = [];
const URL_ORIGINAL = $('Normalização Planilhas').first().json.url; 


const textoCombinado = $input.first().json['combined_text ']; 

if (!textoCombinado || textoCombinado.length === 0) {
    console.error('Texto combinado não encontrado ou está vazio.');
   
    return inputItem; 
}

// 2. Cria chunks inteligentes

const chunks = criarChunksInteligentes(textoCombinado, 3500, 300); 

// 3. Adiciona cada chunk à lista final (preparando para o nó OpenAI Embedding)
chunks.forEach((chunk, index) => {
   
    resultados.push({
        json: {
            source_url: URL_ORIGINAL,
            content: chunk,
            chunk_index: index,
            total_chunks: chunks.length,
            // AQUI está a correção da linha 71 (ou próxima)
            // instructions: inputItem.json?.instructions || 'INSTRUÇÃO_NAO_DISPONIVEL' 
        },
        
    });
});

return resultados;