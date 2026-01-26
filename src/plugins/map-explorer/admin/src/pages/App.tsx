// import { Page } from '@strapi/strapi/admin'; // V4 path?
import { Routes, Route } from 'react-router-dom';
import { DesignSystemProvider } from '@strapi/design-system';

const NotFound = () => <div>Page Not Found</div>;

import { HomePage } from './HomePage';

const App = () => {
  return (
    <DesignSystemProvider locale="en">
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DesignSystemProvider>
  );
};

export { App };


