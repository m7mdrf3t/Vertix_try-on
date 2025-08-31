# Vertix Try-On

A modern web application for virtual try-on experiences powered by Google AI Platform. This application allows users to upload person and product images to see how products would look when worn.

## Features

- 🖼️ **Drag & Drop Image Upload**: Easy-to-use interface for uploading person and product images
- 🎨 **Advanced Options**: Configurable parameters for fine-tuning the virtual try-on results
- 📊 **Real-time Processing Status**: Live progress updates during AI processing
- 💾 **Result Download**: Download generated virtual try-on images
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Prerequisites

Before running this application, you need:

1. **Node.js** (version 16 or higher)
2. **npm** or **yarn**
3. **Google Cloud Platform** account with:
   - AI Platform API enabled
   - Proper authentication credentials
   - Access to the virtual try-on model

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vertix-try-on
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

4. Set up Google Cloud authentication:
   - Create a service account in Google Cloud Console
   - Download the service account key JSON file
   - Place it in the `server/` directory
   - Update the environment variables (see Configuration section)

## Configuration

### Backend Configuration

1. Copy the example environment file:
```bash
cd server
cp env.example .env
```

2. Update the `.env` file with your Google Cloud credentials:
```env
# Google Cloud Configuration
GOOGLE_PROJECT_ID=manasa-457302
GOOGLE_LOCATION=us-central1
GOOGLE_MODEL_ID=virtual-try-on-preview-08-04

# Path to your Google Cloud service account key file
GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/service-account-key.json

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Frontend Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001
```

## Usage

1. Start the backend server:
```bash
cd server
npm start
```

2. In a new terminal, start the frontend development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

3. Upload Images:
   - **Person Image**: Upload a photo of the person (max 1 image)
   - **Product Images**: Upload product images (max 5 images)

4. Configure Advanced Options (optional):
   - Add watermark
   - Base steps
   - Person generation style
   - Safety settings
   - Sample count
   - Seed value
   - Output format options

5. Click "Generate Virtual Try-On" to process the images

6. Download the result when processing is complete

## Architecture

The application uses a client-server architecture:

- **Frontend**: React application running on port 3000
- **Backend**: Express server running on port 3001, handling Google Cloud authentication
- **API**: Google AI Platform virtual try-on endpoint

### API Endpoints

#### Backend Proxy
```
POST http://localhost:3001/api/try-on
```

#### Google AI Platform (via backend proxy)
```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/manasa-457302/locations/us-central1/publishers/google/models/virtual-try-on-preview-08-04:predict
```

### Request Format

```json
{
  "instances": [
    {
      "personImage": {
        "image": {
          "bytesBase64Encoded": "base64_encoded_person_image"
        }
      },
      "productImages": [
        {
          "image": {
            "bytesBase64Encoded": "base64_encoded_product_image"
          }
        }
      ]
    }
  ],
  "parameters": {
    "addWatermark": false,
    "baseSteps": 20,
    "personGeneration": "realistic",
    "safetySetting": "medium",
    "sampleCount": 1,
    "outputOptions": {
      "mimeType": "image/jpeg",
      "compressionQuality": 90
    }
  }
}
```

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── ImageUpload.tsx # Image upload with drag & drop
│   │   ├── ProcessingStatus.tsx  # Processing status and results
│   │   └── AdvancedOptions.tsx   # Advanced configuration options
│   ├── services/
│   │   └── api.ts         # API service for backend communication
│   ├── types/
│   │   └── index.ts       # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── server/                 # Backend Express server
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
├── package.json           # Frontend dependencies
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # Project documentation
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Troubleshooting

### Common Issues

1. **Authentication Error**: Ensure you have proper Google Cloud authentication configured
2. **CORS Issues**: The API calls are made directly from the browser, so ensure CORS is properly configured
3. **Image Upload Issues**: Check that images are in supported formats (JPG, PNG, GIF)
4. **Processing Timeout**: Large images may take longer to process

### Debug Mode

Enable debug logging by setting the environment variable:
```env
REACT_APP_DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review Google AI Platform documentation
- Open an issue in the repository

## Acknowledgments

- Google AI Platform for the virtual try-on model
- React and TypeScript communities
- Tailwind CSS for the styling framework
