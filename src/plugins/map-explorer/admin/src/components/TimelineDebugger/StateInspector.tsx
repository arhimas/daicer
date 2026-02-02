import React from 'react';
import { Box, Typography } from '@strapi/design-system';

interface StateInspectorProps {
  data: unknown;
}

export const StateInspector = ({ data }: StateInspectorProps) => {
  return (
    <Box
      background="neutral0"
      hasRadius
      shadow="filterShadow"
      padding={4}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <Typography variant="delta" tag="h3" marginBottom={4}>
        Inspector
      </Typography>

      {data ? (
        <pre
          style={{
            fontSize: '12px',
            background: '#f6f6f6',
            padding: '1rem',
            borderRadius: '4px',
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <Typography variant="pi" textColor="neutral600">
          Select an event to inspect details.
        </Typography>
      )}
    </Box>
  );
};
