import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-8 p-8 rounded-2xl bg-gradient-to-r from-icspp-blue to-blue-600 text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">
        <div className="flex flex-wrap justify-between items-center gap-3 w-full">
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex gap-2 items-center">
              <img src="/assets/images/logo.jpg" alt="ICS Logo" className="h-11 rounded-xl" />
              <img src="/assets/images/clogo.png" alt="Partner Logo" className="h-11 rounded-xl" />
            </div>
            <div>
              <div className="font-bold text-white">
                Immigration & Citizenship Services - Prosperity Party Unity
              </div>
              <small className="text-white/85">
                የኢሚግሬሽንና ዜግነት አገልግሎት • ብልጽግና ፓርቲ ህብረት
              </small>
            </div>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <a href="#" className="text-white no-underline text-lg hover:opacity-80 transition-opacity">𝐟</a>
            <a href="#" className="text-white no-underline text-lg hover:opacity-80 transition-opacity">𝕏</a>
            <a href="#" className="text-white no-underline text-lg hover:opacity-80 transition-opacity">🌐</a>
            <a href="#" className="text-white no-underline text-lg hover:opacity-80 transition-opacity">✉︎</a>
          </div>
        </div>

        <div className="w-full text-center text-white/90 text-sm">
          © 2026 ICS - Digital Transformation Directorate. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;