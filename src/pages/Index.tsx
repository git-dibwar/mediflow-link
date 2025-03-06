
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PatientDashboard from "@/components/dashboard/PatientDashboard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white bg-medical-pattern">
      <Header />
      <main className="flex-1 medical-container py-8 page-transition">
        <PatientDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
