export type ImageType =
  | 'hero'
  | 'landmark'
  | 'hidden_gem'
  | 'architecture'
  | 'food'
  | 'culture'
  | 'landscape'
  | 'activity';

export type VerificationStatus = 'verified' | 'unverified' | 'rejected';

export interface LocationImageRecord {
  imageId: string;
  locationId: string;
  imageType: ImageType;
  role?: string;
  entityId?: string; // Links to place_id, gem_id, food_id, etc.
  title?: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  altText: string;
  attribution?: string;
  isPrimary?: boolean;
  verificationStatus: VerificationStatus;
}

export interface LocationImageProfile {
  locationId: string;
  locationName: string;
  state: string;
  heroImage?: LocationImageRecord;
  overviewImage?: LocationImageRecord;
  hiddenGems: LocationImageRecord[];
  localFlavors: LocationImageRecord[];
  cultureImage?: LocationImageRecord;
  places: LocationImageRecord[];
}

export interface ImageValidationIssue {
  type:
    | 'missing_location_id'
    | 'missing_image_url'
    | 'broken_image_url'
    | 'duplicate_image_id'
    | 'duplicate_url_across_locations'
    | 'image_assigned_to_wrong_location'
    | 'unverified_status'
    | 'insecure_http_url'
    | 'generic_or_random_url_detected'
    | 'invalid_image_type';
  imageId?: string;
  locationId: string;
  locationName?: string;
  url?: string;
  details: string;
}

export interface ImageDatabaseValidationReport {
  totalLocationsChecked: number;
  totalImagesRegistered: number;
  totalUniqueUrls: number;
  duplicateUrlsAcrossLocationsCount: number;
  unverifiedCount: number;
  issues: ImageValidationIssue[];
  isValid: boolean;
  timestamp: string;
}

