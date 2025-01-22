import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

const { AWS_BUCKET_NAME, AWS_CLOUDFRONT_ID } = process.env;

if (!AWS_BUCKET_NAME || !AWS_CLOUDFRONT_ID) {
  console.error("Missing required AWS configuration");
  process.exit(1);
}

try {
  console.log(`Uploading to S3 bucket: ${AWS_BUCKET_NAME}...`);
  execSync(
    `aws s3 sync out/ s3://${AWS_BUCKET_NAME} --delete --cache-control "public, max-age=31536000, immutable"`,
    { stdio: "inherit" }
  );

  console.log("Invalidating CloudFront cache...");
  execSync(
    `aws cloudfront create-invalidation --distribution-id ${AWS_CLOUDFRONT_ID} --paths "/*"`,
    { stdio: "inherit" }
  );

  console.log("Deployment completed successfully!");
} catch (error) {
  console.error("Deployment failed:", error);
  process.exit(1);
}
