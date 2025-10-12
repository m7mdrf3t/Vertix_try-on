const sharp = require('sharp');

/**
 * Process image with Sharp - maintains DPI and provides advanced features
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} options - Processing options
 * @returns {Promise<Buffer>} - Processed image buffer
 */
async function processImageWithSharp(imageBuffer, options = {}) {
  const {
    maxDimension = 1024,
    quality = 90,
    format = 'jpeg',
    preserveMetadata = true,
    dpi = null
  } = options;

  try {
    let pipeline = sharp(imageBuffer);

    // Get image metadata first
    const metadata = await pipeline.metadata();
    console.log('Original image metadata:', {
      width: metadata.width,
      height: metadata.height,
      density: metadata.density,
      format: metadata.format,
      size: metadata.size
    });

    // Calculate new dimensions based on smallest dimension
    let { width, height } = metadata;
    let newWidth = width;
    let newHeight = height;

    if (width < height) {
      // Width is smaller
      if (width > maxDimension) {
        newHeight = Math.round((height * maxDimension) / width);
        newWidth = maxDimension;
      }
    } else {
      // Height is smaller
      if (height > maxDimension) {
        newWidth = Math.round((width * maxDimension) / height);
        newHeight = maxDimension;
      }
    }

    console.log(`Resizing from ${width}x${height} to ${newWidth}x${newHeight}`);

    // Resize image
    pipeline = pipeline.resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });

    // Set output format and quality
    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ 
        quality: quality,
        progressive: true,
        mozjpeg: true // Better compression
      });
    } else if (format === 'png') {
      pipeline = pipeline.png({ 
        quality: quality,
        progressive: true,
        compressionLevel: 9
      });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ 
        quality: quality,
        effort: 6
      });
    }

    // Preserve metadata (including DPI) if requested
    if (preserveMetadata) {
      pipeline = pipeline.withMetadata({
        density: dpi || metadata.density || 72
      });
    }

    // Process the image
    const processedBuffer = await pipeline.toBuffer();
    
    // Get processed metadata
    const processedMetadata = await sharp(processedBuffer).metadata();
    console.log('Processed image metadata:', {
      width: processedMetadata.width,
      height: processedMetadata.height,
      density: processedMetadata.density,
      format: processedMetadata.format,
      size: processedMetadata.size
    });

    return processedBuffer;

  } catch (error) {
    console.error('Error processing image with Sharp:', error);
    throw error;
  }
}

/**
 * Get image metadata without processing
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} - Image metadata
 */
async function getImageMetadata(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      density: metadata.density || 72,
      format: metadata.format,
      size: metadata.size,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    throw error;
  }
}

module.exports = {
  processImageWithSharp,
  getImageMetadata
};
