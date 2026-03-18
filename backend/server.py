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
    contract_start_date: Optional[str] = None
    contract_duration_months: int = 12
    instagram_username: Optional[str] = None

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
    publication_time: Optional[str] = None
    delivery_date: Optional[str] = None
    delivery_time: Optional[str] = None
    assignee_id: Optional[str] = None
    client_id: str
    status: str = "Briefing"
    file_url: Optional[str] = None
    files: List[Dict[str, str]] = []
    caption: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = []
    custom_tags: List[Dict[str, str]] = []
    comments: List[Dict[str, Any]] = []
    activities: List[Dict[str, Any]] = []
    approval_status: str = "Pendente"
    approval_notes: Optional[str] = None
    approval_sent_at: Optional[str] = None
    members: List[str] = []
    checklist: List[Dict[str, Any]] = []

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

class MonthlyDeliveryGoalBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    client_id: str
    month: str
    year: int
    total_posts_required: int = 0
    total_reels_required: int = 0
    total_stories_required: int = 0
    posts_delivered: int = 0
    reels_delivered: int = 0
    stories_delivered: int = 0
    deadline_date: str
    responsible_posts: Optional[str] = None
    responsible_reels: Optional[str] = None
    responsible_stories: Optional[str] = None

class MonthlyDeliveryGoalCreate(MonthlyDeliveryGoalBase):
    pass

class MonthlyDeliveryGoal(MonthlyDeliveryGoalBase):
    id: str
    created_at: str
    percentage: float
    status: str
    days_remaining: int

class LeadBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: str = "Tráfego Pago"
    status: str = "Novo"
    interest: Optional[str] = None
    budget: Optional[float] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None
    last_contact: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class Lead(LeadBase):
    id: str
    created_at: str
    updated_at: str

class InternalDocumentBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    doc_type: str
    category: str
    file_url: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = []

class InternalDocumentCreate(InternalDocumentBase):
    pass

class InternalDocument(InternalDocumentBase):
    id: str
    uploaded_at: str
    uploaded_by: str

class ServiceBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    description: str
    deliverables: List[str] = []
    price_range: Optional[str] = None
    duration: Optional[str] = None
    what_includes: List[str] = []

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: str
    created_at: str

# ============= CLIENT PORTAL MODELS =============

