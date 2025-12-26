<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SarathiX AI Teacher

SarathiX is an advanced, AI-powered educational platform designed to transform how knowledge is captured, processed, and presented. Leveraging the power of Google's Gemini models, it provides a suite of tools for educators, students, and researchers.

## 🌟 Key Features

- **🧠 Presentation Studio**: Generate comprehensive slide decks on any topic using AI. Expand existing decks with new content and context-aware visuals.
- **🎙️ Speech Intelligence**: Analyze transcripts with "Deep Research" capabilities. Translate, summarize, and synthesize information using a hybrid of Knowledge Base context and real-time web grounding.
- **📚 Knowledge Base**: A centralized hub to store and manage your documents. Use these documents as context for RAG (Retrieval Augmented Generation) across the platform.
- **🎬 Educational Gallery**: Generate educational videos and search for relevant content to enrich the learning experience.
- **🔌 Plugin Hub**: Extend functionality with plugins for Google Search, Maps, YouTube Data, and Python code execution.
- **🗓️ Calendar Hub**: integrated scheduling and planning (coming soon).

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher recommended)
- A Google Gemini API Key

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Run the Application**
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:3000`.

## 🐳 Deployment (Google Cloud Run)

This application is container-ready and configured to "bake" the API key into the Docker image for streamlined deployment.

### 1. Build the Docker Image
You **must** provide your API key as a build argument. This bakes the key into the static frontend bundle.

```bash
docker build --build-arg GEMINI_API_KEY=your_actual_api_key_here -t gcr.io/[YOUR_PROJECT_ID]/sarathix-app .
```

### 2. Push to Container Registry
```bash
docker push gcr.io/[YOUR_PROJECT_ID]/sarathix-app
```

### 3. Deploy to Cloud Run
```bash
gcloud run deploy sarathix-app \
  --image gcr.io/[YOUR_PROJECT_ID]/sarathix-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

> [!WARNING]
> **Security Note**: Because the API key is baked into the frontend build, it is visible to anyone who has access to the Docker image or the deployments static files. Ensure you restrict access to the image and consider using frontend-safe proxies if strict key secrecy is required.

---
Built with ❤️ using React, TailwindCSS, and Google Gemini.
