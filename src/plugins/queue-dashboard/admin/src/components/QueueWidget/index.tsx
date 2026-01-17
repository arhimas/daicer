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
  Grid
} from '@strapi/design-system';

// I will implement a "JobDetailsModal" subcomponent in the same file to keep it self-contained.

import { Play, Cross, Trash } from '@strapi/icons';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';

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
  };
}

const JobDetailsModal = ({ 
  jobs, 
  type, 
  onClose 
}: { 
  jobs: Job[], 
  type: 'active' | 'waiting' | 'failed', 
  onClose: () => void 
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
               {jobs.map(job => (
                 <Box key={job.id} padding={4} background="neutral100" hasRadius borderColor={expandedJob === job.id ? 'primary600' : 'neutral200'}>
                    <Flex justifyContent="space-between" onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)} cursor="pointer">
                      <Flex gap={2}>
                        <Typography fontWeight="bold">#{job.id}</Typography>
                        <Typography variant="pi">{new Date(job.timestamp).toLocaleTimeString()}</Typography>
                      </Flex>
                      <Typography variant="pi">{job.name}</Typography>
                    </Flex>
                    
                    {expandedJob === job.id && (
                      <Box paddingTop={4} marginTop={4} borderStyle="solid" borderTopWidth="1px" borderColor="neutral200">
                         {job.failedReason && (
                           <Box paddingBottom={2}>
                             <Typography textColor="danger600" fontWeight="bold">Error: {job.failedReason}</Typography>
                           </Box>
                         )}
                         <Typography variant="sigma" textColor="neutral600">Payload:</Typography>
                         <Box background="neutral0" padding={2} hasRadius style={{overflow: 'auto', maxHeight: '200px'}}>
                           <pre style={{fontSize: '10px'}}>{JSON.stringify(job.data, null, 2)}</pre>
                         </Box>
                      </Box>
                    )}
                 </Box>
               ))}
            </Flex>
          )}
        </Modal.Body>
        <Modal.Footer>
           <Button onClick={onClose} variant="tertiary">Close</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export const QueueWidget = ({ stats }: { stats: QueueStats }) => {
  const { put, post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [inspectType, setInspectType] = useState<'active' | 'waiting' | 'failed' | null>(null);

  const total = stats.counts.active + stats.counts.completed + stats.counts.failed + stats.counts.waiting;
  const progress = total > 0 ? (stats.counts.completed / total) * 100 : 0;
  
  // Custom "Circular" approximation using standard Badge/Box radius?
  // No, I'll stick to a clean Block layout as requested "colorful blocks".
  
  const handleAction = async (action: 'pause' | 'resume' | 'retry' | 'clean', method: 'put' | 'post') => {
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
          <Box padding={4}>
            <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
              <Typography variant="delta" fontWeight="bold">
                {stats.name}
              </Typography>
              {stats.isPaused ? <Badge>Paused</Badge> : <Badge variant="success">Running</Badge>}
            </Flex>

            {/* Stats Grid - "Colorful Blocks" */}
            <Grid.Root gap={2} marginBottom={6}>
              <Grid.Item col={4}>
                 <Box 
                   padding={3} 
                   background="primary100" 
                   hasRadius 
                   borderColor="primary200"
                   cursor="pointer"
                   onClick={() => setInspectType('active')}
                 >
                    <Flex direction="column" alignItems="start">
                       <Typography variant="alpha" textColor="primary600">{stats.counts.active}</Typography>
                       <Typography variant="pi" textColor="primary600" fontWeight="bold">ACTIVE</Typography>
                    </Flex>
                 </Box>
              </Grid.Item>
              <Grid.Item col={4}>
                 <Box 
                   padding={3} 
                   background="secondary100" 
                   hasRadius 
                   borderColor="secondary200"
                   cursor="pointer"
                   onClick={() => setInspectType('waiting')}
                 >
                    <Flex direction="column" alignItems="start">
                       <Typography variant="alpha" textColor="secondary600">{stats.counts.waiting}</Typography>
                       <Typography variant="pi" textColor="secondary600" fontWeight="bold">WAITING</Typography>
                    </Flex>
                 </Box>
              </Grid.Item>
              <Grid.Item col={4}>
                 <Box 
                   padding={3} 
                   background="danger100" 
                   hasRadius 
                   borderColor="danger200"
                   cursor="pointer"
                   onClick={() => setInspectType('failed')}
                 >
                    <Flex direction="column" alignItems="start">
                       <Typography variant="alpha" textColor="danger600">{stats.counts.failed}</Typography>
                       <Typography variant="pi" textColor="danger600" fontWeight="bold">FAILED</Typography>
                    </Flex>
                 </Box>
              </Grid.Item>
            </Grid.Root>

            <Box marginBottom={6}>
              <Flex justifyContent="space-between" marginBottom={1}>
                <Typography variant="small" textColor="neutral600">
                  Success Rate
                </Typography>
                <Typography variant="small" textColor="neutral600">
                  {Math.round(progress)}%
                </Typography>
              </Flex>
              <ProgressBar value={progress} size="S" />
            </Box>

            <Flex gap={2} justifyContent="flex-end" wrap="wrap">
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
              
              <Button 
                startIcon={<Play />} 
                onClick={() => handleAction('retry', 'post')} 
                disabled={isLoading || stats.counts.failed === 0} 
                variant="ghost"
                size="S"
              >
                Retry
              </Button>

              <Button 
                startIcon={<Trash />} 
                onClick={() => handleAction('clean', 'post')}
                variant="danger-light" 
                disabled={isLoading}
                size="S"
              >
                Clean
              </Button>
            </Flex>
          </Box>
        </CardBody>
      </Card>

      {inspectType && stats.jobs && (
        <JobDetailsModal 
          type={inspectType} 
          jobs={stats.jobs[inspectType]} 
          onClose={() => setInspectType(null)} 
        />
      )}
    </>
  );
};
