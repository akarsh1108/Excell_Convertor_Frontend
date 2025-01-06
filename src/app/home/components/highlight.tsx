"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";

const FileUploadForm: React.FC = () => {
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [outputPdfBlob, setOutputPdfBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const apiUrl = "http://127.0.0.1:8000/highlight-pdf/";

  const handleXlsxChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setXlsxFile(event.target.files[0]);
    }
  };

  const handlePdfChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setPdfFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!xlsxFile || !pdfFile) {
      alert("Please upload both an XLSX file and a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("xlsx_file", xlsxFile);
    formData.append("pdf_file", pdfFile);

    setIsProcessing(true);
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        setOutputPdfBlob(blob);
        alert("File processed successfully. You can now download the PDF.");
      } else {
        alert("Error processing the files.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the files.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (outputPdfBlob) {
      const url = window.URL.createObjectURL(outputPdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "processed_output.pdf";
      link.click();
    } else {
      alert("No PDF available for download. Please submit the form first.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold text-black mb-6">
        XLSX and PDF Upload
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md border border-pink-200 w-full max-w-md"
      >
        <div className="mb-4">
          <label className="block text-black font-medium mb-2" htmlFor="xlsx">
            Upload XLSX File
          </label>
          <input
            type="file"
            id="xlsx"
            accept=".xlsx"
            onChange={handleXlsxChange}
            className="block w-full text-black border border-pink-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-pink-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-black font-medium mb-2" htmlFor="pdf">
            Upload PDF File
          </label>
          <input
            type="file"
            id="pdf"
            accept=".pdf"
            onChange={handlePdfChange}
            className="block w-full text-black border border-pink-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-pink-300"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-pink-500 text-white font-medium py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring focus:ring-pink-300"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Submit"}
        </button>
      </form>

      {outputPdfBlob && (
        <div className="mt-6">
          <button
            onClick={handleDownloadPdf}
            className="bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Download Processed PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploadForm;
