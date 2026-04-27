/**
 * Dashboard Layout
 * Layout com Sidebar e Topbar
 */

'use client';

import { useState } from 'react';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { AddvaluChat } from '@/features/ai/addvalu-chat';
import { ProjectsProvider } from '@/features/projects/projects-context';
import { cn } from '@/lib/utils';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          isSidebarCollapsed ? "pl-20" : "pl-72"
        )}
      >
        <Topbar isSidebarCollapsed={isSidebarCollapsed} />

        <main className="flex-1 pt-16 bg-background">{children}</main>
      </div>

      {/* Addvalu IA - Assistente Virtual */}
      <AddvaluChat />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ProjectsProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </ProjectsProvider>
    </ProtectedRoute>
  );
}
