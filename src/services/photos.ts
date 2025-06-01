// src/services/photos.ts
import type { Photo } from '../types';

export async function fetchDailyPhotos(): Promise<Photo[]> {
  // TODO: Google Photos Library API
  return [
    { id: 1, url: '/api/placeholder/300/200', caption: 'Family Vacation' }
  ];
}