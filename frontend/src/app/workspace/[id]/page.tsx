import { WorkspaceClient } from '@/frontend/components/workspace/WorkspaceClient';

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkspaceClient sessionId={id} />;
}
