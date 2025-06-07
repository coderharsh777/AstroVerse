
export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AstroVerse. All rights reserved.</p>
        <p className="text-xs mt-1">Explore the cosmos, one NFT at a time.</p>
      </div>
    </footer>
  );
}
