import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Artifact, Exhibition } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Landmark,
  MapPin,
  Clock,
  Calendar,
  Lock,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface PublicLandingPageProps {
  onGoToLogin: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ onGoToLogin }) => {
  const [data, setData] = useState<{
    museum: any;
    featuredArtifacts: Artifact[];
    publicExhibitions: Exhibition[];
    stats: { total_artifacts: number; total_exhibitions: number; total_visitors: number };
  }>({
    museum: {
      name: 'Government Museum Chennai',
      museum_code: 'CHN-MUS-001',
      location: 'Egmore, Chennai, Tamil Nadu',
    },
    featuredArtifacts: [
      {
        id: 1,
        name: 'Bronze Chola Nataraja',
        category: 'Sculpture',
        period: 'Chola Dynasty (11th Century CE)',
        origin: 'Thanjavur, Tamil Nadu',
        material: 'Bronze (Panchaloha)',
        description: 'Iconic masterwork depicting Lord Shiva performing the cosmic dance of creation and destruction (Ananda Tandava).',
        condition: 'Good',
        location: 'Bronze Gallery - Display Case 01',
        museum_id: 1,
        image_url: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 2,
        name: 'Amaravati Limestone Relief - Buddha Life Scenes',
        category: 'Archaeology',
        period: 'Satavahana Period (2nd Century BCE)',
        origin: 'Amaravati Stupa, Andhra Pradesh',
        material: 'Palnad Limestone / Marble',
        description: 'Intricately carved drum slab relief illustrating the Great Departure of Prince Siddhartha.',
        condition: 'Fragile',
        location: 'Buddhist Sculpture Hall - Bay 4',
        museum_id: 1,
        image_url: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 3,
        name: 'Roman Terra Sigillata Amphora',
        category: 'Numismatics & Trade Antiquities',
        period: '1st Century CE (Augustan Era)',
        origin: 'Arikamedu Coastal Trade Site',
        material: 'Terracotta',
        description: 'Two-handled transport vessel recovered from coastal trade ports.',
        condition: 'Good',
        location: 'Maritime Trade Gallery - Case 08',
        museum_id: 1,
        image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 4,
        name: 'Tanjore Gold Foil Painting of Krishna',
        category: 'Painting',
        period: 'Maratha Period (18th Century CE)',
        origin: 'Thanjavur, Tamil Nadu',
        material: 'Teak Wood, Gold Foil, Semi-precious Stones',
        description: 'Opulent traditional painting characterized by embossed gesso work and embedded gemstones.',
        condition: 'Pristine',
        location: 'National Art Gallery - Room 2',
        museum_id: 1,
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      },
    ],
    publicExhibitions: [
      {
        id: 1,
        name: 'Splendours of the Chola Empire: Bronzes & Inscriptions',
        description: 'A grand international exhibition celebrating the supreme aesthetic achievements and maritime outreach of the Imperial Cholas.',
        start_date: '2026-08-01',
        end_date: '2026-11-30',
        location: 'Special Exhibition Pavilion A',
        status: 'Active',
        museum_id: 1,
      },
      {
        id: 2,
        name: 'Spices, Silk and Gold: Ancient Indo-Roman Maritime Trade',
        description: 'Unveiling Mediterranean amphorae, Roman gold coin hoards, and port excavations.',
        start_date: '2026-09-01',
        end_date: '2026-12-15',
        location: 'Pantheon Centenary Hall',
        status: 'Active',
        museum_id: 1,
      },
    ],
    stats: {
      total_artifacts: 8,
      total_exhibitions: 4,
      total_visitors: 12450,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  useEffect(() => {
    async function loadPublicData() {
      try {
        const res = await api.getPublicShowcase();
        if (res && res.featuredArtifacts) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load public showcase:', err);
      }
    }
    loadPublicData();
  }, []);

  const categories = ['All', 'Sculpture', 'Archaeology', 'Painting', 'Numismatics & Trade Antiquities', 'Arms & Armour', 'Manuscripts'];

  const filteredArtifacts = data?.featuredArtifacts.filter((art) => {
    if (selectedCategory === 'All') return true;
    return art.category === selectedCategory;
  }) || [];

  return (
    <div className="public-landing-container">
      {/* Top Public Header */}
      <header className="public-header">
        <div className="public-header-content">
          <div className="public-brand">
            <div className="public-logo-icon">
              <Landmark size={24} />
            </div>
            <div>
              <span className="public-brand-title">HeritageVault</span>
              <span className="public-brand-subtitle">Government Museum Chennai</span>
            </div>
          </div>

          <div className="public-header-actions">
            <a href="#about" className="public-nav-link">About</a>
            <a href="#exhibitions" className="public-nav-link">Exhibitions</a>
            <a href="#artifacts" className="public-nav-link">Collections</a>
            <a href="#visit" className="public-nav-link">Plan Visit</a>
            <button className="btn-staff-login" onClick={onGoToLogin}>
              <Lock size={15} />
              <span>Staff Portal Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="public-hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>ESTABLISHED 1851 • SECOND OLDEST MUSEUM IN INDIA</span>
          </div>
          <h1 className="hero-title">
            Preserving Thousands of Years of South Indian Civilization & Art
          </h1>
          <p className="hero-description">
            Welcome to the digital gateway of <strong>Government Museum Chennai</strong> in Egmore. Explore the priceless Imperial Chola bronzes, Amaravati Buddhist reliefs, Roman trade antiquities, and majestic cultural legacies.
          </p>

          <div className="hero-cta-group">
            <a href="#artifacts" className="btn btn-gold btn-lg">
              Explore Digital Vault <ArrowRight size={18} />
            </a>
            <a href="#visit" className="btn btn-outline-white btn-lg">
              Visitor Information
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="hero-stats-bar">
            <div className="hero-stat-item">
              <span className="hero-stat-num">{Number(data?.stats?.total_artifacts) || 8}+</span>
              <span className="hero-stat-label">Preserved Artifacts</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-num">{Number(data?.stats?.total_exhibitions) || 4}</span>
              <span className="hero-stat-label">Special Exhibitions</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-num">{(Number(data?.stats?.total_visitors) || 12450).toLocaleString()}+</span>
              <span className="hero-stat-label">Annual Visitors</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-num">CHN-MUS-001</span>
              <span className="hero-stat-label">Heritage Registry Code</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="public-section bg-slate">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-pill">HISTORICAL LEGACY</span>
            <h2 className="section-title">The Pantheon Complex at Egmore</h2>
            <p className="section-subtitle">
              Spanning across 16.25 acres of lush colonial grounds, Government Museum Chennai houses 46 galleries dedicated to Archaeology, Numismatics, Zoology, Natural History, and Fine Arts.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <div className="about-card-icon">
                <Landmark size={28} />
              </div>
              <h3>World-Renowned Bronze Gallery</h3>
              <p>
                Home to the world's most magnificent collection of South Indian bronzes dating from Pallava, Chola, and Vijayanagara dynasties, featuring the celebrated 11th-century Nataraja.
              </p>
            </div>

            <div className="about-card">
              <div className="about-card-icon">
                <Layers size={28} />
              </div>
              <h3>Amaravati Buddhist Gallery</h3>
              <p>
                Preserving original 2nd-century BCE Palnad marble reliefs and sculptural stupa carvings recovered from the great Buddhist site of Amaravati in Guntur.
              </p>
            </div>

            <div className="about-card">
              <div className="about-card-icon">
                <Sparkles size={28} />
              </div>
              <h3>National Art Gallery</h3>
              <p>
                Housed in an exquisite Indo-Saracenic pink sandstone monument, showcasing Mughal miniatures, Tanjore gold foil masterpieces, and contemporary Indian works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Exhibitions Section */}
      <section id="exhibitions" className="public-section">
        <div className="section-container">
          <div className="section-header-between">
            <div>
              <span className="section-pill">CURATED EXPERIENCES</span>
              <h2 className="section-title">Current & Special Exhibitions</h2>
            </div>
          </div>

          <div className="exhibitions-public-grid">
            {isLoading ? (
              <div className="loading-placeholder">Loading active exhibitions...</div>
            ) : data?.publicExhibitions && data.publicExhibitions.length > 0 ? (
              data.publicExhibitions.map((exh) => (
                <div key={exh.id} className="public-exhibition-card">
                  <div className="exhibition-header-row">
                    <StatusBadge status={exh.status} type="exhibition" />
                    <span className="exh-location-text">
                      <MapPin size={14} /> {exh.location}
                    </span>
                  </div>
                  <h3 className="exhibition-card-title">{exh.name}</h3>
                  <p className="exhibition-card-desc">{exh.description}</p>
                  <div className="exhibition-footer-meta">
                    <Calendar size={15} />
                    <span>
                      {new Date(exh.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {exh.end_date ? ` — ${new Date(exh.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ' (Permanent Display)'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data-text">No active exhibitions scheduled at this time.</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Artifacts Section */}
      <section id="artifacts" className="public-section bg-slate">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-pill">DIGITAL REPOSITORY</span>
            <h2 className="section-title">Featured Museum Treasures</h2>
            <p className="section-subtitle">
              Selected masterworks from the Government Museum permanent collection. Click on any item to view curatorial provenance.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="category-filter-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Artifacts Grid */}
          <div className="public-artifacts-grid">
            {isLoading ? (
              <div className="loading-placeholder">Loading vault collection...</div>
            ) : (
              filteredArtifacts.map((art) => (
                <div
                  key={art.id}
                  className="public-artifact-card"
                  onClick={() => setSelectedArtifact(art)}
                >
                  <div className="artifact-image-container">
                    {art.image_url ? (
                      <img src={art.image_url} alt={art.name} className="artifact-img" loading="lazy" />
                    ) : (
                      <div className="artifact-placeholder-img">
                        <Landmark size={40} />
                      </div>
                    )}
                    <span className="artifact-category-tag">{art.category}</span>
                  </div>
                  <div className="artifact-card-body">
                    <h4 className="artifact-card-name">{art.name}</h4>
                    <p className="artifact-period">{art.period || 'Ancient Period'}</p>
                    <p className="artifact-origin">
                      <MapPin size={13} /> {art.origin || 'Tamil Nadu, India'}
                    </p>
                    <div className="artifact-card-footer">
                      <span className="artifact-location-label">{art.location}</span>
                      <StatusBadge status={art.condition} type="condition" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Plan Your Visit Section */}
      <section id="visit" className="public-section">
        <div className="section-container">
          <div className="visit-info-card">
            <div className="visit-left">
              <span className="section-pill">VISITOR ESSENTIALS</span>
              <h2 className="visit-title">Plan Your Visit to Egmore</h2>
              <p className="visit-text">
                Government Museum Chennai is situated in the heart of the city, easily accessible from Egmore Railway Station and Chennai Central.
              </p>

              <div className="visit-details-list">
                <div className="visit-detail-item">
                  <Clock className="visit-icon" size={20} />
                  <div>
                    <strong>Museum Timings</strong>
                    <p>Open Saturday to Thursday: 9:30 AM – 5:00 PM</p>
                    <p className="text-muted text-sm">Closed on Fridays and National Holidays</p>
                  </div>
                </div>

                <div className="visit-detail-item">
                  <MapPin className="visit-icon" size={20} />
                  <div>
                    <strong>Location & Address</strong>
                    <p>Pantheon Road, Egmore, Chennai, Tamil Nadu 600008</p>
                    <p className="text-muted text-sm">Museum Code: CHN-MUS-001</p>
                  </div>
                </div>

                <div className="visit-detail-item">
                  <Info className="visit-icon" size={20} />
                  <div>
                    <strong>Admission & Facilities</strong>
                    <p>General entry ₹20 (Adults), ₹10 (Children under 12)</p>
                    <p className="text-muted text-sm">Wheelchair accessibility, guided audio tours, and museum bookshop available.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="visit-right">
              <div className="staff-portal-callout">
                <Lock size={36} className="text-amber-500" />
                <h3>Authorized Staff Access</h3>
                <p>
                  Authorized museum staff can log in to manage collections, conservation logs, restoration projects, visitor statistics, and official audit reports.
                </p>
                <button className="btn btn-gold btn-full" onClick={onGoToLogin}>
                  Enter Staff Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="public-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Landmark size={20} />
              <span>HeritageVault</span>
            </div>
            <p>Digital Museum Management System • Government Museum Chennai</p>
            <p className="footer-address">Pantheon Complex, Egmore, Chennai, Tamil Nadu 600008, India</p>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Government Museum Chennai. All rights reserved.</span>
            <span>Single-Museum Architecture (CHN-MUS-001)</span>
          </div>
        </div>
      </footer>

      {/* Artifact Detail Modal for Public */}
      {selectedArtifact && (
        <div className="modal-backdrop" onClick={() => setSelectedArtifact(null)}>
          <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedArtifact.name}</h3>
                <p className="modal-subtitle">{selectedArtifact.category} • {selectedArtifact.period}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedArtifact(null)}>×</button>
            </div>
            <div className="modal-body modal-artifact-body">
              {selectedArtifact.image_url && (
                <div className="artifact-modal-image-wrapper">
                  <img src={selectedArtifact.image_url} alt={selectedArtifact.name} className="modal-artifact-img" />
                </div>
              )}
              <div className="artifact-modal-details">
                <div className="detail-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Origin / Discovery Site</span>
                    <span className="meta-val">{selectedArtifact.origin || 'Tamil Nadu, India'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Material Composition</span>
                    <span className="meta-val">{selectedArtifact.material || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Current Gallery Display</span>
                    <span className="meta-val">{selectedArtifact.location}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Preservation Condition</span>
                    <span className="meta-val"><StatusBadge status={selectedArtifact.condition} type="condition" /></span>
                  </div>
                </div>

                <div className="artifact-modal-desc-box">
                  <h4>Curatorial Description</h4>
                  <p>{selectedArtifact.description || 'No detailed description recorded.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
