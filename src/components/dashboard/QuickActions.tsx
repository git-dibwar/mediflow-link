
import { FileText, MessageSquare, Calendar, Pill, Stethoscope, FilePlus, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

type QuickActionProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  color: string;
};

const QuickAction = ({ icon, title, description, buttonText, buttonLink, color }: QuickActionProps) => {
  return (
    <div className="glass-card rounded-xl p-5 card-hover animate-fade-in">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <Button variant="ghost" className="text-xs p-0 h-auto group" asChild>
        <a href={buttonLink} className="flex items-center text-medical-primary font-medium">
          {buttonText} 
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
        </a>
      </Button>
    </div>
  );
};

const QuickActions = () => {
  const actions = [
    {
      icon: <FileText className="h-5 w-5 text-white" />,
      title: "View Reports",
      description: "Access your latest lab results and medical reports",
      buttonText: "View Reports",
      buttonLink: "/reports",
      color: "bg-medical-primary"
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-white" />,
      title: "Online Consultation",
      description: "Connect with doctors for virtual appointments",
      buttonText: "Start Consultation",
      buttonLink: "/consultations",
      color: "bg-emerald-500"
    },
    {
      icon: <Calendar className="h-5 w-5 text-white" />,
      title: "Appointments",
      description: "Schedule and manage your appointments",
      buttonText: "Schedule Now",
      buttonLink: "/appointments",
      color: "bg-violet-500"
    },
    {
      icon: <Pill className="h-5 w-5 text-white" />,
      title: "Medications",
      description: "View and refill your prescriptions",
      buttonText: "View Medications",
      buttonLink: "/medications",
      color: "bg-rose-500"
    },
    {
      icon: <Stethoscope className="h-5 w-5 text-white" />,
      title: "Find Doctors",
      description: "Search and connect with healthcare providers",
      buttonText: "Find Doctors",
      buttonLink: "/providers",
      color: "bg-amber-500"
    },
    {
      icon: <FilePlus className="h-5 w-5 text-white" />,
      title: "Health Records",
      description: "Upload and manage your health documents",
      buttonText: "Upload Records",
      buttonLink: "/records",
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {actions.map((action, index) => (
        <QuickAction key={index} {...action} />
      ))}
    </div>
  );
};

export default QuickActions;
