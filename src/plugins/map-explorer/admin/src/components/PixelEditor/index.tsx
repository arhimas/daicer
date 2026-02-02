import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Flex, Typography, Modal, Grid } from '@strapi/design-system';

interface PixelEditorProps {
  initialPixels?: string[][]; // 32x32
  baseColor: string;
  onSave: (pixels: string[][]) => void;
  onClose: () => void;
}

export const PixelEditor = ({ initialPixels, baseColor, onSave, onClose }: PixelEditorProps) => {
  // Initialize 32x32 grid
  const [pixels, setPixels] = useState<string[][]>(() => {
    if (initialPixels && initialPixels.length === 32 && initialPixels[0].length === 32) {
      return JSON.parse(JSON.stringify(initialPixels));
    }
    const grid = [];
    for (let y = 0; y < 32; y++) {
      const row = [];
      for (let x = 0; x < 32; x++) {
        row.push(baseColor);
      }
      grid.push(row);
    }
    return grid;
  });

  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const CANVAS_SIZE = 320; // 10x zoom visually
  const PIXEL_SCALE = CANVAS_SIZE / 32;

  useEffect(() => {
    draw();
  }, [pixels]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    pixels.forEach((row, y) => {
      row.forEach((color, x) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * PIXEL_SCALE, y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
      });
    });

    // Grid overlay
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 32; i++) {
      ctx.moveTo(i * PIXEL_SCALE, 0);
      ctx.lineTo(i * PIXEL_SCALE, CANVAS_SIZE);
      ctx.moveTo(0, i * PIXEL_SCALE);
      ctx.lineTo(CANVAS_SIZE, i * PIXEL_SCALE);
    }
    ctx.stroke();
  };

  const handlePaint = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 32));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 32));

    if (x >= 0 && x < 32 && y >= 0 && y < 32) {
      const newPixels = [...pixels];
      newPixels[y] = [...newPixels[y]];
      newPixels[y][x] = currentColor;
      setPixels(newPixels);
    }
  };

  const palette = [
    '#000000',
    '#ffffff',
    '#888888',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#00ffff',
    '#ff00ff',
    '#8B4513',
    '#228B22',
    '#F4A460',
  ];

  return (
    <Modal.Root onClose={onClose} defaultOpen={true}>
      <Modal.Content labelledBy="pixel-editor">
        <Modal.Header>
          <Typography fontWeight="bold" textColor="neutral800" as="h2" id="pixel-editor">
            Texture Editor (32x32)
          </Typography>
        </Modal.Header>
        <Modal.Body>
          <Flex gap={4}>
            {/* Editor Area */}
            <Box
              borderColor="neutral200"
              hasRadius
              style={{ cursor: 'crosshair', width: CANVAS_SIZE, height: CANVAS_SIZE }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onMouseDown={(e) => {
                  setIsDrawing(true);
                  handlePaint(e);
                }}
                onMouseMove={(e) => {
                  if (isDrawing) handlePaint(e);
                }}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
              />
            </Box>

            {/* Tools Area */}
            <Box>
              <Typography variant="sigma">Palette</Typography>
              <Grid.Root
                gap={2}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  width: '120px',
                  marginTop: '8px',
                }}
              >
                {palette.map((c) => (
                  <button
                    key={c}
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: c,
                      border: currentColor === c ? '2px solid white' : '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      outline: currentColor === c ? '2px solid #6666ff' : 'none',
                    }}
                    onClick={() => setCurrentColor(c)}
                  />
                ))}
                {/* Base Color Reuse */}
                <button
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: baseColor,
                    border: currentColor === baseColor ? '2px solid white' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    outline: currentColor === baseColor ? '2px solid #6666ff' : 'none',
                  }}
                  onClick={() => setCurrentColor(baseColor)}
                  title="Block Base Color"
                />
              </Grid.Root>

              <Box paddingTop={4}>
                <label>
                  <Typography variant="pi">Hex Color</Typography>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </label>
              </Box>
            </Box>
          </Flex>
        </Modal.Body>
        <Modal.Footer
          startActions={
            <Button onClick={onClose} variant="tertiary">
              Cancel
            </Button>
          }
          endActions={<Button onClick={() => onSave(pixels)}>Apply Texture</Button>}
        />
      </Modal.Content>
    </Modal.Root>
  );
};
