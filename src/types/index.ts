import { LocationImageProfile } from './imageSystem';
export * from './imageSystem';

export type CategoryType =
  | 'Heritage'
  | 'Culture'
  | 'Nature'
  | 'Mountains'
  | 'Beaches'
  | 'Food'
  | 'Spiritual'
  | 'Adventure'
  | 'Wildlife'
  | 'Art & Craft'
  | 'Offbeat'
  | 'Art';

export type MapMarkerCategory =
  | 'Hidden Gem'
  | 'Key Place'
  | 'Food / Local Flavor'
  | 'Heritage'
  | 'Cultural Site'
  | 'Viewpoint'
  | 'Local Market'
  | 'Emergency / SOS';

export type CoordinateStatus = 'verified' | 'needs_verification';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  locationId?: string;
  name: string;
  category: CategoryType;
  markerCategory?: MapMarkerCategory;
  description: string;
  coordinates: Coordinates;
  image: string;
  estimatedCost: string;
  bestTimeOfDay: string;
  insiderTip: string;
  isSecretGem?: boolean;
  localEtiquette?: string;
  coordinateStatus?: CoordinateStatus;
}

export interface LocalFood {
  id?: string;
  locationId?: string;
  name: string;
  description: string;
  whereToTry: string;
  priceRange: string;
  vegetarian: boolean;
  coordinates: Coordinates;
  image?: string;
  markerCategory?: 'Food / Local Flavor';
  coordinateStatus?: CoordinateStatus;
}

export interface EmergencyPoint {
  id: string;
  locationId: string;
  name: string;
  type: 'Hospital' | 'Police' | 'Tourist Helpline' | 'Emergency Service';
  phone: string;
  address: string;
  coordinates: Coordinates;
  coordinateStatus: CoordinateStatus;
  markerCategory: 'Emergency / SOS';
}

export interface LocationRecord {
  location_id: string;
  location_name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  region?: string;
  category?: CategoryType;
}

export interface PlaceRecord {
  place_id: string;
  location_id: string;
  place_name: string;
  category: CategoryType | string;
  markerCategory: MapMarkerCategory;
  latitude: number;
  longitude: number;
  description: string;
  image?: string;
  estimatedCost?: string;
  bestTimeOfDay?: string;
  insiderTip?: string;
  isSecretGem?: boolean;
  coordinateStatus: CoordinateStatus;
}

export interface CoordinateValidationIssue {
  type:
    | 'missing_lat'
    | 'missing_lng'
    | 'invalid_lat'
    | 'invalid_lng'
    | 'duplicate_id'
    | 'duplicate_coords'
    | 'wrong_location'
    | 'out_of_bounds'
    | 'suspicious_distance';
  id: string;
  name: string;
  locationId: string;
  details: string;
  coordinates?: Coordinates;
}

export interface DatabaseValidationReport {
  totalLocations: number;
  totalPlaces: number;
  totalFoods: number;
  totalEmergencyPoints: number;
  verifiedCoordinatesCount: number;
  needsVerificationCount: number;
  issues: CoordinateValidationIssue[];
  isValid: boolean;
  timestamp: string;
}

export interface LocalExperience {
  id: string;
  locationId?: string;
  title: string;
  description: string;
  communityHost: string;
  duration: string;
  cost: string;
  impactScore: number;
  category: string;
  coordinates: Coordinates;
  image?: string;
  coordinateStatus?: CoordinateStatus;
}

export interface LocalPhrase {
  id: string;
  english: string;
  localText: string;
  phonetic: string;
  category: 'Greetings' | 'Shopping' | 'Food' | 'Directions' | 'Emergency';
  language: string;
  audioNote?: string;
}

export interface EmergencyInfo {
  hospitalName: string;
  hospitalAddress: string;
  hospitalNumber: string;
  hospitalCoordinates?: Coordinates;
  policeStationName: string;
  policeAddress: string;
  policeNumber: string;
  policeCoordinates?: Coordinates;
  touristHelpline: string;
  ambulanceNumber: string;
  womenHelpline: string;
  localGuideContact: string;
  emergencyPoints?: EmergencyPoint[];
}

export interface MediaItem {
  mediaId: string;
  locationId: string;
  contentType: 'location' | 'attraction' | 'hidden_gem' | 'local_flavor' | 'culture' | 'gallery';
  contentId: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  source: string;
  status: 'verified' | 'active' | 'unverified';
}

export interface Destination {
  id: string;
  name: string;
  tagline: string;
  state: string;
  region: string;
  category: CategoryType;
  secondaryCategories: CategoryType[];
  coverImage: string;
  description: string;
  longDescription: string;
  loreTitle?: string;
  ancientLegend?: string;
  historicalChronicle?: string;
  folkloreTales?: string[];
  coordinates: Coordinates;
  bestTimeToVisit: string;
  estimatedBudgetPerDay: string;
  places: Place[];
  localFoods: LocalFood[];
  localExperiences: LocalExperience[];
  phrases: LocalPhrase[];
  emergencyInfo: EmergencyInfo;
  culturalGuidelines: string[];
  responsibleTips: string[];
  downloadSizeMB: number;
  osmBoundingBox?: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
  media?: MediaItem[];
  imageProfile?: LocationImageProfile;
}

export interface ItineraryItem {
  id: string;
  time: string;
  placeName: string;
  activity: string;
  description: string;
  estimatedCost: string;
  duration: string;
  travelDistance: string;
  category?: string;
  image?: string;
  coordinates?: Coordinates;
}

export interface DayPlan {
  dayNumber: number;
  title: string;
  theme: string;
  items: ItineraryItem[];
}

export interface GeneratedItinerary {
  id: string;
  destinationId: string;
  destinationName: string;
  state: string;
  days: number;
  // Present when the trip planner scaled the plan down from what was requested because
  // the destination doesn't have enough verified places/food/experiences yet to fill
  // more days without repeating something or inventing a new location.
  requestedDays?: number;
  wasCapped?: boolean;
  capNote?: string;
  budgetStyle: 'Budget' | 'Moderate' | 'Comfortable';
  interests: string[];
  travelStyle: string;
  totalEstimatedCost: string;
  curatedDate: string;
  summary: string;
  dayPlans: DayPlan[];
}

export interface OfflinePack {
  destinationId: string;
  destinationName: string;
  state: string;
  downloadDate: string;
  sizeMB: number;
  data: Destination;
}

export interface UserProfile {
  id: string; // Authenticated Unique User ID
  name: string;
  email: string;
  avatar: string;
  role: string;
  favoriteDestinationIds: string[];
  savedItineraries: GeneratedItinerary[];
  offlinePacks: OfflinePack[];
}

export interface UserAccount extends UserProfile {
  password?: string;
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  conversationId: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
}
