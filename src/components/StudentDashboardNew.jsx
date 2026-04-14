import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  GraduationCap,
  Pencil,
  Shield,
  BookOpen,
  Award,
  ScrollText,
  Briefcase,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboardNew = ({ onBack }) => {
  const navigate = useNavigate();
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
    lor1: [],
    lor2: [],
    lor3: []
  });
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({}); // Track upload status per document type
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Start in edit mode
  const [personalDetailsSaved, setPersonalDetailsSaved] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState([]);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState(null); // { docName, replaced }
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
        await loadStudentData(user.email,user);
        
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

  const loadStudentData = async (email,userObj) => {
    setIsEditMode(false);
    setPersonalDetailsSaved(true);
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
      await loadUploadedDocuments(userObj);
      
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

  const loadUploadedDocuments = async (userObj = user) => {
    if (!userObj) return;
    
    try {
      const { data: documents, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('user_id', userObj.id)
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
          lor1: [],
          lor2: [],
          lor3: []
        };

        documents.forEach(doc => {
          // Map document types to keys (case-insensitive, trimmed)
          const typeKey = {
            'Passport': 'passport',
            'Graduation Certificate': 'graduation',
            'Academic Transcripts': 'transcripts',
            'IELTS/TOEFL Score': 'ielts',
            'Statement of Purpose': 'sop',
            'CV/Resume': 'cv',
            'Letter of Recommendation 1': 'lor1',
            'Letter of Recommendation 2': 'lor2',
            'Letter of Recommendation 3': 'lor3'
          }[doc.document_type] || 'other';;
          //const normalizedType = doc.document_type ? doc.document_type.toLowerCase().trim() : '';
          //const typeKey = typeKeyMap[normalizedizedType] || 'other';

          // Only add if this category is empty (keeps only the latest document per category)
          if (documentsByTypeMap[typeKey] && documentsByTypeMap[typeKey].length === 0) {
            documentsByTypeMap[typeKey].push({
              id: doc.id,
              name: doc.file_name,
              type: doc.document_type,
              status: 'uploaded',
              uploadDate: new Date(doc.uploaded_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric'
              }),
              uploadTime: new Date(doc.uploaded_at).toLocaleTimeString('en-US', { 
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
              'lor1': 'Letter of Recommendation 1',
              'lor2': 'Letter of Recommendation 2',
              'lor3': 'Letter of Recommendation 3'
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
          duration: 3000
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
  //setIsEditMode(false);
  //setPersonalDetailsSaved(true);

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
  setIsEditMode(false); // Make fields non-editable after saving
  setPersonalDetailsSaved(true);
      
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
        uploadDate: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric'
        }),
        uploadTime: new Date().toLocaleTimeString('en-US', { 
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
        'Letter of Recommendation 1': 'lor1',
        'Letter of Recommendation 2': 'lor2',
        'Letter of Recommendation 3': 'lor3'
      }[documentType] || 'other';
      
      setDocumentsByType(prev => ({
        ...prev,
        [typeKey]: [newDocument]
      }));
      
      // Set successful upload status
      setUploadStatus(prev => ({ ...prev, [documentType]: 'success' }));

      // Show dark-glass upload success notification
      setUploadSuccessInfo({ docName: documentType, replaced: replacedExisting });
      setTimeout(() => setUploadSuccessInfo(null), 4000);

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
    const typeKeyMap = {
      'Passport': 'passport',
      'Graduation Certificate': 'graduation',
      'Academic Transcripts': 'transcripts',
      'IELTS/TOEFL Score': 'ielts',
      'Statement of Purpose': 'sop',
      'CV/Resume': 'cv',
      'Letter of Recommendation 1': 'lor1',
      'Letter of Recommendation 2': 'lor2',
      'Letter of Recommendation 3': 'lor3'
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
      { id: 'lor1', label: 'Letter of Recommendation 1' },
      { id: 'lor2', label: 'Letter of Recommendation 2' },
      { id: 'lor3', label: 'Letter of Recommendation 3' }
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
    // Automatically close the success popup after 9 seconds
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 9000);
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
      'passport', 'graduation', 'transcripts', 'ielts', 'sop', 'cv', 'lor1', 'lor2', 'lor3'
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
      duration: 3000
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof onBack === "function") {
      onBack();
    } else {
      navigate("/student-login", { replace: true });
    }
  };

  // ── Computed display values ───────────────────────────────────────────────
  const uploadedCount = Object.values(documentsByType).filter(arr => arr.length > 0).length;
  const profileFields = ['firstName','lastName','phone','dateOfBirth','address','passportNumber'];
  const profilePercent = Math.round(profileFields.filter(f => personalDetails[f]?.trim()).length / profileFields.length * 100);
  const initials = [personalDetails.firstName?.[0], personalDetails.lastName?.[0]].filter(Boolean).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)' }}
      >
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-indigo-400/60 border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <p className="text-white font-bold text-base">Loading your dashboard…</p>
          <p className="text-slate-400 text-sm mt-1">Fetching your data securely</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sdn-root min-h-screen" style={{ background: 'linear-gradient(135deg,#06001a 0%,#130038 30%,#0d1b4b 65%,#040e28 100%)' }}>
      <style>{`
        @keyframes sdn-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sdn-pop{0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}
        @keyframes sdn-float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.05)}}
        @keyframes sdn-pulse-ring{0%{transform:scale(0.95);opacity:.7}70%{transform:scale(1.15);opacity:0}100%{opacity:0}}
        .sdn-rise{animation:sdn-rise 0.55s cubic-bezier(0.22,1,0.36,1) both}
        .sdn-pop{animation:sdn-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both}
        .sdn-glass{background:rgba(255,255,255,0.055);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .sdn-glass-deep{background:rgba(255,255,255,0.04);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
        .sdn-root input:not([type=file]),.sdn-root input:not([type=file]):disabled{background:rgba(255,255,255,0.07)!important;border-color:rgba(255,255,255,0.13)!important;color:white!important}
        .sdn-root input:not([type=file])::placeholder{color:rgba(148,163,184,0.45)!important}
        .sdn-root input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1) opacity(.45)}
      `}</style>
      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full" style={{background:'radial-gradient(circle,rgba(139,92,246,0.35) 0%,transparent 68%)',animation:'sdn-float 16s ease-in-out infinite'}} />
        <div className="absolute top-1/3 -right-48 w-[580px] h-[580px] rounded-full" style={{background:'radial-gradient(circle,rgba(37,99,235,0.28) 0%,transparent 68%)',animation:'sdn-float 20s ease-in-out infinite',animationDelay:'-7s'}} />
        <div className="absolute -bottom-48 left-1/3 w-[520px] h-[520px] rounded-full" style={{background:'radial-gradient(circle,rgba(8,145,178,0.22) 0%,transparent 68%)',animation:'sdn-float 25s ease-in-out infinite',animationDelay:'-12s'}} />
        <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] rounded-full" style={{background:'radial-gradient(circle,rgba(236,72,153,0.15) 0%,transparent 68%)',animation:'sdn-float 19s ease-in-out infinite',animationDelay:'-4s'}} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 shadow-md" style={{background:'linear-gradient(90deg,#4f46e5 0%,#2563eb 55%,#0891b2 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-0 select-none">
                <span className="text-xl font-black tracking-tight" style={{
                  background:'linear-gradient(135deg,#ffffff 0%,#c7d2fe 40%,#93c5fd 100%)',
                  WebkitBackgroundClip:'text',
                  WebkitTextFillColor:'transparent',
                  backgroundClip:'text',
                  letterSpacing:'-0.03em'
                }}>Slot</span>
                <span className="text-xl font-black tracking-tight" style={{
                  background:'linear-gradient(135deg,#67e8f9 0%,#38bdf8 50%,#818cf8 100%)',
                  WebkitBackgroundClip:'text',
                  WebkitTextFillColor:'transparent',
                  backgroundClip:'text',
                  letterSpacing:'-0.03em'
                }}>Pilot</span>
                <span className="ml-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/40 self-end mb-0.5"></span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-blue-100/80 text-sm font-medium">
                {personalDetails.firstName ? `Hey, ${personalDetails.firstName}!` : user?.email}
              </span>
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {initials}
              </div>
              <Button onClick={handleLogout} size="sm" className="bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl gap-1.5 text-sm font-semibold">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* \u2500\u2500 Welcome \u2500\u2500 */}
        <div className="mb-6 sdn-rise" style={{animationDelay:'0.05s'}}>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
            {greeting}, {personalDetails.firstName || 'Student'}!
          </h1>
          <p className="text-slate-400 text-sm">Complete your profile and upload required documents to submit your application.</p>
        </div>

        {/* \u2500\u2500 Stat chips \u2500\u2500 */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-7 sdn-rise" style={{animationDelay:'0.08s'}}>
          <div className="rounded-2xl p-4 sdn-glass border border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</span>
              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{profilePercent}<span className="text-xs text-slate-400 font-semibold">%</span></p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500 transition-all duration-700" style={{width:`${profilePercent}%`}} />
            </div>
          </div>
          <div className="rounded-2xl p-4 sdn-glass border border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Docs</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{uploadedCount}<span className="text-xs text-slate-400 font-semibold">/9</span></p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{width:`${Math.round(uploadedCount/9*100)}%`}} />
            </div>
          </div>
          <div className="rounded-2xl p-4 sdn-glass border border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${applicationSubmitted ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-amber-100 dark:bg-amber-900/40'}`}>
                {applicationSubmitted ? <CheckCircle className="w-3.5 h-3.5 text-blue-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
              </div>
            </div>
            <p className={`text-sm font-black ${applicationSubmitted ? 'text-blue-300' : 'text-amber-300'}`}>
              {applicationSubmitted ? 'Submitted' : 'In Progress'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{applicationSubmitted ? 'Under review' : 'Pending docs'}</p>
          </div>
        </div>

        {/* \u2500\u2500 Tabs \u2500\u2500 */}
        <Tabs defaultValue="profile" className="space-y-5">
          <TabsList className="grid grid-cols-2 w-full max-w-xs sdn-glass border border-white/10 rounded-2xl p-1 shadow-sm sdn-rise" style={{animationDelay:'0.12s'}}>
            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow font-semibold text-sm flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />Profile
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow font-semibold text-sm flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />Documents
            </TabsTrigger>
          </TabsList>

          {/* \u2500\u2500 Profile Tab \u2500\u2500 */}
          <TabsContent value="profile">
            <Card className="rounded-3xl border border-white/10 shadow-lg overflow-hidden sdn-rise" style={{background:'rgba(255,255,255,0.05)',backdropFilter:'blur(24px)',animationDelay:'0.15s'}}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black text-white">Personal Information</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Your details for the application process</CardDescription>
                  </div>
                  {!isEditMode && personalDetailsSaved && (
                    <Button onClick={() => setIsEditMode(true)} variant="outline" size="sm"
                      className="rounded-xl border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 gap-1.5 text-xs font-bold bg-transparent">
                      <Pencil className="h-3.5 w-3.5" />Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">

                {/* Basic Info */}
                <div className="rounded-2xl overflow-hidden border border-white/10" style={{background:'rgba(99,102,241,0.07)'}}>
                  <div className="px-4 py-2.5 bg-indigo-500/15 border-b border-indigo-500/20 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/25 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-wide">Basic Information</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="firstName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</Label>
                      <Input id="firstName" value={personalDetails.firstName} onChange={(e) => handlePersonalDetailsChange('firstName', e.target.value)} placeholder="First name" disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</Label>
                      <Input id="lastName" value={personalDetails.lastName} onChange={(e) => handlePersonalDetailsChange('lastName', e.target.value)} placeholder="Last name" disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</Label>
                      <Input id="email" type="email" value={personalDetails.email} disabled className="rounded-xl h-9 text-sm bg-slate-50 dark:bg-slate-800/40" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</Label>
                      <Input id="phone" value={personalDetails.phone} onChange={(e) => handlePersonalDetailsChange('phone', e.target.value)} placeholder="Phone number" disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dateOfBirth" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</Label>
                      <Input id="dateOfBirth" type="date" value={personalDetails.dateOfBirth} onChange={(e) => handlePersonalDetailsChange('dateOfBirth', e.target.value)} disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="address" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</Label>
                      <Input id="address" value={personalDetails.address} onChange={(e) => handlePersonalDetailsChange('address', e.target.value)} placeholder="Full address" disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Passport */}
                <div className="rounded-2xl overflow-hidden border border-white/10" style={{background:'rgba(245,158,11,0.06)'}}>
                  <div className="px-4 py-2.5 bg-amber-500/15 border-b border-amber-500/20 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/25 flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wide">Passport Information</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <Label htmlFor="passportNumber" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passport Number</Label>
                      <Input id="passportNumber" value={personalDetails.passportNumber} onChange={(e) => handlePersonalDetailsChange('passportNumber', e.target.value)} placeholder="Passport number" disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="passportIssuedDate" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued Date</Label>
                      <Input id="passportIssuedDate" type="date" value={personalDetails.passportIssuedDate} onChange={(e) => handlePersonalDetailsChange('passportIssuedDate', e.target.value)} disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="passportExpiryDate" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</Label>
                      <Input id="passportExpiryDate" type="date" value={personalDetails.passportExpiryDate} onChange={(e) => handlePersonalDetailsChange('passportExpiryDate', e.target.value)} disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="rounded-2xl overflow-hidden border border-white/10" style={{background:'rgba(244,63,94,0.06)'}}>
                  <div className="px-4 py-2.5 bg-rose-500/15 border-b border-rose-500/20 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/25 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5 text-rose-300" />
                    </div>
                    <span className="text-xs font-black text-rose-300 uppercase tracking-wide">Emergency Contact</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="emergencyContact" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Name</Label>
                      <Input id="emergencyContact" value={personalDetails.emergencyContact} onChange={(e) => handlePersonalDetailsChange('emergencyContact', e.target.value)} placeholder="Emergency contact name" disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="emergencyPhone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</Label>
                      <Input id="emergencyPhone" value={personalDetails.emergencyPhone} onChange={(e) => handlePersonalDetailsChange('emergencyPhone', e.target.value)} placeholder="Emergency phone" disabled={!isEditMode} className="rounded-xl h-9 text-sm" />
                    </div>
                  </div>
                </div>

                {isEditMode && (
                  <Button onClick={savePersonalDetails} disabled={saving}
                    className="w-full h-12 rounded-2xl font-black text-base shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                    style={{background:'linear-gradient(135deg,#4f46e5,#2563eb)'}}>
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Saving\u2026
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Save Personal Details
                      </div>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* \u2500\u2500 Documents Tab \u2500\u2500 */}
          <TabsContent value="documents">
            <div className="space-y-4">

              {/* Progress card */}
              <div className="rounded-2xl p-5 sdn-glass border border-white/10 shadow-sm sdn-rise" style={{animationDelay:'0.15s'}}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-black text-sm text-white">Upload Progress</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{uploadedCount} of 9 documents ready</p>
                  </div>
                  <span className="text-2xl font-black" style={{color: uploadedCount === 9 ? '#10b981' : '#6366f1'}}>
                    {Math.round(uploadedCount/9*100)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.round(uploadedCount/9*100)}%`,background:'linear-gradient(90deg,#6366f1,#2563eb,#06b6d4)'}} />
                </div>
                {applicationSubmitted && !isEditMode && (
                  <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/25">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-bold text-green-300">Application submitted successfully</span>
                    </div>
                    <Button onClick={handleEditDocuments} variant="outline" size="sm"
                      className="rounded-xl text-[11px] border-green-500/40 text-green-300 hover:bg-green-500/10 h-7 px-2.5 bg-transparent">
                      <Upload className="h-3 w-3 mr-1" />Re-upload
                    </Button>
                  </div>
                )}
              </div>

              {/* Validation error */}
              {validationError && validationError.length > 0 && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="h-4 w-4 text-red-400" />
                    <h4 className="text-red-300 font-black text-xs uppercase tracking-wide">Missing required documents</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {validationError.map((doc, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-red-300 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                        {doc.label}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setValidationError(null)} className="text-xs text-red-400 hover:text-red-200 font-bold flex items-center gap-0.5">
                    <X className="h-3 w-3" />Dismiss
                  </button>
                </div>
              )}

              {/* Document cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sdn-rise" style={{animationDelay:'0.2s'}}>
                {[
                  { id: 'passport',    label: 'Passport',                       Icon: Shield,        grad: ['#4f46e5','#6366f1'], bg: 'rgba(99,102,241,0.25)' },
                  { id: 'graduation',  label: 'Graduation Certificate',         Icon: GraduationCap, grad: ['#2563eb','#3b82f6'], bg: 'rgba(37,99,235,0.25)' },
                  { id: 'transcripts', label: 'Academic Transcripts',           Icon: BookOpen,      grad: ['#0891b2','#06b6d4'], bg: 'rgba(8,145,178,0.25)' },
                  { id: 'ielts',       label: 'IELTS/TOEFL Score',             Icon: Award,         grad: ['#059669','#10b981'], bg: 'rgba(5,150,105,0.25)' },
                  { id: 'sop',         label: 'Statement of Purpose',           Icon: ScrollText,    grad: ['#7c3aed','#8b5cf6'], bg: 'rgba(124,58,237,0.25)' },
                  { id: 'cv',          label: 'CV/Resume',                      Icon: Briefcase,     grad: ['#d97706','#f59e0b'], bg: 'rgba(217,119,6,0.25)' },
                  { id: 'lor1',        label: 'Letter of Recommendation 1',     Icon: Star,          grad: ['#e11d48','#f43f5e'], bg: 'rgba(225,29,72,0.25)' },
                  { id: 'lor2',        label: 'Letter of Recommendation 2',     Icon: Star,          grad: ['#e11d48','#f43f5e'], bg: 'rgba(225,29,72,0.25)' },
                  { id: 'lor3',        label: 'Letter of Recommendation 3',     Icon: Star,          grad: ['#e11d48','#f43f5e'], bg: 'rgba(225,29,72,0.25)' },
                ].map((docType) => {
                  const uploaded = documentsByType[docType.id]?.length > 0;
                  const isUploading = uploading[docType.label];
                  const isMissing = validationError?.some(err => err.id === docType.id);
                  const isDisabled = isUploading || (applicationSubmitted && !isEditMode);
                  const DocIcon = docType.Icon;
                  return (
                    <div key={docType.id}
                      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-250 backdrop-blur-sm"
                      style={{
                        background: 'rgba(255,255,255,0.055)',
                        border: isMissing ? '1.5px solid rgba(252,165,165,0.7)' : uploaded ? '1.5px solid rgba(134,239,172,0.65)' : '1.5px solid rgba(255,255,255,0.1)',
                        boxShadow: uploaded ? '0 4px 20px rgba(16,185,129,0.15)' : '0 2px 12px rgba(0,0,0,0.25)'
                      }}
                    >
                      <div className="h-[5px]" style={{background:`linear-gradient(90deg,${docType.grad[0]},${docType.grad[1]})`}} />
                      <div className="flex items-center gap-4 p-5">
                        <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{background:docType.bg}}>
                          <DocIcon className="w-7 h-7" style={{color:docType.grad[0]}} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-100 leading-tight">{docType.label}</p>
                          {uploaded ? (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span className="text-xs text-emerald-400 font-semibold truncate">{documentsByType[docType.id][0].name}</span>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 mt-1">{isMissing ? '\u26A0 Required' : 'Not uploaded'}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-end flex-shrink-0">
                          {uploaded && (
                            <button onClick={() => handleDownloadDocument(documentsByType[docType.id][0])}
                              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-emerald-500/20 transition-colors"
                              title="Download">
                              <Download className="w-4 h-4 text-slate-300" />
                            </button>
                          )}
                          <input type="file" accept=".pdf,.jpg,.png,.jpeg"
                            onChange={(e) => handleFileUpload(e, docType.label)}
                            className="hidden" id={`upload-${docType.id}`} disabled={isDisabled} />
                          <Label htmlFor={`upload-${docType.id}`}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                              isDisabled ? 'bg-white/10 text-slate-500 cursor-not-allowed' : 'text-white cursor-pointer active:scale-95'
                            }`}
                            style={!isDisabled ? {background:`linear-gradient(135deg,${docType.grad[0]},${docType.grad[1]})`} : {}}
                          >
                            {isUploading
                              ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />\u2026</>
                              : <><Upload className="w-3.5 h-3.5" />{uploaded ? 'Replace' : 'Upload'}</>
                            }
                          </Label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit */}
              <div className="pt-2 sdn-rise" style={{animationDelay:'0.25s'}}>
                <Button onClick={handleSubmitApplication} size="lg"
                  className="w-full h-16 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/30 transition-all active:scale-[0.98]"
                  style={{background:'linear-gradient(135deg,#4f46e5 0%,#2563eb 55%,#0891b2 100%)'}}>
                  <CheckCircle className="h-6 w-6 mr-2.5" />
                  Submit Application
                </Button>
                <p className="text-center text-xs text-slate-400 mt-2">Review all uploads before final submission</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* \u2500\u2500 Save success overlay \u2500\u2500 */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="sdn-pop rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-white/10" style={{background:'rgba(15,10,40,0.85)',backdropFilter:'blur(30px)'}}>
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-green-400/20" style={{animation:'sdn-pulse-ring 2s ease-out infinite'}} />
              <div className="relative w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h3 className="text-lg font-black text-white mb-1">Details Saved!</h3>
            <p className="text-slate-300 text-sm">Your personal details have been saved successfully.</p>
          </div>
        </div>
      )}

      {/* \u2500\u2500 Application submitted popup \u2500\u2500 */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="sdn-pop rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/10 relative" style={{background:'rgba(15,10,40,0.88)',backdropFilter:'blur(30px)'}}>
            <button onClick={() => setShowSuccessPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Application Submitted!</h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">Your documents have been securely submitted. Our team will review your application and reach out within 24 hours.</p>
            <Button onClick={() => setShowSuccessPopup(false)}
              className="w-full h-11 rounded-2xl font-black"
              style={{background:'linear-gradient(135deg,#4f46e5,#2563eb)'}}>
              Got it!
            </Button>
          </div>
        </div>
      )}

      {/* \u2500\u2500 Document upload success notification \u2500\u2500 */}
      {uploadSuccessInfo && (
        <div className="fixed bottom-6 right-6 z-50 sdn-rise" style={{animationDuration:'0.35s'}}>
          <div className="flex items-start gap-3.5 rounded-2xl p-4 pr-5 shadow-2xl border border-white/10 min-w-[280px] max-w-[340px]"
            style={{background:'rgba(10,20,50,0.92)',backdropFilter:'blur(24px)'}}>
            <div className="relative flex-shrink-0 mt-0.5">
              <div className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping" style={{animationDuration:'1.4s'}} />
              <div className="relative w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white leading-tight">
                {uploadSuccessInfo.replaced ? 'File Replaced!' : 'Upload Successful!'}
              </p>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5 truncate">{uploadSuccessInfo.docName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Saved securely to your profile</p>
            </div>
            <button onClick={() => setUploadSuccessInfo(null)}
              className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors mt-0.5">
              <X className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* \u2500\u2500 Document re-upload selector \u2500\u2500 */}
      {showDocumentSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="sdn-pop border border-white/10 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col" style={{background:'rgba(15,10,40,0.88)',backdropFilter:'blur(30px)'}}>
            <div className="p-5 border-b border-white/10 flex-shrink-0">
              <h2 className="text-lg font-black text-white">Select Documents to Re-upload</h2>
              <p className="text-slate-400 text-xs mt-0.5">Choose which documents you want to replace</p>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'passport',    label: 'Passport',             Icon: Shield },
                  { id: 'graduation',  label: 'Graduation Cert.',     Icon: GraduationCap },
                  { id: 'transcripts', label: 'Transcripts',          Icon: BookOpen },
                  { id: 'ielts',       label: 'IELTS / TOEFL',        Icon: Award },
                  { id: 'sop',         label: 'Statement of Purpose', Icon: ScrollText },
                  { id: 'cv',          label: 'CV / Resume',          Icon: Briefcase },
                  { id: 'lor1',        label: 'LOR 1',                Icon: Star },
                  { id: 'lor2',        label: 'LOR 2',                Icon: Star },
                  { id: 'lor3',        label: 'LOR 3',                Icon: Star },
                ].map((docType) => {
                  const selected = selectedDocumentTypes.includes(docType.id);
                  const DocIcon = docType.Icon;
                  return (
                    <div key={docType.id} onClick={() => handleDocumentTypeToggle(docType)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        selected ? 'border-indigo-500 bg-indigo-500/15' : 'border-white/10 hover:border-indigo-400/50 hover:bg-white/5'
                      }`}
                    >
                      <DocIcon className={`h-5 w-5 ${selected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-bold text-center leading-tight text-slate-200">{docType.label}</span>
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                          <CheckCircle className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex gap-3 flex-shrink-0">
              <Button onClick={() => setShowDocumentSelector(false)} variant="outline" className="flex-1 rounded-2xl font-bold">Cancel</Button>
              <Button onClick={handleConfirmReupload} disabled={selectedDocumentTypes.length === 0}
                className="flex-1 rounded-2xl font-black"
                style={{background:'linear-gradient(135deg,#4f46e5,#2563eb)'}}>
                <Upload className="h-4 w-4 mr-1.5" />
                Enable Re-upload ({selectedDocumentTypes.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardNew;
