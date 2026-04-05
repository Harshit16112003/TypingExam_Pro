import { Keyboard, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xl font-bold text-indigo-600">
              <Keyboard className="h-6 w-6" />
              <span>TypingExam Pro</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TypingExam Pro. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Support & Help</h4>
            <div className="flex flex-col gap-2">
              <a href="mailto:email-information@typingpro.com" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600">
                <Mail className="h-4 w-4" />
                email-information@typingpro.com
              </a>
              <a href="https://wa.me/916265641092" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600">
                <MessageCircle className="h-4 w-4" />
                WhatsApp: +91 6265641092
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
