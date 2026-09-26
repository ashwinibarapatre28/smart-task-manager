import "./globals.css";

export const metadata = {
  title: "TaskFlow - Smart Task Manager",
  description:
    "Manage tasks, users, priorities, statuses and dependencies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}