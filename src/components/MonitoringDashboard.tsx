import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Eye, Camera, AlertTriangle, CheckCircle, XCircle, Activity, Download, Navigation } from "lucide-react";
import jsPDF from 'jspdf';

interface EyeTrackingData {
  leftEye: { x: number; y: number; confidence: number; retinaFocus: number };
  rightEye: { x: number; y: number; confidence: number; retinaFocus: number };
  headDirection: { x: string; y: string }; // 'left'|'center'|'right', 'up'|'center'|'down'
  isDistracted: boolean;
  distractionLevel: 'normal' | 'warning' | 'critical';
  gazeDirection: string;
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

  // Simulate eye tracking data with stable retina focus
  const [baseRetinaFocus, setBaseRetinaFocus] = useState({ left: 85, right: 88 });
  
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate occasional head movement (less frequent)
      const shouldMoveHead = Math.random() > 0.8; // 20% chance of head movement
      const headMovementX = shouldMoveHead ? Math.random() * 200 - 100 : Math.random() * 20 - 10; // smaller random movement when stable
      const headMovementY = shouldMoveHead ? Math.random() * 120 - 60 : Math.random() * 15 - 7.5;
      
      const headX = headMovementX < -30 ? 'left' : headMovementX > 30 ? 'right' : 'center';
      const headY = headMovementY < -20 ? 'up' : headMovementY > 20 ? 'down' : 'center';
      
      // Only change retina focus if there's significant eye movement
      const shouldUpdateRetina = Math.random() > 0.7; // 30% chance
      if (shouldUpdateRetina) {
        setBaseRetinaFocus(prev => ({
          left: Math.max(70, Math.min(100, prev.left + (Math.random() * 10 - 5))),
          right: Math.max(70, Math.min(100, prev.right + (Math.random() * 10 - 5)))
        }));
      }
      
      const isHeadDistracted = headX !== 'center' || headY !== 'center';
      const distractionLevel = isHeadDistracted ? 
        (Math.abs(headMovementX) > 60 || Math.abs(headMovementY) > 40 ? 'critical' : 'warning') : 'normal';
      
