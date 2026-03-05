from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# ============= MODELS =============

class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    name: str
    role: str
    department: Optional[str] = None
    photo: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    admission_date: str
    created_at: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    user: User

class ClientBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    cnpj: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    segment: Optional[str] = None
    status: str = "Ativo"
    monthly_value: float = 0.0
    due_day: int = 10
    margin: Optional[float] = None
    notes: Optional[str] = None
    contacts: List[Dict[str, str]] = []
    logo: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: str
    created_at: str

class PaymentBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    client_id: str
    amount: float
    month: str
    status: str = "Pendente"
    payment_date: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: str
    created_at: str

class ContentCardBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    content_type: str
    publication_date: Optional[str] = None
    assignee_id: Optional[str] = None
    client_id: str
    status: str = "Briefing"
    file_url: Optional[str] = None
    caption: Optional[str] = None
    tags: List[str] = []
    comments: List[Dict[str, Any]] = []
    approval_status: str = "Pendente"
    approval_notes: Optional[str] = None

class ContentCardCreate(ContentCardBase):
    pass

class ContentCard(ContentCardBase):
    id: str
    created_at: str
    updated_at: str

class DocumentBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    client_id: str
    name: str
    doc_type: str
    file_url: str
    category: str = "Outros"

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: str
    uploaded_at: str

class GoalBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    goal_type: str
    target_value: float
    period: str
    current_value: float = 0.0
    description: Optional[str] = None

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: str
    created_at: str

class MeetingBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    meeting_date: str
    participants: List[str] = []
    description: Optional[str] = None
    client_id: Optional[str] = None

class MeetingCreate(MeetingBase):
    pass

class Meeting(MeetingBase):
    id: str
    created_at: str

class TodoBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    assignee_id: Optional[str] = None
    due_date: Optional[str] = None
    status: str = "Pendente"
    priority: str = "Media"
    description: Optional[str] = None

class TodoCreate(TodoBase):
    pass

class Todo(TodoBase):
    id: str
    created_at: str

class DashboardStats(BaseModel):
    total_revenue: float
    projected_revenue: float
    overdue_amount: float
    average_ticket: float
    active_clients: int
    active_content: int
    pending_approvals: int
    team_members: int

# ============= AUTH HELPERS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {'user_id': user_id}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    user_id = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    user_dict['id'] = str(uuid.uuid4())
    user_dict['password'] = hash_password(user_data.password)
    user_dict['admission_date'] = datetime.now(timezone.utc).isoformat()
    user_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.users.insert_one(user_dict)
    
    user_dict.pop('password')
    return User(**user_dict)

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'])
    user.pop('password')
    
    return LoginResponse(token=token, user=User(**user))

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: Dict = Depends(get_current_user)):
    return User(**current_user)

# ============= DASHBOARD ROUTES =============

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: Dict = Depends(get_current_user)):
    clients = await db.clients.find({"status": "Ativo"}, {"_id": 0}).to_list(None)
    payments = await db.payments.find({}, {"_id": 0}).to_list(None)
    content = await db.content_cards.find({}, {"_id": 0}).to_list(None)
    users = await db.users.count_documents({})
    
    total_revenue = sum(p['amount'] for p in payments if p['status'] == "Pago")
    projected_revenue = sum(c['monthly_value'] for c in clients)
    overdue_amount = sum(p['amount'] for p in payments if p['status'] == "Em atraso")
    average_ticket = projected_revenue / len(clients) if clients else 0
    
    pending_approvals = len([c for c in content if c['status'] == "Aguardando Aprovação"])
    active_content = len([c for c in content if c['status'] not in ["Publicado", "Cancelado"]])
    
    return DashboardStats(
        total_revenue=total_revenue,
        projected_revenue=projected_revenue,
        overdue_amount=overdue_amount,
        average_ticket=average_ticket,
        active_clients=len(clients),
        active_content=active_content,
        pending_approvals=pending_approvals,
        team_members=users
    )

# ============= CLIENT ROUTES =============

@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate, current_user: Dict = Depends(get_current_user)):
    client_dict = client_data.model_dump()
    client_dict['id'] = str(uuid.uuid4())
    client_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.clients.insert_one(client_dict)
    return Client(**client_dict)

