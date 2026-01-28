import { createFileRoute } from '@tanstack/react-router';
import PricingAssistantPage from '../pages/PricingAssistantPage';

export const Route = createFileRoute('/pricing-assistant')({
  component: PricingAssistantPage,
});
