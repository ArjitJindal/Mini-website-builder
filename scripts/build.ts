import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

try {
  execSync("rm -rf .next out", { stdio: "inherit" });

  console.log("Building Next.js application...");
  execSync("next build", { stdio: "inherit" });

  console.log("Exporting static files...");
  execSync("next export", { stdio: "inherit" });

  console.log("Build completed successfully!");
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}
