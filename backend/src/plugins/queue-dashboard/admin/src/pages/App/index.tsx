
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../HomePage';
import { PLUGIN_ID } from '../../pluginId';

const App = () => {
  return (
    <Routes>
      <Route path={`/plugins/${PLUGIN_ID}`} element={<HomePage />} />
    </Routes>
  );
};

export default App;
