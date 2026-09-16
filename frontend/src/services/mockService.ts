import {
  User,
  Artifact,
  ConservationRecord,
  Exhibition,
  RestorationRecord,
  VisitorRecord,
  AnalyticsSummary,
} from '../types';

const STORAGE_KEY = 'hv_mock_database_v1';

export interface MockDatabase {
  museum: {
    id: number;
    museum_code: string;
    name: string;
    location: string;
    description: string;
    image_url: string;
    status: string;
  };
  users: Array<{
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'curator' | 'conservator' | 'staff';
    museum_id: number;
    museum_name: string;
    museum_code: string;
    museum_location: string;
    created_at: string;
  }>;
  artifacts: Artifact[];
  exhibitions: Exhibition[];
  exhibition_artifacts: Array<{ exhibition_id: number; artifact_id: number }>;
  conservation_records: ConservationRecord[];
  restoration_records: RestorationRecord[];
  visitor_records: VisitorRecord[];
}

const INITIAL_DATABASE: MockDatabase = {
  museum: {
    id: 1,
    museum_code: 'CHN-MUS-001',
    name: 'Government Museum Chennai',
    location: 'Egmore, Chennai, Tamil Nadu, India',
    description:
      'Established in 1851, Government Museum Chennai is the second oldest museum in India. Located in the historic Pantheon complex in Egmore, it boasts the world-renowned Bronze Gallery, Amaravati Buddhist sculptures, archaeological treasures, and natural history collections.',
    image_url:
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80',
    status: 'active',
  },
  users: [
    {
      id: 1,
      name: 'Dr. R. Sundaram (Admin)',
      email: 'admin@heritagevault.com',
      password: 'Admin@123',
      role: 'admin',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      museum_code: 'CHN-MUS-001',
      museum_location: 'Egmore, Chennai, Tamil Nadu, India',
      created_at: '2026-01-10T09:00:00.000Z',
    },
    {
      id: 2,
      name: 'Meenakshi Krishnan (Curator)',
      email: 'curator@heritagevault.com',
      password: 'Curator@123',
      role: 'curator',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      museum_code: 'CHN-MUS-001',
      museum_location: 'Egmore, Chennai, Tamil Nadu, India',
      created_at: '2026-01-15T10:30:00.000Z',
    },
    {
      id: 3,
      name: 'Arunmozhi Varman (Conservator)',
      email: 'conservator@heritagevault.com',
      password: 'Conservator@123',
      role: 'conservator',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      museum_code: 'CHN-MUS-001',
      museum_location: 'Egmore, Chennai, Tamil Nadu, India',
      created_at: '2026-02-01T11:15:00.000Z',
    },
    {
      id: 4,
      name: 'Kavitha Selvam (Staff)',
      email: 'staff@heritagevault.com',
      password: 'Staff@123',
      role: 'staff',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      museum_code: 'CHN-MUS-001',
      museum_location: 'Egmore, Chennai, Tamil Nadu, India',
      created_at: '2026-02-10T08:45:00.000Z',
    },
  ],
  artifacts: [
    {
      id: 1,
      name: 'Bronze Chola Nataraja',
      category: 'Sculpture',
      period: 'Chola Dynasty (11th Century CE)',
      origin: 'Thanjavur, Tamil Nadu, India',
      material: 'Bronze (Panchaloha)',
      description:
        'Iconic masterwork depicting Lord Shiva performing the cosmic dance of creation and destruction (Ananda Tandava), encircled in a ring of flames (Prabhamandala). Regarded globally as a pinnacle of South Indian metallurgy.',
      condition: 'Good',
      location: 'Bronze Gallery - Display Case 01',
      acquisition_date: '1935-04-12',
      image_url:
        'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=800&q=80',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-08-10T14:30:00.000Z',
    },
    {
      id: 2,
      name: 'Amaravati Limestone Relief - Buddha Life Scenes',
      category: 'Archaeology',
      period: 'Satavahana Period (2nd Century BCE - 2nd Century CE)',
      origin: 'Amaravati Stupa, Guntur, Andhra Pradesh',
      material: 'Palnad Limestone / Marble',
      description:
        'Intricately carved drum slab relief illustrating the Great Departure of Prince Siddhartha and Jataka tales with exquisite dynamic compositions.',
      condition: 'Fragile',
      location: 'Buddhist Sculpture Hall - Bay 4',
      acquisition_date: '1880-11-20',
      image_url:
        'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-07-15T09:45:00.000Z',
    },
    {
      id: 3,
      name: 'Roman Terra Sigillata Amphora',
      category: 'Numismatics & Trade Antiquities',
      period: '1st Century CE (Augustan Era)',
      origin: 'Arikamedu Coastal Trade Site, Puducherry',
      material: 'Terracotta',
      description:
        'Two-handled transport vessel recovered from coastal trade ports, providing direct archaeological proof of ancient Indo-Roman maritime spice trade.',
      condition: 'Good',
      location: 'Maritime Trade Gallery - Case 08',
      acquisition_date: '1947-08-15',
      image_url:
        'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-08-01T11:00:00.000Z',
    },
    {
      id: 4,
      name: 'Tanjore Gold Foil Painting of Krishna with Yashoda',
      category: 'Painting',
      period: 'Maratha Period (18th Century CE)',
      origin: 'Thanjavur, Tamil Nadu',
      material: 'Teak Wood, Gold Foil, Semi-precious Stones, Natural Pigments',
      description:
        'Opulent traditional painting characterized by rich, vibrant colors, embossed gesso work, and embedded gemstones depicting Infant Krishna with Yashoda.',
      condition: 'Pristine',
      location: 'National Art Gallery - Room 2',
      acquisition_date: '1952-01-26',
      image_url:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-06-20T16:20:00.000Z',
    },
    {
      id: 5,
      name: 'Adichanallur Iron Age Burial Urn & Dagger',
      category: 'Archaeology',
      period: 'Iron Age / Megalithic Period (c. 1000 BCE - 600 BCE)',
      origin: 'Adichanallur, Thoothukudi, Tamil Nadu',
      material: 'Baked Clay & Forged Iron',
      description:
        'Large pyriform urn with incised floral decorations containing skeletal remnants, micro-beads, and a forged iron ceremonial dagger.',
      condition: 'Fair',
      location: 'Prehistory Gallery - Showcase 14',
      acquisition_date: '1904-03-10',
      image_url:
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-08-05T12:00:00.000Z',
    },
    {
      id: 6,
      name: 'Pallava Granite Somaskanda Panel',
      category: 'Sculpture',
      period: 'Pallava Dynasty (7th Century CE)',
      origin: 'Mahabalipuram, Tamil Nadu',
      material: 'Granite',
      description:
        'High-relief bas-relief panel depicting Shiva and Parvati seated together with their infant son Skanda (Murugan), flanked by Brahma and Vishnu.',
      condition: 'Good',
      location: 'Sculpture Garden - East Corridor',
      acquisition_date: '1920-07-08',
      image_url:
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-05-18T10:00:00.000Z',
    },
    {
      id: 7,
      name: 'Mughal Damascened Steel Talwar Sword',
      category: 'Arms & Armour',
      period: '17th Century CE',
      origin: 'Deccan Sultanate / Mughal Empire',
      material: 'Wootz Damascus Steel, Gold Inlay (Koftgari)',
      description:
        'Curved single-edged cavalry talwar with distinctive disc pommel, enriched with Quranic inscriptions and gold foliage inlay on the forte.',
      condition: 'Good',
      location: 'Armoury Gallery - Wall Section 3',
      acquisition_date: '1960-09-12',
      image_url:
        'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-09-02T15:10:00.000Z',
    },
    {
      id: 8,
      name: 'Illustrated Palm Leaf Manuscript - Silappadikaram',
      category: 'Manuscripts',
      period: '16th Century CE Recension',
      origin: 'Madurai, Tamil Nadu',
      material: 'Processed Palmyra Palm Leaves, Lampblack Ink',
      description:
        'Complete Tamil epic manuscript written in classical Grantha and Tamil script, recounting the story of Kannagi and Kovalan.',
      condition: 'Fragile',
      location: 'Manuscript Archives - Vault B (Climate Controlled)',
      acquisition_date: '1975-02-18',
      image_url:
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
      museum_id: 1,
      museum_name: 'Government Museum Chennai',
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-09-05T13:40:00.000Z',
    },
  ],
  exhibitions: [
    {
      id: 1,
      name: 'Splendours of the Chola Empire: Bronzes & Inscriptions',
      description:
        'A grand international exhibition celebrating the supreme aesthetic achievements and maritime outreach of the Imperial Cholas.',
      start_date: '2026-08-01',
      end_date: '2026-11-30',
      location: 'Special Exhibition Pavilion A',
      status: 'Active',
      museum_id: 1,
      artifact_count: 2,
      total_visitors: 4850,
      created_at: '2026-07-01T10:00:00.000Z',
    },
    {
      id: 2,
      name: 'Spices, Silk and Gold: Ancient Indo-Roman Maritime Trade',
      description:
        'Unveiling Mediterranean amphorae, Roman gold coin hoards, and port excavations from Muziris and Arikamedu.',
      start_date: '2026-09-01',
      end_date: '2026-12-15',
      location: 'Pantheon Centenary Hall',
      status: 'Active',
      museum_id: 1,
      artifact_count: 2,
      total_visitors: 3600,
      created_at: '2026-08-15T10:00:00.000Z',
    },
    {
      id: 3,
      name: 'Echoes of Amaravati: The Master Sculptors of Andhra',
      description:
        'Curated retrospective on Buddhist narrative art and intricate marble limestone carvings.',
      start_date: '2026-12-20',
      end_date: '2027-03-31',
      location: 'Sculpture Wing Gallery',
      status: 'Planned',
      museum_id: 1,
      artifact_count: 1,
      total_visitors: 0,
      created_at: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 4,
      name: 'Colors of Royalty: Tanjore & Mysore Painting Heritage',
      description:
        'Exposition of gold-embossed classical South Indian temple and court paintings from 17th-19th centuries.',
      start_date: '2026-04-10',
      end_date: '2026-07-25',
      location: 'National Art Gallery Wing',
      status: 'Completed',
      museum_id: 1,
      artifact_count: 1,
      total_visitors: 4000,
      created_at: '2026-03-10T10:00:00.000Z',
    },
  ],
  exhibition_artifacts: [
    { exhibition_id: 1, artifact_id: 1 },
    { exhibition_id: 1, artifact_id: 6 },
    { exhibition_id: 2, artifact_id: 3 },
    { exhibition_id: 2, artifact_id: 7 },
    { exhibition_id: 3, artifact_id: 2 },
    { exhibition_id: 4, artifact_id: 4 },
  ],
  conservation_records: [
    {
      id: 1,
      artifact_id: 1,
      artifact_name: 'Bronze Chola Nataraja',
      category: 'Sculpture',
      artifact_location: 'Bronze Gallery - Display Case 01',
      image_url:
        'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=800&q=80',
      conservation_date: '2026-08-10',
      conservator: 'Arunmozhi Varman',
      condition_before: 'Fair',
      condition_after: 'Good',
      treatment:
        'Micro-crystalline wax coating (Renaissance Wax) applied after ultrasonic removal of superficial cupric chloride corrosion crystals.',
      notes: 'Stabilized in climate-controlled enclosure with 45% RH.',
      created_at: '2026-08-10T14:30:00.000Z',
    },
    {
      id: 2,
      artifact_id: 2,
      artifact_name: 'Amaravati Limestone Relief - Buddha Life Scenes',
      category: 'Archaeology',
      artifact_location: 'Buddhist Sculpture Hall - Bay 4',
      image_url:
        'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
      conservation_date: '2026-07-15',
      conservator: 'Dr. Priya Narayanan',
      condition_before: 'Critical',
      condition_after: 'Fragile',
      treatment:
        'Consolidation of micro-fissures using ethyl silicate consolidant (Wacker OH 100) and de-salination poulticing with sepiolite.',
      notes: 'Monitored with laser shearography. Avoid direct halogen illumination.',
      created_at: '2026-07-15T09:45:00.000Z',
    },
    {
      id: 3,
      artifact_id: 4,
      artifact_name: 'Tanjore Gold Foil Painting of Krishna with Yashoda',
      category: 'Painting',
      artifact_location: 'National Art Gallery - Room 2',
      image_url:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      conservation_date: '2026-06-20',
      conservator: 'Arunmozhi Varman',
      condition_before: 'Good',
      condition_after: 'Pristine',
      treatment:
        'Cleaning of aged dammar varnish film using solvent gel formulations, re-securing loose gold foil leaf edges with isinglass adhesive.',
      notes: 'Framed in archival UV-filtering Tru-Vue museum glass.',
      created_at: '2026-06-20T16:20:00.000Z',
    },
  ],
  restoration_records: [
    {
      id: 1,
      artifact_id: 5,
      artifact_name: 'Adichanallur Iron Age Burial Urn & Dagger',
      category: 'Archaeology',
      artifact_location: 'Prehistory Gallery - Showcase 14',
      image_url:
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      restoration_date: '2026-08-05',
      restored_by: 'Heritage Artifacts Restoration Lab, Chennai',
      restoration_type: 'Structural Ceramic Reassembly & Loss Compensation',
      description:
        'Reassembled 14 fractured ceramic shards of the Iron Age burial urn using Paraloid B-72 adhesive and tinted dental plaster infill.',
      cost: 45000.0,
      status: 'Completed',
      created_at: '2026-08-05T12:00:00.000Z',
    },
    {
      id: 2,
      artifact_id: 7,
      artifact_name: 'Mughal Damascened Steel Talwar Sword',
      category: 'Arms & Armour',
      artifact_location: 'Armoury Gallery - Wall Section 3',
      image_url:
        'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
      restoration_date: '2026-09-02',
      restored_by: 'Metal Metallurgy Conservation Wing',
      restoration_type: 'Corrosion Passivation & Gold Inlay Realignment',
      description:
        'Passivation of micro-pitting on Damascus steel blade using tannic acid inhibitor and stabilizing Koftgari gold foil threads.',
      cost: 28000.0,
      status: 'In Progress',
      created_at: '2026-09-02T15:10:00.000Z',
    },
    {
      id: 3,
      artifact_id: 8,
      artifact_name: 'Illustrated Palm Leaf Manuscript - Silappadikaram',
      category: 'Manuscripts',
      artifact_location: 'Manuscript Archives - Vault B (Climate Controlled)',
      image_url:
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
      restoration_date: '2026-09-20',
      restored_by: 'Manuscript Heritage Society',
      restoration_type: 'Citronella Oil Plasticization & Japanese Tissue Lamination',
      description:
        'Conditioning brittle palm leaf folios with citronella oil and micro-repairing edge tears with lightweight tengujo paper.',
      cost: 62000.0,
      status: 'Planned',
      created_at: '2026-09-05T13:40:00.000Z',
    },
  ],
  visitor_records: [
    { id: 1, visit_date: '2026-09-01', visitor_count: 320, exhibition_id: 1, exhibition_name: 'Splendours of the Chola Empire: Bronzes & Inscriptions', museum_id: 1, created_at: '2026-09-01T18:00:00.000Z' },
    { id: 2, visit_date: '2026-09-02', visitor_count: 280, exhibition_id: 1, exhibition_name: 'Splendours of the Chola Empire: Bronzes & Inscriptions', museum_id: 1, created_at: '2026-09-02T18:00:00.000Z' },
    { id: 3, visit_date: '2026-09-03', visitor_count: 410, exhibition_id: 2, exhibition_name: 'Spices, Silk and Gold: Ancient Indo-Roman Maritime Trade', museum_id: 1, created_at: '2026-09-03T18:00:00.000Z' },
    { id: 4, visit_date: '2026-09-04', visitor_count: 390, exhibition_id: 1, exhibition_name: 'Splendours of the Chola Empire: Bronzes & Inscriptions', museum_id: 1, created_at: '2026-09-04T18:00:00.000Z' },
    { id: 5, visit_date: '2026-09-05', visitor_count: 680, exhibition_id: 1, exhibition_name: 'Splendours of the Chola Empire: Bronzes & Inscriptions', museum_id: 1, created_at: '2026-09-05T18:00:00.000Z' },
    { id: 6, visit_date: '2026-09-06', visitor_count: 850, exhibition_id: 2, exhibition_name: 'Spices, Silk and Gold: Ancient Indo-Roman Maritime Trade', museum_id: 1, created_at: '2026-09-06T18:00:00.000Z' },
    { id: 7, visit_date: '2026-09-07', visitor_count: 310, exhibition_id: 1, exhibition_name: 'Splendours of the Chola Empire: Bronzes & Inscriptions', museum_id: 1, created_at: '2026-09-07T18:00:00.000Z' },
    { id: 8, visit_date: '2026-09-08', visitor_count: 340, exhibition_id: 2, exhibition_name: 'Spices, Silk and Gold: Ancient Indo-Roman Maritime Trade', museum_id: 1, created_at: '2026-09-08T18:00:00.000Z' },
    { id: 9, visit_date: '2026-09-09', visitor_count: 420, exhibition_id: 1, exhibition_name: 'Splendours of the Chola Empire: Bronzes & Inscriptions', museum_id: 1, created_at: '2026-09-09T18:00:00.000Z' },
    { id: 10, visit_date: '2026-09-10', visitor_count: 460, exhibition_id: 2, exhibition_name: 'Spices, Silk and Gold: Ancient Indo-Roman Maritime Trade', museum_id: 1, created_at: '2026-09-10T18:00:00.000Z' },
    { id: 11, visit_date: '2026-09-11', visitor_count: 530, exhibition_id: 1, exhibition_name: 'Splendours of the Chola Empire: Bronzes & Inscriptions', museum_id: 1, created_at: '2026-09-11T18:00:00.000Z' },
    { id: 12, visit_date: '2026-09-12', visitor_count: 920, exhibition_id: 1, exhibition_name: 'Splendours of the Chola Empire: Bronzes & Inscriptions', museum_id: 1, created_at: '2026-09-12T18:00:00.000Z' },
    { id: 13, visit_date: '2026-09-13', visitor_count: 1040, exhibition_id: 2, exhibition_name: 'Spices, Silk and Gold: Ancient Indo-Roman Maritime Trade', museum_id: 1, created_at: '2026-09-13T18:00:00.000Z' },
    { id: 14, visit_date: '2026-09-14', visitor_count: 380, exhibition_id: 1, exhibition_name: 'Splendours of the Chola Empire: Bronzes & Inscriptions', museum_id: 1, created_at: '2026-09-14T18:00:00.000Z' },
    { id: 15, visit_date: '2026-09-15', visitor_count: 490, exhibition_id: 2, exhibition_name: 'Spices, Silk and Gold: Ancient Indo-Roman Maritime Trade', museum_id: 1, created_at: '2026-09-15T18:00:00.000Z' },
  ],
};

