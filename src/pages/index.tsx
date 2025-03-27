import { ThemeToggle } from "@/components/layout/theme-toggle";

const Index = () => {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Start building your amazing project here!
        </p>
        <ThemeToggle />
      </div>
    </main>
  );
};

export default Index;