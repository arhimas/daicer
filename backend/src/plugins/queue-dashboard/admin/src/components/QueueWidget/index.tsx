
import React from 'react';
import { Box, Typography, Card, CardBody, Badge, Flex, ProgressBar } from '@strapi/design-system';

interface QueueStats {
  name: string;
  counts: {
    active: number;
    completed: number;
    failed: number;
    waiting: number;
    delayed: number;
  };
  isPaused: boolean;
}

export const QueueWidget = ({ stats }: { stats: QueueStats }) => {
  const total = stats.counts.active + stats.counts.completed + stats.counts.failed + stats.counts.waiting;
  const progress = total > 0 ? (stats.counts.completed / total) * 100 : 0;

  return (
    <Card style={{ height: '100%' }}>
      <CardBody>
        <Box padding={4}>
          <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
            <Typography variant="delta" fontWeight="bold">{stats.name}</Typography>
            {stats.isPaused ? (
               <Badge>Paused</Badge>
            ) : (
               <Badge variant="success">Running</Badge>
            )}
          </Flex>
          
          <Flex gap={4} marginBottom={4} wrap="wrap">
            <Box>
                <Typography variant="pi" textColor="neutral600">Active</Typography>
                <Typography variant="beta" textColor="primary600">{stats.counts.active}</Typography>
            </Box>
             <Box>
                <Typography variant="pi" textColor="neutral600">Waiting</Typography>
                <Typography variant="beta" textColor="secondary600">{stats.counts.waiting}</Typography>
            </Box>
             <Box>
                <Typography variant="pi" textColor="neutral600">Failed</Typography>
                <Typography variant="beta" textColor="danger600">{stats.counts.failed}</Typography>
            </Box>
          </Flex>
          
          <Box>
            <Flex justifyContent="space-between" marginBottom={1}>
                <Typography variant="small" textColor="neutral600">Success Rate</Typography>
                <Typography variant="small" textColor="neutral600">{Math.round(progress)}%</Typography>
            </Flex>
            <ProgressBar value={progress} size="S" />
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
};
