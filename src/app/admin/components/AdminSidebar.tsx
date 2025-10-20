"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Folder, LogOut, User } from "lucide-react";
import clsx from "clsx";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface SidebarProps {
	isOpen: boolean;
}

export default function AdminSidebar({ isOpen }: SidebarProps) {
	const pathname = usePathname();

	const navItems = [
		{ name: "Projects", icon: Folder, href: "/admin/projects" },
		{ name: "My-info", icon: User, href: "/admin/my-info" },
		{ name: "Certificates", icon: LayoutDashboard, href: "/admin/certifications" },
	];

	return (
		<aside
			className={clsx(
				"bg-gray-900 text-white flex flex-col transition-all duration-300",
				isOpen ? "w-64" : "w-20"
			)}
		>
			{/* Logo */}
			<div className="flex items-center justify-center h-16 border-b border-gray-800">
				<span className="text-xl font-bold">Admin</span>
			</div>

			{/* Nav Links */}
			<nav className="flex-1 p-3 space-y-2">
				{navItems.map(({ name, icon: Icon, href }) => {
					const active = pathname === href;
					return (
						<Link
							key={name}
							href={href}
							className={clsx(
								"flex items-center px-4 py-2 rounded-md transition-colors hover:bg-gray-800",
								active ? "bg-gray-800" : "bg-transparent"
							)}
						>
							<Icon size={20} />
							{isOpen && <span className="ml-3 text-sm">{name}</span>}
						</Link>
					);
				})}
			</nav>

			{/* Logout */}
			<div className="border-t border-gray-800 p-3">
				<LogoutButton isOpen={isOpen} />
			</div>
		</aside>
	);
}

function LogoutButton({ isOpen }: { isOpen: boolean }) {
	const router = useRouter();
	const handleLogout = async () => {
		try {
			await signOut(auth);
		} finally {
			router.push("/admin");
		}
	};

	return (
		<button onClick={handleLogout} className="flex items-center w-full px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
			<LogOut size={20} />
			{isOpen && <span className="ml-3 text-sm">Logout</span>}
		</button>
	);
}
