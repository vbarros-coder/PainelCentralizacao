/**
 * Home Page
 * Redireciona para login ou dashboard
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirecionar para login
  redirect('/login');
}
