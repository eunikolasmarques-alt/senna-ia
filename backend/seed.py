import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    print("🌱 Iniciando seed do banco de dados...")
    
    # Limpar coleções existentes
    await db.users.delete_many({})
    await db.clients.delete_many({})
    await db.payments.delete_many({})
    await db.content_cards.delete_many({})
    await db.documents.delete_many({})
    await db.goals.delete_many({})
    
    # Criar usuários
    users = [
        {
            "id": "user-1",
            "email": "admin@agencyos.com",
            "password": hash_password("admin123"),
            "name": "Carolina Silva",
            "role": "Admin",
            "department": "Gestão",
            "admission_date": "2023-01-15",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "user-2",
            "email": "social@agencyos.com",
            "password": hash_password("social123"),
            "name": "Rafael Costa",
            "role": "Social Media",
            "department": "Criação",
            "admission_date": "2023-03-20",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "user-3",
            "email": "design@agencyos.com",
            "password": hash_password("design123"),
            "name": "Mariana Santos",
            "role": "Designer",
            "department": "Criação",
            "admission_date": "2023-05-10",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    await db.users.insert_many(users)
    print(f"✅ {len(users)} usuários criados")
    
    # Criar clientes
    clients = [
        {
            "id": "client-1",
            "name": "TechStart Solutions",
            "cnpj": "12.345.678/0001-90",
            "segment": "Tecnologia",
            "status": "Ativo",
            "monthly_value": 8500.00,
            "due_day": 10,
            "margin": 35.0,
            "contacts": [{"name": "João Pedro", "email": "joao@techstart.com"}],
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "client-2",
            "name": "Bella Cosméticos",
            "cnpj": "23.456.789/0001-80",
            "segment": "Beleza e Cosméticos",
            "status": "Ativo",
            "monthly_value": 5200.00,
            "due_day": 15,
            "margin": 40.0,
            "contacts": [{"name": "Maria Clara", "email": "maria@bellacosmeticos.com"}],
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "client-3",
            "name": "FitLife Academia",
            "cnpj": "34.567.890/0001-70",
            "segment": "Fitness e Bem-estar",
            "status": "Ativo",
            "monthly_value": 3800.00,
            "due_day": 5,
            "margin": 30.0,
            "contacts": [{"name": "Carlos Eduardo", "email": "carlos@fitlife.com"}],
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    await db.clients.insert_many(clients)
    print(f"✅ {len(clients)} clientes criados")
    
    # Criar pagamentos
    payments = [
        {
            "id": "payment-1",
            "client_id": "client-1",
            "amount": 8500.00,
            "month": "Janeiro 2025",
            "status": "Pago",
            "payment_date": "2025-01-10",
            "payment_method": "Transferência",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "payment-2",
            "client_id": "client-2",
            "amount": 5200.00,
            "month": "Janeiro 2025",
            "status": "Pendente",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "payment-3",
            "client_id": "client-3",
            "amount": 3800.00,
            "month": "Janeiro 2025",
            "status": "Pago",
            "payment_date": "2025-01-05",
            "payment_method": "PIX",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    await db.payments.insert_many(payments)
    print(f"✅ {len(payments)} pagamentos criados")
    
    # Criar cards de conteúdo
    content_cards = [
        {
            "id": "content-1",
            "title": "Post sobre novo produto TechStart",
            "content_type": "Post Feed",
            "client_id": "client-1",
            "assignee_id": "user-2",
            "status": "Em Produção",
            "publication_date": "2025-01-20",
            "publication_time": "18:00",
            "delivery_date": "2025-01-18",
            "delivery_time": "15:00",
            "description": "Post anunciando o lançamento do novo produto TechStart Pro. Incluir imagem do produto, benefícios principais e call-to-action para o site.",
            "custom_tags": [
                {"label": "LANÇAMENTO", "color": "#7c3aed"},
                {"label": "URGENTE", "color": "#f97316"}
            ],
            "tags": ["produto", "tech", "lançamento"],
            "comments": [],
            "activities": [],
            "files": [],
            "members": ["user-2"],
            "checklist": [],
            "approval_status": "Pendente",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "content-2",
            "title": "Reels de skincare Bella Cosméticos",
            "content_type": "Reels",
            "client_id": "client-2",
            "assignee_id": "user-3",
            "status": "Aguardando Aprovação",
            "publication_date": "2025-01-18",
            "publication_time": "19:00",
            "delivery_date": "2025-01-17",
            "delivery_time": "17:00",
            "description": "Reels mostrando rotina de skincare matinal com produtos Bella. Música: tendência do momento. Duração: 15-30 segundos.",
            "custom_tags": [
                {"label": "BELEZA", "color": "#ec4899"},
                {"label": "REELS", "color": "#06b6d4"}
            ],
            "tags": ["skincare", "beleza", "rotina"],
            "comments": [
                {
                    "id": "comment-1",
                    "user_id": "user-2",
                    "user_name": "Rafael Costa",
                    "text": "Aprovação aguardando retorno do cliente",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ],
            "activities": [
                {
                    "id": "activity-1",
                    "user_id": "user-3",
                    "user_name": "Mariana Santos",
                    "action": "moveu este card para Aguardando Aprovação",
                    "details": "",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ],
            "files": [],
            "members": ["user-3"],
            "checklist": [],
            "approval_status": "Pendente",
            "approval_sent_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "content-3",
            "title": "Carrossel de exercícios FitLife",
            "content_type": "Carrossel",
            "client_id": "client-3",
            "assignee_id": "user-2",
            "status": "Aprovado",
            "publication_date": "2025-01-17",
            "publication_time": "07:00",
            "delivery_date": "2025-01-15",
            "delivery_time": "14:00",
            "description": "Carrossel com 5 exercícios para treino em casa. Cada slide mostra um exercício diferente com instruções claras.",
            "custom_tags": [
                {"label": "FITNESS", "color": "#10b981"},
                {"label": "EDUCATIVO", "color": "#eab308"}
            ],
            "tags": ["fitness", "treino", "exercícios"],
            "comments": [],
            "activities": [],
            "files": [],
            "members": ["user-2"],
            "checklist": [],
            "approval_status": "Aprovado",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "content-4",
            "title": "Stories de promoção TechStart",
            "content_type": "Stories",
            "client_id": "client-1",
            "assignee_id": "user-3",
            "status": "Briefing",
            "publication_date": "2025-01-22",
            "publication_time": "20:00",
            "delivery_date": "2025-01-21",
            "delivery_time": "16:00",
            "description": "Série de 3 stories anunciando promoção de lançamento. Incluir countdown e link para loja.",
            "custom_tags": [
                {"label": "PROMOÇÃO", "color": "#f97316"}
            ],
            "tags": ["promo", "stories"],
            "comments": [],
            "activities": [],
            "files": [],
            "members": ["user-3"],
            "checklist": [],
            "approval_status": "Pendente",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    await db.content_cards.insert_many(content_cards)
    print(f"✅ {len(content_cards)} cards de conteúdo criados")
    
    # Criar metas de entrega
    await db.delivery_goals.delete_many({})
    delivery_goals = [
        {
            "id": "goal-1",
            "client_id": "client-1",
            "month": "Janeiro",
            "year": 2025,
            "total_posts_required": 12,
            "total_reels_required": 8,
            "total_stories_required": 20,
            "posts_delivered": 1,
            "reels_delivered": 0,
            "stories_delivered": 1,
            "deadline_date": "2025-01-31T23:59:59+00:00",
            "responsible_posts": "user-2",
            "responsible_reels": "user-3",
            "responsible_stories": "user-2",
            "percentage": 5.0,
            "status": "Crítico",
            "days_remaining": 5,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "goal-2",
            "client_id": "client-2",
            "month": "Janeiro",
            "year": 2025,
            "total_posts_required": 8,
            "total_reels_required": 6,
            "total_stories_required": 15,
            "posts_delivered": 0,
            "reels_delivered": 1,
            "stories_delivered": 0,
            "deadline_date": "2025-01-31T23:59:59+00:00",
            "responsible_posts": "user-2",
            "responsible_reels": "user-3",
            "responsible_stories": "user-2",
            "percentage": 3.4,
            "status": "Crítico",
            "days_remaining": 5,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "goal-3",
            "client_id": "client-3",
            "month": "Janeiro",
            "year": 2025,
            "total_posts_required": 10,
            "total_reels_required": 5,
            "total_stories_required": 12,
            "posts_delivered": 0,
            "reels_delivered": 0,
            "stories_delivered": 0,
            "deadline_date": "2025-01-31T23:59:59+00:00",
            "responsible_posts": "user-2",
            "responsible_reels": "user-3",
            "responsible_stories": "user-2",
            "percentage": 0.0,
            "status": "Crítico",
            "days_remaining": 5,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    await db.delivery_goals.insert_many(delivery_goals)
    print(f"✅ {len(delivery_goals)} metas de entrega criadas")
    
    print("\\n✨ Seed completo! Dados de demonstração criados com sucesso.")
    print("\\n📝 Credenciais de teste:")
    print("   Email: admin@agencyos.com")
    print("   Senha: admin123")

if __name__ == "__main__":
    asyncio.run(seed_database())
