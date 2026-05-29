import psycopg2

def init_db():
    conn = psycopg2.connect(
        host="187.77.32.137",
        port="5433",
        database="secretario_db",
        user="admin_ala",
        password="senha_segura_ala"
    )
    cur = conn.cursor()
    
    with open('schema.sql', 'r', encoding='utf-8') as f:
        schema = f.read()
        
    cur.execute(schema)
    conn.commit()
    cur.close()
    conn.close()
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()
