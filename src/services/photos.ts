// src/services/photos.ts
import { google } from 'googleapis';
import { Photo, MediaItem } from '../types';

const ALBUM_ID = import.meta.env.VITE_PHOTOS_ALBUM_ID;

export async function fetchPhotos(accessToken: string): Promise<Photo[]> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const photos = google.photoslibrary({ version: 'v1', auth });
    const response = await photos.mediaItems.list({
      albumId: ALBUM_ID,
      pageSize: 50
    });

    const mediaItems = response.data.mediaItems || [];
    return mediaItems.map((item: any) => ({
      id: item.id || '',
      url: item.baseUrl || '',
      caption: item.description || ''
    }));
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}