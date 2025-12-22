import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, FileText, MessageSquare, Scissors, Combine, FileType, ScanText, Minimize2, ImagePlus, FileSpreadsheet, FileCode } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className="pb-12 w-64 border-r hidden md:block">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Tools
                    </h2>
                    <div className="space-y-1">
                        <Link href="/documents">
                            <Button variant="ghost" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                View PDF
                            </Button>
                        </Link>
                        <Link href="/chat">
                            <Button variant="ghost" className="w-full justify-start">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Chat with PDF
                            </Button>
                        </Link>
                        <Link href="/tools/merge">
                            <Button variant="ghost" className="w-full justify-start">
                                <Combine className="mr-2 h-4 w-4" />
                                Merge PDFs
                            </Button>
                        </Link>
                        <Link href="/tools/split">
                            <Button variant="ghost" className="w-full justify-start">
                                <Scissors className="mr-2 h-4 w-4" />
                                Split PDF
                            </Button>
                        </Link>
                        <Link href="/tools/ocr">
                            <Button variant="ghost" className="w-full justify-start">
                                <ScanText className="mr-2 h-4 w-4" />
                                OCR
                            </Button>
                        </Link>
                        <Link href="/tools/compress">
                            <Button variant="ghost" className="w-full justify-start">
                                <Minimize2 className="mr-2 h-4 w-4" />
                                Compress PDF
                            </Button>
                        </Link>
                        <Link href="/tools/edit">
                            <Button variant="ghost" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                Edit PDF
                            </Button>
                        </Link>
                        <Link href="/tools/image-to-pdf">
                            <Button variant="ghost" className="w-full justify-start">
                                <ImagePlus className="mr-2 h-4 w-4" />
                                Images to PDF
                            </Button>
                        </Link>
                        <Link href="/tools/docx-to-pdf">
                            <Button variant="ghost" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                DOCX to PDF
                            </Button>
                        </Link>
                        <Link href="/tools/excel-to-pdf">
                            <Button variant="ghost" className="w-full justify-start">
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Excel to PDF
                            </Button>
                        </Link>
                        <Link href="/tools/csv-to-pdf">
                            <Button variant="ghost" className="w-full justify-start">
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                CSV to PDF
                            </Button>
                        </Link>
                        <Link href="/tools/markdown-to-pdf">
                            <Button variant="ghost" className="w-full justify-start">
                                <FileCode className="mr-2 h-4 w-4" />
                                Markdown to PDF
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
