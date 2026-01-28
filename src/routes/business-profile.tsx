import { createFileRoute } from '@tanstack/react-router';
import BusinessProfilePage from '../pages/BusinessProfilePage';

export const Route = createFileRoute('/business-profile')({
  component: BusinessProfilePage,
});
