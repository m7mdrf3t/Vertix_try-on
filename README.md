# Mirrify

A virtual try-on web application powered by Creative spaces that allows users to see how clothing items would look on them by uploading person and product images.

## Features

- 🎨 Virtual try-on using Creative spaces
- 📱 Responsive design with Tailwind CSS
- 🔄 Real-time processing status
- 📤 Drag & drop image upload
- ⚙️ Advanced options for customization
- 🚀 Fast and modern React interface

## Project Structure

```
Mirrify/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   └── App.tsx            # Main application component
├── server/                # Backend Node.js server
│   ├── server.js          # Express server
│   └── package.json       # Backend dependencies
├── public/                # Static files
├── Dockerfile             # Frontend Docker configuration
├── docker-compose.yml     # Local development setup
└── DEPLOYMENT.md          # Railway deployment guide
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud Platform account with AI Platform enabled

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Vertix_try-on
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```
   
   Create `.env` file in the server directory:
   ```env
   GOOGLE_PROJECT_ID=your-project-id
   GOOGLE_LOCATION=us-central1
   GOOGLE_MODEL_ID=your-model-id
   GOOGLE_APPLICATION_CREDENTIALS=./neat-cycling-470410-t9-cf1a586a416b.json
   ```

5. **Start the backend server**
   ```bash
   cd server
   npm start
   ```

6. **Start the frontend development server**
   ```bash
   npm start
   ```

7. **Open your browser**
   
   Frontend: http://localhost:3000
   Backend: http://localhost:3001

### Using Docker Compose

For a complete setup with Docker:

```bash
docker-compose up --build
```

This will start both frontend and backend services automatically.

## Deployment

### Railway Deployment

This project is configured for easy deployment on Railway. See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for simplified deployment instructions.

### Key Deployment Files

- `railway.json` - Railway configuration
- `Dockerfile` - Frontend container configuration
- `server/Dockerfile` - Backend container configuration
- `docker-compose.yml` - Local development setup
- `nginx.conf` - Production web server configuration

## API Endpoints

### Backend API

- `GET /api/health` - Health check
- `GET /api/auth/token` - Get Google Cloud access token
- `POST /api/try-on` - Virtual try-on prediction

### Request Format

```json
{
  "instances": [{
    "personImage": {
      "image": {
        "bytesBase64Encoded": "base64_encoded_image"
      }
    },
    "productImages": [{
      "image": {
        "bytesBase64Encoded": "base64_encoded_image"
      }
    }]
  }],
  "parameters": {}
}
```

## Environment Variables

### Frontend
- `REACT_APP_API_URL` - Backend API URL

### Backend
- `PORT` - Server port (default: 3001)
- `GOOGLE_PROJECT_ID` - Google Cloud project ID
- `GOOGLE_LOCATION` - AI Platform location
- `GOOGLE_MODEL_ID` - Model ID for predictions
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account credentials path
- `FRONTEND_URL` - Frontend URL for CORS

## Technologies Used

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Axios (HTTP client)

### Backend
- Node.js
- Express.js
- Google Auth Library
- CORS middleware

### Deployment
- Railway
- Docker
- Nginx

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
