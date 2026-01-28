import { createFileRoute } from '@tanstack/react-router';
import DocumentEditorPage from '../pages/DocumentEditorPage';

export const Route = createFileRoute('/documents/$documentId')({
  component: DocumentEditorPage,
});
