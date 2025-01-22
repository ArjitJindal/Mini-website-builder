# Chat-Driven Mini Website Builder

A real-time, chat-based website editor built with Next.js and Socket.IO.

## Features

- Real-time website editing through chat commands
- AI-powered content generation with OpenAI GPT-3.5
- Dynamic theme switching (default, modern, minimal, elegant)
- Image generation with DALL-E and fallback system
- Real-time preview with Socket.IO

## Build Strategy

### Server-Side Rendering (SSR) Implementation

Our application uses a hybrid approach optimized for different use cases:

1. **Published Pages (`/[siteId]`)**

   ```typescript
   // pages/[siteId].tsx
   export const getServerSideProps: GetServerSideProps = async ({ params }) => {
     const siteId = params?.siteId as string;
     const content = await siteService.getSite(siteId);

     return {
       props: {
         siteId,
         initialContent: content,
       },
     };
   };
   ```

   - Uses SSR for initial page load to ensure content is always fresh
   - Connects to Socket.IO for real-time updates after hydration
   - Provides optimal SEO as content is rendered server-side

2. **Editor Pages (`/edit/[siteId]`)**
   ```typescript
   // pages/edit/[siteId].tsx
   export const getServerSideProps: GetServerSideProps = async ({ params }) => {
     const siteId = params?.siteId as string;
     return {
       props: { siteId },
     };
   };
   ```
   - Uses SSR for initial load but primarily operates client-side
   - Maintains WebSocket connection for real-time editing
   - Handles dynamic content updates without page refreshes

### Scalability Considerations

1. **Handling Multiple User Sites**

   - Current in-memory storage would be replaced with a database:
     ```typescript
     interface SiteStorage {
       getSite(siteId: string): Promise<SiteContent>;
       updateSite(siteId: string, content: SiteContent): Promise<void>;
       deleteSite(siteId: string): Promise<void>;
     }
     ```
   - Each site has its own Socket.IO room for isolated updates
   - Content changes are broadcast only to relevant users

2. **Build Time Optimization**

   - For high-traffic sites, implement ISR (Incremental Static Regeneration):
     ```typescript
     export async function getStaticProps({ params }) {
       return {
         props: {
           content: await getSiteContent(params.siteId),
         },
         revalidate: 60, // Revalidate every minute
       };
     }
     ```
   - Use edge caching for static assets and images
   - Implement database caching for frequently accessed sites

3. **Real-time Updates vs Static Generation**
   - Socket.IO handles real-time updates without requiring full page reloads
   - Changes are immediately reflected in the client while SSR/ISR handles new visitors
   - Edge functions could be used for faster WebSocket connections

### Performance Optimizations

1. **Content Delivery**

   ```typescript
   // next.config.js
   module.exports = {
     images: {
       domains: [
         "oaidalleapiprodscus.blob.core.windows.net",
         "images.unsplash.com",
       ],
       formats: ["image/avif", "image/webp"],
     },
     // Additional optimizations
     compress: true,
     poweredByHeader: false,
   };
   ```

2. **Database Queries**

   - Implement connection pooling
   - Cache frequent queries

3. **API Routes**
   - Rate limiting for chat commands
   - Cache AI-generated content

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Visit `/[siteId]` to view a published site
2. Visit `/edit/[siteId]` to edit the site using chat commands
3. Available commands:
   - `change heading to [text]`
   - `change paragraph to [text]`
   - `change theme to [theme]`
   - `add image: [url] | [alt] | [caption]`
   - `ai: [prompt]`

## Testing the Application

1. **Create a New Site**

   - Visit `/edit/my-first-site` to create a new site
   - The system will generate initial AI content

2. **Test Real-time Updates**

   - Open `/my-first-site` in another tab
   - Make changes in the edit page
   - Watch updates appear instantly in both tabs

3. **Try Different Commands**

   ```bash
   # Update the heading
   change heading to Welcome to My Website

   # Update the paragraph
   change paragraph to This is my new website content

   # Change the theme
   change theme to modern

   # Add an image
   add image: https://example.com/image.jpg | My Image | A beautiful scene

   # Use AI to generate content
   ai: suggest a heading about technology
   ```

4. **Test Image Generation**
   - The system will use DALL-E for image generation
   - Falls back to predefined images if API quota is exceeded

## Deployment

### AWS Deployment Guide

This application can be deployed to AWS using S3 for static assets and CloudFront for content delivery.

1. **AWS Setup**

   ```bash
   # Install AWS CLI and configure credentials
   aws configure
   ```

2. **S3 Bucket Configuration**

   ```bash
   # Create S3 bucket
   aws s3 mb s3://your-site-bucket

   # Configure bucket for static website hosting
   aws s3 website s3://your-site-bucket \
     --index-document index.html \
     --error-document 404.html
   ```

3. **Build Process**

   ```bash
   # Build the Next.js application
   npm run build

   # Export static files (if using static export)
   next export
   ```

4. **Upload Process**

   ```bash
   # Sync build output with S3
   aws s3 sync out/ s3://your-site-bucket \
     --delete \
     --cache-control "public, max-age=31536000, immutable"
   ```

5. **CloudFront Setup**

   - Create CloudFront distribution pointing to S3 bucket
   - Configure custom domain (if needed)
   - Set up SSL certificate via ACM

6. **Cache Management**
   ```bash
   # Invalidate CloudFront cache after deployments
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DIST_ID \
     --paths "/*"
   ```

### Deployment Considerations

1. **Environment Configuration**

   ```typescript
   // next.config.js
   module.exports = {
     env: {
       OPENAI_API_KEY: process.env.OPENAI_API_KEY,
       SOCKET_URL: process.env.SOCKET_URL,
     },
   };
   ```

2. **WebSocket Deployment**

   - Deploy Socket.IO server to AWS Lambda or EC2
   - Configure API Gateway for WebSocket support
   - Update client configuration:
     ```typescript
     const socket = io(process.env.SOCKET_URL!, {
       path: "/api/socketio",
     });
     ```

3. **Database Integration**

   - Use AWS RDS or DynamoDB for persistence
   - Configure connection pooling
   - Implement caching with ElastiCache

4. **Monitoring and Scaling**
   - Set up CloudWatch metrics
   - Configure auto-scaling policies
   - Implement health checks

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to S3
        run: aws s3 sync out/ s3://your-site-bucket --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_ID }} \
            --paths "/*"
```
