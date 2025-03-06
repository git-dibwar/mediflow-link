
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProviderCard from "@/components/providers/ProviderCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

// Sample data
const sampleProviders = {
  doctors: [
    {
      id: "d1",
      name: "Dr. Sarah Johnson",
      type: "doctor" as const,
      specialty: "Cardiologist",
      address: "123 Medical Blvd, Healthville, CA 12345",
      phone: "(123) 456-7890",
      imageUrl: "",
      distance: "2.3 mi",
      status: "connected" as const
    },
    {
      id: "d2",
      name: "Dr. Michael Chen",
      type: "doctor" as const,
      specialty: "Dermatologist",
      address: "456 Health Lane, Wellnessburg, CA 12345",
      phone: "(123) 456-7891",
      imageUrl: "",
      distance: "3.5 mi",
      status: "not-connected" as const
    }
  ],
  clinics: [
    {
      id: "c1",
      name: "City Medical Center",
      type: "clinic" as const,
      specialty: "Multi-specialty Clinic",
      address: "789 Hospital Road, Healthville, CA 12345",
      phone: "(123) 456-7892",
      imageUrl: "",
      distance: "1.8 mi",
      status: "connected" as const
    }
  ],
  pharmacies: [
    {
      id: "p1",
      name: "QuickHealth Pharmacy",
      type: "pharmacy" as const,
      address: "234 Medicine Ave, Healthville, CA 12345",
      phone: "(123) 456-7893",
      imageUrl: "",
      distance: "0.9 mi",
      status: "connected" as const
    }
  ],
  laboratories: [
    {
      id: "l1",
      name: "PrecisionLab Diagnostics",
      type: "laboratory" as const,
      specialty: "Clinical Laboratory",
      address: "567 Test Street, Healthville, CA 12345",
      phone: "(123) 456-7894",
      imageUrl: "",
      distance: "2.7 mi",
      status: "connected" as const
    }
  ]
};

const Providers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Get all providers
  const allProviders = [
    ...sampleProviders.doctors,
    ...sampleProviders.clinics,
    ...sampleProviders.pharmacies,
    ...sampleProviders.laboratories
  ];
  
  // Filter providers based on search term and active tab
  const getFilteredProviders = () => {
    let providers = [];
    
    switch (activeTab) {
      case "all":
        providers = allProviders;
        break;
      case "doctors":
        providers = sampleProviders.doctors;
        break;
      case "clinics":
        providers = sampleProviders.clinics;
        break;
      case "pharmacies":
        providers = sampleProviders.pharmacies;
        break;
      case "laboratories":
        providers = sampleProviders.laboratories;
        break;
      default:
        providers = allProviders;
    }
    
    if (!searchTerm) return providers;
    
    return providers.filter(provider => 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provider.specialty && provider.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      provider.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const filteredProviders = getFilteredProviders();

  return (
    <div className="min-h-screen flex flex-col bg-white bg-medical-pattern">
      <Header />
      <main className="flex-1 medical-container py-8 page-transition">
        <div className="space-y-8">
          <div className="bg-medical-secondary/50 p-6 rounded-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Healthcare Providers</h1>
            <p className="text-gray-600">
              Connect with doctors, clinics, pharmacies, and laboratories
            </p>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, specialty, or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="doctors">Doctors</TabsTrigger>
              <TabsTrigger value="clinics">Clinics</TabsTrigger>
              <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
              <TabsTrigger value="laboratories">Laboratories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredProviders.map(provider => (
                    <ProviderCard key={provider.id} {...provider} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or browse all providers.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="doctors" className="space-y-6">
              {filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredProviders.map(provider => (
                    <ProviderCard key={provider.id} {...provider} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or browse all providers.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="clinics" className="space-y-6">
              {filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredProviders.map(provider => (
                    <ProviderCard key={provider.id} {...provider} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clinics found</h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or browse all providers.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pharmacies" className="space-y-6">
              {filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredProviders.map(provider => (
                    <ProviderCard key={provider.id} {...provider} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or browse all providers.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="laboratories" className="space-y-6">
              {filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredProviders.map(provider => (
                    <ProviderCard key={provider.id} {...provider} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No laboratories found</h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or browse all providers.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Providers;
