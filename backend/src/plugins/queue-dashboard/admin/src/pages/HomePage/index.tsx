
import React, { useEffect, useState } from 'react';
import { Layout, ContentLayout, HeaderLayout } from '@strapi/design-system';
import { Typography, EmptyStateLayout, Box, Grid, GridItem } from '@strapi/design-system';
import { useFetchClient, Page } from '@strapi/strapi/admin';
import { QueueWidget } from '../../components/QueueWidget';
import { PLUGIN_ID } from '../../pluginId';
import pluginPermissions from '../../permissions';

const HomePage = () => {
  const { get } = useFetchClient();
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await get(`/${PLUGIN_ID}/stats`);
      if (data && data.queues) {
        setQueues(data.queues);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Page.Protect permissions={pluginPermissions.read}>
      <Layout>
        <HeaderLayout 
          title="Queue Dashboard" 
          subtitle="Real-time monitoring of job queues" 
          as="h2" 
        />
        <ContentLayout>
           {loading && queues.length === 0 ? (
               <Box padding={8}><Typography>Loading...</Typography></Box>
           ) : queues.length === 0 ? (
               <EmptyStateLayout content="No queues active or detected." />
           ) : (
               <Grid gap={5}>
                  {queues.map((q: any) => (
                      <GridItem col={4} s={12} key={q.name}>
                          <QueueWidget stats={q} />
                      </GridItem>
                  ))}
               </Grid>
           )}
        </ContentLayout>
      </Layout>
    </Page.Protect>
  );
};

export default HomePage;
