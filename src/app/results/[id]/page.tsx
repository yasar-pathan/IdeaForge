import { ResultsDashboard } from '@/components/results/ResultsDashboard';

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResultsDashboard sessionId={id} />;
}
