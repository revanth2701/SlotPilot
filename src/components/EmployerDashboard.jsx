import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { supabase } from "@/integrations/supabase/client";

// icons
import {
  Download,
  Users,
  BookOpen,
  Globe,
  GraduationCap,
  Search
} from "lucide-react";

// ui components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// tabs (already used)
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const EmployerDashboard = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDocuments, setStudentDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);

  // Visa data fetched from DB
  const [visaData, setVisaData] = useState([]);
  const [visaLoading, setVisaLoading] = useState(false);

  // Fetch students from Supabase
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("Studentpersonaldata").select("*");
      if (!error && data) {
        setStudentsData(data);
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  // Fetch documents for selected student
  const fetchStudentDocuments = async (student) => {
    setDocLoading(true);
    setStudentDocuments([]);
    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .eq("student_email", student.Email);
    if (!error && data) {
      setStudentDocuments(data);
      console.log("Fetched documents for", student.Email, data);
    } else {
      console.warn("Error fetching documents:", error);
    }
    setDocLoading(false);
  };

  // Fetch visa applications from Supabase
  useEffect(() => {
    const fetchVisas = async () => {
      setVisaLoading(true);
      try {
        const { data, error } = await supabase.from("Visaappointments").select("*");
        console.log("Visaappointments fetch result:", { data, error });
        if (error) {
          console.error("Error fetching Visaappointments:", error);
          setVisaData([]);
        } else {
          setVisaData(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Unexpected error fetching visas:", err);
        setVisaData([]);
      } finally {
        setVisaLoading(false);
      }
    };
    fetchVisas();
  }, []);

  const filteredStudents = studentsData.filter(student =>
    (((student?.["First Name"] || "") + " " + (student?.["Last Name"] || "")).toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((student?.Email || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredVisa = visaData.filter((row) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return Object.values(row).some(v => (v === null || v === undefined ? "" : String(v)).toLowerCase().includes(q));
  });

  const totalStudents = studentsData.length;
  const pendingReview = 0;
  const approved = 0;
  const reviewing = 0;

  const downloadStudentDocumentsFromBucket = async (student) => {
    setDocLoading(true);
    setSelectedStudent(student);

    console.log("Querying documents for:", student.Email && student.Email.trim());
    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .ilike("student_email", (student.Email || "").trim());
    console.log("Supabase result:", data, error);

    if (error || !data || data.length === 0) {
      alert("No documents found for this student.");
      setDocLoading(false);
      return;
    }

    const zip = new JSZip();

    await Promise.all(
      data.map(async (doc) => {
        try {
          const { data: fileData, error: fileError } = await supabase
            .storage
            .from("student-documents")
            .download(doc.file_path);

          if (fileError || !fileData) {
            console.error("Download failed for:", doc.file_path, fileError);
            return;
          }

          let blob;
          if (fileData instanceof Blob) {
            blob = fileData;
          } else if (fileData instanceof Response && fileData.body) {
            blob = await fileData.blob();
          } else {
            console.error("fileData is not a Blob or Response:", fileData);
            return;
          }

          if (blob.size === 0) {
            console.warn("Blob is empty for:", doc.file_path);
          } else {
            zip.file(doc.file_name || doc.document_type || doc.file_path.split("/").pop(), blob);
          }
        } catch (err) {
          console.error("Error fetching file:", doc.file_path, err);
        }
      })
    );

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(
        content,
        `${(student?.["First Name"] || student?.firstName || "student")}_${(student?.["Last Name"] || student?.lastName || "")}_documents.zip`
      );
      setDocLoading(false);
    }).catch(err => {
      console.error("Error generating zip:", err);
      setDocLoading(false);
    });
  };

  const formatCell = (val) => {
    if (val === null || val === undefined || val === "") return "—";
    if (typeof val === "string" && (/\d{4}-\d{2}-\d{2}T|\d{4}-\d{2}-\d{2}/).test(val)) {
      const d = new Date(val);
      if (!Number.isNaN(d.getTime())) return d.toLocaleString();
    }
    if (typeof val === "object") {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  };

  // compute visa columns once so header/rows use the same order
  const visaCols = visaData.length ? Array.from(new Set(visaData.flatMap(Object.keys))) : [];

  // Export visaData as CSV and download (Excel can open CSV)
  const exportVisasAsCSV = () => {
    if (!visaData || visaData.length === 0) {
      alert("No visa data to download.");
      return;
    }

    const cols = visaCols.length ? visaCols : Array.from(new Set(visaData.flatMap(Object.keys)));

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerRow = cols.map(c => escapeCsv(c)).join(",");
    const dataRows = visaData.map(row => cols.map(col => escapeCsv(row[col])).join(","));
    const csv = [headerRow, ...dataRows].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `visa_applications_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Divine background: soft gold gradient + subtle mandala motif behind content */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-amber-50 via-white to-rose-50" />
      <svg
        className="absolute right-0 top-0 -z-10 opacity-10 w-[680px] h-[680px] transform translate-x-24 -translate-y-24"
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#FDE68A" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <g fill="url(#g1)" transform="translate(0,0)">
          <circle cx="400" cy="400" r="360" />
          <g opacity="0.9" fill="#FFF4D1">
            <path d="M400 120c40 0 70 30 70 70s-30 70-70 70-70-30-70-70 30-70 70-70z" />
            <path d="M400 240c90 0 160 70 160 160s-70 160-160 160-160-70-160-160 70-160 160-160z" />
          </g>
        </g>
      </svg>

      <div className="max-w-7xl mx-auto relative z-10 px-6 py-8">
        {/* translucent container with gentle gold border to make UI feel 'divine' */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-amber-100 p-6">
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="mb-8 flex gap-4 bg-gradient-to-r from-primary/10 to-accent/10 p-2 rounded-xl shadow">
              <TabsTrigger value="students" className="text-lg font-semibold">Students</TabsTrigger>
              <TabsTrigger value="visas" className="text-lg font-semibold">Visas</TabsTrigger>
            </TabsList>

            <TabsContent value="students">
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
                        Manage and Review Student Applications for International Studies
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
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                          </TableRow>
                        ) : filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center">No students found.</TableCell>
                          </TableRow>
                        ) : filteredStudents.map((student, idx) => (
                          <TableRow key={(student.Email || "") + idx}>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-semibold">{student["First Name"]} {student["Last Name"]}</p>
                                <p className="text-sm text-muted-foreground">{student.Email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{student["contact Number"]}</TableCell>
                            <TableCell className="font-mono">{student["Passport Number"]}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {student["Expiry Date"]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-gray-100 text-gray-800 capitalize">N/A</Badge>
                            </TableCell>
                            <TableCell>{student["Issued Date"]}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => downloadStudentDocumentsFromBucket(student)}
                                disabled={docLoading && selectedStudent?.Email === student.Email}
                              >
                                <Download className="h-3 w-3" />
                                {docLoading && selectedStudent?.Email === student.Email ? "Downloading..." : "Download"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visas">
              <Card className="relative overflow-hidden rounded-2xl shadow-2xl">
                {/* decorative background placed behind content */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 opacity-40 pointer-events-none backdrop-blur-sm" />
                <div className="relative p-6 border-b">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">Visa Applications</h3>
                      <p className="text-sm text-muted-foreground mt-1">Live list of applications submitted by users</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, email, passport, country..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-80"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setVisaLoading(true);
                          const { data, error } = await supabase.from("Visaappointments").select("*");
                          setVisaData(error ? [] : (Array.isArray(data) ? data : []));
                          setVisaLoading(false);
                        }}
                        className="px-3"
                      >
                        Refresh
                      </Button>

                      <Button
                        onClick={exportVisasAsCSV}
                        disabled={visaLoading || visaData.length === 0}
                        className={
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-white shadow-md " +
                          (visaLoading || visaData.length === 0
                            ? "opacity-50 cursor-not-allowed bg-gray-400"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-[1.01] transform transition")
                        }
                      >
                        <span className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Download className="h-4 w-4 text-white" />
                        </span>
                        <div className="text-left">
                          <div className="text-sm font-semibold">{visaLoading ? "Preparing..." : "Download CSV"}</div>
                          <div className="text-xs text-white/90">Export current data</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* refreshed summary chips (removed 'Last submitted') */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="px-3 py-2 rounded-lg bg-white/60 text-indigo-700 text-sm font-semibold shadow-sm backdrop-blur">
                      Total: <span className="ml-2 text-lg">{visaData.length}</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/60 text-emerald-700 text-sm font-semibold shadow-sm backdrop-blur">
                      Countries: <span className="ml-2 text-lg">{Array.from(new Set(visaData.map(r => String(r["Country"] || r.country || "").trim()).filter(Boolean))).length || 0}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="overflow-auto">
                    <table className="min-w-full table-auto border-collapse">
                      <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
                        <tr>
                          {visaCols.length === 0 ? (
                            <th className="px-4 py-3 text-left text-sm text-muted-foreground">No Columns</th>
                          ) : visaCols.map(col => (
                            <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visaLoading ? (
                          <tr>
                            <td colSpan={visaCols.length || 1} className="px-4 py-6 text-center text-sm text-muted-foreground">Loading visa applications…</td>
                          </tr>
                        ) : visaData.length === 0 ? (
                          <tr>
                            <td colSpan={visaCols.length || 1} className="px-6 py-12 text-center">
                              <div className="inline-flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">📭</div>
                                <div className="text-sm font-medium">No visa applications yet</div>
                                <div className="text-xs text-muted-foreground">Click Refresh to try again</div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredVisa.map((row, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              {visaCols.map(col => (
                                <td key={col} className="px-4 py-3 align-top text-sm whitespace-nowrap">
                                  {formatCell(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
