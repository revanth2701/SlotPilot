import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Calendar, 
  Upload, 
  Download,
  CheckCircle,
  Clock,
  X,
  LogOut,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboardNew = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    passportNumber: "",
    passportIssuedDate: "",
    passportExpiryDate: ""
  });
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user and load their data
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setPersonalDetails(prev => ({
          ...prev,
          email: user.email
        }));
        await loadStudentData(user.email);
      }
      setLoading(false);
    };
    getCurrentUser();
  }, []);

  const loadStudentData = async (email) => {
    try {
      const { data, error } = await supabase
        .from('StudentData')
        .select('*')
        .eq('Mailid', email)
        .single();
      
      if (data) {
        setPersonalDetails(prev => ({
          ...prev,
          firstName: data['First Name'] || '',
          lastName: data['Last Name'] || '',
          phone: data['Contact Number']?.toString() || ''
        }));
      }
    } catch (error) {
      console.log('No existing student data found');
    }
  };

  const handlePersonalDetailsChange = (field, value) => {
    setPersonalDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const savePersonalDetails = async () => {
    try {
      const { error } = await supabase
        .from('Studentpersonaldata')
        .upsert([
          {
            'First Name': personalDetails.firstName,
            'Last Name': personalDetails.lastName,
            'Email': personalDetails.email,
            'contact Number': parseInt(personalDetails.phone) || 0,
            'Date of Birth': personalDetails.dateOfBirth,
            'Address': personalDetails.address,
            'Emergency Contact Name': personalDetails.emergencyContact,
            'Emergency Contact Number': parseInt(personalDetails.emergencyPhone) || 0,
            'Passport Number': personalDetails.passportNumber,
            'Issued Date': personalDetails.passportIssuedDate,
            'Expiry Date': personalDetails.passportExpiryDate
          }
        ]);

      if (error) throw error;
      toast({ title: "Success", description: "Personal details saved successfully!" });
    } catch (error) {
      console.error('Error saving details:', error);
      toast({ title: "Error", description: "Failed to save details", variant: "destructive" });
    }
  };

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // For now, just simulate upload - in real app you'd upload to Supabase Storage
      const newDocument = {
        id: Date.now(),
        name: file.name,
        type: documentType,
        status: 'uploaded',
        uploadDate: new Date().toLocaleDateString()
      };
      
      setDocuments(prev => [...prev, newDocument]);
      toast({ title: "Success", description: `${documentType} uploaded successfully!` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload document", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({ title: "Document removed", description: "Document has been removed" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onBack();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Student Portal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {personalDetails.firstName || user?.email}!
              </span>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {personalDetails.firstName || 'Student'}! 🎓
          </h1>
          <p className="text-muted-foreground">
            Complete your profile and upload required documents to proceed with your application.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="profile">Personal Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Please provide your personal details for the application process.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={personalDetails.firstName}
                      onChange={(e) => handlePersonalDetailsChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={personalDetails.lastName}
                      onChange={(e) => handlePersonalDetailsChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalDetails.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={personalDetails.phone}
                      onChange={(e) => handlePersonalDetailsChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalDetails.dateOfBirth}
                    onChange={(e) => handlePersonalDetailsChange('dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={personalDetails.address}
                    onChange={(e) => handlePersonalDetailsChange('address', e.target.value)}
                    placeholder="Enter your full address"
                  />
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Passport Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input
                      id="passportNumber"
                      value={personalDetails.passportNumber}
                      onChange={(e) => handlePersonalDetailsChange('passportNumber', e.target.value)}
                      placeholder="Enter your passport number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passportIssuedDate">Passport Issued Date</Label>
                      <Input
                        id="passportIssuedDate"
                        type="date"
                        value={personalDetails.passportIssuedDate}
                        onChange={(e) => handlePersonalDetailsChange('passportIssuedDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passportExpiryDate">Passport Expiry Date</Label>
                      <Input
                        id="passportExpiryDate"
                        type="date"
                        value={personalDetails.passportExpiryDate}
                        onChange={(e) => handlePersonalDetailsChange('passportExpiryDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={personalDetails.emergencyContact}
                      onChange={(e) => handlePersonalDetailsChange('emergencyContact', e.target.value)}
                      placeholder="Emergency contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={personalDetails.emergencyPhone}
                      onChange={(e) => handlePersonalDetailsChange('emergencyPhone', e.target.value)}
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>

                <Button onClick={savePersonalDetails} className="w-full" variant="hero">
                  Save Personal Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Document Upload
                  </CardTitle>
                  <CardDescription>
                    Upload the required documents for your application. All documents should be in PDF format.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'passport', label: 'Passport', icon: FileText },
                      { id: 'graduation', label: 'Graduation Certificate', icon: GraduationCap },
                      { id: 'transcripts', label: 'Academic Transcripts', icon: FileText },
                      { id: 'ielts', label: 'IELTS/TOEFL Score', icon: FileText },
                      { id: 'sop', label: 'Statement of Purpose', icon: FileText },
                      { id: 'cv', label: 'CV/Resume', icon: FileText }
                    ].map((docType) => (
                      <div key={docType.id} className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                        <docType.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h3 className="font-medium mb-2">{docType.label}</h3>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.png,.jpeg"
                          onChange={(e) => handleFileUpload(e, docType.label)}
                          className="hidden"
                          id={`upload-${docType.id}`}
                          disabled={uploading}
                        />
                        <Label
                          htmlFor={`upload-${docType.id}`}
                          className="cursor-pointer inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          {uploading ? 'Uploading...' : 'Upload'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Uploaded Documents */}
              {documents.length > 0 && (
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Uploaded Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              <p className="text-sm text-muted-foreground">{doc.name} • {doc.uploadDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                            <Button
                              onClick={() => removeDocument(doc.id)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboardNew;