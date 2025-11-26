import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="container max-w-3xl mx-auto py-12 md:py-24 space-y-12">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg dark:border-slate-800">
                    <Image
                        src="/profile-new.jpg"
                        alt="Syed Ali Hashmi"
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Syed Ali Hashmi</h1>
                    <p className="text-xl text-muted-foreground font-medium">Software Engineering Student</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Karachi, Pakistan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>03197345923</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:hashmi.ali2288@gmail.com" className="hover:text-primary transition-colors">hashmi.ali2288@gmail.com</a>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="https://linkedin.com/in/hashmiali2288" target="_blank">
                        <Button variant="outline" size="sm" className="rounded-full px-6">
                            <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                            LinkedIn
                        </Button>
                    </Link>
                    <Link href="https://github.com/alihashmi2288" target="_blank">
                        <Button variant="outline" size="sm" className="rounded-full px-6">
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                        </Button>
                    </Link>
                    <Link href="https://wa.me/923197345923" target="_blank">
                        <Button variant="outline" size="sm" className="rounded-full px-6">
                            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                            WhatsApp
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Bio Section */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
                <p className="text-lg leading-relaxed text-muted-foreground text-center">
                    My name is <span className="font-semibold text-foreground">Syed Ali Hashmi</span>, and I am a passionate Software Engineering student dedicated to building simple, modern, and user-friendly digital experiences. I developed this PDF app with the goal of making document handling faster, easier, and accessible for everyone. My focus is on solving real-world problems through clean design, efficient functionality, and continuous learning. This project reflects my commitment to turning ideas into practical tools that help people in their everyday work.
                </p>
            </div>
        </div>
    );
}
