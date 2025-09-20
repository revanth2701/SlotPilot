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
  const [documentsByType, setDocumentsByType] = useState({
    passport: [],
    graduation: [],
    transcripts: [],
    ielts: [],
    sop: [],
    cv: [],
    lor: []
  });
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({}); // Track upload status per document type
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
      // Load basic student data
      const { data: basicData, error: basicError } = await supabase
        .from('StudentData')
        .select('*')
        .eq('Mailid', email)
        .maybeSingle();
      
      // Load detailed personal data
      const { data: personalData, error: personalError } = await supabase
        .from('Studentpersonaldata')
        .select('*')
        .eq('Email', email)
        .maybeSingle();
      
      // Update state with existing data from both tables
      setPersonalDetails(prev => ({
        ...prev,
        // Basic data from StudentData table
        firstName: basicData?.['First Name'] || personalData?.['First Name'] || '',
        lastName: basicData?.['Last Name'] || personalData?.['Last Name'] || '',
        phone: basicData?.['Contact Number']?.toString() || personalData?.['contact Number']?.toString() || '',
        // Detailed data from Studentpersonaldata table
        dateOfBirth: personalData?.['Date of Birth'] || '',
        address: personalData?.['Address'] || '',
        emergencyContact: personalData?.['Emergency Contact Name'] || '',
        emergencyPhone: personalData?.['Emergency Contact Number']?.toString() || '',
        passportNumber: personalData?.['Passport Number'] || '',
        passportIssuedDate: personalData?.['Issued Date'] || '',
        passportExpiryDate: personalData?.['Expiry Date'] || ''
      }));
      
      if (personalData || basicData) {
        toast({ 
          title: "Welcome back!", 
          description: "Your existing details have been loaded automatically." 
        });
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
    setSaving(true);
    try {
      // Check if record exists with same email and passport number
      const { data: existingRecord } = await supabase
        .from('Studentpersonaldata')
        .select('*')
        .eq('Email', personalDetails.email)
        .eq('Passport Number', personalDetails.passportNumber)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('Studentpersonaldata')
          .update({
            'First Name': personalDetails.firstName,
            'Last Name': personalDetails.lastName,
            'contact Number': parseInt(personalDetails.phone) || 0,
            'Date of Birth': personalDetails.dateOfBirth,
            'Address': personalDetails.address,
            'Emergency Contact Name': personalDetails.emergencyContact,
            'Emergency Contact Number': parseInt(personalDetails.emergencyPhone) || 0,
            'Issued Date': personalDetails.passportIssuedDate,
            'Expiry Date': personalDetails.passportExpiryDate
          })
          .eq('Email', personalDetails.email)
          .eq('Passport Number', personalDetails.passportNumber);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('Studentpersonaldata')
          .insert([
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
      }

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Error saving details:', error);
      toast({ title: "Error", description: "Failed to save details", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if personal details are filled
    if (!personalDetails.firstName || !personalDetails.lastName) {
      toast({ 
        title: "Missing Information", 
        description: "Please fill in your first name and last name before uploading documents.",
        variant: "destructive" 
      });
      return;
    }

    // Set upload status to loading
    setUploadStatus(prev => ({ ...prev, [documentType]: 'uploading' }));
    setUploading(prev => ({ ...prev, [documentType]: true }));
    
    try {
      // Show immediate feedback
      toast({ 
        title: "📤 Upload Started", 
        description: `Uploading ${documentType}...`,
        duration: 2000
      });

      // Convert file to base64
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const base64Content = e.target.result.split(',')[1]; // Remove data:... prefix

        try {
          console.log(`Starting upload for ${documentType}: ${file.name}`);
          
          // Upload to Google Drive via edge function
          const { data, error } = await supabase.functions.invoke('upload-to-drive', {
            body: {
              fileName: file.name,
              fileContent: base64Content,
              mimeType: file.type,
              documentType: documentType,
              studentFirstName: personalDetails.firstName,
              studentLastName: personalDetails.lastName,
              studentEmail: personalDetails.email
            }
          });

          console.log('Upload response:', { data, error });

          if (error) {
            console.error('Upload error:', error);
            throw error;
          }

          if (!data) {
            console.error('No data in response');
            throw new Error('No response data received');
          }

          if (data.error) {
            console.error('Upload failed with data error:', data);
            throw new Error(data.error);
          }

          // Log the actual response to debug
          console.log('Actual response data:', JSON.stringify(data, null, 2));

          // Create document record for UI - be more flexible with the response
          const newDocument = {
            id: data.fileId || data.id || Date.now(),
            name: file.name,
            type: documentType,
            status: 'uploaded',
            uploadDate: new Date().toLocaleDateString(),
            driveFileId: data.fileId || data.id,
            driveFolderId: data.folderId,
            folderName: data.folderName
          };
          
          // Map display names to keys
          const typeKey = {
            'Passport': 'passport',
            'Graduation Certificate': 'graduation',
            'Academic Transcripts': 'transcripts',
            'IELTS/TOEFL Score': 'ielts',
            'Statement of Purpose': 'sop',
            'CV/Resume': 'cv',
            'Letter of Recommendation': 'lor'
          }[documentType] || 'other';
          
          setDocumentsByType(prev => ({
            ...prev,
            [typeKey]: [...prev[typeKey], newDocument]
          }));
          
          // Set successful upload status
          setUploadStatus(prev => ({ ...prev, [documentType]: 'success' }));
          
          toast({ 
            title: "✅ Upload Successful!", 
            description: `${documentType} uploaded successfully! File ID: ${data.fileId}`,
            duration: 5000,
            className: "bg-green-50 border-green-200"
          });

          console.log(`Upload successful for ${documentType}:`, newDocument);

        } catch (uploadError) {
          console.error('Upload error details:', uploadError);
          
          // Set failed upload status
          setUploadStatus(prev => ({ ...prev, [documentType]: 'error' }));
          
          let errorMessage = 'Failed to upload document to Google Drive';
          if (uploadError.message) {
            errorMessage = uploadError.message;
          } else if (typeof uploadError === 'string') {
            errorMessage = uploadError;
          }
          
          toast({ 
            title: "❌ Upload Failed", 
            description: `${documentType}: ${errorMessage}`,
            variant: "destructive",
            duration: 7000
          });
        } finally {
          setUploading(prev => ({ ...prev, [documentType]: false }));
          // Don't clear upload status - keep it persistent until next upload
          // Reset file input
          event.target.value = '';
        }
      };

      fileReader.onerror = () => {
        setUploadStatus(prev => ({ ...prev, [documentType]: 'error' }));
        setUploading(prev => ({ ...prev, [documentType]: false }));
        toast({ 
          title: "❌ File Read Error", 
          description: "Failed to read the selected file", 
          variant: "destructive" 
        });
      };

      fileReader.readAsDataURL(file);

    } catch (error) {
      console.error('File processing error:', error);
      setUploadStatus(prev => ({ ...prev, [documentType]: 'error' }));
      setUploading(prev => ({ ...prev, [documentType]: false }));
      toast({ 
        title: "❌ File Processing Error", 
        description: "Failed to process the selected file", 
        variant: "destructive" 
      });
    }
  };

  const removeDocument = (documentType, id) => {
    const typeKey = {
      'Passport': 'passport',
      'Graduation Certificate': 'graduation',
      'Academic Transcripts': 'transcripts',
      'IELTS/TOEFL Score': 'ielts',
      'Statement of Purpose': 'sop',
      'CV/Resume': 'cv',
      'Letter of Recommendation': 'lor'
    }[documentType] || 'other';
    
    setDocumentsByType(prev => ({
      ...prev,
      [typeKey]: prev[typeKey].filter(doc => doc.id !== id)
    }));
    
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary relative">
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

                <Button 
                  onClick={savePersonalDetails} 
                  className="w-full" 
                  variant="hero"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Personal Details'
                  )}
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
                    Upload the required documents for your application. All documents should be in PDF format. You can upload multiple documents for each category.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Test Connection Button */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Debug Upload Issues</h4>
                    <p className="text-sm text-yellow-700 mb-3">If uploads are failing, test the Google Drive connection first:</p>
                    <Button
                      onClick={async () => {
                        try {
                          console.log('Starting connection test...');
                          toast({ title: "🔍 Testing Connection", description: "Checking Google Drive setup..." });
                          
                          const { data, error } = await supabase.functions.invoke('test-drive');
                          console.log('Test response:', { data, error });
                          
                          if (error) {
                            console.error('Test function error:', error);
                            throw new Error(error.message || 'Function invocation failed');
                          }
                          
                          if (!data) {
                            throw new Error('No response data received from test function');
                          }
                          
                          const success = data.success;
                          const message = success ? 
                            `✅ SUCCESS: ${data.message}` : 
                            `❌ FAILED: ${data.error}`;
                          
                          toast({ 
                            title: success ? "✅ Connection Test Passed" : "❌ Connection Test Failed",
                            description: success ? 
                              `Google Drive is properly configured! OAuth token obtained.` : 
                              data.error || 'Unknown error occurred',
                            variant: success ? "default" : "destructive",
                            duration: 10000
                          });
                          
                          console.log('Connection test result:', data);
                        } catch (err) {
                          console.error('Connection test failed:', err);
                          toast({ 
                            title: "❌ Connection Test Error", 
                            description: `Error: ${err.message || 'Failed to test connection'}`,
                            variant: "destructive",
                            duration: 10000
                          });
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      🔍 Test Google Drive Connection
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { id: 'passport', label: 'Passport', icon: FileText },
                      { id: 'graduation', label: 'Graduation Certificate', icon: GraduationCap },
                      { id: 'transcripts', label: 'Academic Transcripts', icon: FileText },
                      { id: 'ielts', label: 'IELTS/TOEFL Score', icon: FileText },
                      { id: 'sop', label: 'Statement of Purpose', icon: FileText },
                      { id: 'cv', label: 'CV/Resume', icon: FileText },
                      { id: 'lor', label: 'Letter of Recommendation', icon: FileText }
                     ].map((docType) => (
                      <div key={docType.id} className="space-y-3">
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                          uploadStatus[docType.label] === 'uploading' 
                            ? 'border-blue-400 bg-blue-50' 
                            : uploadStatus[docType.label] === 'success'
                            ? 'border-green-400 bg-green-50'
                            : uploadStatus[docType.label] === 'error'
                            ? 'border-red-400 bg-red-50'
                            : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}>
                          <docType.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <h3 className="font-medium mb-2">{docType.label}</h3>
                          
                          {/* Upload Status Indicator */}
                          {uploadStatus[docType.label] && (
                            <div className="mb-2">
                              {uploadStatus[docType.label] === 'uploading' && (
                                <div className="flex items-center justify-center gap-2 text-blue-600">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  <span className="text-sm">Uploading...</span>
                                </div>
                              )}
                              {uploadStatus[docType.label] === 'success' && (
                                <div className="flex items-center justify-center gap-2 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm">Upload Complete!</span>
                                </div>
                              )}
                              {uploadStatus[docType.label] === 'error' && (
                                <div className="flex items-center justify-center gap-2 text-red-600">
                                  <X className="h-4 w-4" />
                                  <span className="text-sm">Upload Failed</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <input
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            onChange={(e) => handleFileUpload(e, docType.label)}
                            className="hidden"
                            id={`upload-${docType.id}`}
                            disabled={uploading[docType.label]}
                          />
                          <Label
                            htmlFor={`upload-${docType.id}`}
                            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                              uploading[docType.label] 
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                                : uploadStatus[docType.label] === 'success'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                          >
                            {uploading[docType.label] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                Uploading...
                              </>
                            ) : uploadStatus[docType.label] === 'success' ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Upload Another
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                Upload
                              </>
                            )}
                          </Label>
                        </div>
                        
                        {/* Show uploaded documents for this type */}
                        {documentsByType[docType.id] && documentsByType[docType.id].length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Uploaded Files:</h4>
                            {documentsByType[docType.id].map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md border">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground">{doc.uploadDate}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Uploaded
                                  </Badge>
                                  <Button
                                    onClick={() => removeDocument(docType.label, doc.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-lg shadow-elegant max-w-md mx-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Success!</h3>
            <p className="text-muted-foreground">
              Your personal details have been saved successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardNew;