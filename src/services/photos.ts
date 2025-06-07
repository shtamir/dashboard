// src/services/photos.ts
import { google } from 'googleapis';
import { Photo } from '../types';

const ALBUM_ID = import.meta.env.VITE_PHOTOS_ALBUM_ID;

export const fetchPhotos = async (): Promise<Photo[]> => {
  try {
    const photos = google.photoslibrary({ version: 'v1' });
    const response = await photos.mediaItems.list({
      albumId: ALBUM_ID,
      pageSize: 50,
    });

    return (response.data.mediaItems || []).map((item: any) => ({
      id: item.id,
      url: item.baseUrl,
      caption: item.description || undefined
    }));
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
};