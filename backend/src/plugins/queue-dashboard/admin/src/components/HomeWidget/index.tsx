
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardBody, Flex, Badge, Link, Grid, GridItem } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { ArrowRight, Apps } from '@strapi/icons'; // Apps icon as generic queue icon
import { PLUGIN_ID } from '../../pluginId';
import { useNavigate } from 'react-router-dom';

const HomeWidget = () => {
  const { get } = useFetchClient();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
        try {
            // Fetch directly from the plugin's admin route
            const { data } = await get(`/${PLUGIN_ID}/stats`);
            if (data && data.queues) {
                const totalActive = data.queues.reduce((acc: number, q: any) => acc + q.counts.active, 0);
                const totalFailed = data.queues.reduce((acc: number, q: any) => acc + q.counts.failed, 0);
                const totalWaiting = data.queues.reduce((acc: number, q: any) => acc + q.counts.waiting, 0);
                setStats({ totalActive, totalFailed, totalWaiting, queueCount: data.queues.length });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    fetchStats();
  }, []);

  // if (loading) return <Box padding={4}><Typography>Loading Request Stats...</Typography></Box>;
  
  return (
    <Box paddingBottom={4} col={6} s={12}>
        <Card>
          <CardBody>
             {loading && <Typography>Loading Queue Stats...</Typography>}
             {!loading && !stats && <Typography>No Queue Stats Available (Check Console)</Typography>}
             {stats && (
                 <>

            <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
                <Flex gap={2}>
                    <Apps />
                    <Typography variant="beta" fontWeight="bold">Queue Dashboard</Typography>
                </Flex>
                <Badge>{stats.queueCount} Queues</Badge>
            </Flex>
            
            <Grid gap={4}>
                <GridItem col={4} s={12}>
                    <Box background="primary100" padding={2} hasRadius>
                        <Typography variant="pi" textColor="primary600" fontWeight="bold">Active</Typography>
                        <Typography variant="alpha" textColor="primary700">{stats.totalActive}</Typography>
                    </Box>
                </GridItem>
                <GridItem col={4} s={12}>
                     <Box background="secondary100" padding={2} hasRadius>
                        <Typography variant="pi" textColor="secondary600" fontWeight="bold">Waiting</Typography>
                         <Typography variant="alpha" textColor="secondary700">{stats.totalWaiting}</Typography>
                    </Box>
                </GridItem>
                <GridItem col={4} s={12}>
                     <Box background="danger100" padding={2} hasRadius>
                        <Typography variant="pi" textColor="danger600" fontWeight="bold">Failed</Typography>
                         <Typography variant="alpha" textColor="danger700">{stats.totalFailed}</Typography>
                    </Box>
                </GridItem>
                </>
             )}
            
            <Box paddingTop={4}>
                {/* Dashboard link removed as we are widget-only now */}
            </Box>
          </CardBody>
        </Card>
    </Box>
  );
};

export default HomeWidget;
