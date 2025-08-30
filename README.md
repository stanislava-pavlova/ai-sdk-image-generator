<a href="https://ai-sdk-image-generator.vercel.app">
  <h1 align="center">AI Visual Story Generator</h1>
</a>

<p align="center">
  An intelligent story-to-image generator that transforms narratives into visual sequences using AI. Built with Next.js, the AI SDK by Vercel, and Google Vertex AI.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#user-guide"><strong>User Guide</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a> ·
</p>
<br/>

## Features

### 🎯 **Smart Story Segmentation**

- **Intelligent Text Processing**: Automatically breaks down narratives into meaningful segments for image generation
- **Configurable Segment Length**: Adjust words per segment (10-50 words) to control granularity
- **Context-Aware Splitting**: Preserves sentence structure and narrative flow while creating logical image prompts

### 🎨 **Advanced Image Generation**

- **Multi-Model Support**: Choose between performance and quality modes using Google Vertex AI's Imagen models
- **Character Consistency**: Maintains character identity, age progression, and visual continuity across story segments
- **Flexible Aspect Ratios**: Support for various formats (16:9, 9:16, 1:1, 4:3, 3:4)
- **Individual Image Editing**: Edit and regenerate specific images with custom prompts

### 📖 **Story Configuration System**

- **Character Profiles**: Define character identity, age progression, appearance, and personality traits
- **Visual Style Control**: Set artistic style, mood, color palette, and camera settings
- **Age Progression Mapping**: Automatically adjust character appearance based on story timeline
- **Consistent Theming**: Maintain visual coherence throughout the entire narrative

### 🖼️ **Image Management**

- **Real-Time Generation**: See images appear as they're generated with live progress indicators
- **Batch Download**: Download all generated images at once for easy collection
- **Image Preview**: Full-screen modal view with zoom and detail inspection
- **Error Handling**: Clear error reporting with retry options for failed generations

### 💻 **Modern Tech Stack**

