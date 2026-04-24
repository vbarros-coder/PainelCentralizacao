'use client';

import { UserManagementPanel } from '@/features/auth/user-management-panel';
import { useAuth } from '@/features/auth/auth-context';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function GerenciarPage() {
  const { user, canAccessManagePanel, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !canAccessManagePanel()) {
      redirect('/dashboard');
    }
  }, [user, isLoading, canAccessManagePanel]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0055A4]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <UserManagementPanel />
    </div>
  );
}
