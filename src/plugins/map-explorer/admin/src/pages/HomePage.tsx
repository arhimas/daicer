import React, { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import {
  Box,
  Typography,
  Flex,
  Grid,
  Card,
  CardBody,
  CardContent,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  IconButton,
} from '@strapi/design-system';
import { ArrowClockwise, Play, Check, Cross, Duplicate } from '@strapi/icons';

const HomePage = () => {
  const { get } = useFetchClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await get('/map-explorer/forge/queue');
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!data)
    return (
      <Box padding={8}>
        <Typography variant="beta">Loading Pixel Forge Dashboard...</Typography>
      </Box>
    );

  const { counts, jobs } = data;

  return (
    <Box background="neutral100" padding={8} aria-label="Pixel Forge Dashboard">
      <Flex justifyContent="space-between" paddingBottom={6}>
        <Typography variant="alpha">Pixel Forge Control Center</Typography>
        <Button onClick={fetchData} startIcon={<ArrowClockwise />} disabled={loading}>
          Refresh
        </Button>
      </Flex>

      {/* Metrics */}
      <Grid.Root gap={4} paddingBottom={6}>
        <Grid.Item col={3} s={6}>
          <Card>
            <CardBody>
              <CardContent>
                <Flex justifyContent="space-between">
                  <Typography variant="sigma" textColor="neutral600">
                    ACTIVE
                  </Typography>
                  <Play />
                </Flex>
                <Typography variant="alpha">{counts?.active || 0}</Typography>
              </CardContent>
            </CardBody>
          </Card>
        </Grid.Item>
        <Grid.Item col={3} s={6}>
          <Card>
            <CardBody>
              <CardContent>
                <Flex justifyContent="space-between">
                  <Typography variant="sigma" textColor="neutral600">
                    WAITING
                  </Typography>
                  <Typography variant="epsilon">...</Typography>
                </Flex>
                <Typography variant="alpha">{counts?.waiting || 0}</Typography>
              </CardContent>
            </CardBody>
          </Card>
        </Grid.Item>
        <Grid.Item col={3} s={6}>
          <Card>
            <CardBody>
              <CardContent>
                <Flex justifyContent="space-between">
                  <Typography variant="sigma" textColor="neutral600">
                    COMPLETED
                  </Typography>
                  <Check />
                </Flex>
                <Typography variant="alpha" textColor="success600">
                  {counts?.completed || 0}
                </Typography>
              </CardContent>
            </CardBody>
          </Card>
        </Grid.Item>
        <Grid.Item col={3} s={6}>
          <Card>
            <CardBody>
              <CardContent>
                <Flex justifyContent="space-between">
                  <Typography variant="sigma" textColor="neutral600">
                    FAILED
                  </Typography>
                  <Cross />
                </Flex>
                <Typography variant="alpha" textColor="danger600">
                  {counts?.failed || 0}
                </Typography>
              </CardContent>
            </CardBody>
          </Card>
        </Grid.Item>
      </Grid.Root>

      {/* Active Jobs List */}
      <Box background="neutral0" shadow="filterShadow" padding={6} hasRadius>
        <Typography variant="beta" paddingBottom={4}>
          Active / Recent Jobs
        </Typography>
        <Table colCount={5} rowCount={10}>
          <Thead>
            <Tr>
              <Th>
                <Typography variant="sigma">ID</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Prompt</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Type</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Status</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Actions</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* Active */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {jobs.active.map((j: any) => (
              <Tr key={j.id}>
                <Td>
                  <Typography textColor="neutral800">#{j.id}</Typography>
                </Td>
                <Td>
                  <Typography>{j.data.prompt || 'No Prompt'}</Typography>
                </Td>
                <Td>
                  <Badge>{j.data.type || 'Unknown'}</Badge>
                </Td>
                <Td>
                  <Badge active>Processing ({j.progress}%)</Badge>
                </Td>
                <Td>
                  <IconButton
                    label="Copy Job Payload"
                    icon={<Duplicate />}
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(j.data, null, 2))}
                  />
                </Td>
              </Tr>
            ))}
            {/* Waiting */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {jobs.waiting.map((j: any) => (
              <Tr key={j.id}>
                <Td>
                  <Typography textColor="neutral800">#{j.id}</Typography>
                </Td>
                <Td>
                  <Typography>{j.data.prompt}</Typography>
                </Td>
                <Td>
                  <Badge>{j.data.type}</Badge>
                </Td>
                <Td>
                  <Badge>Queued</Badge>
                </Td>
                <Td>
                  <IconButton
                    label="Copy Job Payload"
                    icon={<Duplicate />}
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(j.data, null, 2))}
                  />
                </Td>
              </Tr>
            ))}
            {/* Failed */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {jobs.failed.map((j: any) => (
              <Tr key={j.id}>
                <Td>
                  <Typography textColor="neutral800">#{j.id}</Typography>
                </Td>
                <Td>
                  <Typography>{j.data.prompt}</Typography>
                </Td>
                <Td>
                  <Badge>{j.data.type}</Badge>
                </Td>
                <Td>
                  <Typography textColor="danger600">Failed: {j.failedReason}</Typography>
                </Td>
                <Td>
                  <IconButton
                    label="Copy Failed Job Data"
                    icon={<Duplicate />}
                    onClick={() => {
                      const debugInfo = {
                        id: j.id,
                        payload: j.data,
                        error: j.failedReason,
                        stack: j.stacktrace,
                      };
                      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
                    }}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {jobs.active.length === 0 && jobs.waiting.length === 0 && jobs.failed.length === 0 && (
          <Box padding={4} textAlign="center">
            <Typography variant="pi" textColor="neutral600">
              No active jobs. Use the Content Manager to generate sprites.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export { HomePage };
