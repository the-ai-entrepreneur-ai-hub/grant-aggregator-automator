import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, DollarSign, MapPin, Award, Shield, Target, Heart, Mountain, ChevronRight, Settings } from 'lucide-react';
import DebugPanel from '@/components/DebugPanel';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                  <Mountain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Misión Huascarán</h1>
                <p className="text-sm text-gray-600">Grant Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowDebug(!showDebug)} 
                variant="outline" 
                size="sm"
                className="text-gray-600"
              >
                <Settings className="h-4 w-4 mr-1" />
                Debug
              </Button>
              <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700">
                Access Platform
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Transforming Communities
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Empowering Rural Peru Through
                  <span className="text-blue-600"> Strategic Funding</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Supporting communities like those in Magdalena's village through intelligent grant discovery, 
                  application tracking, and strategic funding partnerships that create lasting impact.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-3xl font-bold text-blue-600">250+</div>
                  <div className="text-sm text-gray-600">Communities Served</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-3xl font-bold text-green-600">$2.5M+</div>
                  <div className="text-sm text-gray-600">Grants Secured</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={onGetStarted}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
                >
                  Learn More
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
              <img 
                src="/imgi_11_magdalena.jpg" 
                alt="Community member in traditional dress" 
                className="relative w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              We bridge the gap between rural Peruvian communities and funding opportunities, 
              providing intelligent grant management solutions that empower local organizations 
              to secure resources, track progress, and create sustainable development impact.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Grant Management
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to secure and manage funding for your community projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Grant Discovery
                </h3>
                <p className="text-gray-600">
                  Intelligent matching with relevant funding opportunities tailored to your community's needs and projects.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Application Tracking
                </h3>
                <p className="text-gray-600">
                  Comprehensive tracking system to monitor application progress and manage deadlines effectively.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Collaborative Platform
                </h3>
                <p className="text-gray-600">
                  Team-based approach enabling multiple stakeholders to work together on grant applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Creating Lasting Impact
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  From preserving traditional crafts to supporting sustainable agriculture, 
                  our platform helps communities access the resources they need to thrive while 
                  maintaining their cultural heritage.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-gray-600">Community Programs</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">85+</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">Success Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">92%</div>
                </div>
              </div>

              <Button 
                onClick={onGetStarted}
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Your Journey
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  src="/imgi_2_senora.png" 
                  alt="Community members" 
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
                <img 
                  src="/imgi_3_tierra.png" 
                  alt="Rural landscape" 
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="pt-8">
                <img 
                  src="/imgi_43_suscribete-fondo-parallax.png" 
                  alt="Traditional dress" 
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Success Stories from Rural Peru
              </h2>
              <p className="text-xl text-blue-100">
                Real impact from communities using our grant management platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Award className="h-8 w-8 text-yellow-400 mr-3" />
                    <div>
                      <h3 className="font-semibold text-lg">San Marcos Agricultural Project</h3>
                      <p className="text-blue-100 text-sm">Ancash Region</p>
                    </div>
                  </div>
                  <p className="text-blue-100 mb-4">
                    Secured $45,000 in funding for sustainable farming techniques, improving crop yields by 40% 
                    and benefiting 120 farming families.
                  </p>
                  <div className="flex items-center text-sm text-blue-200">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>$45,000 secured • 120 families impacted</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Heart className="h-8 w-8 text-red-400 mr-3" />
                    <div>
                      <h3 className="font-semibold text-lg">Huascarán Healthcare Initiative</h3>
                      <p className="text-blue-100 text-sm">Rural Clinic Network</p>
                    </div>
                  </div>
                  <p className="text-blue-100 mb-4">
                    Obtained $28,000 grant for mobile health services, providing medical care to 
                    15 remote villages with previously limited access.
                  </p>
                  <div className="flex items-center text-sm text-blue-200">
                    <Users className="h-4 w-4 mr-1" />
                    <span>$28,000 secured • 15 villages served</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <Button 
                onClick={onGetStarted}
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
              >
                Access Platform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Mountain className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold">Misión Huascarán</span>
              </div>
              <p className="text-gray-400">
                Empowering rural communities through strategic funding and sustainable development.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Grant Discovery</li>
                <li>Application Tracking</li>
                <li>Team Collaboration</li>
                <li>Impact Reporting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Huascarán, Peru</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>info@misionhuascaran.org</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Misión Huascarán. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Debug Panel</h2>
              <Button onClick={() => setShowDebug(false)} variant="outline" size="sm">
                Close
              </Button>
            </div>
            <div className="p-4">
              <DebugPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}