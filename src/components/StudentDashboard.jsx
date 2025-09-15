import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const StudentDashboard = ({ onBack }) => {
  const [personalDetails, setPersonalDetails] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    passportNumber: "",
    aadhaarNumber: ""
  });

  const [educationDetails, setEducationDetails] = useState([
    {
      id: "1",
      qualification: "",
      collegeName: "",
      branch: "",
      fromYear: "",
      toYear: "",
      cgpaPercentage: ""
    }
  ]);

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      qualification: "",
      collegeName: "",
      branch: "",
      fromYear: "",
      toYear: "",
      cgpaPercentage: ""
    };
    setEducationDetails([...educationDetails, newEducation]);
  };

  const removeEducation = (id) => {
    if (educationDetails.length > 1) {
      setEducationDetails(educationDetails.filter(edu => edu.id !== id));
    }
  };

  const updateEducation = (id, field, value) => {
    setEducationDetails(educationDetails.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const handleSave = () => {
    // Note: This would connect to Supabase for actual functionality
    toast({
      title: "Profile Updated",
      description: "Your details have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Student Profile
          </h1>
        </div>

        <div className="space-y-8">
          {/* Personal Details */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl">Personal Information</CardTitle>
              <CardDescription>
                Please provide your personal details for the application process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={personalDetails.fullName}
                    onChange={(e) => setPersonalDetails({...personalDetails, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={personalDetails.email}
                    onChange={(e) => setPersonalDetails({...personalDetails, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    placeholder="+91 XXXXX XXXXX"
                    value={personalDetails.contactNumber}
                    onChange={(e) => setPersonalDetails({...personalDetails, contactNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="passport">Passport Number</Label>
                  <Input
                    id="passport"
                    placeholder="Enter passport number"
                    value={personalDetails.passportNumber}
                    onChange={(e) => setPersonalDetails({...personalDetails, passportNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <Input
                    id="aadhaar"
                    placeholder="XXXX XXXX XXXX"
                    value={personalDetails.aadhaarNumber}
                    onChange={(e) => setPersonalDetails({...personalDetails, aadhaarNumber: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education Details */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Education Details</CardTitle>
                  <CardDescription>
                    Add your educational qualifications (10th, 12th/Inter, UG, etc.)
                  </CardDescription>
                </div>
                <Button onClick={addEducation} variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {educationDetails.map((education, index) => (
                <div key={education.id} className="border rounded-lg p-4 bg-gradient-card">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Education {index + 1}</h3>
                    {educationDetails.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm" 
                        onClick={() => removeEducation(education.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`qualification-${education.id}`}>Qualification</Label>
                      <Select
                        value={education.qualification}
                        onValueChange={(value) => updateEducation(education.id, "qualification", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select qualification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10th">10th Grade</SelectItem>
                          <SelectItem value="12th">12th Grade/Inter</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                          <SelectItem value="ug">Undergraduate (UG)</SelectItem>
                          <SelectItem value="pg">Postgraduate (PG)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`college-${education.id}`}>College/Institution Name</Label>
                      <Input
                        id={`college-${education.id}`}
                        placeholder="Enter institution name"
                        value={education.collegeName}
                        onChange={(e) => updateEducation(education.id, "collegeName", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`branch-${education.id}`}>Branch/Stream</Label>
                      <Input
                        id={`branch-${education.id}`}
                        placeholder="e.g., Computer Science, Commerce"
                        value={education.branch}
                        onChange={(e) => updateEducation(education.id, "branch", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`cgpa-${education.id}`}>CGPA/Percentage</Label>
                      <Input
                        id={`cgpa-${education.id}`}
                        placeholder="e.g., 8.5 CGPA or 85%"
                        value={education.cgpaPercentage}
                        onChange={(e) => updateEducation(education.id, "cgpaPercentage", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`from-${education.id}`}>From Year</Label>
                      <Input
                        id={`from-${education.id}`}
                        placeholder="2018"
                        value={education.fromYear}
                        onChange={(e) => updateEducation(education.id, "fromYear", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`to-${education.id}`}>To Year</Label>
                      <Input
                        id={`to-${education.id}`}
                        placeholder="2022"
                        value={education.toYear}
                        onChange={(e) => updateEducation(education.id, "toYear", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button onClick={handleSave} variant="hero" className="flex items-center gap-2 px-8">
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;