@api_router.get("/clients", response_model=List[Client])
async def get_clients(current_user: Dict = Depends(get_current_user)):
    clients = await db.clients.find({}, {"_id": 0}).to_list(None)
    return [Client(**c) for c in clients]

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, current_user: Dict = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return Client(**client)

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_data: ClientCreate, current_user: Dict = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_dict = client_data.model_dump()
    await db.clients.update_one({"id": client_id}, {"$set": update_dict})
    
    updated_client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    return Client(**updated_client)

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted successfully"}

# ============= PAYMENT ROUTES =============

@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate, current_user: Dict = Depends(get_current_user)):
    payment_dict = payment_data.model_dump()
    payment_dict['id'] = str(uuid.uuid4())
    payment_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.payments.insert_one(payment_dict)
    return Payment(**payment_dict)

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(client_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {"client_id": client_id} if client_id else {}
    payments = await db.payments.find(query, {"_id": 0}).to_list(None)
    return [Payment(**p) for p in payments]

@api_router.put("/payments/{payment_id}", response_model=Payment)
async def update_payment(payment_id: str, payment_data: PaymentCreate, current_user: Dict = Depends(get_current_user)):
    payment = await db.payments.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    update_dict = payment_data.model_dump()
    await db.payments.update_one({"id": payment_id}, {"$set": update_dict})
    
    updated_payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    return Payment(**updated_payment)

# ============= CONTENT ROUTES =============

@api_router.post("/content", response_model=ContentCard)
async def create_content(content_data: ContentCardCreate, current_user: Dict = Depends(get_current_user)):
    content_dict = content_data.model_dump()
    content_dict['id'] = str(uuid.uuid4())
    content_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    content_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.content_cards.insert_one(content_dict)
    return ContentCard(**content_dict)

@api_router.get("/content", response_model=List[ContentCard])
async def get_content(client_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {"client_id": client_id} if client_id else {}
    content = await db.content_cards.find(query, {"_id": 0}).to_list(None)
    return [ContentCard(**c) for c in content]

@api_router.get("/content/{content_id}", response_model=ContentCard)
async def get_content_by_id(content_id: str, current_user: Dict = Depends(get_current_user)):
    content = await db.content_cards.find_one({"id": content_id}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return ContentCard(**content)

@api_router.put("/content/{content_id}", response_model=ContentCard)
async def update_content(content_id: str, content_data: ContentCardCreate, current_user: Dict = Depends(get_current_user)):
    content = await db.content_cards.find_one({"id": content_id})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    update_dict = content_data.model_dump()
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.content_cards.update_one({"id": content_id}, {"$set": update_dict})
    
    updated_content = await db.content_cards.find_one({"id": content_id}, {"_id": 0})
    return ContentCard(**updated_content)

@api_router.delete("/content/{content_id}")
async def delete_content(content_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.content_cards.delete_one({"id": content_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    return {"message": "Content deleted successfully"}

# ============= DOCUMENT ROUTES =============

@api_router.post("/documents", response_model=Document)
async def create_document(doc_data: DocumentCreate, current_user: Dict = Depends(get_current_user)):
    doc_dict = doc_data.model_dump()
    doc_dict['id'] = str(uuid.uuid4())
    doc_dict['uploaded_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.documents.insert_one(doc_dict)
    return Document(**doc_dict)

@api_router.get("/documents", response_model=List[Document])
async def get_documents(client_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {"client_id": client_id} if client_id else {}
    documents = await db.documents.find(query, {"_id": 0}).to_list(None)
    return [Document(**d) for d in documents]

@api_router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.documents.delete_one({"id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

# ============= USER ROUTES =============

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: Dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(None)
    return [User(**u) for u in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: Dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# ============= GOAL ROUTES =============

@api_router.post("/goals", response_model=Goal)
async def create_goal(goal_data: GoalCreate, current_user: Dict = Depends(get_current_user)):
    goal_dict = goal_data.model_dump()
    goal_dict['id'] = str(uuid.uuid4())
    goal_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.goals.insert_one(goal_dict)
    return Goal(**goal_dict)

@api_router.get("/goals", response_model=List[Goal])
async def get_goals(current_user: Dict = Depends(get_current_user)):
    goals = await db.goals.find({}, {"_id": 0}).to_list(None)
    return [Goal(**g) for g in goals]

@api_router.put("/goals/{goal_id}", response_model=Goal)
async def update_goal(goal_id: str, goal_data: GoalCreate, current_user: Dict = Depends(get_current_user)):
    goal = await db.goals.find_one({"id": goal_id})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_dict = goal_data.model_dump()
    await db.goals.update_one({"id": goal_id}, {"$set": update_dict})
    
    updated_goal = await db.goals.find_one({"id": goal_id}, {"_id": 0})
    return Goal(**updated_goal)

# ============= MEETING ROUTES =============

@api_router.post("/meetings", response_model=Meeting)
async def create_meeting(meeting_data: MeetingCreate, current_user: Dict = Depends(get_current_user)):
    meeting_dict = meeting_data.model_dump()
    meeting_dict['id'] = str(uuid.uuid4())
    meeting_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.meetings.insert_one(meeting_dict)
    return Meeting(**meeting_dict)

@api_router.get("/meetings", response_model=List[Meeting])
async def get_meetings(current_user: Dict = Depends(get_current_user)):
    meetings = await db.meetings.find({}, {"_id": 0}).to_list(None)
    return [Meeting(**m) for m in meetings]

# ============= TODO ROUTES =============

@api_router.post("/todos", response_model=Todo)
async def create_todo(todo_data: TodoCreate, current_user: Dict = Depends(get_current_user)):
    todo_dict = todo_data.model_dump()
    todo_dict['id'] = str(uuid.uuid4())
    todo_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.todos.insert_one(todo_dict)
    return Todo(**todo_dict)

@api_router.get("/todos", response_model=List[Todo])
async def get_todos(assignee_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {"assignee_id": assignee_id} if assignee_id else {}
    todos = await db.todos.find(query, {"_id": 0}).to_list(None)
    return [Todo(**t) for t in todos]

@api_router.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: str, todo_data: TodoCreate, current_user: Dict = Depends(get_current_user)):
    todo = await db.todos.find_one({"id": todo_id})
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_dict = todo_data.model_dump()
    await db.todos.update_one({"id": todo_id}, {"$set": update_dict})
    
    updated_todo = await db.todos.find_one({"id": todo_id}, {"_id": 0})
    return Todo(**updated_todo)

# ============= MOCK DATA ROUTES =============

@api_router.get("/media/google-ads")
async def get_google_ads_data(client_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    return {
        "investment": 15420.50,
        "impressions": 245680,
        "clicks": 8932,
        "ctr": 3.64,
        "cpc": 1.73,
        "conversions": 287,
        "roas": 4.2,
        "chart_data": [
            {"date": "2025-01-01", "investment": 450, "conversions": 12},
            {"date": "2025-01-02", "investment": 520, "conversions": 15},
            {"date": "2025-01-03", "investment": 480, "conversions": 11},
            {"date": "2025-01-04", "investment": 610, "conversions": 18},
            {"date": "2025-01-05", "investment": 550, "conversions": 16}
        ]
    }

@api_router.get("/media/meta-ads")
async def get_meta_ads_data(client_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    return {
        "reach": 185420,
        "frequency": 2.4,
        "cpm": 12.45,
        "cpc": 0.89,
        "ctr": 2.8,
        "investment": 8950.00,
        "results": 1247,
        "breakdown": {
            "facebook": {"reach": 105000, "ctr": 2.5},
            "instagram": {"reach": 80420, "ctr": 3.2}
        }
    }

@api_router.get("/insights/published-content")
async def get_published_content(client_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    return [
        {
            "id": "post-1",
            "image": "https://images.unsplash.com/photo-1676282827533-d6058df56a69",
            "date": "2025-01-15",
            "caption": "Novo produto chegando! 🚀",
            "reach": 12450,
            "likes": 892,
            "comments": 54,
            "saves": 127,
            "shares": 23
        },
        {
            "id": "post-2",
            "image": "https://images.unsplash.com/photo-1722172597269-d911054badb9",
            "date": "2025-01-14",
            "caption": "Dicas para aumentar sua produtividade",
            "reach": 8760,
            "likes": 654,
            "comments": 32,
            "saves": 89,
            "shares": 15
        }
    ]

@api_router.get("/insights/stats")
async def get_insights_stats(client_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    return {
        "engagement_rate": 4.2,
        "follower_growth": 245,
        "best_time": "18:00 - 20:00",
        "best_content_type": "Reels",
        "top_posts": 5,
        "suggestions": [
            "Reels performa 3x melhor que posts estáticos",
            "Posts publicados às 18h têm 45% mais alcance",
            "Conteúdo educacional gera mais salvamentos"
        ]
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()