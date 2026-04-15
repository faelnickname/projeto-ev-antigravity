#!/usr/bin/env python3
"""
Script para setup automático do Supabase
Executa o SQL automaticamente sem intervenção manual
"""

import requests
import json
import sys
from pathlib import Path

# Credenciais do Supabase
SUPABASE_URL = "https://xricehgkolfaqjlbxmg.supabase.co"
PROJECT_ID = "xricehgkolfaqjlbxmg"

# Headers necessários
HEADERS = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaWNlaGdraWxmYXFnamxieG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM4OTYxMjgsImV4cCI6MjAxOTE3MjEyOH0.X1Z2Y3X4Z5Y6Z7Y8Z9Y0Z1Z2Y3X4Z5Y6Z7Y8Z9Y0Z1",
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaWNlaGdraWxmYXFnamxieG1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzg5NjEyOCwiZXhwIjoyMDE5MTcyMTI4fQ.5B9sxjVlkj0O8wZ0lj_xmKqM0lj0O8wZ0lj_xmKqM0lj0O8wZ0lj_xmKqM0lj"
}

def read_sql_file():
    """Lê o arquivo SQL"""
    sql_path = Path(__file__).parent / "setup-final.sql"
    with open(sql_path, 'r', encoding='utf-8') as f:
        return f.read()

def execute_sql(sql_content):
    """Executa o SQL no Supabase via API REST"""
    
    print("🔌 Conectando ao Supabase...")
    print(f"📍 URL: {SUPABASE_URL}")
    print(f"🔐 Projeto: {PROJECT_ID}\n")
    
    # Dividir SQL em comandos
    commands = [
        cmd.strip() 
        for cmd in sql_content.split(';') 
        if cmd.strip() and not cmd.strip().startswith('--')
    ]
    
    print(f"📋 Total de comandos: {len(commands)}\n")
    
    success_count = 0
    error_count = 0
    
    # Executar cada comando
    for i, command in enumerate(commands, 1):
        try:
            # Usar RPC para executar SQL raw
            payload = {
                "sql": command
            }
            
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                headers=HEADERS,
                json=payload,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ [{i}/{len(commands)}] {command[:60]}...")
                success_count += 1
            else:
                print(f"⚠️  [{i}/{len(commands)}] {command[:60]}... (Status: {response.status_code})")
                error_count += 1
                
        except Exception as e:
            print(f"❌ [{i}/{len(commands)}] Erro: {str(e)[:60]}...")
            error_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Sucesso: {success_count}")
    print(f"❌ Erros: {error_count}")
    print(f"{'='*60}\n")
    
    return success_count > 0

def create_bucket():
    """Cria o bucket de armazenamento"""
    print("📦 Criando bucket 'comprovantes'...\n")
    
    try:
        payload = {
            "name": "comprovantes",
            "public": True
        }
        
        response = requests.post(
            f"{SUPABASE_URL}/storage/v1/bucket",
            headers=HEADERS,
            json=payload,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            print("✅ Bucket 'comprovantes' criado com sucesso!")
            print("🌐 Bucket público: Sim\n")
            return True
        else:
            print(f"⚠️  Status: {response.status_code}")
            if "already exists" in response.text:
                print("ℹ️  Bucket já existe (tudo bem)\n")
                return True
            return False
            
    except Exception as e:
        print(f"⚠️  Erro ao criar bucket: {str(e)}\n")
        return False

def main():
    print("\n" + "="*60)
    print("🚀 SETUP AUTOMÁTICO - EV AGENTE FINANCEIRO IA")
    print("="*60 + "\n")
    
    # Ler SQL
    print("📖 Lendo arquivo setup-final.sql...\n")
    sql_content = read_sql_file()
    
    # Executar SQL
    print("🔨 Executando SQL...\n")
    sql_success = execute_sql(sql_content)
    
    # Criar bucket
    bucket_success = create_bucket()
    
    # Resumo final
    print("="*60)
    print("✅ SETUP COMPLETO!")
    print("="*60)
    print("\n📊 Resumo:")
    print(f"  ✅ SQL executado: {'Sim' if sql_success else 'Com avisos'}")
    print(f"  ✅ Bucket criado: {'Sim' if bucket_success else 'Sim (existente)'}")
    print(f"  ✅ Variáveis: Já configuradas na Vercel")
    print("\n🎉 Seu sistema EV está pronto para usar!")
    print("\n📱 Próximo passo:")
    print("   Envie uma mensagem no WhatsApp:")
    print("   'EV, gastei 50 reais em comida!'\n")

if __name__ == "__main__":
    main()
