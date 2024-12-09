"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import jsPDF from "jspdf";

const ExcelConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const apiUrl = "http://127.0.0.1:8000/process-excel/";

  const processNames = [
    "accident",
    "advance",
    "bonusformc",
    "damage",
    "esicpf",
    "fine",
    "formd",
    "muster",
    "overtime",
    "wages",
    "workmen",
  ];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setFileBlob(null);
    }
  };

  const handleFileNameChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedFileName(event.target.value);
    setFileBlob(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFile && selectedFileName) {
      const formData = new FormData();
      formData.append("master_file", selectedFile);
      formData.append("process_name", selectedFileName);

      setIsProcessing(true);
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const blob = await response.blob();
          setFileBlob(blob);
        } else {
          alert("Error processing the file.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while processing the file.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert("Please select a file and a process name.");
    }
  };

  const handleDownloadCSV = () => {
    if (fileBlob) {
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedFileName}_updated.csv`;
      link.click();
    }
  };

  const handleDownloadPDF = async () => {
    if (fileBlob) {
      // Read the fileBlob content and convert to text
      const text = await fileBlob.text();

      // Create a new PDF document using jsPDF
      const doc = new jsPDF();

      // Add the content to the PDF
      const lines = doc.splitTextToSize(text, 180); // Split text into lines to fit the page width
      doc.text(lines, 10, 10); // Add text starting at x=10, y=10

      // Save the PDF
      doc.save(`${selectedFileName}_updated.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold text-black mb-6">
        Excel Converter
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md border border-pink-200 w-full max-w-md"
      >
        <div className="mb-4">
          <label className="block text-black font-medium mb-2" htmlFor="file">
            Choose a file
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="block w-full text-black border border-pink-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-pink-300"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-black font-medium mb-2"
            htmlFor="fileName"
          >
            Select a Process Name
          </label>
          <select
            id="fileName"
            value={selectedFileName}
            onChange={handleFileNameChange}
            className="block w-full text-black border border-pink-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-pink-300"
          >
            <option value="">-- Select Process Name --</option>
            {processNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-pink-500 text-white font-medium py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring focus:ring-pink-300"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Submit"}
        </button>
      </form>
      {fileBlob && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleDownloadCSV}
            className="bg-green-500 text-white font-medium py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
          >
            Download as CSV
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExcelConverter;
