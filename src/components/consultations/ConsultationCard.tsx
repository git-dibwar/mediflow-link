
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageSquare, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConsultationProps {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage?: string;
  date: string;
  time: string;
  duration: string;
  status: "scheduled" | "completed" | "cancelled";
  isVideo: boolean;
}

const statusConfig = {
  scheduled: {
    color: "bg-blue-100 text-blue-800",
    label: "Scheduled"
  },
  completed: {
    color: "bg-green-100 text-green-800",
    label: "Completed"
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    label: "Cancelled"
  }
};

const ConsultationCard = ({
  id,
  doctorName,
  doctorSpecialty,
  doctorImage,
  date,
  time,
  duration,
  status,
  isVideo
}: ConsultationProps) => {
  const statusInfo = statusConfig[status];
  const isUpcoming = status === "scheduled";
  
  return (
    <Card className="glass-card overflow-hidden card-hover animate-fade-in">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-medical-secondary">
                <AvatarImage src={doctorImage} alt={doctorName} />
                <AvatarFallback className="bg-medical-primary text-white">
                  {doctorName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900">{doctorName}</h3>
                <p className="text-sm text-gray-500">{doctorSpecialty}</p>
              </div>
            </div>
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-5">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-medical-primary" />
              <span className="text-gray-600">{date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-medical-primary" />
              <span className="text-gray-600">{time} ({duration})</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm mb-5">
            <div className="flex items-center">
              {isVideo ? (
                <Video className="h-4 w-4 mr-2 text-medical-primary" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2 text-medical-primary" />
              )}
              <span className="text-gray-600">
                {isVideo ? "Video Consultation" : "Chat Consultation"}
              </span>
            </div>
          </div>
          
          {isUpcoming && (
            <div className="flex space-x-2">
              <Button size="sm" variant="default" className="flex-1">
                {isVideo ? "Join Video Call" : "Start Chat"}
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Reschedule
              </Button>
            </div>
          )}
          
          {status === "completed" && (
            <div className="flex space-x-2">
              <Button size="sm" variant="default" className="flex-1">
                View Summary
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Book Follow-up
              </Button>
            </div>
          )}
          
          {status === "cancelled" && (
            <Button size="sm" variant="default" className="w-full">
              Reschedule Appointment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationCard;
