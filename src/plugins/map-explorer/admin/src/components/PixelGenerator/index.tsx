import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Box, Typography, Flex } from '@strapi/design-system';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { useParams } from 'react-router-dom';
import { Magic } from '@strapi/icons';

interface PixelGeneratorInputProps {
  name: string;
  value: unknown; 
  attribute: Record<string, unknown>; 
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
}

const PixelGeneratorInput = ({ name, value: _value, attribute: _attribute, onChange }: PixelGeneratorInputProps) => {
  const { formatMessage } = useIntl();
  const { post } = useFetchClient();
  const [loading, setLoading] = useState(false);
  const [generatedPixels, setGeneratedPixels] = useState<string[][] | null>(null);

  const params = useParams<{ slug?: string; id?: string }>();
  const slug = params.slug;
  const idFromParams = params.id;
  
  // Determine model type from slug (api::entity.entity or api::item.item)
  const isEntity = slug === 'api::entity.entity';
  const isItem = slug === 'api::item.item';
  
  if (!isEntity && !isItem) {
      return (
          <Box paddingTop={2}>
             <Typography variant="pi" textColor="neutral600">
                Pixel Generator only available for Entity or Item models.
             </Typography>
          </Box>
      );
  }

  const handleGenerate = async () => {
      // Check if we have a valid ID (not create mode)
      const currentId = idFromParams;
      
      if (!currentId || currentId === 'create') {
           alert('Please save the entry first before generating pixel art.');
           return;
      }

      setLoading(true);
      try {
          const model = isEntity ? 'entity' : 'item';
          
          const { data } = await post('/map-explorer/generate-pixel-art', {
              id: currentId,
              model
          });

          if (data.success && data.pixels) {
               setGeneratedPixels(data.pixels);
               
               // Save the pixels to this field (pixel_generator)
               onChange({ 
                   target: { 
                       name, 
                       value: JSON.stringify(data.pixels),
                       type: 'json'
                   } 
               });
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  return (
    <Box paddingTop={2} paddingBottom={2}>
        <Flex alignItems="center" gap={4}>
            <Button 
                onClick={handleGenerate} 
                loading={loading}
                startIcon={<Magic />}
                variant="secondary"
                fullWidth
            >
                {formatMessage({ id: 'map-explorer.pixel-generator.button', defaultMessage: 'Generate Pixel Art' })}
            </Button>
            {generatedPixels && (
                <Flex gap={2} alignItems="center">
                    <Typography variant="pi" textColor="success600">Generated!</Typography>
                    <Box 
                        background="neutral150" 
                        borderColor="neutral200" 
                        hasRadius 
                        style={{ width: '32px', height: '32px', border: '1px solid #ddd', overflow: 'hidden' }}
                     >
                         <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(32, 1fr)`,
                            width: '100%',
                            height: '100%'
                         }}>
                            {generatedPixels.map((row, y) => 
                                row.map((pixelColor, x) => (
                                    <div 
                                        key={`gp-${x}-${y}`}
                                        style={{ backgroundColor: pixelColor === 'transparent' ? ((x+y)%2===0 ? '#ccc' : '#fff') : pixelColor }} 
                                    />
                                ))
                            )}
                         </div>
                     </Box>
                </Flex>
            )}
        </Flex>
    </Box>
  );
};

export default PixelGeneratorInput;
