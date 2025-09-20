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
import { useToast } from "@/hooks/use-toast";
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
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState([]);
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
        
        // Check if application was previously submitted
        const submittedStatus = localStorage.getItem(`application_submitted_${user.id}`);
        if (submittedStatus === 'true') {
          setApplicationSubmitted(true);
        }
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

      // Load previously uploaded documents
      await loadUploadedDocuments();
      
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

  const loadUploadedDocuments = async () => {
    if (!user) return;
    
    try {
      const { data: documents, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
        return;
      }

      if (documents && documents.length > 0) {
        // Transform database documents to UI format
        const documentsByTypeMap = {
          passport: [],
          graduation: [],
          transcripts: [],
          ielts: [],
          sop: [],
          cv: [],
          lor: []
        };

        documents.forEach(doc => {
          // Map document types to keys
          const typeKey = {
            'Passport': 'passport',
            'Graduation Certificate': 'graduation',
            'Academic Transcripts': 'transcripts',
            'IELTS/TOEFL Score': 'ielts',
            'Statement of Purpose': 'sop',
            'CV/Resume': 'cv',
            'Letter of Recommendation': 'lor'
          }[doc.document_type] || 'other';

          // Only add if this category is empty (keeps only the latest document per category)
          if (documentsByTypeMap[typeKey] && documentsByTypeMap[typeKey].length === 0) {
            documentsByTypeMap[typeKey].push({
              id: doc.id,
              name: doc.file_name,
              type: doc.document_type,
              status: 'uploaded',
              uploadDate: new Date(doc.uploaded_at).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              }),
              filePath: doc.file_path,
              fileSize: doc.file_size,
              mimeType: doc.mime_type
            });
          }
        });

        setDocumentsByType(documentsByTypeMap);
        
        // Set success status for uploaded document types
        const uploadStatusMap = {};
        Object.keys(documentsByTypeMap).forEach(key => {
          if (documentsByTypeMap[key].length > 0) {
            const displayName = {
              'passport': 'Passport',
              'graduation': 'Graduation Certificate',
              'transcripts': 'Academic Transcripts',
              'ielts': 'IELTS/TOEFL Score',
              'sop': 'Statement of Purpose',
              'cv': 'CV/Resume',
              'lor': 'Letter of Recommendation'
            }[key];
            if (displayName) {
              uploadStatusMap[displayName] = 'success';
            }
          }
        });
        setUploadStatus(uploadStatusMap);

        const totalDocs = documents.length;
        toast({ 
          title: "Documents Loaded", 
          description: `Found ${totalDocs} previously uploaded document(s).`,
          duration: 3000,
          className: "bg-blue-50 border-blue-200"
        });
      }
    } catch (error) {
      console.error('Error loading uploaded documents:', error);
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

  const handleDownloadDocument = async (doc) => {
    try {
      const { data, error } = await supabase.storage
        .from('student-documents')
        .download(doc.filePath);

      if (error) {
        console.error('Error downloading file:', error);
        toast({ 
          title: "Download Failed", 
          description: "Could not download the document", 
          variant: "destructive" 
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ 
        title: "Download Started", 
        description: `Downloading ${doc.name}...`, 
        duration: 2000 
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({ 
        title: "Download Failed", 
        description: "An error occurred while downloading", 
        variant: "destructive" 
      });
    }
  };

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear validation error when user starts uploading
    setValidationError(null);

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

      console.log(`Starting upload for ${documentType}: ${file.name}`);
      
      // Create file path: FirstName_LastName/document_type/filename
      const studentName = `${personalDetails.firstName}_${personalDetails.lastName}`.replace(/[^a-zA-Z0-9_]/g, '_');
      const filePath = `${studentName}/${documentType.replace(/[^a-zA-Z0-9]/g, '_')}/${file.name}`;
      
      // Upload to Supabase Storage with duplicate handling
      let uploadData;
      let replacedExisting = false;
      const firstTry = await supabase.storage
        .from('student-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (firstTry.error) {
        const isDuplicate = firstTry.error.statusCode === '409' || /exists/i.test(firstTry.error.message || '');
        if (isDuplicate) {
          // Try replacing the existing file
          const secondTry = await supabase.storage
            .from('student-documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });
          if (secondTry.error) {
            console.error('Storage upload (replace) error:', secondTry.error);
            throw secondTry.error;
          }
          uploadData = secondTry.data;
          replacedExisting = true;
        } else {
          console.error('Storage upload error:', firstTry.error);
          throw firstTry.error;
        }
      } else {
        uploadData = firstTry.data;
      }

      console.log('File uploaded to storage:', uploadData);

      // Create document record in database
      const { data: docRecord, error: docError } = await supabase
        .from('student_documents')
        .insert([
          {
            user_id: user.id,
            student_email: personalDetails.email,
            student_first_name: personalDetails.firstName,
            student_last_name: personalDetails.lastName,
            document_type: documentType,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type
          }
        ])
        .select()
        .single();

      if (docError) {
        console.error('Database record error:', docError);
        // Try to clean up uploaded file
        await supabase.storage.from('student-documents').remove([filePath]);
        throw docError;
      }

      console.log('Document record created:', docRecord);

      // Create document record for UI
      const newDocument = {
        id: docRecord.id,
        name: file.name,
        type: documentType,
        status: 'uploaded',
        uploadDate: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        filePath: uploadData.path,
        fileSize: file.size,
        mimeType: file.type
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
        title: replacedExisting ? "✅ File Replaced" : "✅ Upload Successful!", 
        description: replacedExisting 
          ? `${documentType} replaced successfully in secure storage.` 
          : `${documentType} uploaded successfully to secure storage!`,
        duration: 5000,
        className: "bg-green-50 border-green-200"
      });

      console.log(`Upload successful for ${documentType}:`, newDocument);

    } catch (uploadError) {
      console.error('Upload error details:', uploadError);
      
      // Set failed upload status
      setUploadStatus(prev => ({ ...prev, [documentType]: 'error' }));
      
      let errorMessage = 'Failed to upload document';
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
      // Reset file input
      event.target.value = '';
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

  const handleSubmitApplication = () => {
    // Clear any previous validation errors
    setValidationError(null);
    
    // Define all required document types
    const allRequiredDocuments = [
      { id: 'passport', label: 'Passport' },
      { id: 'graduation', label: 'Graduation Certificate' },
      { id: 'transcripts', label: 'Academic Transcripts' },
      { id: 'ielts', label: 'IELTS/TOEFL Score' },
      { id: 'sop', label: 'Statement of Purpose' },
      { id: 'cv', label: 'CV/Resume' },
      { id: 'lor', label: 'Letter of Recommendation' }
    ];
    
    // Determine which documents to validate based on mode
    let documentsToValidate;
    if (isEditMode && selectedDocumentTypes.length > 0) {
      // In re-upload mode: only validate selected documents
      documentsToValidate = allRequiredDocuments.filter(doc => 
        selectedDocumentTypes.includes(doc.id)
      );
    } else {
      // Normal mode: validate all documents
      documentsToValidate = allRequiredDocuments;
    }
    
    // Check which documents are missing from the validation set
    const missingDocuments = documentsToValidate.filter(doc => 
      !documentsByType[doc.id] || documentsByType[doc.id].length === 0
    );
    
    if (missingDocuments.length > 0) {
      setValidationError(missingDocuments);
      // Show appropriate toast message based on mode
      const modeText = isEditMode ? "selected re-upload" : "required";
      toast({ 
        title: "Missing Documents", 
        description: `Please check the highlighted ${modeText} documents below.`,
        variant: "destructive",
        duration: 5000
      });
      return;
    }
    
    // All required/selected documents uploaded, mark application as submitted
    setApplicationSubmitted(true);
    setIsEditMode(false);
    setSelectedDocumentTypes([]); // Clear selected documents
    localStorage.setItem(`application_submitted_${user.id}`, 'true');
    
    // Show success popup
    setShowSuccessPopup(true);
  };

  const handleEditDocuments = () => {
    setShowDocumentSelector(true);
  };

  const handleDocumentTypeToggle = (docType) => {
    setSelectedDocumentTypes(prev => {
      if (prev.includes(docType.id)) {
        return prev.filter(id => id !== docType.id);
      } else {
        return [...prev, docType.id];
      }
    });
  };

  const handleSelectAllDocuments = () => {
    const allDocTypes = [
      'passport', 'graduation', 'transcripts', 'ielts', 'sop', 'cv', 'lor'
    ];
    setSelectedDocumentTypes(allDocTypes);
  };

  const handleConfirmReupload = () => {
    if (selectedDocumentTypes.length === 0) {
      toast({ 
        title: "No Selection", 
        description: "Please select at least one document type to re-upload.",
        variant: "destructive" 
      });
      return;
    }
    
    setIsEditMode(true);
    setShowDocumentSelector(false);
    setShowSuccessPopup(false);
    
    toast({ 
      title: "Re-upload Mode Enabled", 
      description: `You can now re-upload: ${selectedDocumentTypes.length} document type(s).`,
      duration: 3000,
      className: "bg-blue-50 border-blue-200"
    });
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
                   
                   {/* Show Edit Documents button when application is submitted but not in edit mode */}
                   {applicationSubmitted && !isEditMode && (
                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <CheckCircle className="h-5 w-5 text-green-600" />
                           <span className="text-green-800 font-medium">Application Submitted Successfully</span>
                         </div>
                         <Button 
                           onClick={handleEditDocuments}
                           variant="outline"
                           size="sm"
                           className="border-green-300 text-green-700 hover:bg-green-100"
                         >
                            <Upload className="h-4 w-4 mr-2" />
                            Re-upload Documents
                         </Button>
                       </div>
                       <p className="text-green-700 text-sm mt-2">
                         Your documents have been successfully submitted. Click "Edit Documents" to modify them.
                       </p>
                     </div>
                   )}
                 </CardHeader>
                 
                 {/* Validation Error Display */}
                 {validationError && validationError.length > 0 && (
                   <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                     <div className="flex items-center gap-2 mb-2">
                       <X className="h-5 w-5 text-red-600" />
                       <h4 className="text-red-800 font-semibold">Missing Required Documents</h4>
                     </div>
                     <p className="text-red-700 text-sm mb-3">
                       Please upload the following documents to submit your application:
                     </p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {validationError.map((doc, index) => (
                         <div key={index} className="flex items-center gap-2 text-red-700 text-sm">
                           <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                           <span>{doc.label}</span>
                         </div>
                       ))}
                     </div>
                     <Button 
                       onClick={() => setValidationError(null)}
                       variant="ghost" 
                       size="sm" 
                       className="mt-3 text-red-600 hover:text-red-800 h-auto p-1"
                     >
                       <X className="h-4 w-4 mr-1" />
                       Dismiss
                     </Button>
                   </div>
                 )}
                 
                 <CardContent className="space-y-6">
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
                           // Check if this document is missing and show red border
                           validationError && validationError.some(err => err.id === docType.id)
                             ? 'border-red-400 bg-red-50'
                             : uploadStatus[docType.label] === 'uploading' 
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
                            disabled={uploading[docType.label] || (applicationSubmitted && !isEditMode) || (applicationSubmitted && isEditMode && !selectedDocumentTypes.includes(docType.id))}
                          />
                           <Label
                            htmlFor={`upload-${docType.id}`}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                               uploading[docType.label] || (applicationSubmitted && !isEditMode) || (applicationSubmitted && isEditMode && !selectedDocumentTypes.includes(docType.id))
                                 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                                 : uploadStatus[docType.label] === 'success'
                                 ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                                 : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                             }`}
                          >
                             {uploading[docType.label] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                Uploading...
                              </>
                             ) : (applicationSubmitted && !isEditMode) ? (
                               <>
                                 <CheckCircle className="h-4 w-4" />
                                 Submitted
                               </>
                             ) : (applicationSubmitted && isEditMode && !selectedDocumentTypes.includes(docType.id)) ? (
                               <>
                                 <X className="h-4 w-4" />
                                 Not Selected
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
                                     <p className="text-sm font-medium truncate">
                                       <span className="text-primary font-semibold">{doc.name}</span>
                                       <span className="text-muted-foreground"> uploaded on </span>
                                       <span className="text-green-700">{doc.uploadDate}</span>
                                     </p>
                                   </div>
                                </div>
                                 <div className="flex items-center gap-2">
                                   <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                     <CheckCircle className="h-3 w-3 mr-1" />
                                     Uploaded
                                   </Badge>
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => handleDownloadDocument(doc)}
                                     className="h-6 px-2 text-xs"
                                   >
                                     <Download className="h-3 w-3 mr-1" />
                                     Download
                                   </Button>
                                    {(!applicationSubmitted || isEditMode) && (
                                     <Button
                                       onClick={() => removeDocument(docType.label, doc.id)}
                                       variant="ghost"
                                       size="sm"
                                       className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                     >
                                       <X className="h-3 w-3" />
                                     </Button>
                                   )}
                                 </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                     ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Final Submit Button */}
                  <div className="text-center">
                    <Button 
                      size="lg" 
                      className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                      onClick={handleSubmitApplication}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Submit Application
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Review all uploaded documents before final submission
                    </p>
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

      {/* Application Submitted Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-lg shadow-elegant max-w-md mx-4 text-center">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-green-700">Application Submitted Successfully! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              All your documents have been uploaded successfully. Our team will review your application and get back to you soon.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Type Selection Modal */}
      {showDocumentSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-lg shadow-elegant max-w-lg mx-4">
            <div className="flex items-center gap-2 mb-6">
              <Upload className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Select Documents to Re-upload</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Choose which document categories you want to re-upload. You can select one or multiple categories.
            </p>
            
            <div className="space-y-3 mb-6">
              {[
                { id: 'passport', label: 'Passport', icon: FileText },
                { id: 'graduation', label: 'Graduation Certificate', icon: GraduationCap },
                { id: 'transcripts', label: 'Academic Transcripts', icon: FileText },
                { id: 'ielts', label: 'IELTS/TOEFL Score', icon: FileText },
                { id: 'sop', label: 'Statement of Purpose', icon: FileText },
                { id: 'cv', label: 'CV/Resume', icon: FileText },
                { id: 'lor', label: 'Letter of Recommendation', icon: FileText }
              ].map((docType) => (
                <div 
                  key={docType.id} 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedDocumentTypes.includes(docType.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handleDocumentTypeToggle(docType)}
                >
                  <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center ${
                    selectedDocumentTypes.includes(docType.id) 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground'
                  }`}>
                    {selectedDocumentTypes.includes(docType.id) && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <docType.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{docType.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <Button 
                onClick={handleSelectAllDocuments}
                variant="outline" 
                size="sm"
              >
                Select All
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedDocumentTypes.length} document(s) selected
              </span>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowDocumentSelector(false);
                  setSelectedDocumentTypes([]);
                }}
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmReupload}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={selectedDocumentTypes.length === 0}
              >
                Enable Re-upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardNew;