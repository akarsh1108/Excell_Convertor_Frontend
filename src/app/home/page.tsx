"use client";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import React, { useState, ChangeEvent, FormEvent } from "react";
import * as XLSX from "xlsx";
import "jspdf-autotable";
import * as htmlToImage from "html-to-image";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import FileUploadForm from "./components/highlight";

const ExcelConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileBlobs, setFileBlobs] = useState<Blob[]>([]);

  const apiUrl = "http://127.0.0.1:8000/process-excel/";
  const apiAllUrl = "http://127.0.0.1:8000/process-all-excel/";
  const pdfApiUrl = "http://127.0.0.1:8000/generate-pdf/";

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

  const statesOfIndia = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Puducherry",
    "Chandigarh",
    "Andaman and Nicobar Islands",
    "Lakshadweep",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Ladakh",
    "Jammu and Kashmir",
  ];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setFileBlob(null);
    }
  };

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  const handleFileNameChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedFileName(event.target.value);
    setFileBlob(null);
  };

  const handleAllSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFile && selectedFileName && selectedState) {
      const formData = new FormData();
      formData.append("master_file", selectedFile);
      formData.append("process_name", "all");
      formData.append("state", selectedState);

      setIsProcessing(true);
      try {
        const response = await fetch(apiAllUrl, {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `all_files.zip`;
          link.click();
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
      alert("Please select a state, a file, and a process name.");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFile && selectedFileName && selectedState) {
      const formData = new FormData();
      formData.append("master_file", selectedFile);
      formData.append("process_name", selectedFileName);
      formData.append("state", selectedState);

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
      alert("Please select a state, a file, and a process name.");
    }
  };

  const handleDownloadExcel = () => {
    if (fileBlob) {
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedFileName}_updated.xlsx`;
      link.click();
    } else {
      alert("Please process the file first to download the Excel file.");
    }
  };

  const handleDownloadPDF = async () => {
    if (fileBlob) {
      try {
        // Read the Excel file
        const reader = new FileReader();
        reader.onload = async (event) => {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert the worksheet to HTML
          const htmlString = XLSX.utils.sheet_to_html(worksheet);

          // Create a container for rendering the HTML
          const container = document.createElement("div");
          container.innerHTML = htmlString;
          container.style.position = "absolute";
          container.style.top = "-9999px";
          container.style.left = "-9999px";

          // Add the container to the DOM temporarily
          document.body.appendChild(container);

          // Apply table-wide styles for borders
          const table = container.querySelector("table");
          if (table) {
            table.style.borderCollapse = "collapse";
            table.style.width = "100%";

            const rows = table.querySelectorAll("tr");
            rows.forEach((row) => {
              row.style.border = "1px solid black";
              Array.from(row.children).forEach((cell) => {
                const cellElement = cell as HTMLElement;
                cellElement.style.border = "1px solid black";
                cellElement.style.padding = "8px";
              });
            });

            // Apply specific styles to rows 3 and 4
            [2, 3].forEach((rowIndex) => {
              const row = rows[rowIndex];
              if (row) {
                row.style.textAlign = "center";
                row.style.fontWeight = "bold";
                Array.from(row.children).forEach((cell) => {
                  const cellElement = cell as HTMLElement;
                  cellElement.style.textAlign = "center";
                  cellElement.style.fontWeight = "bold";
                });
              }
            });
          }

          // Convert the container to an image
          const canvas = await html2canvas(container);
          const imageData = canvas.toDataURL("image/png");

          // Remove the container
          document.body.removeChild(container);

          // Generate PDF with the image
          const pdf = new jsPDF("p", "mm", "a4");
          const imgWidth = 190; // Adjust as per your PDF dimensions
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imageData, "PNG", 10, 10, imgWidth, imgHeight);

          // Save the PDF
          pdf.save(`${selectedFileName}_converted.pdf`);
        };

        reader.readAsArrayBuffer(fileBlob);
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while generating the PDF.");
      }
    } else {
      alert("Please process the file first to generate a PDF.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-row  items-center justify-evenly">
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
          <h1 className="text-2xl font-semibold text-black mb-6">
            Labour Law Tool
          </h1>
          <form className="bg-white p-6 rounded-lg shadow-md border border-pink-200 w-full max-w-md">
            <div className="mb-4">
              <label
                className="block text-black font-medium mb-2"
                htmlFor="state"
              >
                Select a State
              </label>
              <select
                id="state"
                value={selectedState}
                onChange={handleStateChange}
                className="block w-full text-black border border-pink-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-pink-300"
              >
                <option value="">-- Select State --</option>
                {statesOfIndia.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-black font-medium mb-2"
                htmlFor="file"
              >
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
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-pink-500 text-white font-medium py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring focus:ring-pink-300"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={handleAllSubmit}
                className="w-full bg-purple-500 text-white font-medium py-2 rounded-md hover:bg-purple-600 focus:outline-none focus:ring focus:ring-purple-300"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing All..." : "Submit All"}
              </button>
            </div>
          </form>

          {fileBlob && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleDownloadExcel}
                className="bg-green-500 text-white font-medium py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
              >
                Download as Excel
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
              >
                Generate PDF
              </button>
            </div>
          )}
        </div>
        <FileUploadForm />
      </div>
    </>
  );
};

export default ExcelConverter;
