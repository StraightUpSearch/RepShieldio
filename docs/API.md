# RepShield.io API Documentation

## 🚀 Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://repshield.io/api`

## 🎯 Overview

RepShield.io MVP is a **simple ticketing system** for Reddit content removal services. The API focuses on:
- User authentication and management
- Ticket creation and tracking
- Email notifications to specialists and customers

## 🔐 Authentication

RepShield.io uses session-based authentication with secure HTTP-only cookies.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Logout
```http
POST /api/auth/logout
```

## 📋 Contact Form (Reddit URL Submission)

### Submit Reddit URL for Removal
Creates a support ticket for Reddit content removal.

```http
POST /api/contact
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith", 
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "company": "ABC Corp",
  "inquiryType": "content-removal",
  "message": "Need help removing false negative post about our company",
  "redditUrl": "https://reddit.com/r/complaints/comments/abc123/terrible_experience_with_abc_corp/"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request submitted successfully",
  "ticketId": "REP-0001",
  "estimatedResponse": "24 hours"
}
```

## 🎫 Support Tickets

### Create Authenticated Ticket
```http
POST /api/tickets
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "subject": "Remove False Reddit Post",
  "description": "Need help removing false claims about our company on Reddit",
  "priority": "high",
  "category": "content-removal",
  "redditUrl": "https://reddit.com/r/complaints/comments/abc123/"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticketId": "REP-0001", 
    "status": "pending",
    "priority": "high",
    "title": "Remove False Reddit Post",
    "createdAt": "2025-01-30T10:30:00Z"
  }
}
```

### Get User Tickets
```http
GET /api/user/tickets
Authorization: Bearer <session-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "ticketId": "REP-0001",
    "redditUrl": "https://reddit.com/r/complaints/comments/abc123/",
    "clientEmail": "user@example.com",
    "status": "pending",
    "specialistReply": "Pending specialist review",
    "timestamp": "30/01/2025, 10:30:00 AM"
  }
]
```

## 💳 Payments

### Create Payment Intent
```http
POST /api/payments/intent
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "serviceType": "comprehensive_removal",
  "amount": 49900,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567890_secret_abcdef",
  "amount": 49900,
  "currency": "usd"
}
```

## 👤 User Management

### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <session-token>
```

### Update User Profile
```http
PUT /api/user/profile
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "name": "John Smith",
  "phone": "+1-555-0123",
  "notifications": {
    "email": true,
    "sms": false
  }
}
```

## 📈 Analytics

### Get Dashboard Data
```http
GET /api/analytics/dashboard
Authorization: Bearer <session-token>
```

**Response:**
```json
{
  "overview": {
    "totalScans": 25,
    "activeTickets": 3,
    "resolvedIssues": 12,
    "overallSentiment": 0.2
  },
  "recentActivity": [
    {
      "type": "scan_completed",
      "brandName": "YourBrand",
      "date": "2024-01-15T16:30:00Z",
      "result": "medium_risk"
    }
  ]
}
```

## 🚨 Error Handling

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Brand name is required",
    "details": {
      "field": "brandName",
      "value": ""
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## 🔒 Rate Limiting

- **Public endpoints**: 100 requests per hour per IP
- **Authenticated endpoints**: 1000 requests per hour per user
- **Scan endpoints**: 10 scans per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## 📝 Webhooks

RepShield.io can send webhooks for important events:

### Webhook Events
- `scan.completed` - Scan finished processing
- `ticket.status_changed` - Support ticket status updated
- `removal.completed` - Content removal successful

### Webhook Payload Example
```json
{
  "event": "scan.completed",
  "data": {
    "scanId": "scan_12345",
    "brandName": "YourBrand",
    "riskLevel": "high",
    "results": { /* scan results */ }
  },
  "timestamp": "2024-01-15T16:30:00Z"
}
```

## 🧪 Testing

### Sandbox Environment
Use the sandbox environment for testing:
- **Base URL**: `https://sandbox.repshield.io/api`
- **Test API Key**: Contact support for sandbox credentials

### Test Data
```javascript
// Test brand names that return predictable results
const testBrands = {
  "TestBrand-Clean": "No negative mentions found",
  "TestBrand-Risk": "Medium risk mentions found", 
  "TestBrand-Crisis": "High risk mentions found"
};
```

---

**Need help?** Contact our API support team at `api-support@repshield.io` 