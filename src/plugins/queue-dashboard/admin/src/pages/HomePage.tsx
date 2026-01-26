import React, { useEffect, useState } from 'react';
import { Layouts } from '@strapi/strapi/admin';
import { Typography, EmptyStateLayout, Box, Grid, Alert, Flex } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { QueueWidget } from '../components/QueueWidget';

interface JobCounts {
  active: number;
  completed: number;
  failed: number;
  waiting: number;
  delayed: number;
}

interface QueueData {
  name: string;
  counts: JobCounts;
  isPaused: boolean;
}

const HomePage = () => {
  const { get } = useFetchClient();
  const [queues, setQueues] = useState<QueueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      // Clear error on retry if successful
      const { data } = await get(`/queue-dashboard/stats`);
      
      if (data.error) {
        setError(data.error);
        setQueues([]);
      } else if (data.queues) {
        setQueues(data.queues);
        setError(null);
      }
    } catch (e: unknown) {
      console.error(e);
      // Handle HTTP errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((e as any).response?.data?.error?.message || (e as any).message || 'Failed to fetch queue stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [get]);

  return (
    <Layouts.Content>
      <Box padding={8} background="neutral100">
        <Layouts.Header 
          title="Queue Dashboard" 
          subtitle="Real-time monitoring and management of background job queues." 
          as="h2" 
        />
        
        {/* Error Display */}
        {error && (
          <Box paddingBottom={4}>
            <Alert closeLabel="Close" title="Error" variant="danger" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}

        {loading && queues.length === 0 ? (
           <Flex justifyContent="center" padding={8}>
             <Typography variant="beta" textColor="neutral600">Loading Queues...</Typography>
           </Flex>
        ) : !error && queues.length === 0 ? (
          <EmptyStateLayout content="No queues active or detected." />
        ) : (
          <Grid.Root gap={5}>
            {queues.map((q) => (
              <Grid.Item col={6} s={12} key={q.name}>
                <QueueWidget stats={q} />
              </Grid.Item>
            ))}
          </Grid.Root>
        )}
      </Box>
    </Layouts.Content>
  );
};

export { HomePage };
