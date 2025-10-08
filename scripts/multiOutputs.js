// 1. Acessa o ÚNICO item de entrada (que contém o array de links)
const inputItem = $input.first();

// 2. Extrai o array de links (limitando a 10, como no seu fluxo anterior)
const linksArray = (inputItem.json.links || []).slice(0, 10);

// 3. Mapeia o array de links para criar MÚLTIPLOS itens de saída.
return linksArray.map(link => ({
    json: { 
        url: link // Cada item de saída terá a URL individual
    },
    // Mantém a ligação com o item original (crucial para o n8n)
    pairedItem: {
        item: inputItem.pairedItem?.item, 
        input: inputItem.pairedItem?.input 
    }
}));