- Built with [Next.js 15](https://nextjs.org) App Router for optimal performance
- Powered by the [AI SDK by Vercel](https://sdk.vercel.ai/docs) for seamless AI integration
- [shadcn/ui](https://ui.shadcn.com/) components with [Tailwind CSS](https://tailwindcss.com) for beautiful, responsive design
- TypeScript throughout for type safety and developer experience

## User Guide

### Getting Started

The AI SDK Image Generator transforms written stories into visual narratives. Here's how to use it effectively:

### 1. Preparing Your Story

#### **Text Input Methods**

- **Direct Text Entry**: Type or paste your story directly into the text area
- **File Upload**: Upload a `.txt` file containing your narrative (recommended for longer stories)

#### **Story Structure Tips**

- Write in **narrative segments** that describe visual scenes
- Each paragraph should contain **actionable visual elements**
- Include **character descriptions** and **setting details**
- Aim for **chronological progression** if you want age/timeline consistency

**Example Story Structure:**

```
Marie Curie arrives in Paris as a young student, carrying her few belongings and dreams of scientific discovery. Marie meets Pierre Curie in the laboratory, their shared passion for science creating an immediate bond. The Curies make their first major discovery, isolating radium from pitchblende ore in their makeshift laboratory.
```

### 2. Story Configuration (Optional but Recommended)

For **character consistency** and **visual coherence**, upload a story configuration JSON file:

#### **Configuration File Structure**

```json
{
  "identity_core": {
    "name": "Character Name",
    "base_age": 25,
    "year_of_birth": 1867,
    "age_progression": {
      "milestones": {
        "0-2": { "age": 25, "description": "young description" },
        "3-5": { "age": 35, "description": "middle-aged description" },
        "6-8": { "age": 45, "description": "mature description" },
        "9+": { "age": 55, "description": "elder description" }
      }
    },
    "origin": "Background information",
    "domains": "Field of expertise",
    "values": "Character traits",
    "hair_general": "Hair description",
    "demeanor": "Personality traits"
  },
  "style_throughline": {
    "art_style": "Visual style (e.g., 'cinematic realism')",
    "mood": "Overall mood (e.g., 'quiet determination')",
    "color_palette_base": "Color scheme (e.g., 'cool neutral blues and greys')"
  },
  "camera_baseline": {
    "perspective": "Camera angle (e.g., 'close-up')",
    "lens_mm": 50,
    "composition": "Composition rule (e.g., 'golden ratio')",
    "depth_of_field": "Focus style (e.g., 'shallow')"
  },
  "additional_context": "Any extra styling notes"
}
```

#### **Key Configuration Benefits**

- **Character Consistency**: Same character appearance across all images
- **Age Progression**: Automatic aging based on story timeline
- **Visual Cohesion**: Consistent art style, lighting, and composition
- **Quality Enhancement**: Professional photography and cinematography settings

### 3. Segmentation Settings

#### **Words Per Segment**

- **10-15 words**: Very granular, detailed scenes (more images)
- **20-30 words**: Balanced approach (recommended)
- **35-50 words**: Broader scenes, fewer images

#### **Aspect Ratio Selection**

Choose based on your intended use:

- **16:9**: Cinematic, landscape orientation
- **9:16**: Portrait, social media stories
- **1:1**: Square, social media posts

### 4. Generation Process

#### **Starting Generation**

1. Upload or enter your story text
2. Upload story configuration JSON
3. Adjust segmentation settings
4. Select aspect ratio
5. Click **"Generate Story Images"**

#### **Post-Generation Actions**

- **Individual Editing**: Click edit icon on any image to modify its prompt. Click **"Regenerate"** to create a new version
- **Individual Download**: Download individual image
- **Batch Download**: Download all images at once

### Best Practices

#### **For Optimal Results**

- ✅ Include **specific visual details** in your story
- ✅ Mention **lighting, setting, and mood** when relevant
- ✅ Use **consistent character names** throughout
- ✅ Structure stories with **clear scene transitions**
- ✅ Upload **story configuration** for character consistency

#### **Common Pitfalls to Avoid**

- ❌ Overly abstract or philosophical text without visual elements
- ❌ Inconsistent character descriptions across segments
- ❌ Missing environmental or setting descriptions

## Model Providers

This application currently supports **Google Vertex AI** with Imagen models:

### **Google Vertex AI**

- **Performance Mode**: `imagen-3.0-fast-generate-001` - Faster generation, optimized for speed
- **Quality Mode**: `imagen-3.0-generate-001` - Higher quality results, longer processing time

#### **Configuration**

The application is configured for Google Vertex AI by default. Other providers (OpenAI, Replicate, Fireworks) are commented out but can be easily enabled by updating the configuration in `/lib/provider-config.ts`.

### Getting Help

#### **API Limits and Quotas**

- Be aware of Google Vertex AI usage quotas
- Space out large generation requests
- Monitor your API usage in the Google Cloud Console

### **Environment Variables for Production**

After clicking deploy, configure these environment variables in Vercel:

```env
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
GOOGLE_VERTEX_PROJECT=your-google-cloud-project-id
GOOGLE_VERTEX_LOCATION=us-central1
```

## Running Locally
### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/vercel-labs/ai-sdk-image-generator.git
cd ai-sdk-image-generator

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Step 2: Google Cloud Setup

#### **Create a Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Note your **Project ID** (you'll need this later)

#### **Enable Required APIs**

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Or enable via the Console:
# Go to APIs & Services > Enable APIs and Services
# Search for "Vertex AI API" and enable it
```

#### **Create Service Account**

1. In Google Cloud Console, go to **IAM & Admin** > **Service Accounts**
2. Click **"Create Service Account"**
3. Set name: `ai-image-generator`
4. Grant these roles:
   - `Vertex AI User`
   - `AI Platform Developer` (if available)
5. Click **"Create and Continue"**
6. **Create and Download JSON Key**:
   - Click on your service account
   - Go to **"Keys"** tab
   - Click **"Add Key"** > **"Create new key"**
   - Choose **JSON** format
   - Download and save the file securely

### Step 3: Environment Configuration

Create a `.env.local` file in your project root:

```env
# Google Vertex AI Configuration (Required)
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
GOOGLE_VERTEX_PROJECT=your-google-cloud-project-id
GOOGLE_VERTEX_LOCATION=us-central1

# Optional: Other providers (currently disabled)
# OPENAI_API_KEY=your-openai-key
# REPLICATE_API_TOKEN=your-replicate-token
# FIREWORKS_API_KEY=your-fireworks-key
```

#### **Important Notes**

- **GOOGLE_CLIENT_EMAIL**: Found in your downloaded JSON file as `client_email`
- **GOOGLE_PRIVATE_KEY**: Found in your JSON file as `private_key` (include the full key with `\n` for line breaks)
- **GOOGLE_VERTEX_PROJECT**: Your Google Cloud Project ID
- **GOOGLE_VERTEX_LOCATION**: Region for Vertex AI

#### **Security Best Practices**

- ✅ Never commit `.env.local` to version control
- ✅ Store service account JSON files securely
- ✅ Use different service accounts for development and production
- ✅ Regularly rotate service account keys

### Step 4: Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at **[http://localhost:3000](http://localhost:3000)**

### Troubleshooting Setup

#### **Common Environment Issues**

**"Authentication failed" Error**

- Verify your `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` are correct
- Ensure the private key includes proper line breaks (`\n`)
- Check that your service account has the required permissions

**"Project not found" Error**

- Confirm `GOOGLE_VERTEX_PROJECT` matches your actual project ID
- Verify the Vertex AI API is enabled for your project

**"Location not supported" Error**

- Try a different region: `us-central1`, `europe-west4`, or `asia-southeast1`
- Check [available regions](https://cloud.google.com/vertex-ai/docs/general/locations) for Vertex AI

### Additional Resources

- [Google Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [AI SDK by Vercel Documentation](https://sdk.vercel.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
