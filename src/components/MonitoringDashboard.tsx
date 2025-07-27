import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Eye, Camera, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react";

interface EyeTrackingData {
  leftEye: { x: number; y: number; confidence: number };
  rightEye: { x: number; y: number; confidence: number };
  isDistracted: boolean;
  distractionLevel: 'normal' | 'warning' | 'critical';
}

interface DistractionStats {
  focusScore: number;
  distractionTime: number;
  totalTime: number;
  alertsTriggered: number;
}

const MonitoringDashboard = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [eyeData, setEyeData] = useState<EyeTrackingData | null>(null);
  const [stats, setStats] = useState<DistractionStats>({
    focusScore: 85,
    distractionTime: 12,
    totalTime: 45,
    alertsTriggered: 3
  });
  const [currentAlert, setCurrentAlert] = useState<string | null>(null);

  // Simulate eye tracking data
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const mockEyeData: EyeTrackingData = {
        leftEye: {
          x: 320 + Math.random() * 100 - 50,
          y: 240 + Math.random() * 60 - 30,
          confidence: 0.8 + Math.random() * 0.2
        },
        rightEye: {
          x: 400 + Math.random() * 100 - 50,
          y: 240 + Math.random() * 60 - 30,
          confidence: 0.8 + Math.random() * 0.2
        },
        isDistracted: Math.random() > 0.7,
        distractionLevel: Math.random() > 0.9 ? 'critical' : Math.random() > 0.8 ? 'warning' : 'normal'
      };

      setEyeData(mockEyeData);

      // Update stats
      setStats(prev => ({
        ...prev,
        totalTime: prev.totalTime + 1,
        distractionTime: mockEyeData.isDistracted ? prev.distractionTime + 1 : prev.distractionTime,
        focusScore: Math.max(0, Math.min(100, prev.focusScore + (mockEyeData.isDistracted ? -1 : 0.5))),
        alertsTriggered: mockEyeData.distractionLevel === 'critical' ? prev.alertsTriggered + 1 : prev.alertsTriggered
      }));

      // Show alerts
      if (mockEyeData.distractionLevel === 'critical') {
        setCurrentAlert('CRITICAL: Eyes off road detected!');
        setTimeout(() => setCurrentAlert(null), 3000);
      } else if (mockEyeData.distractionLevel === 'warning') {
        setCurrentAlert('Warning: Possible distraction detected');
        setTimeout(() => setCurrentAlert(null), 2000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsMonitoring(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopMonitoring = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsMonitoring(false);
    setEyeData(null);
    setCurrentAlert(null);
  };

  const getAlertStyle = () => {
    if (!eyeData) return "";
    switch (eyeData.distractionLevel) {
      case 'critical': return "animate-alert-pulse bg-gradient-alert";
      case 'warning': return "animate-warning-pulse bg-gradient-warning";
      default: return "bg-gradient-success";
    }
  };

  const getStatusIcon = () => {
    if (!eyeData) return <Eye className="w-6 h-6" />;
    switch (eyeData.distractionLevel) {
      case 'critical': return <XCircle className="w-6 h-6 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-warning" />;
      default: return <CheckCircle className="w-6 h-6 text-success" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Driver Monitoring System
          </h1>
          <p className="text-muted-foreground">Real-time distraction detection and safety monitoring</p>
        </div>

        {/* Alert Banner */}
        {currentAlert && (
          <div className={`p-4 rounded-lg text-center font-semibold animate-fade-in ${getAlertStyle()}`}>
            {currentAlert}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Camera Feed</h2>
                  {getStatusIcon()}
                </div>
                <div className="flex gap-2">
                  {!isMonitoring ? (
                    <Button onClick={startMonitoring} className="bg-gradient-primary hover:opacity-90">
                      Start Monitoring
                    </Button>
                  ) : (
                    <Button onClick={stopMonitoring} variant="destructive">
                      Stop Monitoring
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-80 bg-muted rounded-lg object-cover"
                  autoPlay
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                
                {/* Eye tracking overlay */}
                {eyeData && isMonitoring && (
                  <div className="absolute top-0 left-0 w-full h-full">
                    {/* Left eye indicator */}
                    <div 
                      className="absolute w-4 h-4 border-2 border-primary rounded-full animate-pulse-glow"
                      style={{
                        left: `${(eyeData.leftEye.x / 640) * 100}%`,
                        top: `${(eyeData.leftEye.y / 480) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                    {/* Right eye indicator */}
                    <div 
                      className="absolute w-4 h-4 border-2 border-primary rounded-full animate-pulse-glow"
                      style={{
                        left: `${(eyeData.rightEye.x / 640) * 100}%`,
                        top: `${(eyeData.rightEye.y / 480) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Eye tracking info */}
              {eyeData && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Left Eye Confidence</div>
                    <Progress value={eyeData.leftEye.confidence * 100} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Right Eye Confidence</div>
                    <Progress value={eyeData.rightEye.confidence * 100} className="h-2" />
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Monitoring Status</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">System Status</span>
                    <Badge variant={isMonitoring ? "default" : "secondary"} className="animate-bounce-subtle">
                      {isMonitoring ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Alert Level</span>
                    <Badge 
                      variant={eyeData?.distractionLevel === 'critical' ? "destructive" : 
                              eyeData?.distractionLevel === 'warning' ? "secondary" : "default"}
                    >
                      {eyeData?.distractionLevel?.toUpperCase() || "NORMAL"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Stats */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Focus Score</span>
                      <span className="font-semibold">{stats.focusScore}%</span>
                    </div>
                    <Progress value={stats.focusScore} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-muted-foreground">Total Time</div>
                      <div className="text-lg font-semibold">{Math.floor(stats.totalTime / 60)}:{(stats.totalTime % 60).toString().padStart(2, '0')}</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-muted-foreground">Distracted</div>
                      <div className="text-lg font-semibold text-warning">{stats.distractionTime}s</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-muted-foreground">Alerts</div>
                      <div className="text-lg font-semibold text-destructive">{stats.alertsTriggered}</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-muted-foreground">Attention</div>
                      <div className="text-lg font-semibold text-success">
                        {Math.round(((stats.totalTime - stats.distractionTime) / stats.totalTime) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Export Report */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Generate Report</h3>
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  Export PDF Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;