import { createFileRoute } from '@tanstack/react-router';
import RatesPage from '../pages/RatesPage';

export const Route = createFileRoute('/rates')({
  component: RatesPage,
});
