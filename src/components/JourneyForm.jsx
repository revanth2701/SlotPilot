import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const JourneyForm = ({ onBack }) => {
  // ✅ Always start at top whenever this page/component is shown
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [selectedCountry, setSelectedCountry] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [courseInterest, setCourseInterest] = useState("");
  const [selectedExams, setSelectedExams] = useState([]);
  const [examScores, setExamScores] = useState([]);

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const exams = [
    "IELTS", "TOEFL", "GRE", "GMAT", "SAT", "ACT", "PTE", "Duolingo"
  ];

  const handleExamToggle = (exam, checked) => {
    if (checked) {
      setSelectedExams([...selectedExams, exam]);
      setExamScores([...examScores, { exam, score: "" }]);
    } else {
      setSelectedExams(selectedExams.filter(e => e !== exam));
      setExamScores(examScores.filter(score => score.exam !== exam));
    }
  };

  const handleScoreChange = (exam, score) => {
    setExamScores(examScores.map(examScore => 
      examScore.exam === exam ? { ...examScore, score } : examScore
    ));
  };

  const validate = () => {
    const newErrors = {};
    if (!studentName.trim()) newErrors.studentName = "Student name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!email.trim() || !email.includes("@")) newErrors.email = "Valid email is required";
    if (!selectedCountry.trim()) newErrors.selectedCountry = "Preferred country is required";
    if (!studyLevel.trim()) newErrors.studyLevel = "Study level is required";
    if (!courseInterest.trim()) newErrors.courseInterest = "Course of interest is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!validate()) return;

    setSubmitting(true);

    // Prepare payload using exact Supabase column names you provided
    // Columns: "Student Name", "Contact Number", "Email Id", "Study Destination",
    // "Current Study Level", "Course of Interest", "Exams Written", "Createdon"
    const examsPayload = examScores.length ? examScores : selectedExams;
    const payload = {
      "Student Name": studentName,
      "Contact Number": phone,
      "Email Id": email,
      "Study Destination": selectedCountry,
      "Current Study Level": studyLevel,
      "Course of Interest": courseInterest,
      // store exams as JSON string so flexible structure (scores or plain list)
      "Exams Written": examsPayload.length ? JSON.stringify(examsPayload) : null,
      "Createdon": new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.from("PersonalisedGuidance").insert([payload]);
      if (error) {
        console.error("Supabase insert error:", error);
        alert("Failed to save — try again.");
      } else {
        // success
        alert("Details saved. We'll contact you soon.");
        // optional: reset form
        setStudentName("");
        setPhone("");
        setEmail("");
        setSelectedCountry("");
        setStudyLevel("");
        setCourseInterest("");
        setSelectedExams([]);
        setExamScores([]);
        setErrors({});
        setSubmitted(false);
      }
    } catch (err) {
      console.error("Unexpected error saving personalised guidance:", err);
      alert("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = studentName.trim() && phone.trim() && email.trim() && email.includes("@")
    && selectedCountry.trim() && studyLevel.trim() && courseInterest.trim();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Slotpilot Consultancy
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Start Your Academic Journey
          </h1>
          <p className="text-xl text-muted-foreground">
            Tell us about your study preferences and exam scores to get personalized guidance
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl">Academic Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Name */}
            <div className="space-y-2">
              <Label htmlFor="student-name">Student Name <span className="text-rose-600">*</span></Label>
              <Input
                id="student-name"
                placeholder="Full name"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className={errors.studentName && submitted ? "border-rose-500" : ""}
                required
              />
              {errors.studentName && submitted && <p className="text-rose-600 text-sm mt-1">{errors.studentName}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-rose-600">*</span></Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={errors.phone && submitted ? "border-rose-500" : ""}
                required
              />
              {errors.phone && submitted && <p className="text-rose-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email ID <span className="text-rose-600">*</span></Label>
              <Input
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={errors.email && submitted ? "border-rose-500" : ""}
                required
              />
              {errors.email && submitted && <p className="text-rose-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Country Text Box */}
            <div className="space-y-2">
              <Label htmlFor="country">Preferred Study Destination <span className="text-rose-600">*</span></Label>
              <Input
                id="country"
                placeholder="Enter your preferred country"
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className={errors.selectedCountry && submitted ? "border-rose-500" : ""}
                required
              />
              {errors.selectedCountry && submitted && <p className="text-rose-600 text-sm mt-1">{errors.selectedCountry}</p>}
            </div>

            {/* Study Level Text Box */}
            <div className="space-y-2">
              <Label htmlFor="study-level">Current Study Level <span className="text-rose-600">*</span></Label>
              <Input
                id="study-level"
                placeholder="Enter your study level (e.g., Undergraduate, Masters, PhD)"
                value={studyLevel}
                onChange={e => setStudyLevel(e.target.value)}
                className={errors.studyLevel && submitted ? "border-rose-500" : ""}
                required
              />
              {errors.studyLevel && submitted && <p className="text-rose-600 text-sm mt-1">{errors.studyLevel}</p>}
            </div>

            {/* Course Interest */}
            <div className="space-y-2">
              <Label htmlFor="course">Course of Interest <span className="text-rose-600">*</span></Label>
              <Input 
                id="course"
                placeholder="e.g., Computer Science, Business Administration, etc."
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
                className={errors.courseInterest && submitted ? "border-rose-500" : ""}
                required
              />
              {errors.courseInterest && submitted && <p className="text-rose-600 text-sm mt-1">{errors.courseInterest}</p>}
            </div>

            {/* Exams Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Exams Taken</Label>
              <p className="text-sm text-muted-foreground">
                Select all exams you have taken and provide your scores (optional)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam) => (
                  <div key={exam} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={exam}
                        checked={selectedExams.includes(exam)}
                        onCheckedChange={(checked) => handleExamToggle(exam, checked)}
                      />
                      <Label htmlFor={exam} className="font-medium">{exam}</Label>
                    </div>
                    
                    {selectedExams.includes(exam) && (
                      <Input
                        placeholder={`Enter your ${exam} score`}
                        value={examScores.find(score => score.exam === exam)?.score || ""}
                        onChange={(e) => handleScoreChange(exam, e.target.value)}
                        className="ml-6"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Button 
                onClick={handleSubmit}
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 text-lg py-3 h-auto"
                size="lg"
                disabled={!isFormValid || submitting}
              >
                {submitting ? "Submitting…" : "Get Personalized Guidance"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JourneyForm;