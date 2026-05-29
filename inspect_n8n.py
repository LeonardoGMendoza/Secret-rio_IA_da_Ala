import json

for file in ['n8n_roteador_mestre.json', 'n8n_workflow_completo.json']:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"--- {file} ---")
            for node in data.get('nodes', []):
                print(f"Node: {node['name']} ({node['type']})")
    except Exception as e:
        print(f"Error loading {file}: {e}")
