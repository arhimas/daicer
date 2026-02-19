import { describe, it, expect, vi, beforeEach } from 'vitest';
import controller from "../forge-controller";

describe('ForgeController', () => {
    let strapi: any;
    let forgeController: any;
    let mockQueueService: any;
    let mockContext: any;

    beforeEach(() => {
        mockQueueService = {
            addBlueprintJob: vi.fn(),
            addPixelJob: vi.fn(),
            getJob: vi.fn(),
            getQueueSummary: vi.fn(),
        };

        strapi = {
            plugin: vi.fn().mockReturnValue({
                service: vi.fn().mockImplementation((name) => {
                    if (name === 'queueService') return mockQueueService;
                    return null;
                })
            })
        };

        forgeController = controller({ strapi });
        
        mockContext = {
            request: { body: {} },
            params: {},
            body: null,
            throw: vi.fn(),
            notFound: vi.fn(),
        };
    });

    describe('dispatch', () => {
        it('should dispatch blueprint job', async () => {
            mockContext.request.body = { type: 'Blueprint', prompt: 'test' };
            mockQueueService.addBlueprintJob.mockResolvedValue({ id: 'job-1' });

            await forgeController.dispatch(mockContext);
            
            expect(mockQueueService.addBlueprintJob).toHaveBeenCalledWith(expect.objectContaining({
                prompt: 'test',
                type: 'Blueprint'
            }));
            expect(mockContext.body).toEqual({ jobId: 'job-1', status: 'queued' });
        });

        it('should dispatch pixel job', async () => {
            mockContext.request.body = { type: 'Pixel', inputPixels: [] };
            mockQueueService.addPixelJob.mockResolvedValue({ id: 'job-2' });

            await forgeController.dispatch(mockContext);

            expect(mockQueueService.addPixelJob).toHaveBeenCalledWith(expect.objectContaining({
                type: 'Pixel'
            }));
            expect(mockContext.body).toEqual({ jobId: 'job-2', status: 'queued' });
        });

        it('should handle errors', async () => {
             mockContext.request.body = { type: 'Blueprint' };
             mockQueueService.addBlueprintJob.mockRejectedValue(new Error('Queue Error'));
             
             await forgeController.dispatch(mockContext);
             
             expect(mockContext.throw).toHaveBeenCalledWith(500, expect.any(Error));
        });
    });

    describe('status', () => {
        it('should return job status', async () => {
            mockContext.params = { jobId: 'job-1' };
            const mockJob = {
                id: 'job-1',
                getState: vi.fn().mockResolvedValue('completed'),
                returnvalue: { result: 'data' },
                progress: 100
            };
            mockQueueService.getJob.mockResolvedValue(mockJob);

            await forgeController.status(mockContext);
            
            expect(mockQueueService.getJob).toHaveBeenCalledWith('job-1');
            expect(mockContext.body).toEqual({
                id: 'job-1',
                state: 'completed',
                result: { result: 'data' },
                progress: 100
            });
        });

        it('should return 404 if job not found', async () => {
            mockContext.params = { jobId: 'invalid' };
            mockQueueService.getJob.mockResolvedValue(null);

            await forgeController.status(mockContext);

            expect(mockContext.notFound).toHaveBeenCalledWith('Job not found');
        });
    });

    describe('list', () => {
        it('should return queue summary', async () => {
            const summary = { active: 1, waiting: 0 };
            mockQueueService.getQueueSummary.mockResolvedValue(summary);

            await forgeController.list(mockContext);
            
            expect(mockQueueService.getQueueSummary).toHaveBeenCalled();
            expect(mockContext.body).toEqual(summary);
        });
    });
});
