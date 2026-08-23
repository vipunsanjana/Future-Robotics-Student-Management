import { jsPDF } from "jspdf";
import type { Registration } from "./types";

const COMPANY = {
  name: "Future Robotics (PVT) LTD",
  email: "futureroboticsacademy@gmail.com",
  website: "www.futureroboticsacademy.com",
  phone: "+94 760944206",
  ceo: "Viduranga Jayakody",
};

// Helper function to convert the image to Base64
async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Notice this is now an async function
export async function generateRegistrationPdf(reg: Registration): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const now = new Date();
  const stamp = now.toLocaleString();

  try {
    const logoBase64 = await getBase64ImageFromUrl("/Logo.jpeg");
    // Parameters: image, format, x, y, width, height
    doc.addImage(logoBase64, "JPEG", 60, 64, 60, 60); 
  } catch (error) {
    console.error("Failed to load logo image:", error);
    // Fallback if image fails to load
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text("FR", 72, 90);
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(2);
    doc.rect(60, 64, 40, 36);
  }

  // Company info
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(COMPANY.name, 160, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(COMPANY.email, 160, 98);
  doc.text(COMPANY.website, 160, 114);
  doc.text(COMPANY.phone, 160, 130);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("REGISTRATION DOCUMENT & PAYMENT RECEIPT", 72, 170);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`System Generated: ${stamp}`, pageW - 72, 60, { align: "right" });

  // Student details
  let y = 195;
  const details: [string, string][] = [
    ["Document Number:", reg.documentNo],
    ["Registration Date:", reg.date],
    ["Student Name:", reg.name],
    ["Phone Number:", reg.phone],
    ["Course Name:", reg.course],
  ];
  doc.setFontSize(12);
  for (const [label, value] of details) {
    doc.setFont("helvetica", "bold");
    doc.text(label, 72, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 220, y);
    y += 22;
  }

  // Registration number highlighted
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 30, 30);
  doc.text("Registration Number:", 72, y);
  doc.text(reg.regNo, 220, y);
  doc.setTextColor(0, 0, 0);
  y += 36;

  // Payment table header
  doc.setFont("helvetica", "bold");
  doc.text("Description", 72, y);
  doc.text("Amount (LKR)", 380, y);
  
  y += 8;
  doc.line(72, y, pageW - 72, y);
  
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.text(reg.description, 72, y);
  doc.text(String(reg.amount), 380, y);
  y += 36;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Amount Paid:", 72, y);
  doc.text(`LKR ${reg.amount} /=`, 380, y);
  y += 12;
  doc.line(72, y, pageW - 72, y);

  // Congratulations
  y += 50;
  doc.setFontSize(14);
  doc.text("Congratulations!", pageW / 2, y, { align: "center" });
  y += 24;

  const lines = [
    `You have successfully registered for the ${reg.course}.`,
    `${reg.description} - LKR ${reg.amount} /=`,
    "",
  ];

  if (reg.mode === "Online") {
    lines.push("You will be added to the WhatsApp Group 3 days before the start of the course.");
    lines.push("Zoom links and other details will be shared through the WhatsApp Group.");
  }

  lines.push("Keep this PDF document with yourself.");
  lines.push("");
  lines.push("Thank You!");
  lines.push(COMPANY.ceo);
  lines.push(`CEO - ${COMPANY.name}`);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  for (const line of lines) {
    if (line.includes("CEO")) doc.setFont("helvetica", "bold");
    doc.text(line, pageW / 2, y, { align: "center" });
    y += 18;
    if (line.includes("CEO")) doc.setFont("helvetica", "normal");
  }

  // Second page: course requirements (Online mode only)
  if (reg.mode === "Online") {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Completion of Course Requirements", pageW / 2, 90, { align: "center" });

    const requirements = [
      "1. For the completion of this course students must have 80% attendance.",
      "2. Students need to complete all the assignments, the final exam & Project on time.",
      "3. Monthly course fee must be completed within the 1st week of the month.",
    ];

    let ry = 140;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    for (const req of requirements) {
      doc.text(req, 72, ry);
      ry += 28;
    }

    doc.setFontSize(10);
    doc.text(
      `Future Robotics (PVT) LTD | www.futureroboticsacademy.com`,
      pageW / 2,
      pageH - 40,
      { align: "center" }
    );
  }

  return doc;
}

// Notice this is also now async
export async function downloadRegistrationPdf(reg: Registration) {
  const doc = await generateRegistrationPdf(reg);
  const cleanCourse = reg.course.replace(/\s+/g, "_");
  doc.save(`Registration_Document_${reg.regNo}_${cleanCourse}.pdf`);
}
