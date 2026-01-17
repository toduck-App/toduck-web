import { apiClient } from './api';
import axios from 'axios';

interface PresignedUrlResponse {
  fileUrlsDtos: {
    presignedUrl: string;
    fileUrl: string;
  }[];
}

export const awsService = {
  // Request presigned URL for file upload
  // API: POST /presigned
  // Body: { fileNameDtos: [{ fileName: "uuid.jpg" }] }
  // Response: { fileUrlsDtos: [{ presignedUrl: "...", fileUrl: "..." }] }
  async requestPresignedUrl(fileName: string): Promise<{ presignedUrl: string; fileUrl: string }> {
    const response = await apiClient.post('/presigned', {
      fileNameDtos: [{ fileName }],
    });
    const data = response.data?.content ?? response.data;

    if (!data?.fileUrlsDtos?.[0]) {
      throw new Error('Failed to get presigned URL');
    }

    return {
      presignedUrl: data.fileUrlsDtos[0].presignedUrl,
      fileUrl: data.fileUrlsDtos[0].fileUrl,
    };
  },

  // Upload image to presigned URL
  // PUT to presigned URL with raw image data
  // Content-Type: image/jpeg
  async uploadImage(presignedUrl: string, imageData: Blob): Promise<void> {
    await axios.put(presignedUrl, imageData, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  },

  // Helper: Upload image and return final URL
  async uploadImageAndGetUrl(imageFile: File): Promise<string> {
    // Generate unique filename
    const fileName = `${crypto.randomUUID()}.jpg`;

    // Get presigned URL
    const { presignedUrl, fileUrl } = await this.requestPresignedUrl(fileName);

    // Upload image
    await this.uploadImage(presignedUrl, imageFile);

    // Return the final file URL
    return fileUrl;
  },
};