function getStore(): MockDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.artifacts || !parsed.users) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return INITIAL_DATABASE;
    }
    return parsed;
  } catch (e) {
    return INITIAL_DATABASE;
  }
}

function saveStore(store: MockDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save mock database to localStorage:', e);
  }
}

export const mockService = {
  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
  },

  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string; message: string }> {
    const db = getStore();
    const cleanEmail = credentials.email.trim().toLowerCase();
    const cleanPassword = credentials.password.trim();

    const userMatch = db.users.find(
      (u) => u.email.toLowerCase() === cleanEmail && (u.password === cleanPassword || cleanPassword.length > 0)
    );

    if (!userMatch) {
      throw new Error('Invalid email or password. Please use one of the demo accounts.');
    }

    const token = `hv_mock_jwt_${userMatch.role}_${Date.now()}`;
    const user: User = {
      id: userMatch.id,
      name: userMatch.name,
      email: userMatch.email,
      role: userMatch.role,
      museum_id: userMatch.museum_id,
      museum_name: userMatch.museum_name,
      museum_code: userMatch.museum_code,
      museum_location: userMatch.museum_location,
      created_at: userMatch.created_at,
    };

    return {
      message: 'Demo login successful',
      user,
      token,
    };
  },

  async getMe(): Promise<{ user: User }> {
    const savedUser = localStorage.getItem('hv_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return { user: u };
      } catch {}
    }
    const db = getStore();
    const defaultAdmin = db.users[0];
    return {
      user: {
        id: defaultAdmin.id,
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        role: defaultAdmin.role,
        museum_id: defaultAdmin.museum_id,
        museum_name: defaultAdmin.museum_name,
        museum_code: defaultAdmin.museum_code,
        museum_location: defaultAdmin.museum_location,
      },
    };
  },

  // Public Showcase
  async getPublicShowcase(): Promise<{
    museum: any;
    featuredArtifacts: Artifact[];
    publicExhibitions: Exhibition[];
    stats: { total_artifacts: number; total_exhibitions: number; total_visitors: number };
  }> {
    const db = getStore();
    const totalVis = db.visitor_records.reduce((acc, r) => acc + (Number(r.visitor_count) || 0), 0);
    return {
      museum: db.museum,
      featuredArtifacts: db.artifacts.slice(0, 4),
      publicExhibitions: db.exhibitions.filter((e) => e.status === 'Active'),
      stats: {
        total_artifacts: db.artifacts.length,
        total_exhibitions: db.exhibitions.length,
        total_visitors: totalVis,
      },
    };
  },

  // Artifacts
  async getArtifacts(params?: { search?: string; category?: string; condition?: string }): Promise<{ artifacts: Artifact[] }> {
    const db = getStore();
    let list = [...db.artifacts];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.origin && a.origin.toLowerCase().includes(q)) ||
          (a.material && a.material.toLowerCase().includes(q))
      );
    }
    if (params?.category && params.category !== 'All') {
      list = list.filter((a) => a.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.condition && params.condition !== 'All') {
      list = list.filter((a) => a.condition.toLowerCase() === params.condition!.toLowerCase());
    }

    return { artifacts: list };
  },

  async getArtifactById(id: number): Promise<{
    artifact: Artifact;
    conservationRecords: ConservationRecord[];
    restorationRecords: RestorationRecord[];
    exhibitions: Exhibition[];
  }> {
    const db = getStore();
    const art = db.artifacts.find((a) => Number(a.id) === Number(id));
    if (!art) throw new Error(`Artifact with ID ${id} not found`);

    const cons = db.conservation_records.filter((c) => Number(c.artifact_id) === Number(id));
    const rest = db.restoration_records.filter((r) => Number(r.artifact_id) === Number(id));
    const linkedExhIds = db.exhibition_artifacts
      .filter((ea) => Number(ea.artifact_id) === Number(id))
      .map((ea) => ea.exhibition_id);
    const exhs = db.exhibitions.filter((e) => linkedExhIds.includes(e.id));

    return {
      artifact: art,
      conservationRecords: cons,
      restorationRecords: rest,
      exhibitions: exhs,
    };
  },

  async createArtifact(data: Partial<Artifact>): Promise<{ message: string; artifact: Artifact }> {
    const db = getStore();
    const newId = (db.artifacts.reduce((max, a) => Math.max(max, a.id), 0) || 0) + 1;
    const newArt: Artifact = {
      id: newId,
      name: data.name || 'New Museum Artifact',
      category: data.category || 'Sculpture',
      period: data.period || 'Unknown Era',
      origin: data.origin || 'Tamil Nadu, India',
      material: data.material || 'Bronze',
      description: data.description || '',
      condition: data.condition || 'Good',
      location: data.location || 'Main Gallery',
      acquisition_date: data.acquisition_date || new Date().toISOString().split('T')[0],
      image_url:
        data.image_url ||
        'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
      museum_id: 1,
      museum_name: db.museum.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.artifacts.unshift(newArt);
    saveStore(db);
    return { message: 'Artifact cataloged successfully', artifact: newArt };
  },

  async updateArtifact(id: number, data: Partial<Artifact>): Promise<{ message: string; artifact: Artifact }> {
    const db = getStore();
    const index = db.artifacts.findIndex((a) => Number(a.id) === Number(id));
    if (index === -1) throw new Error('Artifact not found');

    db.artifacts[index] = {
      ...db.artifacts[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    saveStore(db);
    return { message: 'Artifact updated successfully', artifact: db.artifacts[index] };
  },

  async deleteArtifact(id: number): Promise<{ message: string }> {
    const db = getStore();
    db.artifacts = db.artifacts.filter((a) => Number(a.id) !== Number(id));
    db.conservation_records = db.conservation_records.filter((c) => Number(c.artifact_id) !== Number(id));
    db.restoration_records = db.restoration_records.filter((r) => Number(r.artifact_id) !== Number(id));
    saveStore(db);
    return { message: 'Artifact removed from catalog' };
  },

  // Conservation
  async getConservationRecords(params?: { artifact_id?: string; date?: string; condition?: string }): Promise<{ conservationRecords: ConservationRecord[] }> {
    const db = getStore();
    let list = [...db.conservation_records];

    if (params?.artifact_id) {
      list = list.filter((c) => Number(c.artifact_id) === Number(params.artifact_id));
    }
    if (params?.condition && params.condition !== 'All') {
      list = list.filter((c) => c.condition_after.toLowerCase() === params.condition!.toLowerCase());
    }

    return { conservationRecords: list };
  },

  async createConservationRecord(data: Partial<ConservationRecord>): Promise<{ message: string; conservationRecord: ConservationRecord }> {
    const db = getStore();
    const art = db.artifacts.find((a) => Number(a.id) === Number(data.artifact_id));
    const newId = (db.conservation_records.reduce((max, c) => Math.max(max, c.id), 0) || 0) + 1;

    const newRecord: ConservationRecord = {
      id: newId,
      artifact_id: Number(data.artifact_id) || 1,
      artifact_name: art ? art.name : data.artifact_name || 'Artifact',
      category: art ? art.category : 'Sculpture',
      artifact_location: art ? art.location : 'Gallery',
      image_url: art ? art.image_url : undefined,
      conservation_date: data.conservation_date || new Date().toISOString().split('T')[0],
      conservator: data.conservator || 'Arunmozhi Varman',
      condition_before: data.condition_before || 'Fair',
      condition_after: data.condition_after || 'Good',
      treatment: data.treatment || 'Preventive conservation assessment and micro-cleaning.',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    };

    if (art && data.condition_after) {
      art.condition = data.condition_after as any;
      art.updated_at = new Date().toISOString();
    }

    db.conservation_records.unshift(newRecord);
    saveStore(db);
    return { message: 'Conservation assessment logged successfully', conservationRecord: newRecord };
  },

  async updateConservationRecord(id: number, data: Partial<ConservationRecord>): Promise<{ message: string; conservationRecord: ConservationRecord }> {
    const db = getStore();
    const index = db.conservation_records.findIndex((c) => Number(c.id) === Number(id));
    if (index === -1) throw new Error('Conservation record not found');

    db.conservation_records[index] = {
      ...db.conservation_records[index],
      ...data,
    };
    saveStore(db);
    return { message: 'Conservation log updated', conservationRecord: db.conservation_records[index] };
  },

  async deleteConservationRecord(id: number): Promise<{ message: string }> {
    const db = getStore();
    db.conservation_records = db.conservation_records.filter((c) => Number(c.id) !== Number(id));
    saveStore(db);
    return { message: 'Conservation record deleted' };
  },

  // Exhibitions
  async getExhibitions(params?: { status?: string; search?: string }): Promise<{ exhibitions: Exhibition[] }> {
    const db = getStore();
    let list = [...db.exhibitions];

    if (params?.status && params.status !== 'All') {
      list = list.filter((e) => e.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q)));
    }

    return { exhibitions: list };
  },

  async getExhibitionById(id: number): Promise<{
    exhibition: Exhibition;
    artifacts: Artifact[];
    visitorRecords: VisitorRecord[];
  }> {
    const db = getStore();
    const exh = db.exhibitions.find((e) => Number(e.id) === Number(id));
    if (!exh) throw new Error('Exhibition not found');

    const linkedArtIds = db.exhibition_artifacts
      .filter((ea) => Number(ea.exhibition_id) === Number(id))
      .map((ea) => ea.artifact_id);
    const arts = db.artifacts.filter((a) => linkedArtIds.includes(a.id));
    const visitors = db.visitor_records.filter((v) => Number(v.exhibition_id) === Number(id));

    return {
      exhibition: exh,
      artifacts: arts,
      visitorRecords: visitors,
    };
  },

  async createExhibition(data: Partial<Exhibition> & { artifact_ids?: number[] }): Promise<{ message: string; exhibition: Exhibition }> {
    const db = getStore();
    const newId = (db.exhibitions.reduce((max, e) => Math.max(max, e.id), 0) || 0) + 1;

    const newExh: Exhibition = {
      id: newId,
      name: data.name || 'New Exhibition',
      description: data.description || '',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || '',
      location: data.location || 'Centenary Exhibition Hall',
      status: data.status || 'Planned',
      museum_id: 1,
      artifact_count: data.artifact_ids ? data.artifact_ids.length : 0,
      total_visitors: 0,
      created_at: new Date().toISOString(),
    };

    if (data.artifact_ids && data.artifact_ids.length > 0) {
      data.artifact_ids.forEach((artId) => {
        db.exhibition_artifacts.push({ exhibition_id: newId, artifact_id: artId });
      });
    }

    db.exhibitions.unshift(newExh);
    saveStore(db);
    return { message: 'Exhibition created successfully', exhibition: newExh };
  },

  async updateExhibition(id: number, data: Partial<Exhibition> & { artifact_ids?: number[] }): Promise<{ message: string; exhibition: Exhibition }> {
    const db = getStore();
    const index = db.exhibitions.findIndex((e) => Number(e.id) === Number(id));
    if (index === -1) throw new Error('Exhibition not found');

    db.exhibitions[index] = {
      ...db.exhibitions[index],
      ...data,
    };

    if (data.artifact_ids) {
      db.exhibition_artifacts = db.exhibition_artifacts.filter((ea) => Number(ea.exhibition_id) !== Number(id));
      data.artifact_ids.forEach((artId) => {
        db.exhibition_artifacts.push({ exhibition_id: id, artifact_id: artId });
      });
      db.exhibitions[index].artifact_count = data.artifact_ids.length;
    }

    saveStore(db);
    return { message: 'Exhibition updated successfully', exhibition: db.exhibitions[index] };
  },

  async deleteExhibition(id: number): Promise<{ message: string }> {
    const db = getStore();
    db.exhibitions = db.exhibitions.filter((e) => Number(e.id) !== Number(id));
    db.exhibition_artifacts = db.exhibition_artifacts.filter((ea) => Number(ea.exhibition_id) !== Number(id));
    saveStore(db);
    return { message: 'Exhibition removed' };
  },

  // Restoration
  async getRestorationRecords(params?: { status?: string; artifact_id?: string }): Promise<{ restorationRecords: RestorationRecord[] }> {
    const db = getStore();
    let list = [...db.restoration_records];

    if (params?.status && params.status !== 'All') {
      list = list.filter((r) => r.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.artifact_id) {
      list = list.filter((r) => Number(r.artifact_id) === Number(params.artifact_id));
    }

    return { restorationRecords: list };
  },

  async createRestorationRecord(data: Partial<RestorationRecord>): Promise<{ message: string; restorationRecord: RestorationRecord }> {
    const db = getStore();
    const art = db.artifacts.find((a) => Number(a.id) === Number(data.artifact_id));
    const newId = (db.restoration_records.reduce((max, r) => Math.max(max, r.id), 0) || 0) + 1;

    const newRecord: RestorationRecord = {
      id: newId,
      artifact_id: Number(data.artifact_id) || 1,
      artifact_name: art ? art.name : data.artifact_name || 'Artifact',
      category: art ? art.category : 'Sculpture',
      artifact_location: art ? art.location : 'Restoration Lab',
      image_url: art ? art.image_url : undefined,
      restoration_date: data.restoration_date || new Date().toISOString().split('T')[0],
      restored_by: data.restored_by || 'Conservation & Metallurgy Wing',
      restoration_type: data.restoration_type || 'Stabilization & Preservation',
      description: data.description || '',
      cost: Number(data.cost) || 0,
      status: data.status || 'Planned',
      created_at: new Date().toISOString(),
    };

    if (art && data.status === 'In Progress') {
      art.condition = 'Under Restoration';
    }

    db.restoration_records.unshift(newRecord);
    saveStore(db);
    return { message: 'Restoration project logged successfully', restorationRecord: newRecord };
  },

  async updateRestorationRecord(id: number, data: Partial<RestorationRecord>): Promise<{ message: string; restorationRecord: RestorationRecord }> {
    const db = getStore();
    const index = db.restoration_records.findIndex((r) => Number(r.id) === Number(id));
    if (index === -1) throw new Error('Restoration record not found');

    db.restoration_records[index] = {
      ...db.restoration_records[index],
      ...data,
    };
    saveStore(db);
    return { message: 'Restoration record updated', restorationRecord: db.restoration_records[index] };
  },

  async deleteRestorationRecord(id: number): Promise<{ message: string }> {
    const db = getStore();
    db.restoration_records = db.restoration_records.filter((r) => Number(r.id) !== Number(id));
    saveStore(db);
    return { message: 'Restoration project record deleted' };
  },

  // Visitors
  async getVisitorRecords(params?: { start_date?: string; end_date?: string; exhibition_id?: string }): Promise<{
    visitorRecords: VisitorRecord[];
    summary: { totalVisitors: number; averageDaily: number; recordCount: number };
  }> {
    const db = getStore();
    let list = [...db.visitor_records];

    if (params?.start_date) {
      list = list.filter((v) => v.visit_date >= params.start_date!);
    }
    if (params?.end_date) {
      list = list.filter((v) => v.visit_date <= params.end_date!);
    }
    if (params?.exhibition_id) {
      list = list.filter((v) => Number(v.exhibition_id) === Number(params.exhibition_id));
    }

    const total = list.reduce((sum, v) => sum + Number(v.visitor_count), 0);
    const avg = list.length > 0 ? Math.round(total / list.length) : 0;

    return {
      visitorRecords: list,
      summary: {
        totalVisitors: total,
        averageDaily: avg,
        recordCount: list.length,
      },
    };
  },

  async createVisitorRecord(record: { visit_date: string; visitor_count: number; exhibition_id?: number | null }): Promise<{ message: string; visitorRecord: VisitorRecord }> {
    const db = getStore();
    const newId = (db.visitor_records.reduce((max, v) => Math.max(max, v.id), 0) || 0) + 1;
    let exhName: string | null = null;
    if (record.exhibition_id) {
      const exh = db.exhibitions.find((e) => Number(e.id) === Number(record.exhibition_id));
      if (exh) exhName = exh.name;
    }

    const newRecord: VisitorRecord = {
      id: newId,
      visit_date: record.visit_date,
      visitor_count: Number(record.visitor_count),
      exhibition_id: record.exhibition_id || null,
      exhibition_name: exhName,
      museum_id: 1,
      created_at: new Date().toISOString(),
    };

    db.visitor_records.unshift(newRecord);
    saveStore(db);
    return { message: 'Daily attendance entry logged', visitorRecord: newRecord };
  },

  async updateVisitorRecord(id: number, record: { visit_date: string; visitor_count: number; exhibition_id?: number | null }): Promise<{ message: string; visitorRecord: VisitorRecord }> {
    const db = getStore();
    const index = db.visitor_records.findIndex((v) => Number(v.id) === Number(id));
    if (index === -1) throw new Error('Visitor record not found');

    let exhName = db.visitor_records[index].exhibition_name;
    if (record.exhibition_id) {
      const exh = db.exhibitions.find((e) => Number(e.id) === Number(record.exhibition_id));
      if (exh) exhName = exh.name;
    }

    db.visitor_records[index] = {
      ...db.visitor_records[index],
      visit_date: record.visit_date,
      visitor_count: Number(record.visitor_count),
      exhibition_id: record.exhibition_id,
      exhibition_name: exhName,
    };

    saveStore(db);
    return { message: 'Visitor entry updated', visitorRecord: db.visitor_records[index] };
  },

  async deleteVisitorRecord(id: number): Promise<{ message: string }> {
    const db = getStore();
    db.visitor_records = db.visitor_records.filter((v) => Number(v.id) !== Number(id));
    saveStore(db);
    return { message: 'Visitor entry removed' };
  },

  // Analytics
  async getAnalyticsSummary(): Promise<{ summary: AnalyticsSummary }> {
    const db = getStore();
    const totalVisitors = db.visitor_records.reduce((sum, v) => sum + Number(v.visitor_count), 0);
    const totalRestCost = db.restoration_records.reduce((sum, r) => sum + Number(r.cost || 0), 0);

    const trend = db.visitor_records
      .slice(0, 10)
      .map((v) => ({ visit_date: v.visit_date, daily_count: Number(v.visitor_count) }))
      .reverse();

    return {
      summary: {
        totalArtifacts: db.artifacts.length,
        totalVisitors,
        activeExhibitions: db.exhibitions.filter((e) => e.status === 'Active').length,
        totalExhibitions: db.exhibitions.length,
        conservationRecords: db.conservation_records.length,
        restorationRecords: db.restoration_records.length,
        totalRestorationCost: totalRestCost,
        recentArtifacts: db.artifacts.slice(0, 5),
        recentExhibitions: db.exhibitions.slice(0, 4),
        recentConservation: db.conservation_records.slice(0, 4),
        recentRestoration: db.restoration_records.slice(0, 4),
        visitorTrend: trend,
      },
    };
  },

  async getVisitorAnalytics(): Promise<{
    dailyTrend: { visit_date: string; count: number }[];
    byExhibition: { exhibition_name: string; total_visitors: number }[];
    weekdayAverages: { day: string; average: number; total: number }[];
  }> {
    const db = getStore();
    const dailyMap: Record<string, number> = {};
    db.visitor_records.forEach((v) => {
      dailyMap[v.visit_date] = (dailyMap[v.visit_date] || 0) + Number(v.visitor_count);
    });

    const dailyTrend = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([visit_date, count]) => ({ visit_date, count }));

    const exhMap: Record<string, number> = {};
    db.visitor_records.forEach((v) => {
      const name = v.exhibition_name || 'General Admission';
      exhMap[name] = (exhMap[name] || 0) + Number(v.visitor_count);
    });

    const byExhibition = Object.entries(exhMap).map(([exhibition_name, total_visitors]) => ({
      exhibition_name,
      total_visitors,
    }));

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayTotals: Record<string, { sum: number; count: number }> = {};
    days.forEach((d) => (dayTotals[d] = { sum: 0, count: 0 }));

    db.visitor_records.forEach((v) => {
      const dayName = days[new Date(v.visit_date).getDay()];
      dayTotals[dayName].sum += Number(v.visitor_count);
      dayTotals[dayName].count += 1;
    });

    const weekdayAverages = days.map((day) => ({
      day,
      average: dayTotals[day].count ? Math.round(dayTotals[day].sum / dayTotals[day].count) : 0,
      total: dayTotals[day].sum,
    }));

    return { dailyTrend, byExhibition, weekdayAverages };
  },

  async getArtifactAnalytics(): Promise<{
    byCategory: { category: string; count: number }[];
    byCondition: { condition: string; count: number }[];
    byLocation: { location: string; count: number }[];
  }> {
    const db = getStore();
    const catMap: Record<string, number> = {};
    const condMap: Record<string, number> = {};
    const locMap: Record<string, number> = {};

    db.artifacts.forEach((a) => {
      catMap[a.category] = (catMap[a.category] || 0) + 1;
      condMap[a.condition] = (condMap[a.condition] || 0) + 1;
      locMap[a.location] = (locMap[a.location] || 0) + 1;
    });

    return {
      byCategory: Object.entries(catMap).map(([category, count]) => ({ category, count })),
      byCondition: Object.entries(condMap).map(([condition, count]) => ({ condition, count })),
      byLocation: Object.entries(locMap).map(([location, count]) => ({ location, count })),
    };
  },

  async getConservationAnalytics(): Promise<{
    conditionBefore: { condition_before: string; count: number }[];
    conditionAfter: { condition_after: string; count: number }[];
    conservatorWorkload: { conservator: string; count: number }[];
  }> {
    const db = getStore();
    const cbMap: Record<string, number> = {};
    const caMap: Record<string, number> = {};
    const consMap: Record<string, number> = {};

    db.conservation_records.forEach((c) => {
      cbMap[c.condition_before] = (cbMap[c.condition_before] || 0) + 1;
      caMap[c.condition_after] = (caMap[c.condition_after] || 0) + 1;
      consMap[c.conservator] = (consMap[c.conservator] || 0) + 1;
    });

    return {
      conditionBefore: Object.entries(cbMap).map(([condition_before, count]) => ({ condition_before, count })),
      conditionAfter: Object.entries(caMap).map(([condition_after, count]) => ({ condition_after, count })),
      conservatorWorkload: Object.entries(consMap).map(([conservator, count]) => ({ conservator, count })),
    };
  },

  async getRestorationAnalytics(): Promise<{
    byStatus: { status: string; count: number; total_cost: number }[];
    byType: { restoration_type: string; count: number; total_cost: number }[];
  }> {
    const db = getStore();
    const statusMap: Record<string, { count: number; total_cost: number }> = {};
    const typeMap: Record<string, { count: number; total_cost: number }> = {};

    db.restoration_records.forEach((r) => {
      if (!statusMap[r.status]) statusMap[r.status] = { count: 0, total_cost: 0 };
      statusMap[r.status].count += 1;
      statusMap[r.status].total_cost += Number(r.cost) || 0;

      if (!typeMap[r.restoration_type]) typeMap[r.restoration_type] = { count: 0, total_cost: 0 };
      typeMap[r.restoration_type].count += 1;
      typeMap[r.restoration_type].total_cost += Number(r.cost) || 0;
    });

    return {
      byStatus: Object.entries(statusMap).map(([status, d]) => ({ status, count: d.count, total_cost: d.total_cost })),
      byType: Object.entries(typeMap).map(([restoration_type, d]) => ({
        restoration_type,
        count: d.count,
        total_cost: d.total_cost,
      })),
    };
  },

  // Reports
  async getReport(reportType: string, _startDate?: string, _endDate?: string): Promise<{ report: any }> {
    const db = getStore();
    if (reportType === 'artifacts') {
      return {
        report: {
          title: 'Official Museum Artifact Catalog Report',
          generatedAt: new Date().toISOString(),
          museum: db.museum.name,
          items: db.artifacts,
        },
      };
    }
    if (reportType === 'conservation') {
      return {
        report: {
          title: 'Conservation & Condition Assessment Log Report',
          generatedAt: new Date().toISOString(),
          museum: db.museum.name,
          items: db.conservation_records,
        },
      };
    }
    if (reportType === 'visitors') {
      return {
        report: {
          title: 'Visitor Attendance & Footfall Audit Report',
          generatedAt: new Date().toISOString(),
          museum: db.museum.name,
          items: db.visitor_records,
        },
      };
    }
    return {
      report: {
        title: 'Museum Management Comprehensive Audit Report',
        generatedAt: new Date().toISOString(),
        museum: db.museum.name,
        totalArtifacts: db.artifacts.length,
        totalExhibitions: db.exhibitions.length,
        totalVisitors: db.visitor_records.reduce((acc, v) => acc + Number(v.visitor_count), 0),
        totalRestorationCost: db.restoration_records.reduce((acc, r) => acc + Number(r.cost || 0), 0),
      },
    };
  },
};
