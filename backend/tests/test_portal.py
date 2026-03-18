"""
Backend tests for Client Portal API endpoints
Tests portal authentication, dashboard, content approval, payments, contract and messages
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@agencyos.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    # If admin doesn't exist, register and login
    register_response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "name": "Admin User",
        "role": "Admin"
    })
    if register_response.status_code in [200, 201, 400]:  # 400 means already exists
        login_resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if login_resp.status_code == 200:
            return login_resp.json().get("token")
    pytest.skip("Could not authenticate admin - skipping tests")


@pytest.fixture(scope="module")
def authenticated_client(api_client, admin_token):
    """Session with admin auth header"""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client


@pytest.fixture(scope="module")
def test_client_id(authenticated_client):
    """Get or create a test client"""
    # First check if client exists
    response = authenticated_client.get(f"{BASE_URL}/api/clients")
    if response.status_code == 200:
        clients = response.json()
        if clients:
            return clients[0]["id"]
    
    # Create a test client
    client_data = {
        "name": "TEST_Portal Cliente",
        "segment": "Tecnologia",
        "status": "Ativo",
        "monthly_value": 5000.0,
        "due_day": 10,
        "contract_start_date": "2024-01-01T00:00:00+00:00",
        "contract_duration_months": 12
    }
    response = authenticated_client.post(f"{BASE_URL}/api/clients", json=client_data)
    if response.status_code in [200, 201]:
        return response.json()["id"]
    pytest.skip("Could not create test client")


@pytest.fixture(scope="module")
def portal_token(authenticated_client, test_client_id):
    """Generate a fresh portal token for testing"""
    response = authenticated_client.post(f"{BASE_URL}/api/clients/{test_client_id}/generate-access-token")
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Could not generate portal token")


class TestPortalTokenGeneration:
    """Tests for admin token generation for client portal"""
    
    def test_generate_access_token(self, authenticated_client, test_client_id):
        """Test generating access token for a client"""
        response = authenticated_client.post(f"{BASE_URL}/api/clients/{test_client_id}/generate-access-token")
        assert response.status_code == 200, f"Failed to generate token: {response.text}"
        
        data = response.json()
        assert "token" in data
        assert "access_url" in data
        assert "client_name" in data
        assert len(data["token"]) > 20  # Token should be reasonably long
        print(f"✓ Generated token for client: {data['client_name']}")
    
    def test_get_access_token(self, authenticated_client, test_client_id):
        """Test retrieving existing access token"""
        response = authenticated_client.get(f"{BASE_URL}/api/clients/{test_client_id}/access-token")
        assert response.status_code == 200
        
        data = response.json()
        # Should have a token after generation
        if data.get("has_token"):
            assert "token" in data
            assert "access_url" in data
        print(f"✓ Access token retrieval working")
    
    def test_generate_token_for_nonexistent_client(self, authenticated_client):
        """Test token generation for non-existent client returns 404"""
        response = authenticated_client.post(f"{BASE_URL}/api/clients/nonexistent-id/generate-access-token")
        assert response.status_code == 404
        print(f"✓ Non-existent client returns 404")


class TestPortalValidation:
    """Tests for portal token validation"""
    
    def test_validate_generated_token(self, api_client, portal_token):
        """Test validating a freshly generated token"""
        # Clear any existing auth header for this test
        headers = {"Content-Type": "application/json"}
        response = api_client.get(f"{BASE_URL}/api/portal/validate/{portal_token}", headers=headers)
        assert response.status_code == 200, f"Token validation failed: {response.text}"
        
        data = response.json()
        assert data.get("valid") == True
        assert "client" in data
        assert "id" in data["client"]
        assert "name" in data["client"]
        print(f"✓ Token validation successful for: {data['client']['name']}")
    
    def test_validate_invalid_token(self, api_client):
        """Test validating an invalid token returns 401"""
        headers = {"Content-Type": "application/json"}
        response = api_client.get(f"{BASE_URL}/api/portal/validate/invalid-token-12345", headers=headers)
        assert response.status_code == 401
        print(f"✓ Invalid token correctly rejected")


class TestPortalDashboard:
    """Tests for portal dashboard endpoint"""
    
    def test_get_dashboard_data(self, api_client, portal_token):
        """Test getting portal dashboard data"""
        headers = {"Authorization": f"Bearer {portal_token}"}
        response = api_client.get(f"{BASE_URL}/api/portal/dashboard", headers=headers)
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        
        data = response.json()
        assert "client" in data
        assert "stats" in data
        
        # Verify stats structure
        stats = data["stats"]
        assert "pending_approval" in stats
        assert "approved_content" in stats
        assert "total_content" in stats
        assert "paid_amount" in stats
        assert "pending_amount" in stats
        assert "unread_messages" in stats
        
        print(f"✓ Dashboard data loaded for: {data['client']['name']}")
        print(f"  - Pending approval: {stats['pending_approval']}")
        print(f"  - Approved content: {stats['approved_content']}")
        print(f"  - Total content: {stats['total_content']}")
    
    def test_dashboard_without_auth(self, api_client):
        """Test dashboard without auth returns 401"""
        response = api_client.get(f"{BASE_URL}/api/portal/dashboard")
        assert response.status_code in [401, 403]
        print(f"✓ Dashboard correctly requires authentication")


class TestPortalContent:
    """Tests for portal content endpoints"""
    
    def test_get_portal_content(self, api_client, portal_token):
        """Test getting content for client portal"""
        headers = {"Authorization": f"Bearer {portal_token}"}
        response = api_client.get(f"{BASE_URL}/api/portal/content", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Portal content retrieved: {len(data)} items")
    
    def test_content_without_auth(self, api_client):
        """Test content without auth returns error"""
        response = api_client.get(f"{BASE_URL}/api/portal/content")
        assert response.status_code in [401, 403]
        print(f"✓ Content endpoint correctly requires authentication")


class TestPortalPayments:
    """Tests for portal payments endpoint"""
    
    def test_get_portal_payments(self, api_client, portal_token):
        """Test getting payments for client portal"""
        headers = {"Authorization": f"Bearer {portal_token}"}
        response = api_client.get(f"{BASE_URL}/api/portal/payments", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Portal payments retrieved: {len(data)} items")


class TestPortalContract:
    """Tests for portal contract endpoint"""
    
    def test_get_portal_contract(self, api_client, portal_token):
        """Test getting contract info for client portal"""
        headers = {"Authorization": f"Bearer {portal_token}"}
        response = api_client.get(f"{BASE_URL}/api/portal/contract", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        if data.get("has_contract"):
            assert "contract_start" in data
            assert "contract_end" in data
            assert "duration_months" in data
            assert "progress_percentage" in data
            print(f"✓ Contract info: {data['months_elapsed']} months elapsed, {data['progress_percentage']:.1f}% complete")
        else:
            print(f"✓ No contract registered for this client")


class TestPortalMessages:
    """Tests for portal messaging system"""
    
    def test_get_portal_messages(self, api_client, portal_token):
        """Test getting messages for client portal"""
        headers = {"Authorization": f"Bearer {portal_token}"}
        response = api_client.get(f"{BASE_URL}/api/portal/messages", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Portal messages retrieved: {len(data)} messages")
    
    def test_send_message_from_portal(self, api_client, portal_token):
        """Test sending a message from client portal"""
        headers = {"Authorization": f"Bearer {portal_token}"}
        message_data = {
            "message": "TEST_Message from portal test"
        }
        response = api_client.post(f"{BASE_URL}/api/portal/messages", 
                                   json=message_data, 
                                   headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["message"] == message_data["message"]
        assert data["sender_type"] == "client"
        print(f"✓ Message sent from portal successfully")
    
    def test_send_empty_message_validation(self, api_client, portal_token):
        """Test that empty messages are handled"""
        headers = {"Authorization": f"Bearer {portal_token}"}
        message_data = {
            "message": ""
        }
        response = api_client.post(f"{BASE_URL}/api/portal/messages", 
                                   json=message_data, 
                                   headers=headers)
        # Should either reject or accept empty message
        assert response.status_code in [200, 422]
        print(f"✓ Empty message handling verified")


class TestAdminPortalMessages:
    """Tests for admin side of portal messaging"""
    
    def test_get_client_messages_as_admin(self, authenticated_client, test_client_id):
        """Test getting client messages from admin side"""
        response = authenticated_client.get(f"{BASE_URL}/api/clients/{test_client_id}/portal-messages")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can view client messages: {len(data)} messages")
    
    def test_send_message_as_admin(self, authenticated_client, test_client_id):
        """Test sending a message from admin to client"""
        message_data = {
            "message": "TEST_Message from admin to client"
        }
        response = authenticated_client.post(
            f"{BASE_URL}/api/clients/{test_client_id}/portal-messages", 
            json=message_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["sender_type"] == "agency"
        print(f"✓ Admin message sent successfully")


class TestContentApproval:
    """Tests for content approval flow"""
    
    def test_content_approval_endpoint_structure(self, api_client, portal_token):
        """Test that approval endpoint exists and has proper structure"""
        headers = {"Authorization": f"Bearer {portal_token}"}
        # First get content to find a content ID
        response = api_client.get(f"{BASE_URL}/api/portal/content", headers=headers)
        assert response.status_code == 200
        
        content_list = response.json()
        if content_list:
            # Try to get single content detail
            content_id = content_list[0]["id"]
            detail_response = api_client.get(
                f"{BASE_URL}/api/portal/content/{content_id}", 
                headers=headers
            )
            assert detail_response.status_code == 200
            print(f"✓ Content detail endpoint working")
        else:
            print(f"✓ No content available for testing approval")


class TestErrorHandling:
    """Tests for error handling in portal endpoints"""
    
    def test_invalid_content_id(self, authenticated_client, test_client_id):
        """Test accessing non-existent content"""
        # Generate a fresh token for this test
        gen_response = authenticated_client.post(f"{BASE_URL}/api/clients/{test_client_id}/generate-access-token")
        assert gen_response.status_code == 200
        fresh_token = gen_response.json()["token"]
        
        headers = {"Authorization": f"Bearer {fresh_token}"}
        response = authenticated_client.get(f"{BASE_URL}/api/portal/content/invalid-id", headers=headers)
        assert response.status_code == 404
        print(f"✓ Non-existent content returns 404")
    
    def test_portal_endpoint_without_token(self, api_client):
        """Test portal endpoints without token"""
        endpoints = [
            "/api/portal/dashboard",
            "/api/portal/content",
            "/api/portal/payments",
            "/api/portal/contract",
            "/api/portal/messages"
        ]
        
        for endpoint in endpoints:
            response = api_client.get(f"{BASE_URL}{endpoint}")
            assert response.status_code in [401, 403, 422], f"Endpoint {endpoint} should require auth"
        
        print(f"✓ All portal endpoints require authentication")


class TestTokenRevocation:
    """Tests for token revocation functionality - Run last"""
    
    def test_revoke_access_token(self, authenticated_client, test_client_id):
        """Test revoking access token for a client"""
        # First generate a new token 
        gen_response = authenticated_client.post(f"{BASE_URL}/api/clients/{test_client_id}/generate-access-token")
        assert gen_response.status_code == 200
        
        # Then revoke it
        response = authenticated_client.delete(f"{BASE_URL}/api/clients/{test_client_id}/access-token")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        print(f"✓ Token revocation successful")
        
        # Regenerate for any subsequent tests
        authenticated_client.post(f"{BASE_URL}/api/clients/{test_client_id}/generate-access-token")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
