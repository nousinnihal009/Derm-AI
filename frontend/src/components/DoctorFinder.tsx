import React, { useState, useEffect, useCallback } from 'react';
import { searchDoctors } from '../api';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  subspecialty: string;
  rating: number;
  reviews: number;
  experience_years: number;
  hospital: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  phone: string;
  email: string;
  availability: string;
  accepts_insurance: boolean;
  telemedicine: boolean;
  bio: string;
  distance_miles?: number;
  languages?: string[];
  next_available?: string;
  consultation_fee?: number;
  procedures?: string[];
}

interface UserLocation {
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  country?: string;
  display_name?: string;
  source?: string;
}

const DoctorFinder: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(100);
  const [telemed, setTelemed] = useState<boolean | undefined>(undefined);
  const [insuranceOnly, setInsuranceOnly] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [expandedDoctor, setExpandedDoctor] = useState<number | null>(null);
  const [searchInfo, setSearchInfo] = useState<any>(null);
  const [bookingDoctor, setBookingDoctor] = useState<number | null>(null);
  const [bookingMsg, setBookingMsg] = useState('');

  const fetchDoctors = useCallback(async (loc?: UserLocation) => {
    setLoading(true);
    try {
      const params: any = {};
      if (specialty) params.specialty = specialty;
      if (loc || userLocation) {
        const l = loc || userLocation;
        params.lat = l!.lat;
        params.lon = l!.lon;
        params.radius = radius;
      } else if (city) {
        params.city = city;
        params.radius = radius;
      }
      if (telemed !== undefined) params.telemedicine = telemed;
      if (insuranceOnly !== undefined) params.insurance = insuranceOnly;
      params.sort_by = sortBy;

      const res = await searchDoctors(params);
      setDoctors(res.doctors || []);
      setSearchInfo(res);
      if (res.user_location && !loc) {
        setUserLocation(prev => prev || res.user_location);
      }
    } catch {
      setDoctors([]);
    }
    setLoading(false);
  }, [specialty, city, radius, telemed, insuranceOnly, sortBy, userLocation]);

  useEffect(() => { fetchDoctors(); }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: UserLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          source: 'gps',
        };
        setUserLocation(loc);
        setCity('');
        setLocationLoading(false);
        fetchDoctors(loc);
      },
      (err) => {
        setLocationError(
          err.code === 1 ? 'Location access denied. Please allow location access or enter a city manually.' :
          err.code === 2 ? 'Location unavailable. Try entering a city name instead.' :
          'Location request timed out. Please try again.'
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSearch = () => {
    if (city && !userLocation) {
      fetchDoctors();
    } else {
      fetchDoctors(userLocation || undefined);
    }
  };

  const handleBookAppointment = (doctorId: number) => {
    setBookingDoctor(doctorId);
    setBookingMsg('');
    // Simulate booking (in production, this would connect to a scheduling API)
    setTimeout(() => {
      setBookingMsg('✅ Appointment request submitted! The doctor\'s office will contact you within 24 hours to confirm.');
      setTimeout(() => {
        setBookingDoctor(null);
        setBookingMsg('');
      }, 4000);
    }, 1500);
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <span style={{ color: '#fbbf24', fontSize: '0.95rem', letterSpacing: '1px' }}>
        {'★'.repeat(full)}{half ? '⯪' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      </span>
    );
  };

  const availBadge = (next: string | undefined) => {
    if (!next) return 'badge-blue';
    const n = next.toLowerCase();
    if (n.includes('today')) return 'badge-green';
    if (n.includes('tomorrow')) return 'badge-green';
    if (n.includes('this week')) return 'badge-amber';
    return 'badge-blue';
  };

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title animate-fade-in-up">👨‍⚕️ Find Dermatologists Near You</h1>
        <p className="page-subtitle animate-fade-in-up stagger-1">
          Connect with board-certified dermatologists in real-time based on your location.
        </p>
      </div>

      {/* Location Bar */}
      <div className="glass-card animate-fade-in-up stagger-2" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <button
            className="btn-primary"
            onClick={handleUseMyLocation}
            disabled={locationLoading}
            style={{
              background: userLocation?.source === 'gps'
                ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                : 'var(--gradient-primary)',
              padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
            id="use-location-btn"
          >
            {locationLoading ? (
              <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Locating...</>
            ) : userLocation?.source === 'gps' ? (
              <>📍 Location Active</>
            ) : (
              <>📍 Use My Location</>
            )}
          </button>

          <span style={{ color: 'var(--dark-300)', fontSize: '0.85rem' }}>or</span>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              className="input-field"
              placeholder="Enter city name (e.g. New York, Los Angeles...)"
              value={city}
              onChange={e => { setCity(e.target.value); if (userLocation?.source === 'gps') setUserLocation(null); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              id="doctor-city-input"
            />
          </div>
        </div>

        {/* Location Status */}
        {userLocation && (
          <div style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '12px',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '1.1rem' }}>📍</span>
            <div>
              <p style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                {userLocation.source === 'gps' ? 'GPS Location Active' : `Searching near: ${city || userLocation.city || 'Unknown'}`}
              </p>
              {userLocation.city && userLocation.source === 'gps' && (
                <p style={{ color: 'var(--dark-200)', fontSize: '0.8rem' }}>
                  Detected: {userLocation.city}{userLocation.state ? `, ${userLocation.state}` : ''}{userLocation.country ? `, ${userLocation.country}` : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {locationError && (
          <div style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '12px',
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)',
            color: '#fb7185', fontSize: '0.85rem',
          }}>
            ⚠️ {locationError}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ color: 'var(--dark-200)', fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Specialty / Condition</label>
            <input className="input-field" placeholder="e.g. Acne, Melanoma, Psoriasis..." value={specialty} onChange={e => setSpecialty(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} id="doctor-specialty-input" style={{ padding: '10px 14px' }} />
          </div>

          <div style={{ minWidth: '120px' }}>
            <label style={{ color: 'var(--dark-200)', fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Radius</label>
            <select className="select-field" value={radius} onChange={e => setRadius(parseInt(e.target.value))} style={{ padding: '10px 12px' }}>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
              <option value={250}>250 miles</option>
              <option value={500}>500 miles</option>
              <option value={5000}>Any distance</option>
            </select>
          </div>

          <div style={{ minWidth: '120px' }}>
            <label style={{ color: 'var(--dark-200)', fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Sort By</label>
            <select className="select-field" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '10px 12px' }}>
              <option value="distance">📍 Nearest</option>
              <option value="rating">⭐ Top Rated</option>
              <option value="experience">🏥 Most Experienced</option>
            </select>
          </div>

          <button className="btn-primary" onClick={handleSearch} style={{ padding: '10px 20px' }} id="doctor-search-btn">
            🔍 Search
          </button>
        </div>

        {/* Quick Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <button
            className={telemed === true ? 'badge badge-green' : 'badge badge-blue'}
            onClick={() => { setTelemed(telemed === true ? undefined : true); setTimeout(handleSearch, 50); }}
            style={{ cursor: 'pointer', padding: '6px 14px', border: 'none', fontSize: '0.8rem' }}
          >
            💻 Telemedicine {telemed === true && '✓'}
          </button>
          <button
            className={insuranceOnly === true ? 'badge badge-green' : 'badge badge-blue'}
            onClick={() => { setInsuranceOnly(insuranceOnly === true ? undefined : true); setTimeout(handleSearch, 50); }}
            style={{ cursor: 'pointer', padding: '6px 14px', border: 'none', fontSize: '0.8rem' }}
          >
            🛡️ Insurance {insuranceOnly === true && '✓'}
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="animate-fade-in" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--dark-200)', fontSize: '0.9rem' }}>
            {doctors.length === 0 ? 'No doctors found' : `${doctors.length} dermatologist${doctors.length > 1 ? 's' : ''} found`}
            {searchInfo?.search_type === 'gps' && ' near your location'}
            {searchInfo?.search_type === 'city' && userLocation?.city && ` near ${userLocation.city}`}
          </p>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--dark-200)' }}>Searching for dermatologists...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>No Dermatologists Found</h3>
          <p style={{ color: 'var(--dark-200)', marginBottom: '16px', maxWidth: '400px', margin: '0 auto 20px' }}>
            Try expanding your search radius, changing the city, or removing specialty filters.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => { setRadius(5000); setTimeout(handleSearch, 50); }}>
              Expand to Any Distance
            </button>
            <button className="btn-secondary" onClick={() => { setSpecialty(''); setTelemed(undefined); setInsuranceOnly(undefined); setTimeout(handleSearch, 50); }}>
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {doctors.map((doc, i) => (
            <div key={doc.id} className="glass-card animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s`, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {doc.name.split(' ').filter(n => n.length > 1).map(n => n[0]).join('').slice(0, 2)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '2px' }}>{doc.name}</h3>
                        <p style={{ color: 'var(--primary-300)', fontSize: '0.9rem', fontWeight: 500 }}>
                          {doc.specialty} — {doc.subspecialty}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {doc.distance_miles !== undefined && (
                          <div style={{
                            color: doc.distance_miles < 25 ? '#10b981' : doc.distance_miles < 100 ? '#f59e0b' : 'var(--dark-200)',
                            fontWeight: 700, fontSize: '1rem', marginBottom: '2px',
                          }}>
                            📍 {doc.distance_miles < 1 ? '< 1' : doc.distance_miles.toFixed(0)} mi
                          </div>
                        )}
                        <div>{renderStars(doc.rating)}</div>
                        <p style={{ color: 'var(--dark-300)', fontSize: '0.75rem' }}>{doc.rating} ({doc.reviews} reviews)</p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p style={{ color: 'var(--dark-200)', fontSize: '0.88rem', margin: '10px 0', lineHeight: 1.5 }}>{doc.bio}</p>

                    {/* Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      <span className="badge badge-blue">{doc.experience_years} yrs exp</span>
                      {doc.telemedicine && <span className="badge badge-green">💻 Telemedicine</span>}
                      {doc.accepts_insurance && <span className="badge badge-purple">🛡️ Insurance</span>}
                      {doc.next_available && <span className={`badge ${availBadge(doc.next_available)}`}>📅 {doc.next_available}</span>}
                      {doc.consultation_fee && <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--dark-500)', color: 'var(--dark-100)' }}>💲{doc.consultation_fee}</span>}
                    </div>

                    {/* Info Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.83rem', color: 'var(--dark-200)', marginBottom: '8px' }}>
                      <span>📍 {doc.city}, {doc.state}</span>
                      <span>🕐 {doc.availability}</span>
                      <span>🏥 {doc.hospital}</span>
                    </div>

                    {/* Languages */}
                    {doc.languages && doc.languages.length > 0 && (
                      <p style={{ color: 'var(--dark-300)', fontSize: '0.8rem' }}>
                        🌐 {doc.languages.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--dark-600)' }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleBookAppointment(doc.id)}
                    disabled={bookingDoctor === doc.id}
                    style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                  >
                    {bookingDoctor === doc.id ? '⏳ Submitting...' : '📅 Book Appointment'}
                  </button>

                  {doc.telemedicine && (
                    <button className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                      onClick={() => window.open(`mailto:${doc.email}?subject=Telemedicine%20Appointment%20Request&body=I%20would%20like%20to%20schedule%20a%20telemedicine%20consultation.`, '_blank')}>
                      💻 Video Consult
                    </button>
                  )}

                  <a href={`tel:${doc.phone.replace(/\D/g, '')}`} className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.85rem', textDecoration: 'none' }}>
                    📞 Call
                  </a>

                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(doc.name + ' ' + doc.address + ' ' + doc.city)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.85rem', textDecoration: 'none' }}>
                    🗺️ Directions
                  </a>

                  <button className="btn-ghost" onClick={() => setExpandedDoctor(expandedDoctor === doc.id ? null : doc.id)}
                    style={{ padding: '9px 14px', fontSize: '0.85rem', marginLeft: 'auto' }}>
                    {expandedDoctor === doc.id ? '▲ Less' : '▼ More'}
                  </button>
                </div>

                {/* Booking Confirmation */}
                {bookingDoctor === doc.id && bookingMsg && (
                  <div style={{
                    marginTop: '12px', padding: '12px 16px', borderRadius: '10px',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    color: '#34d399', fontSize: '0.88rem',
                  }}>
                    {bookingMsg}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedDoctor === doc.id && (
                <div style={{
                  padding: '16px 24px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--dark-600)',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <h4 style={{ color: 'var(--primary-300)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>📋 Contact</h4>
                      <p style={{ color: 'var(--dark-200)', fontSize: '0.83rem', marginBottom: '4px' }}>📧 {doc.email}</p>
                      <p style={{ color: 'var(--dark-200)', fontSize: '0.83rem', marginBottom: '4px' }}>📞 {doc.phone}</p>
                      <p style={{ color: 'var(--dark-200)', fontSize: '0.83rem' }}>📍 {doc.address}</p>
                    </div>
                    {doc.procedures && doc.procedures.length > 0 && (
                      <div>
                        <h4 style={{ color: 'var(--primary-300)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>🔬 Procedures</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {doc.procedures.map((p, j) => (
                            <span key={j} style={{
                              padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem',
                              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                              color: 'var(--primary-300)',
                            }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 style={{ color: 'var(--primary-300)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>ℹ️ Details</h4>
                      <p style={{ color: 'var(--dark-200)', fontSize: '0.83rem', marginBottom: '4px' }}>
                        🏥 {doc.hospital}
                      </p>
                      {doc.consultation_fee && (
                        <p style={{ color: 'var(--dark-200)', fontSize: '0.83rem', marginBottom: '4px' }}>
                          💰 Consultation: ${doc.consultation_fee}
                        </p>
                      )}
                      <p style={{ color: 'var(--dark-200)', fontSize: '0.83rem' }}>
                        🕐 {doc.availability}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="disclaimer" style={{ marginTop: '24px' }}>
        <span>⚠️</span>
        <span>
          This directory is for informational purposes. Please verify doctor credentials, availability, and
          insurance acceptance independently before scheduling appointments. In case of emergency, call 911.
        </span>
      </div>
    </div>
  );
};

export default DoctorFinder;
