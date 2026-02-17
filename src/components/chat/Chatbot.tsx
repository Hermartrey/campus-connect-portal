import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
    id: '1',
    text: "Hello! I'm the ICHS Assistant. How can I help you today? You can ask me about enrollment, tuition, schedules, or contact info.",
    sender: 'bot',
    timestamp: new Date(),
};

const KEYWORDS: Record<string, string> = {
    enroll: "To enroll, navigate to the signup page and create an account. Once logged in, you can submit your enrollment form and required documents.",
    tuition: "Tuition fees vary by grade level. You can view the full fee schedule in the 'Tuition' section of the student dashboard after logging in.",
    fee: "Tuition fees vary by grade level. You can view the full fee schedule in the 'Tuition' section of the student dashboard after logging in.",
    payment: "We accept payments via bank transfer and online payment gateways. You can manage your payments in the Student Portal.",
    schedule: "Our classes start at 7:30 AM and end at 3:00 PM, Monday to Friday. The academic calendar is available on our website.",
    location: "We are located at 123 Education Blvd, Academic City. Come visit us!",
    address: "We are located at 123 Education Blvd, Academic City. Come visit us!",
    contact: "You can reach us at (555) 123-4567 or email info@ichs.edu.",
    email: "You can reach us at (555) 123-4567 or email info@ichs.edu.",
    phone: "You can reach us at (555) 123-4567 or email info@ichs.edu.",
    admin: "If you are an administrator, please use the separate Admin Portal login page to access dashboard features.",
    login: "You can log in using the 'Sign In' button at the top right. Students and Admins have separate login portals.",
    help: "I can help with questions about enrollment, tuition, schedules, location, and contact information. Just ask!",
};

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Hide chatbot on admin routes to avoid clutter updates
    if (location.pathname.startsWith('/dashboard/students') ||
        location.pathname.startsWith('/dashboard/enrollments') ||
        location.pathname.startsWith('/dashboard/payments') ||
        location.pathname.startsWith('/dashboard/tuition') ||
        location.pathname.startsWith('/dashboard/financial') ||
        location.pathname.startsWith('/dashboard/transactions')) {
        return null;
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate bot thinking delay
        setTimeout(() => {
            const lowerInput = userMessage.text.toLowerCase();
            let responseText = "I'm not sure about that. Please contact our admission office for more details.";

            // Simple keyword matching
            for (const [key, value] of Object.entries(KEYWORDS)) {
                if (lowerInput.includes(key)) {
                    responseText = value;
                    break;
                }
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 1000);
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 animate-in fade-in zoom-in duration-300"
                size="icon"
            >
                <MessageCircle className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[350px] shadow-xl z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col h-[500px]">
            <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <CardTitle className="text-base">ICHS Assistant</CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary-foreground hover:bg-primary/20 hover:text-primary-foreground"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                    <div className="flex flex-col gap-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                            >
                                <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${message.sender === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                        }`}
                                >
                                    {message.sender === 'user' ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>
                                <div
                                    className={`rounded-lg p-3 text-sm max-w-[80%] ${message.sender === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-2">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-muted rounded-lg p-3 text-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 pt-2 border-t">
                <form
                    className="flex w-full gap-2"
                    onSubmit={handleSendMessage}
                >
                    <Input
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
