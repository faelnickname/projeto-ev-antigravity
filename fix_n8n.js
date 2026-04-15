const fs = require('fs');

console.log("Iniciando Cirurgia Ocular n8n...");

// 1. Fix AI Agent
try {
    const agentFile = 'Projeto EV N8N/EV Financeira _ AI Agent.json';
    let agent = JSON.parse(fs.readFileSync(agentFile, 'utf8'));
    const modelNode = agent.nodes.find(n => n.name === 'OpenAI Chat Model');
    if (modelNode) {
        modelNode.parameters.model.value = 'gpt-4o-mini';
        modelNode.parameters.model.cachedResultName = 'gpt-4o-mini';
        console.log('✅ AI Agent: Modelo atualizado para gpt-4o-mini');
    }
    fs.writeFileSync(agentFile, JSON.stringify(agent, null, 2));
} catch (e) {
    console.error("Erro no AI Agent:", e);
}

// 2. Fix Register Tool
try {
    const registerFile = 'Projeto EV N8N/EV Financeira _ Register Tool.json';
    let register = JSON.parse(fs.readFileSync(registerFile, 'utf8'));
    const inputNode = register.nodes.find(n => n.name === 'Register input');
    if (inputNode) {
        let descField = inputNode.parameters.fieldsUi.fieldValues.find(f => f.fieldId === 'decription');
        if (descField) {
            descField.fieldId = 'description';
            console.log('✅ Register Tool: Typo da coluna description corrigido');
        }
    }
    fs.writeFileSync(registerFile, JSON.stringify(register, null, 2));
} catch (e) {
    console.error("Erro no Register Tool:", e);
}

// 3. Fix Balance Tool
try {
    const balanceFile = 'Projeto EV N8N/EV Financeira _ Balance Tool.json';
    let balance = JSON.parse(fs.readFileSync(balanceFile, 'utf8'));
    const getBalancesNode = balance.nodes.find(n => n.name === 'Get balances');
    if (getBalancesNode) {
        getBalancesNode.parameters.filterType = 'manual';
        getBalancesNode.parameters.matchType = 'allFilters';
        getBalancesNode.parameters.filters = {
            conditions: [
                { keyName: "tenant_id", condition: "eq", keyValue: "={{ $json.tenant_id }}" },
                { keyName: "created_at", condition: "gte", keyValue: "={{ $json.start_date }}" },
                { keyName: "created_at", condition: "lte", keyValue: "={{ $json.end_date }}" }
            ]
        };
        console.log('✅ Balance Tool: Filtros de segurança tenant_id e data adicionados');
    }
    fs.writeFileSync(balanceFile, JSON.stringify(balance, null, 2));
} catch (e) {
    console.error("Erro no Balance Tool:", e);
}

console.log("Cirurgia concluída com sucesso.");
