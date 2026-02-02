import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardBody,
  Badge,
  Flex,
  ProgressBar,
  Button,
  Modal,
  Grid,
  IconButton,
} from '@strapi/design-system';

// I will implement a "JobDetailsModal" subcomponent in the same file to keep it self-contained.

import { Play, Cross, Trash } from '@strapi/icons';
import { useFetchClient, useNotification } from '@strapi/admin/strapi-admin';

interface Job {
  id: string;
  name: string;
  data: unknown;
  timestamp: number;
  failedReason?: string;
  stacktrace?: string[];
  progress: number;
  finishedOn?: number;
  processedOn?: number;
  returnvalue?: unknown;
}

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
  jobs?: {
    active: Job[];
    waiting: Job[];
    failed: Job[];
    completed?: Job[]; // Added
  };
  settings?: {
    concurrency?: number;
    rateLimit?: number;
    running?: boolean;
  };
}

const JobDetailsModal = ({
  jobs,
  type,
  onClose,
}: {
  jobs: Job[];
  type: 'active' | 'waiting' | 'failed' | 'completed';
  onClose: () => void;
}) => {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  return (
    <Modal.Root open={true} onOpenChange={onClose}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>{type.toUpperCase()} Jobs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {jobs.length === 0 ? (
            <Typography>No jobs found.</Typography>
          ) : (
            <Flex direction="column" gap={4} alignItems="stretch">
              {jobs.map((job) => (
                <Box
                  key={job.id}
                  padding={4}
                  background="neutral100"
                  hasRadius
                  borderColor={expandedJob === job.id ? 'primary600' : 'neutral200'}
                >
                  <Flex
                    justifyContent="space-between"
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    cursor="pointer"
                  >
                    <Flex gap={2}>
                      <Typography fontWeight="bold">#{job.id}</Typography>
                      <Typography variant="pi">
                        {new Date(job.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Flex>
                    <Typography variant="pi">{job.name}</Typography>
                  </Flex>

                  {expandedJob === job.id && (
                    <Box
                      paddingTop={4}
                      marginTop={4}
                      borderStyle="solid"
                      borderTopWidth="1px"
                      borderColor="neutral200"
                    >
                      {job.failedReason && (
                        <Box paddingBottom={2}>
                          <Typography textColor="danger600" fontWeight="bold">
                            Error: {job.failedReason}
                          </Typography>
                        </Box>
                      )}
                      {job.finishedOn && (
                        <Box paddingBottom={2}>
                          <Typography variant="pi" textColor="success600">
                            Finished: {new Date(job.finishedOn).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="sigma" textColor="neutral600">
                        Payload:
                      </Typography>
                      <Box
                        background="neutral0"
                        padding={2}
                        hasRadius
                        style={{ overflow: 'auto', maxHeight: '200px' }}
                      >
                        <pre style={{ fontSize: '10px' }}>{JSON.stringify(job.data, null, 2)}</pre>
                      </Box>
                      {job.returnvalue && (
                        <>
                          <Box paddingTop={4}>
                            <Typography variant="sigma" textColor="neutral600">
                              Result / Response:
                            </Typography>
                          </Box>
                          <Box
                            background="neutral0"
                            padding={2}
                            hasRadius
                            style={{ overflow: 'auto', maxHeight: '200px', marginTop: '4px' }}
                          >
                            <pre style={{ fontSize: '10px' }}>
                              {JSON.stringify(job.returnvalue, null, 2)}
                            </pre>
                          </Box>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Flex>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose} variant="tertiary">
            Close
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export const QueueWidget = ({ stats }: { stats: QueueStats }) => {
  const { put, post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [inspectType, setInspectType] = useState<
    'active' | 'waiting' | 'failed' | 'completed' | null
  >(null);

  const total =
    stats.counts.active + stats.counts.completed + stats.counts.failed + stats.counts.waiting;
  const progress = total > 0 ? (stats.counts.completed / total) * 100 : 0;

  const handleAction = async (
    action: 'pause' | 'resume' | 'retry' | 'clean',
    method: 'put' | 'post'
  ) => {
    setIsLoading(true);
    try {
      const endpoint = `/queue-dashboard/${stats.name}/${action}`;
      if (method === 'put') await put(endpoint);
      else await post(endpoint);

      toggleNotification({
        type: 'success',
        message: `Action ${action} triggered for ${stats.name}`,
      });
    } catch (_error) {
      toggleNotification({
        type: 'warning',
        message: `Failed to ${action} ${stats.name}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card style={{ height: '100%' }}>
        <CardBody>
          <Box padding={6}>
            {/* Header: Name and Status */}
            <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
              <Flex direction="column" alignItems="start" gap={1}>
                <Typography variant="delta" fontWeight="bold">
                  {stats.name}
                </Typography>
                {stats.settings && (
                  <Flex gap={2}>
                    <Typography variant="pi" textColor="neutral600">
                      Concurrency: {stats.settings.concurrency ?? 1}
                    </Typography>
                    {stats.settings.rateLimit && (
                      <Typography variant="pi" textColor="neutral600">
                        | Rate: {stats.settings.rateLimit}/s
                      </Typography>
                    )}
                  </Flex>
                )}
              </Flex>
              <Flex gap={2}>
                {stats.isPaused ? <Badge>Paused</Badge> : <Badge variant="success">Running</Badge>}
              </Flex>
            </Flex>

            {/* Stats Grid - "Colorful Blocks" */}
            <Grid.Root gap={4} marginBottom={6}>
              <Grid.Item col={3}>
                <Box
                  padding={4}
                  background="primary100"
                  hasRadius
                  shadow="filterShadow"
                  cursor="pointer"
                  onClick={() => setInspectType('active')}
                >
                  <Flex direction="column" alignItems="center" gap={1}>
                    <Typography variant="alpha" textColor="primary600" fontWeight="bold">
                      {stats.counts.active}
                    </Typography>
                    <Typography variant="sigma" textColor="primary600">
                      ACTIVE
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
              <Grid.Item col={3}>
                <Box
                  padding={4}
                  background="warning100"
                  hasRadius
                  shadow="filterShadow"
                  cursor="pointer"
                  onClick={() => setInspectType('waiting')}
                >
                  <Flex direction="column" alignItems="center" gap={1}>
                    <Typography variant="alpha" textColor="warning700" fontWeight="bold">
                      {stats.counts.waiting}
                    </Typography>
                    <Typography variant="sigma" textColor="warning700">
                      WAITING
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
              <Grid.Item col={3}>
                <Box
                  padding={4}
                  background="danger100"
                  hasRadius
                  shadow="filterShadow"
                  cursor="pointer"
                  onClick={() => setInspectType('failed')}
                >
                  <Flex direction="column" alignItems="center" gap={1}>
                    <Typography variant="alpha" textColor="danger600" fontWeight="bold">
                      {stats.counts.failed}
                    </Typography>
                    <Typography variant="sigma" textColor="danger600">
                      FAILED
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
              <Grid.Item col={3}>
                <Box
                  padding={4}
                  background="success100"
                  hasRadius
                  shadow="filterShadow"
                  cursor="pointer"
                  onClick={() => setInspectType('completed')}
                >
                  <Flex direction="column" alignItems="center" gap={1}>
                    <Typography variant="alpha" textColor="success600" fontWeight="bold">
                      {stats.counts.completed}
                    </Typography>
                    <Typography variant="sigma" textColor="success600">
                      DONE
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
            </Grid.Root>

            <Box marginBottom={6}>
              <Flex justifyContent="space-between" marginBottom={2}>
                <Typography variant="pi" textColor="neutral600" fontWeight="bold">
                  SUCCESS RATE
                </Typography>
                <Typography variant="pi" textColor="neutral600">
                  {Math.round(progress)}% ({stats.counts.completed} completed)
                </Typography>
              </Flex>
              <ProgressBar value={progress} size="S" />
            </Box>

            <Flex
              gap={2}
              justifyContent="space-between"
              borderTop={1}
              borderColor="neutral150"
              paddingTop={4}
            >
              <Flex gap={2}>
                {stats.isPaused ? (
                  <Button
                    startIcon={<Play />}
                    onClick={() => handleAction('resume', 'put')}
                    disabled={isLoading}
                    variant="default"
                    size="S"
                  >
                    Resume
                  </Button>
                ) : (
                  <Button
                    startIcon={<Cross />}
                    onClick={() => handleAction('pause', 'put')}
                    disabled={isLoading}
                    variant="secondary"
                    size="S"
                  >
                    Pause
                  </Button>
                )}
              </Flex>

              <Flex gap={2}>
                <IconButton
                  label="Retry Failed"
                  onClick={() => handleAction('retry', 'post')}
                  disabled={isLoading || stats.counts.failed === 0}
                  variant="ghost"
                >
                  <Play />
                </IconButton>
                <IconButton
                  label="Cleaner Queue"
                  onClick={() => handleAction('clean', 'post')}
                  variant="ghost"
                  disabled={isLoading}
                >
                  <Trash />
                </IconButton>
              </Flex>
            </Flex>
          </Box>
        </CardBody>
      </Card>

      {inspectType && stats.jobs && (
        <JobDetailsModal
          type={inspectType}
          jobs={stats.jobs[inspectType] || []}
          onClose={() => setInspectType(null)}
        />
      )}
    </>
  );
};
