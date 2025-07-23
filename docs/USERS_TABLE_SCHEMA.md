# Users Table Schema for Airtable

## Table Name: `Users`

This table handles user authentication, profile management, and session persistence for the Misión Huascarán Grant Management System.

### Fields:

| Field Name | Type | Description | Required | Unique |
|------------|------|-------------|----------|---------|
| `User ID` | Auto Number | Primary key auto-generated | Yes | Yes |
| `Email` | Email | User's email address (login identifier) | Yes | Yes |
| `Password Hash` | Single Line Text | Hashed password using bcrypt | Yes | No |
| `Full Name` | Single Line Text | User's full name from registration | Yes | No |
| `Role` | Single Select | User access level: Admin, Team | Yes | No |
| `Created Date` | Date | Account creation timestamp | Yes | No |
| `Last Login` | Date | Last successful login timestamp | No | No |
| `Status` | Single Select | Active, Inactive, Suspended | Yes | No |
| `Email Verified` | Checkbox | Whether email has been verified | Yes | No |
| `Password Reset Token` | Single Line Text | Token for password reset (temporary) | No | No |
| `Password Reset Expires` | Date | When password reset token expires | No | No |
| `Profile Picture` | Attachment | User's profile image | No | No |
| `Organization` | Single Line Text | User's organization/NGO name | No | No |
| `Phone` | Phone Number | Contact phone number | No | No |
| `Country` | Single Select | User's country | No | No |
| `Language` | Single Select | Preferred language: English, Spanish | No | No |
| `Notifications` | Multiple Select | Email, SMS, Push notifications | No | No |
| `Bio` | Long Text | User biography/description | No | No |
| `Session Token` | Single Line Text | Current session token for persistence | No | No |
| `Session Expires` | Date | When current session expires | No | No |

### Role Options:
- `Admin`: Full access to all features, data management, user management
- `Team`: Access to view opportunities, submit applications, track progress

### Status Options:
- `Active`: User can login and access system
- `Inactive`: User account disabled temporarily
- `Suspended`: User account suspended due to violations

### Country Options:
- `Peru`
- `Colombia`
- `Ecuador`
- `Bolivia`
- `Other`

### Language Options:
- `English`
- `Spanish`

### Notification Options:
- `Email`
- `SMS`
- `Push`

### Security Features:
1. **Email Uniqueness**: Email field is unique to prevent duplicate accounts
2. **Password Hashing**: Passwords stored as bcrypt hashes, never plain text
3. **Session Management**: Session tokens for persistent login across page refreshes
4. **Password Reset**: Secure token-based password reset functionality
5. **Email Verification**: Account verification via email

### API Endpoints Needed:
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and create session
- `POST /api/auth/logout` - End user session
- `POST /api/auth/refresh` - Refresh session token
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/user/profile` - Get user profile data
- `PUT /api/user/profile` - Update user profile
- `POST /api/auth/verify-email` - Verify email address

### Usage Notes:
- Use this table to replace the current mock authentication system
- Implement proper password hashing (bcrypt) for security
- Session tokens should be JWT or similar for stateless authentication
- Email verification recommended for production use
- Password reset tokens should expire within 24 hours
- Consider adding rate limiting for failed login attempts