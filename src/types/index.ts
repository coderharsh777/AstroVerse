export interface AstrophysicalEvent {
  id: string;
  name: string;
  type: 'Supernova' | 'Solar Eclipse' | 'Lunar Eclipse' | 'Meteor Shower' | 'Comet' | 'Galaxy Merger' | 'Exoplanet Transit' | 'Nebula Formation';
  date: string; // ISO 8601 format
  description: string;
  image: string; // URL to image
  metadataUri: string; // IPFS URI
  simulated: boolean;
  coordinates?: {
    ra: string; // Right Ascension
    dec: string; // Declination
  };
  magnitude?: number; // Apparent magnitude
  distance?: string; // Distance from Earth (e.g., "168,000 light-years")
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  googleId?: string;
}

export interface Nft {
  id: string; // Token ID
  name: string;
  description: string;
  image: string; // Image URL from metadata
  event: Pick<AstrophysicalEvent, 'id' | 'name' | 'date'>; // Associated event
  metadataUri: string;
}

export interface WalletState {
  address: string | null;
  astroBalance: number;
  nfts: Nft[];
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// For AI Event Suggester
export interface UserProfileForAI {
  preferences: string[]; // e.g., ["supernovae", "eclipses"]
  pastActivity: string[]; // e.g., ["viewed Supernova 1987A", "minted Total Solar Eclipse 2024 NFT"]
}
