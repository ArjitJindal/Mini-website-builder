import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { FeatureCard } from "../components/FeatureCard";

export default function Home() {
  const router = useRouter();
  const [siteId, setSiteId] = useState("");

  const handleCreateSite = () => {
    if (!siteId.trim()) return;
    router.push(`/edit/${siteId}`);
  };

  return (
    <>
      <Head>
        <title>Chat-Driven Website Builder</title>
        <meta
          name="description"
          content="Build websites through chat commands"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-secondary-900 mb-6">
              Chat-Driven Website Builder
            </h1>
            <p className="text-xl text-secondary-600 mb-12">
              Create and edit websites using simple chat commands. Type
              naturally, and watch your site transform in real-time.
            </p>

            <div className="bg-white rounded-2xl shadow-soft p-8 mb-12">
              <h2 className="text-2xl font-semibold text-secondary-800 mb-6">
                Start Building
              </h2>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="text"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  placeholder="Enter your site name"
                  className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === "Enter" && handleCreateSite()}
                />
                <button
                  onClick={handleCreateSite}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Simple Commands"
                description="Use natural language to edit your website. No coding required."
                icon="💬"
              />
              <FeatureCard
                title="Real-time Updates"
                description="See your changes instantly as you type commands."
                icon="⚡"
              />
              <FeatureCard
                title="Easy Sharing"
                description="Share your site with others using a simple URL."
                icon="🔗"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
