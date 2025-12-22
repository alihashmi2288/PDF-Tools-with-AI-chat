# PDF AI Master

A modern, responsive web application for managing PDF files, featuring AI-powered tools, document converters, and a sleek user interface.

## Features

### PDF Tools
- **Merge PDFs**: Combine multiple PDF documents into one
- **Split PDF**: Extract specific pages or separate documents
- **Compress PDF**: Optimize file size without quality loss
- **Edit PDF**: Add text, shapes, and images to PDFs
- **OCR**: Extract text from scanned images and PDFs

### Document Converters
- **Images to PDF**: Convert JPG, PNG, and other images to PDF
- **DOCX to PDF**: Convert Word documents to PDF
- **Excel to PDF**: Convert spreadsheets to PDF with table formatting
- **CSV to PDF**: Convert CSV data to formatted PDF tables
- **Markdown to PDF**: Convert Markdown files to formatted PDFs

### AI Integration
- **Chat with PDFs**: Use Google's Gemini AI to summarize content, ask questions, and extract insights from your documents

### Modern UI
- Responsive design for desktop and mobile
- Dark/Light mode support
- Smooth animations and transitions
- Polished blue/cyan theme
- Intuitive user experience

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **PDF Processing**: [pdf-lib](https://pdf-lib.js.org/), [pdfjs-dist](https://mozilla.github.io/pdf.js/), [react-pdf](https://react-pdf.org/)
- **Document Conversion**: [mammoth](https://github.com/mwilliamson/mammoth.js) (DOCX), [xlsx](https://sheetjs.com/) (Excel), [papaparse](https://www.papaparse.com/) (CSV), [marked](https://marked.js.org/) (Markdown), [jsPDF](https://github.com/parallax/jsPDF)
- **AI**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/)

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd pdf-web-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Setup

1.  Create a `.env.local` file in the root directory.
2.  Add your Google Gemini API key:
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
    ```

### Running the App

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google AI Studio](https://aistudio.google.com/)


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1.  Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2.  Import your project into Vercel.
3.  **Important**: During the import process, expand the **Environment Variables** section and add your Gemini API key:
    - **Key**: `NEXT_PUBLIC_GEMINI_API_KEY`
    - **Value**: `your_actual_api_key_here`
4.  Click **Deploy**.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
