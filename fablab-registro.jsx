import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function FabLabRegistro() {
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    correo: '',
    tipoVisita: '',
    proposito: '',
    telefono: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    nombre: '',
    rut: '',
    correo: '',
    tipoVisita: '',
    telefono: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [visitCount, setVisitCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVisitCount();
  }, []);

  const loadVisitCount = async () => {
    try {
      const result = await window.storage.get('fablab_visit_count');
      if (result) {
        setVisitCount(parseInt(result.value) || 0);
      }
    } catch (err) {
      setVisitCount(0);
    }
  };

  const formatRut = (value) => {
    const cleaned = value.replace(/[^\dkK]/g, '');
    if (cleaned.length <= 1) return cleaned;
    
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formatted}-${dv}`;
  };

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value);
    setFormData(prev => ({ ...prev, rut: formatted }));
    
    // Validate after formatting
    const error = validateField('rut', formatted);
    setFieldErrors(prev => ({ ...prev, rut: error }));
  };

  const validateRut = (rut) => {
    const cleaned = rut.replace(/[^\dkK]/g, '');
    if (cleaned.length < 2) return false;
    
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toLowerCase();
    
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const expectedDv = 11 - (sum % 11);
    const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'k' : expectedDv.toString();
    
    return dv === calculatedDv;
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    // Chilean phone number validation (optional field)
    if (!phone.trim()) return true; // Optional field
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.length >= 8 && cleaned.length <= 11;
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
        
      case 'rut':
        if (!value.trim()) {
          error = 'El RUT es requerido';
        } else if (!validateRut(value)) {
          error = 'RUT inválido';
        }
        break;
        
      case 'correo':
        if (!value.trim()) {
          error = 'El correo electrónico es requerido';
        } else if (!validateEmail(value)) {
          error = 'Correo electrónico inválido';
        }
        break;
        
      case 'tipoVisita':
        if (!value) {
          error = 'Seleccione el tipo de visita';
        }
        break;
        
      case 'telefono':
        if (!validatePhone(value)) {
          error = 'Número de teléfono inválido';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const isFormValid = () => {
    return !fieldErrors.nombre && 
           !fieldErrors.rut && 
           !fieldErrors.correo && 
           !fieldErrors.tipoVisita && 
           !fieldErrors.telefono &&
           formData.nombre.trim() && 
           formData.rut.trim() && 
           formData.correo.trim() && 
           formData.tipoVisita;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Final validation check
    if (!isFormValid()) {
      setError('Por favor complete todos los campos requeridos correctamente');
      setLoading(false);
      return;
    }

    // Guardar registro
    try {
      const timestamp = new Date().toISOString();
      const visitId = `visit_${Date.now()}`;
      
      const visitData = {
        ...formData,
        timestamp,
        fecha: new Date().toLocaleDateString('es-CL'),
        hora: new Date().toLocaleTimeString('es-CL')
      };

      await window.storage.set(visitId, JSON.stringify(visitData));
      
      // Actualizar contador
      const newCount = visitCount + 1;
      await window.storage.set('fablab_visit_count', newCount.toString());
      setVisitCount(newCount);

      setSubmitted(true);
      setLoading(false);

      // Reset después de 5 segundos
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          nombre: '',
          rut: '',
          correo: '',
          tipoVisita: '',
          proposito: '',
          telefono: ''
        });
      }, 5000);

    } catch (err) {
      setError('Error al guardar el registro. Intente nuevamente.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field in real-time
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
      }}>
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={64} strokeWidth={2} />
          </div>
          <h2 className="success-title">¡Registro Exitoso!</h2>
          <p className="success-text">
            Bienvenido al FAB LAB INACAP
          </p>
          <div className="success-details">
            <div className="detail-item">
              <Users size={18} />
              <span>Visita #{visitCount}</span>
            </div>
            <div className="detail-item">
              <Clock size={18} />
              <span>{new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div className="success-footer">
            Redirigiendo al formulario...
          </div>
        </div>

        <style jsx>{`
          .success-card {
            background: white;
            border-radius: 20px;
            padding: 48px 32px;
            max-width: 450px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(237, 28, 36, 0.15),
                        0 0 0 1px rgba(237, 28, 36, 0.1);
            animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .success-icon {
            color: #ED1C24;
            margin: 0 auto 24px;
            animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards;
          }

          .success-title {
            font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
            font-size: 32px;
            font-weight: 700;
            color: #2d2d2d;
            margin-bottom: 12px;
            animation: slideUp 0.6s ease-out 0.3s backwards;
          }

          .success-text {
            font-family: 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 16px;
            color: #666666;
            margin-bottom: 32px;
            animation: slideUp 0.6s ease-out 0.4s backwards;
          }

          .success-details {
            display: flex;
            justify-content: center;
            gap: 32px;
            padding: 24px;
            background: #fff5f5;
            border-radius: 12px;
            margin-bottom: 24px;
            border: 1px solid #ffe5e5;
            animation: slideUp 0.6s ease-out 0.5s backwards;
          }

          .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #ED1C24;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            font-weight: 600;
          }

          .success-footer {
            font-family: 'Open Sans', sans-serif;
            font-size: 13px;
            color: #999999;
            animation: fadeIn 0.6s ease-out 0.6s backwards;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.5);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-wrapper">
        {/* Header con Logo */}
        <div className="header">
          <div className="logo-container">
            <svg viewBox="0 0 220 60" className="logo">
              <rect x="0" y="0" width="40" height="60" fill="#ED1C24"/>
              <rect x="35" y="0" width="8" height="60" fill="#ED1C24"/>
              <text x="52" y="42" fontFamily="Arial, sans-serif" fontSize="38" fontWeight="bold" fill="#2d2d2d">inacap</text>
            </svg>
          </div>
          
          <div className="divider"></div>
          
          <h1 className="title">FAB LAB</h1>
          <p className="subtitle">Laboratorio de Fabricación Digital</p>
          <p className="subtitle-small">Sistema de Registro de Visitas</p>
          
          <div className="stats-bar">
            <div className="stat">
              <Users size={16} />
              <span>{visitCount} visitas registradas</span>
            </div>
            <div className="stat">
              <Calendar size={16} />
              <span>{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="form">
          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group full">
              <label className="label">Nombre Completo *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`input ${fieldErrors.nombre ? 'input-error' : ''}`}
                placeholder="Ej: Juan Pérez González"
                required
              />
              {fieldErrors.nombre && <span className="field-error">{fieldErrors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="label">RUT *</label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleRutChange}
                className={`input ${fieldErrors.rut ? 'input-error' : ''}`}
                placeholder="12.345.678-9"
                maxLength={12}
                required
              />
              {fieldErrors.rut && <span className="field-error">{fieldErrors.rut}</span>}
            </div>

            <div className="form-group">
              <label className="label">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`input ${fieldErrors.telefono ? 'input-error' : ''}`}
                placeholder="+56 9 1234 5678"
              />
              {fieldErrors.telefono && <span className="field-error">{fieldErrors.telefono}</span>}
            </div>

            <div className="form-group full">
              <label className="label">Correo Electrónico *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={`input ${fieldErrors.correo ? 'input-error' : ''}`}
                placeholder="correo@ejemplo.com"
                required
              />
              {fieldErrors.correo && <span className="field-error">{fieldErrors.correo}</span>}
            </div>

            <div className="form-group full">
              <label className="label">Tipo de Visita *</label>
              <div className="radio-group">
                {[
                  { value: 'estudiante', label: 'Estudiante INACAP' },
                  { value: 'docente', label: 'Docente' },
                  { value: 'externo', label: 'Visitante Externo' },
                  { value: 'empresa', label: 'Empresa/Institución' }
                ].map(option => (
                  <label key={option.value} className="radio-label">
                    <input
                      type="radio"
                      name="tipoVisita"
                      value={option.value}
                      checked={formData.tipoVisita === option.value}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radio-custom" />
                    <span className="radio-text">{option.label}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.tipoVisita && <span className="field-error">{fieldErrors.tipoVisita}</span>}
            </div>

            <div className="form-group full">
              <label className="label">Propósito de la Visita</label>
              <textarea
                name="proposito"
                value={formData.proposito}
                onChange={handleChange}
                className="textarea"
                placeholder="Ej: Impresión 3D, corte láser, prototipado, capacitación..."
                rows={3}
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading || !isFormValid()}>
            {loading ? (
              <>
                <div className="spinner" />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                <span>Registrar Visita</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="footer">
          <div className="footer-line" />
          <p className="footer-text">
            Al registrarte aceptas el uso de tus datos para estadísticas del laboratorio
          </p>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #ED1C24 0%, #c41820 100%);
        }

        .form-wrapper {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 700px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08),
                      0 0 0 1px rgba(0, 0, 0, 0.05);
          position: relative;
          animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header {
          text-align: center;
          margin-bottom: 36px;
          padding-bottom: 32px;
          border-bottom: 2px solid #f0f0f0;
        }

        .logo-container {
          margin-bottom: 24px;
          animation: fadeIn 0.8s ease-out;
        }

        .logo {
          height: 50px;
          width: auto;
        }

        .divider {
          width: 60px;
          height: 3px;
          background: #ED1C24;
          margin: 24px auto;
          border-radius: 2px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .title {
          font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: #2d2d2d;
          letter-spacing: 1px;
          margin-bottom: 8px;
          animation: slideUp 0.8s ease-out 0.2s backwards;
        }

        .subtitle {
          font-family: 'Open Sans', 'Helvetica Neue', sans-serif;
          font-size: 16px;
          color: #666666;
          font-weight: 600;
          margin-bottom: 4px;
          animation: slideUp 0.8s ease-out 0.3s backwards;
        }

        .subtitle-small {
          font-family: 'Open Sans', 'Helvetica Neue', sans-serif;
          font-size: 13px;
          color: #999999;
          margin-bottom: 24px;
          animation: slideUp 0.8s ease-out 0.4s backwards;
        }

        .stats-bar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: slideUp 0.8s ease-out 0.5s backwards;
        }

        .stat {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #666666;
          font-family: 'Open Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          background: #fff5f5;
          border-radius: 8px;
          border: 1px solid #ffe5e5;
        }

        .stat svg {
          color: #ED1C24;
        }

        .form {
          animation: fadeIn 0.8s ease-out 0.6s backwards;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff5f5;
          border: 2px solid #ED1C24;
          color: #ED1C24;
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .label {
          font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #2d2d2d;
          letter-spacing: -0.01em;
        }

        .input,
        .textarea {
          font-family: 'Open Sans', 'Helvetica Neue', sans-serif;
          font-size: 15px;
          padding: 14px 16px;
          border: 2px solid #e5e5e5;
          border-radius: 8px;
          background: #fafafa;
          color: #2d2d2d;
          transition: all 0.2s ease;
        }

        .input:focus,
        .textarea:focus {
          outline: none;
          border-color: #ED1C24;
          background: white;
          box-shadow: 0 0 0 4px rgba(237, 28, 36, 0.1);
        }

        .input-error {
          border-color: #ED1C24 !important;
          background: #fff5f5 !important;
        }

        .input::placeholder,
        .textarea::placeholder {
          color: #aaaaaa;
        }

        .textarea {
          resize: vertical;
          min-height: 90px;
        }

        .field-error {
          font-family: 'Open Sans', sans-serif;
          font-size: 12px;
          color: #ED1C24;
          margin-top: 4px;
          font-weight: 600;
          animation: fadeInError 0.3s ease-out;
        }

        @keyframes fadeInError {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .radio-group {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border: 2px solid #e5e5e5;
          border-radius: 8px;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .radio-label:hover {
          border-color: #ED1C24;
          background: white;
        }

        .radio-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .radio-input:checked + .radio-custom {
          background: #ED1C24;
          border-color: #ED1C24;
        }

        .radio-input:checked + .radio-custom::after {
          opacity: 1;
          transform: scale(1);
        }

        .radio-input:checked ~ .radio-text {
          color: #ED1C24;
          font-weight: 700;
        }

        .radio-custom {
          width: 20px;
          height: 20px;
          border: 2px solid #cccccc;
          border-radius: 50%;
          background: white;
          flex-shrink: 0;
          position: relative;
          transition: all 0.2s ease;
        }

        .radio-custom::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .radio-text {
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #666666;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .submit-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 32px;
          background: linear-gradient(135deg, #ED1C24 0%, #c41820 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(237, 28, 36, 0.3);
          text-transform: uppercase;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(237, 28, 36, 0.4);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .footer {
          margin-top: 32px;
          padding-top: 24px;
        }

        .footer-line {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #e5e5e5 50%, transparent 100%);
          margin-bottom: 16px;
        }

        .footer-text {
          font-family: 'Open Sans', sans-serif;
          font-size: 12px;
          color: #999999;
          text-align: center;
          line-height: 1.6;
        }

        @media (max-width: 640px) {
          .form-wrapper {
            padding: 28px 20px;
            border-radius: 12px;
          }

          .logo {
            height: 40px;
          }

          .title {
            font-size: 28px;
          }

          .subtitle {
            font-size: 14px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group {
            grid-column: 1;
          }

          .radio-group {
            grid-template-columns: 1fr;
          }

          .stats-bar {
            gap: 8px;
          }

          .stat {
            font-size: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
  );
}
