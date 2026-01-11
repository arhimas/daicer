import type { ReactNode } from 'react';

import { ApolloProvider } from '@apollo/client/react';
import { I18nProvider } from '../i18n';
import { Toaster } from '../components/ui/sonner';

import { apolloClient } from '../lib/apollo';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <I18nProvider>
        {children}
        <Toaster />
      </I18nProvider>
    </ApolloProvider>
  );
}
