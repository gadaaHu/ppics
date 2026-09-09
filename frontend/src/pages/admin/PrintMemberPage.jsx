import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberById } from '../../api/memberApi';
import partyLogo from '../../assets/ppimg.jpg';
import { FaUser, FaBuilding, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const PrintMemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await getMemberById(id);
        if (response.data) {
          setMember(response.data);
          // Wait for images to load before triggering print
          setTimeout(() => {
            window.print();
          }, 1000);
        } else {
          setError('Member not found');
        }
      } catch (err) {
        console.error('Error fetching member:', err);
        setError('Failed to load member data');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) return photoPath;
    if (photoPath.startsWith('/uploads/')) return photoPath;
    if (photoPath.startsWith('uploads/')) return `/${photoPath}`;
    return `/uploads/members/${photoPath}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>;
  }

  if (error || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col items-center py-10 print:bg-white print:py-0 print:block">
      
      {/* Print styles specifically tailored for CR80 ID Card format (85.6mm x 54mm) - Vertical */}
      <style>{`
        @media print {
          @page {
            size: 54mm 85.6mm;
            margin: 0;
          }
          body {
            background: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .id-card-container {
            width: 54mm !important;
            height: 85.6mm !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            overflow: hidden;
            page-break-after: always;
          }
        }
      `}</style>
      
      <div className="mb-8 no-print flex gap-4 w-full max-w-sm justify-between px-4">
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
          &larr; Back
        </button>
        <button onClick={() => window.print()} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2">
          Print ID Card
        </button>
      </div>

      {/* ID Card Wrapper (CR80 Vertical Size in screen mode for preview) */}
      {/* 54mm = ~204px, 85.6mm = ~323px at 96 DPI. Scaled up by 1.5x for screen preview readability */}
      <div className="id-card-container relative bg-white w-[306px] h-[485px] print:w-[54mm] print:h-[85.6mm] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col print:rounded-none print:border-none print:shadow-none">
        
        {/* Background Patterns & Watermark */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-b from-blue-50/50 to-white">
          {/* Modern abstract shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
          
          {/* Centered Watermark */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.04]">
            <img src={partyLogo} alt="Watermark" className="w-[45mm] h-[45mm] object-contain grayscale" />
          </div>
        </div>

        {/* Top Header - Colored Bar */}
        <div className="relative z-10 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-900 pt-4 pb-12 px-4 text-center rounded-b-[40px] shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src={partyLogo} alt="Logo" className="w-6 h-6 rounded-full bg-white p-0.5 shadow-sm" />
            <h1 className="text-white text-xs font-bold uppercase tracking-widest leading-none m-0">Prosperity Party</h1>
          </div>
          <h2 className="text-blue-200 text-[9px] font-semibold uppercase tracking-wider m-0">Official Member ID</h2>
        </div>

        {/* Profile Section (Overlapping Header) */}
        <div className="relative z-20 flex flex-col items-center -mt-10 px-4">
          <div className="w-[22mm] h-[22mm] rounded-full bg-white p-1 shadow-lg mx-auto mb-2 relative">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border border-gray-200">
              {member.photo_url || member.photo ? (
                <img src={member.photo_url || getImageUrl(member.photo)} alt={member.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <FaUser className="text-2xl" />
                </div>
              )}
            </div>
            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <h3 className="text-sm font-extrabold text-gray-900 uppercase text-center leading-tight">
            {member.full_name}
          </h3>
          <p className="text-[10px] font-bold text-blue-700 uppercase mt-0.5">
            {member.position_name || 'Member'}
          </p>
        </div>

        {/* Details Section */}
        <div className="relative z-10 flex-1 px-5 mt-4 flex flex-col gap-2.5">
          <div className="flex items-start gap-2">
            <FaBuilding className="text-blue-400 mt-0.5 shrink-0 text-[10px]" />
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">District / Region</p>
              <p className="text-[10px] font-bold text-gray-800 leading-none">{member.district_name || '-'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <FaMapMarkerAlt className="text-red-400 mt-0.5 shrink-0 text-[10px]" />
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Cooperative / Local</p>
              <p className="text-[10px] font-bold text-gray-800 leading-none">{member.cooperative_name || '-'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <FaPhone className="text-green-400 mt-0.5 shrink-0 text-[10px]" />
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Contact</p>
              <p className="text-[10px] font-bold text-gray-800 leading-none">{member.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Section */}
        <div className="relative z-10 mt-auto bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-end">
          <div>
            <p className="text-[7px] font-bold text-gray-400 uppercase mb-0.5">ID Number</p>
            <p className="text-xs font-mono font-bold text-blue-900 tracking-wider">
              {member.member_id?.toString().padStart(6, '0') || 'N/A'}
            </p>
          </div>
          
          {/* Simulated QR Code using CSS grid for visual aesthetics */}
          <div className="w-[12mm] h-[12mm] bg-white border border-gray-200 p-1 flex items-center justify-center">
             <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5">
               <div className="bg-black col-span-2"></div>
               <div className="bg-black"></div>
               <div className="bg-black"></div>
               <div className="bg-white"></div>
               <div className="bg-black"></div>
               <div className="bg-black"></div>
               <div className="bg-black col-span-2"></div>
             </div>
          </div>
        </div>

        {/* Back decorative line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>

      </div>
      
      <p className="text-gray-500 text-sm mt-6 no-print max-w-sm text-center">
        This preview is styled for a standard CR80 ID Card format (85.6mm x 54mm). When printed, it will scale automatically to fit standard badge printers.
      </p>
    </div>
  );
};

export default PrintMemberPage;
