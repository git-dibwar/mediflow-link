
import { ExternalLink, MapPin, Phone } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ProviderType = 'doctor' | 'pharmacy' | 'clinic' | 'laboratory';

interface ProviderCardProps {
  id: string;
  name: string;
  type: ProviderType;
  specialty?: string;
  address: string;
  phone: string;
  imageUrl: string;
  distance?: string;
  status: 'connected' | 'not-connected';
}

const getTypeIcon = (type: ProviderType) => {
  switch (type) {
    case 'doctor':
      return "👨‍⚕️";
    case 'pharmacy':
      return "💊";
    case 'clinic':
      return "🏥";
    case 'laboratory':
      return "🔬";
    default:
      return "🏥";
  }
};

const getTypeColor = (type: ProviderType) => {
  switch (type) {
    case 'doctor':
      return "bg-blue-100 text-blue-800";
    case 'pharmacy':
      return "bg-green-100 text-green-800";
    case 'clinic':
      return "bg-purple-100 text-purple-800";
    case 'laboratory':
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ProviderCard = ({
  id,
  name,
  type,
  specialty,
  address,
  phone,
  imageUrl,
  distance,
  status
}: ProviderCardProps) => {
  return (
    <div className="glass-card rounded-xl overflow-hidden card-hover animate-fade-in">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 md:w-1/4 relative">
          <div className="h-48 sm:h-full w-full bg-medical-secondary">
            <img 
              src={imageUrl || '/placeholder.svg'} 
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          {distance && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-medical-primary" />
              {distance} away
            </div>
          )}
        </div>
        
        <div className="p-5 sm:w-2/3 md:w-3/4 flex flex-col">
          <div className="flex flex-wrap items-start justify-between mb-2">
            <div>
              <Badge className={`mb-2 ${getTypeColor(type)}`}>
                <span className="mr-1">{getTypeIcon(type)}</span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
              <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
              {specialty && <p className="text-sm text-gray-500">{specialty}</p>}
            </div>
            
            <Badge variant={status === 'connected' ? "default" : "outline"} className={status === 'connected' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>
              {status === 'connected' ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-500 space-y-2 mb-4">
            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 text-medical-primary" />
              <span>{address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-medical-primary" />
              <span>{phone}</span>
            </div>
          </div>
          
          <div className="mt-auto flex flex-wrap gap-2">
            {status === 'connected' ? (
              <>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                <Button size="sm">
                  Schedule Appointment
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                <Button size="sm">
                  Connect
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
