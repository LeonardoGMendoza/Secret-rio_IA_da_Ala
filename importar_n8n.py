import json
import urllib.request
import urllib.error
import http.cookiejar
import sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = "https://n8n.sandlj.com.br"
EMAIL = "desenvolvimento3000@outlook.com"
SENHA = "216435@Maria"

# Cookie jar para manter sessão
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

HEADERS_BASE = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Origin": "https://n8n.sandlj.com.br",
    "Referer": "https://n8n.sandlj.com.br/signin",
}

def post(path, data=None, extra_headers=None):
    url = BASE + path
    body = json.dumps(data).encode() if data else b""
    h = dict(HEADERS_BASE)
    if extra_headers:
        h.update(extra_headers)
    req = urllib.request.Request(url, data=body, headers=h, method="POST")
    try:
        with opener.open(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "msg": e.read().decode()}

def get(path):
    url = BASE + path
    req = urllib.request.Request(url, headers=HEADERS_BASE)
    try:
        with opener.open(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "msg": e.read().decode()}

def patch(path, data=None):
    url = BASE + path
    body = json.dumps(data).encode() if data else b""
    req = urllib.request.Request(url, data=body, headers=HEADERS_BASE, method="PATCH")
    try:
        with opener.open(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "msg": e.read().decode()}


print("=" * 50)
print("🔐 Fazendo login no n8n...")
login = post("/rest/login", {"emailOrLdapLoginId": EMAIL, "password": SENHA})
if "error" in login:
    print(f"❌ ERRO no login: {login}")
    exit(1)
print("✅ Login realizado com sucesso!\n")

# Importar os fluxos de API
print("📦 Importando fluxos de API (n8n_fluxos_api.json)...")
with open("n8n_fluxos_api.json", encoding="utf-8") as f:
    api_flows = json.load(f)

ids_criados = []
for flow in api_flows:
    res = post("/rest/workflows", flow)
    if "error" in res:
        print(f"  ❌ {flow['name']}: ERRO {res}")
    else:
        wid = res.get("id") or (res.get("data", {}).get("id"))
        print(f"  ✅ {flow['name']} — ID: {wid}")
        if wid:
            ids_criados.append((wid, flow["name"]))

# Importar fluxo principal v2
print("\n📦 Importando fluxo principal (n8n_secretario_ia_v2.json)...")
with open("n8n_secretario_ia_v2.json", encoding="utf-8") as f:
    main_flow = json.load(f)

res = post("/rest/workflows", main_flow)
if "error" in res:
    print(f"  ❌ {main_flow['name']}: ERRO {res}")
else:
    wid = res.get("id") or (res.get("data", {}).get("id"))
    print(f"  ✅ {main_flow['name']} — ID: {wid}")
    if wid:
        ids_criados.append((wid, main_flow["name"]))

# Ativar todos os fluxos
print("\n🟢 Ativando todos os fluxos...")
for wid, name in ids_criados:
    res = patch(f"/rest/workflows/{wid}/activate")
    if "error" in res:
        print(f"  ⚠️  {name}: erro ao ativar — {res}")
    else:
        print(f"  ✅ Ativo: {name}")

print("\n" + "=" * 50)
print(f"🎉 Concluído! {len(ids_criados)} fluxos importados e ativados.")
print("Acesse https://n8n.sandlj.com.br e veja os fluxos 'Secretario-API-*'")
