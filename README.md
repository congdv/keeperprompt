# Go Authentication System

A full-stack authentication system built with Go (Gin framework) and React (TypeScript + Vite). This project provides a complete authentication solution with JWT tokens, OAuth integration, role-based access control, and a modern React frontend.

## 🚀 Features

### Backend (Go)
- **JWT Authentication** - Secure token-based authentication
- **OAuth Integration** - Social login support
- **Role-based Access Control** - Admin and user roles
- **RESTful API** - Clean API design with Gin framework
- **Database Integration** - PostgreSQL with migrations
- **Middleware Support** - Authentication and CORS middleware
- **Environment Configuration** - Flexible config management

### Frontend (React)
- **Modern React** - Built with React 18 and TypeScript
- **Vite Build Tool** - Fast development and build process
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Powerful data fetching and caching
- **React Router** - Client-side routing
- **Shadcn/ui Components** - Beautiful and accessible UI components
- **Protected Routes** - Route-level authentication
- **OAuth Callback Handling** - Seamless social login flow

## 🛠️ Tech Stack

### Backend
- **Language**: Go 1.23+
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **ORM**: SQLx
- **Authentication**: JWT with golang-jwt
- **Configuration**: Viper/godotenv
- **CORS**: gin-contrib/cors

### Frontend
- **Language**: TypeScript
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **State Management**: React Query
- **Routing**: React Router DOM
- **UI Components**: Radix UI + Shadcn/ui

## 📋 Prerequisites

- Go 1.23 or higher
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/congdv/go-auth.git
cd go-auth
```

### 2. Backend Setup

#### Install Go dependencies
```bash
go mod download
```

#### Set up environment variables
Create a `.env` file in the root directory:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=go_auth_db
DB_SSL_MODE=disable

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server
PORT=8080
GIN_MODE=debug
```

#### Run database migrations
```bash
# Create database
createdb go_auth_db

# Run migrations
psql -d go_auth_db -f migrations/0001_init.sql
```

### 3. Frontend Setup

#### Navigate to webapp directory
```bash
cd webapp
```

#### Install Node.js dependencies
```bash
npm install
# or
yarn install
```

## 🚀 Running the Application

### Start the Backend Server
```bash
# From the root directory
go run cmd/api/main.go
```
The API server will start on `http://localhost:8080`

### Start the Frontend Development Server
```bash
# From the webapp directory
cd webapp
npm run dev
# or
yarn dev
```
The React app will start on `http://localhost:5173`

## 📁 Project Structure

```
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go            # Configuration management
│   ├── database/
│   │   └── db.go                # Database connection
│   ├── http/
│   │   ├── handlers/            # HTTP request handlers
│   │   └── middleware/          # HTTP middleware
│   ├── models/                  # Data models
│   ├── repository/              # Data access layer
│   └── services/                # Business logic layer
├── migrations/                  # Database migrations
├── webapp/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── context/             # React contexts
│   │   ├── lib/                 # Utility libraries
│   │   └── pages/               # Page components
│   ├── package.json
│   └── vite.config.ts
├── go.mod
├── go.sum
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### OAuth
- `GET /api/auth/oauth/google` - Google OAuth login
- `GET /api/auth/oauth/callback` - OAuth callback handler

### Users (Protected)
- `GET /api/users` - Get users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | Database host | Yes |
| `DB_PORT` | Database port | Yes |
| `DB_USER` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRY` | JWT token expiry duration | Yes |
| `PORT` | Server port | No (default: 8080) |
| `GIN_MODE` | Gin mode (debug/release) | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |

## 🧪 Testing

### Backend Tests
```bash
go test ./...
```

### Frontend Tests
```bash
cd webapp
npm test
# or
yarn test
```

## 🏗️ Building for Production

### Backend
```bash
go build -o bin/api cmd/api/main.go
```

### Frontend
```bash
cd webapp
npm run build
# or
yarn build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

## 🙏 Acknowledgments

- [Gin Web Framework](https://gin-gonic.com/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)