      const mockEyeData: EyeTrackingData = {
        leftEye: {
          x: 320 + headMovementX + Math.random() * 10 - 5, // reduced random movement
          y: 240 + headMovementY + Math.random() * 8 - 4,
          confidence: 0.85 + Math.random() * 0.15,
          retinaFocus: baseRetinaFocus.left + Math.random() * 5 - 2.5 // stable with small variations
        },
        rightEye: {
          x: 400 + headMovementX + Math.random() * 10 - 5,
          y: 240 + headMovementY + Math.random() * 8 - 4,
          confidence: 0.85 + Math.random() * 0.15,
          retinaFocus: baseRetinaFocus.right + Math.random() * 5 - 2.5 // stable with small variations
        },
        headDirection: { x: headX, y: headY },
        gazeDirection: `${headX === 'left' ? 'Left' : headX === 'right' ? 'Right' : 'Center'} ${headY === 'up' ? 'Up' : headY === 'down' ? 'Down' : ''}`.trim(),
        isDistracted: isHeadDistracted,
        distractionLevel
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

      // Show specific head movement alerts
      if (mockEyeData.distractionLevel === 'critical') {
        if (headX === 'left') setCurrentAlert('⚠️ DISTRACTED: Head turned LEFT - Focus on road!');
        else if (headX === 'right') setCurrentAlert('⚠️ DISTRACTED: Head turned RIGHT - Focus on road!');
        else if (headY === 'up') setCurrentAlert('⚠️ DISTRACTED: Head looking UP - Focus on road!');
        else if (headY === 'down') setCurrentAlert('⚠️ DISTRACTED: Head looking DOWN - Focus on road!');
        else setCurrentAlert('⚠️ CRITICAL: Eyes off road detected!');
        setTimeout(() => setCurrentAlert(null), 3000);
      } else if (mockEyeData.distractionLevel === 'warning') {
        if (headX === 'left') setCurrentAlert('⚠️ Warning: Slight head turn LEFT detected');
        else if (headX === 'right') setCurrentAlert('⚠️ Warning: Slight head turn RIGHT detected');
        else if (headY === 'up') setCurrentAlert('⚠️ Warning: Head tilted UP detected');
        else if (headY === 'down') setCurrentAlert('⚠️ Warning: Head tilted DOWN detected');
        else setCurrentAlert('⚠️ Warning: Possible distraction detected');
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

  const generateReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Driver Monitoring Report', 20, 30);
    
    // Date and time
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
    
    // Performance metrics
    doc.setFontSize(16);
    doc.text('Performance Summary', 20, 65);
    
    doc.setFontSize(12);
    doc.text(`Focus Score: ${stats.focusScore}%`, 20, 80);
    doc.text(`Total Session Time: ${Math.floor(stats.totalTime / 60)}:${(stats.totalTime % 60).toString().padStart(2, '0')}`, 20, 95);
    doc.text(`Time Distracted: ${stats.distractionTime} seconds`, 20, 110);
    doc.text(`Alerts Triggered: ${stats.alertsTriggered}`, 20, 125);
    doc.text(`Attention Rate: ${Math.round(((stats.totalTime - stats.distractionTime) / stats.totalTime) * 100)}%`, 20, 140);
    
    // Current status
    if (eyeData) {
      doc.text('Current Status', 20, 165);
      doc.text(`Gaze Direction: ${eyeData.gazeDirection}`, 20, 180);
      doc.text(`Head Position: ${eyeData.headDirection.x} ${eyeData.headDirection.y}`, 20, 195);
      doc.text(`Left Eye Focus: ${eyeData.leftEye.retinaFocus.toFixed(1)}%`, 20, 210);
      doc.text(`Right Eye Focus: ${eyeData.rightEye.retinaFocus.toFixed(1)}%`, 20, 225);
      doc.text(`Alert Level: ${eyeData.distractionLevel.toUpperCase()}`, 20, 240);
    }
    
    // Recommendations
    doc.text('Safety Recommendations', 20, 265);
    doc.setFontSize(10);
    if (stats.focusScore < 70) {
      doc.text('• Consider taking breaks more frequently', 25, 280);
      doc.text('• Adjust seat position for better comfort', 25, 290);
    }
    if (stats.alertsTriggered > 5) {
      doc.text('• Review driving conditions and reduce distractions', 25, 300);
    }
    doc.text('• Maintain proper posture while driving', 25, 310);
    doc.text('• Ensure adequate rest before long drives', 25, 320);
    
    // Save the PDF
    doc.save(`driver-monitoring-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
                    {/* Left eye indicator with retina focus */}
                    <div 
                      className="absolute"
                      style={{
                        left: `${(eyeData.leftEye.x / 640) * 100}%`,
                        top: `${(eyeData.leftEye.y / 480) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="w-6 h-6 border-2 border-primary rounded-full animate-pulse-glow">
                        <div 
                          className="w-2 h-2 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          style={{ opacity: eyeData.leftEye.retinaFocus / 100 }}
                        />
                      </div>
                      <div className="text-xs text-primary font-semibold mt-1 text-center">
                        L: {eyeData.leftEye.retinaFocus.toFixed(0)}%
                      </div>
                    </div>
                    
                    {/* Right eye indicator with retina focus */}
                    <div 
                      className="absolute"
                      style={{
                        left: `${(eyeData.rightEye.x / 640) * 100}%`,
                        top: `${(eyeData.rightEye.y / 480) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="w-6 h-6 border-2 border-primary rounded-full animate-pulse-glow">
                        <div 
                          className="w-2 h-2 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          style={{ opacity: eyeData.rightEye.retinaFocus / 100 }}
                        />
                      </div>
                      <div className="text-xs text-primary font-semibold mt-1 text-center">
                        R: {eyeData.rightEye.retinaFocus.toFixed(0)}%
                      </div>
                    </div>

                    {/* Head direction indicator */}
                    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="w-4 h-4 text-primary" />
                        <span>Gaze: {eyeData.gazeDirection}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Eye tracking info */}
              {eyeData && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Left Eye Confidence</div>
                      <Progress value={eyeData.leftEye.confidence * 100} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Left Retina Focus</div>
                      <Progress value={eyeData.leftEye.retinaFocus} className="h-2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Right Eye Confidence</div>
                      <Progress value={eyeData.rightEye.confidence * 100} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Right Retina Focus</div>
                      <Progress value={eyeData.rightEye.retinaFocus} className="h-2" />
                    </div>
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
                <Button 
                  onClick={generateReport}
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={stats.totalTime < 10}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF Report
                </Button>
                {stats.totalTime < 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Monitor for at least 10 seconds to generate report
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;