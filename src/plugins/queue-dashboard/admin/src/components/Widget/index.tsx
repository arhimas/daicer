import React, { useEffect, useState } from 'react';
import { Box, Typography, Flex, Grid, Badge } from '@strapi/design-system';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';

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

const Widget = () => {
  const { get, put, post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [queues, setQueues] = useState<QueueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const { data } = await get(`/queue-dashboard/stats`);
      if (data.error) {
        setError(data.error);
        setQueues([]);
      } else if (data.queues) {
        setQueues(data.queues);
        setError(null);
      }
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((e as any).response?.data?.error?.message || (e as any).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 10 seconds for the widget to be less aggressive than the full page
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [get]);

  const _handleAction = async (
    queueName: string,
    action: 'pause' | 'resume' | 'retry' | 'clean',
    method: 'put' | 'post'
  ) => {
    try {
      const endpoint = `/queue-dashboard/${queueName}/${action}`;
      if (method === 'put') await put(endpoint);
      else await post(endpoint);

      toggleNotification({
        type: 'success',
        message: `Action ${action} triggered`,
      });
      fetchStats(); // Immediate refresh
    } catch (_error) {
      toggleNotification({
        type: 'warning',
        message: `Failed to ${action}`,
      });
    }
  };

  if (loading) return <Typography>Loading queues...</Typography>;
  if (error) return <Typography color="danger600">{error}</Typography>;
  if (queues.length === 0) return <Typography>No queues found.</Typography>;

  return (
    <Box aria-label="Queue Widget Dashboard" background="neutral0" shadow="filterShadow" padding={6} hasRadius>
      <Typography variant="delta" as="h2" marginBottom={4}>
        Queue Status
      </Typography>
      <Grid.Root gap={4}>
        {queues.map((q) => (
          <Grid.Item col={12} key={q.name}>
            {/* 
              Simplified List Item for Widget 
              Using Flex instead of Card to be more compact in the widget area
             */}
            <Box padding={4} hasRadius background="neutral100">
              <Flex justifyContent="space-between">
                <Flex gap={2}>
                  <Typography fontWeight="bold">{q.name}</Typography>
                  {q.isPaused ? <Badge>Paused</Badge> : <Badge variant="success">Running</Badge>}
                </Flex>
                <Flex gap={2}>
                  <Box title="Active" paddingRight={2}>
                    <Typography variant="pi" textColor="primary600">
                      {q.counts.active} A
                    </Typography>
                  </Box>
                  <Box title="Waiting" paddingRight={2}>
                    <Typography variant="pi" textColor="secondary600">
                      {q.counts.waiting} W
                    </Typography>
                  </Box>
                  <Box title="Failed" paddingRight={2}>
                    <Typography variant="pi" textColor="danger600">
                      {q.counts.failed} F
                    </Typography>
                  </Box>
                </Flex>
              </Flex>
            </Box>
          </Grid.Item>
        ))}
      </Grid.Root>
    </Box>
  );
};

export { Widget };
