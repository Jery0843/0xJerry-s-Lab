'use client';

import Layout from '@/components/Layout';
import { FaUserSecret, FaCode, FaShieldAlt } from 'react-icons/fa';

const About = () => {
  return (
    <Layout>
      <div className="py-16">
        {/* Page Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-cyber font-bold glitch" data-text="About 0xJerry">
            About 0xJerry
          </h1>
          <p className="text-lg text-cyber-blue mt-4">
            [ tín hiệu // tiểu sử // sứ mệnh ]
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Section: Avatar & Vitals */}
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="relative w-48 h-48 rounded-full border-2 border-cyber-green mb-6 overflow-hidden group animate-pulse hover:animate-none transition-all duration-300">
                {/* Animated border ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyber-green via-cyber-blue to-cyber-green rounded-full opacity-75 blur-sm animate-spin group-hover:animate-pulse"></div>
                
                {/* Glitch overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-green/20 to-transparent animate-pulse rounded-full"></div>
                
                {/* Image container */}
                <div className="relative w-full h-full rounded-full border-2 border-cyber-green bg-black overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-1">
                  <img 
                    src="https://securehive.securenotepad.tech/Gemini_Generated_Image_d1jhvwd1jhvwd1jh.png" 
                    alt="0xJerry Profile" 
                    className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110 group-hover:contrast-110"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <FaUserSecret className="w-full h-full p-6 text-cyber-green hidden" />
                  
                  {/* Scanning line effect */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-green to-transparent animate-bounce opacity-70"></div>
                </div>
                
                {/* Corner indicators */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-green rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyber-blue rounded-full animate-pulse"></div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-cyber font-bold">0xJerry</h2>
                <p className="text-cyber-blue">[ Redacted ]</p>
              </div>
              <div className="mt-6 text-left space-y-3 w-full">
                <p><strong className="text-cyber-green">STATUS:</strong> <span className="text-green-400">Online</span></p>
                <p><strong className="text-cyber-green">FOCUS:</strong> Offensive Security</p>
                <p><strong className="text-cyber-green">LOCATION:</strong> The Grid</p>
              </div>
            </div>

            {/* Right Section: Bio & Philosophy */}
            <div className="md:col-span-2 bg-card-bg border border-cyber-green/30 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-cyber-green">Digital Ghost in the Machine</h3>
              <p className="mb-6 text-gray-300 leading-relaxed">
                “Chasing root one box at a time — crafting exploits, decoding patterns, and breathing life into logic. This is the digital dojo where exploits evolve into mastery.”
              </p>

              <div className="border-t border-cyber-green/30 pt-6">
                <h4 className="text-xl font-semibold mb-4 text-cyber-blue">Core Philosophy</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <FaCode className="text-2xl mt-1 text-cyber-green" />
                    <div>
                      <h5 className="font-bold">Code is Poetry</h5>
                      <p className="text-sm text-gray-400">Every script, payload, and exploit is a stanza in a larger narrative of digital interaction. I strive for elegance and efficiency in every line.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <FaShieldAlt className="text-2xl mt-1 text-cyber-green" />
                    <div>
                      <h5 className="font-bold">Defense Through Offense</h5>
                      <p className="text-sm text-gray-400">To build resilient systems, one must first master the art of breaking them. My work is a continuous cycle of exploitation and fortification.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-16">
            <h3 className="text-3xl font-cyber font-bold text-center mb-8">Technical Arsenal</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {['Python', 'Bash', 'PowerShell', 'React', 'Reverse Engineering', 'Web Exploitation', 'Active Directory', 'Metasploit'].map(skill => (
                <div key={skill} className="bg-card-bg border border-cyber-green/30 p-4 rounded-lg hover:border-cyber-blue transition-all duration-300">
                  <p className="font-semibold">{skill}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
