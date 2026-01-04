import { Outlet } from 'react-router-dom';
import JuicyLayout from '@/components/layout/JuicyLayout';
// import { gildedTokens } from '@/theme/gildedTokens'; // Handled by JuicyLayout now
// import cn from '@/lib/utils'; // Handled by JuicyLayout now

export function RulesExplorerLayout() {
  return (
    <JuicyLayout showNavbar className="bg-midnight-950" mainClassName="relative min-h-[calc(100vh-4.5rem)]">
      {/* Content Container - with padding for the fixed breadcrumb rail */}
      <div className="mx-auto max-w-[1400px] p-6 sm:p-8 lg:p-10">
        <Outlet />
      </div>
    </JuicyLayout>
  );
}
