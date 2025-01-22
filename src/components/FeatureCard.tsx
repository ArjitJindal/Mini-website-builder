interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-soft">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-secondary-800 mb-2">{title}</h3>
      <p className="text-secondary-600">{description}</p>
    </div>
  );
}
