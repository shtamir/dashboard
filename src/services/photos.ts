// src/services/photos.ts
import { google } from 'googleapis';
import { Photo, MediaItem } from '@types';

const ALBUM_ID = import.meta.env.VITE_PHOTOS_ALBUM_ID;

export async function fetchPhotos(): Promise<Photo[]> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/photoslibrary.readonly']
    });

    const photos = google.photoslibrary({ version: 'v1', auth });
    const response = await photos.mediaItems.list({
      albumId: ALBUM_ID,
      pageSize: 100
    });

    return (response.data.mediaItems || []).map((item: MediaItem) => ({
      id: item.id,
      url: item.baseUrl,
      caption: item.description || '',
      title: item.filename,
      timestamp: item.mediaMetadata?.creationTime || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
}