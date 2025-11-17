export function Header() {
  return (
    <header className="bg-card" role="banner">
      <div className="container mx-auto px-4 py-3">
        <h1 className="text-2xl font-bold">Vintage Story Alloy Calculator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Calculate valid alloy compositions for your crucible. Alloy data
          sourced from the Vintage Story Wiki.
        </p>
      </div>
    </header>
  );
}
