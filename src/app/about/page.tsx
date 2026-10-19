import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto py-12 md:py-20 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-5">
                <div className="relative h-28 w-28 rounded-full overflow-hidden border border-hairline shadow-md">
                    <Image
                        src="/profile-new.jpg"
                        alt="Syed Ali Hashmi"
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="space-y-1">
                    <span className="type-eyebrow text-[11px] text-primary tracking-[0.4px] uppercase font-semibold">ENGINEER &amp; BUILDER</span>
                    <h1 className="type-display-md text-ink">Syed Ali Hashmi</h1>
                    <p className="text-sm text-ink-subtle">Software Engineering Student</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-xs text-ink-subtle">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Karachi, Pakistan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        <span>03197345923</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <a href="mailto:hashmi.ali2288@gmail.com" className="hover:text-ink transition-colors">
                            hashmi.ali2288@gmail.com
                        </a>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                    <Link href="https://linkedin.com/in/hashmiali2288" target="_blank">
                        <button
                            type="button"
                            className="h-8.5 px-4 rounded-[8px] border border-hairline bg-surface-1 text-ink hover:bg-surface-2 hover:border-hairline-strong text-xs font-medium inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                            <Linkedin className="h-3.5 w-3.5 opacity-70" />
                            <span>LinkedIn</span>
                        </button>
                    </Link>
                    <Link href="https://github.com/alihashmi2288" target="_blank">
                        <button
                            type="button"
                            className="h-8.5 px-4 rounded-[8px] border border-hairline bg-surface-1 text-ink hover:bg-surface-2 hover:border-hairline-strong text-xs font-medium inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                            <Github className="h-3.5 w-3.5 opacity-70" />
                            <span>GitHub</span>
                        </button>
                    </Link>
                    <Link href="https://wa.me/923197345923" target="_blank">
                        <button
                            type="button"
                            className="h-8.5 px-4 rounded-[8px] border border-hairline bg-surface-1 text-ink hover:bg-surface-2 hover:border-hairline-strong text-xs font-medium inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                            <MessageCircle className="h-3.5 w-3.5 opacity-70" />
                            <span>WhatsApp</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Bio Section */}
            <div className="hairline-card p-6 sm:p-8 space-y-3">
                <span className="type-eyebrow text-[11px] text-ink-subtle uppercase tracking-[0.4px]">OUR MISSION</span>
                <p className="text-xs sm:text-sm leading-relaxed text-ink-subtle">
                    I created <strong className="text-ink">PDFKit</strong> to make working with documents effortless, instantaneous, and 100% private. All your files process right on your device inside your web browser—nothing is ever uploaded to a remote server or stored in the cloud. No accounts to create, no subscriptions, and no artificial file limits—just reliable, high-speed tools designed to help you get your work done in seconds.
                </p>
            </div>
        </div>
    );
}
