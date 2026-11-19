import React, { useState } from 'react';
import { Award, Download, Printer, X } from 'lucide-react';
import { Certificate } from '../types/lms';
import { useLMS } from '../store/LMSContext';
import { BrandMark } from './BrandMark';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

function downloadCertificateSVG(cert: Certificate) {
  const safeName = cert.userName.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const safeModule = cert.moduleTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="840" viewBox="0 0 1200 840">
  <rect width="1200" height="840" fill="#FFFFFF"/>
  <rect x="36" y="36" width="1128" height="768" fill="none" stroke="#09090B" stroke-width="2"/>
  <rect x="48" y="48" width="1104" height="744" fill="none" stroke="#E4E4E7" stroke-width="1"/>
  <text x="90" y="120" font-family="sans-serif" font-size="22" font-weight="700" fill="#09090B">INTERGRID IT</text>
  <text x="1110" y="120" text-anchor="end" font-family="monospace" font-size="16" fill="#71717A">${cert.credentialId}</text>
  <line x1="90" y1="150" x2="1110" y2="150" stroke="#E4E4E7" stroke-width="1"/>
  <text x="90" y="245" font-family="monospace" font-size="15" letter-spacing="3" fill="#71717A">CERTIFICATE OF ATTENDANCE</text>
  <text x="90" y="330" font-family="sans-serif" font-size="52" font-weight="700" fill="#09090B">${safeName}</text>
  <text x="90" y="390" font-family="sans-serif" font-size="20" fill="#71717A">has successfully completed all required curriculum chapters and assessments for</text>
  <text x="90" y="460" font-family="sans-serif" font-size="32" font-weight="600" fill="#09090B">${safeModule}</text>
  <text x="90" y="505" font-family="monospace" font-size="16" fill="#71717A">Module Code: ${cert.moduleCode} · Template: ${cert.templateName}</text>
  <line x1="90" y1="640" x2="1110" y2="640" stroke="#E4E4E7" stroke-width="1"/>
  <text x="90" y="695" font-family="sans-serif" font-size="14" fill="#71717A">Issued Date</text>
  <text x="90" y="722" font-family="monospace" font-size="18" fill="#09090B">${cert.issuedAt}</text>
  <text x="1110" y="695" text-anchor="end" font-family="sans-serif" font-size="14" fill="#71717A">Authorized By</text>
  <text x="1110" y="722" text-anchor="end" font-family="sans-serif" font-size="18" font-weight="600" fill="#09090B">${cert.issuedBy}</text>
</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Intergrid-IT-Certificate-${cert.credentialId}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-[#E4E4E7] rounded-[10px] w-full max-w-[820px] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between gap-3">
          <div className="text-[14px] font-semibold text-[#09090B]">
            Certificate of Attendance · {certificate.credentialId}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadCertificateSVG(certificate)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] hover:border-[#09090B] text-[12px] font-medium text-[#09090B]"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[12px] font-medium"
            >
              <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
              aria-label="Close certificate preview"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="p-6 bg-[#F4F4F5]">
          <div
            id="certificate-print-area"
            className="bg-white border-2 border-[#09090B] p-8 sm:p-12 relative"
          >
            <div className="border border-[#E4E4E7] p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E4E7]">
                <BrandMark theme="light" />
                <div className="text-[12px] font-mono tabular-nums text-[#71717A]">
                  Credential ID: {certificate.credentialId}
                </div>
              </div>

              <div className="py-10">
                <div className="text-[12px] font-mono tracking-widest uppercase text-[#71717A]">
                  Certificate of Attendance
                </div>
                <h2 className="mt-3 font-display font-semibold text-[32px] sm:text-[38px] text-[#09090B] leading-tight">
                  {certificate.userName}
                </h2>
                <p className="mt-3 text-[15px] text-[#71717A] max-w-xl">
                  Has satisfied all chapter attendance requirements and technical knowledge assessments for the Intergrid IT engineering curriculum:
                </p>
                <div className="mt-5 font-display font-semibold text-[22px] text-[#09090B]">
                  {certificate.moduleTitle}
                </div>
                <div className="mt-1 text-[13px] font-mono text-[#71717A]">
                  Module Code {certificate.moduleCode} · {certificate.templateName}
                </div>
                {certificate.verificationNote && (
                  <div className="mt-3 text-[12px] text-[#09090B] italic">
                    Note: {certificate.verificationNote}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[#E4E4E7] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] text-[#71717A]">Date of Issue</div>
                  <div className="text-[14px] font-mono tabular-nums text-[#09090B] mt-0.5">
                    {certificate.issuedAt}
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-[11px] text-[#71717A]">Authorized Signatory</div>
                  <div className="text-[14px] font-semibold text-[#09090B] mt-0.5">
                    {certificate.issuedBy}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CertificatesGallery: React.FC = () => {
  const { state, currentUser, navigate } = useLMS();
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  const userCerts = state.certificates.filter((c) => c.userId === currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-[#E4E4E7]">
        <h1 className="font-display font-semibold text-[26px] text-[#09090B]">
          Certificates of Attendance
        </h1>
        <p className="text-[14px] text-[#71717A] mt-1">
          Verifiable monochrome credentials earned through module completion and passing assessments.
        </p>
      </div>

      {userCerts.length === 0 ? (
        <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-10 text-center">
          <Award className="w-8 h-8 text-[#71717A] mx-auto mb-3" strokeWidth={1.5} />
          <div className="text-[15px] font-medium text-[#09090B]">
            No certificates earned yet
          </div>
          <p className="text-[13px] text-[#71717A] mt-1 max-w-md mx-auto">
            Complete all chapters and pass the Knowledge Check in any enrolled module to generate your Certificate of Attendance.
          </p>
          <button
            type="button"
            onClick={() => navigate('/my-learning')}
            className="mt-4 px-4 py-2 rounded-[6px] bg-[#09090B] text-white text-[13px] font-medium"
          >
            Go to My Learning
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {userCerts.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#71717A]">
                  <span>{cert.moduleCode}</span>
                  <span>{cert.credentialId}</span>
                </div>
                <h2 className="mt-2 font-display font-semibold text-[18px] text-[#09090B]">
                  {cert.moduleTitle}
                </h2>
                <div className="mt-2 text-[13px] text-[#71717A]">
                  Issued to <span className="text-[#09090B] font-medium">{cert.userName}</span> on{' '}
                  <span className="font-mono tabular-nums">{cert.issuedAt}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E4E4E7] flex items-center justify-between gap-3">
                <span className="text-[12px] text-[#71717A]">
                  Authorized by {cert.issuedBy}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCert(cert)}
                  className="px-3.5 py-2 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[12px] font-medium whitespace-nowrap shrink-0"
                >
                  Open & Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCert && (
        <CertificateModal certificate={activeCert} onClose={() => setActiveCert(null)} />
      )}
    </div>
  );
};
