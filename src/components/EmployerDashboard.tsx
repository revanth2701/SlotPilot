import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Search, Eye, Download, Users, GraduationCap, Globe, BookOpen } from "lucide-react";

interface StudentData {
  id: string;
  name: string;
  email: string;
  contact: string;
  passport: string;
  qualifications: string[];
  status: "pending" | "reviewing" | "approved" | "rejected";
  appliedDate: string;
}

interface EmployerDashboardProps {
  onBack: () => void;
}

const EmployerDashboard = ({ onBack }: EmployerDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - In real app, this would come from Supabase
  const studentsData: StudentData[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      contact: "+91 98765 43210",
      passport: "A1234567",
      qualifications: ["10th", "12th", "B.Tech CSE"],
      status: "pending",
      appliedDate: "2024-01-15"
    },
    {
      id: "2",
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      contact: "+91 87654 32109",
      passport: "B2345678",
      qualifications: ["10th", "12th", "B.Com", "MBA"],
      status: "reviewing",
      appliedDate: "2024-01-10"
    },
    {
      id: "3",
      name: "Arun Patel",
      email: "arun.patel@email.com",
      contact: "+91 76543 21098",
      passport: "C3456789",
      qualifications: ["10th", "12th", "B.Sc Physics"],
      status: "approved",
      appliedDate: "2024-01-08"
    }
  ];

  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewing": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalStudents = studentsData.length;
  const pendingReview = studentsData.filter(s => s.status === "pending").length;
  const approved = studentsData.filter(s => s.status === "approved").length;
  const reviewing = studentsData.filter(s => s.status === "reviewing").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Employer Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold text-primary">{totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingReview}</p>
                </div>
                <BookOpen className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                  <p className="text-3xl font-bold text-blue-600">{reviewing}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-success">{approved}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Student Applications</CardTitle>
                <CardDescription>
                  Manage and review student applications for international studies
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Passport</TableHead>
                    <TableHead>Qualifications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.contact}</TableCell>
                      <TableCell className="font-mono">{student.passport}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.qualifications.map((qual, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {qual}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(student.status)} capitalize`}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.appliedDate}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerDashboard;