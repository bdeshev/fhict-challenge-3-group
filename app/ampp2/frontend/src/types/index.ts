export type User = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
};

export type Profile = {
  username: string;
  email: string;
  profilePicture: string | null;
  createdAt: string;
};

export type PlantInformation = {
  species?: string;
  description?: string;
  wateringTips?: string;
  sunlight?: string;
  idealMoistureMin?: number;
  idealMoistureMax?: number;
  cachedAt?: string;
};

export type Plant = {
  id: number;
  userId: number;
  name: string;
  species: string;
  moisture: number | null;
  threshold: number;
  autoMode: boolean;
  isWatering: boolean;
  lastWateredAt: string | null;
  createdAt: string;
  plantInformation: PlantInformation | null;
};

export type Notification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export type WateringHistory = {
  id: number;
  plantId: number;
  startedAt: string;
  duration: number;
  automatic: boolean;
  completedAt: string | null;
  status: string;
};

export type Settings = {
  theme: 'system' | 'light' | 'dark';
  language: string;
  notificationsEnabled: boolean;
  defaultAutoMode: boolean;
};

export type SensorReading = {
  id: number;
  deviceId: string;
  rawValue: number;
  moisturePercent: number;
  timestamp: string;
};

export type SensorReadingResponse = {
  reading: SensorReading;
  plant: Plant | null;
  wateringNeeded: boolean;
  command: string;
};

export type WateringStatus = {
  id: number;
  deviceId: string;
  isWatering: boolean;
  timestamp: string;
};

export type PushToken = {
  id: number;
  platform: string;
  createdAt: string;
};