class ClientAccessToken(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    client_id: str
    token: str
    is_active: bool = True
    created_at: str
    expires_at: Optional[str] = None
    last_used_at: Optional[str] = None

class ClientPortalMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    client_id: str
    content_card_id: Optional[str] = None
    sender_type: str  # "client" or "agency"
    sender_id: str
    sender_name: str
    message: str
    created_at: str
    read_at: Optional[str] = None

class ClientPortalMessageCreate(BaseModel):
    content_card_id: Optional[str] = None
    message: str

class ContentApprovalRequest(BaseModel):
    action: str  # "approve" or "reject"
    feedback: Optional[str] = None

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

def create_client_access_token(client_id: str) -> str:
    """Generate a unique access token for client portal"""
    import secrets
    return secrets.token_urlsafe(32)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    user_id = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_client(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """Authenticate client via access token"""
    token = credentials.credentials
    access_token = await db.client_access_tokens.find_one({"token": token, "is_active": True}, {"_id": 0})
    if not access_token:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    
    # Update last used timestamp
    await db.client_access_tokens.update_one(
        {"token": token},
        {"$set": {"last_used_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    client = await db.clients.find_one({"id": access_token['client_id']}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=401, detail="Client not found")
    
    return {"client": client, "token_info": access_token}

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

@api_router.post("/content/{content_id}/comment")
async def add_comment(content_id: str, comment: Dict[str, Any], current_user: Dict = Depends(get_current_user)):
    content = await db.content_cards.find_one({"id": content_id})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    new_comment = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "text": comment["text"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.content_cards.update_one(
        {"id": content_id},
        {"$push": {"comments": new_comment}}
    )
    
    return new_comment

@api_router.post("/content/{content_id}/activity")
async def add_activity(content_id: str, activity: Dict[str, Any], current_user: Dict = Depends(get_current_user)):
    content = await db.content_cards.find_one({"id": content_id})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    new_activity = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "action": activity["action"],
        "details": activity.get("details", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.content_cards.update_one(
        {"id": content_id},
        {"$push": {"activities": new_activity}}
    )
    
    return new_activity

@api_router.post("/content/{content_id}/send-approval")
async def send_approval(content_id: str, current_user: Dict = Depends(get_current_user)):
    content = await db.content_cards.find_one({"id": content_id}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    client = await db.clients.find_one({"id": content["client_id"]}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Aqui você integraria com WhatsApp API
    # Por enquanto, apenas mockamos o envio
    
    await db.content_cards.update_one(
        {"id": content_id},
        {
            "$set": {
                "approval_sent_at": datetime.now(timezone.utc).isoformat(),
                "status": "Aguardando Aprovação"
            }
        }
    )
    
    return {
        "message": "Aprovação enviada com sucesso",
        "sent_to": client.get("contacts", [{}])[0].get("name", "Cliente"),
        "method": "WhatsApp"
    }

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

# ============= MONTHLY DELIVERY GOALS ROUTES =============

def calculate_delivery_status(deadline_date: str, percentage: float) -> tuple:
    from datetime import datetime, timezone
    
    if isinstance(deadline_date, str):
        # Parse ISO format string
        deadline = datetime.fromisoformat(deadline_date.replace('Z', '+00:00'))
    else:
        deadline = deadline_date
    
    # Ensure deadline is timezone-aware
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    
    now = datetime.now(timezone.utc)
    days_remaining = (deadline - now).days
    
    if days_remaining < 0:
        status = "Atrasado"
    elif percentage >= 100:
        status = "Concluído"
    elif days_remaining < 7:
        status = "Crítico"
    elif days_remaining < 15:
        status = "Em Progresso"
    else:
        status = "Com Tempo"
    
    return status, days_remaining

@api_router.post("/delivery-goals", response_model=MonthlyDeliveryGoal)
async def create_delivery_goal(goal_data: MonthlyDeliveryGoalCreate, current_user: Dict = Depends(get_current_user)):
    goal_dict = goal_data.model_dump()
    goal_dict['id'] = str(uuid.uuid4())
    goal_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    total_required = goal_dict['total_posts_required'] + goal_dict['total_reels_required'] + goal_dict['total_stories_required']
    total_delivered = goal_dict['posts_delivered'] + goal_dict['reels_delivered'] + goal_dict['stories_delivered']
    percentage = (total_delivered / total_required * 100) if total_required > 0 else 0
    
    goal_dict['percentage'] = round(percentage, 1)
    status, days_remaining = calculate_delivery_status(goal_dict['deadline_date'], percentage)
    goal_dict['status'] = status
    goal_dict['days_remaining'] = days_remaining
    
    await db.delivery_goals.insert_one(goal_dict)
    return MonthlyDeliveryGoal(**goal_dict)

@api_router.get("/delivery-goals", response_model=List[MonthlyDeliveryGoal])
async def get_delivery_goals(month: Optional[str] = None, year: Optional[int] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if month:
        query['month'] = month
    if year:
        query['year'] = year
    
    goals = await db.delivery_goals.find(query, {"_id": 0}).to_list(None)
    
    for goal in goals:
        total_required = goal['total_posts_required'] + goal['total_reels_required'] + goal['total_stories_required']
        total_delivered = goal['posts_delivered'] + goal['reels_delivered'] + goal['stories_delivered']
        percentage = (total_delivered / total_required * 100) if total_required > 0 else 0
        
        goal['percentage'] = round(percentage, 1)
        status, days_remaining = calculate_delivery_status(goal['deadline_date'], percentage)
        goal['status'] = status
        goal['days_remaining'] = days_remaining
    
    return [MonthlyDeliveryGoal(**g) for g in goals]

@api_router.get("/delivery-goals/{goal_id}", response_model=MonthlyDeliveryGoal)
async def get_delivery_goal(goal_id: str, current_user: Dict = Depends(get_current_user)):
    goal = await db.delivery_goals.find_one({"id": goal_id}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Delivery goal not found")
    
    total_required = goal['total_posts_required'] + goal['total_reels_required'] + goal['total_stories_required']
    total_delivered = goal['posts_delivered'] + goal['reels_delivered'] + goal['stories_delivered']
    percentage = (total_delivered / total_required * 100) if total_required > 0 else 0
    
    goal['percentage'] = round(percentage, 1)
    status, days_remaining = calculate_delivery_status(goal['deadline_date'], percentage)
    goal['status'] = status
    goal['days_remaining'] = days_remaining
    
    return MonthlyDeliveryGoal(**goal)

@api_router.put("/delivery-goals/{goal_id}", response_model=MonthlyDeliveryGoal)
async def update_delivery_goal(goal_id: str, goal_data: MonthlyDeliveryGoalCreate, current_user: Dict = Depends(get_current_user)):
    goal = await db.delivery_goals.find_one({"id": goal_id})
    if not goal:
        raise HTTPException(status_code=404, detail="Delivery goal not found")
    
    update_dict = goal_data.model_dump()
    
    total_required = update_dict['total_posts_required'] + update_dict['total_reels_required'] + update_dict['total_stories_required']
    total_delivered = update_dict['posts_delivered'] + update_dict['reels_delivered'] + update_dict['stories_delivered']
    percentage = (total_delivered / total_required * 100) if total_required > 0 else 0
    
    update_dict['percentage'] = round(percentage, 1)
    status, days_remaining = calculate_delivery_status(update_dict['deadline_date'], percentage)
    update_dict['status'] = status
    update_dict['days_remaining'] = days_remaining
    
    await db.delivery_goals.update_one({"id": goal_id}, {"$set": update_dict})
    
    updated_goal = await db.delivery_goals.find_one({"id": goal_id}, {"_id": 0})
    return MonthlyDeliveryGoal(**updated_goal)

@api_router.delete("/delivery-goals/{goal_id}")
async def delete_delivery_goal(goal_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.delivery_goals.delete_one({"id": goal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Delivery goal not found")
    return {"message": "Delivery goal deleted successfully"}

@api_router.post("/delivery-goals/{goal_id}/update-progress")
async def update_delivery_progress(goal_id: str, current_user: Dict = Depends(get_current_user)):
    goal = await db.delivery_goals.find_one({"id": goal_id}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Delivery goal not found")
    
    content_cards = await db.content_cards.find({
        "client_id": goal['client_id'],
        "status": {"$in": ["Aprovado", "Agendado", "Publicado"]}
    }, {"_id": 0}).to_list(None)
    
    posts_delivered = len([c for c in content_cards if c.get('content_type') == 'Post Feed'])
    reels_delivered = len([c for c in content_cards if c.get('content_type') == 'Reels'])
    stories_delivered = len([c for c in content_cards if c.get('content_type') == 'Stories'])
    
    total_required = goal['total_posts_required'] + goal['total_reels_required'] + goal['total_stories_required']
    total_delivered = posts_delivered + reels_delivered + stories_delivered
    percentage = (total_delivered / total_required * 100) if total_required > 0 else 0
    
    status, days_remaining = calculate_delivery_status(goal['deadline_date'], percentage)
    
    await db.delivery_goals.update_one(
        {"id": goal_id},
        {"$set": {
            "posts_delivered": posts_delivered,
            "reels_delivered": reels_delivered,
            "stories_delivered": stories_delivered,
            "percentage": round(percentage, 1),
            "status": status,
            "days_remaining": days_remaining
        }}
    )
    
    return {
        "message": "Progress updated",
        "percentage": round(percentage, 1),
        "status": status,
        "days_remaining": days_remaining
    }

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

# ============= CONTRACT INFO ROUTES =============

@api_router.get("/clients/{client_id}/contract-info")
async def get_contract_info(client_id: str, current_user: Dict = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    if not client.get('contract_start_date'):
        return {
            "has_contract": False,
            "message": "Contrato não cadastrado"
        }
    
    from datetime import datetime, timezone
    start_date = datetime.fromisoformat(client['contract_start_date'].replace('Z', '+00:00'))
    if start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)
    
    now = datetime.now(timezone.utc)
    duration_months = client.get('contract_duration_months', 12)
    
    # Calcular data de término
    from dateutil.relativedelta import relativedelta
    end_date = start_date + relativedelta(months=duration_months)
    
    # Tempo decorrido e restante
    months_elapsed = (now.year - start_date.year) * 12 + (now.month - start_date.month)
    months_remaining = duration_months - months_elapsed
    days_remaining = (end_date - now).days
    
    # Progresso em %
    progress_percentage = (months_elapsed / duration_months * 100) if duration_months > 0 else 0
    
    return {
        "has_contract": True,
        "contract_start": start_date.isoformat(),
        "contract_end": end_date.isoformat(),
        "duration_months": duration_months,
        "months_elapsed": max(0, months_elapsed),
        "months_remaining": max(0, months_remaining),
        "days_remaining": max(0, days_remaining),
        "progress_percentage": min(100, max(0, progress_percentage)),
        "is_expired": now > end_date
    }

# ============= LEADS ROUTES =============

@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate, current_user: Dict = Depends(get_current_user)):
    lead_dict = lead_data.model_dump()
    lead_dict['id'] = str(uuid.uuid4())
    lead_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    lead_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.leads.insert_one(lead_dict)
    return Lead(**lead_dict)

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(status: Optional[str] = None, source: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if status:
        query['status'] = status
    if source:
        query['source'] = source
    
    leads = await db.leads.find(query, {"_id": 0}).to_list(None)
    return [Lead(**l) for l in leads]

@api_router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str, current_user: Dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return Lead(**lead)

@api_router.put("/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, lead_data: LeadCreate, current_user: Dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_dict = lead_data.model_dump()
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.leads.update_one({"id": lead_id}, {"$set": update_dict})
    
    updated_lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return Lead(**updated_lead)

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

# ============= INTERNAL DOCUMENTS ROUTES =============

@api_router.post("/internal-documents", response_model=InternalDocument)
async def create_internal_document(doc_data: InternalDocumentCreate, current_user: Dict = Depends(get_current_user)):
    doc_dict = doc_data.model_dump()
    doc_dict['id'] = str(uuid.uuid4())
    doc_dict['uploaded_at'] = datetime.now(timezone.utc).isoformat()
    doc_dict['uploaded_by'] = current_user['id']
    
    await db.internal_documents.insert_one(doc_dict)
    return InternalDocument(**doc_dict)

@api_router.get("/internal-documents", response_model=List[InternalDocument])
async def get_internal_documents(category: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if category:
        query['category'] = category
    
    documents = await db.internal_documents.find(query, {"_id": 0}).to_list(None)
    return [InternalDocument(**d) for d in documents]

@api_router.delete("/internal-documents/{doc_id}")
async def delete_internal_document(doc_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.internal_documents.delete_one({"id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

# ============= SERVICES ROUTES =============

@api_router.post("/services", response_model=Service)
async def create_service(service_data: ServiceCreate, current_user: Dict = Depends(get_current_user)):
    service_dict = service_data.model_dump()
    service_dict['id'] = str(uuid.uuid4())
    service_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.services.insert_one(service_dict)
    return Service(**service_dict)

@api_router.get("/services", response_model=List[Service])
async def get_services(current_user: Dict = Depends(get_current_user)):
    services = await db.services.find({}, {"_id": 0}).to_list(None)
    return [Service(**s) for s in services]

@api_router.put("/services/{service_id}", response_model=Service)
async def update_service(service_id: str, service_data: ServiceCreate, current_user: Dict = Depends(get_current_user)):
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_dict = service_data.model_dump()
    await db.services.update_one({"id": service_id}, {"$set": update_dict})
    
    updated_service = await db.services.find_one({"id": service_id}, {"_id": 0})
    return Service(**updated_service)

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}

# ============= CLIENT PORTAL - ACCESS TOKEN MANAGEMENT =============

@api_router.post("/clients/{client_id}/generate-access-token")
async def generate_client_access_token(client_id: str, current_user: Dict = Depends(get_current_user)):
    """Generate a magic link token for client portal access"""
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Deactivate any existing tokens for this client
    await db.client_access_tokens.update_many(
        {"client_id": client_id},
        {"$set": {"is_active": False}}
    )
    
    # Generate new token
    token = create_client_access_token(client_id)
    token_doc = {
        "id": str(uuid.uuid4()),
        "client_id": client_id,
        "token": token,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": None,  # No expiration for now
        "last_used_at": None
    }
    
    await db.client_access_tokens.insert_one(token_doc)
    
    return {
        "token": token,
        "access_url": f"/portal/{token}",
        "client_name": client['name'],
        "created_at": token_doc['created_at']
    }

@api_router.get("/clients/{client_id}/access-token")
async def get_client_access_token(client_id: str, current_user: Dict = Depends(get_current_user)):
    """Get the current active access token for a client"""
    token = await db.client_access_tokens.find_one(
        {"client_id": client_id, "is_active": True},
        {"_id": 0}
    )
    if not token:
        return {"has_token": False}
    
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    
    return {
        "has_token": True,
        "token": token['token'],
        "access_url": f"/portal/{token['token']}",
        "client_name": client['name'] if client else "Unknown",
        "created_at": token['created_at'],
        "last_used_at": token.get('last_used_at')
    }

@api_router.delete("/clients/{client_id}/access-token")
async def revoke_client_access_token(client_id: str, current_user: Dict = Depends(get_current_user)):
    """Revoke all access tokens for a client"""
    result = await db.client_access_tokens.update_many(
        {"client_id": client_id},
        {"$set": {"is_active": False}}
    )
    return {"message": f"Revoked {result.modified_count} token(s)"}

# ============= CLIENT PORTAL - CLIENT AUTHENTICATION =============

@api_router.get("/portal/validate/{token}")
async def validate_portal_token(token: str):
    """Validate a client portal access token"""
    access_token = await db.client_access_tokens.find_one(
        {"token": token, "is_active": True},
        {"_id": 0}
    )
    if not access_token:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    
    client = await db.clients.find_one({"id": access_token['client_id']}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return {
        "valid": True,
        "client": {
            "id": client['id'],
            "name": client['name'],
            "logo": client.get('logo'),
            "segment": client.get('segment')
        },
        "token": token
    }

# ============= CLIENT PORTAL - CLIENT DASHBOARD =============

@api_router.get("/portal/dashboard")
async def get_portal_dashboard(client_data: Dict = Depends(get_current_client)):
    """Get client portal dashboard data"""
    client = client_data['client']
    client_id = client['id']
    
    # Get content cards for this client
    content = await db.content_cards.find(
        {"client_id": client_id},
        {"_id": 0}
    ).to_list(None)
    
    # Get payments for this client
    payments = await db.payments.find(
        {"client_id": client_id},
        {"_id": 0}
    ).to_list(None)
    
    # Calculate stats
    pending_approval = len([c for c in content if c['status'] == "Aguardando Aprovação"])
    approved_content = len([c for c in content if c['status'] in ["Aprovado", "Agendado", "Publicado"]])
    total_content = len(content)
    
    paid_amount = sum(p['amount'] for p in payments if p['status'] == "Pago")
    pending_amount = sum(p['amount'] for p in payments if p['status'] in ["Pendente", "Em atraso"])
    
    # Get unread messages count
    unread_messages = await db.portal_messages.count_documents({
        "client_id": client_id,
        "sender_type": "agency",
        "read_at": None
    })
    
    return {
        "client": {
            "id": client['id'],
            "name": client['name'],
            "logo": client.get('logo'),
            "segment": client.get('segment'),
            "monthly_value": client.get('monthly_value', 0)
        },
        "stats": {
            "pending_approval": pending_approval,
            "approved_content": approved_content,
            "total_content": total_content,
            "paid_amount": paid_amount,
            "pending_amount": pending_amount,
            "unread_messages": unread_messages
        }
    }

@api_router.get("/portal/content")
async def get_portal_content(client_data: Dict = Depends(get_current_client)):
    """Get content cards for client portal"""
    client = client_data['client']
    
    content = await db.content_cards.find(
        {"client_id": client['id']},
        {"_id": 0}
    ).to_list(None)
    
    # Get users for assignee names
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(None)
    user_map = {u['id']: u for u in users}
    
    # Enrich content with assignee names
    for c in content:
        if c.get('assignee_id') and c['assignee_id'] in user_map:
            c['assignee_name'] = user_map[c['assignee_id']]['name']
        else:
            c['assignee_name'] = None
    
    return content

@api_router.get("/portal/content/{content_id}")
async def get_portal_content_detail(content_id: str, client_data: Dict = Depends(get_current_client)):
    """Get single content card for client portal"""
    client = client_data['client']
    
    content = await db.content_cards.find_one(
        {"id": content_id, "client_id": client['id']},
        {"_id": 0}
    )
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Get assignee info
    if content.get('assignee_id'):
        user = await db.users.find_one({"id": content['assignee_id']}, {"_id": 0, "password": 0})
        content['assignee_name'] = user['name'] if user else None
    
    return content

@api_router.post("/portal/content/{content_id}/approve")
async def approve_portal_content(content_id: str, approval: ContentApprovalRequest, client_data: Dict = Depends(get_current_client)):
    """Approve or reject content from client portal"""
    client = client_data['client']
    
    content = await db.content_cards.find_one(
        {"id": content_id, "client_id": client['id']},
        {"_id": 0}
    )
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if approval.action == "approve":
        new_status = "Aprovado"
        approval_status = "Aprovado"
    elif approval.action == "reject":
        new_status = "Revisão"
        approval_status = "Rejeitado"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    update_data = {
        "status": new_status,
        "approval_status": approval_status,
        "approval_notes": approval.feedback,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.content_cards.update_one(
        {"id": content_id},
        {"$set": update_data}
    )
    
    # Add activity
    activity = {
        "id": str(uuid.uuid4()),
        "user_id": f"client_{client['id']}",
        "user_name": client['name'],
        "action": f"Conteúdo {approval_status.lower()} pelo cliente",
        "details": approval.feedback or "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.content_cards.update_one(
        {"id": content_id},
        {"$push": {"activities": activity}}
    )
    
    return {
        "message": f"Conteúdo {approval_status.lower()} com sucesso",
        "new_status": new_status
    }

@api_router.get("/portal/payments")
async def get_portal_payments(client_data: Dict = Depends(get_current_client)):
    """Get payments for client portal"""
    client = client_data['client']
    
    payments = await db.payments.find(
        {"client_id": client['id']},
        {"_id": 0}
    ).to_list(None)
    
    return payments

@api_router.get("/portal/contract")
async def get_portal_contract(client_data: Dict = Depends(get_current_client)):
    """Get contract info for client portal"""
    client = client_data['client']
    
    if not client.get('contract_start_date'):
        return {
            "has_contract": False,
            "message": "Contrato não cadastrado"
        }
    
    from dateutil.relativedelta import relativedelta
    
    start_date = datetime.fromisoformat(client['contract_start_date'].replace('Z', '+00:00'))
    if start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)
    
    now = datetime.now(timezone.utc)
    duration_months = client.get('contract_duration_months', 12)
    
    end_date = start_date + relativedelta(months=duration_months)
    months_elapsed = (now.year - start_date.year) * 12 + (now.month - start_date.month)
    months_remaining = duration_months - months_elapsed
    days_remaining = (end_date - now).days
    progress_percentage = (months_elapsed / duration_months * 100) if duration_months > 0 else 0
    
    return {
        "has_contract": True,
        "contract_start": start_date.isoformat(),
        "contract_end": end_date.isoformat(),
        "duration_months": duration_months,
        "months_elapsed": max(0, months_elapsed),
        "months_remaining": max(0, months_remaining),
        "days_remaining": max(0, days_remaining),
        "progress_percentage": min(100, max(0, progress_percentage)),
        "is_expired": now > end_date,
        "monthly_value": client.get('monthly_value', 0)
    }

# ============= CLIENT PORTAL - MESSAGING =============

@api_router.get("/portal/messages")
async def get_portal_messages(content_card_id: Optional[str] = None, client_data: Dict = Depends(get_current_client)):
    """Get messages for client portal"""
    client = client_data['client']
    
    query = {"client_id": client['id']}
    if content_card_id:
        query["content_card_id"] = content_card_id
    
    messages = await db.portal_messages.find(query, {"_id": 0}).sort("created_at", 1).to_list(None)
    
    return messages

@api_router.post("/portal/messages")
async def create_portal_message(message_data: ClientPortalMessageCreate, client_data: Dict = Depends(get_current_client)):
    """Create a message from client portal"""
    client = client_data['client']
    
    message = {
        "id": str(uuid.uuid4()),
        "client_id": client['id'],
        "content_card_id": message_data.content_card_id,
        "sender_type": "client",
        "sender_id": client['id'],
        "sender_name": client['name'],
        "message": message_data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read_at": None
    }
    
    await db.portal_messages.insert_one(message)
    
    # Return without _id
    message.pop('_id', None)
    return message

@api_router.post("/portal/messages/{message_id}/read")
async def mark_message_read(message_id: str, client_data: Dict = Depends(get_current_client)):
    """Mark a message as read"""
    client = client_data['client']
    
    result = await db.portal_messages.update_one(
        {"id": message_id, "client_id": client['id'], "sender_type": "agency"},
        {"$set": {"read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": result.modified_count > 0}

# ============= AGENCY SIDE - PORTAL MESSAGES =============

@api_router.get("/clients/{client_id}/portal-messages")
async def get_client_portal_messages(client_id: str, content_card_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    """Get portal messages for a client (agency side)"""
    query = {"client_id": client_id}
    if content_card_id:
        query["content_card_id"] = content_card_id
    
    messages = await db.portal_messages.find(query, {"_id": 0}).sort("created_at", 1).to_list(None)
    
    return messages

@api_router.post("/clients/{client_id}/portal-messages")
async def create_agency_message(client_id: str, message_data: ClientPortalMessageCreate, current_user: Dict = Depends(get_current_user)):
    """Create a message from agency to client"""
    message = {
        "id": str(uuid.uuid4()),
        "client_id": client_id,
        "content_card_id": message_data.content_card_id,
        "sender_type": "agency",
        "sender_id": current_user['id'],
        "sender_name": current_user['name'],
        "message": message_data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read_at": None
    }
    
    await db.portal_messages.insert_one(message)
    
    # Return without _id
    message.pop('_id', None)
    return message

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