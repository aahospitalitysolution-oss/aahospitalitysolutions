import SmartButton from "@/components/SmartButton";

export default function ButtonTestPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden relative font-sans">
        {/* Background image from the example */}
        <div 
            className="absolute inset-0 z-0"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d8e5b5a45458?q=80&w=2940&auto=format&fit=crop')",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"></div>
        
        <SmartButton />
    </div>
  );
}


