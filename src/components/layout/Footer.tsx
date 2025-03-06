
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-24">
      <div className="medical-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-medical-primary flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-medical-primary to-blue-700 bg-clip-text text-transparent">MediFlow</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Streamlining your healthcare experience by connecting patients with providers for a seamless medical journey.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-medical-primary">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-medical-primary">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-medical-primary">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-gray-500 hover:text-medical-primary text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/reports" className="text-gray-500 hover:text-medical-primary text-sm">
                  Reports
                </Link>
              </li>
              <li>
                <Link to="/consultations" className="text-gray-500 hover:text-medical-primary text-sm">
                  Consultations
                </Link>
              </li>
              <li>
                <Link to="/providers" className="text-gray-500 hover:text-medical-primary text-sm">
                  Providers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#" className="text-gray-500 hover:text-medical-primary text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-medical-primary text-sm">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-medical-primary text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-medical-primary text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="text-sm text-gray-500">
                <span>1234 Healthcare Ave</span>
                <br />
                <span>Medical District, MD 12345</span>
              </li>
              <li className="text-sm text-gray-500">
                <a href="mailto:support@mediflow.com" className="hover:text-medical-primary">
                  support@mediflow.com
                </a>
              </li>
              <li className="text-sm text-gray-500">
                <a href="tel:+12345678900" className="hover:text-medical-primary">
                  (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} MediFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
