import React, { useState } from "react";
import { MessageCircle } from "lucide-react";

const countries = ["USA", "UK", "Canada", "Australia", "Germany"];
const exams = ["GRE", "TOEFL", "IELTS", "Duolingo"];

const AIAssistantWidget = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [showGreeting, setShowGreeting] = useState(true);

  // Reset assistant state
  const resetAssistant = () => {
    setOpen(false);
    setStep(null);
    setSelectedCountry("");
    setSelectedExam("");
    setShowGreeting(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          onClick={() => setOpen(true)}
          title="Chat with AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      ) : (
        <div className="bg-blue-50 border border-blue-300 rounded-xl shadow-2xl w-80 p-4 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg flex items-center gap-2 text-blue-700">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              AI Assistant
            </h2>
            <button
              className="text-blue-400 hover:text-blue-700"
              onClick={resetAssistant}
              title="Close"
            >
              &#10005;
            </button>
          </div>
          {showGreeting && (
            <div className="mb-4 text-center animate-fade-in">
              <p className="text-blue-700 font-semibold">👋 Hi! How can I help you today?</p>
              <p className="text-blue-500 text-sm">Choose a service below to get started.</p>
            </div>
          )}
          {!step && (
            <div className="space-y-3">
              <button
                className="w-full bg-blue-600 text-white py-2 rounded mb-2 hover:bg-blue-700 transition"
                onClick={() => {
                  setStep("higher-education");
                  setShowGreeting(false);
                }}
              >
                🎓 Higher Education
              </button>
              <button
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                onClick={() => {
                  setStep("visas");
                  setShowGreeting(false);
                }}
              >
                🛂 Visas
              </button>
            </div>
          )}
          {step === "higher-education" && (
            <div className="space-y-4 animate-fade-in">
              <p className="font-medium text-blue-700">🌍 Select the country you wish to apply for:</p>
              <select
                className="w-full border border-blue-300 rounded px-2 py-1 bg-blue-100 text-blue-700"
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
              >
                <option value="">-- Select Country --</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {selectedCountry && (
                <>
                  <p className="font-medium text-blue-700">📝 Filter by exams you have written:</p>
                  <select
                    className="w-full border border-blue-300 rounded px-2 py-1 bg-blue-100 text-blue-700"
                    value={selectedExam}
                    onChange={e => setSelectedExam(e.target.value)}
                  >
                    <option value="">-- Select Exam --</option>
                    {exams.map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </select>
                  {selectedExam && (
                    <div className="mt-3 text-blue-700 font-semibold">
                      🎯 Showing options for <span className="font-bold">{selectedCountry}</span> with <span className="font-bold">{selectedExam}</span> exam.
                      <div className="mt-2 text-sm text-blue-500">
                        Need more help? <a href="mailto:info@slotpilot.in" className="text-blue-700 underline">Contact us</a>
                      </div>
                    </div>
                  )}
                </>
              )}
              <button
                className="mt-4 w-full text-xs text-blue-500 underline"
                onClick={resetAssistant}
              >
                ← Back to main menu
              </button>
            </div>
          )}
          {step === "visas" && (
            <div className="space-y-4 animate-fade-in">
              <p className="font-medium text-blue-700">🛂 Visa assistant coming soon!</p>
              <button
                className="mt-4 w-full text-xs text-blue-500 underline"
                onClick={resetAssistant}
              >
                ← Back to main menu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistantWidget;