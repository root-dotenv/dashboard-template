// src/pages/main-homepage.tsx

export default function MainHomePage() {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-card-foreground mb-2">
        Welcome to SafariPro 🏨
      </h1>
      <p className="text-muted-foreground">
        This is the main content area, rendered by the React Router{" "}
        <code>Outlet</code>. The sidebar and top navigation bar are part of the
        persistent <code>DashboardLayout</code>.
      </p>
    </div>
  );
}
