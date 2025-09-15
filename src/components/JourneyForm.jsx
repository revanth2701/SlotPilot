import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, GraduationCap } from "lucide-react";

const JourneyForm = ({ onBack }) => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [courseInterest, setCourseInterest] = useState("");
  const [selectedExams, setSelectedExams] = useState([]);
  const [examScores, setExamScores] = useState([]);

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "Ireland"
  ];

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

  const handleSubmit = () => {
    // Handle form submission
    console.log({
      selectedCountry,
      studyLevel,
      courseInterest,
      selectedExams,
      examScores
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GlobalEdu Consultancy
              </span>
            </div>
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
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
            {/* Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="country">Preferred Study Destination</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Study Level */}
            <div className="space-y-2">
              <Label htmlFor="study-level">Study Level</Label>
              <Select value={studyLevel} onValueChange={setStudyLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select study level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="masters">Masters</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Interest */}
            <div className="space-y-2">
              <Label htmlFor="course">Course of Interest</Label>
              <Input 
                id="course"
                placeholder="e.g., Computer Science, Business Administration, etc."
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
              />
            </div>

            {/* Exams Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Exams Taken</Label>
              <p className="text-sm text-muted-foreground">
                Select all exams you have taken and provide your scores
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
              >
                Get Personalized Guidance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JourneyForm;